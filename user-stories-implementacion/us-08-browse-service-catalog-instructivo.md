# Instructivo US-08: catálogo de servicios (JavaScript)

Guía para implementar [US-08](../user-stories/us-08-browse-service-catalog.md) con el
[flujo](00-workflow.md). Es la story de la clase 4 y 5: contenedor → lista → ítem.
Formato de los pasos: [Formato de los instructivos](00-workflow.md#formato-de-los-instructivos).

## Qué vas a construir

```
ItemListContainer   (contenedor: usa useProducts y decide qué mostrar: cargando / error / vacío / lista)
   └─ ItemList      (recibe un array y dibuja un Item por elemento)
        └─ Item     (presentacional: recibe UN producto por props)
```

> **Concepto — los cuatro estados de una lista remota:** *cargando*, *error*, *vacío*, *con datos*.
> Un componente que solo contempla el último parece roto con una red lenta. El contenedor decide en
> este orden: `loading → error → vacío → lista`.
>
> **Concepto — `Intl.NumberFormat`:** formateo de moneda/números del navegador (y de Node en los
> tests). Evita armar `"$" + precio` a mano y respeta el idioma.

> **Rutas y carpetas reales de este proyecto:**
>
> - El catálogo se ve en **`/servicios`** y el detalle en **`/servicio/:id`** (`src/App.jsx`).
> - La página `ItemListContainer` **ya existe** (provisoria, desde US-02) en
>   `src/features/services/pages/ItemListContainer.jsx`: **se edita ahí**, no se crea otra.
> - Los componentes nuevos `Item` e `ItemList` y el hook de US-07 viven en `src/features/products/`.
> - El título de la página sigue siendo la clave que ya existe: `nav.services` ("Servicios").

## Mapa de archivos

| Ciclo | Archivo | Acción |
| ----- | ------- | ------ |
| 0 | `test/styles/components.test.js` | editar (lista `pending`) |
| 0, 9–13 | `test/App.test.jsx` | editar (handler de red para el catálogo) |
| 1–13 | `src/i18n/locales/es.json`, `src/i18n/locales/en.json` | editar (claves `catalog.*`, `categories.*`) |
| 1–2 | `test/shared/formatPrice.test.js` | **crear** |
| 1–2 | `src/shared/formatPrice.js` | **crear** |
| 3–7 | `test/features/products/components/Item.test.jsx` | **crear** |
| 3–7 | `src/features/products/components/Item.jsx` | **crear** |
| 8 | `test/features/products/components/ItemList.test.jsx` | **crear** |
| 8 | `src/features/products/components/ItemList.jsx` | **crear** |
| 9–13 | `test/features/services/pages/ItemListContainer.test.jsx` | **crear** |
| 9–12 | `src/features/services/pages/ItemListContainer.jsx` | editar (era provisoria) |
| S1 | `test/styles/tokens.test.js`, `src/styles/tokens.css` | editar |
| S2 | `src/features/products/components/Item.module.css` | **crear** |
| S2 | `src/features/products/components/ItemList.module.css` | **crear** |
| S3 | `src/features/services/pages/ItemListContainer.module.css` | **crear** |

## Paso 0: Preparar

```sh
git switch main && git pull
git switch -c us-08-browse-service-catalog
pnpm verify
cp <ruta-a>/javascript/user-stories/us-08-browse-service-catalog.md docs/
git add docs && git commit -m "docs: add US-08 browse service catalog story"
```

### Registrar los componentes nuevos como "sin estilos todavía"

**Archivo:** `test/styles/components.test.js`
**Dónde:** el array `pending` (al principio del archivo). Agregá estas dos rutas **al final** del
array. (Si no, ese test se pone rojo apenas crees cada `.jsx`.)

```js
const pending = [
  "src/features/services/pages/ItemListContainer.jsx",
  "src/features/services/pages/ItemDetailContainer.jsx",
  "src/features/cart/pages/CartPage.jsx",
  "src/features/products/components/Item.jsx",
  "src/features/products/components/ItemList.jsx",
];
```

(`ItemListContainer.jsx` ya está en la lista desde US-05.)

### Que los tests de `App` no fallen por la red

Desde este story, la página `/servicios` pide datos. En `test/setup.js` (US-07) cualquier pedido sin
handler hace fallar el test, y `test/App.test.jsx` renderiza esa página sin handler.

**Archivo:** `test/App.test.jsx`

1. **Dónde (imports, junto a los demás):** agregá estos tres imports.

   ```jsx
   import { beforeEach } from "vitest";
   import { productsHandler } from "./handlers";
   import { server } from "./server";
   ```

   (Si ya importás `describe, expect, it` de `vitest`, sumá `beforeEach` en esa misma línea en vez
   de repetir el import.)

2. **Dónde (primera línea dentro de `describe("App routes", ...)`, antes del primer `it`):**

   ```jsx
     beforeEach(() => {
       server.use(productsHandler());
     });
   ```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

```sh
git add -A && git commit -m "test: register the catalog components as pending styles"
```

---

## Ciclo 1 — Formato de precio en español

### 1. 🔴 Escribir el test

**Archivo:** `test/shared/formatPrice.test.js` (**crealo**).
**Dónde:** el archivo entero.

```js
import { describe, expect, it } from "vitest";
import { formatPrice } from "../../src/shared/formatPrice";

const plain = (text) => text.replace(/\s/g, " ");

describe("formatPrice", () => {
  it("formats dollars for a Spanish speaker", () => {
    expect(plain(formatPrice(350, "es"))).toBe("US$ 350");
  });
});
```

> ICU usa espacios "duros" (no separables) en las monedas; `plain` los normaliza para comparar.

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Failed to resolve import "../../src/shared/formatPrice"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/shared/formatPrice.js` (**crealo**).
**Dónde:** el archivo entero.

```js
export function formatPrice(amount) {
	return new Intl.NumberFormat("es-AR", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(amount);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(shared): format prices in dollars"
```

---

## Ciclo 2 — Formato de precio en inglés

### 1. 🔴 Escribir el test

**Archivo:** `test/shared/formatPrice.test.js`
**Dónde:** dentro del `describe("formatPrice", ...)`, después del test del ciclo 1.

```js
  it("formats dollars for an English speaker", () => {
    expect(plain(formatPrice(350, "en"))).toBe("$350");
  });
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
expected 'US$ 350' to be '$350'
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/shared/formatPrice.js`
**Dónde:** reemplazá el archivo entero (la función recibe `language` y elige el *locale*).

```js
export function formatPrice(amount, language) {
	const locale = language === "en" ? "en-US" : "es-AR";
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(amount);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(shared): format prices by language"
```

---

## Ciclo 3 — `Item` muestra el título

### 1. 🔴 Escribir el test

**Archivo:** `test/features/products/components/Item.test.jsx` (**crealo**; las carpetas
`test/features/products/components/` son nuevas).
**Dónde:** el archivo entero.

```jsx
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Item } from "../../../../src/features/products/components/Item";
import { makeProduct } from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";

describe("Item", () => {
  it("shows the title of the product", () => {
    renderWithProviders(<Item product={makeProduct(1)} />);
    expect(screen.getByRole("heading", { name: "Servicio 1" })).toBeInTheDocument();
  });
});
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Failed to resolve import "../../../../src/features/products/components/Item"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/products/components/Item.jsx` (**crealo**; la carpeta
`src/features/products/components/` es nueva).
**Dónde:** el archivo entero.

```jsx
import { useTranslation } from "react-i18next";
import { localized } from "../../../shared/localized";

export function Item({ product }) {
	const { i18n } = useTranslation();
	return (
		<article>
			<h3>{localized(product.title, i18n.resolvedLanguage)}</h3>
		</article>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(products): add the item with its title"
```

---

## Ciclo 4 — Imagen con texto alternativo

### 1. 🔴 Escribir el test

**Archivo:** `test/features/products/components/Item.test.jsx`
**Dónde:** dentro del `describe("Item", ...)`, después del test del ciclo 3.

```jsx
  it("shows the image with the title as alternative text", () => {
    renderWithProviders(<Item product={makeProduct(1)} />);
    const image = screen.getByRole("img", { name: "Servicio 1" });
    expect(image).toHaveAttribute("src", "/images/service-1.svg");
  });
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Unable to find an accessible element with the role "img" and name "Servicio 1"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/products/components/Item.jsx`
**Dónde:** reemplazá el archivo entero (el título se calcula una vez en `title` y se usa en la
`<img>` y en el `<h3>`).

```jsx
import { useTranslation } from "react-i18next";
import { localized } from "../../../shared/localized";

export function Item({ product }) {
	const { i18n } = useTranslation();
	const title = localized(product.title, i18n.resolvedLanguage);
	return (
		<article>
			<img
				src={product.image}
				alt={title}
				loading="lazy"
				width="320"
				height="200"
			/>
			<h3>{title}</h3>
		</article>
	);
}
```

> `loading="lazy"` y `width/height` evitan descargar imágenes fuera de pantalla y saltos de diseño.

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(products): show the item image"
```

---

## Ciclo 5 — Precio formateado

### 1. 🔴 Escribir el test

**Archivo:** `test/features/products/components/Item.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 4.

```jsx
  it("shows the formatted price", () => {
    renderWithProviders(<Item product={makeProduct(1)} />);
    expect(screen.getByText("US$ 100")).toBeInTheDocument();
  });
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Unable to find an element with the text: US$ 100
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/products/components/Item.jsx`
**Dónde:** reemplazá el archivo entero (nuevo import de `formatPrice`, variable `language` y un `<p>`).

```jsx
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";

export function Item({ product }) {
	const { i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	const title = localized(product.title, language);
	return (
		<article>
			<img
				src={product.image}
				alt={title}
				loading="lazy"
				width="320"
				height="200"
			/>
			<h3>{title}</h3>
			<p>{formatPrice(product.price, language)}</p>
		</article>
	);
}
```

> `getByText` normaliza los espacios duros, por eso el literal con espacio normal funciona.

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(products): show the item price"
```

---

## Ciclo 6 — Categoría

### 1. Agregar las categorías en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** clave nueva de primer nivel, después de `"home"` y antes de `"nav"`.

```json
"categories": {
	"web": "Web",
	"backend": "Backend",
	"mentoring": "Mentoría",
	"devops": "DevOps"
},
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"categories": {
	"web": "Web",
	"backend": "Backend",
	"mentoring": "Mentoring",
	"devops": "DevOps"
},
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/products/components/Item.test.jsx`

1. **Dónde (imports):** agregá el catálogo en español, junto a los demás imports:

   ```jsx
   import es from "../../../../src/i18n/locales/es.json";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 5.

   ```jsx
     it("shows the category", () => {
       renderWithProviders(<Item product={makeProduct(1)} />);
       expect(screen.getByText(es.categories.web)).toBeInTheDocument();
     });
   ```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Unable to find an element with the text: Web
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/products/components/Item.jsx`
**Dónde:** reemplazá el archivo entero (ahora también usa `t`).

```jsx
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";

export function Item({ product }) {
	const { t, i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	const title = localized(product.title, language);
	return (
		<article>
			<img
				src={product.image}
				alt={title}
				loading="lazy"
				width="320"
				height="200"
			/>
			<h3>{title}</h3>
			<p>{t(`categories.${product.category}`)}</p>
			<p>{formatPrice(product.price, language)}</p>
		</article>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde (incluido el test de paridad de catálogos).

### 4. Commit

```sh
git add -A && git commit -m "feat(products): show the item category"
```

---

## Ciclo 7 — Link al detalle

### 1. Agregar el texto del link en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** clave nueva de primer nivel, después de `"categories"`.

```json
"catalog": {
	"viewDetail": "Ver detalle"
},
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"catalog": {
	"viewDetail": "View details"
},
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/products/components/Item.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 6.

```jsx
  it("links to the detail page of the product", () => {
    renderWithProviders(<Item product={makeProduct(1)} />);
    expect(screen.getByRole("link", { name: /Ver detalle/ })).toHaveAttribute("href", "/servicio/service-1");
  });
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Unable to find an accessible element with the role "link" and name `/Ver detalle/`
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/products/components/Item.jsx`
**Dónde:** reemplazá el archivo entero (nuevo import de `Link` y el `<Link>` al final del `article`).

```jsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";

export function Item({ product }) {
	const { t, i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	const title = localized(product.title, language);
	return (
		<article>
			<img
				src={product.image}
				alt={title}
				loading="lazy"
				width="320"
				height="200"
			/>
			<h3>{title}</h3>
			<p>{t(`categories.${product.category}`)}</p>
			<p>{formatPrice(product.price, language)}</p>
			<Link
				to={`/servicio/${product.id}`}
				aria-label={`${t("catalog.viewDetail")}: ${title}`}
			>
				{t("catalog.viewDetail")}
			</Link>
		</article>
	);
}
```

> **Accesibilidad:** si todas las tarjetas dicen "Ver detalle", un lector de pantalla no distingue
> cuál es cuál. El `aria-label` agrega el título al nombre accesible.

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(products): link each item to its detail"
```

---

## Ciclo 8 — `ItemList` dibuja un `Item` por producto

### 1. 🔴 Escribir el test

**Archivo:** `test/features/products/components/ItemList.test.jsx` (**crealo**).
**Dónde:** el archivo entero.

```jsx
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ItemList } from "../../../../src/features/products/components/ItemList";
import { makeProduct } from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";

describe("ItemList", () => {
  it("renders one item per product", () => {
    renderWithProviders(<ItemList products={[makeProduct(1), makeProduct(2), makeProduct(3)]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Failed to resolve import "../../../../src/features/products/components/ItemList"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/products/components/ItemList.jsx` (**crealo**).
**Dónde:** el archivo entero.

```jsx
import { Item } from "./Item";

export function ItemList({ products }) {
	return (
		<ul>
			{products.map((product) => (
				<li key={product.id}>
					<Item product={product} />
				</li>
			))}
		</ul>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(products): add the item list"
```

---

## Ciclo 9 — Mientras carga: "Cargando..."

### 1. Agregar el texto de carga en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"catalog"`, antes de `"viewDetail"` (cuidá las comas).

```json
"catalog": {
	"loading": "Cargando...",
	"viewDetail": "Ver detalle"
},
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"catalog": {
	"loading": "Loading...",
	"viewDetail": "View details"
},
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/services/pages/ItemListContainer.test.jsx` (**crealo**; la carpeta
`test/features/services/pages/` es nueva).
**Dónde:** el archivo entero.

```jsx
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ItemListContainer } from "../../../../src/features/services/pages/ItemListContainer";
import { productsHandler } from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";
import { server } from "../../../server";

describe("ItemListContainer", () => {
  it("shows a loading message while the products load", () => {
    server.use(productsHandler());
    renderWithProviders(<ItemListContainer />);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando...");
  });
});
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Unable to find an accessible element with the role "status"
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/pages/ItemListContainer.jsx` (ya existe).
**Dónde:** reemplazá el archivo entero. El `<h1>` se mantiene con la clave de siempre.

```jsx
import { useTranslation } from "react-i18next";
import { useProducts } from "../../products/hooks/useProducts";

export function ItemListContainer() {
	const { t } = useTranslation();
	const { loading } = useProducts();
	return (
		<>
			<h1>{t("nav.services")}</h1>
			{loading && <p role="status">{t("catalog.loading")}</p>}
		</>
	);
}
```

> `cond && <X />`: si `cond` es verdadero dibuja `X`, si no, nada. Es la **renderización condicional**
> (clase 9).

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde (incluidos los tests de `App`, que ya
tienen el handler del Paso 0).

### 4. Commit

```sh
git add -A && git commit -m "feat(products): show a loading message in the catalog"
```

---

## Ciclo 10 — Cargó: lista y se va el mensaje

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/pages/ItemListContainer.test.jsx`

1. **Dónde (import de handlers):** sumá `makeProduct`:

   ```jsx
   import { makeProduct, productsHandler } from "../../../handlers";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 9.

   ```jsx
     it("lists the products and hides the loading message once loaded", async () => {
       server.use(productsHandler([makeProduct(1), makeProduct(2), makeProduct(3)]));
       renderWithProviders(<ItemListContainer />);
       expect(await screen.findAllByRole("listitem")).toHaveLength(3);
       expect(screen.queryByRole("status")).not.toBeInTheDocument();
     });
   ```

> `findBy*` **espera** a que el elemento aparezca (asincronía); `queryBy*` devuelve `null` si no
> está (para afirmar ausencia); `getBy*` falla si no está *ahora*.

**Corré:** `pnpm test:run`
**Rojo esperado:** tras el timeout, `Unable to find role="listitem"`.

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/pages/ItemListContainer.jsx`
**Dónde:** reemplazá el archivo entero.

```jsx
import { useTranslation } from "react-i18next";
import { ItemList } from "../../products/components/ItemList";
import { useProducts } from "../../products/hooks/useProducts";

export function ItemListContainer() {
	const { t } = useTranslation();
	const { products, loading } = useProducts();
	return (
		<>
			<h1>{t("nav.services")}</h1>
			{loading && <p role="status">{t("catalog.loading")}</p>}
			{!loading && <ItemList products={products} />}
		</>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(products): list the loaded products"
```

---

## Ciclo 11 — Error: alerta y sin tarjetas

### 1. Agregar el texto de error en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"catalog"`, después de `"loading"`.

```json
"error": "No pudimos cargar los servicios. Probá de nuevo más tarde.",
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"error": "We couldn't load the services. Please try again later.",
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/services/pages/ItemListContainer.test.jsx`

1. **Dónde (import de handlers):** sumá `failingProductsHandler`:

   ```jsx
   import { failingProductsHandler, makeProduct, productsHandler } from "../../../handlers";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 10.

   ```jsx
     it("shows an alert and no cards when the products cannot be loaded", async () => {
       server.use(failingProductsHandler());
       renderWithProviders(<ItemListContainer />);
       expect(await screen.findByRole("alert")).toHaveTextContent(
         "No pudimos cargar los servicios. Probá de nuevo más tarde.",
       );
       expect(screen.queryAllByRole("listitem")).toHaveLength(0);
     });
   ```

**Corré:** `pnpm test:run`
**Rojo esperado:** tras el timeout, `Unable to find role="alert"`.

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/pages/ItemListContainer.jsx`
**Dónde:** reemplazá el archivo entero (lee `error` del hook; la lista solo si `!loading && !error`).

```jsx
import { useTranslation } from "react-i18next";
import { ItemList } from "../../products/components/ItemList";
import { useProducts } from "../../products/hooks/useProducts";

export function ItemListContainer() {
	const { t } = useTranslation();
	const { products, loading, error } = useProducts();
	return (
		<>
			<h1>{t("nav.services")}</h1>
			{loading && <p role="status">{t("catalog.loading")}</p>}
			{error && <p role="alert">{t("catalog.error")}</p>}
			{!loading && !error && <ItemList products={products} />}
		</>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(products): show an alert when loading fails"
```

---

## Ciclo 12 — Catálogo vacío

### 1. Agregar el texto de "vacío" en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"catalog"`, después de `"error"`.

```json
"empty": "Todavía no hay servicios disponibles.",
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"empty": "There are no services available yet.",
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/services/pages/ItemListContainer.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 11.

```jsx
  it("shows a message when there are no products", async () => {
    server.use(productsHandler([]));
    renderWithProviders(<ItemListContainer />);
    expect(await screen.findByText("Todavía no hay servicios disponibles.")).toBeInTheDocument();
  });
```

**Corré:** `pnpm test:run`
**Rojo esperado:** tras el timeout, `Unable to find an element with the text: Todavía no hay servicios disponibles.`

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/pages/ItemListContainer.jsx`
**Dónde:** reemplazá el archivo entero (mensaje de vacío y lista solo si hay productos).

```jsx
import { useTranslation } from "react-i18next";
import { ItemList } from "../../products/components/ItemList";
import { useProducts } from "../../products/hooks/useProducts";

export function ItemListContainer() {
	const { t } = useTranslation();
	const { products, loading, error } = useProducts();
	return (
		<>
			<h1>{t("nav.services")}</h1>
			{loading && <p role="status">{t("catalog.loading")}</p>}
			{error && <p role="alert">{t("catalog.error")}</p>}
			{!loading && !error && products.length === 0 && (
				<p>{t("catalog.empty")}</p>
			)}
			{!loading && !error && products.length > 0 && (
				<ItemList products={products} />
			)}
		</>
	);
}
```

**Corré:** `pnpm verify`. **Resultado esperado:** todo verde (incluye cobertura 100 %).

### 4. Commit

```sh
git add -A && git commit -m "feat(products): show a message when the catalog is empty"
```

### 5. 🔵 Refactor

Ese bloque de `&&` encadenados es difícil de leer. Con los tests en verde, reemplazalo por una
cadena de `if`.

**Archivo:** `src/features/services/pages/ItemListContainer.jsx`
**Dónde:** reemplazá el archivo entero.

```jsx
import { useTranslation } from "react-i18next";
import { ItemList } from "../../products/components/ItemList";
import { useProducts } from "../../products/hooks/useProducts";

export function ItemListContainer() {
	const { t } = useTranslation();
	const { products, loading, error } = useProducts();

	let body;
	if (loading) {
		body = <p role="status">{t("catalog.loading")}</p>;
	} else if (error) {
		body = <p role="alert">{t("catalog.error")}</p>;
	} else if (products.length === 0) {
		body = <p>{t("catalog.empty")}</p>;
	} else {
		body = <ItemList products={products} />;
	}

	return (
		<>
			<h1>{t("nav.services")}</h1>
			{body}
		</>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde (el comportamiento no cambió).

```sh
git add -A && git commit -m "refactor(products): simplify the catalog states"
```

---

## Ciclo 13 — El catálogo sigue al idioma

Este ciclo **no cambia código productivo**: agrega un test que protege que el catálogo en inglés sea
el correcto.

### 1. 🔴 Escribir el test (pasa de entrada)

**Archivo:** `test/features/services/pages/ItemListContainer.test.jsx`

1. **Dónde (imports):** agregá, después del import de `ItemListContainer`:

   ```jsx
   import { i18n } from "../../../../src/i18n";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 12.

   ```jsx
     it("shows the catalog in English", async () => {
       await i18n.changeLanguage("en");
       server.use(productsHandler([makeProduct(1)]));
       renderWithProviders(<ItemListContainer />);
       expect(await screen.findByRole("heading", { name: "Service 1" })).toBeInTheDocument();
       expect(screen.getByRole("link", { name: /View details/ })).toBeInTheDocument();
     });
   ```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

1. En `src/i18n/locales/en.json` cambiá `"viewDetail": "View details"` por `"viewDetail": "Ver detalle"`.
2. **Corré** `pnpm test:run`. **Rojo esperado:** falla `"shows the catalog in English"`.
3. **Restaurá** el texto y corré de nuevo: verde.

### 3. Commit

```sh
git add -A && git commit -m "test(products): translate the catalog"
```

---

## Ciclos de estilo — el catálogo

Seguí el **ciclo de estilo** del [workflow](00-workflow.md#2b-el-css-se-escribe-junto-con-cada-story-y-se-testea-así):
🔴 sacar de `pending`, 🟢 crear el módulo, 🔵 mirar a 360 y 1280 px (con los cuatro estados).

### Ciclo S1 — Un color para los errores (token nuevo)

El mensaje de error no puede usar un color suelto (la barrera lo prohíbe), así que primero va a los
tokens.

**1. 🔴 Test.** **Archivo:** `test/styles/tokens.test.js`
**Dónde:** el array de `it.each([...])`, agregá dos elementos **al final**:

```js
    "--radius",
    "--color-danger",
    "--color-danger-surface",
```

**Corré:** `pnpm test:run`. **Rojo esperado:** `expected '...' to contain '--color-danger:'`.

**2. 🟢 Código.** **Archivo:** `src/styles/tokens.css`
**Dónde:** dentro de `:root`, después de `--color-border`.

```css
	--color-danger: #ff7b72;
	--color-danger-surface: #2d1214;
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

**3. Commit**

```sh
git add -A && git commit -m "style: add the danger color tokens"
```

### Ciclo S2 — Las tarjetas y la grilla

**1. 🔴 Test.** **Archivo:** `test/styles/components.test.js`
**Dónde:** el array `pending`. Borrá estas dos líneas:

```js
  "src/features/products/components/Item.jsx",
  "src/features/products/components/ItemList.jsx",
```

**Corré:** `pnpm test:run`. **Rojo esperado:** la lista de componentes sin módulo nombra `Item.jsx` e
`ItemList.jsx`.

**2. 🟢 Código.**

**Archivo:** `src/features/products/components/Item.module.css` (**crealo**).
**Dónde:** el archivo entero.

```css
.card {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
	background: var(--color-background);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	box-shadow: var(--shadow);
}

.image {
	width: 100%;
	aspect-ratio: 16 / 10;
	object-fit: cover;
}

.body {
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: var(--space-2);
	padding: var(--space-4);
}

.title {
	margin: 0;
	font-size: var(--font-size-lg);
}

.category {
	margin: 0;
	font-size: 0.875rem;
	color: var(--color-muted);
}

.price {
	margin: 0;
	font-size: var(--font-size-lg);
	font-weight: 700;
}

.link {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 2.75rem;
	margin-top: auto;
	padding: 0 var(--space-4);
	font-weight: 600;
	color: var(--color-primary-contrast);
	text-decoration: none;
	background: var(--color-primary);
	border-radius: var(--radius);
}
```

**Archivo:** `src/features/products/components/ItemList.module.css` (**crealo**).
**Dónde:** el archivo entero.

```css
.list {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
	gap: var(--space-4);
	margin: 0;
	padding: 0;
	list-style: none;
}
```

**Archivo:** `src/features/products/components/Item.jsx`
**Dónde:** reemplazá el archivo entero (import de estilos y `className` en cada elemento; los
textos y etiquetas no cambian, y título, categoría, precio y link quedan dentro de un `div.body`).

```jsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";
import styles from "./Item.module.css";

export function Item({ product }) {
	const { t, i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	const title = localized(product.title, language);
	return (
		<article className={styles.card}>
			<img
				className={styles.image}
				src={product.image}
				alt={title}
				loading="lazy"
				width="320"
				height="200"
			/>
			<div className={styles.body}>
				<h3 className={styles.title}>{title}</h3>
				<p className={styles.category}>{t(`categories.${product.category}`)}</p>
				<p className={styles.price}>{formatPrice(product.price, language)}</p>
				<Link
					className={styles.link}
					to={`/servicio/${product.id}`}
					aria-label={`${t("catalog.viewDetail")}: ${title}`}
				>
					{t("catalog.viewDetail")}
				</Link>
			</div>
		</article>
	);
}
```

**Archivo:** `src/features/products/components/ItemList.jsx`
**Dónde:** reemplazá el archivo entero.

```jsx
import { Item } from "./Item";
import styles from "./ItemList.module.css";

export function ItemList({ products }) {
	return (
		<ul className={styles.list}>
			{products.map((product) => (
				<li key={product.id}>
					<Item product={product} />
				</li>
			))}
		</ul>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

**3. 🔵 Mirar el navegador** (`pnpm dev`, `/servicios`). La imagen ya tiene `width`/`height` en el
HTML y acá `aspect-ratio`: el espacio queda reservado y la página no salta cuando la imagen carga.
Todas las tarjetas de una fila miden lo mismo (el botón queda abajo gracias a `margin-top: auto`).
Probalo con un título largo.

**4. Commit**

```sh
git add -A && git commit -m "style(products): style the item card and the catalog grid"
```

### Ciclo S3 — Los cuatro estados de la página

**1. 🔴 Test.** **Archivo:** `test/styles/components.test.js`
**Dónde:** el array `pending`. Borrá esta línea:

```js
  "src/features/services/pages/ItemListContainer.jsx",
```

**Corré:** `pnpm test:run`. **Rojo esperado:** el test nombra `ItemListContainer.jsx` sin módulo.

**2. 🟢 Código.**

**Archivo:** `src/features/services/pages/ItemListContainer.module.css` (**crealo**).
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

.status,
.empty {
	margin: 0;
	padding: var(--space-4);
	text-align: center;
	color: var(--color-muted);
}

.alert {
	margin: 0;
	padding: var(--space-4);
	font-weight: 600;
	background: var(--color-danger-surface);
	border: 1px solid var(--color-danger);
	border-radius: var(--radius);
}
```

**Archivo:** `src/features/services/pages/ItemListContainer.jsx`
**Dónde:** reemplazá el archivo entero (el fragmento pasa a `<section className={styles.page}>` y
cada estado recibe su clase).

```jsx
import { useTranslation } from "react-i18next";
import { ItemList } from "../../products/components/ItemList";
import { useProducts } from "../../products/hooks/useProducts";
import styles from "./ItemListContainer.module.css";

export function ItemListContainer() {
	const { t } = useTranslation();
	const { products, loading, error } = useProducts();

	let body;
	if (loading) {
		body = (
			<p className={styles.status} role="status">
				{t("catalog.loading")}
			</p>
		);
	} else if (error) {
		body = (
			<p className={styles.alert} role="alert">
				{t("catalog.error")}
			</p>
		);
	} else if (products.length === 0) {
		body = <p className={styles.empty}>{t("catalog.empty")}</p>;
	} else {
		body = <ItemList products={products} />;
	}

	return (
		<section className={styles.page}>
			<h1 className={styles.title}>{t("nav.services")}</h1>
			{body}
		</section>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

**3. 🔵 Mirar el navegador.** Probá **los cuatro estados**: carga (DevTools → *Network* → *Slow
4G*), error (bloqueá `productos.json`), vacío (`[]` en `public/productos.json`, y restauralo) y
lista. El error se distingue por el texto y el borde, no solo por el color.

**4. Commit**

```sh
git add -A && git commit -m "style(products): style the catalog states"
```

---

## Verificación manual

- [ ] `pnpm dev`, `/servicios`: se ven las tarjetas con imagen, categoría y precio.
- [ ] **Red lenta:** DevTools → *Network* → *Slow 4G* → recargá: aparece "Cargando...".
- [ ] **Error:** DevTools → *Network* → clic derecho en `productos.json` → *Block request URL* →
      recargá: aparece la alerta. Desbloqueá.
- [ ] Teclado: Tab pasa por cada "Ver detalle". 360 px: nada se sale. Sin errores en consola.
- [ ] Los cuatro estados (carga, error, vacío, lista) se ven bien a 360 y a 1280 px; el foco de cada "Ver detalle" se ve con Tab.

## Publicar

```sh
git push -u origin us-08-browse-service-catalog
gh pr create --fill --base main && gh pr checks --watch
```

Squash merge: `feat: browse the catalog of services (US-08)`.

## Commits sugeridos

```
docs: add US-08 browse service catalog story
test: register the catalog components as pending styles
feat(shared): format prices in dollars
feat(shared): format prices by language
feat(products): add the item with its title
feat(products): show the item image
feat(products): show the item price
feat(products): show the item category
feat(products): link each item to its detail
feat(products): add the item list
feat(products): show a loading message in the catalog
feat(products): list the loaded products
feat(products): show an alert when loading fails
feat(products): show a message when the catalog is empty
refactor(products): simplify the catalog states
test(products): translate the catalog
style: add the danger color tokens
style(products): style the item card and the catalog grid
style(products): style the catalog states
```

## Definition of Done

- [ ] Todos los escenarios pasan como tests.
- [ ] `pnpm verify` y el pipeline en verde; verificación manual hecha (red lenta y bloqueo).
- [ ] Commits convencionales.
- [ ] `Item`, `ItemList` e `ItemListContainer` tienen su `.module.css` y salieron de `pending`.

## Qué aprendiste

- Contenedor/presentacional en tres niveles (clase 4) y los cuatro estados de una lista remota.
- `getBy` vs `queryBy` vs `findBy`.
- Un refactor con tests en verde: de `&&` encadenados a `if`s tempranos.
- Una página que antes no pedía datos ahora los pide: los tests viejos que la renderizan necesitan
  un handler de red (`server.use(productsHandler())`).
