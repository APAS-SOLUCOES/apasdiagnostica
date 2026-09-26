import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  DEFAULT_INSTRUMENT,
  type Instrument,
  type InstrumentItem,
  type ScoringConfig,
} from "./disc/instrument";

function randomToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const listAssessments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("assessments")
      .select(
        "id, candidate_name, candidate_email, candidate_whatsapp, context, role_title, token, status, created_at, submitted_at, organization_id, organizations(name)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listOrganizations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("organizations")
      .select("id, name, contact_name, contact_email, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().trim().min(2).max(120),
        contact_name: z.string().trim().max(120).optional(),
        contact_email: z.string().trim().email().max(200).optional().or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("organizations")
      .insert({
        coach_id: context.userId,
        name: data.name,
        contact_name: data.contact_name ?? null,
        contact_email: data.contact_email || null,
      })
      .select("id, name")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const createAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        candidate_name: z.string().trim().min(2).max(120),
        candidate_email: z.string().trim().email().max(200),
        candidate_whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
        context: z.string().trim().max(1000).optional().or(z.literal("")),
        role_title: z.string().trim().max(120).optional().or(z.literal("")),
        organization_id: z.string().uuid().optional().or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: instrument } = await context.supabase
      .from("instruments")
      .select("id, version")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: row, error } = await context.supabase
      .from("assessments")
      .insert({
        coach_id: context.userId,
        candidate_name: data.candidate_name,
        candidate_email: data.candidate_email,
        candidate_whatsapp: data.candidate_whatsapp || null,
        context: data.context || null,
        role_title: data.role_title || null,
        organization_id: data.organization_id || null,
        instrument_id: instrument?.id ?? null,
        instrument_version: instrument?.version ?? DEFAULT_INSTRUMENT.version,
        token: randomToken(),
        status: "pending",
      })
      .select("id, token")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });


export const sendAssessmentEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ assessment_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: assessment, error } = await context.supabase
      .from("assessments")
      .select("id, candidate_name, candidate_email, token, coach_id")
      .eq("id", data.assessment_id)
      .single();

    if (error || !assessment) throw new Error(error?.message ?? "Avaliação não encontrada.");
    if (assessment.coach_id !== context.userId) {
      throw new Error("Você não tem permissão para enviar esta avaliação.");
    }

    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) {
      throw new Error(
        "O envio automático de e-mail ainda não está configurado. Adicione RESEND_API_KEY aos segredos do aplicativo.",
      );
    }

    const from =
      process.env["RESEND_FROM_EMAIL"] ||
      "APAS Soluções <contato@apassolucoes.com.br>";
    const replyTo =
      typeof context.claims?.email === "string" &&
      /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(context.claims.email)
        ? context.claims.email
        : undefined;
    const baseUrl =
      process.env["PUBLIC_APP_URL"] || "https://apasdiagnostica.online";
    const link = baseUrl.replace(/\/$/, "") + "/a/" + assessment.token;
    const name = assessment.candidate_name
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

    const html = [
      '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171717;max-width:640px;margin:0 auto">',
      '<h2 style="margin-bottom:8px">APAS DIAGNÓSTICA</h2>',
      '<p>Olá, ' + name + '!</p>',
      '<p>Sua avaliação comportamental foi criada. Para responder, acesse o link abaixo:</p>',
      '<p style="margin:24px 0"><a href="' + link + '" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px">Acessar minha avaliação</a></p>',
      '<p style="font-size:13px;color:#666">Se o botão não abrir, copie e cole este endereço no navegador:</p>',
      '<p style="font-size:13px;word-break:break-all">' + link + '</p>',
      '<p>Responda com tranquilidade e atenção.</p>',
      '<p style="margin-top:28px">APAS Soluções</p>',
      '</div>',
    ].join("");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        ...(replyTo ? { reply_to: replyTo } : {}),
        to: [assessment.candidate_email],
        subject: "Sua avaliação comportamental APAS DIAGNÓSTICA",
        html,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("[Resend] Email send failed:", details);
      throw new Error(
        "O Resend recusou o envio do e-mail. Verifique o domínio/remetente configurado.",
      );
    }

    const result = (await response.json()) as { id?: string };
    return { ok: true, id: result.id ?? null, to: assessment.candidate_email };
  });

export const deleteAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("assessments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getAssessmentDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: assessment, error } = await context.supabase
      .from("assessments")
      .select("*, organizations(name)")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);

    const [{ data: responseMetadata }, { data: result }] = await Promise.all([
      context.supabase
        .from("assessment_responses")
        .select("created_at")
        .eq("assessment_id", data.id)
        .maybeSingle(),
      context.supabase
        .from("assessment_results")
        .select("scores, predominant, combination, scoring_version, computed_at")
        .eq("assessment_id", data.id)
        .maybeSingle(),
    ]);

    return { assessment, responseMetadata: responseMetadata ?? null, result: result ?? null };
  });

export const getInstrumentConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Instrument> => {
    const { data } = await context.supabase
      .from("instruments")
      .select("id, name, version, status, items, scoring")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return DEFAULT_INSTRUMENT;
    return {
      id: data.id,
      name: data.name,
      version: data.version,
      status: data.status === "active" ? "active" : "draft",
      items: (data.items as unknown as InstrumentItem[]) ?? DEFAULT_INSTRUMENT.items,
      scoring: {
        ...DEFAULT_INSTRUMENT.scoring,
        ...((data.scoring as unknown as Partial<ScoringConfig>) ?? {}),
      },
    };
  });

export const saveInstrumentConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().trim().min(2).max(160),
        version: z.string().trim().min(1).max(40),
        items: z.string().max(200000),
        scoring: z.string().max(20000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    let items: unknown;
    let scoring: unknown;
    try {
      items = JSON.parse(data.items);
      scoring = JSON.parse(data.scoring);
    } catch {
      throw new Error("JSON inválido. Verifique a estrutura das perguntas e das regras.");
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("O instrumento precisa ter ao menos um bloco de perguntas.");
    }

    await context.supabase
      .from("instruments")
      .update({ status: "draft" })
      .eq("status", "active")
      .eq("created_by", context.userId);

    const { data: row, error } = await context.supabase
      .from("instruments")
      .insert({
        created_by: context.userId,
        name: data.name,
        version: data.version,
        status: "active",
        items: items as never,
        scoring: scoring as never,
      })
      .select("id, version")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
