import { CalendarDays, CheckCircle2, Target, Users, MessageCircle, Compass, BarChart3 } from "lucide-react";
import type { ReactNode } from "react";
import type { ScoreResult } from "@/lib/disc/scoring";
import { DIMENSIONS, DIMENSION_NAMES } from "@/lib/disc/instrument";
import DIMENSION_CONTENT from "@/lib/disc/technical-factor-text.json";
import sectionText from "@/lib/disc/technical-section-text.json";
import { COMBINATION_NARRATIVES } from "@/lib/disc/report-content";
import { getTechnicalReportNarrative } from "@/lib/disc/report-narrative-presentation";
import { TECHNICAL_PROFILE_CLOSING } from "@/lib/disc/technical-narrative-text";

const apasLogoDark = "/apas-logo-dark.svg?v=approved-technical";
const apasLogoWhite = "/apas-logo.svg?v=approved-technical";

type TechnicalAssessment = {
  id: string;
  candidate_name: string;
  status: string;
  instrument_version?: string | null;
  created_at: string;
  started_at?: string | null;
  submitted_at?: string | null;
  consent_accepted_at?: string | null;
  organizations?: { name?: string | null } | null;
};

function ApprovedPage({
  number,
  title,
  subtitle,
  children,
  dark = false,
}: {
  number: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <section className={`tech-approved-page ${dark ? "tech-approved-dark" : ""}`} data-page={number}>
      <header className="tech-approved-header">
        <img src={dark ? apasLogoWhite : apasLogoDark} alt="APAS Soluções" />
        <div><span>Relatório Técnico DISC</span><i /></div>
      </header>
      <main>
        <p className="tech-approved-kicker">{String(number).padStart(2, "0")}</p>
        <h1>{title}</h1>
        {subtitle && <h2>{subtitle}</h2>}
        {children}
      </main>
      <footer>
        <span>PESSOAS <b>|</b> ESTRATÉGIAS <b>|</b> RESULTADOS</span>
        <strong>{String(number).padStart(2, "0")}</strong>
      </footer>
    </section>
  );
}

function CoverPage({ assessment }: { assessment: TechnicalAssessment }) {
  const date = new Date(assessment.created_at).toLocaleDateString("pt-BR");
  return (
    <section className="tech-approved-page tech-cover-approved tech-approved-dark" data-page="1">
      <div className="tech-cover-redbar" />
      <main className="tech-cover-main">
        <div className="tech-cover-logo"><img src={apasLogoWhite} alt="APAS Soluções" /></div>
        <h1>RELATÓRIO<br />TÉCNICO DISC</h1>
        <div className="tech-cover-label">ANÁLISE COMPORTAMENTAL</div>
        <div className="tech-cover-person">
          <span>Nome do avaliado</span><strong>{assessment.candidate_name}</strong>
          <span>Data da avaliação</span><strong>{date}</strong>
          <span>Empresa / aplicação</span><strong>{assessment.organizations?.name || "Aplicação individual"}</strong>
        </div>
      </main>
      <div className="tech-cover-bottom">PESSOAS <b>|</b> ESTRATÉGIAS <b>|</b> RESULTADOS</div>
    </section>
  );
}

function FactorCards() {
  const colors: Record<string, string> = { D: "#cf3030", I: "#e97816", S: "#4e9f70", C: "#31939c" };
  return (
    <div className="tech-factor-cards">
      {DIMENSIONS.map((d) => (
        <div key={d} className="tech-factor-card" style={{ borderTopColor: colors[d] }}>
          <strong>{d}</strong>
          <h3>{DIMENSION_NAMES[d]}</h3>
          <p>{DIMENSION_CONTENT[d].summary}</p>
        </div>
      ))}
    </div>
  );
}

function ProfileWheel({ scores }: { scores: ScoreResult }) {
  const colors: Record<string, string> = { D: "#cf3030", I: "#e97816", S: "#4e9f70", C: "#31939c" };
  return (
    <div className="tech-profile-wheel">
      {DIMENSIONS.map((d) => <div key={d} style={{ background: colors[d] }}><strong>{d}</strong></div>)}
      <div className="tech-profile-wheel-center">{scores.predominant}+{scores.secondary}</div>
    </div>
  );
}

function ProfileLabels({ scores }: { scores: ScoreResult }) {
  return (
    <div className="tech-profile-labels">
      <div><b>PREDOMINANTE</b><strong>{scores.predominant} — {DIMENSION_NAMES[scores.predominant]}</strong></div>
      <div><b>SECUNDÁRIO</b><strong>{scores.secondary} — {DIMENSION_NAMES[scores.secondary]}</strong></div>
    </div>
  );
}

function ProfileModeCards() {
  return (
    <div className="tech-mode-cards">
      <div><strong>NATURAL</strong><p>Como a pessoa tende a responder espontaneamente.</p></div>
      <div><strong>SOCIAL</strong><p>Como tende a responder às demandas percebidas do ambiente.</p></div>
      <div><strong>ADAPTADO</strong><p>Como tende a ajustar seu comportamento às exigências atuais.</p></div>
    </div>
  );
}

function Box({ title, children, tone = "dark" }: { title: string; children: ReactNode; tone?: "red" | "dark" | "gray" }) {
  return <div className={`tech-info-box tech-info-box-${tone}`}><strong>{title}</strong><div>{children}</div></div>;
}

export function DiscTechnicalReport({
  assessment,
  scores,
  computedAt,
}: {
  assessment: TechnicalAssessment;
  scores: ScoreResult;
  computedAt?: string | null;
}) {
  const selectedNarrative = COMBINATION_NARRATIVES[scores.combination] ?? COMBINATION_NARRATIVES[`${scores.predominant}${scores.secondary}`];
  if (!selectedNarrative) return null;

  const adaptive = getTechnicalReportNarrative(scores);
  const narrative = adaptive;
  const p = scores.predominant;
  const s = scores.secondary;
  const content = DIMENSION_CONTENT[p];
  const sections = sectionText as Record<string, typeof sectionText.DI>;
  const editorial = sections[scores.combination] ?? sections[`${p}${s}`] ?? sectionText.DI;

  const adaptationText = scores.adaptationAlert
    ? "A distância entre Natural e Adaptado merece investigação contextual. Pode representar flexibilidade diante das demandas ou esforço de adaptação prolongado."
    : "A diferença entre Natural e Adaptado não acionou alerta automático. Observe em quais ambientes a pessoa amplia, reduz ou alterna comportamentos.";

  return (
    <article className="disc-technical-report tech-approved-report" aria-label={`Relatório Técnico DISC de ${assessment.candidate_name}`}>
      <CoverPage assessment={assessment} />

      <ApprovedPage number={2} title="Sumário">
        <div className="tech-summary-approved">
          {[
            "Introdução e Modelo DISC",
            "Perfil Comportamental",
            "Análise do Perfil",
            "Comunicação",
            "Liderança e Gestão",
            "Trabalho em Equipe",
            "Pressão, Mudanças e Desenvolvimento",
            "Conclusão e Aplicação Gerencial",
          ].map((item, i) => (
            <div key={item}><b>{String(i + 1).padStart(2, "0")}</b><span>{item}</span></div>
          ))}
        </div>
      </ApprovedPage>

      <ApprovedPage number={3} title="Introdução" subtitle="Uma leitura comportamental para ampliar a compreensão sobre pessoas e equipes.">
        <FactorCards />
        <Box title="PARA LÍDERES, GESTORES E EMPRESÁRIOS" tone="red">
          A leitura oferece hipóteses para conduzir a pessoa no trabalho. Confronte-as com entregas, competências e contexto antes de decidir sobre responsabilidades ou desenvolvimento.
        </Box>
      </ApprovedPage>

      <ApprovedPage number={4} title="Perfil Comportamental">
        <div className="tech-profile-layout">
          <div className="tech-profile-left">
            <ProfileLabels scores={scores} />
            <ProfileWheel scores={scores} />
          </div>
          <ProfileModeCards />
        </div>
      </ApprovedPage>

      <ApprovedPage number={5} title="Análise do Perfil">
        <div className="tech-analysis-heading">
          <span>{p}</span>
          <div><h3>{DIMENSION_NAMES[p]} — {content.headline}</h3><p>{adaptive.title.split(" · ")[0] ?? adaptive.title}</p></div>
        </div>
        <div className="tech-analysis-grid">
          <Box title="PRINCIPAIS CARACTERÍSTICAS" tone="red">{content.characteristics.slice(0, 4).join(" ")}</Box>
          <Box title="PONTOS FORTES">{narrative.best.slice(0, 3).join(" ")}</Box>
          <Box title="PONTOS DE ATENÇÃO" tone="gray">{content.attention.slice(0, 3).join(" ")}</Box>
          <Box title="LEITURA GERENCIAL" tone="red">{editorial.managementReading}</Box>
        </div>
      </ApprovedPage>

      <ApprovedPage number={6} title="Comunicação">
        <div className="tech-communication-approved">
          <Box title="COMO TENDE A SE COMUNICAR" tone="red">{content.communication}</Box>
          <Box title="COMO PODE RECEBER INFORMAÇÕES">{editorial.receive}</Box>
          <Box title="PARA O LÍDER" tone="red">{narrative.communication}</Box>
          <Box title="FEEDBACK">{editorial.feedback}</Box>
          <Box title="POSSÍVEIS PONTOS DE TENSÃO" tone="gray">{editorial.tension}</Box>
        </div>
      </ApprovedPage>

      <ApprovedPage number={7} title="Liderança e Gestão">
        <div className="tech-management-grid">
          <Box title="COMO LIDERAR" tone="red">{narrative.leadership}</Box>
          <Box title="DELEGAÇÃO">{editorial.delegation}</Box>
          <Box title="COBRANÇA E FEEDBACK">{editorial.accountability}</Box>
          <Box title="RECONHECIMENTO E DESENVOLVIMENTO">{editorial.recognition}</Box>
        </div>
        <Box title="ATENÇÃO DO GESTOR" tone="red">{editorial.managerAttention}</Box>
      </ApprovedPage>

      <ApprovedPage number={8} title="Trabalho em Equipe">
        <Box title="COMO TENDE A CONTRIBUIR" tone="red">{narrative.team}</Box>
        <div className="tech-team-grid">
          <Box title="RITMO">{content.habits.slice(0, 2).join(" ")}</Box>
          <Box title="COMUNICAÇÃO">{editorial.teamCommunication}</Box>
          <Box title="DECISÃO">{narrative.decision}</Box>
          <Box title="INTEGRAÇÃO">{editorial.integration}</Box>
        </div>
      </ApprovedPage>

      <ApprovedPage number={9} title="Pressão, Mudanças e Desenvolvimento">
        <div className="tech-pressure-grid">
          <Box title="SOB PRESSÃO" tone="red">{narrative.pressure}</Box>
          <Box title="DIANTE DE MUDANÇAS">{narrative.change}</Box>
          <Box title="ADAPTAÇÃO" tone="red">{adaptationText} Índice de adaptação: {scores.adaptationIndex.toFixed(1).replace(".", ",")}.</Box>
          <Box title="DESENVOLVIMENTO">{editorial.development}</Box>
        </div>
        <Box title="EXPERIMENTOS DE DESENVOLVIMENTO" tone="red">
          {(adaptive.experiments?.slice(0, 3).length ? adaptive.experiments.slice(0, 3) : narrative.experiments.slice(0, 3)).join(" • ")}
        </Box>
      </ApprovedPage>

      <ApprovedPage number={10} title="Conclusão e Aplicação Gerencial">
        <Box title="SÍNTESE DO PERFIL" tone="red">
          {adaptive.profilePortrait ?? narrative.essence} Predominante {p}, secundário {s}, combinação {scores.combination}. {TECHNICAL_PROFILE_CLOSING}
        </Box>
        <div className="tech-conclusion-grid">
          <Box title="RESULTADOS">{editorial.resultsPlan}</Box>
          <Box title="PESSOAS">{editorial.peoplePlan}</Box>
          <Box title="PROCESSOS">{editorial.processPlan}</Box>
        </div>
        <Box title="O QUE O GESTOR DEVE OBSERVAR" tone="red">
          Comunicação • Delegação • Acompanhamento • Feedback • Desenvolvimento. Use a leitura como hipótese de trabalho e valide com comportamento observável, competências, experiência, desempenho e contexto.
        </Box>
        <p className="tech-final-principle">PESSOAS TRANSFORMAM ORGANIZAÇÕES.</p>
      </ApprovedPage>
    </article>
  );
}
