# Deploy checklist — staging (Cloud Run)

Checklist operacional curto. Detalhes: [staging-runbook.md](./staging-runbook.md).

## Antes do primeiro deploy

- [ ] `main` no SHA desejado (`git pull --ff-only`)
- [ ] `npm run lint && npx tsc --noEmit && npm run build` local
- [ ] `docker build -t juriai-staging:local .` (opcional; deploy por source usa o Dockerfile)
- [ ] Secrets no Secret Manager (não no git):
  - [ ] `DATABASE_URL`
  - [ ] `JURIAI_SESSION_SECRET`
  - [ ] `AUTH_SECRET`
  - [ ] `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
- [ ] `AUTH_URL=https://<host>` configurada com a URL canônica
- [ ] `NODE_ENV=production`
- [ ] `JURIAI_ALLOW_DEV_BYPASS=false`
- [ ] Buckets limpo, não verificado e quarentena criados sem acesso público
- [ ] Buckets montados em `JURIAI_UPLOAD_DIR`, `JURIAI_UNSCANNED_UPLOAD_DIR` e `JURIAI_QUARANTINE_UPLOAD_DIR` com UID/GID `1001`
- [ ] Scanner ClamAV isolado + Eventarc ativos; arquivo limpo chega ao bucket limpo e EICAR à quarentena
- [ ] Service account Cloud Run + roles (SQL, Vertex, secrets)
- [ ] Cloud SQL instance anexada ao serviço
- [ ] Primeiro super-admin criado com `npm run db:bootstrap-admin -- <email>`
- [ ] OAuth redirect: `https://<host>/api/auth/callback/google`
- [ ] ADC via SA (sem JSON no repositório)

## Deploy

- [ ] `gcloud run deploy --source .` com env/secrets, Cloud SQL e volume Cloud Storage
- [ ] Revisar URL pública e HTTPS

## Smoke (após up)

- [ ] Login Google (sem form e-mail dev)
- [ ] Lista de casos / dossiê
- [ ] Caso `[SMOKE]` ou sintético
- [ ] Upload sintético
- [ ] Upload fica indisponível enquanto o scan está pendente
- [ ] Minuta Gemini (sem erro de região)
- [ ] Copilot visível
- [ ] PDF autenticado 200 / sem cookie 404
- [ ] Logs sem secrets

## Rollback

- [ ] Traffic para revisão anterior da imagem
- [ ] Não restore SQL in-place sem plano de clone/PITR

## Não fazer

- Commitar `.env*` com secrets
- Commitar `scripts/dev-recreate-almeida-smoke.mjs` / `scripts/probe-datajud.mjs`
- `JURIAI_ALLOW_DEV_BYPASS=true` em staging “prod-like”
- Deploy em produção com este checklist sem critérios do runbook §8
