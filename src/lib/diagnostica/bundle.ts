/**
 * Carga do instrumento configurável a partir do banco (nada de regra fixa no código).
 */
import type {
  DiagDimension,
  DiagInstrumentBundle,
  DiagPattern,
  DiagQuestion,
  DiagStage,
  EngineConfig,
  ScaleOption,
} from "./types";

type Row = Record<string, unknown>;
type Result<T> = Promise<{ data: T | null; error: { message: string } | null }>;
type Query = {
  select: (cols: string) => Query;
  eq: (col: string, value: unknown) => Query;
  order: (col: string, opts?: { ascending?: boolean }) => Query;
  limit: (n: number) => Query;
  maybeSingle: () => Result<Row>;
} & Result<Row[]>;

export type BundleClient = { from: (table: string) => Query };

export const DEFAULT_INSTRUMENT_CODE = "diagnostico-empresarial";

/** Carrega instrumento ativo + dimensões, perguntas, estágios e padrões. */
export async function loadBundle(
  db: BundleClient,
  opts: { instrumentId?: string; code?: string } = {},
): Promise<DiagInstrumentBundle> {
  let q = db
    .from("diag_instruments")
    .select("id, code, name, version, status, description, scale, engine_config");
  q = opts.instrumentId
    ? q.eq("id", opts.instrumentId)
    : q.eq("code", opts.code ?? DEFAULT_INSTRUMENT_CODE).eq("status", "active");
  const { data: instrument, error } = await q
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!instrument) throw new Error("Instrumento de diagnóstico não encontrado no banco.");

  const instrumentId = instrument["id"] as string;

  const [dims, questions, stages, patterns] = await Promise.all([
    db
      .from("diag_dimensions")
      .select("id, code, name, description, sort_order, axis_weights")
      .eq("instrument_id", instrumentId)
      .order("sort_order"),
    db
      .from("diag_questions")
      .select(
        "id, code, dimension_id, text, weight, direction, allow_na, active, sort_order",
      )
      .eq("instrument_id", instrumentId)
      .order("sort_order"),
    db
      .from("diag_stage_profiles")
      .select("id, code, name, short_label, description, sort_order, axes, is_critical, auto_release_allowed, narrative")
      .eq("instrument_id", instrumentId)
      .order("sort_order"),
    db
      .from("diag_patterns")
      .select("id, code, name, kind, description, severity, rule, stage_affinity, active, sort_order")
      .eq("instrument_id", instrumentId)
      .order("sort_order"),
  ]);

  for (const r of [dims, questions, stages, patterns]) {
    if (r.error) throw new Error(r.error.message);
  }

  const dimensions = (dims.data ?? []) as unknown as (DiagDimension & { id: string })[];
  const dimById = new Map(dimensions.map((d) => [d.id, d.code]));

  return {
    instrument: {
      id: instrumentId,
      code: instrument["code"] as string,
      name: instrument["name"] as string,
      version: instrument["version"] as string,
      status: instrument["status"] as string,
      description: (instrument["description"] as string | null) ?? null,
      scale: instrument["scale"] as unknown as ScaleOption[],
      engine_config: instrument["engine_config"] as unknown as EngineConfig,
    },
    dimensions,
    questions: (questions.data ?? []).map((row) => ({
      id: row["id"] as string,
      code: row["code"] as string,
      dimension_code: dimById.get(row["dimension_id"] as string) ?? "",
      text: row["text"] as string,
      weight: row["weight"] as DiagQuestion["weight"],
      direction: row["direction"] as DiagQuestion["direction"],
      allow_na: row["allow_na"] as boolean,
      active: row["active"] as boolean,
      sort_order: row["sort_order"] as number,
    })),
    stages: (stages.data ?? []) as unknown as DiagStage[],
    patterns: (patterns.data ?? []) as unknown as DiagPattern[],
  };
}
