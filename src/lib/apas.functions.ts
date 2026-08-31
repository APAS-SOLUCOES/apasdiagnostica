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
        "id, candidate_name, candidate_email, candidate_whatsapp, context, token, status, created_at, submitted_at, organization_id, organizations(name)",
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

    const [{ data: responses }, { data: result }] = await Promise.all([
      context.supabase
        .from("assessment_responses")
        .select("answers, meta, created_at")
        .eq("assessment_id", data.id)
        .maybeSingle(),
      context.supabase
        .from("assessment_results")
        .select("scores, predominant, combination, scoring_version, computed_at")
        .eq("assessment_id", data.id)
        .maybeSingle(),
    ]);

    return { assessment, responses: responses ?? null, result: result ?? null };
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
