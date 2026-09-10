import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Copy, FileText, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/apas/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listAssessments, deleteAssessment } from "@/lib/apas.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard do analista — APAS DIAGNÓSTICA" },
      {
        name: "description",
        content:
          "Acompanhe diagnósticos empresariais e avaliações comportamentais, status de resposta e relatórios APAS.",
      },
      { property: "og:title", content: "Dashboard do analista — APAS DIAGNÓSTICA" },
      {
        property: "og:description",
        content: "Painel administrativo dos diagnósticos e avaliações APAS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Aguardando resposta", className: "bg-secondary text-secondary-foreground" },
  in_progress: { label: "Em andamento", className: "bg-accent text-accent-foreground" },
  completed: { label: "Concluída", className: "bg-primary text-primary-foreground" },
};

function Dashboard() {
  const fetchList = useServerFn(listAssessments);
  const removeFn = useServerFn(deleteAssessment);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => fetchList(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Avaliação removida.");
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Não foi possível remover."),
  });

  const rows = data ?? [];
  const total = rows.length;
  const pending = rows.filter((r) => r.status !== "completed").length;
  const done = rows.filter((r) => r.status === "completed").length;

  function copyLink(token: string) {
    const url = `${window.location.origin}/a/${token}`;
    void navigator.clipboard.writeText(url);
    toast.success("Link exclusivo copiado.");
  }

  return (
    <AppShell
      title="Dashboard"
      description="Visão geral da APAS Diagnóstica: aplicações do Diagnóstico Empresarial, avaliações comportamentais DISC, links exclusivos e relatórios validados."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/aplicacoes">Diagnóstico Empresarial</Link>
          </Button>
          <Button asChild>
            <Link to="/avaliacoes/nova">
              <Plus className="size-4" /> Nova avaliação DISC
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Avaliações criadas" value={total} loading={isLoading} />
        <Stat label="Aguardando resposta" value={pending} loading={isLoading} />
        <Stat label="Concluídas" value={done} loading={isLoading} />
        <Stat label="Relatórios disponíveis" value={done} loading={isLoading} accent />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <Skeleton className="h-32 w-full" />}
          {isError && (
            <p className="text-sm text-destructive">
              Não foi possível carregar as avaliações. Atualize a página.
            </p>
          )}
          {!isLoading && !isError && rows.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma avaliação ainda. Crie a primeira e envie o link exclusivo ao avaliado.
            </p>
          )}

          <div className="space-y-3">
            {rows.map((r) => {
              const st = STATUS[r.status] ?? STATUS["pending"]!;
              return (
                <div
                  key={r.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.candidate_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.candidate_email}
                      {r.role_title ? ` · ${r.role_title}` : ""}
                      {r.organizations?.name ? ` · ${r.organizations.name}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Criada em {new Date(r.created_at).toLocaleDateString("pt-BR")}
                      {r.submitted_at
                        ? ` · respondida em ${new Date(r.submitted_at).toLocaleDateString("pt-BR")}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={st.className}>{st.label}</Badge>
                    <Button size="sm" variant="outline" onClick={() => copyLink(r.token)}>
                      <Copy className="size-4" /> Link
                    </Button>
                    <Button size="sm" variant="secondary" asChild>
                      <Link to="/avaliacoes/$id" params={{ id: r.id }}>
                        <FileText className="size-4" /> Abrir
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(r.id)}
                      aria-label="Remover avaliação"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  loading,
  accent,
}: {
  label: string;
  value: number;
  loading: boolean;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? "red-panel border-0" : "surface-panel"}>
      <CardContent className="pt-6">
        <p className="text-xs uppercase tracking-widest opacity-80">{label}</p>
        {loading ? (
          <Skeleton className="mt-3 h-8 w-16" />
        ) : (
          <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}
