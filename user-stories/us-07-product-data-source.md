# US-07 — Load the services from a data source

**As a** developer, **I want** the list of services to be loaded from `productos.json` through one
isolated data-access function and one hook that exposes loading, data and error, **so that** any
page can show services without knowing where they come from, and so that switching to Firebase later
touches only one file.

This is a technical (enabler) story. It has no visible page of its own (the catalog that shows the
data is US-08). Its critical point is the **seam**: components depend on the hook, the hook depends
on the service, and only the service knows about `fetch` and the JSON file.

Requirement: Pre-delivery **Req 2.1** (load products from a local `productos.json` with `useEffect`
and `fetch`) — the data half; the rendering half is US-08.

Depends on: [US-04](us-04-language-detection-and-switch.md) (the data is bilingual).

## Scope

Included:

- `public/productos.json` with at least 6 services (see the data shape).
- `productsApi.js`: `getProducts()` and `getProductById(id)` (using `fetch`).
- `useProducts()` hook with `useEffect` + `useState`, returning `{ products, loading, error }`.
- A pure helper `localized(field, language)` that picks the text of the active language from a
  `{ es, en }` object, with fallback to Spanish.
- **MSW** set up for the tests (network-level mock of `/productos.json`), including the error case.

Not included:

- Rendering anything: **US-08** (list) and **US-09** (detail).
- Firebase/Firestore: **US-17** (it replaces the body of `productsApi`).
- Caching, retries, pagination.

### Data shape

```json
{
  "id": "landing-page",
  "title": { "es": "Landing page", "en": "Landing page" },
  "description": { "es": "...", "en": "..." },
  "price": 350,
  "category": "web",
  "image": "/images/landing-page.svg"
}
```

- `id`: unique, URL-safe string (used in `/producto/:id`).
- `price`: number in USD per unit; `category`: one of `web`, `backend`, `mentoring`, `devops`.
- Suggested services: Landing page, React app, REST API, Database design, Code review, Git & Linux
  tutoring (per hour), Dotfiles/Neovim setup.

## Acceptance scenarios

Executable as Vitest tests (unit for the helper, MSW-backed for the service and the hook).

```gherkin
Feature: Load the services from a data source
  As a developer
  I want one isolated data source and one hook
  So that pages can show services without knowing where they come from

  Scenario: The service returns all the products
    Given the server answers "/productos.json" with 3 products
    When I ask the service for all products
    Then I get 3 products

  Scenario: The service finds a product by id
    Given the server answers with a product whose id is "landing-page"
    When I ask the service for the product "landing-page"
    Then I get that product

  Scenario: The service reports an unknown id
    When I ask the service for the product "does-not-exist"
    Then I get nothing (null)

  Scenario: The service fails when the server fails
    Given the server answers "/productos.json" with status 500
    When I ask the service for all products
    Then the service rejects

  Scenario: The hook starts loading
    When a component uses the products hook
    Then "loading" is true and "products" is empty

  Scenario: The hook exposes the loaded products
    Given the server answers with 3 products
    When the products are loaded
    Then "loading" is false and "products" has 3 items and "error" is empty

  Scenario: The hook exposes an error
    Given the server fails
    When the request finishes
    Then "loading" is false and "error" is set

  Scenario: Text is picked by language
    Given a field { es: "Hola", en: "Hello" }
    Then "localized" returns "Hola" for "es" and "Hello" for "en"

  Scenario: Text falls back to Spanish
    Given a field { es: "Hola", en: "Hello" }
    Then "localized" returns "Hola" for "fr"

  Scenario: The real data file is valid
    Given the file "public/productos.json"
    Then it has at least 6 products with unique ids and both languages in every text
```

## Non-functional requirements

- **No global side effects in tests:** MSW handlers are reset after every test; unhandled requests
  fail the test (`onUnhandledRequest: 'error'`).
- **No request leaks after unmount:** the hook ignores a response that arrives after the component
  unmounted (cleanup flag in `useEffect`).

## Decisions

- **JSON in `public/`, not `src/`:** only files in `public/` are served as-is, so
  `fetch('/productos.json')` works (class 5).
- **Service returns `null` for an unknown id** instead of throwing: "not found" is an expected case,
  a network failure is an error.
- **Why MSW and not mocking `fetch` by hand:** the test exercises the real `fetch` call, URL
  included; if someone changes the URL the test fails.
- **`useProducts` fetches on mount, once.** Refetch/caching would be TanStack Query territory
  (mentioned in the workflow as a future alternative).
- **`getProductById` reuses `getProducts`:** with a JSON file there is no per-item endpoint.

## Definition of Done

- [ ] All scenarios pass as tests; the data-file test protects `productos.json`.
- [ ] `pnpm verify` and the pull request's pipeline are green.
- [ ] Manual check: open `<preview-url>/productos.json` in the browser and see the JSON.
- [ ] Commits follow Conventional Commits.
