import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso do Coach — APAS DISC Profile" },
      {
        name: "description",
        content:
          "Área administrativa da APAS Soluções para criar e acompanhar avaliações comportamentais DISC.",
      },
      { property: "og:title", content: "Acesso do Coach — APAS DISC Profile" },
      {
        property: "og:description",
        content: "Entre na área administrativa da plataforma APAS DISC Profile.",
      },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido").max(200),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres").max(72),
  fullName: z.string().trim().min(2, "Informe seu nome").max(120).optional(),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function submit(mode: "signin" | "signup") {
    const parsed = schema.safeParse({
      email,
      password,
      fullName: mode === "signup" ? fullName : undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta.");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Cadastro criado. Verifique seu e-mail se a confirmação for exigida.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível autenticar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="eyebrow block text-center">
          APAS Soluções
        </Link>
        <Card className="mt-4 surface-panel">
          <CardHeader>
            <CardTitle className="font-display">Área administrativa</CardTitle>
            <CardDescription>
              Acesso restrito ao Coach APAS. Os avaliados respondem por link exclusivo, sem login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-4 space-y-4">
                <Field label="E-mail" value={email} onChange={setEmail} type="email" />
                <Field label="Senha" value={password} onChange={setPassword} type="password" />
                <Button className="w-full" disabled={loading} onClick={() => submit("signin")}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="mt-4 space-y-4">
                <Field label="Nome completo" value={fullName} onChange={setFullName} />
                <Field label="E-mail" value={email} onChange={setEmail} type="email" />
                <Field label="Senha" value={password} onChange={setPassword} type="password" />
                <Button className="w-full" disabled={loading} onClick={() => submit("signup")}>
                  {loading ? "Criando..." : "Criar conta"}
                </Button>
              </TabsContent>
            </Tabs>

          </CardContent>
        </Card>
      </div>
    </div>
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
