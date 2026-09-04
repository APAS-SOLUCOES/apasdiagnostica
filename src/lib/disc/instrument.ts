/**
 * Instrumento APAS DISC 1.1 — versão de validação (calibrável).
 *
 * Este arquivo é o INSTRUMENTO PADRÃO. Ele pode ser substituído em tempo de
 * execução por um registro ativo na tabela `instruments` (mesmo formato JSON),
 * permitindo revisão e calibração do questionário e das fórmulas sem
 * reescrever o sistema. Avaliações já concluídas permanecem vinculadas à
 * versão utilizada no momento da resposta.
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
  code: "APAS DISC 1.1",
  version: "1.1.0",
  releaseDate: "2026-09-03",
  status: "provisório — em validação",
  blocks: 24,
  statementsPerBlock: 4,
  totalStatements: 96,
  perDimension: 24,
  ruleDescription:
    "Em cada bloco, a afirmação escolhida como MAIS adiciona +1 à dimensão associada e a escolhida como MENOS subtrai 1 da dimensão associada. Afirmações não escolhidas não pontuam.",
  validationNotice:
    "Instrumento APAS DISC 1.1 — versão de validação. As afirmações e os pesos devem ser calibrados antes de qualquer uso comercial.",
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
    "Costumo definir o rumo quando o assunto ainda está em aberto",
    "Comento minhas ideias em voz alta até elas ganharem forma",
    "Prefiro escutar como cada um vê a situação antes de me posicionar",
    "Reúno os números antes de fechar uma posição",
  ),
  B(
    "b02",
    "Quando uma conversa se alonga, tendo a propor um encaminhamento",
    "Procuro alguém da minha rede que possa abrir uma porta",
    "Mantenho o grupo confortável enquanto o assunto amadurece",
    "Retomo o que ficou combinado para orientar o próximo passo",
  ),
  B(
    "b03",
    "Rendo mais quando o desafio tem começo e fim bem marcados",
    "Rendo mais quando o dia tem bastante troca com outras pessoas",
    "Rendo mais quando os dias seguem um ritmo parecido",
    "Rendo mais quando sei exatamente como a etapa deve ser feita",
  ),
  B(
    "b04",
    "Digo o que penso em poucas palavras",
    "Explico minhas ideias com exemplos e situações vividas",
    "Escolho o momento antes de trazer um assunto delicado",
    "Apoio o que digo em algo que possa ser conferido depois",
  ),
  B(
    "b05",
    "Diante de um imprevisto, tendo a experimentar uma saída",
    "Diante de um imprevisto, chamo alguém para pensar junto",
    "Diante de um imprevisto, sigo firme no que já estava em curso",
    "Diante de um imprevisto, procuro entender de onde ele veio",
  ),
  B(
    "b06",
    "Gosto de conduzir conversas em que há algo a combinar",
    "Gosto de apresentar uma ideia para um grupo",
    "Gosto de acompanhar alguém ao longo de um trabalho comprido",
    "Gosto de conferir documentos linha por linha",
  ),
  B(
    "b07",
    "Prefiro espaço para conduzir do meu jeito",
    "Prefiro ambientes com movimento e gente por perto",
    "Prefiro saber com antecedência o que vai mudar",
    "Prefiro que as responsabilidades estejam escritas",
  ),
  B(
    "b08",
    "Coloco o incômodo na mesa quando percebo que ele trava o trabalho",
    "Costumo quebrar o clima pesado com leveza",
    "Costumo segurar o desconforto para preservar a relação",
    "Registro o que aconteceu e sigo o caminho previsto",
  ),
  B(
    "b09",
    "Olho primeiro para o que precisa estar de pé no fim do dia",
    "Olho primeiro para o ânimo das pessoas envolvidas",
    "Olho primeiro para o que não pode ser interrompido",
    "Olho primeiro para o que pode sair diferente do esperado",
  ),
  B(
    "b10",
    "Fico inquieto quando um assunto se arrasta",
    "Fico desconfortável quando passo o dia sem falar com ninguém",
    "Fico desconfortável quando muita coisa muda ao mesmo tempo",
    "Fico desconfortável quando as informações não se sustentam",
  ),
  B(
    "b11",
    "Em um grupo novo, tomo a frente cedo",
    "Em um grupo novo, puxo conversa com facilidade",
    "Em um grupo novo, observo um pouco antes de me abrir",
    "Em um grupo novo, procuro entender como as coisas funcionam ali",
  ),
  B(
    "b12",
    "Troco o plano com naturalidade quando o cenário vira",
    "Ajusto meu jeito de falar conforme percebo a reação",
    "Prefiro mudar aos poucos, um passo por vez",
    "Reviso o que a mudança afeta antes de aceitá-la",
  ),
  B(
    "b13",
    "Nas conversas de trabalho vou direto ao ponto",
    "Falo com bastante expressão e movimento",
    "Falo em tom baixo e sem apressar",
    "Escolho as palavras com cuidado e falo o necessário",
  ),
  B(
    "b14",
    "Peço mais de quem trabalha comigo quando vejo espaço para isso",
    "Comento na frente dos outros o que alguém fez bem",
    "Ofereço ajuda prática a quem está com muita coisa",
    "Aponto quando algo saiu do que havia sido combinado",
  ),
  B(
    "b15",
    "Aceito arriscar um pouco para ganhar tempo",
    "Aposto na conversa para abrir caminho",
    "Prefiro seguir por onde já passei",
    "Prefiro levar mais tempo e reduzir a chance de erro",
  ),
  B(
    "b16",
    "Gosto de dar a palavra final",
    "Gosto de decidir conversando com as pessoas",
    "Gosto que a decisão amadureça sem pressa",
    "Gosto de decidir a partir de critérios já definidos",
  ),
  B(
    "b17",
    "Rendo bem quando o prazo está curto",
    "Rendo bem em atividades com muita gente envolvida",
    "Rendo bem em atividades que pedem constância",
    "Rendo bem em atividades que pedem atenção ao detalhe",
  ),
  B(
    "b18",
    "Costumo interromper para encurtar a conversa",
    "Falo mais do que escuto quando o tema me interessa",
    "Escuto até o fim antes de dizer o que penso",
    "Faço perguntas de detalhe antes de me posicionar",
  ),
  B(
    "b19",
    "Organizo o dia pelo que é mais urgente resolver",
    "Organizo o dia pelas conversas que preciso ter",
    "Organizo o dia em uma sequência que já funciona",
    "Organizo o dia em etapas e anotações",
  ),
  B(
    "b20",
    "Encerro assuntos logo para seguir adiante",
    "Amplio o assunto trazendo novas possibilidades",
    "Deixo o assunto aberto até todos ficarem à vontade",
    "Fecho o assunto depois de conferir cada ponto",
  ),
  B(
    "b21",
    "Sustento meu ponto quando acredito nele",
    "Convenço pelo entusiasmo e pela conversa",
    "Cedo com facilidade para manter a boa relação",
    "Argumento com comparações e evidências",
  ),
  B(
    "b22",
    "Assumo bem tarefas de responsabilidade elevada",
    "Assumo bem tarefas de representar e apresentar",
    "Assumo bem tarefas de acompanhar e dar suporte",
    "Assumo bem tarefas de conferir e organizar",
  ),
  B(
    "b23",
    "Meu ritmo costuma ser acelerado",
    "Meu ritmo varia conforme o entusiasmo do momento",
    "Meu ritmo se mantém parecido ao longo do dia",
    "Meu ritmo é atento e cuidadoso",
  ),
  B(
    "b24",
    "Avalio meu dia pelo que consegui concluir",
    "Avalio meu dia pelas conversas que tive",
    "Avalio meu dia pela tranquilidade com que ele fluiu",
    "Avalio meu dia pelo cuidado com que fiz as coisas",
  ),
];

export const DEFAULT_SCORING: ScoringConfig = {
  version: "apas-scoring-1.1.0",
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

/**
 * Ordem embaralhada e estável por bloco (mesma ordem em todas as etapas e
 * recarregamentos), usada apenas na apresentação pública. A associação
 * interna de dimensão é preservada.
 */
export function shuffledOptions(item: InstrumentItem, seed = 0) {
  let h = seed + 2166136261;
  for (const ch of item.id) h = (h ^ ch.charCodeAt(0)) * 16777619;
  const list: InstrumentItem["options"] = [...item.options];
  for (let i = list.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    const j = h % (i + 1);
    const a = list[i]!;
    const b = list[j]!;
    list[i] = b;
    list[j] = a;
  }
  return list;
}
