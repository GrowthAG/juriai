---
spec_id: 001
titulo: AuditEntry — rastreabilidade de toda saída de IA
status: rascunho
autor: arquiteto (juriai-dev)
criada_em: 2026-06-25
---

# Spec 001 — AuditEntry: rastreabilidade de toda saída de IA

## Problema (1 parágrafo)

A regra anti-alucinação #5 do JuriAI é explícita: *"toda saída de IA cria um `AuditEntry` com `grounded_on`, `confidence` e `unresolved_gaps`"*. Hoje essa tabela **não existe no schema** (`schema.prisma` e `init.sql`). Sem ela, qualquer feature de IA (análise de caso, geração de rascunho, sugestão) nasce sem rastreabilidade — exatamente o que diferencia o JuriAI de um wrapper de ChatGPT. É a fundação que precisa existir antes de `/analyze` ou geração de `Draft`.

## Resultado esperado

Toda vez que a IA produzir uma saída sobre um caso, fica registrado de forma append-only: o que ela fez, qual modelo usou, em que evidências/referências se baseou (`groundedOn`), o quão confiante está (`confidence`) e quais lacunas continuam abertas (`unresolvedGaps`). O advogado consegue auditar a procedência de cada sugestão antes de aprovar. Nenhuma saída de IA fica órfã de auditoria.

## Critérios de aceite (verificáveis pelo QA)

- [ ] Existe a tabela `AuditEntry` no banco, criável por `npm run db:init`.
- [ ] Um `AuditEntry` referencia um `Case` (FK) e opcionalmente um revisor (`reviewedById` → `User`, nullable).
- [ ] Campos `groundedOn` e `unresolvedGaps` são `jsonb` (arrays de string).
- [ ] `confidence` e `action` são enums com valores fixos (sem string livre).
- [ ] Registros são **append-only**: a feature não expõe update/delete de `AuditEntry`.
- [ ] (Caminho negativo) Não há fluxo que persista saída de IA sem criar o `AuditEntry` correspondente — quando houver geração de IA, ela e o audit entram na mesma transação.
- [ ] `scripts/check-schema-sync.sh` passa (schema.prisma e init.sql espelhados).

## Restrições anti-alucinação aplicáveis

- [x] Saída de IA cria `AuditEntry` (`grounded_on`, `confidence`, `unresolved_gaps`) — **esta spec é a fundação dessa regra**
- [x] Export bloqueado sem `reviewed_by != null` — `AuditEntry.reviewedById` participa do gate de revisão
- [ ] (As demais regras se aplicam quando a IA *consumir* esta tabela — fora do escopo desta spec, que só cria a fundação de dados.)

## Impacto técnico

- **Schema** (`schema.prisma` + `init.sql`):
  - Novo `model AuditEntry`:
    - `id String @id @default(cuid())`
    - `caseId String` + relação `case Case @relation(...)` (FK, `onDelete: Cascade`)
    - `action AuditAction` (enum)
    - `model String` (ex: `"claude-opus-4-8"`)
    - `groundedOn Json` (array de IDs/labels de evidência e referência)
    - `confidence AuditConfidence` (enum)
    - `unresolvedGaps Json` (array de descrições/ids de gap)
    - `reviewedById String?` + relação `reviewedBy User? @relation(...)` (`onDelete: NoAction`)
    - `createdAt DateTime @default(now())`
    - `@@index([caseId])`
  - Novos enums:
    - `enum AuditAction { ANALYZE GENERATE_DRAFT SUGGEST_STRATEGY EXTRACT_EVIDENCE }`
    - `enum AuditConfidence { ALTA MEDIA BAIXA }`
  - Adicionar `auditEntries AuditEntry[]` ao `model Case`.
  - Espelhar tudo em `init.sql`: `CREATE TABLE "AuditEntry"` + enums via `CREATE TYPE` (seguir o padrão dos enums existentes no arquivo) + FKs + index.
- **Server actions / API:** nenhuma nesta spec (fundação de dados). Um helper `createAuditEntry(...)` em `app/lib/` pode ser incluído para uso futuro, sem expor mutação direta ao cliente.
- **UI / rotas:** nenhuma. (Visualização de auditoria é spec futura.)
- **Multi-tenancy:** `AuditEntry` herda o workspace via `Case.workspaceId` — não duplica `workspaceId`. Toda query de audit passa pelo case, que já é isolado por workspace.

## Plano de teste

- E2E Playwright: não há UI nesta spec. Cobertura via:
  - Teste de integração/script que roda `npm run db:init` e verifica que a tabela e os enums existem (ou inspeção via `prisma studio`).
  - `scripts/check-schema-sync.sh` no CI/gate.
- Rota nova → adicionar ao `anti-vibecode.spec.ts`? **Não** (sem UI).

## Lacunas / decisões pendentes

- [ ] Valores finais do enum `AuditAction` — proponho `ANALYZE / GENERATE_DRAFT / SUGGEST_STRATEGY / EXTRACT_EVIDENCE`. Confirmar com o roadmap de features de IA. (Não bloqueante: dá pra começar com esses e estender.)
- [ ] `groundedOn`/`unresolvedGaps` como `Json` (arrays) vs. tabelas relacionais. O backend spec usa `jsonb` — seguir isso no MVP; relacional fica para quando houver consulta cruzada por referência.
- [ ] Incluir já o helper `createAuditEntry` ou deixar para a spec que introduz `/analyze`? Recomendo deixar a fundação de dados isolada nesta spec.
