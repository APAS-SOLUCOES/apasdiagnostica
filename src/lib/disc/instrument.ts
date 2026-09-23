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
  /** Peso da escolha afirmativa na síntese forced-choice (scoring 1.2+). */
  primaryMostWeight?: number;
  /** Peso da não rejeição na síntese forced-choice (scoring 1.2+). */
  primaryAcceptanceWeight?: number;
  /** Distância percentual máxima para sinalizar fatores próximos. */
  proximityThreshold?: number;
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
  code: "APAS DISC 1.2",
  version: "1.2.0",
  releaseDate: "2026-09-14",
  status: "provisório — em validação",
  blocks: 24,
  statementsPerBlock: 4,
  totalStatements: 96,
  perDimension: 24,
  ruleDescription:
    "Em cada bloco, as escolhas MAIS e MENOS formam evidências complementares. A síntese prioriza a escolha afirmativa e considera a rejeição, sem depender de uma média isolada entre perfis.",
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

export const LEGACY_ITEMS_1_1: InstrumentItem[] = [
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

/**
 * APAS DISC 1.2 — revisão de clareza para aplicação forced-choice.
 * Cada bloco mantém uma alternativa por fator, com extensão e desejabilidade
 * semelhantes. Os textos descrevem preferências observáveis, sem juízo de valor.
 */
export const DEFAULT_ITEMS: InstrumentItem[] = [
  B("b01", "Defino a direção para o trabalho avançar", "Envolvo as pessoas para gerar movimento", "Mantenho um ritmo estável até concluir", "Defino critérios antes de começar"),
  B("b02", "Decido assim que tenho o essencial", "Decido depois de conversar com pessoas", "Decido sem apressar o processo", "Decido depois de conferir as informações"),
  B("b03", "Falo de forma direta e objetiva", "Falo com entusiasmo e expressão", "Falo com calma e atenção", "Falo com precisão e cuidado"),
  B("b04", "Trabalho melhor com metas desafiadoras", "Trabalho melhor com interação frequente", "Trabalho melhor com rotina previsível", "Trabalho melhor com padrões definidos"),
  B("b05", "Inicio a mudança e ajusto no caminho", "Apresento a mudança de modo envolvente", "Adoto a mudança de forma gradual", "Avalio os efeitos antes de mudar"),
  B("b06", "Enfrento a divergência logo que aparece", "Busco aproximar as pessoas na divergência", "Procuro reduzir a tensão na divergência", "Retomo fatos e critérios na divergência"),
  B("b07", "Assumo tarefas que exigem decisão", "Assumo tarefas que exigem articulação", "Assumo tarefas que exigem continuidade", "Assumo tarefas que exigem precisão"),
  B("b08", "Estimulo o time com desafios claros", "Estimulo o time com entusiasmo", "Estimulo o time com apoio constante", "Estimulo o time com orientação detalhada"),
  B("b09", "Aceito riscos para ganhar velocidade", "Aceito riscos quando há apoio das pessoas", "Prefiro riscos pequenos e graduais", "Reduzo riscos antes de avançar"),
  B("b10", "Planejo a partir do resultado esperado", "Planejo incluindo conversas e articulações", "Planejo mantendo uma sequência conhecida", "Planejo etapas, prazos e critérios"),
  B("b11", "Conduzo a reunião para uma decisão", "Conduzo a reunião para ampliar a participação", "Conduzo a reunião para manter o entendimento", "Conduzo a reunião para organizar os pontos"),
  B("b12", "Em um grupo novo, assumo iniciativa", "Em um grupo novo, inicio conversas", "Em um grupo novo, observo antes de participar", "Em um grupo novo, entendo primeiro as regras"),
  B("b13", "Sob pressão, acelero as decisões", "Sob pressão, converso para mobilizar", "Sob pressão, preservo a estabilidade", "Sob pressão, confiro os riscos"),
  B("b14", "Dou retorno com franqueza", "Dou retorno destacando possibilidades", "Dou retorno com cuidado e escuta", "Dou retorno com exemplos específicos"),
  B("b15", "Prefiro autonomia para decidir", "Prefiro liberdade para interagir", "Prefiro apoio disponível durante o trabalho", "Prefiro orientações e limites claros"),
  B("b16", "Convenço mostrando o resultado", "Convenço criando conexão com as pessoas", "Convenço construindo confiança aos poucos", "Convenço apresentando fatos e lógica"),
  B("b17", "Questiono regras que atrasam a entrega", "Torno as regras mais fáceis de comunicar", "Sigo regras que preservam a estabilidade", "Sigo regras para manter o padrão"),
  B("b18", "Ao notar um erro, corrijo imediatamente", "Ao notar um erro, converso com os envolvidos", "Ao notar um erro, evito interromper todo o fluxo", "Ao notar um erro, verifico a causa"),
  B("b19", "Priorizo o que traz resultado mais rápido", "Priorizo o que depende de articulação", "Priorizo o que mantém a continuidade", "Priorizo o que exige maior exatidão"),
  B("b20", "Aprendo melhor testando na prática", "Aprendo melhor trocando ideias", "Aprendo melhor repetindo com constância", "Aprendo melhor estudando o método"),
  B("b21", "Delego pelo resultado esperado", "Delego mantendo contato frequente", "Delego oferecendo acompanhamento", "Delego definindo critérios de entrega"),
  B("b22", "Valorizo reconhecimento por conquistas", "Valorizo reconhecimento diante das pessoas", "Valorizo reconhecimento pela constância", "Valorizo reconhecimento pela qualidade"),
  B("b23", "Concluo rapidamente e sigo adiante", "Mantenho o interesse trazendo novas ideias", "Sustento o trabalho até o fim", "Reviso o trabalho antes de concluir"),
  B("b24", "Avalio o dia pelo que resolvi", "Avalio o dia pelas conexões que criei", "Avalio o dia pela continuidade que mantive", "Avalio o dia pela qualidade do que entreguei"),
];

export const DEFAULT_SCORING: ScoringConfig = {
  version: "apas-scoring-1.2.0",
  predominantSource: "adapted",
  adaptedMode: "average",
  mostWeight: 1,
  leastWeight: -1,
  naturalBase: 1,
  thresholds: { high: 32, moderate: 20 },
  adaptationAlert: 18,
  primaryMostWeight: 2,
  primaryAcceptanceWeight: 1,
  proximityThreshold: 3,
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
  let h = (seed + 2166136261) | 0;
  for (const ch of item.id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) | 0;
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) | 0;
    h = Math.imul(h ^ (h >>> 13), 3266489909) | 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const list: InstrumentItem["options"] = [...item.options];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const a = list[i]!;
    const b = list[j]!;
    list[i] = b;
    list[j] = a;
  }
  return list;
}
