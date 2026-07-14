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
- Decisao humana ainda necessaria: manter 300 segundos como TTL definitivo apos
  observar o uso real dos terminais.
