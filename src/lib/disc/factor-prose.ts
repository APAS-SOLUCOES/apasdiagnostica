/**
 * Report presentation only: writes DISC factors by their full name inside sentences.
 * Applied to already-selected text; it never changes scores, selections or chart labels.
 */
const NAME_BY_CODE: Record<string, string> = { D: "Dominância", I: "Influência", S: "Estabilidade", C: "Conformidade" };
const NAMES = "Dominância|Influência|Estabilidade|Conformidade";
const CODE = "([DISC])(?![\\p{L}\\d)])";
const BEFORE = "(?<![\\p{L}\\d(])";

const name = (code: string) => NAME_BY_CODE[code] ?? code;
const capital = (word: string) => {
  const found = Object.values(NAME_BY_CODE).find((n) => n.toLowerCase() === word.toLowerCase());
  return found ?? word;
};

/** Feminine contractions used before a factor name (all four names are feminine). */
const CONTRACTION: Record<string, string> = { em: "na", Em: "Na", de: "da", De: "Da", a: "à", por: "pela", Por: "Pela", com: "com a", Com: "Com a" };

export function writeFactorNames(text: string) {
  return text
    // Same sentence naming the factors twice: keep one mention of each.
    .replace(
      new RegExp(`Na relação entre ${CODE} e ${CODE}, experimente (\\p{L}+) onde você costuma começar por (\\p{L}+)\\.`, "gu"),
      (_m, _a: string, _b: string, next: string, first: string) =>
        `Experimente a ${capital(next)} nas situações em que você costuma começar pela ${capital(first)}.`,
    )
    .replace(/Seu repertório combina (\p{L}+) de maneira (.+?) e (\p{L}+) como apoio\./gu,
      (_m, first: string, how: string, second: string) => `Seu repertório combina ${capital(first)} de maneira ${how} e ${capital(second)} como apoio.`)
    // "entre C e D" -> "entre Conformidade e Dominância"
    .replace(new RegExp(`${BEFORE}(entre|Entre) ${CODE} e ${CODE}`, "gu"), (_m, word: string, a: string, b: string) => `${word} ${name(a)} e ${name(b)}`)
    // "recurso C" -> "recurso de Conformidade"
    .replace(new RegExp(`${BEFORE}(recurso) ${CODE}`, "gu"), (_m, word: string, code: string) => `${word} de ${name(code)}`)
    // "em C" -> "na Conformidade", "de D" -> "da Dominância", "a S" -> "à Estabilidade"
    .replace(new RegExp(`${BEFORE}(em|Em|de|De|a|por|Por|com|Com) ${CODE}`, "gu"), (_m, word: string, code: string) => `${CONTRACTION[word] ?? word} ${name(code)}`)
    // Crase before an already written name after verbs that require "a".
    .replace(new RegExp(`${BEFORE}(espaço|recorre|recorrer|recorra|recorra também) a (${NAMES})(?![\\p{L}])`, "gu"), "$1 à $2")
    // Any remaining lone letter takes the article: at the start of a sentence "A", otherwise "a".
    .replace(new RegExp(`(^|[.!?]\\s+)${CODE}`, "gu"), (_m, start: string, code: string) => `${start}A ${name(code)}`)
    .replace(new RegExp(`${BEFORE}${CODE}`, "gu"), (_m, code: string) => `a ${name(code)}`);
}
