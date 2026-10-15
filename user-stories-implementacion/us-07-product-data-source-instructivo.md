# Instructivo US-07: fuente de datos de servicios (JavaScript)

Guía para implementar [US-07](../user-stories/us-07-product-data-source.md) con el
[flujo](00-workflow.md). Es una story **técnica**: no hay pantalla nueva, hay una *costura*
(seam): componentes → hook → servicio → `fetch`.
Formato de los pasos: [Formato de los instructivos](00-workflow.md#formato-de-los-instructivos).

## Qué vas a construir

```
componente  ──usa──▶  useProducts()  ──llama──▶  productsApi  ──fetch──▶  /productos.json
 (US-08)            (estado: loading,            (único que sabe           (archivo en public/)
                     products, error)             de fetch y URL)
```

Mañana, para pasar a Firebase (US-17), se reescribe **solo** `productsApi`.

> **Concepto — efecto secundario (`useEffect`, clase 5):** pedir datos es algo que pasa *fuera* del
> dibujado. `useEffect(() => { ... }, [])` corre después del primer render (el `[]` = "una sola
> vez"). Adentro pedimos los datos y guardamos el resultado en estado (`useState`), lo que vuelve a
> dibujar el componente.
>
> **Concepto — MSW:** intercepta los `fetch` **en la red simulada** del test. Tu código hace un
> `fetch` de verdad; MSW responde lo que vos definís. Así el test no depende de internet y prueba
> la URL real.

> **Nombres:** el *archivo de datos* se llama `public/productos.json` y la *feature* de datos
> `src/features/products/` (así lo define la story). La **ruta** del catálogo es `/productos` y su
> página vive en `src/features/products/pages/`. En el código se dice *product*; en la interfaz,
> *servicio*.

## Mapa de archivos

| Paso/ciclo | Archivo | Acción |
| ---------- | ------- | ------ |
| 0 | `package.json` (por `pnpm add -D msw`) | editar |
| 0 | `vite.config.js` | editar (`pool`) |
| 0 | `test/server.js` | **crear** |
| 0 | `test/handlers.js` | **crear** |
| 0 | `test/setup.js` | editar |
| 1–4 | `test/features/products/services/productsApi.test.js` | **crear** en el ciclo 1, editar después |
| 1–4, 10 | `src/features/products/services/productsApi.js` | **crear** en el ciclo 1, editar después |
| 5–6 | `test/shared/localized.test.js` | **crear** en el ciclo 5, editar en el 6 |
| 5–6 | `src/shared/localized.js` | **crear** en el ciclo 5, editar en el 6 |
| 7–11 | `test/features/products/hooks/useProducts.test.js` | **crear** en el ciclo 7, editar después |
| 7–11 | `src/features/products/hooks/useProducts.js` | **crear** en el ciclo 7, editar después |
| 12 | `test/features/products/productos.test.js` | **crear** |
| 12 | `public/productos.json` | **crear** |
| 12 | `public/images/<id>.svg` (uno por servicio) | **crear** |

## Paso 0: Preparar e infraestructura de tests

```sh
git switch main && git pull
git switch -c us-07-product-data-source
pnpm verify
cp <ruta-a>/javascript/user-stories/us-07-product-data-source.md docs/
git add docs && git commit -m "docs: add US-07 product data source story"
pnpm add -D msw
```

### Ajustar Vitest para que MSW funcione

MSW necesita las APIs web de streams (`WritableStream`, etc.) y el modo `vmThreads` con el que viene
configurado el proyecto no las expone: sin este cambio, cualquier test que importe `msw` falla con
`ReferenceError: WritableStream is not defined`.

**Archivo:** `vite.config.js`
**Dónde:** dentro de `test: { ... }`, la línea `pool`. Cambiá `"vmThreads"` por `"forks"`:

```js
    pool: "forks",
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde (todavía nada usa MSW).

### Crear el servidor de pruebas

**Archivo:** `test/server.js` (**crealo**).
**Dónde:** el archivo entero.

```js
import { setupServer } from "msw/node";

export const server = setupServer();
```

### Crear los handlers y los datos de prueba

**Archivo:** `test/handlers.js` (**crealo**).
**Dónde:** el archivo entero (handlers y datos de prueba reutilizables).

```js
import { HttpResponse, http } from "msw";

export function makeProduct(n = 1) {
  return {
    id: `product-${n}`,
    title: { es: `Servicio ${n}`, en: `Service ${n}` },
    description: { es: `Descripción ${n}`, en: `Description ${n}` },
    price: 100 * n,
    category: "web",
    image: `/images/product-${n}.svg`,
  };
}

export function productsHandler(products = [makeProduct(1), makeProduct(2), makeProduct(3)]) {
  return http.get("*/productos.json", () => HttpResponse.json(products));
}

export function failingProductsHandler() {
  return http.get("*/productos.json", () => HttpResponse.json({ message: "boom" }, { status: 500 }));
}
```

> El patrón `*/productos.json` significa "cualquier origen". El `HttpResponse.json(..., {status:500})`
> responde con JSON **válido** y estado 500: así un servicio que olvide mirar `response.ok` se nota.

### Conectar el servidor a todos los tests

**Archivo:** `test/setup.js`
**Dónde:** reemplazá el archivo entero (suma los imports de `afterAll`, `beforeAll` y `server`, y
tres líneas nuevas al final; lo que ya había queda igual).

```js
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { i18n } from "../src/i18n";
import { server } from "./server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

beforeEach(async () => {
  await i18n.changeLanguage("es");
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());
```

> `onUnhandledRequest: "error"` hace fallar el test si tu código pide algo que no mockeaste.

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde (nada pide red todavía).

```sh
git add -A && git commit -m "chore(test): set up msw for network mocking"
```

(Knip puede quejarse de `handlers.js` hasta el ciclo 1; el commit pasa y el `pre-push` ya lo usa.)

---

## Ciclo 1 — `getProducts` devuelve los servicios del JSON

### 1. 🔴 Escribir el test

**Archivo:** `test/features/products/services/productsApi.test.js` (**crealo**; las carpetas
`test/features/products/services/` son nuevas).
**Dónde:** el archivo entero.

```js
import { describe, expect, it } from "vitest";
import { getProducts } from "../../../../src/features/products/services/productsApi";
import { makeProduct, productsHandler } from "../../../handlers";
import { server } from "../../../server";

describe("getProducts", () => {
  it("returns the products served at /productos.json", async () => {
    server.use(productsHandler([makeProduct(1), makeProduct(2), makeProduct(3)]));
    const products = await getProducts();
    expect(products).toHaveLength(3);
  });
});
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Failed to resolve import "../../../../src/features/products/services/productsApi"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/products/services/productsApi.js` (**crealo**; las carpetas
`src/features/products/services/` son nuevas).
**Dónde:** el archivo entero.

```js
export async function getProducts() {
	const response = await fetch(
		new URL("/productos.json", window.location.origin),
	);
	return response.json();
}
```

> **Por qué `new URL(..., window.location.origin)`:** Node (donde corren los tests) no acepta URLs
> relativas en `fetch`; en el navegador anda igual. Usá siempre `/productos.json` con barra inicial:
> los archivos de `public/` cuelgan de la raíz del sitio, aun estando en `/producto/abc`.

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(products): load the products from the json file"
```

---

## Ciclo 2 — Si el servidor falla, el servicio rechaza

### 1. 🔴 Escribir el test

**Archivo:** `test/features/products/services/productsApi.test.js`

1. **Dónde (import de handlers):** sumá `failingProductsHandler`:

   ```js
   import { failingProductsHandler, makeProduct, productsHandler } from "../../../handlers";
   ```

2. **Dónde (dentro de `describe("getProducts", ...)`):** después del test del ciclo 1.

   ```js
     it("rejects when the server answers with an error", async () => {
       server.use(failingProductsHandler());
       await expect(getProducts()).rejects.toThrow();
     });
   ```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
promise resolved "{ message: 'boom' }" instead of rejecting
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/products/services/productsApi.js`
**Dónde:** entre la línea del `fetch` y el `return`.

```js
export async function getProducts() {
	const response = await fetch(new URL("/productos.json", window.location.origin));
	if (!response.ok) {
		throw new Error(`Could not load the products (${response.status})`);
	}
	return response.json();
}
```

> **Concepto:** `fetch` **no** falla con un 404/500: solo falla si no hay red. Por eso hay que mirar
> `response.ok` a mano. Es el error más común con `fetch`.

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(products): reject when the products cannot be loaded"
```

---

## Ciclo 3 — `getProductById` encuentra un servicio

### 1. 🔴 Escribir el test

**Archivo:** `test/features/products/services/productsApi.test.js`

1. **Dónde (import de `productsApi`):** sumá `getProductById`:

   ```js
   import { getProductById, getProducts } from "../../../../src/features/products/services/productsApi";
   ```

2. **Dónde (al final del archivo):** un `describe` nuevo, **después** del `});` que cierra
   `describe("getProducts", ...)`.

   ```js
   describe("getProductById", () => {
     it("returns the product with that id", async () => {
       server.use(productsHandler([makeProduct(1), makeProduct(2)]));
       const product = await getProductById("product-2");
       expect(product).toEqual(makeProduct(2));
     });
   });
   ```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
getProductById is not a function
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/products/services/productsApi.js`
**Dónde:** al final del archivo, después de `getProducts`.

```js
export async function getProductById(id) {
	const products = await getProducts();
	return products.find((product) => product.id === id);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(products): find a product by id"
```

---

## Ciclo 4 — Id desconocido → `null`

### 1. 🔴 Escribir el test

**Archivo:** `test/features/products/services/productsApi.test.js`
**Dónde:** dentro de `describe("getProductById", ...)`, **después** del test del ciclo 3.

```js
  it("returns null when no product has that id", async () => {
    server.use(productsHandler([makeProduct(1)]));
    expect(await getProductById("does-not-exist")).toBeNull();
  });
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
expected undefined to be null
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/products/services/productsApi.js`
**Dónde:** en `getProductById`, agregá `?? null` al final del `return`.

```js
export async function getProductById(id) {
	const products = await getProducts();
	return products.find((product) => product.id === id) ?? null;
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

> Decisión: "no existe" es un caso **esperado** (`null`); "falló la red" es un **error** (rechazo).

### 3. Commit

```sh
git add -A && git commit -m "feat(products): return null for an unknown id"
```

---

## Ciclo 5 — `localized` elige el idioma

### 1. 🔴 Escribir el test

**Archivo:** `test/shared/localized.test.js` (**crealo**; la carpeta `test/shared/` puede existir
si ya hiciste US-06, si no es nueva).
**Dónde:** el archivo entero.

```js
import { describe, expect, it } from "vitest";
import { localized } from "../../src/shared/localized";

describe("localized", () => {
  it("picks the text of the requested language", () => {
    expect(localized({ es: "Hola", en: "Hello" }, "en")).toBe("Hello");
  });
});
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Failed to resolve import "../../src/shared/localized"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/shared/localized.js` (**crealo**; la carpeta `src/shared/` puede existir por US-06).
**Dónde:** el archivo entero.

```js
export function localized(field, language) {
	return field[language];
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(shared): pick a localized text by language"
```

---

## Ciclo 6 — Idioma no soportado → español

### 1. 🔴 Escribir el test

**Archivo:** `test/shared/localized.test.js`
**Dónde:** dentro de `describe("localized", ...)`, **después** del test del ciclo 5.

```js
  it("falls back to Spanish for any other language", () => {
    expect(localized({ es: "Hola", en: "Hello" }, "fr")).toBe("Hola");
  });
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
expected undefined to be 'Hola'
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/shared/localized.js`
**Dónde:** el `return` de la función.

```js
export function localized(field, language) {
	return field[language] ?? field.es;
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(shared): fall back to Spanish when a language is missing"
```

---

## Ciclo 7 — El hook arranca "cargando"

### 1. 🔴 Escribir el test

**Archivo:** `test/features/products/hooks/useProducts.test.js` (**crealo**; las carpetas
`test/features/products/hooks/` son nuevas).
**Dónde:** el archivo entero.

```js
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useProducts } from "../../../../src/features/products/hooks/useProducts";
import { productsHandler } from "../../../handlers";
import { server } from "../../../server";

describe("useProducts", () => {
  it("starts loading with no products and no error", () => {
    server.use(productsHandler());
    const { result } = renderHook(() => useProducts());
    expect(result.current).toEqual({ products: [], loading: true, error: null });
  });
});
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Failed to resolve import "../../../../src/features/products/hooks/useProducts"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/products/hooks/useProducts.js` (**crealo**; las carpetas
`src/features/products/hooks/` son nuevas).
**Dónde:** el archivo entero. (*Fake it*: valor fijo, todavía sin efecto.)

```js
export function useProducts() {
	return { products: [], loading: true, error: null };
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(products): add the products hook in its loading state"
```

---

## Ciclo 8 — El hook expone los servicios cargados

### 1. 🔴 Escribir el test

**Archivo:** `test/features/products/hooks/useProducts.test.js`

1. **Dónde (primer import):** sumá `waitFor`:

   ```js
   import { renderHook, waitFor } from "@testing-library/react";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 7.

   ```js
     it("exposes the products once they are loaded", async () => {
       server.use(productsHandler());
       const { result } = renderHook(() => useProducts());
       await waitFor(() => expect(result.current.loading).toBe(false));
       expect(result.current.products).toHaveLength(3);
       expect(result.current.error).toBeNull();
     });
   ```

**Corré:** `pnpm test:run`
**Rojo esperado:** se agota el tiempo del `waitFor`: `expected true to be false` (el hook nunca deja
de cargar).

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/products/hooks/useProducts.js`
**Dónde:** reemplazá el archivo entero.

```js
import { useEffect, useState } from "react";
import { getProducts } from "../services/productsApi";

export function useProducts() {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		getProducts().then((data) => {
			setProducts(data);
			setLoading(false);
		});
	}, []);

	return { products, loading, error };
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde. (`setError` todavía no se usa: el
linter puede avisar; se usa en el ciclo 9.)

### 3. Commit

```sh
git add -A && git commit -m "feat(products): load the products in the hook"
```

---

## Ciclo 9 — El hook expone el error

### 1. 🔴 Escribir el test

**Archivo:** `test/features/products/hooks/useProducts.test.js`

1. **Dónde (import de handlers):** sumá `failingProductsHandler`:

   ```js
   import { failingProductsHandler, productsHandler } from "../../../handlers";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 8.

   ```js
     it("exposes an error when the products cannot be loaded", async () => {
       server.use(failingProductsHandler());
       const { result } = renderHook(() => useProducts());
       await waitFor(() => expect(result.current.loading).toBe(false));
       expect(result.current.error).toBeInstanceOf(Error);
       expect(result.current.products).toEqual([]);
     });
   ```

**Corré:** `pnpm test:run`
**Rojo esperado:** se agota el tiempo del `waitFor` (la promesa rechazada nunca apaga `loading`).

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/products/hooks/useProducts.js`
**Dónde:** dentro del `useEffect`, encadená un `.catch` **después** del `.then(...)`.

```js
	useEffect(() => {
		getProducts()
			.then((data) => {
				setProducts(data);
				setLoading(false);
			})
			.catch((err) => {
				setError(err);
				setLoading(false);
			});
	}, []);
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(products): expose loading errors in the hook"
```

---

## Ciclo 10 — Al desmontar se cancela el pedido

> **Concepto — limpieza del efecto:** la función que devolvés de `useEffect` corre al desmontar el
> componente. Ahí se cancela lo que quedó pendiente. `AbortController` cancela un `fetch`.

### 1. 🔴 Escribir el test

**Archivo:** `test/features/products/hooks/useProducts.test.js`

1. **Dónde (imports de `vitest`):** sumá `afterEach` y `vi`:

   ```js
   import { afterEach, describe, expect, it, vi } from "vitest";
   ```

2. **Dónde (dentro del `describe`, arriba de todos los tests):** limpiá los espías después de cada test:

   ```js
     afterEach(() => {
       vi.restoreAllMocks();
     });
   ```

3. **Dónde (dentro del `describe`, al final):** después del test del ciclo 9.

   ```js
     it("aborts the pending request when the component unmounts", () => {
       server.use(productsHandler());
       const fetchSpy = vi.spyOn(globalThis, "fetch");
       const { unmount } = renderHook(() => useProducts());
       unmount();
       expect(fetchSpy.mock.calls[0][1]?.signal?.aborted).toBe(true);
     });
   ```

**Corré:** `pnpm test:run`
**Rojo esperado:** `expected undefined to be true` (se llamó a `fetch` sin señal) o
`Cannot read properties of undefined`.

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/products/services/productsApi.js`
**Dónde:** `getProducts` recibe la señal y se la pasa a `fetch`. Reemplazá la función completa
(`getProductById` no cambia):

```js
export async function getProducts({ signal } = {}) {
	const response = await fetch(new URL("/productos.json", window.location.origin), { signal });
	if (!response.ok) {
		throw new Error(`Could not load the products (${response.status})`);
	}
	return response.json();
}
```

**Archivo:** `src/features/products/hooks/useProducts.js`
**Dónde:** reemplazá el `useEffect` completo.

```js
	useEffect(() => {
		const controller = new AbortController();
		getProducts({ signal: controller.signal })
			.then((data) => {
				setProducts(data);
				setLoading(false);
			})
			.catch((err) => {
				setError(err);
				setLoading(false);
			});
		return () => controller.abort();
	}, []);
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(products): abort the request when the hook unmounts"
```

---

## Ciclo 11 — Un pedido cancelado no es un error

React en desarrollo (`StrictMode`) monta, desmonta y vuelve a montar cada componente: el primer
pedido se cancela. Eso **no** debe aparecer como error.

### 1. 🔴 Escribir el test

**Archivo:** `test/features/products/hooks/useProducts.test.js`

1. **Dónde (imports, arriba de todo):** agregá el import de `StrictMode`:

   ```js
   import { StrictMode } from "react";
   ```

2. **Dónde (dentro del `describe`, al final):** después del test del ciclo 10. (Sin JSX: en un
   `.test.js`, `wrapper: StrictMode` alcanza.)

   ```js
     it("does not report a cancelled request as an error in StrictMode", async () => {
       server.use(productsHandler());
       const { result } = renderHook(() => useProducts(), { wrapper: StrictMode });
       await waitFor(() => expect(result.current.loading).toBe(false));
       expect(result.current.error).toBeNull();
       expect(result.current.products).toHaveLength(3);
     });
   ```

**Corré:** `pnpm test:run`
**Rojo esperado:** `loading` pasa a `false` por el error del primer pedido y `error` no es `null`
(`expected AbortError... to be null`).

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/products/hooks/useProducts.js`
**Dónde:** dentro del `.catch`, como **primera línea** (antes de `setError`).

**Archivo completo después de este ciclo:**

```js
import { useEffect, useState } from "react";
import { getProducts } from "../services/productsApi";

export function useProducts() {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const controller = new AbortController();
		getProducts({ signal: controller.signal })
			.then((data) => {
				setProducts(data);
				setLoading(false);
			})
			.catch((err) => {
				if (err.name === "AbortError") return;
				setError(err);
				setLoading(false);
			});
		return () => controller.abort();
	}, []);

	return { products, loading, error };
}
```

**Corré:** `pnpm verify`. **Resultado esperado:** todo verde (incluye cobertura 100 %: el `if` del
`AbortError` queda cubierto por este test).

### 3. 🔵 Refactor

Con todo en verde: nada que limpiar.

### 4. Commit

```sh
git add -A && git commit -m "fix(products): ignore aborted requests in the hook"
```

---

## Ciclo 12 — El archivo de datos real es válido

### 1. 🔴 Escribir el test

**Archivo:** `test/features/products/productos.test.js` (**crealo**).
**Dónde:** el archivo entero.

```js
import { describe, expect, it } from "vitest";
import products from "../../../public/productos.json";

describe("public/productos.json", () => {
  it("has at least six products with unique ids and both languages", () => {
    const ids = products.map((product) => product.id);
    expect(products.length).toBeGreaterThanOrEqual(6);
    expect(new Set(ids).size).toBe(ids.length);
    for (const product of products) {
      expect(product.title.es && product.title.en).toBeTruthy();
      expect(product.description.es && product.description.en).toBeTruthy();
      expect(product.price).toBeGreaterThan(0);
    }
  });
});
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Failed to resolve import "../../../public/productos.json"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `public/productos.json` (**crealo**).
**Dónde:** el archivo entero (siete servicios; los textos son un primer borrador, se pueden cambiar).

```json
[
  {
    "id": "landing-page",
    "title": { "es": "Landing page", "en": "Landing page" },
    "description": {
      "es": "Una página de presentación rápida, accesible y lista para publicar.",
      "en": "A fast, accessible presentation page, ready to publish."
    },
    "price": 350,
    "category": "web",
    "image": "/images/landing-page.svg"
  },
  {
    "id": "react-app",
    "title": { "es": "Aplicación React", "en": "React app" },
    "description": {
      "es": "Una aplicación web a medida con React, probada y lista para crecer.",
      "en": "A custom web application built with React, tested and ready to grow."
    },
    "price": 1200,
    "category": "web",
    "image": "/images/react-app.svg"
  },
  {
    "id": "rest-api",
    "title": { "es": "API REST", "en": "REST API" },
    "description": {
      "es": "Una API REST documentada, con autenticación y pruebas automáticas.",
      "en": "A documented REST API with authentication and automated tests."
    },
    "price": 900,
    "category": "backend",
    "image": "/images/rest-api.svg"
  },
  {
    "id": "database-design",
    "title": { "es": "Diseño de base de datos", "en": "Database design" },
    "description": {
      "es": "Modelado, migraciones y consultas pensadas para tu caso de uso.",
      "en": "Modeling, migrations and queries designed for your use case."
    },
    "price": 500,
    "category": "backend",
    "image": "/images/database-design.svg"
  },
  {
    "id": "code-review",
    "title": { "es": "Revisión de código", "en": "Code review" },
    "description": {
      "es": "Una revisión detallada de tu código con recomendaciones concretas.",
      "en": "A detailed review of your code with concrete recommendations."
    },
    "price": 200,
    "category": "mentoring",
    "image": "/images/code-review.svg"
  },
  {
    "id": "git-linux-class",
    "title": { "es": "Clase de Git y Linux", "en": "Git and Linux class" },
    "description": {
      "es": "Clases personalizadas de Git y Linux, cobradas por hora.",
      "en": "Personalized Git and Linux classes, charged per hour."
    },
    "price": 40,
    "category": "mentoring",
    "image": "/images/git-linux-class.svg"
  },
  {
    "id": "dotfiles-setup",
    "title": { "es": "Setup de dotfiles y Neovim", "en": "Dotfiles and Neovim setup" },
    "description": {
      "es": "Dejo tu entorno de desarrollo configurado y versionado.",
      "en": "I leave your development environment configured and versioned."
    },
    "price": 150,
    "category": "mentoring",
    "image": "/images/dotfiles-setup.svg"
  }
]
```

**Archivos:** `public/images/<id>.svg` (**crealos**; la carpeta `public/images/` ya existe). Uno por
servicio. Para no escribirlos a mano, corré esto desde la raíz del repo:

```sh
for id in landing-page react-app rest-api database-design code-review git-linux-class dotfiles-setup; do
  cat > "public/images/$id.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" role="img" aria-label="$id">
  <rect width="320" height="200" fill="#241a3a"/>
  <circle cx="160" cy="100" r="48" fill="#c770f0"/>
</svg>
SVG
done
```

(Son marcadores de posición: en US-14 se reemplazan por imágenes de verdad.)

**Corré:** `pnpm verify`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(products): add the services catalog data"
```

---

## Verificación manual

- [ ] `pnpm dev` y abrí `http://localhost:5173/productos.json`: se ve el JSON.
- [ ] Después del preview: `…/productos.json` responde también en Vercel.
- [ ] (Opcional) En DevTools → *Network*, bloqueá la URL y verificá en consola de un test rápido que
      tu `getProducts` falla. La UI llega en US-08.

## Publicar

```sh
git push -u origin us-07-product-data-source
gh pr create --fill --base main && gh pr checks --watch
```

Squash merge: `feat: load the services from a data source (US-07)`.

## Commits sugeridos

```
docs: add US-07 product data source story
chore(test): set up msw for network mocking
feat(products): load the products from the json file
feat(products): reject when the products cannot be loaded
feat(products): find a product by id
feat(products): return null for an unknown id
feat(shared): pick a localized text by language
feat(shared): fall back to Spanish when a language is missing
feat(products): add the products hook in its loading state
feat(products): load the products in the hook
feat(products): expose loading errors in the hook
feat(products): abort the request when the hook unmounts
fix(products): ignore aborted requests in the hook
feat(products): add the services catalog data
```

## Definition of Done

- [ ] Todos los escenarios pasan como tests; el test del archivo de datos protege el JSON.
- [ ] `pnpm verify` y el pipeline en verde.
- [ ] `/productos.json` visible en el preview.
- [ ] Commits convencionales.

## Qué aprendiste

- `fetch` no rechaza con 404/500: hay que mirar `response.ok`.
- El *fake it* (devolver un valor fijo) y la triangulación obligan a que cada línea nazca de un test.
- `useEffect` + cleanup + `AbortController`: sin fugas, y `StrictMode` como aliado.
- Una "costura" bien puesta (`productsApi`) hace que cambiar de backend sea tocar un archivo.
