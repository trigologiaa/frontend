import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { When, Then } = createBdd();

When("I visit {string}", async ({ page }, path) => {
  await page.goto(path);
});

Then("I see the not-found page", async ({ page }) => {
  await expect(
    page.getByRole("heading", { level: 1, name: /No encontramos esa página/ }),
  ).toBeVisible();
});

When("I follow {string}", async ({ page }, name) => {
  await page.getByRole("link", { name }).click();
});

Then("I see the home page", async ({ page }) => {
  await expect(
    page.getByRole("heading", { level: 1, name: "Software a tu medida, sin vueltas" }),
  ).toBeVisible();
});
