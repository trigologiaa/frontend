# US-14 — A consistent, responsive visual design

**As a** visitor, **I want** the site to look consistent, readable and comfortable on any screen,
**so that** it feels like a professional service.

This is a cross-cutting polish story. The styles are written **together with each story** (tokens
and global styles in US-05, then every page and component in its own story as a CSS Module); this
one makes the whole site read as **one visual language**: it consolidates what got duplicated, adds
the light theme, closes the "every component has styles" check and audits accessibility and
performance. Its critical point is that design decisions live in **tokens** (colors, spacing, type
scale) so changing the look later means changing a few values, not hunting through files.

Requirement: `cuestiones-a-tener-en-cuenta` #10 (updated design with custom styles and good visual
organization) and the "consistent and functional appearance" of Pre-delivery **Req 1.2**.

Depends on: [US-13](us-13-cart-page.md) (all pages exist).

## Scope

Included:

- Design tokens as CSS custom properties (`:root`) created in US-05 and extended here: the dark violet
  palette (default), the light palette and reduced motion.
- A review of the styles written in US-05 to US-13: shared pieces extracted (for example, the primary
  button), spacing and type scale made consistent across pages. **Every** layout piece, page and
  component already has its own `.module.css`; this story removes the "pending styles" exception list
  so a new component without styles fails right away.
- Responsive layout (mobile first): navbar that adapts, catalog grid, detail and cart layouts,
  footer cards.
- A visible focus style, the active-section style, hover/disabled states.
- The dark violet palette is the default; a `prefers-color-scheme: light` theme and
  `prefers-reduced-motion` are respected.
- An accessibility pass: contrast, focus order, labels.

Not included:

- A UI component library (MUI, Chakra...) and CSS frameworks: the goal is to learn the CSS.
- A manual theme toggle (the OS preference is enough).
- Brand assets (final logo): a text logo is used.

## Acceptance scenarios

Most of a visual story is verified by eye. What can be automated is automated (and kept small).

```gherkin
Feature: Consistent, responsive visual design
  As a visitor
  I want the site to look consistent and work on any screen
  So that it feels like a professional service

  Scenario: Design tokens exist in one place
    Given the global stylesheet
    Then it defines the color, spacing and font-size custom properties

  Scenario: Components use the tokens, not hardcoded colors
    Given the component styles
    Then no component stylesheet contains a hex color

  Scenario: Every component has its own styles
    Given the layout, page and component files
    Then each one has a non-empty CSS Module next to it

  Scenario: Every page keeps its landmarks and headings
    When I visit each route
    Then there is exactly one main landmark and one level-1 heading

  Scenario: The site is usable at phone width
    Given a viewport of 360 px
    When I visit each route
    Then there is no horizontal scrolling and no clipped content

  Scenario: The focus is always visible
    When I navigate with the keyboard
    Then the focused element has a visible outline

  Scenario: The site follows the system theme
    Given the operating system prefers light
    When I visit any page
    Then the light palette is applied
    And the dark palette is used otherwise

  Scenario: Text has enough contrast
    Then normal text meets WCAG AA contrast (4.5:1) in both themes
```

The first four are cheap Vitest checks (read the CSS files / render each route). The rest are
checked with the browser tools described in the guide (DevTools device mode, Lighthouse, keyboard);
the E2E test of US-15 can add the no-horizontal-scroll check at 360 px.

## Non-functional requirements

- **Accessibility:** Lighthouse Accessibility score of **100** (or the reason it is not, recorded);
  contrast AA; touch targets at least 44×44 px.
- **Performance:** Lighthouse Performance ≥ 90 on the production URL; images sized and lazy; no
  layout shift when images load.
- **Consistency:** one spacing scale, one type scale, one radius, reused everywhere.
- **No errors** in the browser console.

## Decisions

- **Mobile first:** base styles are the phone layout; `@media (min-width: …)` adds the wide layouts.
- **Tokens as CSS variables, not a JS theme object:** no runtime cost, themeable with
  `prefers-color-scheme`, and readable.
- **CSS Modules for components, one global file for tokens/reset:** scoping without a library.
- **System font stack** (or one self-hosted font) — no blocking requests to font CDNs.
- **Style as you build:** every story styles what it builds (a CSS test ratchet enforces it), so the
  look is judged on real screens from the start, not at the end. The final polish needs every screen
  to exist, which is why it comes after US-13.
- **How to choose the look:** the primary color, the neutral scale and the accent are chosen in
  US-05 (the tokens come first); every story styles what it builds, one commit per component or page.
  This story only adjusts them as a whole.

## Definition of Done

- [ ] The automated checks above pass.
- [ ] `pnpm verify` and the pull request's pipeline are green.
- [ ] Manual check on the preview: each page at 360 px, 768 px and 1280 px; dark (default) and light; keyboard
      only; Lighthouse run on the production URL and scores noted in the pull request.
- [ ] No errors in the console. Commits follow Conventional Commits (one per page restyled).
