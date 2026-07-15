# Operação da equipe

## Primeira execução

```bash
npm --prefix tools/agent-bus install
npm run team:test
npm run team:bootstrap
npm run team:up
```

O controller inicia o barramento autenticado em background. Verifique saude,
identidade da instancia, permissoes e perfis:

```bash
npm run team:doctor
npm run team:status
```

Em outros terminais, inicie um papel por vez. Codex continua sendo o padrão:

```bash
npm run team:terminal -- coordinator
npm run team:terminal -- po
npm run team:terminal -- fullstack
npm run team:terminal -- cybersecurity
npm run team:terminal -- marketing
npm run team:terminal -- sales
npm run team:terminal -- customer-success
```

Para distribuir os papéis entre modelos diferentes, selecione o provedor:

```bash
npm run team:terminal -- coordinator --provider codex
npm run team:terminal -- po --provider claude
npm run team:terminal -- cybersecurity --provider gemini
```

Também é possível fixar um modelo aceito pelo CLI escolhido:

```bash
npm run team:terminal -- fullstack --provider codex --model gpt-5
npm run team:terminal -- po --provider claude --model sonnet
npm run team:terminal -- marketing --provider gemini --model gemini-2.5-pro
```

Os aliases `openai`, `anthropic` e `google` também são aceitos. O launcher não
mistura a identidade com o modelo: `juriai-po`, por exemplo, continua sendo o
mesmo agente operacional se for executado hoje no Claude e futuramente no
Gemini. O histórico e o inbox permanecem no Agent Bus.

Consulte a presença registrada:

```bash
npm run team:status
```

O launcher recusa abrir o papel se o Agent Bus estiver fora do ar. Ao abrir, o
CLI recebe `JURIAI_AGENT_ROLE`, `JURIAI_AGENT_ID`, `JURIAI_AGENT_PROVIDER` e
`JURIAI_AGENT_MODEL`, alem do token exclusivo daquele papel. As credenciais
ficam em `tools/agent-bus/data/runtime/`, com permissao `0600`, fora do Git.

Para validar um launcher sem abrir uma sessão interativa:

```bash
npm run team:terminal -- po --provider claude --dry-run
```

Execute o piloto auditado da cadeia coordenador -> PO -> Ciberseguranca ->
Fullstack:

```bash
npm run team:pilot
```

Encerre somente a instancia gerenciada e autenticada:

```bash
npm run team:down
```

O controller nunca encerra uma porta estrangeira, uma instancia legada ou um
PID que nao corresponda simultaneamente ao `instanceId` e ao token de controle.

## Limite de seguranca local

Tokens, RBAC e challenge HMAC evitam erros de identidade, conexao com servidor
falso e operacoes administrativas acidentais. Eles nao isolam agentes hostis
executados sob o mesmo usuario do sistema operacional: processos com leitura
total do workspace podem ler o runtime ignorado pelo Git. Isolamento adversarial
exige usuarios do SO, containers ou sandboxes separados, cada um recebendo
somente seu token.

Para revogar todos os tokens depois de uma suspeita:

```bash
npm run team:down
npm run team:rotate
npm run team:up
```

## Trabalho concorrente

Mantenha especialistas de leitura no worktree principal. Antes de permitir que
dois agentes escrevam simultaneamente, crie uma worktree Git para cada escritor
e atribua `writeScope` sem sobreposição. O barramento coordena intenção, mas não
impede fisicamente que dois processos alterem o mesmo arquivo.
