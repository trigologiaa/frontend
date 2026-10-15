# Instructivo US-12: CartWidget en la barra de navegación (JavaScript)

Guía para implementar [US-12](../user-stories/us-12-cart-widget-in-navbar.md) con el
[flujo](00-workflow.md). Es el momento en que el **estado global** se nota: agregás en el detalle y
el número del navbar cambia sin recargar.
Formato de los pasos: [Formato de los instructivos](00-workflow.md#formato-de-los-instructivos).

## Qué vas a construir

Un `CartWidget` (ícono + número) que lee `totalQuantity` de `useCart()`, vive dentro de un link a
`/carrito` (con la marca de sección activa de US-03) y reemplaza el link de texto "Carrito".

> **Concepto — por qué se actualiza solo:** `CartWidget` llama `useCart()`, o sea que está
> *suscripto* al Context. Cuando `CartProvider` cambia `items`, React vuelve a dibujar a todos los
> consumidores. No hay que "avisarle" al navbar.
>
> **Concepto — nombre accesible:** el número suelto ("3") no dice nada a un lector de pantalla. El
> link necesita un nombre que lo explique: "Carrito, 3 artículos". Se arma con `aria-label` y se
> pluraliza con i18next.

## Mapa de archivos

| Ciclo | Archivo | Acción |
| ----- | ------- | ------ |
| 0 | `test/renderWithProviders.jsx` | editar (opción `cart` para inyectar un carrito falso) |
| 0, S | `test/styles/components.test.js` | editar (lista `pending`) |
| 1–6 | `test/features/cart/components/CartWidget.test.jsx` | **crear** en el ciclo 1, editar después |
| 1–6 | `src/features/cart/components/CartWidget.jsx` | **crear** en el ciclo 1, editar después |
| 5 | `src/layout/NavItem.jsx` | editar (pasa props extra al `Link`) |
| 5–6 | `src/i18n/locales/es.json`, `src/i18n/locales/en.json` | editar (`cart.widget.label_one/_other`) |
| 7–8 | `test/layout/NavBar.test.jsx` | editar |
| 7 | `src/layout/NavBar.jsx` | editar |
| 9 | `test/App.test.jsx` | editar |
| S | `src/features/cart/components/CartWidget.module.css` | **crear** |
| S | `src/layout/NavItem.module.css` | editar |

## Paso 0: Preparar

```sh
git switch main && git pull
git switch -c us-12-cart-widget-in-navbar
pnpm verify
cp <ruta-a>/javascript/user-stories/us-12-cart-widget-in-navbar.md docs/
git add docs && git commit -m "docs: add US-12 cart widget in navbar story"
```

### Infraestructura de tests: un carrito falso inyectable

Para probar "el widget muestra 5" sin agregar cinco productos a mano, `renderWithProviders` acepta
una opción `cart`.

**Archivo:** `test/renderWithProviders.jsx`
**Dónde:** reemplazá el archivo entero. El `CartContext.Provider` falso va **dentro** del real y lo
pisa solo cuando se pasa `cart`.

```jsx
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { CartContext, CartProvider } from "../src/features/cart/context/CartContext";
import { i18n } from "../src/i18n";

const defaultCart = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
};

export function renderWithProviders(ui, { route = "/", cart } = {}) {
  const tree = cart ? (
    <CartContext.Provider value={{ ...defaultCart, ...cart }}>{ui}</CartContext.Provider>
  ) : (
    ui
  );
  return render(
    <I18nextProvider i18n={i18n}>
      <CartProvider>
        <MemoryRouter initialEntries={[route]}>{tree}</MemoryRouter>
      </CartProvider>
    </I18nextProvider>
  );
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

```sh
git add -A && git commit -m "chore(test): allow injecting a fake cart"
```

### Registrar el componente nuevo como "sin estilos todavía"

**Archivo:** `test/styles/components.test.js`
**Dónde:** el array `pending`. Agregá esta ruta **al final** del array:

```js
  "src/features/cart/components/CartWidget.jsx",
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

```sh
git add -A && git commit -m "test: register the cart widget as pending styles"
```

---

## Ciclo 1 — El widget es un link al carrito

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/components/CartWidget.test.jsx` (**crealo**; la carpeta
`test/features/cart/components/` es nueva).
**Dónde:** el archivo entero.

```jsx
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CartWidget } from "../../../../src/features/cart/components/CartWidget";
import { renderWithProviders } from "../../../renderWithProviders";

describe("CartWidget", () => {
  it("is a link to the cart page", () => {
    renderWithProviders(<CartWidget />);
    expect(screen.getByRole("link", { name: "Carrito" })).toHaveAttribute("href", "/carrito");
  });
});
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Failed to resolve import "../../../../src/features/cart/components/CartWidget"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/components/CartWidget.jsx` (**crealo**; la carpeta
`src/features/cart/components/` es nueva).
**Dónde:** el archivo entero.

```jsx
import { useTranslation } from "react-i18next";
import { NavItem } from "../../../layout/NavItem";

export function CartWidget() {
	const { t } = useTranslation();
	return (
		<NavItem to="/carrito">
			<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24">
				<path
					d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.5L20 8H6.2"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				/>
				<circle cx="9" cy="20" r="1.5" />
				<circle cx="17" cy="20" r="1.5" />
			</svg>
			<span>{t("nav.cart")}</span>
		</NavItem>
	);
}
```

> Un `<svg>` inline es una imagen escrita como código. `aria-hidden="true"` la oculta a los lectores
> de pantalla (es decorativa: el nombre lo da el texto).

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): add the cart widget link"
```

---

## Ciclo 2 — El número muestra la cantidad total

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/components/CartWidget.test.jsx`
**Dónde:** dentro del `describe("CartWidget", ...)`, después del test del ciclo 1.

```jsx
  it("shows the total quantity of the cart", () => {
    renderWithProviders(<CartWidget />, { cart: { totalQuantity: 5 } });
    expect(screen.getByText("5")).toBeInTheDocument();
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an element with the text: 5
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/components/CartWidget.jsx`

1. **Dónde (imports):** agregá, debajo del import de `NavItem`:

   ```jsx
   import { useCart } from "../context/useCart";
   ```

2. **Dónde (primera línea del cuerpo, después de `useTranslation`):**

   ```jsx
   const { totalQuantity } = useCart();
   ```

3. **Dónde (dentro del `NavItem`, después del `<span>` del texto):**

   ```jsx
   <span>{totalQuantity}</span>
   ```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): show the cart quantity in the widget"
```

---

## Ciclo 3 — Carrito vacío: sin número

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/components/CartWidget.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 2.

```jsx
  it("shows no number when the cart is empty", () => {
    renderWithProviders(<CartWidget />);
    expect(screen.getByRole("link", { name: "Carrito" })).toHaveTextContent(/^Carrito$/);
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Expected element to have text content: /^Carrito$/
Received: Carrito0
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/components/CartWidget.jsx`
**Dónde:** reemplazá `<span>{totalQuantity}</span>` por:

```jsx
{totalQuantity > 0 && <span>{totalQuantity}</span>}
```

(`> 0` y no `totalQuantity &&`: con `0` React dibujaría el `0`.)

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): hide the widget number when the cart is empty"
```

---

## Ciclo 4 — Se actualiza en tiempo real

Este ciclo **no cambia código productivo**: es una integración con el `CartProvider` **real** (el
detalle sirve de botón). Es la prueba de que el Context funciona de punta a punta.

### 1. Test (pasa de entrada)

**Archivo:** `test/features/cart/components/CartWidget.test.jsx`

1. **Dónde (imports):** agregá, junto a los demás:

   ```jsx
   import userEvent from "@testing-library/user-event";
   import { ItemDetail } from "../../../../src/features/products/components/ItemDetail";
   import { makeProduct } from "../../../handlers";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 3.

   ```jsx
     it("updates when a service is added, without reloading", async () => {
       const user = userEvent.setup();
       renderWithProviders(
         <>
           <CartWidget />
           <ItemDetail product={makeProduct(1)} />
         </>,
       );
       await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
       await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
       expect(screen.getByRole("link", { name: /Carrito/ })).toHaveTextContent("2");
     });
   ```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

1. En `src/features/cart/context/CartContext.jsx` cambiá las dependencias del `useMemo`
   `[items]` por `[]`.
2. **Corré** `pnpm test:run`. **Rojo esperado:** el widget no se actualiza
   (`Expected element to have text content: 2`).
3. **Restaurá** `[items]` y corré de nuevo: verde.

### 3. Commit

```sh
git add -A && git commit -m "test(cart): update the widget when a service is added"
```

---

## Ciclo 5 — Nombre accesible con la cuenta (y plural)

### 1. Agregar los textos en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** clave nueva de primer nivel, después de `"detail"` (cuidá la coma).

```json
"cart": {
	"widget": {
		"label_one": "Carrito, {{count}} artículo",
		"label_other": "Carrito, {{count}} artículos"
	}
},
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"cart": {
	"widget": {
		"label_one": "Cart, {{count}} item",
		"label_other": "Cart, {{count}} items"
	}
},
```

> i18next elige `_one` u `_other` según `count` y el idioma.

### 2. 🔴 Escribir el test

**Archivo:** `test/features/cart/components/CartWidget.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 4.

```jsx
  it.each([
    [1, "Carrito, 1 artículo"],
    [3, "Carrito, 3 artículos"],
  ])("names the link with the count when the cart has %s units", (totalQuantity, name) => {
    renderWithProviders(<CartWidget />, { cart: { totalQuantity } });
    expect(screen.getByRole("link", { name })).toBeInTheDocument();
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado** (en los dos casos):

```
Unable to find an accessible element with the role "link" and name "Carrito, 1 artículo"
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/layout/NavItem.jsx`
**Dónde:** reemplazá el archivo entero (acepta props extra y se las pasa al `Link`).

```jsx
import { Link, matchPath, useLocation } from "react-router-dom";
import styles from "./NavItem.module.css";

export function NavItem({ to, activeFor = [], children, ...rest }) {
	const { pathname } = useLocation();
	const isActive = [to, ...activeFor].some((path) =>
		matchPath({ path, end: true }, pathname),
	);
	return (
		<Link
			to={to}
			aria-current={isActive ? "page" : undefined}
			className={styles.link}
			{...rest}
		>
			{children}
		</Link>
	);
}
```

**Archivo:** `src/features/cart/components/CartWidget.jsx`
**Dónde:** reemplazá el archivo entero (calcula el `label` y se lo pasa al `NavItem`).

```jsx
import { useTranslation } from "react-i18next";
import { NavItem } from "../../../layout/NavItem";
import { useCart } from "../context/useCart";

export function CartWidget() {
	const { t } = useTranslation();
	const { totalQuantity } = useCart();
	const label =
		totalQuantity > 0
			? t("cart.widget.label", { count: totalQuantity })
			: t("nav.cart");
	return (
		<NavItem to="/carrito" aria-label={label}>
			<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24">
				<path
					d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.5L20 8H6.2"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				/>
				<circle cx="9" cy="20" r="1.5" />
				<circle cx="17" cy="20" r="1.5" />
			</svg>
			<span>{t("nav.cart")}</span>
			{totalQuantity > 0 && <span>{totalQuantity}</span>}
		</NavItem>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde (incluidos los tests de `NavItem` y
`NavBar`, y la paridad de catálogos).

### 4. Commit

```sh
git add -A && git commit -m "feat(cart): name the cart link with the item count"
```

---

## Ciclo 6 — Inglés

Este ciclo **no cambia código productivo**: protege los textos en inglés.

### 1. Test (pasa de entrada)

**Archivo:** `test/features/cart/components/CartWidget.test.jsx`

1. **Dónde (imports):** agregá, junto a los demás:

   ```jsx
   import { i18n } from "../../../../src/i18n";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 5.

   ```jsx
     it("translates the link name", async () => {
       await i18n.changeLanguage("en");
       renderWithProviders(<CartWidget />, { cart: { totalQuantity: 1 } });
       expect(screen.getByRole("link", { name: "Cart, 1 item" })).toBeInTheDocument();
     });
   ```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

En `src/i18n/locales/en.json` cambiá `"label_one": "Cart, {{count}} item"` por otro texto → **rojo**;
restaurá → verde.

### 3. Commit

```sh
git add -A && git commit -m "test(cart): translate the widget label"
```

---

## Ciclo 7 — El navbar usa el widget

### 1. 🔴 Escribir el test

**Archivo:** `test/layout/NavBar.test.jsx`
**Dónde:** dentro del `describe("NavBar", ...)`, después del último test.

```jsx
  it("shows the cart widget with the quantity", () => {
    renderWithProviders(<NavBar />, { cart: { totalQuantity: 2 } });
    expect(screen.getByRole("link", { name: "Carrito, 2 artículos" })).toHaveAttribute("href", "/carrito");
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an accessible element with the role "link" and name "Carrito, 2 artículos"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/layout/NavBar.jsx`
**Dónde:** reemplazá el archivo entero (el `<NavItem to="/carrito">` de texto pasa a `<CartWidget />`).

```jsx
import { useTranslation } from "react-i18next";
import { CartWidget } from "../features/cart/components/CartWidget";
import styles from "./NavBar.module.css";
import { NavItem } from "./NavItem";

export function NavBar() {
	const { t } = useTranslation();
	return (
		<nav aria-label={t("nav.label")} className={styles.nav}>
			<NavItem to="/">{t("nav.home")}</NavItem>
			<NavItem to="/servicios" activeFor={["/servicio/:id"]}>
				{t("nav.services")}
			</NavItem>
			<CartWidget />
		</nav>
	);
}
```

**Corré:** `pnpm verify`. **Resultado esperado:** todo verde. Los tests de US-02 y US-03 que buscan el
link "Carrito" siguen pasando porque con el carrito vacío el nombre es exactamente "Carrito". Si
alguno buscaba un nombre exacto con unidades, ajustalo en este mismo commit.

### 3. Commit

```sh
git add -A && git commit -m "feat(layout): use the cart widget in the navigation"
```

---

## Ciclo 8 — "Carrito" sigue marcado en `/carrito`

Este ciclo **no cambia código productivo**: el widget está construido sobre `NavItem`.

### 1. Test (pasa de entrada)

**Archivo:** `test/layout/NavBar.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 7.

```jsx
  it("keeps the cart marked on the cart page", () => {
    renderWithProviders(<NavBar />, { route: "/carrito" });
    expect(screen.getByRole("link", { name: "Carrito" })).toHaveAttribute("aria-current", "page");
  });
```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

1. En `src/features/cart/components/CartWidget.jsx` reemplazá `<NavItem to="/carrito" aria-label={label}>`
   por un `<Link to="/carrito" aria-label={label}>` (con su import de `react-router-dom`) y el cierre
   `</NavItem>` por `</Link>`.
2. **Corré** `pnpm test:run`. **Rojo esperado:** `Expected the element to have attribute: aria-current="page"`.
3. **Restaurá** el `NavItem` y corré de nuevo: verde.

### 3. Commit

```sh
git add -A && git commit -m "test(layout): keep the cart marked on the cart page"
```

---

## Ciclo 9 — El carrito se acumula entre páginas

Este ciclo **no cambia código productivo**: es el recorrido real, en una sola prueba larga a
propósito.

### 1. Test (pasa de entrada)

**Archivo:** `test/App.test.jsx`
**Dónde:** dentro del `describe("App routes", ...)`, después del test
`"goes from the catalog to the detail of a service"` (US-09). `userEvent`, `server`,
`productsHandler` y `makeProduct` ya están importados.

```jsx
  it("keeps the cart across pages", async () => {
    const user = userEvent.setup();
    server.use(productsHandler([makeProduct(1), makeProduct(2)]));
    renderWithProviders(<App />, { route: "/servicio/service-1" });
    await user.click(await screen.findByRole("button", { name: "Aumentar cantidad" }));
    await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    await user.click(screen.getByRole("link", { name: "Servicios" }));
    await user.click(await screen.findByRole("link", { name: /Ver detalle.*Servicio 2/ }));
    await user.click(await screen.findByRole("button", { name: "Agregar al carrito" }));
    expect(screen.getByRole("link", { name: "Carrito, 3 artículos" })).toBeInTheDocument();
  });
```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada (2 + 1 = 3).

### 2. Mutación

1. En `src/features/services/pages/ItemDetailContainer.jsx`, en el `return` final, envolvé el detalle
   en su propio `<CartProvider>` (con `import { CartProvider } from "../../cart/context/CartContext";`):
   `<CartProvider><ItemDetail product={product} /></CartProvider>`.
2. **Corré** `pnpm test:run`. **Rojo esperado:** el estado no sobrevive a la navegación
   (`Unable to find an accessible element ... name "Carrito, 3 artículos"`).
3. **Restaurá** y corré de nuevo: verde.

### 3. Commit

```sh
git add -A && git commit -m "test(app): keep the cart across pages"
```

---

## Ciclo de estilo — el widget del carrito

Mismo **ciclo de estilo** que en el [workflow](00-workflow.md#2b-el-css-se-escribe-junto-con-cada-story-y-se-testea-así).

### 1. 🔴 Test

**Archivo:** `test/styles/components.test.js`
**Dónde:** el array `pending`. Borrá esta línea:

```js
  "src/features/cart/components/CartWidget.jsx",
```

**Corré:** `pnpm test:run`. **Rojo esperado:** el test nombra `CartWidget.jsx` sin módulo.

### 2. 🟢 Código

**Archivo:** `src/features/cart/components/CartWidget.module.css` (**crealo**).
**Dónde:** el archivo entero.

```css
.icon {
	flex-shrink: 0;
}

.label {
	white-space: nowrap;
}

.count {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 1.5rem;
	height: 1.5rem;
	padding: 0 var(--space-2);
	font-size: 0.875rem;
	font-weight: 700;
	color: var(--color-primary-contrast);
	background: var(--color-primary);
	border-radius: 999px;
}
```

**Archivo:** `src/features/cart/components/CartWidget.jsx`
**Dónde:** reemplazá el archivo entero (`styles.icon` al `svg`, `styles.label` al texto y
`styles.count` al número).

```jsx
import { useTranslation } from "react-i18next";
import { NavItem } from "../../../layout/NavItem";
import { useCart } from "../context/useCart";
import styles from "./CartWidget.module.css";

export function CartWidget() {
	const { t } = useTranslation();
	const { totalQuantity } = useCart();
	const label =
		totalQuantity > 0
			? t("cart.widget.label", { count: totalQuantity })
			: t("nav.cart");
	return (
		<NavItem to="/carrito" aria-label={label}>
			<svg
				className={styles.icon}
				aria-hidden="true"
				focusable="false"
				width="20"
				height="20"
				viewBox="0 0 24 24"
			>
				<path
					d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.5L20 8H6.2"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				/>
				<circle cx="9" cy="20" r="1.5" />
				<circle cx="17" cy="20" r="1.5" />
			</svg>
			<span className={styles.label}>{t("nav.cart")}</span>
			{totalQuantity > 0 && <span className={styles.count}>{totalQuantity}</span>}
		</NavItem>
	);
}
```

El `Link` del widget es un `NavItem`, así que ya tiene la altura táctil y la marca de sección activa.
Solo falta separar ícono, texto y número.

**Archivo:** `src/layout/NavItem.module.css`
**Dónde:** dentro de la regla `.link { ... }`, agregá una línea (por ejemplo, después de
`align-items: center;`):

```css
	gap: var(--space-2);
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde (incluido `NavItem.styles.test.js`).

### 3. 🔵 Mirar el navegador

El ícono toma el color del texto (`stroke="currentColor"` en el SVG: cambia con el tema y con el
estado activo sin tocar nada). Agregá productos desde el detalle y mirá cómo crece el número: con dos
dígitos (10, 99) la *pill* no se tiene que deformar. Con el carrito vacío no aparece (ciclo 3).

### 4. Commit

```sh
git add -A && git commit -m "style(cart): style the cart widget"
```

---

## Verificación manual

- [ ] `pnpm dev`: agregá servicios y mirá el número subir sin recargar.
- [ ] Navegá entre páginas: el número se mantiene. Recargá: vuelve a 0 (**esperado** en esta fase:
      no hay persistencia; queda documentado en el README).
- [ ] 360 px: el ícono y el número no se superponen con otros links.
- [ ] Lector de pantalla o DevTools → *Accessibility* → el link se llama "Carrito, N artículos".
- [ ] Sin errores en consola.
- [ ] El widget a 360 y 1280 px, con 0, 1 y 99 artículos; en `/carrito` sigue marcado como sección activa.

## Publicar

```sh
git push -u origin us-12-cart-widget-in-navbar
gh pr create --fill --base main && gh pr checks --watch
```

Squash merge: `feat: add the cart widget to the navigation bar (US-12)`.

## Commits sugeridos

```
docs: add US-12 cart widget in navbar story
chore(test): allow injecting a fake cart
test: register the cart widget as pending styles
feat(cart): add the cart widget link
feat(cart): show the cart quantity in the widget
feat(cart): hide the widget number when the cart is empty
test(cart): update the widget when a service is added
feat(cart): name the cart link with the item count
test(cart): translate the widget label
feat(layout): use the cart widget in the navigation
test(layout): keep the cart marked on the cart page
test(app): keep the cart across pages
style(cart): style the cart widget
```

## Definition of Done

- [ ] Todos los escenarios pasan como tests; los tests de US-02/US-03 siguen pasando.
- [ ] `pnpm verify` y el pipeline en verde; verificación manual hecha.
- [ ] Commits convencionales.
- [ ] `CartWidget` tiene su `.module.css` y salió de `pending`.

## Qué aprendiste

- Suscripción a un Context = actualización automática de todos los consumidores.
- Plurales con i18next (`_one` / `_other`).
- Inyectar un valor falso de Context en tests vs usar el provider real: cuándo cada uno.
- Probar un recorrido largo con una sola prueba de integración.
