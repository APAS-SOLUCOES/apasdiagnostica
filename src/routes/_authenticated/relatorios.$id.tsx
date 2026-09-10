import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Printer } from "lucide-react";
import { AppShell } from "@/components/apas/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDiagApplication } from "@/lib/diagnostica.functions";
import type { ReportContent } from "@/lib/diagnostica/report";

export const Route = createFileRoute("/_authenticated/relatorios/$id")({
  head: () => ({
    meta: [
      { title: "Relatório premium — APAS DIAGNÓSTICA" },
      {
        name: "description",
        content:
          "Relatório do Diagnóstico Empresarial APAS: resumo executivo, dimensões, quatro eixos, fase predominante, riscos e plano de ação.",
      },
      { property: "og:title", content: "Relatório premium — APAS DIAGNÓSTICA" },
      {
        property: "og:description",
        content: "Leitura organizacional validada por analista APAS, pronta para entrega.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RelatorioPremium,
});

function RelatorioPremium() {
  const { id } = Route.useParams();
  const load = useServerFn(getDiagApplication);

  const q = useQuery({
    queryKey: ["diag-application", id],
    queryFn: () => load({ data: { id } }),
  });

  if (q.isLoading || !q.data) {
    return (
      <AppShell title="Relatório" description="Carregando conteúdo do relatório...">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </AppShell>
    );
  }

  const report = q.data.report as { status?: string; content?: ReportContent } | null;
  const content = report?.content ?? null;

  if (!content) {
    return (
      <AppShell
        title="Relatório ainda não gerado"
        description="Valide o pré-diagnóstico da aplicação para gerar o conteúdo do relatório."
      >
        <Button asChild variant="outline">
          <Link to="/aplicacoes/$id" params={{ id }}>
            Voltar à aplicação
          </Link>
        </Button>
      </AppShell>
    );
  }

  const released = report?.status === "released";

  return (
    <AppShell
      title={content.cover.title}
      description={content.cover.subtitle}
      actions={
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="outline" asChild>
            <Link to="/aplicacoes/$id" params={{ id }}>
              Voltar à aplicação
            </Link>
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="size-4" /> Gerar PDF
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Card className="red-panel border-0">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest opacity-80">APAS Diagnóstica</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">
              {content.cover.companyName ?? "Empresa não informada"}
            </h2>
            <p className="mt-1 text-sm opacity-90">
              {content.cover.participantName ?? "Participante"} · {content.cover.instrument}
            </p>
            <p className="mt-4 max-w-3xl text-xs opacity-90">{content.cover.disclaimer}</p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {released ? "Liberado ao cliente" : "Aguardando liberação do analista"}
          </Badge>
          <Badge variant="outline">Validação humana obrigatória</Badge>
          <Badge variant="outline">Heurística {content.version}</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{content.executiveSummary.title}</CardTitle>
            <CardDescription>{content.executiveSummary.body}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {(content.executiveSummary.bullets ?? []).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quatro eixos de leitura</CardTitle>
            <CardDescription>Flexibilidade, Controle, Integração e Sustentação.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-4">
            {content.axes.map((a) => (
              <div key={a.code} className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">{a.name}</p>
                <p className="font-display text-2xl">{a.score}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fase organizacional</CardTitle>
            <CardDescription>
              Predominante: {content.stage.predominant ?? "—"}
              {content.stage.secondary ? ` · secundária: ${content.stage.secondary}` : ""} ·
              confiança {content.stage.confidence}% ({content.stage.confidenceLevel})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {content.stage.inTransition && (
              <p>
                Zona de transição identificada
                {content.stage.transitionLabel ? `: ${content.stage.transitionLabel}` : "."}
              </p>
            )}
            {content.stage.adjustedStageCode && (
              <p>Fase ajustada pelo analista: {content.stage.adjustedStageCode}</p>
            )}
            {content.blockReasons.length > 0 && (
              <div className="rounded-md border border-primary/50 bg-primary/10 p-3 text-foreground">
                <p className="text-sm font-medium">Restrições de liberação automática</p>
                <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                  {content.blockReasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mapa das dimensões</CardTitle>
            <CardDescription>Pontuação ponderada de 0 a 100 por dimensão.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {content.dimensions.map((d) => (
              <div key={d.code} className="flex items-center gap-3 text-sm">
                <span className="w-48 shrink-0 truncate">{d.name}</span>
                <Progress value={d.score ?? 0} className="flex-1" />
                <span className="w-24 shrink-0 text-right text-muted-foreground">
                  {d.score ?? "s/ dados"} · {d.band}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {content.sections.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <CardTitle className="text-base">{s.title}</CardTitle>
              {s.body && <CardDescription>{s.body}</CardDescription>}
            </CardHeader>
            {s.bullets && s.bullets.length > 0 && (
              <CardContent>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {s.bullets.map((b, i) => (
                    <li key={`${s.title}-${i}`}>{b}</li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        ))}

        {content.analystNotes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leitura do analista APAS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {content.analystNotes}
              </p>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-muted-foreground">
          Relatório gerado em {new Date(content.generatedAt).toLocaleString("pt-BR")}. Não contém
          respostas brutas do participante.
        </p>
      </div>
    </AppShell>
  );
}
