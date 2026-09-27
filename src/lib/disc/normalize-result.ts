import { DIMENSIONS, type Dimension } from "./instrument";
import type { ScoreResult, DimensionMap, ProfileVector } from "./scoring";

// Only the historical factor code is remapped; narrative text is never modified.
function factor(value: unknown): Dimension | null {
  if (value === "EU") return "I";
  return DIMENSIONS.find((dimension) => dimension === value) ?? null;
}

function dimensionMap(value: DimensionMap): DimensionMap {
  const legacy = value as DimensionMap & { EU?: number };
  return { D: legacy.D, I: legacy.I ?? legacy.EU, S: legacy.S, C: legacy.C };
}

function profile(value: ProfileVector): ProfileVector {
  return {
    ...value,
    raw: dimensionMap(value.raw),
    percent: dimensionMap(value.percent),
    order: value.order.map((item) => factor(item) ?? item),
  };
}

/** Normalize persisted historical factor codes at the report boundary, without recalculating scores. */
export function normalizeDiscScores(value: unknown): ScoreResult | null {
  if (!value || typeof value !== "object") return null;
  const scores = value as ScoreResult;
  if (!scores.natural?.percent || !scores.social?.percent || !scores.adapted?.percent || !scores.predominant || !scores.secondary) return null;
  const predominant = factor(scores.predominant);
  const secondary = factor(scores.secondary);
  if (!predominant || !secondary || predominant === secondary) return null;
  const combination = `${predominant}${secondary}`;
  return {
    ...scores,
    natural: profile(scores.natural),
    social: profile(scores.social),
    adapted: profile(scores.adapted),
    predominant,
    secondary,
    combination,
    ...(scores.combinationLabel !== undefined && { combinationLabel: `${combination} — ${predominant} primário / ${secondary} secundário` }),
    levels: dimensionMap(scores.levels as unknown as DimensionMap) as unknown as ScoreResult["levels"],
    ...(scores.net && { net: dimensionMap(scores.net) }),
    ...(scores.evidence && { evidence: dimensionMap(scores.evidence) }),
    ...(scores.counts && { counts: { most: dimensionMap(scores.counts.most), least: dimensionMap(scores.counts.least) } }),
  };
}