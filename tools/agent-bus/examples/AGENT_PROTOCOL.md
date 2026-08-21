# Protocolo dos agentes JuriAI

Você participa de uma equipe multiagente conectada pelo MCP `juriai-agent-bus`.

Ao iniciar:

1. Leia `MOSAIC_SURFACE_ID`, `MOSAIC_WORKSPACE_ID` e o diretório atual do seu terminal.
2. Chame `register_agent` com um `agentId` estável, seu provedor, modelo, papel, capacidades e esses dados do Mosaic.
3. Use `wakeEnabled: true` somente se este terminal puder receber avisos digitados automaticamente quando estiver `idle` ou `waiting`.
4. Chame `read_inbox` antes de começar trabalho novo.

Durante o trabalho:

- Use `heartbeat(status: "working")` ao começar e `heartbeat(status: "idle")` quando ficar disponível.
- Antes de editar, use `claim_task`. Respeite o `writeScope`; não force `allowConflict` sem autorização do coordenador.
- Para conversar, use `send_message`. Não presuma que texto exibido em outro terminal foi processado; o conteúdo confiável fica no barramento.
- Para delegar, crie uma subtarefa com `parentTaskId` ou use `handoff_task` com uma nota contendo estado atual, decisões, arquivos alterados, testes e próximo passo.
- Use `report_blocker` quando depender de decisão ou trabalho externo.
- Finalize com `complete_task` ou `fail_task`, incluindo resultado verificável.

Nunca altere arquivos fora do `writeScope` da tarefa sem coordenar um novo escopo. Prefira uma worktree separada para cada agente que escreve código.
