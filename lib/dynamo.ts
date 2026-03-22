import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getRuntimeSecrets } from "./runtime-config";

function makeDynamoClient() {
  const secrets = getRuntimeSecrets();
  const accessKeyId = secrets.APP_AWS_ACCESS_KEY_ID || process.env.APP_AWS_ACCESS_KEY_ID;
  const secretAccessKey = secrets.APP_AWS_SECRET_ACCESS_KEY || process.env.APP_AWS_SECRET_ACCESS_KEY;
  return new DynamoDBClient({
    region: process.env.AWS_REGION ?? "us-east-1",
    ...(process.env.DYNAMODB_ENDPOINT
      ? { endpoint: process.env.DYNAMODB_ENDPOINT }
      : {}),
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });
}

export const dynamo = DynamoDBDocumentClient.from(makeDynamoClient());

export function getTableName() {
  const secrets = getRuntimeSecrets();
  return secrets.DYNAMODB_TABLE_NAME || process.env.DYNAMODB_TABLE_NAME || "TurnkeyWaitlist";
}
