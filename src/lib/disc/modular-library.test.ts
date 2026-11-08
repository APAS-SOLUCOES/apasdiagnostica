import { describe, expect, it } from "vitest";
import { hasModularFactor, MODULAR_SECTIONS, modularSnippet, modularVariants, type ModularReport } from "./modular-library";
import type { IntensityLevel } from "./profile-signals";

const REPORTS: ModularReport[] = ["premium", "technical"];
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8] as IntensityLevel[];
const BATCH_FACTORS = ["D", "I"] as const;

describe("lote 1 — Dominância e Influência", () => {
  for (const report of REPORTS) {
    for (const factor of BATCH_FACTORS) {
      it(`${report} ${factor}: 8 níveis × 7 seções × 4 variações`, () => {
        expect(hasModularFactor(report, factor)).toBe(true);
      });

      it(`${report} ${factor}: sem letras isoladas, números, percentuais nem frases repetidas`, () => {
        const sentences = new Map<string, string>();
        for (const level of LEVELS) for (const section of MODULAR_SECTIONS) {
          for (const text of modularVariants(report, factor, level, section)) {
            expect(text, text).not.toMatch(/(^|[\s(,;:])[DISC](?=[\s.,;:!?)]|$)/);
            expect(text, text).not.toMatch(/%/);
            expect(text.replace(/30 dias/g, ""), text).not.toMatch(/\d/);
            expect(text.length, text).toBeLessThanOrEqual(420);
            if (report === "technical") expect(text, text).not.toMatch(/\b(ele|ela)\b/i);
            for (const s of text.split(/(?<=[.!?])\s+/).map((x) => x.trim().toLowerCase()).filter((x) => x.length > 25)) {
              const where = `${level}/${section}`;
              expect(sentences.get(s) ?? where, `frase repetida: ${s}`).toBe(where);
              sentences.set(s, where);
            }
          }
        }
      });
    }
  }

  it("nenhuma biblioteca usa frases-modelo repetidas (sequências de 6 palavras no máximo 3 vezes)", () => {
    for (const report of REPORTS) for (const factor of BATCH_FACTORS) {
      const counts = new Map<string, number>();
      for (const level of LEVELS) for (const section of MODULAR_SECTIONS) for (const text of modularVariants(report, factor, level, section)) {
        const words = text.toLowerCase().replace(/em 30 dias/g, "").split(/\s+/);
        for (let i = 0; i + 6 <= words.length; i++) {
          const key = words.slice(i, i + 6).join(" ");
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }
      const repeated = [...counts].filter(([, n]) => n > 3).map(([k]) => k);
      expect(repeated, `${report} ${factor}`).toEqual([]);
    }
  });

  it("níveis diferentes produzem textos diferentes para a mesma avaliação", () => {
    for (const report of REPORTS) for (const section of MODULAR_SECTIONS) {
      expect(modularSnippet(report, "D", 6, section, "aval-1")).not.toBe(modularSnippet(report, "D", 8, section, "aval-1"));
    }
  });

  it("mesma avaliação sempre recebe a mesma variação", () => {
    expect(modularSnippet("premium", "I", 7, "pressao", "x")).toBe(modularSnippet("premium", "I", 7, "pressao", "x"));
  });
});
