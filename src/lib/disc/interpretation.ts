import type { Dimension } from "./instrument";
import type { ScoreResult } from "./scoring";
import { DIMENSION_CONTENT } from "./content";
import { getAdaptiveFactorReading, getAdaptiveNarrative } from "./adaptive-content";

export type DiscTechnicalContent = {
  scoringVersion: string;
  completionPercent: number;
  invalidAnswerCount: number;
  primary: Dimension;
  secondary: Dimension;
  primaryGap: number;
  closeCombination: boolean;
  levels: Record<Dimension, "alto" | "moderado" | "baixo">;
  natural: Record<Dimension, number>;
  social: Record<Dimension, number>;
  adapted: Record<Dimension, number>;
  delta: Record<Dimension, number>;
  strongestDelta: Dimension;
  highestFactor: Dimension;
  lowestFactor: Dimension;
};

export type DiscReportContent = {
  profileName: string;
  headline: string;
  overview: string;
  factorReadings: Record<Dimension, string>;
  strengths: string[];
  attention: string[];
  perception: string;
  communication: string;
  decision: string;
  teamwork: string;
  pressureChange: string;
  development: string[];
  adaptation: string;
  conclusion: string;
  profileLabel: string;
  profileBalance: string;
  secondaryInfluence: string;
  lowerFactors: string;
  intensitySummary: string;
  technical: DiscTechnicalContent;
  technicalSignals: {
    intensity: Record<Dimension, "alto" | "moderado" | "baixo">;
    primaryGap: number;
    closeCombination: boolean;
    naturalVsAdaptedDelta: Record<Dimension, number>;
    strongestDelta: Dimension;
    highestFactor: Dimension;
    lowestFactor: Dimension;
  };
};

const DIMS: Dimension[] = ["D", "I", "S", "C"];
const NAMES: Record<Dimension, string> = {
  D: "Dominância",
  I: "Influência",
  S: "Estabilidade",
  C: "Conformidade",
};

const round = (n: number) => Math.round(n * 10) / 10;
const pct = (n: number) => round(n).toFixed(1).replace(".", ",") + "%";

function order(scores: ScoreResult): Dimension[] {
  const candidate = [...scores.adapted.order];
  return candidate.length === 4 ? candidate : [...DIMS].sort((a, b) => scores.adapted.percent[b] - scores.adapted.percent[a]);
}

function levelText(level: ScoreResult["levels"][Dimension]) {
  return level === "alto" ? "marcante" : level === "moderado" ? "presente" : "menos acentuado";
}

function factorReading(d: Dimension, scores: ScoreResult) {
  const c = DIMENSION_CONTENT[d];
  return getAdaptiveFactorReading(d, scores.adapted.percent[d]) + " " + c.levels[scores.levels[d]];
}

function adaptationText(scores: ScoreResult, delta: Record<Dimension, number>) {
  const strongest = DIMS.reduce((best, d) => Math.abs(delta[d]) > Math.abs(delta[best]) ? d : best, "D" as Dimension);
  const max = Math.abs(delta[strongest]);
  const index = round(scores.adaptationIndex).toFixed(1).replace(".", ",") + " pontos";
  if (scores.adaptationAlert) {
    return "Seu índice de adaptação é " + index + ". Há uma diferença mais perceptível entre tendências naturais e o comportamento adaptado ao contexto. Isso não é positivo nem negativo por si só: indica que vale observar onde o ambiente está exigindo maior ajuste. A maior variação foi de " + pct(max) + " em " + NAMES[strongest] + ".";
  }
  return "Seu índice de adaptação é " + index + ". As diferenças entre o modo natural e o adaptado aparecem de forma mais contida, indicando maior proximidade entre as tendências espontâneas e a resposta ao contexto avaliado.";
}

export function buildDiscReportContent(scores: ScoreResult): DiscReportContent {
  const p = scores.predominant;
  const s = scores.secondary;
  const o = order(scores);
  const first = o[0] ?? p;
  const third = o[2] ?? s;
  const fourth = o[3] ?? s;
  const delta = {} as Record<Dimension, number>;
  DIMS.forEach((d) => { delta[d] = round(scores.adapted.percent[d] - scores.natural.percent[d]); });

  const narrative = getAdaptiveNarrative(scores);
  const pContent = DIMENSION_CONTENT[p];
  const sContent = DIMENSION_CONTENT[s];
  const gap = round(scores.primaryGap ?? Math.abs(scores.adapted.percent[p] - scores.adapted.percent[s]));
  const close = Boolean(scores.closeCombination || gap <= 3);
  const strongestDelta = DIMS.reduce((best, d) => Math.abs(delta[d]) > Math.abs(delta[best]) ? d : best, "D" as Dimension);

  const strengths = [...new Set([
    ...narrative.best,
    pContent.strengths[0],
    sContent.strengths[0],
  ].filter((item): item is string => Boolean(item)))].slice(0, 4);

  const attention = [...new Set([
    ...narrative.excess,
    pContent.attention[0],
    sContent.attention[0],
  ].filter((item): item is string => Boolean(item)))].slice(0, 4);

  return {
    profileName: p + s + " — " + NAMES[p] + " + " + NAMES[s],
    profileLabel: narrative.title,
    headline: narrative.essence,
    overview: "O resultado considera as quatro dimensões, suas intensidades, a combinação dos fatores principais e a relação entre os perfis Natural e Adaptado. No seu resultado, " + NAMES[p] + " aparece com " + pct(scores.adapted.percent[p]) + " e " + NAMES[s] + " com " + pct(scores.adapted.percent[s]) + ", diferença de " + pct(gap) + " pontos percentuais.",
    factorReadings: {
      D: factorReading("D", scores),
      I: factorReading("I", scores),
      S: factorReading("S", scores),
      C: factorReading("C", scores),
    },
    strengths,
    attention,
    perception: narrative.perceived,
    communication: narrative.communication,
    decision: narrative.decision,
    teamwork: narrative.team,
    pressureChange: narrative.pressure + " " + narrative.change,
    development: [...new Set([...narrative.experiments, ...pContent.development.slice(0, 2), ...sContent.development.slice(0, 1)])].slice(0, 4),
    adaptation: adaptationText(scores, delta),
    profileBalance: "A distribuição vai de " + pct(scores.adapted.percent[first]) + " em " + NAMES[first] + " a " + pct(scores.adapted.percent[fourth]) + " em " + NAMES[fourth] + ". Os dois primeiros fatores têm " + pct(gap) + " pontos percentuais de diferença, indicando uma composição " + (close ? "mais próxima entre os fatores principais." : "com maior predominância do primeiro fator."),
    secondaryInfluence: NAMES[s] + (gap <= 3 ? " atua quase no mesmo nível do fator principal." : gap <= 7 ? " tem presença relevante ao lado do fator principal." : " aparece como influência complementar.") + " Ela acrescenta " + sContent.headline.toLowerCase() + " à leitura conjunta.",
    lowerFactors: NAMES[fourth] + " é o fator menos acentuado (" + pct(scores.adapted.percent[fourth]) + "), enquanto " + NAMES[third] + " ocupa a terceira posição (" + pct(scores.adapted.percent[third]) + "). Menor expressão relativa não significa ausência da característica.",
    intensitySummary: o.map((d) => d + " " + pct(scores.adapted.percent[d]) + " — " + levelText(scores.levels[d])).join(" · "),
    technical: {
      scoringVersion: scores.scoringVersion,
      completionPercent: scores.completionPercent,
      invalidAnswerCount: scores.invalidAnswerCount,
      primary: p,
      secondary: s,
      primaryGap: gap,
      closeCombination: close,
      levels: scores.levels,
      natural: scores.natural.percent,
      social: scores.social.percent,
      adapted: scores.adapted.percent,
      delta,
      strongestDelta,
      highestFactor: first,
      lowestFactor: fourth,
    },
    technicalSignals: {
      intensity: scores.levels,
      primaryGap: gap,
      closeCombination: close,
      naturalVsAdaptedDelta: delta,
      strongestDelta,
      highestFactor: first,
      lowestFactor: fourth,
    },
    conclusion: "Seu resultado representa tendências comportamentais observadas neste instrumento e não uma identidade fixa. A leitura deve considerar a combinação, as intensidades, o contexto e as diferenças entre Natural e Adaptado.",
  };
}