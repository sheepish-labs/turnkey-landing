import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@aws-sdk/client-dynamodb",
    "@aws-sdk/lib-dynamodb",
    "@aws-sdk/client-ses",
    "@aws-sdk/client-ssm",
  ],
  serverRuntimeConfig: {
    ADMIN_TOKEN: process.env.ADMIN_TOKEN ?? "",
  },
};

export default nextConfig;
