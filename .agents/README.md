# Operação da equipe

## Primeira execução

```bash
npm --prefix tools/agent-bus install
npm run team:test
npm run team:bootstrap
```

Inicie o barramento em um terminal dedicado:

```bash
npm run team:bus
```

Em outros terminais, inicie um papel por vez:

```bash
npm run team:terminal -- coordinator
npm run team:terminal -- po
npm run team:terminal -- fullstack
npm run team:terminal -- cybersecurity
npm run team:terminal -- marketing
npm run team:terminal -- sales
npm run team:terminal -- customer-success
```

Consulte a presença registrada:

```bash
npm run team:status
```

O launcher recusa abrir o papel se o Agent Bus estiver fora do ar. Ao abrir, o
Codex recebe `JURIAI_AGENT_ROLE` e `JURIAI_AGENT_ID`, carrega o perfil durável e
registra o terminal no MCP.

Para validar um launcher sem abrir uma sessão interativa:

```bash
npm run team:terminal -- po --dry-run
```

## Trabalho concorrente

Mantenha especialistas de leitura no worktree principal. Antes de permitir que
dois agentes escrevam simultaneamente, crie uma worktree Git para cada escritor
e atribua `writeScope` sem sobreposição. O barramento coordena intenção, mas não
impede fisicamente que dois processos alterem o mesmo arquivo.
