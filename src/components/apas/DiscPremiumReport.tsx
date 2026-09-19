import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ArrowUpRight, Check, Compass, Focus, Gauge, Lightbulb, MessageCircle, Network, RefreshCw, Scale, Sprout, Users } from "lucide-react";
import coverArtwork from "@/assets/disc-editorial-cover.jpg";
import selfArtwork from "@/assets/disc-editorial-self.jpg";
import dialogueArtwork from "@/assets/disc-editorial-dialogue.jpg";
import growthArtwork from "@/assets/disc-editorial-growth.jpg";
import type { ScoreResult, DimensionMap, ProfileVector } from "@/lib/disc/scoring";
import { DIMENSIONS, DIMENSION_NAMES, type Dimension } from "@/lib/disc/instrument";
import { APAS_DISCLAIMER, DEVELOPMENT_FRAMEWORK, DIMENSION_CONTENT } from "@/lib/disc/content";
import { COMBINATION_NARRATIVES, FACTOR_SHORT } from "@/lib/disc/report-content";

const FACTOR_CLASS: Record<Dimension, string> = { D: "disc-factor-d", I: "disc-factor-i", S: "disc-factor-s", C: "disc-factor-c" };
type ReportAssessment = { id: string; candidate_name: string; role_title?: string | null; instrument_version?: string | null; submitted_at?: string | null; organizations?: { name?: string | null } | null };
type Signal = "strength" | "observe" | "attention" | "tip";

function ApasBrand({ inverse = false }: { inverse?: boolean }) {
  return <span className={`disc-brand ${inverse ? "disc-brand-inverse" : ""}`} aria-label="APAS Soluções"><strong>APAS</strong><span>SOLUÇÕES</span></span>;
}

function Page({ number, title, eyebrow, icon: Icon, children, cover = false, dark = false, artwork }: { number: number; title?: string; eyebrow?: string; icon?: LucideIcon; children: ReactNode; cover?: boolean; dark?: boolean; artwork?: string }) {
  return <section className={`disc-page ${cover ? "disc-cover" : ""} ${dark ? "disc-page-dark" : ""}`} data-page={number}>
    {artwork && <img className="disc-page-art" src={artwork} loading="lazy" width={1024} height={1280} alt="" aria-hidden="true" />}
    {!cover && <div className="disc-page-geometry" aria-hidden="true"><span /><span /><span /></div>}
    {!cover && <div className="disc-page-header"><ApasBrand /><span>APAS DISC · Relatório de Perfil Comportamental</span></div>}
    <div className="disc-page-body">{eyebrow && <p className="disc-kicker">{eyebrow}</p>}{title && <div className="disc-title-row">{Icon && <Icon aria-hidden="true" />}<h2 className="disc-page-title">{title}</h2></div>}{children}</div>
    {!cover && <div className="disc-page-footer"><ApasBrand /><span>Uso individual · {String(number).padStart(2, "0")}</span></div>}
  </section>;
}

function SignalCard({ type, title, children }: { type: Signal; title: string; children: ReactNode }) {
  const icons = { strength: Check, observe: Lightbulb, attention: AlertTriangle, tip: ArrowUpRight };
  const Icon = icons[type];
  return <div className={`disc-signal disc-signal-${type}`}><div className="disc-signal-icon"><Icon aria-hidden="true" /></div><div><h3>{title}</h3><div>{children}</div></div></div>;
}

function SignalList({ type, title, items }: { type: Signal; title: string; items: string[] }) {
  return <SignalCard type={type} title={title}><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></SignalCard>;
}

function FactorMark({ dimension, percent }: { dimension: Dimension; percent?: number }) {
  return <div className={`disc-factor ${FACTOR_CLASS[dimension]}`}><span>{dimension}</span><div><strong>{DIMENSION_NAMES[dimension]}</strong>{percent !== undefined && <small>{percent}%</small>}</div></div>;
}

function ProfileTable({ vectors }: { vectors: { label: string; value: ProfileVector }[] }) {
  return <div className="disc-table-wrap"><table className="disc-table"><thead><tr><th>Fator</th>{vectors.map((v) => <th key={v.label}>{v.label}</th>)}</tr></thead><tbody>{DIMENSIONS.map((d) => <tr key={d}><td><strong>{d}</strong> · {DIMENSION_NAMES[d]}</td>{vectors.map((v) => <td key={v.label}>{v.value.percent[d]}%</td>)}</tr>)}</tbody></table></div>;
}

function ProfileBars({ title, subtitle, values }: { title: string; subtitle: string; values: DimensionMap }) {
  return <div className="disc-profile-panel"><h3>{title}</h3><p>{subtitle}</p><div className="disc-intensity-chart" aria-label={`Intensidades do perfil ${title}`}>{DIMENSIONS.map((d) => <div className="disc-intensity-column" key={d}><div className="disc-intensity-scale"><span className={FACTOR_CLASS[d]} style={{ height: `${values[d]}%` }} /></div><strong>{values[d]}%</strong><span>{d}</span><small>{DIMENSION_NAMES[d]}</small></div>)}</div></div>;
}

function ThemeBlock({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return <section className="disc-theme-block"><Icon aria-hidden="true" /><div><h3>{title}</h3><p>{children}</p></div></section>;
}

export function DiscPremiumReport({ assessment, scores }: { assessment: ReportAssessment; scores: ScoreResult }) {
  const primary = DIMENSION_CONTENT[scores.predominant];
  const secondary = DIMENSION_CONTENT[scores.secondary];
  const narrative = COMBINATION_NARRATIVES[scores.combination] ?? COMBINATION_NARRATIVES["DI"];
  if (!narrative) return null;
  const date = assessment.submitted_at ? new Date(assessment.submitted_at).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR");
  const adaptationText = scores.adaptationAlert ? "A distância entre espontaneidade e demanda percebida merece atenção. Ela pode indicar flexibilidade, mas também esforço continuado — uma hipótese para validar no seu contexto." : "A distância entre espontaneidade e demanda percebida está em uma faixa sem alerta automático. Observe, ainda assim, quais contextos ampliam ou reduzem sua energia.";

  return <article className="disc-report" aria-label={`Relatório DISC de ${assessment.candidate_name}`}>
    <Page number={1} cover><img className="disc-cover-art" src={coverArtwork} width={1400} height={1800} alt="Composição geométrica abstrata que representa direção, conexão e equilíbrio" /><div className="disc-cover-overlay" /><div className="disc-cover-brand"><ApasBrand inverse /><span>DISC</span><small>1.2</small></div><div className="disc-cover-copy"><p>Relatório de Perfil Comportamental</p><h1>{assessment.candidate_name}</h1><blockquote>Consciência para reconhecer padrões. Liberdade para escolher como agir.</blockquote></div><div className="disc-cover-factors">{DIMENSIONS.map((d) => <FactorMark key={d} dimension={d} />)}</div><div className="disc-cover-meta"><div><span>Relatório individual</span><span>{assessment.role_title || assessment.organizations?.name || "Autoconhecimento profissional"}</span></div><div><ApasBrand inverse /><span>{date}</span></div></div></Page>

    <Page number={2} eyebrow="Antes de olhar o resultado" title="Você não é um número." icon={Compass} artwork={selfArtwork}><p className="disc-opening">O resultado deste relatório não pretende colocar você dentro de uma caixa ou definir quem você é. Ele mostra tendências sobre a forma como você costuma agir, decidir, se comunicar e responder às situações do dia a dia.</p><div className="disc-editorial-quote">Toda leitura ganha sentido quando encontra a sua história, o seu contexto e as suas escolhas.</div><div className="disc-two-columns"><SignalList type="strength" title="O que esta leitura oferece" items={["Uma linguagem para reconhecer preferências", "Hipóteses para conversas e desenvolvimento", "Pistas sobre energia, contexto e adaptação"]}/><SignalList type="attention" title="O que ela não define" items={["Sua personalidade completa ou seu caráter", "Sua inteligência ou competência técnica", "Um limite permanente para suas escolhas"]}/></div><p className="disc-foundation">A referência conceitual parte dos estudos de William Moulton Marston em <em>Emotions of Normal People</em> (1928). A aplicação e a linguagem deste relatório são autorais da APAS.</p><p className="disc-note">{APAS_DISCLAIMER}</p></Page>

    <Page number={3} eyebrow="Seu perfil em números" title="Três perspectivas do mesmo repertório" icon={Gauge}><div className="disc-profile-grid"><ProfileBars title="Natural" subtitle="Como tende a agir quando está mais à vontade." values={scores.natural.percent}/><ProfileBars title="Adaptado" subtitle="Como ajusta o comportamento às exigências percebidas." values={scores.adapted.percent}/><ProfileBars title="Social" subtitle="Como acredita que precisa se apresentar no ambiente." values={scores.social.percent}/></div><ProfileTable vectors={[{ label: "Natural", value: scores.natural }, { label: "Adaptado", value: scores.adapted }, { label: "Social", value: scores.social }]}/><div className="disc-index"><span>Índice de adaptação</span><strong>{scores.adaptationIndex}</strong><p>{adaptationText}</p></div><p className="disc-note">Nenhuma perspectiva é melhor. Juntas, elas ajudam a compreender repertório e contexto. Gráfico e tabela usam exatamente os mesmos percentuais calculados para esta aplicação.</p></Page>

    <Page number={4} dark eyebrow="Leitura central" title="Seu jeito de agir" icon={Focus}><div className="disc-combination"><span>{scores.combination}</span><div><small>{scores.combinationLabel ?? `${scores.predominant} primário · ${scores.secondary} secundário`}</small><h3>{narrative.title}</h3><p>{narrative.essence}</p></div></div><p className="disc-highlight">Sua leitura principal reúne {FACTOR_SHORT[scores.predominant]} com {FACTOR_SHORT[scores.secondary]}. Isso descreve uma preferência observada, não uma identidade fixa.</p><div className="disc-factor-grid">{DIMENSIONS.map((d) => <FactorMark key={d} dimension={d} percent={scores.adapted.percent[d]} />)}</div><SignalCard type="observe" title="Uma hipótese para validar"><p>Em quais situações essa combinação aparece de forma produtiva? E em quais situações você precisa acessar comportamentos diferentes?</p></SignalCard></Page>

    <Page number={5} eyebrow="Recursos" title="Quando você está no seu melhor" icon={Sprout}><p className="disc-opening">Quando contexto, clareza e energia se alinham, estas são contribuições que podem aparecer com mais naturalidade.</p><SignalList type="strength" title="Recursos da sua combinação" items={narrative.best}/><div className="disc-two-columns"><SignalList type="strength" title={`Contribuição de ${scores.predominant}`} items={primary.strengths.slice(0, 3)}/><SignalList type="tip" title={`Apoio de ${scores.secondary}`} items={secondary.strengths.slice(0, 3)}/></div><div className="disc-editorial-quote">Força não é um elogio automático: é um recurso que produz valor quando encontra intenção, contexto e medida.</div></Page>

    <Page number={6} eyebrow="Consciência" title="O que pode exigir mais atenção" icon={AlertTriangle}><p className="disc-opening">Todo comportamento que representa uma força também pode se tornar um excesso quando utilizado fora de contexto.</p><SignalList type="attention" title="Possíveis excessos da combinação" items={narrative.excess}/><div className="disc-two-columns"><SignalList type="observe" title="Vale observar" items={primary.attention.slice(0, 3)}/><SignalCard type="tip" title="Experimente"><p>Antes de repetir sua resposta mais confortável, pergunte: o que esta situação realmente pede de mim agora — velocidade, vínculo, constância ou critério?</p></SignalCard></div><p className="disc-note">Pontos de atenção não são defeitos. São hipóteses sobre custos possíveis de uma preferência intensificada por pressão, cansaço ou conflito.</p></Page>

    <Page number={7} dark eyebrow="Intenção e impacto" title="Como você pode ser percebido" icon={Users} artwork={dialogueArtwork}><div className="disc-perception"><div><span>01</span><h3>Sua intenção</h3><p>Contribuir por meio de {FACTOR_SHORT[scores.predominant]}, usando também {FACTOR_SHORT[scores.secondary]} para ampliar impacto.</p></div><div><span>02</span><h3>O efeito possível</h3><p>{narrative.perceived}</p></div></div><SignalCard type="observe" title="Reflexão"><p>Que diferença existe entre o que você deseja provocar e o que as pessoas de fato experimentam na sua presença?</p></SignalCard><SignalCard type="tip" title="Uma conversa útil"><p>Peça a duas pessoas de confiança um exemplo de quando seu estilo ajudou o trabalho e outro de quando poderia ter sido ajustado.</p></SignalCard></Page>

    <Page number={8} eyebrow="Relações" title="Comunicação que aproxima e move" icon={MessageCircle}><div className="disc-signal-grid"><SignalCard type="strength" title="Quando está no seu melhor"><p>{narrative.communication}</p></SignalCard><SignalCard type="observe" title="Vale observar"><p>Se a mensagem foi compreendida, se houve espaço real para resposta e se os acordos ficaram claros.</p></SignalCard><SignalCard type="attention" title="Ponto de atenção"><p>{primary.attention[0]}.</p></SignalCard><SignalCard type="tip" title="Experimente"><p>{primary.development[0]}. Ao final, confirme quem fará o quê e até quando.</p></SignalCard></div><div className="disc-editorial-quote">Comunicar não é apenas expressar intenção. É também observar o efeito e ajustar a forma sem perder autenticidade.</div></Page>

    <Page number={9} eyebrow="Atuação com pessoas" title="Decisão, liderança e equipe" icon={Network}><div className="disc-section-stack"><ThemeBlock icon={Focus} title="Decisão">{narrative.decision}</ThemeBlock><ThemeBlock icon={Compass} title="Liderança">{narrative.leadership}</ThemeBlock><ThemeBlock icon={Users} title="Equipe e colaboração">{narrative.team}</ThemeBlock></div><SignalCard type="tip" title="Pergunta de escolha"><p>Qual comportamento dos fatores menos presentes poderia melhorar a qualidade da próxima decisão coletiva?</p></SignalCard></Page>

    <Page number={10} dark eyebrow="Contextos exigentes" title="Pressão e mudanças" icon={RefreshCw}><div className="disc-context-grid"><ThemeBlock icon={Scale} title="Sob pressão">{narrative.pressure}</ThemeBlock><ThemeBlock icon={RefreshCw} title="Diante de mudanças">{narrative.change}</ThemeBlock></div><SignalList type="attention" title="Sinais para perceber cedo" items={[...primary.attention.slice(0, 2), ...secondary.attention.slice(0, 2)]}/><SignalCard type="observe" title="Equilíbrio"><p>Adaptação saudável amplia repertório. Quando exige esforço constante, pode pedir renegociação de contexto, prioridades ou apoio.</p></SignalCard></Page>

    <Page number={11} eyebrow="Prática" title="Seu desenvolvimento em 30 dias" icon={Sprout} artwork={growthArtwork}><p className="disc-opening">Desenvolvimento não exige negar seu estilo. Exige ampliar opções para responder melhor ao que cada situação pede.</p><div className="disc-plan">{narrative.experiments.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{["Escolha", "Pratique", "Observe"][index]}</h3><p>{item}</p></div></div>)}</div><div className="disc-action-box"><h3>Meu experimento de 30 dias</h3><p>Comportamento que quero praticar:</p><div/><p>Situação em que vou experimentar:</p><div/><p>Pessoa que poderá me dar retorno:</p><div/><p>Sinal concreto de progresso:</p><div/></div><p className="disc-note">{DEVELOPMENT_FRAMEWORK.slice(0, 3).join(" ")}</p></Page>

    <Page number={12} dark eyebrow="Continuidade" title="Seu perfil não é um destino" icon={ArrowUpRight}><p className="disc-closing">Quanto maior sua consciência sobre seus próprios padrões, maior pode ser sua capacidade de escolher como agir.</p><div className="disc-combination"><span>{scores.combination}</span><div><h3>{narrative.title}</h3><p>Use esta combinação como linguagem para investigar experiências, não como caixa, rótulo ou justificativa automática.</p></div></div><div className="disc-two-columns"><SignalCard type="strength" title="Leve com você"><p>Os quatro fatores fazem parte do seu repertório. Seu resultado mostra preferências relativas neste momento.</p></SignalCard><SignalCard type="tip" title="Próximo passo"><p>Valide estas hipóteses em uma devolutiva e escolha uma ação simples, observável e relevante para os próximos 30 dias.</p></SignalCard></div><p className="disc-note">{APAS_DISCLAIMER}</p><div className="disc-signature"><ApasBrand inverse /><span>Relatório individual · {assessment.instrument_version || "APAS DISC 1.2"} · {date}</span></div></Page>
  </article>;
}