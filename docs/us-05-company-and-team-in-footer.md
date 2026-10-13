# US-05 — Know who is behind the services

**As a** visitor, **I want** the footer to tell me about the company and show the people behind it,
**so that** I trust who I am hiring.

This is a UI and content story: it has no business rules. Its critical point is that the footer
shows **at least three team cards** and that the team is **data**, not copy-pasted markup: adding a
person must mean adding one object, not a new component.

Requirement: Pre-delivery **Req 1.3** (company information and cards of at least 3 people).

Depends on: [US-04](us-04-language-detection-and-switch.md) (texts come from the translation files).

## Scope

Included:

- Company information in the footer: name, a one-line description and a contact email.
- A reusable `TeamCard` component receiving one person through props (name, role, short bio, photo
  or avatar placeholder, link).
- A `TeamList` that renders one `TeamCard` per person from a `team` data array (minimum 3 people).
- Translated copy (es/en) for the company text and for each role/bio.

Not included:

- Social media icons, newsletter, legal pages.
- Real photos: a neutral placeholder avatar is used until the final images exist.
- A contact form (it could be a later story).

### Who are the three people?

The assignment asks for cards of at least three people. The content is **yours to decide**: the
data file ships with placeholders (`Person 1/2/3`) that you replace with real names, roles and
links before the delivery (see Decisions).

## Acceptance scenarios

Executable as Vitest + RTL tests.

```gherkin
Feature: Company and team in the footer
  As a visitor
  I want to know who is behind the services
  So that I trust who I am hiring

  Scenario: The footer shows the company information
    When I visit any page
    Then the footer shows the company name "Trigologia Dev"
    And the footer shows a description of what the company does
    And the footer shows a contact email link

  Scenario: The footer shows at least three team members
    When I visit any page
    Then the footer lists at least 3 team cards

  Scenario: Each card shows the person's data
    When I visit any page
    Then each team card shows a name, a role and a short bio

  Scenario: A card is a reusable component driven by props
    Given a person "Ada" with the role "Backend"
    When a team card is rendered for that person
    Then I see "Ada" and "Backend" in the card

  Scenario: The team is rendered from data
    Given a team of 4 people
    When the team list is rendered
    Then I see 4 cards

  Scenario: The footer is translated
    Given the language is English
    When I visit any page
    Then the company description is shown in English
```

### Content

| Key                    | es                                                                    | en                                                                   |
| ---------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `footer.company.name`  | Trigologia Dev                                                        | Trigologia Dev                                                       |
| `footer.company.about` | Servicios de desarrollo de software: web, backend y mentoría técnica. | Software development services: web, backend and technical mentoring. |
| `footer.contact`       | Escribinos                                                            | Write to us                                                          |
| `footer.team.title`    | Nuestro equipo                                                        | Our team                                                             |

Team data (placeholders, to be replaced): roles such as `Full-stack developer`, `Backend developer`
and `Linux and DevOps mentor`, each with one short bio sentence, translated in both languages.

## Non-functional requirements

- **Semantics:** the team is an unordered list (`<ul>`), each card an `<li>`; the photo has
  meaningful `alt` text (or an empty `alt` if it is decorative).
- **Responsive:** the cards stack at phone width and sit side by side on wide screens (final
  styling in US-14).
- **No errors** in the browser console.

## Decisions

- **Team as data:** `features/team/team.js` exports the array; `TeamList` maps over it; `TeamCard`
  is presentational (props → JSX). It is the same container/presentational idea as the catalog.
- **Translations of bios:** data holds translation keys (for example `team.ada.role`), not literal
  texts, so the catalogs stay the single source of copy.
- **Placeholders are explicit:** the placeholder names must be visibly replaced; the checklist in
  US-16 includes "no placeholder text left".
- **Footer has no state and no fetching:** purely presentational.

## Definition of Done

- [ ] All scenarios pass as tests.
- [ ] `pnpm verify` and the pull request's pipeline are green.
- [ ] Manual check on the preview: the footer reads well on desktop and at phone width, in both
      languages.
- [ ] No errors in the console. Commits follow Conventional Commits.
