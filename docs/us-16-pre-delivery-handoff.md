# US-16 — Pre-delivery hand-off

**As the** student delivering the pre-delivery, **I want** a verified checklist, a README and the
two required links, **so that** the client can open the live site and the code without asking me
anything.

This is a closing story. Its critical point is **traceability**: every requirement of the
assignment is mapped to a story, to a test and to something you can click in the live site.

Requirement: Pre-delivery **Req 5** (online hosting: URL of Netlify/Vercel + link to the GitHub
repository) and a final review of Req 1–4.

Depends on: all previous stories (US-00 to US-15).

## Scope

Included:

- A README: what the project is, live URL, how to run it, scripts, the stack, the folder
  structure, the workflow (branches, commits, hooks, pipeline), testing strategy and the known
  limitations of this phase.
- The traceability table (requirement → story → test → where to see it).
- A final manual walkthrough of the **production** URL.
- A final audit: no placeholder text left, no `TODO` without an issue, no unused dependency, no
  console errors, Lighthouse recorded.
- The delivery message: repository URL + production URL.

Not included:

- New features. Anything found during the audit becomes a new story or an issue, not a rushed
  change.

## Acceptance scenarios

```gherkin
Feature: Pre-delivery hand-off
  As the student delivering the pre-delivery
  I want a verified checklist and the required links
  So that the client can open the site and the code without asking me anything

  Scenario: The live site is reachable
    When I open the production URL
    Then I see the home page without errors

  Scenario: The repository is reachable
    When I open the repository link
    Then I see the README with the live URL and the instructions

  Scenario: Every requirement is covered
    Given the traceability table
    Then every requirement of the assignment points to a story, a test and a place in the live site

  Scenario: A new developer can run the project
    Given a clean clone of the repository
    When I follow the README
    Then "pnpm install" and "pnpm dev" start the app and "pnpm verify" passes

  Scenario: The required routes work in production
    When I open "/", "/servicios", "/servicio/<an id>" and "/carrito" directly in the production URL
    Then each shows its page

  Scenario: The deployed version is the last merged one
    Given the last commit on "main"
    Then the production deployment was built from that commit

  Scenario: Nothing is left unfinished
    Given the repository
    Then there is no placeholder text, no unexplained TODO and no unused dependency
```

### Traceability table (to complete with real test names)

| Requirement (PDF)                                   | Story        | Verified by                      | See it at            |
| --------------------------------------------------- | ------------ | -------------------------------- | -------------------- |
| 1.1 Organized folder structure                      | US-02        | structure + Knip                 | repository           |
| 1.2 `Layout` with Header, nav and Footer            | US-02, US-14 | `Layout.test`                    | every page           |
| 1.3 Footer: company info + ≥ 3 person cards         | US-05        | `Footer.test`, `TeamList.test`   | footer               |
| 2.1 `ItemListContainer` with `useEffect` + `fetch`  | US-07, US-08 | `ItemListContainer.test`         | `/servicios`         |
| 2.2 Reusable `Item` with props                      | US-08        | `Item.test`                      | `/servicios`         |
| 3.1 react-router-dom and the four routes            | US-02, US-09 | `App.test`                       | `/`, `/servicios`, `/servicio/:id`, `/carrito` |
| 3.2 `<Link>` navigation without reloads             | US-02, US-15 | `NavBar.test`, E2E flow 1        | navbar               |
| 4.1 Global cart state (Context)                     | US-10        | `cartReducer.test`, `CartContext.test` | (internal)     |
| 4.2 Add from detail calls `addToCart`               | US-11        | `ItemDetail.test`                | `/servicio/:id`      |
| 4.3 `CartWidget` with live count                    | US-12        | `CartWidget.test`                | navbar               |
| 4.4 `/carrito` shows the detail from `CartContext`  | US-13        | `CartPage.test`                  | `/carrito`           |
| 5 Hosted online + repository link                   | US-01, US-16 | pipeline + manual                | README               |

## Non-functional requirements

- **README is honest:** it states what is out of scope (no persistence, no checkout, no backend
  yet) and what comes next.
- **Reproducibility:** a fresh clone works with only the README.
- **No secrets** in the repository or the README.

## Decisions

- **Hand-off is a story, not a last-minute panic:** it gets its own branch, pull request and
  checklist like any other.
- **Delivery format:** repository link + production link, exactly as the assignment asks; add the
  branch/PR history as a bonus (it shows the process).
- **Phase 2 is announced, not started:** the README lists US-17 to US-23 as the roadmap.

## Definition of Done

- [ ] The traceability table is complete with real test names.
- [ ] The manual walkthrough of the **production** URL was done on desktop and phone.
- [ ] The audit is clean; Lighthouse scores noted in the README.
- [ ] `main` is green, deployed, and the delivery message (two links) is sent.
- [ ] Commits follow Conventional Commits.
