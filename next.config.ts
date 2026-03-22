import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@aws-sdk/client-dynamodb",
    "@aws-sdk/lib-dynamodb",
    "@aws-sdk/client-ses",
    "@aws-sdk/client-ssm",
  ],
  // Custom field — baked at build time, readable via __NEXT_PRIVATE_STANDALONE_CONFIG at runtime
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(({ runtimeSecrets: { ADMIN_TOKEN: process.env.ADMIN_TOKEN ?? "" } } as any)),
};

export default nextConfig;
