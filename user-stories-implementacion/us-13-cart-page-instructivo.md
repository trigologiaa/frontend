# Instructivo US-13: página del carrito (JavaScript)

Guía para implementar [US-13](../user-stories/us-13-cart-page.md) con el [flujo](00-workflow.md).
Es el requerimiento 4.4 de la consigna: `/carrito` muestra el detalle **leyendo directo del
`CartContext`**.
Formato de los pasos: [Formato de los instructivos](00-workflow.md#formato-de-los-instructivos).

## Qué vas a construir

```
CartPage      (contenedor: useCart(); decide vacío / lista; total; "Vaciar")
   └─ CartItem (presentacional: UN ítem del carrito + botón "Quitar")
```

> **Concepto — la página no pide datos:** todo lo que necesita (título, precio, imagen, cantidad) ya
> está en el carrito porque guardamos una *foto* del producto (US-10). Por eso no hay `fetch` acá,
> y por eso el carrito sigue funcionando si después se borra o cambia un servicio del catálogo.
>
> **Concepto — valores derivados:** el subtotal de una línea (`price × quantity`) y el total
> **se calculan** al dibujar; no se guardan.

> **Carpetas reales de este proyecto:** la página `CartPage` **ya existe** (provisoria, desde US-02)
> en `src/features/cart/pages/CartPage.jsx`: **se edita ahí**. El link "Ver servicios" del estado
> vacío apunta a `/productos`. El título de la página sigue siendo la clave que ya existe: `nav.cart`.

## Mapa de archivos

| Ciclo | Archivo | Acción |
| ----- | ------- | ------ |
| 0, S1, S2 | `test/styles/components.test.js` | editar (lista `pending`) |
| 0 | `test/features/cart/context/CartContext.test.jsx` | editar (ya existe, de US-10) |
| 0 | `src/features/cart/context/CartContext.jsx` | editar (`initialItems`) |
| 0 | `test/renderWithProviders.jsx` | editar (opción `initialCart`) |
| 1–13 | `src/i18n/locales/es.json`, `src/i18n/locales/en.json` | editar (claves `cart.*`) |
| 1–5 | `test/features/cart/components/CartItem.test.jsx` | **crear** en el ciclo 1, editar después |
| 1–4 | `src/features/cart/components/CartItem.jsx` | **crear** en el ciclo 1, editar después |
| 6–13 | `test/features/cart/pages/CartPage.test.jsx` | **crear** en el ciclo 6, editar después |
| 6–11 | `src/features/cart/pages/CartPage.jsx` | editar (era provisoria) |
| 12 | `test/App.test.jsx` | editar |
| 13 (opcional) | `src/shared/useLanguage.js` | **crear** |
| S1 | `src/features/cart/components/CartItem.module.css` | **crear** |
| S2 | `src/features/cart/pages/CartPage.module.css` | **crear** |

Claves de catálogo nuevas (todas dentro de `"cart"`, que ya existe desde US-12; se agregan una o dos
por ciclo, justo antes del ciclo que las usa): `cart.quantity`, `cart.unitPrice`, `cart.subtotal`,
`cart.remove`, `cart.empty`, `cart.browse`, `cart.total`, `cart.clear`.

## Paso 0: Preparar

```sh
git switch main && git pull
git switch -c us-13-cart-page
pnpm verify
cp <ruta-a>/javascript/user-stories/us-13-cart-page.md docs/
git add docs && git commit -m "docs: add US-13 cart page story"
```

### Registrar el componente nuevo como "sin estilos todavía"

**Archivo:** `test/styles/components.test.js`
**Dónde:** el array `pending`. Agregá esta ruta **al final** del array:

```js
  "src/features/cart/components/CartItem.jsx",
```

(`CartPage.jsx` ya está en la lista desde US-05.)

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

```sh
git add -A && git commit -m "test: register the cart item as pending styles"
```

---

## Ciclo 0 — El provider acepta ítems iniciales (para poder sembrar tests)

Los tests de esta story necesitan un carrito **real** que ya tenga productos. En vez de repetir
"agregar productos" en cada test, el provider acepta un estado inicial (algo que además te sirve si
algún día persistís el carrito).

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/context/CartContext.test.jsx` (ya existe, de US-10).
**Dónde:** dentro del `describe("CartProvider", ...)`, después del último test.

```jsx
  it("starts with the initial items when they are provided", () => {
    const initialItems = [
      { id: "product-1", title: makeProduct(1).title, price: 100, image: "", quantity: 2 },
    ];
    render(
      <CartProvider initialItems={initialItems}>
        <Probe />
      </CartProvider>,
    );
    expect(screen.getByText("quantity: 2")).toBeInTheDocument();
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an element with the text: quantity: 2
```

(el provider ignora `initialItems` y muestra `quantity: 0`).

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/context/CartContext.jsx`
**Dónde:** en `CartProvider`: el parámetro `initialItems` y el segundo argumento de `useReducer`.

```jsx
export function CartProvider({ children, initialItems = [] }) {
	const [items, dispatch] = useReducer(cartReducer, initialItems);
```

**Archivo:** `test/renderWithProviders.jsx`
**Dónde:** reemplazá el archivo entero (opción nueva `initialCart`, que se pasa a
`<CartProvider initialItems={...}>`).

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

export function renderWithProviders(ui, { route = "/", cart, initialCart } = {}) {
  const tree = cart ? (
    <CartContext.Provider value={{ ...defaultCart, ...cart }}>{ui}</CartContext.Provider>
  ) : (
    ui
  );
  return render(
    <I18nextProvider i18n={i18n}>
      <CartProvider initialItems={initialCart}>
        <MemoryRouter initialEntries={[route]}>{tree}</MemoryRouter>
      </CartProvider>
    </I18nextProvider>
  );
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): accept initial items in the provider"
```

---

## Ciclo 1 — `CartItem` muestra título e imagen

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/components/CartItem.test.jsx` (**crealo**).
**Dónde:** el archivo entero.

```jsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CartItem } from "../../../../src/features/cart/components/CartItem";
import { makeProduct } from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";

const { id, title, image } = makeProduct(1);
const item = { id, title, image, price: 350, quantity: 2 };

describe("CartItem", () => {
  it("shows the title and the image of the service", () => {
    renderWithProviders(<CartItem item={item} onRemove={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Servicio 1" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Servicio 1" })).toHaveAttribute("src", "/images/product-1.svg");
  });
});
```

(`userEvent` todavía no se usa: lo vas a necesitar en el ciclo 4.)

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Failed to resolve import "../../../../src/features/cart/components/CartItem"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/components/CartItem.jsx` (**crealo**).
**Dónde:** el archivo entero.

```jsx
import { useTranslation } from "react-i18next";
import { localized } from "../../../shared/localized";

export function CartItem({ item }) {
	const { i18n } = useTranslation();
	const title = localized(item.title, i18n.resolvedLanguage);
	return (
		<article>
			<img src={item.image} alt={title} width="80" height="60" />
			<h3>{title}</h3>
		</article>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): add the cart item with its title and image"
```

---

## Ciclo 2 — Cantidad

### 1. Agregar el texto en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"cart"`, **antes** de `"widget"` (cuidá la coma).

```json
"quantity": "Cantidad",
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"quantity": "Quantity",
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/cart/components/CartItem.test.jsx`
**Dónde:** dentro del `describe("CartItem", ...)`, después del test del ciclo 1.

```jsx
  it("shows the quantity", () => {
    renderWithProviders(<CartItem item={item} onRemove={vi.fn()} />);
    expect(screen.getByText(/Cantidad/)).toHaveTextContent("Cantidad: 2");
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an element with the text: /Cantidad/
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/components/CartItem.jsx`
**Dónde:** reemplazá el archivo entero (ahora también usa `t`).

```jsx
import { useTranslation } from "react-i18next";
import { localized } from "../../../shared/localized";

export function CartItem({ item }) {
	const { t, i18n } = useTranslation();
	const title = localized(item.title, i18n.resolvedLanguage);
	return (
		<article>
			<img src={item.image} alt={title} width="80" height="60" />
			<h3>{title}</h3>
			<p>
				{t("cart.quantity")}: {item.quantity}
			</p>
		</article>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(cart): show the item quantity"
```

---

## Ciclo 3 — Precio unitario y subtotal

### 1. Agregar los textos en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"cart"`, después de `"quantity"`.

```json
"unitPrice": "Precio",
"subtotal": "Subtotal",
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"unitPrice": "Price",
"subtotal": "Subtotal",
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/cart/components/CartItem.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 2.

```jsx
  it("shows the unit price and the subtotal of the line", () => {
    renderWithProviders(<CartItem item={item} onRemove={vi.fn()} />);
    expect(screen.getByText("Precio: US$ 350")).toBeInTheDocument();
    expect(screen.getByText("Subtotal: US$ 700")).toBeInTheDocument();
  });
```

(`getByText` normaliza los espacios duros, por eso el texto con espacio normal coincide.)

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an element with the text: Precio: US$ 350
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/components/CartItem.jsx`
**Dónde:** reemplazá el archivo entero (import de `formatPrice`, variable `language` y dos `<p>`).

```jsx
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";

export function CartItem({ item }) {
	const { t, i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	const title = localized(item.title, language);
	return (
		<article>
			<img src={item.image} alt={title} width="80" height="60" />
			<h3>{title}</h3>
			<p>
				{t("cart.quantity")}: {item.quantity}
			</p>
			<p>
				{t("cart.unitPrice")}: {formatPrice(item.price, language)}
			</p>
			<p>
				{t("cart.subtotal")}: {formatPrice(item.price * item.quantity, language)}
			</p>
		</article>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(cart): show the unit price and the subtotal"
```

---

## Ciclo 4 — "Quitar" avisa con el id

### 1. Agregar el texto en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"cart"`, después de `"subtotal"`.

```json
"remove": "Quitar",
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"remove": "Remove",
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/cart/components/CartItem.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 3.

```jsx
  it("asks to remove the item with a button named after the service", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    renderWithProviders(<CartItem item={item} onRemove={onRemove} />);
    await user.click(screen.getByRole("button", { name: "Quitar Servicio 1" }));
    expect(onRemove).toHaveBeenCalledWith("product-1");
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an accessible element with the role "button" and name "Quitar Servicio 1"
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/components/CartItem.jsx`
**Dónde:** reemplazá el archivo entero (recibe `onRemove` y agrega el botón al final del `article`;
el `aria-label` le agrega el título al nombre, para distinguir un "Quitar" de otro).

```jsx
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";

export function CartItem({ item, onRemove }) {
	const { t, i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	const title = localized(item.title, language);
	return (
		<article>
			<img src={item.image} alt={title} width="80" height="60" />
			<h3>{title}</h3>
			<p>
				{t("cart.quantity")}: {item.quantity}
			</p>
			<p>
				{t("cart.unitPrice")}: {formatPrice(item.price, language)}
			</p>
			<p>
				{t("cart.subtotal")}: {formatPrice(item.price * item.quantity, language)}
			</p>
			<button
				type="button"
				aria-label={`${t("cart.remove")} ${title}`}
				onClick={() => onRemove(item.id)}
			>
				{t("cart.remove")}
			</button>
		</article>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(cart): add the remove button to the cart item"
```

---

## Ciclo 5 — `CartItem` en inglés

Este ciclo **no cambia código productivo**: protege los textos en inglés.

### 1. Test (pasa de entrada)

**Archivo:** `test/features/cart/components/CartItem.test.jsx`

1. **Dónde (imports):** agregá, junto a los demás:

   ```jsx
   import { i18n } from "../../../../src/i18n";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 4. (El título en inglés de
   `makeProduct(1)` es `Service 1`.)

   ```jsx
     it("translates the cart item", async () => {
       await i18n.changeLanguage("en");
       renderWithProviders(<CartItem item={item} onRemove={vi.fn()} />);
       expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
       expect(screen.getByText("Price: $350")).toBeInTheDocument();
       expect(screen.getByText("Subtotal: $700")).toBeInTheDocument();
       expect(screen.getByRole("button", { name: "Remove Service 1" })).toBeInTheDocument();
     });
   ```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

En `src/i18n/locales/en.json` cambiá `"remove": "Remove"` por otro texto → **rojo**; restaurá → verde.

### 3. Commit

```sh
git add -A && git commit -m "test(cart): translate the cart item"
```

---

## Ciclo 6 — Carrito vacío

### 1. Agregar los textos en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"cart"`, después de `"remove"`.

```json
"empty": "Tu carrito está vacío",
"browse": "Ver servicios",
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"empty": "Your cart is empty",
"browse": "See services",
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/cart/pages/CartPage.test.jsx` (**crealo**; la carpeta
`test/features/cart/pages/` es nueva).
**Dónde:** el archivo entero (`line` arma una línea de carrito de prueba; se usa desde el ciclo 7).

```jsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CartPage } from "../../../../src/features/cart/pages/CartPage";
import { makeProduct } from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";

function line(n, quantity = 1) {
  const { id, title, image } = makeProduct(n);
  return { id, title, image, price: 100 * n, quantity };
}

describe("CartPage", () => {
  it("invites to browse the services when the cart is empty", () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver servicios" })).toHaveAttribute("href", "/productos");
  });
});
```

(`userEvent` y `line` todavía no se usan: los vas a necesitar desde el ciclo 7.)

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an element with the text: Tu carrito está vacío
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/pages/CartPage.jsx` (ya existe; hoy solo tiene el `h1`).
**Dónde:** reemplazá el archivo entero.

```jsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useCart } from "../context/useCart";

export function CartPage() {
	const { t } = useTranslation();
	const { items } = useCart();
	if (items.length === 0) {
		return (
			<>
				<h1>{t("nav.cart")}</h1>
				<p>{t("cart.empty")}</p>
				<Link to="/productos">{t("cart.browse")}</Link>
			</>
		);
	}
	return <h1>{t("nav.cart")}</h1>;
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde (el test de `App` de `/carrito` sigue
viendo el `<h1>` "Carrito").

### 4. Commit

```sh
git add -A && git commit -m "feat(cart): show an empty state in the cart page"
```

---

## Ciclo 7 — Lista los servicios agregados

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/pages/CartPage.test.jsx`
**Dónde:** dentro del `describe("CartPage", ...)`, después del test del ciclo 6.

```jsx
  it("lists each service in the cart", () => {
    renderWithProviders(<CartPage />, { initialCart: [line(1), line(2)] });
    expect(screen.getByRole("heading", { name: "Servicio 1" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Servicio 2" })).toBeInTheDocument();
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an accessible element with the role "heading" and name "Servicio 1"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/pages/CartPage.jsx`
**Dónde:** reemplazá el archivo entero (import de `CartItem`; el `return` final lista los ítems con
`removeFromCart` del contexto).

```jsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CartItem } from "../components/CartItem";
import { useCart } from "../context/useCart";

export function CartPage() {
	const { t } = useTranslation();
	const { items, removeFromCart } = useCart();
	if (items.length === 0) {
		return (
			<>
				<h1>{t("nav.cart")}</h1>
				<p>{t("cart.empty")}</p>
				<Link to="/productos">{t("cart.browse")}</Link>
			</>
		);
	}
	return (
		<>
			<h1>{t("nav.cart")}</h1>
			<ul>
				{items.map((item) => (
					<li key={item.id}>
						<CartItem item={item} onRemove={removeFromCart} />
					</li>
				))}
			</ul>
		</>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): list the services in the cart page"
```

---

## Ciclo 8 — Total

### 1. Agregar el texto en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"cart"`, después de `"browse"`.

```json
"total": "Total",
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"total": "Total",
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/cart/pages/CartPage.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 7. (2 × 100 + 1 × 200 = 400.)

```jsx
  it("shows the total of the cart", () => {
    renderWithProviders(<CartPage />, { initialCart: [line(1, 2), line(2, 1)] });
    expect(screen.getByText("Total: US$ 400")).toBeInTheDocument();
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an element with the text: Total: US$ 400
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/pages/CartPage.jsx`
**Dónde:** reemplazá el archivo entero (lee `totalPrice` y el idioma; el total va **después** de la
lista).

```jsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatPrice } from "../../../shared/formatPrice";
import { CartItem } from "../components/CartItem";
import { useCart } from "../context/useCart";

export function CartPage() {
	const { t, i18n } = useTranslation();
	const { items, totalPrice, removeFromCart } = useCart();
	const language = i18n.resolvedLanguage;
	if (items.length === 0) {
		return (
			<>
				<h1>{t("nav.cart")}</h1>
				<p>{t("cart.empty")}</p>
				<Link to="/productos">{t("cart.browse")}</Link>
			</>
		);
	}
	return (
		<>
			<h1>{t("nav.cart")}</h1>
			<ul>
				{items.map((item) => (
					<li key={item.id}>
						<CartItem item={item} onRemove={removeFromCart} />
					</li>
				))}
			</ul>
			<p role="status">
				{t("cart.total")}: {formatPrice(totalPrice, language)}
			</p>
		</>
	);
}
```

> `role="status"` hace que un lector de pantalla anuncie el total cuando cambia (por ejemplo, al
> quitar una línea).

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(cart): show the cart total"
```

---

## Ciclo 9 — Quitar un servicio actualiza la lista y el total

Este ciclo **no cambia código productivo**: todo está cableado desde los ciclos 4 y 7 (carrito
**real** sembrado).

### 1. Test (pasa de entrada)

**Archivo:** `test/features/cart/pages/CartPage.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 8.

```jsx
  it("removes a service and updates the total", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { initialCart: [line(1), line(2)] });
    await user.click(screen.getByRole("button", { name: "Quitar Servicio 1" }));
    expect(screen.queryByRole("heading", { name: "Servicio 1" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Servicio 2" })).toBeInTheDocument();
    expect(screen.getByText("Total: US$ 200")).toBeInTheDocument();
  });
```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

1. En `src/features/cart/pages/CartPage.jsx` cambiá `onRemove={removeFromCart}` por
   `onRemove={() => {}}`.
2. **Corré** `pnpm test:run`. **Rojo esperado:** el heading "Servicio 1" sigue en pantalla.
3. **Restaurá** y corré de nuevo: verde.

### 3. Commit

```sh
git add -A && git commit -m "test(cart): remove a service from the cart page"
```

---

## Ciclo 10 — Quitar el último muestra el estado vacío

Este ciclo **no cambia código productivo**.

### 1. Test (pasa de entrada)

**Archivo:** `test/features/cart/pages/CartPage.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 9.

```jsx
  it("shows the empty state after removing the last service", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { initialCart: [line(1)] });
    await user.click(screen.getByRole("button", { name: "Quitar Servicio 1" }));
    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
  });
```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

Igual que en el ciclo 9 (`onRemove={() => {}}`) → **rojo**; restaurá → verde.

### 3. Commit

```sh
git add -A && git commit -m "test(cart): show the empty state after removing the last service"
```

---

## Ciclo 11 — "Vaciar carrito"

### 1. Agregar el texto en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"cart"`, después de `"total"`.

```json
"clear": "Vaciar carrito",
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"clear": "Clear cart",
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/cart/pages/CartPage.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 10.

```jsx
  it("clears the cart", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { initialCart: [line(1), line(2)] });
    await user.click(screen.getByRole("button", { name: "Vaciar carrito" }));
    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an accessible element with the role "button" and name "Vaciar carrito"
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/pages/CartPage.jsx`
**Dónde:** reemplazá el archivo entero (lee `clearCart`; el botón va **debajo** de la lista, después
del total).

```jsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatPrice } from "../../../shared/formatPrice";
import { CartItem } from "../components/CartItem";
import { useCart } from "../context/useCart";

export function CartPage() {
	const { t, i18n } = useTranslation();
	const { items, totalPrice, removeFromCart, clearCart } = useCart();
	const language = i18n.resolvedLanguage;
	if (items.length === 0) {
		return (
			<>
				<h1>{t("nav.cart")}</h1>
				<p>{t("cart.empty")}</p>
				<Link to="/productos">{t("cart.browse")}</Link>
			</>
		);
	}
	return (
		<>
			<h1>{t("nav.cart")}</h1>
			<ul>
				{items.map((item) => (
					<li key={item.id}>
						<CartItem item={item} onRemove={removeFromCart} />
					</li>
				))}
			</ul>
			<p role="status">
				{t("cart.total")}: {formatPrice(totalPrice, language)}
			</p>
			<button type="button" onClick={clearCart}>
				{t("cart.clear")}
			</button>
		</>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(cart): clear the cart from the cart page"
```

---

## Ciclo 12 — Widget y página coinciden (recorrido real)

Este ciclo **no cambia código productivo**: es el recorrido real de la app.

### 1. Test (pasa de entrada)

**Archivo:** `test/App.test.jsx`
**Dónde:** dentro del `describe("App routes", ...)`, después del test `"keeps the cart across pages"`
(US-12). `userEvent`, `server`, `productsHandler` y `makeProduct` ya están importados.

```jsx
  it("shows in the cart page what was added from the detail", async () => {
    const user = userEvent.setup();
    server.use(productsHandler([makeProduct(1)]));
    renderWithProviders(<App />, { route: "/producto/product-1" });
    await user.click(await screen.findByRole("button", { name: "Aumentar cantidad" }));
    await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    await user.click(screen.getByRole("link", { name: "Carrito, 2 artículos" }));
    expect(screen.getByText(/Cantidad/)).toHaveTextContent("Cantidad: 2");
  });
```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

1. En `src/features/cart/pages/CartPage.jsx` agregá `import { useState } from "react";` y reemplazá
   la línea `const { items, totalPrice, removeFromCart, clearCart } = useCart();` por:

   ```jsx
   const { totalPrice, removeFromCart, clearCart } = useCart();
   const [items] = useState([]);
   ```

2. **Corré** `pnpm test:run`. **Rojo esperado:** este test falla (la página nunca ve lo que se agregó);
   también fallan los de los ciclos 7–11.
3. **Restaurá** y corré de nuevo: verde.

### 3. Commit

```sh
git add -A && git commit -m "test(app): review the cart after adding a service"
```

---

## Ciclo 13 — Inglés

Este ciclo **no cambia código productivo**: protege los textos en inglés.

### 1. Test (pasa de entrada)

**Archivo:** `test/features/cart/pages/CartPage.test.jsx`

1. **Dónde (imports):** agregá, junto a los demás:

   ```jsx
   import { i18n } from "../../../../src/i18n";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 11 (el del ciclo 12 vive en
   `App.test.jsx`).

   ```jsx
     it("translates the empty cart", async () => {
       await i18n.changeLanguage("en");
       renderWithProviders(<CartPage />);
       expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
       expect(screen.getByRole("link", { name: "See services" })).toBeInTheDocument();
     });

     it("translates the cart with services", async () => {
       await i18n.changeLanguage("en");
       renderWithProviders(<CartPage />, { initialCart: [line(1)] });
       expect(screen.getByText("Total: $100")).toBeInTheDocument();
       expect(screen.getByRole("button", { name: "Clear cart" })).toBeInTheDocument();
     });
   ```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

En `src/i18n/locales/en.json` cambiá `"clear": "Clear cart"` por otro texto → **rojo**; restaurá → verde.

### 3. Commit

```sh
git add -A && git commit -m "test(cart): translate the cart page"
```

### 4. 🔵 Refactor opcional: `useLanguage`

`Item`, `ItemDetail`, `CartItem` y `CartPage` repiten `const language = i18n.resolvedLanguage;`: ya
son **cuatro** lugares (regla de tres). Con los tests en verde:

**Archivo:** `src/shared/useLanguage.js` (**crealo**).
**Dónde:** el archivo entero.

```js
import { useTranslation } from "react-i18next";

export function useLanguage() {
	const { i18n } = useTranslation();
	return i18n.resolvedLanguage;
}
```

**Archivos:** `src/features/products/components/Item.jsx`,
`src/features/products/components/ItemDetail.jsx`, `src/features/cart/components/CartItem.jsx` y
`src/features/cart/pages/CartPage.jsx`.
**Dónde:** en cada uno, importá `useLanguage` (`import { useLanguage } from "../../../shared/useLanguage";`),
cambiá `const { t, i18n } = useTranslation();` por `const { t } = useTranslation();` y
`const language = i18n.resolvedLanguage;` por `const language = useLanguage();`. En `CartItem` y
`ItemDetail`, el título sigue usando `language`. (En `Item`, `ItemDetail` y `CartItem` el import es
`../../../shared/useLanguage`; en `CartPage` también.)

**Corré** `pnpm test:run` después de **cada** archivo: todo verde. Si algo se pone rojo,
`git restore .` y volvé a intentar con un paso más chico. Al final, `pnpm verify`.

```sh
git add -A && git commit -m "refactor(shared): extract a useLanguage hook"
```

---

## Ciclos de estilo — el carrito

Mismo **ciclo de estilo** que en el [workflow](00-workflow.md#2b-el-css-se-escribe-junto-con-cada-story-y-se-testea-así).

### Ciclo S1 — Cada línea del carrito

**1. 🔴 Test.** **Archivo:** `test/styles/components.test.js`
**Dónde:** el array `pending`. Borrá esta línea:

```js
  "src/features/cart/components/CartItem.jsx",
```

**Corré:** `pnpm test:run`. **Rojo esperado:** el test nombra `CartItem.jsx` sin módulo.

**2. 🟢 Código.**

**Archivo:** `src/features/cart/components/CartItem.module.css` (**crealo**).
**Dónde:** el archivo entero.

```css
.item {
	display: grid;
	grid-template-columns: 5rem 1fr;
	gap: var(--space-2) var(--space-4);
	align-items: start;
	padding: var(--space-4);
	background: var(--color-background);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
}

.image {
	width: 5rem;
	aspect-ratio: 4 / 3;
	object-fit: cover;
	border-radius: var(--radius);
}

.info {
	display: flex;
	flex-direction: column;
	gap: var(--space-1);
}

.title {
	margin: 0;
	font-size: var(--font-size-lg);
}

.detail {
	margin: 0;
	color: var(--color-muted);
}

.subtotal {
	margin: 0;
	font-weight: 700;
}

.remove {
	grid-column: 1 / -1;
	justify-self: start;
	min-height: 2.75rem;
	padding: 0 var(--space-4);
	font: inherit;
	color: var(--color-danger);
	background: transparent;
	border: 1px solid var(--color-danger);
	border-radius: var(--radius);
	cursor: pointer;
}

@media (min-width: 48rem) {
	.item {
		grid-template-columns: 5rem 1fr auto;
		align-items: center;
	}

	.remove {
		grid-column: auto;
	}
}
```

**Archivo:** `src/features/cart/components/CartItem.jsx`
**Dónde:** reemplazá el archivo entero (los datos de texto van dentro de `div.info`, entre la imagen
y el botón).

```jsx
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";
import styles from "./CartItem.module.css";

export function CartItem({ item, onRemove }) {
	const { t, i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	const title = localized(item.title, language);
	return (
		<article className={styles.item}>
			<img className={styles.image} src={item.image} alt={title} width="80" height="60" />
			<div className={styles.info}>
				<h3 className={styles.title}>{title}</h3>
				<p className={styles.detail}>
					{t("cart.quantity")}: {item.quantity}
				</p>
				<p className={styles.detail}>
					{t("cart.unitPrice")}: {formatPrice(item.price, language)}
				</p>
				<p className={styles.subtotal}>
					{t("cart.subtotal")}: {formatPrice(item.price * item.quantity, language)}
				</p>
			</div>
			<button
				className={styles.remove}
				type="button"
				aria-label={`${t("cart.remove")} ${title}`}
				onClick={() => onRemove(item.id)}
			>
				{t("cart.remove")}
			</button>
		</article>
	);
}
```

> Si hiciste el refactor opcional de `useLanguage`, mantené `const language = useLanguage();` en lugar
> de `i18n.resolvedLanguage`: solo se agregan las clases.

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

**3. 🔵 Mirar el navegador** (`pnpm dev`, agregá un servicio y abrí el carrito). A 360 px la foto
queda a la izquierda con los datos al lado y "Quitar" debajo; a 1280 px es una fila: foto, datos y
botón. El botón "Quitar" mide al menos 44 px de alto y se distingue de las acciones normales sin
depender solo del color (tiene borde y texto).

**4. Commit**

```sh
git add -A && git commit -m "style(cart): style the cart item"
```

### Ciclo S2 — La página del carrito (con datos y vacía)

**1. 🔴 Test.** **Archivo:** `test/styles/components.test.js`
**Dónde:** el array `pending`. Borrá la última línea que queda; el array termina vacío:

```js
const pending = [];
```

(La línea a borrar es `"src/features/cart/pages/CartPage.jsx",`.)

**Corré:** `pnpm test:run`. **Rojo esperado:** el test nombra `CartPage.jsx` sin módulo.

**2. 🟢 Código.**

**Archivo:** `src/features/cart/pages/CartPage.module.css` (**crealo**).
**Dónde:** el archivo entero.

```css
.page {
	display: flex;
	flex-direction: column;
	gap: var(--space-4);
}

.title {
	margin: 0;
	font-size: var(--font-size-xl);
}

.list {
	display: flex;
	flex-direction: column;
	gap: var(--space-3);
	margin: 0;
	padding: 0;
	list-style: none;
}

.summary {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: var(--space-4);
	padding: var(--space-4);
	background: var(--color-surface);
	border-radius: var(--radius);
}

.total {
	margin: 0;
	font-size: var(--font-size-xl);
	font-weight: 700;
}

.clear {
	min-height: 2.75rem;
	padding: 0 var(--space-4);
	font: inherit;
	color: var(--color-text);
	background: transparent;
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	cursor: pointer;
}

.empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--space-4);
	padding: var(--space-8) 0;
	text-align: center;
}

.browse {
	display: inline-flex;
	align-items: center;
	min-height: 2.75rem;
	padding: 0 var(--space-6);
	font-weight: 600;
	color: var(--color-primary-contrast);
	text-decoration: none;
	background: var(--color-primary);
	border-radius: var(--radius);
}
```

**Archivo:** `src/features/cart/pages/CartPage.jsx`
**Dónde:** reemplazá el archivo entero (cada rama va en una `<section>`; el total y "Vaciar carrito"
van juntos en `div.summary`; el link "Ver servicios" del estado vacío lleva `styles.browse`).

```jsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatPrice } from "../../../shared/formatPrice";
import { CartItem } from "../components/CartItem";
import { useCart } from "../context/useCart";
import styles from "./CartPage.module.css";

export function CartPage() {
	const { t, i18n } = useTranslation();
	const { items, totalPrice, removeFromCart, clearCart } = useCart();
	const language = i18n.resolvedLanguage;
	if (items.length === 0) {
		return (
			<section className={styles.empty}>
				<h1 className={styles.title}>{t("nav.cart")}</h1>
				<p>{t("cart.empty")}</p>
				<Link className={styles.browse} to="/productos">
					{t("cart.browse")}
				</Link>
			</section>
		);
	}
	return (
		<section className={styles.page}>
			<h1 className={styles.title}>{t("nav.cart")}</h1>
			<ul className={styles.list}>
				{items.map((item) => (
					<li key={item.id}>
						<CartItem item={item} onRemove={removeFromCart} />
					</li>
				))}
			</ul>
			<div className={styles.summary}>
				<p className={styles.total} role="status">
					{t("cart.total")}: {formatPrice(totalPrice, language)}
				</p>
				<button className={styles.clear} type="button" onClick={clearCart}>
					{t("cart.clear")}
				</button>
			</div>
		</section>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

**3. 🔵 Mirar el navegador.** Probá con 0, 1 y 5 líneas, y con títulos largos. El total es lo más
importante de la página: tiene que verse. "Vaciar carrito" es secundario (borde, sin relleno): no
debería competir con una acción principal.

**4. Commit**

```sh
git add -A && git commit -m "style(cart): style the cart page"
```

---

## Verificación manual

- [ ] `pnpm dev`: agregá dos servicios, abrí el carrito, quitá uno, vaciá.
- [ ] Recargá `/carrito`: queda vacío (**esperado**: sin persistencia en esta fase).
- [ ] Teclado: Tab llega a cada "Quitar" y a "Vaciar carrito". 360 px: nada se sale.
- [ ] Sin errores en consola.
- [ ] El carrito a 360 y 1280 px con 0, 1 y 5 líneas; el total y el botón "Quitar" se alcanzan y se ven con teclado.

## Publicar

```sh
git push -u origin us-13-cart-page
gh pr create --fill --base main && gh pr checks --watch
```

Squash merge: `feat: add the cart page (US-13)`.

## Commits sugeridos

```
docs: add US-13 cart page story
test: register the cart item as pending styles
feat(cart): accept initial items in the provider
feat(cart): add the cart item with its title and image
feat(cart): show the item quantity
feat(cart): show the unit price and the subtotal
feat(cart): add the remove button to the cart item
test(cart): translate the cart item
feat(cart): show an empty state in the cart page
feat(cart): list the services in the cart page
feat(cart): show the cart total
test(cart): remove a service from the cart page
test(cart): show the empty state after removing the last service
feat(cart): clear the cart from the cart page
test(app): review the cart after adding a service
test(cart): translate the cart page
refactor(shared): extract a useLanguage hook            (opcional)
style(cart): style the cart item
style(cart): style the cart page
```

## Definition of Done

- [ ] Todos los escenarios pasan como tests.
- [ ] `pnpm verify` y el pipeline en verde; verificación manual hecha.
- [ ] Commits convencionales.
- [ ] `CartItem` y `CartPage` tienen su `.module.css` y salieron de `pending` (con esto `pending` queda vacío).

## Qué aprendiste

- Una página que solo lee el Context y calcula valores derivados.
- Sembrar un estado inicial hace los tests más cortos y claros.
- Cuándo extraer una abstracción: cuando ya se repite en tres o más lugares (*regla de tres*).
