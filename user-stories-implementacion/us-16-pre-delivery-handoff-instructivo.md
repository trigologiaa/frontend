# Instructivo US-16: cierre y entrega de la pre-entrega (JavaScript)

Guía para implementar [US-16](../user-stories/us-16-pre-delivery-handoff.md) con el
[flujo](00-workflow.md). Es la story de **cierre**: no agrega funcionalidad, verifica y documenta.
Se trata como cualquier otra (rama, PR), no como un apuro de último momento.
Formato de los pasos: [Formato de los instructivos](00-workflow.md#formato-de-los-instructivos).

## Qué vas a construir

1. Un test que **te obliga** a reemplazar todo el texto provisorio (nombres de equipo, email,
   `TODO` sin issue).
2. El `README.md` definitivo con la tabla de trazabilidad.
3. Una auditoría final sobre la URL de **producción**.
4. El mensaje de entrega: link del repositorio + link del sitio.

> **Concepto — trazabilidad:** para cada requisito de la consigna debés poder señalar (a) la story
> que lo cubre, (b) el test que lo prueba y (c) dónde se ve en el sitio. Si no podés, el requisito
> no está cubierto, aunque "creas" que sí.

> **Nombres de las rutas:** las stories y el proyecto usan **`/productos`** y **`/producto/:id`**
> (`src/App.jsx`), que son los nombres de la consigna del curso. En el código se dice *product*;
> en la interfaz, *servicio*. Antes de entregar, confirmá que la consigna no pide otros nombres.

## Mapa de archivos

| Paso | Archivo | Acción |
| ---- | ------- | ------ |
| 0 | `docs/us-*.md` (todas las stories) | editar/agregar |
| 1 | `test/placeholders.test.js` | **crear** |
| 1 | `src/features/team/team.js` | editar (nombres reales) |
| 1 | `src/layout/Footer.jsx` | editar (email real) |
| 1 | `test/layout/Footer.test.jsx` | editar (el `href` del email) |
| 2 | `README.md` | editar |
| 3 | (auditoría manual y `gh`) | ejecutar |

## Paso 0: Preparar

```sh
git switch main && git pull
git switch -c us-16-pre-delivery-handoff
pnpm verify
cp <ruta-a>/javascript/user-stories/*.md docs/     # todas las stories, completas
git add docs && git commit -m "docs: add US-16 pre-delivery hand-off story and the full story index"
```

---

## Ciclo 1 — No quedan textos provisorios

### 1. 🔴 Escribir el test

**Archivo:** `test/placeholders.test.js` (**crealo**, en la raíz de `test/`).
**Dónde:** el archivo entero.

```js
import { describe, expect, it } from "vitest";

const sources = import.meta.glob("../src/**/*.{js,jsx,ts,tsx,json}", {
  query: "?raw",
  import: "default",
  eager: true,
});

const FORBIDDEN = [
  { pattern: /Persona (Uno|Dos|Tres)/, reason: "placeholder team member" },
  { pattern: /hello@trigologiaa\.dev/, reason: "placeholder contact email" },
  { pattern: /TODO(?!\(#\d+\))/, reason: "TODO without an issue number (use TODO(#12))" },
];

describe("hand-off", () => {
  it.each(FORBIDDEN)("has no $reason left in the source", ({ pattern }) => {
    const offenders = Object.entries(sources)
      .filter(([, content]) => pattern.test(String(content)))
      .map(([file]) => file);
    expect(offenders).toEqual([]);
  });
});
```

> El patrón del email es `hello@trigologiaa.dev` (con **dos** `a`, como está en `Footer.jsx`). Si tu
> email provisorio es otro, ajustá el patrón a ese texto.

**Corré:** `pnpm test:run`. **Rojo esperado** (fallan dos de los tres casos; el mensaje **te dice en
qué archivo**):

```
has no placeholder team member left in the source
expected [ '../src/features/team/team.js' ] to deeply equal []

has no placeholder contact email left in the source
expected [ '../src/layout/Footer.jsx' ] to deeply equal []
```

El caso de `TODO` pasa si no dejaste ningún `TODO` en `src/`.

### 2. 🟢 Reemplazar los textos provisorios

**Archivo:** `src/features/team/team.js`
**Dónde:** los tres `name:` (`"Persona Uno"`, `"Persona Dos"`, `"Persona Tres"`). Poné los nombres
reales de tu equipo (o los tuyos). Si tenés fotos, agregá a cada persona un campo `photo`
(archivos en `public/images/`, con permiso de la persona para publicarlas).

```js
export const team = [
	{
		id: "person-1",
		name: "Tu Nombre",
		roleKey: "team.person1.role",
		bioKey: "team.person1.bio",
	},
	// ...las otras dos personas, con el mismo formato
];
```

**Archivo:** `src/layout/Footer.jsx`
**Dónde:** el `href` del link de contacto. Reemplazalo por tu email real de contacto.

```jsx
			<a href="mailto:tu-email-real@dominio.com">{t("footer.contact")}</a>
```

**Archivo:** `test/layout/Footer.test.jsx`
**Dónde:** en el test `"shows the company description and a contact link"`, en el `expect` del
`href`: poné el mismo email.

```jsx
    expect(footer.getByRole("link", { name: es.footer.contact })).toHaveAttribute("href", "mailto:tu-email-real@dominio.com");
```

**Cada `TODO` que aparezca:** resolvelo, o convertilo en un issue de GitHub (`gh issue create`) y
dejá `TODO(#N)` con el número.

**Corré:** `pnpm verify`. **Resultado esperado:** todo verde.

### 3. Commit

```sh
git add -A && git commit -m "feat: replace every placeholder before the delivery"
```

---

## Paso 2 — El README definitivo

**Archivo:** `README.md`
**Dónde:** reemplazá el archivo entero con esta estructura (escribilo **vos**, con tus palabras; es lo
primero que va a leer quien corrige). Los links de abajo son los que ya tiene tu README: mantenelos.

````markdown
# Trigologia Dev — tienda de servicios de desarrollo (JavaScript)

Tienda online de servicios de desarrollo de software (web, backend y mentoría técnica).
Pre-entrega del curso de React de Talento Tech.

- **Sitio en vivo:** https://frontend-trigologiaa.vercel.app/
- **Repositorio:** https://github.com/trigologiaa/frontend
- ![CI](https://github.com/trigologiaa/frontend/actions/workflows/ci.yml/badge.svg)

## Qué incluye (pre-entrega)
(lista corta: layout, catálogo desde `productos.json`, detalle, carrito con Context, rutas, i18n es/en)

## Cómo correrlo
```sh
pnpm install
pnpm dev          # desarrollo
pnpm verify       # lo mismo que corre el pipeline
pnpm e2e          # tests end-to-end (Playwright)
```
(Node LTS: ver `.nvmrc`)

## Stack y decisiones
(React + JavaScript, Vite, react-router-dom, Context API + useReducer, i18next, Vitest/RTL/MSW,
Playwright, Biome, Knip, Husky, Vercel. Una línea de "por qué" para las decisiones grandes.)

## Estructura
(el árbol de `src/` y qué hay en cada carpeta)

## Cómo se trabajó
(una story por rama y PR, TDD, Conventional Commits, hooks, pipeline: link a `docs/`)

## Mapa de requisitos de la consigna
(la tabla de trazabilidad: requisito → story → test → dónde verlo)

## Limitaciones conocidas de esta fase
- El carrito vive en memoria: se vacía al recargar la página.
- No hay checkout ni backend: los datos salen de `public/productos.json`.
- Sin autenticación.

## Próximos pasos
(US-17 a US-23: Firestore, login y rutas protegidas, alta/edición/baja de servicios, validación, compra)
````

Completá la **tabla de trazabilidad** de la story con los nombres reales de los archivos de test.
Para listarlos:

```sh
grep -rn "describe(" test
```

**Corré:** `pnpm verify`. **Resultado esperado:** todo verde (el README no afecta a los tests).

```sh
git add -A && git commit -m "docs: write the final readme with the requirements map"
```

---

## Paso 3 — Auditoría final (sobre producción, no sobre localhost)

Hacela después de mergear el PR (para que `main` esté desplegado), o sobre el preview del PR.

### A. Consigna, punto por punto (abrí la URL y marcá)

- [ ] 1.1 La estructura de carpetas está organizada (mostrala en el README).
- [ ] 1.2 `Layout` con `Header`, `nav` y `Footer`, consistente en todas las páginas.
- [ ] 1.3 El footer tiene información de la empresa y **al menos 3** tarjetas de personas.
- [ ] 2.1 `ItemListContainer` carga `productos.json` con `useEffect` y `fetch`.
- [ ] 2.2 `Item` reutilizable que recibe datos por props.
- [ ] 3.1 `react-router-dom` con `/`, `/productos`, `/producto/:id`, `/carrito` (probá **cada** ruta
      abriéndola directo y refrescando; ver el aviso sobre los nombres de ruta, arriba).
- [ ] 3.2 El navbar usa `<Link>`: al navegar no recarga la página.
- [ ] 4.1 Hay un componente que gestiona el estado global del carrito (`CartProvider`).
- [ ] 4.2 Desde el detalle se agrega al carrito llamando `addToCart`.
- [ ] 4.3 `CartWidget` con el total de unidades en tiempo real.
- [ ] 4.4 `/carrito` muestra el detalle desde el `CartContext`.
- [ ] 5 Está publicado en Vercel y tenés el link del repositorio.

### B. Calidad

```sh
git switch main && git pull
pnpm install --frozen-lockfile && pnpm verify && pnpm e2e    # en limpio
pnpm audit                                                   # vulnerabilidades conocidas
pnpm outdated                                                # (informativo)
```

- [ ] Lighthouse (*Mobile*) sobre producción: anotá Performance / Accessibility / Best Practices /
      SEO en el README.
- [ ] Cada ruta a 360 px en producción; sin errores en consola.
- [ ] Estás viendo el último commit de `main`: en Vercel → *Deployments*, el deploy de producción
      coincide con el SHA de `git rev-parse --short HEAD`.

### C. Lo que se descubra acá se anota, no se "arregla rápido"

Si es chico y tiene test, commit en esta rama; si no, issue de GitHub (`gh issue create`) y línea en
"Limitaciones conocidas" del README.

---

## Publicar y entregar

```sh
git push -u origin us-16-pre-delivery-handoff
gh pr create --fill --base main && gh pr checks --watch
```

Squash merge: `docs: complete the pre-delivery hand-off (US-16)`. Esperá el deploy, hacé la
auditoría B sobre producción y, opcionalmente, etiquetá la entrega:

```sh
git switch main && git pull
git tag -a v0.1.0-pre-entrega -m "Pre-entrega del proyecto"
git push origin v0.1.0-pre-entrega
gh release create v0.1.0-pre-entrega --title "Pre-entrega" --notes "Ver README"
```

**Mensaje de entrega** (por la vía que pida la plataforma):

```
Repositorio: https://github.com/trigologiaa/frontend
Sitio: https://frontend-trigologiaa.vercel.app/
```

## Commits sugeridos

```
docs: add US-16 pre-delivery hand-off story and the full story index
feat: replace every placeholder before the delivery
docs: write the final readme with the requirements map
```

## Definition of Done

- [ ] La tabla de trazabilidad está completa con nombres reales de tests.
- [ ] Recorrida manual de **producción** en escritorio y celular.
- [ ] Auditoría limpia (o con issues documentados); Lighthouse anotado.
- [ ] `main` verde y desplegado; mensaje de entrega enviado.

## Qué aprendiste

- Convertir "me tengo que acordar" en un test (`placeholders.test`) es la mejor forma de no olvidarse.
- La trazabilidad expone huecos que la sensación de "ya está" esconde.
- Se audita sobre producción: es lo que ve el cliente.
