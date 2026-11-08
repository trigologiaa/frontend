# US-39 — Final README and delivery hand-off

**As the** student delivering the final project, **I want** a complete README, a verified
traceability table and the required links, **so that** the client can install, run and review the
project without asking me anything, and I can present it with confidence.

This is the closing story, like [US-16](us-16-pre-delivery-handoff.md) was for the pre-delivery. Its
critical point is again **traceability**: every requirement of the final assignment points to a
story, a test and something you can click in the **production** site, and a person who never saw
the project can run it from the README alone.

Requirement: Final delivery **Req 5** (README explaining how to install and run the project
locally; deployment preparation) and a final review of Req 1–4; course classes 15 and 16
(production checks, presentation).

Depends on: all previous stories (US-17 to US-38).

## Scope

Included:

- The README: what the project is, live URL, repository, **how to install and run it** (Node,
  pnpm, `.env` from `.env.example`, Firebase project setup in steps, seed command, `pnpm dev`),
  scripts, stack, folder structure, workflow (branches, commits, hooks, pipeline), testing strategy,
  browser compatibility table, Lighthouse scores, known limitations.
- The Firebase setup section: project, Authentication provider, Firestore, the `usuarios` document
  for the admin, publishing `firestore.rules`, and the repository / Vercel variables.
- The **traceability table** for the five requirements of the final assignment.
- A final walkthrough of the **production** URL following the presentation script of class 16
  (visitor flow, admin flow, technical highlights).
- A final audit on production: Lighthouse (performance, accessibility, best practices, SEO)
  recorded, no console errors, all routes reload without a 404, environment variables present.
- The delivery message: repository URL + production URL + how to try the admin account.

Not included:

- New features. Anything found becomes an issue or a new story, not a rushed change.
- Credentials in the repository: the demo admin is shared in the delivery message, not committed.

## Acceptance scenarios

```gherkin
Feature: Final hand-off
  As the student delivering the final project
  I want a complete README and verified links
  So that the client can run and review the project alone

  Scenario: The live site is reachable
    When I open the production URL
    Then I see the home page without errors

  Scenario: The repository is reachable
    When I open the repository link
    Then I see the README with the live URL and the instructions

  Scenario: A new developer can run the project
    Given a clean clone of the repository and no prior setup
    When I follow the README step by step
    Then "pnpm install", the Firebase setup and "pnpm dev" start the app with data
    And "pnpm verify" passes

  Scenario: The example environment file matches the README
    Then every variable in ".env.example" is explained in the README

  Scenario: Every requirement is covered
    Given the traceability table
    Then each requirement of the final assignment points to a story, a test and a place in the live site

  Scenario: Every route works when reloaded in production
    When I open "/", "/servicios", "/servicio/<an id>", "/carrito", "/login", "/registro" directly
    Then each shows its page, not a 404

  Scenario: The private routes are protected in production
    When I open "/admin" and "/perfil" without a session
    Then I am sent to "/login"

  Scenario: The admin flow works in production
    Given the demo admin account
    When I create, edit and delete a service
    Then each change shows in the public catalog and the deletion asks for confirmation

  Scenario: The audits are recorded
    Then Lighthouse scores, the browser table and the bundle sizes are in the README

  Scenario: No leftovers remain
    Then no placeholder text, no console error and no unused dependency is left
```

### Traceability table (to fill in the README)

| Final assignment requirement | Story | Test | Where to see it |
| ---------------------------- | ----- | ---- | --------------- |
| 1 · Cart with Context (add, remove, clear) | US-10, US-11, US-13 | `cartReducer`, `CartPage` | `/carrito` |
| 1 · `AuthContext`, login and register with Firebase | US-18, US-25 | `AuthContext`, `Login`, `Register` | `/login`, `/registro` |
| 1 · Protected routes (panel, profile) | US-18, US-26, US-27 | `ProtectedRoute`, `Profile` | `/admin`, `/perfil` |
| 2 · Controlled form, validations | US-19, US-22 | `validateService`, form tests | `/admin` |
| 2 · Edit and delete, confirmation modal | US-20, US-21 | admin tests | `/admin` |
| 2 · Spinners and error messages | US-30 (+ US-08, US-09) | `Spinner`, container tests | catalog, detail |
| 3 · Responsive grid (React-Bootstrap) | US-32 | `ItemList` grid test, e2e | `/servicios` at 3 widths |
| 3 · styled-components | US-33 | `Button` tests | buttons everywhere |
| 3 · React Icons | US-34 | icon tests | navbar, buttons |
| 3 · React Helmet (title, meta) | US-35 | `Seo` tests | tab titles, page info |
| 4 · Real-time search | US-28 | `filterServices`, container | `/servicios?q=` |
| 4 · Paginator | US-29 | `paginate`, `Pagination` | `/servicios?page=2` |
| 5 · Browser compatibility | US-36 | Playwright projects | README table |
| 5 · Code review / no leftovers | US-37, US-38 | `test/audit/*` | `pnpm verify` |
| 5 · README | this story | — | repository home |

## Non-functional requirements

- **Honesty:** the known limitations are written down (for example: Safari tested through WebKit
  plus one real device; no payment; checkout is simulated).
- **Reproducibility:** the README commands are copied from a real clean run, not from memory.
- **No secrets** in the repository, the README or the screenshots.

## Decisions

- **Same flow as US-16:** a branch, a pull request and a green pipeline, not a last-minute edit on
  `main`.
- **The README is in Spanish** (the audience is the course) and the code, tests and commits stay in
  English, as in the rest of the project.
- **Presentation script in `docs/presentacion.md`:** the five blocks of class 16 (introduction, visitor
  flow, admin flow, technical highlights, conclusions) with the exact clicks, timed to ~10 minutes.

## Definition of Done

- [ ] All scenarios hold on the **production** URL; the table is complete.
- [ ] `pnpm verify` and the pipeline are green; the PR is merged and deployed.
- [ ] The delivery message (repository + production URLs + demo account) is ready to send.
