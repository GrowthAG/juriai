---
spec_id: 004
titulo: Geração de minuta com IA (resposta ou peça inicial) com papel timbrado
status: rascunho
autor: Giulliano Alves (via auditoria conjunta com Claude Code)
criada_em: 2026-07-06
---

# Spec 004 — Geração de minuta com IA (resposta ou peça inicial) com papel timbrado

## Problema (1 parágrafo)

> O advogado recebe um documento de terceiro (notificação extrajudicial, réplica ou
> contestação) ou precisa começar uma ação do zero. Hoje o JuriAI cria o caso e a IA
> **analisa e estrutura** o caso (linha do tempo, lacunas, auditoria), mas **não existe
> nenhum caminho, em código, que gere o documento de resposta (ou a peça inicial)**. O
> `Draft` já existe no schema (`prisma/schema.prisma:559`) mas nenhuma action, tela ou
> chamada de IA jamais escreve nele. O prompt de análise atual (`lib/llm.ts`, bloco
> `SYSTEM`) proíbe explicitamente redigir peça ("SEM redigir peça e SEM dar conselho
> conclusivo"). Isso é a lacuna entre "IA que organiza" e "IA que produz a minuta" — a
> funcionalidade citada pelo usuário como o valor central do produto ("a cereja do
> bolo").

## Resultado esperado

> O advogado vincula ao caso o documento recebido (notificação/réplica/contestação) ou
> parte de um caso já mapeado. Pede para a IA gerar a minuta (de resposta, ou peça
> inicial, dependendo do tipo de caso). A IA lê o documento vinculado + o mapa do caso
> (fatos, provas, lacunas) já existente, e produz um rascunho de minuta dentro do
> vocabulário jurídico correto, sinalizando claramente qualquer fato sem prova como
> `[FATO ALEGADO]`. O advogado revisa, edita se precisar, e só então pode exportar —
> nesse momento o documento sai formatado com o papel timbrado do escritório (já
> configurável hoje em `/admin/subcontas/[id]`, mas hoje sem uso nenhum downstream).

## Critérios de aceite (verificáveis pelo QA)

- [ ] Advogado consegue vincular um documento recebido (extrajudicial/réplica/contestação) a um caso existente, reaproveitando o pipeline de `Evidence` + `IngestionJob` já existente (upload + extração de texto).
- [ ] Botão "Gerar minuta" só fica habilitado quando o caso tem mapa mínimo completo (mesma checagem de lacunas bloqueantes já usada para o status `REDACAO` em `app/actions/cases.ts:420`).
- [ ] IA gera um `Draft` com `type` correto (`DraftType`: `RESPOSTA_EXTRAJUDICIAL`, `CONTESTACAO`, `PETICAO_INICIAL`, etc.) e `content` em texto revisável.
- [ ] Todo fato sem prova documental correspondente aparece marcado `[FATO ALEGADO]` no texto gerado, nunca afirmado como verdade.
- [ ] Toda geração de `Draft` cria um `AuditEntry` (`grounded_on`, `confidence`, `unresolved_gaps`), igual ao que já acontece em `analyzeCase`.
- [ ] Exportar/baixar o documento final exige revisão humana prévia (`reviewedById != null`) — **caminho negativo**: exportar sem revisão deve ser bloqueado com mensagem clara, não silenciosamente permitido.
- [ ] Documento exportado usa o papel timbrado do workspace (`Workspace.letterheadPath`) quando presente; **caminho negativo**: se não houver papel timbrado configurado, o sistema informa isso ao usuário em vez de gerar um PDF quebrado ou sem aviso.
- [ ] Reescrever/gerar nova versão da minuta não perde a versão anterior (histórico de versões).

## Restrições anti-alucinação aplicáveis

- [x] Geração só com mapa completo do caso (fatos, provas, lacunas, riscos)
- [x] Proibido inventar fato / jurisprudência / artigo / prazo / valor
- [x] Fato sem prova → `[FATO ALEGADO]` / `FactCertainty.ALEGADO`
- [x] Saída de IA cria `AuditEntry` (`grounded_on`, `confidence`, `unresolved_gaps`)
- [x] Export bloqueado sem `reviewed_by != null`
- [x] Respeita pipeline de `CaseStatus` (sem pular pra `REDACAO` com gap bloqueante)

Todas as seis se aplicam — esta feature é o ponto de maior risco de alucinação do produto (é o que vira peça protocolada).

## Impacto técnico

- **Schema** (`schema.prisma` + `init.sql`):
  - `Draft` (`prisma/schema.prisma:559`) hoje **não tem** `reviewedById`/`reviewedAt` — precisa ganhar esses campos para cumprir o gate de revisão humana (mesmo padrão de `AuditEntry.reviewedById`).
  - Não existe `DraftVersion` (histórico imutável) — hoje `Draft.version` é só um `Int` solto, sem tabela de histórico. Decisão pendente: criar `DraftVersion` agora ou versionar via múltiplas linhas de `Draft` (mais simples, menos "correto" a longo prazo).
  - `IngestionJob` já existe e já cobre upload + extração de texto (`app/api/cases/[id]/evidence/route.ts`, `lib/ingestion.ts`) — reaproveitável para o documento recebido, sem mudança de schema aí.
- **Server actions / API:**
  - Nova action (ex.: `generateDraft(caseId, draftType)`) — precisa de **novo prompt de sistema** dedicado à redação (o prompt de `analyzeCaseWithClaude` proíbe redigir peça de propósito; não dá para reaproveitar o mesmo prompt).
  - Nova action de exportação (`exportDraft`/`markDraftReviewed`) com o gate de `reviewedById`.
- **UI / rotas:**
  - Seção nova em `app/casos/[id]/page.tsx`: "Documento recebido" (vincular notificação/réplica/contestação) e "Gerar minuta" (novo botão, separado do "Gerar análise para revisão" que já existe).
  - Tela de revisão/edição da minuta antes de export.
  - Exportação como documento formatado (PDF/DOCX) com papel timbrado — **nenhuma biblioteca de geração de PDF/DOCX está instalada hoje** (`package.json` não tem `pdfkit`/`react-pdf`/`puppeteer`/equivalente). Isso é trabalho novo de infraestrutura, não só de UI.
- **Multi-tenancy:** `Draft` já herda isolamento por `caseId → Case → Workspace`, mesmo padrão de `Evidence`/`TimelineEvent`. Papel timbrado já é por `Workspace`. Nenhum risco novo de mistura de tenant identificado, desde que a nova action reutilize `getAccessibleCase`/`getActorContext` como as outras já fazem.

## Plano de teste

- E2E Playwright a adicionar/ajustar em `app/e2e/`: novo spec cobrindo (a) vincular documento recebido, (b) gerar minuta, (c) tentar exportar sem revisão (deve bloquear), (d) revisar e exportar com sucesso.
- Rota nova → adicionar ao `anti-vibecode.spec.ts`? **Sim** — qualquer rota/ação nova de geração/exportação de peça deve entrar nesse guard-rail, dado que é a superfície de maior risco de alucinação do produto.

## Lacunas / decisões pendentes

- [ ] **Escopo do "documento recebido"**: é sempre PDF/imagem escaneada (precisa de OCR real, não só extração de texto de PDF nativo)? O `lib/ingestion.ts` atual é heurístico/regex — is suficiente para ler uma contestação inteira, ou precisa de OCR/LLM de extração dedicado? (Pergunta bloqueante — decide o esforço de ingestão.)
- [ ] **Formato de exportação**: PDF, DOCX, ou os dois? Isso decide qual biblioteca adotar (nenhuma está instalada hoje).
- [ ] **Layout do papel timbrado**: existe um padrão visual definido (ver `Documentacao Padrao/` na raiz do repo) que a exportação deve seguir, ou fica a critério de implementação inicial?
- [ ] **DraftVersion agora ou depois**: criar a tabela de histórico já nesta spec, ou aceitar versionamento simplificado (`Draft.version` incremental, sem histórico completo) numa primeira iteração e evoluir depois?
- [ ] **Qual DraftType por tipo de caso**: mapear regra determinística (ex.: caso `JUDICIAL_PASSIVO` recebendo citação → sugere `CONTESTACAO`; recebendo notificação → `RESPOSTA_EXTRAJUDICIAL`) ou deixar o advogado escolher manualmente o tipo de peça a cada geração?
