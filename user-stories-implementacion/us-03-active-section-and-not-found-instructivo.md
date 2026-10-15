# Instructivo US-03: sección activa y página no encontrada (JavaScript)

Guía para implementar [US-03](../user-stories/us-03-active-section-and-not-found.md) con el
[flujo](00-workflow.md): un test, el mínimo código, un commit.

## Qué vas a construir

1. El navbar marca la sección actual con `aria-current="page"`.
2. "Servicios" sigue marcado en la página de detalle.
3. Una página 404 dentro del layout, con link de vuelta al inicio.

> **Concepto — `aria-current="page"`:** atributo de accesibilidad que le dice a un lector de pantalla
> "este es el link de la página donde estás". `NavLink` de React Router lo agrega solo cuando su
> ruta coincide con la URL. Testeamos el **atributo** (comportamiento visible para asistentes),
> no la clase CSS `active` (detalle de implementación).

### Archivos

| Ciclo | Archivo | Acción |
| ----- | ------- | ------ |
| 1–3 | `src/layout/NavBar.jsx`, `NavBar.test.jsx` | editar |
| 4 | `src/layout/NavItem.jsx`, `NavItem.test.jsx` (o solo vía NavBar) | crear |
| 5–7 | `src/features/not-found/pages/NotFound.jsx` + test, `src/app/App.jsx` + test | crear/editar |

## Paso 0: Preparar

```sh
git switch main && git pull
git switch -c us-03-active-section-and-not-found
pnpm verify
cp <ruta-a>/javascript/user-stories/us-03-active-section-and-not-found.md docs/user-stories/
git add docs && git commit -m "docs: add US-03 active section and not found story"
```

## Ciclo 1 — La sección actual queda marcada

🔴 En `NavBar.test`:

```jsx
  it('marks the current section as the current page', () => {
    renderWithProviders(<NavBar />, { route: '/productos' })

    expect(screen.getByRole('link', { name: 'Servicios' })).toHaveAttribute('aria-current', 'page')
  })
```

Rojo: `expect(element).toHaveAttribute("aria-current", "page") ... Received: null`. 🟢: en `NavBar`
reemplazá `Link` por `NavLink` (mismo import de `react-router-dom`, mismas props `to`).

```sh
pnpm test:run && git add -A && git commit -m "feat(layout): mark the current section in the navigation"
```

## Ciclo 2 — Las demás secciones no quedan marcadas

🔴:

```jsx
  it('does not mark the other sections', () => {
    renderWithProviders(<NavBar />, { route: '/productos' })

    expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Carrito' })).not.toHaveAttribute('aria-current')
  })
```

Rojo interesante: **"Inicio" sí está marcado**. `to="/"` coincide con *cualquier* ruta porque toda ruta
empieza con `/`. 🟢: al `NavLink` de Inicio agregale la prop `end` (*"solo coincide si es exactamente
esta ruta"*).

```sh
pnpm test:run && git add -A && git commit -m "fix(layout): mark home only on the exact route"
```

> `fix:` porque corregiste un comportamiento incorrecto del ciclo anterior. La regla: si el bug fue
> descubierto por un test nuevo, el test y el arreglo van en el mismo commit.

## Ciclo 3 — La marca sigue a la navegación

🔴 (puede pasar de entrada; hacé la mutación: cambiá un `NavLink` por `Link` y debe ponerse rojo):

```jsx
import userEvent from '@testing-library/user-event'
// ...
  it('moves the mark when another section is followed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NavBar />, { route: '/' })

    await user.click(screen.getByRole('link', { name: 'Carrito' }))

    expect(screen.getByRole('link', { name: 'Carrito' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current')
  })
```


```sh
pnpm test:run && git add -A && git commit -m "test(layout): follow the mark through navigation"
```

## Ciclo 4 — Servicios sigue activo en el detalle

🔴:

```jsx
  it('keeps the services section marked on a service detail', () => {
    renderWithProviders(<NavBar />, { route: '/producto/landing-page' })

    expect(screen.getByRole('link', { name: 'Servicios' })).toHaveAttribute('aria-current', 'page')
  })
```

Rojo: `Received: null` (`/producto/landing-page` no coincide con `/productos`). 🟢: hay que dejar de
depender solo de `NavLink`. Creá `NavItem` — un link que sabe en qué rutas está activo:

```jsx
import { Link, matchPath, useLocation } from 'react-router-dom'

export function NavItem({ to, activeFor = [], children }) {
  const { pathname } = useLocation()
  const isActive = [to, ...activeFor].some((path) => matchPath({ path, end: true }, pathname))

  return (
    <Link to={to} aria-current={isActive ? 'page' : undefined}>
      {children}
    </Link>
  )
}
```

En `NavBar`: `<NavItem to="/">Inicio</NavItem>`, `<NavItem to="/productos" activeFor={['/producto/:id']}>Servicios</NavItem>`,
`<NavItem to="/carrito">Carrito</NavItem>`. Los tests de los ciclos 1–3 siguen verdes y te dicen
que el refactor no rompió nada (por eso `end: true` está en `matchPath`, reemplazando el `end` de
`NavLink`).

```sh
pnpm verify && git add -A && git commit -m "feat(layout): keep services marked on a service detail"
```

## Ciclo 5 — Dirección inexistente muestra el mensaje

🔴 en `App.test`:

```jsx
  it('shows a not-found message for an unknown address', () => {
    renderWithProviders(<App />, { route: '/esto-no-existe' })

    expect(screen.getByRole('heading', { level: 1, name: /No encontramos esa página/ })).toBeInTheDocument()
  })
```

Rojo: `Unable to find an accessible element with the role "heading"`. 🟢
`src/features/not-found/pages/NotFound.jsx`:

```jsx
export function NotFound() {
  return <h1>404 — No encontramos esa página</h1>
}
```

y en `App`, **a propósito afuera del Layout** (el ciclo siguiente lo va a forzar a entrar):
`<Route path="*" element={<NotFound />} />` como hermana de la ruta del Layout.

```sh
pnpm test:run && git add -A && git commit -m "feat(app): show a not-found page for unknown addresses"
```

## Ciclo 6 — La 404 conserva la navegación

🔴:

```jsx
  it('keeps the navigation on the not-found page', () => {
    renderWithProviders(<App />, { route: '/esto-no-existe' })

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
  })
```

Rojo: `Unable to find an accessible element with the role "navigation"`. 🟢: mové la ruta `path="*"`
**adentro** de la ruta del Layout.

```sh
pnpm test:run && git add -A && git commit -m "feat(app): render the not-found page inside the layout"
```

## Ciclo 7 — La 404 lleva de vuelta al inicio

🔴 (`NotFound.test` o `App.test`):

```jsx
  it('leads back home from the not-found page', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />, { route: '/esto-no-existe' })

    await user.click(screen.getByRole('link', { name: 'Volver al inicio' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Inicio' })).toBeInTheDocument()
  })
```

Rojo: `Unable to find an accessible element with the role "link" and name "Volver al inicio"`. 🟢:

```jsx
import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <>
      <h1>404 — No encontramos esa página</h1>
      <p>Puede que el link esté mal escrito, o que la página ya no exista.</p>
      <Link to="/">Volver al inicio</Link>
    </>
  )
}
```

```sh
pnpm verify && git add -A && git commit -m "feat(not-found): add a link back to the home page"
```

## Verificación manual

- [ ] `pnpm dev`: navegá y mirá cómo cambia `aria-current` en DevTools → *Elements* (buscá el `<a>`).
- [ ] Escribí `/cualquier-cosa` en la barra: aparece la 404 **con** la barra de navegación.
- [ ] En el preview de Vercel repetí la prueba (prueba también el fallback SPA).
- [ ] Sin errores en consola.

## Publicar

```sh
git push -u origin us-03-active-section-and-not-found
gh pr create --fill --base main && gh pr checks --watch
```

Squash merge: `feat: mark the active section and add a not-found page (US-03)`.

## Commits sugeridos

```
docs: add US-03 active section and not found story
feat(layout): mark the current section in the navigation
fix(layout): mark home only on the exact route
test(layout): follow the mark through navigation
feat(layout): keep services marked on a service detail
feat(app): show a not-found page for unknown addresses
feat(app): render the not-found page inside the layout
feat(not-found): add a link back to the home page
```

## Definition of Done

- [ ] Todos los escenarios pasan como tests.
- [ ] `pnpm verify` y el pipeline en verde; verificación manual en el preview.
- [ ] Commits convencionales.

## Qué aprendiste

- Un test puede revelar un bug sutil (`/` coincide con todo) antes de que lo vea una persona.
- Cuando una herramienta deja de alcanzar (`NavLink`), el refactor guiado por tests es seguro.
- Empezar "mal a propósito" (404 afuera del layout) y dejar que el siguiente test lo corrija es
  TDD de verdad.
