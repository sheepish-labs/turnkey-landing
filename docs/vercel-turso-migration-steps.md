# Vercel + Turso Migration Steps

## Step 1 — Tear down AWS resources

### 1a. Destroy CDK stack
```bash
cd infra
npx cdk destroy --profile sheepishlabs
```
This removes: DynamoDB table `TurnkeyWaitlist`, IAM role `TurnkeyAmplifyServiceRole`, SSM parameter `/turnkey/admin-token`.

### 1b. Delete IAM user (manual — not in CDK)
- AWS Console → IAM → Users → `turnkey-web-app`
- Delete access keys, then delete the user

### 1c. Delete Amplify app (manual)
- AWS Console → Amplify → your app → Actions → Delete app

### 1d. SES — no action needed
Email notifications have been removed from the app. SES verified identity and DKIM records can be left as-is or cleaned up separately — they have no cost impact.

---

## Step 2 — Create Turso database

```bash
brew install tursodatabase/tap/turso
turso auth login
turso db create turnkey-waitlist
turso db shell turnkey-waitlist \
  "CREATE TABLE IF NOT EXISTS signups (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('agent','buyer','seller','brokerage')), submitted_at TEXT NOT NULL)"
```

Save these for Vercel env vars:
```bash
turso db show turnkey-waitlist     # → TURSO_DATABASE_URL
turso db tokens create turnkey-waitlist  # → TURSO_AUTH_TOKEN
```

---

## Step 3 — Set up Vercel project

```bash
npm i -g vercel
vercel login
vercel link   # run from project root, creates .vercel/project.json
```

Add these env vars in Vercel dashboard (Production):

| Variable | Value |
|---|---|
| `TURSO_DATABASE_URL` | from step 2 |
| `TURSO_AUTH_TOKEN` | from step 2 |
| `ADMIN_TOKEN` | `openssl rand -hex 32` |

---

## Step 4 — Add GitHub secrets

GitHub repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Where to get it |
|---|---|
| `VERCEL_TOKEN` | Vercel dashboard → Account Settings → Tokens |
| `VERCEL_ORG_ID` | `.vercel/project.json` after `vercel link` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` after `vercel link` |

---

## Step 5 — Configure custom domain in Vercel

- Vercel dashboard → project → Settings → Domains → add `turnkeyhomes.app` and `www.turnkeyhomes.app`
- Vercel will show you the DNS values to set
- In Squarespace DNS: replace the Amplify ALIAS/CNAME records with Vercel's values

---

## Step 6 — Push and deploy

```bash
git push origin main
```

GitHub Actions will:
1. Run E2E tests against local SQLite
2. If green → deploy to Vercel production

Monitor at: GitHub repo → Actions tab

---

## Step 7 — Smoke test production

```bash
PLAYWRIGHT_BASE_URL=https://www.turnkeyhomes.app \
ADMIN_TOKEN=<your-prod-token> \
npx playwright test --config playwright.prod.config.ts --reporter=line
```

All 6 tests should pass.

---

## Status

- [x] 1a. CDK stack destroyed
- [x] 1b. IAM user `turnkey-web-app` deleted
- [x] 1c. Amplify app deleted
- [ ] 2. Turso database created and schema applied
- [ ] 3. Vercel project linked and env vars set
- [ ] 4. GitHub secrets added
- [ ] 5. DNS updated to Vercel
- [ ] 6. Push triggered successful CI deploy
- [ ] 7. Playwright smoke tests pass on production
