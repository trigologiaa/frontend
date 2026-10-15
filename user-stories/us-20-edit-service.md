# US-20 — Edit a service (Phase 2, anticipated)

> **Status: anticipated.** Not part of the pre-delivery. Refine before starting.

**As the** owner, **I want** to edit an existing service, **so that** I can fix prices and texts
without deleting and recreating it.

Critical point: the same form serves **create and edit**; the container holds an "editing" state
(class 11), and saving edits must not create a duplicate.

Requirement: course class 11 (Update with `updateDoc`).

Depends on: [US-19](us-19-create-service.md) (the form and the management page).

## Scope

Included:

- An "Edit" button on each row of the management list.
- The form is populated with the chosen service; the submit button says "Save changes".
- `updateProduct` in `productsApi` (`updateDoc`); the list and the public catalog reflect the change.
- A way to cancel editing and go back to "create" mode.

Not included:

- Deleting (US-21), validation rules (US-22), edit history.

## Acceptance scenarios

```gherkin
Feature: Edit a service
  Scenario: Edit loads the service into the form
    When I click "Editar" on a service
    Then the form shows its current values

  Scenario: Saving updates the service
    Given I am editing a service
    When I change the price and save
    Then "updateProduct" receives the id and the new data
    And the list shows the new price

  Scenario: Saving does not create a duplicate
    When I save an edit
    Then the number of services is unchanged

  Scenario: Cancel returns to create mode
    Given I am editing a service
    When I click "Cancelar"
    Then the form is empty and offers "Crear servicio"

  Scenario: A failure keeps the form as it was
    Given the update fails
    When I save
    Then I see an alert and my changes are still in the form
```

## Non-functional requirements

- **Accessibility:** the mode change is announced (the heading or the button label changes and a
  status message confirms the save).
- **Security:** only the owner can update (rules, US-18).

## Decisions

- **One form, two modes:** the container passes `initialValues` (or none) and the form does not
  know whether it is creating or editing.
- **Edit state in the container**, not in the router (no `/admin/:id/edit` route) for this phase.

## Definition of Done

- [ ] All scenarios pass; `pnpm verify` and the pipeline are green.
- [ ] Manual check on the preview as the owner: edit, cancel, verify the public catalog.
