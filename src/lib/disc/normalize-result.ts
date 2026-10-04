import type { Dimension } from "@/lib/disc/instrument";
import type { DimensionMap, ScoreResult } from "@/lib/disc/scoring";

const DISC_DIMENSIONS: Dimension[] = ["D", "I", "S", "C"];

function normalizeDimensionMap(value: unknown): DimensionMap {
  const source = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return {
    D: Number(source["D"] ?? 0),
    I: Number(source["I"] ?? source["EU"] ?? 0),
    S: Number(source["S"] ?? 0),
    C: Number(source["C"] ?? 0),
  };
}

function normalizeVector(value: unknown) {
  const source = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const percent = normalizeDimensionMap(source["percent"]);
  const raw = normalizeDimensionMap(source["raw"]);
  const order = Array.isArray(source["order"])
    ? source["order"]
        .map((d) => (d === "EU" ? "I" : d))
        .filter((d): d is Dimension => DISC_DIMENSIONS.includes(d as Dimension))
    : [...DISC_DIMENSIONS].sort((a, b) => percent[b] - percent[a]);

  return { ...source, percent, raw, order };
}

/**
 * Normaliza resultados DISC persistidos por versões antigas do instrumento.
 * A migração é apenas de nomenclatura de fator: EU -> I (Influência).
 * Nenhuma pontuação, resposta ou fórmula de scoring é recalculada.
 */
export function normalizeDiscScores(value: unknown): ScoreResult | null {
  if (!value || typeof value !== "object") return null;

  const source = value as unknown as Record<string, unknown>;
  const natural = normalizeVector(source["natural"]);
  const social = normalizeVector(source["social"]);
  const adapted = normalizeVector(source["adapted"]);

  const predominant = source["predominant"] === "EU" ? "I" : source["predominant"];
  const secondary = source["secondary"] === "EU" ? "I" : source["secondary"];
  const validFactor = (d: unknown): d is Dimension => DISC_DIMENSIONS.includes(d as Dimension);

  // Never invent a profile when a persisted result is incomplete or lacks valid factors.
  // EU -> I remains the only migration performed here.
  if (!validFactor(predominant) || !validFactor(secondary) || predominant === secondary) return null;

  const normalizedPredominant = predominant;
  const normalizedSecondary = secondary;

  const combination = `${normalizedPredominant}${normalizedSecondary}`;
  const levelsSource = (source["levels"] && typeof source["levels"] === "object" ? source["levels"] : {}) as Record<string, unknown>;
  const levels = {
    D: levelsSource["D"] ?? "moderado",
    I: levelsSource["I"] ?? levelsSource["EU"] ?? "moderado",
    S: levelsSource["S"] ?? "moderado",
    C: levelsSource["C"] ?? "moderado",
  } as ScoreResult["levels"];

  const countsSource = (source["counts"] && typeof source["counts"] === "object" ? source["counts"] : {}) as Record<string, unknown>;
  const counts = {
    most: normalizeDimensionMap(countsSource["most"]),
    least: normalizeDimensionMap(countsSource["least"]),
  };

  const evidence = source["evidence"] === undefined ? undefined : normalizeDimensionMap(source["evidence"]);
  const net = source["net"] === undefined ? undefined : normalizeDimensionMap(source["net"]);

  return {
    ...(source as ScoreResult),
    natural,
    social,
    adapted,
    predominant: normalizedPredominant,
    secondary: normalizedSecondary,
    combination,
    combinationLabel: `${combination} — ${normalizedPredominant} primário / ${normalizedSecondary} secundário`,
    levels,
    counts,
    ...(evidence ? { evidence } : {}),
    ...(net ? { net } : {}),
  };
}
