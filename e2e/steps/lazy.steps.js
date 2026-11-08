import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { When, Then } = createBdd();

const PRIVATE_PAGES = ["Login", "Register", "Profile", "Gestion", "Checkout"];
const downloaded = new WeakMap();

function record(page) {
  const urls = [];
  downloaded.set(page, urls);
  page.on("request", (request) => urls.push(request.url()));
}

function wasDownloaded(page, name) {
  return downloaded.get(page).some((url) => new RegExp(`${name}(Page)?-.*\\.js`).test(url));
}

When("I visit {string} recording the downloaded files", async ({ page }, path) => {
  record(page);
  await page.goto(path);
  await page.waitForLoadState("networkidle");
});

When("I record the downloaded files", async ({ page }) => {
  record(page);
});

When("I open the page {string}", async ({ page }, path) => {
  await page.getByRole("link", { name: path === "/login" ? "Iniciar sesión" : path }).click();
  await page.waitForLoadState("networkidle");
});

Then("no file of the private pages was downloaded", async ({ page }) => {
  for (const name of PRIVATE_PAGES) {
    expect(wasDownloaded(page, name), name).toBe(false);
  }
});

Then("the file of the {string} page was downloaded", async ({ page }, name) => {
  await expect.poll(() => wasDownloaded(page, name)).toBe(true);
});
