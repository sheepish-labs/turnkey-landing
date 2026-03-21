import { test, expect } from "@playwright/test";

test("happy path — fills all fields and sees success state", async ({
  page,
}) => {
  await page.goto("/#early-access");

  await page.getByPlaceholder("Your name").fill("Jane Smith");
  await page.getByPlaceholder("your@email.com").fill(`jane-${Date.now()}@example.com`);
  await page.selectOption("select", "agent");
  await page.getByRole("button", { name: "Request Early Access" }).click();

  await expect(page.getByText("You're on the list.")).toBeVisible();
  await expect(
    page.getByText("We'll be in touch when your spot opens up.")
  ).toBeVisible();
});
