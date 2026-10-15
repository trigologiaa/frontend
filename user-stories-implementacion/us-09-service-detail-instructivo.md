# Instructivo US-09: detalle de un servicio (JavaScript)

Guía para implementar [US-09](../user-stories/us-09-service-detail.md) con el [flujo](00-workflow.md).
Repite el patrón de US-07/US-08 para **un solo** servicio, con la ruta dinámica `/servicio/:id`.
Formato de los pasos: [Formato de los instructivos](00-workflow.md#formato-de-los-instructivos).

## Qué vas a construir

```
ItemDetailContainer  (lee :id con useParams, usa useService(id); decide: cargando / error / no existe / detalle)
   └─ ItemDetail     (presentacional: recibe UN servicio)
useService(id)       (hook: { service, loading, error })
```

> **Concepto — `null` no es error:** `getServiceById` devuelve `null` si el id no existe
> (US-07). El contenedor lo muestra como "No encontramos ese servicio" (contenido amable), mientras
> que un rechazo de red muestra la alerta de error. Son dos casos distintos con dos mensajes.

> **Rutas y carpetas reales de este proyecto:**
>
> - El detalle es **`/servicio/:id`** y el catálogo **`/servicios`** (`src/App.jsx`).
> - La página `ItemDetailContainer` **ya existe** (provisoria, desde US-02) en
>   `src/features/services/pages/ItemDetailContainer.jsx`: **se edita ahí**.
> - `ItemDetail` y el hook `useService` viven en `src/features/services/`, como `Item` y `useServices`.

## Mapa de archivos

| Ciclo | Archivo | Acción |
| ----- | ------- | ------ |
| 0, S1 | `test/styles/components.test.js` | editar (lista `pending`) |
| 1–6 | `test/features/services/hooks/useService.test.js` | **crear** en el ciclo 1, editar después |
| 1–6 | `src/features/services/hooks/useService.js` | **crear** en el ciclo 1, editar después |
| 5 | `src/features/services/services/servicesApi.js` | editar (`getServiceById` recibe `signal`) |
| 6 (opcional) | `src/shared/useAsync.js` | **crear** |
| 7–10 | `test/features/services/components/ItemDetail.test.jsx` | **crear** en el ciclo 7, editar después |
| 7–10 | `src/features/services/components/ItemDetail.jsx` | **crear** en el ciclo 7, editar después |
| 11–15, 17 | `test/features/services/pages/ItemDetailContainer.test.jsx` | **crear** en el ciclo 11, editar después |
| 11–15 | `src/features/services/pages/ItemDetailContainer.jsx` | editar (era provisoria) |
| 11–15, 17 | `src/i18n/locales/es.json`, `src/i18n/locales/en.json` | editar (claves `detail.*`; borrar `pages`) |
| 11, 16 | `test/App.test.jsx` | editar (se borran dos tests viejos; se agrega el recorrido real) |
| S1 | `src/features/services/components/ItemDetail.module.css` | **crear** |
| S2 | `src/features/services/pages/ItemDetailContainer.module.css` | **crear** |

## Paso 0: Preparar

```sh
git switch main && git pull
git switch -c us-09-service-detail
pnpm verify
cp <ruta-a>/javascript/user-stories/us-09-service-detail.md docs/
git add docs && git commit -m "docs: add US-09 service detail story"
```

### Registrar el componente nuevo como "sin estilos todavía"

**Archivo:** `test/styles/components.test.js`
**Dónde:** el array `pending`. Agregá esta ruta **al final** del array:

```js
  "src/features/services/components/ItemDetail.jsx",
```

(`ItemDetailContainer.jsx` ya está en la lista desde US-05.)

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

```sh
git add -A && git commit -m "test: register the service detail as pending styles"
```

---

## Ciclos 1–6 — El hook `useService(id)`

Es la misma secuencia que `useServices` (US-07, ciclos 7–11), pero para un servicio. Un test por
ciclo, cada uno con su rojo antes del verde.

### Ciclo 1 — arranca cargando

**1. 🔴 Test.** **Archivo:** `test/features/services/hooks/useService.test.js` (**crealo**).
**Dónde:** el archivo entero.

```js
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useService } from "../../../../src/features/services/hooks/useService";
import { servicesHandler } from "../../../handlers";
import { server } from "../../../server";

describe("useService", () => {
  it("starts loading with no service and no error", () => {
    server.use(servicesHandler());
    const { result } = renderHook(() => useService("service-1"));
    expect(result.current).toEqual({ service: null, loading: true, error: null });
  });
});
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Failed to resolve import "../../../../src/features/services/hooks/useService"
```

**2. 🟢 Código.** **Archivo:** `src/features/services/hooks/useService.js` (**crealo**).
**Dónde:** el archivo entero (*fake it*: valor fijo).

```js
export function useService() {
	return { service: null, loading: true, error: null };
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

**3. Commit**

```sh
git add -A && git commit -m "feat(services): add the service hook in its loading state"
```

### Ciclo 2 — carga el servicio con ese id (y no otro)

**1. 🔴 Test.** **Archivo:** `test/features/services/hooks/useService.test.js`

1. **Dónde (imports):** reemplazá las dos primeras líneas de imports y el import de handlers:

   ```js
   import { renderHook, waitFor } from "@testing-library/react";
   import { describe, expect, it } from "vitest";
   import { useService } from "../../../../src/features/services/hooks/useService";
   import { makeService, servicesHandler } from "../../../handlers";
   import { server } from "../../../server";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 1.

   ```js
     it("loads the service with the requested id", async () => {
       server.use(servicesHandler([makeService(1), makeService(2)]));
       const { result } = renderHook(() => useService("service-2"));
       await waitFor(() => expect(result.current.loading).toBe(false));
       expect(result.current.service).toEqual(makeService(2));
     });
   ```

**Corré:** `pnpm test:run`. **Rojo esperado:** se agota el tiempo del `waitFor`
(`expected true to be false`).

**2. 🟢 Código.** **Archivo:** `src/features/services/hooks/useService.js`
**Dónde:** reemplazá el archivo entero. La dependencia `[id]` hace que, si el id cambia, vuelva a pedir.

```js
import { useEffect, useState } from "react";
import { getServiceById } from "../services/servicesApi";

export function useService(id) {
	const [service, setService] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getServiceById(id).then((data) => {
			setService(data);
			setLoading(false);
		});
	}, [id]);

	return { service, loading, error: null };
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

**3. Commit**

```sh
git add -A && git commit -m "feat(services): load a service by id"
```

### Ciclo 3 — id desconocido

Este ciclo **no cambia código productivo**: el test pasa de entrada y se valida con una mutación.

**1. Test (pasa de entrada).** **Archivo:** `test/features/services/hooks/useService.test.js`
**Dónde:** dentro del `describe`, después del test del ciclo 2.

```js
  it("returns no service and no error for an unknown id", async () => {
    server.use(servicesHandler([makeService(1)]));
    const { result } = renderHook(() => useService("does-not-exist"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.service).toBeNull();
    expect(result.current.error).toBeNull();
  });
```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

**2. Mutación.** En `src/features/services/hooks/useService.js` borrá (o comentá) la línea
`setLoading(false);`. **Corré** `pnpm test:run`: **rojo esperado**, se agota el tiempo del
`waitFor` (el hook se queda "cargando" cuando el id no existe). **Restaurá** la línea.

**3. Commit**

```sh
git add -A && git commit -m "test(services): return null for an unknown id"
```

### Ciclo 4 — error

**1. 🔴 Test.** **Archivo:** `test/features/services/hooks/useService.test.js`

1. **Dónde (import de handlers):** sumá `failingServicesHandler`:

   ```js
   import { failingServicesHandler, makeService, servicesHandler } from "../../../handlers";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 3.

   ```js
     it("exposes an error when the service cannot be loaded", async () => {
       server.use(failingServicesHandler());
       const { result } = renderHook(() => useService("service-1"));
       await waitFor(() => expect(result.current.loading).toBe(false));
       expect(result.current.error).toBeInstanceOf(Error);
       expect(result.current.service).toBeNull();
     });
   ```

**Corré:** `pnpm test:run`. **Rojo esperado:** se agota el tiempo del `waitFor` (la promesa rechazada
nunca apaga `loading`).

**2. 🟢 Código.** **Archivo:** `src/features/services/hooks/useService.js`
**Dónde:** reemplazá el archivo entero (estado `error` y `.catch`).

```js
import { useEffect, useState } from "react";
import { getServiceById } from "../services/servicesApi";

export function useService(id) {
	const [service, setService] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		getServiceById(id)
			.then((data) => {
				setService(data);
				setLoading(false);
			})
			.catch((err) => {
				setError(err);
				setLoading(false);
			});
	}, [id]);

	return { service, loading, error };
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

**3. Commit**

```sh
git add -A && git commit -m "feat(services): expose errors in the service hook"
```

### Ciclo 5 — aborta al desmontar

Igual que US-07, ciclo 10.

**1. 🔴 Test.** **Archivo:** `test/features/services/hooks/useService.test.js`

1. **Dónde (import de `vitest`):** sumá `afterEach` y `vi`:

   ```js
   import { afterEach, describe, expect, it, vi } from "vitest";
   ```

2. **Dónde (dentro del `describe`, arriba de todos los tests):**

   ```js
     afterEach(() => {
       vi.restoreAllMocks();
     });
   ```

3. **Dónde (dentro del `describe`, al final):** después del test del ciclo 4.

   ```js
     it("aborts the pending request when the component unmounts", () => {
       server.use(servicesHandler());
       const fetchSpy = vi.spyOn(globalThis, "fetch");
       const { unmount } = renderHook(() => useService("service-1"));
       unmount();
       expect(fetchSpy.mock.calls[0][1]?.signal?.aborted).toBe(true);
     });
   ```

**Corré:** `pnpm test:run`. **Rojo esperado:** `expected undefined to be true` (se llamó a `fetch`
sin señal).

**2. 🟢 Código.**

**Archivo:** `src/features/services/services/servicesApi.js`
**Dónde:** reemplazá `getServiceById` (la señal se propaga hasta `getServices`).

```js
export async function getServiceById(id, { signal } = {}) {
	const services = await getServices({ signal });
	return services.find((service) => service.id === id) ?? null;
}
```

**Archivo:** `src/features/services/hooks/useService.js`
**Dónde:** reemplazá el `useEffect` completo.

```js
	useEffect(() => {
		const controller = new AbortController();
		getServiceById(id, { signal: controller.signal })
			.then((data) => {
				setService(data);
				setLoading(false);
			})
			.catch((err) => {
				setError(err);
				setLoading(false);
			});
		return () => controller.abort();
	}, [id]);
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

**3. Commit**

```sh
git add -A && git commit -m "feat(services): abort the service request on unmount"
```

### Ciclo 6 — StrictMode no es error

Igual que US-07, ciclo 11.

**1. 🔴 Test.** **Archivo:** `test/features/services/hooks/useService.test.js`

1. **Dónde (imports, arriba de todo):**

   ```js
   import { StrictMode } from "react";
   ```

2. **Dónde (dentro del `describe`, al final):** después del test del ciclo 5.

   ```js
     it("does not report a cancelled request as an error in StrictMode", async () => {
       server.use(servicesHandler([makeService(1)]));
       const { result } = renderHook(() => useService("service-1"), { wrapper: StrictMode });
       await waitFor(() => expect(result.current.loading).toBe(false));
       expect(result.current.error).toBeNull();
       expect(result.current.service).toEqual(makeService(1));
     });
   ```

**Corré:** `pnpm test:run`. **Rojo esperado:** `error` no es `null` (el primer pedido se cancela y
queda como error).

**2. 🟢 Código.** **Archivo:** `src/features/services/hooks/useService.js`
**Dónde:** en el `.catch`, como **primera línea** (antes de `setError`).

**Archivo completo después de este ciclo:**

```js
import { useEffect, useState } from "react";
import { getServiceById } from "../services/servicesApi";

export function useService(id) {
	const [service, setService] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const controller = new AbortController();
		getServiceById(id, { signal: controller.signal })
			.then((data) => {
				setService(data);
				setLoading(false);
			})
			.catch((err) => {
				if (err.name === "AbortError") return;
				setError(err);
				setLoading(false);
			});
		return () => controller.abort();
	}, [id]);

	return { service, loading, error };
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

**3. Commit**

```sh
git add -A && git commit -m "fix(services): ignore aborted requests in the service hook"
```

### Refactor guiado (opcional, recomendado): un hook genérico `useAsync`

`useServices` y `useService` repiten el mismo esqueleto (estado + efecto + abort + ignorar
`AbortError`). Con **todos los tests verdes**, tocá estos tres archivos **en este orden**
(primero el nuevo, después los dos hooks):

**Archivo:** `src/shared/useAsync.js` (**crealo**).
**Dónde:** el archivo entero.

```js
import { useEffect, useState } from "react";

export function useAsync(fetcher, deps, initialData) {
	const [data, setData] = useState(initialData);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const controller = new AbortController();
		fetcher({ signal: controller.signal })
			.then((result) => {
				setData(result);
				setLoading(false);
			})
			.catch((err) => {
				if (err.name === "AbortError") return;
				setError(err);
				setLoading(false);
			});
		return () => controller.abort();
		// biome-ignore lint/correctness/useExhaustiveDependencies: the caller decides the dependencies
	}, deps);

	return { data, loading, error };
}
```

> El comentario `biome-ignore` es necesario: Biome no puede verificar un arreglo de dependencias que
> llega de afuera (`deps`), y esa es justamente la gracia de este hook genérico.

**Archivo:** `src/features/services/hooks/useService.js`
**Dónde:** reemplazá el archivo entero.

```js
import { useAsync } from "../../../shared/useAsync";
import { getServiceById } from "../services/servicesApi";

export function useService(id) {
	const {
		data: service,
		loading,
		error,
	} = useAsync((options) => getServiceById(id, options), [id], null);
	return { service, loading, error };
}
```

**Archivo:** `src/features/services/hooks/useServices.js`
**Dónde:** reemplazá el archivo entero.

```js
import { useAsync } from "../../../shared/useAsync";
import { getServices } from "../services/servicesApi";

export function useServices() {
	const { data: services, loading, error } = useAsync(getServices, [], []);
	return { services, loading, error };
}
```

**Corré** `pnpm test:run` después de **cada** archivo: tiene que seguir todo verde. Si en algún
momento se pone rojo, `git restore .` y volvé a intentar con un paso más chico. Después corré
`pnpm verify` (Biome y Knip tienen que quedar limpios). No hace falta un test nuevo: los tests de los
dos hooks son la red de seguridad y la cobertura sigue al 100 %.

```sh
git add -A && git commit -m "refactor(shared): extract a generic async data hook"
```

---

## Ciclo 7 — `ItemDetail` muestra el título como `h1`

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/components/ItemDetail.test.jsx` (**crealo**).
**Dónde:** el archivo entero.

```jsx
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ItemDetail } from "../../../../src/features/services/components/ItemDetail";
import { makeService } from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";

describe("ItemDetail", () => {
  it("shows the title as the main heading", () => {
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    expect(screen.getByRole("heading", { level: 1, name: "Servicio 1" })).toBeInTheDocument();
  });
});
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Failed to resolve import "../../../../src/features/services/components/ItemDetail"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/components/ItemDetail.jsx` (**crealo**).
**Dónde:** el archivo entero (`useTranslation` + `localized`, igual que `Item`).

```jsx
import { useTranslation } from "react-i18next";
import { localized } from "../../../shared/localized";

export function ItemDetail({ service }) {
	const { i18n } = useTranslation();
	return (
		<article>
			<h1>{localized(service.title, i18n.resolvedLanguage)}</h1>
		</article>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(services): add the service detail with its title"
```

---

## Ciclo 8 — Descripción

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/components/ItemDetail.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 7.

```jsx
  it("shows the description", () => {
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    expect(screen.getByText("Descripción 1")).toBeInTheDocument();
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an element with the text: Descripción 1
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/components/ItemDetail.jsx`
**Dónde:** reemplazá el archivo entero.

```jsx
import { useTranslation } from "react-i18next";
import { localized } from "../../../shared/localized";

export function ItemDetail({ service }) {
	const { i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	return (
		<article>
			<h1>{localized(service.title, language)}</h1>
			<p>{localized(service.description, language)}</p>
		</article>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(services): show the service description"
```

---

## Ciclo 9 — Precio y categoría

### 1. 🔴 Escribir el test

Un solo test con dos afirmaciones, porque son dos líneas del mismo dato "ficha".

**Archivo:** `test/features/services/components/ItemDetail.test.jsx`

1. **Dónde (imports):** agregá el catálogo en español, junto a los demás imports:

   ```jsx
   import es from "../../../../src/i18n/locales/es.json";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 8.

   ```jsx
     it("shows the price and the category", () => {
       renderWithProviders(<ItemDetail service={makeService(1)} />);
       expect(screen.getByText("US$ 100")).toBeInTheDocument();
       expect(screen.getByText(es.categories.web)).toBeInTheDocument();
     });
   ```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an element with the text: US$ 100
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/components/ItemDetail.jsx`
**Dónde:** reemplazá el archivo entero.

```jsx
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";

export function ItemDetail({ service }) {
	const { t, i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	return (
		<article>
			<h1>{localized(service.title, language)}</h1>
			<p>{localized(service.description, language)}</p>
			<p>{t(`categories.${service.category}`)}</p>
			<p>{formatPrice(service.price, language)}</p>
		</article>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(services): show the service price and category"
```

---

## Ciclo 10 — Imagen

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/components/ItemDetail.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 9.

```jsx
  it("shows the image with the title as alternative text", () => {
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    expect(screen.getByRole("img", { name: "Servicio 1" })).toHaveAttribute("src", "/images/service-1.svg");
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an accessible element with the role "img" and name "Servicio 1"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/components/ItemDetail.jsx`
**Dónde:** reemplazá el archivo entero. Es la imagen principal: **sin** `loading="lazy"` (está arriba
del todo).

```jsx
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";

export function ItemDetail({ service }) {
	const { t, i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	const title = localized(service.title, language);
	return (
		<article>
			<img src={service.image} alt={title} width="640" height="400" />
			<h1>{title}</h1>
			<p>{localized(service.description, language)}</p>
			<p>{t(`categories.${service.category}`)}</p>
			<p>{formatPrice(service.price, language)}</p>
		</article>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(services): show the service image"
```

> 🔵 `Item` e `ItemDetail` calculan `title`, `language` y el precio de la misma forma. Si te
> molesta, extraé un hook `useLocalizedService(service)`; si no, dejalo: dos usos todavía no
> justifican una abstracción (regla de tres).

---

## Ciclo 11 — Mientras carga

Este ciclo reemplaza la página provisoria de US-02, así que **rompe a propósito** dos tests viejos de
`App.test.jsx` (paso 4).

### 1. Agregar el texto de carga en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** clave nueva de primer nivel, después de `"catalog"`.

```json
"detail": {
	"loading": "Cargando..."
},
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"detail": {
	"loading": "Loading..."
},
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/services/pages/ItemDetailContainer.test.jsx` (**crealo**).
**Dónde:** el archivo entero. Ojo: el test necesita una ruta para que `useParams` tenga `id`.

```jsx
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ItemDetailContainer } from "../../../../src/features/services/pages/ItemDetailContainer";
import { servicesHandler } from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";
import { server } from "../../../server";

function renderDetail(id) {
  return renderWithProviders(
    <Routes>
      <Route path="/servicio/:id" element={<ItemDetailContainer />} />
    </Routes>,
    { route: `/servicio/${id}` },
  );
}

describe("ItemDetailContainer", () => {
  it("shows a loading message while the service loads", () => {
    server.use(servicesHandler());
    renderDetail("service-1");
    expect(screen.getByRole("status")).toHaveTextContent("Cargando...");
  });
});
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an accessible element with the role "status"
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/pages/ItemDetailContainer.jsx` (ya existe).
**Dónde:** reemplazá el archivo entero.

```jsx
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useService } from "../../services/hooks/useService";

export function ItemDetailContainer() {
	const { id } = useParams();
	const { t } = useTranslation();
	const { loading } = useService(id);

	if (loading) return <p role="status">{t("detail.loading")}</p>;
	return null;
}
```

### 4. Tests viejos que el cambio rompe a propósito (mismo commit)

**Corré:** `pnpm test:run`. **Resultado esperado:** el test nuevo pasa, pero fallan **dos tests de
`App`**: la página provisoria ("Detalle del servicio" y el id como texto) ya no existe.

**Archivo:** `test/App.test.jsx`
**Dónde:** borrá estos dos tests completos (el recorrido real lo cubre el ciclo 16):

```jsx
  it("shows the detail page at '/servicio/:id'", () => { ... });
  it("gives the detail page the id from the URL", () => { ... });
```

**Archivos:** `src/i18n/locales/es.json` y `src/i18n/locales/en.json`
**Dónde:** borrá el bloque `"pages"` completo (solo contenía `detail.title`, que nadie usa ya):

```json
"pages": {
	"detail": {
		"title": "Detalle del servicio"
	}
},
```

(En `en.json` dice `"Service details"`.)

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde (la paridad de catálogos sigue verde
porque borraste el bloque en los dos).

### 5. Commit

```sh
git add -A && git commit -m "feat(services): show a loading message in the detail"
```

---

## Ciclo 12 — Muestra el servicio del id de la URL

### 1. 🔴 Escribir el test

Dos servicios, para comprobar que **el id elige**.

**Archivo:** `test/features/services/pages/ItemDetailContainer.test.jsx`

1. **Dónde (import de handlers):** sumá `makeService`:

   ```jsx
   import { makeService, servicesHandler } from "../../../handlers";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 11.

   ```jsx
     it("shows the service whose id is in the URL", async () => {
       server.use(servicesHandler([makeService(1), makeService(2)]));
       renderDetail("service-2");
       expect(await screen.findByRole("heading", { level: 1, name: "Servicio 2" })).toBeInTheDocument();
       expect(screen.queryByText("Servicio 1")).not.toBeInTheDocument();
     });
   ```

**Corré:** `pnpm test:run`. **Rojo esperado:** tras el timeout,
`Unable to find role="heading" and name "Servicio 2"`.

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/pages/ItemDetailContainer.jsx`
**Dónde:** reemplazá el archivo entero (lee `service` y dibuja `ItemDetail`).

```jsx
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { ItemDetail } from "../../services/components/ItemDetail";
import { useService } from "../../services/hooks/useService";

export function ItemDetailContainer() {
	const { id } = useParams();
	const { t } = useTranslation();
	const { service, loading } = useService(id);

	if (loading) return <p role="status">{t("detail.loading")}</p>;
	return <ItemDetail service={service} />;
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(services): show the service selected by the URL"
```

---

## Ciclo 13 — Id inexistente: "No encontramos ese servicio"

### 1. Agregar los textos en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"detail"`, después de `"loading"`.

```json
"notFound": {
	"title": "No encontramos ese servicio"
},
"back": "Volver a servicios"
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"notFound": {
	"title": "We couldn't find that service"
},
"back": "Back to services"
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/services/pages/ItemDetailContainer.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 12.

```jsx
  it("shows a not-found message and a link back for an unknown service", async () => {
    server.use(servicesHandler([makeService(1)]));
    renderDetail("does-not-exist");
    expect(await screen.findByRole("heading", { name: "No encontramos ese servicio" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver a servicios" })).toHaveAttribute("href", "/servicios");
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:** el código del ciclo 12 pasa `service = null` a
`ItemDetail` y **explota**:

```
Cannot read properties of null (reading 'title')
```

Leelo: es el rojo correcto (falta el caso "no existe").

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/pages/ItemDetailContainer.jsx`
**Dónde:** reemplazá el archivo entero (nuevo import de `Link`; el caso `!service` va **antes** de
dibujar el detalle).

```jsx
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ItemDetail } from "../../services/components/ItemDetail";
import { useService } from "../../services/hooks/useService";

export function ItemDetailContainer() {
	const { id } = useParams();
	const { t } = useTranslation();
	const { service, loading } = useService(id);

	if (loading) return <p role="status">{t("detail.loading")}</p>;
	if (!service) {
		return (
			<>
				<h1>{t("detail.notFound.title")}</h1>
				<Link to="/servicios">{t("detail.back")}</Link>
			</>
		);
	}
	return <ItemDetail service={service} />;
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(services): handle a service that does not exist"
```

---

## Ciclo 14 — Error de red

### 1. Agregar el texto de error en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"detail"`, después de `"loading"`.

```json
"error": "No pudimos cargar el servicio. Probá de nuevo más tarde.",
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"error": "We couldn't load the service. Please try again later.",
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/services/pages/ItemDetailContainer.test.jsx`

1. **Dónde (import de handlers):** sumá `failingServicesHandler`:

   ```jsx
   import { failingServicesHandler, makeService, servicesHandler } from "../../../handlers";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 13.

   ```jsx
     it("shows an alert when the service cannot be loaded", async () => {
       server.use(failingServicesHandler());
       renderDetail("service-1");
       expect(await screen.findByRole("alert")).toHaveTextContent(
         "No pudimos cargar el servicio. Probá de nuevo más tarde.",
       );
     });
   ```

**Corré:** `pnpm test:run`. **Rojo esperado:** tras el timeout, `Unable to find role="alert"` (hoy
muestra "No encontramos ese servicio", que es otro caso).

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/pages/ItemDetailContainer.jsx`
**Dónde:** reemplazá el archivo entero (lee `error` del hook; el `if (error)` va **antes** del
`!service`).

```jsx
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ItemDetail } from "../../services/components/ItemDetail";
import { useService } from "../../services/hooks/useService";

export function ItemDetailContainer() {
	const { id } = useParams();
	const { t } = useTranslation();
	const { service, loading, error } = useService(id);

	if (loading) return <p role="status">{t("detail.loading")}</p>;
	if (error) return <p role="alert">{t("detail.error")}</p>;
	if (!service) {
		return (
			<>
				<h1>{t("detail.notFound.title")}</h1>
				<Link to="/servicios">{t("detail.back")}</Link>
			</>
		);
	}
	return <ItemDetail service={service} />;
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(services): show an alert when the service cannot load"
```

---

## Ciclo 15 — Volver al catálogo desde el detalle

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/pages/ItemDetailContainer.test.jsx`
**Dónde:** dentro del `describe`, después del test del ciclo 14.

```jsx
  it("links back to the services from a loaded detail", async () => {
    server.use(servicesHandler([makeService(1)]));
    renderDetail("service-1");
    await screen.findByRole("heading", { level: 1, name: "Servicio 1" });
    expect(screen.getByRole("link", { name: "Volver a servicios" })).toHaveAttribute("href", "/servicios");
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
Unable to find an accessible element with the role "link" and name "Volver a servicios"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/pages/ItemDetailContainer.jsx`
**Dónde:** reemplazá el archivo entero. El link vive en el contenedor, junto al detalle (el detalle
cargado y su link van en un fragmento).

```jsx
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ItemDetail } from "../../services/components/ItemDetail";
import { useService } from "../../services/hooks/useService";

export function ItemDetailContainer() {
	const { id } = useParams();
	const { t } = useTranslation();
	const { service, loading, error } = useService(id);

	if (loading) return <p role="status">{t("detail.loading")}</p>;
	if (error) return <p role="alert">{t("detail.error")}</p>;
	if (!service) {
		return (
			<>
				<h1>{t("detail.notFound.title")}</h1>
				<Link to="/servicios">{t("detail.back")}</Link>
			</>
		);
	}
	return (
		<>
			<ItemDetail service={service} />
			<Link to="/servicios">{t("detail.back")}</Link>
		</>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(services): add a link back to the services"
```

---

## Ciclo 16 — Integración con la app (de la lista al detalle)

Este ciclo **no cambia código productivo**: agrega el test del recorrido real y se valida con una
mutación.

### 1. Test (pasa de entrada)

**Archivo:** `test/App.test.jsx`

1. **Dónde (import de handlers):** sumá `makeService` al import que agregaste en US-08:

   ```jsx
   import { makeService, servicesHandler } from "./handlers";
   ```

2. **Dónde (dentro del `describe("App routes", ...)`):** después del test `"changes the page when a
   navigation link is followed"`.

   ```jsx
     it("goes from the catalog to the detail of a service", async () => {
       const user = userEvent.setup();
       server.use(servicesHandler([makeService(1), makeService(2)]));
       renderWithProviders(<App />, { route: "/servicios" });
       await user.click(await screen.findByRole("link", { name: /Ver detalle.*Servicio 2/ }));
       expect(await screen.findByRole("heading", { level: 1, name: "Servicio 2" })).toBeInTheDocument();
     });
   ```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada (el `Link` de `Item` y la ruta
ya existen).

### 2. Mutación

1. En `src/features/services/components/Item.jsx` cambiá `to={`/servicio/${service.id}`}` por
   `to={`/servicios/${service.id}`}`.
2. **Corré** `pnpm test:run`. **Rojo esperado:** el test del recorrido falla (esa ruta no existe).
3. **Restaurá** y corré de nuevo: verde.

**Corré:** `pnpm verify`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "test(app): go from the catalog to a service detail"
```

---

## Ciclo 17 — Inglés

Este ciclo **no cambia código productivo**: protege que los textos en inglés del detalle sean los
correctos.

### 1. Test (pasa de entrada)

**Archivo:** `test/features/services/pages/ItemDetailContainer.test.jsx`

1. **Dónde (imports):** agregá, después del import de `ItemDetailContainer`:

   ```jsx
   import { i18n } from "../../../../src/i18n";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 15.

   ```jsx
     it("shows the service detail in English", async () => {
       await i18n.changeLanguage("en");
       server.use(servicesHandler([makeService(1)]));
       renderDetail("service-1");
       expect(await screen.findByRole("heading", { level: 1, name: "Service 1" })).toBeInTheDocument();
       expect(screen.getByRole("link", { name: "Back to services" })).toBeInTheDocument();
     });
   ```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

En `src/i18n/locales/en.json` cambiá `"back": "Back to services"` por otro texto → **rojo**; restaurá.

### 3. Commit

```sh
git add -A && git commit -m "test(services): translate the service detail"
```

---

## Ciclos de estilo — el detalle

Mismo **ciclo de estilo** que en el [workflow](00-workflow.md#2b-el-css-se-escribe-junto-con-cada-story-y-se-testea-así)
(🔴 sacar de `pending`, 🟢 módulo, 🔵 a 360 y 1280 px).

### Ciclo S1 — La ficha del servicio

**1. 🔴 Test.** **Archivo:** `test/styles/components.test.js`
**Dónde:** el array `pending`. Borrá esta línea:

```js
  "src/features/services/components/ItemDetail.jsx",
```

**Corré:** `pnpm test:run`. **Rojo esperado:** el test nombra `ItemDetail.jsx` sin módulo.

**2. 🟢 Código.**

**Archivo:** `src/features/services/components/ItemDetail.module.css` (**crealo**).
**Dónde:** el archivo entero.

```css
.detail {
	display: grid;
	gap: var(--space-6);
}

.image {
	width: 100%;
	aspect-ratio: 16 / 10;
	object-fit: cover;
	border-radius: var(--radius);
}

.info {
	display: flex;
	flex-direction: column;
	gap: var(--space-3);
}

.title {
	margin: 0;
	font-size: var(--font-size-xl);
}

.category {
	margin: 0;
	color: var(--color-muted);
}

.price {
	margin: 0;
	font-size: var(--font-size-xl);
	font-weight: 700;
	color: var(--color-primary);
}

.description {
	margin: 0;
	max-width: 60ch;
}

@media (min-width: 48rem) {
	.detail {
		grid-template-columns: 1fr 1fr;
		align-items: start;
	}
}
```

**Archivo:** `src/features/services/components/ItemDetail.jsx`
**Dónde:** reemplazá el archivo entero (la imagen va **antes** del bloque de texto: en el celular la
foto va arriba; título, descripción, categoría y precio quedan dentro de `div.info`).

```jsx
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";
import styles from "./ItemDetail.module.css";

export function ItemDetail({ service }) {
	const { t, i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	const title = localized(service.title, language);
	return (
		<article className={styles.detail}>
			<img className={styles.image} src={service.image} alt={title} width="640" height="400" />
			<div className={styles.info}>
				<h1 className={styles.title}>{title}</h1>
				<p className={styles.category}>{t(`categories.${service.category}`)}</p>
				<p className={styles.price}>{formatPrice(service.price, language)}</p>
				<p className={styles.description}>{localized(service.description, language)}</p>
			</div>
		</article>
	);
}
```

(En US-11 el selector de cantidad va dentro de ese `div.info`.)

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

**3. 🔵 Mirar el navegador** (`pnpm dev`, un detalle). `ch` limita el largo de línea a unos 60
caracteres: se lee mejor. A 360 px la imagen va arriba y los datos abajo; a 1280 px, lado a lado.

**4. Commit**

```sh
git add -A && git commit -m "style(services): style the service detail"
```

### Ciclo S2 — Los estados del detalle

**1. 🔴 Test.** **Archivo:** `test/styles/components.test.js`
**Dónde:** el array `pending`. Borrá esta línea:

```js
  "src/features/services/pages/ItemDetailContainer.jsx",
```

**Corré:** `pnpm test:run`. **Rojo esperado:** el test nombra `ItemDetailContainer.jsx` sin módulo.

**2. 🟢 Código.**

**Archivo:** `src/features/services/pages/ItemDetailContainer.module.css` (**crealo**).
**Dónde:** el archivo entero.

```css
.page {
	display: flex;
	flex-direction: column;
	gap: var(--space-4);
}

.status {
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

.notFound {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: var(--space-4);
}

.notFoundTitle {
	margin: 0;
	font-size: var(--font-size-xl);
}

.back {
	display: inline-flex;
	align-items: center;
	min-height: 2.75rem;
	font-weight: 600;
}
```

**Archivo:** `src/features/services/pages/ItemDetailContainer.jsx`
**Dónde:** reemplazá el archivo entero (cada retorno recibe su clase; el detalle y su link "Volver"
van juntos en `styles.page`).

```jsx
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ItemDetail } from "../../services/components/ItemDetail";
import { useService } from "../../services/hooks/useService";
import styles from "./ItemDetailContainer.module.css";

export function ItemDetailContainer() {
	const { id } = useParams();
	const { t } = useTranslation();
	const { service, loading, error } = useService(id);

	if (loading) {
		return (
			<p className={styles.status} role="status">
				{t("detail.loading")}
			</p>
		);
	}
	if (error) {
		return (
			<p className={styles.alert} role="alert">
				{t("detail.error")}
			</p>
		);
	}
	if (!service) {
		return (
			<section className={styles.notFound}>
				<h1 className={styles.notFoundTitle}>{t("detail.notFound.title")}</h1>
				<Link className={styles.back} to="/servicios">
					{t("detail.back")}
				</Link>
			</section>
		);
	}
	return (
		<section className={styles.page}>
			<ItemDetail service={service} />
			<Link className={styles.back} to="/servicios">
				{t("detail.back")}
			</Link>
		</section>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

**3. 🔵 Mirar el navegador.** Visitá `/servicio/no-existe` (mensaje amable + link claro) y simulá la
carga lenta y el error. Los tres estados tienen que verse **cuidados**, no como un texto suelto.

**4. Commit**

```sh
git add -A && git commit -m "style(services): style the service detail states"
```

---

## Verificación manual

- [ ] `pnpm dev`: catálogo → "Ver detalle" → detalle; botón Atrás del navegador vuelve al catálogo.
- [ ] Escribí `/servicio/no-existe`: mensaje amable + link de vuelta.
- [ ] Copiá la URL de un detalle, abrila en otra pestaña y refrescá (en el preview de Vercel también).
- [ ] Bloqueá `productos.json` en DevTools: alerta de error. Sin errores en consola.
- [ ] El detalle a 360 y 1280 px (imagen arriba / lado a lado) y sus tres estados (carga, no existe, error).

## Publicar

```sh
git push -u origin us-09-service-detail
gh pr create --fill --base main && gh pr checks --watch
```

Squash merge: `feat: add the service detail page (US-09)`.

## Commits sugeridos

```
docs: add US-09 service detail story
test: register the service detail as pending styles
feat(services): add the service hook in its loading state
feat(services): load a service by id
test(services): return null for an unknown id
feat(services): expose errors in the service hook
feat(services): abort the service request on unmount
fix(services): ignore aborted requests in the service hook
refactor(shared): extract a generic async data hook              (opcional)
feat(services): add the service detail with its title
feat(services): show the service description
feat(services): show the service price and category
feat(services): show the service image
feat(services): show a loading message in the detail
feat(services): show the service selected by the URL
feat(services): handle a service that does not exist
feat(services): show an alert when the service cannot load
feat(services): add a link back to the services
test(app): go from the catalog to a service detail
test(services): translate the service detail
style(services): style the service detail
style(services): style the service detail states
```

## Definition of Done

- [ ] Todos los escenarios pasan como tests.
- [ ] `pnpm verify` y el pipeline en verde; verificación manual hecha (incluido refresh en un detalle).
- [ ] Commits convencionales.
- [ ] `ItemDetail` e `ItemDetailContainer` tienen su `.module.css` y salieron de `pending`.

## Qué aprendiste

- Rutas dinámicas: `useParams` y una ruta de test que lo alimente.
- `null` (no existe) y rechazo (falló) son casos distintos con mensajes distintos.
- Un rojo por "explota con `null`" es tan válido como uno por aserción.
- Refactor guiado: extraer un hook genérico cuando la duplicación ya es evidente.
- Si reemplazás una página provisoria, sus tests viejos se borran en el **mismo commit**.
