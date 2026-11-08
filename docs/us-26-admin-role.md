# US-26 - Only admins manage the catalog

**As an** admin, **I want** the management area and the writes to the catalog to be allowed only
for admin accounts, **so that** a regular registered user cannot change the offer.

This is **authorization**, the step after authentication (class 12: "who are you?" vs "what are you
allowed to do?"). Its critical point is that there are **two locks and only one is real**: the route
guard in the browser is a convenience; the **Firestore security rules** are the lock that actually
stops a writer.

Requirement: Final delivery **Req 1** (protect routes such as the management panel) and **Req 2**
(only authorized people edit the catalog); course class 12 (roles in the `usuarios` collection).

Depends on: [US-25](us-25-register.md) (regular users exist) and
[US-17](us-17-firestore-catalog.md) (Firestore exists).

## Scope

Included:

- A Firestore `usuarios/{uid}` document with the field `rol: "admin"`, created **by hand** in the
  Firebase console for the owner's account.
- `getRole(uid)` in `authApi`; `AuthContext` exposes `user.role` (`"admin"` or `"user"`), and the
  role is resolved **before** `loading` becomes `false`.
- `ProtectedRoute` accepts `roles`; `/admin` allows only `["admin"]`.
- A `Forbidden` page for signed-in users without the role (anonymous users still go to `/login`).
- The navbar shows the "Management" link only to admins.
- Firestore rules: anyone reads `services`; only admins write them; a user reads only their own
  `usuarios` document and nobody writes it from the browser.

Not included:

- Changing roles from the site, more roles than `admin`/`user`, custom claims.

## Acceptance scenarios

Executable as Vitest + RTL tests with a fake `authApi`; the rules are checked by hand.

```gherkin
Feature: Admin role
  As an admin
  I want only admin accounts to reach the management area
  So that a regular user cannot change the catalog

  Scenario: A user with no role document is a regular user
    Given I am signed in and my "usuarios" document does not exist
    Then my role is "user"

  Scenario: A user with the admin role is an admin
    Given my "usuarios" document has rol "admin"
    Then my role is "admin"

  Scenario: An admin opens the management area
    Given I am signed in as an admin
    When I visit "/admin"
    Then I see the management page

  Scenario: A regular user is told they have no permission
    Given I am signed in as a regular user
    When I visit "/admin"
    Then I see "No tenés permiso para ver esta página" and not the management page

  Scenario: An anonymous visitor is still sent to sign in
    Given I am not signed in
    When I visit "/admin"
    Then I am redirected to "/login"

  Scenario: The role is known before the page decides
    Given the role is still being read
    When I visit "/admin" as an admin
    Then I see the loading indicator and no "Forbidden" flash

  Scenario: Only admins see the management link
    Given I am signed in as a regular user
    Then the navigation does not show "Gestión"
    And as an admin it does

  Scenario: A failure reading the role does not grant access
    Given reading my "usuarios" document fails
    Then my role is "user"
```

## Non-functional requirements

- **Security (the real part):** the rules reject a write to `services` from a non-admin. Check it in
  the Rules Playground of the Firebase console (or the emulator) with: no session, a regular user
  and an admin. Record the three results in the PR.
- **Fail closed:** any doubt (error, missing document, unknown value) means "regular user".
- **Accessibility:** the `Forbidden` page has a heading and a link back home.

## Decisions

- **Roles live in Firestore, not in the client or the token** (class 12). Custom claims would be
  stronger but need a backend; out of scope.
- **`Forbidden` instead of redirecting to `/login`** (class 12 redirects): a signed-in user sent to
  the login page is confusing; telling them why is clearer.
- **The rules file is versioned** (`firestore.rules`) so the lock is reviewed like code, even if it
  is deployed by hand.

## Definition of Done

- [ ] All scenarios pass; `pnpm verify` and the pipeline are green.
- [ ] `firestore.rules` is in the repository and the three Playground checks are in the PR.
- [ ] Manual check on the preview: admin enters `/admin`, a regular account sees the forbidden page.
