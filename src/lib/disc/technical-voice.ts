/**
 * Technical report presentation only: applied to already-selected text at render time.
 * It never changes scores, selections or the shared engine text.
 */
import { writeFactorNames } from "./factor-prose";

const FACTOR_BY_NAME: Record<string, { name: string; code: string }> = {
  dominância: { name: "Dominância", code: "D" },
  influência: { name: "Influência", code: "I" },
  estabilidade: { name: "Estabilidade", code: "S" },
  conformidade: { name: "Conformidade", code: "C" },
};
const NAME_BY_CODE: Record<string, string> = { D: "Dominância", I: "Influência", S: "Estabilidade", C: "Conformidade" };

/** Writes every factor as "Nome (X)", with capital initial, once per mention. */
export function standardizeFactors(text: string) {
  return writeFactorNames(text)
    .replace(/(^|[^\p{L}])(dominância|influência|estabilidade|conformidade)(?![\p{L}])(?!\s*\()/giu, (_m, before: string, word: string) => {
      const factor = FACTOR_BY_NAME[word.toLowerCase()];
      return factor ? `${before}${factor.name} (${factor.code})` : `${before}${word}`;
    })
    .replace(/(^|[\s,;:])([DISC])(?=[\s,.;:]|$)/g, (_m, before: string, code: string) => `${before}${NAME_BY_CODE[code]} (${code})`);
}

/** First name shown in place of the generic subject; empty when no usable name exists. */
export function firstNameOf(fullName: string | null | undefined) {
  const first = (fullName ?? "").trim().split(/\s+/)[0] ?? "";
  return /\p{L}{2,}/u.test(first) ? first.toLocaleLowerCase("pt-BR").replace(/(^|[-'])\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR")) : "";
}

export type TechnicalSubjectContext = { mentioned: boolean };

/** One name mention per local section; later references use subject omission or neutral wording. */
export function personalize(text: string, firstName: string, context: TechnicalSubjectContext = { mentioned: false }) {
  if (!firstName) return text;
  return text.split(/(?<=[.!?])\s+/).map((sentence) => {
    const result = sentence.replace(/\ba a pessoa\b/gu, "à pessoa").replace(
      /(?<![\p{L}])(?:[Aa] pessoa(?: avaliada)?|à pessoa(?: avaliada)?|da pessoa(?: avaliada)?|na pessoa(?: avaliada)?|pela pessoa(?: avaliada)?)(?![\p{L}])(?!\s+(?:mais|menos)\s)/gu,
      (reference, offset: number, source: string) => {
        if (!context.mentioned) {
          context.mentioned = true;
          if (reference.startsWith("da ")) return `de ${firstName}`;
          if (reference.startsWith("na ")) return `em ${firstName}`;
          if (reference.startsWith("pela ")) return `por ${firstName}`;
          if (reference.startsWith("à ")) return `a ${firstName}`;
          return firstName;
        }
        if (reference.startsWith("da ")) return "";
        if (reference.startsWith("na ")) return "nesse perfil";
        if (reference.startsWith("pela ")) return "pela atuação individual";
        if (reference.startsWith("à ")) return "a quem respondeu";
        const before = source.slice(0, offset);
        if (!before.trim() || /(?:,\s*|\bque\s+)$/.test(before)) return "";
        return "quem respondeu";
      },
    ).replace(/\s{2,}/g, " ").replace(/\s+([,.])/g, "$1").trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
  }).join(" ");
}

export function technicalVoice(text: string, firstName: string, context?: TechnicalSubjectContext) {
  return personalize(standardizeFactors(text), firstName, context);
}
