# Registro de handoffs e decisões

Use o barramento MCP para mensagens e transições operacionais. Registre aqui
somente decisões duráveis ou contexto que todos os papéis precisarão depois.

## Modelo

```text
DATA:
TAREFA:
DE -> PARA:
ESTADO ATUAL:
DECISÕES APROVADAS:
ARQUIVOS/EVIDÊNCIAS:
TESTES:
RISCOS/PENDÊNCIAS:
PRÓXIMO PASSO:
```

## 2026-07-14 — Formação da equipe

- O usuário humano é o coordenador e autoridade final.
- A equipe inicial tem PO, Fullstack, Cibersegurança, Marketing, Vendas e
  Sucesso do Cliente.
- Terminais independentes usam `juriai-agent-bus`; perfis internos do Codex
  ficam em `.codex/agents/`.
- O mesmo worktree não é isolamento. Escritores simultâneos devem usar
  worktrees separadas e integrar por revisão.

## 2026-07-14 — PILOTO-001 e hardening do Agent Bus

- Fluxo persistente coordenador -> PO -> Ciberseguranca -> Fullstack concluido
  com 12 eventos auditados e nenhuma alteracao de arquivo durante o piloto.
- Politica inicial: TTL de presenca de 300 segundos, com `reportedStatus`,
  `stale` e status efetivo `offline`.
- Identidade agora deriva de bearer exclusivo por agente; somente o coordenador
  cria/atribui/cancela tarefas ou autoriza conflito de escopo.
- O controller gerencia start/status/doctor/stop por token e `instanceId`; nao
  encerra instancia estrangeira ou legada.
- Tokens/RBAC sao guardrails entre processos confiaveis; isolamento contra um
  agente hostil exige UID, container ou sandbox separado por papel.
- Decisao humana ainda necessaria: manter 300 segundos como TTL definitivo apos
  observar o uso real dos terminais.

## 2026-07-15 — Matriz de aprovacao e revisao

- Toda mudanca relevante passa por um terminal revisor antes de concluir.
- `juriai-po` valida problema, requisito e criterio de aceite.
- `juriai-cybersecurity` revisa auth, dados, uploads, integracoes, IA sensivel
  e multi-tenant.
- `juriai-coordinator` faz o gate interno final e consolida `approved`,
  `changes_requested` ou `rejected`.
- O usuario humano continua sendo a autoridade final para producao, risco,
  preco, contrato e claim externo.

## 2026-07-15 — Gestao assumida e matriz provedor/modelo travada

- Por decisao do humano, `juriai-coordinator` atua como gestor operacional do
  time (delega, habilita modelos, atribui tarefas). Autoridade final segue humana.
- Matriz provedor/modelo TRAVADA (7 combinacoes distintas, validada por dry-run):
  - coordinator -> claude / claude-opus-4-8 (writePolicy: coordination-only)
  - po -> codex / o3 (read-only)
  - fullstack -> codex / gpt-5 (code-write, worktree propria)
  - cybersecurity -> claude / claude-sonnet-5 (read-only)
  - marketing -> gemini / gemini-2.5-pro (read-only)
  - sales -> gemini / gemini-2.5-flash (read-only)
  - customer-success -> claude / claude-haiku-4-5-20251001 (read-only)
- Racional: coordinator e fullstack (os dois que escrevem) ficam em provedores
  distintos; read-only pode repetir provedor sem risco de conflito.
- LACUNA ABERTA: `writePolicy` ainda NAO tem enforcement tecnico. Nenhuma flag de
  sandbox real (`-s read-only` no Codex, `--approval-mode plan` no Gemini,
  `--permission-mode plan` no Claude) e passada pelo launcher. Tarefa atribuida ao
  fullstack para corrigir. Ate la, "read-only" depende de aprovacao humana no terminal.
- INCIDENTE de governanca: houve escrita simultanea em `.agents/team.json` e
  `AGENTS.md` por outra sessao (Codex) durante a reconciliacao, apesar de pedido de
  stand-down. Prova concreta do risco de multi-writer. Regra reforcada: mudanca em
  `.agents/` e `scripts/team-*` exige tarefa reivindicada com writeScope; a sessao
  Codex primaria e tratada como "genese/infra" e deve reivindicar tarefa antes de
  editar esses arquivos.
- TTL de presenca de 300s confirmado como definitivo (implementado em store.mjs);
  remover calculo divergente de 120s em team-registry.mjs (tarefa do fullstack).

## 2026-07-15 — Sessao genesis/infra

- Algumas alteracoes iniciais dos artefatos da equipe foram feitas antes de uma
  formalizacao completa no Agent Bus.
- A partir deste ponto, qualquer mudanca em `.agents/`, `.codex/agents/` ou
  `scripts/team-*` deve ser reivindicada por tarefa antes de editar.
- Nao tratar essa excecao como regra permanente; e apenas a fronteira historica
  da primeira consolidacao do time.
