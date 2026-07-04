# PRODUCT.md - JuriAI

## Visão do produto

JuriAI é um SaaS jurídico multi-tenant para escritórios de advocacia.

Ele existe para organizar operação jurídica real:
- clientes
- casos
- documentos
- evidências
- tarefas
- atividades
- membros do escritório
- contexto operacional

O produto não é um chat genérico.
O produto não é um painel de IA abstrato.
O produto não é uma ferramenta de produtividade genérica.

## Objetivo principal

Ajudar um escritório a:
- ver rapidamente o que importa
- localizar casos, clientes e documentos
- acompanhar evidências e pendências
- distribuir tarefas
- manter histórico claro
- operar com confiança e rastreabilidade

## Princípios de produto

1. Clareza operacional
- O usuário deve saber onde está, o que está vendo e qual é a próxima ação.

2. Densidade útil
- O produto pode ser denso, desde que organizado.
- O foco é informação prática, não decoração.

3. Contexto forte
- Sempre mostrar o escritório ativo.
- Sempre deixar claro o caso, cliente ou documento em foco.

4. Linguagem jurídica-operacional
- Usar termos que façam sentido para escritório de advocacia.
- Evitar linguagem genérica de produto digital.

5. Sofisticação sem ruído
- Interface premium, sóbria, editorial, limpa.
- Sem excessos visuais.

## Estrutura conceitual do produto

### Entidades centrais
- Escritório
- Membro
- Cliente
- Caso
- Documento
- Evidência
- Tarefa
- Atividade
- Notificação
- Permissão
- Comentário
- Anexo
- Histórico

### Relação entre entidades
- Um escritório tem membros, clientes, casos e documentos.
- Um cliente pode ter vários casos.
- Um caso pode ter vários documentos, evidências, tarefas e atividades.
- Um membro pode ser responsável por casos, tarefas e revisões.
- Atividades e histórico registram tudo que mudou.
- Notificações apontam para eventos relevantes.
- Permissões controlam acesso por contexto do escritório.

## O que precisa aparecer na UI

### Linguagem visível
Use:
- Escritório
- Meu Escritório
- Membros
- Clientes
- Casos
- Documentos
- Evidências
- Tarefas
- Atividades
- Configurações
- Responsável
- Status
- Prazo
- Revisão
- Atualizado
- Vinculado

### O que não deve aparecer na UI
- Subconta
- Chat genérico
- Robô
- Assistente mágico
- IA que faz tudo
- Ferramentas genéricas de produtividade
- Linguagem de marketing vazia

## Fluxos principais

### 1. Entrada no sistema
O usuário entra, vê o escritório ativo e entende imediatamente o contexto.
Se houver múltiplos contextos, a troca precisa ser explícita e visualmente clara.

Requisitos:
- nome do escritório visível
- estado de acesso claro
- ação primária fácil de localizar
- login simples e confiável

### 2. Acesso ao dashboard
O dashboard deve responder:
- o que está acontecendo agora
- o que exige atenção
- quais casos estão ativos
- quais documentos recentes importam
- quais tarefas estão vencendo
- quais evidências precisam de revisão

### 3. Navegação por casos
O usuário precisa encontrar um caso rápido e abrir seu contexto completo.

Cada caso deve mostrar:
- nome
- cliente vinculado
- status
- fase
- responsável
- prioridade
- última atualização
- próximas ações

### 4. Operação de caso
Ao abrir um caso, o usuário precisa ver:
- resumo
- linha do tempo
- documentos
- evidências
- tarefas
- membros envolvidos
- histórico
- metadados

O caso é o centro da operação.

### 5. Gestão documental
Documentos precisam ser fáceis de:
- localizar
- vincular
- classificar
- revisar
- auditar

Cada documento deve ter:
- nome
- tipo
- data
- responsável
- vínculo com caso e cliente
- status
- observação ou nota

### 6. Evidências
Evidências são parte crítica do produto.
Precisam ser tratadas com seriedade visual e estrutural.

Cada evidência deve mostrar:
- origem
- data
- vínculo com caso
- contexto
- notas
- status
- histórico de revisão

### 7. Tarefas e operação da equipe
Tarefas precisam funcionar como camada operacional do escritório.

Cada tarefa deve mostrar:
- título
- prazo
- responsável
- prioridade
- caso vinculado
- status
- origem
- data de atualização

### 8. Pessoas e permissões
Os membros do escritório precisam ser fáceis de visualizar e administrar.

Cada membro deve mostrar:
- nome
- função
- status
- permissões
- último acesso ou atividade
- vínculo com o escritório

## Telas principais

### Login
- limpo
- direto
- premium
- com confiança institucional
- sem marketing exagerado

### Dashboard
- resumo do escritório
- alertas
- casos recentes
- tarefas urgentes
- documentos recentes
- evidências pendentes
- atividade recente

### Casos
- lista densa, filtrável e escaneável
- visão em tabela ou cards, dependendo do contexto
- filtros fortes

### Caso
- página de operação central
- visão completa do caso
- timeline
- documentos
- evidências
- tarefas
- membros
- histórico

### Clientes
- lista e detalhe
- casos associados
- documentos relacionados
- observações
- contatos

### Documentos
- upload
- busca
- filtros
- classificação
- vínculo com caso e cliente

### Evidências
- organização por caso
- contexto claro
- status de revisão
- histórico

### Tarefas
- operação diária
- prioridade
- responsáveis
- prazos
- status

### Membros
- equipe do escritório
- papéis
- permissões
- atividade

### Configurações
- branding
- dados do escritório
- acessos
- integrações
- notificações
- preferências

## Regras de UX

1. Sempre mostrar contexto
- escritório ativo
- caso ativo
- cliente ativo
- documento ativo

2. Sempre priorizar a próxima ação
- o usuário deve conseguir agir sem adivinhar

3. Sempre permitir escaneabilidade
- títulos claros
- metadados úteis
- status visíveis
- hierarquia forte

4. Sempre manter calma visual
- nada caótico
- nada chamativo demais
- nada infantil

5. Sempre favorecer trabalho real
- listagens úteis
- filtros bons
- detalhes acessíveis
- histórico preservado

## Estados importantes

Desenhar estados para:
- vazio
- carregando
- erro
- sem permissão
- sem resultado
- sucesso
- atualização recente
- item pendente
- item revisado

## Direção de microcopy

A microcopy deve soar:
- clara
- profissional
- objetiva
- humana
- sem excesso de floreio

Exemplos bons:
- Escritório ativo
- Casos recentes
- Documentos recentes
- Tarefas pendentes
- Evidências em revisão
- Atualizado há 12 min
- Responsável definido
- Arquivo vinculado

Exemplos ruins:
- Sua jornada de IA
- Automatize tudo em segundos
- O futuro da advocacia
- Subconta ativa
- Seu assistente mágico jurídico

## Benchmark com Notion

Aprender com:
- clareza estrutural
- leitura simples
- organização de conteúdo
- navegação calma
- boa hierarquia
- sensação de controle

Não copiar:
- neutralidade excessiva
- aparência de workspace genérico
- falta de personalidade
- ausência de foco jurídico

## Benchmark com ClickUp

Aprender com:
- listas fortes
- status claros
- filtros úteis
- visão de operação
- produtividade visual
- eficiência na navegação

Não copiar:
- excesso de densidade sem sofisticação
- visual de ferramenta genérica
- poluição de UI
- agressividade visual de software de operação comum

## Diferença do JuriAI

JuriAI deve parecer:
- mais jurídico
- mais editorial
- mais focado em documentos e casos
- mais sofisticado
- mais sério
- mais institucional

Não deve parecer:
- CRM genérico
- kanban genérico
- wiki genérica
- chatbot com dashboard

## Regras de produto e banco

Se existir schema ou banco, considerar:
- multi-tenancy
- escritórios
- usuários/membros
- clientes
- casos
- documentos
- evidências
- tarefas
- atividades
- permissões
- comentários
- anexos
- histórico
- auditoria
- notificações

A UI deve refletir isso com precisão.

Se algum nome técnico legado existir no banco, ele não deve vazar para a interface se houver termo de produto melhor.

## Riscos a evitar

- criar UI bonita mas genérica
- esconder contexto do escritório
- usar termos técnicos demais na interface
- perder foco em casos e documentos
- criar navegação confusa
- imitar Notion ou ClickUp demais
- usar visual de legaltech clichê
- gerar telas que não ajudam operação real

## Resultado esperado

Ao final, o produto deve parecer:
- confiável
- sofisticado
- organizado
- útil
- sério
- pronto para uso real por escritórios de advocacia
