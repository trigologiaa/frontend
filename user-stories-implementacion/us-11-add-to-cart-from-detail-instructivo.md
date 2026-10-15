# Instructivo US-11: agregar al carrito desde el detalle (JavaScript)

Guía para implementar [US-11](../user-stories/us-11-add-to-cart-from-detail.md) con el
[flujo](00-workflow.md). Es la clase 4 (contador, evento + estado) conectada con la clase 8 (Context).
Formato de los pasos: [Formato de los instructivos](00-workflow.md#formato-de-los-instructivos).

## Qué vas a construir

```
ItemDetail   (estado local: cantidad elegida; llama addToCart del contexto)
   └─ ItemCount   (presentacional: value + onChange; botones − y +)
```

> **Concepto — elevar el estado (*lifting state up*):** `ItemCount` no guarda la cantidad: la recibe
> (`value`) y avisa cuando quiere cambiarla (`onChange`). Quien la guarda es `ItemDetail`, que es el
> que necesita el número para llamar a `addToCart`. Así `ItemCount` se prueba con un simple
> `vi.fn()`.
>
> **Concepto — `useState` + evento (clase 4):** `onClick={() => setQuantity(quantity + 1)}`. Al
> llamar al *setter* React vuelve a dibujar el componente con el valor nuevo.
>
> **Concepto — espía (`vi.fn()`):** una función falsa que recuerda cómo la llamaron. Sirve para
> comprobar un **contrato** ("se llama a `addToCart(servicio, cantidad)`").

## Mapa de archivos

| Ciclo | Archivo | Acción |
| ----- | ------- | ------ |
| 0, S1 | `test/styles/components.test.js` | editar (lista `pending`) |
| 1–4 | `test/features/services/components/ItemCount.test.jsx` | **crear** en el ciclo 1, editar después |
| 1–4 | `src/features/services/components/ItemCount.jsx` | **crear** en el ciclo 1, editar después |
| 1–14 | `src/i18n/locales/es.json`, `src/i18n/locales/en.json` | editar (claves `detail.*`) |
| 5–12, 14 | `test/features/services/components/ItemDetail.test.jsx` | editar (ya existe, de US-09) |
| 5–12 | `src/features/services/components/ItemDetail.jsx` | editar (ya existe, de US-09) |
| 13 | `test/features/services/pages/ItemDetailContainer.test.jsx` | editar (ya existe, de US-09) |
| S1 | `src/features/services/components/ItemCount.module.css` | **crear** |
| S2 | `src/features/services/components/ItemDetail.module.css` | editar (agregar reglas) |

Claves de catálogo nuevas (se agregan una por ciclo, justo antes del ciclo que la usa):
`detail.quantity`, `detail.increase`, `detail.decrease`, `detail.add`, `detail.added`.

## Paso 0: Preparar

```sh
git switch main && git pull
git switch -c us-11-add-to-cart-from-detail
pnpm verify
cp <ruta-a>/javascript/user-stories/us-11-add-to-cart-from-detail.md docs/
git add docs && git commit -m "docs: add US-11 add to cart from detail story"
```

### Registrar el componente nuevo como "sin estilos todavía"

**Archivo:** `test/styles/components.test.js`
**Dónde:** el array `pending`. Agregá esta ruta **al final** del array:

```js
  "src/features/services/components/ItemCount.jsx",
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

```sh
git add -A && git commit -m "test: register the quantity counter as pending styles"
```

---

## Ciclo 1 — El contador muestra el valor

### 1. Agregar el texto en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"detail"`, después de `"back"` (agregá la coma al final de `"back"`).

```json
"quantity": "Cantidad"
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"quantity": "Quantity"
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/services/components/ItemCount.test.jsx` (**crealo**).
**Dónde:** el archivo entero.

```jsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ItemCount } from "../../../../src/features/services/components/ItemCount";
import { renderWithProviders } from "../../../renderWithProviders";

describe("ItemCount", () => {
  it("shows the current quantity", () => {
    renderWithProviders(<ItemCount value={3} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Cantidad")).toHaveTextContent("3");
  });
});
```

(`userEvent` todavía no se usa: lo vas a necesitar en el ciclo 2.)

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Failed to resolve import "../../../../src/features/services/components/ItemCount"
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/components/ItemCount.jsx` (**crealo**).
**Dónde:** el archivo entero.

```jsx
import { useTranslation } from "react-i18next";

export function ItemCount({ value }) {
	const { t } = useTranslation();
	return <output aria-label={t("detail.quantity")}>{value}</output>;
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(services): add the quantity counter"
```

---

## Ciclo 2 — "+" pide aumentar

### 1. Agregar el texto en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"detail"`, después de `"quantity"` (cuidá la coma).

```json
"increase": "Aumentar cantidad"
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"increase": "Increase quantity"
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/services/components/ItemCount.test.jsx`
**Dónde:** dentro del `describe("ItemCount", ...)`, después del test del ciclo 1.

```jsx
  it("asks to increase the quantity by one", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<ItemCount value={3} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    expect(onChange).toHaveBeenCalledWith(4);
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an accessible element with the role "button" and name "Aumentar cantidad"
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/components/ItemCount.jsx`
**Dónde:** reemplazá el archivo entero (recibe `onChange`; ahora hay dos elementos, así que van
dentro de un `<div>`).

```jsx
import { useTranslation } from "react-i18next";

export function ItemCount({ value, onChange }) {
	const { t } = useTranslation();
	return (
		<div>
			<output aria-label={t("detail.quantity")}>{value}</output>
			<button type="button" aria-label={t("detail.increase")} onClick={() => onChange(value + 1)}>
				+
			</button>
		</div>
	);
}
```

> `type="button"` evita que el botón envíe un formulario si algún día queda dentro de uno.

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(services): increase the quantity"
```

---

## Ciclo 3 — "−" pide disminuir

### 1. Agregar el texto en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"detail"`, después de `"increase"` (cuidá la coma).

```json
"decrease": "Disminuir cantidad"
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"decrease": "Decrease quantity"
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/services/components/ItemCount.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 2.

```jsx
  it("asks to decrease the quantity by one", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<ItemCount value={3} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Disminuir cantidad" }));
    expect(onChange).toHaveBeenCalledWith(2);
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an accessible element with the role "button" and name "Disminuir cantidad"
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/components/ItemCount.jsx`
**Dónde:** reemplazá el archivo entero (el botón "−" va **antes** del `<output>`).

```jsx
import { useTranslation } from "react-i18next";

export function ItemCount({ value, onChange }) {
	const { t } = useTranslation();
	return (
		<div>
			<button type="button" aria-label={t("detail.decrease")} onClick={() => onChange(value - 1)}>
				−
			</button>
			<output aria-label={t("detail.quantity")}>{value}</output>
			<button type="button" aria-label={t("detail.increase")} onClick={() => onChange(value + 1)}>
				+
			</button>
		</div>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(services): decrease the quantity"
```

---

## Ciclo 4 — No baja de 1

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/components/ItemCount.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 3.

```jsx
  it("does not allow decreasing below one", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<ItemCount value={1} onChange={onChange} />);
    const decrease = screen.getByRole("button", { name: "Disminuir cantidad" });
    await user.click(decrease);
    expect(decrease).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
expect(element).toBeDisabled()
Received element is not disabled
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/components/ItemCount.jsx`
**Dónde:** en el botón "−" (el primero), agregá `disabled={value <= 1}`.

```jsx
			<button
				type="button"
				aria-label={t("detail.decrease")}
				disabled={value <= 1}
				onClick={() => onChange(value - 1)}
			>
				−
			</button>
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde (el test del ciclo 3 usa `value={3}`, no
se ve afectado).

### 3. Commit

```sh
git add -A && git commit -m "feat(services): keep the quantity at one or more"
```

---

## Ciclo 5 — El detalle arranca con cantidad 1

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/components/ItemDetail.test.jsx` (ya existe, de US-09).
**Dónde:** dentro del `describe("ItemDetail", ...)`, después del último test que hay.

```jsx
  it("starts with a quantity of one", () => {
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    expect(screen.getByLabelText("Cantidad")).toHaveTextContent("1");
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find a label with the text of: Cantidad
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/components/ItemDetail.jsx`
**Dónde:** reemplazá el archivo entero (import de `useState` y de `ItemCount`; el selector va dentro
de `div.info`, **después** de la descripción).

```jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";
import { ItemCount } from "./ItemCount";
import styles from "./ItemDetail.module.css";

export function ItemDetail({ service }) {
	const { t, i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	const title = localized(service.title, language);
	const [quantity, setQuantity] = useState(1);
	return (
		<article className={styles.detail}>
			<img className={styles.image} src={service.image} alt={title} width="640" height="400" />
			<div className={styles.info}>
				<h1 className={styles.title}>{title}</h1>
				<p className={styles.category}>{t(`categories.${service.category}`)}</p>
				<p className={styles.price}>{formatPrice(service.price, language)}</p>
				<p className={styles.description}>{localized(service.description, language)}</p>
				<ItemCount value={quantity} onChange={setQuantity} />
			</div>
		</article>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(services): show the quantity selector in the detail"
```

---

## Ciclo 6 — Aumentar desde el detalle

Este ciclo **no cambia código productivo**: el cableado del ciclo 5 ya lo hace.

### 1. Test (pasa de entrada)

**Archivo:** `test/features/services/components/ItemDetail.test.jsx`

1. **Dónde (imports):** agregá, junto a los demás:

   ```jsx
   import userEvent from "@testing-library/user-event";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 5.

   ```jsx
     it("increases the quantity from the detail", async () => {
       const user = userEvent.setup();
       renderWithProviders(<ItemDetail service={makeService(1)} />);
       await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
       await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
       expect(screen.getByLabelText("Cantidad")).toHaveTextContent("3");
     });
   ```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

1. En `src/features/services/components/ItemDetail.jsx` cambiá `onChange={setQuantity}` por
   `onChange={() => {}}`.
2. **Corré** `pnpm test:run`. **Rojo esperado:** `Expected element to have text content: 3 Received: 1`.
3. **Restaurá** `onChange={setQuantity}` y corré de nuevo: verde.

### 3. Commit

```sh
git add -A && git commit -m "test(services): increase the quantity from the detail"
```

---

## Ciclo 7 — Disminuir desde el detalle

Este ciclo **no cambia código productivo**.

### 1. Test (pasa de entrada)

**Archivo:** `test/features/services/components/ItemDetail.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 6.

```jsx
  it("decreases the quantity from the detail", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    await user.click(screen.getByRole("button", { name: "Disminuir cantidad" }));
    expect(screen.getByLabelText("Cantidad")).toHaveTextContent("2");
  });
```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

Igual que en el ciclo 6 (`onChange={() => {}}` en `ItemDetail.jsx`) → **rojo**; restaurá → verde.

### 3. Commit

```sh
git add -A && git commit -m "test(services): decrease the quantity from the detail"
```

---

## Ciclo 8 — El botón llama `addToCart(servicio, cantidad)`

### 1. Agregar el texto en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"detail"`, después de `"decrease"` (cuidá la coma).

```json
"add": "Agregar al carrito"
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"add": "Add to cart"
```

### 2. 🔴 Escribir el test

Test de **contrato**: un valor de contexto falso (con un espía) **pisa** al del helper.

**Archivo:** `test/features/services/components/ItemDetail.test.jsx`

1. **Dónde (imports):** sumá `vi` al import de `vitest` y el contexto del carrito:

   ```jsx
   import { describe, expect, it, vi } from "vitest";
   import { CartContext } from "../../../../src/features/cart/context/CartContext";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 7.

   ```jsx
     it("calls addToCart with the service and the chosen quantity", async () => {
       const user = userEvent.setup();
       const addToCart = vi.fn();
       const service = makeService(1);
       renderWithProviders(
         <CartContext.Provider
           value={{
             items: [],
             totalQuantity: 0,
             totalPrice: 0,
             addToCart,
             removeFromCart: vi.fn(),
             clearCart: vi.fn(),
           }}
         >
           <ItemDetail service={service} />
         </CartContext.Provider>,
       );
       await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
       await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
       expect(addToCart).toHaveBeenCalledWith(service, 2);
     });
   ```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an accessible element with the role "button" and name "Agregar al carrito"
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/components/ItemDetail.jsx`
**Dónde:** reemplazá el archivo entero (import de `useCart`; el botón va **después** de `ItemCount`).

```jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";
import { useCart } from "../../cart/context/useCart";
import { ItemCount } from "./ItemCount";
import styles from "./ItemDetail.module.css";

export function ItemDetail({ service }) {
	const { t, i18n } = useTranslation();
	const { addToCart } = useCart();
	const language = i18n.resolvedLanguage;
	const title = localized(service.title, language);
	const [quantity, setQuantity] = useState(1);
	return (
		<article className={styles.detail}>
			<img className={styles.image} src={service.image} alt={title} width="640" height="400" />
			<div className={styles.info}>
				<h1 className={styles.title}>{title}</h1>
				<p className={styles.category}>{t(`categories.${service.category}`)}</p>
				<p className={styles.price}>{formatPrice(service.price, language)}</p>
				<p className={styles.description}>{localized(service.description, language)}</p>
				<ItemCount value={quantity} onChange={setQuantity} />
				<button type="button" onClick={() => addToCart(service, quantity)}>
					{t("detail.add")}
				</button>
			</div>
		</article>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(services): add the service to the cart from the detail"
```

---

## Ciclo 9 — El servicio queda en el carrito real

Este ciclo **no cambia código productivo**: es una prueba de integración con el `CartProvider` real
(el que ya pone `renderWithProviders` desde US-10).

### 1. Test (pasa de entrada)

**Archivo:** `test/features/services/components/ItemDetail.test.jsx`

1. **Dónde (imports):** agregá el hook del carrito:

   ```jsx
   import { useCart } from "../../../../src/features/cart/context/useCart";
   ```

2. **Dónde (entre los imports y el `describe`):** un componente lector del carrito.

   ```jsx
   function CartProbe() {
     const { items, totalQuantity } = useCart();
     return (
       <p>
         cart: {items.map((item) => `${item.id} x${item.quantity}`).join(", ")} ({totalQuantity})
       </p>
     );
   }
   ```

3. **Dónde (dentro del `describe`):** después del test del ciclo 8.

   ```jsx
     it("puts the service in the cart", async () => {
       const user = userEvent.setup();
       renderWithProviders(
         <>
           <ItemDetail service={makeService(1)} />
           <CartProbe />
         </>,
       );
       await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
       await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
       expect(screen.getByText("cart: service-1 x2 (2)")).toBeInTheDocument();
     });
   ```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

1. En `ItemDetail.jsx` cambiá `addToCart(service, quantity)` por `addToCart(service, 1)`.
2. **Corré** `pnpm test:run`. **Rojo esperado:** `Unable to find an element with the text: cart: service-1 x2 (2)`
   (y también falla el test del ciclo 8).
3. **Restaurá** y corré de nuevo: verde.

### 3. Commit

```sh
git add -A && git commit -m "test(services): put the service in the cart"
```

---

## Ciclo 10 — Agregar dos veces acumula

Este ciclo **no cambia código productivo**.

### 1. Test (pasa de entrada)

**Archivo:** `test/features/services/components/ItemDetail.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 9.

```jsx
  it("accumulates repeated additions of the same service", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <ItemDetail service={makeService(1)} />
        <CartProbe />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    expect(screen.getByText("cart: service-1 x3 (3)")).toBeInTheDocument();
  });
```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada (1 + 2 = 3).

### 2. Mutación

1. En `src/features/cart/cartReducer.js`, en el `case "add"`, cambiá
   `quantity: item.quantity + action.quantity` por `quantity: action.quantity`.
2. **Corré** `pnpm test:run`. **Rojo esperado:** falla este test **y** el del reducer
   (`increases the quantity when the service is already in the cart`).
3. **Restaurá** y corré de nuevo: verde.

### 3. Commit

```sh
git add -A && git commit -m "test(services): accumulate repeated additions"
```

---

## Ciclo 11 — Confirmación

### 1. Agregar el texto en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"detail"`, después de `"add"` (cuidá la coma).

```json
"added": "Agregado al carrito"
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"added": "Added to cart"
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/services/components/ItemDetail.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 10.

```jsx
  it("confirms that the service was added", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    const messages = screen.getAllByRole("status").map((node) => node.textContent);
    expect(messages).toContain("Agregado al carrito");
  });
```

> Se busca **entre todos** los `status` porque el contador `<output>` ya tiene rol `status`
> implícito.

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
expected [ '1' ] to include 'Agregado al carrito'
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/components/ItemDetail.jsx`
**Dónde:** reemplazá el archivo entero (estado `added`, un `handleAdd` y el mensaje debajo del botón).

```jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";
import { useCart } from "../../cart/context/useCart";
import { ItemCount } from "./ItemCount";
import styles from "./ItemDetail.module.css";

export function ItemDetail({ service }) {
	const { t, i18n } = useTranslation();
	const { addToCart } = useCart();
	const language = i18n.resolvedLanguage;
	const title = localized(service.title, language);
	const [quantity, setQuantity] = useState(1);
	const [added, setAdded] = useState(false);

	function handleAdd() {
		addToCart(service, quantity);
		setAdded(true);
	}

	return (
		<article className={styles.detail}>
			<img className={styles.image} src={service.image} alt={title} width="640" height="400" />
			<div className={styles.info}>
				<h1 className={styles.title}>{title}</h1>
				<p className={styles.category}>{t(`categories.${service.category}`)}</p>
				<p className={styles.price}>{formatPrice(service.price, language)}</p>
				<p className={styles.description}>{localized(service.description, language)}</p>
				<ItemCount value={quantity} onChange={setQuantity} />
				<button type="button" onClick={handleAdd}>
					{t("detail.add")}
				</button>
				{added && <p role="status">{t("detail.added")}</p>}
			</div>
		</article>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(services): confirm that the service was added"
```

---

## Ciclo 12 — La cantidad vuelve a 1

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/components/ItemDetail.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 11.

```jsx
  it("resets the quantity to one after adding", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    expect(screen.getByLabelText("Cantidad")).toHaveTextContent("1");
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Expected element to have text content: 1
Received: 3
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/components/ItemDetail.jsx`
**Dónde:** dentro de `handleAdd`, **después** de `setAdded(true);`.

```jsx
	function handleAdd() {
		addToCart(service, quantity);
		setAdded(true);
		setQuantity(1);
	}
```

**Corré:** `pnpm verify`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(services): reset the quantity after adding"
```

---

## Ciclo 13 — Mientras carga no hay botón

Este ciclo **no cambia código productivo**: el contenedor ya devuelve el estado de carga antes del
detalle.

### 1. Test (pasa de entrada)

**Archivo:** `test/features/services/pages/ItemDetailContainer.test.jsx` (ya existe, de US-09).
**Dónde:** dentro del `describe("ItemDetailContainer", ...)`, después del último test.

```jsx
  it("does not offer the add button while the service loads", () => {
    server.use(servicesHandler());
    renderDetail("service-1");
    expect(screen.queryByRole("button", { name: "Agregar al carrito" })).not.toBeInTheDocument();
  });
```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

1. En `src/features/services/pages/ItemDetailContainer.jsx` comentá la línea
   `if (loading) { ... }` (el bloque entero de carga).
2. **Corré** `pnpm test:run`. **Rojo esperado:** falla este test (el detalle intenta dibujarse con
   `service = null` y explota: `Cannot read properties of null`).
3. **Restaurá** el bloque y corré de nuevo: verde.

### 3. Commit

```sh
git add -A && git commit -m "test(services): hide the add button while loading"
```

---

## Ciclo 14 — Inglés

Este ciclo **no cambia código productivo**: protege los textos en inglés.

### 1. Test (pasa de entrada)

**Archivo:** `test/features/services/components/ItemDetail.test.jsx`

1. **Dónde (imports):** agregá, junto a los demás:

   ```jsx
   import { i18n } from "../../../../src/i18n";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 12.

   ```jsx
     it("translates the add to cart controls", async () => {
       await i18n.changeLanguage("en");
       const user = userEvent.setup();
       renderWithProviders(<ItemDetail service={makeService(1)} />);
       await user.click(screen.getByRole("button", { name: "Increase quantity" }));
       await user.click(screen.getByRole("button", { name: "Decrease quantity" }));
       await user.click(screen.getByRole("button", { name: "Add to cart" }));
       const messages = screen.getAllByRole("status").map((node) => node.textContent);
       expect(messages).toContain("Added to cart");
     });
   ```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

En `src/i18n/locales/en.json` cambiá `"increase": "Increase quantity"` por otro texto → **rojo**;
restaurá → verde.

### 3. Commit

```sh
git add -A && git commit -m "test(services): translate the add to cart controls"
```

---

## Ciclos de estilo — contador y botón de agregar

Mismo **ciclo de estilo** que en el [workflow](00-workflow.md#2b-el-css-se-escribe-junto-con-cada-story-y-se-testea-así).

### Ciclo S1 — El contador de cantidad

**1. 🔴 Test.** **Archivo:** `test/styles/components.test.js`
**Dónde:** el array `pending`. Borrá esta línea:

```js
  "src/features/services/components/ItemCount.jsx",
```

**Corré:** `pnpm test:run`. **Rojo esperado:** el test nombra `ItemCount.jsx` sin módulo.

**2. 🟢 Código.**

**Archivo:** `src/features/services/components/ItemCount.module.css` (**crealo**).
**Dónde:** el archivo entero.

```css
.counter {
	display: inline-flex;
	align-items: center;
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	overflow: hidden;
}

.button {
	min-width: 2.75rem;
	min-height: 2.75rem;
	border: 0;
	font: inherit;
	font-size: var(--font-size-lg);
	color: var(--color-text);
	background: var(--color-surface);
	cursor: pointer;
}

.button:disabled {
	color: var(--color-muted);
	cursor: not-allowed;
	opacity: 0.5;
}

.value {
	min-width: 3rem;
	text-align: center;
	font-weight: 600;
}
```

**Archivo:** `src/features/services/components/ItemCount.jsx`
**Dónde:** reemplazá el archivo entero (`styles.counter` al `div`, `styles.button` a los dos botones
y `styles.value` al `<output>`).

```jsx
import { useTranslation } from "react-i18next";
import styles from "./ItemCount.module.css";

export function ItemCount({ value, onChange }) {
	const { t } = useTranslation();
	return (
		<div className={styles.counter}>
			<button
				className={styles.button}
				type="button"
				aria-label={t("detail.decrease")}
				disabled={value <= 1}
				onClick={() => onChange(value - 1)}
			>
				−
			</button>
			<output className={styles.value} aria-label={t("detail.quantity")}>
				{value}
			</output>
			<button
				className={styles.button}
				type="button"
				aria-label={t("detail.increase")}
				onClick={() => onChange(value + 1)}
			>
				+
			</button>
		</div>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

**3. 🔵 Mirar el navegador.** Los botones miden al menos 44 × 44 px (dedo en el celular). El "−"
**deshabilitado** (cantidad 1) se ve apagado: ese estilo se engancha a `:disabled`, el mismo atributo
que testeaste en el ciclo 4.

**4. Commit**

```sh
git add -A && git commit -m "style(services): style the quantity counter"
```

### Ciclo S2 — La zona de compra del detalle

`ItemDetail` ya tiene su módulo (US-09): acá solo **se agregan** reglas. No hay `pending` que sacar,
pero los tests de comportamiento del botón "Agregar" siguen siendo la red (si tapás el botón con un
`position` mal puesto, el clic del test no llega).

**Archivo:** `src/features/services/components/ItemDetail.module.css`
**Dónde:** al **final** del archivo, **después** del bloque `@media (min-width: 48rem) { ... }`.

```css
.actions {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var(--space-4);
	margin-top: var(--space-2);
}

.add {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 2.75rem;
	padding: 0 var(--space-6);
	font: inherit;
	font-weight: 600;
	color: var(--color-primary-contrast);
	background: var(--color-primary);
	border: 0;
	border-radius: var(--radius);
	cursor: pointer;
}

.added {
	margin: 0;
	font-weight: 600;
	color: var(--color-primary);
}
```

**Archivo:** `src/features/services/components/ItemDetail.jsx`
**Dónde:** reemplazá el archivo entero (`ItemCount` y el botón van dentro de `div.actions`; `styles.add`
al botón y `styles.added` al mensaje de confirmación, debajo).

```jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";
import { useCart } from "../../cart/context/useCart";
import { ItemCount } from "./ItemCount";
import styles from "./ItemDetail.module.css";

export function ItemDetail({ service }) {
	const { t, i18n } = useTranslation();
	const { addToCart } = useCart();
	const language = i18n.resolvedLanguage;
	const title = localized(service.title, language);
	const [quantity, setQuantity] = useState(1);
	const [added, setAdded] = useState(false);

	function handleAdd() {
		addToCart(service, quantity);
		setAdded(true);
		setQuantity(1);
	}

	return (
		<article className={styles.detail}>
			<img className={styles.image} src={service.image} alt={title} width="640" height="400" />
			<div className={styles.info}>
				<h1 className={styles.title}>{title}</h1>
				<p className={styles.category}>{t(`categories.${service.category}`)}</p>
				<p className={styles.price}>{formatPrice(service.price, language)}</p>
				<p className={styles.description}>{localized(service.description, language)}</p>
				<div className={styles.actions}>
					<ItemCount value={quantity} onChange={setQuantity} />
					<button className={styles.add} type="button" onClick={handleAdd}>
						{t("detail.add")}
					</button>
				</div>
				{added && (
					<p className={styles.added} role="status">
						{t("detail.added")}
					</p>
				)}
			</div>
		</article>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

**3. 🔵 Mirar el navegador.** Agregá al carrito y mirá la confirmación: tiene que notarse sin ser
molesta. A 360 px el contador y el botón pasan a dos líneas en lugar de salirse (`flex-wrap`).

**4. Commit**

```sh
git add -A && git commit -m "style(services): style the add to cart area"
```

---

## Verificación manual

- [ ] `pnpm dev`: en un detalle cambiá la cantidad, agregá, y mirá el mensaje de confirmación.
- [ ] Navegá al catálogo y a otro servicio y volvé: el carrito **no** se pierde (la cuenta la ves
      en US-12; por ahora abrí *React DevTools → Components → CartProvider → hooks* para ver
      `items`).
- [ ] Solo teclado: Tab, Enter/Espacio sobre −, +, "Agregar". Sin errores en consola.
- [ ] Contador y botón "Agregar" a 360 y 1280 px; el "−" deshabilitado se ve apagado; foco visible con Tab.

## Publicar

```sh
git push -u origin us-11-add-to-cart-from-detail
gh pr create --fill --base main && gh pr checks --watch
```

Squash merge: `feat: add services to the cart from the detail page (US-11)`.

## Commits sugeridos

```
docs: add US-11 add to cart from detail story
test: register the quantity counter as pending styles
feat(services): add the quantity counter
feat(services): increase the quantity
feat(services): decrease the quantity
feat(services): keep the quantity at one or more
feat(services): show the quantity selector in the detail
test(services): increase the quantity from the detail
test(services): decrease the quantity from the detail
feat(services): add the service to the cart from the detail
test(services): put the service in the cart
test(services): accumulate repeated additions
feat(services): confirm that the service was added
feat(services): reset the quantity after adding
test(services): hide the add button while loading
test(services): translate the add to cart controls
style(services): style the quantity counter
style(services): style the add to cart area
```

## Definition of Done

- [ ] Todos los escenarios pasan como tests.
- [ ] `pnpm verify` y el pipeline en verde; verificación manual hecha.
- [ ] Commits convencionales.
- [ ] `ItemCount` tiene su `.module.css` y salió de `pending`; la zona de compra del detalle está estilada.

## Qué aprendiste

- Elevar el estado y componentes controlados (`value` + `onChange`).
- Espía de contrato (`vi.fn()`) vs integración real: los dos tipos de test se complementan.
- Los roles implícitos de HTML (`<output>` = `status`) también cuentan cuando consultás por rol.
