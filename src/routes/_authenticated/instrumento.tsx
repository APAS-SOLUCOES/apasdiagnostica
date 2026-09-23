import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getInstrumentConfig, saveInstrumentConfig } from "@/lib/apas.functions";
import { AppShell } from "@/components/apas/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DIMENSIONS,
  DIMENSION_NAMES,
  INSTRUMENT_META,
  type Dimension,
  type InstrumentItem,
} from "@/lib/disc/instrument";

export const Route = createFileRoute("/_authenticated/instrumento")({
  head: () => ({
    meta: [
      { title: "Instrumento e pontuação — APAS DISC Profile" },
      {
        name: "description",
        content:
          "Edite os 24 blocos de afirmações e as regras de pontuação D, I, S e C sem alterar o sistema.",
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

type BlockRow = { id: string; labels: Record<Dimension, string>; keys: Record<Dimension, string> };

function toRows(items: InstrumentItem[]): BlockRow[] {
  return items.map((item, index) => {
    const labels = { D: "", I: "", S: "", C: "" } as Record<Dimension, string>;
    const keys = { D: "", I: "", S: "", C: "" } as Record<Dimension, string>;
    for (const opt of item.options) {
      labels[opt.dimension] = opt.label;
      keys[opt.dimension] = opt.key;
    }
    return { id: item.id || `b${String(index + 1).padStart(2, "0")}`, labels, keys };
  });
}

function toItems(rows: BlockRow[]): InstrumentItem[] {
  return rows.map((row) => ({
    id: row.id,
    options: DIMENSIONS.map((d) => ({
      key: row.keys[d] || `${row.id}-${d.toLowerCase()}`,
      label: row.labels[d].trim(),
      dimension: d,
    })),
  }));
}

function InstrumentoPage() {
  const qc = useQueryClient();
  const get = useServerFn(getInstrumentConfig);
  const save = useServerFn(saveInstrumentConfig);

  const current = useQuery({ queryKey: ["instrument"], queryFn: () => get() });
  const [meta, setMeta] = useState({ name: "", version: "" });
  const [rows, setRows] = useState<BlockRow[]>([]);
  const [scoring, setScoring] = useState("");
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    if (!current.data) return;
    setMeta({ name: current.data.name, version: current.data.version });
    setRows(toRows(current.data.items));
    setScoring(JSON.stringify(current.data.scoring, null, 2));
  }, [current.data]);

  const stats = useMemo(() => {
    const counts = { D: 0, I: 0, S: 0, C: 0 } as Record<Dimension, number>;
    let empty = 0;
    for (const row of rows) {
      for (const d of DIMENSIONS) {
        if (row.labels[d].trim()) counts[d] += 1;
        else empty += 1;
      }
    }
    return { counts, empty, blocks: rows.length };
  }, [rows]);

  const mutation = useMutation({
    mutationFn: () => {
      if (stats.empty > 0) {
        throw new Error("Todas as afirmações devem estar preenchidas antes de salvar.");
      }
      return save({
        data: {
          name: meta.name,
          version: meta.version,
          items: JSON.stringify(toItems(rows)),
          scoring,
        },
      });
    },
    onSuccess: (row) => {
      toast.success(`Nova versão ativa: ${row.version}`);
      void qc.invalidateQueries({ queryKey: ["instrument"] });
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível salvar."),
  });

  function updateLabel(index: number, dimension: Dimension, value: string) {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, labels: { ...row.labels, [dimension]: value } } : row,
      ),
    );
  }

  return (
    <AppShell
      title="Instrumento e pontuação"
      description="As afirmações e as regras de cálculo ficam em configuração versionada. Salvar cria uma nova versão ativa, sem alterar avaliações já concluídas."
    >
      <div className="mb-6 rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm">
        <p className="font-semibold text-primary">
          {INSTRUMENT_META.code} — instrumento provisório, validar antes de uso comercial
        </p>
        <p className="mt-2 text-muted-foreground">
          Versão de referência {INSTRUMENT_META.version} ({INSTRUMENT_META.releaseDate}) ·{" "}
          {INSTRUMENT_META.blocks} blocos · {INSTRUMENT_META.totalStatements} afirmações (
          {INSTRUMENT_META.perDimension} por dimensão). Regra: {INSTRUMENT_META.ruleDescription}
        </p>
        <p className="mt-2 text-muted-foreground">
          Nenhum resultado deve ser tratado como diagnóstico clínico ou psicológico. Avaliações já
          concluídas permanecem vinculadas à versão utilizada no momento da resposta.
        </p>
      </div>

      {current.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando configuração…
        </div>
      ) : (
        <form
          className="space-y-6"
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
                value={meta.name}
                onChange={(e) => setMeta({ ...meta, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Versão</Label>
              <Input
                id="version"
                value={meta.version}
                onChange={(e) => setMeta({ ...meta, version: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-border px-3 py-1">
              {stats.blocks} blocos
            </span>
            {DIMENSIONS.map((d) => (
              <span key={d} className="rounded-full border border-border px-3 py-1">
                {d} · {DIMENSION_NAMES[d]}: {stats.counts[d]}
              </span>
            ))}
            <span
              className={
                stats.empty > 0
                  ? "rounded-full bg-primary/10 px-3 py-1 font-medium text-primary"
                  : "rounded-full border border-border px-3 py-1 text-muted-foreground"
              }
            >
              {stats.empty > 0 ? `${stats.empty} afirmações vazias` : "Todas as afirmações preenchidas"}
            </span>
          </div>

          <div className="space-y-4">
            {rows.map((row, index) => (
              <div key={row.id} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    Bloco {index + 1}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">{row.id}</span>
                  </p>
                  <span className="text-xs text-muted-foreground">
                    O participante escolhe uma como MAIS e outra como MENOS
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {DIMENSIONS.map((d) => (
                    <div key={d} className="space-y-1.5">
                      <Label
                        htmlFor={`${row.id}-${d}`}
                        className="text-xs text-muted-foreground"
                      >
                        {d} · {DIMENSION_NAMES[d]}
                      </Label>
                      <Textarea
                        id={`${row.id}-${d}`}
                        value={row.labels[d]}
                        onChange={(e) => updateLabel(index, d, e.target.value)}
                        className="min-h-16 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="scoring">Regras de pontuação (JSON)</Label>
              <Button type="button" variant="ghost" onClick={() => setShowJson((v) => !v)}>
                {showJson ? "Ocultar" : "Editar regras"}
              </Button>
            </div>
            {showJson && (
              <Textarea
                id="scoring"
                value={scoring}
                onChange={(e) => setScoring(e.target.value)}
                className="min-h-52 font-mono text-xs"
              />
            )}
            <p className="text-xs text-muted-foreground">
              Campos configuráveis: mostWeight, leastWeight, naturalBase, adaptedMode,
              predominantSource, thresholds e adaptationAlert.
            </p>
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
