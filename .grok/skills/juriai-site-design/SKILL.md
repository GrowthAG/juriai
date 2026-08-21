---
name: juriai-site-design
description: >
  Design e copy do site/marketing do JuriAI (anti-vibecode, institucional).
  Use when editing the public site, landing, hero, mockups, motion, brand voice
  on the homepage, or when the user asks to improve design/copy of JuriAI site.
  Also when writing any user-facing marketing Portuguese for JuriAI.
  Triggers: site, landing, hero, marketing, anti-vibecode, mockup, motion design.
---

# JuriAI · Site design e copy

## Objetivo

Site institucional tipo Webflow de consultoria/legaltech sério: dossiê, evidência,
revisão humana. **Nunca** landing de vibecode de IA.

## Regra absoluta de copy: sem traços

**Proibido na copy voltada ao usuário** (site, emails de marketing, CTAs, headlines,
legendas de mockup, aria-labels de marketing quando forem texto legível):

| Proibido | Exemplos |
|----------|----------|
| Travessão | `—` (U+2014) |
| Meia-risca como inciso | `–` (U+2013) entre cláusulas |
| Duplo hífen retórico | `--` no meio da frase |

**Não se aplica a:** hífen em palavras compostas (`multi-tenant` só se inevitável;
preferir reformular em pt-BR), CSS/código, paths, números de processo CNJ.

### Como reescrever

| Evitar | Preferir |
|--------|----------|
| `Do dossiê à minuta — com o que está nos autos.` | `Do dossiê à minuta, com o que está nos autos.` |
| `Telas reais — não mock` | `Telas reais. Não é mock de template.` |
| `A IA organiza — o advogado decide` | `A IA organiza. O advogado decide.` |
| `Provas · análise · rascunhos` com traço | `Provas, análise e rascunhos` (ponto médio `·` ok se só lista curta de UI) |

**Frases curtas.** Preferir ponto ou vírgula a travessão “de blog de IA”.

Antes de entregar qualquer diff de site: buscar `—` e ` – ` na pasta `components/site`
e zerar em strings de UI.

## Visual (anti-vibecode)

- Logo: gavel + JuriAI permitido (identidade de marca).
- Sem mesh gradient, glow neon, roxo “AI”, tilt 3D agressivo, parallax de orbs.
- Sem robô, balança, coluna clássica (gavel só no logo).
- **Proibido:** fundo cinza “stage” atrás de mockup, caixa em volta da caixa,
  print de admin/dev com “Dados demo” ou sidebar Console no hero.
- **Priorizar fotografia humana editorial** (mesa, documentos, escritório, luz
  natural). UI de produto só com print limpo do dossiê/caso.
- Profundidade: foto full-bleed ou borda 1px. Neutros quentes > cinza frio.
- Tipografia: serif (Lora) em H1/H2; sans em corpo/UI.
- Um azul de ação (`--primary`).
- Motion: fade/translateY curto. Respeitar `prefers-reduced-motion`.

## Conteúdo de produto

- Hero preferencialmente com imagem humana; produto em seção própria se houver UI limpa.
- Módulos com nomes do produto: Casos, Provas, Análise, Rascunhos, Conversa, Monitoramento.
- Confiança em linguagem de advogado (sem tokens de eng).
- Não inventar logos de clientes nem métricas falsas.


## Fluxo de melhoria de design

1. Ler `components/site/*` e `app/page.tsx`.
2. Preferir polish no Esboço A (split) antes de reinventar o hero.
3. Board de referência: `public/site/esbocos/design-board.html`.
4. Gates: `npm run lint`, `npx tsc --noEmit`, `npm run build`.
5. Não deploy/commit sem pedido explícito.

## Referências de craft

Harvey / Legora: confiança e produto no centro.  
Webflow consultoria: respiro, tipografia, calma.  
JuriAI: wedge = dossiê + evidência + revisão (não “AI without limits”).
