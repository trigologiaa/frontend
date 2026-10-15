# US-11 — Add a service to the cart

**As a** visitor, **I want** to choose a quantity and add a service to my cart from its detail page,
**so that** I can collect the services I want to hire.

This is an interaction story. Its critical point is that the button **calls `addToCart` of the
context** (assignment wording) and gives immediate feedback, so the visitor knows the click worked.

Requirement: Pre-delivery **Req 4.2** (from the detail view the user can add services; the action
calls `addToCart`) and `cuestiones-a-tener-en-cuenta` #4.

Depends on: [US-09](us-09-service-detail.md) (the detail page) and
[US-10](us-10-cart-state.md) (the cart context).

## Scope

Included:

- `ItemCount` (quantity selector, presentational): decrease / increase buttons and the current
  value, minimum 1, controlled through props (`value`, `onChange`) — or with local `useState`
  inside the detail (see Decisions).
- An "Add to cart" button in `ItemDetail` that calls `addToCart(service, quantity)` from
  `useCart()`.
- Confirmation feedback after adding ("Added to cart") exposed as a status message.
- The quantity goes back to 1 after adding.

Not included:

- The counter in the navbar (**US-12**) and the cart page (**US-13**), although they will show the
  effect of this story.
- A maximum quantity or stock (services are not stock-limited).
- Adding from the catalog list.

## Acceptance scenarios

Executable as Vitest + RTL + user-event tests, with the real `CartProvider`.

```gherkin
Feature: Add a service to the cart
  As a visitor
  I want to choose a quantity and add a service to my cart
  So that I can collect the services I want to hire

  Scenario: The quantity starts at 1
    When I visit the detail of a service
    Then the quantity shows 1

  Scenario: The visitor increases the quantity
    Given I am on the detail of a service
    When I click "Aumentar cantidad" twice
    Then the quantity shows 3

  Scenario: The visitor decreases the quantity
    Given the quantity is 3
    When I click "Disminuir cantidad"
    Then the quantity shows 2

  Scenario: The quantity never goes below 1
    Given the quantity is 1
    When I click "Disminuir cantidad"
    Then the quantity still shows 1

  Scenario: Adding calls addToCart with the service and the quantity
    Given the quantity is 2
    When I click "Agregar al carrito"
    Then "addToCart" receives that service and the quantity 2

  Scenario: Adding puts the service in the cart
    When I add 2 units of a service
    Then the cart contains that service with quantity 2

  Scenario: Adding twice accumulates
    When I add 1 unit and then 2 units of the same service
    Then the cart contains 3 units of that service

  Scenario: The visitor gets confirmation
    When I click "Agregar al carrito"
    Then I see the message "Agregado al carrito"

  Scenario: The quantity resets after adding
    Given the quantity is 3
    When I click "Agregar al carrito"
    Then the quantity shows 1

  Scenario: Adding is not offered while there is no service to add
    Given the service is still loading
    Then I do not see the button "Agregar al carrito"
```

### Content

| Key                 | es                     | en                   |
| ------------------- | ---------------------- | -------------------- |
| `detail.add`        | Agregar al carrito     | Add to cart          |
| `detail.added`      | Agregado al carrito    | Added to cart        |
| `detail.quantity`   | Cantidad               | Quantity             |
| `detail.increase`   | Aumentar cantidad      | Increase quantity    |
| `detail.decrease`   | Disminuir cantidad     | Decrease quantity    |

## Non-functional requirements

- **Accessibility:** the two quantity buttons have accessible names; the current value is exposed
  (`aria-live="polite"` or an `<output>`); the confirmation uses `role="status"` so a screen reader
  announces it without moving focus.
- **Keyboard:** everything works with Tab + Enter/Space.
- **No errors** in the browser console.

## Decisions

- **`ItemCount` is presentational** (value + two callbacks) and the detail owns the quantity state:
  it is the "state lifting" pattern and makes `ItemCount` trivial to test.
- **The test spies on `addToCart` through a fake context value** for the "calls addToCart"
  scenario, and uses the real provider for the "puts the service in the cart" scenario. The first
  checks the contract the assignment names; the second checks the integration.
- **Feedback is a status message, not `alert()`:** native dialogs block the page and cannot be
  tested nicely.
- **Reset quantity to 1 after adding:** avoids accidentally adding the same amount twice.

## Definition of Done

- [ ] All scenarios pass as tests.
- [ ] `pnpm verify` and the pull request's pipeline are green.
- [ ] Manual check on the preview: add from two different services; navigate away and back (the cart
      must not be lost while navigating inside the app).
- [ ] Keyboard-only check. No errors in the console. Commits follow Conventional Commits.
