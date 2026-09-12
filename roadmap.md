# Roadmap — APAS DIAGNÓSTICA

Evolução do projeto APAS DISC Profile para a plataforma **APAS DIAGNÓSTICA** (diagnósticos empresariais, comportamentais e de pessoas). O módulo DISC existente é preservado como instrumento da plataforma.

## Em andamento
- [x] Inspeção concluída (06/09): código atual = DISC completo (`apas.functions.ts`, `public.functions.ts`, rotas `/dashboard`, `/avaliacoes/*`, `/empresas`, `/instrumento`, `/a/$token`), tabelas `assessments/*`, `instruments`, `organizations`, roles `admin|coach`. **Nada do módulo empresarial existe ainda no código nem no banco.**
- [ ] **Localizar as 70 perguntas V3** no histórico da conversa (chat_search: "V3", "L01", "Liderança"). Regra confirmada pelo usuário: L01 é inversa; pesos V3 são 2 e 3; N/A fora do cálculo. Se o texto não estiver acessível, criar estrutura + tela de carga e sinalizar pendência — NÃO inventar perguntas.
- [ ] **Rebrand** para "APAS DIAGNÓSTICA — Plataforma de Diagnósticos Empresariais, Comportamentais e de Pessoas" (AppShell, landing `/`, `/auth`, `__root` lang pt-BR, heads). DISC vira módulo/instrumento.
- [ ] **Banco (migração)**: tabelas normalizadas `diag_instruments` (versões + engine_config), `diag_dimensions`, `diag_questions` (peso 1/2/3, direção direta/inversa, N/A), `participants`, `diag_applications` (token exclusivo, status pending → in_progress → submitted → in_review → validated → released), `diag_application_answers`, `diag_pre_diagnostics`, `diag_reports`, `diag_audit_log`; enum `app_role` + valor `client`; GRANTs + RLS por analista/admin. Seed: instrumento "Diagnóstico Empresarial APAS" V3 com 10 dimensões (Liderança 8, Estratégia 7, Gestão 7, Processos 7, Pessoas 7, Cultura 7, Comunicação 6, Mercado e Clientes 7, Inovação e Adaptabilidade 7, Resultados e Sustentabilidade 7 = 70), 10 perfis de estágio (Namoro 85/20/30/15 … Declínio 15/30/20/15 — Flex/Controle/Integração/Sustentação), indicadores/padrões V1 configuráveis. Regra: estágio "Morte/Declínio crítico" nunca liberado automaticamente — usar "risco crítico de viabilidade organizacional" e exigir validação do analista.
- [ ] **Motor V1** (`src/lib/diagnostica/engine.ts`): respostas → pontuação ponderada por dimensão (direção inversa = 6−valor; N/A excluído) → 4 eixos via matriz configurável → padrões/indicadores por regras configuráveis → afinidade com 10 estágios (40% eixos + 40% padrões + 20% indicadores críticos) → predominante + secundário + zona de transição + confiança (separação top1/top2, coerência, % N/A). Sem média simples das 70. Tudo parametrizado no engine_config (marcado V1 calibrável).
- [ ] **Server functions**: `src/lib/diagnostica.functions.ts` (analista, requireSupabaseAuth) e `src/lib/diagnostica-public.functions.ts` (fluxo público por token via client.server, como public.functions.ts do DISC).
- [ ] **Rotas autenticadas**: `/dashboard` (visão plataforma: DISC + Empresarial), `/instrumentos` (lista os 2 instrumentos), `/instrumentos/empresarial` (editor de dimensões/perguntas/pesos/direção + engine_config), `/participantes` (CRUD), `/aplicacoes` (lista), `/aplicacoes/nova` (instrumento → empresa → participante → token/link com botões e-mail/WhatsApp), `/aplicacoes/$id` (status, respostas, pré-diagnóstico com gráficos de dimensões/eixos/afinidade, validação com notas, liberação, auditoria), `/aplicacoes/$id/relatorio` (relatório premium imprimível, liberado ou pré-visualização do analista).
- [ ] **Rota pública** `/q/$token`: identidade APAS, consentimento LGPD, escala 1–5 + N/A, etapas por dimensão, progresso, retomada local, validação, confirmação sem resultado; estados de token inválido/indisponível/concluído.
- [ ] **AppShell/nav**: rebrand APAS DIAGNÓSTICA; nav Dashboard · Aplicações · DISC · Empresas · Participantes · Instrumentos. Landing `/` atualizada. head() únicos por rota.
- [ ] Verificação: typecheck, screenshots Playwright do fluxo completo.

## Preparado para fases seguintes (não implementar sem pedir)
- Portal do Cliente/Empresa (role `client`) com acesso somente a relatórios liberados.
- PDF premium definitivo, envio por e-mail/WhatsApp, pagamento.
- Importação do texto oficial das 70 perguntas V3 (não inventar como definitivas).
- Comparação candidato × vaga e consolidação por empresa (DISC).

## Decisões a validar com o usuário
- Perguntas seed são texto de trabalho provisório (editáveis em /instrumentos/empresarial), não o V3 oficial.
- Pesos dos eixos por dimensão e regras de padrões/indicadores são parâmetros V1 calibráveis.

## Evolução premium APAS DISC
- [ ] Evoluir relatório DISC individual para versão premium impressa
- [ ] Separar e enriquecer área técnica e guia de devolutiva
- [ ] Validar acesso, fluxo DISC, diagnóstico empresarial, testes e build
