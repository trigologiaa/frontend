# US-21 — Delete a service (Phase 2, anticipated)

> **Status: anticipated.** Not part of the pre-delivery. Refine before starting.

**As the** owner, **I want** to remove a service from the catalog, **so that** I stop offering
something I no longer provide.

Critical point: deletion is **destructive and irreversible**; the user must confirm, and a service
that someone already has in their cart must not break the cart page (the cart holds a snapshot).

Requirement: course class 10 (Delete with `doc` and `deleteDoc`).

Depends on: [US-19](us-19-create-service.md) (the management list).

## Scope

Included:

- A "Delete" button per row, with an **accessible in-page confirmation** (no `window.confirm`).
- `deleteProduct` in `productsApi` (`deleteDoc`); the list and the catalog update.
- Error feedback.

Not included:

- Soft delete / undo, bulk delete.

## Acceptance scenarios

```gherkin
Feature: Delete a service
  Scenario: Deleting asks for confirmation
    When I click "Eliminar" on a service
    Then I am asked to confirm and nothing is deleted yet

  Scenario: Cancelling keeps the service
    Given I am asked to confirm
    When I cancel
    Then the service is still listed

  Scenario: Confirming removes the service
    Given I am asked to confirm
    When I confirm
    Then "deleteProduct" receives the id
    And the service disappears from the list and from the public catalog

  Scenario: A failure keeps the service and shows an error
    Given the deletion fails
    When I confirm
    Then I see an alert and the service is still listed

  Scenario: A deleted service does not break a cart that has it
    Given a visitor has the service in the cart
    When the owner deletes it
    Then the cart page still shows the line
```

## Non-functional requirements

- **Accessibility:** the confirmation is a dialog (focus moves into it and returns to the trigger;
  Escape cancels) — use the native `<dialog>` element.
- **Security:** only the owner can delete (rules, US-18).

## Decisions

- **Native `<dialog>`** instead of a library or `window.confirm`.
- **Cart independence:** the cart never reads the catalog (US-10 snapshot), which is why the last
  scenario holds; it is here to protect that decision.

## Definition of Done

- [ ] All scenarios pass; `pnpm verify` and the pipeline are green.
- [ ] Manual check on the preview as the owner, including keyboard-only use of the dialog.
