import { test, expect } from "@playwright/test";

test("blocks submit when name is empty", async ({ page }) => {
  await page.goto("/#early-access");

  await page.getByPlaceholder("your@email.com").fill("jane@example.com");
  await page.selectOption("select", "buyer");
  await page.getByRole("button", { name: "Request Early Access" }).click();

  await expect(page.getByText("Name is required.")).toBeVisible();
  await expect(page.getByText("You're on the list.")).not.toBeVisible();
});

test("blocks submit when email is invalid", async ({ page }) => {
  await page.goto("/#early-access");

  await page.getByPlaceholder("Your name").fill("Jane Smith");
  await page.getByPlaceholder("your@email.com").fill("not-an-email");
  await page.selectOption("select", "seller");
  await page.getByRole("button", { name: "Request Early Access" }).click();

  await expect(
    page.getByText("Enter a valid email address.")
  ).toBeVisible();
  await expect(page.getByText("You're on the list.")).not.toBeVisible();
});

test("blocks submit when role is not selected", async ({ page }) => {
  await page.goto("/#early-access");

  await page.getByPlaceholder("Your name").fill("Jane Smith");
  await page.getByPlaceholder("your@email.com").fill("jane@example.com");
  await page.getByRole("button", { name: "Request Early Access" }).click();

  await expect(page.getByText("Please select a role.")).toBeVisible();
  await expect(page.getByText("You're on the list.")).not.toBeVisible();
});
