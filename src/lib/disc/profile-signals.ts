import { DIMENSIONS, type Dimension } from "./instrument";
import type { ScoreResult } from "./scoring";

/** Read-only signals derived from saved scores; never changes any computed value. */
export type Plane = "natural" | "adapted" | "social";
export const PLANES: Plane[] = ["natural", "adapted", "social"];

export type IntensityLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export const LEVEL_ADJECTIVE: Record<IntensityLevel, string> = {
  1: "quase ausente",
  2: "discreta",
  3: "moderada-baixa",
  4: "equilibrada",
  5: "presente",
  6: "marcante",
  7: "muito marcante",
  8: "dominante",
};

/** ≤10 | 11–15 | 16–20 | 21–25 | 26–30 | 31–36 | 37–44 | >44 (rounded to integer only to classify). */
export function intensityLevel(percent: number): IntensityLevel {
  const v = Math.round(percent);
  if (v <= 10) return 1;
  if (v <= 15) return 2;
  if (v <= 20) return 3;
  if (v <= 25) return 4;
  if (v <= 30) return 5;
  if (v <= 36) return 6;
  if (v <= 44) return 7;
  return 8;
}

export type GapBand = "disputa" | "leve" | "clara" | "muito_marcante";
/** 0–2 disputa | 3–6 leve | 7–12 clara | 13+ muito marcante. */
export function gapBand(gap: number): GapBand {
  const v = Math.round(Math.abs(gap));
  if (v <= 2) return "disputa";
  if (v <= 6) return "leve";
  if (v <= 12) return "clara";
  return "muito_marcante";
}

export type ShiftSize = "estavel" | "leve" | "claro" | "forte";
export function shiftSize(delta: number): ShiftSize {
  const v = Math.round(Math.abs(delta));
  if (v < 3) return "estavel";
  if (v <= 6) return "leve";
  if (v <= 12) return "claro";
  return "forte";
}

export type AdaptationBand = "baixo" | "moderado" | "alto" | "muito_alto";
/** 0–7 baixo | 8–17 moderado | 18–29 alto | 30+ muito alto. */
export function adaptationBand(index: number): AdaptationBand {
  const v = Math.round(index);
  if (v <= 7) return "baixo";
  if (v <= 17) return "moderado";
  if (v <= 29) return "alto";
  return "muito_alto";
}

export type PlaneSignals = {
  order: Dimension[];
  levels: Record<Dimension, IntensityLevel>;
  gap12: number;
  gap12Band: GapBand;
  gap23: number;
  gap23Band: GapBand;
  shape: "um" | "dois" | "tres";
  lowest: Dimension;
  lowestLevel: IntensityLevel;
};

export type FactorShift = { delta: number; direction: "sobe" | "desce" | "estavel"; size: ShiftSize };

export type ProfileSignals = {
  planes: Record<Plane, PlaneSignals>;
  primary: Dimension;
  secondary: Dimension;
  shifts: Record<Dimension, { toAdapted: FactorShift; toSocial: FactorShift }>;
  adaptation: { index: number; band: AdaptationBand; mostShifted: Dimension };
  leaderChange: { natural: Dimension; adapted: Dimension; social: Dimension } | null;
};

function sortedOrder(percent: Record<Dimension, number>): Dimension[] {
  return [...DIMENSIONS].sort((a, b) => percent[b] - percent[a] || DIMENSIONS.indexOf(a) - DIMENSIONS.indexOf(b));
}

function planeSignals(percent: Record<Dimension, number>): PlaneSignals {
  const order = sortedOrder(percent);
  const [a, b, c, d] = order as [Dimension, Dimension, Dimension, Dimension];
  const gap12 = Math.round((percent[a] - percent[b]) * 10) / 10;
  const gap23 = Math.round((percent[b] - percent[c]) * 10) / 10;
  const levels = Object.fromEntries(DIMENSIONS.map((f) => [f, intensityLevel(percent[f])])) as Record<Dimension, IntensityLevel>;
  const shape = Math.round(gap12) >= 7 ? "um" : Math.round(gap23) <= 2 ? "tres" : "dois";
  return { order, levels, gap12, gap12Band: gapBand(gap12), gap23, gap23Band: gapBand(gap23), shape, lowest: d, lowestLevel: levels[d] };
}

function shift(from: number, to: number): FactorShift {
  const delta = Math.round((to - from) * 10) / 10;
  const size = shiftSize(delta);
  return { delta, size, direction: size === "estavel" ? "estavel" : delta > 0 ? "sobe" : "desce" };
}

export function buildProfileSignals(scores: ScoreResult): ProfileSignals {
  const planes = {
    natural: planeSignals(scores.natural.percent),
    adapted: planeSignals(scores.adapted.percent),
    social: planeSignals(scores.social.percent),
  };
  const shifts = Object.fromEntries(DIMENSIONS.map((f) => [f, {
    toAdapted: shift(scores.natural.percent[f], scores.adapted.percent[f]),
    toSocial: shift(scores.natural.percent[f], scores.social.percent[f]),
  }])) as ProfileSignals["shifts"];
  const mostShifted = [...DIMENSIONS].sort((a, b) =>
    Math.abs(shifts[b].toSocial.delta) - Math.abs(shifts[a].toSocial.delta))[0] as Dimension;
  const leaders = { natural: planes.natural.order[0]!, adapted: planes.adapted.order[0]!, social: planes.social.order[0]! };
  const changed = leaders.natural !== leaders.adapted || leaders.natural !== leaders.social;
  return {
    planes,
    primary: scores.predominant,
    secondary: scores.secondary,
    shifts,
    adaptation: { index: scores.adaptationIndex, band: adaptationBand(scores.adaptationIndex), mostShifted },
    leaderChange: changed ? leaders : null,
  };
}
