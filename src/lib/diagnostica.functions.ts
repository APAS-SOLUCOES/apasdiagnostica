/**
 * Fluxo do analista APAS — Diagnóstico Empresarial.
 * Todas as funções exigem sessão autenticada (RLS aplica-se como o próprio analista).
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { loadBundle, type BundleClient } from "./diagnostica/bundle";
import { computeDiagnostic } from "./diagnostica/engine";
import { buildReportContent } from "./diagnostica/report";
import type { AnswerInput, EngineResult } from "./diagnostica/types";

function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const idInput = (input: unknown) => z.object({ id: z.string().uuid() }).parse(input);

export const getDiagInstrument = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const bundle = await loadBundle(context.supabase as unknown as BundleClient);
    return {
      instrument: bundle.instrument,
      dimensions: bundle.dimensions.map((d) => ({
        code: d.code,
        name: d.name,
        questions: bundle.questions.filter((q) => q.dimension_code === d.code).length,
      })),
      totals: {
        questions: bundle.questions.length,
        stages: bundle.stages.length,
        patterns: bundle.patterns.filter((p) => p.kind === "pattern").length,
        indicators: bundle.patterns.filter((p) => p.kind === "critical").length,
      },
    };
  });

export const listDiagApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("diag_applications")
      .select(
        "id, token, status, context, created_at, submitted_at, validated_at, released_at, instrument_version, participants(full_name, email, role_title), organizations(name)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createDiagApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        full_name: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(200).optional().or(z.literal("")),
        whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
        role_title: z.string().trim().max(120).optional().or(z.literal("")),
        organization_id: z.string().uuid().optional().or(z.literal("")),
        context: z.string().trim().max(1500).optional().or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const bundle = await loadBundle(db as unknown as BundleClient);

    const { data: participant, error: pErr } = await db
      .from("participants")
      .insert({
        analyst_id: context.userId,
        organization_id: data.organization_id || null,
        full_name: data.full_name,
        email: data.email || null,
        whatsapp: data.whatsapp || null,
        role_title: data.role_title || null,
      })
      .select("id, full_name")
      .single();
    if (pErr) throw new Error(pErr.message);

    const token = randomToken();
    const { data: app, error: aErr } = await db
      .from("diag_applications")
      .insert({
        analyst_id: context.userId,
        instrument_id: bundle.instrument.id,
        instrument_version: bundle.instrument.version,
        organization_id: data.organization_id || null,
        participant_id: participant.id,
        token,
        status: "pending",
        context: data.context || null,
      })
      .select("id, token")
      .single();
    if (aErr) throw new Error(aErr.message);

    await db.from("diag_audit_log").insert({
      application_id: app.id,
      actor_id: context.userId,
      actor_type: "analyst",
      action: "application_created",
      details: { participant: participant.full_name, instrument: bundle.instrument.version },
    });

    return app;
  });

export const getDiagApplication = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(idInput)
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const { data: app, error } = await db
      .from("diag_applications")
      .select(
        "id, token, status, context, created_at, consent_accepted_at, started_at, submitted_at, validated_at, released_at, instrument_id, instrument_version, participants(full_name, email, whatsapp, role_title), organizations(name)",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!app) throw new Error("Aplicação não encontrada.");

    const [{ data: answers }, { data: pre }, { data: report }, { data: audit }] = await Promise.all([
      db
        .from("diag_application_answers")
        .select("question_code, value, is_na, answered_at")
        .eq("application_id", data.id),
      db.from("diag_pre_diagnostics").select("*").eq("application_id", data.id).maybeSingle(),
      db.from("diag_reports").select("*").eq("application_id", data.id).maybeSingle(),
      db
        .from("diag_audit_log")
        .select("action, actor_type, details, created_at")
        .eq("application_id", data.id)
        .order("created_at", { ascending: false }),
    ]);

    const bundle = await loadBundle(db as unknown as BundleClient, {
      instrumentId: app.instrument_id ?? undefined,
    });

    return {
      application: app,
      instrument: {
        name: bundle.instrument.name,
        version: bundle.instrument.version,
        scale: bundle.instrument.scale,
      },
      questions: bundle.questions.map((q) => ({
        code: q.code,
        text: q.text,
        dimension_code: q.dimension_code,
        weight: q.weight,
        direction: q.direction,
      })),
      dimensions: bundle.dimensions.map((d) => ({ code: d.code, name: d.name })),
      answers: answers ?? [],
      preDiagnostic: (pre as { snapshot?: EngineResult } | null) ?? null,
      report: report ?? null,
      audit: audit ?? [],
    };
  });

/** Recalcula o pré-diagnóstico a partir das respostas gravadas. */
export const computeDiagPreDiagnostic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(idInput)
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const { data: app, error } = await db
      .from("diag_applications")
      .select("id, instrument_id, status")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!app) throw new Error("Aplicação não encontrada.");

    const { data: answers } = await db
      .from("diag_application_answers")
      .select("question_code, value, is_na")
      .eq("application_id", data.id);

    const bundle = await loadBundle(db as unknown as BundleClient, {
      instrumentId: app.instrument_id ?? undefined,
    });
    const input: AnswerInput[] = (answers ?? []).map((a) => ({
      question_code: a.question_code,
      value: a.is_na ? null : (a.value ?? null),
    }));
    const result = computeDiagnostic(bundle, input);

    const { error: upErr } = await db.from("diag_pre_diagnostics").upsert(
      {
        application_id: data.id,
        engine_version: result.engineVersion,
        dimension_scores: result.dimensions as never,
        axes: result.axes as never,
        patterns: result.patterns as never,
        indicators: result.indicators as never,
        affinities: result.affinities as never,
        predominant_stage: result.predominant?.code ?? null,
        secondary_stage: result.secondary?.code ?? null,
        in_transition: result.inTransition,
        confidence: result.confidence,
        confidence_level: result.confidenceLevel,
        alerts: result.alerts as never,
        requires_validation: true,
        auto_release_blocked: result.autoReleaseBlocked,
        snapshot: result as never,
        computed_at: result.computedAt,
      },
      { onConflict: "application_id" },
    );
    if (upErr) throw new Error(upErr.message);

    if (app.status === "submitted") {
      await db.from("diag_applications").update({ status: "in_review" }).eq("id", data.id);
    }

    await db.from("diag_audit_log").insert({
      application_id: data.id,
      actor_id: context.userId,
      actor_type: "analyst",
      action: "pre_diagnostic_computed",
      details: {
        engine: result.engineVersion,
        predominant: result.predominant?.code ?? null,
        confidence: result.confidence,
      },
    });

    return { ok: true as const, result };
  });

/** Gera/atualiza o relatório premium em rascunho e registra a validação do analista. */
export const validateDiagApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        analyst_notes: z.string().trim().max(6000).optional().or(z.literal("")),
        adjusted_stage_code: z.string().trim().max(60).optional().or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const { data: pre } = await db
      .from("diag_pre_diagnostics")
      .select("snapshot")
      .eq("application_id", data.id)
      .maybeSingle();
    if (!pre) throw new Error("Calcule o pré-diagnóstico antes de validar.");

    const { data: app } = await db
      .from("diag_applications")
      .select("id, instrument_id, context, participants(full_name, role_title), organizations(name)")
      .eq("id", data.id)
      .maybeSingle();
    if (!app) throw new Error("Aplicação não encontrada.");

    const bundle = await loadBundle(db as unknown as BundleClient, {
      instrumentId: app.instrument_id ?? undefined,
    });
    const snapshot = pre.snapshot as unknown as EngineResult;
    const org = app.organizations as { name?: string } | null;
    const participant = app.participants as { full_name?: string; role_title?: string } | null;

    const content = buildReportContent({
      result: snapshot,
      bundle,
      companyName: org?.name ?? null,
      participantName: participant?.full_name ?? null,
      contextText: app.context ?? null,
      analystNotes: data.analyst_notes || null,
      adjustedStageCode: data.adjusted_stage_code || null,
    });

    const { error } = await db.from("diag_reports").upsert(
      {
        application_id: data.id,
        status: "validated",
        adjusted_stage_code: data.adjusted_stage_code || null,
        content: content as never,
        analyst_notes: data.analyst_notes || null,
        validated_at: new Date().toISOString(),
        validated_by: context.userId,
      },
      { onConflict: "application_id" },
    );
    if (error) throw new Error(error.message);

    await db
      .from("diag_applications")
      .update({
        status: "validated",
        validated_at: new Date().toISOString(),
        validated_by: context.userId,
      })
      .eq("id", data.id);

    await db.from("diag_audit_log").insert({
      application_id: data.id,
      actor_id: context.userId,
      actor_type: "analyst",
      action: "report_validated",
      details: { adjusted_stage_code: data.adjusted_stage_code || null },
    });

    return { ok: true as const, content };
  });

/**
 * Liberação do relatório. Resultados críticos, inconclusivos ou em transição
 * exigem reconhecimento explícito do analista — nunca há liberação automática.
 */
export const releaseDiagApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), acknowledge: z.boolean().optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const { data: pre } = await db
      .from("diag_pre_diagnostics")
      .select("auto_release_blocked, snapshot")
      .eq("application_id", data.id)
      .maybeSingle();
    if (!pre) throw new Error("Pré-diagnóstico ausente.");

    const { data: report } = await db
      .from("diag_reports")
      .select("status")
      .eq("application_id", data.id)
      .maybeSingle();
    if (!report || report.status === "draft")
      throw new Error("O relatório precisa ser validado pelo analista antes da liberação.");

    const snapshot = pre.snapshot as unknown as EngineResult;
    if (pre.auto_release_blocked && !data.acknowledge) {
      return {
        ok: false as const,
        blocked: true as const,
        reasons: snapshot.blockReasons ?? [],
      };
    }

    await db
      .from("diag_reports")
      .update({
        status: "released",
        released_at: new Date().toISOString(),
        released_by: context.userId,
      })
      .eq("application_id", data.id);

    await db
      .from("diag_applications")
      .update({
        status: "released",
        released_at: new Date().toISOString(),
        released_by: context.userId,
      })
      .eq("id", data.id);

    await db.from("diag_audit_log").insert({
      application_id: data.id,
      actor_id: context.userId,
      actor_type: "analyst",
      action: "report_released",
      details: {
        acknowledged_block: !!(pre.auto_release_blocked && data.acknowledge),
        reasons: snapshot.blockReasons ?? [],
      },
    });

    return { ok: true as const, blocked: false as const, reasons: [] as string[] };
  });

export const listDiagParticipants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("participants")
      .select("id, full_name, email, whatsapp, role_title, created_at, organizations(name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
