# Matriz de aprovacoes e revisao

Este documento define quem revisa o que, quem pode aprovar ou pedir alteracoes
e qual e a ordem de passagem entre terminais. O usuario humano continua sendo a
autoridade final para producao, risco, preco, contrato e comunicacao externa.

## Regra base

Toda tarefa relevante segue esta sequencia:

1. PO valida problema, escopo e criterio de aceite.
2. Ciberseguranca revisa qualquer area sensivel.
3. Fullstack implementa somente o escopo aprovado.
4. O coordenador revisa o entregavel e decide `approved`, `changes_requested`
   ou `rejected` para o fluxo interno.
5. O usuario humano aprova a liberacao final quando houver risco, producao,
   contrato, preco, claim externo ou mudanca material de escopo.

## Autoridade por tipo de mudanca

| Tipo de mudanca | Revisor obrigatorio | Pode aprovar | Pode pedir alteracoes | Observacao |
| --- | --- | --- | --- | --- |
| Requisitos, problema, criterio de aceite | `juriai-po` | `juriai-po` | `juriai-po`, `juriai-coordinator` | PO fecha entendimento, nao fecha release |
| Implementacao, testes, migracao | `juriai-coordinator` | `juriai-coordinator` | `juriai-coordinator`, `juriai-po` | Fullstack executa; coordenador faz gate final |
| Auth, dados, upload, segredo, multi-tenant, integracoes, IA sensivel | `juriai-cybersecurity` e `juriai-coordinator` | `juriai-cybersecurity` para risco tecnico, `juriai-coordinator` para fluxo | `juriai-cybersecurity`, `juriai-coordinator` | Se houver risco demonstravel, a tarefa volta com bloqueio ou cambios |
| Mensagem comercial, posicionamento e claim | `juriai-marketing` e `juriai-coordinator` | `juriai-marketing` para coerencia, `juriai-coordinator` para uso interno | `juriai-marketing`, `juriai-coordinator` | Nada externo sem evidência e aprovacão humana |
| Pitch, objeções, qualificacao e feedback de mercado | `juriai-sales` e `juriai-coordinator` | `juriai-sales` para discurso, `juriai-coordinator` para uso interno | `juriai-sales`, `juriai-coordinator` | Nao altera preco, contrato ou SLA |
| Onboarding, suporte, playbook e adocao | `juriai-customer-success` e `juriai-coordinator` | `juriai-customer-success` para operacao, `juriai-coordinator` para uso interno | `juriai-customer-success`, `juriai-coordinator` | Nao promete capacidade nao comprovada |

## Papel de cada terminal

- `juriai-coordinator`: revisor final interno do fluxo. Consolida divergencias,
  aprova ou devolve para alteracao e pede a decisao humana quando a mudanca
  excede o plano operacional.
- `juriai-po`: aprova problema, requisito, criterio de aceite e prioridade
  proposta.
- `juriai-fullstack`: executa a mudanca, produz evidencias e nunca e o revisor
  final do proprio trabalho.
- `juriai-cybersecurity`: aprova ou rejeita controles de seguranca e precisa de
  visibilidade antecipada em qualquer area sensivel.
- `juriai-marketing`, `juriai-sales` e `juriai-customer-success`: revisam
  comunicacao, feedback e playbooks, mas nao aprovam mudanca de produto sem o
  coordenador.

## Estados de revisao

Use estes estados nos handoffs e mensagens:

- `review_pending`
- `approved`
- `changes_requested`
- `rejected`

Quando houver `changes_requested`, a tarefa retorna ao responsavel anterior com
evidencia objetiva, impacto e recomendacao.
