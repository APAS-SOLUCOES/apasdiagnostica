import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import { AppShell } from "@/components/apas/AppShell";
import { DiscTechnicalReport } from "@/components/apas/DiscTechnicalReport";
import { Button } from "@/components/ui/button";
import { getAssessmentDetail } from "@/lib/apas.functions";
import type { ScoreResult } from "@/lib/disc/scoring";

export const Route = createFileRoute("/_authenticated/relatorios-disc/$id/tecnico")({
  head: () => ({ meta: [{ title: "Relatório técnico DISC — APAS DIAGNÓSTICA" }, { name: "description", content: "Documento técnico protegido para condução da devolutiva APAS DISC." }, { property: "og:title", content: "Relatório técnico DISC — APAS DIAGNÓSTICA" }, { property: "og:description", content: "Leitura técnica protegida para especialistas autorizados." }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }] }),
  component: TechnicalReportPage,
});

function TechnicalReportPage() {
  const { id } = Route.useParams();
  const load = useServerFn(getAssessmentDetail);
  const query = useQuery({ queryKey: ["assessment-technical-report", id], queryFn: () => load({ data: { id } }) });
  if (query.isLoading) return <AppShell title="Relatório técnico"><p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin"/>Carregando...</p></AppShell>;
  if (query.isError || !query.data) return <AppShell title="Relatório técnico indisponível"><Button asChild variant="outline"><Link to="/avaliacoes/$id" params={{ id }}>Voltar</Link></Button></AppShell>;
  const scores = (query.data.result?.scores as unknown as ScoreResult) ?? null;
  if (!scores) return <AppShell title="Relatório técnico ainda não disponível" description="A avaliação precisa estar concluída para gerar este documento."><Button asChild variant="outline"><Link to="/avaliacoes/$id" params={{ id }}>Voltar</Link></Button></AppShell>;
  return <AppShell title="Relatório técnico DISC" description={query.data.assessment.candidate_name} actions={<div className="flex gap-2 print:hidden"><Button asChild variant="outline"><Link to="/avaliacoes/$id" params={{ id }}><ArrowLeft className="size-4"/>Voltar</Link></Button><Button onClick={() => window.print()}><Printer className="size-4"/>Imprimir relatório técnico</Button></div>}><div className="mb-5 print:hidden"><p className="text-sm text-muted-foreground">Documento separado do relatório do avaliado, exclusivo para o especialista autorizado.</p></div><DiscTechnicalReport assessment={query.data.assessment} scores={scores} computedAt={query.data.result?.computed_at ?? null}/></AppShell>;
}