# RFC 001: Early Access Backend Integration

**Status:** Approved
**Date:** 2026-03-21
**Author:** Kelli Minton Garcia

---

## Problem

The current "Request Early Access" form opens a `mailto:` link, which is fragile and loses submissions if the user doesn't complete the email flow. We need a real backend that captures signups reliably, notifies the team immediately, and provides a way to review the waitlist.

---

## Proposed Solution

Three pieces:

1. **Next.js API route** — accepts form submissions, writes to DynamoDB, triggers email
2. **DynamoDB table** — stores waitlist entries
3. **Admin endpoint** — password-protected route to download signups as CSV

All AWS resources are provisioned and managed via **AWS CDK**.

---

## Architecture

```
Browser (EarlyAccess form)
  └── POST /api/request-access
        ├── Write to DynamoDB (WaitlistTable)
        └── Send email → kelli@sheepishlabs.com

GET /api/admin/signups  (Authorization: Bearer <ADMIN_TOKEN>)
  └── Scan DynamoDB → return CSV download

AWS Amplify
  ├── Hosts Next.js app (SSR)
  ├── API routes run as serverless Lambda functions (managed by Amplify)
  └── IAM role grants Lambda access to DynamoDB (no static credentials needed)

AWS CDK (infra/)
  ├── DynamoDB table + GSI
  ├── Amplify app + branch + environment variables
  └── IAM role with least-privilege DynamoDB policy
```

---

## Deployment: AWS Amplify + CDK

The app is deployed to **AWS Amplify**, which natively supports Next.js SSR. API routes run as serverless Lambda functions automatically — no separate API Gateway or Lambda configuration needed.

All AWS resources are defined in a **CDK stack** (TypeScript) living in an `infra/` directory at the repo root. This means the full environment can be stood up or torn down with `cdk deploy` / `cdk destroy`, and infrastructure changes are reviewed as code alongside application changes.

### Resources managed by CDK

| Resource | CDK Construct |
|---|---|
| DynamoDB table + GSI | `aws-cdk-lib/aws-dynamodb` |
| Amplify app + branch | `@aws-cdk/aws-amplify-alpha` |
| IAM role for Amplify | `aws-cdk-lib/aws-iam` |
| SSM Parameter (ADMIN_TOKEN) | `aws-cdk-lib/aws-ssm` |

### IAM

The Amplify execution role is granted least-privilege access:
- `dynamodb:PutItem` — write new signups
- `dynamodb:Query` — duplicate check via GSI
- `dynamodb:Scan` — admin CSV export
- `ses:SendEmail` — scoped to the `noreply@turnkeyhomes.app` verified identity

No `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` in env vars — the SDK picks up the execution role automatically at runtime.

### Repo structure

```
turnkey-landing/
  infra/
    bin/
      app.ts          # CDK entry point
    lib/
      turnkey-stack.ts  # all resources defined here
    cdk.json
    package.json
  app/
  components/
  ...
```

---

## API Routes

### `POST /api/request-access`

**Request body:**
```json
{
  "email": "agent@example.com",
  "name": "Jane Smith",
  "role": "agent"
}
```

All fields are required. `role` must be one of: `agent`, `buyer`, `seller`, `brokerage`. Returns `400` if any field is missing or `role` is invalid.

**Behavior:**
1. Validate email format, name presence, and role selection client-side before submission (server still returns `400` as a safety net)
2. Check for duplicate (query DynamoDB GSI by email before inserting)
3. Write item to DynamoDB with `submittedAt` ISO timestamp and a ULID as the primary key
4. Fire-and-forget email notification to `kelli@sheepishlabs.com`
5. Return `201` on success, `409` if already registered, `400` on validation error

**Response (success):**
```json
{ "message": "You're on the list." }
```

**Response (duplicate):**
```json
{ "message": "You're already on the list." }
```

---

### `GET /api/admin/signups`

Backing route for the admin page. Also usable directly via `curl -O` or browser URL.

**Auth:** Password form on `/admin` sets a session cookie containing the hashed token. The API route validates the cookie (or falls back to `Authorization: Bearer <ADMIN_TOKEN>` for direct `curl` use).

**Response:** CSV file download

```
id,email,name,role,submittedAt
01HZ...,agent@example.com,Jane Smith,agent,2026-03-21T20:00:00.000Z
```

Response headers:
```
Content-Type: text/csv
Content-Disposition: attachment; filename="turnkey-waitlist.csv"
```

Returns `401` if not authenticated.

---

### `GET /admin`

A simple password-protected page at `/admin`. Renders a password form; on success sets a session cookie and shows a "Download CSV" button that hits `/api/admin/signups`.

No user management — single shared password stored as `ADMIN_TOKEN` in SSM.

---

## DynamoDB Schema

**Table name:** `TurnkeyWaitlist`
**Region:** `us-east-1` (same region as Amplify app)
**Billing:** On-demand (pay-per-request)

| Attribute | Type | Notes |
|---|---|---|
| `id` | String (PK) | ULID — lexicographically sortable by creation time |
| `email` | String | Stored lowercase |
| `name` | String | Required |
| `role` | String | Required — `agent`, `buyer`, `seller`, or `brokerage` |
| `submittedAt` | String | ISO 8601 |

**GSI:** `email-index` on `email` — enables fast duplicate checks without a full table scan.

---

## Email

Use **AWS SES** for email delivery — keeps everything in AWS, consistent with the rest of the stack.

**Sender:** `noreply@turnkeyhomes.app` (domain must be verified in SES before going live)
**Recipient:** `kelli@sheepishlabs.com`
**Content:** Plain-text notification with submitter email, name, role, and timestamp

The Amplify execution role is granted `ses:SendEmail` scoped to the verified sending identity. No additional credentials needed — same IAM role approach as DynamoDB.

---

## Local Development

### DynamoDB — DynamoDB Local (Docker)

Run an official local DynamoDB instance via Docker Compose:

```yaml
# docker-compose.yml
services:
  dynamodb-local:
    image: amazon/dynamodb-local
    ports:
      - "8000:8000"
    command: ["-jar", "DynamoDBLocal.jar", "-sharedDb", "-inMemory"]
```

Start with `docker compose up -d`. The AWS SDK is pointed at it via environment variables in `.env.local`:

```bash
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=local      # any non-empty string
AWS_SECRET_ACCESS_KEY=local  # any non-empty string
DYNAMODB_TABLE_NAME=TurnkeyWaitlist
```

The API route checks for `DYNAMODB_ENDPOINT` and passes it as the `endpoint` option to the DynamoDB client when present. In production on Amplify this variable is absent, so the SDK uses the real AWS endpoint with the execution role.

A setup script (`infra/scripts/setup-local.ts`) handles creating the table and GSI against the local instance so you don't have to do it manually:

```bash
npx ts-node infra/scripts/setup-local.ts
```

### Email — skip in local environment

Set `RESEND_API_KEY` to an empty string locally. The API route checks for its presence and skips the email call when absent, logging to the console instead:

```
[dev] email skipped — would have sent to kelli@sheepishlabs.com
```

To test the email flow locally without sending live mail, set `SES_SANDBOX=true` — the API route will log the email payload to the console instead of calling SES. Alternatively, SES sandbox mode (enabled by default in new AWS accounts) allows sending to verified email addresses only, which is sufficient for local testing.

### Admin token

Use any static value locally:

```bash
ADMIN_TOKEN=local-admin-token
```

### Full `.env.local` example

```bash
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
DYNAMODB_TABLE_NAME=TurnkeyWaitlist
SES_FROM_ADDRESS=noreply@turnkeyhomes.app
SES_NOTIFY_ADDRESS=kelli@sheepishlabs.com
SES_SANDBOX=true           # skips SES call locally, logs to console instead
ADMIN_TOKEN=local-admin-token
```

### Local dev workflow

```bash
docker compose up -d                        # start DynamoDB Local
npx ts-node infra/scripts/setup-local.ts   # create table + GSI
npm run dev                                 # start Next.js
```

---

## Dependencies

### App (`package.json`)
```
@aws-sdk/client-dynamodb
@aws-sdk/lib-dynamodb
@aws-sdk/client-ses
ulid
```

### Infra (`infra/package.json`)
```
aws-cdk-lib
@aws-cdk/aws-amplify-alpha
constructs
```

### Dev / test
```
@playwright/test
```

---

## Environment Variables

Injected into Amplify by the CDK stack — no manual console setup required:

```bash
# DynamoDB
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=TurnkeyWaitlist
# No AWS credentials needed — Lambda execution role handles auth

# Email (SES)
SES_FROM_ADDRESS=noreply@turnkeyhomes.app
SES_NOTIFY_ADDRESS=kelli@sheepishlabs.com
# No credentials needed — Lambda execution role handles auth

# Admin endpoint
ADMIN_TOKEN=...           # sourced from SSM by CDK
                          # generate with: openssl rand -hex 32
```

---

## Frontend Changes

`components/EarlyAccess.tsx`:
- Add `name` field (required)
- Add `role` dropdown (required) — options: Agent, Buyer, Seller, Brokerage
- Validate email format client-side before submitting (RFC 5322-compatible regex or the native `<input type="email">` constraint via `checkValidity()`)
- Validate name is non-empty and role is selected client-side before submitting
- Replace `mailto:` handler with `fetch('POST /api/request-access', { email, name, role })`
- Handle loading state during submission
- Handle `409` (already registered) with a distinct success-adjacent message
- Show error state for unexpected failures

---

## Open Questions

1. **CDK bootstrap:** `cdk bootstrap` has not been run yet — required once before first deploy. This is a manual prerequisite.
2. **Amplify + GitHub connection:** CDK can create the Amplify app, but connecting it to GitHub requires a one-time OAuth flow. Use Playwright to automate this step via the AWS console UI.

---

## Testing

### Local development script

A single script boots the full local stack and opens it for interactive Playwright MCP inspection:

```bash
# scripts/dev.sh
#!/bin/bash
set -e

echo "Starting DynamoDB Local..."
docker compose up -d

echo "Creating table and GSI..."
npx ts-node infra/scripts/setup-local.ts

echo "Starting Next.js..."
npm run dev
```

Run with:
```bash
bash scripts/dev.sh
```

Once running, the Playwright MCP server can navigate to `http://localhost:3000` for interactive exploration and manual testing.

---

### End-to-end tests (CI/CD)

E2E tests are written with **Playwright Test** (`@playwright/test`) and live in `e2e/`. They run against the local stack (DynamoDB Local + Next.js dev server) in CI.

**Test cases:**

| Test | Description |
|---|---|
| `signup.spec.ts` | Happy path — fills name, email, role, submits, sees success state |
| `signup-validation.spec.ts` | Client-side validation — bad email format, empty name, no role selected all blocked before submit |
| `signup-duplicate.spec.ts` | Submitting the same email twice shows the "already on the list" message |
| `admin-login.spec.ts` | `/admin` page — wrong password stays locked, correct password reveals download button |
| `admin-download.spec.ts` | Download button triggers CSV with correct headers including `role` column |

**CI setup (GitHub Actions):**

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    services:
      dynamodb-local:
        image: amazon/dynamodb-local
        ports:
          - "8000:8000"
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx ts-node infra/scripts/setup-local.ts
      - run: npx playwright test
        env:
          DYNAMODB_ENDPOINT: http://localhost:8000
          AWS_REGION: us-east-1
          AWS_ACCESS_KEY_ID: local
          AWS_SECRET_ACCESS_KEY: local
          DYNAMODB_TABLE_NAME: TurnkeyWaitlist
          SES_FROM_ADDRESS: noreply@turnkeyhomes.app
          SES_NOTIFY_ADDRESS: kelli@sheepishlabs.com
          SES_SANDBOX: "true"
          ADMIN_TOKEN: ci-admin-token
```

Playwright starts and stops the Next.js dev server automatically via `webServer` in `playwright.config.ts`:

```ts
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  testDir: "./e2e",
});
```

`reuseExistingServer` means locally you can leave `npm run dev` running and Playwright won't restart it, keeping the feedback loop fast.

---

## DNS Setup (turnkeyhomes.app)

DNS for `turnkeyhomes.app` is managed through **Squarespace**. When Amplify is deployed, it will provide CNAME/ANAME records that need to be added to Squarespace.

Automate this rather than doing it manually. Preferred approaches in order:

1. **Squarespace API** — Squarespace has a developer API; investigate whether it exposes DNS record management. If it does, a small script in `infra/scripts/setup-dns.ts` can apply the records as part of the deploy process.
2. **CLI tool** — Check if any third-party CLI (e.g. `squarespace-dns`) supports DNS record management for Squarespace-managed domains.
3. **Playwright** — If no API or CLI is available, use Playwright to automate the DNS record entry through the Squarespace DNS settings UI. Script lives at `infra/scripts/setup-dns-playwright.ts`.

The required records will typically be:
- `CNAME www → <amplify-app-id>.cloudfront.net`
- `ANAME / ALIAS @ → <amplify-app-id>.cloudfront.net` (for apex domain, if Squarespace supports it)

> **Note:** Investigate the Squarespace API first — as of 2023 Squarespace acquired Google Domains and has been expanding its developer platform, so API-based DNS management may already be available.

---

## Out of Scope (for now)

- Confirmation email to the submitter
- Unsubscribe flow
- Full admin dashboard UI
- CDK pipeline (CodePipeline) for infra changes — manual `cdk deploy` is fine for now

---

## Acknowledgements

Eric is an incredibly thoughtful engineer and this project is better for having him involved.
