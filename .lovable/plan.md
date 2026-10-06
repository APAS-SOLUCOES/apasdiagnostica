# Correção exclusiva da capa na impressão

## Alteração
- Ajustar somente o primeiro quadro do relatório (`.disc-print-frame:first-child`) dentro de `@media print`.
- Fixar a capa e sua seção interna em 210 × 297 mm, sem margem superior, sem altura mínima herdada e com overflow oculto.
- Neutralizar apenas na capa impressa margens, espaçamentos e alturas herdadas que possam deslocá-la.
- Manter o fundo cobrindo toda a folha e compactar somente os intervalos verticais da capa se necessário para preservar os quatro cards.
- Preservar a quebra após a capa e impedir sua fragmentação.

## Limites
- Alterar apenas `src/disc-premium-report-print.css`.
- Não mudar conteúdo, dados, cores, componentes, tela, páginas 2–12 ou Relatório Técnico.
- Não publicar.

## Validação
- Conferir compilação e testes relevantes.
- Gerar PDF A4 pela prévia autenticada e confirmar exatamente 12 folhas, com a capa inteira na folha 1 e os quatro cards visíveis.
