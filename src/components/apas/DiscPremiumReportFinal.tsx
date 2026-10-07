import type { CSSProperties, ReactNode } from "react";
import "@/disc-premium-final.css";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ArrowUpRight, BarChart3, CalendarCheck, Check, Compass, Focus, Gauge, Gem, Handshake, Info, Lightbulb, MessageCircle, Network, Rocket, Settings, Sprout, Target, Users } from "lucide-react";
import coverAsset from "@/assets/disc-approved-cover-full.asset.json";
const coverArtwork = coverAsset.url;
import attentionLeafAsset from "@/assets/disc-approved-attention-full.asset.json";
const attentionLeafArtwork = attentionLeafAsset.url;
import decisionCompassAsset from "@/assets/disc-approved-decision-full.asset.json";
const decisionCompassArtwork = decisionCompassAsset.url;
import teamHandsAsset from "@/assets/disc-approved-team-full.asset.json";
const teamHandsArtwork = teamHandsAsset.url;
import dialogueArtwork from "@/assets/disc-editorial-dialogue.jpg";
import selfArtwork from "@/assets/disc-editorial-self.jpg";
import editorialCoverArtwork from "@/assets/disc-editorial-cover.jpg";
import editorialGrowthArtwork from "@/assets/disc-editorial-growth.jpg";
import approvedCoverMountainArtwork from "@/assets/disc-approved-cover-mountain.jpg";
const apasLogo = "/apas-logo.svg";
import type { ScoreResult, DimensionMap } from "@/lib/disc/scoring";
import { DIMENSIONS, DIMENSION_NAMES, type Dimension } from "@/lib/disc/instrument";
import { APAS_DISCLAIMER, DEVELOPMENT_FRAMEWORK, DIMENSION_CONTENT } from "@/lib/disc/content";
import { FACTOR_SHORT } from "@/lib/disc/report-content";
import { getAdaptiveFactorImpact, getAdaptiveNarrative } from "@/lib/disc/adaptive-content";

const FACTOR_CLASS: Record<Dimension, string> = { D: "disc-factor-d", I: "disc-factor-i", S: "disc-factor-s", C: "disc-factor-c" };
type ReportAssessment = { id: string; candidate_name: string; role_title?: string | null; instrument_version?: string | null; submitted_at?: string | null; organizations?: { name?: string | null } | null };
type Signal = "strength" | "observe" | "attention" | "tip";

function ApasBrand({ inverse = false }: { inverse?: boolean }) {
  return <span className={`disc-brand ${inverse ? "disc-brand-inverse" : ""}`} aria-label="APAS Soluções"><img className="disc-brand-logo" src={apasLogo} alt="APAS Soluções" /></span>;
}

function ReportFooter({ assessment, date, number, dark }: { assessment: ReportAssessment; date: string; number: number; dark: boolean }) {
  return <div className={`disc-report-footer ${dark ? "is-dark" : ""}`}>
    <div><span>Relatório individual</span><strong>{assessment.candidate_name}</strong></div>
    <div><ApasBrand inverse={dark} /><span className="disc-footer-separator" /><strong>{String(number).padStart(2, "0")}</strong><small>{date}</small></div>
  </div>;
}

function NumberedCard({ number, accent, icon: Icon, title, children, dark = false }: { number: number; accent: "green" | "orange" | "red" | "teal" | "dark"; icon: LucideIcon; title: ReactNode; children: ReactNode; dark?: boolean }) {
  return <article className={`disc-numbered-card disc-numbered-card-${accent} ${dark ? "is-dark" : ""}`}>
    <div className="disc-numbered-rail"><strong>{String(number).padStart(2, "0")}</strong><span /><Icon aria-hidden="true" /></div>
    <div className="disc-numbered-copy"><h3>{title}</h3><div>{children}</div></div>
  </article>;
}

function Page({ number, title, subtitle, eyebrow, icon: Icon, children, artwork, cover = false, dark = [6, 8, 11].includes(number), assessment, date }: { number: number; title?: ReactNode; subtitle?: ReactNode; eyebrow?: string; icon?: LucideIcon; children: ReactNode; artwork?: ReactNode; cover?: boolean; dark?: boolean; assessment: ReportAssessment; date: string }) {
  return <section className={`disc-page ${dark ? "disc-page-dark" : ""} ${cover ? "disc-cover" : ""}`} data-page={number}>
    {artwork}
    {!cover && <div className="disc-page-header"><ApasBrand inverse={dark} /><span>APAS DISC · Relatório de Perfil Comportamental</span></div>}
    <div className="disc-page-body">{eyebrow && <p className="disc-kicker">{eyebrow}</p>}{title && <div className="disc-title-row">{Icon && <Icon aria-hidden="true" />}<h2 className="disc-page-title">{title}</h2></div>}{subtitle && <p className="disc-page-subtitle">{subtitle}</p>}{children}</div>
    {!cover && <ReportFooter assessment={assessment} date={date} number={number} dark={dark} />}
  </section>;
}

function EditorialImage({ src, alt, position = "right" }: { src: string; alt: string; position?: "left" | "right" }) {
  return <figure className={`disc-editorial-image disc-editorial-image-${position}`}><img src={src} alt={alt} loading="eager" /></figure>;
}

function SignalCard({ type, title, children }: { type: Signal; title: ReactNode; children: ReactNode }) {
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

function ProfileBars({ title, subtitle, values, accent, icon: Icon }: { title: string; subtitle: string; values: DimensionMap; accent: "red" | "orange" | "green"; icon: LucideIcon }) {
  return <div className={`disc-profile-card disc-profile-card-${accent}`}>
    <div className="disc-profile-card-head"><Icon aria-hidden="true" /><div><h3>{title}</h3><p>{subtitle}</p></div></div>
    <div className="disc-horizontal-chart" aria-label={`Intensidades do perfil ${title}`}>
      {DIMENSIONS.map((d) => <div className="disc-horizontal-row" key={d}><strong className={FACTOR_CLASS[d]}>{d}</strong><div className="disc-horizontal-track"><span className={FACTOR_CLASS[d]} style={{ width: `${values[d]}%` }} /></div><b>{Number(values[d]).toFixed(1).replace(".", ",")} %</b></div>)}
    </div>
  </div>;
}

function ProfileDonut({ values, combination }: { values: DimensionMap; combination: string }) {
  const donutStyle = {
    "--d": `${values.D}%`,
    "--i": `${values.D + values.I}%`,
    "--s": `${values.D + values.I + values.S}%`,
  } as CSSProperties;

  return <div className="disc-profile-donut-wrap">
    <div className="disc-profile-donut-stage">
      <div className="disc-profile-label disc-profile-label-d"><strong>D</strong><b>{values.D}%</b><small>(Adaptado)</small></div>
      <div className="disc-profile-label disc-profile-label-i"><strong>I</strong><b>{values.I}%</b><small>(Adaptado)</small></div>
      <div className="disc-profile-label disc-profile-label-s"><strong>S</strong><b>{values.S}%</b><small>(Adaptado)</small></div>
      <div className="disc-profile-label disc-profile-label-c"><strong>C</strong><b>{values.C}%</b><small>(Adaptado)</small></div>
      <div className="disc-profile-donut" style={donutStyle} role="img" aria-label={`Distribuição do perfil adaptado: D ${values.D}%, I ${values.I}%, S ${values.S}%, C ${values.C}%`}>
        <div><strong>{combination}</strong><small>Seu perfil<br/>primário | secundário</small></div>
      </div>
    </div>
  </div>;
}

function ThemeBlock({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return <section className="disc-theme-block"><Icon aria-hidden="true" /><div><h3>{title}</h3><p>{children}</p></div></section>;
}

export function DiscPremiumReportFinal({ assessment, scores }: { assessment: ReportAssessment; scores: ScoreResult }) {
  const primary = DIMENSION_CONTENT[scores.predominant];
  const secondary = DIMENSION_CONTENT[scores.secondary];
  const narrative = getAdaptiveNarrative(scores);
  const primaryImpact = getAdaptiveFactorImpact(scores.predominant, scores.adapted.percent[scores.predominant]);
  if (!narrative) return null;

  const date = assessment.submitted_at ? new Date(assessment.submitted_at).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR");
  const pct = (v: number) => `${Number(v).toFixed(1).replace(".", ",")} %`;
  const adaptationText = scores.adaptationAlert
    ? "A distância entre espontaneidade e demanda percebida merece atenção. Ela pode indicar flexibilidade, mas também esforço continuado — uma hipótese para validar no seu contexto."
    : "A distância entre espontaneidade e demanda percebida está em uma faixa sem alerta automático. Observe, ainda assim, quais contextos ampliam ou reduzem sua energia.";

  return <article className="disc-report disc-report-final" translate="no" aria-label={`Relatório DISC de ${assessment.candidate_name}`}>
    <Page number={1} cover assessment={assessment} date={date}>
      <img className="disc-cover-art" src={coverArtwork} width={1400} height={1800} alt="Paisagem ao entardecer, referência visual aprovada para a capa do APAS DISC" />
      <div className="disc-cover-overlay" /><div className="disc-cover-wordmark" aria-hidden="true">DISC</div><div className="disc-cover-brand"><ApasBrand inverse /></div>
      <div className="disc-cover-copy"><p>Relatório de Perfil Comportamental</p><h1>{assessment.candidate_name}</h1><blockquote>Mais consciência. Melhores escolhas.<br />Grandes resultados.</blockquote></div>
      <div className="disc-cover-factors">{DIMENSIONS.map((d) => <FactorMark key={d} dimension={d} />)}</div>
      <div className="disc-cover-meta"><div><span>Relatório individual</span><span>{assessment.role_title || "Autoconhecimento profissional"}</span></div><div><ApasBrand inverse /><span>{date}</span></div></div>
    </Page>

    <Page number={2} eyebrow="02 · ANTES DE OLHAR O RESULTADO" title="Você não é um número." icon={Compass} artwork={<EditorialImage src={editorialCoverArtwork} alt="Pessoa contemplando a paisagem, referência visual editorial da abertura" position="right" />} assessment={assessment} date={date}>
      <p className="disc-opening disc-opening-strong">Este relatório não foi feito para colocar você em uma caixa. Ele foi feito para ajudar você a enxergar padrões que, muitas vezes, passam despercebidos no dia a dia.</p>
      <p className="disc-body-copy">Aqui, você vai encontrar tendências sobre a forma como costuma agir, decidir, se comunicar e responder ao que acontece ao seu redor.</p>
      <p className="disc-body-copy">Algumas partes podem parecer imediatamente familiares. Outras podem convidar você a olhar para si por outro ângulo. As duas experiências são úteis: o autoconhecimento começa quando você se permite observar sem pressa.</p>
      <div className="disc-editorial-quote">“O autoconhecimento é o primeiro passo para escolhas mais conscientes e resultados mais consistentes.”</div>
      <p className="disc-body-copy">Nas próximas páginas, a leitura ganha vida: você verá como essas tendências podem aparecer na ação, na comunicação, nas decisões, nos relacionamentos e no seu desenvolvimento.</p>
      <p className="disc-foundation"><strong>UMA REFERÊNCIA CONCEITUAL</strong><br />Este relatório é baseado nos estudos de William Moulton Marston em <em>Emotions of Normal People</em> (1928). A aplicação e a linguagem deste relatório são autorais da APAS.</p>
    </Page>

    <Page number={3} eyebrow="03 · SEU PERFIL EM NÚMEROS" title="Seu perfil em números" subtitle="O que o seu resultado revela" icon={Gauge} assessment={assessment} date={date}>
      <p className="disc-profile-intro">Aqui está a fotografia numérica do seu resultado. Ela mostra a distribuição dos quatro fatores e destaca a combinação que aparece com maior intensidade no seu perfil.</p>
      <div className="disc-profile-overview"><ProfileDonut values={scores.adapted.percent} combination={scores.combination} /><div className="disc-profile-grid">
        <ProfileBars title="Natural" subtitle="Como tende a agir quando há mais vontade." values={scores.natural.percent} accent="red" icon={Target} />
        <ProfileBars title="Adaptado" subtitle="Como ajusta o comportamento às circunstâncias percebidas." values={scores.adapted.percent} accent="orange" icon={Users} />
        <ProfileBars title="Social" subtitle="Como acredita que precisa se apresentar no ambiente." values={scores.social.percent} accent="green" icon={MessageCircle} />
      </div></div>
      <div className="disc-index"><div><span>ÍNDICE DE ADAPTAÇÃO</span><strong>{String(scores.adaptationIndex).replace(".", ",")}</strong></div><p>{adaptationText}</p></div>
      <p className="disc-note"><Info aria-hidden="true" />Nenhuma perspectiva é melhor. Juntas, elas ajudam a compreender o repertório e o contexto. As barras e o gráfico representam visualmente os valores calculados para esta aplicação.</p>
    </Page>

    <Page number={4} eyebrow="04 · SEU JEITO DE AGIR" title={<>Seu jeito <span className="disc-title-accent">de agir</span></>} subtitle="Determinação e conexão em equilíbrio" icon={Focus} assessment={assessment} date={date}>
      <p className="disc-profile-identity">{narrative.title}</p>
      <p className="disc-opening">Seu resultado indica uma predominância de <strong>{DIMENSION_NAMES[scores.predominant]} — {scores.predominant}</strong>, combinada por características de <strong>{DIMENSION_NAMES[scores.secondary]} — {scores.secondary}</strong>.</p>
      <p className="disc-body-copy">{narrative.profilePortrait}</p>
      <p className="disc-body-copy">{narrative.essence} A combinação desses dois fatores ajuda a entender como diferentes recursos podem se complementar no seu jeito de agir. A forma como isso aparece pode variar conforme o contexto.</p>
      <div className="disc-impact-intro"><span>{primaryImpact.identity}</span><h4>{primaryImpact.phrase}</h4><p>{narrative.communication}</p></div>
      <div className="disc-highlight"><strong>Em poucas palavras:</strong> {narrative.best[0]}</div>
    </Page>

    <Page number={5} eyebrow="05 · SEUS PONTOS FORTES" title="Seus pontos fortes" subtitle="Recursos que você já leva com você" icon={Sprout} artwork={<EditorialImage src={approvedCoverMountainArtwork} alt="Montanha e horizonte, referência visual dos pontos fortes" position="right" />} assessment={assessment} date={date}>
      <p className="disc-opening">Toda pessoa tem recursos que se tornam mais acessíveis em determinados contextos. Estes são alguns dos que podem aparecer com mais naturalidade no seu jeito de agir.</p>
      <div className="disc-numbered-stack">{primary.strengths.slice(0, 4).map((item, index) => <NumberedCard key={item} number={index + 1} accent="green" icon={[Handshake, MessageCircle, Users, Network][index]} title={item}><p>{primary.characteristics[index] ?? narrative.best[index] ?? narrative.best[0]}</p></NumberedCard>)}</div>
      <div className="disc-bottom-callout"><strong>No contexto:</strong> {narrative.situations?.work ?? narrative.best[0]}</div>
    </Page>

    <Page number={6} eyebrow="06 · O QUE PODE EXIGIR MAIS ATENÇÃO" title="O que pode exigir mais atenção" subtitle="Equilíbrio também é resultado" icon={AlertTriangle} artwork={<div className="disc-page-hero-art disc-page-hero-art-dark"><img src={attentionLeafArtwork} alt="Pessoa em uma paisagem de montanha, referência visual aprovada para pontos de atenção" aria-hidden="true" /><div /></div>} assessment={assessment} date={date}>
      <div className="disc-dark-intro">Uma força continua sendo força — até o momento em que deixa de servir ao contexto. Aqui estão alguns sinais que podem ajudar você a perceber quando um recurso passa do ponto.</div>
      <div className="disc-numbered-stack dark-stack">
        <NumberedCard number={1} accent="red" icon={Target} title="Vale observar" dark><ul>{primary.attention.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul></NumberedCard>
        <NumberedCard number={2} accent="red" icon={Users} title="Na sua interação com pessoas" dark><ul>{narrative.excess.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul></NumberedCard>
        <NumberedCard number={3} accent="red" icon={Settings} title="Isso não significa que exista algo “errado”" dark><p>Pontos de atenção são hipóteses sobre custos possíveis de uma preferência intensificada por pressão, cansaço ou conflito. O mesmo comportamento pode produzir resultado ou ruído dependendo da situação.</p></NumberedCard>
      </div>
      <div className="disc-reminder"><Info aria-hidden="true" /><div><h3>Lembre-se</h3><p>Olhar para esses pontos não é diminuir suas qualidades. É ganhar liberdade para escolher quando usar uma característica com intensidade — e quando vale ajustar a dose.</p></div></div>
    </Page>

    <Page number={7} eyebrow="07 · COMO VOCÊ PODE SER PERCEBIDO" title={<>Como você pode ser <span className="disc-title-accent">percebido</span></>} subtitle="A impressão que você provoca nos outros" icon={Users} artwork={<EditorialImage src={selfArtwork} alt="Composição editorial sobre percepção e autoconsciência" position="right" />} assessment={assessment} date={date}>
      <p className="disc-opening">Nem sempre a intenção que você coloca em uma atitude é a mesma mensagem que chega ao outro. Esta página convida você a olhar para o impacto que seu estilo pode produzir.</p>
      <div className="disc-numbered-stack perception-stack">
        <NumberedCard number={1} accent="red" icon={Rocket} title={<>Como tende a <span className="disc-title-accent">agir</span></>}><p>{FACTOR_SHORT[scores.predominant]} aparece com mais força no seu resultado. {narrative.best[0]}.</p></NumberedCard>
        <NumberedCard number={2} accent="dark" icon={MessageCircle} title={<>O que pode <span className="disc-title-accent">transmitir</span></>}><p>{primary.characteristics[0]}. Sua presença pode ser percebida a partir desse recurso.</p></NumberedCard>
        <NumberedCard number={3} accent="red" icon={Focus} title={<>O que pode <span className="disc-title-accent">ampliar</span></>}><p>{secondary.characteristics[0]}. Ampliar esse repertório pode favorecer adaptação e colaboração.</p></NumberedCard>
        <NumberedCard number={4} accent="dark" icon={Target} title={<>Em momentos de <span className="disc-title-accent">pressão</span></>}><p>{narrative.perceived}</p></NumberedCard>
      </div>
    </Page>

    <Page number={8} eyebrow="08 · COMUNICAÇÃO" title={<>Comuni<span className="disc-title-accent">cação</span></>} subtitle="Como você tende a se expressar" icon={MessageCircle} dark artwork={<div className="disc-page-hero-art disc-page-hero-art-dialogue"><img src={dialogueArtwork} alt="Pessoas conversando, referência visual aprovada para comunicação" /><div /></div>} assessment={assessment} date={date}>
      <div className="disc-dark-intro">Comunicação não é apenas o que você diz. É também o espaço que cria para o outro ouvir, responder e construir junto.</div>
      <div className="disc-signal-grid disc-signal-grid-dark"><SignalCard type="strength" title={<>Quando está no <span className="disc-signal-strength">seu melhor</span></>}><p>{narrative.communication}</p></SignalCard><SignalCard type="observe" title={<>Vale <span className="disc-signal-observe">observar</span></>}><p>Se a mensagem foi compreendida, se houve espaço real para resposta e se os acordos ficaram claros.</p></SignalCard><SignalCard type="attention" title={<>Ponto de <span className="disc-signal-attention">atenção</span></>}><p>Observe se a objetividade da sua mensagem deixa espaço suficiente para escuta, troca e confirmação do entendimento.</p></SignalCard><SignalCard type="tip" title={<span className="disc-signal-tip">Experimente</span>}><p>{primary.development[0]}. Ao final, confirme quem fará o quê e até quando.</p></SignalCard></div>
    </Page>

    <Page number={9} eyebrow="09 · DECISÃO" title={<>Deci<span className="disc-title-accent">são</span></>} subtitle="Como você tende a escolher" icon={Network} artwork={<div className="disc-banner-art"><img src={decisionCompassArtwork} alt="Imagem editorial sobre direção e escolhas" /></div>} assessment={assessment} date={date}>
      <p className="disc-opening">Decidir é transformar possibilidades em direção. Seu estilo influencia o que ganha peso quando você precisa escolher — especialmente quando tempo, informação e pessoas entram na mesma equação.</p>
      <div className="disc-numbered-stack"><NumberedCard number={1} accent="green" icon={Target} title={<>No seu <span className="disc-signal-strength">melhor</span></>}><p>{narrative.situations?.decisions ?? narrative.decision}</p></NumberedCard><NumberedCard number={2} accent="orange" icon={Lightbulb} title={<>Vale <span className="disc-signal-observe">observar</span></>}><p>Quando há muitas informações, pode ser útil desacelerar um pouco para considerar todos os aspectos antes de concluir.</p></NumberedCard><NumberedCard number={3} accent="red" icon={AlertTriangle} title={<>Ponto de <span className="disc-signal-attention">atenção</span></>}><p>Quando a escolha envolve pessoas, prazos e consequências, evite decidir apenas pela primeira impressão ou pela urgência do momento.</p></NumberedCard><NumberedCard number={4} accent="teal" icon={ArrowUpRight} title={<span className="disc-signal-tip">Dica</span>}><p>Antes de decidir, faça uma pausa curta e pergunte: “O que ainda preciso considerar antes de escolher?”</p></NumberedCard></div>
    </Page>

    <Page number={10} eyebrow="10 · RELACIONAMENTOS E EQUIPE" title={<>Relacionamentos <span className="disc-title-accent">e equipe</span></>} subtitle="Juntos, os resultados vão mais longe" icon={Users} artwork={<div className="disc-banner-art"><img src={teamHandsArtwork} alt="Mãos sobrepostas em gesto de equipe, referência visual aprovada para relacionamentos" /></div>} assessment={assessment} date={date}>
      <p className="disc-opening">Resultados também passam pelas relações. Seu estilo influencia a maneira como você participa, lidera, coopera e cria espaço para que outras pessoas contribuam.</p>
      <div className="disc-numbered-stack"><NumberedCard number={1} accent="green" icon={Users} title={<>O que te <span className="disc-signal-strength">fortalece</span></>}><p>{narrative.situations?.leadership ?? narrative.leadership}</p></NumberedCard><NumberedCard number={2} accent="orange" icon={MessageCircle} title={<>Vale <span className="disc-signal-observe">observar</span></>}><p>{narrative.situations?.relationships ?? narrative.perceived}</p></NumberedCard><NumberedCard number={3} accent="red" icon={AlertTriangle} title={<>Ponto de <span className="disc-signal-attention">atenção</span></>}><p>Quando surgem diferenças de ritmo ou opinião, procure entender o que cada pessoa precisa para contribuir melhor.</p></NumberedCard><NumberedCard number={4} accent="teal" icon={ArrowUpRight} title={<span className="disc-signal-tip">Experimente</span>}><p>Invista em escuta ativa, valorize diferentes pontos de vista e distribua responsabilidades de forma clara.</p></NumberedCard></div>
    </Page>

    <Page number={11} eyebrow="11 · SEU DESENVOLVIMENTO" title={<>Seu <span className="disc-title-accent">desenvolvimento</span></>} subtitle="Mais consciência, mais escolha" icon={Sprout} dark artwork={<EditorialImage src={approvedCoverMountainArtwork} alt="Pessoa contemplando uma paisagem de montanha ao amanhecer, referência visual aprovada para o desenvolvimento" position="right" />} assessment={assessment} date={date}>
      <div className="disc-dark-intro">Desenvolver-se não significa deixar de ser quem você é. Significa ganhar novas opções para escolher a resposta mais útil em cada situação.</div>
      <div className="disc-numbered-stack development-stack"><NumberedCard number={1} accent="red" icon={Lightbulb} title={<>O que já está no <span className="disc-title-accent">seu repertório</span></>} dark><p>{narrative.experiments[0] ?? narrative.best[0]}</p></NumberedCard><NumberedCard number={2} accent="orange" icon={Settings} title={<>O que pode <span className="disc-signal-observe">ser ajustado</span></>} dark><p>{narrative.experiments[1] ?? primary.attention[0]}</p></NumberedCard><NumberedCard number={3} accent="red" icon={BarChart3} title={<>O que pode <span className="disc-title-accent">ser ampliado</span></>} dark><p>{narrative.experiments[2] ?? secondary.development[0]}</p></NumberedCard><NumberedCard number={4} accent="teal" icon={Target} title={<>O que pode gerar <span className="disc-signal-tip">mais resultado</span></>} dark><p>Quando você amplia sua consciência e coloca novos comportamentos em ação, cria condições para alcançar resultados ainda maiores.</p></NumberedCard></div>
      <div className="disc-action-box"><div className="disc-action-title"><CalendarCheck aria-hidden="true" /><h3>Meu <span className="disc-title-accent">experimento</span> de 30 dias</h3></div><div className="disc-action-form"><label>Comportamento que quero praticar:<span /></label><label>Situação em que vou experimentar:<span /></label><label>Pessoa que poderá me dar retorno:<span /></label><label>Sinal concreto de progresso:<span /></label></div></div>
      <p className="disc-note disc-development-note">{DEVELOPMENT_FRAMEWORK.slice(0, 3).join(" ")}</p>
    </Page>

    <Page number={12} eyebrow="12 · SEU PERFIL NÃO É UM DESTINO" title={<>Seu perfil não é <span className="disc-title-accent">um destino</span></>} subtitle="Seu resultado descreve tendências. Suas escolhas definem como você as utiliza." icon={BarChart3} artwork={<EditorialImage src={approvedCoverMountainArtwork} alt="Pessoa contemplando uma paisagem de montanha, referência visual do encerramento" position="right" />} assessment={assessment} date={date}>
      <p className="disc-closing">Seu resultado reúne pistas sobre a forma como você tende a agir, se comunicar, decidir e se relacionar. O valor dessas pistas aparece quando elas deixam de ser apenas informação e passam a orientar escolhas mais conscientes.</p>
      <div className="disc-combination"><div className="disc-combination-factors"><span className={`disc-combo-${scores.predominant}`}>{scores.predominant}</span><b><small>{DIMENSION_NAMES[scores.predominant]}</small></b><i /><span className={`disc-combo-${scores.secondary}`}>{scores.secondary}</span><b><small>{DIMENSION_NAMES[scores.secondary]}</small></b></div><div><h3>{narrative.title}</h3><p>Seu resultado combina recursos de {DIMENSION_NAMES[scores.predominant].toLowerCase()} e {DIMENSION_NAMES[scores.secondary].toLowerCase()}, com características que podem se expressar de maneiras diferentes conforme o contexto.</p></div></div>
      <div className="disc-numbered-stack closing-stack"><NumberedCard number={1} accent="green" icon={Gem} title={<>O que levar <span className="disc-signal-strength">com você</span></>}><p>Os quatro fatores fazem parte do seu repertório. O resultado apenas mostra quais tendências aparecem com mais força neste momento — não limita aquilo que você pode desenvolver.</p></NumberedCard><NumberedCard number={2} accent="orange" icon={Rocket} title={<>O <span className="disc-signal-observe">próximo passo</span></>}><p>Escolha uma hipótese deste relatório e transforme-a em um pequeno experimento nos próximos 30 dias. Observe o que acontece, peça retorno e ajuste o caminho quando necessário.</p></NumberedCard><NumberedCard number={3} accent="teal" icon={Users} title={<>Uma mensagem <span className="disc-signal-tip">final</span></>}><p>Seu perfil não determina suas escolhas. Ele oferece um ponto de partida para reconhecer padrões, ampliar possibilidades e agir de forma mais alinhada ao que você deseja construir.</p></NumberedCard></div>
      <div className="disc-disclaimer"><Info aria-hidden="true" /><p>{APAS_DISCLAIMER}</p></div>
    </Page>
  </article>;
}


// Premium visual reference lock: Page 11 uses the approved mountain artwork.
