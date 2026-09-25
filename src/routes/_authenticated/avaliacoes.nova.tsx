import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Copy, Mail } from "lucide-react";
import { AppShell } from "@/components/apas/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createAssessment, listOrganizations } from "@/lib/apas.functions";

export const Route = createFileRoute("/_authenticated/avaliacoes/nova")({
  head: () => ({
    meta: [
      { title: "Nova avaliação — APAS DISC Profile" },
      {
        name: "description",
        content: "Cadastre o avaliado e gere o link exclusivo da avaliação comportamental APAS.",
      },
      { property: "og:title", content: "Nova avaliação — APAS DISC Profile" },
      {
        property: "og:description",
        content: "Cadastre o avaliado e gere um link exclusivo de resposta.",
      },
    ],
  }),
  component: NovaAvaliacao,
});

const schema = z.object({
  candidate_name: z.string().trim().min(2, "Informe o nome do avaliado").max(120),
  candidate_email: z.string().trim().email("Informe um e-mail válido").max(200),
  candidate_whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  role_title: z.string().trim().max(120).optional().or(z.literal("")),
  organization_id: z.string().uuid().optional().or(z.literal("")),
  context: z.string().trim().max(1000).optional().or(z.literal("")),
});

function NovaAvaliacao() {
  const create = useServerFn(createAssessment);
  const fetchOrgs = useServerFn(listOrganizations);
  const [form, setForm] = useState({
    candidate_name: "",
    candidate_email: "",
    candidate_whatsapp: "",
    role_title: "",
    organization_id: "",
    context: "",
  });
  const [link, setLink] = useState<string | null>(null);

  const orgs = useQuery({ queryKey: ["organizations"], queryFn: () => fetchOrgs() });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof schema>) => create({ data: values }),
    onSuccess: (row) => {
      setLink(`${window.location.origin}/a/${row.token}`);
      toast.success("Avaliação criada e link gerado.");
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Não foi possível criar a avaliação."),
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos.");
      return;
    }
    mutation.mutate(parsed.data);
  }

  return (
    <AppShell
      title="Nova avaliação"
      description="Cadastre os dados do avaliado e gere um link exclusivo. O avaliado responde sem login e não tem acesso a nenhuma outra avaliação."
      actions={
        <Button variant="outline" asChild>
          <Link to="/dashboard">Voltar ao dashboard</Link>
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do avaliado</CardTitle>
            <CardDescription>Campos com * são obrigatórios.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nome completo *"
                value={form.candidate_name}
                onChange={(v) => set("candidate_name", v)}
              />
              <Field
                label="E-mail *"
                type="email"
                value={form.candidate_email}
                onChange={(v) => set("candidate_email", v)}
              />
              <Field
                label="WhatsApp"
                value={form.candidate_whatsapp}
                onChange={(v) => set("candidate_whatsapp", v)}
              />
              <Field
                label="Cargo / vaga"
                value={form.role_title}
                onChange={(v) => set("role_title", v)}
              />
            </div>

            <div className="space-y-2">
              <Label>Empresa (opcional)</Label>
              <select
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
              <Label>Observações / contexto</Label>
              <Textarea
                rows={4}
                maxLength={1000}
                value={form.context}
                onChange={(e) => set("context", e.target.value)}
                placeholder="Objetivo da avaliação, momento de carreira, desafios do cargo..."
              />
            </div>

            <Button disabled={mutation.isPending} onClick={submit}>
              {mutation.isPending ? "Gerando link..." : "Criar avaliação e gerar link"}
            </Button>
          </CardContent>
        </Card>

        <Card className="surface-panel h-fit">
          <CardHeader>
            <CardTitle className="text-base">Link exclusivo</CardTitle>
            <CardDescription>
              Envie por e-mail ou WhatsApp. O link é único, individual e válido apenas para esta
              avaliação.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {link ? (
              <>
                <p className="break-all rounded-md border border-border bg-background p-3 text-xs">
                  {link}
                </p>
                <Button
                  className="w-full"
                  onClick={() => {
                    const subject = encodeURIComponent("Sua avaliação comportamental APAS DIAGNÓSTICA");
                    const body = encodeURIComponent(
                      `Olá, ${form.candidate_name}!\n\nSua avaliação comportamental APAS DIAGNÓSTICA foi criada. Para responder, acesse o link abaixo:\n\n${link}\n\nResponda com tranquilidade e atenção.\n\nAPAS Soluções\ncontato@apassolucoes.com.br`
                    );
                    window.location.href = `mailto:${form.candidate_email}?subject=${subject}&body=${body}`;
                  }}
                >
                  <Mail className="size-4" /> Enviar por e-mail
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    void navigator.clipboard.writeText(link);
                    toast.success("Link copiado.");
                  }}
                >
                  <Copy className="size-4" /> Copiar link
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/dashboard">Ir para o dashboard</Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                O link aparecerá aqui após a criação da avaliação.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
