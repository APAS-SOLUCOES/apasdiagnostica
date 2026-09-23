import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import "./disc-report-visual.css";
import type { ScoreResult } from "@/lib/disc/scoring";
import { buildDiscReportContent } from "@/lib/disc/interpretation";

type ReportAssessment = {
  id: string;
  candidate_name: string;
  role_title?: string | null;
  instrument_version?: string | null;
  submitted_at?: string | null;
  organizations?: { name?: string | null } | null;
};

const pageTitles = ["Capa","Antes de olhar o resultado","Seu perfil em números","Seu jeito de agir","Seus pontos fortes","O que pode exigir mais atenção","Como você pode ser percebido","Comunicação","Decisão","Relacionamentos e equipe","Seu desenvolvimento","Seu perfil não é um destino"];
const pct = (v: number) => Number(v).toFixed(1).replace(".", ",") + "%";

function Bullets({ items }: { items: string[] }) {
  return <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
}

export function DiscPremiumReport({ assessment, scores }: { assessment: ReportAssessment; scores: ScoreResult }) {
  const [page, setPage] = useState(1);
  const content = useMemo(() => buildDiscReportContent(scores), [scores]);
  const submitted = assessment.submitted_at ? new Date(assessment.submitted_at).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR");

  const styleFor = (n: number): CSSProperties => ({
    "--sprite-x": ((n - 1) % 4) * 100 + "%",
    "--sprite-y": Math.floor((n - 1) / 4) * 100 + "%",
  } as CSSProperties);

  const DynamicContent = ({ n }: { n: number }) => {
    if (n === 1) return <><div className="disc-dynamic-cover-name">{assessment.candidate_name}</div><div className="disc-dynamic-cover-date">{submitted}</div></>;

    const pageBody: Record<number, ReactNode> = {
      2: <><h2>Antes de olhar o resultado</h2><p>{content.overview}</p><p>{content.conclusion}</p></>,
      3: <><h2>{content.profileName}</h2><div className="disc-profile-grid">{(["D","I","S","C"] as const).map(d => <div key={d}><b>{d}</b><span>{pct(scores.adapted.percent[d])}</span></div>)}</div><p>{content.intensitySummary}</p><p>{content.profileBalance}</p><div className="disc-profile-modes"><small>Natural: {(["D","I","S","C"] as const).map(d => d + " " + pct(scores.natural.percent[d])).join(" · ")}</small><small>Social: {(["D","I","S","C"] as const).map(d => d + " " + pct(scores.social.percent[d])).join(" · ")}</small><small>Adaptado: {(["D","I","S","C"] as const).map(d => d + " " + pct(scores.adapted.percent[d])).join(" · ")}</small></div></>,
      4: <><h2>{content.profileName}</h2><p>{content.headline}</p><p>{content.profileLabel}</p><p>{content.factorReadings[scores.predominant]}</p><p>{content.factorReadings[scores.secondary]}</p></>,
      5: <><h2>Seus pontos fortes</h2><Bullets items={content.strengths} /></>,
      6: <><h2>O que pode exigir mais atenção</h2><Bullets items={content.attention} /></>,
      7: <><h2>Como você pode ser percebido</h2><p>{content.perception}</p><p>{content.secondaryInfluence}</p><p>{content.lowerFactors}</p></>,
      8: <><h2>Comunicação</h2><p>{content.communication}</p></>,
      9: <><h2>Decisão</h2><p>{content.decision}</p></>,
      10: <><h2>Relacionamentos e equipe</h2><p>{content.teamwork}</p><p>{content.pressureChange}</p></>,
      11: <><h2>Seu desenvolvimento</h2><Bullets items={content.development} /><p>{content.secondaryInfluence}</p></>,
      12: <><h2>Seu perfil não é um destino</h2><p>{content.adaptation}</p><p>{content.conclusion}</p><small>Instrumento de tendências comportamentais. Não constitui diagnóstico clínico, psicológico ou de personalidade.</small></>,
    };
    return <div className="disc-dynamic-content">{pageBody[n]}</div>;
  };

  return <section className="disc-visual-report" aria-label={"Relatório DISC de " + assessment.candidate_name}>
    <div className="disc-visual-toolbar print:hidden">
      <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Anterior</button>
      <select value={page} onChange={(e) => setPage(Number(e.target.value))} aria-label="Selecionar página">
        {pageTitles.map((title, i) => <option value={i + 1} key={title}>{String(i + 1).padStart(2, "0")} · {title}</option>)}
      </select>
      <button onClick={() => setPage(Math.min(12, page + 1))} disabled={page === 12}>Próxima</button>
      <button className="print" onClick={() => window.print()}>Imprimir / PDF</button>
    </div>
    <div className="disc-visual-stage"><article className="disc-visual-page"><div className="disc-visual-sprite" style={styleFor(page)} aria-hidden="true" /><DynamicContent n={page} /></article></div>
    <nav className="disc-visual-thumbnails print:hidden" aria-label="Miniaturas das páginas">
      {pageTitles.map((title, i) => <button key={title} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}><span>{String(i + 1).padStart(2, "0")}</span><small>{title}</small></button>)}
    </nav>
    <div className="disc-print-pages">{Array.from({ length: 12 }, (_, i) => i + 1).map(n => <article className="disc-visual-page disc-print-page" key={n}><div className="disc-visual-sprite" style={styleFor(n)} aria-hidden="true" /><DynamicContent n={n} /></article>)}</div>
  </section>;
}
