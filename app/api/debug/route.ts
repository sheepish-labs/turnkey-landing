import { NextResponse } from "next/server";
import { getRuntimeSecrets } from "@/lib/runtime-config";

export async function GET() {
  const secrets = getRuntimeSecrets();
  return NextResponse.json({
    adminTokenDefined: !!secrets.ADMIN_TOKEN,
    adminTokenLength: secrets.ADMIN_TOKEN?.length ?? 0,
    awsKeyDefined: !!secrets.APP_AWS_ACCESS_KEY_ID,
    dynamoTableName: secrets.DYNAMODB_TABLE_NAME,
  });
}
