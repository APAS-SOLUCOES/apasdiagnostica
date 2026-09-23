/**
 * Tipos compartilhados do módulo Diagnóstico Empresarial APAS.
 * Tudo que o motor consome vem de configuração (banco) — nada de regra fixa no código.
 */

export const AXES = ["flexibilidade", "controle", "integracao", "sustentacao"] as const;
export type Axis = (typeof AXES)[number];

export const AXIS_NAMES: Record<Axis, string> = {
  flexibilidade: "Flexibilidade",
  controle: "Controle",
  integracao: "Integração",
  sustentacao: "Sustentação",
};

export type AxisMap = Record<Axis, number>;

export type ScaleOption = {
  value: number | null; // null = N/A
  label: string;
  short: string;
};

export type DiagDimension = {
  id?: string;
  code: string;
  name: string;
  description?: string | null;
  sort_order: number;
  /** Peso desta dimensão em cada eixo (0 = não contribui). Parâmetro V1 calibrável. */
  axis_weights: Partial<AxisMap>;
};

export type DiagQuestion = {
  id?: string;
  code: string;
  dimension_code: string;
  text: string;
  weight: 1 | 2 | 3;
  direction: "direct" | "inverse";
  allow_na: boolean;
  active: boolean;
  sort_order: number;
};

export type StageNarrative = {
  summary: string;
  signals: string[];
  risks: string[];
  focus: string[];
};

export type DiagStage = {
  id?: string;
  code: string;
  name: string;
  short_label?: string | null;
  description?: string | null;
  sort_order: number;
  axes: AxisMap;
  is_critical: boolean;
  auto_release_allowed: boolean;
  narrative: StageNarrative;
};

/**
 * Regra configurável de padrão/indicador.
 * Cada condição compara um valor normalizado 0–100 (dimensão, eixo ou pergunta) com um limiar.
 * A ativação é fuzzy (0..1) com base na margem configurada, para convergência gradual.
 */
export type RuleCondition = {
  type: "dimension" | "question" | "axis";
  code: string;
  op: "<" | "<=" | ">" | ">=";
  value: number;
  /** Largura da zona de transição (padrão: engine.ruleMargin). */
  margin?: number;
};

export type PatternRule = {
  all?: RuleCondition[];
  any?: RuleCondition[];
  /** Ativação mínima para o padrão ser listado como presente (padrão 0.5). */
  minActivation?: number;
};

export type DiagPattern = {
  id?: string;
  code: string;
  name: string;
  kind: "pattern" | "critical";
  description?: string | null;
  severity: "baixa" | "media" | "alta" | "critica";
  rule: PatternRule;
  /** Afinidade com estágios: -1 (contradiz) a +1 (sustenta). */
  stage_affinity: Record<string, number>;
  active: boolean;
  sort_order: number;
};

export type EngineConfig = {
  version: string;
  status: "heuristica_v1_calibravel";
  /** Pesos da afinidade final: eixos + padrões + indicadores críticos = 1. */
  affinityWeights: { axes: number; patterns: number; critical: number };
  /** Peso relativo de cada eixo na distância eixo↔estágio. */
  axisDistanceWeights: AxisMap;
  /** Largura padrão da zona de transição das regras (pontos 0–100). */
  ruleMargin: number;
  /** Diferença máxima entre 1º e 2º estágio para considerar zona de transição. */
  transitionGap: number;
  confidence: {
    /** Separação (pontos) entre 1º e 2º que garante 100% da parcela de separação. */
    separationFull: number;
    /** Percentual de N/A a partir do qual começa a penalidade. */
    naPenaltyStart: number;
    /** Percentual de N/A em que a penalidade é máxima. */
    naPenaltyMax: number;
    /** Penalidade máxima (pontos) por excesso de N/A. */
    naPenaltyPoints: number;
    /** Penalidade (pontos) por padrão ativo que contradiz o estágio predominante. */
    contradictionPenalty: number;
    /** Penalidade máxima (pontos) por dimensões com baixa cobertura. */
    lowCoveragePenalty: number;
    /** Cobertura mínima de respostas válidas por dimensão (0–1). */
    minDimensionCoverage: number;
    levels: { alta: number; media: number };
  };
  /** Faixas de leitura das dimensões (0–100). */
  dimensionBands: { critico: number; atencao: number; adequado: number };
  /** Ativação mínima de um indicador crítico para gerar alerta. */
  criticalAlertActivation: number;
};

export type DiagInstrumentBundle = {
  instrument: {
    id: string;
    code: string;
    name: string;
    version: string;
    status: string;
    description: string | null;
    scale: ScaleOption[];
    engine_config: EngineConfig;
  };
  dimensions: DiagDimension[];
  questions: DiagQuestion[];
  stages: DiagStage[];
  patterns: DiagPattern[];
};

export type AnswerInput = {
  question_code: string;
  value: number | null; // null = N/A
};

export type DimensionScore = {
  code: string;
  name: string;
  score: number | null; // 0–100 (null quando não há respostas válidas)
  band: "critico" | "atencao" | "adequado" | "forte" | "sem_dados";
  answered: number;
  na: number;
  total: number;
  coverage: number; // 0–1
  weightSum: number;
};

export type QuestionScore = {
  code: string;
  dimension_code: string;
  value: number | null;
  adjusted: number | null; // após inversão
  normalized: number | null; // 0–100
  weight: number;
  direction: "direct" | "inverse";
};

export type PatternResult = {
  code: string;
  name: string;
  kind: "pattern" | "critical";
  severity: DiagPattern["severity"];
  description: string | null;
  activation: number; // 0..1
  present: boolean;
  stage_affinity: Record<string, number>;
};

export type StageAffinity = {
  code: string;
  name: string;
  short_label: string | null;
  is_critical: boolean;
  axisAffinity: number;
  patternAffinity: number;
  criticalAffinity: number;
  total: number;
};

export type Alert = {
  level: "info" | "atencao" | "critico";
  code: string;
  message: string;
};

export type EngineResult = {
  engineVersion: string;
  instrumentVersion: string;
  computedAt: string;
  questions: QuestionScore[];
  dimensions: DimensionScore[];
  axes: AxisMap;
  patterns: PatternResult[];
  indicators: PatternResult[];
  affinities: StageAffinity[];
  predominant: StageAffinity | null;
  secondary: StageAffinity | null;
  inTransition: boolean;
  transitionLabel: string | null;
  confidence: number;
  confidenceLevel: "alta" | "media" | "baixa";
  confidenceFactors: { separation: number; naRatio: number; contradictions: number; lowCoverage: number };
  naRatio: number;
  answeredCount: number;
  totalQuestions: number;
  alerts: Alert[];
  requiresValidation: true;
  autoReleaseBlocked: boolean;
  blockReasons: string[];
};
