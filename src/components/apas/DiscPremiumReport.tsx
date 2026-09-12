import type { ScoreResult, DimensionMap, ProfileVector } from "@/lib/disc/scoring";
import { DIMENSIONS, DIMENSION_NAMES, type Dimension } from "@/lib/disc/instrument";
import {
  APAS_DISCLAIMER,
  APAS_FOUNDATION,
  APAS_INTRO,
  COMBINATION_CONTENT,
  DEVELOPMENT_FRAMEWORK,
  DIMENSION_CONTENT,
  PROFILE_EXPLANATIONS,
} from "@/lib/disc/content";

const FACTOR_CLASS: Record<Dimension, string> = {
  D: "disc-factor-d",
  I: "disc-factor-i",
  S: "disc-factor-s",
  C: "disc-factor-c",
};

type ReportAssessment = {
  id: string;
  candidate_name: string;
  role_title?: string | null;
  instrument_version?: string | null;
  submitted_at?: string | null;
  organizations?: { name?: string | null } | null;
};

function Page({ number, title, eyebrow, children, cover = false }: { number: number; title?: string; eyebrow?: string; children: React.ReactNode; cover?: boolean }) {
  return (
    <section className={`disc-page ${cover ? "disc-cover" : ""}`}>
      {!cover && <div className="disc-page-header"><span>APAS DISC</span><span>Relatório individual</span></div>}
      <div className="disc-page-body">
        {eyebrow && <p className="disc-kicker">{eyebrow}</p>}
        {title && <h2 className="disc-page-title">{title}</h2>}
        {children}
      </div>
      {!cover && <div className="disc-page-footer"><span>APAS Soluções Empresariais</span><span>{String(number).padStart(2, "0")}</span></div>}
    </section>
  );
}

function FactorMark({ dimension, percent }: { dimension: Dimension; percent?: number }) {
  return (
    <div className={`disc-factor ${FACTOR_CLASS[dimension]}`}>
      <span>{dimension}</span>
      <div><strong>{DIMENSION_NAMES[dimension]}</strong>{percent !== undefined && <small>{percent}%</small>}</div>
    </div>
  );
}

function ProfileTable({ vectors }: { vectors: { label: string; value: ProfileVector }[] }) {
  return (
    <div className="disc-table-wrap">
      <table className="disc-table">
        <thead><tr><th>Fator</th>{vectors.map((v) => <th key={v.label}>{v.label}</th>)}</tr></thead>
        <tbody>{DIMENSIONS.map((d) => <tr key={d}><td><strong>{d}</strong> · {DIMENSION_NAMES[d]}</td>{vectors.map((v) => <td key={v.label}>{v.value.percent[d]}%</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function ProfileBars({ title, values }: { title: string; values: DimensionMap }) {
  return <div className="disc-profile-panel"><h3>{title}</h3>{DIMENSIONS.map((d) => <div className="disc-meter" key={d}><div><span>{d} · {DIMENSION_NAMES[d]}</span><strong>{values[d]}%</strong></div><div className="disc-meter-track"><span className={FACTOR_CLASS[d]} style={{ width: `${values[d]}%` }} /></div></div>)}</div>;
}

function BulletList({ items }: { items: string[] }) {
  return <ul className="disc-bullets">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export function DiscPremiumReport({ assessment, scores }: { assessment: ReportAssessment; scores: ScoreResult }) {
  const primary = DIMENSION_CONTENT[scores.predominant];
  const secondary = DIMENSION_CONTENT[scores.secondary];
  const combination = COMBINATION_CONTENT[scores.combination];
  const date = assessment.submitted_at ? new Date(assessment.submitted_at).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR");
  const adaptationText = scores.adaptationAlert
    ? "A distância entre as tendências naturais e as demandas percebidas está elevada. Isso pode representar flexibilidade, mas também esforço continuado; é uma hipótese importante para validar na devolutiva."
    : "A distância entre as tendências naturais e as demandas percebidas está dentro da faixa esperada. Isso sugere adaptação relativamente sustentável, hipótese que deve ser confirmada no contexto real.";

  return (
    <article className="disc-report" aria-label={`Relatório DISC de ${assessment.candidate_name}`}>
      <Page number={1} cover>
        <div className="disc-cover-brand">APAS <strong>DISC</strong></div>
        <div className="disc-cover-ring"><span>D</span><span>I</span><span>S</span><span>C</span></div>
        <div className="disc-cover-copy"><p>Relatório de Perfil Comportamental</p><h1>{assessment.candidate_name}</h1><blockquote>Compreender comportamentos. Fortalecer relações. Desenvolver resultados.</blockquote></div>
        <div className="disc-cover-factors">{DIMENSIONS.map((d) => <FactorMark key={d} dimension={d} />)}</div>
        <div className="disc-cover-meta"><div><span>Relatório individual</span><span>{assessment.role_title || assessment.organizations?.name || "Perfil profissional"}</span></div><div><span>APAS Soluções Empresariais</span><span>Versão profissional · {date}</span></div></div>
      </Page>

      <Page number={2} eyebrow="Introdução" title="Uma leitura para ampliar escolhas">
        <div className="disc-lead">{APAS_INTRO.map((p) => <p key={p}>{p}</p>)}</div>
        <div className="disc-callout"><strong>Base conceitual</strong><p>O APAS DISC tem como referência conceitual os estudos de William Moulton Marston, apresentados na obra <em>Emotions of Normal People</em> (1928), que fundamentam a compreensão de diferentes padrões de comportamento humano. A APAS utiliza essa base conceitual para desenvolver uma aplicação própria voltada à compreensão comportamental, comunicação, desenvolvimento profissional, liderança e relações no ambiente de trabalho.</p></div>
        <p className="disc-note">{APAS_DISCLAIMER}</p>
      </Page>

      <Page number={3} eyebrow="Como interpretar" title="O que o instrumento avalia — e o que não avalia">
        <div className="disc-two-columns"><div><h3>O que esta leitura observa</h3><BulletList items={["Tendências de resposta a desafios, pessoas, ritmo e normas.","Preferências de comunicação, decisão e colaboração.","Diferenças entre comportamento espontâneo e demandas percebidas.","Hipóteses para conversas de desenvolvimento."]} /></div><div><h3>O que esta leitura não determina</h3><BulletList items={["Personalidade completa, caráter ou saúde mental.","Inteligência, competência técnica ou potencial isolado.","Adequação definitiva a um cargo ou decisão sobre pessoas.","Comportamentos imutáveis ou rótulos permanentes."]} /></div></div>
        <div className="disc-factor-grid">{DIMENSIONS.map((d) => <FactorMark key={d} dimension={d} />)}</div>
        {APAS_FOUNDATION.slice(0, 3).map((p) => <p className="disc-body-copy" key={p}>{p}</p>)}
      </Page>

      <Page number={4} eyebrow="Resumo executivo" title={`${primary.title} com ${secondary.title}`}>
        <p className="disc-highlight">{primary.summary}</p>
        <div className="disc-combination"><span>{scores.combination}</span><div><h3>{combination?.title ?? "Combinação comportamental"}</h3><p>{combination?.text ?? `A combinação sugere a presença conjunta de ${primary.title} e ${secondary.title}, a ser validada no contexto profissional.`}</p></div></div>
        <div className="disc-factor-grid">{DIMENSIONS.map((d) => <FactorMark key={d} dimension={d} percent={scores.adapted.percent[d]} />)}</div>
        <div className="disc-two-columns"><div><h3>Forças que podem aparecer</h3><BulletList items={[...primary.strengths.slice(0, 3), ...secondary.strengths.slice(0, 2)]} /></div><div><h3>Hipóteses para atenção</h3><BulletList items={[...primary.attention.slice(0, 3), ...secondary.attention.slice(0, 2)]} /></div></div>
      </Page>

      <Page number={5} eyebrow="Mapa comportamental" title="Três perspectivas do mesmo repertório">
        <div className="disc-profile-grid"><ProfileBars title="Perfil Natural" values={scores.natural.percent} /><ProfileBars title="Perfil Adaptado" values={scores.adapted.percent} /><ProfileBars title="Perfil Social" values={scores.social.percent} /></div>
        <ProfileTable vectors={[{ label: "Natural", value: scores.natural }, { label: "Adaptado", value: scores.adapted }, { label: "Social", value: scores.social }]} />
        <p className="disc-note">Gráficos e tabela utilizam os mesmos percentuais do resultado calculado. Diferenças de leitura devem ser interpretadas como hipóteses contextuais, não como inconsistências.</p>
      </Page>

      <Page number={6} eyebrow="Adaptação" title="Natural, Adaptado e Social">
        <div className="disc-lens-grid">{(["natural", "adapted", "social"] as const).map((key) => <div key={key}><span>{key === "natural" ? "N" : key === "adapted" ? "A" : "S"}</span><p>{PROFILE_EXPLANATIONS[key]}</p></div>)}</div>
        <div className="disc-index"><span>Índice de adaptação</span><strong>{scores.adaptationIndex}</strong><p>{adaptationText}</p></div>
        <h3>Pergunta-chave para a devolutiva</h3><p className="disc-highlight">Em quais situações a forma de agir atual parece natural e produtiva — e em quais exige esforço acima do sustentável?</p>
      </Page>

      <Page number={7} eyebrow="Os quatro fatores" title="Uma leitura equilibrada do perfil">
        <div className="disc-dimension-grid">{DIMENSIONS.map((d) => { const content = DIMENSION_CONTENT[d]; return <div className="disc-dimension-card" key={d}><FactorMark dimension={d} percent={scores.adapted.percent[d]} /><p><strong>Nível {scores.levels[d]}.</strong> {content.levels[scores.levels[d]]}</p><p>{content.headline}</p></div>; })}</div>
        <p className="disc-note">Os quatro fatores participam do repertório. O percentual indica distribuição relativa nesta aplicação; não representa capacidade, valor ou desempenho.</p>
      </Page>

      <Page number={8} eyebrow="Interação profissional" title="Comunicação, liderança e decisão">
        <div className="disc-section-stack"><section><h3>Comunicação</h3><p>{primary.communication} Em situações que pedem {secondary.headline.toLowerCase()}, a contribuição secundária pode ampliar essa abordagem.</p></section><section><h3>Liderança</h3><p>Esta combinação tende a liderar por {primary.headline.toLowerCase()}, apoiada por {secondary.headline.toLowerCase()}. Pode favorecer resultados quando explicita expectativas e adapta o ritmo às necessidades do time.</p></section><section><h3>Tomada de decisão</h3><p>Tende a iniciar decisões a partir das prioridades de {primary.title.toLowerCase()}. Antes de concluir, pode ganhar qualidade ao consultar critérios ligados a {secondary.title.toLowerCase()} e aos fatores menos presentes.</p></section></div>
      </Page>

      <Page number={9} eyebrow="Contextos de atuação" title="Equipe, pressão e mudanças">
        <div className="disc-section-stack"><section><h3>Trabalho em equipe</h3><p>Pode contribuir com {primary.strengths.slice(0, 2).join(" e ").toLowerCase()}. Para ampliar cooperação, vale tornar necessidades explícitas e confirmar como seu estilo é percebido pelas demais pessoas.</p></section><section><h3>Atuação sob pressão</h3><p>Sob pressão, preferências úteis podem se intensificar. Há possibilidade de {primary.attention.join("; ").toLowerCase()}. Estes pontos são hipóteses a validar, não características fixas.</p></section><section><h3>Relação com mudanças</h3><p>A tendência é responder à mudança pela lógica de {primary.headline.toLowerCase()}. A contribuição de {secondary.title} pode ajudar a equilibrar velocidade, vínculo, constância e critério conforme o contexto.</p></section></div>
      </Page>

      <Page number={10} eyebrow="Desenvolvimento" title="Transformar consciência em repertório">
        <div className="disc-two-columns"><div><h3>Práticas recomendadas</h3><BulletList items={[...primary.development, ...secondary.development.slice(0, 2)]} /></div><div><h3>Condições que favorecem desempenho</h3><BulletList items={[...primary.motivators.slice(0, 3), ...secondary.motivators.slice(0, 2)]} /></div></div>
        <div className="disc-callout"><strong>Pontos de atenção não são defeitos</strong><p>São custos possíveis de uma preferência levada ao extremo, especialmente sob pressão, cansaço ou conflito. O objetivo é ampliar alternativas de resposta.</p></div>
      </Page>

      <Page number={11} eyebrow="Plano prático" title="30 dias para experimentar novas escolhas">
        <div className="disc-plan">{DEVELOPMENT_FRAMEWORK.map((item, index) => { const [title, text] = item.split(": "); return <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{text}</p></div></div>; })}</div>
        <div className="disc-action-box"><h3>Meu compromisso de 30 dias</h3><p>Ação observável:</p><div /><p>Situação em que vou praticar:</p><div /><p>Indicador e pessoa que poderá me dar retorno:</p><div /></div>
      </Page>

      <Page number={12} eyebrow="Conclusão" title="O perfil é um ponto de partida">
        <p className="disc-closing">Seu resultado descreve tendências que podem ajudar a compreender escolhas, relações e respostas ao ambiente. O desenvolvimento acontece quando essa leitura é confrontada com experiências reais, feedback e objetivos concretos.</p>
        <div className="disc-combination"><span>{scores.combination}</span><div><h3>{combination?.title ?? `${primary.title} e ${secondary.title}`}</h3><p>Use esta combinação como linguagem para conversar sobre comportamento — nunca como rótulo ou limite.</p></div></div>
        <div className="disc-callout"><strong>Próximo passo</strong><p>Realize a devolutiva com um profissional APAS, valide as hipóteses deste relatório e escolha uma ação simples, observável e relevante para os próximos 30 dias.</p></div>
        <p className="disc-note">O APAS DISC é uma ferramenta de análise de tendências comportamentais e não constitui diagnóstico psicológico, clínico ou psiquiátrico. Seus resultados devem ser interpretados como indicadores de tendências e utilizados em conjunto com contexto, observação e devolutiva profissional.</p>
        <div className="disc-signature"><strong>APAS Soluções Empresariais</strong><span>Relatório individual · {assessment.instrument_version || "APAS DISC"} · {date}</span></div>
      </Page>
    </article>
  );
}