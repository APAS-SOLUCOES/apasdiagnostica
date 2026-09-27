import { describe, expect, it } from "vitest";
import { DEFAULT_INSTRUMENT } from "./instrument";
import { computeScores } from "./scoring";
import { normalizeDiscScores } from "./normalize-result";

const scores = computeScores(DEFAULT_INSTRUMENT.items.map((item) => ({
  itemId: item.id,
  most: "I" as const,
  least: "C" as const,
})), DEFAULT_INSTRUMENT);

describe("normalização dos códigos DISC persistidos", () => {
  it("preserva os quatro fatores oficiais e combinações calculadas", () => {
    const normalized = normalizeDiscScores(scores);
    expect(normalized?.combination).toBe(scores.combination);
    expect(normalized?.adapted.percent).toEqual(scores.adapted.percent);
  });

  it("converte apenas códigos legados de fator, inclusive em mapas e ordens", () => {
    const legacy = structuredClone(scores) as unknown as Record<string, unknown>;
    legacy.predominant = "EU";
    legacy.secondary = "D";
    legacy.combination = "EUD";
    legacy.combinationLabel = "EUD — EU primário / D secundário";
    for (const key of ["natural", "social", "adapted"]) {
      const profile = legacy[key] as { percent: Record<string, number>; raw: Record<string, number>; order: string[] };
      for (const map of [profile.percent, profile.raw]) {
        map.EU = map.I;
        delete map.I;
      }
      profile.order = profile.order.map((factor) => factor === "I" ? "EU" : factor);
    }
    const normalized = normalizeDiscScores(legacy);
    expect(normalized?.predominant).toBe("I");
    expect(normalized?.combination).toBe("ID");
    expect(normalized?.combinationLabel).toBe("ID — I primário / D secundário");
    expect(normalized?.natural.percent.I).toBe(scores.natural.percent.I);
    expect(normalized?.adapted.order).toContain("I");
    expect(Object.keys(normalized?.natural.percent ?? {})).toEqual(["D", "I", "S", "C"]);
  });

  it("não interpreta texto livre como código DISC", () => {
    expect(normalizeDiscScores({ ...scores, predominant: "meu" })).toBeNull();
  });
});