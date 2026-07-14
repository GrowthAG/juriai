# JuriAI Agent Bus

Barramento MCP local para agentes de modelos diferentes conversarem e passarem tarefas entre terminais do Mosaic.

## Como a conexão funciona

Os terminais não precisam abrir conexões diretas uns com os outros. Cada CLI de agente funciona como cliente MCP e se conecta ao mesmo servidor HTTP:

```text
Codex ──────┐
Claude ─────┼── MCP HTTP ── JuriAI Agent Bus ── SQLite
Gemini ─────┘                      │
                                  └── Mosaic CLI ── aviso no terminal destinatário
```

O SQLite é a fonte de verdade para agentes, mensagens, tarefas, handoffs e eventos. O Mosaic fornece a identidade visual do terminal (`MOSAIC_SURFACE_ID`) e, opcionalmente, acorda um terminal ocioso. Mesmo que um aviso do Mosaic falhe, a mensagem continua segura na caixa de entrada.

Isso torna o desenho independente do modelo: qualquer ferramenta que implemente MCP Streamable HTTP pode entrar no mesmo barramento.

## Iniciar

Requer Node.js 20 ou mais recente.

```bash
npm --prefix tools/agent-bus install
npm run team:bootstrap
npm run team:up
npm run team:doctor
```

O endpoint será `http://127.0.0.1:8766/mcp` e a verificação de saúde, `http://127.0.0.1:8766/health`. A porta `8766` foi escolhida porque `8765` já é usada por outro serviço neste ambiente.

`team:up` cria uma instancia gerenciada em background. `team:status` combina a
saude HTTP com a presenca efetiva; `team:down` encerra somente uma instancia
cujo token, PID e `instanceId` correspondam ao runtime local. Estado e
credenciais ficam em `data/runtime/`, ignorado pelo Git e com permissao local
restrita.

Para habilitar avisos automáticos no Mosaic:

```bash
JURIAI_MOSAIC_WAKE=1 npm run team:up
```

O wake é desligado por padrão porque ele usa `mosaic send` e `mosaic send-key` para digitar um aviso no terminal. O aviso só é enviado quando o agente também se registrou com `wakeEnabled: true` e declarou estado `idle` ou `waiting`.

As demais variáveis estão em [.env.example](./.env.example). O servidor não carrega esse arquivo automaticamente; exporte as variáveis no shell ou use seu gerenciador de processos.

## Conectar cada modelo

Use um destes exemplos, depois reinicie o CLI do agente para ele carregar o servidor MCP:

- Codex: [examples/codex.config.toml](./examples/codex.config.toml), em `.codex/config.toml` ou `~/.codex/config.toml`.
- Claude Code: [examples/claude.mcp.json](./examples/claude.mcp.json), em `.mcp.json` na raiz do projeto.
- Gemini CLI: copie o bloco de [examples/gemini.settings.json](./examples/gemini.settings.json) para `.gemini/settings.json`.

Não copie o arquivo Gemini por cima de configurações existentes; mescle apenas a chave `mcpServers`. O mesmo vale para os outros clientes.

Autenticacao e obrigatoria. `team:bootstrap` gera um bearer exclusivo de 256
bits por `agentId`; `team:terminal` injeta apenas o token do papel iniciado. O
servidor deriva a identidade do token e rejeita `agentId`, `fromAgent` ou
`createdBy` de outro principal. O modo sem autenticacao existe apenas para
testes locais com `JURIAI_AGENT_BUS_ALLOW_INSECURE_LOCAL=1`.

## Registrar um terminal

Em cada terminal do Mosaic, confira sua identidade:

```bash
printf '%s\n' "$MOSAIC_SURFACE_ID" "$MOSAIC_WORKSPACE_ID"
```

Então peça ao próprio agente para chamar algo equivalente a:

```json
{
  "tool": "register_agent",
  "arguments": {
    "agentId": "codex-backend-1",
    "provider": "openai",
    "model": "gpt-5",
    "role": "backend",
    "surfaceId": "valor de MOSAIC_SURFACE_ID neste terminal",
    "workspaceId": "valor de MOSAIC_WORKSPACE_ID neste terminal",
    "cwd": "/caminho/da/worktree",
    "capabilities": ["typescript", "api", "tests"],
    "status": "idle",
    "wakeEnabled": true
  }
}
```

O servidor HTTP deriva o `agentId` autenticado do bearer. O payload ainda envia
o ID para validacao explicita e associa o `surfaceId` do terminal; divergencias
sao recusadas e auditadas.

Use [examples/AGENT_PROTOCOL.md](./examples/AGENT_PROTOCOL.md) como instrução compartilhada nos CLIs para automatizar essa disciplina.

## Conversa entre terminais

Exemplo: Codex pergunta algo ao Gemini.

1. Codex chama `send_message` com `fromAgent: "codex-backend-1"`, `toAgent: "gemini-review-1"` e `kind: "question"`.
2. O barramento grava a mensagem no SQLite.
3. Se o wake estiver habilitado e o Gemini estiver ocioso, o Mosaic digita somente: “consulte `read_inbox`”.
4. Gemini chama `read_inbox({ agentId: "gemini-review-1" })`, processa a pergunta e responde com `send_message`.
5. Se for importante confirmar processamento, Gemini chama `acknowledge_message`.

Esse fluxo é assíncrono: o remetente não fica bloqueado esperando o outro modelo responder.

## Passar uma tarefa

Fluxo recomendado:

1. O coordenador chama `create_task`, informando `assignedTo`, contexto e `writeScope`.
2. O destinatário chama `read_inbox` e depois `claim_task`.
3. Ao trabalhar, ele mantém `heartbeat: working`.
4. Para transferir, chama `handoff_task` com uma nota objetiva.
5. O próximo agente assume com `claim_task` e termina com `complete_task`.

Ferramentas disponíveis:

- Presença: `register_agent`, `list_agents`, `heartbeat`.
- Tarefas: `create_task`, `list_tasks`, `get_task`, `assign_task`, `claim_task`, `handoff_task`, `report_blocker`, `complete_task`, `fail_task`, `cancel_task`.
- Conversa: `send_message`, `read_inbox`, `acknowledge_message`.
- Auditoria: `list_events`, exclusiva do coordenador.

Somente o coordenador cria/atribui/cancela tarefas e pode autorizar conflito de
escopo. Especialistas acessam apenas sua presenca, inbox e tarefas relacionadas.
Presenca expira para `offline` apos 300 segundos sem renovacao; o estado
declarado continua disponivel como `reportedStatus` para diagnostico.

## Evitar conflitos no código

`writeScope` recebe caminhos relativos, por exemplo `app/api/cases` ou `lib/auth.ts`. Ao assumir ou reatribuir uma tarefa, o barramento bloqueia escopos iguais, pais ou filhos que já estejam ativos com outro agente.

Essa proteção coordena intenção, mas não substitui isolamento de Git. Para agentes que escrevem simultaneamente, use uma worktree por agente e deixe o coordenador integrar commits revisados.

## Testar

```bash
npm --prefix tools/agent-bus test
```

Os testes cobrem provedores, presença/TTL, inbox, claim, conclusão, handoff,
conflito de escopo, tokens por agente, impersonacao, RBAC e auditoria.

## Próximos níveis

Este MVP é para agentes locais no mesmo computador. Quando agentes rodarem em outras máquinas, acrescente TLS, autenticação forte, autorização vinculada à identidade real do cliente e um broker como NATS ou Redis. Se os agentes virarem serviços autônomos descobertos pela rede, A2A pode ser adicionado na borda; o MCP continua útil como interface de ferramentas dentro de cada agente.
