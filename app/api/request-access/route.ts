import { NextRequest, NextResponse } from "next/server";
import { ulid } from "ulid";
import { db } from "@/lib/db";
import { sendNotificationEmail } from "@/lib/email";

const VALID_ROLES = ["agent", "buyer", "seller", "brokerage"] as const;
type Role = (typeof VALID_ROLES)[number];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, name, role } = body;

  if (!email || !name || !role) {
    return NextResponse.json(
      { message: "email, name, and role are required" },
      { status: 400 }
    );
  }

  if (!VALID_ROLES.includes(role as Role)) {
    return NextResponse.json(
      { message: "role must be one of: agent, buyer, seller, brokerage" },
      { status: 400 }
    );
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  const existing = await db.execute({
    sql: "SELECT id FROM signups WHERE email = ?",
    args: [normalizedEmail],
  });

  if (existing.rows.length > 0) {
    return NextResponse.json(
      { message: "You're already on the list." },
      { status: 409 }
    );
  }

  await db.execute({
    sql: "INSERT INTO signups (id, email, name, role, submitted_at) VALUES (?, ?, ?, ?, ?)",
    args: [ulid(), normalizedEmail, String(name).trim(), role, new Date().toISOString()],
  });

  sendNotificationEmail({ email: normalizedEmail, name, role }).catch((err) => {
    console.error("[email] failed to send notification", err);
  });

  return NextResponse.json({ message: "You're on the list." }, { status: 201 });
}
