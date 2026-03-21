import { test, expect } from "@playwright/test";

test("wrong password shows error", async ({ page }) => {
  await page.goto("/admin");

  await page.getByPlaceholder("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByText("Incorrect password.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Download Waitlist CSV" })
  ).not.toBeVisible();
});

test("correct password reveals download button", async ({ page }) => {
  await page.goto("/admin");

  await page.getByPlaceholder("Password").fill(process.env.ADMIN_TOKEN ?? "local-admin-token");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(
    page.getByRole("button", { name: "Download Waitlist CSV" })
  ).toBeVisible();
});
