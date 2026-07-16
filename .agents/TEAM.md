# Equipe multiagente JuriAI

## Autoridade

O usuário humano é o coordenador. Somente ele aprova prioridade, expansão de
escopo, comunicação externa, produção, preço, contrato e aceitação de risco. O
agente `juriai-coordinator` organiza informação e tarefas, mas não substitui a
decisão humana.

## Papéis

| ID | Papel | Responsabilidade | Escrita padrão |
| --- | --- | --- | --- |
| `juriai-coordinator` | Coordenação | Priorizar, delegar, integrar e escalar decisões | Apenas artefatos de coordenação |
| `juriai-po` | Product Owner | Problema, requisitos, aceite e roadmap | Somente leitura |
| `juriai-fullstack` | Fullstack | Arquitetura, implementação, testes e migrações | Código no `writeScope` atribuido |
| `juriai-cybersecurity` | Cibersegurança | Ameaças, AppSec, privacidade e controles | Somente leitura |
| `juriai-marketing` | Marketing | Posicionamento, mensagem, aquisição e experimento | Somente leitura |
| `juriai-sales` | Vendas | Qualificação, pitch, objeções e feedback | Somente leitura |
| `juriai-customer-success` | Sucesso do Cliente | Onboarding, adoção, retenção e voz do cliente | Somente leitura |

Autorização explícita pode liberar escrita documental para um especialista. A
escrita simultânea de código exige worktrees separadas.

Veja a matriz operacional em [.agents/APPROVALS.md](./APPROVALS.md) para saber
quem aprova, quem pode pedir alteracoes e qual terminal faz o gate final por
tipo de mudanca.

## Fluxo

1. O coordenador informa objetivo, escopo, prioridade e restrições.
2. O PO transforma o objetivo em resultado, requisitos e critérios de aceite.
3. Cibersegurança revisa antecipadamente mudanças de autenticação, dados,
   integrações, infraestrutura ou IA sensível.
4. Fullstack implementa somente o escopo aprovado e produz evidências.
5. Marketing, Vendas e Sucesso do Cliente revisam apenas claims e playbooks
   confirmados na matriz de estado.
6. O coordenador consolida opcoes, aplica o gate interno de revisão e devolve
   `approved`, `changes_requested` ou `rejected`.
7. O usuário humano decide sobre producao, risco, preco, contrato e claims
   externos.

## Entrada obrigatória de uma tarefa

```text
OBJETIVO:
ESCOPO:
CONTEXTO/FONTES:
ENTREGÁVEL:
PRIORIDADE:
PODE ALTERAR ARQUIVOS?:
WRITE_SCOPE:
DEPENDÊNCIAS:
```

## Saída obrigatória

```text
STATUS: concluído | parcial | bloqueado
RESULTADO:
EVIDÊNCIAS:
ARQUIVOS ALTERADOS:
DECISÕES TOMADAS:
RISCOS/PENDÊNCIAS:
DECISÃO NECESSÁRIA DO COORDENADOR:
PRÓXIMA AÇÃO RECOMENDADA:
```

## Regras de conflito

- Uma tarefa possui um responsável e um `writeScope` por vez.
- Nenhum terminal desfaz ou incorpora silenciosamente alterações de outro.
- PO define o que e por quê; Fullstack define como; Cibersegurança define os
  controles mínimos; áreas comerciais definem comunicação e aprendizado.
- O coordenador sempre exerce o papel de revisor final interno; o usuário
  humano continua sendo a autoridade final para releases e risco.
- Divergências retornam ao coordenador como opções, impactos e recomendação.
- Toda afirmação sobre o produto aponta para código, teste, documento ou dado.
- Memória de conversa não é fonte de verdade; use os arquivos em `.agents/` e
  o barramento MCP.

## Capacidade operacional

Os sete perfis podem permanecer cadastrados. Uma sessão local do Codex pode
ter limite menor de simultaneidade; nesse caso, o coordenador ativa os papéis
necessários por etapa. Terminais independentes se comunicam pelo Agent Bus e
não pela memória interna de uma sessão.
