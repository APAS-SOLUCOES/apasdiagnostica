/**
 * Instrumento APAS DISC — versão base (calibrável).
 *
 * Este arquivo é o INSTRUMENTO PADRÃO. Ele pode ser substituído em tempo de
 * execução por um registro ativo na tabela `instruments` (mesmo formato JSON),
 * permitindo revisão e calibração do questionário e das fórmulas sem
 * reescrever o sistema.
 */

export type Dimension = "D" | "I" | "S" | "C";

export type InstrumentItem = {
  id: string;
  /** 4 opções, uma por dimensão (ordem embaralhada propositalmente). */
  options: { key: string; label: string; dimension: Dimension }[];
};

export type ScoringProfileKey = "natural" | "social" | "adapted";

export type ScoringConfig = {
  version: string;
  /** Perfil usado para definir o estilo predominante. */
  predominantSource: ScoringProfileKey;
  /** Como o perfil adaptado é derivado dos outros dois. */
  adaptedMode: "average" | "social";
  /** Limiares (em % de distribuição, base neutra = 25%). */
  thresholds: { high: number; moderate: number };
  /** Diferença total entre social e natural que sinaliza adaptação elevada. */
  adaptationAlert: number;
  labels: Record<ScoringProfileKey, string>;
};

export type Instrument = {
  id: string;
  name: string;
  version: string;
  status: "draft" | "active";
  items: InstrumentItem[];
  scoring: ScoringConfig;
};

const B = (
  id: string,
  d: string,
  i: string,
  s: string,
  c: string,
): InstrumentItem => ({
  id,
  options: [
    { key: `${id}-d`, label: d, dimension: "D" },
    { key: `${id}-i`, label: i, dimension: "I" },
    { key: `${id}-s`, label: s, dimension: "S" },
    { key: `${id}-c`, label: c, dimension: "C" },
  ],
});

export const DEFAULT_ITEMS: InstrumentItem[] = [
  B("b01", "Decidido", "Entusiasmado", "Paciente", "Analítico"),
  B("b02", "Direto ao ponto", "Comunicativo", "Estável", "Detalhista"),
  B("b03", "Competitivo", "Otimista", "Colaborativo", "Criterioso"),
  B("b04", "Assume riscos", "Inspira pessoas", "Mantém a rotina", "Confere dados"),
  B("b05", "Objetivo", "Expressivo", "Acolhedor", "Organizado"),
  B("b06", "Determinado", "Sociável", "Leal", "Preciso"),
  B("b07", "Gosta de desafios", "Gosta de plateia", "Gosta de harmonia", "Gosta de regras claras"),
  B("b08", "Impaciente com lentidão", "Fala mais que ouve", "Evita conflitos", "Questiona detalhes"),
  B("b09", "Focado em resultado", "Focado em pessoas", "Focado em continuidade", "Focado em qualidade"),
  B("b10", "Assertivo", "Persuasivo", "Prestativo", "Metódico"),
  B("b11", "Toma a frente", "Anima o grupo", "Apoia o grupo", "Estrutura o grupo"),
  B("b12", "Rápido para agir", "Rápido para engajar", "Firme no compromisso", "Rigoroso no processo"),
  B("b13", "Direto", "Caloroso", "Sereno", "Reservado"),
  B("b14", "Exige desempenho", "Reconhece esforço", "Cuida do clima", "Cobra padrão técnico"),
  B("b15", "Prefere autonomia", "Prefere interação", "Prefere previsibilidade", "Prefere clareza de critérios"),
  B("b16", "Corre atrás da meta", "Cria conexões", "Sustenta o time", "Reduz erros"),
  B("b17", "Confrontador", "Espontâneo", "Conciliador", "Cauteloso"),
  B("b18", "Gosta de comandar", "Gosta de influenciar", "Gosta de cooperar", "Gosta de conferir"),
  B("b19", "Foco no agora", "Foco no entusiasmo", "Foco no longo prazo", "Foco na exatidão"),
  B("b20", "Corajoso", "Expansivo", "Constante", "Disciplinado"),
  B("b21", "Pressiona por decisão", "Convence pelo diálogo", "Aguarda o momento certo", "Pede mais informações"),
  B("b22", "Enfrenta problemas", "Contorna com jeitinho", "Absorve tensões", "Documenta e analisa"),
  B("b23", "Assume o controle", "Assume o microfone", "Assume o suporte", "Assume o controle de qualidade"),
  B("b24", "Ritmo acelerado", "Ritmo animado", "Ritmo constante", "Ritmo cuidadoso"),
];

export const DEFAULT_SCORING: ScoringConfig = {
  version: "apas-scoring-1.0.0",
  predominantSource: "adapted",
  adaptedMode: "average",
  thresholds: { high: 32, moderate: 20 },
  adaptationAlert: 18,
  labels: {
    natural: "Perfil Natural",
    social: "Perfil Social",
    adapted: "Perfil Adaptado",
  },
};

export const DEFAULT_INSTRUMENT: Instrument = {
  id: "default",
  name: "Instrumento APAS DISC — Base",
  version: "1.0.0-beta",
  status: "active",
  items: DEFAULT_ITEMS,
  scoring: DEFAULT_SCORING,
};

export const DIMENSIONS: Dimension[] = ["D", "I", "S", "C"];

export const DIMENSION_NAMES: Record<Dimension, string> = {
  D: "Dominância",
  I: "Influência",
  S: "Estabilidade",
  C: "Conformidade",
};
