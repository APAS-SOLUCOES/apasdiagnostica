/**
 * Estrutura do relatório premium APAS (conteúdo derivado do pré-diagnóstico).
 * Nenhuma resposta bruta do participante entra no relatório do cliente.
 */
import type { DiagInstrumentBundle, EngineResult } from "./types";
import { AXIS_NAMES } from "./types";

export type ReportSection = { title: string; body?: string; bullets?: string[] };

export type ReportContent = {
  version: "APAS-REL-V1";
  generatedAt: string;
  cover: {
    title: string;
    subtitle: string;
    companyName: string | null;
    participantName: string | null;
    instrument: string;
    disclaimer: string;
  };
  executiveSummary: ReportSection;
  axes: { code: string; name: string; score: number }[];
  dimensions: { code: string; name: string; score: number | null; band: string }[];
  stage: {
    predominant: string | null;
    secondary: string | null;
    inTransition: boolean;
    transitionLabel: string | null;
    adjustedStageCode: string | null;
    confidence: number;
    confidenceLevel: string;
  };
  sections: ReportSection[];
  analystNotes: string | null;
  requiresValidation: true;
  blockReasons: string[];
};

const DISCLAIMER =
  "Leitura organizacional produzida com a heurística V1 da APAS Soluções, em processo de calibração. Não constitui diagnóstico clínico, psicológico ou auditoria contábil, e exige validação de um analista APAS.";

export function buildReportContent(args: {
  result: EngineResult;
  bundle: DiagInstrumentBundle;
  companyName: string | null;
  participantName: string | null;
  contextText: string | null;
  analystNotes: string | null;
  adjustedStageCode: string | null;
}): ReportContent {
  const { result, bundle } = args;
  const stageByCode = new Map(bundle.stages.map((s) => [s.code, s]));
  const stage = result.predominant ? stageByCode.get(result.predominant.code) : undefined;
  const critical = !!result.predominant?.is_critical;

  const strengths = result.dimensions
    .filter((d) => d.band === "forte" || d.band === "adequado")
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 5)
    .map((d) => `${d.name} — ${d.score} pontos`);

  const gaps = result.dimensions
    .filter((d) => d.band === "critico" || d.band === "atencao")
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
    .slice(0, 5)
    .map((d) => `${d.name} — ${d.score} pontos`);

  const activePatterns = result.patterns.filter((p) => p.present);
  const activeIndicators = result.indicators.filter((p) => p.present);

  const summary = critical
    ? `A leitura identifica sinais compatíveis com risco crítico de viabilidade organizacional. O conjunto de indicadores exige atenção imediata da liderança e validação humana antes de qualquer decisão.`
    : `A leitura aponta ${stage?.name ?? "estágio não determinado"} como estágio predominante${
        result.secondary ? `, com afinidade secundária com ${result.secondary.name}` : ""
      }. Confiança da leitura: ${result.confidence} (${result.confidenceLevel}).`;

  return {
    version: "APAS-REL-V1",
    generatedAt: new Date().toISOString(),
    cover: {
      title: "Diagnóstico Empresarial APAS",
      subtitle: "Leitura organizacional por dimensões, eixos e estágios de referência",
      companyName: args.companyName,
      participantName: args.participantName,
      instrument: `${bundle.instrument.name} · ${bundle.instrument.version} · motor ${result.engineVersion}`,
      disclaimer: DISCLAIMER,
    },
    executiveSummary: {
      title: "Resumo executivo",
      body: summary,
      bullets: [
        `Afirmações respondidas: ${result.answeredCount} de ${result.totalQuestions}`,
        `Não se aplica: ${Math.round(result.naRatio * 100)}%`,
        args.contextText ? `Contexto informado: ${args.contextText}` : "Contexto não informado",
      ],
    },
    axes: (Object.keys(result.axes) as (keyof typeof result.axes)[]).map((axis) => ({
      code: axis,
      name: AXIS_NAMES[axis],
      score: result.axes[axis],
    })),
    dimensions: result.dimensions.map((d) => ({
      code: d.code,
      name: d.name,
      score: d.score,
      band: d.band,
    })),
    stage: {
      predominant: stage?.name ?? null,
      secondary: result.secondary?.name ?? null,
      inTransition: result.inTransition,
      transitionLabel: result.transitionLabel,
      adjustedStageCode: args.adjustedStageCode,
      confidence: result.confidence,
      confidenceLevel: result.confidenceLevel,
    },
    sections: [
      {
        title: "Perfil da empresa e leitura de estágio",
        body: stage?.narrative?.summary ?? stage?.description ?? summary,
        bullets: stage?.narrative?.signals ?? [],
      },
      { title: "Forças identificadas", bullets: strengths.length ? strengths : ["Sem dimensões em faixa adequada nesta leitura."] },
      { title: "Gargalos e pontos de atenção", bullets: gaps.length ? gaps : ["Nenhum gargalo relevante identificado."] },
      {
        title: "Padrões organizacionais convergentes",
        bullets: activePatterns.length
          ? activePatterns.map((p) => `${p.name}: ${p.description ?? ""}`.trim())
          : ["Nenhum padrão atingiu ativação suficiente."],
      },
      {
        title: "Riscos e indicadores críticos",
        bullets: activeIndicators.length
          ? activeIndicators.map((p) => `${p.name} (${p.severity}): ${p.description ?? ""}`.trim())
          : ["Nenhum indicador crítico ativo."],
      },
      {
        title: "Prioridades e plano de ação APAS",
        bullets: (stage?.narrative?.focus?.length ? stage.narrative.focus : gaps).slice(0, 6),
      },
      { title: "Alertas da leitura", bullets: result.alerts.map((a) => `[${a.level}] ${a.message}`) },
    ],
    analystNotes: args.analystNotes,
    requiresValidation: true,
    blockReasons: result.blockReasons,
  };
}
