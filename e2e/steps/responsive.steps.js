import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, Then } = createBdd();

Given("a viewport of {int} by {int} pixels", async ({ page }, width, height) => {
  await page.setViewportSize({ width, height });
});

Then("there is no horizontal scrolling", async ({ page }) => {
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflows).toBe(false);
});
