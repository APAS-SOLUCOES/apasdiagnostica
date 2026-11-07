<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep technical DISC typography scoped to `.tech-approved-report`, with a shared multiplier for existing titles and centralized absolute pt tokens for print reading sizes, so PDF targets remain independent of screen/root units and other reports.

- Keep the active Premium renderer and its route-local editorial data adapter sourced from the same approved revision; this preserves editorial consistency without changing scoring or Technical reports.

- Apply report-local literal editorial replacements only after the existing adaptive narrative selection; separate text-only factor and phrase dictionaries isolate Premium and Technical, preserve dynamic intensity/gap/adaptation wording and retain every shared source, score and selection rule.
- Premium's perception section rewords only the already-selected distance phrase locally, so each section retains its purpose without changing adaptive selection; Technical renders existing experiments as semantic list items without CSS changes.
- Technical DISC wording is personalized at render time by `technical-voice.ts` (properly capitalized first name at most once per page-section, explicit render-local subject context, neutral omission, "Nome (X)" factor labels) plus per-report sentence de-duplication in `DiscTechnicalReport.tsx`, so every generated report gets it without editing shared engine text; hedge-free phrasing lives in the technical JSON sources, and chained adaptive-wording intermediates (entries 1 and 2) must stay byte-identical because later patterns match them literally.
- Factor letters inside report sentences are expanded to full names by `src/lib/disc/factor-prose.ts`, run last in `presentNarrative` and inside Technical `standardizeFactors`, so every adaptive phrase is fixed without touching the engine or the chained wording intermediates; charts, labels and short codes never pass through it.
- Data-driven DISC wording derives read-only signals in `src/lib/disc/profile-signals.ts` (8 intensity levels, gaps, blind spot, plane shifts, adaptation bands, leader change) and picks wording via `text-variant.ts` hashed by assessment id, so text varies with real percentages without touching scoring and stays stable per assessment.
