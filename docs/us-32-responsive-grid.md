# US-32 — A responsive grid with React-Bootstrap

**As a** visitor on a phone, a tablet or a desktop, **I want** the catalog laid out in 1, 2 or 3
columns, **so that** the cards always use the screen well.

This is a layout story. Its critical point is **adopting a library without letting it take over**:
the site already has its own design (tokens, four Catppuccin themes, CSS Modules). React-Bootstrap
brings a complete visual system; we want only its **grid**.

Requirement: Final delivery **Req 3** (use the React-Bootstrap grid so the application is fully
adaptable to phones, tablets and desktops); course classes 13 and 14 (`Container`, `Row`, `Col`,
mobile-first).

Depends on: [US-08](us-08-browse-service-catalog.md) (the catalog) and
[US-14](us-14-visual-design-and-responsive.md) (tokens and responsive base).

## Scope

Included:

- `react-bootstrap` and `bootstrap`, loading **only** `bootstrap/dist/css/bootstrap-grid.min.css`
  (no reboot, no components CSS, no theme).
- `ItemList` uses `Row` / `Col` with `xs={12} md={6} lg={4}` (1 / 2 / 3 columns) instead of its own
  CSS grid.
- The team cards in the footer use the same grid (`xs={12} md={4}`).
- The grid gutters use the spacing of the design (`g-4`).
- The old grid rules of `ItemList.module.css` and `TeamList.module.css` are deleted.

Not included:

- Bootstrap's buttons, forms, navbar, modal or spinner (see Decisions), Bootstrap themes or
  Bootswatch.
- Restyling cards: they keep their CSS Modules.

## Acceptance scenarios

Layout is checked by what decides it (the grid classes) and by a real browser at three widths.

```gherkin
Feature: Responsive grid
  As a visitor on any device
  I want the catalog in 1, 2 or 3 columns
  So that the cards use the screen well

  Scenario: Every card sits in a responsive column
    Given the catalog has 3 services
    Then each card is inside a column with the classes "col-12 col-md-6 col-lg-4"

  Scenario: The cards are inside a row
    Then the columns are children of one row

  Scenario: The team cards use the grid too
    Then each team card is inside a column with the classes "col-12 col-md-4"

  Scenario: Only the grid stylesheet is loaded
    Then the application imports "bootstrap-grid" and no other Bootstrap stylesheet

  Scenario: The page still has no horizontal scroll
    When I open the catalog at 360 pixels
    Then there is no horizontal scrolling

  Scenario: The catalog has one, two and three columns
    When I open the catalog at 360, 768 and 1280 pixels
    Then the first row has 1, 2 and 3 cards

  Scenario: The themes are untouched
    When I switch to each Catppuccin flavor
    Then the colors do not change because of Bootstrap
```

(The last three are one Playwright scenario with three viewports.)

## Non-functional requirements

- **No visual regression:** colors, fonts and spacing keep coming from the tokens; the grid only
  decides widths. Compare screenshots by eye in two themes.
- **Weight:** the grid-only stylesheet is a few kB; record `pnpm build` sizes before and after in
  the PR.
- **Accessibility:** the list stays a `<ul>` of `<li>` (a `Row` can be rendered `as="ul"`).

## Decisions

- **Grid only.** `bootstrap.min.css` includes a reboot that resets headings, links and buttons and
  fights the tokens, and its colors ignore the Catppuccin themes. `bootstrap-grid.min.css` has
  `Container`/`Row`/`Col` and nothing else.
- **Components that need Bootstrap's CSS are not used** (`Spinner`, `Modal`): the site has its own
  (US-30) and a native `<dialog>` (US-21).
- **`Row as="ul"` / `Col as="li"`** to keep the semantic list.
- **Test the classes, not pixels** in Vitest; pixels are the job of the one Playwright scenario.

## Definition of Done

- [ ] All scenarios pass; `pnpm verify` and the pipeline are green; Knip reports no unused
      dependency.
- [ ] Manual check on the preview at 360 / 768 / 1280 px in two themes.
