import { test, expect } from "@playwright/test";

test("shows already-on-list message for duplicate email", async ({ page }) => {
  const email = `duplicate-${Date.now()}@example.com`;

  // First signup
  await page.goto("/#early-access");
  await page.getByPlaceholder("Your name").fill("Jane Smith");
  await page.getByPlaceholder("your@email.com").fill(email);
  await page.selectOption("select", "agent");
  await page.getByRole("button", { name: "Request Early Access" }).click();
  await expect(page.getByText("You're on the list.")).toBeVisible();

  // Second signup with same email — navigate to "/" first to force full page reload
  await page.goto("/");
  await page.goto("/#early-access");
  await page.getByPlaceholder("Your name").fill("Jane Smith");
  await page.getByPlaceholder("your@email.com").fill(email);
  await page.selectOption("select", "agent");
  await page.getByRole("button", { name: "Request Early Access" }).click();
  await expect(page.getByText("You're already on the list.")).toBeVisible();
});
