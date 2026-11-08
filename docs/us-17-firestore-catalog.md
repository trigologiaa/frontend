# US-17 — Services come from Firestore (Phase 2)

> **Status: refined against the final-delivery assignment** (Phase 2). Ready to implement.
> The `servicesApi` seam of US-07 was built for exactly this swap.

**As a** visitor, **I want** the catalog and the detail to show the services stored in the
database, **so that** the owner can change the offer without a new deployment.

Critical point: **only `servicesApi` changes.** `useServices`, `ItemListContainer`, `Item` and
`ItemDetailContainer` keep working and no component or hook file is modified. If a component has to
change, the seam was wrong. Their tests keep every scenario; only the helper that seeds the data
changes (one place, see Decisions).

Requirement: Final delivery **Req 2** (products live in Firebase); course classes 9 and 10
(Firebase, Firestore, detail by Firestore id).

Depends on: [US-16](us-16-pre-delivery-handoff.md) (pre-delivery done).

## Scope

Included:

- A Firebase project, a Firestore `services` collection seeded with the services of
  `servicios.json` (a one-off seed script, `scripts/seed-services.mjs`).
- `servicesApi` reads from Firestore (`getDocs`, `getDoc`) and returns the same shape as before.
- Firebase configuration through environment variables (`VITE_FIREBASE_*`), never committed, read in
  **one module** (`src/firebase/config.js`); `authApi` (US-25) starts using it too.
- Tests never talk to the real Firebase: a fake Firestore replaces the SDK module in the test setup.
- Firestore security rules (`firestore.rules`, published by hand): public read, no public write.

Not included:

- Creating, editing or deleting services (**US-19 to US-21**), authentication (**US-18**).

## Acceptance scenarios

```gherkin
Feature: Services from Firestore
  Scenario: The catalog shows the services stored in Firestore
    Given Firestore has 3 services
    When I visit "/servicios"
    Then I see 3 service cards

  Scenario: The detail is found by the Firestore document id
    Given a service with the document id "abc123"
    When I visit "/servicio/abc123"
    Then I see its title

  Scenario: An unknown id shows the not-found message
    When I visit "/servicio/nope"
    Then I see "No encontramos ese servicio"

  Scenario: A Firestore failure shows the error message
    Given Firestore is unreachable
    When I visit "/servicios"
    Then I see the catalog error alert

  Scenario: The components did not change
    Given the test suites of US-08 and US-09
    Then they pass and no component or hook file was modified
```

## Non-functional requirements

- **Secrets hygiene:** the Firebase web config is not secret, but `.env*` files stay out of git and
  the CI gets the values from repository variables; security comes from the **rules**, not from
  hiding the config.
- **Cost/limits:** reads are bounded (no unbounded listeners); Firestore free tier assumed.
- **No errors** in the browser console.

## Decisions

- **Keep the service contract** (`getServices`, `getServiceById`) so the swap is one file.
- **Document id as service id** (class 10); the `id` field in JSON becomes the document id in the
  seed.
- **Fake Firestore at the SDK boundary.** MSW cannot intercept the Firestore SDK (it does not use
  plain `fetch`). `test/setup.js` mocks `firebase/firestore` with a small in-memory fake, and the
  helpers `servicesHandler()` / `failingServicesHandler()` become `seedServices()` /
  `failServices()`. Existing tests change only those seeding lines, mechanically.
- **The e2e test reads the real Firestore** (public read) through repository variables; writes are
  never exercised in e2e (they need credentials) and are checked by hand.

## Definition of Done

- [ ] All scenarios pass; the US-08/US-09 tests are untouched.
- [ ] `pnpm verify`, the pipeline and the production site work against Firestore.
- [ ] Rules reviewed; no secrets in the repository.
