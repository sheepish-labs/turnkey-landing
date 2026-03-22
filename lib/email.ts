import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { getRuntimeSecrets } from "./runtime-config";

function makeSesClient() {
  const secrets = getRuntimeSecrets();
  const accessKeyId = secrets.APP_AWS_ACCESS_KEY_ID || process.env.APP_AWS_ACCESS_KEY_ID;
  const secretAccessKey = secrets.APP_AWS_SECRET_ACCESS_KEY || process.env.APP_AWS_SECRET_ACCESS_KEY;
  return new SESClient({
    region: process.env.AWS_REGION ?? "us-east-1",
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });
}

export async function sendNotificationEmail({
  email,
  name,
  role,
}: {
  email: string;
  name: string;
  role: string;
}) {
  const secrets = getRuntimeSecrets();
  const from = secrets.SES_FROM_ADDRESS || process.env.SES_FROM_ADDRESS!;
  const to = secrets.SES_NOTIFY_ADDRESS || process.env.SES_NOTIFY_ADDRESS!;

  if (process.env.SES_SANDBOX === "true") {
    console.log(`[dev] email skipped — would have sent to ${to}:`, {
      email,
      name,
      role,
    });
    return;
  }

  const ses = makeSesClient();
  await ses.send(
    new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: "New TurnKey early access request" },
        Body: {
          Text: {
            Data: `New signup:\n\nName: ${name}\nEmail: ${email}\nRole: ${role}\nTime: ${new Date().toISOString()}`,
          },
        },
      },
    })
  );
}
