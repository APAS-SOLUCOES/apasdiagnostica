import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  acceptDiagConsent,
  getPublicDiagApplication,
  saveDiagAnswers,
  submitDiagApplication,
} from "@/lib/diagnostica-public.functions";

export const Route = createFileRoute("/q/$token")({
  head: () => ({
    meta: [
      { title: "Diagnóstico Empresarial — APAS DIAGNÓSTICA" },
      {
        name: "description",
        content:
          "Questionário do Diagnóstico Empresarial APAS. Respostas confidenciais, analisadas por um analista APAS.",
      },
      { property: "og:title", content: "Diagnóstico Empresarial — APAS DIAGNÓSTICA" },
      {
        property: "og:description",
        content: "Responda o Diagnóstico Empresarial APAS pelo seu link exclusivo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicDiagnostic,
});

type LocalAnswer = { value: number | null; is_na: boolean };

const PER_PAGE = 7;

function PublicDiagnostic() {
  const { token } = Route.useParams();
  const load = useServerFn(getPublicDiagApplication);
  const consent = useServerFn(acceptDiagConsent);
  const save = useServerFn(saveDiagAnswers);
  const submit = useServerFn(submitDiagApplication);

  const query = useQuery({
    queryKey: ["public-diag", token],
    queryFn: () => load({ data: { token } }),
    retry: false,
  });

  const [answers, setAnswers] = useState<Record<string, LocalAnswer>>({});
  const [hydrated, setHydrated] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [started, setStarted] = useState(false);
  const [page, setPage] = useState(0);
  const [done, setDone] = useState(false);

  const data = query.data;
  type OpenData = Extract<
    Awaited<ReturnType<typeof getPublicDiagApplication>>,
    { state: "open" }
  >;
  const open: OpenData | null =
    data?.found && data.state === "open" ? (data as OpenData) : null;

  if (open && !hydrated) {
    const initial: Record<string, LocalAnswer> = {};
    for (const a of open.answers) initial[a.question_code] = { value: a.value, is_na: a.is_na };
    setAnswers(initial);
    setHydrated(true);
    if (open.consentAcceptedAt) {
      setAccepted(true);
      setStarted(true);
    }
  }

  const questions = open?.questions ?? [];
  const pages = useMemo(() => {
    const out: (typeof questions)[] = [];
    for (let i = 0; i < questions.length; i += PER_PAGE) out.push(questions.slice(i, i + PER_PAGE));
    return out;
  }, [questions]);

  const answeredCount = questions.filter((q) => {
    const a = answers[q.code];
    return a && (a.is_na || a.value !== null);
  }).length;

  const startMutation = useMutation({
    mutationFn: () => consent({ data: { token } }),
    onSuccess: () => setStarted(true),
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Não foi possível iniciar."),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      submit({
        data: {
          token,
          answers: questions.map((q) => ({
            question_code: q.code,
            value: answers[q.code]?.is_na ? null : (answers[q.code]?.value ?? null),
            is_na: !!answers[q.code]?.is_na,
          })),
        },
      }),
    onSuccess: () => setDone(true),
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar as respostas."),
  });

  function persist(codes: string[]) {
    if (!codes.length) return;
    void save({
      data: {
        token,
        answers: codes.map((code) => ({
          question_code: code,
          value: answers[code]?.is_na ? null : (answers[code]?.value ?? null),
          is_na: !!answers[code]?.is_na,
        })),
      },
    }).catch(() => undefined);
  }

  function setAnswer(code: string, value: number | null, is_na: boolean) {
    setAnswers((prev) => ({ ...prev, [code]: { value, is_na } }));
  }

  if (query.isLoading) return <Shell>Carregando sua aplicação...</Shell>;

  if (!data?.found)
    return (
      <Shell>
        <StateCard
          title="Link inválido"
          text="Este link não corresponde a nenhuma aplicação ativa. Solicite um novo link ao analista APAS responsável."
        />
      </Shell>
    );

  if (data.state === "cancelled")
    return (
      <Shell>
        <StateCard
          title="Aplicação indisponível"
          text="Esta aplicação foi cancelada ou está temporariamente indisponível. Fale com o analista APAS responsável."
        />
      </Shell>
    );

  if (data.state === "completed" || done)
    return (
      <Shell>
        <Card className="surface-panel text-center">
          <CardHeader>
            <CheckCircle2 className="mx-auto size-10 text-primary" />
            <CardTitle className="mt-3 font-display text-2xl">
              Respostas enviadas com sucesso
            </CardTitle>
            <CardDescription className="mx-auto max-w-md">
              Suas respostas foram registradas com segurança. A análise é conduzida por um analista
              APAS e o relatório será disponibilizado conforme a configuração acordada com a
              empresa. Nenhum resultado é exibido nesta tela.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Você pode fechar esta página. Obrigado pela colaboração.
            </p>
          </CardContent>
        </Card>
      </Shell>
    );

  if (!open) return <Shell>Carregando...</Shell>;

  if (!started)
    return (
      <Shell>
        <Card className="surface-panel">
          <CardHeader>
            <p className="eyebrow">APAS DIAGNÓSTICA</p>
            <CardTitle className="font-display text-2xl">{open.instrument.name}</CardTitle>
            <CardDescription>
              {open.participantName ? `Olá, ${open.participantName}. ` : ""}
              Este questionário reúne sua percepção sobre a organização em dez áreas de gestão. Não
              existem respostas certas ou erradas — responda pensando na realidade atual do dia a
              dia.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            {open.companyName && (
              <p className="text-muted-foreground">
                Empresa: <span className="text-foreground">{open.companyName}</span>
              </p>
            )}
            {open.context && (
              <p className="rounded-md border border-border bg-background p-3 text-muted-foreground">
                {open.context}
              </p>
            )}

            <div className="rounded-md border border-border bg-background p-4">
              <p className="flex items-center gap-2 font-medium">
                <ShieldCheck className="size-4 text-primary" /> Privacidade e consentimento (LGPD)
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li>
                  Finalidade: subsidiar o diagnóstico organizacional conduzido pela APAS Soluções.
                </li>
                <li>Coletamos apenas suas respostas e os dados de contato já cadastrados.</li>
                <li>
                  As respostas ficam armazenadas de forma restrita e não são divulgadas
                  individualmente; o relatório apresenta apenas leituras consolidadas.
                </li>
                <li>
                  O resultado é uma leitura organizacional em calibração (heurística V1) e não
                  constitui diagnóstico clínico, psicológico ou auditoria.
                </li>
                <li>
                  Você pode solicitar informações ou a exclusão dos seus dados ao analista APAS
                  responsável.
                </li>
              </ul>
              <label className="mt-4 flex items-start gap-3 text-sm">
                <Checkbox
                  checked={accepted}
                  onCheckedChange={(v) => setAccepted(v === true)}
                  className="mt-0.5"
                />
                <span>
                  Li e concordo com o tratamento das minhas respostas para a finalidade descrita.
                </span>
              </label>
            </div>

            <Button
              className="w-full"
              disabled={!accepted || startMutation.isPending}
              onClick={() => startMutation.mutate()}
            >
              {startMutation.isPending ? "Iniciando..." : "Iniciar questionário"}
            </Button>
            <p className="text-xs text-muted-foreground">
              {open.instrument.name} · versão {open.instrument.version} ·{" "}
              {open.questions.length} questões
            </p>
          </CardContent>
        </Card>
      </Shell>
    );

  const current = pages[page] ?? [];
  const dimName = new Map(open.dimensions.map((d) => [d.code, d.name]));
  const currentComplete = current.every((q) => {
    const a = answers[q.code];
    return a && (a.is_na || a.value !== null);
  });
  const isLast = page === pages.length - 1;

  return (
    <Shell>
      <div className="space-y-4">
        <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Etapa {page + 1} de {pages.length}
            </span>
            <span>
              {answeredCount}/{questions.length} respondidas
            </span>
          </div>
          <Progress value={(answeredCount / Math.max(questions.length, 1)) * 100} className="mt-2" />
        </div>

        {current.map((q) => {
          const a = answers[q.code];
          return (
            <Card key={q.code}>
              <CardHeader className="pb-3">
                <p className="eyebrow">{dimName.get(q.dimension_code) ?? q.dimension_code}</p>
                <CardTitle className="text-base font-medium leading-snug">{q.text}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {open.instrument.scale.map((opt) => {
                  const isNa = opt.value === null;
                  const selected = isNa ? !!a?.is_na : !a?.is_na && a?.value === opt.value;
                  if (isNa && !q.allow_na) return null;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setAnswer(q.code, isNa ? null : opt.value, isNa)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border hover:bg-secondary",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                          selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                        )}
                      >
                        {opt.short}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}

        <div className="flex gap-3 pb-10">
          {page > 0 && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                persist(current.map((q) => q.code));
                setPage((p) => p - 1);
                window.scrollTo({ top: 0 });
              }}
            >
              Voltar
            </Button>
          )}
          {isLast ? (
            <Button
              className="flex-1"
              disabled={
                !currentComplete || answeredCount < questions.length || submitMutation.isPending
              }
              onClick={() => submitMutation.mutate()}
            >
              {submitMutation.isPending ? "Enviando..." : "Enviar respostas"}
            </Button>
          ) : (
            <Button
              className="flex-1"
              disabled={!currentComplete}
              onClick={() => {
                persist(current.map((q) => q.code));
                setPage((p) => p + 1);
                window.scrollTo({ top: 0 });
              }}
            >
              Continuar
            </Button>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-sidebar">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3">
          <span className="grid size-8 place-items-center rounded bg-primary font-display text-sm font-bold text-primary-foreground">
            A
          </span>
          <span className="font-display text-sm font-semibold tracking-tight">
            APAS <span className="text-primary">DIAGNÓSTICA</span>
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
      <footer className="mx-auto max-w-2xl px-4 pb-10 text-xs text-muted-foreground">
        APAS Soluções · Diagnóstico organizacional em calibração (heurística V1). Não constitui
        diagnóstico clínico ou auditoria.
      </footer>
    </div>
  );
}

function StateCard({ title, text }: { title: string; text: string }) {
  return (
    <Card className="surface-panel">
      <CardHeader>
        <CardTitle className="font-display text-xl">{title}</CardTitle>
        <CardDescription>{text}</CardDescription>
      </CardHeader>
    </Card>
  );
}
