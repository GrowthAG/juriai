# Estado compartilhado do produto

Auditoria inicial: 2026-07-14. Este documento é uma fotografia operacional, não
uma promessa comercial. Atualize a classificação somente com evidência.

## Implementado

- Next.js 16.2.9, React 19, Prisma/PostgreSQL e deploy em Cloud Run.
- OAuth Google com cookie assinado e áreas MASTER/SUBCONTA.
- Controle de acesso por workspace, usuário e participação em caso.
- Escritórios, membros, clientes, casos, partes, provas, timeline e tarefas.
- Fluxos de análise por IA, rascunho/PDF e copilot com revisão humana.
- Integrações DataJud/DJEN e monitoramento de publicações.
- Planos e associação interna de Product/Price do Stripe.
- Onboarding de subconta e branding.

## Beta ou dependente do ambiente

- Ingestão assíncrona, armazenamento e varredura de malware.
- OAuth real, Cloud Tasks, Cloud SQL, secrets e integrações judiciais.
- Isolamento multi-tenant em todos os fluxos e bypass de desenvolvimento
  desligado em staging/produção.
- Configuração de IA e comportamento de provedores externos.

Esses itens precisam de smoke test no ambiente antes de serem apresentados
como disponibilidade garantida.

## Demo ou ainda sem prova operacional

- Saúde/observabilidade exibida no console.
- Limites de planos aplicados automaticamente.
- Suporte prioritário, SLA e health score de clientes.
- Analytics de produto, funil, NPS/CSAT e telemetria de adoção.

## Planejado ou incompleto

- Persistência dedicada de `LegalAnalysis` descrita em proposta.
- Checkout, portal e webhooks completos de assinatura.
- Portal do cliente.
- Central de ajuda, tickets, status page e playbooks operacionais completos.
- CI versionada e gates automáticos de entrega.
- Programa LGPD operacional: inventário, retenção, DPA, direitos do titular
  e evidências de controles.

## Claims que exigem suspensão ou qualificação

Não publicar sem evidência e aprovação humana:

- "Nunca inventa jurisprudência".
- "Economize até 95%".
- "Trabalha 24/7".
- "LGPD" como conformidade comprovada.
- "Sem fonte não avança" como garantia absoluta.
- Limites de plano, white-label, suporte prioritário e garantia de 30 dias.

Há uma inconsistência a revisar na mensagem "Anual: 10 meses no preço de
12" e uma divergência entre foco comercial cível e áreas adicionais exibidas
no wizard.

## Evidência mínima para mudar o estado

- Implementado: código + teste local relevante.
- Operacional: smoke test no ambiente com configuração real.
- Seguro: teste do controle + revisão de isolamento/ameaças.
- Comercializável: capacidade operacional + termos/claim aprovados.
