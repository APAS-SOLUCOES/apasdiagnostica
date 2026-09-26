import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/aplicacoes", label: "Diagnóstico Empresarial" },
  { to: "/avaliacoes/nova", label: "DISC" },
  { to: "/empresas", label: "Empresas" },
  { to: "/instrumento", label: "Instrumentos" },
] as const;

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-sidebar/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img
              src="/apas-logo.svg?v=final-logo-20260926"
              alt="APAS Soluções"
              className="h-10 w-10 shrink-0 rounded-sm bg-black object-contain p-0.5"
            />
            <span className="font-display text-sm font-semibold tracking-tight">
              APAS <span className="text-primary">DIAGNÓSTICA</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
            <Button variant="ghost" size="sm" onClick={signOut} className="ml-2">
              <LogOut className="size-4" /> Sair
            </Button>
          </nav>

          <button
            className="md:hidden"
            aria-label="Abrir menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border px-4 pb-3 md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={signOut}
              className="block w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground"
            >
              Sair
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">
              APAS Diagnóstica · Diagnósticos Empresariais, Comportamentais e de Pessoas
            </p>
            <h1 className={cn("mt-1 text-2xl font-semibold sm:text-3xl", "rule-red")}>{title}</h1>
            {description && (
              <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions}
        </div>
        {children}
      </main>
    </div>
  );
}
