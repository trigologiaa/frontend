# Instructivo US-14: pulido visual, tema claro y auditoría (JavaScript)

Guía para implementar [US-14](../user-stories/us-14-visual-design-and-responsive.md) con el
[flujo](00-workflow.md).
Formato de los pasos: [Formato de los instructivos](00-workflow.md#formato-de-los-instructivos).

> **Cambio de enfoque:** el CSS ya **no** se escribe todo acá. Desde US-05 cada story estiliza lo que
> construye (tokens y estilos globales en US-05; landing, catálogo, detalle y carrito en US-06 a US-13).
> US-14 es el **pulido final**: revisar que el sitio sea consistente como un todo, sumar el tema
> claro (el sitio ya nace oscuro desde US-05), cerrar el trinquete de estilos y auditar accesibilidad y rendimiento. Si llegaste hasta acá
> siguiendo los ciclos de estilo, esta story es corta.

El método es el de siempre para CSS (ver la Parte B de
[US-05](us-05-company-and-team-in-footer-instructivo.md)):

- Lo **automatizable** (estructura de páginas, ningún componente sin módulo CSS, tokens del tema
  claro) se protege con tests chicos: **un test → mínimo código → commit**.
- Lo **visual** (¿se ve bien?, ¿es consistente?) se verifica a ojo, con DevTools y Lighthouse, y se
  commitea como `style:` en pasos chicos. Tus tests de comportamiento son la red de seguridad: si
  restilizar rompe algo, lo vas a ver.

## Qué vas a construir

Un sitio **consistente de punta a punta**: tema claro para quien lo prefiere en su sistema, movimiento
reducido respetado, estilos repetidos consolidados y una auditoría con números.

> **Concepto — temas con tokens:** el sitio nace con la paleta oscura violeta de US-05. Como todos los
> módulos usan `var(--token)` (la barrera de US-05 prohíbe los colores sueltos), basta **redefinir los
> tokens** dentro de `@media (prefers-color-scheme: light)` y todo el sitio cambia, sin tocar un solo
> componente. El tema por defecto no cambia: el claro es la alternativa para quien lo pide.
>
> **Concepto — `composes`:** en un CSS Module, `composes: primary from "../../../styles/button.module.css"`
> reutiliza las reglas de otra clase sin copiarlas. Sirve para lo que se repite en muchos lugares
> (el botón principal).

## Mapa de archivos

| Paso | Archivo | Acción |
| ---- | ------- | ------ |
| 1 | `test/pages.test.jsx` | **crear** (estructura de cada página) |
| 2 | `src/styles/button.module.css` | **crear** |
| 2 | `src/features/home/pages/Home.module.css` | editar (`.cta`) |
| 2 | `src/features/services/components/Item.module.css` | editar (`.link`) |
| 2 | `src/features/services/components/ItemDetail.module.css` | editar (`.add`) |
| 2 | `src/features/not-found/pages/NotFound.module.css` | editar (`.back`) |
| 2 | `src/features/cart/pages/CartPage.module.css` | editar (`.browse`) |
| 2 | `biome.json` | editar (solo si Biome se queja de `composes`) |
| 3 | `test/styles/tokens.test.js` | editar |
| 3 | `src/styles/tokens.css` | editar (tema claro, movimiento reducido) |
| 4 | `test/styles/components.test.js` | editar (borrar `pending`: ya no hace falta) |
| 5 | (sin archivos) | auditoría: contraste, teclado, Lighthouse |

## Paso 0: Preparar

```sh
git switch main && git pull
git switch -c us-14-visual-design-and-responsive
pnpm verify
cp <ruta-a>/javascript/user-stories/us-14-visual-design-and-responsive.md docs/
git add docs && git commit -m "docs: add US-14 visual design and responsive story"
```

Antes de tocar nada, **recorré el sitio entero** en `pnpm dev` a 360 y 1280 px y anotá en una lista
todo lo que te desentone (espacios distintos entre páginas, dos botones que no se parecen, un título
más chico que otro). Esa lista es tu plan de los pasos 2 y 3.

Controlá también que el trinquete llegó vacío: en `test/styles/components.test.js` la lista
`pending` debería ser `const pending = [];`. Si queda algún componente, es uno al que ninguna story le
dio estilo: dáselo ahora con el **ciclo de estilo** del workflow.

---

## Paso 1 — Cada página tiene un `<main>` y un `<h1>`

Hasta ahora las páginas se probaron de a una. Este test las recorre todas juntas. **No cambia código
productivo**: pasa de entrada y se valida con una mutación.

### 1. Test (pasa de entrada)

**Archivo:** `test/pages.test.jsx` (**crealo**, en la raíz de `test/`, al lado de `App.test.jsx`).
**Dónde:** el archivo entero.

```jsx
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { makeService, servicesHandler } from "./handlers";
import { renderWithProviders } from "./renderWithProviders";
import { server } from "./server";

describe("page structure", () => {
  it.each(["/", "/servicios", "/servicio/service-1", "/carrito", "/no-existe"])(
    "has exactly one main landmark and one level-1 heading at %s",
    async (route) => {
      server.use(servicesHandler([makeService(1)]));
      renderWithProviders(<App />, { route });
      await screen.findByRole("main");
      expect(screen.getAllByRole("main")).toHaveLength(1);
      expect(await screen.findAllByRole("heading", { level: 1 })).toHaveLength(1);
    },
  );
});
```

> Un solo `<h1>` por página y landmarks únicos son la base de la navegación con lector de pantalla.

**Corré:** `pnpm test:run`. **Resultado esperado:** verde (cinco casos). Si alguna ruta tiene dos `<h1>`
(o ninguno mientras carga), el rojo te lo muestra: arreglalo en el componente correspondiente y
commiteá `fix(a11y): ...` aparte.

### 2. Mutación

1. En `src/layout/Footer.jsx` agregá `<h1>Prueba</h1>` dentro del `<footer>`.
2. **Corré** `pnpm test:run`. **Rojo esperado:** `expected [ <h1>, <h1> ] to have a length of 1` en
   los cinco casos.
3. **Restaurá** y corré de nuevo: verde.

### 3. Commit

```sh
git add -A && git commit -m "test(app): keep one main and one h1 on every page"
```

---

## Paso 2 — Consolidar lo que se repite

Con todas las stories estiladas vas a encontrar **copias**: el botón principal (fondo `primary`, texto
`primary-contrast`, 44 px de alto) está escrito en cinco módulos:

| Archivo | Clase |
| ------- | ----- |
| `src/features/home/pages/Home.module.css` | `.cta` |
| `src/features/services/components/Item.module.css` | `.link` |
| `src/features/services/components/ItemDetail.module.css` | `.add` |
| `src/features/not-found/pages/NotFound.module.css` | `.back` |
| `src/features/cart/pages/CartPage.module.css` | `.browse` |

Es la regla de tres: con cinco usos, ya se justifica extraer. Esto es un **refactor**: mismo
comportamiento y mismo aspecto, menos CSS.

### 1. Crear la regla común

**Archivo:** `src/styles/button.module.css` (**crealo**).
**Dónde:** el archivo entero. El relleno horizontal (`padding`) **no** va acá: cada botón tiene el suyo.

```css
.primary {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 2.75rem;
	font-weight: 600;
	color: var(--color-primary-contrast);
	text-decoration: none;
	background: var(--color-primary);
	border-radius: var(--radius);
}

.primary:hover {
	filter: brightness(1.1);
}
```

### 2. Usarla en cada módulo

En cada archivo, **reemplazá la regla entera** de la clase indicada por la versión de abajo. La ruta
de `composes` es la misma en los cinco (`../../../styles/button.module.css`) porque todos están a tres
carpetas de `src/`.

**Archivo:** `src/features/home/pages/Home.module.css`
**Dónde:** la regla `.cta { ... }` (la de afuera del `@media`).

```css
.cta {
	composes: primary from "../../../styles/button.module.css";
	padding: 0 var(--space-6);
}
```

**Archivo:** `src/features/services/components/Item.module.css`
**Dónde:** la regla `.link { ... }`.

```css
.link {
	composes: primary from "../../../styles/button.module.css";
	margin-top: auto;
	padding: 0 var(--space-4);
}
```

**Archivo:** `src/features/services/components/ItemDetail.module.css`
**Dónde:** la regla `.add { ... }` (es un `<button>`, por eso conserva `font`, `border` y `cursor`).

```css
.add {
	composes: primary from "../../../styles/button.module.css";
	padding: 0 var(--space-6);
	font: inherit;
	font-weight: 600;
	border: 0;
	cursor: pointer;
}
```

**Archivo:** `src/features/not-found/pages/NotFound.module.css`
**Dónde:** la regla `.back { ... }`.

```css
.back {
	composes: primary from "../../../styles/button.module.css";
	padding: 0 var(--space-4);
}
```

**Archivo:** `src/features/cart/pages/CartPage.module.css`
**Dónde:** la regla `.browse { ... }`.

```css
.browse {
	composes: primary from "../../../styles/button.module.css";
	padding: 0 var(--space-6);
}
```

### 3. Comprobar que no cambió nada

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde. Después mirá cada pantalla a 360 y
1280 px (`pnpm dev`): ninguna tiene que haber cambiado.

> Si Biome se queja de `composes` (`pnpm lint:ci`), activá el parseo de CSS Modules en `biome.json`.

**Archivo (solo si hace falta):** `biome.json`
**Dónde:** dentro de la clave `"css"` (créala al lado de `"javascript"` si no existe).

```json
	"css": {
		"parser": {
			"cssModules": true
		}
	},
```

Otros candidatos típicos, si los encontraste en tu recorrido: el estilo de los mensajes de estado y la
alerta de error (`ItemListContainer`, `ItemDetailContainer`), y los títulos de página (`h1`). Extraelos
solo si están realmente repetidos.

### 4. Commit

```sh
pnpm verify && git add -A && git commit -m "refactor(styles): share the primary button"
```

Después, un `style:` por cada desajuste de tu lista que sea de **valores** (espacios, tamaños de
título): se arregla en el módulo del componente, **siempre con tokens**. Si te falta un valor en la
escala (por ejemplo `--space-12`), agregalo a `src/styles/tokens.css` en vez de escribir el número
suelto, y sumalo a la lista de `test/styles/tokens.test.js` (🔴 primero).

---

## Paso 3 — Tema claro y movimiento reducido

El tema es un **cambio de tokens**; se empieza por el test que lo protege. Son **dos** tests, hacelos
**de a uno**, un commit cada uno.

### 3a. Tema claro

#### 1. 🔴 Escribir el test

**Archivo:** `test/styles/tokens.test.js`
**Dónde:** dentro del `describe("design tokens", ...)`, después del `it.each([...])` que ya existe.

```js
  it("redefines the palette for the light color scheme", () => {
    expect(tokens).toMatch(/@media \(prefers-color-scheme: light\)/);
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
expected '...' to match /@media \(prefers-color-scheme: light\)/
```

#### 2. 🟢 Hacerlo pasar

**Archivo:** `src/styles/tokens.css`
**Dónde:** al **final** del archivo, después del bloque `:root { ... }`.

```css
@media (prefers-color-scheme: light) {
	:root {
		color-scheme: light;
		--color-background: #ffffff;
		--color-surface: #f4f5f7;
		--color-text: #1f2328;
		--color-muted: #57606a;
		--color-border: #d0d7de;
		--color-primary: #7b2cbf;
		--color-primary-contrast: #ffffff;
		--color-danger: #b42318;
		--color-danger-surface: #fef3f2;
		--shadow: 0 1px 3px rgb(0 0 0 / 12%);
		--background-image: none;
	}
}
```

`--background-image: none` es necesario: el `body` usa `var(--background-image), var(--color-background)`,
y sin él el degradé oscuro taparía el fondo claro. El violeta `#7b2cbf` con texto blanco da unos 7:1
(comprobalo con el color picker).

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde (incluida la barrera de colores sueltos:
las reglas de `tokens.css` no son módulos).

Probá el tema claro sin cambiar el sistema: DevTools → *⋮ → More tools → Rendering → Emulate CSS media
feature prefers-color-scheme: light*. Recorré **todas las páginas** y todos los estados (carga, error,
vacío, hover, deshabilitado): lo que se vea mal casi siempre es un color que no pasó por un token (y la
barrera lo habría frenado) o una sombra pensada solo para oscuro.

#### 3. Commit

```sh
git add -A && git commit -m "style: add the light theme"
```

### 3b. Movimiento reducido

#### 1. 🔴 Escribir el test

**Archivo:** `test/styles/tokens.test.js`
**Dónde:** dentro del `describe`, después del test de 3a.

```js
  it("respects reduced motion", () => {
    expect(tokens).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });
```

**Corré:** `pnpm test:run`. **Rojo esperado:**

```
expected '...' to match /@media \(prefers-reduced-motion: reduce\)/
```

#### 2. 🟢 Hacerlo pasar

**Archivo:** `src/styles/tokens.css`
**Dónde:** al **final** del archivo, después del bloque del tema claro.

```css
@media (prefers-reduced-motion: reduce) {
	* {
		animation: none !important;
		transition: none !important;
	}
}
```

**Corré:** `pnpm test:run`. **Resultado esperado:** todo verde.

#### 3. Commit

```sh
git add -A && git commit -m "style: respect reduced motion"
```

---

## Paso 4 — Cerrar el trinquete

`pending` cumplió su función: ahora todo componente tiene módulo y no hace falta una lista de
excepciones. Dejá el test más simple y más estricto.

### 1. 🔴 Test más estricto

**Archivo:** `test/styles/components.test.js`
**Dónde:** reemplazá el archivo entero (se va la constante `pending`, la condición
`!pending.includes(...)` y el segundo test).

```js
import { describe, expect, it } from "vitest";

const components = Object.keys(
  import.meta.glob([
    "../../src/layout/*.jsx",
    "../../src/features/*/components/*.jsx",
    "../../src/features/*/pages/*.jsx",
  ]),
).map((path) => path.replace("../../", ""));

const modules = import.meta.glob("../../src/**/*.module.css", {
  query: "?raw",
  import: "default",
  eager: true,
});

const hasStyles = (component) =>
  Boolean(
    modules[`../../${component.replace(/\.jsx$/, ".module.css")}`]?.trim(),
  );

describe("component styles", () => {
  it("gives every component its own CSS module", () => {
    const unstyled = components.filter((component) => !hasStyles(component));
    expect(unstyled).toEqual([]);
  });
});
```

**Corré:** `pnpm test:run`. **Resultado esperado:** verde (si no, el rojo te nombra el componente que
se coló: dale su módulo).

### 2. Mutación

1. Renombrá `src/features/services/components/Item.module.css` a `Item.css`.
2. **Corré** `pnpm test:run`. **Rojo esperado:** el mensaje incluye
   `src/features/services/components/Item.jsx`.
3. **Deshacé** el cambio de nombre y corré de nuevo: verde.

> Desde ahora, un componente nuevo sin CSS rompe el test **apenas lo creás**: el estilo no se puede
> olvidar. La excepción deliberada (un componente sin interfaz propia) se discute en el PR, no se
> esconde en una lista.

### 3. Commit

```sh
pnpm verify && git add -A && git commit -m "test: require a CSS module for every component"
```

---

## Paso 5 — Auditoría (lo que los tests no ven)

1. **Desborde horizontal a 360 px:** en la consola de DevTools,
   `document.documentElement.scrollWidth > window.innerWidth` debe dar `false` en **cada** ruta
   (`/`, `/servicios`, `/servicio/landing-page`, `/carrito`, `/no-existe`).
2. **Contraste:** en *Elements*, clic en un texto → el color picker muestra la relación de contraste:
   texto normal ≥ **4.5:1** (AA), en oscuro **y** claro. Mirá en especial `muted` sobre `surface` y
   `primary` sobre `background`.
3. **Teclado:** recorré todo el sitio con Tab: el foco siempre se ve y el orden es lógico.
4. **Lighthouse:** DevTools → *Lighthouse* → *Mobile* → Accessibility + Performance + Best Practices
   + SEO sobre el **preview** de Vercel (producción es más fiel que `localhost`). Objetivo:
   Accessibility 100, Performance ≥ 90. Anotá los puntajes y las correcciones en el PR.
5. **Consola:** sin errores ni *warnings*.

Cada corrección: un commit `style(...)` o `fix(a11y): ...`; si es un comportamiento, **primero el test**.
Si arreglás un contraste, cambiá el **token** (en `src/styles/tokens.css`), no el componente: se
corrige en todo el sitio a la vez.

*(Desafío opcional: sumar `vitest-axe` para automatizar chequeos de accesibilidad en los tests.)*

---

## Verificación manual

- [ ] Cada página a 360, 768 y 1280 px, en oscuro (por defecto) y en claro.
- [ ] Solo teclado; Lighthouse corrido y puntajes en el PR.
- [ ] Sin errores en consola.

## Publicar

```sh
git push -u origin us-14-visual-design-and-responsive
gh pr create --fill --base main && gh pr checks --watch
```

Squash merge: `feat: polish the visual design with a light theme (US-14)`.

## Commits sugeridos

```
docs: add US-14 visual design and responsive story
test(app): keep one main and one h1 on every page
refactor(styles): share the primary button
style(...): (un commit por desajuste de tu lista)
style: add the light theme
style: respect reduced motion
test: require a CSS module for every component
fix(a11y): ...                                     (lo que encuentre la auditoría)
```

## Definition of Done

- [ ] Los tests automáticos pasan (tokens incluidos los del tema, estructura de páginas, un módulo CSS
      por componente, sin colores sueltos) y `pending` ya no existe.
- [ ] `pnpm verify` y el pipeline en verde; auditoría manual hecha y anotada en el PR.
- [ ] Commits convencionales (`style:` para CSS).

## Qué aprendiste

- Cambiar o sumar un tema es cambiar **tokens**, no componentes.
- Consolidar duplicados (`composes`) como refactor: mismo aspecto, menos CSS.
- Qué se puede automatizar en un sitio visual (estructura, reglas) y qué se mira a ojo.
- Usar atributos de accesibilidad (`aria-current`, `aria-pressed`) también como gancho de estilo.
- Lighthouse y DevTools como herramientas de tu oficio.
