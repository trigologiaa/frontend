# US-37 — Load each page only when it is needed

**As a** visitor, **I want** the first page to load fast, **so that** I do not download the admin
panel, the login and the order form just to read the catalog.

This is a performance story. Its critical point is **measuring before and after**: code splitting is
done to make a number smaller (the first JavaScript download), so the number is recorded.

Requirement: Final delivery **Req 5** (review and optimize the code, remove what is unnecessary);
course class 16 (optimization: Lighthouse, `React.lazy()` and `Suspense`).

Depends on: [US-30](us-30-loading-spinner.md) (the fallback), [US-26](us-26-admin-role.md) and
[US-23](us-23-checkout-and-order.md) (the heavy pages exist).

## Scope

Included:

- `React.lazy` + `Suspense` for the pages a visitor rarely needs: **admin, login, register,
  profile, checkout**. Home, catalog, detail, cart and not-found stay in the main bundle.
- One `Suspense` boundary in `Layout` around the `<Outlet />` with the `Spinner` as fallback.
- Pages are exported in a way `lazy` accepts (a default export or a re-export in the lazy call).
- A `pnpm build` size table before / after in the PR and in the README.

Not included:

- Prefetching, route-level data loaders, splitting the vendor bundle by hand, converting the
  illustrations (they are already small SVGs).

## Acceptance scenarios

```gherkin
Feature: Lazy pages
  As a visitor
  I want each page to load only when needed
  So that the first page opens fast

  Scenario: A lazy page shows the spinner while it loads
    When I navigate to "/login"
    Then I see the spinner first and then the login form

  Scenario: The page is the same once loaded
    When I navigate to "/login"
    Then I see the same form as before the change

  Scenario: The shell stays while a page loads
    When I navigate to a lazy page
    Then the header, navigation and footer remain visible

  Scenario: Public pages are not lazy
    When I visit "/servicios"
    Then the catalog appears without an intermediate spinner from the router

  Scenario: The home page does not download the admin code
    When I open "/" in a real browser
    Then no request is made for the admin, login, register, profile or checkout chunks

  Scenario: Visiting the admin page downloads its chunk
    When I navigate to "/admin" as an admin
    Then the admin chunk is requested then

  Scenario: A failed chunk shows the error and not a blank page
    Given the chunk of a lazy page cannot be downloaded
    Then I see an error message and a link back home

  Scenario: The main bundle got smaller
    Then the main JavaScript chunk is smaller than before this story
```

## Non-functional requirements

- **Measure:** before and after, from `pnpm build` (raw and gzip sizes of the main chunk). Record
  both numbers; if the main chunk did not shrink, the story failed its purpose.
- **Resilience:** an error boundary around the lazy area (a stale deployed chunk is the classic
  failure after a new release).
- **Accessibility:** the spinner is `role="status"`; focus goes to the page heading when a lazy page
  appears.

## Decisions

- **Split by role of the page**, not by folder: visitors never need admin, auth or checkout.
- **`Suspense` in the layout**, not one per page, so the shell never disappears.
- **Chunk assertions in Playwright** (watching requests), not in Vitest: only a real browser and the
  real build prove what is downloaded.
- **Error boundary is a class component** (the one place React still requires it) in
  `src/shared/ErrorBoundary.jsx`.

## Definition of Done

- [ ] All scenarios pass; the before/after sizes are in the PR; `pnpm verify` and the pipeline are
      green.
- [ ] Manual check on the preview: Network tab on first load of `/` and after navigating to
      `/login`.
