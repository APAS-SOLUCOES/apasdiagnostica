import {
  DIMENSIONS,
  type Dimension,
  type Instrument,
  type ScoringConfig,
} from "./instrument";

export type Answer = { itemId: string; most: Dimension; least: Dimension };

export type DimensionMap = Record<Dimension, number>;

export type ProfileVector = {
  /** Distribuição percentual (soma = 100, base neutra = 25). */
  percent: DimensionMap;
  raw: DimensionMap;
  order: Dimension[];
};

export type ScoreResult = {
  scoringVersion: string;
  answeredItems: number;
  totalItems: number;
  natural: ProfileVector;
  social: ProfileVector;
  adapted: ProfileVector;
  predominant: Dimension;
  secondary: Dimension;
  combination: string;
  levels: Record<Dimension, "alto" | "moderado" | "baixo">;
  adaptationIndex: number;
  adaptationAlert: boolean;
  /** Saldo bruto por dimensão (MAIS + MENOS), útil para calibração. */
  net?: DimensionMap;
  /** Contagens brutas de escolhas, para auditoria da regra. */
  counts?: { most: DimensionMap; least: DimensionMap };
  /** Evidência combinada e normalizada usada no scoring APAS 1.2+. */
  evidence?: DimensionMap;
  /** Distância percentual entre o primeiro e o segundo fatores. */
  primaryGap?: number;
  /** Indica combinação com fatores próximos, sem inverter sua ordem. */
  closeCombination?: boolean;
  /** Rótulo interpretável da ordem dos dois fatores principais. */
  combinationLabel?: string;
};


const empty = (): DimensionMap => ({ D: 0, I: 0, S: 0, C: 0 });

function toPercent(raw: DimensionMap): DimensionMap {
  const total = DIMENSIONS.reduce((acc, d) => acc + raw[d], 0);
  const out = empty();
  for (const d of DIMENSIONS) {
    out[d] = total > 0 ? Math.round((raw[d] / total) * 1000) / 10 : 25;
  }
  return out;
}

function order(percent: DimensionMap): Dimension[] {
  return [...DIMENSIONS].sort((a, b) => percent[b] - percent[a]);
}

function evidenceOrder(
  evidence: DimensionMap,
  most: DimensionMap,
  least: DimensionMap,
): Dimension[] {
  return [...DIMENSIONS].sort(
    (a, b) =>
      evidence[b] - evidence[a] ||
      most[b] - most[a] ||
      least[a] - least[b] ||
      DIMENSIONS.indexOf(a) - DIMENSIONS.indexOf(b),
  );
}

function vector(raw: DimensionMap): ProfileVector {
  const percent = toPercent(raw);
  return { raw, percent, order: order(percent) };
}

/**
 * Motor de pontuação configurável.
 *
 * - Perfil Social: baseado nas escolhas "mais se parece comigo" (como a pessoa
 *   se apresenta no ambiente).
 * - Perfil Natural: baseado na ausência de rejeição ("menos se parece comigo"),
 *   refletindo tendências espontâneas.
 * - Perfil Adaptado: combinação dos dois, conforme `scoring.adaptedMode`.
 *
 * Todas as fórmulas leem parâmetros de `ScoringConfig`, permitindo calibração
 * posterior sem alteração de código.
 */
export function computeScores(
  answers: Answer[],
  instrument: Instrument,
  configOverride?: Partial<ScoringConfig>,
): ScoreResult {
  const config: ScoringConfig = { ...instrument.scoring, ...configOverride };
  const validIds = new Set(instrument.items.map((i) => i.id));
  const valid = answers.filter((a) => validIds.has(a.itemId) && a.most && a.least);

  const mostCount = empty();
  const leastCount = empty();
  for (const a of valid) {
    mostCount[a.most] += 1;
    leastCount[a.least] += 1;
  }

  const blocks = valid.length;
  const mostWeight = config.mostWeight ?? 1;
  const leastWeight = config.leastWeight ?? -1;
  const naturalBase = config.naturalBase ?? 1;

  /**
   * Regra APAS DISC 1.0 (configurável):
   * - MAIS soma `mostWeight` à dimensão escolhida (base do Perfil Social);
   * - MENOS soma `leastWeight` à dimensão escolhida (reduz o Perfil Natural);
   * - afirmações não escolhidas não pontuam.
   * O Perfil Natural parte de um crédito base por bloco (`naturalBase`) para
   * manter a escala positiva e comparável entre as dimensões.
   */
  const socialRaw = empty();
  const naturalRaw = empty();
  const net = empty();
  for (const d of DIMENSIONS) {
    socialRaw[d] = Math.max(0, mostCount[d] * mostWeight);
    naturalRaw[d] = Math.max(0, blocks * naturalBase + leastCount[d] * leastWeight);
    net[d] = mostCount[d] * mostWeight + leastCount[d] * leastWeight;
  }

  const social = vector(socialRaw);
  const natural = vector(naturalRaw);

  const adaptedRaw = empty();
  const usesEvidenceModel = config.version.startsWith("apas-scoring-1.2");
  if (usesEvidenceModel) {
    const affirmativeWeight = config.primaryMostWeight ?? 2;
    const acceptanceWeight = config.primaryAcceptanceWeight ?? 1;
    for (const d of DIMENSIONS) {
      adaptedRaw[d] =
        mostCount[d] * affirmativeWeight +
        (blocks - leastCount[d]) * acceptanceWeight;
    }
  } else if (config.adaptedMode === "net") {
    const min = Math.min(...DIMENSIONS.map((d) => net[d]));
    const shift = min < 0 ? -min : 0;
    for (const d of DIMENSIONS) adaptedRaw[d] = net[d] + shift;
  } else {
    for (const d of DIMENSIONS) {
      adaptedRaw[d] =
        config.adaptedMode === "social"
          ? social.percent[d]
          : (social.percent[d] + natural.percent[d]) / 2;
    }
  }
  const adapted = vector(adaptedRaw);


  const configuredSource =
    config.predominantSource === "natural"
      ? natural
      : config.predominantSource === "social"
        ? social
         : adapted;
  const source = usesEvidenceModel ? adapted : configuredSource;

  const levels = {} as Record<Dimension, "alto" | "moderado" | "baixo">;
  for (const d of DIMENSIONS) {
    const v = source.percent[d];
    levels[d] =
      v >= config.thresholds.high
        ? "alto"
        : v >= config.thresholds.moderate
          ? "moderado"
          : "baixo";
  }

  const adaptationIndex =
    Math.round(
      (DIMENSIONS.reduce(
        (acc, d) => acc + Math.abs(social.percent[d] - natural.percent[d]),
        0,
      ) /
        2) *
        10,
    ) / 10;

  const ranked = usesEvidenceModel
    ? evidenceOrder(adapted.percent, mostCount, leastCount)
    : source.order;
  const predominant = ranked[0] ?? "D";
  const secondary = ranked[1] ?? "I";
  const primaryGap = Math.round((source.percent[predominant] - source.percent[secondary]) * 10) / 10;
  const closeCombination = primaryGap <= (config.proximityThreshold ?? 3);

  return {
    scoringVersion: config.version,
    answeredItems: valid.length,
    totalItems: instrument.items.length,
    natural,
    social,
    adapted,
    predominant,
    secondary,
    combination: `${predominant}${secondary}`,
    levels,
    adaptationIndex,
    adaptationAlert: adaptationIndex >= config.adaptationAlert,
    net,
    counts: { most: mostCount, least: leastCount },
    evidence: usesEvidenceModel ? adapted.percent : undefined,
    primaryGap,
    closeCombination,
    combinationLabel: `${predominant}${secondary} — ${predominant} primário / ${secondary} secundário`,
  };

}
