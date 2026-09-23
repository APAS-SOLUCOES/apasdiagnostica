import { describe, expect, it } from "vitest";
import type { Dimension } from "./instrument";
import type { ScoreResult } from "./scoring";
import { buildDiscReportContent } from "./interpretation";

const makeScores = (
  percent: Record<Dimension, number>,
  predominant: Dimension,
  secondary: Dimension,
  natural: Record<Dimension, number> = percent,
): ScoreResult => ({
  scoringVersion: "apas-scoring-1.2.0",
  answeredItems: 24,
  totalItems: 24,
  natural: {
    percent: natural,
    raw: { D: 1, I: 1, S: 1, C: 1 },
    order: (["D", "I", "S", "C"] as Dimension[]).sort((a, b) => natural[b] - natural[a]),
  },
  social: {
    percent,
    raw: { D: 1, I: 1, S: 1, C: 1 },
    order: (["D", "I", "S", "C"] as Dimension[]).sort((a, b) => percent[b] - percent[a]),
  },
  adapted: {
    percent,
    raw: { D: 1, I: 1, S: 1, C: 1 },
    order: (["D", "I", "S", "C"] as Dimension[]).sort((a, b) => percent[b] - percent[a]),
  },
  predominant,
  secondary,
  combination: predominant + secondary,
  levels: {
    D: percent.D >= 32 ? "alto" : percent.D >= 20 ? "moderado" : "baixo",
    I: percent.I >= 32 ? "alto" : percent.I >= 20 ? "moderado" : "baixo",
    S: percent.S >= 32 ? "alto" : percent.S >= 20 ? "moderado" : "baixo",
    C: percent.C >= 32 ? "alto" : percent.C >= 20 ? "moderado" : "baixo",
  },
  adaptationIndex: 0,
  adaptationAlert: false,
  completionPercent: 100,
  invalidAnswerCount: 0,
  primaryGap: Math.round((percent[predominant] - percent[secondary]) * 10) / 10,
  closeCombination: percent[predominant] - percent[secondary] <= 3,
});

describe("APAS DISC dynamic interpretation", () => {
  it("interprets all 12 ordered primary/secondary combinations", () => {
    const pairs = ["DI", "ID", "DS", "SD", "DC", "CD", "IS", "SI", "IC", "CI", "SC", "CS"];
    for (const pair of pairs) {
      const result = buildDiscReportContent(
        makeScores({ D: 40, I: 30, S: 20, C: 10 }, pair[0] as Dimension, pair[1] as Dimension),
      );
      expect(result.profileName).toContain(pair);
      expect(result.profileLabel.length).toBeGreaterThan(20);
    }
  });

  it("changes interpretation when the primary/secondary gap changes", () => {
    const close = buildDiscReportContent(makeScores({ D: 34, I: 32, S: 20, C: 14 }, "D", "I"));
    const distant = buildDiscReportContent(makeScores({ D: 48, I: 27, S: 15, C: 10 }, "D", "I"));
    expect(close.technicalSignals.closeCombination).toBe(true);
    expect(distant.technicalSignals.closeCombination).toBe(false);
    expect(close.profileBalance).not.toBe(distant.profileBalance);
  });

  it("uses natural versus adapted differences in the adaptation narrative", () => {
    const stable = buildDiscReportContent(makeScores(
      { D: 40, I: 30, S: 20, C: 10 },
      "D",
      "I",
      { D: 39, I: 31, S: 20, C: 10 },
    ));
    const adapted = buildDiscReportContent(makeScores(
      { D: 52, I: 24, S: 14, C: 10 },
      "D",
      "I",
      { D: 30, I: 30, S: 25, C: 15 },
    ));
    expect(stable.adaptation).not.toBe(adapted.adaptation);
    expect(adapted.technicalSignals.strongestDelta).toBe("D");
  });
});
