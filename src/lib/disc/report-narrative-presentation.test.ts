import { describe, expect, it } from "vitest";
import { DEFAULT_INSTRUMENT, DIMENSIONS } from "./instrument";
import { computeScores } from "./scoring";
import { getAdaptiveNarrative } from "./adaptive-content";
import { getPremiumReportNarrative, getTechnicalReportNarrative } from "./report-narrative-presentation";

describe("report-only DISC numeric presentation", () => {
  for (const primary of DIMENSIONS) {
    for (const secondary of DIMENSIONS.filter((factor) => factor !== primary)) {
      it(`${primary}${secondary}: preserves values, selections and archetype without narrative percentages`, () => {
        const other = DIMENSIONS.filter((factor) => factor !== primary && factor !== secondary);
        for (const primaryCount of [12, 14, 17, 20, 23]) {
          const scores = computeScores(DEFAULT_INSTRUMENT.items.map((item, index) => ({
            itemId: item.id,
            most: index < primaryCount ? primary : secondary,
            least: other[index % other.length] ?? other[0] ?? primary,
          })), DEFAULT_INSTRUMENT);
          const before = structuredClone(scores);
          const original = getAdaptiveNarrative(scores);
          for (const present of [getPremiumReportNarrative, getTechnicalReportNarrative]) {
            const result = present(scores);
            const numericPercentages = JSON.stringify(result).match(/\d[\d,.]*\s*%/g) ?? [];
            expect(numericPercentages.length).toBe(0);
            expect((JSON.stringify(result).match(/\d[\d,.]*\s*(?:%\s*)?pontos/g) ?? []).length).toBe(0);
            expect(result.title).toBe(original.title);
            expect(Object.keys(result)).toEqual(Object.keys(original));
            expect(result.best.length).toBe(original.best.length);
            expect(result.excess.length).toBe(original.excess.length);
            expect(result.experiments.length).toBe(original.experiments.length);
            expect(scores).toEqual(before);
          }
          const premium = getPremiumReportNarrative(scores);
          const technical = getTechnicalReportNarrative(scores);
          expect(premium.title.split(" · ")[0]).toBe(technical.title.split(" · ")[0]);
          expect(premium.title.split(" · ")[1]).toBe(original.title.split(" · ")[1]);
        }
      });
    }
  }
  it("keeps intensity and distance variations after editorial presentation", () => {
    const scores = computeScores(DEFAULT_INSTRUMENT.items.map((item, index) => ({
      itemId: item.id, most: index < 17 ? "D" : "I", least: index % 2 ? "S" : "C",
    })), DEFAULT_INSTRUMENT);
    const close = { ...scores, primaryGap: 2 };
    const distant = { ...scores, primaryGap: 10 };
    for (const present of [getPremiumReportNarrative, getTechnicalReportNarrative]) {
      expect(present(close).essence).not.toBe(present(distant).essence);
      expect(present(close).title).toBe(getAdaptiveNarrative(close).title);
      expect(present(distant).title).toBe(getAdaptiveNarrative(distant).title);
      const moderate = { ...scores, adapted: { ...scores.adapted, percent: { ...scores.adapted.percent, D: 28 } } };
      expect(present(moderate).experiments[1]).not.toBe(present(scores).experiments[1]);
    }
  });
});