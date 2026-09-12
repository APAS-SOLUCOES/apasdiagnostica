import type { ScoreResult } from "@/lib/disc/scoring";
import { DIMENSIONS, DIMENSION_NAMES } from "@/lib/disc/instrument";

type TechnicalAssessment = {
  id: string;
  status: string;
  instrument_version?: string | null;
  created_at: string;
  started_at?: string | null;
  submitted_at?: string | null;
  consent_accepted_at?: string | null;
};

function duration(start?: string | null, end?: string | null) {
  if (!start || !end) return "Não disponível";
  const minutes = Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
}

export function DiscTechnicalPanel({ assessment, responses, scores, computedAt }: { assessment: TechnicalAssessment; responses: { answers?: unknown; meta?: unknown; created_at?: string } | null; scores: ScoreResult; computedAt?: string | null }) {
  const alerts = [
    scores.answeredItems < scores.totalItems ? "Aplicação incompleta: revisar cobertura das respostas." : "Cobertura completa dos blocos.",
    scores.adaptationAlert ? "Índice de adaptação elevado: explorar esforço, contexto e sustentabilidade." : "Índice de adaptação sem alerta automático.",
  ];
  return <div className="space-y-6 print:hidden">
    <section className="rounded-lg border border-border bg-card p-5"><p className="eyebrow">Dados técnicos protegidos</p><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><p><span className="text-muted-foreground">Application ID</span><br /><span className="break-all">{assessment.id}</span></p><p><span className="text-muted-foreground">Instrumento</span><br />{assessment.instrument_version || "Padrão"}</p><p><span className="text-muted-foreground">Aplicação</span><br />{new Date(assessment.created_at).toLocaleString("pt-BR")}</p><p><span className="text-muted-foreground">Duração estimada</span><br />{duration(assessment.started_at, assessment.submitted_at)}</p><p><span className="text-muted-foreground">Consentimento</span><br />{assessment.consent_accepted_at ? new Date(assessment.consent_accepted_at).toLocaleString("pt-BR") : "Não registrado"}</p><p><span className="text-muted-foreground">Envio</span><br />{assessment.submitted_at ? new Date(assessment.submitted_at).toLocaleString("pt-BR") : "Não concluído"}</p><p><span className="text-muted-foreground">Cálculo</span><br />{computedAt ? new Date(computedAt).toLocaleString("pt-BR") : "—"}</p><p><span className="text-muted-foreground">Método</span><br />{scores.scoringVersion}</p></div></section>
    <section className="rounded-lg border border-border bg-card p-5"><p className="eyebrow">Indicadores técnicos</p><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border"><th className="py-2">Fator</th><th>MAIS</th><th>MENOS</th><th>Saldo</th><th>Natural</th><th>Social</th><th>Adaptado</th></tr></thead><tbody>{DIMENSIONS.map((d) => <tr key={d} className="border-b border-border/60"><td className="py-2 font-medium">{d} · {DIMENSION_NAMES[d]}</td><td>{scores.counts?.most[d] ?? "—"}</td><td>{scores.counts?.least[d] ?? "—"}</td><td>{scores.net?.[d] ?? "—"}</td><td>{scores.natural.percent[d]}%</td><td>{scores.social.percent[d]}%</td><td>{scores.adapted.percent[d]}%</td></tr>)}</tbody></table></div><p className="mt-4 text-xs text-muted-foreground">Método preservado: MAIS/MENOS e parâmetros da versão vinculada à aplicação. O perfil adaptado, os níveis e o índice exibidos são os valores salvos pelo motor atual, sem recálculo na interface.</p></section>
    <section className="rounded-lg border border-border bg-card p-5"><p className="eyebrow">Alertas de qualidade</p><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">{alerts.map((alert) => <li key={alert}>{alert}</li>)}</ul></section>
    <section className="rounded-lg border border-border bg-card p-5"><p className="eyebrow">Guia de devolutiva</p><div className="mt-4 grid gap-5 md:grid-cols-2"><div><h3 className="font-semibold">Perguntas sugeridas</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground"><li>O que mais representa sua experiência atual? O que menos representa?</li><li>Em quais contextos seu comportamento muda mais?</li><li>Que exigências do ambiente consomem mais energia hoje?</li><li>Como outras pessoas descreveriam sua comunicação sob pressão?</li><li>Qual ajuste produziria maior impacto nos próximos 30 dias?</li></ul></div><div><h3 className="font-semibold">Cuidados do analista</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground"><li>Validar hipóteses com exemplos concretos e contexto.</li><li>Não usar predominância ou combinação como rótulo.</li><li>Separar preferência comportamental de competência e desempenho.</li><li>Explorar recursos dos quatro fatores, não somente o predominante.</li><li>Converter a conversa em uma ação observável, prazo e indicador.</li></ul></div></div></section>
    <section className="rounded-lg border border-border bg-card p-5"><p className="eyebrow">Respostas brutas</p><p className="mt-1 text-xs text-muted-foreground">Conteúdo restrito ao especialista responsável. Nunca integra o relatório individual impresso.</p><pre className="mt-3 max-h-96 overflow-auto rounded-md bg-secondary p-3 text-xs">{JSON.stringify(responses?.answers ?? [], null, 2)}</pre></section>
  </div>;
}