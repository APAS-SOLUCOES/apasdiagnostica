import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ArrowUpRight, BarChart3, Check, Compass, Focus, Gauge, Leaf, Lightbulb, MessageCircle, Network, Settings2, Sprout, Users, UsersRound } from "lucide-react";
const coverArtwork = "https://images.unsplash.com/photo-1626220109861-a6bcc8c5b601?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=90&w=2400";
const attentionLeafArtwork = "https://images.unsplash.com/photo-1552152974-19b9caf99137?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=90&w=2400";
const decisionCompassArtwork = "https://images.unsplash.com/photo-1495153003981-0945a0a25e46?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=90&w=2400";
const teamHandsArtwork = "https://images.unsplash.com/photo-1702047109910-43af92894dc1?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=90&w=2400";
import dialogueArtwork from "@/assets/disc-editorial-dialogue.jpg";
import selfArtwork from "@/assets/disc-editorial-self.jpg";
const apasLogoDark = "/apas-logo.svg";
const apasLogoLight = "/apas-logo-dark.svg";
import type { ScoreResult, DimensionMap } from "@/lib/disc/scoring";
import { DIMENSIONS, DIMENSION_NAMES, type Dimension } from "@/lib/disc/instrument";
import { APAS_DISCLAIMER, DEVELOPMENT_FRAMEWORK, DIMENSION_CONTENT } from "@/lib/disc/content";
import { FACTOR_SHORT } from "@/lib/disc/report-content";
import { getAdaptiveFactorImpact, getAdaptiveNarrative } from "@/lib/disc/adaptive-content";

const FACTOR_CLASS: Record<Dimension, string> = { D: "disc-factor-d", I: "disc-factor-i", S: "disc-factor-s", C: "disc-factor-c" };
type ReportAssessment = { id: string; candidate_name: string; role_title?: string | null; instrument_version?: string | null; submitted_at?: string | null; organizations?: { name?: string | null } | null };
type Signal = "strength" | "observe" | "attention" | "tip";

function ApasBrand({ inverse = false }: { inverse?: boolean }) {
  const logo = inverse ? apasLogoDark : apasLogoLight;
  return <span className={`disc-brand ${inverse ? "disc-brand-inverse" : ""}`} aria-label="APAS Soluções"><img className="disc-brand-logo" src={logo} alt="APAS Soluções" /></span>;
}

function Page({ number, title, subtitle, eyebrow, icon: Icon, children, cover = false, dark = [3, 6, 8, 10, 12].includes(number) }: { number: number; title?: string; subtitle?: string; eyebrow?: string; icon?: LucideIcon; children: ReactNode; cover?: boolean; dark?: boolean }) {
  return <section className={`disc-page ${dark ? "disc-page-dark" : ""} ${cover ? "disc-cover" : ""}`} data-page={number}>
    {!cover && <div className="disc-page-header"><span>APAS DISC · Relatório de Perfil Comportamental</span>{number === 3 && <span>SEU PERFIL</span>}</div>}
    <div className="disc-page-body">{eyebrow && <p className="disc-kicker">{eyebrow}</p>}{title && <div className="disc-title-row">{Icon && <Icon aria-hidden="true" />}<h2 className="disc-page-title">{title}</h2></div>}{subtitle && <p className="disc-page-subtitle">{subtitle}</p>}{children}</div>
    {!cover && <div className="disc-page-footer"><ApasBrand inverse={dark} /><span>Uso individual · {String(number).padStart(2, "0")}</span></div>}
  </section>;
}

function EditorialImage({ src, alt, position = "right" }: { src: string; alt: string; position?: "left" | "right" }) {
  return <figure className={`disc-editorial-image disc-editorial-image-${position}`}><img src={src} alt={alt} loading="eager" /></figure>;
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

function ProfileBars({ title, subtitle, values }: { title: string; subtitle: string; values: DimensionMap }) {
  return <div className="disc-profile-panel"><h3>{title}</h3><p>{subtitle}</p><div className="disc-horizontal-chart" aria-label={`Intensidades do perfil ${title}`}>{DIMENSIONS.map((d) => <div className="disc-horizontal-row" key={d}><strong className={FACTOR_CLASS[d]}>{d}</strong><div className="disc-horizontal-track"><span className={"disc-meter-fill " + FACTOR_CLASS[d]} style={{ width: Math.min(100, Math.max(0, values[d])) + "%" }} /></div><b>{values[d]}%</b></div>)}</div></div>;
}

function ProfileDonut({ values, combination }: { values: DimensionMap; combination: string }) {
  const donutStyle = {
    "--d": values.D + "%",
    "--i": (values.D + values.I) + "%",
    "--s": (values.D + values.I + values.S) + "%",
  } as CSSProperties;

  const factors = [
    { dimension: "D", value: values.D, name: "DOMINÂNCIA", description: "Foco em resultados, decisão e movimento para fazer acontecer.", className: "d", icon: BarChart3 },
    { dimension: "I", value: values.I, name: "INFLUÊNCIA", description: "Comunicação, conexão e capacidade de engajar pessoas.", className: "i", icon: UsersRound },
    { dimension: "S", value: values.S, name: "ESTABILIDADE", description: "Constância, cooperação e ambiente harmonioso para evoluir.", className: "s", icon: Leaf },
    { dimension: "C", value: values.C, name: "CONFORMIDADE", description: "Organização, análise e atenção a padrões e qualidade.", className: "c", icon: Settings2 },
  ];

  return <div className="disc-profile-wheel" role="img" aria-label={"Distribuição do perfil adaptado: D " + values.D + "%, I " + values.I + "%, S " + values.S + "%, C " + values.C + "%"}>
    <div className="disc-wheel-premium disc-wheel-approved">
      {factors.map(({ dimension, value, name, description, className, icon: Icon }) => (
        <div key={dimension} className={"disc-wheel-callout disc-wheel-callout-" + className}>
          <strong>{value}%</strong>
          <b>{name}</b>
          <p>{description}</p>
          <span className="disc-wheel-connector" aria-hidden="true"><i /></span>
        </div>
      ))}

      <div className="disc-wheel-stage">
        <div className="disc-wheel-halo" aria-hidden="true" />
        <div className="disc-profile-donut" style={donutStyle}>
          {factors.map(({ dimension, className, icon: Icon }) => (
            <div key={dimension} className={"disc-wheel-quadrant disc-wheel-quadrant-" + className}>
              <strong>{dimension}</strong>
              <Icon aria-hidden="true" />
            </div>
          ))}
          <div className="disc-wheel-center">
            <strong>{combination}</strong>
            <small>Seu perfil<br />primário | secundário</small>
          </div>
        </div>
        <div className="disc-wheel-ring" aria-hidden="true" />
      </div>
    </div>
  </div>;
}
function ThemeBlock({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return <section className="disc-theme-block"><Icon aria-hidden="true" /><div><h3>{title}</h3><p>{children}</p></div></section>;
}

export function DiscPremiumReport({ assessment, scores }: { assessment: ReportAssessment; scores: ScoreResult }) {
  const primary = DIMENSION_CONTENT[scores.predominant];
  const secondary = DIMENSION_CONTENT[scores.secondary];
  const narrative = getAdaptiveNarrative(scores);
  const primaryImpact = getAdaptiveFactorImpact(scores.predominant, scores.adapted.percent[scores.predominant]);
  if (!narrative) return null;
  const date = assessment.submitted_at ? new Date(assessment.submitted_at).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR");
  const adaptationText = scores.adaptationAlert ? "A distância entre espontaneidade e demanda percebida merece atenção. Ela pode indicar flexibilidade, mas também esforço continuado — uma hipótese para validar no seu contexto." : "A distância entre espontaneidade e demanda percebida está em uma faixa sem alerta automático. Observe, ainda assim, quais contextos ampliam ou reduzem sua energia.";

  return <article className="disc-report" aria-label={`Relatório DISC de ${assessment.candidate_name}`}>
    <Page number={1} cover><img className="disc-cover-art" src={coverArtwork} width={1400} height={1800} alt="Montanha ao amanhecer, referência visual aprovada para a capa do APAS DISC" /><div className="disc-cover-overlay" /><div className="disc-cover-wordmark" aria-hidden="true">DISC</div><div className="disc-cover-brand"><ApasBrand inverse /></div><div className="disc-cover-copy"><p>Relatório de Perfil Comportamental</p><h1>{assessment.candidate_name}</h1><blockquote>Mais consciência. Melhores escolhas. Grandes resultados.</blockquote></div><div className="disc-cover-factors">{DIMENSIONS.map((d) => <FactorMark key={d} dimension={d} />)}</div><div className="disc-cover-meta"><div><span>Relatório individual</span><span>{assessment.role_title || assessment.organizations?.name || "Autoconhecimento profissional"}</span></div><div><ApasBrand inverse /><span>{date}</span></div></div></Page>

    <Page number={2} eyebrow="01. Antes de olhar o resultado" title="Você não é um número." icon={Compass}><p className="disc-opening">O resultado deste relatório não pretende colocar você dentro de uma caixa ou definir quem você é. Ele mostra tendências sobre a forma como você costuma agir, decidir, se comunicar e responder às situações do dia a dia.</p><p className="disc-body-copy">Algumas partes podem parecer muito familiares. Outras podem provocar reflexão. O importante é usar este material para ampliar sua percepção sobre como você funciona.</p><div className="disc-editorial-quote">“O autoconhecimento é o primeiro passo para escolhas mais conscientes e resultados mais consistentes.”</div><p className="disc-body-copy">Nas páginas seguintes, você encontrará uma leitura prática do seu resultado: como tende a agir, se comunicar, decidir, se relacionar e se desenvolver.</p><p className="disc-foundation">A referência conceitual parte dos estudos de William Moulton Marston em <em>Emotions of Normal People</em> (1928). A aplicação e a linguagem deste relatório são autorais da APAS.</p></Page>

    <Page number={3}><div className="disc-profile-overview"><ProfileDonut values={scores.adapted.percent} combination={scores.combination}/><div className="disc-profile-grid"><ProfileBars title="Natural" subtitle="Como tende a agir quando está mais à vontade." values={scores.natural.percent}/><ProfileBars title="Adaptado" subtitle="Como ajusta o comportamento às exigências percebidas." values={scores.adapted.percent}/><ProfileBars title="Social" subtitle="Como acredita que precisa se apresentar no ambiente." values={scores.social.percent}/></div></div><div className="disc-index"><span>Índice de adaptação</span><strong>{scores.adaptationIndex}</strong><p>{adaptationText}</p></div><p className="disc-note">Nenhuma perspectiva é melhor. Juntas, elas ajudam a compreender repertório e contexto. As barras e o gráfico representam visualmente os valores calculados para esta aplicação.</p></Page>

    <Page number={4} eyebrow="03. Seu jeito de agir" title="Seu jeito de agir" subtitle="Determinação e conexão em equilíbrio" icon={Focus}><p className="disc-profile-identity">{narrative.title}</p><p className="disc-opening">Seu resultado indica uma predominância de {DIMENSION_NAMES[scores.predominant]} — {scores.predominant}, acompanhada por características de {DIMENSION_NAMES[scores.secondary]} — {scores.secondary}.</p><p className="disc-body-copy">{narrative.profilePortrait}</p><p className="disc-body-copy">{narrative.essence}</p><div className="disc-impact-intro"><span>{primaryImpact.identity}</span><h4>{primaryImpact.phrase}</h4></div><div className="disc-highlight"><strong>Em poucas palavras:</strong> {narrative.best[0]}</div></Page>

    <Page number={5} eyebrow="04. Seus pontos fortes" title="Seus pontos fortes" subtitle="Recursos que você já leva com você" icon={Sprout}><p className="disc-opening">Recursos que você já leva com você e que podem aparecer com mais naturalidade quando o contexto favorece seu repertório.</p><div className="disc-strength-grid">{primary.strengths.slice(0, 4).map((item, index) => <div key={item}><span>0{index + 1}</span><Check aria-hidden="true" /><p>{item}</p></div>)}</div><div className="disc-bottom-callout"><strong>Em contexto:</strong> {narrative.situations?.work ?? narrative.best[0]}</div></Page>

    <Page number={6} eyebrow="05. O que pode exigir mais atenção" title="O que pode exigir mais atenção" subtitle="Equilíbrio também é resultado" icon={AlertTriangle}><div className="disc-page-hero-art disc-page-hero-art-dark"><img src={attentionLeafArtwork} alt="Folhagem escura, referência visual aprovada para pontos de atenção" aria-hidden="true" /><div /></div><div className="disc-page-atmosphere-content"><p className="disc-opening">Todo comportamento que representa uma força também pode se tornar um excesso quando utilizado fora de contexto.</p><SignalList type="attention" title="Vale observar" items={primary.attention.slice(0, 3)}/><SignalList type="attention" title={`Na sua combinação ${scores.combination}`} items={narrative.excess.slice(0, 3)}/><SignalCard type="attention" title="Isso não significa que exista algo “errado”"><p>Pontos de atenção são hipóteses sobre custos possíveis de uma preferência intensificada por pressão, cansaço ou conflito. O mesmo comportamento pode produzir resultado ou ruído dependendo da situação.</p></SignalCard></div></Page>

    <Page number={7} eyebrow="06. Como você pode ser percebido" title="Como você pode ser percebido" subtitle="A impressão que você provoca nos outros" icon={Users}><div className="disc-perception-watermark" aria-hidden="true"><span>PERCEPÇÃO</span><i /></div><p className="disc-opening">A impressão que você provoca nos outros pode ser diferente da intenção que existe por trás do seu comportamento.</p><div className="disc-perception"><div><span>01</span><h3>Como tende a agir</h3><p>{FACTOR_SHORT[scores.predominant]} aparece com mais força no seu resultado.</p></div><div><span>02</span><h3>O que pode transmitir</h3><p>{primary.characteristics[0]}.</p></div><div><span>03</span><h3>O que pode ampliar</h3><p>{secondary.characteristics[0]}.</p></div><div><span>04</span><h3>Em situações de pressão</h3><p>{narrative.perceived}</p></div></div><SignalCard type="observe" title="Reflexão"><p>Que diferença existe entre o que você deseja provocar e o que as pessoas de fato experimentam na sua presença?</p></SignalCard></Page>

    <Page number={8} eyebrow="07. Comunicação" title="Comunicação" subtitle="Como você tende a se expressar" icon={MessageCircle}><EditorialImage src={dialogueArtwork} alt="Composição editorial sobre comunicação" position="right" /><div className="disc-signal-grid"><SignalCard type="strength" title="Quando está no seu melhor"><p>{narrative.communication}</p></SignalCard><SignalCard type="observe" title="Vale observar"><p>Se a mensagem foi compreendida, se houve espaço real para resposta e se os acordos ficaram claros.</p></SignalCard><SignalCard type="attention" title="Ponto de atenção"><p>{primary.attention[0]}.</p></SignalCard><SignalCard type="tip" title="Experimente"><p>{primary.development[0]}. Ao final, confirme quem fará o quê e até quando.</p></SignalCard></div></Page>

    <Page number={9} eyebrow="08. Decisão" title="Decisão" subtitle="Como você tende a escolher" icon={Network}><div className="disc-banner-art"><img src={decisionCompassArtwork} alt="Imagem editorial sobre direção e escolhas" /></div><p className="disc-opening">Como você tende a escolher e o que pode acontecer quando a decisão exige velocidade, informação, pessoas e consequência ao mesmo tempo.</p><div className="disc-signal-grid disc-signal-grid-compact"><SignalCard type="strength" title="No seu melhor"><p>{narrative.situations?.decisions ?? narrative.decision}</p></SignalCard><SignalCard type="observe" title="Vale observar"><p>Quando há muitas informações, pode ser útil desacelerar o suficiente para considerar o fator complementar antes de concluir.</p></SignalCard><SignalCard type="attention" title="Ponto de atenção"><p>{primary.attention[0]}.</p></SignalCard><SignalCard type="tip" title="Dica"><p>Antes de decidir, faça uma pausa curta e pergunte: “O que ainda preciso considerar antes de escolher?”</p></SignalCard></div></Page>

    <Page number={10} eyebrow="09. Relacionamentos e equipe" title="Relacionamentos e equipe" subtitle="Juntos, os resultados vão mais longe" icon={Users}><div className="disc-banner-art disc-banner-art-dark"><img src={teamHandsArtwork} alt="Mãos sobrepostas em gesto de equipe, referência visual aprovada para relacionamentos" /><div /></div><p className="disc-opening">Juntos, os resultados vão mais longe. Seu estilo influencia a maneira como você se conecta, lidera e participa de um grupo.</p><div className="disc-signal-grid disc-signal-grid-compact"><SignalCard type="strength" title="O que te fortalece"><p>{narrative.situations?.leadership ?? narrative.leadership}</p></SignalCard><SignalCard type="observe" title="Vale observar"><p>{narrative.situations?.relationships ?? narrative.perceived}</p></SignalCard><SignalCard type="attention" title="Ponto de atenção"><p>{secondary.attention[0]}.</p></SignalCard><SignalCard type="tip" title="Lembre-se"><p>Grandes resultados são construídos com pessoas, não apenas com esforço individual.</p></SignalCard></div></Page>

    <Page number={11} eyebrow="10. Seu desenvolvimento" title="Seu desenvolvimento" subtitle="Mais consciência, mais escolha" icon={Sprout}><p className="disc-opening">Desenvolvimento não exige negar seu estilo. Exige ampliar opções para responder melhor ao que cada situação pede.</p><div className="disc-development-grid">{[...narrative.experiments, `Para transformar consciência em resultado, acompanhe por 30 dias um sinal concreto de mudança: quando você acessa deliberadamente o recurso complementar de ${DIMENSION_NAMES[scores.secondary].toLowerCase()} (${scores.adapted.percent[scores.secondary]}%) em situações que normalmente ativam ${DIMENSION_NAMES[scores.predominant].toLowerCase()}.`].slice(0, 4).map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{["O que já está no seu repertório", "O que pode ser ajustado", "O que pode ser ampliado", "O que pode gerar mais resultado"][index]}</h3><p>{item}</p></div></div>)}</div><div className="disc-action-box"><h3>Meu experimento de 30 dias</h3><p>Comportamento que quero praticar:</p><div/><p>Situação em que vou experimentar:</p><div/><p>Pessoa que poderá me dar retorno:</p><div/><p>Sinal concreto de progresso:</p><div/></div><p className="disc-note">{DEVELOPMENT_FRAMEWORK.slice(0, 3).join(" ")}</p></Page>

    <Page number={12} eyebrow="11. Seu perfil não é um destino" title="Seu perfil não é um destino" icon={ArrowUpRight}><p className="disc-closing">{narrative.profilePortrait} Quanto maior sua consciência sobre seus próprios padrões, maior pode ser sua capacidade de escolher como agir.</p><div className="disc-combination"><span>{scores.combination}</span><div><h3>{narrative.title}</h3><p>Seu resultado de {scores.adapted.percent[scores.predominant]}% em {DIMENSION_NAMES[scores.predominant]} e {scores.adapted.percent[scores.secondary]}% em {DIMENSION_NAMES[scores.secondary]} sugere um repertório com características próprias. Use esta combinação como linguagem para investigar experiências, não como caixa, rótulo ou justificativa automática.</p></div></div><div className="disc-two-columns"><SignalCard type="strength" title="Leve com você"><p>Os quatro fatores fazem parte do seu repertório. Seu resultado mostra preferências relativas neste momento.</p></SignalCard><SignalCard type="tip" title="Próximo passo"><p>Valide estas hipóteses em uma devolutiva e escolha uma ação simples, observável e relevante para os próximos 30 dias.</p></SignalCard></div><p className="disc-note">{APAS_DISCLAIMER}</p></Page>
  </article>;
}