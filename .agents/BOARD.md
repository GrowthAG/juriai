# Quadro coordenado

Somente o coordenador move prioridades. O barramento MCP é a fonte operacional
para atribuição/claim; este quadro registra a visão humana consolidada.

| Prioridade | Item | Responsável | Estado | Dependência / evidência |
| --- | --- | --- | --- | --- |
| P0 | Perfis, protocolo e barramento da equipe | coordenação | concluído | `team:doctor`, launchers e piloto aprovados |
| P0 | Separar produto implementado, beta, demo e planejado | PO | base inicial pronta | `.agents/PRODUCT_STATE.md`; validar com coordenador |
| P1 | MVP do cockpit operacional (`/workspace`) | PO + fullstack | painel entregue; lista de casos é o gap | `/workspace` já tem KPIs, fila de atenção, gráficos, tarefas e lacunas |
| P1 | Busca e filtros na lista de casos (`/workspace/casos`) | fullstack | spec pronta, aguardando claim | [specs/005-busca-filtro-casos.md](../../specs/005-busca-filtro-casos.md) |
| P1 | Threat model e hardening do Agent Bus | cibersegurança + fullstack | base P0 concluída | tokens individuais, RBAC, TTL, auditoria e lifecycle seguro; revisar limites restantes |
| P1 | Matriz de aprovação por papel | coordenação + PO + cyber | base pronta | [.agents/APPROVALS.md](./APPROVALS.md); falta smoke dos 7 terminais |
| P1 | CI, observabilidade e gates de release | PO + fullstack + cyber | não iniciado | decisão de escopo do coordenador |
| P1 | Programa LGPD operacional | cyber + PO + CS | não iniciado | revisão jurídica externa quando aplicável |
| P1 | Matriz claim -> evidência -> owner | marketing + sales + PO | não iniciado | estado do produto aprovado e revisado |
| P2 | Billing/enforcement e funil comercial | PO + fullstack + sales | não iniciado | decisão de modelo comercial |
| P2 | Onboarding, suporte e métricas de adoção | CS + PO | não iniciado | telemetria e SLA aprovados por terminal revisor |

## Caixa de entrada do coordenador

- Aprovar ou corrigir a fotografia em `.agents/PRODUCT_STATE.md`.
- Cockpit `/workspace` já entregue e maduro; a frente P1 concreta agora é a spec 005
  (busca/filtro na lista de casos) — menor risco, sem schema/auth, não precisa do cyber.
- Próxima ação: fullstack reivindica a spec 005 numa worktree própria; revisão por
  ux-ui (anti-vibecode) e gate final da coordenação.
- Evitar expandir escopo para monitoramento, billing ou governança antes do MVP do cockpit ficar útil e estável.
- Definir se especialistas não técnicos poderão editar documentos diretamente.
