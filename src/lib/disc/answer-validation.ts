import type { Dimension, Instrument } from "./instrument";
import type { Answer } from "./scoring";

const DIMENSIONS: Dimension[] = ["D", "I", "S", "C"];

export type AnswerValidation =
  | { ok: true }
  | { ok: false; message: string };

export function validateAssessmentAnswers(
  answers: Answer[],
  instrument: Instrument,
): AnswerValidation {
  if (answers.length !== instrument.items.length) {
    return {
      ok: false,
      message: `A avaliação precisa conter exatamente ${instrument.items.length} blocos respondidos.`,
    };
  }

  const expectedIds = instrument.items.map((item) => item.id);
  const expectedIdSet = new Set(expectedIds);
  const receivedIds = answers.map((answer) => answer.itemId);
  const receivedIdSet = new Set(receivedIds);

  if (receivedIdSet.size !== receivedIds.length) {
    return { ok: false, message: "A avaliação contém blocos duplicados." };
  }

  if (
    receivedIdSet.size !== expectedIdSet.size ||
    expectedIds.some((id) => !receivedIdSet.has(id))
  ) {
    return { ok: false, message: "A avaliação está incompleta ou contém blocos inválidos." };
  }

  for (const answer of answers) {
    if (
      !DIMENSIONS.includes(answer.most) ||
      !DIMENSIONS.includes(answer.least) ||
      answer.most === answer.least
    ) {
      return {
        ok: false,
        message: "Cada bloco precisa ter escolhas MAIS e MENOS diferentes e válidas.",
      };
    }

    const item = instrument.items.find((candidate) => candidate.id === answer.itemId);
    if (!item) {
      return { ok: false, message: "Uma ou mais respostas não pertencem ao instrumento." };
    }

    const allowedDimensions = new Set(item.options.map((option) => option.dimension));
    if (!allowedDimensions.has(answer.most) || !allowedDimensions.has(answer.least)) {
      return {
        ok: false,
        message: "Uma ou mais respostas não correspondem às alternativas do instrumento.",
      };
    }
  }

  return { ok: true };
}
