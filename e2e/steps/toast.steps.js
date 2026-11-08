import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Then } = createBdd();

Then("I see the notice {string}", async ({ page }, text) => {
  await expect(page.getByRole("alert").filter({ hasText: text })).toBeVisible();
});

Then("the notice goes away by itself", async ({ page }) => {
  await expect(page.locator(".Toastify__toast")).toBeHidden({ timeout: 10_000 });
});
