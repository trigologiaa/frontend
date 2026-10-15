# US-06 — Landing page with value proposition

**As a** visitor, **I want** to see a clear, benefit-focused home page as soon as I arrive, **so
that** I can quickly judge whether these services are useful to me.

This is a UI and content story: it has no business rules. Its critical point is that the page tells
a stranger **what is sold, for whom and what to do next**, and that its call to action never leads
to a broken place.

Requirement: Pre-delivery **Req 3.1** (`/`: main or welcome view).

Depends on: [US-05](us-05-company-and-team-in-footer.md) (layout complete, texts in i18n).

## Scope

Included:

- The `/` page (`Home`) with a hero: title, value proposition and a primary call to action
  "See services" that navigates to `/servicios` (with `<Link>`, no reload).
- A short "what I can do for you" section with three highlights (web, backend, mentoring).
- Translated copy (es/en).
- The browser tab title shows the brand name.

Not included:

- Featured services coming from data (would couple the landing to the catalog): it could be a later
  improvement.
- Testimonials, pricing, contact form.
- Final visual design: **US-14**.

## Acceptance scenarios

Executable as Vitest + RTL tests.

```gherkin
Feature: Landing page with value proposition
  As a visitor
  I want to see a clear, benefit-focused home page
  So that I can quickly judge whether these services are useful to me

  Scenario: The hero is visible
    When I visit "/"
    Then I see the main heading "Software a tu medida, sin vueltas"
    And I see a value proposition mentioning web, backend and mentoring

  Scenario: The call to action leads to the catalog
    Given I am on "/"
    When I follow "Ver servicios"
    Then I am on the catalog page

  Scenario: The highlights are easy to identify
    When I visit "/"
    Then I see a section with 3 highlights

  Scenario: The landing is translated
    Given the language is English
    When I visit "/"
    Then I see the main heading "Custom software, no fuss"
    And I see the call to action "See services"

  Scenario: The browser tab shows the brand name
    When I visit "/"
    Then the document title is "Trigologia Dev"
```

### Content

| Key                | es                                                                        | en                                                              |
| ------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `home.title`       | Software a tu medida, sin vueltas                                         | Custom software, no fuss                                        |
| `home.pitch`       | Sitios web, APIs y mentoría técnica: te ayudo a pasar de la idea a algo que funciona. | Websites, APIs and technical mentoring: I help you go from idea to something that works. |
| `home.cta`         | Ver servicios                                                             | See services                                                    |
| `home.highlights.title` | Qué puedo hacer por vos                                              | What I can do for you                                           |
| `home.highlights.web`      | Web · Landing pages y aplicaciones React                          | Web · Landing pages and React apps                              |
| `home.highlights.backend`  | Backend · APIs REST y bases de datos                              | Backend · REST APIs and databases                               |
| `home.highlights.mentoring`| Mentoría · Git, Linux y buenas prácticas                          | Mentoring · Git, Linux and good practices                       |

## Non-functional requirements

- **Above the fold:** title, value proposition and call to action are visible without scrolling on
  a phone.
- **Semantics:** one `<h1>` (the hero title); the highlights section has an `<h2>`.
- **Responsive** and **no errors** in the console (manual check).

## Decisions

- **The CTA is a `<Link>` to `/servicios`:** the catalog route exists since US-02, so it is never
  broken.
- **Document title:** set with a small `useEffect` (or a tiny `useDocumentTitle` hook) — no extra
  library. If you later want per-page titles, extend the hook.
- **Placeholder copy:** the pitch is a first draft; the client's feedback after the pre-delivery may
  change it, which is why it lives in the catalogs.

## Definition of Done

- [ ] All scenarios pass as tests.
- [ ] `pnpm verify` and the pull request's pipeline are green.
- [ ] Manual check on the preview, desktop and phone width: read the page as a stranger — do I
      understand what is offered?
- [ ] No errors in the console. Commits follow Conventional Commits.
