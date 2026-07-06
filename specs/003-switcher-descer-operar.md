---
spec_id: 003
titulo: Switcher — admin da mestre "desce" numa subconta para operar, com auditoria
status: rascunho
autor: arquiteto (juriai-dev)
criada_em: 2026-06-26
---

# Spec 003 — Switcher: admin da mestre "desce" numa subconta para operar, com auditoria

> **Depende da spec 002** (separação mestre × subconta / `Workspace.kind`). Executar 002 antes.

## Problema (1 parágrafo)

Definido o modelo (spec 002), a conta mestre é console de gestão e **não opera casos** por padrão. Mas o negócio é de agência white-label: um admin da mestre **precisa poder "descer" numa subconta e operar o caso** quando atende o cliente final por ela. Hoje isso é impossível — `lib/actor-context.ts` prende o usuário a `User.workspaceId` fixo, não há "workspace ativo" trocável, e não há registro de quem operou o quê numa subconta. Sem isso, ou a mestre fica sem poder ajudar a subconta, ou alguém compartilha login — os dois ruins.

## Resultado esperado

Um admin da conta mestre vê um **seletor de subconta**. Ao escolher uma, ele **entra no contexto operacional dela** — o app jurídico daquela subconta (Casos, provas, minutas) aparece — e pode operar como se fosse da subconta. Um **indicador permanente** deixa claro "Você está operando em: <subconta> (via conta mestre)". Cada vez que um admin da mestre desce numa subconta, fica **registrado quem entrou, quando e em qual subconta** (trilha de auditoria). Ele volta para o console de gestão a qualquer momento. Ninguém consegue descer numa subconta fora da sua árvore.

## Critérios de aceite (verificáveis pelo QA)

- [ ] O console da mestre mostra um seletor com as subcontas acessíveis (subárvore).
- [ ] Selecionar uma subconta troca o workspace ativo; o app jurídico **daquela** subconta aparece (Casos refletem os dados dela).
- [ ] Indicador visível "operando em <subconta> via mestre" enquanto o ativo ≠ a conta do usuário.
- [ ] O workspace ativo **persiste** entre navegações (sobrevive a refresh).
- [ ] Voltar à mestre restaura o console de gestão (sem Casos), conforme spec 002.
- [ ] **Auditoria:** descer numa subconta cria um registro append-only (quem, quando, qual subconta).
- [ ] (Caminho negativo) A ação de troca **rejeita** subconta fora da subárvore do usuário — inclusive em requisição forjada (validação no servidor, não só UI).
- [ ] (Caminho negativo) Usuário sem papel de admin na mestre **não** consegue descer; super admin da plataforma desce em qualquer uma.
- [ ] (Isolamento) Operando na subconta X, não vazam casos da mestre nem de subcontas-irmãs.
- [ ] `scripts/check-schema-sync.sh`, `npm run lint`, `npx tsc --noEmit` passam.

## Restrições anti-alucinação aplicáveis

Infra de acesso/multi-tenancy, não geração de IA — regras de saída de IA não se aplicam diretamente. Invariantes relevantes:

- [x] **Isolamento de tenant:** descer numa subconta nunca dá acesso fora da subárvore autorizada. Validação no servidor.
- [x] **Rastreabilidade de operação:** toda descida da mestre numa subconta é auditável (quem operou). Alinha com o espírito da regra #5 (rastreabilidade), aqui aplicada a *acesso*, não a saída de IA.

## Impacto técnico

- **Schema** (`schema.prisma` + `init.sql`):
  - Novo `model WorkspaceAccessEvent` (trilha append-only de descidas): `id`, `actorUserId` (FK User), `fromWorkspaceId` (mestre), `toWorkspaceId` (subconta), `createdAt`, `@@index([toWorkspaceId])`. Espelhar em `init.sql`.
  - (Sem mudança em `Case`. Subárvore continua via CTE recursivo em `parentWorkspaceId`; materialized path fica para otimização futura.)
- **Sessão** (`lib/session.ts`): cookie `juriai_active_workspace` (get/set/clear), padrão do `juriai_session`. Continua sessão de dev (forjável); seam do Identity Platform inalterado.
- **Contexto de ator** (`lib/actor-context.ts`): se houver `activeWorkspaceId` permitido (super admin **ou** subconta na subárvore do workspace casa), sobrescreve `workspaceId`/`workspaceName` para o ativo, **mantém o papel do usuário** (cascata de autoridade mestre→subconta) e seta flag `isOperatingSubconta: boolean`. Acesso não permitido → ignora e cai na casa.
- **Server actions** (`app/actions/`):
  - `descendIntoSubconta(workspaceId)`: valida (subárvore + papel admin/super) → grava `WorkspaceAccessEvent` → seta cookie → `revalidatePath("/")`. Rejeita fora de escopo.
  - `returnToMaster()`: limpa o cookie ativo.
  - `listManagedSubcontas()`: subárvore acessível (CTE recursivo).
  - Helper `isWorkspaceInSubtree(rootId, candidateId)` reutilizável (substitui o `assertCanManageWorkspace` de 1 nível em `admin.ts`).
- **UI / rotas:** seletor de subconta no console da mestre; banner "operando em <subconta> via mestre"; botão "voltar à gestão". Sem rota nova.
- **Multi-tenancy:** `lib/access.ts` já filtra por `context.workspaceId`; como o switcher troca o `workspaceId`, o isolamento é herdado. Nenhuma query nova deve refazer `WHERE workspaceId` fora do `getActorContext`.

## Plano de teste

- E2E Playwright a adicionar em `app/e2e/`:
  - **Feliz:** logar como admin da mestre → console (sem Casos) → selecionar Brenda → app jurídico da Brenda aparece + banner → operar → voltar à gestão.
  - **Auditoria:** após descer, existe `WorkspaceAccessEvent` com actor/from/to corretos.
  - **Negativo:** `descendIntoSubconta` com id fora da subárvore → rejeitado; usuário não-admin → rejeitado.
  - **Isolamento:** operando na Brenda, a lista de casos não traz casos da mestre.
- Rota nova → adicionar ao `anti-vibecode.spec.ts`? Não (sem rota nova).

## Lacunas / decisões pendentes

- [ ] **Papel ao operar na subconta:** cascata (admin da mestre opera com autoridade plena na sub). Proposta — confirmar. *Não bloqueante.*
- [ ] **Persistência do ativo:** cookie (proposto, sem schema extra além do log) vs. coluna em User. Recomendo cookie. *Não bloqueante.*
- [ ] **Granularidade da auditoria:** logar só a "descida" (proposto, MVP) vs. logar cada ação dentro da subconta. Recomendo descida no MVP; ação-a-ação quando houver `AuditEntry` (spec 001) consumido. *Não bloqueante.*
- [ ] Refactor de papéis (`Membership` como autoridade, aposentar `User.role`) continua **fora** deste escopo → spec futura (gestão de membros).
