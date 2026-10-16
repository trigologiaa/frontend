# US-15 — Protect the main purchase flow with an end-to-end test

**As a** developer, **I want** one browser test that walks the main flow (browse → detail → add →
cart) against the built app, **so that** I find out when the pieces stop working together, even if
every unit test is green.

This is a technical (enabler) story. Its critical point is **scope discipline**: one or two flows
only. E2E tests are slow and brittle; they protect the journey, while the real coverage stays in
the Vitest tests.

Requirement: quality safety net for Pre-delivery **Req 2, 3 and 4** working together.

Depends on: [US-13](us-13-cart-page.md) (the flow exists) and
[US-01](us-01-ci-cd-and-live-deployment.md) (the pipeline that will run it).

## Scope

Included:

- **Playwright** configured to run against the production build (`vite preview`).
- **playwright-bdd** + **Cucumber/Gherkin**: the flow is a real `.feature` file with step
  definitions (BDD is used **only** here).
- Flow 1: visit home → go to the catalog → open a service → add 2 units → the navbar shows 2 → open
  the cart → the service and quantity are listed.
- Flow 2: a wrong address shows the not-found page and leads back home.
- A phone-width check (no horizontal scroll) in one of the flows.
- A new `e2e` job in the pipeline; the pull request is blocked if it fails.
- Playwright report uploaded as an artifact when a run fails.

Not included:

- Testing the language switch, every state of the catalog, etc. (covered by Vitest).
- Cross-browser matrix: Chromium only.
- Visual regression testing.

## Acceptance scenarios

These are real Gherkin: the `.feature` file **is** the executable test.

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

  Scenario: A wrong address leads back home
    When I visit "/esto-no-existe"
    Then I see the not-found page
    When I follow "Volver al inicio"
    Then I see the home page

  Scenario: The home page fits a phone screen
    Given a viewport of 360 by 640 pixels
    When I visit the home page
    Then there is no horizontal scrolling
```

## Non-functional requirements

- **Deterministic:** the tests force the language (Spanish) so text assertions do not depend on the
  machine; no fixed `sleep`s — rely on Playwright's auto-waiting and web-first assertions.
- **Fast enough:** the whole E2E suite runs in under two minutes in the pipeline.
- **Resilient selectors:** locate by role/label/text (`getByRole`), not by CSS classes.
- **Isolated:** each scenario starts with a fresh browser context (empty cart).

## Decisions

- **Only for the most valuable journey:** following the pyramid in the workflow (~10 % E2E).
- **Run against the build, not the dev server:** it is what gets deployed, so it is what should be
  tested. (The tests rely on `servicios.json`, which is a real file, so no network mocking.)
- **Steps are written in English** (they match the Gherkin); the page texts they assert are the
  Spanish ones.
- **Pipeline:** `verify` (unit + build) and `e2e` are separate jobs so failures are easy to read;
  both are required checks on `main`.
- **Not part of `pre-push`:** E2E is too slow for a hook; it runs on the pull request.

## Definition of Done

- [ ] The three scenarios pass locally (`pnpm e2e`) and were seen failing first.
- [ ] The `e2e` job runs in the pull request and is a required check.
- [ ] A deliberate break (for example renaming the "Agregar al carrito" button) fails the E2E job,
      and the report shows where.
- [ ] `pnpm verify` is still green and fast (E2E excluded). Commits follow Conventional Commits.
