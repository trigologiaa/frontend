# US-10 — A global cart state

**As a** developer, **I want** one place that owns the cart (its items and quantities) and exposes
it to any component, **so that** the detail page, the navbar and the cart page always agree on what
is in the cart.

This is a technical (enabler) story. It has no visible behavior yet (the pages that use it are
US-11, US-12 and US-13). Its critical point is that the **logic is pure**: a reducer you can test
without React, and a Context that only distributes it.

Requirement: Pre-delivery **Req 4.1** (a component that manages the global cart state, with
`addToCart`) and `cuestiones-a-tener-en-cuenta` #9 (`useState`/state for the cart).

Depends on: [US-07](us-07-service-data-source.md) (the service shape).

## Scope

Included:

- `cartReducer` (pure function): actions to add an item, remove an item and clear the cart.
- `CartContext` + `CartProvider`: hold the state and expose `items`, `addToCart(service, quantity)`,
  `removeFromCart(id)`, `clearCart()`, `totalQuantity` and `totalPrice`.
- `useCart()` hook: reads the context and fails with a clear message outside a provider.
- `renderWithProviders` now also wraps in `CartProvider`.

Not included:

- Any screen using the cart: **US-11**, **US-12**, **US-13**.
- Persistence between reloads (`localStorage`): can be added later without changing consumers.
- Changing a quantity to an absolute value (the assignment needs add/remove only).

### State shape

```
items: [{ id, title, price, image, quantity }]   // title keeps both languages: { es, en }
```

An item stores a **snapshot** of the service fields it needs, so the cart does not have to load the
catalog again.

## Acceptance scenarios

Executable as Vitest tests: the reducer is tested without React; the provider with RTL.

```gherkin
Feature: Global cart state
  As a developer
  I want one place that owns the cart and exposes it
  So that every screen agrees on what is in the cart

  Scenario: The cart starts empty
    Given the initial state
    Then there are no items

  Scenario: Adding a new service creates an item
    When I add 2 units of "landing-page"
    Then the cart has one item "landing-page" with quantity 2

  Scenario: Adding an existing service increases its quantity
    Given the cart has 1 unit of "landing-page"
    When I add 2 more units of "landing-page"
    Then the cart has one item "landing-page" with quantity 3

  Scenario: Adding different services keeps them separate
    When I add "landing-page" and "rest-api"
    Then the cart has 2 items

  Scenario: Removing a service removes the whole item
    Given the cart has "landing-page" and "rest-api"
    When I remove "landing-page"
    Then the cart only has "rest-api"

  Scenario: Clearing the cart removes everything
    Given the cart has 2 items
    When I clear the cart
    Then the cart is empty

  Scenario: The reducer never mutates the previous state
    Given a state and an action
    When the reducer runs
    Then the previous state object is unchanged

  Scenario: Invalid quantities are ignored
    When I add 0 or a negative quantity
    Then the cart does not change

  Scenario: The total quantity is the sum of all units
    Given the cart has 2 units of "landing-page" and 3 of "rest-api"
    Then the total quantity is 5

  Scenario: The total price is the sum of price times quantity
    Given 2 units at 350 and 1 unit at 100
    Then the total price is 800

  Scenario: The provider shares the cart with its children
    Given a component inside the provider
    When it calls "addToCart"
    Then the component sees the new item

  Scenario: Using the cart outside the provider fails clearly
    When a component calls "useCart" without a provider
    Then it throws an error that names "CartProvider"
```

## Non-functional requirements

- **Purity:** `cartReducer` has no side effects and does not mutate its input.
- **Stable API:** consumers only know the context's functions and derived totals, never the reducer
  actions (the actions are an internal detail).
- **Performance:** totals are derived from `items` (not stored twice), so they cannot get out of
  sync. The context `value` is memoized.

## Decisions

- **`useReducer` + Context** (not `useState` with ad-hoc setters): the transitions are named and
  testable. `useReducer` is `useState`'s sibling; the class uses `useState`, the assignment accepts
  either because both are hooks — see the guide for the trade-off.
- **Derived values are computed, not stored:** `totalQuantity` and `totalPrice` come from `items`.
- **Service id is the identity:** two items are "the same" if they have the same `id`.
- **One file per concept:** `cartReducer.js`, `CartContext.jsx`, `useCart.js`.

## Definition of Done

- [ ] All scenarios pass as tests; the reducer tests do not import React.
- [ ] `pnpm verify` and the pull request's pipeline are green.
- [ ] Manual check: nothing visible changes in the preview (nothing consumes the cart yet).
- [ ] Commits follow Conventional Commits.
