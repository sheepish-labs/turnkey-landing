import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export interface TurnkeyStackProps extends cdk.StackProps {
  adminToken: string;
  sesFromAddress: string;
  sesNotifyAddress: string;
}

export class TurnkeyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TurnkeyStackProps) {
    super(scope, id, props);

    // DynamoDB table
    const table = new dynamodb.Table(this, "WaitlistTable", {
      tableName: "TurnkeyWaitlist",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    table.addGlobalSecondaryIndex({
      indexName: "email-index",
      partitionKey: { name: "email", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // SSM parameters for secrets
    new ssm.StringParameter(this, "AdminToken", {
      parameterName: "/turnkey/admin-token",
      stringValue: props.adminToken,
      tier: ssm.ParameterTier.STANDARD,
    });

    // IAM role for Amplify to assume
    // Attach this role manually in the Amplify console after connecting the app
    const amplifyRole = new iam.Role(this, "AmplifyServiceRole", {
      roleName: "TurnkeyAmplifyServiceRole",
      assumedBy: new iam.ServicePrincipal("amplify.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AdministratorAccess-Amplify"
        ),
      ],
    });

    table.grantReadWriteData(amplifyRole);

    amplifyRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail"],
        resources: [
          `arn:aws:ses:${this.region}:${this.account}:identity/${props.sesFromAddress}`,
        ],
      })
    );

    // Outputs — use these to configure Amplify manually in the console
    new cdk.CfnOutput(this, "DynamoTableName", {
      value: table.tableName,
      description: "Set as DYNAMODB_TABLE_NAME env var in Amplify",
    });

    new cdk.CfnOutput(this, "AmplifyServiceRoleArn", {
      value: amplifyRole.roleArn,
      description: "Attach this role in Amplify console → App settings → General",
    });

    new cdk.CfnOutput(this, "AdminTokenSsmPath", {
      value: "/turnkey/admin-token",
      description: "SSM path for admin token — set ADMIN_TOKEN env var in Amplify from this value",
    });

    new cdk.CfnOutput(this, "Region", {
      value: this.region,
    });
  }
}
