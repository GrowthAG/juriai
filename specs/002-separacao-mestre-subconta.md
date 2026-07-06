---
spec_id: 002
titulo: Separação mestre × subconta (control plane × data plane)
status: em-construcao
autor: arquiteto (juriai-dev)
criada_em: 2026-06-26
---

# Spec 002 — Separação mestre × subconta (control plane × data plane)

## Problema (1 parágrafo)

Hoje a conta mestre e as subcontas "parecem uma coisa só": são o mesmo tipo de `Workspace`, com o mesmo menu e as mesmas telas. A conta mestre (`Escritório Dev` / `dev-workspace`) inclusive **tem 3 casos de teste vinculados** — ou seja, está operando como uma subconta. Mas o modelo de negócio é outro: a **conta mestre é um console de gestão** (administra subcontas, usuários, planos, faturamento) e **não opera nada jurídico** — não vê casos, não cria processos. A **inteligência jurídica vive nas subcontas**, que operam com o cliente final. Sem um tipo explícito de conta e sem telas que divergem por tipo, os dois planos ficam fundidos e o produto fica ambíguo (control plane × data plane misturados).

## Resultado esperado

Quem entra numa **conta mestre** cai num **console de gestão de agência** — e **não vê "Casos" no menu**, porque a mestre não opera processos. Quem entra numa **subconta** cai no **app jurídico** (dashboard de Casos, provas, minutas) como hoje. O tipo da conta é explícito e dirige o que cada um enxerga. A conta mestre não consegue criar nem possuir um caso. (A ponte para um admin da mestre "descer" e operar uma subconta é a **spec 003** — switcher — e depende desta fundação.)

### Modelo de referência: GoHighLevel (agência multi-tenant)

O console da mestre segue o modelo **GoHighLevel**: você compra uma conta **agência** e faz a **gestão de subcontas** (multi-tenant). Os pilares do console da mestre são:

| Pilar | O que faz | Onde já existe base |
| :--- | :--- | :--- |
| **Controle de subcontas** | Criar/configurar/suspender subcontas, usuários da agência | `/admin/subcontas` |
| **Controle de features (entitlements)** | A agência **liga/desliga quais features cada subconta acessa** (modelo GHL: habilitar/desabilitar apps por location) | — (novo) |
| **Controle de permissões (RBAC)** | A agência define papéis e o que cada papel pode fazer nas subcontas | `Role`/`MembershipRole` (a reconciliar) |
| **Financeiro** | Planos, assinatura, **revenda/rebilling** às subcontas, margem, faturamento consolidado | `/admin/planos` + Stripe |
| **Integrações** | Configurar na agência e **propagar às subcontas** (provider de IA/LLM por workspace, DataJud, Stripe, etc.) | `Workspace.llmProvider/...`, `lib/datajud.ts`, `lib/stripe.ts` |
| **Multi-tenant** | Visão de todas as subcontas + "descer" pra operar qualquer uma | spec 003 (switcher) |

> **Entitlements (controle de features)** é peça nova e importante do modelo GHL: cada feature do app jurídico pode ser **ligada/desligada por subconta** pela agência (geralmente atrelada ao plano). Precisa de um conceito de `WorkspaceFeature`/entitlement — detalhado em spec própria; aqui só fica registrado como pilar do console.

Esta spec entrega a **fundação** (tipo de conta + nav divergente + console base). O **aprofundamento de cada pilar** (rebilling, propagação de integrações) fica em specs próprias — ver Lacunas.

## Critérios de aceite (verificáveis pelo QA)

- [ ] Existe `Workspace.kind` (enum `MASTER | SUBCONTA`), criável por `npm run db:init`.
- [ ] `dev-workspace` (Escritório Dev) é `MASTER`; `Escrtiorio Brenda` é `SUBCONTA` (backfill).
- [ ] Logar numa conta `MASTER` mostra o console de gestão e **não** mostra "Casos" na navegação.
- [ ] Logar numa conta `SUBCONTA` mostra o app jurídico (Casos) como hoje.
- [ ] (Caminho negativo) Tentar criar/possuir um `Case` num workspace `MASTER` é **rejeitado no servidor** (não basta esconder o botão).
- [ ] Os 3 casos de teste hoje em `dev-workspace` são tratados (movidos para uma subconta de teste **ou** removidos) — a mestre fica sem casos.
- [ ] `scripts/check-schema-sync.sh`, `npm run lint` e `npx tsc --noEmit` passam.

## Restrições anti-alucinação aplicáveis

Feature de **estrutura de conta / navegação**, não de geração de IA. As regras anti-alucinação (sobre saída de IA) não se aplicam diretamente. Invariante relevante de produto:

- [x] **Invariante de plano:** conta `MASTER` nunca possui dados operacionais de caso (`Case`, processo). Garantido por validação no servidor, não só na UI.

## Impacto técnico

- **Schema** (`schema.prisma` + `init.sql`):
  - Novo `enum WorkspaceKind { MASTER SUBCONTA }`.
  - `Workspace.kind WorkspaceKind @default(SUBCONTA)`.
  - Espelhar em `init.sql` (`CREATE TYPE "WorkspaceKind"` + coluna), seguindo o padrão dos enums existentes.
  - **Backfill (data):** `UPDATE "Workspace" SET kind='MASTER' WHERE "parentWorkspaceId" IS NULL`; demais ficam `SUBCONTA`.
- **Server actions / API:** em `app/actions/cases.ts`, a criação de caso passa a **rejeitar** se o workspace do contexto for `MASTER`. Helper `assertOperatingWorkspace(context)`.
- **UI / rotas:**
  - `components/Sidebar.tsx`: navegação **condicional ao `kind`** (modelo GoHighLevel). `MASTER` → **Administrativo** (Subcontas, Usuários), **Financeiro** (Planos, Faturamento/Revenda), **Integrações**, Configurações — **sem Casos**. `SUBCONTA` → Casos, Escritório, Configurações — sem gestão de subcontas.
  - Home por tipo: `MASTER` cai em `/admin` (console); `SUBCONTA` cai em `/` (Casos).
- **Multi-tenancy:** o `kind` define qual superfície o workspace expõe. Não altera o isolamento por `workspaceId`, que continua valendo.

## Plano de teste

- E2E Playwright a adicionar em `app/e2e/`:
  - Logar como conta `MASTER` → assertar console de gestão e **ausência** de "Casos" no menu.
  - Logar como `SUBCONTA` → assertar presença do dashboard de Casos.
  - **Negativo:** chamar a criação de caso com contexto `MASTER` → rejeitada.
- Rota nova → adicionar ao `anti-vibecode.spec.ts`? Avaliar (mudança de nav + guard; sem rota nova obrigatória).

## Lacunas / decisões pendentes

- [ ] **Destino dos 3 casos de teste em `dev-workspace`:** mover para a subconta Brenda (preserva pra testar o app) **ou** apagar (mestre limpa). Recomendo **mover para Brenda**. *Não bloqueante.*
- [ ] **Pode existir subconta sem mestre (standalone)?** Por ora todo `SUBCONTA` tem `parentWorkspaceId`. Manter assim; standalone fica para depois. *Não bloqueante.*
- [ ] **Faturamento/revenda na mestre** (rebilling — cobrar das subcontas com margem, modelo GHL SaaS): item de menu aqui, fluxo em spec própria (base: `/admin/planos` + Stripe).
- [ ] **Propagação de integrações** agência→subconta (LLM provider, DataJud, Stripe configurados na mestre e herdados/sobrescritos pela subconta): spec própria. Hoje `llmProvider` já é por workspace com opção "Herdar da plataforma" — é o embrião disso.
