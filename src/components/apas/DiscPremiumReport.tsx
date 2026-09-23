import { useState } from "react";
import "./disc-report-visual.css";
import type { ScoreResult } from "@/lib/disc/scoring";

type ReportAssessment = {
  id: string;
  candidate_name: string;
  role_title?: string | null;
  instrument_version?: string | null;
  submitted_at?: string | null;
  organizations?: { name?: string | null } | null;
};

const pageTitles = [
  "Capa",
  "Antes de olhar o resultado",
  "Seu perfil em números",
  "Seu jeito de agir",
  "Seus pontos fortes",
  "O que pode exigir mais atenção",
  "Como você pode ser percebido",
  "Comunicação",
  "Decisão",
  "Relacionamentos e equipe",
  "Seu desenvolvimento",
  "Seu perfil não é um destino",
];

const pct = (v: number) => `${Number(v).toFixed(1).replace(".", ",")}%`;

export function DiscPremiumReport({
  assessment,
  scores,
}: {
  assessment: ReportAssessment;
  scores: ScoreResult;
}) {
  const [page, setPage] = useState(1);
  const submitted = assessment.submitted_at
    ? new Date(assessment.submitted_at).toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");

  const imageStyle = {
    "--sprite-x": `${((page - 1) % 4) * 100}%`,
    "--sprite-y": `${Math.floor((page - 1) / 4) * 100}%`,
  } as React.CSSProperties;

  return (
    <section className="disc-visual-report" aria-label={`Relatório DISC de ${assessment.candidate_name}`}>
      <div className="disc-visual-toolbar print:hidden">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Anterior</button>
        <select value={page} onChange={(e) => setPage(Number(e.target.value))} aria-label="Selecionar página">
          {pageTitles.map((title, i) => (
            <option value={i + 1} key={title}>{String(i + 1).padStart(2, "0")} · {title}</option>
          ))}
        </select>
        <button onClick={() => setPage(Math.min(12, page + 1))} disabled={page === 12}>Próxima</button>
        <button className="print" onClick={() => window.print()}>Imprimir / PDF</button>
      </div>

      <div className="disc-visual-stage">
        <article className="disc-visual-page">
          <div className="disc-visual-sprite" style={imageStyle} aria-hidden="true" />
          {page === 1 && (
            <>
              <div className="disc-dynamic-cover-name">{assessment.candidate_name}</div>
              <div className="disc-dynamic-cover-date">{submitted}</div>
            </>
          )}
          {page === 3 && (
            <div className="disc-dynamic-profile" aria-label="Dados dinâmicos do perfil">
              <strong>{assessment.candidate_name}</strong>
              <span>{scores.predominant}{scores.secondary}</span>
              <div>
                <b>D</b> {pct(scores.adapted.percent.D)}
                <b>I</b> {pct(scores.adapted.percent.I)}
                <b>S</b> {pct(scores.adapted.percent.S)}
                <b>C</b> {pct(scores.adapted.percent.C)}
              </div>
            </div>
          )}
          {page === 4 && (
            <div className="disc-dynamic-combination">
              <strong>{scores.combination}</strong>
            </div>
          )}
        </article>
      </div>

      <nav className="disc-visual-thumbnails print:hidden" aria-label="Miniaturas das páginas">
        {pageTitles.map((title, i) => (
          <button key={title} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <small>{title}</small>
          </button>
        ))}
      </nav>

      <div className="disc-print-pages">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((printPage) => (
          <article className="disc-visual-page disc-print-page" key={printPage}>
            <div
              className="disc-visual-sprite"
              style={{
                "--sprite-x": `${((printPage - 1) % 4) * 100}%`,
                "--sprite-y": `${Math.floor((printPage - 1) / 4) * 100}%`,
              } as React.CSSProperties}
            />
            {printPage === 1 && <div className="disc-dynamic-cover-name">{assessment.candidate_name}</div>}
            {printPage === 1 && <div className="disc-dynamic-cover-date">{submitted}</div>}
            {printPage === 3 && (
              <div className="disc-dynamic-profile">
                <strong>{assessment.candidate_name}</strong>
                <span>{scores.predominant}{scores.secondary}</span>
                <div>
                  <b>D</b> {pct(scores.adapted.percent.D)}
                  <b>I</b> {pct(scores.adapted.percent.I)}
                  <b>S</b> {pct(scores.adapted.percent.S)}
                  <b>C</b> {pct(scores.adapted.percent.C)}
                </div>
              </div>
            )}
            {printPage === 4 && <div className="disc-dynamic-combination"><strong>{scores.combination}</strong></div>}
          </article>
        ))}
      </div>
    </section>
  );
}
