/**
 * Motor V1 do Diagnóstico Empresarial APAS.
 * HEURÍSTICA V1 CALIBRÁVEL — não é instrumento cientificamente validado.
 * Toda regra, peso e limiar vem do bundle de configuração (banco), nunca fixo aqui.
 */

import {
  AXES,
  type Alert,
  type AnswerInput,
  type Axis,
  type AxisMap,
  type DiagInstrumentBundle,
  type DimensionScore,
  type EngineResult,
  type PatternResult,
  type QuestionScore,
  type RuleCondition,
  type StageAffinity,
} from "./types";

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

function emptyAxes(value = 50): AxisMap {
  return { flexibilidade: value, controle: value, integracao: value, sustentacao: value };
}

/** Normaliza a resposta da escala 1–5 para 0–100, aplicando inversão quando configurada. */
function normalizeAnswer(
  value: number | null,
  direction: "direct" | "inverse",
  scaleMin: number,
  scaleMax: number,
) {
  if (value == null) return { adjusted: null, normalized: null };
  const adjusted = direction === "inverse" ? scaleMin + scaleMax - value : value;
  const span = scaleMax - scaleMin || 1;
  return { adjusted, normalized: clamp(((adjusted - scaleMin) / span) * 100) };
}

function scaleBounds(bundle: DiagInstrumentBundle) {
  const values = bundle.instrument.scale
    .map((o) => o.value)
    .filter((v): v is number => typeof v === "number");
  if (!values.length) return { min: 1, max: 5 };
  return { min: Math.min(...values), max: Math.max(...values) };
}

export function computeDiagnostic(
  bundle: DiagInstrumentBundle,
  answers: AnswerInput[],
): EngineResult {
  const cfg = bundle.instrument.engine_config;
  const { min: scaleMin, max: scaleMax } = scaleBounds(bundle);
  const answerMap = new Map(answers.map((a) => [a.question_code, a.value]));

  // 1) Perguntas
  const questions: QuestionScore[] = bundle.questions
    .filter((q) => q.active)
    .map((q) => {
      const raw = answerMap.has(q.code) ? (answerMap.get(q.code) ?? null) : null;
      const { adjusted, normalized } = normalizeAnswer(raw, q.direction, scaleMin, scaleMax);
      return {
        code: q.code,
        dimension_code: q.dimension_code,
        value: raw,
        adjusted,
        normalized,
        weight: q.weight,
        direction: q.direction,
      };
    });

  const qByCode = new Map(questions.map((q) => [q.code, q]));

  // 2) Dimensões (média ponderada 0–100, N/A fora do cálculo)
  const dimensions: DimensionScore[] = bundle.dimensions
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((dim) => {
      const items = questions.filter((q) => q.dimension_code === dim.code);
      const valid = items.filter((q) => q.normalized != null);
      const weightSum = valid.reduce((s, q) => s + q.weight, 0);
      const score = weightSum
        ? valid.reduce((s, q) => s + (q.normalized as number) * q.weight, 0) / weightSum
        : null;
      const total = items.length;
      const answered = valid.length;
      const coverage = total ? answered / total : 0;
      const bands = cfg.dimensionBands;
      const band: DimensionScore["band"] =
        score == null
          ? "sem_dados"
          : score < bands.critico
            ? "critico"
            : score < bands.atencao
              ? "atencao"
              : score < bands.adequado
                ? "adequado"
                : "forte";
      return {
        code: dim.code,
        name: dim.name,
        score: score == null ? null : round(score),
        band,
        answered,
        na: total - answered,
        total,
        coverage: round(coverage, 2),
        weightSum,
      };
    });

  const dimByCode = new Map(dimensions.map((d) => [d.code, d]));

  // 3) Eixos
  const axes: AxisMap = emptyAxes();
  for (const axis of AXES) {
    let num = 0;
    let den = 0;
    for (const dim of bundle.dimensions) {
      const w = dim.axis_weights[axis] ?? 0;
      const score = dimByCode.get(dim.code)?.score;
      if (!w || score == null) continue;
      num += score * w;
      den += w;
    }
    axes[axis] = den ? round(num / den) : 50;
  }

  // 4) Padrões / indicadores (ativação fuzzy)
  function conditionValue(c: RuleCondition): number | null {
    if (c.type === "question") return qByCode.get(c.code)?.normalized ?? null;
    if (c.type === "dimension") return dimByCode.get(c.code)?.score ?? null;
    return axes[c.code as Axis] ?? null;
  }

  function conditionActivation(c: RuleCondition): number | null {
    const x = conditionValue(c);
    if (x == null) return null;
    const margin = c.margin ?? cfg.ruleMargin ?? 15;
    const delta = c.op === "<" || c.op === "<=" ? c.value - x : x - c.value;
    return clamp01(delta / (margin || 1) + 0.5);
  }

  const allPatterns: PatternResult[] = bundle.patterns
    .filter((p) => p.active)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => {
      const allActs = (p.rule.all ?? []).map(conditionActivation).filter((v): v is number => v != null);
      const anyActs = (p.rule.any ?? []).map(conditionActivation).filter((v): v is number => v != null);
      const parts: number[] = [];
      if (p.rule.all?.length) parts.push(allActs.length ? Math.min(...allActs) : 0);
      if (p.rule.any?.length) parts.push(anyActs.length ? Math.max(...anyActs) : 0);
      const activation = parts.length ? Math.min(...parts) : 0;
      const minAct = p.rule.minActivation ?? 0.5;
      return {
        code: p.code,
        name: p.name,
        kind: p.kind,
        severity: p.severity,
        description: p.description ?? null,
        activation: round(activation, 2),
        present: activation >= minAct,
        stage_affinity: p.stage_affinity,
      };
    });

  const patterns = allPatterns.filter((p) => p.kind === "pattern");
  const indicators = allPatterns.filter((p) => p.kind === "critical");

  // 5) Afinidade com estágios
  function groupAffinity(list: PatternResult[], stageCode: string): number {
    const active = list.filter((p) => p.activation > 0);
    const den = active.reduce((s, p) => s + p.activation, 0);
    if (!den) return 50;
    const num = active.reduce((s, p) => s + p.activation * (p.stage_affinity[stageCode] ?? 0), 0);
    return clamp(50 + 50 * (num / den));
  }

  const w = cfg.affinityWeights;
  const affinities: StageAffinity[] = bundle.stages
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((stage) => {
      let dNum = 0;
      let dDen = 0;
      for (const axis of AXES) {
        const aw = cfg.axisDistanceWeights[axis] ?? 1;
        dNum += aw * Math.abs(axes[axis] - (stage.axes[axis] ?? 50));
        dDen += aw;
      }
      const axisAffinity = clamp(100 - (dDen ? dNum / dDen : 50));
      const patternAffinity = groupAffinity(patterns, stage.code);
      const criticalAffinity = groupAffinity(indicators, stage.code);
      const total =
        w.axes * axisAffinity + w.patterns * patternAffinity + w.critical * criticalAffinity;
      return {
        code: stage.code,
        name: stage.name,
        short_label: stage.short_label ?? null,
        is_critical: stage.is_critical,
        axisAffinity: round(axisAffinity),
        patternAffinity: round(patternAffinity),
        criticalAffinity: round(criticalAffinity),
        total: round(total),
      };
    })
    .sort((a, b) => b.total - a.total);

  const predominant = affinities[0] ?? null;
  const secondary = affinities[1] ?? null;
  const gap = predominant && secondary ? predominant.total - secondary.total : 100;
  const inTransition = !!secondary && gap <= cfg.transitionGap;
  const transitionLabel =
    inTransition && predominant && secondary ? `${predominant.name} → ${secondary.name}` : null;

  // 6) Confiança
  const totalQuestions = questions.length;
  const answeredCount = questions.filter((q) => q.normalized != null).length;
  const naRatio = totalQuestions ? (totalQuestions - answeredCount) / totalQuestions : 1;

  const conf = cfg.confidence;
  const separation = clamp01(gap / (conf.separationFull || 1));
  let confidence = 40 + 60 * separation;

  const naOver = clamp01(
    (naRatio - conf.naPenaltyStart) / Math.max(0.0001, conf.naPenaltyMax - conf.naPenaltyStart),
  );
  const naPenalty = naOver * conf.naPenaltyPoints;

  const contradictionsList = allPatterns.filter(
    (p) => p.present && predominant && (p.stage_affinity[predominant.code] ?? 0) < -0.3,
  );
  const contradictionPenalty = contradictionsList.length * conf.contradictionPenalty;

  const lowCoverageDims = dimensions.filter((d) => d.coverage < conf.minDimensionCoverage);
  const lowCoveragePenalty = dimensions.length
    ? (lowCoverageDims.length / dimensions.length) * conf.lowCoveragePenalty
    : 0;

  confidence = round(clamp(confidence - naPenalty - contradictionPenalty - lowCoveragePenalty));
  const confidenceLevel: EngineResult["confidenceLevel"] =
    confidence >= conf.levels.alta ? "alta" : confidence >= conf.levels.media ? "media" : "baixa";

  // 7) Alertas e bloqueio de liberação automática
  const alerts: Alert[] = [];
  for (const ind of indicators) {
    if (ind.activation >= cfg.criticalAlertActivation) {
      alerts.push({
        level: ind.severity === "critica" ? "critico" : "atencao",
        code: ind.code,
        message: `${ind.name}: sinais relevantes identificados (ativação ${Math.round(ind.activation * 100)}%).`,
      });
    }
  }
  if (naRatio > conf.naPenaltyStart) {
    alerts.push({
      level: naRatio >= conf.naPenaltyMax ? "critico" : "atencao",
      code: "na_excessivo",
      message: `${Math.round(naRatio * 100)}% das afirmações foram marcadas como "não se aplica", o que reduz a confiança da leitura.`,
    });
  }
  for (const c of contradictionsList) {
    alerts.push({
      level: "atencao",
      code: `contradicao_${c.code}`,
      message: `O padrão "${c.name}" contradiz o estágio predominante indicado.`,
    });
  }
  if (confidenceLevel === "baixa") {
    alerts.push({
      level: "atencao",
      code: "confianca_baixa",
      message: "Leitura inconclusiva: exige revisão do analista antes de qualquer liberação.",
    });
  }

  const stageByCode = new Map(bundle.stages.map((s) => [s.code, s]));
  const blockReasons: string[] = [];
  if (predominant) {
    const stage = stageByCode.get(predominant.code);
    if (stage && !stage.auto_release_allowed)
      blockReasons.push(`Estágio "${stage.name}" exige validação humana antes da liberação.`);
    if (predominant.is_critical)
      blockReasons.push(
        "Sinais compatíveis com risco crítico de viabilidade organizacional: liberação automática bloqueada.",
      );
  }
  if (secondary?.is_critical)
    blockReasons.push("Estágio secundário indica risco crítico de viabilidade organizacional.");
  if (confidenceLevel === "baixa") blockReasons.push("Confiança baixa (resultado inconclusivo).");
  if (alerts.some((a) => a.level === "critico"))
    blockReasons.push("Alertas críticos presentes no pré-diagnóstico.");
  if (inTransition && predominant && secondary)
    blockReasons.push(`Zona de transição entre ${predominant.name} e ${secondary.name}.`);

  return {
    engineVersion: cfg.version,
    instrumentVersion: bundle.instrument.version,
    computedAt: new Date().toISOString(),
    questions,
    dimensions,
    axes,
    patterns,
    indicators,
    affinities,
    predominant,
    secondary,
    inTransition,
    transitionLabel,
    confidence,
    confidenceLevel,
    confidenceFactors: {
      separation: round(separation, 2),
      naRatio: round(naRatio, 2),
      contradictions: contradictionsList.length,
      lowCoverage: lowCoverageDims.length,
    },
    naRatio: round(naRatio, 2),
    answeredCount,
    totalQuestions,
    alerts,
    requiresValidation: true,
    autoReleaseBlocked: blockReasons.length > 0,
    blockReasons,
  };
}
