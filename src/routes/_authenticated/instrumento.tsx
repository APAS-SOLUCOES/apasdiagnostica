import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getInstrumentConfig, saveInstrumentConfig } from "@/lib/apas.functions";
import { AppShell } from "@/components/apas/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/instrumento")({
  head: () => ({
    meta: [
      { title: "Instrumento e pontuação — APAS DISC Profile" },
      {
        name: "description",
        content:
          "Edite blocos de perguntas e regras de pontuação D, I, S e C sem alterar o sistema.",
      },
      { property: "og:title", content: "Instrumento e pontuação — APAS DISC Profile" },
      {
        property: "og:description",
        content: "Configuração versionada do instrumento comportamental da APAS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InstrumentoPage,
});

function InstrumentoPage() {
  const qc = useQueryClient();
  const get = useServerFn(getInstrumentConfig);
  const save = useServerFn(saveInstrumentConfig);

  const current = useQuery({ queryKey: ["instrument"], queryFn: () => get() });
  const [form, setForm] = useState({ name: "", version: "", items: "", scoring: "" });

  useEffect(() => {
    if (!current.data) return;
    setForm({
      name: current.data.name,
      version: current.data.version,
      items: JSON.stringify(current.data.items, null, 2),
      scoring: JSON.stringify(current.data.scoring, null, 2),
    });
  }, [current.data]);

  const mutation = useMutation({
    mutationFn: () => save({ data: form }),
    onSuccess: (row) => {
      toast.success(`Nova versão ativa: ${row.version}`);
      void qc.invalidateQueries({ queryKey: ["instrument"] });
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível salvar."),
  });

  return (
    <AppShell
      title="Instrumento e pontuação"
      description="As perguntas e as regras de cálculo ficam em configuração versionada. Salvar cria uma nova versão ativa, sem alterar avaliações já concluídas."
    >
      <div className="mb-6 rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm">
        <p className="font-semibold text-primary">
          Instrumento provisório — validar antes de uso comercial
        </p>
        <p className="mt-2 text-muted-foreground">
          Use esta área para calibrar blocos, opções e limiares. Nenhum resultado deve ser tratado
          como diagnóstico clínico ou psicológico.
        </p>
      </div>

      {current.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando configuração…
        </div>
      ) : (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do instrumento</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Versão</Label>
              <Input
                id="version"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="items">Blocos de perguntas (JSON)</Label>
            <Textarea
              id="items"
              value={form.items}
              onChange={(e) => setForm({ ...form, items: e.target.value })}
              className="min-h-72 font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scoring">Regras de pontuação (JSON)</Label>
            <Textarea
              id="scoring"
              value={form.scoring}
              onChange={(e) => setForm({ ...form, scoring: e.target.value })}
              className="min-h-52 font-mono text-xs"
            />
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Salvar como nova versão ativa
          </Button>
        </form>
      )}
    </AppShell>
  );
}
