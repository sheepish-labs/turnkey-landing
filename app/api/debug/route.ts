import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  return NextResponse.json({
    adminTokenDefined: !!process.env.ADMIN_TOKEN,
    adminTokenLength: process.env.ADMIN_TOKEN?.length ?? 0,
    authHeaderReceived: !!auth,
    authHeaderLength: auth?.length ?? 0,
  });
}
