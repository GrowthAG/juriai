# Proposta de Persistência: LegalAnalysis

Status deste documento: proposta de arquitetura. Não altera schema, Prisma,
migration, SQL nem banco. Serve como contrato de decisão para uma etapa futura.

Referência de contrato: `plans/legal-analysis-v032.md` (LegalAnalysis v0.3.2).

## 1. Veredito

- **Bloqueado por migration.** O schema atual não tem entidade nem coluna
  adequada para persistir o contrato `LegalAnalysis v0.3.2` de forma consultável,
  auditável e multi-tenant-safe.
- Existe um **workaround técnico** (serializar o contrato inteiro em
  `AuditEntry.groundedOn`, que é `Json`), mas **não é recomendado**: perde
  `workspaceId`, perde filtro/consulta por status e segurança, e mistura trilha
  de auditoria com dado de negócio.
- **`AuditEntry` não deve ser depósito principal de dado de negócio.** Ele é
  trilha de execução, não o registro-mãe da análise.

## 2. Entidade proposta

`LegalAnalysis` como **entidade própria**, de primeira classe, com:

- vínculo obrigatório a `Case` (a unidade de trabalho e âncora de tenant);
- `workspaceId` **explícito** na própria tabela (defesa em profundidade, sem
  depender apenas do caminho `caseId -> Case.workspaceId`, evitando o mesmo
  débito de `TimelineEvent`, `Gap` e `AuditEntry`, que não têm coluna própria);
- **origem opcional futura** em `LegalPublication` (FK considerada apenas depois
  que a Fase 3 estiver aplicada no banco; ver seção 8);
- um `payload Json` com o contrato bruto v0.3.2 completo (fidelidade total),
  além das colunas promovidas abaixo.

## 3. Campos promovidos para colunas

Promovidos porque são usados em consulta, filtro, auditoria ou segurança:

| Campo | Motivo de ser coluna |
| :--- | :--- |
| `workspaceId` | Isolamento multi-tenant; filtro e defesa em profundidade. |
| `caseId` | FK para o caso; vínculo e navegação. |
| `analysisVersion` | Versionamento do contrato; migração/compatibilidade. |
| `status` | Triagem (ex.: pendente de revisão); filtro operacional. |
| `automationBlocked` | Segurança: bloqueia envio a agenda, cliente ou documento final. |
| `humanReviewRequired` | Workflow de revisão humana obrigatória. |
| `reviewedById` | Auditoria: quem revisou/aprovou (nullable até revisão). |
| `reviewedAt` | Auditoria: quando foi revisado (nullable até revisão). |
| `confidenceLevel` | Triagem e filtro; alimenta a derivação de `automationBlocked`. |
| `doubleCheckResult` | Guardrail e filtro; alimenta a derivação de `automationBlocked`. |
| `sourceTextHash` | Integridade, deduplicação e rastreabilidade do texto analisado (indexável). |
| `sensitiveDataDetected` | Segurança: excluir de automação/compartilhamento em segredo de justiça. |
| `createdAt` | Ordenação, auditoria temporal. |
| `updatedAt` | Auditoria temporal de alterações. |

## 4. Campos candidatos para JSON

Podem ficar dentro do `payload Json` (ou de um bloco `Json` dedicado) sem
prejudicar rastreabilidade, pois não são filtrados individualmente e os
`source_start_char`/`source_end_char` + `sourceTextHash` mantêm a proveniência:

- `literalExtraction` (summary, proceduralClass, parties).
- `aiInterpretation` (result, deadlines[] com extractedDeadline, unit, dayType,
  startEvent, source excerpt + char indices, `finalDate`, `finalDateStatus`).
- `reviewRecommendation` (suggestedAction, attentionPoints).
- `confidence.reason`.
- `humanReview.reason`.
- `doubleCheck.issues`.
- `sensitiveDataTypes`.
- `sensitiveDataSourceExcerpt`.
- **Contrato bruto completo v0.3.2** como payload (fonte da verdade fiel; as
  colunas promovidas da seção 3 são duplicação deliberada para consulta e
  segurança).

## 5. Enums candidatos

Apenas em texto, sem schema nesta etapa:

- `AnalysisStatus`: ex. `AI_SUGGESTED`, `HUMAN_REVIEWED`, `REJECTED`.
- `ConfidenceLevel`: `HIGH`, `MEDIUM`, `LOW` (atenção: diverge do enum atual
  `AuditConfidence`, que é `ALTA`/`MEDIA`/`BAIXA`; precisa mapear ou criar novo).
- `DoubleCheckResult`: `PASSED`, `FAILED`, `CORRECTED`, `NOT_RUN`.
- `FinalDateStatus`: `NOT_COMPUTED` (padrão), e demais estados definidos na Fase F
  do motor determinístico de prazo.

## 6. Guardrails de persistência

Regras aplicadas na camada de servidor/serviço, nunca confiando no LLM nem no
payload do cliente:

- O servidor **força** `status = AI_SUGGESTED` na criação.
- O servidor **força** `humanReviewRequired = true`.
- O servidor **deriva** `automationBlocked` de forma determinística a partir das
  regras da spec: `confidenceLevel == LOW`, ou `doubleCheckResult == FAILED`, ou
  `dayType == NOT_IDENTIFIED`, ou dado sensível em segredo de justiça, ou
  conflito entre extração inicial e double-check. A IA propõe `confidence` e
  `doubleCheck`; o servidor calcula `automationBlocked`.
- O servidor **rejeita ou zera** qualquer `finalDate` não-nulo vindo do LLM.
  `finalDate` permanece `null` e `finalDateStatus` permanece `NOT_COMPUTED` até
  um cálculo determinístico (não-LLM) ou humano (Fase F).
- `workspaceId` **sempre vem do `Case`** (recomputado no servidor), nunca do
  payload.
- Toda escrita/leitura passa por `getAccessibleCase(caseId)` (valida tenant e
  RBAC) antes de qualquer persistência ou consulta.
- Nenhuma análise vai para agenda, cliente ou documento final sem revisão
  humana registrada (`reviewedById`/`reviewedAt` preenchidos).

## 7. Relação com `AuditEntry`

- `AuditEntry` registra a **execução** e a **rastreabilidade** da chamada de IA
  (ação, modelo, grounded_on, confiança, lacunas não resolvidas, revisor).
- `AuditEntry` **não** armazena a análise principal (`LegalAnalysis` é o
  registro-mãe do dado de negócio).
- Uma **extensão futura** do `AuditEntry` pode ser necessária para guardar
  prompt, hash do texto e resultado do double-check de forma auditável por
  coluna. Isso **também exigiria migration** e fica bloqueado até aprovação.

## 8. Relação com `LegalPublication`

- `LegalPublication` é a **origem natural** de uma análise de publicação DJEN e
  pode virar FK opcional em `LegalAnalysis` no futuro.
- **Hoje não deve ser dependência:** a tabela `LegalPublication` está
  `DB_PATCH_PENDING` (existe no `schema.prisma`, mas o patch não foi aplicado ao
  banco).
- A FK opcional `LegalAnalysis -> LegalPublication` só deve ser considerada
  **depois** que a Fase 3 (patch da publicação) estiver aplicada em banco seguro.

## 9. Plano futuro em fases

Proposta, sem executar nada agora:

- **Fase A: fechar spec e enums.** Reconciliar `ConfidenceLevel` vs
  `AuditConfidence`, e travar `AnalysisStatus`, `DoubleCheckResult`,
  `FinalDateStatus`.
- **Fase B: migration local/dev para `LegalAnalysis`.** Modelo + colunas
  promovidas + `payload Json`, espelhada em `init.sql` e patch create-only,
  aplicada apenas em banco local/dev descartável (nunca no proxy Cloud SQL).
- **Fase C: action de persistência.** Server action com `getAccessibleCase`,
  `workspaceId` do Case, `status` default, guardrails da seção 6.
- **Fase D: auditoria.** Definir home da auditoria de IA (estender `AuditEntry`
  vs. campos na `LegalAnalysis`) e registrar prompt/hash/double-check.
- **Fase E: UI de revisão humana.** Aprovar/rejeitar análise, preencher
  `reviewedById`/`reviewedAt`, distinguir sugerido vs. confirmado.
- **Fase F: motor determinístico de prazo.** Cálculo de `finalDate` fora do LLM
  (regra determinística e/ou confirmação humana), com `finalDateStatus`.

## 10. Bloqueios (dependem de aprovação explícita)

- Alteração de schema.
- Migration.
- SQL.
- Alteração no `AuditEntry`.
- Vínculo (FK) com `LegalPublication`.
- Motor de prazo (cálculo de `finalDate`).
- UI de aprovação humana.

Nada acima pode ser iniciado sem aprovação explícita e sem um banco local/dev
seguro. Este documento é apenas o registro da proposta.
