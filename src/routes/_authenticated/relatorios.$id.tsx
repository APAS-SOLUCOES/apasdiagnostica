import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Printer } from "lucide-react";
import { AppShell } from "@/components/apas/AppShell";
import { Button } from "@/components/ui/button";
import { getDiagApplication } from "@/lib/diagnostica.functions";
import { DiagnosticPremiumReport } from "@/components/apas/DiagnosticPremiumReport";
import type { ReportContent } from "@/lib/diagnostica/report";

export const Route = createFileRoute("/_authenticated/relatorios/$id")({
  head: () => ({
    meta: [
      { title: "Relatório premium — APAS DIAGNÓSTICA" },
      { name: "description", content: "Relatório do Diagnóstico Empresarial APAS: leitura executiva, dimensões, eixos, padrões, riscos e desenvolvimento." },
      { property: "og:title", content: "Relatório premium — APAS DIAGNÓSTICA" },
      { property: "og:description", content: "Leitura organizacional validada por analista APAS, pronta para entrega." },
      { property: "og:type", content: "article" },
    ],
  }),
  component: RelatorioPremium,
});

function RelatorioPremium() {
  const { id } = Route.useParams();
  const load = useServerFn(getDiagApplication);
  const q = useQuery({ queryKey: ["diag-application", id], queryFn: () => load({ data: { id } }) });

  if (q.isLoading || !q.data) return <AppShell title="Relatório" description="Carregando conteúdo do relatório..."><p className="text-sm text-muted-foreground">Carregando...</p></AppShell>;

  const report = q.data.report as { status?: string; content?: ReportContent } | null;
  const content = report?.content ?? null;
  if (!content) return <AppShell title="Relatório ainda não gerado" description="Valide o pré-diagnóstico da aplicação para gerar o conteúdo do relatório."><Button asChild variant="outline"><Link to="/aplicacoes/$id" params={{ id }}>Voltar à aplicação</Link></Button></AppShell>;

  return <AppShell title={content.cover.title} description={content.cover.subtitle} actions={<div className="flex flex-wrap gap-2 print:hidden"><Button variant="outline" asChild><Link to="/aplicacoes/$id" params={{ id }}>Voltar à aplicação</Link></Button><Button onClick={() => window.print()}><Printer className="size-4" /> Gerar PDF</Button></div>}><DiagnosticPremiumReport content={content} released={report?.status === "released"} /></AppShell>;
}
