import { describe, expect, it } from "vitest";
import { DEFAULT_INSTRUMENT, DIMENSIONS } from "./instrument";
import { computeScores } from "./scoring";
import { writeFactorNames } from "./factor-prose";
import { getPremiumReportNarrative, getTechnicalReportNarrative } from "./report-narrative-presentation";

describe("factor letters inside sentences", () => {
  it("writes the full factor name with the right article and preposition", () => {
    expect(writeFactorNames("Quando a exigência sobe, observe se C continua ajudando ou precisa de uma pausa."))
      .toBe("Quando a exigência sobe, observe se a Conformidade continua ajudando ou precisa de uma pausa.");
    expect(writeFactorNames("Você pode buscar em D um apoio para atravessar a transição."))
      .toBe("Você pode buscar na Dominância um apoio para atravessar a transição.");
    expect(writeFactorNames("A relação entre C e D pode mudar a forma como você responde a uma demanda."))
      .toBe("A relação entre Conformidade e Dominância pode mudar a forma como você responde a uma demanda.");
    expect(writeFactorNames("Na transição, recorra também a S.")).toBe("Na transição, recorra também à Estabilidade.");
    expect(writeFactorNames("I complementa D quando a tarefa pede outro tipo de contribuição."))
      .toBe("A Influência complementa a Dominância quando a tarefa pede outro tipo de contribuição.");
  });

  it("leaves short labels such as C+D and codes in parentheses untouched", () => {
    expect(writeFactorNames("C+D")).toBe("C+D");
    expect(writeFactorNames("Conformidade (C)")).toBe("Conformidade (C)");
    expect(writeFactorNames("Os quatro fatores DISC")).toBe("Os quatro fatores DISC");
  });

  for (const primary of DIMENSIONS) {
    for (const secondary of DIMENSIONS.filter((factor) => factor !== primary)) {
      it(`${primary}${secondary}: no lone factor letter in Premium or Technical sentences`, () => {
        const other = DIMENSIONS.filter((factor) => factor !== primary && factor !== secondary);
        for (const primaryCount of [10, 14, 17, 20, 23]) {
          const scores = computeScores(DEFAULT_INSTRUMENT.items.map((item, index) => ({
            itemId: item.id,
            most: index < primaryCount ? primary : secondary,
            least: other[index % other.length] ?? other[0] ?? primary,
          })), DEFAULT_INSTRUMENT);
          for (const gap of [1, 4, 10, 15]) {
            for (const present of [getPremiumReportNarrative, getTechnicalReportNarrative]) {
              const { title: _title, ...narrative } = present({ ...scores, primaryGap: gap });
              expect(JSON.stringify(narrative).match(/(?<![\p{L}\d(])[DISC](?![\p{L}\d)])/gu) ?? []).toEqual([]);
            }
          }
        }
      });
    }
  }
});
