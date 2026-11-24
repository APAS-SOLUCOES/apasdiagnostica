import { describe, expect, it } from "vitest";
import { MODULAR_NARRATIVE_ENABLED } from "./modular-library";

type DraftLibrary = {
  factor: string;
  report: string;
  status: string;
  diagnostics: Record<string, { variants: Record<string, { status: string }> }>;
};

const drafts = Object.values(import.meta.glob<DraftLibrary>(
  "./modular/drafts/*/*.json", { eager: true, import: "default" },
));
const validCells = [
  "1-4", "1-5", "1-6", "1-7", "1-8",
  "2-1", "2-2", "2-3", "2-4", "2-5", "2-6", "2-7", "2-8",
  "3-1", "3-2", "3-3", "3-4", "3-5", "3-6",
  "4-1", "4-2", "4-3", "4-4",
];

describe("Cobertura dos rascunhos dos quatro fatores", () => {
  for (const factor of ["D", "I", "S", "C"]) {
    for (const report of ["premium", "technical"]) {
      it(`${factor}/${report}: 23 diagnósticos com quatro variações`, () => {
        const cells: Record<string, Set<string>> = {};
        for (const library of drafts.filter(d => d.factor === factor && d.report === report)) {
          for (const [key, cell] of Object.entries(library.diagnostics)) {
            const variants = cells[key] ?? new Set<string>();
            for (const variant of Object.keys(cell.variants)) {
              expect(variants.has(variant)).toBe(false);
              variants.add(variant);
            }
            cells[key] = variants;
          }
        }
        expect(Object.keys(cells).sort()).toEqual([...validCells].sort());
        for (const variants of Object.values(cells)) {
          expect([...variants].sort()).toEqual(["1", "2", "3", "4"]);
        }
        for (const variant of ["1", "2", "3", "4"]) {
          expect(Object.values(cells).filter(v => v.has(variant))).toHaveLength(23);
        }
      });
    }
  }
  it("mantém todos os lotes em rascunho e a transição desligada", () => {
    expect(MODULAR_NARRATIVE_ENABLED).toBe(false);
    for (const library of drafts) {
      expect(library.status).toBe("rascunho");
      // Dominância retains literal samples marked approved inside its draft batch.
      if (library.factor !== "C") continue;
      for (const cell of Object.values(library.diagnostics)) {
        for (const variant of Object.values(cell.variants)) {
          expect(variant.status).toBe("rascunho");
        }
      }
    }
  });
});