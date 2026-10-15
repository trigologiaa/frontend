# Instructivo US-10: estado global del carrito (JavaScript)

Guía para implementar [US-10](../user-stories/us-10-cart-state.md) con el [flujo](00-workflow.md).
Story técnica: primero la **lógica pura** (un reducer, sin React), después el **Context** que la
reparte.
Formato de los pasos: [Formato de los instructivos](00-workflow.md#formato-de-los-instructivos).

## Qué vas a construir

```
cartReducer(estado, acción) → estado nuevo      ← puro, se prueba sin React (ciclos 1–10)
CartProvider  (useReducer + Context)            ← guarda el estado y lo reparte (ciclos 11–14)
useCart()     (lee el Context)                  ← lo que usan los componentes (US-11, 12, 13)
```

> **Concepto — Context (clase 8):** un "canal" para pasar datos a cualquier descendiente sin pasarlos
> por props en cada nivel (*prop drilling*). `CartProvider` envuelve la app; cualquier componente
> adentro llama `useCart()`.
>
> **Concepto — reducer:** una función `(estado, acción) → estado nuevo`. Las transiciones tienen
> nombre (`add`, `remove`, `clear`), no mutan nada y se prueban con `expect(reducer(...))`.
> `useReducer` lo conecta a un componente (es el hermano de `useState`).
>
> **Concepto — inmutabilidad:** en React **nunca** se modifica el estado existente; se devuelve uno
> nuevo (`[...items, nuevo]`, `items.map(...)`). Si lo mutás, React no detecta el cambio.

## Mapa de archivos

| Ciclo | Archivo | Acción |
| ----- | ------- | ------ |
| 1–10 | `test/features/cart/cartReducer.test.js` | **crear** en el ciclo 1, editar después |
| 1–10 | `src/features/cart/cartReducer.js` | **crear** en el ciclo 1, editar después |
| 11 | `test/features/cart/context/useCart.test.jsx` | **crear** |
| 11 | `src/features/cart/context/CartContext.jsx` | **crear** |
| 11 | `src/features/cart/context/useCart.js` | **crear** |
| 12–14 | `test/features/cart/context/CartContext.test.jsx` | **crear** en el ciclo 12, editar después |
| 12–14 | `src/features/cart/context/CartContext.jsx` | editar (se agrega `CartProvider`) |
| 14 | `test/renderWithProviders.jsx` | editar (agrega `CartProvider`) |
| 14 | `src/main.jsx` | editar (agrega `CartProvider`) |

## Paso 0: Preparar

```sh
git switch main && git pull
git switch -c us-10-cart-state
pnpm verify
cp <ruta-a>/javascript/user-stories/us-10-cart-state.md docs/
git add docs && git commit -m "docs: add US-10 cart state story"
```

Forma del estado: un **array de ítems**. Cada ítem guarda una *foto* del producto (lo que el carrito
necesita mostrar) más la cantidad:

```
{ id, title: { es, en }, price, image, quantity }
```

---

## Ciclo 1 — Agregar un producto nuevo crea un ítem

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/cartReducer.test.js` (**crealo**; la carpeta `test/features/cart/`
puede no existir todavía).
**Dónde:** el archivo entero.

```js
import { describe, expect, it } from "vitest";
import { cartReducer } from "../../../src/features/cart/cartReducer";
import { makeProduct } from "../../handlers";

const { id, title, price, image } = makeProduct(1);

describe("cartReducer", () => {
  it("adds a new product as an item with its quantity", () => {
    const state = cartReducer([], { type: "add", product: makeProduct(1), quantity: 2 });
    expect(state).toEqual([{ id, title, price, image, quantity: 2 }]);
  });
});
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Failed to resolve import "../../../src/features/cart/cartReducer"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/cartReducer.js` (**crealo**).
**Dónde:** el archivo entero.

```js
export function cartReducer(items, action) {
	const { id, title, price, image } = action.product;
	return [...items, { id, title, price, image, quantity: action.quantity }];
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): add a product to the cart"
```

---

## Ciclo 2 — Agregar un producto existente suma cantidad

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/cartReducer.test.js`
**Dónde:** dentro del `describe("cartReducer", ...)`, después del test del ciclo 1.

```js
  it("increases the quantity when the product is already in the cart", () => {
    const first = cartReducer([], { type: "add", product: makeProduct(1), quantity: 1 });
    const state = cartReducer(first, { type: "add", product: makeProduct(1), quantity: 2 });
    expect(state).toEqual([{ id, title, price, image, quantity: 3 }]);
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:** el estado tiene **dos** ítems
(`expected [ {…}, {…} ] to deeply equal [ {…} ]`).

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/cartReducer.js`
**Dónde:** reemplazá el archivo entero (el bloque `existing` va **antes** del `return`).

```js
export function cartReducer(items, action) {
	const { id, title, price, image } = action.product;
	const existing = items.find((item) => item.id === id);
	if (existing) {
		return items.map((item) =>
			item.id === id ? { ...item, quantity: item.quantity + action.quantity } : item,
		);
	}
	return [...items, { id, title, price, image, quantity: action.quantity }];
}
```

> `{ ...item, quantity: ... }` copia el ítem y cambia un campo: así no se muta el original.

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): accumulate the quantity of a repeated product"
```

---

## Ciclo 3 — Productos distintos quedan separados

Este ciclo **no cambia código productivo**: el test pasa de entrada y se valida con una mutación.

### 1. Test (pasa de entrada)

**Archivo:** `test/features/cart/cartReducer.test.js`
**Dónde:** dentro del `describe`, después del test del ciclo 2.

```js
  it("keeps different products as separate items", () => {
    const first = cartReducer([], { type: "add", product: makeProduct(1), quantity: 1 });
    const state = cartReducer(first, { type: "add", product: makeProduct(2), quantity: 1 });
    expect(state).toHaveLength(2);
  });
```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

1. En `src/features/cart/cartReducer.js` cambiá
   `items.find((item) => item.id === id)` por `items.find(() => true)`.
2. **Corré** `pnpm test:run`. **Rojo esperado:** este test falla (`expected length 2, received 1`).
3. **Restaurá** la línea y corré de nuevo: verde.

### 3. Commit

```sh
git add -A && git commit -m "test(cart): keep different products separate"
```

---

## Ciclo 4 — Quitar un producto

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/cartReducer.test.js`
**Dónde:** dentro del `describe`, después del test del ciclo 3.

```js
  it("removes the whole item of a product", () => {
    const one = cartReducer([], { type: "add", product: makeProduct(1), quantity: 1 });
    const two = cartReducer(one, { type: "add", product: makeProduct(2), quantity: 1 });
    const state = cartReducer(two, { type: "remove", id: "product-1" });
    expect(state.map((item) => item.id)).toEqual(["product-2"]);
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:** el `remove` cae en el código de `add` y falla con

```
Cannot destructure property 'id' of 'action.product' as it is undefined
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/cartReducer.js`
**Dónde:** reemplazá el archivo entero: pasá a un `switch (action.type)`; el `case "add"` es lo que
ya tenías, y se suma `case "remove"`.

```js
export function cartReducer(items, action) {
	switch (action.type) {
		case "add": {
			const { id, title, price, image } = action.product;
			const existing = items.find((item) => item.id === id);
			if (existing) {
				return items.map((item) =>
					item.id === id ? { ...item, quantity: item.quantity + action.quantity } : item,
				);
			}
			return [...items, { id, title, price, image, quantity: action.quantity }];
		}
		case "remove":
			return items.filter((item) => item.id !== action.id);
	}
}
```

> Biome puede marcar que el `switch` no tiene `default`: se agrega en el ciclo 6.

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): remove a product from the cart"
```

---

## Ciclo 5 — Vaciar

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/cartReducer.test.js`
**Dónde:** dentro del `describe`, después del test del ciclo 4.

```js
  it("clears the whole cart", () => {
    const one = cartReducer([], { type: "add", product: makeProduct(1), quantity: 1 });
    const two = cartReducer(one, { type: "add", product: makeProduct(2), quantity: 1 });
    expect(cartReducer(two, { type: "clear" })).toEqual([]);
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:** `expected undefined to deeply equal []`.

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/cartReducer.js`
**Dónde:** dentro del `switch`, **después** del `case "remove"`.

```js
		case "clear":
			return [];
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): clear the cart"
```

---

## Ciclo 6 — Acción desconocida: el mismo estado

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/cartReducer.test.js`
**Dónde:** dentro del `describe`, después del test del ciclo 5.

```js
  it("returns the same state for an unknown action", () => {
    const state = [];
    expect(cartReducer(state, { type: "unknown" })).toBe(state);
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:** `expected undefined to be []`.

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/cartReducer.js`
**Dónde:** dentro del `switch`, **al final** (después del `case "clear"`).

```js
		default:
			return items;
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): ignore unknown actions"
```

---

## Ciclo 7 — Cantidades inválidas se ignoran

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/cartReducer.test.js`
**Dónde:** dentro del `describe`, después del test del ciclo 6.

```js
  it.each([0, -1, 1.5])("ignores a quantity of %s", (quantity) => {
    const state = cartReducer([], { type: "add", product: makeProduct(1), quantity });
    expect(state).toEqual([]);
  });
```

> `it.each` corre el mismo test con varios valores (aparecen como tres tests).

**Corré:** `pnpm test:run`. **Rojo esperado:** los tres casos fallan: el reducer agrega un ítem con
cantidad inválida (`expected [ {…} ] to deeply equal []`).

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/cartReducer.js`
**Dónde:** dentro del `case "add"`, como **primera línea** (antes del `const { id, ... }`).

```js
			if (!Number.isInteger(action.quantity) || action.quantity < 1) return items;
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): ignore invalid quantities"
```

---

## Ciclo 8 — El reducer no muta el estado anterior

Este ciclo **no cambia código productivo**: el test pasa de entrada y se valida con una mutación.

### 1. Test (pasa de entrada)

**Archivo:** `test/features/cart/cartReducer.test.js`
**Dónde:** dentro del `describe`, después del test del ciclo 7.

```js
  it("never mutates the previous state", () => {
    const previous = Object.freeze([Object.freeze({ id, title, price, image, quantity: 1 })]);
    const state = cartReducer(previous, { type: "add", product: makeProduct(1), quantity: 2 });
    expect(previous[0].quantity).toBe(1);
    expect(state[0].quantity).toBe(3);
  });
```

(Un objeto congelado tira error si intentás mutarlo.)

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

1. En `src/features/cart/cartReducer.js`, dentro de `if (existing) { ... }`, reemplazá el `return
   items.map(...)` por:

   ```js
   existing.quantity += action.quantity;
   return items;
   ```

2. **Corré** `pnpm test:run`. **Rojo esperado:** `Cannot assign to read only property 'quantity'`.
3. **Restaurá** el `return items.map(...)` y corré de nuevo: verde.

### 3. Commit

```sh
git add -A && git commit -m "test(cart): never mutate the previous state"
```

---

## Ciclo 9 — Cantidad total

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/cartReducer.test.js`

1. **Dónde (import del reducer):** sumá `selectTotalQuantity`:

   ```js
   import { cartReducer, selectTotalQuantity } from "../../../src/features/cart/cartReducer";
   ```

2. **Dónde (debajo de `const { id, title, price, image } = makeProduct(1);`):** un helper para
   armar ítems:

   ```js
   const makeItem = (n, quantity) => ({
     id: `s${n}`,
     title,
     price: 100 * n,
     image,
     quantity,
   });
   ```

3. **Dónde (al final del archivo):** un `describe` nuevo, **después** del `});` que cierra
   `describe("cartReducer", ...)`.

   ```js
   describe("selectTotalQuantity", () => {
     it("sums the quantity of every item", () => {
       expect(selectTotalQuantity([makeItem(1, 2), makeItem(2, 3)])).toBe(5);
     });
   });
   ```

**Corré:** `pnpm test:run`. **Rojo esperado:** `selectTotalQuantity is not a function` (o error de import).

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/cartReducer.js`
**Dónde:** al final del archivo, después de `cartReducer`.

```js
export function selectTotalQuantity(items) {
	return items.reduce((total, item) => total + item.quantity, 0);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): compute the total quantity"
```

---

## Ciclo 10 — Precio total

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/cartReducer.test.js`

1. **Dónde (import del reducer):** sumá `selectTotalPrice`:

   ```js
   import { cartReducer, selectTotalPrice, selectTotalQuantity } from "../../../src/features/cart/cartReducer";
   ```

2. **Dónde (al final del archivo):** otro `describe` nuevo. Con `makeItem(1, 2)` (100 × 2) y
   `makeItem(2, 3)` (200 × 3) el total es `800`.

   ```js
   describe("selectTotalPrice", () => {
     it("sums price times quantity of every item", () => {
       expect(selectTotalPrice([makeItem(1, 2), makeItem(2, 3)])).toBe(800);
     });
   });
   ```

**Corré:** `pnpm test:run`. **Rojo esperado:** `selectTotalPrice is not a function`.

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/cartReducer.js`
**Dónde:** al final del archivo, después de `selectTotalQuantity`.

```js
export function selectTotalPrice(items) {
	return items.reduce((total, item) => total + item.price * item.quantity, 0);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

> Los totales **se calculan** desde `items`, no se guardan: dos fuentes de verdad terminan
> desincronizadas.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): compute the total price"
```

---

## Ciclo 11 — `useCart` fuera del provider falla con un mensaje claro

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/context/useCart.test.jsx` (**crealo**; la carpeta
`test/features/cart/context/` es nueva).
**Dónde:** el archivo entero.

```jsx
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCart } from "../../../../src/features/cart/context/useCart";

describe("useCart", () => {
  it("throws a clear error when used outside the CartProvider", () => {
    expect(() => renderHook(() => useCart())).toThrow(/CartProvider/);
  });
});
```

(React imprime el error en la consola: es normal.)

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Failed to resolve import "../../../../src/features/cart/context/useCart"
```

### 2. 🟢 Hacerlo pasar

Primero el contexto.

**Archivo:** `src/features/cart/context/CartContext.jsx` (**crealo**; la carpeta
`src/features/cart/context/` es nueva).
**Dónde:** el archivo entero.

```jsx
import { createContext } from "react";

export const CartContext = createContext(null);
```

Después el hook.

**Archivo:** `src/features/cart/context/useCart.js` (**crealo**).
**Dónde:** el archivo entero.

```js
import { useContext } from "react";
import { CartContext } from "./CartContext";

export function useCart() {
	const value = useContext(CartContext);
	if (!value) throw new Error("useCart must be used inside a CartProvider");
	return value;
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): add the cart context and its hook"
```

---

## Ciclo 12 — El provider comparte `addToCart` y los totales

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/context/CartContext.test.jsx` (**crealo**).
**Dónde:** el archivo entero. `Probe` es un componente de prueba que vive *dentro* del provider.

```jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CartProvider } from "../../../../src/features/cart/context/CartContext";
import { useCart } from "../../../../src/features/cart/context/useCart";
import { makeProduct } from "../../../handlers";

function Probe() {
  const { items, totalQuantity, totalPrice, addToCart } = useCart();
  return (
    <>
      <button type="button" onClick={() => addToCart(makeProduct(1), 2)}>
        add
      </button>
      <p>items: {items.length}</p>
      <p>quantity: {totalQuantity}</p>
      <p>price: {totalPrice}</p>
    </>
  );
}

describe("CartProvider", () => {
  it("shares the cart and its totals with its children", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <Probe />
      </CartProvider>,
    );
    await user.click(screen.getByRole("button", { name: "add" }));
    expect(screen.getByText("items: 1")).toBeInTheDocument();
    expect(screen.getByText("quantity: 2")).toBeInTheDocument();
    expect(screen.getByText("price: 200")).toBeInTheDocument();
  });
});
```

**Corré:** `pnpm test:run`. **Rojo esperado:** `CartProvider is not a function` (o
`useCart must be used inside a CartProvider`).

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/context/CartContext.jsx`
**Dónde:** reemplazá el archivo entero (se suma `CartProvider`).

```jsx
import { createContext, useMemo, useReducer } from "react";
import { cartReducer, selectTotalPrice, selectTotalQuantity } from "../cartReducer";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
	const [items, dispatch] = useReducer(cartReducer, []);

	const value = useMemo(
		() => ({
			items,
			totalQuantity: selectTotalQuantity(items),
			totalPrice: selectTotalPrice(items),
			addToCart: (product, quantity) => dispatch({ type: "add", product, quantity }),
		}),
		[items],
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
```

> En este ciclo el provider expone **solo** `addToCart` (más `items` y los totales). `removeFromCart`
> y `clearCart` nacen en los ciclos 13 y 14, cada uno desde su test: así ninguna línea queda sin un
> test que haya fallado primero.

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): add the cart provider"
```

---

## Ciclo 13 — `removeFromCart` desde un componente

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/context/CartContext.test.jsx`

1. **Dónde (`Probe`):** reemplazá el componente `Probe` entero (suma `removeFromCart` y un botón
   `remove`).

   ```jsx
   function Probe() {
     const { items, totalQuantity, totalPrice, addToCart, removeFromCart } = useCart();
     return (
       <>
         <button type="button" onClick={() => addToCart(makeProduct(1), 2)}>
           add
         </button>
         <button type="button" onClick={() => removeFromCart("product-1")}>
           remove
         </button>
         <p>items: {items.length}</p>
         <p>quantity: {totalQuantity}</p>
         <p>price: {totalPrice}</p>
       </>
     );
   }
   ```

2. **Dónde (dentro de `describe("CartProvider", ...)`):** después del test del ciclo 12.

   ```jsx
     it("removes a product from the cart", async () => {
       const user = userEvent.setup();
       render(
         <CartProvider>
           <Probe />
         </CartProvider>,
       );
       await user.click(screen.getByRole("button", { name: "add" }));
       await user.click(screen.getByRole("button", { name: "remove" }));
       expect(screen.getByText("items: 0")).toBeInTheDocument();
     });
   ```

**Corré:** `pnpm test:run`. **Rojo esperado:** al hacer click en `remove`,
`removeFromCart is not a function`.

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/context/CartContext.jsx`
**Dónde:** dentro del objeto del `useMemo`, **después** de `addToCart`.

```jsx
			removeFromCart: (id) => dispatch({ type: "remove", id }),
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): expose removeFromCart"
```

---

## Ciclo 14 — `clearCart` y el helper de tests

### 1. 🔴 Escribir el test

**Archivo:** `test/features/cart/context/CartContext.test.jsx`

1. **Dónde (`Probe`):** reemplazá el componente `Probe` entero (suma `clearCart` y dos botones:
   `add other` y `clear`).

   ```jsx
   function Probe() {
     const { items, totalQuantity, totalPrice, addToCart, removeFromCart, clearCart } = useCart();
     return (
       <>
         <button type="button" onClick={() => addToCart(makeProduct(1), 2)}>
           add
         </button>
         <button type="button" onClick={() => addToCart(makeProduct(2), 1)}>
           add other
         </button>
         <button type="button" onClick={() => removeFromCart("product-1")}>
           remove
         </button>
         <button type="button" onClick={clearCart}>
           clear
         </button>
         <p>items: {items.length}</p>
         <p>quantity: {totalQuantity}</p>
         <p>price: {totalPrice}</p>
       </>
     );
   }
   ```

2. **Dónde (dentro de `describe("CartProvider", ...)`):** después del test del ciclo 13.

   ```jsx
     it("clears the cart", async () => {
       const user = userEvent.setup();
       render(
         <CartProvider>
           <Probe />
         </CartProvider>,
       );
       await user.click(screen.getByRole("button", { name: "add" }));
       await user.click(screen.getByRole("button", { name: "add other" }));
       expect(screen.getByText("items: 2")).toBeInTheDocument();
       await user.click(screen.getByRole("button", { name: "clear" }));
       expect(screen.getByText("items: 0")).toBeInTheDocument();
     });
   ```

**Corré:** `pnpm test:run`. **Rojo esperado:** `clearCart` todavía es `undefined`, así que el botón
`clear` no hace nada y falla:

```
Unable to find an element with the text: items: 0
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/cart/context/CartContext.jsx`
**Dónde:** dentro del objeto del `useMemo`, **después** de `removeFromCart`.

```jsx
			clearCart: () => dispatch({ type: "clear" }),
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(cart): expose clearCart"
```

### 4. Infraestructura: dar el carrito a todos los tests y a la app

A partir de US-11 los componentes llaman `useCart()`, así que tanto los tests como la app real
necesitan el provider.

**Archivo:** `test/renderWithProviders.jsx`
**Dónde:** reemplazá el archivo entero (`CartProvider` va entre `I18nextProvider` y el router).

```jsx
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { CartProvider } from "../src/features/cart/context/CartContext";
import { i18n } from "../src/i18n";

export function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <I18nextProvider i18n={i18n}>
      <CartProvider>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </CartProvider>
    </I18nextProvider>
  );
}
```

**Archivo:** `src/main.jsx`
**Dónde:** reemplazá el archivo entero (`CartProvider` envuelve a `BrowserRouter`, adentro de
`StrictMode`).

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/tokens.css";
import "./styles/global.css";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./features/cart/context/CartContext";
import { i18n } from "./i18n";

createRoot(document.getElementById("root")).render(
	<I18nextProvider i18n={i18n}>
		<StrictMode>
			<CartProvider>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</CartProvider>
		</StrictMode>
	</I18nextProvider>,
);
```

**Corré:** `pnpm verify`. **Resultado esperado:** todo verde (lint, Knip, cobertura 100 % y build).

### 5. Commit

```sh
git add -A && git commit -m "chore(test): provide the cart to rendered components"
```

---

## Verificación manual

- [ ] En el preview no cambia nada visible (todavía nada consume el carrito): eso es lo esperado.
- [ ] `pnpm verify` verde con cobertura 100 % en `cartReducer` y `CartContext`.

## Publicar

```sh
git push -u origin us-10-cart-state
gh pr create --fill --base main && gh pr checks --watch
```

Squash merge: `feat: add a global cart state (US-10)`.

## Commits sugeridos

```
docs: add US-10 cart state story
feat(cart): add a product to the cart
feat(cart): accumulate the quantity of a repeated product
test(cart): keep different products separate
feat(cart): remove a product from the cart
feat(cart): clear the cart
feat(cart): ignore unknown actions
feat(cart): ignore invalid quantities
test(cart): never mutate the previous state
feat(cart): compute the total quantity
feat(cart): compute the total price
feat(cart): add the cart context and its hook
feat(cart): add the cart provider
feat(cart): expose removeFromCart
feat(cart): expose clearCart
chore(test): provide the cart to rendered components
```

## Definition of Done

- [ ] Todos los escenarios pasan como tests; los del reducer no importan React.
- [ ] `pnpm verify` y el pipeline en verde.
- [ ] Commits convencionales.

## Qué aprendiste

- Lógica pura en un reducer: rapidísima de testear y sin React.
- Inmutabilidad: por qué `{ ...item }` y `map`/`filter` en vez de mutar.
- Context = canal; `useCart` = puerta de entrada con error claro si falta el provider.
- Estado derivado: los totales se calculan, no se guardan.
- Una decisión deliberada: por qué `useReducer` en lugar de `useState` (ver `00-workflow.md`, sección 7).
