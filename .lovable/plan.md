# Etapa 0 — Auditoria e plano: textos DISC gerados pelos percentuais

Nenhum arquivo foi alterado. Este plano só será executado após aprovação.

## 1. Como o texto é escolhido hoje

```text
respostas -> scoring.ts (calcula) -> ScoreResult
          -> adaptive-content.ts: getAdaptiveNarrative(scores)
               base = COMBINATION_NARRATIVES[scores.combination]   <- CHAVE POR PERFIL
               (report-content.ts: 12 textos fixos DI, DS, DC, ID ... CS)
               + poucos trechos dinâmicos: intensityBand (6 faixas do 1º fator),
                 combinationImpact/IMPACT_IDENTITIES (nome do arquétipo)
          -> report-narrative-presentation.ts
               getPremiumReportNarrative   -> substituições premium-*.json
               getTechnicalReportNarrative -> substituições technical-*.json
               writeFactorNames (factor-prose.ts) escreve fatores por extenso
          -> Premium: rota avaliacoes.$id.tsx monta RelatorioDados.paginas -> RelatorioDISC.tsx
          -> Técnico: DiscTechnicalReport.tsx (+ technical-voice.ts)
```

- Seções fixas por combinação: essência, melhores contribuições, excessos, percepção, comunicação, decisão, liderança, equipe, pressão, mudança, experimentos.
- Só consideram o 1º fator (6 faixas) e o 2º fator. Os demais fatores, o ponto cego, as diferenças entre Natural, Adaptado e Social e mudanças de liderança entre planos não alteram o texto.
- Por isso, duas pessoas DI com 31% e 48% recebem praticamente o mesmo texto. Só mudam algumas palavras de intensidade.
- `RelatorioDISC.tsx` apenas exibe o texto. Quem escolhe é a rota. O Técnico usa o mesmo motor, mas suas substituições são separadas.

## 2. Dados já disponíveis por pessoa (`ScoreResult`)

| Dado | Formato |
|---|---|
| natural / adapted / social | `percent` {D,I,S,C} com 1 casa decimal, soma 100; `order` do maior ao menor; `raw` |
| predominant / secondary / combination | letras, ex. "D", "I", "DI" (ordem do plano Adaptado/evidência) |
| primaryGap, closeCombination | distância 1º−2º; flag de proximidade (≤3) |
| levels | alto/moderado/baixo por fator |
| adaptationIndex | número (soma das diferenças Natural×Social ÷ 2) |
| adaptationAlert | true quando ≥ 18 |
| evidence, counts, net | dados de auditoria |

Todas as variáveis pedidas podem ser derivadas desses dados. Não é preciso alterar o cálculo.

## 3. Variáveis derivadas (função nova, só leitura)

Será criado `buildProfileSignals(scores)`, que não altera nenhum número. Os valores serão arredondados para inteiro apenas para classificar, por exemplo 10,4 → 10.

- a) Nível por fator e plano (8 faixas): ≤10 quase ausente | 11–15 discreta | 16–20 moderada-baixa | 21–25 equilibrada | 26–30 presente | 31–36 marcante | 37–44 muito marcante | >44 dominante. Os adjetivos ficam ajustáveis por você.
- b) Ordem dos 4 fatores por plano (usa `order`).
- c) Distância 1º−2º: 0–2 disputa de direção | 3–6 leve predominância | 7–12 predominância clara | 13+ muito marcante.
- d) Distância 2º−3º, usando as mesmas faixas, para classificar o perfil:
  - um fator forte: 1º−2º ≥7;
  - três fatores fortes: 2º−3º ≤2;
  - caso contrário, dois fatores fortes.
- e) Ponto cego: fator mais baixo do plano Adaptado e seu nível.
- f) Por fator, Natural→Adaptado e Natural→Social: sobe, desce ou estável (|Δ|<3), com tamanho leve (3–6), claro (7–12) ou forte (13+).
- g) Índice de adaptação em 4 faixas, com o fator que mais se desloca. **Faixas a confirmar:** 0–7 baixo | 8–17 moderado | 18–29 alto (o limite 18 já existe) | 30+ muito alto.
- h) Mudança do 1º fator entre planos: gera um parágrafo próprio, por exemplo "no Natural lidera Estabilidade; no Social, Dominância".

## 4. Estrutura modular dos textos

Os textos passam a ser organizados por fator e nível, e não por combinação. Haverá arquivos separados para Premium (2ª pessoa, acolhedor) e Técnico (3ª pessoa, para o líder: delegar, cobrar, feedback, risco, o que observar em 30 dias).

- Fator × nível × seção: 4 fatores × 8 níveis × 7 seções (comportamento, comunicação, decisão/liderança, pressão, mudança, equipe, desenvolvimento).
- Relação 1º→2º com ordem orientada: 12 pares, em que DI ≠ ID, e cada par terá redação por faixa de distância (c).
- Ponto cego: 4 fatores × níveis baixos.
- Diferença entre planos: fator × direção × tamanho, mais o parágrafo de troca de liderança (h).
- Índice de adaptação: 4 faixas, com o fator que mais se desloca inserido.
- Cada trecho terá pelo menos 4 variações. A escolha será determinística: hash(ID da avaliação + chave do trecho) mod n. A mesma avaliação sempre mostra o mesmo texto, e pessoas diferentes recebem redações diferentes.
- Os fatores serão escritos sempre por extenso (Dominância, Influência, Estabilidade, Conformidade). Nenhum percentual aparece fora da página 3. Continua valendo o filtro `writeFactorNames`.
- Os nomes de arquétipo (`adaptive.title`) continuam iguais.
- Volume estimado: cerca de 1.500 trechos por relatório. Os textos serão escritos em lotes: primeiro D e I, depois S e C, depois pares, planos e índice. Cada lote será entregue para sua aprovação.

## 5. Arquivos

**Novos**
- `src/lib/disc/profile-signals.ts`: variáveis (a)–(h).
- `src/lib/disc/narrative-composer.ts`: monta um `CombinationNarrative` a partir dos sinais e dos trechos, com a mesma forma que os relatórios já consomem.
- `src/lib/disc/text-variant.ts`: escolha determinística.
- `premium-modular-text.json` e `technical-modular-text.json`: biblioteca de trechos.
- Testes: `profile-signals.test.ts`, `narrative-composer.test.ts`.

**Alterados (mínimo)**
- `report-narrative-presentation.ts`: as duas funções passam a receber o ID da avaliação e a usar o compositor. As substituições e `writeFactorNames` continuam no fim.
- `avaliacoes.$id.tsx` e `DiscTechnicalReport.tsx`: passam o ID da avaliação. O layout não muda.

**Não tocados:** `scoring.ts`, `normalize-result.ts`, `instrument.ts`, banco, permissões, CSS e impressão, `RelatorioDISC.tsx`, `DiscPremiumReportFinal.tsx`, nomes de arquétipo.

**Riscos**
- Motor: nenhum, porque só há leitura do resultado.
- Impressão: textos maiores podem estourar as 12 e 10 páginas. Cada seção terá um limite de caracteres próximo ao atual, verificado por teste.
- Repetição de nome no Técnico: `technical-voice.ts` continua aplicando a regra.

**Migração sem quebrar relatórios já gerados**
- Os relatórios são montados na hora a partir dos scores salvos. Não existe texto armazenado, então todas as avaliações antigas passam a usar o novo texto ao abrir.
- O resultado antigo com "EU" continua normalizado para I.
- Haverá uma chave de transição no código para voltar ao texto por combinação se algo falhar.
- Os 12 textos atuais continuam no código como reserva até a sua aprovação final.
- Se preferir que avaliações antigas mantenham o texto atual, dá para limitar pela data. Confirme essa opção.

## 6. Teste obrigatório

- Script com perfis simulados (scores sintéticos válidos, sem gravar no banco):
  - DI, CD, SI, DC e IS, cada um com dois percentuais diferentes, por exemplo DI 31/27 e DI 48/22;
  - o par DI × ID com valores espelhados;
  - um perfil com os quatro fatores entre 24 e 26;
  - um índice de adaptação muito alto (≥30) e um muito baixo (≤5).
- Gera um documento lado a lado (pessoa A × pessoa B; Premium × Técnico) por seção e mede a diferença de texto entre os perfis de mesmo tipo.
- Testes automáticos:
  - limites de cada faixa;
  - mesma avaliação = mesmo texto;
  - perfis do mesmo tipo com percentuais diferentes produzem textos diferentes;
  - nenhuma letra isolada de fator e nenhum percentual fora da página 3;
  - variações mínimas presentes.
- Gera os PDFs dos casos para conferir 12 páginas A4 no Premium e 10 no Técnico, além de uma avaliação real autenticada.

## Decisões para você confirmar
1. As 4 faixas do índice de adaptação (proposta no item 3g).
2. Os adjetivos das 8 faixas.
3. Se as avaliações antigas também recebem o novo texto (proposta: sim).
4. A escrita em lotes com aprovação a cada lote.

Nada será publicado sem a sua autorização.
