# Integração mínima do novo relatório DISC

## Implementação

1. Decodificar exatamente o conteúdo `gzip+base64` fornecido e criar `src/components/apas/RelatorioDISC.tsx` sem reescrever o componente.
2. Alterar somente `src/routes/_authenticated/avaliacoes.$id.tsx` para:
   - importar e renderizar `RelatorioDISC` no lugar de `DiscPremiumReportFinal`;
   - manter a busca e a normalização atuais do resultado;
   - criar localmente a camada `RelatorioDados` usando os dados reais já disponíveis em `assessment` e `scores`;
   - preencher nome, cargo, data, natural, adaptado, social, índice de adaptação, introdução, números, jeito de agir e páginas sem recalcular o DISC.
3. Atualizar `src/components/apas/disc-premium-visual-contract.test.ts` somente se o contrato atual impedir a validação do novo componente ativo.
4. Não criar `public/relatorios/img/`, pois as 14 imagens aprovadas não estão disponíveis. Os caminhos previstos pelo componente serão preservados e reportados como pendentes.

## Validação

- Confirmar que apenas os arquivos autorizados foram alterados.
- Executar TypeScript, lint/testes relevantes e build.
- Corrigir somente erros causados pela integração, sem mudanças visuais ou refatorações.
- Confirmar que o relatório Técnico, motor DISC, scoring, normalização, interpretação, banco, RLS, autenticação e outras telas permaneceram intactos.
- Não publicar.

## Observação de segurança

O alerta existente de leitura ampla em `diag_dimensions` permanecerá ativo, porque a solicitação proíbe expressamente alterações em banco e RLS. Ele não será modificado nesta integração.
