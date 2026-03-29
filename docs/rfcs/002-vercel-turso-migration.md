# RFC 002 — Migrate hosting and database to Vercel + Turso

**Status:** Draft
**Date:** 2026-03-29
**Author:** Kelli Minton Garcia

---

## Summary

Replace AWS Amplify (WEB_COMPUTE) + DynamoDB with Vercel (Hobby) + Turso (free tier). Keep AWS SES for transactional email. Remove the `__NEXT_PRIVATE_STANDALONE_CONFIG` secrets workaround entirely — Vercel injects env vars into the serverless function runtime correctly.

---

## Motivation

The current stack accumulated significant accidental complexity to work around an Amplify WEB_COMPUTE limitation (env vars not available at Lambda runtime). The workaround — baking secrets into `next.config.ts` so they get serialized into `__NEXT_PRIVATE_STANDALONE_CONFIG` — is fragile and security-adjacent (secrets in build artifact). Vercel handles this correctly out of the box.

Additionally, DynamoDB is operationally heavy for a simple waitlist: schema-less but requires an IAM user with static credentials, a GSI for email lookups, and a full CDK stack. Turso is a managed SQLite service that fits the workload exactly, has a generous free tier, and removes the need for the infra/ CDK project entirely.

**Goals:**
- Simpler runtime secrets: just `process.env.VARNAME`
- Simpler database: SQLite via Turso, no IAM user, no CDK
- Simpler local dev: file-based SQLite, no Docker
- Free tier on both platforms for the foreseeable future

**Non-goals:**
- Replacing AWS SES (it's working and already verified)
- Changing any user-facing behavior
- Changing the E2E test suite (same tests, same assertions)

---

## Proposed Changes

### 1. Vercel hosting

Connect the GitHub repo to Vercel. All env vars set in the Vercel dashboard are available as `process.env.*` in serverless functions — no workaround needed.

**Free tier limits (Hobby):** 100 GB bandwidth/month, 100k serverless function invocations/day. Far above what a landing page needs.

### 2. Turso database

Replace DynamoDB with Turso (libSQL, SQLite-compatible). One database, one table.

**Free tier limits:** 500 databases, 9 GB storage, 1B row reads/month, 25M row writes/month.

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS signups (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('agent','buyer','seller','brokerage')),
  submitted_at TEXT NOT NULL
);
```

`email UNIQUE` enforces deduplication at the database level (replaces the DynamoDB scan + filter).

### 3. Remove the Amplify runtime-config workaround

Delete `lib/runtime-config.ts`. Replace every call to `getRuntimeSecrets()` with direct `process.env.*` reads. Remove the `runtimeSecrets` block and `serverExternalPackages` from `next.config.ts`.

### 4. Replace lib/dynamo.ts with lib/db.ts

New file using `@libsql/client`:

```ts
// lib/db.ts
import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```

Local dev uses a file URL (`file:./local.db`) via `.env.local`; CI uses in-memory (`:memory:`); production uses the Turso HTTPS URL.

### 5. Update API routes

**`app/api/request-access/route.ts`** — replace DynamoDB scan + put with SQL:
```ts
// duplicate check
const existing = await db.execute({
  sql: "SELECT id FROM signups WHERE email = ?",
  args: [normalizedEmail],
});
if (existing.rows.length > 0) return 409;

// insert
await db.execute({
  sql: "INSERT INTO signups (id, email, name, role, submitted_at) VALUES (?, ?, ?, ?, ?)",
  args: [ulid(), normalizedEmail, name.trim(), role, new Date().toISOString()],
});
```

**`app/api/admin/signups/route.ts`** — replace DynamoDB scan with SQL:
```ts
const result = await db.execute(
  "SELECT id, email, name, role, submitted_at FROM signups ORDER BY submitted_at ASC"
);
// build CSV from result.rows
```

### 6. Update lib/email.ts

Remove `getRuntimeSecrets()`. Read directly from `process.env`:
```ts
const accessKeyId = process.env.APP_AWS_ACCESS_KEY_ID!;
const secretAccessKey = process.env.APP_AWS_SECRET_ACCESS_KEY!;
const from = process.env.SES_FROM_ADDRESS!;
const to = process.env.SES_NOTIFY_ADDRESS!;
```

### 7. Remove infra/ CDK project

The CDK stack provisioned: DynamoDB table, email-index GSI, SSM parameter, IAM role. None of these are needed with Turso + Vercel. The DynamoDB table and IAM user should be deleted from AWS after data is migrated (see Migration Plan below).

The `infra/` directory can be archived or deleted.

### 8. Update local dev

Replace `docker-compose.yml` (DynamoDB Local) with a local SQLite file. Add to `.env.local`:
```
TURSO_DATABASE_URL=file:./local.db
# TURSO_AUTH_TOKEN not needed for file: URLs
```

Add a new `scripts/setup-local.ts` that creates the table in the local file:
```ts
import { db } from "../lib/db";
await db.execute(`CREATE TABLE IF NOT EXISTS signups (...)`);
```

### 9. Update GitHub Actions CI

Remove the `dynamodb-local` service container. Add Turso env vars pointing to in-memory SQLite:
```yaml
env:
  TURSO_DATABASE_URL: ":memory:"
  # No auth token needed for in-memory
  ADMIN_TOKEN: ci-admin-token
  SES_FROM_ADDRESS: noreply@turnkeyhomes.app
  SES_NOTIFY_ADDRESS: kelli@sheepishlabs.com
  SES_SANDBOX: "true"
```

Add a setup step to create the schema before running tests:
```yaml
- name: Create schema
  run: npx tsx scripts/setup-local.ts
```

### 10. Update package.json dependencies

**Remove:**
- `@aws-sdk/client-dynamodb`
- `@aws-sdk/lib-dynamodb`
- `@aws-sdk/client-ssm`

**Add:**
- `@libsql/client`

**Keep:**
- `@aws-sdk/client-ses` (still used for email)
- `ulid` (still used for ID generation)

---

## Environment Variables

| Variable | Local | CI | Production |
|---|---|---|---|
| `TURSO_DATABASE_URL` | `file:./local.db` | `:memory:` | Turso HTTPS URL |
| `TURSO_AUTH_TOKEN` | _(not needed)_ | _(not needed)_ | Turso token from dashboard |
| `ADMIN_TOKEN` | any string | `ci-admin-token` | secret from Vercel dashboard |
| `APP_AWS_ACCESS_KEY_ID` | any / skip email | _(SES_SANDBOX=true)_ | IAM user key |
| `APP_AWS_SECRET_ACCESS_KEY` | any / skip email | _(SES_SANDBOX=true)_ | IAM user secret |
| `SES_FROM_ADDRESS` | n/a | `noreply@turnkeyhomes.app` | `noreply@turnkeyhomes.app` |
| `SES_NOTIFY_ADDRESS` | n/a | `kelli@sheepishlabs.com` | `kelli@sheepishlabs.com` |
| `SES_SANDBOX` | `"true"` | `"true"` | _(unset)_ |

---

## Migration Plan

1. **Export existing DynamoDB data** — run `GET /api/admin/signups` on production to download the current CSV.
2. **Create Turso database** — `turso db create turnkey-waitlist`
3. **Create schema** — `turso db shell turnkey-waitlist < scripts/create-schema.sql`
4. **Import CSV** — write a one-off script to seed Turso from the CSV export.
5. **Deploy to Vercel** — connect repo, set env vars, verify DNS (update CNAME from Amplify to Vercel).
6. **Smoke test** — run `npx playwright test --config playwright.prod.config.ts` against the new deployment.
7. **Decommission AWS resources** — delete DynamoDB table, IAM user `turnkey-web-app`, Amplify app, CDK stack.

---

## Files Changed

| File | Action |
|---|---|
| `lib/runtime-config.ts` | **Delete** |
| `lib/dynamo.ts` | **Delete** |
| `lib/db.ts` | **Create** (Turso client) |
| `lib/email.ts` | **Update** (remove getRuntimeSecrets) |
| `next.config.ts` | **Update** (remove runtimeSecrets block, serverExternalPackages) |
| `app/api/request-access/route.ts` | **Update** (SQL instead of DynamoDB) |
| `app/api/admin/signups/route.ts` | **Update** (SQL instead of DynamoDB) |
| `scripts/setup-local.ts` | **Create** (replaces infra/scripts/setup-local.ts) |
| `scripts/create-schema.sql` | **Create** |
| `.github/workflows/e2e.yml` | **Update** (remove DynamoDB service, add schema setup) |
| `docker-compose.yml` | **Delete** |
| `infra/` | **Archive/Delete** |
| `package.json` | **Update** (swap AWS DynamoDB SDK for @libsql/client) |

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Data loss during migration | Export CSV before any changes; Turso import script is idempotent on `id` |
| DNS downtime during Amplify → Vercel cutover | Vercel custom domain can be configured before DNS switch; TTL should be lowered first |
| `@libsql/client` doesn't work in Vercel Edge Runtime | Not an issue — routes use Node.js runtime (default for App Router API routes) |
| Turso free tier limits | Current scale (landing page waitlist) is several orders of magnitude below limits |
| SES IAM user credentials still needed | Accepted; the static credentials remain but only for SES (not DynamoDB). No change to the `turnkey-web-app` IAM user's SES permission. |
