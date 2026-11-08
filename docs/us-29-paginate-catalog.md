# US-29 — Browse the catalog page by page

**As a** visitor, **I want** the catalog split into pages, **so that** a long list loads and reads
comfortably and I can move between pages.

This is a UI story over **derived state**, like the search. Its critical point is **the edge cases
of the arithmetic**: an empty list, an exact multiple of the page size, a page that no longer
exists after a search. They live in a pure function (`paginate`), tested without React.

Requirement: Final delivery **Req 4** (paginator to split the results into several pages); course
class 14 (paginator).

Depends on: [US-28](us-28-search-services.md) (the paginator works over the filtered list).

## Scope

Included:

- A pure `paginate(items, page, pageSize)` → `{ items, page, totalPages }` that clamps the page.
- A `Pagination` presentational component: "Previous", numbered pages, "Next", with the current
  page marked (`aria-current="page"`); hidden when there is only one page.
- `ItemListContainer` paginates the **filtered** list, 6 services per page.
- The page lives in the query string (`?page=2`), together with `q`.
- Changing the search goes back to page 1.

Not included:

- "Load more" with Firestore cursors (`limit` / `startAfter`, class 14): see Decisions.
- Choosing the page size, infinite scroll, scroll restoration beyond moving to the top.

## Acceptance scenarios

```gherkin
Feature: Paginate the catalog
  As a visitor
  I want the catalog split into pages
  So that a long list reads comfortably

  Scenario: The first page shows the first six services
    Given the catalog has 14 services
    Then I see 6 service cards and the pages 1, 2 and 3

  Scenario: The last page shows the rest
    When I go to page 3
    Then I see 2 service cards

  Scenario: Next and Previous move one page
    When I click "Siguiente"
    Then I am on page 2
    And when I click "Anterior" I am on page 1

  Scenario: The edges disable the arrows
    Given I am on the first page
    Then "Anterior" is disabled
    And on the last page "Siguiente" is disabled

  Scenario: The current page is marked
    Given I am on page 2
    Then the link "2" is the current page

  Scenario: A single page shows no paginator
    Given the catalog has 5 services
    Then I do not see the paginator

  Scenario: The page is kept in the address
    When I go to page 2
    Then the address is "/servicios?page=2"

  Scenario: A page that does not exist falls back to the nearest
    When I visit "/servicios?page=99"
    Then I see the last page

  Scenario: Searching goes back to the first page
    Given I am on page 2
    When I type "react"
    Then the address has no "page" and I see the first page of the results

  Scenario: Pure arithmetic
    Then "paginate" handles an empty list, an exact multiple of the size and a page below 1
```

### Content

| Key                   | es                | en              |
| --------------------- | ----------------- | --------------- |
| `pagination.label`    | Paginación        | Pagination      |
| `pagination.previous` | Anterior          | Previous        |
| `pagination.next`     | Siguiente         | Next            |
| `pagination.page`     | Página {{page}}   | Page {{page}}   |

## Non-functional requirements

- **Accessibility:** a `<nav aria-label="Paginación">`; the arrows are real buttons or links with
  names; the current page uses `aria-current="page"`; the focus lands on the list heading after
  changing page.
- **Mobile:** the paginator does not overflow at 360 px (it may show fewer numbers).
- **No errors** in the browser console.

## Decisions

- **Client-side pagination over the loaded list.** The catalog is small, `getServices` already
  reads everything once (US-17) and the search needs the full list. Class 14's `startAfter` cursors
  fit a catalog of thousands; here they would break the search and add reads.
- **Page size 6** because the grid shows 3 columns on desktop (US-32): two full rows. The real
  catalog has 7 services, so it already shows 2 pages (6 + 1); the tests use 14 to also cover a
  middle page.
- **`page` is clamped, never an error:** a stale link still shows something useful.

## Definition of Done

- [ ] All scenarios pass; `paginate` has its own unit tests; `pnpm verify` and the pipeline are
      green.
- [ ] Manual check on the preview: seed 14 services, move with the keyboard, shrink to 360 px.
