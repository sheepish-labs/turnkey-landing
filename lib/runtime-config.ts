// Amplify WEB_COMPUTE does not inject Amplify console env vars into the Lambda
// process at runtime. As a workaround, secrets are embedded into next.config.ts
// under the `runtimeSecrets` key, which Next.js serializes into
// __NEXT_PRIVATE_STANDALONE_CONFIG — the one env var that IS available at runtime.

interface RuntimeSecrets {
  ADMIN_TOKEN: string;
  APP_AWS_ACCESS_KEY_ID: string;
  APP_AWS_SECRET_ACCESS_KEY: string;
  DYNAMODB_TABLE_NAME: string;
  SES_FROM_ADDRESS: string;
  SES_NOTIFY_ADDRESS: string;
}

let cached: RuntimeSecrets | undefined;

export function getRuntimeSecrets(): RuntimeSecrets {
  if (cached) return cached;
  const config = process.env.__NEXT_PRIVATE_STANDALONE_CONFIG
    ? JSON.parse(process.env.__NEXT_PRIVATE_STANDALONE_CONFIG)
    : {};
  cached = (config.runtimeSecrets ?? {}) as RuntimeSecrets;
  return cached;
}
