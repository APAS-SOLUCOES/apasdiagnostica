import { describe, expect, it } from "vitest";
import { DEFAULT_INSTRUMENT, type Dimension } from "./instrument";
import type { Answer } from "./scoring";
import { validateAssessmentAnswers } from "./answer-validation";

const makeAnswers = (): Answer[] =>
  DEFAULT_INSTRUMENT.items.map((item, index) => {
    const most: Dimension[] = ["D", "I", "S", "C"];
    const least: Dimension[] = ["C", "S", "D", "I"];
    return { itemId: item.id, most: most[index % 4], least: least[index % 4] };
  });

describe("validação íntegra das respostas APAS DISC", () => {
  it("aceita exatamente os 24 blocos, uma vez cada", () => {
    expect(validateAssessmentAnswers(makeAnswers(), DEFAULT_INSTRUMENT)).toEqual({ ok: true });
  });

  it("rejeita avaliação incompleta", () => {
    const answers = makeAnswers().slice(0, 23);
    expect(validateAssessmentAnswers(answers, DEFAULT_INSTRUMENT)).toMatchObject({ ok: false });
  });

  it("rejeita item duplicado mesmo com a mesma quantidade total", () => {
    const answers = makeAnswers();
    answers[23] = { ...answers[0], itemId: answers[1].itemId };
    expect(validateAssessmentAnswers(answers, DEFAULT_INSTRUMENT)).toMatchObject({ ok: false });
  });

  it("rejeita MAIS igual a MENOS", () => {
    const answers = makeAnswers();
    answers[0] = { ...answers[0], most: "D", least: "D" };
    expect(validateAssessmentAnswers(answers, DEFAULT_INSTRUMENT)).toMatchObject({ ok: false });
  });

  it("rejeita fator que não pertence às alternativas do instrumento", () => {
    const answers = makeAnswers();
    const malformed = {
      ...DEFAULT_INSTRUMENT,
      items: DEFAULT_INSTRUMENT.items.map((item, index) =>
        index === 0
          ? { ...item, options: item.options.filter((option) => option.dimension !== "D") }
          : item,
      ),
    };
    expect(validateAssessmentAnswers(answers, malformed)).toMatchObject({ ok: false });
  });

  it("rejeita item desconhecido", () => {
    const answers = makeAnswers();
    answers[0] = { ...answers[0], itemId: "b99" };
    expect(validateAssessmentAnswers(answers, DEFAULT_INSTRUMENT)).toMatchObject({ ok: false });
  });
});
