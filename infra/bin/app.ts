#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { TurnkeyStack } from "../lib/turnkey-stack";

const app = new cdk.App();

new TurnkeyStack(app, "TurnkeyStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "us-east-1",
  },
  adminToken: process.env.CDK_ADMIN_TOKEN ?? "change-me",
  sesFromAddress: process.env.CDK_SES_FROM ?? "noreply@turnkeyhomes.app",
  sesNotifyAddress: process.env.CDK_SES_NOTIFY ?? "kelli@sheepishlabs.com",
});
