# US-31 — Get a short notice when something happens

**As a** user, **I want** a small notice that appears and disappears by itself when I add to the
cart, sign in or out, or when the admin saves or deletes a service, **so that** I get feedback
without a page change or a browser dialog.

This is a cross-cutting UI story. Its critical point is **not duplicating feedback**: every action
that already shows a message in the page keeps the message that matters for accessibility, and the
toast is the visible, temporary layer on top.

Requirement: course classes 13, 14 and 16 (React Toastify; the class 16 checklist asks to confirm
that "the notifications improve the experience"). It supports Final delivery **Req 2** (clear
messages to the user).

Depends on: [US-21](us-21-delete-service.md) (the admin actions exist) and
[US-27](us-27-profile-and-sign-out.md) (sign out).

## Scope

Included:

- `react-toastify` with a single `ToastContainer` in `Layout`, themed with the design tokens (so the
  four Catppuccin flavors work) and with texts in the active language.
- A tiny wrapper `notify.success(key)` / `notify.error(key)` in `src/shared/notify.js` that takes a
  **translation key**, so call sites never build strings.
- Toasts for: service added to the cart, signed in, signed out, service created / updated /
  deleted, and the failures of those admin actions.
- The inline messages of US-19 to US-21 (success text) are replaced by the toast; error alerts stay
  in the page as `role="alert"` and also toast.

Not included:

- Persistent notifications, a notification center, sounds, push notifications.

## Acceptance scenarios

```gherkin
Feature: Toast notifications
  As a user
  I want a short notice when something happens
  So that I get feedback without a dialog

  Scenario: Adding to the cart shows a notice
    When I add a service to the cart
    Then I see "Agregado al carrito" in a notice

  Scenario: Signing in shows a notice
    When I sign in
    Then I see "Sesión iniciada"

  Scenario: Signing out shows a notice
    When I sign out
    Then I see "Sesión cerrada"

  Scenario: Creating, editing and deleting show a notice
    When an admin creates, edits or deletes a service
    Then each shows its own success notice

  Scenario: A failure shows an error notice
    Given saving a service fails
    When the admin submits
    Then I see an error notice and the alert in the page

  Scenario: The notice is announced
    Then the notice has the role "alert"

  Scenario: The notice disappears by itself
    When 4 seconds pass
    Then the notice is gone

  Scenario: The notice can be closed
    When I click the close button
    Then the notice is gone

  Scenario: The notice follows the language
    Given the language is English
    When I add a service to the cart
    Then I see "Added to cart"

  Scenario: The notice uses the theme colors
    Then the toast styles read the design tokens and no hardcoded color
```

### Content

The cart notice reuses the existing `detail.added` ("Agregado al carrito" / "Added to cart").

| Key                  | es                  | en                |
| -------------------- | ------------------- | ----------------- |
| `toast.close`        | Cerrar              | Close             |
| `toast.signedIn`     | Sesión iniciada     | Signed in         |
| `toast.signedOut`    | Sesión cerrada      | Signed out        |
| `toast.saved`        | Servicio guardado   | Service saved     |
| `toast.deleted`      | Servicio eliminado  | Service deleted   |
| `toast.error`        | Algo salió mal. Probá de nuevo. | Something went wrong. Try again. |

## Non-functional requirements

- **Accessibility:** toasts are announced (`role="alert"`), can be closed with the keyboard,
  pause on hover/focus, and never carry the only copy of an error.
- **Motion:** respects `prefers-reduced-motion`.
- **Bundle:** `react-toastify` is loaded once, in the layout; it is the heaviest dependency of this
  phase, so record its size in the PR.

## Decisions

- **Keys, not strings, at the call site:** the wrapper translates, so a missing key is caught by the
  catalog parity test and the language switch applies to new notices.
- **Toast on top of the inline message, not instead of errors:** a notice that disappears in 4
  seconds is not enough for a person who looks away.
- **A single container:** several containers duplicate every notice.

## Definition of Done

- [ ] All scenarios pass; `pnpm verify` and the pipeline are green.
- [ ] Manual check on the preview in the four themes and at 360 px; screen reader announces one
      notice per action.
