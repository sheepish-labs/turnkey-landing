import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  ...(process.env.DYNAMODB_ENDPOINT
    ? { endpoint: process.env.DYNAMODB_ENDPOINT }
    : {}),
});

export const dynamo = DynamoDBDocumentClient.from(client);
export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ?? "TurnkeyWaitlist";
