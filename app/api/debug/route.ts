import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const envKeys = Object.keys(process.env).filter(
    (k) => !k.startsWith("AWS_") && !k.startsWith("npm_")
  );
  return NextResponse.json({
    adminTokenDefined: !!process.env.ADMIN_TOKEN,
    authHeaderReceived: !!auth,
    envKeys,
  });
}
