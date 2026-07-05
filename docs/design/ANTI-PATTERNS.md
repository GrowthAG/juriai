# Anti-padrões de design

Status: regras iniciais. Este documento descreve o que o JuriAI não deve se
tornar.

## Princípio

Não basta produzir uma tela visualmente agradável. A solução precisa parecer
específica para o trabalho jurídico, manter coerência com o produto e explicar
por que cada decisão existe.

## Estética genérica de produto gerado

Evitar:

- gradiente azul, roxo ou rosa usado como identidade automática;
- fundos com blobs, brilhos, auroras ou malhas sem função;
- glassmorphism;
- cartões flutuantes para toda informação;
- excesso de pills e cápsulas;
- bordas muito arredondadas em todos os componentes;
- sombras grandes e difusas para simular sofisticação;
- ícones decorativos dentro de quadrados coloridos;
- ilustrações 3D genéricas, robôs, cérebros e partículas de IA;
- dashboards preenchidos com métricas inventadas;
- grandes áreas vazias produzidas apenas para parecer minimalista;
- copiar a aparência de Linear, OpenAI, Notion ou outro produto como atalho.

## Tipografia

Evitar:

- escolher Inter, Geist ou outra fonte padrão sem avaliação;
- usar três ou mais famílias;
- aplicar serifada em toda a interface para parecer jurídico;
- títulos excessivamente grandes em telas operacionais;
- corpo pequeno, claro ou com baixo contraste;
- pesos extremos como substitutos de hierarquia;
- uppercase em frases e botões;
- tracking expandido em textos corridos;
- centralizar textos operacionais longos;
- misturar escalas diferentes entre páginas equivalentes;
- carregar uma fonte remota ou local não registrada no catálogo aprovado.

## Cor e superfície

Evitar:

- dourado como decoração ostensiva;
- azul-marinho aplicado indiscriminadamente;
- usar somente cor para comunicar estado;
- baixo contraste em metadados importantes;
- criar uma nova cor para cada tela;
- fundos e bordas quase indistinguíveis;
- mais de dois níveis de sombra na mesma composição;
- transformar risco jurídico em estética alarmista.

## Layout

Evitar:

- colocar toda seção dentro de um cartão;
- barras laterais largas sem necessidade;
- cabeçalhos duplicados;
- navegação concorrente no topo e na lateral sem hierarquia clara;
- desalinhamentos usados como personalidade;
- tabelas substituídas por mosaicos quando comparação é a tarefa principal;
- esconder ações importantes em menus sem justificativa;
- usar modais para fluxos que exigem contexto ou comparação;
- criar densidade uniforme sem pontos claros de leitura.

## Componentes e interação

Evitar:

- controles falsos ou sem comportamento;
- hover como único meio de descobrir uma ação;
- estados de foco invisíveis;
- animações que atrasam tarefas;
- movimento contínuo em áreas operacionais;
- transições que deslocam conteúdo;
- confirmações genéricas para ações irreversíveis;
- botões primários concorrentes;
- placeholders como substitutos de labels;
- componentes novos quando um padrão existente resolve o problema.

## Conteúdo

Evitar:

- lorem ipsum;
- textos promocionais dentro de fluxos operacionais;
- anglicismos desnecessários;
- juridiquês onde uma frase direta é suficiente;
- dados irreais que escondem problemas de layout;
- mensagens de erro que não expliquem recuperação;
- afirmar que IA substitui análise ou decisão profissional;
- usar balança, coluna grega ou martelo de leilão genérico (clip-art) como
  identidade automática.

> Exceção aprovada (30/06/2026): o símbolo oficial do JuriAI é um **gavel
> geométrico** próprio, construído com formas retangulares interligadas (cabo,
> cabeça, base e conector), de uma cor só. Ele não é clip-art e não é decoração:
> é a marca registrada do produto, presente no favicon e no monograma do
> sidebar. O que esta regra proíbe é o martelo de banco de imagem usado como
> atalho, não o gavel autoral do sistema.

## Processo para Claude Design e Stitch

Antes de criar:

1. identificar tarefa, usuário, dados e decisão principal da tela;
2. ler `DESIGN.md` e os documentos aplicáveis;
3. inspecionar padrões já existentes;
4. declarar quais tokens e componentes serão reutilizados;
5. listar qualquer exceção necessária.

Ao apresentar uma proposta:

- explicar a hierarquia;
- mostrar estados relevantes;
- usar conteúdo realista;
- indicar onde a proposta ainda é hipótese;
- apontar violações conhecidas do sistema;
- não apresentar referência visual como decisão aprovada.

O agente deve interromper e pedir validação quando a proposta exigir nova fonte,
nova cor estrutural, nova linguagem de ícones, nova escala, alteração ampla de
navegação ou substituição de um padrão aprovado.
