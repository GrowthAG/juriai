# JuriAI Design System

Status: proposta inicial para validação.

Este documento é a porta de entrada da direção visual do JuriAI. Ele deve ser
lido antes da criação ou alteração de telas, componentes, estilos, ilustrações
ou animações.

## Propósito

O JuriAI é um ambiente operacional jurídico. A interface deve transmitir
clareza, confiança, domínio técnico e tranquilidade. O produto não deve parecer
um template genérico de SaaS, um experimento visual ou uma demonstração de IA.

O design deve ajudar profissionais jurídicos a:

- localizar informação rapidamente;
- compreender estado, prioridade, prazo e responsabilidade;
- trabalhar por longos períodos sem fadiga visual;
- confiar que ações críticas são deliberadas e reversíveis;
- operar o produto mesmo com pouca familiaridade técnica.

## Fontes de verdade

A precedência das decisões é:

1. requisitos e fluxos aprovados do produto;
2. este documento e os arquivos em `docs/design/`;
3. tokens e componentes implementados no código;
4. referências visuais e telas produzidas no Stitch;
5. preferências estéticas circunstanciais.

Quando documentação e código divergirem, a divergência deve ser apontada. O
agente não deve alterar silenciosamente a documentação para justificar o código,
nem redesenhar o código sem aprovação.

## Responsabilidades

- Claude Design: guardião das fundações, regras, coerência e crítica visual.
- Stitch: executor e explorador de telas dentro das regras aprovadas.
- Código: implementação verificável do sistema aprovado.
- Referências externas: material de estudo, nunca autorização automática para
  copiar estilos.

## Princípios

### Clareza operacional

Hierarquia, linguagem e estados devem explicar o que está acontecendo. Aparência
não pode competir com a tarefa.

### Autoridade serena

Usar contraste, ritmo e tipografia para comunicar confiança. Evitar ostentação,
efeitos futuristas e símbolos óbvios do universo jurídico usados como atalho
(balança, coluna grega, martelo de clip-art). O **gavel geométrico** próprio do
JuriAI é a exceção aprovada: é a marca registrada do produto, não um clichê de
banco de imagem (ver `ANTI-PATTERNS.md`).

### Densidade controlada

O produto pode apresentar bastante informação, mas deve usar agrupamento,
alinhamento e espaço para torná-la escaneável. Não transformar cada informação
em um cartão.

### Identidade por consistência

A identidade deve surgir da repetição disciplinada de tipografia, cor,
proporção, iconografia e movimento. Não depender de gradientes, ilustrações ou
efeitos decorativos para parecer autoral.

### Acessibilidade estrutural

Contraste, foco, tamanho de alvo, navegação por teclado, linguagem direta e
estados de erro são parte do design, não uma etapa posterior.

## Estado atual do código

`app/globals.css` implementa a marca aprovada (30/06/2026): **Brutalismo
Editorial**. Base monocromática branco/grafite com uma única Action Blue
(`#0057d8`), raio de 8px (teto do guardrail anti-vibecode), sem sombra,
profundidade por borda e tom. Os tokens de
cor e o trio tipográfico (Inter, Lora, JetBrains Mono via `next/font`) já estão
no código. O símbolo oficial é o **gavel geométrico** (favicon `app/icon.svg` e
monograma do sidebar; variantes em `public/brand/`).

A pilha `Arial, Helvetica, sans-serif` permanece apenas como fallback técnico da
família sans, atrás de Inter. A existência dessa pilha não autoriza o uso
arbitrário de outras famílias.

## Regras obrigatórias

- Ler este arquivo e os documentos relacionados antes de propor uma tela.
- Reutilizar tokens e padrões existentes sempre que atenderem ao problema.
- Explicar qualquer novo token, componente, fonte ou comportamento.
- Projetar estados normal, hover, focus, disabled, loading, empty e error quando
  aplicáveis.
- Preservar conteúdo realista em português brasileiro.
- Tratar desktop e responsividade como partes do mesmo sistema.
- Usar movimento somente quando ele comunica relação, mudança ou continuidade.
- Pedir aprovação antes de substituir uma fundação já adotada.

## Documentos relacionados

- [Tipografia](TYPOGRAPHY.md)
- [Anti-padrões](ANTI-PATTERNS.md)

Cor, espaçamento, iconografia, movimento e componentes serão documentados em
etapas posteriores, depois da validação das fundações.
