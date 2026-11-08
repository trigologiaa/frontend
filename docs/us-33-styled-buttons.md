# US-33 — One button, defined once, with styled-components

**As a** developer, **I want** a single `Button` component with variants (primary, secondary,
danger) written with styled-components, **so that** every button looks and behaves the same and a
change is made in one place.

This is a refactor-with-a-library story. Its critical point is **coexistence**: the site already
has CSS Modules and design tokens. styled-components must read the same tokens (so the four themes
keep working) and must not become a second, parallel styling system.

Requirement: Final delivery **Req 3** (styled-components for styled, modular components with clean
CSS); course class 13 (`BotonAccion`, variants by extension).

Depends on: [US-21](us-21-delete-service.md) (there are Edit and Delete buttons) and
[US-32](us-32-responsive-grid.md).

## Scope

Included:

- `styled-components` and a shared `Button` in `src/shared/ui/Button.jsx` (its styles in
  `Button.styles.js`): variants `primary`, `secondary`, `danger`; states hover, focus-visible,
  disabled; it renders a `<button>` by default or any element/`Link` through `as`.
- Every color, space and radius comes from the CSS variables of the tokens.
- The five places that `compose` the old `.primary` rule of `src/styles/button.module.css`
  (home call to action, item link, detail add button, cart browse link, not-found link) use
  `Button` instead, and the old file is deleted.
- The cart "clear" button and the admin edit / delete / save / cancel buttons use it.
- Tests that protect the boundary: no hex colors in `*.styles.js`, and the variants use tokens.

Not included:

- Converting the other components to styled-components. The rule from now on: **layout and
  component-specific look → CSS Module; shared interactive primitives → styled-components.**
- Icons in buttons (**US-34**).

## Acceptance scenarios

```gherkin
Feature: Shared button
  As a developer
  I want one Button with variants
  So that every button looks and behaves the same

  Scenario: It renders a real button
    When I render the Button with a label
    Then I get a button with that name

  Scenario: The default variant is primary
    Then it uses the primary colors of the theme

  Scenario Outline: Each variant has its own colors
    When the variant is "<variant>"
    Then its background is the token "<token>"
    Examples:
      | variant   | token                 |
      | primary   | --color-primary       |
      | secondary | --color-surface       |
      | danger    | --color-danger-surface |

  Scenario: It can be rendered as a link
    When I render the Button as a router link to "/servicios"
    Then I get a link with that name and the same look

  Scenario: A disabled button cannot be clicked
    When the button is disabled and I click it
    Then the click handler is not called

  Scenario: The focus is visible
    When I focus the button with the keyboard
    Then it shows a focus ring that uses a token

  Scenario: The variants are not leaked to the DOM
    Then the variant does not appear as an attribute in the HTML

  Scenario: The styles use no hardcoded color
    Then no "*.styles.js" file contains a hex color

  Scenario: Existing pages keep working
    Then the tests of the home, catalog, detail, cart and not-found pages pass unchanged
```

## Non-functional requirements

- **Accessibility:** touch target of at least 44 px high (as before), visible focus, disabled state
  not conveyed by color alone (`cursor` + reduced opacity + the native attribute).
- **Themes:** the four flavors keep AA contrast for the button text (the existing contrast test
  covers `--color-primary` / `--color-primary-contrast`; the danger variant uses `--color-text` on
  `--color-danger-surface`, a pair already checked).
- **Weight:** styled-components is ~13 kB gzip; record it in the PR.

## Decisions

- **Transient props (`$variant`)** so the styled-components v6 library does not pass them to the DOM.
- **Tokens, not literals:** `background: var(--color-primary)`. styled-components generates the
  class names; the theme switch still works because the variables change on `<html>`.
- **Files named `*.styles.js`** next to the component, so the "no hex colors" test finds them with
  one glob, like the one for CSS Modules.
- **`components.test.js` ("every component has a CSS Module") does not apply** to
  `src/shared/ui/`: its glob lists only `layout`, `features/*/components` and `features/*/pages`.
  Do not widen it.

## Definition of Done

- [ ] All scenarios pass; `src/styles/button.module.css` is gone; `pnpm verify` and the pipeline
      are green.
- [ ] Manual check on the preview in the four themes: hover, keyboard focus, disabled.
