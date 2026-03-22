import { NextRequest, NextResponse } from "next/server";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");

  let ssmResult: string | null = null;
  let ssmError: string | null = null;
  try {
    const ssm = new SSMClient({ region: "us-east-1" });
    const res = await ssm.send(
      new GetParameterCommand({ Name: "/turnkey/admin-token", WithDecryption: true })
    );
    ssmResult = res.Parameter?.Value ? "ok-length-" + res.Parameter.Value.length : "empty";
  } catch (e) {
    ssmError = String(e);
  }

  return NextResponse.json({
    adminTokenDefined: !!process.env.ADMIN_TOKEN,
    authHeaderReceived: !!auth,
    ssmResult,
    ssmError,
  });
}
