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

## 2026-07-15 — MVP do cockpit operacional

- O foco do produto ficou definido como um cockpit operacional simples:
  `app/workspace/page.tsx` como painel principal e `app/workspace/casos/page.tsx`
  como lista de entrada.
- Jornada minima validada:
  1. enxergar casos ativos, tarefas abertas/vencidas e lacunas;
  2. abrir um caso em poucos cliques;
  3. revisar e agir em tarefa, lacuna ou status do caso.
- Blocos de maior prioridade no MVP:
  - KPIs operacionais do workspace;
  - fila de tarefas/prazos;
  - lacunas abertas;
  - casos recentes;
  - lista de casos com acesso rapido ao detalhe.
- Itens explicitamente fora do recorte imediato:
  - monitoramento juridico experimental;
  - billing/enforcement;
  - analytics avançado e telemetria de funil;
  - refinamentos de governanca antes do fluxo principal provar valor.
- Regras de alinhamento:
  - PO fecha problema, criterio de aceite e prioridade do MVP;
  - fullstack executa apenas o cockpit e o detalhe de caso dentro do writeScope atribuido;
  - cyber entra apenas se houver mudanca sensivel em auth, dados, upload, segredo, multi-tenant ou IA;
  - marketing, vendas e CS ficam em espera para claims, pitch e playbooks ate haver fluxo principal provado.
- O quadro operacional deve refletir este recorte; qualquer nova frente de produto deve ser avaliada contra este MVP antes de ganhar prioridade.

## 2026-07-15 — Primeira camada do cockpit aplicada

- `app/workspace/page.tsx` recebeu uma `Fila de atenção` acima dos gráficos.
- A fila combina tarefas abertas e lacunas abertas já existentes, sem introduzir
  novos fluxos ou rotas.
- A intenção é reduzir a leitura do workspace para três respostas rápidas:
  `agora`, `atenção` e `tarefas abertas`.
- Validação local executada: `npm run lint`, `npx tsc --noEmit`,
  `git diff --check`.

## 2026-07-15 — Cockpit alinhado às 3 verticais

- `app/workspace/page.tsx` agora mostra o nicho ativo do escritório com base
  nos domínios dos casos existentes.
- O topo passou a exibir a vertical principal e os contadores das 3 verticais
  mais presentes no workspace.
- Foi adicionado um bloco curto de "Próximo passo por vertical" para cível,
  trabalhista e tributário, sem criar nova arquitetura.
- O restante da tela continua centrado em fila de atenção, tarefas abertas e
  casos recentes.

## 2026-07-15 — Reconciliação da matriz e enforcement confirmado

DE -> PARA: coordenação -> equipe
ESTADO ATUAL:
- DRIFT detectado: `.agents/team.json` no disco tinha `po` e `fullstack` ambos em
  `codex/gpt-5.4-mini` (só 6 combos distintos), divergindo da matriz TRAVADA neste
  HANDOFF (po=codex/o3, fullstack=codex/gpt-5). Sintoma do multi-writer já registrado.
- RECONCILIADO: `team.json` alinhado de volta à matriz durável — 7 combos
  provedor+modelo agora todos distintos (validado: `distintos:7 dup:nenhum`).
DECISÕES APROVADAS (pelo humano, "execute da melhor maneira"):
- Fonte de verdade é o HANDOFF; arquivo volta a refleti-lo. Modelo forte no único
  papel que escreve (fullstack=gpt-5); o3 no po (read-only).
- `writePolicy` enforcement dos launchers ACEITO e commitado (era untracked).
ARQUIVOS/EVIDÊNCIAS:
- `scripts/team-terminal.mjs` — traduz writePolicy em flag de sandbox real por
  provedor (codex `-s read-only/-a never` vs `-s workspace-write/-a on-request`;
  claude `--permission-mode plan/acceptEdits`; gemini `--approval-mode plan/auto_edit`).
- `scripts/team-registry.mjs` — TTL divergente de 120s removido; alinhado a 300s do store.
TESTES: dry-run dos 7 papéis confirma modelo correto + "Policy real" com flag de
  sandbox por papel. Nenhum papel resolve sem enforcement.
RISCOS/PENDÊNCIAS:
- Disponibilidade real de `o3` e `gpt-5` na conta Codex só é provável no smoke de
  launch (dry-run não chama o modelo). Se algum não existir, falha visível no
  terminal do papel — fix de 1 linha no `team.json`.
- Enforcement provado em dry-run; ainda falta o SMOKE HUMANO: abrir os 7 terminais
  um a um e confirmar presença/policy no bus sem colisão.
PRÓXIMO PASSO: smoke test humano dos 7 papéis (comandos entregues pelo coordenador).

## 2026-07-15 — Smoke real dos 7 terminais no Mosaic (fleet no ar)

DE -> PARA: coordenação -> equipe
ESTADO ATUAL:
- Os 7 papéis foram LANÇADOS de verdade em painéis visíveis do Mosaic via
  `mosaic workspace create --command 'node scripts/team-terminal.mjs <papel>'`.
  O painel do Mosaic fornece TTY real (`/dev/ttysNNN`), que era a peça que faltava
  para os CLIs interativos subirem — o erro "stdin is not a terminal" só ocorria ao
  lançar do Bash sem terminal. Mecanismo confirmado.
- RESULTADO do smoke: 5/7 subiram de primeira (coordinator/claude-opus, marketing e
  sales/gemini, cybersecurity e customer-success/claude). Todos registram no bus e
  ficam gated por policy (pausam em prompt de aprovação antes de agir) — enforcement
  observado ao vivo.
DECISÃO/CORREÇÃO (reality wins sobre a matriz aspiracional):
- A matriz TRAVADA anterior (po=codex/o3, fullstack=codex/gpt-5) nomeava modelos que a
  conta Codex NÃO suporta. Erro real no launch: `{"status":400,... "The 'o3' model is
  not supported when using Codex with a ChatGPT account."}` (idem gpt-5). O login do
  Codex é conta ChatGPT, cujo modelo suportado é o default `gpt-5.6-sol`
  (`~/.codex/config.toml`).
- CORRIGIDO em `.agents/team.json`: po e fullstack -> codex/`gpt-5.6-sol`. Ambos os
  papéis Codex agora compartilham modelo, MAS a invariante anti-colisão real é
  preservada: os dois papéis que ESCREVEM (coordinator=claude, fullstack=codex) seguem
  em provedores distintos; po é read-only e pode repetir modelo sem risco (racional já
  registrado neste HANDOFF). A "distinção de 7 modelos" era nice-to-have, não invariante.
- Enforcement segue intacto no dry-run pós-fix: po `sandbox=read-only approval=never`;
  fullstack `sandbox=workspace-write approval=on-request`.
ARQUIVOS/EVIDÊNCIAS: `.agents/team.json` (po/fullstack -> gpt-5.6-sol); painéis Mosaic
  workspace:4 (coordinator) e 7–12 (demais); tabela `team-registry status` com presença
  fresca dos 7.
RISCOS/PENDÊNCIAS:
- Se no futuro a conta Codex passar a expor modelos distintos (API key com o3/gpt-5),
  reavaliar a distinção de modelo entre po e fullstack. Por ora, `gpt-5.6-sol` é o real.
- Os agentes ficam idle após registrar: só agem com tarefa atribuída e reivindicada.
  Para "vê-los trabalhando de fato", o coordenador precisa atribuir uma tarefa (candidata
  natural: spec 005, já implementada e aguardando revisão).
PRÓXIMO PASSO: coordenador atribui a primeira tarefa real (spec 005) para o fullstack
  reivindicar numa worktree, com revisão de ux-ui; humano aprova o merge.

## 2026-07-15 — PIVÔ ESTRATÉGICO: vertical Trabalhista + diferencial RAG-com-fontes

DE -> PARA: coordenação (decisão delegada pelo humano: "você que manda e toma as decisões")
FONTE: call com Rodrigo Avila (Head de Operações, Aleve LegalTech Ventures — venture
  builder), 2026-07-15. Doc: `Calls Especialistas/30 min with Giulliano (Rodrigo Avila...).md`.

DIAGNÓSTICO DO ESPECIALISTA:
- Produto atual = "ERP jurídico" em OCEANO VERMELHO (Projuris, CPJ/Preâmbulo, AdvBox).
  Maior barreira: custo de troca de plataforma dos escritórios.
- Conselho central: NÃO ser plataforma ampla; escolher UM nicho. "Tecnologia virou
  commodity; o diferencial é o modelo de negócio."
- Diferencial técnico exigido: RAG com FONTE + link do tribunal em todo argumento (a IA
  usa só os documentos do usuário). Alinha 1:1 com a nossa promessa anti-alucinação.
- Nichos apontados: Trabalhista e Tributário (contexto: jornada 6x1, reforma tributária).

DECISÕES APROVADAS (coordenação, autoridade delegada):
1. NICHO-LÍDER = TRABALHISTA. Tributário vira fast-follow #2. Racional (verificado no
   repo): pack trabalhista é o mais fundo (`plugin-juriai/domain-packs/trabalhista`: 4
   modelos incl. cálculo de verbas + 3 skills) e a "jornada 6x1" dá urgência de mercado.
2. ESTRELA TÉCNICA = camada de REFERÊNCIAS CITÁVEIS (fonte/link de tribunal) sobre os
   documentos do usuário. Hoje é BURACO: `docs/30-knowledge-base` vazio e NÃO existe
   tabela `Reference` no Prisma (só `IngestionJob`/`AuditEntry`/`Draft`). Este é o
   verdadeiro diferencial — maior prioridade estratégica que a spec 005.
3. NÃO thrashar o writer: fullstack mantém FS-ENFORCE-002 -> spec 005 (plumbing útil e de
   baixo risco em qualquer vertical). Em PARALELO, PO produz o brief de pivô e a equipe
   especifica a camada de referências. Fullstack pivota para o RAG quando a spec existir.

LIMITE CONSTITUCIONAL (segue 100% humano, NÃO delegado):
- Comunicação externa (atualizar o Rodrigo/WhatsApp), equity/parceria com a Aleve,
  preço/contrato, release em produção, e o outreach de POC com advogados reais.

ARQUIVOS/EVIDÊNCIAS: `.agents/BOARD.md` (reprioridade), tarefa `PO-PIVOT-001` no bus.
RISCOS/PENDÊNCIAS:
- Pivô de posicionamento amplo -> vertical exige cortar/esconder áreas do wizard
  (o `PRODUCT_STATE` já anota a divergência cível vs áreas exibidas). Decisão de recorte
  fica no brief do PO.
- A camada de referências toca ingestão/dados = área sensível: revisão de cibersegurança
  obrigatória antes de implementar.
PRÓXIMO PASSO: PO reivindica PO-PIVOT-001 (brief do pivô trabalhista + plano de POC);
  coordenador consolida e leva as decisões externas ao humano.
