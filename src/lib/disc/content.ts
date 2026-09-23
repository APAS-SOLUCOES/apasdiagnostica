import type { Dimension } from "./instrument";

/**
 * Conteúdo autoral APAS Soluções.
 * Linguagem comportamental, não clínica e não diagnóstica.
 */

export const APAS_DISCLAIMER =
  "O APAS DISC é uma ferramenta de análise de tendências comportamentais e não constitui diagnóstico psicológico, clínico ou psiquiátrico. Seus resultados devem ser interpretados como indicadores de tendências e utilizados em conjunto com contexto, observação e devolutiva profissional. Não mede inteligência, caráter ou competência técnica e não deve ser usado isoladamente para decisões sobre pessoas.";

export const APAS_INTRO = [
  "Bem-vindo ao Relatório Comportamental APAS. Este documento foi construído para transformar as suas respostas em leitura prática: o que você tende a priorizar, como se comunica, em que ritmo decide e o que sustenta a sua energia no trabalho.",
  "Não existe perfil melhor ou pior. Existem preferências mais ou menos adequadas a cada contexto, e a consciência dessas preferências é o que permite escolher respostas melhores em vez de repetir automatismos.",
  "Leia o relatório com curiosidade, valide com pessoas que convivem com você e transforme percepção em plano de ação. O valor do instrumento não está no rótulo, mas na conversa que ele abre.",
];

export const APAS_FOUNDATION = [
  "O modelo comportamental de quatro fatores organiza a leitura da conduta em dois eixos simples: o ritmo (mais acelerado ou mais constante) e o foco (mais nas tarefas ou mais nas pessoas). Do cruzamento desses eixos nascem quatro tendências: Dominância, Influência, Estabilidade e Conformidade.",
  "Dominância descreve como a pessoa lida com problemas e desafios. Influência descreve como ela lida com pessoas e persuasão. Estabilidade descreve como lida com ritmo e mudanças. Conformidade descreve como lida com normas, critérios e padrões de qualidade.",
  "Toda pessoa possui os quatro fatores em intensidades diferentes. O que o instrumento identifica é a combinação preferencial — a rota mais confortável — e não um limite de atuação.",
  "A APAS trabalha com três leituras complementares: o Perfil Natural (tendências espontâneas), o Perfil Social (como a pessoa acredita que precisa se apresentar) e o Perfil Adaptado (o comportamento resultante no dia a dia).",
];

export const PROFILE_EXPLANATIONS: Record<string, string> = {
  natural:
    "Perfil Natural: representa as tendências que aparecem quando há liberdade, confiança e ausência de pressão externa. É a base de energia da pessoa — o modo de agir que exige menos esforço para ser sustentado.",
  social:
    "Perfil Social: representa a leitura que a pessoa faz do que o ambiente espera dela. Indica a imagem que ela busca projetar e os comportamentos que julga necessários para ser bem avaliada.",
  adapted:
    "Perfil Adaptado: representa o comportamento observável hoje, resultado do encontro entre tendência natural e demanda percebida. É o perfil mais útil para conversas de desempenho no curto prazo.",
};

type DimensionContent = {
  title: string;
  headline: string;
  summary: string;
  strengths: string[];
  characteristics: string[];
  motivators: string[];
  demotivators: string[];
  habits: string[];
  communication: string;
  development: string[];
  attention: string[];
  levels: { alto: string; moderado: string; baixo: string };
};

export const DIMENSION_CONTENT: Record<Dimension, DimensionContent> = {
  D: {
    title: "Dominância",
    headline: "Direção, decisão e senso de urgência",
    summary:
      "Pessoas com Dominância marcante tendem a avançar rápido, assumir a frente de situações indefinidas e medir o próprio valor pelo resultado entregue. Preferem conversas curtas, objetivos claros e liberdade para decidir.",
    strengths: [
      "Iniciativa diante de problemas novos",
      "Clareza e franqueza na comunicação",
      "Capacidade de decidir com informação incompleta",
      "Foco firme em metas e prazos",
    ],
    characteristics: [
      "Age antes de esperar consenso",
      "Prefere autonomia a supervisão próxima",
      "Tolera pouco a lentidão e a burocracia",
      "Responde bem a desafios difíceis",
    ],
    motivators: [
      "Autoridade para decidir",
      "Metas ambiciosas e mensuráveis",
      "Ambientes competitivos e dinâmicos",
      "Reconhecimento por conquistas concretas",
    ],
    demotivators: [
      "Processos longos sem propósito claro",
      "Microgerenciamento",
      "Indefinição de responsabilidades",
    ],
    habits: [
      "Começa pelo resultado e depois discute o caminho",
      "Corta reuniões que não avançam",
      "Assume tarefas críticas quando percebe risco",
    ],
    communication:
      "Vá direto ao ponto, apresente o objetivo antes do contexto e ofereça alternativas com prós e contras resumidos.",
    development: [
      "Explicitar o 'porquê' das decisões para reduzir ruído no time",
      "Reservar tempo para ouvir antes de concluir",
      "Negociar prazos considerando o ritmo dos demais",
    ],
    attention: [
      "Pode ser percebido como impaciente ou duro sob pressão",
      "Risco de decidir sem checar dados relevantes",
      "Pode sobrecarregar-se por não delegar a tempo",
    ],
    levels: {
      alto: "Assume o comando naturalmente e prefere decidir a aguardar. Tende a acelerar quando o ambiente hesita.",
      moderado:
        "Assume a direção quando necessário, mas costuma buscar alinhamento antes de avançar.",
      baixo:
        "Prefere construir consenso a impor direção, e tende a evitar confrontos diretos.",
    },
  },
  I: {
    title: "Influência",
    headline: "Relacionamento, entusiasmo e articulação",
    summary:
      "Pessoas com Influência marcante mobilizam pelo diálogo. Constroem redes com facilidade, comunicam ideias com energia e criam clima favorável mesmo em cenários difíceis.",
    strengths: [
      "Facilidade para criar vínculo e confiança",
      "Comunicação persuasiva e acessível",
      "Otimismo que sustenta o grupo",
      "Habilidade para articular pessoas e interesses",
    ],
    characteristics: [
      "Pensa em voz alta e valoriza troca",
      "Busca reconhecimento e visibilidade",
      "Adapta o discurso ao público",
      "Prefere ambientes colaborativos",
    ],
    motivators: [
      "Contato frequente com pessoas",
      "Liberdade de expressão e criatividade",
      "Reconhecimento público",
      "Projetos variados e com movimento",
    ],
    demotivators: [
      "Isolamento e trabalho repetitivo",
      "Ambientes rígidos e impessoais",
      "Crítica feita em público",
    ],
    habits: [
      "Resolve por conversa antes de formalizar",
      "Cria alianças antes de propor mudanças",
      "Comemora avanços de forma visível",
    ],
    communication:
      "Abra espaço para diálogo, reconheça contribuições e conecte o tema a pessoas e impacto, não só a números.",
    development: [
      "Registrar acordos por escrito para sustentar entregas",
      "Aprofundar dados antes de apresentar conclusões",
      "Fechar assuntos antes de abrir novos",
    ],
    attention: [
      "Pode dispersar foco entre muitas frentes",
      "Tende a evitar conversas duras para preservar a relação",
      "Risco de otimismo excessivo em prazos",
    ],
    levels: {
      alto: "Comunica com energia e influencia pelo relacionamento; a rede é o principal recurso de trabalho.",
      moderado:
        "Circula bem entre pessoas, mas dosa exposição e prefere contextos conhecidos.",
      baixo:
        "Prefere comunicação objetiva e reservada, com menor necessidade de visibilidade social.",
    },
  },
  S: {
    title: "Estabilidade",
    headline: "Constância, cooperação e sustentação",
    summary:
      "Pessoas com Estabilidade marcante sustentam entregas ao longo do tempo. Valorizam confiança, previsibilidade e cuidado com o grupo, e costumam ser referência de confiabilidade.",
    strengths: [
      "Consistência de ritmo e qualidade",
      "Escuta atenta e paciência",
      "Lealdade e cuidado com o time",
      "Capacidade de mediar tensões",
    ],
    characteristics: [
      "Prefere planejar mudanças a improvisar",
      "Evita conflito desnecessário",
      "Cumpre o combinado sem precisar de cobrança",
      "Constrói relações duradouras",
    ],
    motivators: [
      "Segurança e clareza de expectativas",
      "Clima cooperativo",
      "Tempo adequado para transições",
      "Reconhecimento pela contribuição contínua",
    ],
    demotivators: [
      "Mudanças abruptas sem explicação",
      "Ambientes de conflito constante",
      "Pressão por decisões imediatas",
    ],
    habits: [
      "Apoia colegas antes de pedir apoio",
      "Mantém rotinas que garantem previsibilidade",
      "Observa antes de se posicionar",
    ],
    communication:
      "Explique o contexto, dê tempo de resposta e evite pressão. Confirme entendimento e combine passos concretos.",
    development: [
      "Expressar discordância mais cedo",
      "Praticar decisões rápidas em cenários de baixo risco",
      "Estabelecer limites para não absorver demandas em excesso",
    ],
    attention: [
      "Pode acumular insatisfações não verbalizadas",
      "Tende a resistir a mudanças rápidas",
      "Risco de sobrecarga por dificuldade em dizer não",
    ],
    levels: {
      alto: "Sustenta o ritmo e o clima do grupo; valoriza estabilidade e previsibilidade acima da velocidade.",
      moderado:
        "Equilibra constância e movimento, aceitando mudanças quando compreende o motivo.",
      baixo:
        "Prefere variedade e ritmo acelerado, com menor apego a rotinas estabelecidas.",
    },
  },
  C: {
    title: "Conformidade",
    headline: "Critério, precisão e qualidade técnica",
    summary:
      "Pessoas com Conformidade marcante trabalham a partir de critérios. Buscam dados, testam premissas e preferem acertar a apenas avançar, reduzindo retrabalho e risco.",
    strengths: [
      "Atenção a detalhes relevantes",
      "Rigor analítico e senso de qualidade",
      "Organização e método",
      "Antecipação de riscos",
    ],
    characteristics: [
      "Pergunta antes de assumir",
      "Documenta decisões e processos",
      "Prefere clareza de padrão a improviso",
      "Analisa antes de opinar",
    ],
    motivators: [
      "Padrões e critérios bem definidos",
      "Tempo para analisar com profundidade",
      "Trabalho tecnicamente reconhecido",
      "Ambientes organizados",
    ],
    demotivators: [
      "Decisões sem fundamento",
      "Prazos incompatíveis com qualidade",
      "Ambiguidade de regras",
    ],
    habits: [
      "Confere dados antes de comunicar",
      "Cria checklists e registros",
      "Revisa o próprio trabalho mais de uma vez",
    ],
    communication:
      "Traga dados, critérios e prazos definidos. Evite generalizações e informe mudanças com antecedência.",
    development: [
      "Definir o nível de precisão suficiente para cada decisão",
      "Compartilhar análises parciais em vez de esperar o material perfeito",
      "Tolerar experimentação controlada",
    ],
    attention: [
      "Pode retardar decisões buscando certeza",
      "Tende a ser percebido como crítico ou distante",
      "Risco de perfeccionismo improdutivo",
    ],
    levels: {
      alto: "Opera por critério e evidência; qualidade e conformidade orientam as escolhas.",
      moderado:
        "Busca fundamentação, mas aceita avançar com informação parcial quando há prazo.",
      baixo:
        "Prioriza velocidade e resultado prático em relação ao detalhamento formal.",
    },
  },
};

export const COMBINATION_CONTENT: Record<string, { title: string; text: string }> = {
  DI: {
    title: "Direção com articulação",
    text: "Combina foco em resultado com forte capacidade de mobilizar pessoas. Tende a abrir caminhos novos e engajar rapidamente, precisando cuidar do fechamento e do detalhe.",
  },
  DS: {
    title: "Direção com constância",
    text: "Une senso de urgência e confiabilidade. Decide e sustenta a execução, mas pode viver tensão entre acelerar e preservar o ritmo do grupo.",
  },
  DC: {
    title: "Direção com critério",
    text: "Busca resultado com padrão técnico. Cobra desempenho e qualidade ao mesmo tempo, exigindo atenção ao impacto do rigor sobre as relações.",
  },
  ID: {
    title: "Articulação com iniciativa",
    text: "Influencia e assume a frente. Cria movimento com entusiasmo e coragem, precisando estruturar entregas e sustentar prioridades.",
  },
  IS: {
    title: "Articulação com cuidado",
    text: "Comunica bem e cuida do clima. Constrói ambientes colaborativos e leais, com atenção necessária a conversas difíceis e cobranças.",
  },
  IC: {
    title: "Articulação com método",
    text: "Comunica com clareza e sustenta o discurso em dados. Alterna abertura relacional e exigência técnica, o que pede consistência de expectativa.",
  },
  SD: {
    title: "Constância com firmeza",
    text: "Sustenta o dia a dia e assume direção quando necessário. Confiável e resolutivo, precisa expressar posições mais cedo.",
  },
  SI: {
    title: "Constância com relacionamento",
    text: "Aproxima pessoas e mantém o grupo unido. Excelente sustentação de equipe, com atenção a limites e ao próprio desgaste.",
  },
  SC: {
    title: "Constância com precisão",
    text: "Entrega com estabilidade e qualidade. Perfil de confiança técnica, que pode resistir a mudanças rápidas ou improvisos.",
  },
  CD: {
    title: "Critério com decisão",
    text: "Analisa e decide. Reduz risco sem paralisar, mas pode elevar demais o padrão exigido dos outros.",
  },
  CI: {
    title: "Critério com comunicação",
    text: "Traduz complexidade para pessoas. Bom articulador técnico, precisa evitar excesso de detalhe na comunicação.",
  },
  CS: {
    title: "Critério com estabilidade",
    text: "Trabalha com método e paciência. Garante consistência ao longo do tempo, com atenção à velocidade de resposta.",
  },
};

export const DEVELOPMENT_FRAMEWORK = [
  "Consciência: reconhecer o próprio padrão sem julgamento, identificando situações em que ele ajuda e situações em que atrapalha.",
  "Escolha: ampliar o repertório, praticando deliberadamente comportamentos menos naturais em contextos de baixo risco.",
  "Contrato: alinhar expectativas com líderes, pares e clientes, explicitando o que você precisa para entregar melhor.",
  "Prática: definir de uma a três ações observáveis por ciclo de 30 dias, com um indicador simples de acompanhamento.",
  "Revisão: buscar retorno de pessoas próximas e ajustar o plano com base em evidência, não em impressão.",
];

export const APAS_ATTENTION_NOTE =
  "Pontos de atenção não são defeitos. São o custo natural de uma preferência levada ao extremo, geralmente em situações de pressão, cansaço ou conflito. Observe padrões recorrentes e trate-os como sinal para ajustar o contexto, não como identidade fixa.";
