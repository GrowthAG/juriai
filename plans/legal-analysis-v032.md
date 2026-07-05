# Especificação: LegalAnalysis v0.3.2

## Visão Geral

Este documento define o contrato de análise de publicações jurídicas (DJEN) via IA, focando em extração técnica e **Anti-Hallucination Guardrails**. O processamento é assíncrono e o consumo é coberto por créditos enquanto houver saldo, quota e billing ativo. A versão v0.3.2 consolida a padronização total dos campos técnicos para o inglês.

## Modelos e Status Real

| Modelo | Provedor | Função | Status | Validação (Smoke Test) |
| :--- | :--- | :--- | :--- | :--- |
| `claude-opus-4-7` | Google Vertex | Extração Principal | **ATIVO** | `node scripts/ai-smoke/run.mjs --provider google-vertex --model claude-opus-4-7 --region us-central1 --execute` |
| `moonshotai/kimi-k2-thinking-maas` | Google MaaS | Double-Check | **ATIVO** | `node scripts/ai-smoke/run.mjs --provider google-maas --model moonshotai/kimi-k2-thinking-maas --execute` |
| `claude-sonnet-4-5` | Google Vertex | Fallback Extração | **ATIVO** | `node scripts/ai-smoke/run.mjs --provider google-vertex --model claude-sonnet-4-5 --region us-central1 --execute` |
| `qwen/qwen3-coder-480b-a35b-instruct-maas` | Google MaaS | Tarefas Técnicas | **ATIVO** | `node scripts/ai-smoke/run.mjs --provider google-maas --model qwen/qwen3-coder-480b-a35b-instruct-maas --execute` |

## Contrato JSON v0.3.2 (`LegalAnalysis`)

```json
{
  "analysisVersion": "0.3.2",
  "status": "AI_SUGGESTED",
  "sourceTextHash": "sha256:...",
  "automationBlocked": true,
  "humanReview": {
    "required": true,
    "reason": "Análise gerada por IA exige validação humana antes de qualquer uso operacional."
  },
  "literalExtraction": {
    "summary": "Síntese objetiva da publicação.",
    "proceduralClass": "Classe processual identificada ou NOT_IDENTIFIED.",
    "parties": [
      {
        "name": "Nome da parte mencionada",
        "role": "AUTOR | REU | TERCEIRO | NOT_IDENTIFIED"
      }
    ]
  },
  "aiInterpretation": {
    "result": "DEFERIDO | INDEFERIDO | PARCIAL | CITACAO | INTIMACAO | NOT_IDENTIFIED",
    "sensitiveDataDetected": false,
    "sensitiveDataTypes": [],
    "sensitiveDataSourceExcerpt": [],
    "deadlines": [
      {
        "type": "Contestação",
        "extractedDeadline": "15 dias úteis",
        "numericValue": 15,
        "unit": "DIAS",
        "dayType": "BUSINESS_DAYS | CALENDAR_DAYS | NOT_IDENTIFIED",
        "startEvent": "publicação",
        "source": {
          "source_excerpt": "Intime-se a parte ré para contestar em 15 dias úteis, contados da publicação.",
          "source_start_char": 0,
          "source_end_char": 82
        },
        "finalDate": null,
        "finalDateStatus": "NOT_COMPUTED"
      }
    ]
  },
  "reviewRecommendation": {
    "suggestedAction": "Revisar prazo extraído e confirmar manualmente antes de qualquer lançamento operacional.",
    "attentionPoints": [
      "Confirmar marco inicial.",
      "Confirmar tipo de dia.",
      "Confirmar se há segredo de justiça ou dado sensível."
    ]
  },
  "confidence": {
    "level": "HIGH | MEDIUM | LOW",
    "reason": "Justificativa objetiva para o nível de confiança."
  },
  "doubleCheck": {
    "performed": true,
    "model": "moonshotai/kimi-k2-thinking-maas",
    "result": "PASSED | FAILED | CORRECTED | NOT_RUN",
    "issues": []
  }
}
```

## Prompts Atualizados (v0.3.2)

### Extração (Claude Opus 4.7)

> "Você é um extrator jurídico especializado. Extraia os dados da publicação DJEN para o contrato v0.3.2.
>
> REGRAS:
>
> 1. DIFERENCIE FATO DE INTERPRETAÇÃO: Preencha `literalExtraction` apenas com o que está escrito. Use `aiInterpretation` para inferências.
> 2. PRAZOS: Identifique valor, unidade e tipo de dia em `deadlines`. NUNCA calcule `finalDate`. Use os índices de caractere exatos para o `source_excerpt`.
> 3. SENSITIVE DATA: Identifique se há dados sensíveis como CPF, endereços ou segredo de justiça.
> 4. CONFIDENCE: Justifique o nível de confiança: `HIGH`, `MEDIUM` ou `LOW`."

### Double-Check (Kimi K2 Thinking)

> "Analise a extração JSON feita pelo modelo anterior para o contrato v0.3.2.
>
> 1. Verifique se o `source_excerpt` do prazo condiz com o texto original.
> 2. O `numericValue` e `dayType` estão corretos?
> 3. Houve alguma alucinação de data final? O campo `finalDate` deve ser `null`.
>
> Forneça o resultado como `PASSED`, `FAILED` ou `CORRECTED` e liste eventuais `issues`."

## Exemplos Completos

### 1. Prazo Explícito

**Entrada:** "Intime-se a parte ré para contestar em 15 dias úteis, contados da publicação."

**JSON v0.3.2 (Trecho):**

```json
{
  "aiInterpretation": {
    "deadlines": [
      {
        "type": "Contestação",
        "extractedDeadline": "15 dias úteis",
        "numericValue": 15,
        "unit": "DIAS",
        "dayType": "BUSINESS_DAYS",
        "startEvent": "publicação",
        "source": {
          "source_excerpt": "Intime-se a parte ré para contestar em 15 dias úteis, contados da publicação.",
          "source_start_char": 0,
          "source_end_char": 82
        },
        "finalDate": null,
        "finalDateStatus": "NOT_COMPUTED"
      }
    ]
  },
  "confidence": {
    "level": "HIGH",
    "reason": "Prazo, quantidade, tipo de dia e marco inicial explicitamente definidos."
  },
  "automationBlocked": false,
  "humanReview": {
    "required": true,
    "reason": "Toda análise de prazo exige validação humana antes de uso operacional."
  }
}
```

### 2. Publicação Ambígua

**Entrada:** "Prazo de 5 dias para manifestação. Cumpra-se."

**JSON v0.3.2 (Trecho):**

```json
{
  "aiInterpretation": {
    "deadlines": [
      {
        "type": "Manifestação",
        "extractedDeadline": "5 dias",
        "numericValue": 5,
        "unit": "DIAS",
        "dayType": "NOT_IDENTIFIED",
        "startEvent": "Cumpra-se",
        "source": {
          "source_excerpt": "Prazo de 5 dias para manifestação. Cumpra-se.",
          "source_start_char": 0,
          "source_end_char": 47
        },
        "finalDate": null,
        "finalDateStatus": "NOT_COMPUTED"
      }
    ]
  },
  "confidence": {
    "level": "MEDIUM",
    "reason": "Contagem de dias úteis ou corridos não especificada."
  },
  "automationBlocked": true,
  "humanReview": {
    "required": true,
    "reason": "Tipo de dia não identificado."
  }
}
```

### 3. Sem Prazo Identificado

**Entrada:** "Juntada de petição intermediária. Aguarde-se."

**JSON v0.3.2 (Trecho):**

```json
{
  "aiInterpretation": {
    "deadlines": []
  },
  "confidence": {
    "level": "LOW",
    "reason": "Nenhum prazo explícito foi identificado no texto."
  },
  "automationBlocked": true,
  "humanReview": {
    "required": true,
    "reason": "Não há prazo explícito para validação automática."
  }
}
```

## Critérios de Bloqueio de Automação

* `confidence.level` === `LOW`.
* `doubleCheck.result` === `FAILED`.
* `automationBlocked` deve ser `true` se `sensitiveDataDetected` for identificado em contexto de segredo de justiça.
* `automationBlocked` deve ser `true` quando `dayType` for `NOT_IDENTIFIED`.
* `automationBlocked` deve ser `true` quando houver conflito entre extração inicial e double-check.
* Nenhuma data final pode ser calculada por LLM.
* Nenhuma análise pode ser marcada como confirmada pela IA.
* Nenhum prazo pode ser enviado para agenda, cliente ou documento final sem revisão humana.

## Recomendações para Persistência

Campos candidatos para avaliação do Claude, sem decisão de schema nesta etapa.

Ponto de atenção: rastreabilidade entre a publicação original, o texto analisado, o hash da fonte e a versão do contrato gerada.

Esta especificação não autoriza:

* alteração de schema;
* migration;
* SQL;
* alteração em Prisma;
* persistência;
* UI;
* automação de prazo.
