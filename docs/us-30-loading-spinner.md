# US-30 — See a spinner while data loads

**As a** visitor, **I want** a clear loading indicator while the site fetches data, **so that** I
know something is happening and I do not think the page is broken.

This is a small UI story. Its critical point is **accessibility**: a spinning circle means nothing
to a screen reader, so the indicator carries a text name and is announced as a status.

Requirement: Final delivery **Req 2** (loading indicators while the API data is obtained and error
messages when it fails); course class 14 (Spinner).

Depends on: [US-08](us-08-browse-service-catalog.md) and [US-09](us-09-service-detail.md) (they
already have the loading and error states as text).

## Scope

Included:

- A shared `Spinner` component (`src/shared/Spinner.jsx` with its CSS Module): a ring that turns,
  `role="status"`, an accessible name ("Cargando...") and a `size` option.
- The catalog and the detail show the spinner instead of the plain "Cargando..." text.
- Reduced motion: the project already turns every animation off under `prefers-reduced-motion`
  (`tokens.css`); the ring then stays as a still arc and the text name keeps the meaning.
- The existing **error** messages (US-08, US-09) stay as `role="alert"`; this story adds a "Retry"
  button to both so the visitor can try again without reloading.

Not included:

- A skeleton screen, a progress bar, a global loading overlay.
- The spinner inside buttons (it is reused by US-19/US-23 when they need it) and as the fallback of
  lazy pages (**US-37**).

## Acceptance scenarios

```gherkin
Feature: Loading spinner
  As a visitor
  I want a clear loading indicator
  So that I know something is happening

  Scenario: The spinner is announced as a status
    When a spinner is shown
    Then it has the role "status" and the name "Cargando..."

  Scenario: The catalog shows the spinner while loading
    Given the services have not arrived yet
    When I visit "/servicios"
    Then I see the spinner and no service cards

  Scenario: The spinner goes away when the data arrives
    When the services arrive
    Then the spinner disappears and the cards appear

  Scenario: The detail shows the spinner while loading
    Given the service has not arrived yet
    When I visit "/servicio/service-1"
    Then I see the spinner

  Scenario: A failure replaces the spinner with an error
    Given the request fails
    Then I see the error message with the role "alert" and no spinner

  Scenario: Retrying asks again
    Given the catalog failed to load
    When I click "Reintentar"
    Then the spinner shows again and the services are requested again

  Scenario: The spinner name follows the language
    Given the language is English
    Then the spinner is named "Loading..."

  Scenario: Reduced motion is respected
    Then the global rule that disables animations still applies to the spinner
```

### Content

| Key             | es         | en        |
| --------------- | ---------- | --------- |
| `common.loading` | Cargando... | Loading... |
| `common.retry`   | Reintentar  | Retry      |

(`catalog.loading` and `detail.loading` become `common.loading`; both catalogs are updated in the
same commit and the parity test guards it.)

## Non-functional requirements

- **Accessibility:** `role="status"` with the text name; decorative motion only; contrast of the
  ring against the surface passes AA for non-text (3:1) in the four themes.
- **Performance:** CSS animation only (no JavaScript timers); no `!important` in the spinner, so the
  global reduced-motion rule wins.
- **No errors** in the browser console.

## Decisions

- **Own component instead of React-Bootstrap's `Spinner`** (class 14). That one needs Bootstrap's
  full stylesheet, which we deliberately do not load (US-32 imports the grid only); a 15-line
  component with the theme tokens is smaller and themed for free.
- **Retry is a re-fetch with a counter in the dependencies** of `useAsync` (`reload()`), no new
  data layer.
- **Errors keep their own message**, not one generic text: the catalog and the detail say what
  failed.

## Definition of Done

- [ ] All scenarios pass; `pnpm verify` and the pipeline are green.
- [ ] Manual check on the preview: throttle the network to "Slow 3G" and watch the spinner; turn on
      reduced motion in the OS.
