import type { CSSProperties } from "react";
import { BarChart3, Leaf, Settings, Users } from "lucide-react";
import coverArt from "@/assets/disc-editorial-cover.jpg";
import "@/disc-premium-report.css";
import type { ScoreResult } from "@/lib/disc/scoring";

type AssessmentLike = {
  candidate_name: string;
  role_title?: string | null;
  created_at: string;
  submitted_at?: string | null;
};

type Props = {
  assessment: AssessmentLike;
  scores: ScoreResult;
};

const FACTORS = [
  { key: "D", name: "Dominância", icon: BarChart3, color: "#ff1720" },
  { key: "I", name: "Influência", icon: Users, color: "#ff9d00" },
  { key: "S", name: "Estabilidade", icon: Leaf, color: "#32d66d" },
  { key: "C", name: "Conformidade", icon: Settings, color: "#12cfe8" },
] as const;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function DiscPremiumReport({ assessment, scores }: Props) {
  const reportDate = formatDate(assessment.submitted_at ?? assessment.created_at);
  const role = assessment.role_title?.trim() || "Professor";

  return (
    <section className="disc-premium-report" aria-label="Relatório individual APAS DISC">
      <article className="disc-page disc-page-cover" data-page="1">
        <div className="disc-cover-background" style={{ "--cover-art": `url("${coverArt}")` } as CSSProperties} aria-hidden="true" />
        <div className="disc-cover-shade" aria-hidden="true" />
        <div className="disc-cover-geometry" aria-hidden="true" />

        <header className="disc-cover-header">
          <img src="/apas-logo-light.webp" alt="APAS Soluções" className="disc-cover-logo" />
          <div className="disc-cover-header-title">
            APAS DISC · RELATÓRIO DE PERFIL COMPORTAMENTAL
            <span />
          </div>
        </header>

        <main className="disc-cover-main">
          <p className="disc-cover-eyebrow">RELATÓRIO DE PERFIL COMPORTAMENTAL</p>
          <h1>{assessment.candidate_name}</h1>
          <p className="disc-cover-subtitle">
            Mais consciência. Melhores escolhas.<br />Grandes resultados.
          </p>
          <div className="disc-cover-wordmark" aria-hidden="true">DISC</div>
        </main>

        <div className="disc-cover-factors">
          {FACTORS.map(({ key, name, icon: Icon, color }) => (
            <div key={key} className="disc-factor-card" style={{ "--factor-color": color } as CSSProperties}>
              <strong>{key}</strong>
              <span />
              <em>{name}</em>
              <Icon aria-hidden="true" />
            </div>
          ))}
        </div>

        <footer className="disc-cover-footer">
          <div>
            <span>Relatório individual</span>
            <strong>{role}</strong>
          </div>
          <div className="disc-cover-footer-right">
            <img src="/apas-logo-light.webp" alt="" aria-hidden="true" />
            <span>{reportDate}</span>
          </div>
        </footer>
      </article>

      <div className="disc-report-pending-pages print:hidden">
        <span>As páginas 2–12 serão inseridas após a validação visual desta primeira página.</span>
      </div>
    </section>
  );
}
