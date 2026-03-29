import { db } from "../lib/db";

await db.execute(`
  CREATE TABLE IF NOT EXISTS signups (
    id           TEXT PRIMARY KEY,
    email        TEXT NOT NULL UNIQUE,
    name         TEXT NOT NULL,
    role         TEXT NOT NULL CHECK (role IN ('agent','buyer','seller','brokerage')),
    submitted_at TEXT NOT NULL
  )
`);

console.log("Schema ready.");
await db.close();
