import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  DEFAULT_INSTRUMENT,
  type Instrument,
  type ScoringConfig,
  type Dimension,
} from "./disc/instrument";
import { computeScores, type Answer, type ScoreResult } from "./disc/scoring";
import { validateAssessmentAnswers } from "./disc/answer-validation";

const tokenSchema = z.object({ token: z.string().trim().min(10).max(80) });

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const dimensionSchema = z.enum(["D", "I", "S", "C"]);

const scoringConfigSchema = z.object({
  version: z.string().min(1),
  predominantSource: z.enum(["natural", "social", "adapted"]),
  adaptedMode: z.enum(["average", "social", "net"]),
  mostWeight: z.number().finite(),
  leastWeight: z.number().finite(),
  naturalBase: z.number().finite(),
  thresholds: z.object({
    high: z.number().finite(),
    moderate: z.number().finite(),
  }),
  adaptationAlert: z.number().finite(),
  primaryMostWeight: z.number().finite().optional(),
  primaryAcceptanceWeight: z.number().finite().optional(),
  proximityThreshold: z.number().finite().optional(),
  labels: z.record(z.enum(["natural", "social", "adapted"]), z.string()),
  ruleDescription: z.string().min(1),
});

const instrumentItemSchema = z.object({
  id: z.string().min(1).max(60),
  options: z.array(
    z.object({
      key: z.string().min(1),
      label: z.string().min(1),
      dimension: dimensionSchema,
    }),
  ).length(4).refine(
    (options) => new Set(options.map((option) => option.dimension)).size === 4,
    "Cada bloco deve conter exatamente um item de cada fator DISC.",
  ),
});

const instrumentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  status: z.enum(["active", "draft"]),
  items: z.array(instrumentItemSchema).min(1).refine(
    (items) => new Set(items.map((item) => item.id)).size === items.length,
    "Os IDs dos blocos do instrumento devem ser únicos.",
  ),
  scoring: scoringConfigSchema,
});

const instrumentPayloadSchema = instrumentSchema;

function mergeScoringConfig(
  base: ScoringConfig,
  override: unknown,
): ScoringConfig {
  const parsed = scoringConfigSchema.parse({
    ...base,
    ...(override && typeof override === "object" ? override : {}),
    thresholds: {
      ...base.thresholds,
      ...((override && typeof override === "object" &&
        "thresholds" in override &&
        override.thresholds &&
        typeof override.thresholds === "object")
        ? override.thresholds
        : {}),
    },
    labels: {
      ...base.labels,
      ...((override && typeof override === "object" &&
        "labels" in override &&
        override.labels &&
        typeof override.labels === "object")
        ? override.labels
        : {}),
    },
  });
  return parsed;
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

  if (!data) {
    throw new Error("O instrumento desta avaliação não está disponível. A avaliação não pode ser recalculada com outro instrumento.");
  }

  const parsed = instrumentPayloadSchema.parse({
    id: data.id,
    name: data.name,
    version: data.version,
    status: data.status === "active" ? "active" : "draft",
    items: data.items,
    scoring: mergeScoringConfig(DEFAULT_INSTRUMENT.scoring, data.scoring),
  });

  return parsed as Instrument;
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
    const answers = data.answers as Answer[];
    const validation = validateAssessmentAnswers(answers, instrument);
    if (!validation.ok) throw new Error(validation.message);

    const result = computeScores(answers, instrument);

    if (result.invalidAnswerCount > 0 || result.answeredItems !== instrument.items.length) {
      throw new Error("Não foi possível validar integralmente as respostas da avaliação.");
    }

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

export type { Dimension };
