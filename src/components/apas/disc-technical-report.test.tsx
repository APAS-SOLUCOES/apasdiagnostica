import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DiscTechnicalReport } from "./DiscTechnicalReport";
import { DIMENSIONS, type Dimension } from "@/lib/disc/instrument";
import type { ScoreResult } from "@/lib/disc/scoring";
import { personalize, standardizeFactors } from "@/lib/disc/technical-voice";

const vector = (percent: Record<Dimension, number>) => ({ percent, raw: percent, order: [...DIMENSIONS].sort((a, b) => percent[b] - percent[a]) });

function scores(p: Dimension, s: Dimension, adaptationIndex: number, natural?: Record<Dimension, number>): ScoreResult {
  const others = DIMENSIONS.filter((d) => d !== p && d !== s);
  const adapted = { [p]: 36, [s]: 30, [others[0]!]: 18, [others[1]!]: 16 } as Record<Dimension, number>;
  return {
    scoringVersion: "apas-scoring-1.2.0", answeredItems: 24, totalItems: 24,
    natural: vector(natural ?? adapted), social: vector(adapted), adapted: vector(adapted),
    predominant: p, secondary: s, combination: `${p}${s}`,
    levels: { D: "moderado", I: "moderado", S: "moderado", C: "moderado" },
    adaptationIndex, adaptationAlert: adaptationIndex >= 18, primaryGap: 6, closeCombination: false,
    completionPercent: 100, invalidAnswerCount: 0,
  };
}

const render = (result: ScoreResult) => renderToStaticMarkup(
  <DiscTechnicalReport assessment={{ id: "x", candidate_name: "Ana Paula Souza", status: "completed", created_at: "2026-10-05T12:00:00Z" }} scores={result} />,
).replace(/<[^>]+>/g, " ");

describe("Technical DISC report wording and guidance", () => {
  it("uses the first name and omits the repeated subject in the next sentence", () => {
    expect(personalize("A pessoa esclarece premissas. A pessoa registra critérios de decisão.", "Ana"))
      .toBe("Ana esclarece premissas. Registra critérios de decisão.");
  });

  it("writes factor names as Name (letter) with capital initial", () => {
    expect(standardizeFactors("Distribua para que conformidade e dominância contribuam.")).toBe("Distribua para que Conformidade (C) e Dominância (D) contribuam.");
    expect(standardizeFactors("Quando a exigência sobe, C se intensifica.")).toBe("Quando a exigência sobe, a Conformidade (C) se intensifica.");
  });

  it("places 18 or more in the high adaptation band and below 18 in the low band", () => {
    expect(render(scores("C", "D", 22))).toContain("22,0 — faixa alta.");
    expect(render(scores("C", "D", 17.9))).toContain("17,9 — faixa baixa.");
  });

  it("lists the real page of each section in the summary", () => {
    const text = render(scores("C", "D", 10));
    expect(text).toMatch(/03\s+Introdução e Modelo DISC/);
    expect(text).toMatch(/10\s+Conclusão e Aplicação Gerencial/);
  });

  it("flags when the Natural plane's second factor differs from the final secondary", () => {
    const flagged = render(scores("C", "D", 10, { C: 36, I: 30, D: 18, S: 16 }));
    expect(flagged).toContain("No plano Natural, a segunda posição é de Influência (I)");
    expect(render(scores("C", "D", 10))).not.toContain("No plano Natural, a segunda posição");
  });

  it("keeps hedges out of every profile, except the shared Natural plane description", () => {
    for (const p of DIMENSIONS) for (const s of DIMENSIONS) if (p !== s) {
      const text = render(scores(p, s, 22)).replaceAll("Como tende a agir quando está mais à vontade.", "").replaceAll("como tende a agir quando está mais à vontade.", "");
      expect(text).not.toMatch(/\b(pode|podem|tende|tendem|costuma|costumam)\b/i);
      expect(text).not.toMatch(/\ba pessoa\b/i);
      expect(text).toContain("não deve ser usado isoladamente para decisões de contratação, promoção ou demissão");
    }
  });
});
