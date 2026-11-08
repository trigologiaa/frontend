# US-36 — It works in the main browsers

**As a** visitor, **I want** the site to work the same in Chrome, Firefox and Safari, on a desktop
and on a phone, **so that** I am not locked out by the browser I happen to use.

This is a technical (enabler) story. Its critical point is **turning "I tried it in another
browser" into a repeatable check**: the existing end-to-end flows run in three engines and in a
phone profile on every pull request, instead of a one-time manual look.

Requirement: Final delivery **Req 5** (verify correct operation in the main browsers); course
class 15 (production checks) and class 16 (review checklist).

Depends on: [US-15](us-15-e2e-main-flow.md) (the e2e suite) and
US-24 (themes, in `docs/`) (the theme scenario).

## Scope

Included:

- Playwright projects for **Chromium**, **Firefox** and **WebKit** (Safari's engine) and one
  **mobile** profile (a Pixel 7 on Chromium emulation, 393 px wide), all running the existing
  features.
- The CI `e2e` job installs the three browsers and uploads the report on failure.
- A `browserslist` / Vite `build.target` decision recorded, and `pnpm build` checked.
- A manual compatibility table (browser, version, desktop/phone, result) filled for the **live**
  site and kept in the README (US-39). Real Safari on iOS is checked by hand.
- Fix whatever the three engines expose (typical suspects: `100vh` on phones, `dialog` focus
  behavior, `color-scheme`, `Intl` formats).

Not included:

- Internet Explorer / legacy browsers, BrowserStack-style device farms, visual regression.
- New features: this story only makes existing ones work everywhere.

## Acceptance scenarios

These are the existing Gherkin features, run in more browsers (no new `.feature` is needed except
the last scenario).

```gherkin
Feature: Browser compatibility
  As a visitor
  I want the site to work in the main browsers
  So that the browser I use does not matter

  Scenario Outline: The purchase flow works in every engine
    Given the browser is "<project>"
    When I run the purchase flow
    Then it passes
    Examples:
      | project  |
      | chromium |
      | firefox  |
      | webkit   |
      | mobile   |

  Scenario: The not-found flow works in every engine
    When I run the not-found flow in each project
    Then it passes

  Scenario: The theme choice is remembered in every engine
    Given I chose "Mocha"
    When I reload the page
    Then the site still uses Mocha, in each project

  Scenario: No horizontal scrolling on the phone profile
    Given the mobile project
    Then the home page fits the viewport width

  Scenario: The pipeline runs all the projects
    When a pull request is opened
    Then the e2e job runs the four projects and blocks the merge if any fails

  Scenario: The production build targets modern browsers
    Then "pnpm build" succeeds with the documented target
```

## Non-functional requirements

- **Pipeline time:** the e2e job stays under ~6 minutes (browsers cached, tests in parallel).
- **Determinism:** same rules as US-15 (no fixed sleeps, queries by role/label).
- **Honesty:** a browser that is not covered is listed as "not tested", never assumed.

## Decisions

- **Playwright projects, not a separate tool:** reuses the features and steps already written.
- **WebKit on Linux is a proxy for Safari**, not Safari: the README says so and the real iOS check
  is manual.
- **Targets:** the last two versions of the evergreen browsers (Vite's default). No transpilation
  for legacy browsers.
- **A failure in one engine is a bug to fix or a documented limitation**, never a skipped test.

## Definition of Done

- [ ] All four projects pass locally and in the pipeline.
- [ ] The compatibility table is filled for the production URL (three desktop browsers + a phone).
- [ ] `pnpm verify` and the pipeline are green.
