import { describe, expect, it } from "vitest";
import premium from "./modular/drafts/C/C-premium-v3-v4.json";
import technical from "./modular/drafts/C/C-technical-v3-v4.json";
import { MODULAR_NARRATIVE_ENABLED } from "./modular-library";

const validCells = [
  "1-4", "1-5", "1-6", "1-7", "1-8",
  "2-1", "2-2", "2-3", "2-4", "2-5", "2-6", "2-7", "2-8",
  "3-1", "3-2", "3-3", "3-4", "3-5", "3-6",
  "4-1", "4-2", "4-3", "4-4",
];

describe("Conformidade — lote editorial não ativado", () => {
  it("preserva as 23 células válidas em cada biblioteca", () => {
    for (const library of [premium, technical]) {
      expect(Object.keys(library.diagnostics)).toEqual(validCells);
      for (const [key, cell] of Object.entries(library.diagnostics)) {
        expect(`${cell.position}-${cell.level}`).toBe(key);
      }
    }
  });

  it("escreve apenas as variações 3 e 4: 46 por relatório, 92 ao todo", () => {
    let total = 0;
    for (const library of [premium, technical]) {
      let count = 0;
      for (const cell of Object.values(library.diagnostics)) {
        expect(Object.keys(cell.variants)).toEqual(["3", "4"]);
        count += Object.keys(cell.variants).length;
      }
      expect(count).toBe(46);
      total += count;
    }
    expect(total).toBe(92);
  });

  it("mantém o lote como rascunho e a chave de transição desligada", () => {
    expect(MODULAR_NARRATIVE_ENABLED).toBe(false);
    for (const library of [premium, technical]) {
      expect(library.status).toBe("rascunho");
      for (const cell of Object.values(library.diagnostics)) {
        for (const variant of Object.values(cell.variants)) {
          expect(variant.status).toBe("rascunho");
        }
      }
    }
  });
});