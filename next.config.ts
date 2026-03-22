import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@aws-sdk/client-dynamodb",
    "@aws-sdk/lib-dynamodb",
    "@aws-sdk/client-ses",
    "@aws-sdk/client-ssm",
  ],
  // Baked at build time, readable via __NEXT_PRIVATE_STANDALONE_CONFIG at Lambda runtime
  // (Amplify WEB_COMPUTE does not inject console env vars into the Lambda process)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(({
    runtimeSecrets: {
      ADMIN_TOKEN: process.env.ADMIN_TOKEN ?? "",
      APP_AWS_ACCESS_KEY_ID: process.env.APP_AWS_ACCESS_KEY_ID ?? "",
      APP_AWS_SECRET_ACCESS_KEY: process.env.APP_AWS_SECRET_ACCESS_KEY ?? "",
      DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME ?? "TurnkeyWaitlist",
      SES_FROM_ADDRESS: process.env.SES_FROM_ADDRESS ?? "",
      SES_NOTIFY_ADDRESS: process.env.SES_NOTIFY_ADDRESS ?? "",
    },
  } as any)),
};

export default nextConfig;
