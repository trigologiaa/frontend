# Cómo se trabaja: el flujo de cada user story (JavaScript)

Este documento es **interno** (no se sube al repo). Explica el proceso que siguen todos los
instructivos, y junta lo que alguien que viene de backend suele no saber del frontend.

> Aviso honesto: los instructivos **no fueron ejecutados de punta a punta** (a diferencia del
> ejemplo de Rails). Los comandos, nombres de paquetes y mensajes de error son los esperados según
> la documentación de cada herramienta, pero las versiones cambian. Si un paso no anda como dice:
> leé el error, consultá la doc oficial de esa herramienta y ajustá. Eso también es parte de
> aprender frontend. Anotá en el instructivo lo que corregiste.

## 1. El ciclo de cada user story

```
main actualizado ──▶ rama us-NN-nombre ──▶ commit de la story (docs)
        ──▶ ciclos TDD (un commit verde por ciclo)
        ──▶ chequeo manual en el navegador
        ──▶ git push (pre-push corre verify) ──▶ Pull Request
        ──▶ pipeline verde + preview de Vercel ──▶ squash merge ──▶ deploy a producción
```

1. `git switch main && git pull && git switch -c us-NN-nombre-corto`
2. Commit de la story: `docs: add US-NN <title> story` (la especificación queda en la historia antes
   del código).
3. **Ciclos TDD** (ver 2). Cada ciclo termina en un commit. Las stories con interfaz terminan con
   sus **ciclos de estilo** (ver 2b).
4. Chequeo manual (`pnpm dev`): lo que los tests no ven (layout, consola, teclado, celular).
5. `git push -u origin <rama>` → el hook `pre-push` corre `pnpm verify`.
6. Abrí el Pull Request (plantilla). Esperá el check `verify` (y `e2e` desde US-15) en verde y
   mirá el **preview** de Vercel.
7. **Squash merge** con título en Conventional Commits. Borrá la rama. Mirá producción.

## 2. El ciclo TDD (un test, el mínimo código, un commit)

1. 🔴 **Red:** escribí **UN** test (nombre = escenario Gherkin). Corrélo y **leé el mensaje**:
   tiene que fallar **por la razón correcta** (falta el comportamiento), no por un typo ni por
   configuración. Un test que nunca vio rojo no prueba nada.
2. 🟢 **Green:** escribí el **mínimo** código que lo haga pasar. Mínimo de verdad: si con devolver un
   valor fijo pasa, devolvé el valor fijo (*fake it*). El siguiente test te va a obligar a
   generalizar (*triangulación*).
3. 🔵 **Refactor:** con todo en verde, limpiá (nombres, duplicación). Si no hay nada que limpiar, no
   inventes.
4. **Commit** (test + código mínimo, verde): `git add -A && git commit` (o `pnpm commit`).
   Mensaje en inglés, Conventional Commits, con alcance opcional: `feat(cart): add item to empty cart`.

Reglas:

- **No se sube código productivo sin test que haya fallado antes.** Cobertura 100 % y Knip lo
  vigilan, pero la disciplina es tuya.
- **Los tests viven en `test/`, al lado de `src/` (no adentro), con la misma estructura de carpetas:
  `src/layout/NavBar.jsx` se prueba en `test/layout/NavBar.test.jsx`. La infraestructura
  (`setup.js`, `renderWithProviders.jsx`, `server.js`, `handlers.js`) está en la raíz de `test/`.
  Los tests importan el código con rutas relativas, por ejemplo `'../../src/layout/NavBar'`.
- **Un test por ciclo.** Si escribís dos, el segundo espera su turno.
- **Commit chico = historia legible** y `git bisect` útil.
- **Configuración** (vite config, workflows) no necesita test propio; **comportamiento** sí. El CSS
  tiene su propio método (ver 2b).
- **Nunca** `git commit --no-verify`.
- Si el refactor rompe algo, `git restore .` y volvé a empezar el refactor: el último commit verde es
  tu red de seguridad.

## 2b. El CSS se escribe junto con cada story (y se "testea" así)

El CSS **no** se deja para el final: cada story que dibuja algo lo estiliza en la misma story, con
**CSS Modules** (un `Componente.module.css` al lado de cada `Componente.jsx`) y los **tokens**
(`var(--color-primary)`, `var(--space-4)`) que crea US-05. Así podés mirar cada pantalla terminada
mientras la construís. US-14 queda como pulido final (tema oscuro, consolidación, auditoría).

Un test no dice "se ve lindo", pero sí cuida reglas. El ciclo de estilo de cada componente es:

1. 🔴 **Sacar el componente de `pending`** (la lista de componentes sin estilos de
   `test/styles/components.test.js`): el test falla nombrando el archivo sin módulo.
2. 🟢 **Crear el `.module.css`**, importarlo y poner los `className`. Solo tokens: las barreras
   prohíben colores sueltos y apagar el foco.
3. 🔵 **Refactor = mirar el navegador** a 360 y 1280 px y ajustar. Los tests de comportamiento (por
   rol y texto, no por clase) siguen verdes: son la red de seguridad.
4. Commit `style(<alcance>): ...`.

Además:

- **Cada story registra en su Paso 0 los componentes nuevos** en `pending` (si no, el test se pone rojo
  apenas crees el `.jsx`: es el recordatorio).
- Cuando el estilo **es comportamiento** (el link activo se ve por `aria-current`), se prueba con un
  test que lee el CSS (`?raw`). Es la excepción, no la regla.
- Mobile first: lo base es el celular; `@media (min-width: 48rem)` agrega lo ancho.
- Los detalles (la configuración de tokens, las barreras y el trinquete) están en la Parte B de
  [US-05](us-05-company-and-team-in-footer-instructivo.md).

### Tipos de commit (Conventional Commits)

| Tipo | Cuándo |
| ---- | ------ |
| `feat` | comportamiento nuevo (cada ciclo TDD normal) |
| `fix` | corregir un bug (primero un test que lo reproduzca) |
| `refactor` | cambio interno sin cambiar comportamiento |
| `test` | solo tests (por ejemplo, agregar un caso que ya pasaba) |
| `docs` | README, stories |
| `style` | CSS y apariencia, sin lógica (cada ciclo de estilo) |
| `chore` | configuración, dependencias, andamiaje |
| `ci` | workflows de GitHub Actions |
| `build` | cambios del build |

## Formato de los instructivos

Todo instructivo (desde US-06) escribe cada ciclo con la **misma estructura**, para que nunca haya
que adivinar en qué archivo va cada cosa.

Reglas:

1. **Mapa de archivos al principio:** una tabla `Ciclo | Archivo | Acción` con la ruta completa
   desde la raíz del repo y si el archivo se **crea** o se **edita**.
2. **Cada bloque de código dice dos cosas antes de aparecer:**
   - **Archivo:** la ruta completa (`src/features/home/pages/Home.jsx`).
   - **Dónde:** el lugar exacto dentro del archivo ("archivo entero", "dentro del `describe`,
     después del test X", "en los imports, debajo de Y", "dentro de `"home"`, después de `"cta"`").
3. **Los ciclos se numeran en pasos fijos**, en este orden y solo los que apliquen:
   1. Catálogos (`es.json` y `en.json`, **los dos**, antes del test).
   2. 🔴 Test: archivo, dónde, **Corré:** y **Rojo esperado:** (mensaje literal).
   3. 🟢 Código: archivo, dónde y, si cambió más de unas líneas, el **archivo completo** al final del ciclo.
   4. Tests viejos que el cambio rompe a propósito (**mismo commit**), cada uno con archivo y dónde.
   5. 🔵 Refactor o mutación (si aplica).
   6. Commit.
4. **Cada paso termina diciendo qué esperar** (`Resultado esperado: todo verde` / `falla solo este test`).
5. **La ruta de los comandos y el estilo del código son los reales del repo:** en `src/` tabs,
   comillas dobles y `;` (Biome); en `test/` dos espacios, comillas dobles y `;`.
6. **Archivo nuevo = "crealo"** y se aclara si la carpeta también es nueva.

## 3. Qué prueba cada tipo de test (pirámide)

| Nivel | Qué prueba | Herramienta | Cuándo |
| ----- | ---------- | ----------- | ------ |
| Unitario | funciones puras, reducers, validadores | Vitest | `cartReducer`, `localized`, `formatPrice` |
| Componente / integración | componentes + router + contexto + i18n con la red mockeada | Vitest + RTL + user-event + MSW | el grueso: casi todas las stories |
| E2E | el flujo completo en un navegador real | Playwright + playwright-bdd | solo US-15 (1–2 flujos) |

Principio de RTL: **testeá como lo usa una persona**. Consultá por rol, label o texto
(`getByRole('button', { name: /agregar/i })`), no por clases ni ids. Si tenés que tocar el estado
interno para testear, el diseño está mal.

Orden de preferencia de las consultas: `getByRole` → `getByLabelText` → `getByText` → `getByTestId`
(último recurso). `getBy*` espera que exista ahora; `queryBy*` devuelve `null` (para afirmar que
**no** está); `findBy*` espera a que aparezca (asincronía).

## 4. Vocabulario mínimo de frontend (traducido desde Rails)

| Frontend | Equivalente / idea |
| -------- | ------------------ |
| Componente | una función que recibe *props* y devuelve JSX (como un partial con locals) |
| Props | argumentos del componente (solo lectura) |
| Estado (`useState`) | memoria de un componente; cambiarlo vuelve a renderizar |
| Efecto (`useEffect`) | código que corre *después* de renderizar (pedir datos, timers) |
| Context | dato global sin pasarlo por props (algo así como `Current`) |
| Reducer | función pura `(estado, acción) → estado nuevo` |
| Hook personalizado | función `useAlgo` que reutiliza estado/efectos |
| Router (SPA) | el navegador no pide páginas nuevas: React cambia la vista |
| Vite | el servidor de desarrollo y el empaquetador (`pnpm dev`, `pnpm build`) |
| i18next | `I18n.t` de Rails, con claves en JSON |
| MSW | intercepta `fetch` en los tests (como WebMock/VCR) |
| Biome | RuboCop + formateador |
| Knip | detecta código muerto (como `debride`/reek, pero para imports y exports) |

## 5. Lo que probablemente no sabías que tenías que tener en cuenta

- **SPA y deep links:** si abrís `/productos` directamente, el hosting busca un archivo que no existe.
  Hay que decirle que sirva `index.html` (rewrite). Lo hace US-02.
- **Accesibilidad (a11y):** HTML semántico (`header`, `nav`, `main`, `footer`), `alt` en imágenes,
  labels en inputs, foco visible, contraste, navegación con teclado. Testing Library te empuja a
  esto porque consulta por rol.
- **Responsive / mobile first:** la mayoría del tráfico es celular. Probá siempre a 360 px.
- **Estados de una pantalla con datos:** cargando, error, vacío, éxito. Son cuatro, no uno.
- **Claves (`key`) en listas:** `items.map(i => <li key={i.id}>…)`; sin `key` estable React se
  confunde. Nunca uses el índice si la lista puede cambiar.
- **Efectos con limpieza:** si una respuesta llega después de que el componente se fue, ignorala.
- **Estado derivado:** no guardes lo que podés calcular (totales). Dos fuentes de verdad se
  desincronizan.
- **Inmutabilidad:** nunca mutes el estado (`push`, asignar propiedades); creá copias
  (`[...items, nuevo]`, `{ ...item, cantidad }`).
- **Variables de entorno en Vite:** solo las que empiezan con `VITE_` llegan al navegador, y
  **todo lo que llega al navegador es público**. Ningún secreto va en el frontend.
- **Performance:** imágenes con tamaño y `loading="lazy"`; nada de librerías grandes para una
  función chica; mirá Lighthouse.
- **SEO básico:** `<title>`, `<meta name="description">`, `lang` del `<html>`.
- **Seguridad:** React escapa el texto, no uses `dangerouslySetInnerHTML`; las reglas de Firestore
  son la seguridad real (el frontend se puede saltar).
- **Dependencias:** cada una es deuda. Knip te avisa si quedó alguna sin usar.
- **`package.json` + lockfile:** `pnpm-lock.yaml` se commitea; en CI `pnpm install --frozen-lockfile`.
- **`.gitignore`:** `node_modules`, `dist`, `coverage`, `.env*` (salvo `.env.example`), reportes de Playwright.
- **Arquitectura:** hay una carpeta por feature; los componentes son finos (props → JSX), la lógica
  vive en hooks, reducers y servicios. Alternativas futuras: Zustand/Redux Toolkit (estado global
  grande), TanStack Query (datos remotos con caché), Bulletproof React (referencia de estructura).

## 6. Git y GitHub: configuración del flujo

- **Rama principal protegida** (se configura en US-01): PR obligatorio, check `verify` obligatorio.
- **Nombre de ramas:** `us-NN-nombre-corto`.
- **Merge:** *squash*; el título del PR es el mensaje Conventional Commit que queda en `main`.
- **Commits intermedios** de la rama (un ciclo TDD cada uno) se ven en el PR; después se aplastan.
- **Plantilla de PR** (la crea US-01): qué hace, story, cómo se probó, checks manuales.
- Historial = documentación: es lo que vas a mostrar para explicar el proceso.

## 7. Dos decisiones para tener presentes

- **Por qué `useReducer` + Context** para el carrito: las transiciones tienen nombre y se testean sin
  React. Con `useState` alcanzaría para la consigna (las dos cosas son hooks), pero el reducer es
  más fácil de probar y de crecer. Si tu docente espera `useState`, el `CartProvider` puede usarlo
  por dentro sin cambiar el resto.
- **Por qué un solo pipeline con `pnpm verify`:** el mismo comando corre en tu máquina (pre-push) y
  en GitHub. Si pasa local, pasa remoto.
