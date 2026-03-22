import { NextRequest, NextResponse } from "next/server";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");

  const awsVars = {
    AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
    AWS_SESSION_TOKEN: !!process.env.AWS_SESSION_TOKEN,
    AWS_REGION: process.env.AWS_REGION ?? "not set",
    ADMIN_TOKEN: !!process.env.ADMIN_TOKEN,
  };

  let ssmResult: string | null = null;
  let ssmError: string | null = null;
  try {
    const ssm = new SSMClient({
      region: "us-east-1",
      credentials: process.env.AWS_ACCESS_KEY_ID ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        sessionToken: process.env.AWS_SESSION_TOKEN,
      } : undefined,
    });
    const res = await ssm.send(
      new GetParameterCommand({ Name: "/turnkey/admin-token", WithDecryption: true })
    );
    ssmResult = res.Parameter?.Value ? "ok-length-" + res.Parameter.Value.length : "empty";
  } catch (e) {
    ssmError = String(e);
  }

  const amplifyListener = {
    enabled: process.env.AWS_AMPLIFY_CREDENTIAL_LISTENER_ENABLED,
    host: process.env.AWS_AMPLIFY_CREDENTIAL_LISTENER_HOST,
    port: process.env.AWS_AMPLIFY_CREDENTIAL_LISTENER_PORT,
    path: process.env.AWS_AMPLIFY_CREDENTIAL_LISTENER_PATH,
    timeout: process.env.AWS_AMPLIFY_CREDENTIAL_LISTENER_TIMEOUT,
    deploymentId: process.env.AWS_AMPLIFY_DEPLOYMENT_ID,
    metadataApi: process.env.AWS_LAMBDA_METADATA_API,
  };

  // Try fetching credentials directly from the listener
  let listenerResult: unknown = null;
  let listenerError: string | null = null;
  if (amplifyListener.host && amplifyListener.port && amplifyListener.path) {
    try {
      const url = `http://${amplifyListener.host}:${amplifyListener.port}${amplifyListener.path}`;
      const res = await fetch(url);
      listenerResult = { status: res.status, body: await res.text() };
    } catch (e) {
      listenerError = String(e);
    }
  }

  const standaloneConfig = process.env.__NEXT_PRIVATE_STANDALONE_CONFIG
    ? JSON.parse(process.env.__NEXT_PRIVATE_STANDALONE_CONFIG)
    : {};
  const serverRuntimeConfig = standaloneConfig.serverRuntimeConfig ?? {};

  return NextResponse.json({
    awsVars,
    amplifyListenerEnabled: amplifyListener.enabled,
    ssmError,
    standaloneConfigKeys: Object.keys(standaloneConfig),
    serverRuntimeConfigKeys: Object.keys(serverRuntimeConfig),
    adminTokenInRuntimeConfig: !!serverRuntimeConfig.ADMIN_TOKEN,
    adminTokenLength: serverRuntimeConfig.ADMIN_TOKEN?.length ?? 0,
  });
}
