import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("I am on the home page", async ({ page }) => {
  await page.goto("/");
});

When("I go to the services catalog", async ({ page }) => {
  await page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("link", { name: "Servicios" })
    .click();
});

When("I open the service {string}", async ({ page }, title) => {
  await page.getByRole("link", { name: new RegExp(`Ver detalle.*${title}`) }).click();
});

When("I add {int} units to the cart", async ({ page }, units) => {
  for (let i = 1; i < units; i++) {
    await page.getByRole("button", { name: "Aumentar cantidad" }).click();
  }
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
});

Then("the cart icon shows {int}", async ({ page }, units) => {
  const label = units === 1 ? "Carrito, 1 artículo" : `Carrito, ${units} artículos`;
  await expect(page.getByRole("link", { name: label })).toBeVisible();
});

When("I open the cart", async ({ page }) => {
  await page.getByRole("link", { name: /^Carrito/ }).click();
});

Then("I see {string} with quantity {int}", async ({ page }, title, units) => {
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText(`Cantidad: ${units}`)).toBeVisible();
});
