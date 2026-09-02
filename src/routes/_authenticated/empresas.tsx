import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { createOrganization, listOrganizations } from "@/lib/apas.functions";
import { AppShell } from "@/components/apas/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/empresas")({
  head: () => ({
    meta: [
      { title: "Empresas — APAS DISC Profile" },
      {
        name: "description",
        content: "Cadastre empresas clientes e organize avaliações comportamentais por equipe.",
      },
      { property: "og:title", content: "Empresas — APAS DISC Profile" },
      {
        property: "og:description",
        content: "Cadastro de empresas clientes da APAS Soluções.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmpresasPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Informe o nome da empresa").max(120),
  contact_name: z.string().trim().max(120).optional(),
  contact_email: z.string().trim().email("E-mail inválido").max(200).or(z.literal("")),
});

function EmpresasPage() {
  const qc = useQueryClient();
  const list = useServerFn(listOrganizations);
  const create = useServerFn(createOrganization);
  const [form, setForm] = useState({ name: "", contact_name: "", contact_email: "" });

  const orgs = useQuery({ queryKey: ["organizations"], queryFn: () => list() });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof schema>) => create({ data: values }),
    onSuccess: () => {
      toast.success("Empresa cadastrada.");
      setForm({ name: "", contact_name: "", contact_email: "" });
      void qc.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível cadastrar."),
  });

  return (
    <AppShell
      title="Empresas"
      description="Base de clientes corporativos, preparada para avaliações em grupo e relatórios consolidados."
    >
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form
          className="space-y-4 rounded-xl border border-border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const parsed = schema.safeParse(form);
            if (!parsed.success) {
              toast.error(parsed.error.issues[0]?.message ?? "Verifique os campos.");
              return;
            }
            mutation.mutate(parsed.data);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Empresa *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_name">Contato</Label>
            <Input
              id="contact_name"
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_email">E-mail do contato</Label>
            <Input
              id="contact_email"
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Cadastrar empresa
          </Button>
        </form>

        <div className="rounded-xl border border-border bg-card">
          {orgs.isLoading ? (
            <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Carregando…
            </div>
          ) : !orgs.data?.length ? (
            <p className="p-6 text-sm text-muted-foreground">Nenhuma empresa cadastrada ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {orgs.data.map((o) => (
                <li key={o.id} className="flex flex-wrap justify-between gap-2 p-4">
                  <div>
                    <p className="text-sm font-medium">{o.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.contact_name || "—"} · {o.contact_email || "sem e-mail"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
