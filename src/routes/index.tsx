import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "APAS DIAGNÓSTICA — Diagnósticos Empresariais e de Pessoas" },
      {
        name: "description",
        content:
          "Plataforma de Diagnósticos Empresariais, Comportamentais e de Pessoas da APAS Soluções: aplicações por link exclusivo, leitura organizacional e relatórios validados por analista.",
      },
      {
        property: "og:title",
        content: "APAS DIAGNÓSTICA — Diagnósticos Empresariais e de Pessoas",
      },
      {
        property: "og:description",
        content:
          "Diagnóstico Empresarial APAS e avaliações comportamentais DISC em uma única plataforma, com validação humana antes da entrega.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const MODULES = [
  {
    title: "Diagnóstico Empresarial APAS",
    text: "Leitura organizacional por dimensões, quatro eixos e fases de referência, com validação obrigatória do analista antes da entrega ao cliente.",
  },
  {
    title: "Avaliação Comportamental DISC",
    text: "Tendências de comunicação, decisão e ritmo de trabalho, com perfis natural, social e adaptado e relatório APAS.",
  },
  {
    title: "Diagnósticos de Pessoas",
    text: "Estrutura preparada para novos instrumentos, empresas com vários participantes e leituras consolidadas.",
  },
];

const STEPS = [
  {
    title: "O analista cria a aplicação",
    text: "Instrumento, empresa, participante e contexto do trabalho.",
  },
  {
    title: "O participante responde por link exclusivo",
    text: "Experiência mobile-first, com consentimento e respostas privadas.",
  },
  {
    title: "A APAS valida e libera a leitura",
    text: "Pré-diagnóstico revisado por um analista antes de qualquer entrega.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-sidebar/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded bg-primary font-display text-sm font-bold text-primary-foreground">
              A
            </span>
            <span className="font-display text-sm font-semibold tracking-tight">
              APAS <span className="text-primary">DIAGNÓSTICA</span>
            </span>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/auth">Área do analista</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16">
        <p className="eyebrow">APAS Soluções</p>
        <h1 className="rule-red mt-2 max-w-3xl font-display text-3xl font-semibold sm:text-5xl">
          Plataforma de Diagnósticos Empresariais, Comportamentais e de Pessoas
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Aplique diagnósticos com método, acompanhe cada participante em um painel único e entregue
          leituras profissionais revisadas por um analista APAS.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/auth">Entrar na plataforma</Link>
          </Button>
        </div>

        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          {MODULES.map((m) => (
            <div key={m.title} className="surface-panel rounded-xl p-5">
              <p className="eyebrow">Módulo</p>
              <h2 className="mt-2 font-display text-base font-semibold">{m.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{m.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-xl border border-border bg-card p-5">
              <p className="eyebrow">Etapa {i + 1}</p>
              <h2 className="mt-2 font-display text-base font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </section>

        <p className="mt-12 max-w-2xl text-xs text-muted-foreground">
          Os instrumentos estão em fase de calibração. As leituras não constituem diagnóstico
          clínico, psicológico, médico ou auditoria contábil, e não devem ser usadas isoladamente
          para decisões sobre pessoas ou negócios.
        </p>
      </main>
    </div>
  );
}
