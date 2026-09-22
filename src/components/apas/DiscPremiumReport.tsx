import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ArrowUpRight, Check, Compass, Focus, Gauge, Lightbulb, MessageCircle, Network, RefreshCw, Scale, Sprout, Users } from "lucide-react";
import coverArtwork from "@/assets/disc-editorial-cover.jpg";
import type { ScoreResult, DimensionMap, ProfileVector } from "@/lib/disc/scoring";
import { DIMENSIONS, DIMENSION_NAMES, type Dimension } from "@/lib/disc/instrument";
import { APAS_DISCLAIMER, DEVELOPMENT_FRAMEWORK, DIMENSION_CONTENT } from "@/lib/disc/content";
import { COMBINATION_NARRATIVES, FACTOR_SHORT } from "@/lib/disc/report-content";

const FACTOR_CLASS: Record<Dimension, string> = { D: "disc-factor-d", I: "disc-factor-i", S: "disc-factor-s", C: "disc-factor-c" };
type ReportAssessment = { id: string; candidate_name: string; role_title?: string | null; instrument_version?: string | null; submitted_at?: string | null; organizations?: { name?: string | null }[]; };
type Signal = "strength" | "observe" | "attention" | "tip";

function ApasBrand({ inverse = false }: { inverse?: boolean }) {
  return <span className={`disc-brand ${inverse ? "disc-brand-inverse" : ""}`} aria-label="APAS Soluções"><i className="disc-brand-symbol" aria-hidden="true">A</i><strong>APAS</strong><span>SOLUÇÕES</span></span>;
}

function Page({ number, title, eyebrow, icon: Icon, children, cover = false }: { number: number; title?: string; eyebrow?: string; icon?: LucideIcon; children: ReactNode; cover?: boolean }) {
  return <section className={`disc-page ${cover ? "disc-cover" : ""}`} data-page={number}>
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
  return <div className="disc-table-wrap"><table className="disc-table"><thead><tr><th>Fator</th>{vectors.map((v) => <th key={v.label}>{v.label}</th>)}</tr></thead><tbody>{DIMENSIONS.map((d) => <tr key={d}><th>{DIMENSION_NAMES[d]}</th>{vectors.map((v) => <td key={`${d}-${v.label}`}>{v.value[d]}</td>)}</tr>)}</tbody></table></div>;
}

function ProfileBars({ title, subtitle, values }: { title: string; subtitle: string; values: DimensionMap }) {
  return <div className="disc-profile-panel"><h3>{title}</h3><p>{subtitle}</p><div className="disc-intensity-chart" aria-label={`Intensidades do perfil ${title}`}>{DIMENSIONS.map((d) => <div key={d} className="disc-intensity-bar" style={{ width: `${values[d]}%` }}><span>{DIMENSION_NAMES[d]}</span></div>)}</div></div>;
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
  const adaptationText = scores.adaptationAlert ? "A distância entre espontaneidade e demanda percebida merece atenção. Ela pode indicar flexibilidade, mas também esforço continuado — uma excelente pista para desenvolvimento." : "Sua expressão natural e a demanda percebida aparecem em equilíbrio. Isso costuma indicar boa adaptação ao contexto e boa consciência de impacto.";

  return <article className="disc-report" aria-label={`Relatório DISC de ${assessment.candidate_name}`}>
    <Page number={1} cover><img className="disc-cover-art" src={coverArtwork} width={1400} height={1800} alt="Composição geométrica abstrata que representa direção, conexão e equilíbrio" /></Page>

    <Page number={2} eyebrow="Antes de olhar o resultado" title="Você não é um número." icon={Compass}><p className="disc-opening">O que costuma ser lido como uma simples etiqueta de personalidade, na prática é um mapa de padrões e contextos. Este relatório ajuda a traduzir a forma como você tende a agir, decidir e relacionar-se.</p></Page>

    <Page number={3} eyebrow="Seu perfil em números" title="Três perspectivas do mesmo repertório" icon={Gauge}><div className="disc-profile-grid"><ProfileBars title="Natural" subtitle="Como você tende a agir quando está mais confortável" values={scores.natural} /><ProfileBars title="Adaptado" subtitle="Como você se ajusta à exigência do ambiente" values={scores.adapted} /><ProfileBars title="Percebido" subtitle="Como outros tendem a te ver" values={scores.perceived} /></div></Page>

    <Page number={4} eyebrow="Leitura central" title="Seu jeito de agir" icon={Focus}><div className="disc-combination"><span>{scores.combination}</span><div><small>{scores.combinationLabel ?? `${primary.label} + ${secondary.label}`}</small><h3>{narrative.title}</h3></div></div><p className="disc-opening">{narrative.summary}</p></Page>

    <Page number={5} eyebrow="Recursos" title="Quando você está no seu melhor" icon={Sprout}><p className="disc-opening">Quando contexto, clareza e energia se alinham, estas são contribuições que costumam aparecer com mais força.</p><div className="disc-signal-grid"><SignalList type="strength" title="Forças" items={primary.strengths} /><SignalList type="observe" title="Observações" items={primary.observations} /></div></Page>

    <Page number={6} eyebrow="Consciência" title="O que pode exigir mais atenção" icon={AlertTriangle}><p className="disc-opening">Todo comportamento que representa uma força também pode se transformar em desgaste quando usado sem equilíbrio.</p><div className="disc-signal-grid"><SignalList type="attention" title="Atenção" items={primary.attention} /><SignalList type="tip" title="Sugestões" items={primary.tips} /></div></Page>

    <Page number={7} eyebrow="Intenção e impacto" title="Como você pode ser percebido" icon={Users}><p className="disc-opening">A forma como você expressa sua energia e sua resposta ao ambiente pode ser interpretada por outras pessoas como algo muito distinto do que você entende sobre si.</p></Page>

    <Page number={8} eyebrow="Relações" title="Comunicação que aproxima e move" icon={MessageCircle}><div className="disc-signal-grid"><SignalCard type="strength" title="Quando está no seu melhor" >{primary.relationships}</SignalCard><SignalCard type="observe" title="Quando pode gerar ruído" >{secondary.relationships}</SignalCard></div></Page>

    <Page number={9} eyebrow="Atuação com pessoas" title="Decisão, liderança e equipe" icon={Network}><div className="disc-section-stack"><ThemeBlock icon={Focus} title="Decisão">{narrative.decision}</ThemeBlock><ThemeBlock icon={Users} title="Liderança">{narrative.leadership}</ThemeBlock><ThemeBlock icon={MessageCircle} title="Equipe">{narrative.team}</ThemeBlock></div></Page>

    <Page number={10} eyebrow="Contextos exigentes" title="Pressão e mudanças" icon={RefreshCw}><div className="disc-context-grid"><ThemeBlock icon={Scale} title="Sob pressão">{narrative.pressure}</ThemeBlock><ThemeBlock icon={ArrowUpRight} title="Mudança">{narrative.change}</ThemeBlock></div><p className="disc-note">{adaptationText}</p></Page>

    <Page number={11} eyebrow="Prática" title="Seu desenvolvimento em 30 dias" icon={Sprout}><p className="disc-opening">O crescimento costuma acontecer quando você identifica padrões, nomeia o contexto e escolhe pequenas ações repetidas.</p></Page>

    <Page number={12} eyebrow="Continuidade" title="Seu perfil não é um destino" icon={ArrowUpRight}><p className="disc-closing">Quanto maior sua consciência sobre seus próprios padrões, maiores as chances de usar suas forças com mais clareza, reduzir ruídos e aumentar a coerência entre intenção e impacto.</p><div className="disc-footer-summary"><div><small>Paciente</small><strong>{assessment.candidate_name}</strong></div><div><small>Data</small><strong>{date}</strong></div><div><small>Versão</small><strong>{assessment.instrument_version ?? "DISC Premium"}</strong></div></div></Page>
  </article>;
}
