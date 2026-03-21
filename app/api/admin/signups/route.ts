import { NextRequest, NextResponse } from "next/server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_NAME } from "@/lib/dynamo";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = auth?.replace("Bearer ", "").trim();

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const result = await dynamo.send(new ScanCommand({ TableName: TABLE_NAME }));
  const items = (result.Items ?? []).sort((a, b) =>
    String(a.submittedAt).localeCompare(String(b.submittedAt))
  );

  const escape = (v: unknown) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;

  const csv = [
    ["id", "email", "name", "role", "submittedAt"].join(","),
    ...items.map((item) =>
      [item.id, item.email, item.name, item.role, item.submittedAt]
        .map(escape)
        .join(",")
    ),
  ].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="turnkey-waitlist.csv"',
    },
  });
}
