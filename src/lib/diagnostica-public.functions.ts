/**
 * Fluxo público do participante — Diagnóstico Empresarial APAS.
 * O token é o único segredo: nenhuma função aqui expõe relatório, pré-diagnóstico
 * ou dados de outras aplicações. O participante nunca acessa resultados.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { loadBundle, type BundleClient } from "./diagnostica/bundle";
import { computeDiagnostic } from "./diagnostica/engine";
import type { AnswerInput } from "./diagnostica/types";

const tokenSchema = z.object({ token: z.string().trim().min(20).max(120) });

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

type AppRow = {
  id: string;
  status: string;
  context: string | null;
  instrument_id: string;
  consent_accepted_at: string | null;
  submitted_at: string | null;
  participants: { full_name: string; role_title: string | null } | null;
  organizations: { name: string } | null;
};

async function findApplication(db: Awaited<ReturnType<typeof admin>>, token: string) {
  const { data } = await db
    .from("diag_applications")
    .select(
      "id, status, context, instrument_id, consent_accepted_at, submitted_at, participants(full_name, role_title), organizations(name)",
    )
    .eq("token", token)
    .maybeSingle();
  return (data as unknown as AppRow | null) ?? null;
}

/** Dados mínimos para abrir o questionário público. */
export const getPublicDiagApplication = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const app = await findApplication(db, data.token);
    if (!app) return { found: false as const };
    if (app.status === "cancelled") return { found: true as const, state: "cancelled" as const };

    const done = ["submitted", "in_review", "validated", "released"].includes(app.status);
    if (done) return { found: true as const, state: "completed" as const };

    const bundle = await loadBundle(db as unknown as BundleClient, {
      instrumentId: app.instrument_id,
    });

    const { data: saved } = await db
      .from("diag_application_answers")
      .select("question_code, value, is_na")
      .eq("application_id", app.id);

    return {
      found: true as const,
      state: "open" as const,
      participantName: app.participants?.full_name ?? null,
      companyName: app.organizations?.name ?? null,
      context: app.context,
      consentAcceptedAt: app.consent_accepted_at,
      instrument: {
        name: bundle.instrument.name,
        version: bundle.instrument.version,
        scale: bundle.instrument.scale,
      },
      dimensions: bundle.dimensions.map((d) => ({
        code: d.code,
        name: d.name,
        sort_order: d.sort_order,
      })),
      questions: bundle.questions
        .filter((q) => q.active)
        .map((q) => ({
          code: q.code,
          text: q.text,
          dimension_code: q.dimension_code,
          allow_na: q.allow_na,
        })),
      answers: (saved ?? []).map((a) => ({
        question_code: a.question_code,
        value: a.is_na ? null : (a.value ?? null),
        is_na: a.is_na,
      })),
    };
  });

export const acceptDiagConsent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const app = await findApplication(db, data.token);
    if (!app) throw new Error("Link inválido.");
    if (app.status === "cancelled") throw new Error("Esta aplicação foi cancelada.");

    const now = new Date().toISOString();
    await db
      .from("diag_applications")
      .update({
        consent_accepted_at: app.consent_accepted_at ?? now,
        started_at: now,
        status: app.status === "pending" ? "in_progress" : app.status,
      })
      .eq("id", app.id);

    await db.from("diag_audit_log").insert({
      application_id: app.id,
      actor_type: "participant",
      action: "consent_accepted",
      details: {},
    });

    return { ok: true as const };
  });

const answersSchema = z.object({
  token: z.string().trim().min(20).max(120),
  answers: z
    .array(
      z.object({
        question_code: z.string().trim().min(2).max(20),
        value: z.number().int().min(1).max(5).nullable(),
        is_na: z.boolean(),
      }),
    )
    .max(200),
});

/** Autosave incremental das respostas (idempotente por pergunta). */
export const saveDiagAnswers = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => answersSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const app = await findApplication(db, data.token);
    if (!app) throw new Error("Link inválido.");
    if (!app.consent_accepted_at) throw new Error("Consentimento não registrado.");
    if (app.status !== "pending" && app.status !== "in_progress")
      throw new Error("Esta aplicação já foi enviada.");

    const bundle = await loadBundle(db as unknown as BundleClient, {
      instrumentId: app.instrument_id,
    });
    const byCode = new Map(bundle.questions.map((q) => [q.code, q]));

    const rows = data.answers
      .filter((a) => byCode.has(a.question_code))
      .map((a) => ({
        application_id: app.id,
        question_id: byCode.get(a.question_code)!.id as string,
        question_code: a.question_code,
        value: a.is_na ? null : a.value,
        is_na: a.is_na,
        answered_at: new Date().toISOString(),
      }));

    if (rows.length) {
      const { error } = await db
        .from("diag_application_answers")
        .upsert(rows, { onConflict: "application_id,question_id" });
      if (error) throw new Error(error.message);
    }

    return { ok: true as const, saved: rows.length };
  });

/**
 * Envio final: valida cobertura completa, grava respostas, muda status e
 * calcula o pré-diagnóstico. O participante não recebe nenhum resultado.
 */
export const submitDiagApplication = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => answersSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const app = await findApplication(db, data.token);
    if (!app) throw new Error("Link inválido.");
    if (app.status === "cancelled") throw new Error("Esta aplicação foi cancelada.");
    if (app.status !== "pending" && app.status !== "in_progress")
      return { ok: true as const, already: true as const };
    if (!app.consent_accepted_at) throw new Error("Consentimento não registrado.");

    const bundle = await loadBundle(db as unknown as BundleClient, {
      instrumentId: app.instrument_id,
    });
    const active = bundle.questions.filter((q) => q.active);
    const byCode = new Map(active.map((q) => [q.code, q]));

    const rows = data.answers
      .filter((a) => byCode.has(a.question_code))
      .map((a) => ({
        application_id: app.id,
        question_id: byCode.get(a.question_code)!.id as string,
        question_code: a.question_code,
        value: a.is_na ? null : a.value,
        is_na: a.is_na,
        answered_at: new Date().toISOString(),
      }));

    if (rows.length < active.length)
      throw new Error("Responda todas as questões antes de enviar.");

    const { error: upErr } = await db
      .from("diag_application_answers")
      .upsert(rows, { onConflict: "application_id,question_id" });
    if (upErr) throw new Error(upErr.message);

    const now = new Date().toISOString();
    await db
      .from("diag_applications")
      .update({ status: "submitted", submitted_at: now })
      .eq("id", app.id);

    const input: AnswerInput[] = rows.map((r) => ({
      question_code: r.question_code,
      value: r.is_na ? null : (r.value ?? null),
    }));
    const result = computeDiagnostic(bundle, input);

    await db.from("diag_pre_diagnostics").upsert(
      {
        application_id: app.id,
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

    await db.from("diag_applications").update({ status: "in_review" }).eq("id", app.id);

    await db.from("diag_audit_log").insert({
      application_id: app.id,
      actor_type: "participant",
      action: "application_submitted",
      details: { answers: rows.length },
    });

    return { ok: true as const, already: false as const };
  });
