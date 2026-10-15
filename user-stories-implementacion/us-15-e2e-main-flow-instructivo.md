# Instructivo US-15: test end-to-end del flujo principal (JavaScript)

Guía para implementar [US-15](../user-stories/us-15-e2e-main-flow.md) con el [flujo](00-workflow.md).
Es la **única** story donde se usa Gherkin de verdad (archivos `.feature` ejecutables).
Formato de los pasos: [Formato de los instructivos](00-workflow.md#formato-de-los-instructivos).

> Los tests unitarios/de componente arman su propio entorno (`renderWithProviders`). Si alguien
> olvida poner `CartProvider` en `main.jsx`, **todos esos tests siguen verdes** y la app real se
> rompe. El E2E existe para detectar exactamente eso: abre el sitio construido en un navegador real
> y hace lo que haría una persona.

## Qué vas a construir

```
e2e/features/*.feature   (escenarios Gherkin: qué hace la persona)
e2e/steps/*.js           (cómo se traduce cada frase a acciones de Playwright)
playwright.config.js     (navegador, servidor de la app, dónde están los features)
.github/workflows/ci.yml (nuevo job "e2e")
```

> **Concepto — Playwright:** controla un navegador real (Chromium). `page.goto`, `page.getByRole(...).click()`.
> Sus aserciones (`expect(locator).toBeVisible()`) **esperan solas** hasta que se cumplen: no
> necesitás `sleep`.
>
> **Concepto — playwright-bdd:** une Cucumber/Gherkin con Playwright. Un comando (`bddgen`) genera
> tests de Playwright a partir de los `.feature` y de tus *step definitions*.

## Mapa de archivos

| Paso/ciclo | Archivo | Acción |
| ---------- | ------- | ------ |
| 0 | `package.json`, `pnpm-lock.yaml` (por `pnpm add -D`) | editar |
| 1 | `playwright.config.js` | **crear** |
| 1 | `package.json` | editar (script `e2e`) |
| 1 | `.gitignore` | editar |
| 1 (ciclo) | `e2e/features/purchase-flow.feature` | **crear** |
| 1 (ciclo) | `e2e/steps/purchase-flow.steps.js` | **crear** |
| 2 | `e2e/features/navigation.feature` | **crear** |
| 2 | `e2e/steps/navigation.steps.js` | **crear** |
| 3 | `e2e/features/responsive.feature` | **crear** |
| 3 | `e2e/steps/responsive.steps.js` | **crear** |
| 5 | `.github/workflows/ci.yml` | editar (job `e2e`) |
| 6 | `knip.json` | editar |

## Paso 0: Preparar

```sh
git switch main && git pull
git switch -c us-15-e2e-main-flow
pnpm verify
cp <ruta-a>/javascript/user-stories/us-15-e2e-main-flow.md docs/
git add docs && git commit -m "docs: add US-15 e2e main flow story"
pnpm add -D @playwright/test playwright-bdd
pnpm exec playwright install chromium
```

> En Linux, si Chromium no arranca por bibliotecas faltantes: Ubuntu/Debian →
> `pnpm exec playwright install --with-deps chromium`; Arch → instalá las dependencias que nombre
> el error con `pacman`. Si `bddgen` pide `@cucumber/cucumber`, instalalo también
> (`pnpm add -D @cucumber/cucumber`).

---

## Paso 1: Configuración (sin test: es infraestructura)

**Archivo:** `playwright.config.js` (**crealo**, en la raíz del repo).
**Dónde:** el archivo entero.

```js
import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const testDir = defineBddConfig({
  features: "e2e/features/*.feature",
  steps: "e2e/steps/*.js",
});

export default defineConfig({
  testDir,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:4173",
    locale: "es-AR", // el navegador "habla" español: el sitio se muestra en español
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm build && pnpm preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

> `webServer` construye la app y la sirve con `vite preview` (**lo que se despliega**, no el servidor
> de desarrollo). `locale: "es-AR"` fija el idioma del navegador: así la detección de US-04 da
> español sin importar tu máquina.

**Archivo:** `package.json`
**Dónde:** dentro de `"scripts"`, **después** de `"dev": "vite",` (agregá la línea):

```json
    "e2e": "bddgen && playwright test",
```

**Archivo:** `.gitignore`
**Dónde:** al **final** del archivo, agregá estas líneas (ya hay un `playwright.report` con otro
nombre: no sirve, la carpeta real se llama `playwright-report`).

```
.features-gen
playwright-report
```

(`test-results` y `blob-report` ya están.)

**Corré:** `pnpm verify`. **Resultado esperado:** todo verde (Vitest solo mira `test/`, Biome solo
`src/`: la carpeta `e2e/` no les afecta).

```sh
git add -A && git commit -m "chore(e2e): set up playwright with playwright-bdd"
```

---

## Ciclo 1 — El flujo principal de compra

### 1. 🔴 Escribir el escenario

**Archivo:** `e2e/features/purchase-flow.feature` (**crealo**; las carpetas `e2e/features/` son nuevas).
**Dónde:** el archivo entero.

```gherkin
Feature: Main purchase flow
  As a visitor
  I want to browse, add a service to the cart and review it
  So that I can collect what I want to hire

  Scenario: Add a service to the cart and see it in the cart
    Given I am on the home page
    When I go to the services catalog
    And I open the service "Landing page"
    And I add 2 units to the cart
    Then the cart icon shows 2
    When I open the cart
    Then I see "Landing page" with quantity 2
```

**Corré:** `pnpm e2e`. **Rojo esperado** (todavía no escribiste los pasos): `bddgen` se queja de
**"Missing step definitions"** y te imprime el código sugerido para cada paso. Es el rojo correcto: el
escenario existe y no hay cómo ejecutarlo. **No commitees en rojo.**

### 2. 🟢 Escribir los pasos

**Archivo:** `e2e/steps/purchase-flow.steps.js` (**crealo**).
**Dónde:** el archivo entero.

```js
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
```

**Corré:** `pnpm e2e`. **Resultado esperado:** `1 passed`. Si falla, **leé** el error de Playwright: te
dice qué *locator* no encontró y adjunta una captura; abrí el reporte con
`pnpm exec playwright show-report`.

> **Sobre los nombres:** el título "Landing page" viene de `public/productos.json` (no de MSW). Si lo
> cambiaste, ajustá el escenario.

### 3. Probar que el test sirve (mutación)

1. En `src/main.jsx` **quitá** el `<CartProvider>` (y su `import`). Corré `pnpm test:run`:
   **todo verde** (los tests usan su propio provider). Corré `pnpm e2e`: **rojo** (la app real se
   rompe: `useCart must be used inside a CartProvider`). Esa diferencia es el valor del E2E.
2. `git restore src/main.jsx` y `pnpm e2e` otra vez en verde.

### 4. Commit

```sh
git add -A && git commit -m "test(e2e): cover the purchase flow from the catalog to the cart"
```

---

## Ciclo 2 — La dirección equivocada vuelve al inicio

### 1. 🔴 Escribir el escenario

**Archivo:** `e2e/features/navigation.feature` (**crealo**).
**Dónde:** el archivo entero.

```gherkin
Feature: Navigation
  As a visitor
  I want to recover from a wrong address
  So that I am never stuck

  Scenario: A wrong address leads back home
    When I visit "/esto-no-existe"
    Then I see the not-found page
    When I follow "Volver al inicio"
    Then I see the home page
```

**Corré:** `pnpm e2e`. **Rojo esperado:** `Missing step definitions` para los pasos nuevos
(`I visit {string}`, `I see the not-found page`, `I follow {string}`, `I see the home page`).

### 2. 🟢 Escribir los pasos

**Archivo:** `e2e/steps/navigation.steps.js` (**crealo**).
**Dónde:** el archivo entero.

```js
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
```

**Corré:** `pnpm e2e`. **Resultado esperado:** `2 passed`.

> Como la URL `/esto-no-existe` se abre **directo**, este escenario también prueba el *fallback SPA*
> (`vercel.json`) en local; en el preview de Vercel lo probás a mano.

### 3. Commit

```sh
git add -A && git commit -m "test(e2e): cover the not-found flow"
```

---

## Ciclo 3 — La home entra en un celular

### 1. 🔴 Escribir el escenario

**Archivo:** `e2e/features/responsive.feature` (**crealo**).
**Dónde:** el archivo entero.

```gherkin
Feature: Responsive layout
  As a visitor on a phone
  I want the pages to fit my screen
  So that I never have to scroll sideways

  Scenario: The home page fits a phone screen
    Given a viewport of 360 by 640 pixels
    When I visit "/"
    Then there is no horizontal scrolling
```

**Corré:** `pnpm e2e`. **Rojo esperado:** `Missing step definitions` para
`a viewport of {int} by {int} pixels` y `there is no horizontal scrolling` (el paso
`I visit {string}` ya existe: los pasos se **reutilizan**).

### 2. 🟢 Escribir los pasos

**Archivo:** `e2e/steps/responsive.steps.js` (**crealo**).
**Dónde:** el archivo entero.

```js
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
```

**Corré:** `pnpm e2e`. **Resultado esperado:** `3 passed`.

### 3. Mutación

1. En `src/layout/Header.module.css`, dentro de la regla `.header { ... }`, agregá `width: 600px;`.
2. **Corré** `pnpm e2e`. **Rojo esperado:** `there is no horizontal scrolling` falla
   (`Expected: false / Received: true`).
3. **Restaurá** (borrá la línea) y corré de nuevo: verde.

### 4. Commit

```sh
git add -A && git commit -m "test(e2e): check the home page fits a phone screen"
```

---

## Paso 5 — El job `e2e` en el pipeline

**Archivo:** `.github/workflows/ci.yml`
**Dónde:** reemplazá el archivo entero. El job `verify` queda igual; el job `e2e` es nuevo y va
**debajo** de `verify`, dentro de `jobs:`.

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm verify

  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

```sh
git add -A && git commit -m "ci: run the end-to-end tests on pull requests"
```

---

## Paso 6 — Knip y protección de `main`

### 1. Que Knip conozca los puntos de entrada del E2E

**Archivo:** `knip.json`
**Dónde:** reemplazá el archivo entero (se suma `"entry"`). Solo hace falta si `pnpm verify` marca los
steps o la config de Playwright como sin usar.

```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": ["e2e/steps/*.js", "playwright.config.js"],
  "ignoreDependencies": []
}
```

**Corré:** `pnpm verify`. **Resultado esperado:** todo verde. (`pnpm verify` **no** corre E2E: es lento,
corre en el PR.)

### 2. Proteger `main`

En GitHub: *Settings → Rules → protect-main* → agregá `e2e` como **check requerido** (aparece en la
lista cuando ya corrió una vez en un PR).

### 3. Commit

```sh
git add -A && git commit -m "chore: let knip know about the e2e entry points"
```

---

## Probar el pipeline (el "rojo" real)

En una rama descartable, rompé `src/main.jsx` como en la mutación del ciclo 1, subila con
`HUSKY=0 git push` y abrí el PR: `verify` ✓, **`e2e` ✗**, merge bloqueado. Bajá el reporte desde
*Artifacts* (`playwright-report`) y abrí `index.html`. Cerrá el PR y borrá la rama.

## Verificación manual

- [ ] `pnpm e2e` pasa en tu máquina (3 escenarios) y tarda menos de dos minutos.
- [ ] El PR de esta story mostró `verify` y `e2e` en verde.
- [ ] El PR roto fue bloqueado por `e2e`.

## Publicar

```sh
git push -u origin us-15-e2e-main-flow
gh pr create --fill --base main && gh pr checks --watch
```

Squash merge: `test: protect the main flow with end-to-end tests (US-15)`.

## Commits sugeridos

```
docs: add US-15 e2e main flow story
chore(e2e): set up playwright with playwright-bdd
test(e2e): cover the purchase flow from the catalog to the cart
test(e2e): cover the not-found flow
test(e2e): check the home page fits a phone screen
ci: run the end-to-end tests on pull requests
chore: let knip know about the e2e entry points
```

## Definition of Done

- [ ] Los tres escenarios pasan local (`pnpm e2e`) y los viste fallar primero.
- [ ] El job `e2e` corre en el PR y es un check requerido.
- [ ] La mutación de `main.jsx` rompió solo el E2E.
- [ ] `pnpm verify` sigue verde y rápido. Commits convencionales.

## Qué aprendiste

- La pirámide: pocos E2E, los que protegen el recorrido; el resto en Vitest.
- El E2E atrapa lo que los tests con "entorno propio" no ven (el cableado real de la app).
- Gherkin es útil acá: el `.feature` se lee como la historia de usuario y es ejecutable.
- Los artefactos de CI (reporte de Playwright) te permiten diagnosticar un fallo remoto.
