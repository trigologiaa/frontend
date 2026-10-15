# US-18 — Sign in, and protect the admin area (Phase 2, anticipated)

> **Status: anticipated.** Not part of the pre-delivery. Refine before starting.

**As the** owner, **I want** to sign in and have the management area reachable only when I am
signed in, **so that** nobody else can change the catalog.

Critical point: a protected route is **a UX convenience, not security**. The real protection is the
Firestore **security rules**; the route guard only avoids showing a screen that would fail.

Requirement: `cuestiones-a-tener-en-cuenta` #1 (protected routes for sensitive sections).

Depends on: [US-17](us-17-firestore-catalog.md) (Firebase project exists).

## Scope

Included:

- Firebase Authentication (email + password) for the owner account(s).
- `AuthContext`/`AuthProvider` and `useAuth()` (user, loading, `signIn`, `signOut`).
- `/login` page; `ProtectedRoute` wrapper for `/admin/*` that redirects to `/login` and returns to
  the requested page after signing in.
- Navbar shows "Sign in" or "Sign out" according to the session.
- Firestore rules: writes only for authenticated owners.

Not included:

- Public registration, password reset, social login, roles beyond "owner".

## Acceptance scenarios

```gherkin
Feature: Sign in and protected routes
  Scenario: An anonymous visitor cannot open the admin area
    Given I am not signed in
    When I visit "/admin"
    Then I am redirected to "/login"

  Scenario: Sign in returns me to where I was going
    Given I was redirected from "/admin"
    When I sign in with valid credentials
    Then I am on "/admin"

  Scenario: Wrong credentials are rejected
    When I sign in with a wrong password
    Then I see "Email o contraseña incorrectos" and stay on "/login"

  Scenario: While the session is being checked nothing flashes
    Given the session check is in progress
    When I visit "/admin"
    Then I see "Cargando..." and I am not redirected yet

  Scenario: The navbar reflects the session
    Given I am signed in
    Then the navigation shows "Cerrar sesión" and not "Iniciar sesión"

  Scenario: Signing out closes the admin area
    Given I am signed in
    When I sign out
    Then I cannot open "/admin" any more
```

## Non-functional requirements

- **Security:** the rules reject writes without a valid owner session (tested with the Firebase
  emulator or by hand); credentials are never logged.
- **Accessibility:** labeled fields; errors announced with `role="alert"`.

## Decisions

- **Loading state is part of the contract:** without it a signed-in user would flash the login page
  on every refresh.
- **Tests use a fake auth provider** at the boundary; the real one is checked manually on the
  preview.
- **`returnTo` via router state**, not a query parameter visible to the user.

## Definition of Done

- [ ] All scenarios pass; rules verified.
- [ ] `pnpm verify` and the pipeline are green; manual sign-in/out on the preview.
- [ ] No secrets committed; no errors in the console.
