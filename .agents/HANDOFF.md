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
