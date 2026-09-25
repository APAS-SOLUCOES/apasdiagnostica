import { AlertTriangle, CalendarDays, CheckCircle2, Compass, Focus, Gauge, MessageCircle, Network, RefreshCw, Sprout, Target, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { ScoreResult } from "@/lib/disc/scoring";
import { DIMENSIONS, DIMENSION_NAMES } from "@/lib/disc/instrument";
import { DIMENSION_CONTENT } from "@/lib/disc/content";
import { COMBINATION_NARRATIVES } from "@/lib/disc/report-content";
import { getAdaptiveFactorImpact, getAdaptiveFactorReading, getAdaptiveNarrative } from "@/lib/disc/adaptive-content";
import apasLogo from "@/assets/apas-logo-official.webp";
import apasLogoLight from "@/assets/apas-logo-light.webp";

type TechnicalAssessment = { id: string; candidate_name: string; status: string; instrument_version?: string | null; created_at: string; started_at?: string | null; submitted_at?: string | null; consent_accepted_at?: string | null; organizations?: { name?: string | null } | null };

function duration(start?: string | null, end?: string | null) {
  if (!start || !end) return "Não disponível";
  const minutes = Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
}

function pct(n: number) {
  return `${n.toFixed(1).replace(".", ",")}%`;
}

function TechnicalPage({ number, title, kicker, children, dark = false }: { number: number; title: string; kicker: string; children: ReactNode; dark?: boolean }) {
  const logo = dark ? apasLogo : apasLogoLight;
  return <section className={`disc-tech-page ${dark ? "disc-tech-page-dark" : ""}`}><header><span className="disc-tech-brand"><img className="disc-tech-brand-logo" src={logo} alt="APAS Soluções" /></span><span>Relatório técnico · Gestão de pessoas</span></header><main><p className="disc-tech-kicker">{kicker}</p><h1>{title}</h1>{children}</main><footer><span>APAS Soluções · Uso confidencial · Especialista autorizado</span><span>{String(number).padStart(2, "0")}</span></footer></section>;
}

function ProfileMatrix({ scores }: { scores: ScoreResult }) {
  const profiles = [{ label: "Natural", values: scores.natural.percent }, { label: "Adaptado", values: scores.adapted.percent }, { label: "Social", values: scores.social.percent }];
  return <div className="disc-tech-profiles">{profiles.map((profile) => <section key={profile.label}><h3>{profile.label}</h3>{DIMENSIONS.map((d) => <div className="disc-tech-bar" key={d}><span>{d}</span><div><i className={`disc-factor-${d.toLowerCase()}`} style={{ width: `${profile.values[d]}%` }} /></div><strong>{pct(profile.values[d])}</strong></div>)}</section>)}</div>;
}

function managementCards(scores: ScoreResult) {
  const n = getAdaptiveNarrative(scores);
  const p = scores.predominant;
  const s = scores.secondary;
  const pv = scores.adapted.percent[p];
  const sv = scores.adapted.percent[s];
  const primaryName = DIMENSION_NAMES[p];
  const secondaryName = DIMENSION_NAMES[s];
  const primaryReading = getAdaptiveFactorReading(p, pv);
  const secondaryReading = getAdaptiveFactorReading(s, sv);
  const primaryImpact = getAdaptiveFactorImpact(p, pv);
  const secondaryImpact = getAdaptiveFactorImpact(s, sv);
  return {
    n, p, s, pv, sv, primaryName, secondaryName, primaryReading, secondaryReading, primaryImpact, secondaryImpact,
    leadership: `Lidere com clareza de objetivo e ajuste a intensidade ao contexto. Para este perfil, o gestor ganha resultado quando reconhece a força de ${primaryName.toLowerCase()} em ${pct(pv)} e cria espaço para o recurso secundário de ${secondaryName.toLowerCase()} (${pct(sv)}). ${n.leadership}`,
    communication: `Comece pela forma de informação que o perfil acessa melhor e depois calibre ritmo e profundidade. ${n.communication} Em conversas sensíveis, confirme entendimento em vez de presumir que a intenção foi percebida como desejado.`,
    delegation: p === "D" ? "Delegue com objetivo, autonomia, limite de decisão e prazo; evite microgerenciamento." : p === "I" ? "Delegue com objetivo, contexto, espaço de interação e checkpoints curtos; conecte a tarefa ao impacto nas pessoas." : p === "S" ? "Delegue com contexto, sequência, apoio e previsibilidade; avise mudanças relevantes com antecedência quando possível." : "Delegue com objetivo, critérios, dados, padrão de qualidade e definição clara do que pode ser decidido sem nova validação.",
    feedback: p === "D" ? "Seja direto, específico e orientado a resultado: o que aconteceu, impacto, padrão esperado e próximo passo." : p === "I" ? "Comece pela conexão, reconheça contribuição e depois trate o ajuste com exemplos concretos e compromisso de ação." : p === "S" ? "Crie segurança para a conversa, explique o motivo do ajuste e combine uma mudança gradual e observável." : "Apresente fatos, critérios, exemplos e padrão esperado; permita perguntas e tempo para processar a informação.",
    motivation: p === "D" ? "Metas desafiadoras, autonomia, responsabilidade e percepção de avanço." : p === "I" ? "Interação, reconhecimento, influência, variedade e possibilidade de mobilizar pessoas." : p === "S" ? "Confiança, estabilidade, cooperação, pertencimento e previsibilidade suficiente para produzir bem." : "Qualidade, clareza, competência, critérios, domínio técnico e redução de erros evitáveis.",
    avoid: p === "D" ? "Excesso de controle, demora sem propósito e instruções que retiram autonomia." : p === "I" ? "Isolamento prolongado, comunicação fria sem contexto e ausência total de reconhecimento." : p === "S" ? "Mudanças bruscas sem contexto, pressão relacional desnecessária e instabilidade contínua." : "Ambiguidade, decisões sem critérios e cobrança de velocidade quando faltam informações essenciais.",
    pressure: `${n.pressure} O gestor deve observar o comportamento que aparece sob pressão sem rotulá-lo como defeito: ${DIMENSION_CONTENT[p].attention[0] ?? "avalie possíveis excessos da preferência principal"}.`,
    development: `${primaryImpact.phrase} O desenvolvimento ganha força quando o gestor transforma a tendência em comportamento observável: escolher uma situação, praticar um ajuste, medir efeito e revisar. O recurso secundário (${secondaryName}, ${pct(sv)}) é uma via importante para ampliar repertório.`,
  };
}

export function DiscTechnicalReport({ assessment, scores, computedAt }: { assessment: TechnicalAssessment; scores: ScoreResult; computedAt?: string | null }) {
  const narrative = COMBINATION_NARRATIVES[scores.combination] ?? COMBINATION_NARRATIVES[`${scores.predominant}${scores.secondary}`];
  if (!narrative) return null;
  const m = managementCards(scores);
  const adaptation = scores.adaptationAlert
    ? "A distância entre os perfis merece investigação contextual. Pode representar flexibilidade diante das demandas ou esforço de adaptação prolongado; valide com exemplos concretos antes de concluir."
    : "A distância entre os perfis não acionou alerta automático. Ainda assim, valide em quais ambientes a pessoa amplia, reduz ou alterna comportamentos.";

  return <article className="disc-technical-report" aria-label={`Relatório técnico de ${assessment.candidate_name}`}>
    <TechnicalPage number={1} kicker="Síntese para gestão" title="Leitura técnica APAS DISC" dark>
      <div className="disc-tech-cover-logo"><img src={apasLogo} alt="APAS Soluções" /></div>
      <div className="disc-tech-cover"><div><p>Avaliado</p><h2>{assessment.candidate_name}</h2><span>{assessment.organizations?.name || "Aplicação individual"}</span></div><div className="disc-tech-combo"><strong>{scores.combination}</strong><span>{scores.predominant} primário / {scores.secondary} secundário</span><p>{m.n.title}</p></div></div>
      <div className="disc-tech-meta"><p><CalendarDays />Aplicação<br/><strong>{new Date(assessment.created_at).toLocaleString("pt-BR")}</strong></p><p><Gauge />Duração<br/><strong>{duration(assessment.started_at, assessment.submitted_at)}</strong></p><p><CheckCircle2 />Cobertura<br/><strong>{scores.answeredItems} de {scores.totalItems} blocos</strong></p><p><Compass />Instrumento<br/><strong>{assessment.instrument_version || "APAS DISC 1.2"}</strong></p></div>
      <div className="disc-tech-manager-banner"><Target/><div><strong>Objetivo deste documento</strong><p>Transformar a leitura comportamental em decisões práticas de gestão: liderar, comunicar, delegar, desenvolver, acompanhar e extrair o melhor potencial sem reduzir a pessoa a um rótulo.</p></div></div>
      <p className="disc-tech-confidential">Documento de apoio à gestão e à devolutiva. Não contém respostas brutas, perguntas, fórmulas, pesos ou regras proprietárias.</p>
    </TechnicalPage>

    <TechnicalPage number={2} kicker="Mapa comportamental" title="Três perspectivas para interpretar em conjunto">
      <ProfileMatrix scores={scores}/>
      <div className="disc-tech-callout"><Gauge/><div><h3>Índice de adaptação · {scores.adaptationIndex}</h3><p>{adaptation}</p></div></div>
      <div className="disc-tech-grid">{DIMENSIONS.map((d) => <div key={d}><strong>{d} · {DIMENSION_NAMES[d]}</strong><span>Adaptado · {pct(scores.adapted.percent[d])}</span><p>{getAdaptiveFactorReading(d, scores.adapted.percent[d])}</p></div>)}</div>
      <div className="disc-tech-note"><strong>Leitura gerencial:</strong> Natural mostra uma tendência de resposta mais espontânea; Adaptado mostra como a pessoa está respondendo ao contexto avaliado; Social ajuda a observar a expressão percebida. Use as três perspectivas juntas.</div>
    </TechnicalPage>

    <TechnicalPage number={3} kicker="Primário · percentual · potencial" title="O que o fator principal traz para o trabalho" dark>
      <div className="disc-tech-lead"><strong>{m.p} {pct(m.pv)}</strong><div><h2>{m.primaryImpact.identity}</h2><p>{m.primaryImpact.phrase}</p></div></div>
      <div className="disc-tech-manager-grid">
        <section><h3>Leitura específica do percentual</h3><p>{m.primaryReading}</p></section>
        <section><h3>Recursos para o gestor utilizar</h3><p>{narrative.best.join(" ")}</p></section>
        <section><h3>Possíveis excessos a observar</h3><p>{narrative.excess.join(" ")}</p></section>
        <section><h3>Quando tende a entregar mais</h3><p>{narrative.situations?.work || narrative.best[0]}</p></section>
      </div>
      <div className="disc-tech-callout"><Users/><div><h3>Como extrair o melhor</h3><p>{m.development}</p></div></div>
    </TechnicalPage>

    <TechnicalPage number={4} kicker="Secundário · percentual · complemento" title="O segundo fator também muda a leitura">
      <div className="disc-tech-dual"><section><span>PRIMÁRIO</span><strong>{m.p} · {pct(m.pv)}</strong><h3>{m.primaryImpact.identity}</h3><p>{m.primaryReading}</p></section><section><span>SECUNDÁRIO</span><strong>{m.s} · {pct(m.sv)}</strong><h3>{m.secondaryImpact.identity}</h3><p>{m.secondaryReading}</p></section></div>
      <div className="disc-tech-lead"><strong>{pct(Math.abs(m.pv - m.sv))}</strong><div><h2>Distância entre os fatores</h2><p>{m.n.essence}</p></div></div>
      <div className="disc-tech-manager-grid"><section><h3>Como os dois recursos se combinam</h3><p>{m.n.profilePortrait}</p></section><section><h3>No trabalho</h3><p>{m.n.situations?.work}</p></section><section><h3>Nas relações</h3><p>{m.n.situations?.relationships}</p></section><section><h3>Nas decisões</h3><p>{m.n.situations?.decisions}</p></section></div>
    </TechnicalPage>

    <TechnicalPage number={5} kicker={`Combinação ${scores.combination}`} title="Como esta combinação pode funcionar na prática" dark>
      <div className="disc-tech-combo-reading"><strong>{scores.combination}</strong><div><h2>{m.n.title}</h2><p>{m.n.essence}</p></div></div>
      <div className="disc-tech-themes"><section><MessageCircle/><h3>Comunicação</h3><p>{m.communication}</p></section><section><Compass/><h3>Liderança</h3><p>{m.leadership}</p></section><section><Focus/><h3>Decisão</h3><p>{m.n.decision}</p></section><section><Users/><h3>Equipe</h3><p>{m.n.team}</p></section><section><Gauge/><h3>Pressão</h3><p>{m.pressure}</p></section><section><RefreshCw/><h3>Mudança</h3><p>{m.n.change}</p></section></div>
      <div className="disc-tech-note dark-note"><strong>Importante:</strong> a combinação é contextual. A mesma tendência pode aparecer de forma diferente conforme função, ambiente, experiência, cultura, metas e momento profissional.</div>
    </TechnicalPage>

    <TechnicalPage number={6} kicker="Guia do gestor" title="Como liderar, comunicar e cobrar">
      <div className="disc-tech-manager-grid">
        <section><h3>Como liderar</h3><p>{m.leadership}</p></section>
        <section><h3>Como se comunicar</h3><p>{m.communication}</p></section>
        <section><h3>Como delegar</h3><p>{m.delegation}</p></section>
        <section><h3>Como cobrar</h3><p>{m.n.decision} Transforme expectativa em objetivo, prazo e critério observável.</p></section>
        <section><h3>Como dar feedback</h3><p>{m.feedback}</p></section>
        <section><h3>Como motivar</h3><p>{m.motivation}</p></section>
        <section><h3>O que evitar</h3><p>{m.avoid}</p></section>
        <section><h3>Como reconhecer</h3><p>Reconheça o comportamento que produziu valor, explique o impacto e conecte o reconhecimento ao resultado esperado.</p></section>
      </div>
    </TechnicalPage>

    <TechnicalPage number={7} kicker="Desenvolvimento e desempenho" title="Como desenvolver sem tentar mudar quem a pessoa é" dark>
      <div className="disc-tech-development">
        <section><span>01</span><div><h3>Potencializar o recurso principal</h3><p>{m.primaryImpact.phrase}</p></div></section>
        <section><span>02</span><div><h3>Ampliar o recurso secundário</h3><p>{m.secondaryImpact.phrase}</p></div></section>
        <section><span>03</span><div><h3>Regular excessos</h3><p>{m.pressure}</p></div></section>
        <section><span>04</span><div><h3>Transformar tendência em competência</h3><p>{m.development}</p></div></section>
      </div>
      <div className="disc-tech-manager-grid"><section><h3>O que observar em reuniões</h3><p>{m.n.situations?.relationships}</p></section><section><h3>O que observar em decisões</h3><p>{m.n.situations?.decisions}</p></section><section><h3>O que observar sob pressão</h3><p>{m.pressure}</p></section><section><h3>O que observar em mudanças</h3><p>{m.n.change}</p></section></div>
    </TechnicalPage>

    <TechnicalPage number={8} kicker="Plano de ação gerencial" title="Transforme a leitura em uma solução prática">
      <div className="disc-tech-action-plan">
        <section><strong>Agora</strong><h3>Escolha 1 comportamento</h3><p>{m.n.experiments[0]}</p></section>
        <section><strong>7 dias</strong><h3>Teste no contexto real</h3><p>{m.n.experiments[1]}</p></section>
        <section><strong>15 dias</strong><h3>Recolha evidências</h3><p>{m.n.experiments[2]}</p></section>
        <section><strong>30 dias</strong><h3>Revise e ajuste</h3><p>Compare comportamento observado, resultado e percepção da equipe. Mantenha o que funciona, ajuste o que não funciona e defina o próximo experimento.</p></section>
      </div>
      <div className="disc-tech-checklist"><h3>Checklist do gestor</h3><p>□ Alinhei objetivo, contexto e expectativa.</p><p>□ Adaptei minha comunicação ao perfil sem deixar de ser claro.</p><p>□ Dei autonomia compatível com responsabilidade e maturidade.</p><p>□ Dei feedback sobre comportamento observável e impacto.</p><p>□ Combinei indicador e prazo de acompanhamento.</p><p>□ Registrei evidências que confirmam ou contradizem a hipótese comportamental.</p></div>
      <div className="disc-tech-callout"><CheckCircle2/><div><h3>Princípio de uso</h3><p>DISC não deve decidir sozinho contratação, promoção, desligamento ou distribuição de oportunidades. Ele deve ampliar a qualidade das perguntas, da comunicação e das decisões de gestão, sempre combinado com competências, experiência, desempenho e contexto.</p></div></div>
      <p className="disc-tech-confidential">Gerado em {computedAt ? new Date(computedAt).toLocaleString("pt-BR") : "data não disponível"} · ID {assessment.id}</p><div className="disc-tech-source"><strong>Referência e autoria</strong><p>Referência conceitual histórica: William Moulton Marston, <em>Emotions of Normal People</em> (1928). Esta publicação é a fonte histórica indicada para os estudos conceituais que fundamentam esta leitura comportamental. A interpretação aplicada neste relatório, a linguagem, os textos, o motor adaptativo, as combinações, as recomendações gerenciais e a apresentação do material foram desenvolvidos pela <strong>APAS Soluções</strong>.</p><p>Este documento não reproduz textos, tabelas, instrumentos proprietários ou layout de terceiros. O resultado deve ser interpretado como apoio à gestão e em conjunto com contexto, competências, experiência e desempenho.</p></div>
    </TechnicalPage>
  </article>;
}