import { describe, expect, it } from "vitest";
import { computeDiagnostic } from "./engine";
import {
  V1_ENGINE_CONFIG,
  V1_PATTERNS,
  V1_STAGES,
  V3_DIMENSIONS,
  V3_INSTRUMENT,
  V3_QUESTIONS,
  V3_SCALE,
} from "./v3";
import type { AnswerInput, DiagInstrumentBundle } from "./types";

const bundle: DiagInstrumentBundle = {
  instrument: {
    id: "test",
    code: V3_INSTRUMENT.code,
    name: V3_INSTRUMENT.name,
    version: V3_INSTRUMENT.version,
    status: "active",
    description: V3_INSTRUMENT.description,
    scale: V3_SCALE,
    engine_config: V1_ENGINE_CONFIG,
  },
  dimensions: V3_DIMENSIONS,
  questions: V3_QUESTIONS,
  stages: V1_STAGES,
  patterns: V1_PATTERNS,
};

const allAt = (value: number | null): AnswerInput[] =>
  V3_QUESTIONS.map((q) => ({ question_code: q.code, value }));

describe("instrumento V3", () => {
  it("tem 70 perguntas em 10 dimensões com a distribuição definida", () => {
    expect(V3_QUESTIONS).toHaveLength(70);
    expect(V3_DIMENSIONS).toHaveLength(10);
    const counts = V3_DIMENSIONS.map((d) => V3_QUESTIONS.filter((q) => q.dimension_code === d.code).length);
    expect(counts).toEqual([8, 7, 7, 7, 7, 7, 6, 7, 7, 7]);
  });

  it("mantém L01 como questão inversa", () => {
    expect(V3_QUESTIONS.find((q) => q.code === "L01")?.direction).toBe("inverse");
  });
});

describe("motor V1", () => {
  it("inverte L01 e normaliza a escala", () => {
    const r = computeDiagnostic(bundle, [{ question_code: "L01", value: 5 }]);
    const l01 = r.questions.find((q) => q.code === "L01")!;
    expect(l01.adjusted).toBe(1);
    expect(l01.normalized).toBe(0);
  });

  it("exclui N/A do cálculo e reduz a confiança", () => {
    const r = computeDiagnostic(bundle, allAt(null));
    expect(r.answeredCount).toBe(0);
    expect(r.naRatio).toBe(1);
    expect(r.dimensions.every((d) => d.score === null && d.band === "sem_dados")).toBe(true);
    expect(r.confidenceLevel).toBe("baixa");
    expect(r.autoReleaseBlocked).toBe(true);
  });

  it("produz dimensões, eixos e ranking completo de estágios", () => {
    const r = computeDiagnostic(bundle, allAt(4));
    expect(r.totalQuestions).toBe(70);
    expect(r.answeredCount).toBe(70);
    expect(r.affinities).toHaveLength(V1_STAGES.length);
    expect(r.predominant).not.toBeNull();
    expect(r.dimensions.every((d) => d.score !== null)).toBe(true);
    for (const axis of Object.values(r.axes)) expect(axis).toBeGreaterThanOrEqual(0);
  });

  it("nunca libera automaticamente e sempre exige validação", () => {
    const good = computeDiagnostic(bundle, allAt(5));
    expect(good.requiresValidation).toBe(true);
    const weak = computeDiagnostic(bundle, allAt(1));
    expect(weak.autoReleaseBlocked).toBe(true);
    expect(weak.alerts.length).toBeGreaterThan(0);
  });

  it("marca zona de transição quando os dois primeiros estágios estão próximos", () => {
    const r = computeDiagnostic(bundle, allAt(3));
    const gap = r.affinities[0]!.total - r.affinities[1]!.total;
    expect(r.inTransition).toBe(gap <= V1_ENGINE_CONFIG.transitionGap);
  });
});
