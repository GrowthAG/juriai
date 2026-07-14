# Runbook de staging — JuriAI

**Escopo:** colocar o app no ar em **staging**, sem tocar em produção.  
**Baseline app:** `main` (Gemini Vertex, PDF export, Copilot montado, W2, etc.).  
**Artefatos no repo:** `Dockerfile`, `.dockerignore`, `.env.example`, este runbook.

---

## 1) Target recomendado de deploy

| Opção | Prós | Contras para este app |
|---|---|---|
| **Cloud Run** | Next.js containerizado; IAM GCP; Cloud SQL connector; ADC/service account para Vertex; logs Cloud Logging | Precisa imagem; cold start; uploads precisam volume/GCS |
| **VM (GCE)** | Controle total; disco persistente fácil | Ops manuais |
| **Vercel** | DX frontend | Cloud SQL e upload local complicam; Vertex ADC menos natural |

### Recomendação

**Cloud Run + Cloud SQL (connector) + service account com Vertex AI + storage persistente (volume ou GCS).**

**Região sugerida:** `us-central1` (SQL, Gemini e app no mesmo “bairro”).

---

## 2) Env vars necessárias (staging)

Valores **nunca** no git. Injetar via Secret Manager + env do Cloud Run.  
Ver também `.env.example`.

| Variável | Valor / regra staging |
|---|---|
| `NODE_ENV` | **`production`** |
| `JURIAI_ALLOW_DEV_BYPASS` | **`false`** ou **ausente** |
| `DATABASE_URL` | Postgres staging (não `127.0.0.1` do laptop) |
| `JURIAI_SESSION_SECRET` | secret forte, distinto do dev local |
| `AUTH_SECRET` | secret forte do Auth.js, distinto de `JURIAI_SESSION_SECRET` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | OAuth client de staging |
| `AUTH_URL` | URL canônica HTTPS do ambiente; ver §4 |
| `GOOGLE_CLOUD_PROJECT` | `juriai-app` (ou projeto staging) |
| ADC | service account do Cloud Run |
| `JURIAI_UPLOAD_DIR` | `/var/juriai/uploads`, bucket de arquivos limpos |
| `JURIAI_UNSCANNED_UPLOAD_DIR` | `/var/juriai/unscanned`, bucket de entrada não verificada |
| `JURIAI_QUARANTINE_UPLOAD_DIR` | `/var/juriai/quarantine`, bucket de quarentena |
| `JURIAI_TASKS_LOCATION` | `us-central1` |
| `JURIAI_INGESTION_QUEUE` | `juriai-ingestion` |
| `JURIAI_TASKS_BASE_URL` | URL canônica HTTPS usada como target e audience OIDC |
| `JURIAI_TASKS_SERVICE_ACCOUNT` | Service account do runtime/worker |
| `JURIAI_TASKS_AUTH_TOKEN` | Secret forte no Secret Manager; nunca env em texto puro |
| LLM defaults | opcionais; workspace pode ter override no DB |
| `ANTHROPIC_API_KEY` | **não** setar se política for só Google Startups |

### Checklist de presença (sem imprimir valores)

```bash
test "$NODE_ENV" = "production"
test "${JURIAI_ALLOW_DEV_BYPASS:-false}" != "true"
test -n "$DATABASE_URL"
test -n "$JURIAI_SESSION_SECRET"
test -n "$AUTH_SECRET"
test -n "$AUTH_GOOGLE_ID" && test -n "$AUTH_GOOGLE_SECRET"
test -n "$AUTH_URL"
```

---

## 3) Banco

### Instância de referência

| Item | Valor |
|---|---|
| Instância | `juriai-db` · projeto `juriai-app` · `us-central1` |
| Backups | ON, retenção 7, janela 07:00 UTC |
| PITR | ON, 7 dias |
| Tier | `db-f1-micro` (ok staging) |

### Conexão do Cloud Run

**Preferido:** Cloud SQL Unix socket / Auth Proxy integrado ao Cloud Run.  
**Evitar:** IP público aberto sem restrição.

Formato do secret para Prisma/`pg` via socket:

```text
postgresql://USER:PASSWORD@localhost/DB?host=/cloudsql/PROJECT:REGION:INSTANCE&schema=public
```

### Usuário

- User app dedicado staging (ex. `juriai_staging`) ou user existente com secret no Secret Manager.
- Isolamento ideal: clone PITR `juriai-db-staging` (nunca restore in-place sobre a única fonte de verdade).

### Schema

Prisma Migrate: sem pasta `migrations` versionada. Em uma instância nova e
vazia, aplicar `prisma/init.sql` uma única vez. Em banco existente, primeiro
inventariar o schema e então aplicar apenas os patches ausentes na ordem do
`SETUP.md`. Build da imagem roda `npx prisma generate`.

Depois do schema, criar o primeiro usuário permitido no OAuth:

```bash
npm run db:bootstrap-admin -- admin@empresa.com "Nome do admin"
```

---

## 4) OAuth Google

### Domínio staging (exemplo)

- `https://staging.juriai.<dominio>`  
- ou URL Cloud Run `https://….run.app`

### Redirect URIs (Google Cloud Console)

| Tipo | URI |
|---|---|
| Authorized JavaScript origins | `https://staging.…` |
| Authorized redirect URIs | `https://staging.…/api/auth/callback/google` |

### Checklist Console

1. Client OAuth separado de prod (recomendado)  
2. HTTPS only (cookie `secure` com `NODE_ENV=production`)  
3. Test users se app em Testing  
4. Secrets no Secret Manager  
5. Smoke: login real no browser  

Com bypass off, formulário de e-mail dev **não** deve aparecer.

---

## 5) Storage

| Ambiente | Opção |
|---|---|
| Staging e produção | Bucket Cloud Storage montado em `/var/juriai/uploads` |

O código atual já usa filesystem para provas, ingestão, logos e timbrado. O mount
do Cloud Run expõe o bucket como diretório, sem SDK adicional. Como o
`Dockerfile` executa com usuário `nextjs` (`uid=1001`, `gid=1001`), configure o
mount com essas identidades e dê à service account `roles/storage.objectUser`.
Reserve memória para o processo FUSE e para uploads concorrentes; iniciar com
1 GiB é uma base prudente para o smoke.

### Ingestão assíncrona

Uploads criam um `IngestionJob` e publicam uma task HTTP na fila regional
`juriai-ingestion`. O worker interno exige OIDC da service account esperada e
um segundo token vindo do Secret Manager. A fila deve limitar concorrência para
proteger Cloud SQL e o provider de IA; o botão manual permanece como fallback.

---

## 6) Deploy steps (Cloud Run)

### Pré-requisitos

- [ ] SA `juriai-staging-run@…` (Cloud SQL Client, Vertex AI User, Secret Accessor, Storage se GCS)  
- [ ] Secrets (DB, session, OAuth)  
- [ ] OAuth URIs  
- [ ] Cloud SQL attachment  

### Build e deploy da imagem

```bash
gcloud run deploy juriai-staging \
  --source . \
  --project juriai-app \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances juriai-app:us-central1:juriai-db \
  --add-volume mount-path=/var/juriai/uploads,type=cloud-storage,bucket=BUCKET,readonly=false,mount-options="uid=1001;gid=1001" \
  --memory 1Gi
```

O deploy por source usa o `Dockerfile` presente e executa o build no Cloud
Build, sem exigir Docker instalado na máquina local. Acrescente os secrets,
env vars e a service account após inventariar os recursos existentes.

### Runtime

```bash
# Cloud Run define PORT
npx next start -H 0.0.0.0 -p ${PORT:-8080}
# (CMD do Dockerfile)
```

### Healthcheck

| Check | Critério |
|---|---|
| `GET /login` | 200 |
| Login + casos | sem 500 |
| PDF auth | 200 application/pdf |
| PDF sem cookie | 404 |

### Rollback

1. Traffic para revisão anterior da imagem Cloud Run  
2. Não restaurar SQL in-place se a instância for compartilhada  
3. Documentar SHA da imagem estável  

---

## 7) Smoke staging

Não clicar Excluir. Playwright: `page.on("dialog", d => d.dismiss())`.

| # | Passo | OK |
|---|---|---|
| 1 | `/login` HTTPS, sem form e-mail dev | |
| 2 | Login Google | |
| 3 | Workspace / casos | |
| 4 | Caso `[SMOKE]` ou sintético | |
| 5 | Upload sintético | |
| 6 | W2 se aplicável | |
| 7 | Gerar minuta (Gemini) sem erro de região | |
| 8 | Copilot visível | |
| 9 | PDF autenticado 200 | |
| 10 | PDF sem cookie 404 | |
| 11 | Logs sem secrets | |

Prompt LLM sanidade: `Responda apenas com a palavra ok.` (Gemini Vertex).

---

## 8) Critérios para liberar produção

1. Smoke §7 verde com bypass off e Google login  
2. Env prod distinto  
3. Storage persistente (GCS ideal)  
4. SQL rede restrita + backups/PITR  
5. Sem `[SMOKE]` em workspace de cliente  
6. Domínio + SSL + OAuth prod  
7. Rollback de imagem testado  
8. CI mínimo desejável  

---

## 9) Riscos se subir sem esses itens

| Falta | Risco |
|---|---|
| Bypass on | super-admin sem login |
| Upload tmpdir | perda de provas |
| SQL aberto | exposição de dossiês |
| OAuth errado | lockout |
| Restore in-place | apaga dados |
| Vercel + SQL/upload | débito crônico |

---

## Próxima fase (ops GCP — fora deste PR)

1. Service account + Secret Manager  
2. OAuth staging URIs  
3. Primeiro `gcloud run deploy` da imagem  
4. Smoke §7  
