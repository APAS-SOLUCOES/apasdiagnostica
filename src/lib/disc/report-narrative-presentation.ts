import { getAdaptiveNarrative } from "./adaptive-content";
import type { CombinationNarrative } from "./report-content";
import type { ScoreResult } from "./scoring";
import { PREMIUM_NARRATIVE_REPLACEMENTS } from "./premium-narrative-text";
import { TECHNICAL_NARRATIVE_REPLACEMENTS } from "./technical-narrative-text";

/** Only replaces wording in the already-selected narrative; no score or selection is changed. */
function presentNarrative(
  narrative: CombinationNarrative,
  replacements: ReadonlyArray<readonly [string, string]>,
): CombinationNarrative {
  const text = (value: string) => replacements.reduce(
    (result, [pattern, replacement]) => result.replace(new RegExp(pattern, "g"), replacement),
    value,
  );
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
  return presentNarrative(getAdaptiveNarrative(scores), PREMIUM_NARRATIVE_REPLACEMENTS);
}

export function getTechnicalReportNarrative(scores: ScoreResult) {
  return presentNarrative(getAdaptiveNarrative(scores), TECHNICAL_NARRATIVE_REPLACEMENTS);
}