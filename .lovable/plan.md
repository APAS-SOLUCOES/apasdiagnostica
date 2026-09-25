# Plano técnico — sincronização controlada com o commit `1362d67b`

## Estado confirmado

A comparação foi feita contra a árvore completa do commit `1362d67b382446a1421a7b1b4ee2c353fc73c7c0`, sem modificar o projeto.

O commit final contém a linha editorial já consolidada e os três binários reparados. Os três assets reparados já estão no Lovable e não serão substituídos novamente.

## 1. Código a trazer ou alinhar com o GitHub

### Relatório e identidade DISC
- `src/components/apas/AppShell.tsx`
  - Alinhar somente o uso da logo oficial no cabeçalho.
- `src/components/apas/DiscPremiumReport.tsx`
  - Aplicar a composição oficial do relatório individual e os imports diretos dos assets existentes.
  - Preservar as 12 páginas, dados dinâmicos e página 12 sem nova imagem editorial.
- `src/components/apas/DiscTechnicalReport.tsx`
  - Alinhar logos, identificação, atributo de página e composição oficial das 8 páginas.
- `src/disc-premium-report-print.css`
  - Alinhar as regras oficiais do relatório, mantendo a correção de paginação isolada neste arquivo.
- `src/styles.css`
  - Mesclar exclusivamente as diferenças oficiais necessárias à marca e à capa; não substituir o arquivo inteiro nem remover correções locais do relatório técnico.

### Conteúdo adaptativo oficial
- `src/lib/disc/interpretation.ts` — adicionar o gerador consolidado de interpretação dinâmica presente no GitHub.
- `src/lib/disc/interpretation.test.ts` — adicionar os testes oficiais correspondentes.
- `src/lib/disc/scoring.ts` — trazer somente os campos técnicos exigidos pela interpretação oficial (`completionPercent` e `invalidAnswerCount`) e sua validação de entrada, sem alterar pesos, fórmulas, combinações ou resultado DISC 1.2.
- `src/lib/disc/adaptive-content.ts` — manter o conteúdo oficial, preservando apenas as proteções locais de tipagem estrita necessárias para compilar; elas não mudam o conteúdo calculado.

### Arquivos auxiliares presentes apenas no GitHub
- `src/components/apas/disc-report-visual.css`
- `src/index.ts`

Antes de adicioná-los, confirmar se participam da cadeia real de imports. Se estiverem órfãos no commit, não serão conectados artificialmente nem usados para substituir a implementação ativa.

## 2. Arquivos do Lovable que não devem ser tocados

### Assets já corrigidos
Não substituir, recomprimir ou editar:
- `src/assets/apas-logo-official.webp`
- `src/assets/apas-logo-light.webp`
- `src/assets/disc-approved-attention-leaf.jpg`
- Demais imagens e ponteiros já armazenados em `src/assets/`

### Banco e Diagnóstico Empresarial
Não alterar:
- `drizzle/migrations/**`
- `src/components/apas/DiagnosticPremiumReport.tsx` — manter a correção local `bullets ?? []`, necessária ao TypeScript estrito.
- Instrumento empresarial de 70 perguntas, pesos, L01 inversa, escala 1–5/N/A, fases, eixos, Motor V1 e relatório empresarial.
- Schema, tabelas, dados, políticas e permissões remotas.

### Autenticação e integrações geradas
Não substituir:
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/auth-middleware.ts`
- Demais arquivos gerados da integração.
- `src/start.ts`, autenticação, regras de segurança e segredos.

### Configuração local necessária
Preservar:
- `vite.config.ts` sem `base: "/apasdiagnostica/"`, para o domínio funcionar na raiz `/`.
- Versões atuais compatíveis de `package.json` e `bun.lock`; não rebaixar a configuração Lovable.
- `src/routes/__root.tsx` e `public/favicon.png`, salvo se uma diferença funcional comprovada exigir ajuste — atualmente não exige.
- Todas as rotas existentes; nenhuma rota será criada, removida ou renomeada.

## 3. Estratégia de atualização sem reconstrução ou redesign

1. Usar o commit como fonte por arquivo, nunca como substituição integral do repositório.
2. Aplicar apenas os trechos do relatório e da interpretação listados acima.
3. Manter imports apontando para os assets locais já validados; nenhum novo asset será gerado.
4. Preservar correções locais obrigatórias de TypeScript, autenticação, domínio raiz e paginação comprovada.
5. Não tocar em textos, perguntas, pesos, combinações ou design fora das diferenças já existentes no commit.
6. Revisar o diff final e rejeitar qualquer mudança em banco, migrations, rotas, autenticação ou Diagnóstico Empresarial.

## 4. Preservação de banco, autenticação e integrações

- Não executar migrations nem comandos de escrita no banco.
- Não substituir clientes ou middlewares gerados.
- Não alterar variáveis, chaves, provedores, sessões, políticas ou permissões.
- Não modificar funções ou rotas públicas/autenticadas, pois a sincronização identificada é de apresentação e interpretação DISC.
- Confirmar no diff final que nenhum arquivo dessas áreas foi alterado.

## 5. Validação de equivalência

- Comparar novamente os arquivos-alvo com o commit e documentar somente as diferenças locais deliberadamente preservadas.
- Executar TypeScript completo.
- Executar todos os testes atuais e os testes oficiais de interpretação adicionados.
- Executar o build completo.
- Abrir uma avaliação autenticada real no preview.
- Confirmar relatório individual com exatamente 12 páginas A4 verticais e relatório técnico com exatamente 8 páginas.
- Gerar os dois PDFs e conferir quantidade e dimensão das páginas, imagens, logos e ausência de página extra.
- Conferir dados dinâmicos em mais de um perfil/combinação quando houver avaliações disponíveis.
- Verificar que a página 12 não recebeu imagem editorial adicional.
- Confirmar que os três assets preservados carregam no preview.
- Revisar o diff final para garantir ausência de alterações no Diagnóstico Empresarial, banco, migrations, rotas, autenticação e integrações.

## Resultado esperado

O Lovable reproduzirá a implementação funcional do commit `1362d67b`, com as adaptações estritamente necessárias ao ambiente atual já identificadas: assets reparados preservados, domínio na raiz, integração gerada atual, correções de tipagem e paginação validada. Nenhuma publicação será feita sem autorização posterior.
