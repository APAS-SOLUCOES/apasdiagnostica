/**
 * Instrumento APAS DISC 1.0 — versão de validação (calibrável).
 *
 * Este arquivo é o INSTRUMENTO PADRÃO. Ele pode ser substituído em tempo de
 * execução por um registro ativo na tabela `instruments` (mesmo formato JSON),
 * permitindo revisão e calibração do questionário e das fórmulas sem
 * reescrever o sistema.
 *
 * Estrutura: 24 blocos x 4 afirmações = 96 afirmações, sendo exatamente
 * 24 de D, 24 de I, 24 de S e 24 de C. Em cada bloco o participante escolhe
 * uma afirmação como MAIS e outra como MENOS.
 *
 * Conteúdo autoral APAS Soluções. Linguagem comportamental, socialmente
 * neutra, sem termos clínicos, psicológicos ou diagnósticos.
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
  adaptedMode: "average" | "social" | "net";
  /** Peso somado à dimensão escolhida como MAIS. */
  mostWeight: number;
  /** Peso somado à dimensão escolhida como MENOS (normalmente negativo). */
  leastWeight: number;
  /** Crédito base por bloco usado no Perfil Natural (mantém a escala positiva). */
  naturalBase: number;
  /** Limiares (em % de distribuição, base neutra = 25%). */
  thresholds: { high: number; moderate: number };
  /** Diferença total entre social e natural que sinaliza adaptação elevada. */
  adaptationAlert: number;
  labels: Record<ScoringProfileKey, string>;
  /** Descrição legível da regra vigente (aparece no relatório e na tela). */
  ruleDescription: string;
};

export type Instrument = {
  id: string;
  name: string;
  version: string;
  status: "draft" | "active";
  items: InstrumentItem[];
  scoring: ScoringConfig;
};

/** Metadados da versão do instrumento padrão. */
export const INSTRUMENT_META = {
  code: "APAS DISC 1.0",
  version: "1.0.0",
  releaseDate: "2026-09-03",
  status: "provisório — em validação",
  blocks: 24,
  statementsPerBlock: 4,
  totalStatements: 96,
  perDimension: 24,
  ruleDescription:
    "Em cada bloco, a afirmação escolhida como MAIS adiciona +1 à dimensão associada e a escolhida como MENOS subtrai 1 da dimensão associada. Afirmações não escolhidas não pontuam.",
  validationNotice:
    "Instrumento APAS DISC 1.0 — versão de validação. As afirmações e os pesos devem ser calibrados antes de qualquer uso comercial.",
} as const;

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
  B(
    "b01",
    "Decido rápido, mesmo com informação incompleta",
    "Falo com facilidade sobre a minha ideia para conquistar apoio",
    "Prefiro decidir depois de ouvir as pessoas envolvidas",
    "Só decido quando os dados sustentam a escolha",
  ),
  B(
    "b02",
    "Assumo a condução quando o grupo trava",
    "Ativo minha rede de contatos para destravar assuntos",
    "Mantenho o grupo unido enquanto o assunto se resolve",
    "Retomo o critério combinado para destravar o assunto",
  ),
  B(
    "b03",
    "Trabalho melhor com metas desafiadoras e prazo curto",
    "Trabalho melhor quando há troca constante com pessoas",
    "Trabalho melhor com rotina previsível e ritmo constante",
    "Trabalho melhor com processo definido e instruções claras",
  ),
  B(
    "b04",
    "Digo o que penso de forma direta",
    "Uso histórias e exemplos para explicar o que penso",
    "Escolho o momento certo antes de expor o que penso",
    "Fundamento o que digo em fatos verificáveis",
  ),
  B(
    "b05",
    "Diante de um obstáculo, avanço e testo na prática",
    "Diante de um obstáculo, converso com quem pode ajudar",
    "Diante de um obstáculo, mantenho o ritmo até superá-lo",
    "Diante de um obstáculo, analiso a causa antes de agir",
  ),
  B(
    "b06",
    "Gosto de negociar condições e prazos",
    "Gosto de apresentar propostas para grupos",
    "Gosto de acompanhar pessoas em atividades de longo prazo",
    "Gosto de revisar documentos e números em detalhe",
  ),
  B(
    "b07",
    "Prefiro autonomia para conduzir do meu modo",
    "Prefiro ambientes movimentados e com muita interação",
    "Prefiro combinados estáveis e mudanças avisadas com antecedência",
    "Prefiro regras escritas e responsabilidades bem delimitadas",
  ),
  B(
    "b08",
    "Aponto o problema mesmo quando gera desconforto",
    "Costumo aliviar a tensão com bom humor",
    "Costumo absorver a tensão para preservar o clima",
    "Registro o ocorrido e trato pelo procedimento",
  ),
  B(
    "b09",
    "Meu foco principal é entregar resultado",
    "Meu foco principal é engajar as pessoas",
    "Meu foco principal é manter a continuidade do trabalho",
    "Meu foco principal é garantir a exatidão da entrega",
  ),
  B(
    "b10",
    "Fico impaciente quando o processo demora",
    "Fico desconfortável quando trabalho isolado",
    "Fico desconfortável quando muda tudo de uma vez",
    "Fico desconfortável quando falta informação confiável",
  ),
  B(
    "b11",
    "Em um novo grupo, assumo iniciativa logo",
    "Em um novo grupo, puxo conversa e aproximo as pessoas",
    "Em um novo grupo, observo e vou entrando aos poucos",
    "Em um novo grupo, procuro entender como as coisas funcionam",
  ),
  B(
    "b12",
    "Mudo de plano rapidamente quando o cenário muda",
    "Adapto meu discurso conforme a reação das pessoas",
    "Prefiro ajustar o plano gradualmente",
    "Só mudo o plano depois de revisar os impactos",
  ),
  B(
    "b13",
    "Sou objetivo nas conversas de trabalho",
    "Sou expressivo e falo com energia",
    "Sou tranquilo e falo em tom moderado",
    "Sou reservado e escolho as palavras com cuidado",
  ),
  B(
    "b14",
    "Cobro desempenho de quem trabalha comigo",
    "Reconheço publicamente o esforço das pessoas",
    "Ofereço apoio prático a quem está sobrecarregado",
    "Aponto desvios em relação ao padrão combinado",
  ),
  B(
    "b15",
    "Assumo riscos calculados para ganhar tempo",
    "Aposto na conversa para abrir caminhos",
    "Prefiro caminhos já testados",
    "Prefiro reduzir a chance de erro, mesmo levando mais tempo",
  ),
  B(
    "b16",
    "Gosto de ter a palavra final nas decisões",
    "Gosto de decidir conversando com o grupo",
    "Gosto de decidir com consenso e sem pressa",
    "Gosto de decidir com base em critérios definidos",
  ),
  B(
    "b17",
    "Trabalho bem sob pressão de prazo",
    "Trabalho bem em atividades com muitas pessoas",
    "Trabalho bem em atividades que exigem persistência",
    "Trabalho bem em atividades que exigem precisão",
  ),
  B(
    "b18",
    "Interrompo para acelerar quando a conversa se alonga",
    "Falo mais do que ouço quando o assunto me interessa",
    "Ouço até o fim antes de me posicionar",
    "Pergunto detalhes antes de me posicionar",
  ),
  B(
    "b19",
    "Organizo o trabalho pelas prioridades do resultado",
    "Organizo o trabalho pelos contatos e conversas necessárias",
    "Organizo o trabalho em uma sequência estável",
    "Organizo o trabalho em listas, etapas e registros",
  ),
  B(
    "b20",
    "Encerro assuntos rapidamente para seguir adiante",
    "Amplio o assunto trazendo novas possibilidades",
    "Mantenho o assunto aberto até todos estarem confortáveis",
    "Fecho o assunto quando todos os pontos foram conferidos",
  ),
  B(
    "b21",
    "Insisto no meu ponto quando acredito nele",
    "Convenço pela empolgação e pelo diálogo",
    "Cedo para manter o relacionamento",
    "Argumento com dados e comparações",
  ),
  B(
    "b22",
    "Aceito bem tarefas com alta responsabilidade",
    "Aceito bem tarefas de representação e apresentação",
    "Aceito bem tarefas de acompanhamento e suporte",
    "Aceito bem tarefas de conferência e controle",
  ),
  B(
    "b23",
    "Meu ritmo de trabalho é acelerado",
    "Meu ritmo de trabalho varia conforme o entusiasmo",
    "Meu ritmo de trabalho é regular e sustentado",
    "Meu ritmo de trabalho é cuidadoso e metódico",
  ),
  B(
    "b24",
    "Avalio meu dia pelo que consegui concluir",
    "Avalio meu dia pelas conexões que criei",
    "Avalio meu dia pela tranquilidade com que fluiu",
    "Avalio meu dia pela qualidade do que produzi",
  ),
];

export const DEFAULT_SCORING: ScoringConfig = {
  version: "apas-scoring-1.0.0",
  predominantSource: "adapted",
  adaptedMode: "average",
  mostWeight: 1,
  leastWeight: -1,
  naturalBase: 1,
  thresholds: { high: 32, moderate: 20 },
  adaptationAlert: 18,
  labels: {
    natural: "Perfil Natural",
    social: "Perfil Social",
    adapted: "Perfil Adaptado",
  },
  ruleDescription: INSTRUMENT_META.ruleDescription,
};

export const DEFAULT_INSTRUMENT: Instrument = {
  id: "default",
  name: `Instrumento ${INSTRUMENT_META.code}`,
  version: INSTRUMENT_META.version,
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
