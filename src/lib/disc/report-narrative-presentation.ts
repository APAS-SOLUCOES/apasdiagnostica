import { getAdaptiveNarrative } from "./adaptive-content";
import type { CombinationNarrative } from "./report-content";
import type { ScoreResult } from "./scoring";
import { PREMIUM_NARRATIVE_REPLACEMENTS } from "./premium-narrative-text";
import { TECHNICAL_NARRATIVE_REPLACEMENTS } from "./technical-narrative-text";
import premiumEditorial from "./premium-editorial-replacements.json";
import technicalEditorial from "./technical-editorial-replacements.json";
import premiumAdaptive from "./premium-adaptive-wording.json";
import technicalAdaptive from "./technical-adaptive-wording.json";

/** Literal wording only, applied after the engine has made every adaptive selection. */
function editorialText(value: string, pairs: string[][]) {
  const wording = new Map<string, string>();
  for (const pair of pairs) {
    const [before, after] = pair;
    if (before !== undefined && after !== undefined) wording.set(before, after);
  }
  const pattern = [...wording.keys()].sort((a, b) => b.length - a.length)
    .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return value.replace(new RegExp(pattern, "g"), (phrase) => wording.get(phrase) ?? phrase);
}

/** Only replaces wording in the already-selected narrative; no score or selection is changed. */
function presentNarrative(
  narrative: CombinationNarrative,
  replacements: ReadonlyArray<readonly [string, string]>,
  editorial: string[][],
  adaptiveWording: string[][],
): CombinationNarrative {
  const numericText = (value: string) => replacements.reduce(
    (result, [pattern, replacement]) => result.replace(new RegExp(pattern, "g"), replacement),
    editorialText(value, editorial),
  );
  const text = (value: string) => adaptiveWording.reduce((result, pair) => {
    const [pattern, replacement] = pair;
    return pattern === undefined || replacement === undefined ? result : result.replace(new RegExp(pattern, "g"), replacement);
  }, numericText(value));
  return {
    ...narrative,
    essence: text(narrative.essence),
    best: narrative.best.map(text),
    excess: narrative.excess.map(text),
    perceived: text(narrative.perceived),
    communication: text(narrative.communication),
    decision: text(narrative.decision),
    leadership: text(narrative.leadership),
    team: text(narrative.team),
    pressure: text(narrative.pressure),
    change: text(narrative.change),
    experiments: narrative.experiments.map(text),
    ...(narrative.profilePortrait === undefined ? {} : { profilePortrait: text(narrative.profilePortrait) }),
    ...(narrative.situations === undefined ? {} : { situations: {
      work: text(narrative.situations.work),
      relationships: text(narrative.situations.relationships),
      decisions: text(narrative.situations.decisions),
      leadership: text(narrative.situations.leadership),
    } }),
  };
}

export function getPremiumReportNarrative(scores: ScoreResult) {
  return presentNarrative(getAdaptiveNarrative(scores), PREMIUM_NARRATIVE_REPLACEMENTS, premiumEditorial, premiumAdaptive);
}

export function getTechnicalReportNarrative(scores: ScoreResult) {
  return presentNarrative(getAdaptiveNarrative(scores), TECHNICAL_NARRATIVE_REPLACEMENTS, technicalEditorial, technicalAdaptive);
}