/**
 * Technical report presentation only: applied to already-selected text at render time.
 * It never changes scores, selections or the shared engine text.
 */
const FACTOR_BY_NAME: Record<string, { name: string; code: string }> = {
  dominância: { name: "Dominância", code: "D" },
  influência: { name: "Influência", code: "I" },
  estabilidade: { name: "Estabilidade", code: "S" },
  conformidade: { name: "Conformidade", code: "C" },
};
const NAME_BY_CODE: Record<string, string> = { D: "Dominância", I: "Influência", S: "Estabilidade", C: "Conformidade" };

/** Writes every factor as "Nome (X)", with capital initial, once per mention. */
export function standardizeFactors(text: string) {
  return text
    .replace(/(^|[^\p{L}])(dominância|influência|estabilidade|conformidade)(?![\p{L}])(?!\s*\()/giu, (_m, before: string, word: string) => {
      const factor = FACTOR_BY_NAME[word.toLowerCase()];
      return factor ? `${before}${factor.name} (${factor.code})` : `${before}${word}`;
    })
    .replace(/(^|[\s,;:])([DISC])(?=[\s,.;:]|$)/g, (_m, before: string, code: string) => `${before}${NAME_BY_CODE[code]} (${code})`);
}

/** First name shown in place of the generic subject; empty when no usable name exists. */
export function firstNameOf(fullName: string | null | undefined) {
  const first = (fullName ?? "").trim().split(/\s+/)[0] ?? "";
  return /\p{L}{2,}/u.test(first) ? first : "";
}

const SUBJECT = /^A pessoa(?: avaliada)?\s+/;

/**
 * Replaces "a pessoa" by the first name. A sentence that repeats the subject of the previous
 * sentence starts directly with the verb, so the name is not repeated in consecutive sentences.
 */
export function personalize(text: string, firstName: string) {
  if (!firstName) return text;
  let previousAboutPerson = false;
  return text.split(/(?<=[.!?])\s+/).map((sentence) => {
    let result = sentence;
    const startsWithPerson = SUBJECT.test(result);
    if (startsWithPerson) {
      const rest = result.replace(SUBJECT, "");
      const canOmit = previousAboutPerson && !/^(se|lhe|não|a|o)\s/i.test(rest);
      result = canOmit ? rest.charAt(0).toUpperCase() + rest.slice(1) : `${firstName} ${rest}`;
    }
    const p = "pessoa(?: avaliada)?(?![\\p{L}])";
    result = result
      .replace(new RegExp(`(?<![\\p{L}])à ${p}`, "gu"), `a ${firstName}`)
      .replace(new RegExp(`(?<![\\p{L}])da ${p}`, "gu"), `de ${firstName}`)
      .replace(new RegExp(`(?<![\\p{L}])na ${p}`, "gu"), `em ${firstName}`)
      .replace(new RegExp(`(?<![\\p{L}])pela ${p}`, "gu"), `por ${firstName}`)
      .replace(new RegExp(`(?<![\\p{L}])[Aa] ${p}`, "gu"), firstName);
    previousAboutPerson = startsWithPerson;
    return result;
  }).join(" ");
}

export function technicalVoice(text: string, firstName: string) {
  return personalize(standardizeFactors(text), firstName);
}
