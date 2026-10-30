import { renderToStaticMarkup } from "react-dom/server";
import { DiscTechnicalReport } from "@/components/apas/DiscTechnicalReport";
import { DIMENSIONS } from "@/lib/disc/instrument";
import type { ScoreResult } from "@/lib/disc/scoring";
import { writeFileSync } from "node:fs";

type D = "D" | "I" | "S" | "C";
function vec(p: Record<D, number>) { return { percent: p, raw: p, order: [...DIMENSIONS].sort((a, b) => p[b] - p[a]) }; }
export function make(pr: D, se: D, pv: number, gap: number, idx: number, naturalSwap = false): ScoreResult {
  const others = DIMENSIONS.filter((d) => d !== pr && d !== se) as D[];
  const sv = pv - gap; const rest = (100 - pv - sv) / 2;
  const adapted = { [pr]: pv, [se]: sv, [others[0]!]: rest + 1, [others[1]!]: rest - 1 } as Record<D, number>;
  const natural = naturalSwap ? { [pr]: pv, [se]: rest - 2, [others[0]!]: sv + 2, [others[1]!]: rest } as Record<D, number> : { ...adapted };
  return { scoringVersion: "apas-scoring-1.2.0", answeredItems: 24, totalItems: 24, natural: vec(natural), social: vec(adapted), adapted: vec(adapted),
    predominant: pr, secondary: se, combination: pr + se, levels: { D: "moderado", I: "moderado", S: "moderado", C: "moderado" },
    adaptationIndex: idx, adaptationAlert: idx >= 18, primaryGap: gap, closeCombination: gap <= 3, completionPercent: 100, invalidAnswerCount: 0 } as ScoreResult;
}
const strip = (h: string) => h.replace(/<\/(p|div|h1|h2|h3|strong|section|header|footer)>/g, "\n").replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\n{2,}/g, "\n");
const out: string[] = [];
const variants: Array<[number, number, number, boolean]> = [[29, 2, 8, false], [36, 6, 22, true], [44, 12, 12, false]];
for (const p of DIMENSIONS) for (const s of DIMENSIONS) if (p !== s) for (const [pv, gap, idx, swap] of variants) {
  const html = renderToStaticMarkup(<DiscTechnicalReport assessment={{ id: "x", candidate_name: "Ana Paula Souza", status: "completed", created_at: "2026-10-05T12:00:00Z" }} scores={make(p as D, s as D, pv, gap, idx, swap)} />);
  out.push(`##### ${p}${s} pv=${pv} gap=${gap} idx=${idx}\n` + strip(html));
}
writeFileSync(process.argv[2] ?? "/tmp/tech-dump.txt", out.join("\n"));
console.log("ok", out.length);
