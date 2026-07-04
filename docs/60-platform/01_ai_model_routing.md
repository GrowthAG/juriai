# Matriz de Modelos de IA do JuriAI

## 1. Objetivo

Este documento é a fonte única de referência sobre **qual modelo de IA faz o
quê no JuriAI, por quê, com que evidência e com que nível de confiança**.

Ele existe porque hoje há quatro superfícies diferentes decidindo "qual
modelo roda" sem nenhum documento que as amarre: a configuração declarada em
`lib/llm-config.ts` (validada por `lib/llm-registry.ts` e consumida através
do seam de tarefa em `lib/llm-router.ts`), as colunas de override em
`Workspace` (schema/DB), o plano de feature `plans/legal-analysis-v032.md`
(ainda não implementado) e o `model:` fixado no frontmatter dos subagentes de
`juriai-dev/agents/`. Este arquivo não substitui nenhum desses — ele
documenta o estado real de cada um e força qualquer mudança futura a
atualizar esta matriz junto.

Este documento é **só documentação**. Ele não altera runtime, schema, `.env`,
migrations, patches ou deploy. Qualquer promoção do que está aqui para código
é uma mudança separada, com escopo e revisão próprios (ver seção 8).

> **Nota sobre caminhos:** este arquivo vive em `app/docs/60-platform/`, dentro
> do repositório git (`JuriAI/app`). Caminhos citados sem prefixo (ex.:
> `lib/llm.ts`, `plans/...`, `SETUP.md`) são relativos à raiz do repo `app/`.
> Caminhos como `AGENTS.md`, `juriai-dev/agents/`, `plugin-juriai/agents/` e o
> `docs/` de nível superior (com `02_BRAND_STRATEGY.md`, `gtm-context.md`)
> ficam **um nível acima**, na raiz do projeto `JuriAI/`, fora deste
> repositório git — são citados pelo nome porque fazem parte da mesma
> constituição do projeto (`AGENTS.md`), não porque estão dentro de `app/`.

## 2. Escopo e distinção fundamental

**Runtime de produção do app e engenharia/assistentes de desenvolvimento são
dois eixos completamente diferentes.** Não confundir os dois é o ponto mais
importante deste documento.

### 2.1 Runtime de produção do app

O modelo que efetivamente analisa um caso jurídico real, dentro do produto,
via `analyzeCaseWithClaude` (`lib/llm.ts`) e `app/actions/analyze.ts`.
Roda em servidor, é auditado (`AuditEntry`, regra anti-alucinação #5 do
`AGENTS.md`, na raiz do projeto) e é o que o cliente final do JuriAI (o
escritório de advocacia) está, na prática, pagando para usar. Mudar o modelo
aqui é mudança de produto, com risco de regressão na qualidade da análise
jurídica.

### 2.2 Engenharia / assistentes de desenvolvimento

O modelo que um desenvolvedor (ou o próprio Claude Code) usa para **escrever
o código do JuriAI**, rodar os subagentes do plugin `juriai-dev`
(`arquiteto`, `dev-senior`, `qa-engenheiro`, `revisor`, `db-devops`) ou os
agentes jurídicos do plugin `plugin-juriai` (`analista-caso`, `pesquisador`,
`redator`, `jurista-persona`, `estrategista`, `auditor-provas`, `humanizer`).
Ambos os plugins ficam na raiz do projeto, fora de `app/`. Isso nunca toca o
runtime do produto e nunca aparece em `AuditEntry`. É configuração de
ferramenta de trabalho, não de produto.

## 3. Tabela-resumo

| Executor recomendado | Modelo | Tarefa | Por que é ideal | Evidência | Por que não os outros | Confiança | Status |
|---|---|---|---|---|---|---|---|
| App runtime — Google Vertex | `claude-opus-4-7` | Análise de caso (`analyzeCaseWithClaude`, via `lib/llm-router.ts`), extração principal DJEN | Único modelo com `output_config.json_schema` + `thinking: "adaptive"` já integrado ao contrato anti-alucinação do JuriAI | `lib/llm-config.ts:7` (`const MODEL`), `plans/legal-analysis-v032.md:11` (linha "Extração Principal", ATIVO) | Sonnet 4.5 é o fallback declarado, não o padrão; modelos MaaS não têm esse parâmetro validado no schema atual | ALTA | ATIVO |
| App runtime — Google Vertex / Anthropic direto | `claude-sonnet-4-5` | Fallback de extração quando Opus 4.7 não está disponível na região | Está na allowlist `SUPPORTED_MODELS` como segunda opção, já testado nos smoke tests | `lib/llm-config.ts:8`, `plans/legal-analysis-v032.md:13` (linha "Fallback Extração", ATIVO) | Não é o default porque o produto foi calibrado com Opus 4.7 como principal | ALTA | ATIVO |
| App runtime — Anthropic direto (`ANTHROPIC_API_KEY`) | mesmo modelo do provider ativo | Fallback de **infraestrutura** quando Vertex falha por erro de serviceability (região/publisher) | Já implementado como fallback automático em `analyzeCaseWithClaude` | `lib/llm.ts:644-657` (bloco de fallback para `anthropic-direct`), `SETUP.md:88-92` | Não é escolha de modelo, é escolha de canal de acesso ao mesmo modelo | ALTA | ATIVO |
| Claude Code — engenharia geral | Sonnet 5 | Implementação de código, revisão, tarefas do dia a dia no repo | Modelo padrão do Claude Code local hoje | Observado no ambiente local do usuário (sessão atual) | Opus 4.8 é mais caro/lento para tarefas rotineiras; Haiku 4.5 é rápido demais para reasoning complexo de código | MEDIA | ATIVO (uso local, não versionado em arquivo) |
| Claude Code — subagentes de raciocínio jurídico/arquitetural | Opus 4.8 (alias `opus`) | `analista-caso`, `pesquisador`, `redator`, `jurista-persona`, `estrategista`, `auditor-provas` (plugin `plugin-juriai`, raiz do projeto) | Tarefas de maior profundidade analítica e menor tolerância a erro (auditoria de provas, estratégia, redação) | `plugin-juriai/agents/analista-caso.md:4`, `pesquisador.md:4`, `redator.md:4`, `jurista-persona.md:4`, `estrategista.md:4`, `auditor-provas.md:4` (todos `model: opus`) | Sonnet seria mais barato mas o plugin já optou por opus para essas roles; não é decisão deste documento, só o registro do que já está configurado | MEDIA | ATIVO |
| Claude Code — humanização de texto | Sonnet (alias `sonnet`) | `humanizer` (plugin `plugin-juriai`, raiz do projeto) | Tarefa de reescrita/tom, não de raciocínio jurídico profundo | `plugin-juriai/agents/humanizer.md:4` (`model: sonnet`) | Opus seria custo desnecessário para reescrita de tom | MEDIA | ATIVO |
| Google MaaS (Vertex) — avaliar | `moonshotai/kimi-k2-thinking-maas` | Double-check da extração DJEN (v0.3.2) | Segundo modelo independente para checar alucinação de data/campo antes do humano revisar | `plans/legal-analysis-v032.md:12,75,95-103` (prompt de double-check), `scripts/ai-smoke/providers/google-maas.mjs` | Ainda não wired em `lib/llm.ts`; é plano, não runtime | BAIXA | PLANEJADO (não implementado) |
| Google MaaS (Vertex) — avaliar | `qwen/qwen3-coder-480b-a35b-instruct-maas` | Tarefas técnicas (não especificado além disso no plano) | Citado como "Tarefas Técnicas" no plano v0.3.2 | `plans/legal-analysis-v032.md:14` | Ainda não wired em `lib/llm.ts`; escopo da tarefa não está detalhado no plano | BAIXA | PLANEJADO (não implementado) |

## 4. Modelos ativos agora

### `claude-opus-4-7` (App runtime — produção)
- **Onde:** `lib/llm-config.ts:7` — `const MODEL = "claude-opus-4-7"`.
- **Papel:** modelo padrão de análise de caso via Vertex/GCP, e modelo da política `automatic` do Router v2 (ver seção 8).
- **Confiança:** ALTA — é o modelo em uso ativo, validado por smoke test (`plans/legal-analysis-v032.md:11`).

### `claude-sonnet-4-5` (App runtime — produção, fallback)
- **Onde:** `lib/llm-config.ts:8` — segundo item de `SUPPORTED_MODELS`.
- **Papel:** fallback de extração quando o Opus 4.7 não está disponível na região configurada (`resolveModelCandidates`, `lib/llm-config.ts:41-48`).
- **Confiança:** ALTA — também validado por smoke test (`plans/legal-analysis-v032.md:13`).

### Claude direto via `ANTHROPIC_API_KEY` (App runtime — fallback de infraestrutura)
- **Onde:** `lib/llm.ts:164-171` (`buildDirectClient`), acionado em `lib/llm.ts:644-657` quando o Vertex falha por erro de serviceability.
- **Papel:** não é uma escolha de modelo diferente — é um canal alternativo (API direta da Anthropic) para o mesmo modelo, usado quando o Vertex está indisponível na região.
- **Configuração:** `SETUP.md:88-92`.
- **Confiança:** ALTA — mecanismo simples e já testado.

### Sonnet 5 / Opus 4.8 / Haiku 4.5 / Fable 5 (Engenharia — Claude Code)
- **Onde:** ambiente local do Claude Code (não versionado em arquivo do repo) + aliases genéricos `model: opus` / `model: sonnet` em `juriai-dev/agents/*.md` e `plugin-juriai/agents/*.md` (raiz do projeto, fora de `app/`), que o Claude Code resolve para o modelo atual mapeado a esse alias.
- **Papel:** escrever/revisar código do JuriAI e rodar os subagentes jurídicos do plugin. **Nunca** toca o runtime de produção nem gera `AuditEntry`.
- **Risco de nomenclatura:** os aliases `opus`/`sonnet` no frontmatter não são o mesmo identificador que `claude-opus-4-7` no runtime — são namespaces diferentes (Claude Code resolve alias → modelo atual; o app runtime usa ID de modelo fixo da API Anthropic). Não confundir os dois ao ler os arquivos do plugin.
- **Confiança:** MEDIA — funciona, mas depende do mapeamento de alias do Claude Code, que pode mudar sem aviso no repo.

## 5. Modelos externos / avaliar depois

Nenhum destes está implementado em `lib/llm.ts`. Todos exigem smoke test
verde (`scripts/ai-smoke/`) antes de qualquer uso com dado de caso real.

- **Kimi K2 Thinking** (`moonshotai/kimi-k2-thinking-maas`, Google MaaS) — papel proposto: double-check da extração DJEN. Fonte: `plans/legal-analysis-v032.md:12,73-103`. Smoke test: `scripts/ai-smoke/providers/google-maas.mjs`.
- **Qwen3 Coder** (`qwen/qwen3-coder-480b-a35b-instruct-maas`, Google MaaS) — papel proposto: "tarefas técnicas", sem escopo detalhado ainda. Fonte: `plans/legal-analysis-v032.md:14`.
- **AWS Bedrock** (modelo não especificado) — só existe o stub de smoke test (`scripts/ai-smoke/providers/aws-bedrock.mjs`); nenhum modelo foi cotado ou proposto para nenhuma tarefa.
- **OpenAI/GPT** — sem código, sem plano. Só aparece em prosa comparativa/marketing (`docs/02_BRAND_STRATEGY.md` e `gtm-context.md`, ambos na raiz do projeto, fora de `app/`) contrastando o JuriAI com "wrapper de ChatGPT genérico". Não avaliar sem justificativa de tarefa concreta.
- **Gemini direto** (fora do papel de infraestrutura Vertex/ADC que já hospeda o Claude) — sem código, sem plano. Vertex já é usado como *canal* de acesso ao Claude; isso não implica avaliação do Gemini como modelo de análise.

## 6. Regras operacionais de escolha por tarefa

1. **Análise jurídica de caso em produção → só Claude via Anthropic (Vertex ou direto).** O contrato de `lib/llm.ts` (`output_config.json_schema`, `thinking: "adaptive"`, tratamento de `stop_reason: "refusal"`) é específico da API Anthropic. Trocar de provider aqui é mudança de contrato de API, não troca de string de modelo.
2. **Extração técnica de alto volume via MaaS (Kimi, Qwen) → só após smoke test verde documentado**, e nunca processando dado de caso real sem evidência de double-check funcionando (`plans/legal-analysis-v032.md`, seção "Critérios de Bloqueio de Automação").
3. **Trabalho de engenharia no Claude Code → modelo padrão do Claude Code** (hoje Sonnet 5), com Opus 4.8 reservado para tarefas de maior profundidade (arquitetura, auditoria jurídica dos subagentes `plugin-juriai`) e Haiku 4.5 para subtarefas baratas/rápidas — já é o que os `model:` em `juriai-dev/agents/*.md` e `plugin-juriai/agents/*.md` (raiz do projeto) codificam.
4. **Codex/Gemini CLI** — hoje só existem como leitores alternativos de `AGENTS.md` (constituição do repo, na raiz do projeto, citada em `CLAUDE.md` e `GEMINI.md`). Não há caminho de runtime para eles. Tratar como escolha de assistente de engenharia de quem está codando, nunca como rota de produto.
5. **Nenhuma data final, cálculo de prazo ou fato sem prova documental pode ser decidido por modelo, seja qual for.** Isso é regra do domínio (`AGENTS.md`, raiz do projeto; `plans/legal-analysis-persistence-proposal.md:86-98`), não uma questão de qual modelo é "melhor" — nenhum modelo tem essa autoridade.

## 7. Riscos de hardcode e drift

- `lib/llm-config.ts:7` define `MODEL = "claude-opus-4-7"` como literal sem alias. Se a Anthropic descontinuar esse snapshot, produção quebra até alguém editar o código e reimplantar.
- IDs datados (`claude-opus-4-7`) e nomes de marketing ("Opus 4.8" visto no Claude Code local) não têm mapeamento explícito em nenhum lugar do repo — fácil confundir "o mais novo disponível" com "o que está de fato rodando em produção".
- `SUPPORTED_MODELS` (`lib/llm-config.ts:8`) é uma allowlist fixa no código: adicionar um modelo novo exige deploy, não config. Isso torna o override `llmModel` por workspace (`app/admin/subcontas/[id]/page.tsx:230-233`) ilusório para qualquer ID fora da allowlist — cai em `unsupported_model` (`lib/llm.ts:350-355`, validado via `lib/llm-registry.ts`).
- A escolha de modelo hoje segue uma ordem de precedência explícita e centralizada (workspace → env → política `automatic`, ver seção 8) em vez de fragmentada — mas os três níveis (coluna no banco `Workspace.llmModel`/`prisma/schema.prisma:151-154`, env vars `JURIAI_LLM_MODEL`/`JURIAI_LLM_PROVIDER`, e o código) continuam sendo superfícies fisicamente separadas, que só um destes arquivos (`lib/llm.ts`) sabe compor — mudar a ordem exige ler `lib/llm.ts` para confirmar, não é óbvio de fora.
- Este próprio documento pode ficar desatualizado se o código mudar e ninguém atualizar a matriz — já aconteceu uma vez (ver histórico do arquivo) entre a extração para `lib/llm-config.ts` e esta revisão.

## 8. Router de execução — estado atual e próxima fase

**Já implementado** (fora do escopo original deste documento, que era só a matriz — ver histórico de commits `54cc2d3`, `a4ca03c`, `0297e36`, `e8f42a0`, `c528d2e`, `60445f4`):

- **Fonte declarativa central** (`lib/llm-config.ts`): `MODEL`, `SUPPORTED_MODELS`, listas de candidatos de modelo/região — extraídas de `lib/llm.ts`, sem mudança de comportamento na extração em si.
- **Registry de validação** (`lib/llm-registry.ts`): `validateWorkspaceLlmConfig` é a mesma função usada tanto na gravação do formulário admin (`app/actions/admin.ts`) quanto na resolução de runtime (`lib/llm.ts`) — um valor de workspace explícito e inválido sempre dá erro distinto (`unsupported_model`), nunca cai silenciosamente para env/default.
- **Router v1** (`lib/llm-router.ts`): ponto único de "qual IA roda essa tarefa" para `case-analysis`. `app/actions/analyze.ts` não fala mais direto com `analyzeCaseWithClaude`/`classifyLlmError`/`getLlmRuntimeState` — fala com `getLlmRouteState`/`routeCaseAnalysis`. A decisão de modelo/provider/fallback em si continua 100% dentro de `lib/llm.ts`, agora atrás desse seam.
- **Router v2, reduzido — só a política `automatic`** (`lib/llm-config.ts` + `lib/llm.ts`): quando nem o workspace nem a env var (`JURIAI_LLM_MODEL`) definem um modelo, o runtime resolve para `MODEL` (`claude-opus-4-7`) em vez de falhar com `missing_config`. O tipo `LlmExecutionPolicy` em `lib/llm-config.ts` tem hoje **um único membro**: `"automatic"`.
- **`economic`, `balanced` e `max_quality` NÃO estão habilitadas.** Não existem no tipo `LlmExecutionPolicy`, não há env var de seleção de política, não há mapeamento modelo-por-política além do automático. Qualquer menção a essas políticas em conversas/specs anteriores é intenção de produto ainda não implementada.
- **O override técnico por workspace continua existindo e continua vencendo.** `Workspace.llmProvider`/`llmModel` (formulário em `app/admin/subcontas/[id]/page.tsx`) seguem sendo a primeira fonte de verdade, sem nenhuma mudança de comportamento — a política `automatic` só entra quando workspace **e** env estão vazios (algo que antes sempre resultava em `missing_config`).

**Ainda em aberto:**

- Abrir `economic`/`balanced`/`max_quality` exigiria, no mínimo, um mapeamento política→modelo em código (fácil) e uma forma de escolher a política — hoje só dá pra ser um env var global (`JURIAI_LLM_POLICY`, ainda não implementado), não uma escolha por workspace, porque isso exige uma coluna nova em `Workspace` (schema), fora do escopo de qualquer fase feita até aqui.
- Com só 2 modelos reais na allowlist (ambos Claude), uma política de 4 rótulos naturalmente colapsa em poucos modelos distintos — isso é limitação de quantos modelos existem hoje (ver seção 5), não do desenho da política.
- Qualquer uma dessas mudanças mexe no runtime de IA de produção e deve seguir o fluxo `spec → build → review` do plugin `juriai-dev` (ver `AGENTS.md`, na raiz do projeto), com gates (`npm run lint`, `npx tsc --noEmit`, `check-schema-sync.sh`, `npm run test:e2e`) — não deve ser feita como edição ad hoc a partir deste documento.
