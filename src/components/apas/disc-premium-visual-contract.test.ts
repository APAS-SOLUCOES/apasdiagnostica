import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const report = readFileSync("src/components/apas/DiscPremiumReportFinal.tsx", "utf8");
const css = readFileSync("src/disc-premium-final.css", "utf8");
const route = readFileSync("src/routes/_authenticated/avaliacoes.$id.tsx", "utf8");

describe("APAS DISC Premium visual contract", () => {
  it("keeps exactly twelve numbered pages", () => {
    const pages = [...report.matchAll(/<Page number=\{(\d+)\}/g)].map((m) => Number(m[1]));
    expect(pages).toEqual([1,2,3,4,5,6,7,8,9,10,11,12]);
  });

  it("keeps page 12 artwork and approved page labels", () => {
    expect(report).toContain('eyebrow="12 · SEU PERFIL NÃO É UM DESTINO"');
    expect(report).toMatch(/<Page number=\{12\}[\s\S]*?artwork=/);
    expect(report).toMatch(/title=\{<>Seu perfil não é <span className="disc-title-accent">um destino<\/span><\/>\}/);
  });

  it("uses I, never EU, as a DISC factor in the premium renderer", () => {
    expect(report).not.toMatch(/\bEU\b/);
  });

  it("preserves the A4 portrait print contract and all page selectors", () => {
    expect(css).toMatch(/@page\s*\{\s*size:\s*A4 portrait;/);
    for (const page of Array.from({ length: 12 }, (_, i) => i + 1)) {
      expect(css).toContain(`data-page="${page}"`);
    }
  });

  it("keeps the premium route dynamic and the technical panel protected", () => {
    expect(route).toContain('RelatorioDISC');
    expect(route).toContain('normalizeDiscScores');
    expect(route).toContain('DiscTechnicalPanel');
    expect(route).toContain('<RelatorioDISC dados={relatorioDados} />');
    expect(component).toContain('dados: RelatorioDados');
  });
});
