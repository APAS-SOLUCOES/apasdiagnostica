import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Copy, FileText, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { getAssessmentDetail } from "@/lib/apas.functions";
import { AppShell } from "@/components/apas/AppShell";
import { DiscTechnicalPanel } from "@/components/apas/DiscTechnicalPanel";
import RelatorioDISC, { type RelatorioDados } from "@/components/apas/RelatorioDISC";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ScoreResult } from "@/lib/disc/scoring";
import { normalizeDiscScores } from "@/lib/disc/normalize-result";
import { getAdaptiveNarrative } from "@/lib/disc/adaptive-content";
import { DIMENSION_CONTENT } from "@/lib/disc/content";
import { COMBINATION_NARRATIVES, FACTOR_SHORT } from "@/lib/disc/report-content";

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
  const scores = normalizeDiscScores((result?.scores as unknown as ScoreResult) ?? null);
  const link =
    typeof window !== "undefined" ? `${window.location.origin}/a/${assessment.token}` : "";

  const relatorioDados: RelatorioDados | null = scores
    ? (() => {
        const natural = scores.natural.percent;
        const adapted = scores.adapted.percent;
        const social = scores.social.percent;
        const narrative = getAdaptiveNarrative(scores);
        const p = scores.predominant;
        const sec = scores.secondary;
        const factorName = (f: keyof typeof adapted) =>
          f === "D" ? "Dominância" : f === "I" ? "Influência" : f === "S" ? "Estabilidade" : "Conformidade";
        const base =
          COMBINATION_NARRATIVES[scores.combination] ??
          COMBINATION_NARRATIVES[`${p}${sec}`] ??
          COMBINATION_NARRATIVES["DI"];

        const primaryName = factorName(p);
        const secondaryName = factorName(sec);
        const primaryShort = FACTOR_SHORT[p];
        const secondaryShort = FACTOR_SHORT[sec];

        const paginas: RelatorioDados["paginas"] = {
          pontosFortes: {
            secao: "Seus pontos fortes",
            titulo: "Seus pontos fortes",
            subtitulo: "Recursos que você já leva com você",
            intro: "Recursos que podem aparecer com mais naturalidade quando o contexto favorece seu repertório.",
            cards: base.best.slice(0, 4).map((texto, index) => ({
              titulo: texto,
              texto: DIMENSION_CONTENT[p].characteristics[index] ?? narrative.best[index] ?? base.essence,
              cor: "verde" as const,
            })),
            nota: { titulo: "No contexto", texto: base.leadership },
          },
          atencao: {
            secao: "O que pode exigir mais atenção",
            titulo: "O que pode exigir mais atenção",
            subtitulo: "Equilíbrio também é resultado",
            intro: "Toda força comportamental pode produzir efeitos diferentes quando é utilizada fora do contexto.",
            cards: base.excess.slice(0, 3).map((texto) => ({ titulo: "Vale observar", texto, cor: "vermelho" as const })),
            nota: { titulo: "Lembre-se", texto: "Pontos de atenção são hipóteses de ajuste para validar no seu contexto." },
          },
          percebido: {
            secao: "Como você pode ser percebido",
            titulo: "Como você pode ser percebido",
            subtitulo: "A impressão que você provoca nos outros",
            intro: base.perceived,
            cards: [
              { titulo: "Nas relações", texto: base.perceived, cor: "vermelho" as const },
              { titulo: "Na comunicação", texto: base.communication, cor: "escuro" as const },
              { titulo: "Sob pressão", texto: base.pressure, cor: "laranja" as const },
              { titulo: "Na mudança", texto: base.change, cor: "azul" as const },
            ],
          },
          comunicacao: {
            secao: "Comunicação", titulo: "Comunicação", subtitulo: "Como você tende a se expressar", intro: base.communication, colunas: 2,
            cards: [
              { titulo: "Quando está no seu melhor", texto: base.best[0], cor: "verde" as const },
              { titulo: "Vale observar", texto: base.perceived, cor: "laranja" as const },
              { titulo: "Ponto de atenção", texto: base.excess[0], cor: "vermelho" as const },
              { titulo: "Experimente", texto: base.experiments[0], cor: "azul" as const },
            ],
          },
          decisao: {
            secao: "Decisão", titulo: "Decisão", subtitulo: "Como você tende a escolher", intro: base.decision,
            cards: [
              { titulo: "No seu melhor", texto: base.best[1] ?? base.best[0], cor: "verde" as const },
              { titulo: "Vale observar", texto: "Antes de fechar uma escolha, diferencie o que já está confirmado do que ainda precisa ser validado.", cor: "laranja" as const },
              { titulo: "Ponto de atenção", texto: base.excess[1] ?? base.excess[0], cor: "vermelho" as const },
              { titulo: "Dica", texto: base.experiments[1] ?? base.experiments[0], cor: "azul" as const },
            ],
          },
          relacionamentos: {
            secao: "Relacionamentos e equipe", titulo: "Relacionamentos e equipe", subtitulo: "Juntos, os resultados vão mais longe", intro: base.team,
            cards: [
              { titulo: "O que te fortalece", texto: base.team, cor: "verde" as const },
              { titulo: "Vale observar", texto: "Pessoas diferentes podem precisar de ritmos, informações e espaços diferentes para contribuir.", cor: "laranja" as const },
              { titulo: "Ponto de atenção", texto: base.excess[2] ?? base.excess[0], cor: "vermelho" as const },
              { titulo: "Experimente", texto: base.experiments[2] ?? base.experiments[0], cor: "azul" as const },
            ],
          },
          desenvolvimento: {
            secao: "Seu desenvolvimento", titulo: "Seu desenvolvimento", subtitulo: "Mais consciência, mais escolha",
            intro: "O desenvolvimento não exige negar o seu estilo. Exige ampliar opções para responder melhor ao que cada situação pede.",
            cards: [
              { titulo: "O que já está no seu repertório", texto: base.best[0], cor: "vermelho" as const },
              { titulo: "O que pode ser ajustado", texto: base.excess[0], cor: "laranja" as const },
              { titulo: "O que pode ser ampliado", texto: base.experiments[1] ?? base.experiments[0], cor: "vermelho" as const },
              { titulo: "O que pode gerar mais resultado", texto: base.experiments[2] ?? base.experiments[0], cor: "azul" as const },
            ],
            experimento: true,
          },
          destino: {
            secao: "Seu perfil não é um destino", titulo: "Seu perfil não é um destino",
            subtitulo: "Seu resultado descreve tendências. Suas escolhas definem como você as utiliza.",
            intro: "O APAS DISC revela tendências sobre como você tende a agir, se comunicar, tomar decisões e se relacionar.",
            destaque: {
              fatores: [
                { letra: p, rotulo: primaryName },
                { letra: sec, rotulo: secondaryName },
              ],
              titulo: narrative.title.split(" · ")[0],
              texto: base.essence,
            },
            cards: [
              { titulo: "O que levar com você", texto: "Os quatro fatores DISC fazem parte do seu repertório.", cor: "verde" as const },
              { titulo: "O próximo passo", texto: base.experiments[0], cor: "laranja" as const },
              { titulo: "Uma mensagem final", texto: "O seu perfil não determina o seu comportamento. Ele é um ponto de partida para maior consciência.", cor: "azul" as const },
            ],
            nota: { texto: "O APAS DISC é uma ferramenta de análise de tendências comportamentais e não constitui diagnóstico psicológico, clínico ou psiquiátrico." },
          },
        };

        return {
          nome: assessment.candidate_name,
          cargo: assessment.role_title ?? undefined,
          data: assessment.submitted_at
            ? new Date(assessment.submitted_at).toLocaleDateString("pt-BR")
            : new Date(assessment.created_at).toLocaleDateString("pt-BR"),
          natural, adaptado: adapted, social, indiceAdaptacao: scores.adaptationIndex,
          introducao: {
            titulo: "Você não é um número.",
            paragrafos: [
              "O resultado deste relatório não pretende colocar você dentro de uma caixa ou definir quem você é.",
              base.essence,
              "A combinação entre " + primaryName.toLowerCase() + " e " + secondaryName.toLowerCase() + " influencia a forma como você pode transformar intenção em comportamento. " + primaryShort + " aparece como referência principal, enquanto " + secondaryShort + " amplia as possibilidades de resposta ao contexto.",
            ],
            citacao: "O autoconhecimento é o primeiro passo para escolhas mais conscientes e resultados mais consistentes.",
            referencia: "Este relatório é baseado em tendências comportamentais DISC. A leitura deve ser validada no contexto do avaliado.",
          },
          numeros: {
            descricao: "Natural " + natural[p].toFixed(1).replace(".", ",") + "% · Adaptado " + adapted[p].toFixed(1).replace(".", ",") + "% · Social " + social[p].toFixed(1).replace(".", ",") + "%",
            indiceTexto: "Índice de adaptação: " + scores.adaptationIndex.toFixed(1).replace(".", ",") + ". " + (scores.adaptationAlert ? "A diferença entre perspectivas merece uma conversa de contexto e validação." : "As diferenças entre perspectivas podem ser exploradas como flexibilidade contextual."),
            aviso: "Nenhuma perspectiva é melhor. Juntas, elas ajudam a compreender repertório e contexto.",
          },
          jeitoDeAgir: {
            titulo: narrative.title.split(" · ")[0],
            subtitulo: "Combinação: " + (scores.combinationLabel ?? scores.combination),
            arquetipo: narrative.title.split(" · ")[0],
            intensidade: narrative.title.split(" · ")[1] ?? "presente",
            paragrafos: [
              base.essence,
              "No dia a dia, essa combinação pode favorecer " + primaryShort + " sem perder de vista " + secondaryShort + ". O melhor uso do seu repertório acontece quando você percebe o que a situação pede e escolhe conscientemente qual recurso colocar em primeiro plano.",
            ],
            destaqueTitulo: "Olhar de pessoas",
            destaqueTexto: base.perceived,
            resumo: "Na prática, você pode ganhar mais consistência quando transforma " + primaryShort + " em ação e utiliza " + secondaryShort + " para ajustar a forma como essa ação chega às pessoas.",
          },
          paginas,
        };
      })()
    : null;


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
          {scores && <Button asChild variant="outline"><Link to="/relatorios-disc/$id/tecnico" params={{ id }}><FileText className="size-4" /> Gerar/Imprimir relatório técnico</Link></Button>}
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
            <DiscTechnicalPanel assessment={assessment} scores={scores} computedAt={result?.computed_at ?? null} />
          </section>
          <section className="mt-10">
            {relatorioDados ? <RelatorioDISC dados={relatorioDados} /> : null}
          </section>
        </>
      )}
    </AppShell>
  );
}
