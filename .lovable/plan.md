# Diagnóstico da publicação APAS DISC

## Resultado verificado
- A cópia local está no commit `e9395a120e1a725c62cb7286f34c2d7b067d3c50`; a prévia anuncia a revisão `e9395a12` no cabeçalho HTTP.
- `apasdiagnostica.online` está ativo, público, é o domínio principal e tem o registro de DNS correto. O endereço `apas-disc-profile.lovable.app` redireciona para ele.
- O domínio público entrega uma implantação identificada pelo cabeçalho `x-deployment-id` iniciado por `psr2.931a353f-5528-4d51-a094-f367a2e82064`; a resposta pública não informa o SHA do commit. Os arquivos JavaScript públicos são diferentes dos da prévia, inclusive o arquivo da página de avaliação. Isso comprova artefatos distintos, mas **não permite identificar com segurança o commit exato publicado** nem provar apenas pelo cabeçalho que seja uma revisão anterior: compilações diferentes podem gerar arquivos diferentes.
- Ambos os arquivos da página de avaliação incluem os marcadores do relatório Premium de 12 páginas e o donut. Portanto, a diferença relatada pelo usuário precisa ser rastreada até o artefato/implantação correspondente, não atribuída automaticamente à falta do modelo aprovado no pacote público.

## Ação manual exata, sem alterar o projeto
Abrir um chamado em [Lovable Support](https://lovable.dev/support) informando o projeto **APAS DISC Profile**, o domínio `apasdiagnostica.online`, a revisão desejada `e9395a120e1a725c62cb7286f34c2d7b067d3c50`, o identificador público de implantação iniciado por `psr2.931a353f-5528-4d51-a094-f367a2e82064` e que **Publish** já mostra “Seu site está atualizado” após nova tentativa, mas o conteúdo público diverge da prévia. Solicitar que a equipe confira o mapeamento implantação → commit e associe/republique **o artefato existente da revisão e9395a1**, sem alterar código, relatório ou imagens. Não repetir publicação às cegas nem mexer no DNS.

## Créditos e limite da verificação
Abrir o chamado e esta inspeção não acionam build nem publicação. A documentação informa que publicar pelo diálogo do editor não consome créditos de build; publicar por solicitação no chat pode consumir créditos. O custo de uma intervenção interna de suporte ou de eventual nova compilação não está documentado; pedir confirmação de custo antes de autorizar qualquer ação. Nenhuma correção será executada nesta etapa.
