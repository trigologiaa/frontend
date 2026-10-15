# US-19 — Create a service (Phase 2, anticipated)

> **Status: anticipated.** Not part of the pre-delivery. Refine before starting.

**As the** owner, **I want** a form to add a new service to the catalog, **so that** I can grow my
offer without touching code.

Critical point: this is the **C of CRUD** with a controlled form (classes 6 and 10) and a clear
success/failure outcome. Validation is a separate story (US-22) but the form must be built to
receive it.

Requirement: course class 10 (Create with `addDoc`, `Gestion` component).

Depends on: [US-18](us-18-sign-in-and-protected-routes.md) (only the owner can reach the form).

## Scope

Included:

- `/admin` management page with the list of services and a "New service" form
  (`FormularioServicio`, presentational) inside a container (`Gestion`).
- Fields: id/slug (or generated), title (es/en), description (es/en), price, category, image URL.
- Image upload to an external service (class 6, Imgbb) **or** an image URL field — decide.
- On submit: `createService` in `servicesApi` (`addDoc`), the list updates, the form resets.
- Success and error feedback.

Not included:

- Editing (US-20), deleting (US-21), validation rules (US-22).

## Acceptance scenarios

```gherkin
Feature: Create a service
  Scenario: The form is a controlled form
    When I type in a field
    Then the field shows what I typed

  Scenario: Submitting creates the service
    Given I filled the form
    When I submit
    Then "createService" receives the data
    And the new service appears in the list

  Scenario: The form resets after a successful creation
    When the creation succeeds
    Then the fields are empty again

  Scenario: A failure keeps what I typed and shows an error
    Given the creation fails
    When I submit
    Then I see an alert and the fields keep my values

  Scenario: The submit button is disabled while saving
    When I submit
    Then the button is disabled until the operation ends

  Scenario: The new service appears in the public catalog
    Given I created a service
    When I visit "/servicios"
    Then I see it
```

## Non-functional requirements

- **Accessibility:** every field has a visible label; errors linked with `aria-describedby`; the
  form works with the keyboard.
- **Security:** writes are allowed by the rules only for the owner (US-18).

## Decisions

- **`createService` lives in `servicesApi`:** the same seam as the reads.
- **Container/presentational:** `Gestion` holds state and calls the API; `FormularioServicio` only
  receives props and emits `onSubmit`.
- **Image handling** is decided here (external upload vs URL) and recorded.

## Definition of Done

- [ ] All scenarios pass; `pnpm verify` and the pipeline are green.
- [ ] Manual check on the preview as the owner: create, see it in the public catalog.
