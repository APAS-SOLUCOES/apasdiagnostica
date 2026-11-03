import { CalendarDays, CheckCircle2, Target, Users, MessageCircle, Compass, BarChart3 } from "lucide-react";
import type { ReactNode } from "react";
import type { ScoreResult } from "@/lib/disc/scoring";
import { DEFAULT_SCORING, DIMENSIONS, DIMENSION_NAMES, type Dimension } from "@/lib/disc/instrument";
import DIMENSION_CONTENT from "@/lib/disc/technical-factor-text.json";
import sectionText from "@/lib/disc/technical-section-text.json";
import { COMBINATION_NARRATIVES } from "@/lib/disc/report-content";
import { getTechnicalReportNarrative } from "@/lib/disc/report-narrative-presentation";
import { firstNameOf, standardizeFactors, technicalVoice } from "@/lib/disc/technical-voice";

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

/** Same order and descriptions as the individual report's profile cards. */
const PROFILE_PLANES = [
  { key: "NATURAL", label: "Natural", description: "Como tende a agir quando está mais à vontade." },
  { key: "ADAPTADO", label: "Adaptado", description: "Como ajusta o comportamento ao que percebe que o ambiente pede." },
  { key: "SOCIAL", label: "Social", description: "Como acredita que precisa se apresentar ao ambiente." },
] as const;

function ProfileModeCards() {
  return (
    <div className="tech-mode-cards">
      {PROFILE_PLANES.map((plane) => <div key={plane.key}><strong>{plane.key}</strong><p>{plane.description}</p></div>)}
    </div>
  );
}

const factorLabel = (d: Dimension) => `${DIMENSION_NAMES[d]} (${d})`;
const decimal = (n: number) => n.toFixed(1).replace(".", ",");

const SUMMARY_SECTIONS: Array<[string, number]> = [
  ["Introdução e Modelo DISC", 3],
  ["Perfil Comportamental", 4],
  ["Análise do Perfil", 5],
  ["Comunicação", 6],
  ["Liderança e Gestão", 7],
  ["Trabalho em Equipe", 8],
  ["Pressão, Mudanças e Desenvolvimento", 9],
  ["Conclusão e Aplicação Gerencial", 10],
];

/** Explains the rule the scoring engine already applies; it does not recalculate anything. */
function profileRuleText(scores: ScoreResult) {
  if (scores.scoringVersion?.startsWith("apas-scoring-1.2")) {
    return "O fator predominante e o secundário são os dois mais altos do plano Adaptado, que soma cada escolha “mais se parece comigo” (peso 2) e cada bloco em que o fator não foi marcado como “menos se parece comigo” (peso 1). Em empate, prevalece o fator com mais escolhas “mais se parece comigo” e, depois, o com menos escolhas “menos se parece comigo”.";
  }
  return `O fator predominante e o secundário são os dois mais altos do plano de referência definido na versão de pontuação ${scores.scoringVersion}.`;
}

function naturalSecondaryNote(scores: ScoreResult) {
  const natural = scores.natural?.percent;
  if (!natural) return "";
  const ranking = [...DIMENSIONS].sort((a, b) => natural[b] - natural[a]);
  const second = ranking[1];
  if (!second || second === scores.secondary || natural[second] <= natural[scores.secondary]) return "";
  return ` No plano Natural, a segunda posição é de ${factorLabel(second)}; no perfil final, o secundário é ${factorLabel(scores.secondary)} porque a regra considera também as escolhas afirmativas.`;
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
  const secondaryContent = DIMENSION_CONTENT[s];
  const firstName = firstNameOf(assessment.candidate_name);
  const v = (text: string) => technicalVoice(text, firstName);
  const who = firstName || "a pessoa avaliada";
  const sections = sectionText as Record<string, typeof sectionText.DI>;
  const editorial = sections[scores.combination] ?? sections[`${p}${s}`] ?? sectionText.DI;

  const alertLimit = decimal(DEFAULT_SCORING.adaptationAlert);
  const adaptationBand = scores.adaptationAlert ? "alta" : "baixa";
  const adaptationReading = scores.adaptationAlert
    ? `Os planos Natural e Social estão distantes: ${who} ajusta bastante o comportamento ao que acredita que o ambiente espera. Converse sobre quais demandas exigem esse ajuste e se o esforço é sustentável no ritmo atual.`
    : `Os planos Natural e Social estão próximos: o comportamento apresentado no trabalho se aproxima do modo espontâneo. Acompanhe em quais situações ${who} amplia ou reduz comportamentos.`;

  return (
    <article className="disc-technical-report tech-approved-report" aria-label={`Relatório Técnico DISC de ${assessment.candidate_name}`}>
      <CoverPage assessment={assessment} />

      <ApprovedPage number={2} title="Sumário">
        <div className="tech-summary-approved">
          {SUMMARY_SECTIONS.map(([item, page]) => (
            <div key={item}><b>{String(page).padStart(2, "0")}</b><span>{item}</span></div>
          ))}
        </div>
      </ApprovedPage>

      <ApprovedPage number={3} title="Introdução" subtitle="Uma leitura comportamental para ampliar a compreensão sobre pessoas e equipes.">
        <FactorCards />
        <Box title="COMO LER ESTE RELATÓRIO">
          <div role="list" aria-label="Como ler este relatório">
            {PROFILE_PLANES.map((plane) => <div role="listitem" key={plane.key}>• <b>{plane.label}:</b> {plane.description.charAt(0).toLowerCase() + plane.description.slice(1)}</div>)}
            <div role="listitem">• <b>Percentuais:</b> em cada plano, os quatro fatores somam 100%; 25% indica distribuição equilibrada, e quanto maior o percentual, mais presente o fator naquele plano.</div>
          </div>
        </Box>
        <Box title="PARA LÍDERES, GESTORES E EMPRESÁRIOS" tone="red">
          O relatório orienta comunicação, delegação, feedback e desenvolvimento no trabalho. Compare cada leitura com entregas, competências e contexto antes de decidir sobre responsabilidades.
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
        <Box title="COMO O PERFIL É DEFINIDO" tone="gray">{profileRuleText(scores)}{naturalSecondaryNote(scores)}</Box>
      </ApprovedPage>

      <ApprovedPage number={5} title="Análise do Perfil">
        <div className="tech-analysis-heading">
          <span>{p}</span>
          <div><h3>{DIMENSION_NAMES[p]} — {content.headline}</h3><p>{adaptive.title.split(" · ")[0] ?? adaptive.title}</p></div>
        </div>
        <div className="tech-analysis-grid">
          <Box title="PRINCIPAIS CARACTERÍSTICAS" tone="red">{v(content.characteristics.slice(0, 4).join(" "))}</Box>
          <Box title="PONTOS FORTES">{v(narrative.best.slice(0, 3).join(" "))}</Box>
          <Box title="PONTOS DE ATENÇÃO" tone="gray">{v(content.attention.slice(0, 3).join(" "))}</Box>
          <Box title="LEITURA GERENCIAL" tone="red">{v(editorial.managementReading)}</Box>
        </div>
        <div className="tech-analysis-heading">
          <span>{s}</span>
          <div><h3>{DIMENSION_NAMES[s]} — {secondaryContent.headline}</h3><p>Fator secundário</p></div>
        </div>
        <div className="tech-analysis-grid">
          <Box title="PRINCIPAIS CARACTERÍSTICAS" tone="red">{v(secondaryContent.characteristics.slice(0, 3).join(" "))}</Box>
          <Box title="PONTOS FORTES">{v(secondaryContent.strengths.slice(0, 3).join(" "))}</Box>
          <Box title="PONTOS DE ATENÇÃO" tone="gray">{v(secondaryContent.attention.slice(0, 3).join(" "))}</Box>
          <Box title="LEITURA GERENCIAL" tone="red">{v(secondaryContent.motivators.slice(0, 2).join(" "))}</Box>
        </div>
      </ApprovedPage>

      <ApprovedPage number={6} title="Comunicação">
        <div className="tech-communication-approved">
          <Box title="COMO SE COMUNICA" tone="red">{v(content.communication)}</Box>
          <Box title="COMO PREFERE RECEBER INFORMAÇÕES">{v(editorial.receive)}</Box>
          <Box title="PARA O LÍDER" tone="red">{v(narrative.communication)}</Box>
          <Box title="FEEDBACK">{v(editorial.feedback)}</Box>
          <Box title="POSSÍVEIS PONTOS DE TENSÃO" tone="gray">{v(editorial.tension)}</Box>
        </div>
      </ApprovedPage>

      <ApprovedPage number={7} title="Liderança e Gestão">
        <div className="tech-management-grid">
          <Box title="COMO LIDERAR" tone="red">{v(narrative.leadership)}</Box>
          <Box title="DELEGAÇÃO">{v(editorial.delegation)}</Box>
          <Box title="COBRANÇA E FEEDBACK">{v(editorial.accountability)}</Box>
          <Box title="RECONHECIMENTO E DESENVOLVIMENTO">{v(editorial.recognition)}</Box>
        </div>
        <Box title="ATENÇÃO DO GESTOR" tone="red">{v(editorial.managerAttention)}</Box>
      </ApprovedPage>

      <ApprovedPage number={8} title="Trabalho em Equipe">
        <Box title="COMO CONTRIBUI" tone="red">{v(narrative.team)}</Box>
        <div className="tech-team-grid">
          <Box title="RITMO">{v(content.habits.slice(0, 2).join(" "))}</Box>
          <Box title="COMUNICAÇÃO">{v(editorial.teamCommunication)}</Box>
          <Box title="DECISÃO">{v(narrative.decision)}</Box>
          <Box title="INTEGRAÇÃO">{v(editorial.integration)}</Box>
        </div>
      </ApprovedPage>

      <ApprovedPage number={9} title="Pressão, Mudanças e Desenvolvimento">
        <div className="tech-pressure-grid">
          <Box title="SOB PRESSÃO" tone="red">{v(narrative.pressure)}</Box>
          <Box title="DIANTE DE MUDANÇAS">{v(narrative.change)}</Box>
          <Box title="ÍNDICE DE ADAPTAÇÃO" tone="red">
            <b>{decimal(scores.adaptationIndex)} — faixa {adaptationBand}.</b> {adaptationReading}
            <div role="list" aria-label="Escala do índice de adaptação">
              <div role="listitem">{scores.adaptationAlert ? "○" : "●"} Baixo: abaixo de {alertLimit}, sem alerta automático.</div>
              <div role="listitem">{scores.adaptationAlert ? "●" : "○"} Alto: {alertLimit} ou mais, com alerta de adaptação.</div>
            </div>
          </Box>
          <Box title="DESENVOLVIMENTO">{v(editorial.development)}</Box>
        </div>
        <Box title="EXPERIMENTOS DE DESENVOLVIMENTO" tone="red">
          <div role="list" aria-label="Experimentos de desenvolvimento">
            {(adaptive.experiments?.slice(0, 3).length ? adaptive.experiments.slice(0, 3) : narrative.experiments.slice(0, 3)).map((experiment, index) => (
              <div role="listitem" key={index}>• {v(experiment)}</div>
            ))}
          </div>
        </Box>
      </ApprovedPage>

      <ApprovedPage number={10} title="Conclusão e Aplicação Gerencial">
        <Box title="SÍNTESE DO PERFIL" tone="red">
          {v(adaptive.profilePortrait ?? narrative.essence)} Combinação {scores.combination}: predominante {factorLabel(p)} e secundário {factorLabel(s)}.
        </Box>
        <div className="tech-conclusion-grid">
          <Box title="RESULTADOS">{v(editorial.resultsPlan)}</Box>
          <Box title="PESSOAS">{v(editorial.peoplePlan)}</Box>
          <Box title="PROCESSOS">{v(editorial.processPlan)}</Box>
        </div>
        <Box title="O QUE O GESTOR DEVE OBSERVAR" tone="red">
          Comunicação • Delegação • Acompanhamento • Feedback • Desenvolvimento. Acompanhe esses pontos nas conversas de gestão, comparando a leitura com entregas, competências, experiência e contexto.
        </Box>
        <Box title="CONFIDENCIALIDADE E USO" tone="gray">
          Este relatório contém dados pessoais de {assessment.candidate_name}, tratados conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). O acesso é restrito às pessoas envolvidas no processo de gestão e desenvolvimento, e o documento não deve ser compartilhado para outra finalidade. As leituras são hipóteses de trabalho, a confirmar com comportamento observável, entregas e contexto. O relatório não deve ser usado isoladamente para decisões de contratação, promoção ou demissão.
        </Box>
        <p className="tech-final-principle">PESSOAS TRANSFORMAM ORGANIZAÇÕES.</p>
      </ApprovedPage>
    </article>
  );
}
