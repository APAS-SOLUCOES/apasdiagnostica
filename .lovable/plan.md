# Ajuste exclusivo da impressão A4 do relatório DISC

## Alteração
- Consolidar as regras de impressão do relatório ativo de 12 páginas no CSS já carregado por ele.
- Fixar cada quadro de impressão em 210 × 297 mm, sem margens, espaçamentos ou overflow.
- Neutralizar a escala responsiva da tela e aplicar somente na impressão a conversão fixa do canvas 924 × 1307 px para A4.
- Forçar uma folha por página lógica e remover a quebra após a última.
- Preservar blocos internos contra fragmentação e manter cores, fundos, cabeçalhos e rodapés dentro da folha.
- Ocultar apenas a interface externa durante a impressão.

## Limites
- Nenhum componente, texto, dado, cálculo, cor ou estilo de tela será alterado.
- Nenhum outro relatório será modificado.
- Não haverá publicação.

## Validação
- Conferir compilação e testes relevantes.
- Gerar PDF A4 pela prévia autenticada e confirmar 12 folhas, dimensões, preenchimento e ausência de folha extra.
