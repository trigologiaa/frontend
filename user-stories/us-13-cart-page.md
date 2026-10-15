# US-13 — Review my cart

**As a** visitor, **I want** a cart page that lists the services I added with quantity, price and
total, and lets me remove them, **so that** I can review what I am about to hire.

This is a UI story that consumes global state. Its critical point is that the page reads **only
from `CartContext`** (no fetching, no local copy) and has a meaningful **empty state**.

Requirement: Pre-delivery **Req 4.4** (`/carrito` shows the details of the added products, consuming
the `CartContext` directly).

Depends on: [US-11](us-11-add-to-cart-from-detail.md) (items get into the cart) and
[US-10](us-10-cart-state.md).

## Scope

Included:

- `CartPage` (page of `/carrito`) using `useCart()`.
- `CartItem` (presentational): title, unit price, quantity, subtotal and a "Remove" button.
- The cart total and a "Clear cart" button.
- An empty state with a link to the catalog.
- Translated copy; titles picked with `localized`.

Not included:

- Editing quantities inside the cart (only remove).
- Checkout / placing an order: **US-23** (Phase 2). The page may show a disabled or hidden
  "Checkout" placeholder — decide and record it; never a button that does nothing.
- Persistence between reloads.

## Acceptance scenarios

Executable as Vitest + RTL + user-event tests with the real `CartProvider`.

```gherkin
Feature: Cart page
  As a visitor
  I want to review what I added to the cart
  So that I know what I am about to hire

  Scenario: An empty cart shows a message and a way out
    Given the cart is empty
    When I visit "/carrito"
    Then I see "Tu carrito está vacío"
    And I see a link "Ver servicios" to the catalog

  Scenario: Each added service is listed
    Given the cart has "Landing page" and "REST API"
    When I visit "/carrito"
    Then I see both services

  Scenario: Each line shows quantity, unit price and subtotal
    Given the cart has 2 units of "Landing page" at 350
    When I visit "/carrito"
    Then the line shows "Landing page", quantity 2, "US$ 350" and the subtotal "US$ 700"

  Scenario: The total is the sum of the subtotals
    Given 2 units at 350 and 1 unit at 100
    When I visit "/carrito"
    Then I see the total "US$ 800"

  Scenario: The visitor removes a service
    Given the cart has "Landing page" and "REST API"
    When I remove "Landing page"
    Then I only see "REST API"
    And the total is updated

  Scenario: Removing the last service shows the empty state
    Given the cart has one service
    When I remove it
    Then I see "Tu carrito está vacío"

  Scenario: The visitor clears the cart
    Given the cart has 2 services
    When I click "Vaciar carrito"
    Then I see "Tu carrito está vacío"

  Scenario: The widget and the page agree
    Given I added 2 units of a service
    When I open the cart through the navbar
    Then the widget shows 2 and the page shows quantity 2

  Scenario: The page follows the language
    Given the language is English and the cart has a service
    When I visit "/carrito"
    Then the titles and labels are in English
```

### Content

| Key                  | es                                | en                                   |
| -------------------- | --------------------------------- | ------------------------------------ |
| `cart.title`         | Carrito                           | Cart                                 |
| `cart.empty`         | Tu carrito está vacío             | Your cart is empty                   |
| `cart.browse`        | Ver servicios                     | See services                         |
| `cart.remove`        | Quitar                            | Remove                               |
| `cart.clear`         | Vaciar carrito                    | Clear cart                           |
| `cart.total`         | Total                             | Total                                |
| `cart.quantity`      | Cantidad                          | Quantity                             |
| `cart.subtotal`      | Subtotal                          | Subtotal                             |

## Non-functional requirements

- **Accessibility:** a real `<table>` (with headers) or a labeled list; every "Quitar" button is
  named after its service (`Quitar Landing page`); the total is announced in a `role="status"`
  region when it changes.
- **Responsive:** readable at phone width (the table may become stacked cards in US-14).
- **No errors** in the browser console.

## Decisions

- **No data fetching on this page:** everything it needs is in the cart snapshot (title, price,
  image, quantity), which is why US-10 stores a snapshot.
- **Formatting is shared:** the same `formatPrice` helper as the catalog (extract it in this story
  if it is still inlined — a refactor under green tests).
- **"Clear cart" is immediate:** no confirmation dialog (native dialogs are avoided; if needed
  later, build an accessible confirm).
- **Checkout is deliberately absent** until US-23 creates the order; the page must not suggest
  something it cannot do.

## Definition of Done

- [ ] All scenarios pass as tests.
- [ ] `pnpm verify` and the pull request's pipeline are green.
- [ ] Manual check on the preview: add, view, remove, clear; refresh (the cart is empty after a
      reload — that is expected in this phase and stated in the README).
- [ ] Phone width and keyboard checked. No errors in the console.
- [ ] Commits follow Conventional Commits.
