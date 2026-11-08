# US-34 — Icons that explain the buttons

**As a** visitor, **I want** icons next to the main actions, **so that** I recognize them at a
glance (cart, search, edit, delete, sign in and out).

This is a UI story. Its critical point is that **an icon never replaces the name**: it is
decoration, hidden from screen readers, and every control keeps its text or accessible name
exactly as before. The existing tests (which find controls by name) prove it.

Requirement: Final delivery **Req 3** (React Icons in buttons and interactive elements to improve
visual clarity); course classes 13 and 14 (`FaTrash`, `FaEdit`, search icon).

Depends on: [US-28](us-28-search-services.md) (search box), [US-21](us-21-delete-service.md)
(edit and delete) and [US-33](us-33-styled-buttons.md) (the `Button`).

## Scope

Included:

- `react-icons`, importing from a single family (`react-icons/fa6`) and **by name** so the bundler
  keeps only the used icons.
- Icons in: the cart widget (replaces the hand-drawn SVG of US-12), "Add to cart", "Remove" and
  "Clear cart", the search box (magnifier), "Edit" and "Delete" in the admin list, and the
  sign in / sign out / profile links of the navbar.
- `Button` accepts an `icon` and places it before the label with the right spacing.
- All icons are decorative: `aria-hidden="true"`, no `title`.

Not included:

- Icon-only buttons (every button keeps visible text), animated icons, an icon picker.
- A second icon family.

## Acceptance scenarios

```gherkin
Feature: Icons
  As a visitor
  I want icons next to the main actions
  So that I recognize them at a glance

  Scenario: The cart widget uses an icon and keeps its name
    Given the cart has 3 units
    Then the link is named "Carrito, 3 artículos"
    And it contains one decorative icon

  Scenario: The add-to-cart button has an icon and the same name
    Then the button is named "Agregar al carrito" and contains an icon

  Scenario: The search box has a magnifier
    Then the field is named "Buscar servicios" and shows a magnifier icon

  Scenario: The admin actions have their own icons
    Then "Editar" and "Eliminar" each contain a different icon

  Scenario: Icons are hidden from assistive technology
    Then every icon has aria-hidden "true"

  Scenario: Icons follow the text color
    Then an icon takes the color of its text and changes with the theme

  Scenario: The navbar actions have icons
    Given I am signed in
    Then "Mi perfil" and "Cerrar sesión" each contain an icon

  Scenario: No icon family is imported as a whole
    Then no file imports from "react-icons" without a family, nor a whole family object
```

## Non-functional requirements

- **Accessibility:** names unchanged; icons add no extra tab stops or announcements.
- **Weight:** `react-icons/fa6` named imports tree-shake; record `pnpm build` size before and after.
- **Contrast:** icons that carry meaning on their own (none here) would need 3:1; these are
  redundant with text.

## Decisions

- **One family (Font Awesome 6)**, the one the course uses, for a consistent look.
- **The inline SVG of the cart (US-12) is replaced**: the "one icon does not justify a library"
  decision no longer holds with eight icons. Record the reversal in the PR.
- **A named import per icon** (`import { FaTrash } from "react-icons/fa6"`), not
  `import * as`.
- **Color through `currentColor`:** react-icons already uses it; nothing is hardcoded.

## Definition of Done

- [ ] All scenarios pass; the cart widget tests of US-12 are green without changing the names they
      look for; `pnpm verify` and the pipeline are green.
- [ ] Manual check on the preview in two themes; screen reader reads each control once.
