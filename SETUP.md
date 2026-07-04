# JuriAI — como rodar localmente

App: **Next.js 16.2.9 + React 19 + Prisma 5.22 + Postgres (Cloud SQL)** no projeto GCP `juriai-app`.

## Fluxo local rápido

Use este fluxo para desenvolvimento diário:

```bash
cd "Desktop/JuriAI/app"
npm run dev:3002
```

Se o app precisar conversar com o banco, valide antes a conexão:

```bash
npm run db:check
```

## Quando usar Cloud SQL Proxy

Use o proxy quando o objetivo for reproduzir o ambiente com Cloud SQL ou quando
o `DATABASE_URL` local apontar para o proxy em `127.0.0.1:5432`.

```bash
npm run proxy
```

## Quando aplicar SQL

Use aplicação manual de SQL apenas quando precisar sincronizar o banco local ou
um ambiente de teste com um patch específico.

```bash
npm run db:apply prisma/patches/<arquivo>.sql
```

Esse comando é manual por design. Ele não roda no `dev`.

## Rodar (2 terminais)

**Terminal 1 — conexão segura com o banco (Cloud SQL Proxy):**

```bash
cd "Desktop/JuriAI/app"
npm run proxy        # mantém rodando; escuta em 127.0.0.1:5432
```

**Terminal 2 — o app:**

```bash
cd "Desktop/JuriAI/app"
npm run dev          # http://localhost:3000 (ou 3001 se a 3000 estiver ocupada)
```

Para fixar a porta 3002:

```bash
npm run dev:3002     # http://localhost:3002
```

Abra a URL que o Next imprimir. Você verá o dashboard "Meus casos" → "Novo caso" abre o wizard.

## Pré-requisitos (já feitos)

- gcloud logado (`giulliano@usefunnels.io`) com ADC configurado
- `.env` na pasta `app/` com `DATABASE_URL` (não commitar — está no `.gitignore`)
- Banco já criado e com tabelas aplicadas

## Sessão

Em produção, configure um segredo exclusivo com pelo menos 32 caracteres:

```bash
JURIAI_SESSION_SECRET="..."
```

Sem essa variável, tokens de sessão não são emitidos nem aceitos fora de
`development`. O ambiente local usa um segredo fixo exclusivo de desenvolvimento.

## Comandos úteis

- `npm run db:init` — (re)cria as tabelas a partir de `prisma/init.sql` (precisa do proxy rodando)
- `npx prisma studio` — UI visual pra ver/editar os dados

## IA / análise de caso

O provider padrão do app é **Claude no Vertex/GCP** quando as credenciais locais do Google existem. Se preferir fallback direto da Anthropic, configure:

```bash
ANTHROPIC_API_KEY="..."
```

Para o Vertex, deixe o ADC do `gcloud` ativo e ajuste a região se necessário:

```bash
CLOUD_ML_REGION="us-central1"
GOOGLE_CLOUD_PROJECT="juriai-app"
```

Se nenhum provider estiver configurado, o botão de análise fica desabilitado.

Para habilitar configuração de modelo por workspace e auditoria obrigatória das
saídas de IA no banco atual:

```bash
psql "$DATABASE_URL" -f prisma/patches/2026-06-25_llm_workspace.sql
psql "$DATABASE_URL" -f prisma/patches/2026-06-26_audit_entry.sql
```

## DataJud / consulta processual

Configure a chave pública vigente do CNJ no `.env`:

```bash
DATAJUD_API_KEY="cole-a-chave-publica-vigente-do-datajud"
```

Consulta local:

```bash
curl -X POST http://localhost:3000/api/processos/consulta \
  -H "Content-Type: application/json" \
  -d '{"tribunal":"TJSP","numeroProcesso":"100XXXX-XX.2024.8.26.0000"}'
```

A rota aceita siglas como `TJSP`, `TJRJ`, `TRF1`, `TRT2`, `STJ`, `TST`.
O retorno deve ser usado como metadado oficial inicial, ainda sujeito a validação
nos autos antes de cálculo de prazo ou redação de peça.

Para habilitar a persistência sem recriar o banco, aplique o patch incremental:

```bash
psql "$DATABASE_URL" -f prisma/patches/2026-06-25_datajud.sql
```

Se preferir recriar tudo em ambiente descartável, `npm run db:init` também já
inclui as tabelas `CourtProcess` e `CourtProcessSnapshot`.

## Admin / Stripe

Configure as chaves no `.env` local:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

Como a chave secreta tem acesso amplo ao ambiente de teste Stripe, não commitar e
trocar a chave se ela for exposta fora do ambiente local.

Para habilitar escritórios, usuários, planos e assinaturas locais no banco atual:

```bash
psql "$DATABASE_URL" -f prisma/patches/2026-06-25_admin_billing.sql
psql "$DATABASE_URL" -f prisma/patches/2026-06-30_workspace_onboarding.sql
```

Rotas:

- `/admin` — visão geral do painel.
- `/admin/subcontas` — área de escritórios e usuários.
- `/admin/planos` — cria plano local e, se `STRIPE_SECRET_KEY` existir, cria
  Product + Price mensal/anual no Stripe.

## Notas

- O **schema** vive em `prisma/schema.prisma` (fonte da verdade). O `prisma/init.sql`
  é um espelho dele aplicado via `pg`, porque o schema-engine do Prisma trava em
  alguns ambientes. Ao mudar o schema, atualize os dois (ou rode `prisma db push`
  se funcionar no seu terminal).
- O app resolve workspace e usuário por `JURIAI_*` env vars em
  `app/lib/actor-context.ts`. Defaults locais:
  `JURIAI_WORKSPACE_ID=dev-workspace`, `JURIAI_ACTOR_ID=dev-user`,
  `JURIAI_WORKSPACE_ROLE=WORKSPACE_ADMIN`,
  `JURIAI_MEMBERSHIP_ROLE=OWNER`.
- Uploads ficam em `JURIAI_UPLOAD_DIR` quando definido; sem isso, o app usa o
  diretório temporário do sistema.
- Identity Platform ainda não está plugado. Esta camada de contexto é a ponte
  para trocar o hardcode sem espalhar a lógica pelo app.
