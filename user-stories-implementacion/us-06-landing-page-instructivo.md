# Instructivo US-06: landing page (JavaScript)

Guía para implementar [US-06](../user-stories/us-06-landing-page.md) con el [flujo](00-workflow.md).
Formato de los pasos: [Formato de los instructivos](00-workflow.md#formato-de-los-instructivos).

## Qué vas a construir

La página de `/`: un *hero* (título + propuesta de valor + botón hacia el catálogo), tres
destacados y el título de la pestaña del navegador. Reemplaza la página provisoria de US-02.

> **Concepto — el contenido también es comportamiento:** el test comprueba lo que una persona lee
> ("veo el título", "puedo ir al catálogo"), no la estructura del HTML. Por eso los tests usan
> `getByRole` y los textos vienen de los catálogos: si cambiás el copy en `es.json`, los tests
> no se enteran (leen el mismo archivo).

> **Ruta del catálogo:** el catálogo vive en **`/servicios`** (`src/App.jsx`, `src/layout/NavBar.jsx`).
> El botón tiene que apuntar ahí; si apunta a otra ruta el test del link falla y el click cae en la
> página 404. El texto visible sigue diciendo "Servicios".

## Mapa de archivos

| Ciclo | Archivo | Acción |
| ----- | ------- | ------ |
| 1–6 | `src/i18n/locales/es.json` | editar (claves `home.*`) |
| 1–6 | `src/i18n/locales/en.json` | editar (las mismas claves) |
| 1–3, 5–7 | `test/features/home/pages/Home.test.jsx` | **crear** en el ciclo 1, editar después |
| 1–3, 5, 7 | `src/features/home/pages/Home.jsx` | editar |
| 1, 4 | `test/App.test.jsx` | editar |
| 1 | `test/features/not-found/pages/NotFound.test.jsx` | editar |
| 7 | `src/shared/useDocumentTitle.js` | **crear** |
| 7 | `test/shared/useDocumentTitle.test.jsx` | **crear** |
| 7 | `index.html` | editar |
| S | `test/styles/components.test.js` | editar |
| S | `src/features/home/pages/Home.module.css` | **crear** |

## Paso 0: Preparar

```sh
git switch main && git pull
git switch -c us-06-landing-page
pnpm verify
cp <ruta-a>/javascript/user-stories/us-06-landing-page.md docs/
git add docs && git commit -m "docs: add US-06 landing page story"
```

> **Regla de los catálogos:** el test `test/i18n/locales/locales.test.js` exige que `es.json` y
> `en.json` tengan **las mismas claves**. Por eso, en cada ciclo, las claves nuevas se agregan en
> **los dos archivos antes de escribir el test**. Si faltan, el test del ciclo falla con un
> `TypeError: Cannot read properties of undefined` (no con el rojo que esperás) o falla el test de
> paridad.

---

## Ciclo 1 — El título del hero

### 1. Agregar el título en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** nueva clave de primer nivel `"home"`, **antes** de `"nav"` (primera clave del objeto).

```json
{
	"home": {
		"title": "Software a tu medida, sin vueltas"
	},
	"nav": {
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual, antes de `"nav"`.

```json
{
	"home": {
		"title": "Custom software, no fuss"
	},
	"nav": {
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/home/pages/Home.test.jsx` (**crealo**; la carpeta `test/features/home/pages/` puede no existir todavía).
**Dónde:** el archivo entero.

```jsx
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import es from "../../../../src/i18n/locales/es.json";
import { renderWithProviders } from "../../../renderWithProviders";
import { Home } from "../../../../src/features/home/pages/Home";

describe("Home", () => {
  it("shows the main heading of the hero", () => {
    renderWithProviders(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: es.home.title })).toBeInTheDocument();
  });
});
```

**Corré:** `pnpm test:run`
**Rojo esperado (falla solo este test):**

```
Unable to find an accessible element with the role "heading" and name "Software a tu medida, sin vueltas"
```

(la página todavía muestra "Inicio").

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/home/pages/Home.jsx`
**Dónde:** reemplazá el contenido del archivo entero.

```jsx
import { useTranslation } from "react-i18next";

export function Home() {
	const { t } = useTranslation();
	return <h1>{t("home.title")}</h1>;
}
```

(Lo único que cambia respecto de US-02 es la clave: `nav.home` → `home.title`.)

**Corré:** `pnpm test:run`
**Resultado esperado:** el test de `Home` pasa, pero fallan **otros dos tests**. Es lo esperado:
cambió el comportamiento a propósito. Los arreglás en el paso 4.

### 4. Actualizar los tests viejos (mismo commit)

> El test viejo y el código nuevo no pueden vivir separados: ambos se arreglan antes del commit.

**Archivo:** `test/App.test.jsx`

1. **Dónde (imports, arriba del archivo):** agregá esta línea justo **antes** de
   `import { i18n } from "../src/i18n/index.js";`:

   ```jsx
   import es from "../src/i18n/locales/es.json";
   ```

2. **Dónde (test `"shows the home page inside the layuot at '/'"`):** en el `expect` del `<h1>`,
   cambiá `name: "Inicio"` por `name: es.home.title`:

   ```jsx
   it("shows the home page inside the layuot at '/'", () => {
     renderWithProviders(<App />, { route: "/" });
     expect(screen.getByRole("heading", { level: 1, name: es.home.title })).toBeInTheDocument();
     expect(within(screen.getByRole("banner")).getByText("Trigologiaa Dev")).toBeInTheDocument();
   });
   ```

   **No toques** los otros `"Inicio"` del archivo (el del test `"moves the mark when section is
   followed"`): ese es el nombre del **link** del navbar y sigue siendo "Inicio".

**Archivo:** `test/features/not-found/pages/NotFound.test.jsx`

1. **Dónde (imports):** agregá, antes de `import { App } ...`:

   ```jsx
   import es from "../../../../src/i18n/locales/es.json";
   ```

2. **Dónde (único test):** cambiá `name: "Inicio"` por `name: es.home.title` en la última línea:

   ```jsx
   expect(screen.getByRole("heading", { level: 1, name: es.home.title })).toBeInTheDocument();
   ```

   (Este test navega "Volver al inicio" y comprueba que llegó a la home: ahora la home tiene otro `<h1>`.)

**Corré:** `pnpm test:run`
**Resultado esperado:** todo verde.

### 5. Commit

```sh
git add -A && git commit -m "feat(home): show the hero title"
```

---

## Ciclo 2 — La propuesta de valor

### 1. Agregar el texto en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"home"`, después de `"title"` (agregá la coma al final de `"title"`).

```json
"home": {
	"title": "Software a tu medida, sin vueltas",
	"pitch": "Sitios web, APIs y mentoría técnica: te ayudo a pasar de la idea a algo que funciona."
},
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"home": {
	"title": "Custom software, no fuss",
	"pitch": "Websites, APIs and technical mentoring: I help you go from idea to something that works."
},
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/home/pages/Home.test.jsx`
**Dónde:** dentro del `describe("Home", ...)`, **después** del test del ciclo 1 y antes del `});` final.

```jsx
  it("shows the value proposition", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(es.home.pitch)).toBeInTheDocument();
  });
```

> Es `getByText`, no `getByRole`: el pitch es texto suelto, no un rol. (`getByRole(texto)` busca un
> *rol* con ese nombre y falla con otro error.)

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Unable to find an element with the text: Sitios web, APIs y mentoría técnica: te ayudo a pasar de la idea a algo que funciona.
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/home/pages/Home.jsx`
**Dónde:** reemplazá el `return` por un fragmento `<>` con el `h1` y un `<p>`.

```jsx
import { useTranslation } from "react-i18next";

export function Home() {
	const { t } = useTranslation();
	return (
		<>
			<h1>{t("home.title")}</h1>
			<p>{t("home.pitch")}</p>
		</>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(home): show the value proposition"
```

---

## Ciclo 3 — El botón lleva al catálogo

### 1. Agregar el texto del botón en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"home"`, después de `"pitch"` (agregá la coma al final de `"pitch"`).

```json
"cta": "Ver servicios"
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"cta": "See services"
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/home/pages/Home.test.jsx`
**Dónde:** dentro del `describe("Home", ...)`, **después** del test del ciclo 2.

```jsx
  it("offers a call to action that links to the catalog", () => {
    renderWithProviders(<Home />);
    expect(screen.getByRole("link", { name: es.home.cta })).toHaveAttribute("href", "/servicios");
  });
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Unable to find an accessible element with the role "link" and name "Ver servicios"
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/home/pages/Home.jsx`

1. **Dónde (imports):** agregá, justo **debajo** del import de `react-i18next`:

   ```jsx
   import { Link } from "react-router-dom";
   ```

2. **Dónde (`return`):** agregá el `<Link>` **después** del `<p>`, dentro del fragmento:

   ```jsx
   <Link to="/servicios">{t("home.cta")}</Link>
   ```

**Archivo completo después de este ciclo:**

```jsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function Home() {
	const { t } = useTranslation();
	return (
		<>
			<h1>{t("home.title")}</h1>
			<p>{t("home.pitch")}</p>
			<Link to="/servicios">{t("home.cta")}</Link>
		</>
	);
}
```

> Biome ordena los imports por origen (`react-i18next` antes que `react-router-dom`). Si te marca
> el orden, `pnpm biome check --write src` lo acomoda.

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(home): add the call to action to the catalog"
```

---

## Ciclo 4 — El botón navega sin recargar

Este ciclo **no cambia código productivo**: agrega un test de integración que pasa de entrada y se
valida con una *mutación*.

### 1. 🔴 Escribir el test (pasa de entrada)

**Archivo:** `test/App.test.jsx`
**Dónde:** dentro del `describe("App routes", ...)`, **después** del test `"changes the page when a
navigation link is followed"`. `userEvent` y `es` ya están importados (el `es` lo agregaste en el
ciclo 1).

```jsx
  it("goes from the landing page to the catalog with the call to action", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/" });
    await user.click(screen.getByRole("link", { name: es.home.cta }));
    expect(screen.getByRole("heading", { level: 1, name: es.nav.services })).toBeInTheDocument();
  });
```

(`es.nav.services` es "Servicios", el `<h1>` de la página del catálogo.)

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación (comprobar que el test protege algo)

1. En `src/features/home/pages/Home.jsx` cambiá `<Link to="/servicios">...</Link>` por
   `<a href="/servicios">...</a>`.
2. **Corré** `pnpm test:run`. **Rojo esperado:** el test falla (un `<a>` recarga la página; en
   jsdom no navega por el router).
3. **Restaurá** el `<Link>` y corré de nuevo: verde.

### 3. Commit

```sh
git add -A && git commit -m "test(home): follow the call to action"
```

---

## Ciclo 5 — Tres destacados

### 1. Agregar los textos en los catálogos

**Archivo:** `src/i18n/locales/es.json`
**Dónde:** dentro de `"home"`, después de `"cta"` (agregá la coma al final de `"cta"`).

```json
"highlights": {
	"title": "Qué puedo hacer por vos",
	"web": "Web · Landing pages y aplicaciones React",
	"backend": "Backend · APIs REST y bases de datos",
	"mentoring": "Mentoría · Git, Linux y buenas prácticas"
}
```

**Archivo:** `src/i18n/locales/en.json`
**Dónde:** igual.

```json
"highlights": {
	"title": "What I can do for you",
	"web": "Web · Landing pages and React apps",
	"backend": "Backend · REST APIs and databases",
	"mentoring": "Mentoring · Git, Linux and good practices"
}
```

### 2. 🔴 Escribir el test

**Archivo:** `test/features/home/pages/Home.test.jsx`

1. **Dónde (primer import):** sumá `within`:

   ```jsx
   import { screen, within } from "@testing-library/react";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 3.

   ```jsx
     it("shows three highlights under their own heading", () => {
       renderWithProviders(<Home />);
       const section = screen.getByRole("region", { name: es.home.highlights.title });
       expect(within(section).getAllByRole("listitem")).toHaveLength(3);
     });
   ```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Unable to find an accessible element with the role "region" and name "Qué puedo hacer por vos"
```

### 3. 🟢 Hacerlo pasar

**Archivo:** `src/features/home/pages/Home.jsx`
**Dónde:** dentro del fragmento, **después** del `<Link>`.

**Archivo completo después de este ciclo:**

```jsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function Home() {
	const { t } = useTranslation();
	return (
		<>
			<h1>{t("home.title")}</h1>
			<p>{t("home.pitch")}</p>
			<Link to="/servicios">{t("home.cta")}</Link>
			<section aria-labelledby="highlights-title">
				<h2 id="highlights-title">{t("home.highlights.title")}</h2>
				<ul>
					<li>{t("home.highlights.web")}</li>
					<li>{t("home.highlights.backend")}</li>
					<li>{t("home.highlights.mentoring")}</li>
				</ul>
			</section>
		</>
	);
}
```

> Un `<section>` solo es un "region" para los lectores de pantalla **si tiene nombre**
> (`aria-labelledby`). Por eso el test lo encuentra por rol `region` y nombre.

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

### 4. Commit

```sh
git add -A && git commit -m "feat(home): show three highlights"
```

---

## Ciclo 6 — La landing habla inglés

Este ciclo **no cambia código productivo** (los textos en inglés ya están en `en.json` desde los
ciclos 1–5): agrega un test que protege que el catálogo en inglés sea el correcto.

### 1. 🔴 Escribir el test (pasa de entrada)

**Archivo:** `test/features/home/pages/Home.test.jsx`

1. **Dónde (imports):** agregá, después del import de `Home`:

   ```jsx
   import { i18n } from "../../../../src/i18n";
   ```

2. **Dónde (dentro del `describe`):** después del test del ciclo 5.

   ```jsx
     it("is translated to English", async () => {
       await i18n.changeLanguage("en");
       renderWithProviders(<Home />);
       expect(screen.getByRole("heading", { level: 1, name: "Custom software, no fuss" })).toBeInTheDocument();
       expect(screen.getByRole("link", { name: "See services" })).toBeInTheDocument();
     });
   ```

   Los textos van **literales** (no `en.home.title`): el test protege que `en.json` tenga el texto
   correcto. No hace falta volver a `es` al final: `test/setup.js` lo hace antes de cada test.

**Corré:** `pnpm test:run`. **Resultado esperado:** verde de entrada.

### 2. Mutación

1. En `src/i18n/locales/en.json` cambiá una letra de `"Custom software, no fuss"`.
2. **Corré** `pnpm test:run`. **Rojo esperado:** falla el test `"is translated to English"`.
3. **Restaurá** el texto y corré de nuevo: verde.

### 3. Commit

```sh
git add -A && git commit -m "test(home): translate the landing page"
```

---

## Ciclo 7 — El título de la pestaña

### Parte A — El hook `useDocumentTitle`

#### 1. 🔴 Escribir el test

**Archivo:** `test/shared/useDocumentTitle.test.jsx` (**crealo**; la carpeta `test/shared/` es nueva).
**Dónde:** el archivo entero. Un hook se prueba con `renderHook`.

```jsx
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDocumentTitle } from "../../src/shared/useDocumentTitle";

describe("useDocumentTitle", () => {
  it("sets the browser tab title", () => {
    renderHook(() => useDocumentTitle("Trigologia Dev"));
    expect(document.title).toBe("Trigologia Dev");
  });
});
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
Failed to resolve import "../../src/shared/useDocumentTitle"
```

#### 2. 🟢 Hacerlo pasar

**Archivo:** `src/shared/useDocumentTitle.js` (**crealo**; la carpeta `src/shared/` es nueva).
**Dónde:** el archivo entero.

```js
import { useEffect } from "react";

export function useDocumentTitle(title) {
	useEffect(() => {
		document.title = title;
	}, [title]);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde. (Si Knip se queja de que el hook no se
usa, es temporal: lo usás en la Parte B.)

#### 3. Commit

```sh
git add -A && git commit -m "feat(shared): add a hook to set the document title"
```

### Parte B — Usar el hook en la landing

#### 1. 🔴 Escribir el test

**Archivo:** `test/features/home/pages/Home.test.jsx`
**Dónde:** dentro del `describe`, **después** del test del ciclo 6.

```jsx
  it("sets the browser tab title to the brand name", () => {
    renderWithProviders(<Home />);
    expect(document.title).toBe("Trigologia Dev");
  });
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
expected '' to be 'Trigologia Dev'
```

(si el test del hook corrió antes en el mismo proceso, puede decir otro título: el punto es que no
es "Trigologia Dev").

#### 2. 🟢 Hacerlo pasar

**Archivo:** `src/features/home/pages/Home.jsx`

1. **Dónde (imports):** agregá al final de los imports:

   ```jsx
   import { useDocumentTitle } from "../../../shared/useDocumentTitle";
   ```

2. **Dónde (primera línea del cuerpo de `Home`):** antes del `return`, **después** de `useTranslation`:

   ```jsx
   useDocumentTitle("Trigologia Dev");
   ```

**Archivo completo después de este ciclo:**

```jsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../../shared/useDocumentTitle";

export function Home() {
	const { t } = useTranslation();
	useDocumentTitle("Trigologia Dev");
	return (
		<>
			<h1>{t("home.title")}</h1>
			<p>{t("home.pitch")}</p>
			<Link to="/servicios">{t("home.cta")}</Link>
			<section aria-labelledby="highlights-title">
				<h2 id="highlights-title">{t("home.highlights.title")}</h2>
				<ul>
					<li>{t("home.highlights.web")}</li>
					<li>{t("home.highlights.backend")}</li>
					<li>{t("home.highlights.mentoring")}</li>
				</ul>
			</section>
		</>
	);
}
```

#### 3. Configuración sin test: el `<title>` inicial

**Archivo:** `index.html`
**Dónde:** línea 7, la etiqueta `<title>`.

```html
<title>Trigologia Dev</title>
```

(Antes decía `trigologiaa-dev-javascript`. Es lo que ven los buscadores antes de que React cargue;
es configuración, sin test.)

**Corré:** `pnpm verify`. **Resultado esperado:** todo verde.

#### 4. Commit

```sh
git add -A && git commit -m "feat(home): set the tab title to the brand name"
```

---

## Ciclo S — La landing se ve como una landing

Con el contenido ya probado, ahora se estila. Seguí el **ciclo de estilo** del
[workflow](00-workflow.md#2b-el-css-se-escribe-junto-con-cada-story-y-se-testea-así).

### 1. 🔴 Sacar `Home` de la lista `pending`

**Archivo:** `test/styles/components.test.js`
**Dónde:** el array `pending`, primera línea. Borrá `"src/features/home/pages/Home.jsx",`:

```js
const pending = [
  "src/features/services/pages/ItemListContainer.jsx",
  "src/features/services/pages/ItemDetailContainer.jsx",
  "src/features/cart/pages/CartPage.jsx",
];
```

**Corré:** `pnpm test:run`
**Rojo esperado:**

```
expected [ 'src/features/home/pages/Home.jsx' ] to deeply equal []
```

### 2. 🟢 Crear el módulo de estilos

**Archivo:** `src/features/home/pages/Home.module.css` (**crealo**, al lado de `Home.jsx`).
**Dónde:** el archivo entero. Solo tokens (`var(--...)`): nada de colores sueltos.

```css
.hero {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: var(--space-4);
	padding: var(--space-8) 0;
}

.title {
	margin: 0;
	font-size: var(--font-size-xl);
	line-height: 1.2;
}

.pitch {
	margin: 0;
	max-width: 40rem;
	font-size: var(--font-size-lg);
	color: var(--color-muted);
}

.cta {
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

.highlights {
	display: flex;
	flex-direction: column;
	gap: var(--space-4);
}

.highlightsTitle {
	margin: 0;
	font-size: var(--font-size-lg);
}

.highlightsList {
	display: grid;
	gap: var(--space-4);
	margin: 0;
	padding: 0;
	list-style: none;
}

.highlight {
	padding: var(--space-4);
	background: var(--color-surface);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
}

@media (min-width: 48rem) {
	.hero {
		padding: calc(var(--space-8) * 2) 0;
	}

	.title {
		font-size: 2.5rem;
	}

	.highlightsList {
		grid-template-columns: repeat(3, 1fr);
	}
}
```

**Archivo:** `src/features/home/pages/Home.jsx`
**Dónde:** el archivo entero (agrega el import de estilos y los `className`; el texto y las
etiquetas no cambian).

```jsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../../shared/useDocumentTitle";
import styles from "./Home.module.css";

export function Home() {
	const { t } = useTranslation();
	useDocumentTitle("Trigologia Dev");
	return (
		<>
			<div className={styles.hero}>
				<h1 className={styles.title}>{t("home.title")}</h1>
				<p className={styles.pitch}>{t("home.pitch")}</p>
				<Link className={styles.cta} to="/servicios">
					{t("home.cta")}
				</Link>
			</div>
			<section className={styles.highlights} aria-labelledby="highlights-title">
				<h2 className={styles.highlightsTitle} id="highlights-title">
					{t("home.highlights.title")}
				</h2>
				<ul className={styles.highlightsList}>
					<li className={styles.highlight}>{t("home.highlights.web")}</li>
					<li className={styles.highlight}>{t("home.highlights.backend")}</li>
					<li className={styles.highlight}>{t("home.highlights.mentoring")}</li>
				</ul>
			</section>
		</>
	);
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde (los tests consultan por rol y texto,
no por clase).

### 3. 🔵 Mirar el navegador

**Corré:** `pnpm dev` y abrí la landing.

- A **360 px**: título, texto y botón entran sin scroll; los destacados quedan apilados.
- A **1280 px**: los destacados quedan en tres columnas.
- El botón es lo más llamativo de la pantalla: si no lo es, ajustá espacios y tamaños en
  `Home.module.css`.

### 4. Commit

```sh
pnpm test:run && git add -A && git commit -m "style(home): style the landing page"
```

---

## Verificación manual

- [ ] `pnpm dev`: *leelo como un desconocido*: ¿se entiende qué se vende y qué hacer después?
- [ ] El botón lleva a `/servicios` sin recargar. La pestaña dice "Trigologia Dev".
- [ ] Cambiá el idioma: todo cambia. A 360 px el título, el texto y el botón se ven sin hacer scroll.
- [ ] Sin errores en consola.
- [ ] 360 px y 1280 px: el título, el botón y los tres destacados se ven bien; solo teclado: el foco del botón se ve.

## Publicar

```sh
git push -u origin us-06-landing-page
gh pr create --fill --base main && gh pr checks --watch
```

Squash merge: `feat: add the landing page (US-06)`.

## Commits sugeridos

```
docs: add US-06 landing page story
feat(home): show the hero title
feat(home): show the value proposition
feat(home): add the call to action to the catalog
test(home): follow the call to action
feat(home): show three highlights
test(home): translate the landing page
feat(shared): add a hook to set the document title
feat(home): set the tab title to the brand name
style(home): style the landing page
```

## Definition of Done

- [ ] Todos los escenarios pasan como tests.
- [ ] `pnpm verify` y el pipeline en verde; verificación manual hecha.
- [ ] Commits convencionales.
- [ ] `Home` tiene su `.module.css` y salió de `pending`.

## Qué aprendiste

- Un cambio de comportamiento deliberado obliga a actualizar el test viejo **en el mismo commit**
  (acá, dos tests: `App.test.jsx` y `NotFound.test.jsx`).
- Las claves de i18n se agregan en **los dos idiomas antes del test**; si no, falla por otra razón.
- Un hook propio (`useDocumentTitle`) se prueba con `renderHook`.
- `<section>` con nombre accesible = región navegable para lectores de pantalla.
