# US-04 — See the site in my language

**As a** visitor, **I want** the site to appear in my browser's language (Spanish or English) and
to be able to switch it, **so that** I can understand and use it comfortably.

This is a cross-cutting UI story. It introduces **internationalization (i18n)**, the frontend
equivalent of Rails' `I18n`: the texts live in translation files and the components ask for a
**key**, never for a literal text. Its critical point is that, from this story on, **no visible
text is hardcoded**: every new story adds its keys in both languages.

Requirement: not in the assignment; it is a product decision of this project (Spanish and English).

Depends on: [US-03](us-03-active-section-and-not-found.md) (there are already texts to translate).

## Scope

Included:

- **i18next** + **react-i18next** + **i18next-browser-languagedetector**.
- Translation catalogs `es` and `en` (`src/i18n/locales/`), with every text of US-02 and US-03
  moved there (a refactor under green tests).
- Detection order: saved choice → browser language; fallback to Spanish when the language is
  neither `es` nor `en`.
- A language switcher in the header (**ES** / **EN**) that persists the choice.
- `<html lang>` always matches the active language.
- The test helper initializes the app in Spanish so tests are deterministic.

Not included:

- Translating **catalog data** (service names and descriptions): **US-07** defines the data shape and
  **US-08** renders it.
- More languages, locale-aware number/currency formatting: later.
- Routes are **not** translated (`/productos` stays `/productos`).

## Acceptance scenarios

Executable as Vitest + RTL tests.

```gherkin
Feature: Language detection and switch
  As a visitor
  I want the site in my language and to be able to change it
  So that I can understand and use it comfortably

  Scenario: Spanish browser sees Spanish
    Given my browser language is "es-AR"
    When I visit "/"
    Then the navigation shows "Inicio", "Servicios" and "Carrito"

  Scenario: English browser sees English
    Given my browser language is "en-US"
    When I visit "/"
    Then the navigation shows "Home", "Services" and "Cart"

  Scenario: Any other language falls back to Spanish
    Given my browser language is "fr-FR"
    When I visit "/"
    Then the navigation shows "Inicio", "Servicios" and "Carrito"

  Scenario: The visitor switches the language
    Given I am on "/" in Spanish
    When I choose "EN" in the language switcher
    Then the navigation shows "Home", "Services" and "Cart"

  Scenario: The choice is remembered
    Given I chose "EN"
    When I open the site again
    Then the navigation shows "Home", "Services" and "Cart"

  Scenario: The saved choice wins over the browser language
    Given my browser language is "es-AR" and I saved "EN"
    When I visit "/"
    Then the navigation shows "Home", "Services" and "Cart"

  Scenario: The document language follows the active language
    When the active language is "en"
    Then the document language attribute is "en"

  Scenario: The not-found page is translated
    Given the language is English
    When I visit "/nope"
    Then I see the heading "We couldn't find that page"
```

### Content

| Key                  | es                                                                | en                                                           |
| -------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| `nav.home`           | Inicio                                                            | Home                                                         |
| `nav.services`       | Servicios                                                         | Services                                                     |
| `nav.cart`           | Carrito                                                           | Cart                                                         |
| `nav.label`          | Navegación principal                                              | Main navigation                                              |
| `pages.detail.title` | Detalle del servicio                                              | Service details                                              |
| `notFound.title`     | 404 — No encontramos esa página                                   | 404 — We couldn't find that page                             |
| `notFound.hint`      | Puede que el link esté mal escrito, o que la página ya no exista. | The link may be misspelled, or the page may no longer exist. |
| `notFound.back`      | Volver al inicio                                                  | Back to home                                                 |
| `language.label`     | Idioma                                                            | Language                                                     |
| `footer.rights`      | © Trigologia Dev                                                  | © Trigologia Dev                                             |

The exact key names are a suggestion: keep them consistent (`area.name`) and **identical in both
files**. A missing key must never be shown to the visitor (see Decisions).

## Non-functional requirements

- **Accessibility:** the switcher is a labeled control reachable by keyboard; the active language is
  exposed (`aria-pressed` or `aria-current`); `<html lang>` is correct for screen readers.
- **No flash of wrong language:** the language is resolved synchronously at startup (catalogs are
  bundled, not fetched).
- **Completeness:** both catalogs have exactly the same keys (verified by a test).
- **No errors** in the browser console.

## Decisions

- **Bundled catalogs, not lazy-loaded:** two small JSON files; simpler and no loading state.
- **Key-based tests in Spanish:** the helper forces `es`; English is tested only where this story
  (and later the ones with translated copy) needs it.
- **A test guards catalog parity:** if a key exists in `es` and not in `en` (or vice versa), the
  suite fails. It is the cheapest way to keep i18n honest.
- **Fallback language is Spanish** (the primary audience); a missing key falls back to Spanish
  rather than showing the key.
- **Storage:** the detector caches the choice in `localStorage` (default behavior).

## Definition of Done

- [ ] All scenarios pass as tests; the catalog parity test exists.
- [ ] No hardcoded visible text remains in `layout/` or `app/` (search for accented words).
- [ ] `pnpm verify` and the pull request's pipeline are green.
- [ ] Manual check on the preview: change the browser language (Chrome: Settings → Languages), reload,
      and see the site follow it; use the switcher; reload and see the choice kept.
- [ ] No errors in the console. Commits follow Conventional Commits.
