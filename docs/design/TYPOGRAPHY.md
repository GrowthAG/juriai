# Tipografia

Status: proposta para seleção e validação. Nenhuma fonte está aprovada para
instalação nesta etapa.

## Objetivo

A tipografia do JuriAI deve equilibrar leitura operacional, credibilidade
jurídica e personalidade própria. Ela precisa funcionar em formulários, tabelas,
prazos, documentos, nomes longos, valores monetários, números de processo e
textos em português.

## Princípios

- Legibilidade vem antes de originalidade.
- A interface deve usar no máximo duas famílias tipográficas.
- A família de interface deve funcionar bem entre 12 px e 20 px.
- A família editorial, se adotada, deve aparecer apenas onde acrescenta
  hierarquia e autoridade.
- Pesos, tamanhos e espaçamento devem construir hierarquia; não usar famílias
  adicionais para resolver hierarquia.
- Algarismos precisam ser claramente distinguíveis e suportar alinhamento
  tabular.
- A fonte deve possuir acentos e caracteres completos para português.
- Licença e arquivos devem permitir uso legítimo e previsível no produto.

## Estado atual

Direção aprovada (30/06/2026): **Brutalismo Editorial**. O trio tipográfico
oficial é:

- **Inter** — interface, corpo, controles, formulários, tabelas, navegação.
- **Lora** (serifada) — títulos, números de destaque e abertura editorial.
- **JetBrains Mono** — IDs, prazos, números de processo e trilhas de auditoria.

As três são carregadas via `next/font` no `app/layout.tsx`, que self-hospeda os
arquivos (sem requisição remota em runtime, atendendo à regra de não importar
fonte remota). As variáveis `--font-inter`, `--font-lora` e `--font-jetbrains`
alimentam os tokens `--font-sans`, `--font-serif` e `--font-mono` no
`globals.css`. `Arial, Helvetica, sans-serif` permanece apenas como fallback
técnico da pilha sans.

## Direções candidatas

As candidatas devem ser avaliadas com conteúdo real do produto, nunca apenas por
amostras promocionais.

### Direção A — precisão editorial

- Interface: Source Sans 3.
- Editorial: Source Serif 4.
- Característica: leitura neutra, documentação extensa e hierarquia jurídica
  sem aparência antiquada.
- Risco: pode parecer institucional demais se composição e contraste forem
  genéricos.

### Direção B — autoridade técnica

- Interface: IBM Plex Sans.
- Editorial: IBM Plex Serif.
- Característica: personalidade reconhecível, números fortes e linguagem
  técnica coerente.
- Risco: pode aproximar o produto de uma identidade tecnológica corporativa se
  usada sem adaptação.

### Direção C — identidade humanista

- Interface: Libre Franklin.
- Editorial: Literata.
- Característica: interface sóbria com presença editorial mais humana.
- Risco: exige controle rigoroso para que a família serifada não domine áreas
  operacionais.

Nenhuma direção pode ser declarada vencedora sem um comparativo aplicado pelo
menos a login, navegação, tabela de casos, detalhe de processo e documento.

## Distribuição de papéis

### Família de interface

Usar em:

- navegação;
- botões e controles;
- formulários;
- tabelas;
- metadados;
- estados e mensagens;
- textos operacionais.

### Família editorial

Se aprovada, usar somente em:

- títulos institucionais selecionados;
- abertura de documentos ou análises;
- destaques editoriais com conteúdo relevante.

Não usar serifada em tabelas, botões, campos, badges, navegação ou textos
pequenos.

### Monoespaçada

Não faz parte da identidade principal. Pode ser usada de forma localizada em
identificadores técnicos, logs ou trechos de código. Números de processo não
devem ser monoespaçados automaticamente; primeiro testar algarismos tabulares da
família de interface.

## Escala inicial

Esta escala é um ponto de partida, não autorização para aplicá-la sem contexto.

| Papel | Tamanho | Altura de linha | Peso inicial |
| --- | ---: | ---: | ---: |
| Legenda | 12 px | 16 px | 400–500 |
| Texto auxiliar | 14 px | 20 px | 400–500 |
| Corpo | 16 px | 24 px | 400 |
| Corpo destacado | 16 px | 24 px | 600 |
| Subtítulo | 18 px | 26 px | 600 |
| Título de seção | 24 px | 32 px | 600–700 |
| Título de página | 30 px | 38 px | 600–700 |
| Título institucional | 40–48 px | 46–54 px | 500–700 |

Regras:

- Evitar corpo abaixo de 14 px.
- Não usar peso 300 em conteúdo operacional.
- Não usar peso 800 ou 900 como padrão de títulos.
- Não reduzir altura de linha para encaixar conteúdo.
- Usar `font-variant-numeric: tabular-nums` onde colunas numéricas precisarem de
  alinhamento.
- Uppercase é reservado para rótulos curtos; não usar em frases.
- Tracking expandido é permitido apenas em rótulos curtos, com moderação.

## Catálogo e instalação

Quando uma direção for aprovada:

1. registrar nome, versão, origem e licença;
2. armazenar apenas os arquivos e pesos usados pelo produto;
3. manter os arquivos aprovados em `public/fonts/` ou no diretório definido pela
   implementação oficial do Next.js;
4. carregar as fontes pela solução local recomendada pela versão instalada do
   Next.js;
5. manter fallbacks explícitos;
6. impedir imports remotos de fontes em CSS e componentes;
7. documentar qualquer atualização de versão.

Não baixar, converter, renomear ou instalar arquivos de fonte antes da aprovação
da direção e da licença.

## Lista de restrição inicial

As famílias abaixo não devem ser introduzidas por conveniência ou padrão de
ferramenta:

- Inter;
- Geist;
- Manrope;
- Poppins;
- Space Grotesk;
- Montserrat;
- Roboto.

Isso não afirma que sejam fontes ruins. A restrição existe porque seu uso
automático tende a produzir uma estética genérica e reduz a diferenciação do
JuriAI. Qualquer exceção exige justificativa e aprovação explícita.

> Exceção aprovada (30/06/2026): **Inter** foi adotada deliberadamente como a
> família de interface do trio oficial (ver "Estado atual"), não por
> conveniência de ferramenta. A restrição segue valendo para Geist, Manrope,
> Poppins, Space Grotesk, Montserrat e Roboto.

## Teste obrigatório

Cada direção deve ser comparada com os mesmos conteúdos:

- `0001234-56.2026.8.26.0100`;
- `Ação de obrigação de fazer com pedido de tutela de urgência`;
- `Prazo fatal: 28 de junho de 2026, 18h`;
- `R$ 1.248.750,00`;
- nomes de pessoas e organizações;
- parágrafos jurídicos longos;
- tabela densa com status, responsável e prazo;
- formulário com erro, ajuda e campo desabilitado.

Avaliar:

- distinção entre `I`, `l`, `1`, `O` e `0`;
- leitura em tamanhos pequenos;
- largura de títulos e nomes longos;
- estabilidade dos números em tabelas;
- acentos e pontuação do português;
- fadiga em blocos extensos;
- coerência entre produto e conteúdo jurídico.
