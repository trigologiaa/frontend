# US-17 — Services come from Firestore (Phase 2, anticipated)

> **Status: anticipated.** Not part of the pre-delivery. It is specified now so the pre-delivery
> architecture (the `productsApi` seam of US-07) leaves room for it. Re-read and refine it before
> starting.

**As a** visitor, **I want** the catalog and the detail to show the services stored in the
database, **so that** the owner can change the offer without a new deployment.

Critical point: **only `productsApi` changes.** `useProducts`, `ItemListContainer`, `Item` and
`ItemDetailContainer` keep working and keep their tests. If a component has to change, the seam was
wrong.

Requirement: course classes 9 and 10 (Firebase, Firestore, detail by Firestore id);
`cuestiones-a-tener-en-cuenta` #6.

Depends on: [US-16](us-16-pre-delivery-handoff.md) (pre-delivery done).

## Scope

Included:

- A Firebase project, a Firestore `services` collection seeded with the services of
  `productos.json` (a seed script or a documented manual load).
- `productsApi` reads from Firestore (`getDocs`, `getDoc`) and returns the same shape as before.
- Firebase configuration through environment variables (`VITE_FIREBASE_*`), never committed.
- Tests keep using MSW/mocks: no test talks to the real Firebase.
- Firestore security rules: public read, no public write.

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
    Given the test suite of US-08 and US-09
    Then it passes without modification
```

## Non-functional requirements

- **Secrets hygiene:** the Firebase web config is not secret, but `.env*` files stay out of git and
  the CI gets the values from repository variables; security comes from the **rules**, not from
  hiding the config.
- **Cost/limits:** reads are bounded (no unbounded listeners); Firestore free tier assumed.
- **No errors** in the browser console.

## Decisions

- **Keep the service contract** (`getProducts`, `getProductById`) so the swap is one file.
- **Document id as product id** (class 10); the `id` field in JSON becomes the document id in the
  seed.
- **Test with the same MSW seam if possible** (Firestore REST) or mock the `productsApi` module at
  the boundary — decide in the guide written for this story.

## Definition of Done

- [ ] All scenarios pass; the US-08/US-09 tests are untouched.
- [ ] `pnpm verify`, the pipeline and the production site work against Firestore.
- [ ] Rules reviewed; no secrets in the repository.
