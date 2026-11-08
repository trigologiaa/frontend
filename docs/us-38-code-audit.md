# US-38 — No leftover code

**As a** developer, **I want** automated checks that fail when the project keeps code, styles or
debug output it does not need, **so that** the "remove anything unnecessary or redundant" review of
the delivery is enforced and not a one-time cleanup.

This is a technical (enabler) story. Its critical point is **checks over a clean-up**: deleting
today's leftovers is easy; stopping tomorrow's is the value. Each check is a test or a tool already
in the pipeline.

Requirement: Final delivery **Req 5** (review and optimize the code to eliminate any unnecessary or
redundant element); course classes 15 and 16 (checklist: remove `console.log`, no secrets in code).

Depends on: all the feature stories (it audits them), at least US-19 to US-23.

## Scope

Included:

- A source-scan test: no `console.log` / `console.debug` in `src/`, no `alert(`, `confirm(` or
  `prompt(` (the site uses toasts and a modal), no `debugger`, no `dangerouslySetInnerHTML`.
- A CSS test: every class declared in a `*.module.css` is used by its component (`styles.name`),
  and every `styles.name` used exists in its CSS.
- A secrets test: no API-key-looking literal in `src/`; the Firebase config is read only from
  `import.meta.env.VITE_*`, and `.env.example` lists every variable the code reads.
- A translation test: every key present in `es.json` and `en.json` is used somewhere in `src/`
  (static keys), except the documented dynamic prefixes.
- Knip in strict mode in the pipeline (unused files, exports, dependencies); `TODO` without an
  issue number fails (already guarded since US-16).
- Delete everything the checks find, in small commits.

Not included:

- Refactoring for style, performance work (US-37), new features.

## Acceptance scenarios

```gherkin
Feature: No leftover code
  As a developer
  I want automated checks against unneeded code
  So that the delivery review is enforced

  Scenario: No debug output
    Then no file in "src" calls console.log or console.debug

  Scenario: No browser dialogs
    Then no file in "src" calls alert, confirm or prompt

  Scenario: No unsafe HTML
    Then no file in "src" uses dangerouslySetInnerHTML

  Scenario: No unused CSS classes
    Then every class of every CSS Module is used by its component

  Scenario: No missing CSS classes
    Then every "styles.<name>" in a component exists in its CSS Module

  Scenario: No secrets in the code
    Then no file in "src" contains an API key literal
    And the Firebase config is read from the "VITE_" variables

  Scenario: The example environment file is complete
    Then ".env.example" lists every "VITE_" variable that the code reads

  Scenario: No unused translations
    Then every static translation key is used in "src"

  Scenario: No unused code or dependencies
    Then Knip reports nothing

  Scenario: The audit runs in the pipeline
    When a pull request is opened
    Then these tests run as part of "pnpm verify"
```

## Non-functional requirements

- **Low noise:** a check that cries wolf gets deleted. Each test explains in its failure message
  what to remove and lists exact files.
- **Speed:** the scans read files once (`import.meta.glob` with `?raw`), no extra tooling.
- **Ratchet:** the first run will find leftovers; fixing them is part of the story, but the tests
  never get an allow-list (except dynamic translation prefixes, listed and justified in the test).

## Decisions

- **Tests, not only lint rules:** Biome can ban `console`, but not "class used by its component";
  one place (`test/audit/`) groups the project's own rules and reads like documentation.
- **Dynamic translation keys** (`categories.${category}`, `theme.options.${name}`) are declared by
  prefix in the test, so they are not reported as unused.
- **Coverage of tests stays at 100 %** as before; the audit does not lower thresholds.

## Definition of Done

- [ ] All scenarios pass; everything the checks found is deleted; `pnpm verify` and the pipeline are
      green.
- [ ] The PR lists what was removed (files, classes, keys, dependencies).
