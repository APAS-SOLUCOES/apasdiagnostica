import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "APAS DISC Profile — Avaliação Comportamental" },
      {
        name: "description",
        content:
          "Plataforma da APAS Soluções para aplicar avaliações comportamentais DISC por link único, calcular perfis e gerar relatórios premium.",
      },
      { property: "og:title", content: "APAS DISC Profile — Avaliação Comportamental" },
      {
        property: "og:description",
        content:
          "Avaliações comportamentais DISC com link único por avaliado, cálculo automático e relatório APAS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STEPS = [
  {
    title: "O consultor cria a avaliação",
    text: "Nome, contato, empresa e contexto da vaga ou do processo de desenvolvimento.",
  },
  {
    title: "O avaliado responde por link único",
    text: "Experiência mobile-first, com consentimento LGPD e questionário em etapas.",
  },
  {
    title: "A APAS entrega a leitura",
    text: "Perfis natural, social e adaptado, combinações e relatório com conteúdo autoral.",
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
              APAS <span className="text-primary">DISC Profile</span>
            </span>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/auth">Área do consultor</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16">
        <p className="eyebrow">APAS Soluções</p>
        <h1 className="rule-red mt-2 max-w-3xl font-display text-3xl font-semibold sm:text-5xl">
          Avaliação Comportamental DISC com método, clareza e relatório premium
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Aplique avaliações comportamentais para pessoas e empresas, acompanhe o status de cada
          avaliado e entregue uma leitura profissional das tendências de comunicação, decisão e
          ritmo de trabalho.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/auth">Entrar na plataforma</Link>
          </Button>
        </div>

        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-xl border border-border bg-card p-5">
              <p className="eyebrow">Etapa {i + 1}</p>
              <h2 className="mt-2 font-display text-base font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </section>

        <p className="mt-12 max-w-2xl text-xs text-muted-foreground">
          O instrumento está em fase de validação. As leituras comportamentais não constituem
          diagnóstico clínico, psicológico ou médico e não devem ser usadas isoladamente para
          decisões sobre pessoas.
        </p>
      </main>
    </div>
  );
}
