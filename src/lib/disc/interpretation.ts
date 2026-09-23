import type { Dimension } from "./instrument";
import type { ScoreResult } from "./scoring";

export type DiscTechnicalContent = {
  scoringVersion: string;
  completionPercent: number;
  invalidAnswerCount: number;
  primary: Dimension;
  secondary: Dimension;
  primaryGap: number;
  closeCombination: boolean;
  levels: Record<Dimension, "alto" | "moderado" | "baixo">;
  natural: Record<Dimension, number>;
  adapted: Record<Dimension, number>;
  delta: Record<Dimension, number>;
  strongestDelta: Dimension;
  highestFactor: Dimension;
  lowestFactor: Dimension;
};

export type DiscReportContent = {
  profileName: string;
  headline: string;
  overview: string;
  factorReadings: Record<Dimension, string>;
  strengths: string[];
  attention: string[];
  perception: string;
  communication: string;
  decision: string;
  teamwork: string;
  pressureChange: string;
  development: string[];
  adaptation: string;
  conclusion: string;
  profileLabel: string;
  profileBalance: string;
  secondaryInfluence: string;
  lowerFactors: string;
  intensitySummary: string;
  technical: DiscTechnicalContent;
  technicalSignals: {
    intensity: Record<Dimension, "alto" | "moderado" | "baixo">;
    primaryGap: number;
    closeCombination: boolean;
    naturalVsAdaptedDelta: Record<Dimension, number>;
    strongestDelta: Dimension;
    highestFactor: Dimension;
    lowestFactor: Dimension;
  };
};

const FACTOR_NAMES: Record<Dimension, string> = {
  D: "Dominância",
  I: "Influência",
  S: "Estabilidade",
  C: "Conformidade",
};

const round = (value: number) => Math.round(value * 10) / 10;
const pct = (value: number) => round(value).toFixed(1).replace(".", ",") + "%";

function intensityWord(level: ScoreResult["levels"][Dimension]) {
  return level === "alto" ? "marcante" : level === "moderado" ? "presente" : "menos acentuado";
}

const COMBINATION_THEMES: Record<string, string> = {
  DI: "Direção, velocidade e objetividade combinadas com capacidade de mobilizar pessoas e gerar movimento.",
  ID: "Influência, expressão e conexão combinadas com iniciativa, autonomia e foco em avanço.",
  DS: "Foco em resultado e decisão combinado com constância, acompanhamento e atenção ao ritmo das pessoas.",
  SD: "Estabilidade, cooperação e continuidade combinadas com firmeza para decidir e conduzir situações.",
  DC: "Decisão e orientação para resultado combinadas com atenção a critérios, qualidade e riscos.",
  CD: "Análise, precisão e critérios combinados com autonomia, firmeza e execução.",
  IS: "Relacionamento, comunicação e mobilização combinados com escuta, cooperação e continuidade.",
  SI: "Constância, apoio e estabilidade combinados com interação, comunicação e influência.",
  IC: "Expressão e conexão combinadas com cuidado com informações, critérios e qualidade.",
  CI: "Precisão e análise combinadas com comunicação, relacionamento e clareza.",
  SC: "Estabilidade e cooperação combinadas com organização, critérios e qualidade.",
  CS: "Precisão e consistência combinadas com paciência, previsibilidade e atenção à equipe.",
};

function orderedDimensions(scores: ScoreResult): Dimension[] {
  return [...scores.adapted.order];
}

function buildProfileBalance(scores: ScoreResult) {
  const o = orderedDimensions(scores);
  const spread = round(scores.adapted.percent[o[0]!] - scores.adapted.percent[o[3]!]);
  return "A distribuição vai de " + pct(scores.adapted.percent[o[0]!]) + " em " + FACTOR_NAMES[o[0]!] +
    " a " + pct(scores.adapted.percent[o[3]!]) + " em " + FACTOR_NAMES[o[3]!] +
    ", uma amplitude de " + pct(spread) + ". Os dois primeiros fatores estão separados por " +
    pct(scores.primaryGap ?? 0) + ", ajudando a diferenciar uma composição mais concentrada de uma mais equilibrada.";
}

function buildSecondaryInfluence(scores: ScoreResult) {
  const gap = scores.primaryGap ?? 0;
  const relation = gap <= 3 ? "atua quase no mesmo nível do fator principal" :
    gap <= 7 ? "tem presença relevante ao lado do fator principal" : "aparece como influência complementar";
  return FACTOR_NAMES[scores.secondary] + " " + relation + ". Essa tendência acrescenta uma segunda forma de responder ao contexto avaliado.";
}

function buildLowerFactors(scores: ScoreResult) {
  const o = orderedDimensions(scores);
  const low = o[3]!;
  const third = o[2]!;
  return FACTOR_NAMES[low] + " é o fator menos acentuado (" + pct(scores.adapted.percent[low]) +
    "), enquanto " + FACTOR_NAMES[third] + " ocupa a terceira posição (" + pct(scores.adapted.percent[third]) +
    "). Isso indica menor expressão relativa, não ausência dessa característica.";
}

function buildIntensitySummary(scores: ScoreResult) {
  return orderedDimensions(scores).map((d) =>
    d + " " + pct(scores.adapted.percent[d]) + " — " + intensityWord(scores.levels[d])
  ).join(" · ");
}

function buildHeadline(scores: ScoreResult) {
  const p = scores.predominant;
  const s = scores.secondary;
  if (scores.closeCombination) {
    return "Seu perfil combina " + FACTOR_NAMES[p] + " e " + FACTOR_NAMES[s] +
      " com proximidade entre os dois fatores principais. Isso indica uma composição mais equilibrada entre essas duas tendências, sem apagar as demais.";
  }
  return "Seu resultado apresenta " + FACTOR_NAMES[p] + " como tendência predominante e " + FACTOR_NAMES[s] +
    " como segunda influência. A leitura conjunta mostra como essas características podem se combinar no seu modo de agir.";
}

function buildFactorReading(d: Dimension, scores: ScoreResult) {
  const value = scores.adapted.percent[d];
  const level = scores.levels[d];
  const bases: Record<Dimension, string> = {
    D: "Tende a buscar direção, objetividade, autonomia e avanço. Em situações de decisão, pode preferir transformar rapidamente o problema em ação.",
    I: "Tende a valorizar interação, expressão, influência e troca. Em situações sociais, pode ganhar energia quando existe espaço para conversar, mobilizar e conectar pessoas.",
    S: "Tende a valorizar estabilidade, continuidade, cooperação e previsibilidade. Em mudanças, pode preferir compreender o contexto e preservar o que já funciona.",
    C: "Tende a valorizar critérios, precisão, qualidade e consistência. Antes de concluir, pode buscar informações suficientes para reduzir ambiguidades e erros.",
  };
  return bases[d] + " No seu resultado, " + FACTOR_NAMES[d] + " aparece em nível " +
    intensityWord(level) + " (" + pct(value) + ").";
}

function buildStrengths(scores: ScoreResult) {
  const strengths: Record<Dimension, string[]> = {
    D: ["Transformar prioridades em encaminhamentos objetivos.", "Assumir responsabilidade quando uma decisão precisa avançar.", "Manter foco no resultado e no que precisa ser resolvido."],
    I: ["Criar conexão e facilitar a circulação de ideias.", "Comunicar entusiasmo e mobilizar participação.", "Ampliar possibilidades por meio da interação."],
    S: ["Oferecer constância e continuidade ao trabalho.", "Contribuir para relações cooperativas e previsíveis.", "Manter estabilidade durante processos que exigem acompanhamento."],
    C: ["Organizar informações e observar critérios relevantes.", "Buscar qualidade e consistência antes de concluir.", "Perceber detalhes que podem afetar o resultado."],
  };
  return [...new Set([...strengths[scores.predominant].slice(0, 2), ...strengths[scores.secondary].slice(0, 1)])];
}

function buildAttention(scores: ScoreResult) {
  const attention: Record<Dimension, string[]> = {
    D: ["A velocidade para decidir pode fazer com que algumas pessoas precisem de mais tempo para acompanhar.", "Em situações de divergência, vale observar se a objetividade está sendo recebida como clareza ou como pressão."],
    I: ["A espontaneidade e o entusiasmo podem levar a iniciar muitas possibilidades antes de definir prioridades.", "Vale confirmar se a mensagem foi compreendida da mesma forma por pessoas menos participativas."],
    S: ["A busca por estabilidade pode tornar mudanças bruscas mais desgastantes ou exigir mais tempo de adaptação.", "Vale explicitar quando é necessário mudar, mesmo que o cenário ainda não esteja totalmente confortável."],
    C: ["A busca por precisão pode ampliar o tempo necessário para concluir quando a situação pede uma decisão prática.", "Vale distinguir o que é essencial para a qualidade daquilo que pode ser ajustado depois."],
  };
  return [attention[scores.predominant][0], attention[scores.secondary][0]];
}

function buildCommunication(scores: ScoreResult) {
  const first: Record<Dimension, string> = {
    D: "Na comunicação, tende a apreciar objetividade, propósito e encaminhamento.",
    I: "Na comunicação, tende a responder bem à troca, à energia da conversa e à possibilidade de influenciar.",
    S: "Na comunicação, tende a valorizar escuta, respeito ao ritmo e segurança na relação.",
    C: "Na comunicação, tende a valorizar clareza, lógica, contexto e informações verificáveis.",
  };
  const second: Record<Dimension, string> = {
    D: "Pode preferir conversas que terminem com uma definição clara.",
    I: "Pode tornar a conversa mais dinâmica e relacional.",
    S: "Pode dedicar atenção especial ao impacto da mensagem sobre as pessoas.",
    C: "Pode fazer perguntas para reduzir ambiguidades antes de concordar.",
  };
  return first[scores.predominant] + " " + second[scores.secondary];
}

function buildDecision(scores: ScoreResult) {
  const decision: Record<Dimension, string> = {
    D: "Ao decidir, tende a priorizar avanço, autonomia e resultado.",
    I: "Ao decidir, tende a considerar a reação das pessoas e as possibilidades que a conversa abre.",
    S: "Ao decidir, tende a considerar continuidade, segurança e impacto sobre as relações.",
    C: "Ao decidir, tende a considerar critérios, evidências e consequências para a qualidade da entrega.",
  };
  return decision[scores.predominant];
}

function buildTeamwork(scores: ScoreResult) {
  const team: Record<Dimension, string> = {
    D: "Em equipe, tende a contribuir trazendo direção e ritmo para a execução.",
    I: "Em equipe, tende a contribuir conectando pessoas, ideias e oportunidades de interação.",
    S: "Em equipe, tende a contribuir sustentando cooperação, continuidade e apoio.",
    C: "Em equipe, tende a contribuir organizando critérios, informações e qualidade.",
  };
  return team[scores.predominant] + " A segunda tendência (" + FACTOR_NAMES[scores.secondary] +
    ") acrescenta outra forma de participação ao seu estilo.";
}

function buildPressure(scores: ScoreResult) {
  const pressure: Record<Dimension, string> = {
    D: "Sob pressão, pode aumentar a velocidade, assumir o controle e buscar uma saída objetiva.",
    I: "Sob pressão, pode aumentar a comunicação e procurar apoio ou mobilização das pessoas.",
    S: "Sob pressão, pode buscar preservar estabilidade e reduzir mudanças desnecessárias.",
    C: "Sob pressão, pode aumentar a conferência de informações e procurar reduzir riscos.",
  };
  return pressure[scores.predominant];
}

function buildDevelopment(scores: ScoreResult) {
  const primary: Record<Dimension, string[]> = {
    D: ["Equilibrar velocidade de decisão com escuta de quem será impactado.", "Separar urgência real de assuntos que podem amadurecer."],
    I: ["Transformar boas conexões em prioridades, compromissos e acompanhamentos.", "Confirmar fatos e combinados depois de conversas mais abertas."],
    S: ["Praticar mudanças graduais sem adiar decisões necessárias.", "Comunicar limites e posicionamentos mesmo quando existe risco de desconforto."],
    C: ["Definir o nível de precisão necessário para cada situação.", "Evitar que a busca por segurança impeça testes e decisões proporcionais ao risco."],
  };
  const secondAdd: Record<Dimension, string> = {
    D: "Usar a objetividade da Dominância para transformar intenção em ação.",
    I: "Usar a Influência para ampliar adesão e clareza na comunicação.",
    S: "Usar a Estabilidade para sustentar consistência e relacionamento.",
    C: "Usar a Conformidade para dar estrutura, critérios e qualidade.",
  };
  return [...primary[scores.predominant], secondAdd[scores.secondary]];
}

function buildAdaptation(scores: ScoreResult) {
  const dims: Dimension[] = ["D", "I", "S", "C"];
  const max = Math.max(...dims.map((d) => Math.abs(scores.adapted.percent[d] - scores.natural.percent[d])));
  if (scores.adaptationAlert) {
    return "Seu índice de adaptação é " + pct(scores.adaptationIndex) +
      ". A diferença entre o modo natural e o modo adaptado merece atenção: em determinados contextos, você pode estar ajustando seu comportamento de maneira mais perceptível. Isso não significa certo ou errado; indica apenas uma diferença entre tendências espontâneas e respostas ao contexto. A maior variação observada foi de " + pct(max) + " em um dos fatores.";
  }
  return "Seu índice de adaptação é " + pct(scores.adaptationIndex) +
    ". As diferenças entre o modo natural e o modo adaptado aparecem de forma mais contida no resultado, sugerindo maior proximidade entre suas tendências espontâneas e a forma como você responde ao contexto avaliado.";
}

export function buildDiscReportContent(scores: ScoreResult): DiscReportContent {
  const dims: Dimension[] = ["D", "I", "S", "C"];
  const delta = {} as Record<Dimension, number>;
  for (const d of dims) delta[d] = round(scores.adapted.percent[d] - scores.natural.percent[d]);
  const p = scores.predominant;
  const s = scores.secondary;

  return {
    profileName: p + s + " — " + FACTOR_NAMES[p] + " + " + FACTOR_NAMES[s],
    profileLabel: COMBINATION_THEMES[scores.combination] ?? "Combinação " + p + s,
    headline: buildHeadline(scores),
    overview: "O resultado é construído a partir da distribuição das quatro dimensões, da ordem entre os fatores principais e da distância entre eles. Seu perfil atual é " +
      p + s + ", com " + pct(scores.adapted.percent[p]) + " em " + FACTOR_NAMES[p] + " e " +
      pct(scores.adapted.percent[s]) + " em " + FACTOR_NAMES[s] + ". A diferença entre os dois fatores principais é de " +
      pct(scores.primaryGap ?? 0) + ".",
    factorReadings: { D: buildFactorReading("D", scores), I: buildFactorReading("I", scores), S: buildFactorReading("S", scores), C: buildFactorReading("C", scores) },
    strengths: buildStrengths(scores),
    attention: buildAttention(scores),
    perception: "As pessoas podem perceber primeiro a combinação entre " + FACTOR_NAMES[p] + " e " + FACTOR_NAMES[s] +
      ". Dependendo do contexto, isso pode aparecer como um estilo mais " +
      (p === "D" ? "direto" : p === "I" ? "expressivo" : p === "S" ? "acolhedor e constante" : "criterioso") +
      ", combinado com características de " + FACTOR_NAMES[s].toLowerCase() + ".",
    communication: buildCommunication(scores),
    decision: buildDecision(scores),
    teamwork: buildTeamwork(scores),
    pressureChange: buildPressure(scores),
    development: buildDevelopment(scores),
    adaptation: buildAdaptation(scores),
    profileBalance: buildProfileBalance(scores),
    secondaryInfluence: buildSecondaryInfluence(scores),
    lowerFactors: buildLowerFactors(scores),
    intensitySummary: buildIntensitySummary(scores),
    conclusion: "Seu resultado não descreve uma identidade fixa. Ele representa tendências comportamentais observadas no instrumento APAS DISC. A combinação " +
      p + s + ", as intensidades e as diferenças entre natural e adaptado devem ser lidas em conjunto e sempre relacionadas ao contexto em que a avaliação foi realizada.",
    technicalSignals: { intensity: scores.levels, primaryGap: round(scores.primaryGap ?? 0), closeCombination: Boolean(scores.closeCombination), naturalVsAdaptedDelta: delta },
  };
}
