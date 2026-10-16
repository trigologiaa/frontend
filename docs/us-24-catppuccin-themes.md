# US-24 — Choose a Catppuccin theme

**As a** visitor, **I want** to switch the site between the four Catppuccin flavors (Latte, Frappé,
Macchiato and Mocha), **so that** I can read it in the colors I find comfortable.

This is a cross-cutting UI story. The site already themes through **design tokens** (US-05, US-14):
every component reads `var(--color-*)` and a test forbids hardcoded hex colors in the CSS Modules.
That is why changing the whole look means changing **tokens and one attribute**, not components.
Its critical point is **accessibility, not decoration**: all four flavors must keep WCAG AA contrast
for the text the site really renders, and that is enforced by a test, not by eye.

Requirement: replaces the violet palette of US-05/US-14; `cuestiones-a-tener-en-cuenta` #10 (custom
styles and good visual organization).

Depends on: [US-14](us-14-visual-design-and-responsive.md) (tokens, light theme, CSS Module ratchet).

## Scope

Included:

- The four official Catppuccin palettes (26 colors each) as CSS custom properties, one block per
  flavor, selected by `data-theme` on the `<html>` element.
- The semantic tokens (`--color-background`, `--color-surface`, `--color-text`, `--color-muted`,
  `--color-border`, `--color-primary`, `--color-primary-contrast`, `--color-danger`,
  `--color-danger-surface`, `--shadow`) defined **once**, on top of the palette variables.
- A `ThemeProvider` / `useTheme()` that holds the current theme, applies it to `<html>` and remembers
  it in `localStorage`.
- A `ThemeSwitcher` (a labeled `<select>`) in the header, next to the language switcher.
- Default theme from the operating system: Latte when it prefers light, Mocha otherwise; a saved
  choice always wins.
- No flash of the wrong theme on load (a tiny inline script in `index.html` sets the attribute
  before the first paint).
- The service illustrations and the team avatar in `public/images` use colors of the palette (the
  avatar was black and almost invisible on the dark flavors).
- The language switcher gets the styles it was missing (its wrapper had the button class and the
  buttons had none) and becomes a named `fieldset`, so the two controls of the header look alike.
- Automated checks: palettes are complete and official, contrast AA in every flavor, theme logic,
  provider and switcher behavior, one end-to-end scenario in a real browser.

Not included:

- A fifth "follow the system" option, per-component themes, custom accent colors.
- Theming the favicon and `public/icons.svg` (Vite assets that are not part of the UI).
- Theme-aware photographs or a user account to store the preference.

## Acceptance scenarios

Executable as Vitest + RTL tests (plus one Playwright scenario for the real page load).

```gherkin
Feature: Catppuccin themes
  As a visitor
  I want to switch between the four Catppuccin flavors
  So that I can read the site in the colors I find comfortable

  Scenario: The four flavors are offered
    When I open the theme selector
    Then I see "Latte", "Frappé", "Macchiato" and "Mocha"

  Scenario: The system preference chooses the first theme
    Given I never chose a theme
    When my operating system prefers light
    Then the site uses Latte
    And when it prefers dark the site uses Mocha

  Scenario: Choosing a flavor applies it to the whole page
    When I choose "Frappé"
    Then the page uses the Frappé palette

  Scenario: The choice is remembered
    Given I chose "Macchiato"
    When I come back to the site
    Then the site still uses Macchiato

  Scenario: A saved choice wins over the system preference
    Given I chose "Mocha" and my operating system prefers light
    When I open the site
    Then the site uses Mocha

  Scenario: An invalid saved value is ignored
    Given the stored theme is "neon"
    When I open the site
    Then the site falls back to the system preference

  Scenario: The site works when the browser blocks storage
    Given the browser does not allow storing data
    When I choose a theme
    Then the theme is still applied

  Scenario: There is no flash of the wrong theme
    Given I chose "Latte"
    When the page loads
    Then the theme is set before the application starts

  Scenario: Every flavor keeps readable text
    Then normal text meets WCAG AA contrast (4.5:1) in all four flavors

  Scenario: The palettes are the official ones
    Then each flavor defines the 26 Catppuccin colors with their official values

  Scenario: The selector is named and follows the language
    Given the language is English
    Then the selector is named "Theme" and its options are in English

  Scenario: The selector works with the keyboard
    When I focus the selector and pick another option
    Then the theme changes

  Scenario: The illustrations match the palette
    Given the service illustrations
    Then every color they use belongs to the Catppuccin palette
```

### Content

| Key                      | es                  | en                  |
| ------------------------ | ------------------- | ------------------- |
| `theme.label`            | Tema                | Theme               |
| `theme.options.latte`    | Latte (claro)       | Latte (light)       |
| `theme.options.frappe`   | Frappé (oscuro)     | Frappé (dark)       |
| `theme.options.macchiato`| Macchiato (oscuro)  | Macchiato (dark)    |
| `theme.options.mocha`    | Mocha (oscuro)      | Mocha (dark)        |

## Non-functional requirements

- **Accessibility:** normal text contrast ≥ 4.5:1 in the four flavors (automated, see Decisions);
  the selector has an accessible name (a visually hidden label, to keep the header compact on phones) and a 44 px touch target; focus stays visible in every flavor.
- **Performance:** no extra request, no runtime theming library; the theme is plain CSS variables and
  one attribute. No layout shift when a theme is applied.
- **Robustness:** reading or writing `localStorage` can throw (private mode, blocked data): the site
  must keep working.
- **Consistency:** components keep using tokens only; the "no hex in modules" test stays green.
- **No errors** in the browser console.

## Decisions

- **Palettes come from the official package** (`@catppuccin/palette`, MIT), copied as CSS values, not
  installed as a dependency: four small blocks of variables do not justify a dependency (and Knip
  would flag an unused one). A test pins the values.
- **Two layers of variables:** `--ctp-<color>` (the raw palette, changes per flavor) and the semantic
  `--color-*` tokens (defined once, pointing to the palette). A component never reads `--ctp-*`.
- **Semantic mapping:** background = `base`, surface = `mantle`, text = `text`, muted = `subtext1`,
  border = `surface1`, primary = `mauve`, text on primary = `base`, danger = `red`. `subtext0` was
  discarded for muted text: it is below 4.5:1 on Latte.
- **Contrast is a test.** On Latte the accent `mauve` over `mantle` is 4.45:1 (just under AA), so the
  primary color is never used as text on the surface color; the one place where that could happen
  (hovering the current navigation link) removes the surface background.
- **`data-theme` on `<html>`**, not a class and not a React-only style: CSS can react before React
  mounts, which is what makes the inline script possible.
- **A `<select>`** rather than four buttons: four labeled options with a state fit a native control,
  work with keyboard and mobile pickers, and do not crowd the header.
- **Default Mocha / Latte by `prefers-color-scheme`** (dark/light); there is no "auto" option once a
  flavor is chosen. Recorded as a limitation, not hidden.
- **Theme state is not in the cart or the router**; it lives in its own provider, like the language
  lives in i18next.
- **Out of the scope of the e2e pyramid:** only one Playwright scenario (persistence across reload),
  because the inline script cannot be exercised by jsdom.

## Definition of Done

- [ ] All scenarios pass as tests (the contrast and palette checks included).
- [ ] `pnpm verify` and the pull request's pipeline are green; `pnpm e2e` passes.
- [ ] Manual check on the preview: every page in the four flavors at 360 px and 1280 px, all states
      (loading, error, empty, hover, disabled), keyboard only, no flash on reload.
- [ ] No errors in the console. Commits follow Conventional Commits.
