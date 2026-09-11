import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/apas/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  createDiagApplication,
  getDiagInstrument,
  listDiagApplications,
} from "@/lib/diagnostica.functions";
import { listOrganizations } from "@/lib/apas.functions";

export const Route = createFileRoute("/_authenticated/aplicacoes/")({
  head: () => ({
    meta: [
      { title: "Aplicações — APAS DIAGNÓSTICA" },
      {
        name: "description",
        content:
          "Crie e acompanhe aplicações do Diagnóstico Empresarial APAS: token exclusivo, respostas, pré-diagnóstico e liberação.",
      },
      { property: "og:title", content: "Aplicações — APAS DIAGNÓSTICA" },
      {
        property: "og:description",
        content: "Gerencie as aplicações do Diagnóstico Empresarial APAS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Aplicacoes,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando resposta",
  in_progress: "Em andamento",
  submitted: "Enviado",
  in_review: "Em análise",
  validated: "Validado",
  released: "Liberado",
  cancelled: "Cancelado",
};

const schema = z.object({
  full_name: z.string().trim().min(2, "Informe o nome do participante").max(120),
  email: z.string().trim().email("E-mail inválido").max(200).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  role_title: z.string().trim().max(120).optional().or(z.literal("")),
  organization_id: z.string().uuid().optional().or(z.literal("")),
  context: z.string().trim().max(1500).optional().or(z.literal("")),
});

function Aplicacoes() {
  const list = useServerFn(listDiagApplications);
  const create = useServerFn(createDiagApplication);
  const instrument = useServerFn(getDiagInstrument);
  const fetchOrgs = useServerFn(listOrganizations);
  const qc = useQueryClient();

  const apps = useQuery({ queryKey: ["diag-applications"], queryFn: () => list() });
  const inst = useQuery({ queryKey: ["diag-instrument"], queryFn: () => instrument() });
  const orgs = useQuery({ queryKey: ["organizations"], queryFn: () => fetchOrgs() });

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    whatsapp: "",
    role_title: "",
    organization_id: "",
    context: "",
  });
  const [link, setLink] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof schema>) => create({ data: values }),
    onSuccess: (row) => {
      setLink(`${window.location.origin}/q/${row.token}`);
      setForm({
        full_name: "",
        email: "",
        whatsapp: "",
        role_title: "",
        organization_id: "",
        context: "",
      });
      void qc.invalidateQueries({ queryKey: ["diag-applications"] });
      toast.success("Aplicação criada e link exclusivo gerado.");
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Não foi possível criar a aplicação."),
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <AppShell
      title="Aplicações"
      description="Diagnóstico Empresarial APAS: cada participante recebe um link exclusivo. As respostas são privadas e o relatório só é liberado após validação do analista."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nova aplicação</CardTitle>
            <CardDescription>
              {inst.data
                ? `${inst.data.instrument.name} · versão ${inst.data.instrument.version} · ${inst.data.totals.questions} questões`
                : "Carregando instrumento..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="full_name"
                label="Participante *"
                value={form.full_name}
                onChange={(v) => set("full_name", v)}
              />
              <Field
                id="email"
                type="email"
                label="E-mail"
                value={form.email}
                onChange={(v) => set("email", v)}
              />
              <Field
                id="whatsapp"
                label="WhatsApp"
                value={form.whatsapp}
                onChange={(v) => set("whatsapp", v)}
              />
              <Field
                id="role_title"
                label="Cargo / função"
                value={form.role_title}
                onChange={(v) => set("role_title", v)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization_id">Empresa (opcional)</Label>
              <select
                id="organization_id"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.organization_id}
                onChange={(e) => set("organization_id", e.target.value)}
              >
                <option value="">Sem empresa vinculada</option>
                {(orgs.data ?? []).map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="context">Contexto da aplicação</Label>
              <Textarea
                id="context"
                rows={3}
                maxLength={1500}
                value={form.context}
                onChange={(e) => set("context", e.target.value)}
                placeholder="Momento da empresa, objetivo do diagnóstico, área analisada..."
              />
            </div>
            <Button
              disabled={mutation.isPending}
              onClick={() => {
                const parsed = schema.safeParse(form);
                if (!parsed.success) {
                  toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
                  return;
                }
                mutation.mutate(parsed.data);
              }}
            >
              {mutation.isPending ? "Gerando link..." : "Criar aplicação e gerar link"}
            </Button>

            {link && (
              <div className="space-y-2 rounded-md border border-border bg-background p-3">
                <p className="break-all text-xs">{link}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(link);
                    toast.success("Link copiado.");
                  }}
                >
                  <Copy className="size-4" /> Copiar link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aplicações registradas</CardTitle>
            <CardDescription>
              {apps.data ? `${apps.data.length} aplicação(ões)` : "Carregando..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {apps.isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
            {apps.data?.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma aplicação criada ainda.</p>
            )}
            {(apps.data ?? []).map((a) => {
              const participant = a.participants as { full_name?: string; role_title?: string | null } | null;
              const org = a.organizations as { name?: string } | null;
              return (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {participant?.full_name ?? "Participante"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[org?.name, participant?.role_title, a.context].filter(Boolean).join(" · ") ||
                        "Sem contexto informado"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{STATUS_LABEL[a.status] ?? a.status}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        void navigator.clipboard.writeText(
                          `${window.location.origin}/q/${a.token}`,
                        );
                        toast.success("Link copiado.");
                      }}
                    >
                      <Copy className="size-4" />
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/aplicacoes/$id" params={{ id: a.id }}>
                        Abrir
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
