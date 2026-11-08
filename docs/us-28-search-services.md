# US-28 — Search the catalog as I type

**As a** visitor, **I want** a search box that narrows the catalog while I type, **so that** I find
a service without scrolling through all of them.

This is a UI story over **derived state**. Its critical point is that the filtered list is
**calculated** from the full list and the text, never stored: two sources of truth would drift
apart. The matching rule is a pure function, tested without React.

Requirement: Final delivery **Req 4** (search bar that filters in real time); course class 13
(`searchTerm`, `filter`).

Depends on: [US-08](us-08-browse-service-catalog.md) (the catalog).

## Scope

Included:

- A pure `filterServices(services, term, language)` in `src/features/services/`: case-insensitive,
  ignores accents and surrounding spaces, matches the **title in the active language** and the
  category name.
- A `SearchBar` presentational component: a labeled `type="search"` input.
- `ItemListContainer` holds the text and renders `filterServices(...)` instead of the full list.
- A "no results" message that names the search, and a way to clear it.
- The text lives in the query string (`/servicios?q=react`) so the search survives a reload and
  can be shared.

Not included:

- Searching the description, fuzzy matching, suggestions, searching from the navbar on other pages
  (class 13 mentions it as a reflection question), server-side search.
- The magnifier icon (**US-34**) and pagination interplay (**US-29**).

## Acceptance scenarios

```gherkin
Feature: Search the catalog
  As a visitor
  I want to narrow the catalog while I type
  So that I find a service without scrolling

  Scenario: An empty search shows every service
    Given the catalog has 7 services
    Then I see 7 service cards

  Scenario: Typing narrows the list as I type
    When I type "react"
    Then only "Aplicación React" is shown

  Scenario: Case and accents do not matter
    When I type "REVISION"
    Then the service "Revisión de código" is shown

  Scenario: The search follows the active language
    Given the language is English
    When I type "landing"
    Then the service titled "Landing page" is shown

  Scenario: The category also matches
    When I type "mentoría"
    Then the three mentoring services are shown

  Scenario: No match shows a message with the search
    When I type "zzz"
    Then I see "No encontramos servicios para «zzz»"

  Scenario: Clearing the search brings everything back
    Given I typed "zzz"
    When I click "Limpiar búsqueda"
    Then I see every service and the box is empty

  Scenario: The search is kept in the address
    When I type "react"
    Then the address is "/servicios?q=react"

  Scenario: A shared address restores the search
    When I visit "/servicios?q=react"
    Then the box shows "react" and the list is already filtered

  Scenario: The box is labeled
    Then the field is named "Buscar servicios"
```

### Content

| Key                  | es                                      | en                                   |
| -------------------- | --------------------------------------- | ------------------------------------ |
| `catalog.search`     | Buscar servicios                        | Search services                      |
| `catalog.clear`      | Limpiar búsqueda                        | Clear search                         |
| `catalog.noResults`  | No encontramos servicios para «{{term}}» | No services found for “{{term}}”    |

## Non-functional requirements

- **Accessibility:** a visible or visually-hidden `<label>`; the results count is announced
  politely (`role="status"`); the clear control is a real button.
- **Performance:** filtering a few dozen items on every keystroke needs no debounce; do not add one.
- **No errors** in the browser console.

## Decisions

- **Filter on the client, over the list already loaded** (class 13/14). With a handful of services
  a Firestore query per keystroke would cost reads for nothing.
- **State in the URL**, not in `useState` alone: it survives reloads and makes the search a link.
  `useSearchParams` is the state; there is no second copy.
- **Pure `filterServices`:** the rule is tested without rendering; the component only wires it.
- **Normalization with `String.prototype.normalize("NFD")`** to strip accents, no library.

## Definition of Done

- [ ] All scenarios pass; `filterServices` has its own unit tests; `pnpm verify` and the pipeline
      are green.
- [ ] Manual check on the preview: type fast, use the back button, reload with a `?q=`, phone width.
