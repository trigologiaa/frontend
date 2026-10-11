# US-03 — Know where I am, and recover from a wrong address

**As a** visitor, **I want** the navigation bar to show which section I am in, and a clear page when
I type an address that does not exist, **so that** I always know where I am and how to get back.

This is a UI story: it has no business rules. Its critical points are that the active section is
exposed **also to assistive technology** (not only with color) and that a wrong address ends in a
clear page that takes the visitor back, never in a blank screen.

Requirement: `cuestiones-a-tener-en-cuenta` #5 (active section in the navbar) and robustness of
Req 3 (routing).

Depends on: [US-02](us-02-layout-and-navigation.md) (layout, navbar and routes).

## Scope

Included:

- The navbar highlights the current section: **NavLink** sets `aria-current="page"` on it.
- A "page not found" page for any unknown address (catch-all route), inside the shared layout.
- A link back to the home page from that page.

Not included:

- Visual design of the active state: basic here, polished in **US-14**.
- "Product not found" for a valid route with an unknown id (`/producto/xyz`): it belongs to
  **US-09**, because it depends on the data.

## Acceptance scenarios

Executable as Vitest + RTL tests.

```gherkin
Feature: Active section and page not found
  As a visitor
  I want to see where I am and recover from a wrong address
  So that I never get lost

  Scenario: The current section is marked in the navigation
    When I visit "/productos"
    Then the link "Servicios" in the main navigation is marked as the current page
    And the links "Inicio" and "Carrito" are not

  Scenario: The marked section follows the navigation
    Given I am on "/"
    When I follow "Carrito" in the main navigation
    Then the link "Carrito" is marked as the current page
    And the link "Inicio" is not

  Scenario: The catalog stays marked on a detail page
    When I visit "/producto/landing-page"
    Then the link "Servicios" in the main navigation is marked as the current page

  Scenario: An unknown address shows a clear message
    When I visit "/esto-no-existe"
    Then I see the heading "No encontramos esa página"
    And I still see the main navigation

  Scenario: The not-found page leads back home
    Given I am on "/esto-no-existe"
    When I follow "Volver al inicio"
    Then I see the heading "Inicio"
```

### Content (Spanish, provisional until US-04)

> **404 — No encontramos esa página**
>
> Puede que el link esté mal escrito, o que la página ya no exista.
>
> [Volver al inicio]

## Non-functional requirements

- **Accessibility:** the active state is conveyed by `aria-current="page"`, not only by color.
- **Landmarks stay correct:** the not-found page renders inside `<main>`.
- **No errors** in the browser console.

## Decisions

- **`NavLink`, not a hand-written check:** React Router computes "active" and sets `aria-current`
  for free. Tests assert the attribute, not a CSS class (class names are an implementation detail).
- **"Servicios" stays active on `/producto/:id`:** the detail page lives under the catalog
  (`NavLink` with a custom `isActive` rule, or a nested match). Decide and test it explicitly.
- **Home `NavLink` uses `end`:** otherwise `/` would match every path and always be active.
- **Real HTTP 404 is out of scope:** it is a client-rendered page; the hosting serves `index.html`
  for any path (the SPA fallback of US-02).

## Definition of Done

- [ ] All scenarios pass as tests.
- [ ] `pnpm verify` and the pull request's pipeline are green.
- [ ] Manual check on the preview: the marked link changes as I navigate; a mistyped address shows
      the not-found page with the navigation; the link goes home.
- [ ] No errors in the console. Commits follow Conventional Commits.
