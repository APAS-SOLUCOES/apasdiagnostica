import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAssessmentDetail } from "@/lib/apas.functions";
import { AppShell } from "@/components/apas/AppShell";
import { DiscBars, DiscChart } from "@/components/apas/DiscChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DIMENSION_NAMES, type Dimension } from "@/lib/disc/instrument";
import type { ScoreResult } from "@/lib/disc/scoring";
import { APAS_DISCLAIMER, COMBINATION_CONTENT, DIMENSION_CONTENT } from "@/lib/disc/content";

export const Route = createFileRoute("/_authenticated/avaliacoes/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe da avaliação — APAS DISC Profile" },
      {
        name: "description",
        content: "Respostas, pontuações D/I/S/C e relatório da avaliação comportamental.",
      },
      { property: "og:title", content: "Detalhe da avaliação — APAS DISC Profile" },
      {
        property: "og:description",
        content: "Painel do consultor com respostas brutas, cálculos e relatório APAS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DetalhePage,
});

function DetalhePage() {
  const { id } = Route.useParams();
  const get = useServerFn(getAssessmentDetail);
  const q = useQuery({ queryKey: ["assessment", id], queryFn: () => get({ data: { id } }) });

  if (q.isLoading) {
    return (
      <AppShell title="Avaliação">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando…
        </div>
      </AppShell>
    );
  }

  if (q.isError || !q.data) {
    return (
      <AppShell title="Avaliação não encontrada">
        <Button asChild variant="outline">
          <Link to="/dashboard">Voltar ao dashboard</Link>
        </Button>
      </AppShell>
    );
  }

  const { assessment, responses, result } = q.data;
  const scores = (result?.scores as unknown as ScoreResult) ?? null;
  const link =
    typeof window !== "undefined" ? `${window.location.origin}/a/${assessment.token}` : "";

  return (
    <AppShell
      title={assessment.candidate_name}
      description={[assessment.role_title, assessment.organizations?.name, assessment.context]
        .filter(Boolean)
        .join(" · ")}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              void navigator.clipboard.writeText(link);
              toast.success("Link copiado.");
            }}
          >
            <Copy className="size-4" /> Copiar link
          </Button>
          <Button disabled={!scores} onClick={() => window.print()}>
            Gerar relatório
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-1">
          <p className="eyebrow">Situação</p>
          <div className="mt-2 space-y-2 text-sm">
            <p>
              Status: <Badge variant="secondary">{assessment.status}</Badge>
            </p>
            <p className="text-muted-foreground">E-mail: {assessment.candidate_email}</p>
            <p className="text-muted-foreground">
              WhatsApp: {assessment.candidate_whatsapp || "—"}
            </p>
            <p className="text-muted-foreground">
              Criada em {new Date(assessment.created_at).toLocaleString("pt-BR")}
            </p>
            <p className="text-muted-foreground">
              Concluída em{" "}
              {assessment.submitted_at
                ? new Date(assessment.submitted_at).toLocaleString("pt-BR")
                : "—"}
            </p>
            <p className="text-muted-foreground">
              Instrumento: {assessment.instrument_version || "padrão"}
            </p>
          </div>
        </div>

        {scores ? (
          <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
            <p className="eyebrow">Perfil adaptado</p>
            <p className="mt-1 font-display text-xl font-semibold">
              {DIMENSION_NAMES[scores.predominant]} predominante · combinação {scores.combination}
            </p>
            <DiscChart percent={scores.adapted.percent} />
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="eyebrow mb-2">Perfil natural</p>
                <DiscBars percent={scores.natural.percent} />
              </div>
              <div>
                <p className="eyebrow mb-2">Perfil social</p>
                <DiscBars percent={scores.social.percent} />
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Índice de adaptação: {scores.adaptationIndex}
              {scores.adaptationAlert ? " (adaptação elevada — explorar na devolutiva)" : ""} ·
              versão de cálculo {scores.scoringVersion}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground lg:col-span-2">
            Aguardando as respostas do avaliado. Compartilhe o link e o resultado aparecerá aqui
            automaticamente.
          </div>
        )}
      </div>

      {scores && (
        <div className="mt-6 space-y-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <p className="eyebrow">Leitura APAS do estilo predominante</p>
            <h2 className="mt-1 font-display text-lg font-semibold">
              {DIMENSION_CONTENT[scores.predominant].title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {DIMENSION_CONTENT[scores.predominant].summary}
            </p>
            {COMBINATION_CONTENT[scores.combination] && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">
                  {COMBINATION_CONTENT[scores.combination]!.title}:
                </strong>{" "}
                {COMBINATION_CONTENT[scores.combination]!.text}
              </p>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(["D", "I", "S", "C"] as Dimension[]).map((d) => (
                <div key={d} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">
                    {DIMENSION_NAMES[d]} — nível {scores.levels[d]}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {scores.adapted.percent[d]}% na distribuição adaptada
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{APAS_DISCLAIMER}</p>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <p className="eyebrow">Respostas brutas</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Registradas em{" "}
              {responses?.created_at
                ? new Date(responses.created_at).toLocaleString("pt-BR")
                : "—"}
            </p>
            <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-secondary p-3 text-xs">
              {JSON.stringify(responses?.answers ?? [], null, 2)}
            </pre>
          </section>
        </div>
      )}
    </AppShell>
  );
}
