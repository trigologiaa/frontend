# US-25 - Create an account

**As a** visitor, **I want** to register with my email and a password, **so that** I can have my own
account on the site.

This is the second half of the "login and register" form of the assignment. Its critical point is
**the error that is not an error for the user**: registering an email that already exists must not
end in a browser dialog (`window.confirm`, as class 12 does) but in a clear message with a link to
the sign-in page.

Requirement: Final delivery **Req 1** (login **and registration** form talking to Firebase
Authentication); course class 12 (`Registro`).

Depends on: [US-18](us-18-sign-in-and-protected-routes.md) (`AuthContext`, `authApi`, `/login`).

## Scope

Included:

- A `/registro` page with a form: email, password and password confirmation.
- `signUp` in `authApi` (`createUserWithEmailAndPassword`) and in `AuthContext`.
- After registering, Firebase leaves the user signed in: go to the home page, and the navbar shows
  the signed-in state.
- Errors shown in the page, in the active language: email already in use, weak password, invalid
  email, network failure.
- Navbar link "Create account" while anonymous; the login page links to the registration and the
  other way around.

Not included:

- Email verification, password reset, social providers, extra profile fields.
- Roles (**US-26**): a new account is always a regular user; the role is never written by the browser.

## Acceptance scenarios

Executable as Vitest + RTL tests with a fake `authApi`.

```gherkin
Feature: Create an account
  As a visitor
  I want to register with my email and a password
  So that I can have my own account

  Scenario: The form has the three fields
    When I visit "/registro"
    Then I see the fields "Correo electrónico", "Contraseña" and "Repetir contraseña"

  Scenario: A valid registration creates the account and signs me in
    When I fill valid data and submit
    Then "signUp" receives my email and password
    And I am on "/" and the navbar shows "Cerrar sesión"

  Scenario: The passwords must match
    When the confirmation differs from the password
    Then I see "Las contraseñas no coinciden" and "signUp" is not called

  Scenario: An email already in use points to the sign-in page
    Given the email is already registered
    When I submit
    Then I see "Ese correo ya está registrado" with a link to "/login"
    And no browser dialog is opened

  Scenario: A weak password is explained
    Given Firebase rejects the password as weak
    When I submit
    Then I see "La contraseña debe tener al menos 6 caracteres"

  Scenario: The button is disabled while registering
    When I submit
    Then the button is disabled until the operation ends

  Scenario: Registered users cannot see the form again
    Given I am signed in
    When I visit "/registro"
    Then I am redirected to "/"

  Scenario: The navbar offers the registration to anonymous visitors
    Given I am not signed in
    Then the navigation has a link "Crear cuenta" to "/registro"
```

### Content

| Key                        | es                                             | en                                       |
| -------------------------- | ---------------------------------------------- | ---------------------------------------- |
| `auth.register.title`      | Crear cuenta                                   | Create account                           |
| `auth.register.confirm`    | Repetir contraseña                             | Repeat password                          |
| `auth.register.submit`     | Registrarme                                    | Sign up                                  |
| `auth.errors.mismatch`     | Las contraseñas no coinciden                   | Passwords do not match                   |
| `auth.errors.emailInUse`   | Ese correo ya está registrado                  | That email is already registered         |
| `auth.errors.weakPassword` | La contraseña debe tener al menos 6 caracteres | The password needs at least 6 characters |

## Non-functional requirements

- **Accessibility:** labeled fields, `autocomplete="email"` / `"new-password"`, errors with
  `role="alert"` linked by `aria-describedby`; works with the keyboard.
- **Security:** the password is never logged, stored by the app or put in the URL; Firebase's own
  limits (rate limiting) are the real protection against abuse.
- **No errors** in the browser console.

## Decisions

- **Firebase error codes are mapped to message keys in one place** (`authErrorKey(code)`), so the
  page never shows Firebase's English text and unknown codes fall back to a generic message.
- **No `window.confirm`:** class 12's confirm-to-redirect is replaced by a message with a link;
  the whole site avoids browser dialogs (see US-38).
- **The role is not created by the client:** otherwise anyone could register as admin. The
  `usuarios` collection is written only by hand in the console (US-26).

## Definition of Done

- [ ] All scenarios pass; `pnpm verify` and the pipeline are green.
- [ ] Manual check on the preview: register a new email, see the signed-in navbar, try the same
      email again.
- [ ] No errors in the console. Commits follow Conventional Commits.
