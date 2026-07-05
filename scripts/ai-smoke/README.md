# JuriAI AI smoke tests

Bancada isolada para verificar acesso básico a modelos de IA sem importar ou
alterar código do produto. Os scripts não usam banco, Prisma, dados jurídicos
ou dados de clientes.

## Segurança

- O modo padrão é `--dry-run`.
- Chamadas externas exigem `--execute`.
- Com `--execute`, apenas um provider pode ser testado por comando.
- O prompt real é sempre `Responda apenas: JuriAI model probe OK`.
- Não existe opção para enviar prompt ou arquivo personalizado.
- Tokens, credenciais, headers, payloads e respostas brutas não são impressos.
- Chamadas reais podem consumir quota e gerar custo no provedor.

## Dry-run

```bash
node scripts/ai-smoke/run.mjs --dry-run
```

O argumento pode ser omitido porque dry-run é o modo padrão:

```bash
node scripts/ai-smoke/run.mjs
```

## Google Vertex

Requisitos:

- `gcloud` instalado e autenticado.
- Projeto configurado no `gcloud` ou informado por `--project`.
- Modelo e região confirmados no Model Garden.

Exemplo sem IDs reais:

```bash
node scripts/ai-smoke/run.mjs \
  --provider google-vertex \
  --model GOOGLE_MODEL_ID \
  --region VERTEX_REGION \
  --project GOOGLE_CLOUD_PROJECT_ID \
  --execute
```

## Google MaaS

O contrato usa o endpoint OpenAI-compatible Chat Completions:

```text
POST /v1/projects/PROJECT_ID/locations/REGION/endpoints/openapi/chat/completions
```

A região padrão é `global`. O modelo deve usar o formato completo
`publisher/model` no corpo da requisição.

Execução direta dos modelos validados:

```bash
node scripts/ai-smoke/providers/google-maas.mjs \
  --model moonshotai/kimi-k2-thinking-maas

node scripts/ai-smoke/providers/google-maas.mjs \
  --model zai-org/glm-4.7-maas

node scripts/ai-smoke/providers/google-maas.mjs \
  --model zai-org/glm-5-maas
```

Esses comandos standalone executam uma chamada real com o prompt fixo do
probe. Para região ou projeto diferentes:

```bash
node scripts/ai-smoke/providers/google-maas.mjs \
  --model PARTNER_PUBLISHER_ID/PARTNER_MODEL_ID \
  --region global \
  --project GOOGLE_CLOUD_PROJECT_ID \
```

O runner geral continua exigindo `--execute`:

```bash
node scripts/ai-smoke/run.mjs \
  --provider google-maas \
  --model PARTNER_PUBLISHER_ID/PARTNER_MODEL_ID \
  --region global \
  --project GOOGLE_CLOUD_PROJECT_ID \
  --execute
```

O provider tenta primeiro `gcloud auth print-access-token` e depois ADC via
`gcloud auth application-default print-access-token`. Nenhum token é salvo ou
impresso.

Credencial ausente, IAM negado, modelo não habilitado no Model Garden, modelo
inexistente e quota indisponível resultam em `SKIP`. Payload inválido, timeout
ou resposta inesperada resultam em `FAIL`. Em sucesso, somente
`choices[0].message.content` é exibido. A presença de `reasoning_content` é
indicada sem imprimir o raciocínio completo.

## AWS Bedrock

Requisitos:

- AWS CLI instalada.
- Credencial válida para `sts`, `bedrock` e `bedrock-runtime`.
- Modelo, região e formato informados explicitamente.

Antes da invocação, a bancada executa:

1. `aws sts get-caller-identity`
2. `aws bedrock list-foundation-models`
3. `aws bedrock-runtime invoke-model`

Exemplo sem credenciais ou IDs reais:

```bash
node scripts/ai-smoke/run.mjs \
  --provider aws-bedrock \
  --model BEDROCK_MODEL_ID \
  --region AWS_REGION \
  --format anthropic \
  --execute
```

Formatos disponíveis:

- `anthropic`
- `amazon-nova`
- `amazon-titan`
- `meta`
- `mistral`
- `cohere`

Se AWS CLI ou credenciais não estiverem disponíveis, o resultado será `SKIP`.
Não há implementação manual de assinatura SigV4 e nenhuma dependência npm foi
adicionada.

## Resultado

A saída é JSON e cada provider recebe uma classificação:

- `PASS`: execução válida ou dry-run validado.
- `SKIP`: pré-requisito, acesso, quota ou credencial indisponível.
- `FAIL`: configuração inválida, timeout, payload rejeitado ou resposta
  incompatível.

O processo retorna código diferente de zero quando qualquer resultado é
`FAIL`.

## Validação local

```bash
node --check scripts/ai-smoke/run.mjs
node --check scripts/ai-smoke/core.mjs
node --check scripts/ai-smoke/providers/google-vertex.mjs
node --check scripts/ai-smoke/providers/google-maas.mjs
node --check scripts/ai-smoke/providers/aws-bedrock.mjs
node scripts/ai-smoke/run.mjs --dry-run
npm run lint
git status --short
git diff --name-status
```
