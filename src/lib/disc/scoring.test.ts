import { describe, expect, it } from "vitest";
import { DEFAULT_INSTRUMENT, DIMENSIONS, type Dimension } from "./instrument";
import { computeScores, type Answer } from "./scoring";

function answers(most: Dimension[], least: Dimension[]): Answer[] {
  return DEFAULT_INSTRUMENT.items.map((item, index) => ({
    itemId: item.id,
    most: most[index % most.length] ?? "D",
    least: least[index % least.length] ?? "C",
  }));
}

describe("APAS DISC scoring 1.2", () => {
  it("mantém os três perfis normalizados e calcula adaptação", () => {
    const result = computeScores(answers(["D", "I", "D"], ["C", "S", "C"]), DEFAULT_INSTRUMENT);
    for (const profile of [result.natural, result.adapted, result.social]) {
      expect(Object.values(profile.percent).reduce((sum, value) => sum + value, 0)).toBeCloseTo(100, 1);
    }
    expect(result.adaptationIndex).toBeGreaterThanOrEqual(0);
  });

  it("retorna DI quando D sustenta vantagem sobre I", () => {
    const result = computeScores(answers(["D", "D", "I"], ["C", "S", "C", "S"]), DEFAULT_INSTRUMENT);
    expect(result.predominant).toBe("D");
    expect(result.secondary).toBe("I");
    expect(result.combination).toBe("DI");
    expect(result.combinationLabel).toBe("DI — D primário / I secundário");
  });

  it("retorna ID quando I sustenta vantagem sobre D", () => {
    const result = computeScores(answers(["I", "I", "D"], ["C", "S", "C", "S"]), DEFAULT_INSTRUMENT);
    expect(result.predominant).toBe("I");
    expect(result.secondary).toBe("D");
    expect(result.combination).toBe("ID");
  });

  it("sinaliza proximidade sem inverter a ordem observada", () => {
    const most = [...Array<Dimension>(13).fill("D"), ...Array<Dimension>(11).fill("I")];
    const least = [...Array<Dimension>(12).fill("C"), ...Array<Dimension>(12).fill("S")];
    const result = computeScores(answers(most, least), DEFAULT_INSTRUMENT);
    expect(result.combination).toBe("DI");
    expect(result.primaryGap).toBeGreaterThan(0);
    expect(result.closeCombination).toBe(true);
  });

  it("resolve empate por escolha MAIS e depois por menor rejeição", () => {
    const result = computeScores(answers(["D", "I"], ["C", "S"]), DEFAULT_INSTRUMENT);
    expect(DIMENSIONS).toContain(result.predominant);
    expect(result.primaryGap).toBe(0);
    expect(result.closeCombination).toBe(true);
  });
});