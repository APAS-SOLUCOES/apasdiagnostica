import type { Dimension } from "./instrument";
import type { ScoreResult } from "./scoring";
import { DIMENSION_CONTENT } from "./content";
import { COMBINATION_NARRATIVES, type CombinationNarrative } from "./report-content";

type IntensityBand = "baixo" | "emergente" | "presente" | "marcante" | "muito_marcante" | "dominante";

const round = (n: number) => Math.round(n * 10) / 10;
const pct = (n: number) => round(n).toFixed(1).replace(".", ",") + "%";

function intensityBand(value: number): IntensityBand {
  if (value < 18) return "baixo";
  if (value < 25) return "emergente";
  if (value < 30) return "presente";
  if (value < 35) return "marcante";
  if (value < 40) return "muito_marcante";
  return "dominante";
}

function intensityLabel(band: IntensityBand) {
  return {
    baixo: "menos acentuada",
    emergente: "emergente",
    presente: "presente",
    marcante: "marcante",
    muito_marcante: "muito marcante",
    dominante: "dominante",
  }[band];
}

function intensitySentence(d: Dimension, value: number) {
  const name = DIMENSION_CONTENT[d].title;
  const band = intensityBand(value);
  const phrases: Record<Dimension, Record<IntensityBand, string>> = {
    D: {
      baixo: "A baixa expressão relativa de Dominância favorece mais espaço para escuta, consenso e construção antes de assumir a frente.",
      emergente: "Dominância aparece como recurso disponível, especialmente quando a situação pede iniciativa, mas sem ocupar o centro de todas as decisões.",
      presente: "Dominância aparece de forma funcional: você tende a assumir direção quando percebe que o contexto precisa de movimento.",
      marcante: "Dominância já é uma assinatura relevante do seu repertório: diante de obstáculos, tende a transformar rapidamente intenção em ação.",
      muito_marcante: "Dominância muito marcada indica forte impulso para decidir, desafiar obstáculos e acelerar o que considera prioritário.",
      dominante: "Dominância é o eixo mais expressivo deste resultado, indicando forte preferência por direção, autonomia, velocidade e resolução.",
    },
    I: {
      baixo: "A baixa expressão relativa de Influência indica que você pode preferir impacto pela tarefa, consistência ou critério, sem depender de exposição social.",
      emergente: "Influência aparece como recurso disponível quando conexão, persuasão ou presença social ajudam a situação a avançar.",
      presente: "Influência aparece de forma funcional: você tende a usar conversa e relacionamento para criar adesão quando isso é útil.",
      marcante: "Influência já é uma presença relevante: ideias ganham força quando você pode conectar pessoas, comunicar possibilidades e gerar movimento.",
      muito_marcante: "Influência muito marcada indica forte recurso de persuasão, expressão e mobilização por meio das relações.",
      dominante: "Influência é o eixo mais expressivo deste resultado, indicando forte preferência por conexão, expressão, persuasão e mobilização.",
    },
    S: {
      baixo: "A baixa expressão relativa de Estabilidade favorece maior abertura a variedade, ritmo e mudanças, com menor necessidade de previsibilidade.",
      emergente: "Estabilidade aparece como recurso de sustentação quando continuidade, escuta e segurança ajudam o contexto.",
      presente: "Estabilidade aparece de forma funcional: você tende a preservar continuidade e cooperação quando percebe valor nisso.",
      marcante: "Estabilidade já é uma presença relevante: você tende a sustentar relações, rotinas e entregas com constância.",
      muito_marcante: "Estabilidade muito marcada indica forte preferência por previsibilidade, cooperação, ritmo sustentável e relações de confiança.",
      dominante: "Estabilidade é o eixo mais expressivo deste resultado, indicando forte preferência por constância, cooperação, previsibilidade e sustentação.",
    },
    C: {
      baixo: "A baixa expressão relativa de Conformidade indica menor necessidade de estruturar tudo antes de agir, favorecendo experimentação e flexibilidade.",
      emergente: "Conformidade aparece como recurso disponível quando precisão, critérios ou análise de risco passam a ser importantes.",
      presente: "Conformidade aparece de forma funcional: você tende a recorrer a critérios e dados quando a qualidade da decisão exige.",
      marcante: "Conformidade já é uma presença relevante: você tende a proteger qualidade por meio de análise, critérios e atenção aos detalhes.",
      muito_marcante: "Conformidade muito marcada indica forte preferência por precisão, evidência, método e redução de riscos.",
      dominante: "Conformidade é o eixo mais expressivo deste resultado, indicando forte preferência por critério, precisão, método e qualidade.",
    },
  };
  return phrases[d][band] + ` Seu resultado registra ${pct(value)} em ${name}.`;
}

function gapPhrase(gap: number) {
  if (gap <= 1.5) return "Os dois fatores principais estão praticamente lado a lado, formando uma combinação muito equilibrada.";
  if (gap <= 3) return "Os dois fatores principais aparecem próximos, formando uma combinação bastante equilibrada.";
  if (gap <= 5) return "Há uma predominância leve do primeiro fator, enquanto o segundo continua exercendo influência relevante.";
  if (gap <= 8) return "O primeiro fator já se distancia do segundo, dando uma direção mais definida ao perfil.";
  if (gap <= 12) return "A distância entre os dois fatores principais torna a preferência do primeiro mais evidente.";
  return "A distância entre os dois fatores principais é ampla, deixando o primeiro fator como referência comportamental predominante.";
}

function adaptationPhrase(scores: ScoreResult) {
  const values = scores.adapted.percent;
  const p = scores.predominant;
  const s = scores.secondary;
  const gap = round(scores.primaryGap ?? values[p] - values[s]);
  return `${gapPhrase(gap)} Em ${pct(values[p])} de ${p} e ${pct(values[s])} de ${s}, a leitura combina intensidade do primeiro fator com a influência relativa do segundo.`;
}

export function getAdaptiveNarrative(scores: ScoreResult): CombinationNarrative {
  const base = COMBINATION_NARRATIVES[scores.combination] ?? COMBINATION_NARRATIVES[\`${scores.predominant}${scores.secondary}\`] ?? COMBINATION_NARRATIVES.DI;
  const p = scores.predominant;
  const s = scores.secondary;
  const pv = scores.adapted.percent[p];
  const sv = scores.adapted.percent[s];
  const gap = round(scores.primaryGap ?? pv - sv);
  const band = intensityBand(pv);
  const secondaryBand = intensityBand(sv);

  const intensityPrefix = intensitySentence(p, pv);
  const secondarySentence = intensitySentence(s, sv);

  const best = [
    ...base.best,
    band === "dominante" || band === "muito_marcante"
      ? `A força de ${DIMENSION_CONTENT[p].title} é especialmente disponível neste resultado (${pct(pv)}).`
      : `A ${DIMENSION_CONTENT[p].title} aparece como recurso relevante (${pct(pv)}), especialmente quando o contexto pede esse comportamento.`,
  ].slice(0, 4);

  const excess = [
    ...base.excess,
    gap > 8
      ? `Quando ${DIMENSION_CONTENT[p].title} assume muito mais espaço que ${DIMENSION_CONTENT[s].title}, vale observar se o repertório secundário continua sendo acessado.`
      : `Como ${DIMENSION_CONTENT[p].title} e ${DIMENSION_CONTENT[s].title} estão relativamente próximos, vale observar qual deles assume a frente conforme o contexto muda.`,
  ].slice(0, 4);

  const experiments = [
    ...base.experiments,
    `Praticar conscientemente um comportamento de ${DIMENSION_CONTENT[s].title.toLowerCase()} em uma situação em que ${DIMENSION_CONTENT[p].title.toLowerCase()} costuma aparecer primeiro.`,
  ].slice(0, 3);

  return {
    ...base,
    title: `${base.title} · ${intensityLabel(band)}`,
    essence: `${intensityPrefix} ${gapPhrase(gap)} ${secondarySentence}`,
    best,
    excess,
    perceived: `${base.perceived} ${adaptationPhrase(scores)}`,
    communication: `${base.communication} Como ${DIMENSION_CONTENT[p].title} está em ${pct(pv)} e ${DIMENSION_CONTENT[s].title} em ${pct(sv)}, ajuste a quantidade de objetividade, interação, ritmo ou detalhe ao interlocutor.`,
    decision: `${base.decision} A diferença de ${pct(gap)} pontos entre os dois fatores principais ajuda a entender quanto a preferência por ${p} tende a aparecer antes de ${s}.`,
    leadership: `${base.leadership} A intensidade de ${pct(pv)} em ${p} sugere que este recurso pode aparecer com bastante disponibilidade; o ganho está em calibrá-lo ao contexto.`,
    team: `${base.team} A presença de ${s} em ${pct(sv)} indica um segundo recurso importante para equilibrar ou complementar ${p}.`,
    pressure: `${base.pressure} Quando a pressão aumenta, a intensidade de ${p} (${pct(pv)}) pode tornar esse padrão ainda mais visível.`,
    change: `${base.change} O segundo fator, ${s} (${pct(sv)}), pode oferecer um repertório complementar durante a transição.`,
    experiments,
  };
}

export function getAdaptiveFactorReading(d: Dimension, value: number) {
  return intensitySentence(d, value);
}
