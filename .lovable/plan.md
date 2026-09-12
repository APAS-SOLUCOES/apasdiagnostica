# Evolução premium do APAS DISC

## Objetivo
Transformar o relatório DISC existente em um documento individual premium, preservando integralmente o cálculo atual, o fluxo público e todo o Diagnóstico Empresarial APAS V3.

## Implementação
- Reestruturar a página protegida da avaliação em duas áreas claramente separadas:
  - relatório individual, sem respostas brutas e preparado para impressão/PDF;
  - área técnica do especialista, visível apenas no sistema autenticado e excluída da impressão.
- Criar o relatório individual em aproximadamente 12 páginas: capa executiva, fundamentos e limites, resumo, perfis Natural/Adaptado/Social, índice de adaptação, gráfico e tabela com a mesma fonte de dados, leitura dos quatro fatores, combinação, comunicação/liderança/decisão/equipe/pressão/mudanças, desenvolvimento, plano de 30 dias e conclusão.
- Usar linguagem autoral APAS, probabilística e não diagnóstica, incluindo somente a referência conceitual solicitada a William Moulton Marston e *Emotions of Normal People* (1928).
- Enriquecer a área técnica com metadados da aplicação, dados de cálculo, alertas de qualidade, respostas brutas e guia de devolutiva para o analista.
- Criar estilos específicos de impressão com capa, quebras, cabeçalho/rodapé e numeração; ocultar navegação, botões, links e controles administrativos no PDF.
- Manter o acesso pelas rotas autenticadas e as políticas existentes; não criar link público para o relatório técnico ou individual.

## Verificação
- Conferir que gráfico e tabela usam exatamente os percentuais do mesmo resultado salvo.
- Validar visualmente o detalhe técnico e a prévia impressa em desktop e mobile.
- Confirmar bloqueio anônimo da avaliação e ausência de respostas brutas no relatório impresso.
- Executar checagem de tipos, testes existentes e build de produção.
- Verificar que o fluxo e relatório empresarial permanecem intactos.

## Restrições preservadas
Nenhuma alteração nas 70 perguntas V3, pesos, L01 inversa, escala/N/A, fases, eixos, Motor V1, migrations, RLS, fluxo `/q/$token`, cálculo DISC ou instrumento DISC atual.
