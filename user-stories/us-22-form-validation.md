# US-22 — Validate the service form (Phase 2, anticipated)

> **Status: anticipated.** Not part of the pre-delivery. Refine before starting.

**As the** owner, **I want** the form to tell me what is wrong before saving, **so that** I never
store incomplete or absurd data.

Critical point: validation is **pure logic** (a function `validateProduct(values) → errors`), tested
without React; the form only displays its result. Client validation is a convenience: the database
rules remain the real guard.

Requirement: course class 11 (form validation).

Depends on: [US-19](us-19-create-service.md) and [US-20](us-20-edit-service.md).

## Scope

Included:

- `validateProduct` (pure): required title (es and en), required description, price greater than 0
  (number), valid category, valid image URL, unique id.
- Errors shown next to each field, in the active language; focus goes to the first invalid field
  on submit.
- Submit is blocked while there are errors; errors disappear as the field is fixed.

Not included:

- Server-side validation beyond the security rules; schema libraries (Zod/Yup) — a possible later
  refactor.

## Acceptance scenarios

```gherkin
Feature: Validate the service form
  Scenario: An empty title is rejected
    Given an empty title
    Then "validateProduct" reports a title error

  Scenario: A price of zero or less is rejected
    Given a price of 0
    Then "validateProduct" reports a price error

  Scenario: A valid service has no errors
    Given valid values
    Then "validateProduct" returns no errors

  Scenario: The form shows the errors next to the fields
    When I submit an empty form
    Then each invalid field shows its error message

  Scenario: Nothing is saved while invalid
    When I submit an invalid form
    Then "createProduct" is not called

  Scenario: The focus goes to the first error
    When I submit an invalid form
    Then the first invalid field is focused

  Scenario: Errors disappear when fixed
    Given a field shows an error
    When I fix the value
    Then its error disappears

  Scenario: Error messages follow the language
    Given the language is English
    When I submit an empty form
    Then the errors are in English
```

## Non-functional requirements

- **Accessibility:** errors are linked to fields (`aria-describedby`, `aria-invalid`), announced on
  submit, and never rely on color alone.

## Decisions

- **Validate on submit and re-validate on change** for touched fields (not on every keystroke from
  the start: it nags).
- **Messages are keys**, resolved by the i18n layer, so the validator stays language-agnostic.

## Definition of Done

- [ ] All scenarios pass; the validator has its own unit tests; `pnpm verify` and the pipeline are
      green.
