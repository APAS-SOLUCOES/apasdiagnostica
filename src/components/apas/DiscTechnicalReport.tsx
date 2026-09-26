import { CalendarDays, CheckCircle2, Target, Users, MessageCircle, Lightbulb, Compass, BarChart3 } from "lucide-react";
import type { ReactNode } from "react";
import type { ScoreResult } from "@/lib/disc/scoring";
import { DIMENSIONS, DIMENSION_NAMES } from "@/lib/disc/instrument";
import { DIMENSION_CONTENT } from "@/lib/disc/content";
import { COMBINATION_NARRATIVES } from "@/lib/disc/report-content";
import { getAdaptiveFactorImpact, getAdaptiveFactorReading, getAdaptiveNarrative } from "@/lib/disc/adaptive-content";

import coverMountain from "@/assets/disc-approved-cover-mountain.jpg";
import teamHands from "@/assets/disc-approved-team-hands.jpg";
import decisionCompass from "@/assets/disc-approved-decision-compass.jpg";

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

function duration(start?: string | null, end?: string | null) {
  if (!start || !end) return "Não disponível";
  const minutes = Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
}

function pct(n: number) {
  return `${n.toFixed(1).replace(".", ",")}%`;
}

function ApprovedPage({
  number,
  title,
  subtitle,
  children,
  dark = false,
  image,
}: {
  number: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  dark?: boolean;
  image?: string;
}) {
  return (
    <section className={`tech-approved-page ${dark ? "tech-approved-dark" : ""}`} data-page={number}>
      {image && <div className="tech-approved-bg" style={{ backgroundImage: `url(${image})` }} />}
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

function ProfileQuadrant({ scores }: { scores: ScoreResult }) {
  const colors: Record<string, string> = { D: "#ef2929", I: "#ffbf16", S: "#28a95a", C: "#1971d4" };
  return (
    <div className="tech-disc-quadrant">
      {DIMENSIONS.map((d) => (
        <div key={d} style={{ background: colors[d] }}>
          <strong>{d}</strong><span>{DIMENSION_NAMES[d].toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}

function CommunicationCards({ primary }: { primary: string }) {
  const data: Record<string, Array<[string, string]>> = {
    D: [["Comunicação Direta", "Você tende a ser objetivo(a) e focado(a) no resultado."], ["Influência Positiva", "Você mobiliza pessoas quando conecta direção e impacto."], ["Escuta Ativa", "Amplie a escuta para incorporar sinais do ambiente."], ["Lógica e Clareza", "Use informações precisas para sustentar decisões."]],
    I: [["Comunicação Direta", "Conecte entusiasmo a objetivos concretos e próximos passos."], ["Influência Positiva", "Você tende a comunicar possibilidades com energia."], ["Escuta Ativa", "Confirme entendimento antes de avançar."], ["Lógica e Clareza", "Estruture ideias-chave para transformar inspiração em execução."]],
    S: [["Comunicação Direta", "Combine clareza com previsibilidade e contexto."], ["Influência Positiva", "Sua influência cresce quando cria segurança e cooperação."], ["Escuta Ativa", "A escuta é um recurso natural para compreender o outro."], ["Lógica e Clareza", "Organize informações para facilitar mudanças e acordos."]],
    C: [["Comunicação Direta", "Seja claro, objetivo e apoiado em critérios."], ["Influência Positiva", "Mostre como qualidade e precisão ajudam o coletivo."], ["Escuta Ativa", "Pergunte e valide antes de concluir."], ["Lógica e Clareza", "Informações precisas e bem estruturadas favorecem seu melhor desempenho."]],
  };
  const icons = [MessageCircle, Users, Target, BarChart3];
  return <div className="tech-communication-grid">{data[primary].map(([t, b], i) => { const Icon = icons[i]; return <div key={t}><Icon/><section><strong>{t}</strong><p>{b}</p></section></div>; })}</div>;
}

export function DiscTechnicalReport({ assessment, scores, computedAt }: { assessment: TechnicalAssessment; scores: ScoreResult; computedAt?: string | null }) {
  const narrative = COMBINATION_NARRATIVES[scores.combination] ?? COMBINATION_NARRATIVES[`${scores.predominant}${scores.secondary}`];
  if (!narrative) return null;

  const m = getAdaptiveNarrative(scores);
  const p = scores.predominant;
  const s = scores.secondary;
  const pv = scores.adapted.percent[p];
  const sv = scores.adapted.percent[s];
  const primaryImpact = getAdaptiveFactorImpact(p, pv);
  const secondaryImpact = getAdaptiveFactorImpact(s, sv);
  const adaptation = scores.adaptationAlert
    ? "A distância entre os perfis merece investigação contextual. Pode representar flexibilidade diante das demandas ou esforço de adaptação prolongado."
    : "A distância entre os perfis não acionou alerta automático. Valide em quais ambientes a pessoa amplia, reduz ou alterna comportamentos.";

  const primaryCharacteristics = DIMENSION_CONTENT[p]?.attention ?? [];
  const date = new Date(assessment.created_at).toLocaleDateString("pt-BR");

  return (
    <article className="disc-technical-report tech-approved-report" aria-label={`Relatório Técnico DISC de ${assessment.candidate_name}`}>
      <ApprovedPage number={1} title="RELATÓRIO TÉCNICO" subtitle="DISC" dark image={coverMountain}>
        <div className="tech-cover-label">ANÁLISE COMPORTAMENTAL</div>
        <div className="tech-cover-person">
          <span><Users/> Nome do Avaliado</span><strong>{assessment.candidate_name}</strong>
          <span><CalendarDays/> Data da Avaliação</span><strong>{date}</strong>
          <span><Target/> Empresa</span><strong>{assessment.organizations?.name || "Aplicação individual"}</strong>
        </div>
        <div className="tech-cover-bottom">PESSOAS<br/>ESTRATÉGIAS<br/>RESULTADOS</div>
      </ApprovedPage>

      <ApprovedPage number={2} title="Sumário">
        <div className="tech-summary">
          {["Introdução", "O que é o DISC", "Perfil Comportamental", "Análise Detalhada", "Pontos Fortes", "Pontos de Atenção", "Estilo de Comunicação", "Ambiente Ideal", "Liderança e Trabalho em Equipe", "Desenvolvimento e Recomendações", "Conclusão"].map((item, i) => <div key={item}><b>{String(i + 1).padStart(2, "0")}</b><span>{item}</span></div>)}
        </div>
      </ApprovedPage>

      <ApprovedPage number={3} title="Introdução" subtitle="O que este relatório apresenta" image={teamHands}>
        <div className="tech-intro-copy">
          <p>Este relatório apresenta os resultados da avaliação DISC com foco em comportamento observável no ambiente profissional. A proposta é transformar a leitura do perfil em apoio prático para autoconhecimento, comunicação, liderança e desenvolvimento de pessoas.</p>
          <p>O DISC identifica tendências comportamentais e ajuda a compreender como uma pessoa pode reagir diante de metas, mudanças, pressão, decisões, relacionamentos e diferentes formas de comunicação. A leitura ganha valor quando é confrontada com a realidade do trabalho.</p>
          <p>Para líderes, gestores e empresários, o objetivo não é rotular a pessoa, mas ampliar a qualidade das perguntas: como ela tende a trabalhar, o que pode facilitar sua entrega, que situações podem exigir adaptação e como conduzir conversas de forma mais produtiva.</p>
          <div className="tech-highlight"><Target/><span>Use este relatório como hipótese de trabalho. Combine a leitura comportamental com competências, experiência, desempenho, contexto e evidências observáveis antes de tomar decisões de gestão.</span></div>
        </div>
      </ApprovedPage>

      <ApprovedPage number={4} title="Seu Perfil DISC" subtitle="Predominância Comportamental">
        <ProfileQuadrant scores={scores}/>
        <div className="tech-profile-callout"><strong>{p} + {s}</strong><p>{primaryImpact.identity}. O fator secundário {s} acrescenta {secondaryImpact.identity.toLowerCase()} à leitura do perfil. A combinação deve ser observada como um repertório: a forma de agir pode variar conforme ambiente, demanda, pressão e experiência.</p></div>
        <div className="tech-score-row">{DIMENSIONS.map(d => <div key={d}><span>{d}</span><strong>{pct(scores.adapted.percent[d])}</strong></div>)}</div>
        <div className="tech-wide-note"><BarChart3/><p><strong>Base técnica da leitura:</strong> {scores.answeredItems} de {scores.totalItems} itens respondidos, cobertura de {scores.completionPercent.toFixed(0)}%. Predominância {p}, fator secundário {s} e combinação {scores.combination}. Índice de adaptação: {scores.adaptationIndex.toFixed(1).replace(".", ",")}.</p></div>
      </ApprovedPage>

      <ApprovedPage number={5} title="Análise Detalhada" subtitle={`Características do seu perfil`}>
        <div className="tech-factor-heading"><span>{p}</span><div><h3>{DIMENSION_NAMES[p]}</h3><p>{primaryImpact.identity}</p></div></div>
        <p className="tech-body">{getAdaptiveFactorReading(p, pv)}</p>
        <div className="tech-feature-box"><strong>Principais características:</strong>{(DIMENSION_CONTENT[p]?.characteristics ?? primaryCharacteristics).slice(0, 5).map((x, i) => <div key={i}><CheckCircle2/>{x}</div>)}</div>
        <div className="tech-two-columns"><div><h3>Pontos fortes</h3><p>{narrative.best.join(" ")}</p></div><div><h3>Pontos de atenção</h3><p>{narrative.excess.join(" ")}</p></div></div>
        <div className="tech-wide-note"><Compass/><p><strong>Leitura gerencial:</strong> {narrative.perceived} Observe comportamento concreto e impacto no trabalho; não trate tendência comportamental como defeito ou diagnóstico.</p></div>
      </ApprovedPage>

      <ApprovedPage number={6} title="Estilo de Comunicação" subtitle="Como você se comunica">
        <CommunicationCards primary={p}/>
        <div className="tech-wide-note"><MessageCircle/><p><strong>Leitura do perfil:</strong> {m.communication}</p></div>
        <div className="tech-two-columns">
          <div><h3>O que observar</h3><p>{narrative.perceived}</p></div>
          <div><h3>Ambiente e interlocutor</h3><p>{narrative.communication} Ajuste objetividade, ritmo, profundidade e espaço de fala ao interlocutor.</p></div>
        </div>
      </ApprovedPage>

      <ApprovedPage number={7} title="Desenvolvimento e Recomendações" subtitle="Liderança, equipe e aplicação prática">
        <div className="tech-two-columns">
          <div><h3>Liderança</h3><p>{narrative.leadership}</p></div>
          <div><h3>Trabalho em equipe</h3><p>{narrative.team}</p></div>
        </div>
        <div className="tech-two-columns">
          <div><h3>Decisão</h3><p>{narrative.decision}</p></div>
          <div><h3>Sob pressão</h3><p>{narrative.pressure}</p></div>
        </div>
        <div className="tech-recommendations">
          {(m.experiments?.slice(0, 4).length ? m.experiments.slice(0, 4) : narrative.experiments.slice(0, 4)).map((x, i) => <div key={i}><b>{i + 1}</b><span>{x}</span></div>)}
        </div>
      </ApprovedPage>

      <ApprovedPage number={8} title="Conclusão" subtitle="Síntese para gestão e desenvolvimento">
        <div className="tech-conclusion"><p>{m.profilePortrait ?? narrative.essence}</p><p>O valor desta leitura está em transformar autoconhecimento em comportamento observável: reconhecer forças, antecipar pontos de atenção, adaptar a comunicação e criar condições para que a pessoa entregue melhor sem exigir que ela deixe de ser quem é.</p></div>
        <div className="tech-two-columns">
          <div><h3>Mudança</h3><p>{narrative.change}</p></div>
          <div><h3>Próximo passo</h3><p>Escolha um comportamento observável, teste no contexto real, recolha evidências e revise a hipótese com a pessoa e com a equipe.</p></div>
        </div>
        <div className="tech-conclusion-box"><Target/><span><strong>Pessoas que se conhecem conquistam mais resultados.</strong><br/>Gestão de pessoas melhora quando comportamento, competência, contexto e desempenho são analisados em conjunto.</span></div>
      </ApprovedPage>

      <ApprovedPage number={9} title="" dark image={decisionCompass}>
        <div className="tech-final-message">“PESSOAS<br/>TRANSFORMAM<br/>ORGANIZAÇÕES.”</div>
        <img className="tech-final-logo" src={apasLogoWhite} alt="APAS Soluções"/>
        <div className="tech-final-tags">PESSOAS <b>|</b> ESTRATÉGIAS <b>|</b> RESULTADOS</div>
      </ApprovedPage>

      <ApprovedPage number={10} title="">
        <div className="tech-closing"><img src={apasLogoDark} alt="APAS Soluções"/><p>Este relatório é uma ferramenta de apoio à compreensão comportamental. A interpretação deve considerar contexto, competências, experiência e desempenho.</p><div>{computedAt ? `Gerado em ${new Date(computedAt).toLocaleString("pt-BR")}` : "APAS Soluções"}<br/>Documento técnico · uso profissional</div></div>
      </ApprovedPage>
    </article>
  );
}
