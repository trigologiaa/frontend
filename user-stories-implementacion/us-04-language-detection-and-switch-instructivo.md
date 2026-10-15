# Instructivo US-04: idioma detectado y selector (JavaScript)

Guía para implementar [US-04](../user-stories/us-04-language-detection-and-switch.md) con el
[flujo](00-workflow.md). Es la story con más piezas nuevas de la fase 1: tomate tu tiempo.

## Qué vas a construir

- Catálogos de traducción `es` / `en` (JSON) y una "fábrica" `createI18n()` que los configura.
- Detección del idioma (idioma guardado → idioma del navegador → español) con
  **i18next-browser-languagedetector**.
- Los textos de US-02 y US-03 movidos a los catálogos (refactor con los tests en verde).
- Un selector **ES | EN** en el header, que se recuerda, y `<html lang>` siempre correcto.

> **Concepto — i18n:** es el `I18n.t('nav.home')` de Rails. El componente pide una **clave**
> (`t('nav.home')`); la librería devuelve el texto del idioma activo. `react-i18next` conecta eso con
> React: cuando cambia el idioma, los componentes que usan `useTranslation()` se vuelven a dibujar.

### Archivos

| Paso | Archivo | Qué es | Acción |
| ---- | ------- | ------ | ------ |
| 1 | `src/i18n/locales/es.json`, `en.json`, `locales.test.js` | catálogos + test de paridad | crear |
| 2–6 | `src/i18n/index.js`, `index.test.js` | `createI18n`, detección | crear |
| 7 | `test/renderWithProviders.jsx`, `test/setup.js`, `src/main.jsx` | provider de i18n | editar |
| 8–9 | `layout/*`, `features/**/pages/*` | textos → `t()` | editar (refactor) |
| 10–13 | `src/layout/LanguageSwitcher.jsx` + test, `src/i18n/useDocumentLanguage.js` | selector y `lang` | crear |

## Paso 0: Preparar

```sh
git switch main && git pull
git switch -c us-04-language-detection-and-switch
pnpm verify
cp <ruta-a>/javascript/user-stories/us-04-language-detection-and-switch.md docs/user-stories/
git add docs && git commit -m "docs: add US-04 language detection and switch story"
pnpm add i18next react-i18next i18next-browser-languagedetector
```

## Ciclo 1 — Los dos catálogos tienen las mismas claves

🔴 `test/i18n/locales.test.js` (el helper `flatten` vive en el test):

```js
import { describe, expect, it } from 'vitest'
import en from '../../src/i18n/locales/en.json'
import es from '../../src/i18n/locales/es.json'

function flatten(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) =>
    typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  )
}

describe('locales', () => {
  it('has the same keys in Spanish and English', () => {
    expect(flatten(en).sort()).toEqual(flatten(es).sort())
  })
})
```

Rojo: `Failed to resolve import "../../src/i18n/locales/en.json"`. 🟢 creá `es.json` con
`{ "nav": { "home": "Inicio" } }` y `en.json` con `{ "nav": { "home": "Home" } }`.

```sh
pnpm test:run && git add -A && git commit -m "feat(i18n): add translation catalogs with a parity test"
```

> Desde ahora cada clave nueva en un idioma sin su par **rompe la suite**. Es barato y evita
> textos faltantes en producción.

Knip marcará los JSON como sin usar hasta el ciclo 2: no pasa nada, el commit va por `pre-commit`
(que no corre Knip); el `pre-push` sí, y para entonces ya se usan.

## Ciclo 2 — `createI18n` traduce

🔴 `test/i18n/index.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { createI18n } from '../../src/i18n/index'

describe('createI18n', () => {
  it('translates a key with the default language', () => {
    const i18n = createI18n()

    expect(i18n.t('nav.home')).toBe('Inicio')
  })
})
```

Rojo: `Failed to resolve import "../../src/i18n/index"`. 🟢 `src/i18n/index.js` (mínimo: sin detector todavía):

```js
import i18next from 'i18next'
import en from './locales/en.json'
import es from './locales/es.json'

export function createI18n() {
  const instance = i18next.createInstance()
  instance.init({
    resources: { es: { translation: es }, en: { translation: en } },
    lng: 'es',
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
    initAsync: false,
  })
  return instance
}
```

> `initAsync: false` hace que `init` termine **ya** (los catálogos están en memoria). Si tu versión
> de i18next es vieja, la opción se llama `initImmediate: false`. `escapeValue: false` porque React
> ya escapa el HTML.

```sh
pnpm test:run && git add -A && git commit -m "feat(i18n): add createI18n with bundled catalogs"
```

## Ciclo 3 — Navegador en inglés → inglés

El detector lee `navigator.languages`. En el test lo falseás:

🔴 Agregá a `index.test` (importá `vi` y `afterEach` de `vitest`):

```js
function browserLanguage(code) {
  vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue([code])
  vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(code)
}

afterEach(() => {
  vi.restoreAllMocks()
})

  it('uses the browser language when it is English', () => {
    browserLanguage('en-US')

    expect(createI18n().resolvedLanguage).toBe('en')
  })
```

Rojo: `expected 'es' to be 'en'`. 🟢 en dos pasos (mirá el rojo de cada uno):

1. Agregá el detector: `instance.use(LanguageDetector)` (import
   `i18next-browser-languagedetector`) y **sacá `lng: 'es'`** (si no, manda el `lng` fijo). Rojo
   persiste: `'en-US'` no es un idioma soportado.
2. Agregá `supportedLngs: ['es', 'en']` y `load: 'languageOnly'` (*"usá solo la parte de idioma:
   `en-US` → `en`"*). Verde.

```sh
pnpm test:run && git add -A && git commit -m "feat(i18n): detect the browser language"
```

## Ciclo 4 — Navegador en español regional → español

🔴:

```js
  it('maps a regional Spanish browser to Spanish', () => {
    browserLanguage('es-AR')

    expect(createI18n().resolvedLanguage).toBe('es')
  })
```

Probablemente pasa de entrada (ya tenés `languageOnly`). Mutación: sacá `load: 'languageOnly'`; el
test de inglés **y** este deberían ponerse rojos o verdes por fallback: anotá qué pasa y
restaurá. Commit: `test(i18n): map regional spanish to spanish`.

## Ciclo 5 — Cualquier otro idioma → español

🔴 (`browserLanguage('fr-FR')`, espera `'es'`). Verde por el `fallbackLng`. Mutación: poné
`fallbackLng: 'en'`: rojo; restaurá. Commit: `test(i18n): fall back to spanish for other languages`.

## Ciclo 6 — La elección guardada gana

🔴:

```js
  it('prefers the saved language over the browser language', () => {
    browserLanguage('es-AR')
    localStorage.setItem('i18nextLng', 'en')

    expect(createI18n().resolvedLanguage).toBe('en')
  })
```

(`afterEach(() => localStorage.clear())` en el archivo de test.) Puede pasar ya: el detector mira
`localStorage` antes que `navigator`. Volvelo **explícito** (documentación ejecutable) con
`detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] }` en el `init`, y
hacé la mutación (invertí el orden → rojo). Commit: `feat(i18n): prefer the saved language`.

## Paso 7: Conectar i18n a React (infraestructura de tests)

1. Al final de `src/i18n/index.js`: `export const i18n = createI18n()`.
2. `test/renderWithProviders.jsx`: envolvé con `I18nextProvider`:

```jsx
import { render } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { i18n } from '../src/i18n'

export function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </I18nextProvider>,
  )
}
```

3. `test/setup.js`: los tests siempre arrancan en español y sin idioma guardado:

```js
import { i18n } from '../src/i18n'
// ...
beforeEach(async () => {
  localStorage.clear()
  await i18n.changeLanguage('es')
})
```

(importá `beforeEach` de `vitest`.)

4. `src/main.jsx`: envolvé `BrowserRouter` con `<I18nextProvider i18n={i18n}>`.

```sh
pnpm test:run && git add -A && git commit -m "test(i18n): provide i18n to rendered components"
```

## Paso 8: Refactor — los textos de la navegación pasan a los catálogos

Es un **refactor**: el comportamiento no cambia, los tests existentes (en español) deben seguir
verdes en cada micro-paso. Sin test nuevo: los actuales son la red de seguridad.

1. Completá los catálogos con las claves de la tabla de la story (`nav.home`, `nav.services`,
   `nav.cart`, `nav.label`, `pages.*`, `notFound.*`, `footer.rights`, `language.label`). **En los dos
   archivos**: el test de paridad te avisa si te olvidás de uno.
2. En `NavBar`: `const { t } = useTranslation()` y usá `t('nav.home')`, etc.; el `aria-label`
   con `t('nav.label')`.
3. Corré los tests: verdes.

```sh
pnpm test:run && git add -A && git commit -m "refactor(i18n): move navigation texts to the catalogs"
```

Repetí por componente, **un commit por componente**: `Header` (marca: no se traduce, pero verificá),
`Footer` (`footer.rights`), `NotFound`, las cuatro páginas provisorias. Búsqueda útil para no
olvidar nada: `rg "[áéíóúñ]" src --glob '!*.json'`.

## Ciclo 10 — El selector muestra ES activo

🔴 `test/layout/LanguageSwitcher.test.jsx`:

```jsx
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../renderWithProviders'
import { LanguageSwitcher } from '../../src/layout/LanguageSwitcher'

describe('LanguageSwitcher', () => {
  it('offers ES and EN and marks the active language', () => {
    renderWithProviders(<LanguageSwitcher />)

    expect(screen.getByRole('button', { name: 'ES' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'false')
  })
})
```

Rojo: `Failed to resolve import "../../src/layout/LanguageSwitcher"`. 🟢:

```jsx
import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div>
      {['es', 'en'].map((language) => (
        <button key={language} type="button" aria-pressed={i18n.resolvedLanguage === language}>
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
```

> `key` identifica cada elemento de una lista para que React sepa cuál cambió; usá un valor
> estable (acá el código del idioma), nunca el índice.

```sh
pnpm test:run && git add -A && git commit -m "feat(layout): add language switcher"
```

## Ciclo 11 — Elegir EN traduce la navegación

🔴 (`Layout.test` o `LanguageSwitcher.test` con `Layout` completo; agregá `LanguageSwitcher` al
`Header` en el verde):

```jsx
  it('switches the navigation to English', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Layout />)

    await user.click(screen.getByRole('button', { name: 'EN' }))

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Services' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cart' })).toBeInTheDocument()
  })
```

Rojo: `Unable to find ... name "Home"` (primero, si no tenés el switcher en el Header, `Unable to find
... name "EN"`). 🟢: el `onClick={() => i18n.changeLanguage(language)}` del botón y
`<LanguageSwitcher />` dentro de `Header`.

```sh
pnpm test:run && git add -A && git commit -m "feat(layout): switch the language from the header"
```

## Ciclo 12 — La elección se recuerda

🔴:

```jsx
  it('remembers the chosen language', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LanguageSwitcher />)

    await user.click(screen.getByRole('button', { name: 'EN' }))

    expect(localStorage.getItem('i18nextLng')).toBe('en')
  })
```

Pasa de entrada (el detector cachea). Hacé la mutación (`caches: []`) → rojo; restaurá.
Commit `test(i18n): remember the chosen language`.

## Ciclo 13 — `<html lang>` sigue al idioma

🔴 en `App.test`:

```jsx
  it('keeps the document language in sync with the active language', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    expect(document.documentElement.lang).toBe('es')

    await user.click(screen.getByRole('button', { name: 'EN' }))

    expect(document.documentElement.lang).toBe('en')
  })
```

Rojo: `expected '' to be 'es'`. 🟢 `src/i18n/useDocumentLanguage.js`:

```js
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function useDocumentLanguage() {
  const { i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage
  }, [i18n.resolvedLanguage])
}
```

y llamalo en `App`: `useDocumentLanguage()` como primera línea.

> **Concepto — `useEffect` con dependencias:** el efecto corre después de dibujar y **otra vez
> solo si cambia algo del array de dependencias**. Sin el array correcto, o corre siempre o queda
> desactualizado.

```sh
pnpm verify && git add -A && git commit -m "feat(i18n): keep the html lang attribute in sync"
```

## Ciclo 14 — La 404 habla inglés

🔴:

```jsx
  it('translates the not-found page', async () => {
    await i18n.changeLanguage('en')
    renderWithProviders(<App />, { route: '/nope' })

    expect(screen.getByRole('heading', { level: 1, name: /We couldn't find that page/ })).toBeInTheDocument()
  })
```

(importá `i18n` de `../i18n`.) Pasa si cargaste bien `en.json`; si no, te marca el typo. Mutación:
cambiá una letra del texto inglés → rojo. Commit `test(i18n): translate the not-found page`.

## Verificación manual

- [ ] Chrome → *Configuración → Idiomas*: poné inglés arriba, recargá (sin idioma guardado:
      DevTools → *Application → Local Storage* → borrá `i18nextLng`) y verificá que el sitio
      aparece en inglés. Repetí con español y con francés (→ español).
- [ ] Usá el selector y recargá: queda la elección.
- [ ] DevTools → *Elements*: `<html lang="…">` cambia.
- [ ] Teclado: Tab llega a ES y EN; Enter/Espacio cambian el idioma. Sin errores en consola.

## Publicar

```sh
git push -u origin us-04-language-detection-and-switch
gh pr create --fill --base main && gh pr checks --watch
```

Squash merge: `feat: detect the language and add a language switcher (US-04)`.

## Commits sugeridos

```
docs: add US-04 language detection and switch story
feat(i18n): add translation catalogs with a parity test
feat(i18n): add createI18n with bundled catalogs
feat(i18n): detect the browser language
test(i18n): map regional spanish to spanish
test(i18n): fall back to spanish for other languages
feat(i18n): prefer the saved language
test(i18n): provide i18n to rendered components
refactor(i18n): move navigation texts to the catalogs   (+1 por componente)
feat(layout): add language switcher
feat(layout): switch the language from the header
test(i18n): remember the chosen language
feat(i18n): keep the html lang attribute in sync
test(i18n): translate the not-found page
```

## Definition of Done

- [ ] Todos los escenarios pasan como tests; existe el test de paridad.
- [ ] No quedan textos visibles hardcodeados en `layout/` ni `app/` ni las páginas.
- [ ] `pnpm verify` y el pipeline en verde; verificación manual hecha.
- [ ] Commits convencionales.

## Qué aprendiste

- i18n = claves + catálogos; los tests de paridad mantienen los catálogos honestos.
- Una fábrica (`createI18n`) hace que lo global sea testeable: cada test crea su instancia.
- Refactor: mover textos sin cambiar comportamiento, protegido por los tests existentes.
- Los tests que pasan de entrada se validan con una mutación.
