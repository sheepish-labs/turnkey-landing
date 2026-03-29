import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = auth?.replace("Bearer ", "").trim();

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const result = await db.execute(
    "SELECT id, email, name, role, submitted_at FROM signups ORDER BY submitted_at ASC"
  );

  const escape = (v: unknown) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;

  const csv = [
    ["id", "email", "name", "role", "submittedAt"].join(","),
    ...result.rows.map((row) =>
      [row.id, row.email, row.name, row.role, row.submitted_at]
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
