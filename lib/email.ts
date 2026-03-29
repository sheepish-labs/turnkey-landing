import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

function makeSesClient() {
  return new SESClient({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
    },
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
  if (process.env.SES_SANDBOX === "true") {
    console.log(`[dev] email skipped — would have sent to ${process.env.SES_NOTIFY_ADDRESS}:`, {
      email,
      name,
      role,
    });
    return;
  }

  const ses = makeSesClient();
  await ses.send(
    new SendEmailCommand({
      Source: process.env.SES_FROM_ADDRESS!,
      Destination: { ToAddresses: [process.env.SES_NOTIFY_ADDRESS!] },
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
