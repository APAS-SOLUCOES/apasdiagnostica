# APAS DISC Profile

Este é um PROJETO NOVO e independente da APAS Soluções. Quero criar uma plataforma própria para avaliações comportamentais DISC, inspirada funcionalmente no relatório premium de referência anexado, mas com identidade, textos, design e conteúdo autorais da APAS. Não copiar marca, textos ou layout proprietário da Human Solutions.

Objetivo: vender avaliações para pessoas e empresas. O Coach/APAS cria uma avaliação, o sistema gera um link único para cada coachee, o coachee responde online, o sistema calcula automaticamente o resultado e gera um PDF premium. O coachee poderá acessar/baixar seu próprio relatório; o Coach terá acesso às respostas, cálculos e PDF final.

Criar uma primeira versão completa com:
- dashboard administrativo do Coach;
- criação de avaliação com nome/e-mail/WhatsApp e contexto;
- token/link único por avaliação;
- fluxo público mobile-first para responder o questionário;
- consentimento e privacidade/LGPD;
- salvamento seguro das respostas;
- motor configurável de pontuação D, I, S e C;
- cálculo automático de perfil predominante e combinações;
- gráficos dos resultados;
- geração de PDF original da APAS;
- área do avaliado para acessar seu resultado;
- painel do Coach com status, respostas brutas, pontuações e PDF;
- arquitetura preparada para empresas com múltiplos avaliados e relatórios consolidados;
- futura integração com pagamento, WhatsApp e e-mail;
- identidade APAS: preto, cinza escuro, vermelho e branco, premium e profissional;
- autenticação administrativa e controle de acesso.

O PDF de referência tem 30 páginas e serve somente para entender o nível de profundidade e a estrutura funcional. Ele apresenta introdução, fundamentação do DISC, Perfil Natural, Perfil Social, Perfil Adaptado, Perfil/Estilo Predominante, resumo do estilo, características, motivadores, hábitos, níveis D/I/S/C, desenvolvimento através do DISC e pontos de atenção. Use essa estrutura como referência de escopo, criando conteúdo inteiramente original da APAS.

IMPORTANTE: o instrumento de perguntas e a regra de pontuação precisam ficar configuráveis para validação antes de uso comercial. Não apresentar o DISC como diagnóstico clínico ou de personalidade. Construir a aplicação de forma que possamos posteriormente revisar e calibrar o questionário e as fórmulas sem refazer o sistema.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://apasdiagnostica.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ccea2f55-1a6b-412e-a83c-42094122042d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
