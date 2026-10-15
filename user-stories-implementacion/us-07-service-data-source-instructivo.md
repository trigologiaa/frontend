# Instructivo US-07: fuente de datos de servicios (JavaScript)

Guía para implementar [US-07](../user-stories/us-07-service-data-source.md) con el
[flujo](00-workflow.md). Es una story **técnica**: no hay pantalla nueva, hay una *costura*
(seam): componentes → hook → servicio → `fetch`.
Formato de los pasos: [Formato de los instructivos](00-workflow.md#formato-de-los-instructivos).

## Qué vas a construir

```
componente  ──usa──▶  useServices()  ──llama──▶  servicesApi  ──fetch──▶  /productos.json
 (US-08)            (estado: loading,            (único que sabe           (archivo en public/)
                     services, error)             de fetch y URL)
```

Mañana, para pasar a Firebase (US-17), se reescribe **solo** `servicesApi`.

> **Concepto — efecto secundario (`useEffect`, clase 5):** pedir datos es algo que pasa *fuera* del
> dibujado. `useEffect(() => { ... }, [])` corre después del primer render (el `[]` = "una sola
> vez"). Adentro pedimos los datos y guardamos el resultado en estado (`useState`), lo que vuelve a
> dibujar el componente.
>
> **Concepto — MSW:** intercepta los `fetch` **en la red simulada** del test. Tu código hace un
> `fetch` de verdad; MSW responde lo que vos definís. Así el test no depende de internet y prueba
> la URL real.

> **Nombres:** el *archivo de datos* se llama `public/productos.json` y la *feature* de datos
> `src/features/services/` (así lo define la story). La **ruta** del catálogo es `/servicios` y su
> página vive en `src/features/services/pages/`.

## Mapa de archivos

| Paso/ciclo | Archivo | Acción |
| ---------- | ------- | ------ |
| 0 | `package.json` (por `pnpm add -D msw`) | editar |
| 0 | `vite.config.js` | editar (`pool`) |
| 0 | `test/server.js` | **crear** |
| 0 | `test/handlers.js` | **crear** |
| 0 | `test/setup.js` | editar |
| 1–4 | `test/features/services/services/servicesApi.test.js` | **crear** en el ciclo 1, editar después |
| 1–4, 10 | `src/features/services/services/servicesApi.js` | **crear** en el ciclo 1, editar después |
| 5–6 | `test/shared/localized.test.js` | **crear** en el ciclo 5, editar en el 6 |
| 5–6 | `src/shared/localized.js` | **crear** en el ciclo 5, editar en el 6 |
| 7–11 | `test/features/services/hooks/useServices.test.js` | **crear** en el ciclo 7, editar después |
| 7–11 | `src/features/services/hooks/useServices.js` | **crear** en el ciclo 7, editar después |
| 12 | `test/features/services/servicios.test.js` | **crear** |
| 12 | `public/productos.json` | **crear** |
| 12 | `public/images/<id>.svg` (uno por servicio) | **crear** |

## Paso 0: Preparar e infraestructura de tests

```sh
git switch main && git pull
git switch -c us-07-service-data-source
pnpm verify
cp <ruta-a>/javascript/user-stories/us-07-service-data-source.md docs/
git add docs && git commit -m "docs: add US-07 service data source story"
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

export function makeService(n = 1) {
  return {
    id: `service-${n}`,
    title: { es: `Servicio ${n}`, en: `Service ${n}` },
    description: { es: `Descripción ${n}`, en: `Description ${n}` },
    price: 100 * n,
    category: "web",
    image: `/images/service-${n}.svg`,
  };
}

export function servicesHandler(services = [makeService(1), makeService(2), makeService(3)]) {
  return http.get("*/productos.json", () => HttpResponse.json(services));
}

export function failingServicesHandler() {
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

## Ciclo 1 — `getServices` devuelve los servicios del JSON

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/services/servicesApi.test.js` (**crealo**; las carpetas
`test/features/services/services/` son nuevas).
**Dónde:** el archivo entero.

```js
import { describe, expect, it } from "vitest";
import { getServices } from "../../../../src/features/services/services/servicesApi";
import { makeService, servicesHandler } from "../../../handlers";
import { server } from "../../../server";

describe("getServices", () => {
  it("returns the services served at /productos.json", async () => {
    server.use(servicesHandler([makeService(1), makeService(2), makeService(3)]));
    const services = await getServices();
    expect(services).toHaveLength(3);
  });
});
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Failed to resolve import "../../../../src/features/services/services/servicesApi"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/services/servicesApi.js` (**crealo**; las carpetas
`src/features/services/services/` son nuevas).
**Dónde:** el archivo entero.

```js
export async function getServices() {
	const response = await fetch(
		new URL("/productos.json", window.location.origin),
	);
	return response.json();
}
```

> **Por qué `new URL(..., window.location.origin)`:** Node (donde corren los tests) no acepta URLs
> relativas en `fetch`; en el navegador anda igual. Usá siempre `/productos.json` con barra inicial:
> los archivos de `public/` cuelgan de la raíz del sitio, aun estando en `/servicio/abc`.

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(services): load the services from the json file"
```

---

## Ciclo 2 — Si el servidor falla, el servicio rechaza

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/services/servicesApi.test.js`

1. **Dónde (import de handlers):** sumá `failingServicesHandler`:

   ```js
   import { failingServicesHandler, makeService, servicesHandler } from "../../../handlers";
   ```

2. **Dónde (dentro de `describe("getServices", ...)`):** después del test del ciclo 1.

   ```js
     it("rejects when the server answers with an error", async () => {
       server.use(failingServicesHandler());
       await expect(getServices()).rejects.toThrow();
     });
   ```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
promise resolved "{ message: 'boom' }" instead of rejecting
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/services/servicesApi.js`
**Dónde:** entre la línea del `fetch` y el `return`.

```js
export async function getServices() {
	const response = await fetch(new URL("/productos.json", window.location.origin));
	if (!response.ok) {
		throw new Error(`Could not load the services (${response.status})`);
	}
	return response.json();
}
```

> **Concepto:** `fetch` **no** falla con un 404/500: solo falla si no hay red. Por eso hay que mirar
> `response.ok` a mano. Es el error más común con `fetch`.

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(services): reject when the services cannot be loaded"
```

---

## Ciclo 3 — `getServiceById` encuentra un servicio

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/services/servicesApi.test.js`

1. **Dónde (import de `servicesApi`):** sumá `getServiceById`:

   ```js
   import { getServiceById, getServices } from "../../../../src/features/services/services/servicesApi";
   ```

2. **Dónde (al final del archivo):** un `describe` nuevo, **después** del `});` que cierra
   `describe("getServices", ...)`.

   ```js
   describe("getServiceById", () => {
     it("returns the service with that id", async () => {
       server.use(servicesHandler([makeService(1), makeService(2)]));
       const service = await getServiceById("service-2");
       expect(service).toEqual(makeService(2));
     });
   });
   ```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
getServiceById is not a function
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/services/servicesApi.js`
**Dónde:** al final del archivo, después de `getServices`.

```js
export async function getServiceById(id) {
	const services = await getServices();
	return services.find((service) => service.id === id);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(services): find a service by id"
```

---

## Ciclo 4 — Id desconocido → `null`

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/services/servicesApi.test.js`
**Dónde:** dentro de `describe("getServiceById", ...)`, **después** del test del ciclo 3.

```js
  it("returns null when no service has that id", async () => {
    server.use(servicesHandler([makeService(1)]));
    expect(await getServiceById("does-not-exist")).toBeNull();
  });
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
expected undefined to be null
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/services/servicesApi.js`
**Dónde:** en `getServiceById`, agregá `?? null` al final del `return`.

```js
export async function getServiceById(id) {
	const services = await getServices();
	return services.find((service) => service.id === id) ?? null;
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

> Decisión: "no existe" es un caso **esperado** (`null`); "falló la red" es un **error** (rechazo).

### 3. Commit

```sh
git add -A && git commit -m "feat(services): return null for an unknown id"
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

**Archivo:** `test/features/services/hooks/useServices.test.js` (**crealo**; las carpetas
`test/features/services/hooks/` son nuevas).
**Dónde:** el archivo entero.

```js
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useServices } from "../../../../src/features/services/hooks/useServices";
import { servicesHandler } from "../../../handlers";
import { server } from "../../../server";

describe("useServices", () => {
  it("starts loading with no services and no error", () => {
    server.use(servicesHandler());
    const { result } = renderHook(() => useServices());
    expect(result.current).toEqual({ services: [], loading: true, error: null });
  });
});
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Failed to resolve import "../../../../src/features/services/hooks/useServices"
```

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/hooks/useServices.js` (**crealo**; las carpetas
`src/features/services/hooks/` son nuevas).
**Dónde:** el archivo entero. (*Fake it*: valor fijo, todavía sin efecto.)

```js
export function useServices() {
	return { services: [], loading: true, error: null };
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat(services): add the services hook in its loading state"
```

---

## Ciclo 8 — El hook expone los servicios cargados

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/hooks/useServices.test.js`

1. **Dónde (primer import):** sumá `waitFor`:

   ```js
   import { renderHook, waitFor } from "@testing-library/react";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 7.

   ```js
     it("exposes the services once they are loaded", async () => {
       server.use(servicesHandler());
       const { result } = renderHook(() => useServices());
       await waitFor(() => expect(result.current.loading).toBe(false));
       expect(result.current.services).toHaveLength(3);
       expect(result.current.error).toBeNull();
     });
   ```

**Corré:** `pnpm test:run`
**Rojo esperado:** se agota el tiempo del `waitFor`: `expected true to be false` (el hook nunca deja
de cargar).

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/hooks/useServices.js`
**Dónde:** reemplazá el archivo entero.

```js
import { useEffect, useState } from "react";
import { getServices } from "../services/servicesApi";

export function useServices() {
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		getServices().then((data) => {
			setServices(data);
			setLoading(false);
		});
	}, []);

	return { services, loading, error };
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde. (`setError` todavía no se usa: el
linter puede avisar; se usa en el ciclo 9.)

### 3. Commit

```sh
git add -A && git commit -m "feat(services): load the services in the hook"
```

---

## Ciclo 9 — El hook expone el error

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/hooks/useServices.test.js`

1. **Dónde (import de handlers):** sumá `failingServicesHandler`:

   ```js
   import { failingServicesHandler, servicesHandler } from "../../../handlers";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 8.

   ```js
     it("exposes an error when the services cannot be loaded", async () => {
       server.use(failingServicesHandler());
       const { result } = renderHook(() => useServices());
       await waitFor(() => expect(result.current.loading).toBe(false));
       expect(result.current.error).toBeInstanceOf(Error);
       expect(result.current.services).toEqual([]);
     });
   ```

**Corré:** `pnpm test:run`
**Rojo esperado:** se agota el tiempo del `waitFor` (la promesa rechazada nunca apaga `loading`).

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/hooks/useServices.js`
**Dónde:** dentro del `useEffect`, encadená un `.catch` **después** del `.then(...)`.

```js
	useEffect(() => {
		getServices()
			.then((data) => {
				setServices(data);
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
git add -A && git commit -m "feat(services): expose loading errors in the hook"
```

---

## Ciclo 10 — Al desmontar se cancela el pedido

> **Concepto — limpieza del efecto:** la función que devolvés de `useEffect` corre al desmontar el
> componente. Ahí se cancela lo que quedó pendiente. `AbortController` cancela un `fetch`.

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/hooks/useServices.test.js`

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
       server.use(servicesHandler());
       const fetchSpy = vi.spyOn(globalThis, "fetch");
       const { unmount } = renderHook(() => useServices());
       unmount();
       expect(fetchSpy.mock.calls[0][1]?.signal?.aborted).toBe(true);
     });
   ```

**Corré:** `pnpm test:run`
**Rojo esperado:** `expected undefined to be true` (se llamó a `fetch` sin señal) o
`Cannot read properties of undefined`.

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/services/servicesApi.js`
**Dónde:** `getServices` recibe la señal y se la pasa a `fetch`. Reemplazá la función completa
(`getServiceById` no cambia):

```js
export async function getServices({ signal } = {}) {
	const response = await fetch(new URL("/productos.json", window.location.origin), { signal });
	if (!response.ok) {
		throw new Error(`Could not load the services (${response.status})`);
	}
	return response.json();
}
```

**Archivo:** `src/features/services/hooks/useServices.js`
**Dónde:** reemplazá el `useEffect` completo.

```js
	useEffect(() => {
		const controller = new AbortController();
		getServices({ signal: controller.signal })
			.then((data) => {
				setServices(data);
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
git add -A && git commit -m "feat(services): abort the request when the hook unmounts"
```

---

## Ciclo 11 — Un pedido cancelado no es un error

React en desarrollo (`StrictMode`) monta, desmonta y vuelve a montar cada componente: el primer
pedido se cancela. Eso **no** debe aparecer como error.

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/hooks/useServices.test.js`

1. **Dónde (imports, arriba de todo):** agregá el import de `StrictMode`:

   ```js
   import { StrictMode } from "react";
   ```

2. **Dónde (dentro del `describe`, al final):** después del test del ciclo 10. (Sin JSX: en un
   `.test.js`, `wrapper: StrictMode` alcanza.)

   ```js
     it("does not report a cancelled request as an error in StrictMode", async () => {
       server.use(servicesHandler());
       const { result } = renderHook(() => useServices(), { wrapper: StrictMode });
       await waitFor(() => expect(result.current.loading).toBe(false));
       expect(result.current.error).toBeNull();
       expect(result.current.services).toHaveLength(3);
     });
   ```

**Corré:** `pnpm test:run`
**Rojo esperado:** `loading` pasa a `false` por el error del primer pedido y `error` no es `null`
(`expected AbortError... to be null`).

### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/services/hooks/useServices.js`
**Dónde:** dentro del `.catch`, como **primera línea** (antes de `setError`).

**Archivo completo después de este ciclo:**

```js
import { useEffect, useState } from "react";
import { getServices } from "../services/servicesApi";

export function useServices() {
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const controller = new AbortController();
		getServices({ signal: controller.signal })
			.then((data) => {
				setServices(data);
				setLoading(false);
			})
			.catch((err) => {
				if (err.name === "AbortError") return;
				setError(err);
				setLoading(false);
			});
		return () => controller.abort();
	}, []);

	return { services, loading, error };
}
```

**Corré:** `pnpm verify`. **Resultado esperado:** todo verde (incluye cobertura 100 %: el `if` del
`AbortError` queda cubierto por este test).

### 3. 🔵 Refactor

Con todo en verde: nada que limpiar.

### 4. Commit

```sh
git add -A && git commit -m "fix(services): ignore aborted requests in the hook"
```

---

## Ciclo 12 — El archivo de datos real es válido

### 1. 🔴 Escribir el test

**Archivo:** `test/features/services/servicios.test.js` (**crealo**).
**Dónde:** el archivo entero.

```js
import { describe, expect, it } from "vitest";
import services from "../../../public/productos.json";

describe("public/productos.json", () => {
  it("has at least six services with unique ids and both languages", () => {
    const ids = services.map((service) => service.id);
    expect(services.length).toBeGreaterThanOrEqual(6);
    expect(new Set(ids).size).toBe(ids.length);
    for (const service of services) {
      expect(service.title.es && service.title.en).toBeTruthy();
      expect(service.description.es && service.description.en).toBeTruthy();
      expect(service.price).toBeGreaterThan(0);
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
git add -A && git commit -m "feat(services): add the services catalog data"
```

---

## Verificación manual

- [ ] `pnpm dev` y abrí `http://localhost:5173/productos.json`: se ve el JSON.
- [ ] Después del preview: `…/productos.json` responde también en Vercel.
- [ ] (Opcional) En DevTools → *Network*, bloqueá la URL y verificá en consola de un test rápido que
      tu `getServices` falla. La UI llega en US-08.

## Publicar

```sh
git push -u origin us-07-service-data-source
gh pr create --fill --base main && gh pr checks --watch
```

Squash merge: `feat: load the services from a data source (US-07)`.

## Commits sugeridos

```
docs: add US-07 service data source story
chore(test): set up msw for network mocking
feat(services): load the services from the json file
feat(services): reject when the services cannot be loaded
feat(services): find a service by id
feat(services): return null for an unknown id
feat(shared): pick a localized text by language
feat(shared): fall back to Spanish when a language is missing
feat(services): add the services hook in its loading state
feat(services): load the services in the hook
feat(services): expose loading errors in the hook
feat(services): abort the request when the hook unmounts
fix(services): ignore aborted requests in the hook
feat(services): add the services catalog data
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
- Una "costura" bien puesta (`servicesApi`) hace que cambiar de backend sea tocar un archivo.
