# GFP — Portal Web

Portal web do **GFP (Gerente Financeiro e Patrimonial)**. Interface de gestão
financeira pessoal: dashboard, movimentações, planejamento, faturas, contas,
dívidas, metas, programas de fidelidade, notificações e configurações.

## Estado atual

- **Tecnologia:** HTML/CSS/JavaScript **vanilla** (sem build, sem framework).
  Cada página em `public/` é autocontida; `shared-layout.css` e
  `shared-layout.js` fornecem sidebar, topbar, tema e o wrapper de autenticação.
- **Origem:** este repositório é uma **cópia versionada** do portal que hoje
  vive dentro do backend `node-zero` (pasta `public/`). A separação nesta fase é
  **apenas organizacional** — o portal continua sendo **servido pelo backend
  `node-zero`, no mesmo domínio**, em produção. Nada no backend foi alterado.

## Como o portal conversa com a API (importante)

As páginas chamam a API por **URLs relativas same-origin** (ex.: `fetch('/contas')`,
`fetch('/dashboard?...')`). O `shared-layout.js` injeta automaticamente o
`Authorization: Bearer <token>` (JWT do `localStorage`) **apenas em chamadas
same-origin** e redireciona para `/login` em respostas `401`.

Consequência: hoje o portal **depende de ser servido no mesmo domínio da API**.
Hospedá-lo em um domínio separado exigirá as mudanças descritas abaixo.

## Estrutura

```
gfp-portal/
└─ public/
   ├─ login.html                 # autenticação (fetch /auth/login, /auth/register)
   ├─ dashboard.html             # visão consolidada mensal
   ├─ planejamento.html          # orçamento anual/mensal
   ├─ lancamentos.html           # movimentações
   ├─ faturas.html               # compromissos financeiros (cartões)
   ├─ evolucao.html              # simulações
   ├─ contas.html                # contas bancárias
   ├─ dividas.html               # dívidas
   ├─ metas.html                 # metas
   ├─ programas-fidelidade.html  # milhas/pontos/cashback
   ├─ notificacoes.html          # notificações capturadas
   ├─ index.html                 # configurações (cartões, categorias, formas pgto)
   ├─ shared-layout.css          # estilos globais + tema claro/escuro
   └─ shared-layout.js           # sidebar, topbar, tema e fetch autenticado
```

## Executar localmente (desenvolvimento)

Nesta fase, o portal é servido pelo backend `node-zero` (Fastify + `@fastify/static`).
Para rodar o conjunto, suba o backend (`node-zero`): ele serve as páginas e a API
no mesmo domínio (`http://localhost:3333`). Este repositório guarda o código-fonte
do portal de forma versionada e independente, mas o deploy, por ora, é conjunto.

## Passos para hospedar o portal SEPARADO da API (fase futura)

Quando o portal for servido em um domínio próprio (ex.: host estático), será
necessário:

1. Introduzir uma `API_BASE_URL` configurável e trocar as chamadas relativas
   (`fetch('/x')`) por `fetch(API_BASE_URL + '/x')`.
2. Ajustar o wrapper de `fetch` em `shared-layout.js` para injetar o JWT nas
   chamadas ao **domínio da API** (hoje a condição é "same-origin").
3. Habilitar **CORS** no backend (`@fastify/cors`) permitindo a origem do portal.
4. Decidir se o backend deixa de servir `public/` (removendo as rotas de página
   e a allowlist correspondente em `auth-hook.js`).

> Enquanto esses passos não forem feitos, **não** hospede o portal em um domínio
> diferente da API: as chamadas relativas quebrariam.

## Relação com os outros componentes do GFP

- **Backend/API:** repositório `node-zero` (Node.js + Fastify + PostgreSQL).
- **App Android:** repositório próprio do coletor (Kotlin), fala direto com a API.
- **Portal Web:** este repositório.
