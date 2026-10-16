# US-12 — See how many services are in my cart at a glance

**As a** visitor, **I want** a cart icon in the navigation bar with a number that updates as I add
services, **so that** I always know what I have collected, from any page.

This is a UI story that shows global state. Its critical point is that the number comes **directly
from `CartContext`** and updates in real time without reloading — the whole reason for having a
global state.

Requirement: Pre-delivery **Req 4.3** (`CartWidget` in the navbar with a numeric indicator of the
total quantity, from `CartContext`, in real time).

Depends on: [US-11](us-11-add-to-cart-from-detail.md) (items can be added) and
[US-10](us-10-cart-state.md).

## Scope

Included:

- `CartWidget`: a cart icon (inline SVG) and a badge with the total quantity, inside the navbar
  link to `/carrito` (it replaces the plain "Carrito" text link of US-02).
- The badge is hidden when the cart is empty.
- An accessible name that includes the count ("Cart, 3 items").

Not included:

- A mini-cart dropdown, animations.
- The cart page itself (**US-13**).

## Acceptance scenarios

Executable as Vitest + RTL tests with the real `CartProvider`.

```gherkin
Feature: Cart widget in the navigation bar
  As a visitor
  I want a cart icon with a number that updates as I add services
  So that I always know what I have collected

  Scenario: The widget links to the cart
    When I visit any page
    Then the navigation has a link to "/carrito" with the cart icon

  Scenario: An empty cart shows no number
    Given the cart is empty
    When I visit any page
    Then I do not see a number next to the cart icon

  Scenario: The number shows the total quantity
    Given the cart has 2 units of one service and 3 of another
    When I visit any page
    Then the cart icon shows 5

  Scenario: The number updates in real time
    Given I am on the detail of a service and the cart is empty
    When I add 2 units
    Then the cart icon shows 2 without reloading

  Scenario: The number accumulates across pages
    Given I added 2 units on one detail page
    When I navigate to another service and add 1 unit
    Then the cart icon shows 3

  Scenario: The widget has an accessible name with the count
    Given the cart has 3 units
    Then the link is named "Carrito, 3 artículos"

  Scenario: The widget follows the language
    Given the language is English and the cart has 1 unit
    Then the link is named "Cart, 1 item"

  Scenario: The cart link is still the active section on the cart page
    When I visit "/carrito"
    Then the widget link is marked as the current page
```

### Content

| Key                  | es                               | en                          |
| -------------------- | -------------------------------- | --------------------------- |
| `cart.widget.label`  | Carrito, {{count}} artículos     | Cart, {{count}} items       |

Use i18next **plural** forms (`_one` / `_other`) so "1 artículo" and "2 artículos" read correctly;
when the cart is empty the name is just "Carrito" / "Cart".

## Non-functional requirements

- **Accessibility:** the decorative SVG is `aria-hidden`; the link's accessible name carries the
  meaning; the badge is not the only way to know the count.
- **Live region (optional):** announce count changes politely (`aria-live="polite"`) if it does not
  add noise.
- **No errors** in the browser console.

## Decisions

- **`CartWidget` reads `totalQuantity` from `useCart()`**, never computes it again (single source of
  truth).
- **Inline SVG, no icon library:** one icon does not justify a dependency (and Knip would flag an
  unused one).
- **Hide the badge at zero** instead of showing "0": less noise, and it makes the empty state a
  testable difference.
- **Replaces the text link:** the test of US-02 that looks for the "Carrito" link must be updated in
  the same commit (the accessible name still starts with "Carrito").

## Definition of Done

- [ ] All scenarios pass as tests; the US-02 and US-03 tests still pass (updated if the accessible
      name changed).
- [ ] `pnpm verify` and the pull request's pipeline are green.
- [ ] Manual check on the preview: add from the detail page and watch the number change with no
      reload; check phone width (the badge must not overlap other links).
- [ ] No errors in the console. Commits follow Conventional Commits.
