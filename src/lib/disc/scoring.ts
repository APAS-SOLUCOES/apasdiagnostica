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
  if (config.adaptedMode === "net") {
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


  const source =
    config.predominantSource === "natural"
      ? natural
      : config.predominantSource === "social"
        ? social
        : adapted;

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

  const predominant = source.order[0]!;
  const secondary = source.order[1]!;

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
  };
}
