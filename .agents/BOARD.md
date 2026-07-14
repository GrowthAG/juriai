# Quadro coordenado

Somente o coordenador move prioridades. O barramento MCP é a fonte operacional
para atribuição/claim; este quadro registra a visão humana consolidada.

| Prioridade | Item | Responsável | Estado | Dependência / evidência |
| --- | --- | --- | --- | --- |
| P0 | Perfis, protocolo e barramento da equipe | coordenação | em validação | `npm run team:test` e smoke HTTP |
| P0 | Separar produto implementado, beta, demo e planejado | PO | base inicial pronta | `.agents/PRODUCT_STATE.md`; validar com coordenador |
| P1 | Threat model e hardening do Agent Bus | cibersegurança | não iniciado | identidade por agente, RBAC, expiração, auditoria |
| P1 | CI, observabilidade e gates de release | PO + fullstack + cyber | não iniciado | decisão de escopo do coordenador |
| P1 | Programa LGPD operacional | cyber + PO + CS | não iniciado | revisão jurídica externa quando aplicável |
| P1 | Matriz claim -> evidência -> owner | marketing + sales + PO | não iniciado | estado do produto aprovado |
| P2 | Billing/enforcement e funil comercial | PO + fullstack + sales | não iniciado | decisão de modelo comercial |
| P2 | Onboarding, suporte e métricas de adoção | CS + PO | não iniciado | telemetria e SLA aprovados |

## Caixa de entrada do coordenador

- Aprovar ou corrigir a fotografia em `.agents/PRODUCT_STATE.md`.
- Escolher a primeira frente P1 depois da validação da equipe.
- Definir se especialistas não técnicos poderão editar documentos diretamente.
