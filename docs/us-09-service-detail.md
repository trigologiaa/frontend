# US-09 — See the details of one service

**As a** visitor, **I want** a page for each service with its full information, **so that** I can
decide whether to hire it.

This is a UI story with data. Its critical point is the **dynamic route**: the id comes from the
URL, so the page must also handle an id that does not exist and must be reachable by typing or
sharing the address.

Requirement: Pre-delivery **Req 3.1** (`/servicio/:id`: detail of a single service) and
`cuestiones-a-tener-en-cuenta` #8.

Depends on: [US-08](us-08-browse-service-catalog.md) (the links to the detail) and
[US-07](us-07-service-data-source.md) (`getServiceById`).

## Scope

Included:

- `ItemDetailContainer` (page of `/servicio/:id`): reads the id with `useParams`, loads the
  service, decides what to render.
- `ItemDetail`: presentational; shows image, title, description, category, price.
- Loading, error and "service not found" states.
- A "Back to services" link.
- The real content replaces the placeholder of US-02.

Not included:

- The add-to-cart control: **US-11** (the detail page leaves the place ready).
- Related services, reviews, image gallery.

## Acceptance scenarios

Executable as Vitest + RTL tests with MSW.

```gherkin
Feature: Service detail
  As a visitor
  I want a page for each service with its full information
  So that I can decide whether to hire it

  Scenario: Loading feedback is shown
    When I visit "/servicio/landing-page"
    Then I see "Cargando..."

  Scenario: The service is shown
    Given the service "landing-page" exists
    When I visit "/servicio/landing-page" and it finishes loading
    Then I see its title, description, category and price

  Scenario: The id in the URL selects the service
    Given the services "landing-page" and "rest-api" exist
    When I visit "/servicio/rest-api" and it finishes loading
    Then I see the title of "rest-api" and not the one of "landing-page"

  Scenario: An unknown service shows a not-found message
    When I visit "/servicio/does-not-exist" and it finishes loading
    Then I see the heading "No encontramos ese servicio"
    And I see a link "Volver a servicios"

  Scenario: An error is shown when the service cannot be loaded
    Given the server fails
    When I visit "/servicio/landing-page"
    Then I see an alert "No pudimos cargar el servicio. Probá de nuevo más tarde."

  Scenario: The visitor comes from the catalog
    Given I am on "/servicios"
    When I follow "Ver detalle" of "Landing page"
    Then I am on the detail of "Landing page"

  Scenario: The visitor can go back to the catalog
    Given I am on the detail of a service
    When I follow "Volver a servicios"
    Then I see the heading "Servicios"

  Scenario: The detail follows the language
    Given the language is English
    When I visit the detail of "landing-page" and it finishes loading
    Then I see the English title and description
```

### Content

| Key                     | es                                                   | en                                                |
| ----------------------- | ---------------------------------------------------- | ------------------------------------------------- |
| `detail.loading`        | Cargando...                                          | Loading...                                        |
| `detail.error`          | No pudimos cargar el servicio. Probá de nuevo más tarde. | We couldn't load the service. Please try again later. |
| `detail.notFound.title` | No encontramos ese servicio                          | We couldn't find that service                     |
| `detail.back`           | Volver a servicios                                   | Back to services                                  |

(The heading of the placeholder, `pages.detail.title`, is removed from the catalogs: the page now
shows the service title; Knip/the parity test help you keep the catalogs clean.)

## Non-functional requirements

- **Deep link:** opening `/servicio/landing-page` directly (or refreshing) works in production.
- **Accessibility:** one `<h1>` with the service title; the image has `alt`; the status/alert roles
  are the same as in the catalog.
- **Responsive** and **no errors** in the console (manual check).

## Decisions

- **Route param is a string:** ids are strings (`landing-page`), so no number conversion.
- **Loading the single service through the same hook family:** a `useService(id)` hook (or
  `useServices` + find) — keep the state shape `{ service, loading, error }`. Prefer the dedicated
  hook: it reuses `getServiceById`.
- **"Not found" is not an error:** `null` from the service renders a friendly page; a rejection
  renders the error alert.
- **The detail leaves an empty slot** where US-11 will put the quantity selector and the button.

## Definition of Done

- [ ] All scenarios pass as tests.
- [ ] `pnpm verify` and the pull request's pipeline are green.
- [ ] Manual check on the preview: click through from the catalog, use the browser Back button,
      type an unknown id, refresh on a detail URL.
- [ ] No errors in the console. Commits follow Conventional Commits.
