# Quadro coordenado

Somente o coordenador move prioridades. O barramento MCP é a fonte operacional
para atribuição/claim; este quadro registra a visão humana consolidada.

| Prioridade | Item | Responsável | Estado | Dependência / evidência |
| --- | --- | --- | --- | --- |
| **P0** | **PIVÔ: vertical Trabalhista (nicho-líder)** | PO + coordenação | **decidido, brief pendente** | Call Rodrigo/Aleve (2026-07-15); pack trabalhista já fundo; tarefa `PO-PIVOT-001` |
| **P0** | **Camada de referências citáveis (RAG com fonte/link de tribunal)** | PO + fullstack + cyber | **estrela técnica, sem spec** | Buraco real: `docs/30-knowledge-base` vazio, sem tabela `Reference` no Prisma |
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

- **PIVÔ DECIDIDO (coordenação, autoridade delegada):** nicho-líder = Trabalhista;
  Tributário fast-follow. Estrela técnica = camada de referências com fonte/link de
  tribunal. Registro durável no HANDOFF (2026-07-15 — PIVÔ ESTRATÉGICO).
- **PO:** reivindicar `PO-PIVOT-001` — brief do pivô (proposta de valor trabalhista,
  o que cortar do "amplo", plano de POC com advogados, métrica de sucesso).
- **Fullstack:** manter FS-ENFORCE-002 -> spec 005 (plumbing de baixo risco); NÃO iniciar
  o RAG sem spec. A camada de referências toca dados/ingestão -> revisão de cyber obrigatória.
- **Decisões que seguem 100% do humano:** falar com o Rodrigo, equity/Aleve, preço/contrato,
  produção, outreach de POC com advogados reais.
- Aprovar ou corrigir a fotografia em `.agents/PRODUCT_STATE.md`.
- Definir se especialistas não técnicos poderão editar documentos diretamente.
