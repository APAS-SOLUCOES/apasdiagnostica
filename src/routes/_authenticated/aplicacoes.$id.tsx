import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/apas/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  computeDiagPreDiagnostic,
  getDiagApplication,
  releaseDiagApplication,
  validateDiagApplication,
} from "@/lib/diagnostica.functions";
import type { EngineResult } from "@/lib/diagnostica/types";
import { AXIS_NAMES, AXES } from "@/lib/diagnostica/types";

export const Route = createFileRoute("/_authenticated/aplicacoes/$id")({
  head: () => ({
    meta: [
      { title: "Pré-diagnóstico da aplicação — APAS DIAGNÓSTICA" },
      {
        name: "description",
        content:
          "Revise respostas, pré-diagnóstico, eixos e estágio predominante antes de validar e liberar o relatório APAS.",
      },
      { property: "og:title", content: "Pré-diagnóstico da aplicação — APAS DIAGNÓSTICA" },
      {
        property: "og:description",
        content: "Revisão, validação e liberação do relatório do Diagnóstico Empresarial APAS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AplicacaoDetalhe,
});

function AplicacaoDetalhe() {
  const { id } = Route.useParams();
  const load = useServerFn(getDiagApplication);
  const compute = useServerFn(computeDiagPreDiagnostic);
  const validate = useServerFn(validateDiagApplication);
  const release = useServerFn(releaseDiagApplication);
  const qc = useQueryClient();

  const [notes, setNotes] = useState("");
  const [blocked, setBlocked] = useState<string[] | null>(null);

  const q = useQuery({
    queryKey: ["diag-application", id],
    queryFn: () => load({ data: { id } }),
  });

  const refresh = () => void qc.invalidateQueries({ queryKey: ["diag-application", id] });

  const computeM = useMutation({
    mutationFn: () => compute({ data: { id } }),
    onSuccess: () => {
      toast.success("Pré-diagnóstico recalculado.");
      refresh();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Falha no cálculo."),
  });

  const validateM = useMutation({
    mutationFn: () => validate({ data: { id, analyst_notes: notes } }),
    onSuccess: () => {
      toast.success("Relatório validado.");
      refresh();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Falha na validação."),
  });

  const releaseM = useMutation({
    mutationFn: (acknowledge: boolean) => release({ data: { id, acknowledge } }),
    onSuccess: (res) => {
      if (!res.ok && res.blocked) {
        setBlocked(res.reasons);
        toast.warning("Liberação bloqueada: confirme os alertas críticos.");
        return;
      }
      setBlocked(null);
      toast.success("Relatório liberado.");
      refresh();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Falha na liberação."),
  });

  if (q.isLoading || !q.data)
    return (
      <AppShell title="Aplicação" description="Carregando...">
        <p className="text-sm text-muted-foreground">Carregando dados da aplicação...</p>
      </AppShell>
    );

  const app = q.data.application as unknown as {
    status: string;
    context: string | null;
    submitted_at: string | null;
    participants: { full_name?: string; role_title?: string | null } | null;
    organizations: { name?: string } | null;
  };
  const pre = q.data.preDiagnostic;
  const snapshot = (pre?.snapshot as EngineResult | undefined) ?? null;
  const answered = q.data.answers.length;
  const total = q.data.questions.length;

  return (
    <AppShell
      title={app.participants?.full_name ?? "Aplicação"}
      description={[app.organizations?.name, app.participants?.role_title]
        .filter(Boolean)
        .join(" · ")}
      actions={
        <Button variant="outline" onClick={() => computeM.mutate()} disabled={computeM.isPending}>
          {computeM.isPending ? "Calculando..." : "Recalcular pré-diagnóstico"}
        </Button>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Situação</CardTitle>
            <CardDescription>
              Status: <Badge variant="outline">{app.status}</Badge> · {answered}/{total} respostas
              registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(answered / Math.max(total, 1)) * 100} />
            {app.context && <p className="mt-3 text-sm text-muted-foreground">{app.context}</p>}
          </CardContent>
        </Card>

        {!snapshot && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pré-diagnóstico não calculado</CardTitle>
              <CardDescription>
                O pré-diagnóstico é gerado automaticamente após o envio do participante. Use
                “Recalcular” se necessário.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {snapshot && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Leitura organizacional (heurística V1)</CardTitle>
                <CardDescription>
                  Estágio predominante: {snapshot.predominant?.name ?? "—"}
                  {snapshot.secondary ? ` · secundário: ${snapshot.secondary.name}` : ""} ·
                  confiança {snapshot.confidence}% ({snapshot.confidenceLevel})
                  {snapshot.inTransition ? " · zona de transição" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-4">
                  {AXES.map((axis) => (
                    <div key={axis} className="rounded-md border border-border p-3">
                      <p className="text-xs text-muted-foreground">{AXIS_NAMES[axis]}</p>
                      <p className="font-display text-xl">{snapshot.axes[axis]}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {snapshot.dimensions.map((d) => (
                    <div key={d.code} className="flex items-center gap-3 text-sm">
                      <span className="w-48 shrink-0 truncate">{d.name}</span>
                      <Progress value={d.score ?? 0} className="flex-1" />
                      <span className="w-20 shrink-0 text-right text-muted-foreground">
                        {d.score ?? "s/ dados"} · {d.band}
                      </span>
                    </div>
                  ))}
                </div>

                {snapshot.alerts.length > 0 && (
                  <ul className="space-y-1 rounded-md border border-border bg-background p-3 text-sm">
                    {snapshot.alerts.map((a) => (
                      <li key={a.code} className="text-muted-foreground">
                        <span className="text-foreground">[{a.level}]</span> {a.message}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Validação e liberação</CardTitle>
                <CardDescription>
                  A liberação exige validação do analista. Resultados críticos ou inconclusivos
                  nunca são liberados automaticamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  rows={4}
                  maxLength={6000}
                  placeholder="Notas do analista APAS que integrarão o relatório final..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => validateM.mutate()} disabled={validateM.isPending}>
                    {validateM.isPending ? "Validando..." : "Validar relatório"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => releaseM.mutate(false)}
                    disabled={releaseM.isPending}
                  >
                    Liberar relatório
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link to="/relatorios/$id" params={{ id }}>
                      Abrir relatório premium
                    </Link>
                  </Button>
                </div>

                {blocked && (
                  <div className="space-y-2 rounded-md border border-primary/50 bg-primary/10 p-3 text-sm">
                    <p className="font-medium">Liberação bloqueada pelo motor:</p>
                    <ul className="list-disc pl-5 text-muted-foreground">
                      {blocked.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                    <Button size="sm" onClick={() => releaseM.mutate(true)}>
                      Reconheço os alertas e libero sob responsabilidade do analista
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Respostas do participante</CardTitle>
                <CardDescription>
                  Uso interno do analista. Respostas brutas não integram o relatório do cliente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {q.data.questions.map((question) => {
                  const a = q.data.answers.find((x) => x.question_code === question.code);
                  return (
                    <div
                      key={question.code}
                      className="flex items-start justify-between gap-3 border-b border-border/60 py-1"
                    >
                      <span className="text-muted-foreground">
                        <span className="text-foreground">{question.code}</span> {question.text}
                      </span>
                      <span className="shrink-0 font-medium">
                        {a ? (a.is_na ? "N/A" : a.value) : "—"}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
