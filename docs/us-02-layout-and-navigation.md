# US-02 — Layout and navigation between sections

**As a** visitor, **I want** every page to share the same header, navigation bar and footer, and to
move between sections without the page reloading, **so that** I never get lost and the site feels
like one coherent product.

This is a UI and structure story: it has no business rules. Its critical points are that the
navigation **never leads to a missing page** and that moving around **does not reload the page**
(it is a single-page application).

Requirement: Pre-delivery **Req 1.1, 1.2** (folder structure and `Layout`) and **Req 3.1, 3.2**
(react-router-dom, required routes, `<Link>` in the navbar).

Depends on: [US-01](us-01-ci-cd-and-live-deployment.md) (a live, protected-branch pipeline).

## Scope

Included:

- The folder structure (feature-based, described in the [index](README.md)).
- `Layout.jsx` containing `Header.jsx`, `NavBar.jsx`, an outlet for the current page and
  `Footer.jsx` (the footer has only a placeholder line here).
- **react-router-dom** with the four required routes, each rendering a **placeholder page** that
  shows its own heading:
  - `/` (Home), `/productos` (Catalog), `/producto/:id` (Detail), `/carrito` (Cart).
- A `NavBar` with `<Link>` items: **Inicio**, **Servicios**, **Carrito** (the detail page has no
  link of its own: it is reached from the catalog).
- SPA fallback for the hosting (`vercel.json`) so refreshing `/productos` works in production.
- The shared test helper `renderWithProviders` (router only, for now).

Not included:

- Highlighting the current section and the 404 page: **US-03**.
- Real content: the landing (US-06), the catalog (US-08), the detail (US-09), the cart (US-13).
- The cart counter in the navbar: **US-12**. Translations: **US-04**. Company info and team cards in
  the footer: **US-05**. Styling beyond the minimum: **US-14**.

### Placeholder pages

Each route renders a page that only contains its heading (for example `Catálogo`). They exist so
the router and the navigation can be built and tested now; later stories replace their content
without touching the routes.

## Acceptance scenarios

These scenarios are executable as Vitest + React Testing Library tests (the test name is the
scenario name).

```gherkin
Feature: Layout and navigation between sections
  As a visitor
  I want a shared layout and a working navigation bar
  So that I never get lost

  Scenario: Every page shows header, navigation and footer
    When I visit "/"
    Then I see the header
    And I see the main navigation
    And I see the footer

  Scenario: The navigation lists the main sections
    When I visit "/"
    Then the main navigation has the links "Inicio", "Servicios" and "Carrito"

  Scenario: The home route renders the home page
    When I visit "/"
    Then I see the heading "Inicio"

  Scenario: The catalog route renders the catalog page
    When I visit "/productos"
    Then I see the heading "Servicios"

  Scenario: The detail route renders the detail page with the id
    When I visit "/producto/landing-page"
    Then I see the heading "Detalle del servicio"

  Scenario: The cart route renders the cart page
    When I visit "/carrito"
    Then I see the heading "Carrito"

  Scenario: Following a navigation link changes the page
    Given I am on "/"
    When I follow "Servicios" in the main navigation
    Then I see the heading "Servicios"

  Scenario: Navigating does not reload the page
    Given I am on "/"
    When I follow "Carrito" in the main navigation
    Then the page was not reloaded
```

The last scenario cannot be proved by a jsdom test (a test has no "reload"). It is checked by hand
in a real browser (see the Definition of Done) and by the E2E test of US-15.

### Content (Spanish, provisional until US-04)

| Where            | Text                         |
| ---------------- | ---------------------------- |
| Header           | Trigologia Dev               |
| Navigation links | Inicio · Servicios · Carrito |
| Footer           | © Trigologia Dev             |
| Home heading     | Inicio                       |
| Catalog heading  | Servicios                    |
| Detail heading   | Detalle del servicio         |
| Cart heading     | Carrito                      |

## Non-functional requirements

- **Semantics and accessibility:** `<header>`, `<nav aria-label="Navegación principal">`, `<main>`
  and `<footer>` landmarks; every link reachable and usable with the keyboard.
- **No full reload:** navigation uses `<Link>`, never `<a href>` to internal pages.
- **Deep links work:** opening or refreshing `/productos` or `/carrito` directly works in
  production (SPA fallback).
- **Responsive:** the bar does not overflow at phone width (visual polish comes in US-14).
- **No errors** in the browser console.

## Decisions

- **Router outside `App`:** `main.jsx` wraps `App` in `BrowserRouter`; tests wrap in
  `MemoryRouter`. `App` only declares the routes, which makes it testable at any URL.
- **Layout as a layout route:** `Layout` renders `<Outlet />` where the page goes (class 7).
- **Routes follow the assignment PDF:** `/productos` and `/producto/:id` (not `/products`).
  Route paths do not change with the language.
- **Labels say "Servicios"** (the theme), paths say `productos` (the assignment).
- **The brand is a link, not a heading:** every page owns its `<h1>`, so the header brand is a link
  to `/`. This supersedes the first scenario of US-00 ("heading"): the test is rewritten in this
  story, because the behavior changed on purpose.
- **Footer content is deferred:** a minimal footer is enough to satisfy "Layout contains Footer".

## Definition of Done

- [ ] All scenarios pass as tests, except "does not reload" (manual).
- [ ] `pnpm verify` is green and the pull request's pipeline too.
- [ ] Manual check on the preview: click through the three links; the page does not flash/reload
      (the browser tab spinner does not appear); refresh on `/productos` and on `/carrito` still
      shows the page.
- [ ] Phone width: nothing overflows. No errors in the console.
- [ ] Commits follow Conventional Commits; one green cycle per commit.
