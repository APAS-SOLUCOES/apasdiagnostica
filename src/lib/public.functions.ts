import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  DEFAULT_INSTRUMENT,
  type Instrument,
  type InstrumentItem,
  type ScoringConfig,
  type Dimension,
} from "./disc/instrument";
import { computeScores, type Answer, type ScoreResult } from "./disc/scoring";

const tokenSchema = z.object({ token: z.string().trim().min(10).max(80) });

type AdminClient = Awaited<
  ReturnType<typeof import("@/integrations/supabase/client.server")["supabaseAdmin"]["from"]>
>;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function resolveInstrument(
  db: Awaited<ReturnType<typeof admin>>,
  instrumentId: string | null,
): Promise<Instrument> {
  if (!instrumentId) return DEFAULT_INSTRUMENT;
  const { data } = await db
    .from("instruments")
    .select("id, name, version, status, items, scoring")
    .eq("id", instrumentId)
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
}

/** Dados mínimos para abrir o questionário público (o token é o segredo). */
export const getPublicAssessment = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row } = await db
      .from("assessments")
      .select(
        "id, candidate_name, context, status, consent_accepted_at, submitted_at, instrument_id",
      )
      .eq("token", data.token)
      .maybeSingle();
    if (!row) return { found: false as const };

    const instrument = await resolveInstrument(db, row.instrument_id);
    return {
      found: true as const,
      assessment: {
        candidate_name: row.candidate_name,
        context: row.context,
        status: row.status,
        consent_accepted_at: row.consent_accepted_at,
        submitted_at: row.submitted_at,
      },
      instrument: {
        name: instrument.name,
        version: instrument.version,
        items: instrument.items,
      },
    };
  });

export const acceptConsent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db
      .from("assessments")
      .update({
        consent_accepted_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
        status: "in_progress",
      })
      .eq("token", data.token)
      .neq("status", "completed");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const answerSchema = z.object({
  itemId: z.string().min(1).max(60),
  most: z.enum(["D", "I", "S", "C"]),
  least: z.enum(["D", "I", "S", "C"]),
});

export const submitAssessment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: z.string().trim().min(10).max(80),
        answers: z.array(answerSchema).min(1).max(200),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row } = await db
      .from("assessments")
      .select("id, status, instrument_id, consent_accepted_at")
      .eq("token", data.token)
      .maybeSingle();
    if (!row) throw new Error("Link inválido.");
    if (row.status === "completed") return { ok: true as const, already: true as const };
    if (!row.consent_accepted_at) throw new Error("Consentimento não registrado.");

    const instrument = await resolveInstrument(db, row.instrument_id);
    const answers = data.answers.filter((a) => a.most !== a.least) as Answer[];
    const result = computeScores(answers, instrument);

    await db
      .from("assessment_responses")
      .upsert(
        { assessment_id: row.id, answers: answers as never, meta: {} as never },
        { onConflict: "assessment_id" },
      );

    await db.from("assessment_results").upsert(
      {
        assessment_id: row.id,
        scores: result as never,
        predominant: result.predominant,
        combination: result.combination,
        scoring_version: result.scoringVersion,
        computed_at: new Date().toISOString(),
      },
      { onConflict: "assessment_id" },
    );

    await db
      .from("assessments")
      .update({ status: "completed", submitted_at: new Date().toISOString() })
      .eq("id", row.id);

    return { ok: true as const, already: false as const };
  });

export type PublicReport = {
  found: boolean;
  candidate_name?: string;
  context?: string | null;
  submitted_at?: string | null;
  instrumentVersion?: string | null;
  result?: ScoreResult;
};

export const getPublicReport = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }): Promise<PublicReport> => {
    const db = await admin();
    const { data: row } = await db
      .from("assessments")
      .select("id, candidate_name, context, submitted_at, instrument_version, status")
      .eq("token", data.token)
      .maybeSingle();
    if (!row || row.status !== "completed") return { found: false };

    const { data: res } = await db
      .from("assessment_results")
      .select("scores")
      .eq("assessment_id", row.id)
      .maybeSingle();
    if (!res) return { found: false };

    return {
      found: true,
      candidate_name: row.candidate_name,
      context: row.context,
      submitted_at: row.submitted_at,
      instrumentVersion: row.instrument_version,
      result: res.scores as unknown as ScoreResult,
    };
  });

export type { Dimension, AdminClient };
