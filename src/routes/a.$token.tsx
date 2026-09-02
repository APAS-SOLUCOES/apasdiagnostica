import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { acceptConsent, getPublicAssessment, submitAssessment } from "@/lib/public.functions";
import type { Dimension, InstrumentItem } from "@/lib/disc/instrument";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/a/$token")({
  head: () => ({
    meta: [
      { title: "Avaliação Comportamental DISC — APAS Soluções" },
      {
        name: "description",
        content:
          "Responda sua Avaliação Comportamental DISC da APAS Soluções em poucos minutos, direto do celular.",
      },
      { property: "og:title", content: "Avaliação Comportamental DISC — APAS Soluções" },
      {
        property: "og:description",
        content: "Link exclusivo para responder sua Avaliação Comportamental DISC da APAS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PublicAssessment,
});

type LocalAnswer = { most?: Dimension; least?: Dimension };
type AnswerMap = Record<string, LocalAnswer>;

const BLOCKS_PER_STEP = 4;

function storageKey(token: string) {
  return `apas-disc-answers:${token}`;
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-sidebar/95">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
          <span className="grid size-8 place-items-center rounded bg-primary font-display text-sm font-bold text-primary-foreground">
            A
          </span>
          <span className="font-display text-sm font-semibold tracking-tight">
            APAS <span className="text-primary">Soluções</span>
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 pb-24">{children}</main>
    </div>
  );
}

function Notice({
  title,
  text,
  tone = "neutral",
}: {
  title: string;
  text: string;
  tone?: "neutral" | "success";
}) {
  return (
    <Frame>
      <div className="rounded-xl border border-border bg-card p-6 text-center sm:p-10">
        {tone === "success" ? (
          <CheckCircle2 className="mx-auto size-10 text-primary" />
        ) : (
          <ShieldAlert className="mx-auto size-10 text-muted-foreground" />
        )}
        <h1 className="mt-4 font-display text-xl font-semibold sm:text-2xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {text}
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/">Conhecer a APAS Soluções</Link>
        </Button>
      </div>
    </Frame>
  );
}

function PublicAssessment() {
  const { token } = Route.useParams();
  const fetchAssessment = useServerFn(getPublicAssessment);
  const consentFn = useServerFn(acceptConsent);
  const submitFn = useServerFn(submitAssessment);

  const query = useQuery({
    queryKey: ["public-assessment", token],
    queryFn: () => fetchAssessment({ data: { token } }),
    retry: false,
  });

  const [stage, setStage] = useState<"intro" | "quiz" | "done">("intro");
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});

  // Retomada local: as respostas parciais ficam no dispositivo do avaliado
  // (a arquitetura atual só persiste no banco na conclusão).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(token));
      if (raw) setAnswers(JSON.parse(raw) as AnswerMap);
    } catch {
      /* ignore */
    }
  }, [token]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(token), JSON.stringify(answers));
    } catch {
      /* ignore */
    }
  }, [answers, token]);

  const items: InstrumentItem[] = useMemo(
    () => (query.data?.found ? query.data.instrument.items : []),
    [query.data],
  );

  const steps = useMemo(() => {
    const out: InstrumentItem[][] = [];
    for (let i = 0; i < items.length; i += BLOCKS_PER_STEP) {
      out.push(items.slice(i, i + BLOCKS_PER_STEP));
    }
    return out;
  }, [items]);

  const answeredCount = items.filter((it) => answers[it.id]?.most && answers[it.id]?.least).length;
  const progress = items.length ? Math.round((answeredCount / items.length) * 100) : 0;

  const consent = useMutation({
    mutationFn: () => consentFn({ data: { token } }),
    onSuccess: () => setStage("quiz"),
    onError: (e: Error) => toast.error(e.message || "Não foi possível iniciar a avaliação."),
  });

  const submit = useMutation({
    mutationFn: () =>
      submitFn({
        data: {
          token,
          answers: items
            .filter((it) => answers[it.id]?.most && answers[it.id]?.least)
            .map((it) => ({
              itemId: it.id,
              most: answers[it.id]!.most!,
              least: answers[it.id]!.least!,
            })),
        },
      }),
    onSuccess: () => {
      try {
        localStorage.removeItem(storageKey(token));
      } catch {
        /* ignore */
      }
      setStage("done");
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível enviar suas respostas."),
  });

  if (query.isLoading) {
    return (
      <Frame>
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando sua avaliação…
        </div>
      </Frame>
    );
  }

  if (query.isError || !query.data?.found) {
    return (
      <Notice
        title="Link inválido ou indisponível"
        text="Não localizamos esta avaliação. O link pode ter sido digitado incorretamente, cancelado ou substituído. Solicite um novo link ao seu consultor APAS."
      />
    );
  }

  const { assessment, instrument } = query.data;

  if (stage === "done" || assessment.status === "completed" || assessment.submitted_at) {
    return (
      <Notice
        tone="success"
        title="Avaliação concluída com sucesso"
        text="Recebemos suas respostas com segurança. O relatório será disponibilizado conforme a configuração definida pela APAS Soluções, e seu consultor entrará em contato para a devolutiva."
      />
    );
  }

  if (stage === "intro") {
    return (
      <Frame>
        <p className="eyebrow">APAS Soluções</p>
        <h1 className="rule-red mt-1 font-display text-2xl font-semibold sm:text-3xl">
          Avaliação Comportamental DISC
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Olá{assessment.candidate_name ? `, ${assessment.candidate_name.split(" ")[0]}` : ""}! Esta
          é uma conversa estruturada sobre a forma como você age, se comunica e toma decisões no dia
          a dia. Não existem respostas certas ou erradas — responda pensando em como você realmente
          se comporta, sem tentar acertar um perfil ideal.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {assessment.candidate_name && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="eyebrow">Avaliado</p>
              <p className="mt-1 text-sm font-medium">{assessment.candidate_name}</p>
            </div>
          )}
          {assessment.context && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="eyebrow">Contexto</p>
              <p className="mt-1 text-sm text-muted-foreground">{assessment.context}</p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          <p className="eyebrow">Como funciona</p>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>• {items.length} blocos com 4 frases cada, em etapas curtas.</li>
            <li>
              • Em cada bloco escolha a frase que <strong>mais</strong> se parece com você e a que{" "}
              <strong>menos</strong> se parece.
            </li>
            <li>• Leva cerca de 10 a 15 minutos e funciona bem no celular.</li>
            <li>• Suas respostas parciais ficam salvas neste dispositivo até o envio.</li>
          </ul>
        </div>

        <div className="mt-4 rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm">
          <p className="font-semibold text-primary">
            Instrumento provisório — validar antes de uso comercial
          </p>
          <p className="mt-2 text-muted-foreground">
            Esta é uma versão de validação do instrumento {instrument.name} ({instrument.version}).
            O resultado é uma leitura de tendências comportamentais e{" "}
            <strong>não constitui diagnóstico clínico, psicológico ou médico</strong>, nem deve ser
            usado isoladamente para decisões sobre pessoas.
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          <p className="eyebrow">Consentimento e privacidade (LGPD)</p>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>
              • <strong>Finalidade:</strong> gerar seu perfil comportamental para processos de
              desenvolvimento, coaching ou seleção conduzidos pela APAS Soluções.
            </li>
            <li>
              • <strong>Dados tratados:</strong> nome, e-mail, telefone informados pelo solicitante
              e as respostas deste questionário.
            </li>
            <li>
              • <strong>Armazenamento:</strong> suas respostas e o resultado ficam guardados em
              ambiente controlado, com acesso restrito ao consultor responsável.
            </li>
            <li>
              • <strong>Seus direitos:</strong> você pode solicitar acesso, correção ou exclusão dos
              seus dados a qualquer momento pelo contato do consultor.
            </li>
          </ul>

          <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
            <Checkbox
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              className="mt-0.5"
            />
            <span>
              Li e concordo com o tratamento dos meus dados para as finalidades descritas acima.
            </span>
          </label>
        </div>

        <Button
          className="mt-6 w-full sm:w-auto"
          size="lg"
          disabled={!agreed || consent.isPending}
          onClick={() => consent.mutate()}
        >
          {consent.isPending && <Loader2 className="size-4 animate-spin" />}
          Começar avaliação
        </Button>
      </Frame>
    );
  }

  const current = steps[step] ?? [];
  const stepComplete = current.every((it) => answers[it.id]?.most && answers[it.id]?.least);
  const isLast = step === steps.length - 1;

  function pick(itemId: string, field: "most" | "least", dimension: Dimension) {
    setAnswers((prev) => {
      const entry = { ...(prev[itemId] ?? {}) };
      entry[field] = dimension;
      const other = field === "most" ? "least" : "most";
      if (entry[other] === dimension) delete entry[other];
      return { ...prev, [itemId]: entry };
    });
  }

  return (
    <Frame>
      <div className="sticky top-0 -mx-4 mb-6 bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Etapa {step + 1} de {steps.length}
          </span>
          <span>
            {answeredCount}/{items.length} blocos
          </span>
        </div>
        <Progress value={progress} className="mt-2 h-2" />
      </div>

      <div className="space-y-6">
        {current.map((item, idx) => {
          const a = answers[item.id] ?? {};
          return (
            <div key={item.id} className="rounded-xl border border-border bg-card p-4">
              <p className="eyebrow">Bloco {step * BLOCKS_PER_STEP + idx + 1}</p>
              <div className="mt-3 grid grid-cols-[1fr_auto_auto] items-center gap-2 text-xs text-muted-foreground">
                <span />
                <span className="w-12 text-center font-medium">Mais</span>
                <span className="w-12 text-center font-medium">Menos</span>
              </div>
              {item.options.map((opt) => (
                <div
                  key={opt.key}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-t border-border/60 py-2"
                >
                  <span className="text-sm">{opt.label}</span>
                  {(["most", "least"] as const).map((field) => (
                    <button
                      key={field}
                      type="button"
                      aria-label={`${field === "most" ? "Mais" : "Menos"} parecido: ${opt.label}`}
                      onClick={() => pick(item.id, field, opt.dimension)}
                      className={cn(
                        "grid size-9 w-12 place-items-center rounded-md border border-border text-xs transition-colors",
                        a[field] === opt.dimension
                          ? field === "most"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-foreground bg-foreground text-background"
                          : "hover:bg-secondary",
                      )}
                    >
                      {a[field] === opt.dimension ? "✓" : ""}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          disabled={step === 0}
          onClick={() => {
            setStep((s) => Math.max(0, s - 1));
            window.scrollTo({ top: 0 });
          }}
        >
          <ChevronLeft className="size-4" /> Voltar
        </Button>

        {isLast ? (
          <Button
            disabled={answeredCount < items.length || submit.isPending}
            onClick={() => submit.mutate()}
          >
            {submit.isPending && <Loader2 className="size-4 animate-spin" />}
            Concluir avaliação
          </Button>
        ) : (
          <Button
            disabled={!stepComplete}
            onClick={() => {
              setStep((s) => Math.min(steps.length - 1, s + 1));
              window.scrollTo({ top: 0 });
            }}
          >
            Continuar <ChevronRight className="size-4" />
          </Button>
        )}
      </div>

      {!stepComplete && (
        <p className="mt-3 text-xs text-muted-foreground">
          Marque uma opção em “Mais” e outra em “Menos” em cada bloco para avançar.
        </p>
      )}
      {isLast && answeredCount < items.length && (
        <p className="mt-3 text-xs text-primary">
          Faltam {items.length - answeredCount} bloco(s) para concluir. Use “Voltar” para revisá-los.
        </p>
      )}
    </Frame>
  );
}
