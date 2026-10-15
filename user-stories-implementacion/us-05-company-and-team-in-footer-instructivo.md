# Instructivo US-05: empresa y equipo en el footer (JavaScript)

Guía para implementar [US-05](../user-stories/us-05-company-and-team-in-footer.md) con el
[flujo](00-workflow.md).

## Qué vas a construir

Un footer con la información de la empresa y una lista de **tarjetas de equipo** generada desde
**datos**, y después (Parte B) la **base de estilos** del sitio, que se usa y se amplía en todas las
stories siguientes. Tres piezas, de la más simple a la más compuesta:

- `TeamCard`: presentacional. Recibe *strings* ya resueltos por props.
- `TeamList`: recibe un array y dibuja una `TeamCard` por persona.
- `TeamSection`: el que conoce los datos (`team`) y el idioma; le pasa todo a `TeamList`.

> **Concepto — presentacional vs contenedor (clase 2):** el presentacional solo transforma props
> en JSX (fácil de testear: le pasás datos y mirás el resultado). El contenedor sabe de dónde vienen
> los datos. Acá `TeamSection` es el "cerebro" y las otras dos son las "manos".

### Archivos

| Ciclo | Archivo | Acción |
| ----- | ------- | ------ |
| 1–3 | `src/features/team/components/TeamCard.jsx` + test | crear |
| 4 | `src/features/team/components/TeamList.jsx` + test | crear |
| 5 | `src/features/team/team.js` + test | crear |
| 6 | `src/features/team/components/TeamSection.jsx` + test | crear |
| 7–9 | `src/layout/Footer.jsx` + test, catálogos `es.json`/`en.json` | editar |
| — | `public/images/avatar-placeholder.svg` | crear (asset, sin test) |
| S1–S4 | `src/styles/tokens.css`, `src/styles/global.css`, `test/styles/*.test.js`, `src/main.jsx` | crear/editar (base de estilos y barreras) |
| S5–S11 | un `*.module.css` junto a cada componente de layout, equipo y 404, y su `.jsx` | crear/editar |

## Paso 0: Preparar

```sh
git switch main && git pull
git switch -c us-05-company-and-team-in-footer
pnpm verify
cp <ruta-a>/javascript/user-stories/us-05-company-and-team-in-footer.md docs/user-stories/
git add docs && git commit -m "docs: add US-05 company and team in footer story"
```

Creá un SVG simple (un círculo gris con una silueta) en `public/images/avatar-placeholder.svg`. Los
archivos de `public/` se sirven tal cual en `/images/avatar-placeholder.svg`. Es un asset, no código:
no lleva test (todavía no lo referencia nadie: lo commiteás en el ciclo 3).

## Ciclo 1 — La tarjeta muestra nombre, rol y bio

🔴 `test/features/team/components/TeamCard.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TeamCard } from '../../../../src/features/team/components/TeamCard'

describe('TeamCard', () => {
  it('shows the name, the role and the bio of the person', () => {
    render(<TeamCard name="Ada" role="Backend" bio="Builds APIs." />)

    expect(screen.getByRole('heading', { name: 'Ada' })).toBeInTheDocument()
    expect(screen.getByText('Backend')).toBeInTheDocument()
    expect(screen.getByText('Builds APIs.')).toBeInTheDocument()
  })
})
```

Rojo: `Failed to resolve import "../../../../src/features/team/components/TeamCard"`. 🟢:

```jsx
export function TeamCard({ name, role, bio }) {
  return (
    <article>
      <h3>{name}</h3>
      <p>{role}</p>
      <p>{bio}</p>
    </article>
  )
}
```

```sh
pnpm test:run && git add -A && git commit -m "feat(team): add team card"
```

## Ciclo 2 — La tarjeta tiene foto con texto alternativo

🔴:

```jsx
  it('shows the photo with the name as its alternative text', () => {
    render(<TeamCard name="Ada" role="Backend" bio="Builds APIs." photo="/images/ada.jpg" />)

    expect(screen.getByRole('img', { name: 'Ada' })).toHaveAttribute('src', '/images/ada.jpg')
  })
```

Rojo: `Unable to find an accessible element with the role "img" and name "Ada"`. 🟢: desestructurá
`photo` y agregá `<img src={photo} alt={name} />` arriba del `h3`.

```sh
pnpm test:run && git add -A && git commit -m "feat(team): show the team member photo"
```

> **Concepto — `alt`:** texto que lee un lector de pantalla y se ve si la imagen no carga. Para una
> foto de persona, el nombre es un buen `alt`.

## Ciclo 3 — Sin foto, avatar genérico

🔴:

```jsx
  it('falls back to the placeholder avatar when there is no photo', () => {
    render(<TeamCard name="Ada" role="Backend" bio="Builds APIs." />)

    expect(screen.getByRole('img', { name: 'Ada' })).toHaveAttribute(
      'src',
      '/images/avatar-placeholder.svg',
    )
  })
```

Rojo: `Expected the element to have attribute: src="/images/avatar-placeholder.svg"  Received: (none)`.
🟢: valor por defecto en la desestructuración: `photo = '/images/avatar-placeholder.svg'`.

```sh
pnpm test:run && git add -A && git commit -m "feat(team): fall back to a placeholder avatar"
```

(incluye el SVG creado en el Paso 0).

## Ciclo 4 — La lista dibuja una tarjeta por persona

🔴 `TeamList.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TeamList } from '../../../../src/features/team/components/TeamList'

const person = (id) => ({ id, name: `Person ${id}`, role: 'Role', bio: 'Bio' })

describe('TeamList', () => {
  it('renders one card for each person', () => {
    render(<TeamList people={[person(1), person(2), person(3), person(4)]} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })
})
```


Rojo: `Failed to resolve import "../../../../src/features/team/components/TeamList"`. 🟢:

```jsx
import { TeamCard } from './TeamCard'

export function TeamList({ people }) {
  return (
    <ul>
      {people.map((person) => (
        <li key={person.id}>
          <TeamCard name={person.name} role={person.role} bio={person.bio} photo={person.photo} />
        </li>
      ))}
    </ul>
  )
}
```

```sh
pnpm test:run && git add -A && git commit -m "feat(team): render a card per team member"
```

> Es el ejemplo de la clase 4: `map` + `key`. Si omitís `key`, React avisa en consola.

## Ciclo 5 — El equipo es un dato con al menos tres personas

🔴 `test/features/team/team.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { team } from '../../../src/features/team/team'

describe('team data', () => {
  it('has at least three members with unique ids', () => {
    const ids = team.map((person) => person.id)

    expect(team.length).toBeGreaterThanOrEqual(3)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every member a name, a role key and a bio key', () => {
    for (const person of team) {
      expect(person.name).toBeTruthy()
      expect(person.roleKey).toBeTruthy()
      expect(person.bioKey).toBeTruthy()
    }
  })
})
```

(Son dos tests: hacelos **de a uno**, un commit cada uno; el segundo pasa de entrada si escribís
los datos completos: en ese caso hacé la mutación borrando un `bioKey`.)

🟢 `src/features/team/team.js` con **tres** personas. Reemplazá los nombres por los reales:

```js
export const team = [
  { id: 'person-1', name: 'Persona Uno', roleKey: 'team.person1.role', bioKey: 'team.person1.bio' },
  { id: 'person-2', name: 'Persona Dos', roleKey: 'team.person2.role', bioKey: 'team.person2.bio' },
  { id: 'person-3', name: 'Persona Tres', roleKey: 'team.person3.role', bioKey: 'team.person3.bio' },
]
```

Agregá las seis claves `team.person*.role|bio` a **ambos** catálogos (roles sugeridos:
*Full-stack developer*, *Backend developer*, *Linux and DevOps mentor*).

```sh
pnpm test:run && git add -A && git commit -m "feat(team): add the team data"
```

> Los datos guardan **claves**, no textos: así el idioma se resuelve en un solo lugar.

## Ciclo 6 — TeamSection resuelve las claves en el idioma activo

🔴 `TeamSection.test.jsx` (usa `renderWithProviders`, que ya tiene i18n):

```jsx
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import es from '../../../../src/i18n/locales/es.json'
import { renderWithProviders } from '../../../renderWithProviders'
import { TeamSection } from '../../../../src/features/team/components/TeamSection'

describe('TeamSection', () => {
  it('shows the team with the roles in the active language', () => {
    renderWithProviders(<TeamSection />)

    expect(screen.getByRole('heading', { name: es.footer.team.title })).toBeInTheDocument()
    expect(screen.getByText(es.team.person1.role)).toBeInTheDocument()
  })
})
```

Rojo: `Failed to resolve import "../../../../src/features/team/components/TeamSection"`. 🟢 (agregá `footer.team.title` a los catálogos):

```jsx
import { useTranslation } from 'react-i18next'
import { team } from '../team'
import { TeamList } from './TeamList'

export function TeamSection() {
  const { t } = useTranslation()
  const people = team.map((member) => ({
    ...member,
    role: t(member.roleKey),
    bio: t(member.bioKey),
  }))

  return (
    <section aria-labelledby="team-title">
      <h2 id="team-title">{t('footer.team.title')}</h2>
      <TeamList people={people} />
    </section>
  )
}
```

```sh
pnpm test:run && git add -A && git commit -m "feat(team): add the team section in the active language"
```

## Ciclo 7 — El footer muestra al menos tres tarjetas

🔴 en `Footer.test` (pasá a `renderWithProviders`):

```jsx
  it('lists at least three team members', () => {
    renderWithProviders(<Footer />)

    expect(within(screen.getByRole('contentinfo')).getAllByRole('listitem').length).toBeGreaterThanOrEqual(3)
  })
```

Rojo: `expected 0 to be greater than or equal to 3`. 🟢: `<TeamSection />` dentro del `footer`
(el test de "© Trigologia Dev" de US-02 sigue pasando: si falla por falta de provider, pasalo a
`renderWithProviders`: es el mismo test con otro helper).

```sh
pnpm test:run && git add -A && git commit -m "feat(layout): show the team in the footer"
```

## Ciclo 8 — El footer cuenta qué hace la empresa

🔴:

```jsx
  it('shows the company description and a contact link', () => {
    renderWithProviders(<Footer />)

    const footer = within(screen.getByRole('contentinfo'))
    expect(footer.getByText(es.footer.company.about)).toBeInTheDocument()
    expect(footer.getByRole('link', { name: es.footer.contact })).toHaveAttribute(
      'href',
      'mailto:hello@trigologia.dev',
    )
  })
```

Rojo: `Unable to find an element with the text: Servicios de desarrollo de software...`. 🟢: en `Footer`,
antes del `TeamSection`:

```jsx
<p>{t('footer.company.about')}</p>
<a href="mailto:hello@trigologia.dev">{t('footer.contact')}</a>
```

con `const { t } = useTranslation()` (agregá `footer.company.about` y `footer.contact` a los dos
catálogos). El email es un **placeholder**: reemplazalo por el tuyo antes de entregar (US-16 lo
revisa).

```sh
pnpm test:run && git add -A && git commit -m "feat(layout): add the company information to the footer"
```

> Un `mailto:` **sí** es un `<a href>` y no un `<Link>`: no es una ruta de la app.

## Ciclo 9 — El footer habla inglés

🔴:

```jsx
  it('shows the company description in English', async () => {
    await i18n.changeLanguage('en')
    renderWithProviders(<Footer />)

    expect(within(screen.getByRole('contentinfo')).getByText(en.footer.company.about)).toBeInTheDocument()
  })
```

Pasa si los catálogos están completos (el test de paridad ya te obliga). Mutación: cambiá
`t('footer.company.about')` por un texto fijo → rojo. Commit `test(layout): translate the footer`.

## Parte B — Estilos: esta story se ve bien (CSS con TDD)

Hasta acá la story funciona pero se ve cruda, y US-02 a US-04 dejaron el layout sin estilos. **Desde
esta story el CSS se escribe junto con cada componente**, no al final del proyecto: así podés
juzgar a ojo si una página "queda bien" mientras la construís. US-05 pone la base (tokens y estilos
globales) y estiliza todo lo que ya existe: layout, navegación, 404, footer y tarjetas.

> **Concepto — ¿se puede hacer TDD con CSS?** Un test no puede decirte "esto es lindo", pero sí
> puede vigilar **reglas** que no querés romper nunca. Acá hay tres tipos de red:
>
> 1. **Barreras (guards):** tests chicos que leen el CSS como texto (`?raw`) y fallan si no se
>    cumple una regla: existen los tokens, no hay colores sueltos, el foco no se esconde, todo
>    componente tiene su módulo CSS.
> 2. **Trinquete (ratchet):** una lista `pending` de componentes todavía sin estilos. El 🔴 de cada
>    ciclo de estilo es **sacar el componente de la lista**; el 🟢 es crear su `.module.css`. La lista
>    solo puede achicarse, y los componentes nuevos que no registres fallan.
> 3. **Tus tests de comportamiento:** consultan por rol y texto, no por clases. Si restilizar rompe
>    algo (por ejemplo, un `className` mal puesto que tapa un botón), el rojo aparece solo.
>
> Lo que **no** se puede automatizar (¿está bien espaciado?, ¿se lee?, ¿entra en 360 px?) es el 🔵
> **Refactor** de cada ciclo: mirás en el navegador y ajustás.

### El ciclo de estilo (se repite por componente)

1. 🔴 Sacá el componente de `pending` en `test/styles/components.test.js`. Corré el test: falla
   nombrando el archivo sin módulo.
2. 🟢 Creá `Componente.module.css` al lado del `.jsx`, importalo
   (`import styles from './Componente.module.css'`) y ponele `className={styles.algo}` a los elementos.
   Solo `var(--token)`: nada de colores sueltos (la barrera del Ciclo S3 te frena).
3. 🔵 `pnpm dev` → DevTools → *Toggle device toolbar* → mirá a **360 px** y a **1280 px**; ajustá.
   Corré `pnpm test:run`: los tests de comportamiento tienen que seguir en verde.
4. Commit `style(<alcance>): ...` (`pnpm format` antes si Biome se queja del formato del CSS).

Estilos **mobile first**: lo base es el celular y `@media (min-width: 48rem)` agrega la versión ancha.

> **Concepto — CSS Modules:** `Card.module.css` + `import styles from './Card.module.css'` +
> `className={styles.card}`. Vite le agrega un sufijo único a cada clase, así que `.title` de una
> tarjeta no pisa al `.title` de otra. En Vitest los módulos CSS no se procesan: `styles.card`
> devuelve igual el nombre `card`, sin romper nada. Si algún día `styles.x` te da `undefined` en un
> test, revisá `test.css.modules` en la configuración de Vitest.

### Paso S0 — Elegí el aspecto antes de escribir CSS

Diez minutos, en papel o en un bloc de notas: un color principal, uno de acento, una escala de grises,
una tipografía (lo más simple: `system-ui`) y una escala de espacios (4, 8, 16, 24, 32 px). Mirá dos o
tres sitios de servicios o portfolios y anotá qué te gusta. Los valores de abajo son un punto de
partida: un **tema oscuro violeta** (fondo `#1b1429`, acento `#c770f0`) inspirado en un portfolio que
nos gustó; cambialos por **tu** paleta. Todo el sitio va a leer de acá.

> **Contraste:** sobre un acento claro como `#c770f0` el texto del botón tiene que ser **oscuro**
> (`--color-primary-contrast: #140f23`, unos 6:1). Con blanco daría unos 3:1 y no pasa AA (4.5:1).
> Cuando cambies de paleta, comprobalo con el color picker de DevTools.

### Ciclo S1 — Existen los tokens

🔴 `test/styles/tokens.test.js`:

```js
import { describe, expect, it } from 'vitest'
import tokens from '../../src/styles/tokens.css?raw'

describe('design tokens', () => {
  it.each([
    '--color-primary',
    '--color-background',
    '--color-text',
    '--space-4',
    '--font-size-base',
    '--radius',
  ])('defines %s', (name) => {
    expect(tokens).toContain(`${name}:`)
  })
})
```

(`?raw` importa el archivo como texto.) Rojo: `Failed to resolve import "../../src/styles/tokens.css?raw"`. 🟢
`src/styles/tokens.css`:

```css
:root {
  color-scheme: dark;

  --color-primary: #c770f0;
  --color-primary-contrast: #140f23;
  --color-background: #1b1429;
  --color-surface: #241a3a;
  --color-text: #f5f5f5;
  --color-muted: #a588c0;
  --color-border: #4a3570;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  --font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.75rem;

  --radius: 0.5rem;
  --shadow: 0 4px 5px 3px rgb(119 53 136 / 46%);
  --background-image: linear-gradient(270deg, #1b1429, #140f23);
  --content-width: 70rem;
}
```

```sh
pnpm test:run && git add -A && git commit -m "style: add the design tokens"
```

> **Concepto — tokens (custom properties):** `--color-primary` se define una vez en `:root` y se usa
> con `var(--color-primary)`. Cambiás el valor en un lugar y cambia todo el sitio.
>
> **Dos detalles del tema oscuro:** `color-scheme: dark` le avisa al navegador que los controles nativos
> (scrollbars, inputs) también deben ser oscuros, y `--background-image` guarda el degradé del fondo
> (se aplica en el `body`, ver el Ciclo S2). Los hex viven **solo** en `tokens.css`: los módulos usan
> `var(--token)`.

### Ciclo S2 — Estilos globales y foco visible

🔴 `test/styles/global.test.js`:

```js
import { describe, expect, it } from 'vitest'
import global from '../../src/styles/global.css?raw'

describe('global styles', () => {
  it('keeps a visible keyboard focus', () => {
    expect(global).toContain(':focus-visible')
    expect(global).not.toMatch(/outline:\s*(none|0)\b/)
  })
})
```

Rojo: `Failed to resolve import "../../src/styles/global.css?raw"`. 🟢 `src/styles/global.css`:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--color-text);
  background: var(--background-image), var(--color-background);
}

img {
  max-width: 100%;
  height: auto;
}

a {
  color: var(--color-primary);
}

:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
```

En `src/main.jsx` reemplazá `import './index.css'` por:

```jsx
import './styles/tokens.css'
import './styles/global.css'
```

y borrá `src/index.css` (estaba vacío; Knip lo marcaría como archivo sin usar).

> `box-sizing: border-box` hace que el `padding` no agrande los elementos (evita desbordes).
> `max-width: 100%` en las imágenes evita el scroll horizontal. `:focus-visible` muestra el foco
> **solo con teclado**: nunca lo apagues sin dar algo a cambio.

🔵 `pnpm dev`: la tipografía cambió y al apretar Tab se ve un contorno azul. Commit:

```sh
pnpm test:run && git add -A && git commit -m "style: add global styles and visible focus"
```

### Ciclo S3 — Barrera: nada de colores sueltos

🔴 `test/styles/modules.test.js`:

```js
import { describe, expect, it } from 'vitest'

const modules = import.meta.glob('../../src/**/*.module.css', {
  query: '?raw',
  import: 'default',
  eager: true,
})

describe('component styles', () => {
  it('never hardcode a color: they use the design tokens', () => {
    for (const [file, css] of Object.entries(modules)) {
      expect(css, file).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    }
  })
})
```

Con cero módulos **pasa de entrada**: es una barrera que trabaja desde el primer `.module.css`.
Comprobala con una **mutación**: creá `src/layout/tmp.module.css` con `a { color: #fff; }`, corré el
test (rojo, con el nombre del archivo en el mensaje) y borrá el archivo.

```sh
git add -A && git commit -m "test: forbid hardcoded colors in component styles"
```

### Ciclo S4 — Barrera y trinquete: todo componente tiene su módulo CSS

🔴 `test/styles/components.test.js`:

```js
import { describe, expect, it } from 'vitest'

// Deuda de estilos: componentes que todavía no tienen su .module.css.
// Cada ciclo de estilo borra una línea. Una story termina sin pendientes propios.
const pending = [
  'src/layout/Layout.jsx',
  'src/layout/Header.jsx',
  'src/layout/LanguageSwitcher.jsx',
  'src/layout/NavBar.jsx',
  'src/layout/NavItem.jsx',
  'src/layout/Footer.jsx',
  'src/features/not-found/pages/NotFound.jsx',
  'src/features/team/components/TeamCard.jsx',
  'src/features/team/components/TeamList.jsx',
  'src/features/team/components/TeamSection.jsx',
  // Stories futuras: cada una borra los suyos cuando les da estilo.
  'src/features/home/pages/Home.jsx',
  'src/features/services/pages/ItemListContainer.jsx',
  'src/features/services/pages/ItemDetailContainer.jsx',
  'src/features/cart/pages/CartPage.jsx',
]

const components = Object.keys(
  import.meta.glob([
    '../../src/layout/*.jsx',
    '../../src/features/*/components/*.jsx',
    '../../src/features/*/pages/*.jsx',
  ]),
).map((path) => path.replace('../../', ''))

const modules = import.meta.glob('../../src/**/*.module.css', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const hasStyles = (component) =>
  Boolean(modules[`../../${component.replace(/\.jsx$/, '.module.css')}`]?.trim())

describe('component styles', () => {
  it('gives every component outside the pending list its own CSS module', () => {
    const unstyled = components.filter((c) => !pending.includes(c) && !hasStyles(c))

    expect(unstyled).toEqual([])
  })

  it('removes a component from the pending list once it is styled', () => {
    const stale = pending.filter((c) => hasStyles(c))

    expect(stale).toEqual([])
  })
})
```

> Tu carpeta del catálogo se llama `services`; los instructivos de las stories 08 y 09 dicen
> `services`. Usá el nombre que tengas en el repo en **todos** lados.

Pasa de entrada (todo está pendiente). Dos mutaciones: (1) sacá `Footer.jsx` de `pending` → rojo con
`['src/layout/Footer.jsx']`; volvé a ponerlo. (2) creá un `Footer.module.css` con una regla y dejalo
en `pending` → el segundo test se pone rojo; borrá el archivo.

```sh
git add -A && git commit -m "test: require a CSS module for every component"
```

> Desde ahora, **cada story** agrega en su Paso 0 los componentes que va a crear a `pending`, y su
> bloque de estilos los saca. Si te olvidás de registrar uno, el primer test se pone rojo apenas
> crees el `.jsx`: es el recordatorio.

### Ciclo S5 — El layout: pie abajo y ancho máximo

🔴 Sacá `'src/layout/Layout.jsx'` de `pending`. Rojo: `expected [ 'src/layout/Layout.jsx' ] to deeply equal []`.

🟢 `src/layout/Layout.module.css`:

```css
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  flex: 1;
  width: 100%;
  max-width: var(--content-width);
  margin-inline: auto;
  padding: var(--space-4);
}

@media (min-width: 48rem) {
  .main {
    padding: var(--space-8) var(--space-6);
  }
}
```

En `Layout.jsx`: importá los estilos, reemplazá el fragmento `<>...</>` por
`<div className={styles.layout}>...</div>` y poné `className={styles.main}` al `<main>`.

🔵 El footer queda pegado abajo aunque la página sea cortita; el contenido no se estira en pantallas
enormes.

```sh
pnpm test:run && git add -A && git commit -m "style(layout): pin the footer down and limit the content width"
```

> `flex: 1` en el `main` lo hace ocupar el espacio que sobra; con `min-height: 100vh` en la columna, el
> pie baja hasta el fondo.

### Ciclo S6 — La cabecera y el selector de idioma

🔴 Sacá `Header.jsx` y `LanguageSwitcher.jsx` de `pending`.

🟢 `src/layout/Header.module.css`:

```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
}

.brand {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
}
```

`src/layout/LanguageSwitcher.module.css`:

```css
.group {
  display: inline-flex;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}

.button {
  min-width: 2.75rem;
  min-height: 2.75rem;
  border: 0;
  font: inherit;
  color: var(--color-text);
  background: var(--color-background);
  cursor: pointer;
}

.button[aria-pressed='true'] {
  color: var(--color-primary-contrast);
  background: var(--color-primary);
}
```

`className={styles.header}` al `<header>`, `className={styles.brand}` al `Link`;
`className={styles.group}` al `div` y `className={styles.button}` a cada `button`.

🔵 A 360 px la marca y los botones entran en una línea; el idioma activo se distingue sin leer la
etiqueta (se estila con `aria-pressed`, el mismo atributo que ya testeaste en US-04). Tamaño mínimo
44 × 44 px para el dedo.

```sh
pnpm test:run && git add -A && git commit -m "style(layout): style the header and the language switcher"
```

### Ciclo S7 — La navegación marca la sección activa

Acá el CSS **sí** tiene un comportamiento que proteger: la sección activa de US-03 tiene que *verse*,
y se engancha al atributo `aria-current`, no a una clase.

🔴 `test/layout/NavItem.styles.test.js`:

```js
import { describe, expect, it } from 'vitest'
import css from '../../src/layout/NavItem.module.css?raw'

describe('NavItem styles', () => {
  it('highlights the current page through aria-current', () => {
    expect(css).toMatch(/\[aria-current=['"]page['"]\]/)
  })
})
```

Rojo: `Failed to resolve import "../../src/layout/NavItem.module.css?raw"`. (El regex acepta comillas
simples o dobles porque Biome puede reformatearlas.) Sacá también `NavBar.jsx` y `NavItem.jsx` de
`pending`. 🟢 `src/layout/NavItem.module.css`:

```css
.link {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0 var(--space-3);
  border-radius: var(--radius);
  color: var(--color-text);
  text-decoration: none;
}

.link:hover {
  background: var(--color-surface);
}

.link[aria-current='page'] {
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 0.35em;
}
```

`src/layout/NavBar.module.css`:

```css
.nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
```

`className={styles.link}` en el `Link` de `NavItem`; `className={styles.nav}` en el `<nav>`.

🔵 Navegá entre secciones: la activa se ve distinta y sigue marcada en el detalle de un servicio.
La subrayada no depende solo del color (accesible para daltonismo).

```sh
pnpm test:run && git add -A && git commit -m "style(layout): style the navigation and the active section"
```

### Ciclo S8 — La tarjeta del equipo

🔴 Sacá `TeamCard.jsx` de `pending`. 🟢 `src/features/team/components/TeamCard.module.css`:

```css
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  height: 100%;
  padding: var(--space-4);
  text-align: center;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.photo {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  object-fit: cover;
}

.name {
  margin: 0;
  font-size: var(--font-size-lg);
}

.role {
  margin: 0;
  font-weight: 600;
  color: var(--color-primary);
}

.bio {
  margin: 0;
  color: var(--color-muted);
}
```

`styles.card` al `article`, `styles.photo` a la `img`, `styles.name` al `h3`, `styles.role` y
`styles.bio` a los dos `p`.

🔵 La foto es un círculo aunque la imagen no sea cuadrada (`object-fit: cover`); probá con el avatar
genérico y con una foto real si tenés una.

```sh
pnpm test:run && git add -A && git commit -m "style(team): style the team card"
```

### Ciclo S9 — La grilla del equipo

🔴 Sacá `TeamList.jsx` y `TeamSection.jsx` de `pending`. 🟢
`src/features/team/components/TeamList.module.css`:

```css
.list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
```

`src/features/team/components/TeamSection.module.css`:

```css
.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.title {
  margin: 0;
  font-size: var(--font-size-lg);
  text-align: center;
}
```

`styles.list` al `ul`; `styles.section` a la `section` y `styles.title` al `h2`.

🔵 Cambiá el ancho de la ventana: 1 columna en el celular, 2 y 3 al ensanchar; sin código de
*breakpoints* (la grilla se adapta sola).

> **Concepto — `auto-fit` + `minmax`:** "tantas columnas de al menos 14 rem como entren, y repartí el
> resto". Es una grilla responsive sin una sola media query.

```sh
pnpm test:run && git add -A && git commit -m "style(team): lay the team out in a responsive grid"
```

### Ciclo S10 — El footer

🔴 Sacá `Footer.jsx` de `pending`. 🟢 `src/layout/Footer.module.css`:

```css
.footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6) var(--space-4);
  text-align: center;
  color: var(--color-muted);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.about {
  margin: 0;
}

.contact {
  font-weight: 600;
}

.rights {
  margin: 0;
  font-size: 0.875rem;
}

@media (min-width: 48rem) {
  .footer {
    padding: var(--space-8) var(--space-6);
  }
}
```

`styles.footer` al `<footer>`, `styles.about` al primer `p`, `styles.contact` al `a` y `styles.rights`
al último `p`.

🔵 Mirá el footer completo a 360 y a 1280 px: descripción, contacto, tarjetas y derechos, en ese
orden de lectura.

```sh
pnpm test:run && git add -A && git commit -m "style(layout): style the footer"
```

### Ciclo S11 — La página 404

🔴 Sacá `NotFound.jsx` de `pending`. 🟢
`src/features/not-found/pages/NotFound.module.css`:

```css
.notFound {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-8) 0;
  text-align: center;
}

.title {
  margin: 0;
  font-size: var(--font-size-xl);
}

.hint {
  margin: 0;
  color: var(--color-muted);
}

.back {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0 var(--space-4);
  font-weight: 600;
  color: var(--color-primary-contrast);
  text-decoration: none;
  background: var(--color-primary);
  border-radius: var(--radius);
}
```

En `NotFound.jsx` reemplazá el fragmento por `<section className={styles.notFound}>`, y poné
`styles.title` al `h1`, `styles.hint` al `p` y `styles.back` al `Link`.

🔵 Visitá `/cualquier-cosa`: mensaje centrado y un botón claro para volver.

```sh
pnpm test:run && git add -A && git commit -m "style(not-found): style the not found page"
```

> La landing, el catálogo, el detalle y el carrito siguen en `pending`: cada una recibe su estilo en
> **su** story (US-06, US-08, US-09, US-11 a US-13). US-14 queda como pulido final.

## Verificación manual

- [ ] `pnpm dev`: el footer muestra empresa, contacto y tres tarjetas con el avatar genérico.
- [ ] Cambiá el idioma: empresa y roles/bios cambian.
- [ ] 360 px y 1280 px: header, navegación, tarjetas y footer se ven bien y nada se sale de la pantalla
      (`document.documentElement.scrollWidth > window.innerWidth` da `false`).
- [ ] Solo teclado: el foco se ve en el selector de idioma, la navegación, el contacto y el 404.
- [ ] Reemplazá los nombres placeholder por los reales (o dejá una nota en el PR); sin errores en consola.

## Publicar

```sh
git push -u origin us-05-company-and-team-in-footer
gh pr create --fill --base main && gh pr checks --watch
```

Squash merge: `feat: add company information and team cards to the footer (US-05)`.

## Commits sugeridos

```
docs: add US-05 company and team in footer story
feat(team): add team card
feat(team): show the team member photo
feat(team): fall back to a placeholder avatar
feat(team): render a card per team member
feat(team): add the team data
feat(team): add the team section in the active language
feat(layout): show the team in the footer
feat(layout): add the company information to the footer
test(layout): translate the footer
style: add the design tokens
style: add global styles and visible focus
test: forbid hardcoded colors in component styles
test: require a CSS module for every component
style(layout): pin the footer down and limit the content width
style(layout): style the header and the language switcher
style(layout): style the navigation and the active section
style(team): style the team card
style(team): lay the team out in a responsive grid
style(layout): style the footer
style(not-found): style the not found page
```

## Definition of Done

- [ ] Todos los escenarios pasan como tests.
- [ ] Layout, navegación, 404, footer y tarjetas tienen su `.module.css`; en `pending` solo quedan
      componentes de stories futuras.
- [ ] `pnpm verify` y el pipeline en verde; verificación manual hecha en el preview.
- [ ] Commits convencionales.

## Qué aprendiste

- Presentacional (props → JSX) vs contenedor (datos + idioma).
- Las listas se dibujan con `map` y `key`; los datos viven aparte del markup.
- Triangulación: un valor por defecto (`photo = ...`) nace de un test que lo exige.
- Tokens + CSS Modules + mobile first, y cómo "testear" CSS: barreras que leen el archivo, un trinquete
  (`pending`) que obliga a estilar cada componente y la mirada en el navegador como refactor.
