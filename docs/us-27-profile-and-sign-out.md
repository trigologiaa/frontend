# US-27 — My profile and signing out

**As a** signed-in user, **I want** a profile page that greets me and lets me sign out, **so that** I
know which account I am using and I can close my session.

This is the exercise of class 12 ("Mi perfil de usuario y cierre de sesión"). Its critical point is
**what happens after signing out**: the global state must be cleared and the user must land on a
public page, not on a protected one that would bounce them.

Requirement: Final delivery **Req 1** (protect routes such as the **profile**); course class 12
(exercise: `Perfil` and `logout`).

Depends on: [US-26](us-26-admin-role.md) (role) and [US-18](us-18-sign-in-and-protected-routes.md)
(`ProtectedRoute`).

## Scope

Included:

- A `/perfil` page protected for **any** signed-in user (no role needed).
- It shows a greeting with the email ("¡Hola de nuevo, ana@example.com!") and the role ("Cuenta
  de administrador" / "Cuenta de usuario").
- A "Cerrar sesión" button that calls `signOut` and then navigates to `/`.
- The navbar shows "Mi perfil" (link) while signed in. The navbar's own sign-out button of US-18
  also sends the user to `/`.

Not included:

- Editing the profile, changing the password, deleting the account, order history (**not planned**).

## Acceptance scenarios

Executable as Vitest + RTL tests with a fake `authApi`.

```gherkin
Feature: Profile and sign out
  As a signed-in user
  I want a profile page where I can sign out
  So that I know which account I am using and I can close my session

  Scenario: The profile greets me with my email
    Given I am signed in as "ana@example.com"
    When I visit "/perfil"
    Then I see "¡Hola de nuevo, ana@example.com!"

  Scenario: The profile shows the kind of account
    Given I am signed in as an admin
    When I visit "/perfil"
    Then I see "Cuenta de administrador"
    And as a regular user I see "Cuenta de usuario"

  Scenario: An anonymous visitor cannot open the profile
    Given I am not signed in
    When I visit "/perfil"
    Then I am redirected to "/login"

  Scenario: Signing out from the profile goes to the home page
    Given I am on "/perfil"
    When I click "Cerrar sesión"
    Then "signOut" is called
    And I am on "/"

  Scenario: Signing out clears the session in the navbar
    Given I signed out
    Then the navigation shows "Iniciar sesión" and not "Mi perfil"

  Scenario: The navbar links to the profile while signed in
    Given I am signed in
    Then the navigation has a link "Mi perfil" to "/perfil"

  Scenario: The profile follows the language
    Given the language is English
    When I visit "/perfil" signed in
    Then I see "Welcome back, ana@example.com!"
```

### Content

| Key                       | es                              | en                               |
| ------------------------- | ------------------------------- | -------------------------------- |
| `profile.title`           | Mi perfil                       | My profile                       |
| `profile.greeting`        | ¡Hola de nuevo, {{email}}!      | Welcome back, {{email}}!         |
| `profile.role.admin`      | Cuenta de administrador         | Administrator account            |
| `profile.role.user`       | Cuenta de usuario               | User account                     |

## Non-functional requirements

- **Accessibility:** one `h1`; the sign-out control is a real `<button>`.
- **Privacy:** the email is shown only to its owner and never sent anywhere or logged.
- **No errors** in the browser console.

## Decisions

- **The profile reads `useAuth()`**, no extra request: the user and the role are already in the
  context (single source of truth).
- **Navigation after `signOut` lives in the component**, not in `AuthContext`: the context knows
  nothing about routes.
- **Interpolation of the email through i18next** (`{{email}}`): React escapes it; no
  `dangerouslySetInnerHTML`.

## Definition of Done

- [ ] All scenarios pass; `pnpm verify` and the pipeline are green.
- [ ] Manual check on the preview: sign in, open the profile, sign out, press "back" and confirm
      the profile does not show again.
