import { describe, expect, it } from "vitest";
import { normalizeDiscScores } from "./normalize-result";
import type { ScoreResult } from "./scoring";

const base: ScoreResult = {
  scoringVersion: "apas-scoring-1.2.0",
  answeredItems: 24,
  totalItems: 24,
  natural: { percent: { D: 30, I: 25, S: 25, C: 20 }, raw: { D: 1, I: 1, S: 1, C: 1 }, order: ["D", "I", "S", "C"] },
  social: { percent: { D: 32, I: 28, S: 22, C: 18 }, raw: { D: 1, I: 1, S: 1, C: 1 }, order: ["D", "I", "S", "C"] },
  adapted: { percent: { D: 31, I: 29, S: 22, C: 18 }, raw: { D: 1, I: 1, S: 1, C: 1 }, order: ["D", "I", "S", "C"] },
  predominant: "I",
  secondary: "D",
  combination: "ID",
  combinationLabel: "ID — I primário / D secundário",
  levels: { D: "moderado", I: "moderado", S: "moderado", C: "baixo" },
  adaptationIndex: 1,
  adaptationAlert: false,
  primaryGap: 2,
  closeCombination: true,
  completionPercent: 100,
  invalidAnswerCount: 0,
};

describe("normalização de resultados DISC", () => {
  it("migra EU para I sem recalcular pontuações", () => {
    const legacy = {
      ...base,
      predominant: "EU",
      secondary: "D",
      combination: "EUD",
      combinationLabel: "EUD — EU primário / D secundário",
      adapted: {
        ...base.adapted,
        percent: { D: 31, EU: 29, S: 22, C: 18 },
        order: ["EU", "D", "S", "C"],
      },
    } as unknown as ScoreResult;

    const normalized = normalizeDiscScores(legacy)!;
    expect(normalized.predominant).toBe("I");
    expect(normalized.combination).toBe("ID");
    expect(normalized.adapted.percent.I).toBe(29);
    expect(normalized.adapted.percent.D).toBe(31);
  });

  it("recusa resultado persistido sem fatores válidos", () => {
    const corrupt = { ...base, predominant: "X" } as unknown as ScoreResult;
    expect(normalizeDiscScores(corrupt)).toBeNull();
  });
});
