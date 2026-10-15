# US-08 — Browse the catalog of services

**As a** visitor, **I want** to see all the available services on one page, with a clear message
while they load or if something fails, **so that** I can compare them and pick one.

This is a UI story with data. Its critical point is the **three states of any remote list**:
loading, error and success. A page that only handles success looks broken on a slow or failing
network.

Requirement: Pre-delivery **Req 2.1** (`ItemListContainer` loading data with `useEffect` + `fetch`),
**Req 2.2** (reusable `Item` receiving data through props) and `cuestiones-a-tener-en-cuenta`
#3, #6, #7.

Depends on: [US-07](us-07-product-data-source.md) (`useProducts`) and
[US-02](us-02-layout-and-navigation.md) (the `/servicios` route).

## Scope

Included:

- `ItemListContainer` (page of `/servicios`): uses `useProducts` and decides what to render.
- `ItemList`: receives an array and renders one `Item` per element.
- `Item`: presentational, receives **one product through props** and shows image, title,
  category, price and a "View details" link to `/servicio/:id`.
- "Loading…" message while loading; an error message (with `role="alert"`) on failure.
- An empty state when the list is empty.
- Translated copy; product texts are picked with `localized` for the active language.
- Price formatting in USD (`Intl.NumberFormat`).

Not included:

- Adding to the cart from the list (it is done in the detail: **US-11**).
- Filtering, search, sorting, pagination.
- A "Retry" button (can be added later).

## Acceptance scenarios

Executable as Vitest + RTL tests; the server is mocked with MSW.

```gherkin
Feature: Browse the catalog of services
  As a visitor
  I want to see all the available services
  So that I can compare them and pick one

  Scenario: Loading feedback is shown while the services load
    When I visit "/servicios"
    Then I see "Cargando..."

  Scenario: The services are listed after loading
    Given the server has 3 services
    When I visit "/servicios" and they finish loading
    Then I no longer see "Cargando..."
    And I see 3 service cards

  Scenario: Each card shows the service data
    Given the service "Landing page" costs 350
    When I visit "/servicios" and they finish loading
    Then the card shows "Landing page", its category and the price "US$ 350"

  Scenario: Each card links to its detail
    Given the service "Landing page" has the id "landing-page"
    When I visit "/servicios" and they finish loading
    Then the card has a link "Ver detalle" to "/servicio/landing-page"

  Scenario: An error is shown when the services cannot be loaded
    Given the server fails
    When I visit "/servicios"
    Then I see an alert "No pudimos cargar los servicios. Probá de nuevo más tarde."
    And I see no service cards

  Scenario: An empty catalog shows a message
    Given the server has no services
    When I visit "/servicios" and they finish loading
    Then I see "Todavía no hay servicios disponibles."

  Scenario: An item is a reusable component driven by props
    Given a product "Code review"
    When an item is rendered for it
    Then I see "Code review" in the item

  Scenario: The catalog follows the language
    Given the language is English and the server has "Landing page"
    When I visit "/servicios" and they finish loading
    Then the card shows the English title and the link "View details"
```

### Content

| Key                  | es                                                    | en                                          |
| -------------------- | ----------------------------------------------------- | ------------------------------------------- |
| `catalog.title`      | Servicios                                             | Services                                    |
| `catalog.loading`    | Cargando...                                           | Loading...                                  |
| `catalog.error`      | No pudimos cargar los servicios. Probá de nuevo más tarde. | We couldn't load the services. Please try again later. |
| `catalog.empty`      | Todavía no hay servicios disponibles.                 | There are no services available yet.        |
| `catalog.viewDetail` | Ver detalle                                           | View details                                |

## Non-functional requirements

- **Accessibility:** loading uses `role="status"`; the error uses `role="alert"`; the list is a
  `<ul>`/`<li>`; every image has `alt`; every "Ver detalle" link is distinguishable (accessible
  name includes the service title, e.g. `aria-label`).
- **Performance:** images have `loading="lazy"` and explicit `width`/`height` (avoids layout jumps).
- **Responsive:** the grid has one column at phone width and several on wide screens (US-14).
- **No errors** in the browser console.

## Decisions

- **Container/presentational (class 4):** `ItemListContainer` knows about data and states;
  `ItemList` and `Item` only know props. The state rendering order is: loading → error → empty →
  list.
- **`Item` gets the language through `useTranslation`/`localized`**, not through its parent, to keep
  the props simple (`product`). Alternative: the container passes already-localized products;
  both are fine — pick one and keep it.
- **Currency:** USD, formatted with `Intl.NumberFormat` using the active language. Tests assert the
  visible text, so the format must be deterministic (same ICU in CI and locally).

## Definition of Done

- [ ] All scenarios pass as tests.
- [ ] `pnpm verify` and the pull request's pipeline are green.
- [ ] Manual check on the preview: throttle the network (DevTools → Network → Slow 4G) and see
      "Cargando..."; block `productos.json` (DevTools → right-click request → Block) and see the error.
- [ ] Phone width and keyboard navigation checked. No errors in the console.
- [ ] Commits follow Conventional Commits.
