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

Then("the first row of the catalog has {int} cards", async ({ page }, columns) => {
  const cards = page.getByRole("main").getByRole("listitem");
  await cards.first().waitFor();
  const tops = await cards.evaluateAll((items) =>
    items.map((item) => Math.round(item.getBoundingClientRect().top)),
  );
  const inFirstRow = tops.filter((top) => top === tops[0]).length;
  expect(inFirstRow).toBe(columns);
});
