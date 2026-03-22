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

  return NextResponse.json({ authHeaderReceived: !!auth, awsVars, ssmResult, ssmError });
}
