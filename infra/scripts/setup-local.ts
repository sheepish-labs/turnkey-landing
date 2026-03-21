import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
  credentials: { accessKeyId: "local", secretAccessKey: "local" },
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ?? "TurnkeyWaitlist";

async function setup() {
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    console.log(`Table ${TABLE_NAME} already exists — skipping.`);
    return;
  } catch {
    // Table doesn't exist, create it
  }

  await client.send(
    new CreateTableCommand({
      TableName: TABLE_NAME,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" },
        { AttributeName: "email", AttributeType: "S" },
      ],
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      GlobalSecondaryIndexes: [
        {
          IndexName: "email-index",
          KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
        },
      ],
    })
  );

  console.log(`Table ${TABLE_NAME} created.`);
}

setup().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
