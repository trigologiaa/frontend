# Instructivo US-02: layout y navegación (JavaScript)

Guía para implementar [US-02](../user-stories/us-02-layout-and-navigation.md) con el
[flujo](00-workflow.md): **un test → el mínimo código → un commit**, doce ciclos.

## Qué vas a construir

El "marco" de la aplicación: `Layout` con `Header`, `NavBar`, el lugar donde se dibuja cada página
(`<Outlet />`) y `Footer`, más las cuatro rutas obligatorias con páginas provisorias (solo un título).

> **Concepto — SPA y router:** en una *Single Page Application* el navegador carga `index.html` una
> sola vez; al navegar, React Router cambia qué componente se dibuja, sin pedir otra página al
> servidor. Por eso `<Link>` en vez de `<a href>`: el `<a>` recarga todo.
>
> **Concepto — layout route:** una `<Route>` con `element={<Layout />}` y rutas hijas. El `Layout`
> dibuja lo común y `<Outlet />` marca el lugar donde entra la hija que coincide con la URL.

### Archivos

| Ciclo | Archivo | Qué es | Acción |
| ----- | ------- | ------ | ------ |
| — | `test/renderWithProviders.jsx` | helper de tests (router) | crear |
| 1 | `test/layout/Header.test.jsx` / `Header.jsx` | marca de la empresa | crear |
| 2–3 | `test/layout/NavBar.test.jsx` / `NavBar.jsx` | navegación con `<Link>` | crear |
| 4 | `test/layout/Footer.test.jsx` / `Footer.jsx` | pie mínimo | crear |
| 5–6 | `test/layout/Layout.test.jsx` / `Layout.jsx` | composición + outlet | crear |
| 7–11 | `test/app/App.test.jsx` / `App.jsx` | rutas | editar |
| 7–11 | `src/features/**/pages/*.jsx` | páginas provisorias | crear |
| 12 | (test de integración) | navegar con un click | agregar |
| — | `src/main.jsx`, `vercel.json` | BrowserRouter + fallback SPA | editar/crear |

## Paso 0: Preparar

```sh
git switch main && git pull
git switch -c us-02-layout-and-navigation
pnpm verify                      # verde antes de empezar
cp <ruta-a>/javascript/user-stories/us-02-layout-and-navigation.md docs/user-stories/
git add docs && git commit -m "docs: add US-02 layout and navigation story"
pnpm add react-router-dom
```

> `package.json` y `pnpm-lock.yaml` cambiaron: incluilos en el primer commit de código.

Creá el helper de tests `test/renderWithProviders.jsx` (infraestructura de tests: no lleva
test propio; después lo vas a extender con i18n y el carrito):

```jsx
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

export function renderWithProviders(ui, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}
```

> `MemoryRouter` es un router que guarda la URL **en memoria** en vez de en la barra del navegador:
> perfecto para tests.

Como todavía nadie lo importa, Knip lo marcaría: lo usa el test del ciclo 1, así que **no**
commitees hasta terminar el ciclo 1.

## Ciclo 1 — Header muestra la marca

🔴 `test/layout/Header.test.jsx`:

```jsx
import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../renderWithProviders'
import { Header } from '../../src/layout/Header'

describe('Header', () => {
  it('shows the brand as a link to the home page inside the banner', () => {
    renderWithProviders(<Header />)

    const brand = within(screen.getByRole('banner')).getByRole('link', { name: 'Trigologia Dev' })
    expect(brand).toHaveAttribute('href', '/')
  })
})
```

```sh
pnpm test:run
```

Rojo: `Failed to resolve import "../../src/layout/Header"`. 🟢 `src/layout/Header.jsx`:

```jsx
import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header>
      <Link to="/">Trigologia Dev</Link>
    </header>
  )
}
```

```sh
pnpm test:run && git add -A && git commit -m "feat(layout): add header with brand link"
```

## Ciclo 2 — NavBar es un landmark con nombre

🔴 `test/layout/NavBar.test.jsx`:

```jsx
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../renderWithProviders'
import { NavBar } from '../../src/layout/NavBar'

describe('NavBar', () => {
  it('is a navigation landmark named "Navegación principal"', () => {
    renderWithProviders(<NavBar />)

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
  })
})
```

Rojo esperado: `Failed to resolve import "../../src/layout/NavBar"`. 🟢:

```jsx
export function NavBar() {
  return <nav aria-label="Navegación principal" />
}
```

```sh
pnpm test:run && git add -A && git commit -m "feat(layout): add main navigation landmark"
```

## Ciclo 3 — Los tres links y a dónde van

🔴 Agregá al `describe` de `NavBar.test`:

```jsx
  it('links to home, services and cart', () => {
    renderWithProviders(<NavBar />)

    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Servicios' })).toHaveAttribute('href', '/productos')
    expect(screen.getByRole('link', { name: 'Carrito' })).toHaveAttribute('href', '/carrito')
  })
```

Rojo: `Unable to find an accessible element with the role "link" and name "Inicio"`. 🟢:

```jsx
import { Link } from 'react-router-dom'

export function NavBar() {
  return (
    <nav aria-label="Navegación principal">
      <Link to="/">Inicio</Link>
      <Link to="/productos">Servicios</Link>
      <Link to="/carrito">Carrito</Link>
    </nav>
  )
}
```

```sh
pnpm test:run && git add -A && git commit -m "feat(layout): add navigation links"
```

🔵 Refactor opcional (con verde): cuando más adelante aparezcan más links vas a querer una lista de
datos; por ahora tres líneas son más claras. No lo hagas todavía.

## Ciclo 4 — Footer

🔴 `test/layout/Footer.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from '../../src/layout/Footer'

describe('Footer', () => {
  it('is a content-info landmark with the company name', () => {
    render(<Footer />)

    expect(screen.getByRole('contentinfo')).toHaveTextContent('© Trigologia Dev')
  })
})
```

Rojo: `Failed to resolve import "../../src/layout/Footer"`. 🟢:

```jsx
export function Footer() {
  return <footer>© Trigologia Dev</footer>
}
```

```sh
pnpm test:run && git add -A && git commit -m "feat(layout): add footer"
```

## Ciclo 5 — Layout compone las tres partes

🔴 `test/layout/Layout.test.jsx`:

```jsx
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../renderWithProviders'
import { Layout } from '../../src/layout/Layout'

describe('Layout', () => {
  it('shows header, navigation and footer', () => {
    renderWithProviders(<Layout />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
```

Rojo: `Failed to resolve import "../../src/layout/Layout"`. 🟢:

```jsx
import { Footer } from './Footer'
import { Header } from './Header'
import { NavBar } from './NavBar'

export function Layout() {
  return (
    <>
      <Header />
      <NavBar />
      <Footer />
    </>
  )
}
```

```sh
pnpm test:run && git add -A && git commit -m "feat(layout): compose header, navigation and footer"
```

## Ciclo 6 — Layout dibuja la página hija (Outlet)

🔴 Agregá a `Layout.test` (importá `Route, Routes` de `react-router-dom`):

```jsx
  it('renders the current page inside the main landmark', () => {
    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<p>page content</p>} />
        </Route>
      </Routes>,
    )

    expect(screen.getByRole('main')).toHaveTextContent('page content')
  })
```

Rojo: `Unable to find an accessible element with the role "main"`. 🟢 en `Layout`:

```jsx
import { Outlet } from 'react-router-dom'
// ...
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Footer />
```

```sh
pnpm test:run && git add -A && git commit -m "feat(layout): render the current page in main"
```

## Ciclo 7 — `/` muestra Home dentro del Layout

Acá cambia un comportamiento de US-00: la marca ya no es un `<h1>` (cada página tiene **su** h1).
El test de `App` se reescribe (es un cambio de comportamiento, no una trampa).

🔴 Reemplazá `test/app/App.test.jsx` por:

```jsx
import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../renderWithProviders'
import { App } from '../../src/app/App'

describe('App routes', () => {
  it('shows the home page inside the layout at "/"', () => {
    renderWithProviders(<App />, { route: '/' })

    expect(screen.getByRole('heading', { level: 1, name: 'Inicio' })).toBeInTheDocument()
    expect(within(screen.getByRole('banner')).getByText('Trigologia Dev')).toBeInTheDocument()
  })
})
```

Rojo: `Unable to find an accessible element with the role "heading" and name "Inicio"`. 🟢:

`src/features/home/pages/Home.jsx`:

```jsx
export function Home() {
  return <h1>Inicio</h1>
}
```

`src/app/App.jsx`:

```jsx
import { Route, Routes } from 'react-router-dom'
import { Home } from '../features/home/pages/Home'
import { Layout } from '../layout/Layout'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  )
}
```

`src/main.jsx`: envolvé `<App />` en `<BrowserRouter>` (importado de `react-router-dom`).

```sh
pnpm verify && git add -A && git commit -m "feat(app): route home page inside the layout"
```

(`verify` y no solo `test:run`: acá tocaste `main` y el build.)

## Ciclo 8 — `/productos`

🔴 Agregá a `App.test`:

```jsx
  it('shows the catalog page at "/productos"', () => {
    renderWithProviders(<App />, { route: '/productos' })

    expect(screen.getByRole('heading', { level: 1, name: 'Servicios' })).toBeInTheDocument()
  })
```

Rojo: `Unable to find ... name "Servicios"` (aparece el h1 de Home en su lugar… o nada: leé el
mensaje de RTL, que imprime el DOM actual). 🟢:

`src/features/products/pages/ItemListContainer.jsx`:

```jsx
export function ItemListContainer() {
  return <h1>Servicios</h1>
}
```

`App`: `<Route path="productos" element={<ItemListContainer />} />`.

```sh
pnpm test:run && git add -A && git commit -m "feat(app): route the catalog page"
```

## Ciclo 9 — `/producto/:id` (título)

🔴:

```jsx
  it('shows the detail page at "/producto/:id"', () => {
    renderWithProviders(<App />, { route: '/producto/landing-page' })

    expect(screen.getByRole('heading', { level: 1, name: 'Detalle del servicio' })).toBeInTheDocument()
  })
```

🟢 `src/features/products/pages/ItemDetailContainer.jsx`:

```jsx
export function ItemDetailContainer() {
  return <h1>Detalle del servicio</h1>
}
```

`App`: `<Route path="producto/:id" element={<ItemDetailContainer />} />`.

```sh
pnpm test:run && git add -A && git commit -m "feat(app): route the detail page"
```

## Ciclo 10 — La página de detalle conoce el id

> **Concepto — ruta dinámica:** `:id` en el path es un parámetro; `useParams()` lo devuelve.

🔴:

```jsx
  it('gives the detail page the id from the URL', () => {
    renderWithProviders(<App />, { route: '/producto/landing-page' })

    expect(screen.getByText('landing-page')).toBeInTheDocument()
  })
```

Rojo: `Unable to find an element with the text: landing-page`. 🟢:

```jsx
import { useParams } from 'react-router-dom'

export function ItemDetailContainer() {
  const { id } = useParams()

  return (
    <>
      <h1>Detalle del servicio</h1>
      <p>{id}</p>
    </>
  )
}
```

```sh
pnpm test:run && git add -A && git commit -m "feat(app): read the service id from the URL"
```

## Ciclo 11 — `/carrito`

🔴:

```jsx
  it('shows the cart page at "/carrito"', () => {
    renderWithProviders(<App />, { route: '/carrito' })

    expect(screen.getByRole('heading', { level: 1, name: 'Carrito' })).toBeInTheDocument()
  })
```

🟢 `src/features/cart/pages/CartPage.jsx` (`<h1>Carrito</h1>`) y su `<Route path="carrito" ... />`.

```sh
pnpm test:run && git add -A && git commit -m "feat(app): route the cart page"
```

## Ciclo 12 — Navegar con un click cambia la página

Este test de integración probablemente **ya pase** (los `<Link>` existen desde el ciclo 3). Un test
que pasa de entrada no demuestra nada, así que hacé el *chequeo de mutación*:

```jsx
import userEvent from '@testing-library/user-event'
// ...
  it('changes the page when a navigation link is followed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />, { route: '/' })

    await user.click(screen.getByRole('link', { name: 'Servicios' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Servicios' })).toBeInTheDocument()
  })
```

1. Corrélo: verde.
2. **Rompé a propósito** `NavBar`: cambiá `<Link to="/productos">` por `<a href="/productos">`.
3. Corrélo: rojo (`MemoryRouter` no sigue un `<a>`; en un navegador real recargaría la página).
4. `git restore src/layout/NavBar.jsx`; verde otra vez.

```sh
git add -A && git commit -m "test(app): follow a navigation link"
```

## Fallback SPA para producción (configuración, sin test)

Creá `vercel.json`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Sin esto, abrir `https://…/productos` directo o refrescar da 404: el servidor busca un archivo
`productos` que no existe. Con el rewrite siempre sirve `index.html` y React Router resuelve la URL.

```sh
git add vercel.json && git commit -m "build: serve index.html for every route on vercel"
```

## Verificación manual

```sh
pnpm dev
```

- [ ] Los tres links llevan a su página; el ícono de carga de la pestaña **no** aparece (no hay
      recarga). Para estar seguro: DevTools → *Network* → activá *Preserve log* y mirá que al
      navegar no se pida `index.html` de nuevo.
- [ ] `/producto/landing-page` muestra el id.
- [ ] A 360 px nada se sale de la pantalla; sin errores en consola.
- [ ] Después del deploy de preview: abrí `…/productos` y `…/carrito` **directo** y refrescá.

## Publicar

```sh
git push -u origin us-02-layout-and-navigation      # corre pnpm verify
gh pr create --fill --base main
gh pr checks --watch
```

Completá la plantilla, revisá el preview, **squash merge** con el título
`feat: add layout and navigation between sections (US-02)`.

## Commits sugeridos

```
docs: add US-02 layout and navigation story
feat(layout): add header with brand link
feat(layout): add main navigation landmark
feat(layout): add navigation links
feat(layout): add footer
feat(layout): compose header, navigation and footer
feat(layout): render the current page in main
feat(app): route home page inside the layout
feat(app): route the catalog page
feat(app): route the detail page
feat(app): read the service id from the URL
feat(app): route the cart page
test(app): follow a navigation link
build: serve index.html for every route on vercel
```

## Definition of Done

- [ ] Todos los escenarios pasan como tests (menos "no recarga": manual).
- [ ] `pnpm verify` y el pipeline del PR en verde.
- [ ] Verificación manual hecha en el preview (incluido refresh en `/productos`).
- [ ] Commits convencionales, un ciclo verde por commit.

## Qué aprendiste

- `<Link>` vs `<a>` y por qué un test con `MemoryRouter` lo distingue.
- Layout route + `<Outlet />`; parámetros de ruta con `useParams`.
- Un test que pasa de entrada se "prueba" rompiendo el código a propósito.
