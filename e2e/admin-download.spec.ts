import { test, expect } from "@playwright/test";

test("download returns CSV with correct headers", async ({ page }) => {
  const response = await page.request.get("/api/admin/signups", {
    headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN ?? "local-admin-token"}` },
  });

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/csv");
  expect(response.headers()["content-disposition"]).toContain(
    "turnkey-waitlist.csv"
  );

  const text = await response.text();
  const firstLine = text.split("\n")[0];
  expect(firstLine).toBe("id,email,name,role,submittedAt");
});

test("download returns 401 without token", async ({ page }) => {
  const response = await page.request.get("/api/admin/signups");
  expect(response.status()).toBe(401);
});
