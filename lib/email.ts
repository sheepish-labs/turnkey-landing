import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({ region: process.env.AWS_REGION ?? "us-east-1" });

export async function sendNotificationEmail({
  email,
  name,
  role,
}: {
  email: string;
  name: string;
  role: string;
}) {
  const from = process.env.SES_FROM_ADDRESS!;
  const to = process.env.SES_NOTIFY_ADDRESS!;

  if (process.env.SES_SANDBOX === "true") {
    console.log(`[dev] email skipped — would have sent to ${to}:`, {
      email,
      name,
      role,
    });
    return;
  }

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
