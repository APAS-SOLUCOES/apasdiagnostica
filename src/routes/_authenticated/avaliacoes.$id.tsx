import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Copy, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { getAssessmentDetail } from "@/lib/apas.functions";
import { AppShell } from "@/components/apas/AppShell";
import { DiscPremiumReport } from "@/components/apas/DiscPremiumReport";
import { DiscTechnicalPanel } from "@/components/apas/DiscTechnicalPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ScoreResult } from "@/lib/disc/scoring";

export const Route = createFileRoute("/_authenticated/avaliacoes/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe da avaliação — APAS DISC Profile" },
      {
        name: "description",
        content: "Relatório individual premium e leitura técnica protegida da avaliação comportamental.",
      },
      { property: "og:title", content: "Detalhe da avaliação — APAS DISC Profile" },
      {
        property: "og:description",
        content: "Painel protegido do especialista com indicadores e relatório APAS DISC.",
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

  const { assessment, result } = q.data;
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
            <Printer className="size-4" /> Gerar PDF
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 print:hidden lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-1">
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
          <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
            <p className="eyebrow">Documentos disponíveis</p>
            <h2 className="mt-1 font-display text-xl font-semibold">Relatório individual premium concluído</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">A prévia completa aparece abaixo. O PDF contém somente as 12 páginas do relatório do avaliado; dados técnicos, navegação e controles são excluídos da impressão.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground"><Badge variant="outline">12 páginas</Badge><Badge variant="outline">Sem respostas brutas</Badge><Badge variant="outline">Área técnica protegida</Badge></div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground lg:col-span-2">
            Aguardando as respostas do avaliado. Compartilhe o link e o resultado aparecerá aqui
            automaticamente.
          </div>
        )}
      </div>

      {scores && (
        <>
          <section className="mt-8 print:hidden" aria-labelledby="technical-title">
            <div className="mb-4"><p className="eyebrow">Uso exclusivo do especialista</p><h2 id="technical-title" className="mt-1 font-display text-xl font-semibold">Relatório técnico e roteiro de devolutiva</h2><p className="mt-2 text-sm text-muted-foreground">Indicadores de apoio à análise profissional. Esta área não integra o PDF individual.</p></div>
            <DiscTechnicalPanel assessment={assessment} scores={scores} computedAt={result?.computed_at} />
          </section>
          <section className="mt-10" aria-labelledby="individual-title">
            <div className="mb-4 print:hidden"><p className="eyebrow">Prévia do avaliado</p><h2 id="individual-title" className="mt-1 font-display text-xl font-semibold">Relatório individual APAS DISC</h2></div>
            <DiscPremiumReport assessment={assessment} scores={scores} />
          </section>
        </>
      )}
    </AppShell>
  );
}
