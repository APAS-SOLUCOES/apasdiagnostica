import { renderToStaticMarkup } from "react-dom/server";
import { DiscTechnicalReport } from "@/components/apas/DiscTechnicalReport";
import { DIMENSIONS } from "@/lib/disc/instrument";
import { writeFileSync } from "node:fs";
import { make } from "./dump";
const out: Record<string, string> = {};
for (const p of DIMENSIONS) for (const s of DIMENSIONS) if (p !== s) for (const [pv, gap, idx, swap] of [[36, 6, 22, true], [29, 2, 8, false]] as const) {
  out[`${p}${s}-${pv}`] = renderToStaticMarkup(<DiscTechnicalReport assessment={{ id: "x", candidate_name: "Maximiliana Albuquerque", status: "completed", created_at: "2026-10-05T12:00:00Z", organizations: { name: "Empresa Demonstração" } }} scores={make(p as any, s as any, pv, gap, idx, swap)} />);
}
writeFileSync("/tmp/browser/tech/variants.json", JSON.stringify(out));
console.log(Object.keys(out).length);
