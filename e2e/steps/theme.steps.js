import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("the system prefers {string} colors", async ({ page }, scheme) => {
  await page.emulateMedia({ colorScheme: scheme });
});

When("I choose the theme {string}", async ({ page }, name) => {
  await page
    .getByRole("combobox", { name: "Tema" })
    .selectOption({ label: `${name} (oscuro)` });
});

When("I reload the page", async ({ page }) => {
  await page.reload();
});

Then("the page uses the {string} theme", async ({ page }, theme) => {
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
});
