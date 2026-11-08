# US-18 — Sign in, and protect private pages (Phase 2)

> **Status: partly done.** [US-25](us-25-register.md) already built `AuthContext`/`AuthProvider`,
> `authApi`, `useAuth`, the `/login` page (wrong credentials are rejected with "Correo o contraseña
> incorrectos") and the signed-in/signed-out state of the navbar. **Still to do here:** `ProtectedRoute`,
> the "session being checked" state, `returnTo`, and the empty `/admin` page.

**As a** registered user, **I want** to sign in and have private pages reachable only when I am
signed in, **so that** my area is not open to anybody.

Critical point: a protected route is **a UX convenience, not security**. The real protection is the
Firestore **security rules** (US-26); the route guard only avoids showing a screen that would fail.
Until US-26 the `/admin` page is an empty placeholder, so nothing can be damaged.

Requirement: Final delivery **Req 1** (`AuthContext`, login form with Firebase Authentication,
protected routes); course class 12.

Depends on: [US-17](us-17-firestore-catalog.md) (Firebase project exists and `src/firebase/config.js`).

## Scope

Included:

- Firebase Authentication (email + password). Registration already exists (**US-25**).
- `AuthContext`/`AuthProvider` and `useAuth()` (user, loading, `signIn`, `signOut`). *(done in US-25)*
- `/login` page *(done in US-25)*; `ProtectedRoute` wrapper for `/admin` that redirects to `/login`
  and returns to the requested page after signing in. *(to do)*
- Navbar shows "Sign in" or "Sign out" according to the session. *(done in US-25)*

Not included:

- Registration (**US-25**), roles and Firestore write rules (**US-26**), the profile page (**US-27**),
  password reset, social login.

## Acceptance scenarios

```gherkin
Feature: Sign in and protected routes
  Scenario: An anonymous visitor cannot open a private page
    Given I am not signed in
    When I visit "/admin"
    Then I am redirected to "/login"

  Scenario: Sign in returns me to where I was going
    Given I was redirected from "/admin"
    When I sign in with valid credentials
    Then I am on "/admin"

  Scenario: Wrong credentials are rejected   # done in US-25
    When I sign in with a wrong password
    Then I see "Correo o contraseña incorrectos" and stay on "/login"

  Scenario: While the session is being checked nothing flashes
    Given the session check is in progress
    When I visit "/admin"
    Then I see "Cargando..." and I am not redirected yet

  Scenario: The navbar reflects the session   # done in US-25
    Given I am signed in
    Then the navigation shows "Cerrar sesión" and not "Iniciar sesión"

  Scenario: Signing out closes the private pages
    Given I am signed in
    When I sign out
    Then I cannot open "/admin" any more
```

## Non-functional requirements

- **Security:** credentials are never logged or put in the URL.
- **Accessibility:** labeled fields; errors announced with `role="alert"`.

## Decisions

- **Loading state is part of the contract:** without it a signed-in user would flash the login page
  on every refresh.
- **Tests use a fake auth boundary** (`authApi`, mocked in tests); `renderWithProviders` accepts an
  `auth` option like the `cart` one. The real Firebase is checked manually on the preview.
- **`returnTo` via router state**, not a query parameter visible to the user.

## Definition of Done

- [ ] All scenarios pass.
- [ ] `pnpm verify` and the pipeline are green; manual sign-in/out on the preview.
- [ ] No secrets committed; no errors in the console.
