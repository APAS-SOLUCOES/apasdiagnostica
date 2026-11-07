import { describe, expect, it } from "vitest";
import { adaptationBand, buildProfileSignals, gapBand, intensityLevel, shiftSize } from "./profile-signals";
import { pickVariant } from "./text-variant";
import type { ScoreResult } from "./scoring";

const vec = (D: number, I: number, S: number, C: number) => {
  const percent = { D, I, S, C };
  return { percent, raw: percent, order: (["D", "I", "S", "C"] as const).slice().sort((a, b) => percent[b] - percent[a]) };
};
const scores = (n: number[], a: number[], s: number[], index: number) => ({
  natural: vec(n[0]!, n[1]!, n[2]!, n[3]!), adapted: vec(a[0]!, a[1]!, a[2]!, a[3]!), social: vec(s[0]!, s[1]!, s[2]!, s[3]!),
  predominant: "D", secondary: "I", adaptationIndex: index,
}) as unknown as ScoreResult;

describe("intensity levels (8 bands)", () => {
  it.each([[10, 1], [10.4, 1], [11, 2], [15, 2], [16, 3], [20, 3], [21, 4], [25, 4], [26, 5], [30, 5], [31, 6], [36, 6], [37, 7], [44, 7], [45, 8]])(
    "%s%% -> level %s", (v, l) => expect(intensityLevel(v)).toBe(l));
});

describe("gap, shift and adaptation bands", () => {
  it("classifies distance between factors", () => {
    expect([2, 3, 6, 7, 12, 13].map(gapBand)).toEqual(["disputa", "leve", "leve", "clara", "clara", "muito_marcante"]);
  });
  it("classifies plane shifts", () => {
    expect([2, 3, 6, 7, 12, 13].map(shiftSize)).toEqual(["estavel", "leve", "leve", "claro", "claro", "forte"]);
  });
  it("classifies the adaptation index in 4 bands", () => {
    expect([7, 8, 17, 18, 29, 30].map(adaptationBand)).toEqual(["baixo", "moderado", "moderado", "alto", "alto", "muito_alto"]);
  });
});

describe("profile signals", () => {
  it("finds order, shape, blind spot, shifts and leader change", () => {
    const sig = buildProfileSignals(scores([22, 20, 40, 18], [40, 30, 18, 12], [48, 28, 14, 10], 26));
    expect(sig.planes.adapted.order).toEqual(["D", "I", "S", "C"]);
    expect(sig.planes.adapted.shape).toBe("um");
    expect(sig.planes.adapted.lowest).toBe("C");
    expect(sig.shifts.S.toSocial).toMatchObject({ direction: "desce", size: "forte" });
    expect(sig.adaptation).toMatchObject({ band: "alto", mostShifted: "D" });
    expect(sig.leaderChange).toEqual({ natural: "S", adapted: "D", social: "D" });
  });
  it("detects a three-factor profile when the 2nd and 3rd are close", () => {
    const sig = buildProfileSignals(scores([26, 25, 25, 24], [27, 25, 24, 24], [26, 26, 24, 24], 2));
    expect(sig.planes.adapted.shape).toBe("tres");
    expect(sig.leaderChange).toBeNull();
  });
});

describe("deterministic variants", () => {
  it("is stable per assessment and slot", () => {
    const v = ["a", "b", "c", "d"];
    expect(pickVariant(v, "id-1", "x")).toBe(pickVariant(v, "id-1", "x"));
    const spread = new Set(Array.from({ length: 40 }, (_, i) => pickVariant(v, `id-${i}`, "x")));
    expect(spread.size).toBe(4);
  });
});
