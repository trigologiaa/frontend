# US-35 — Every page has its own title and description

**As a** visitor arriving from a search engine or a shared link, **I want** each page to have its
own title and description, **so that** I understand what the page is before opening it and I find
it in my browser tabs.

This is an SEO and accessibility story. Its critical point is that a single-page application has
**one `<head>`**; without work every route shares the same title. The head is driven by the route
and, in the detail, by the data.

Requirement: Final delivery **Req 3** (React Helmet to manage the `<title>` and `<meta>` of each
page dynamically); course class 13 (SEO with React Helmet).

Depends on: [US-09](us-09-service-detail.md) (the detail loads data) and
[US-04](us-04-language-detection-and-switch.md) (language).

## Scope

Included:

- `react-helmet-async` (the maintained fork of React Helmet, same `<Helmet>` API) with a
  `HelmetProvider` in `main.jsx` and in `renderWithProviders`.
- A `Seo` component (`src/shared/Seo.jsx`): `title`, `description`, composes
  `"<title> | Trigologiaa Dev"`, sets `<meta name="description">` and Open Graph `og:title` /
  `og:description`.
- Used by: home, catalog, **each service detail (title and description from the service, in the
  active language)**, cart, login, register, profile, admin, checkout and the 404 page.
- A good default in `index.html` (`<title>`, description) for crawlers that do not run JavaScript.
- The old `useDocumentTitle` hook (US-06) is deleted; Knip would flag it.

Not included:

- Server-side rendering or prerendering (social crawlers will see the `index.html` defaults),
  sitemaps, structured data, canonical URLs.

## Acceptance scenarios

```gherkin
Feature: Page titles and meta
  As a visitor
  I want each page to have its own title and description
  So that I know what the page is before opening it

  Scenario: The home page has its title
    When I visit "/"
    Then the document title is "Inicio | Trigologiaa Dev"

  Scenario: Each section has its own title
    When I visit "/servicios", "/carrito" and "/login"
    Then the titles are "Servicios | Trigologiaa Dev", "Carrito | Trigologiaa Dev" and "Iniciar sesión | Trigologiaa Dev"

  Scenario: The detail uses the service
    When I visit "/servicio/landing-page"
    Then the title is "Landing page | Trigologiaa Dev"
    And the description mentions the service and its price

  Scenario: The title follows the language
    Given the language is English
    When I visit "/servicios"
    Then the title is "Services | Trigologiaa Dev"

  Scenario: The title changes when the language changes
    Given I am on "/servicios" in Spanish
    When I switch to English
    Then the title becomes "Services | Trigologiaa Dev"

  Scenario: While the detail loads there is a neutral title
    Given the service has not arrived yet
    Then the title is "Servicio | Trigologiaa Dev"

  Scenario: A missing service has the not-found title
    When I visit "/servicio/nope"
    Then the title is "Servicio no encontrado | Trigologiaa Dev"

  Scenario: Every page has a description
    Then each page sets a non-empty "description" meta

  Scenario: Open Graph tags mirror the title and description
    Then "og:title" and "og:description" match them

  Scenario: The static default exists
    Then index.html has a title and a description for crawlers without JavaScript
```

## Non-functional requirements

- **SEO:** one `<title>` and one `<meta name="description">` at a time (the library replaces, never
  duplicates); titles under ~60 characters, descriptions under ~160.
- **Accessibility:** the tab title is what a screen reader announces on navigation; it changes on
  every route change.
- **Verification:** record a Lighthouse "SEO" score in the hand-off (US-39).

## Decisions

- **`react-helmet-async` instead of `react-helmet`.** The original package is unmaintained and
  declares React 16–18 peers; the async fork has the same API and supports React 19. Check
  `pnpm add` for peer warnings and tell the teacher: the assignment names "React Helmet", this is
  that library's maintained successor. (React 19 can also hoist `<title>` natively; the library
  keeps the deduplication and the course API.)
- **Texts are translation keys**, so the head follows the language like the rest of the UI.
- **One `Seo` component** so no page repeats the "| Trigologiaa Dev" suffix.

## Definition of Done

- [ ] All scenarios pass; `useDocumentTitle` and its test are gone; `pnpm verify` and the pipeline
      are green.
- [ ] Manual check on the preview: tab titles while navigating; view the page info in the browser.
