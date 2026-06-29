# JuriAI App

Plataforma jurídica anti-alucinação para escritórios de advocacia.
Next.js 16.2.9 + React 19 + Tailwind v4 (pt-BR).

## O que existe hoje

Protótipo de UI organizado em route groups sob `app/`:

- **`(marketing)`** — site público (blog, materiais).
- **`(app)`** — workspace do escritório: visão geral, clientes, casos, documentos,
  evidências, tarefas, membros, assistente, configurações.
- **`(admin)`** — painel da plataforma (escritórios, usuários, planos, auditoria).
- Rotas avulsas: landing (`/`), `/login`, `/onboarding`.

As telas rodam com **dados mockados + `sessionStorage`** (fixtures em arquivos `_data.ts`
colocados por rota). A camada de banco (Prisma + Postgres no Cloud SQL) está provisionada
via `.env`, mas ainda **não está conectada às páginas**.

## Rodar localmente

```bash
npm install
npm run dev          # http://localhost:3000
```

Banco de dados (opcional, ainda não usado pelas telas):

```bash
npm run proxy        # cloud-sql-proxy na :5432
npm run db:check     # testa a conexão via DATABASE_URL
```

Variáveis em `.env` (não commitado): `DATABASE_URL`, `CLOUD_SQL_CONNECTION_NAME`,
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`.

## Stack

- Next.js 16.2.9 (App Router)
- React 19
- Tailwind v4 + design tokens em `app/globals.css`
- TypeScript (strict)
- PostgreSQL no Cloud SQL (provisionado, não plugado)

## Documentação de design

`DESIGN.md`, `DESIGN-10X.md`, `DESIGN-TOOLS.md`, `BRAND.md`, `PRODUCT.md`, `BENCHMARK.md`
na raiz são a fonte da verdade para UI e produto.
