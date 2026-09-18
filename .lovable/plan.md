# Rodada visual e técnica do APAS DISC 1.2

## Objetivo
Elevar o relatório do avaliado ao padrão editorial premium já aprovado, criar um relatório técnico próprio para o analista e incluir a orientação inicial do questionário, sem alterar motor, perguntas, scoring, resultados, cores DISC ou o Diagnóstico Empresarial V3.

## Implementação
- Preservar as 12 páginas e todo o texto aprovado do relatório do avaliado, enriquecendo cada página com composição editorial própria, alternância clara/escura, imagens e ilustrações temáticas, geometria e ícones discretos da identidade APAS.
- Manter a página de perfis integrada ao mesmo projeto visual, com o gráfico DISC principal e três comparações visuais Natural/Adaptado/Social usando exatamente os percentuais e cores existentes.
- Padronizar a assinatura APAS em todas as páginas com o padrão tipográfico atual, deixando o ponto de substituição preparado para a logo oficial.
- Transformar o painel técnico em um documento A4 multipágina separado, imprimível e protegido, com resumo, perfis, intensidade, adaptação, combinação, leituras contextuais, pontos a validar, roteiro de devolutiva, recomendações e plano de acompanhamento — sem respostas, perguntas, fórmulas, pesos ou algoritmo.
- Adicionar na área autenticada uma ação clara para imprimir o relatório técnico separadamente do relatório do avaliado.
- Inserir uma única orientação visual no início do questionário público, antes do primeiro bloco, sem alterar as 24 perguntas nem o fluxo MAIS/MENOS.
- Ajustar estilos de impressão para A4 real, margens seguras, quebras previsíveis e ocultação completa da interface.

## Verificação
- Validar TypeScript, testes existentes e build.
- Conferir as rotas autenticadas do relatório do avaliado e do documento técnico, incluindo bloqueio anônimo.
- Gerar e inspecionar visualmente os PDFs: 12 páginas A4 do avaliado e documento técnico A4 multipágina, sem cortes ou controles.
- Confirmar que os valores dos gráficos vêm dos resultados salvos e que nenhum arquivo do motor DISC 1.2 ou do Diagnóstico Empresarial foi modificado.
- Se não houver avaliação real disponível, registrar com precisão quais verificações ficaram limitadas.

## Restrições preservadas
Nenhuma alteração em perguntas, scoring, pesos, resultados ou cores D/I/S/C do DISC 1.2; nenhuma alteração nas 70 perguntas, pesos, L01 inversa, escala/N/A, fases, eixos, Motor V1, banco, RLS ou fluxo do Diagnóstico Empresarial.
