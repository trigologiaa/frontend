# Trigologia Dev — tienda de servicios de desarrollo (JavaScript)

Tienda online de servicios de desarrollo de software (web, backend y mentoría técnica).
Pre-entrega del curso de React de Talento Tech.

- **Sitio en vivo:** <https://frontend-trigologiaa.vercel.app/>
- **Repositorio:** <https://github.com/trigologiaa/frontend>
- **Historias de usuario:** [docs/](docs/)

![CI](https://github.com/trigologiaa/frontend/actions/workflows/ci.yml/badge.svg)

## Qué incluye (pre-entrega)

- Layout con header, barra de navegación y footer (información de la empresa y tres tarjetas del equipo).
- Página de inicio, catálogo de servicios cargado desde `public/servicios.json` con `useEffect` y `fetch`,
  y detalle de cada servicio en `/servicio/:id`.
- Carrito con estado global (Context + `useReducer`): se agrega desde el detalle, se ve en el navbar
  (`CartWidget`) y se revisa en `/carrito`.
- Rutas con `react-router-dom` y página 404.
- Español e inglés (detecta el idioma del navegador y permite cambiarlo).
- Tema oscuro por defecto y tema claro según el sistema; diseño responsive.
- Tests unitarios y de componente (Vitest, Testing Library, MSW) y un test end-to-end (Playwright).

## Cómo correrlo

```sh
pnpm install
pnpm dev          # desarrollo
pnpm verify       # lo mismo que corre el pipeline (lint, knip, tests con cobertura, build)
pnpm e2e          # tests end-to-end (Playwright, contra el build)
```

Node: ver `.nvmrc`. Para el E2E la primera vez hace falta `pnpm exec playwright install chromium`.

| Comando           | Qué hace                                       |
| ----------------- | ---------------------------------------------- |
| `pnpm dev`        | Servidor de desarrollo                         |
| `pnpm test`       | Tests en modo watch                            |
| `pnpm test:run`   | Tests una sola vez                             |
| `pnpm verify`     | Lint, Knip, tests con cobertura y build        |
| `pnpm e2e`        | Tests end-to-end (no forma parte de `verify`)  |

## Stack y decisiones

- **React + JavaScript, Vite**: arranque rápido y build estándar.
- **react-router-dom**: rutas `/`, `/servicios`, `/servicio/:id` y `/carrito`. En producción `vercel.json`
  reescribe todo a `index.html` para que las URL directas funcionen.
- **Context API + `useReducer`**: las transiciones del carrito (`add`, `remove`, `clear`) son un reducer puro
  que se prueba sin React; el Context solo lo reparte.
- **i18next**: textos en `src/i18n/locales`, con plurales (`_one` / `_other`).
- **CSS Modules + tokens CSS**: un módulo por componente y toda decisión de diseño en variables (`tokens.css`).
- **Vitest + Testing Library + MSW**: tests de comportamiento; MSW simula `servicios.json`.
- **Playwright + playwright-bdd**: un E2E del flujo principal escrito como `.feature` (Gherkin).
- **Biome, Knip, Husky, commitlint**: formato y lint, código sin uso, hooks y Conventional Commits.
- **GitHub Actions + Vercel**: el pipeline corre `verify` y `e2e` en cada pull request; Vercel despliega `main`.

## Estructura

```
src/
├── features/
│   ├── cart/        cartReducer.js, context/ (CartContext, useCart), components/ (CartItem, CartWidget), pages/ (CartPage)
│   ├── home/        pages/ (Home)
│   ├── not-found/   pages/ (NotFound)
│   ├── services/    components/ (Item, ItemList, ItemDetail, ItemCount), hooks/ (useService, useServices),
│   │                pages/ (ItemListContainer, ItemDetailContainer), services/ (servicesApi)
│   └── team/        team.js y components/ (TeamCard, TeamList, TeamSection)
├── i18n/            configuración de i18next y catálogos es/en
├── layout/          Layout, Header, NavBar, NavItem, LanguageSwitcher, Footer
├── shared/          formatPrice, localized, useAsync, useLanguage, useDocumentTitle
└── styles/          tokens.css, global.css y button.module.css
test/                tests de Vitest (espejo de src/)
e2e/                 features (Gherkin) y steps de Playwright
docs/                historias de usuario
public/              servicios.json e imágenes
```

## Cómo se trabajó

- Una historia de usuario por rama y pull request; cada historia está en [docs/](docs/).
- TDD: primero el test en rojo, después el mínimo código; un commit por ciclo.
- Conventional Commits, validados por commitlint.
- Hooks de Husky: `pre-commit` formatea y corre los tests relacionados, `pre-push` corre `pnpm verify`.
- Pipeline: `verify` (lint, Knip, tests con cobertura, build) y `e2e` son checks de cada pull request.

## Mapa de requisitos de la consigna

| Requisito                                              | Historia     | Verificado por                                                      | Dónde verlo                                  |
| ------------------------------------------------------ | ------------ | ------------------------------------------------------------------- | -------------------------------------------- |
| 1.1 Estructura de carpetas organizada                  | US-02        | estructura del repo + Knip (`pnpm knip`)                            | repositorio                                  |
| 1.2 `Layout` con Header, nav y Footer                  | US-02, US-14 | `Layout.test`, `Header.test`, `NavBar.test`, `page structure`       | todas las páginas                            |
| 1.3 Footer: info de la empresa + ≥ 3 tarjetas          | US-05        | `Footer.test`, `TeamList.test`, `TeamCard.test`, `team data`        | footer                                       |
| 2.1 `ItemListContainer` con `useEffect` + `fetch`      | US-07, US-08 | `ItemListContainer.test`, `useServices.test`, `getServices`         | `/servicios`                                 |
| 2.2 `Item` reutilizable con props                      | US-08        | `Item.test`, `ItemList.test`                                        | `/servicios`                                 |
| 3.1 `react-router-dom` y las cuatro rutas              | US-02, US-09 | `App.test` (`App routes`), `ItemDetailContainer.test`               | `/`, `/servicios`, `/servicio/:id`, `/carrito` |
| 3.2 Navegación con `<Link>` sin recargar               | US-02, US-15 | `NavBar.test`, E2E `purchase-flow.feature`                          | navbar                                       |
| 4.1 Estado global del carrito (Context)                | US-10        | `cartReducer.test`, `CartContext.test`, `useCart.test`              | (interno)                                    |
| 4.2 Agregar desde el detalle llama `addToCart`         | US-11        | `ItemDetail.test`, `ItemCount.test`                                 | `/servicio/:id`                              |
| 4.3 `CartWidget` con cantidad en tiempo real           | US-12        | `CartWidget.test`, `App.test` ("keeps the cart across pages")       | navbar                                       |
| 4.4 `/carrito` muestra el detalle desde `CartContext`  | US-13        | `CartPage.test`, `CartItem.test`                                    | `/carrito`                                   |
| 5 Publicado online + link al repositorio               | US-01, US-16 | pipeline de CI, `placeholders.test` y revisión manual               | este README                                  |

Calidad transversal: diseño y tema claro (US-14, `tokens.test`, `components.test`, `modules.test`),
flujo principal end-to-end (US-15, `e2e/features/*.feature`) y sin textos provisorios (US-16, `placeholders.test`).

## Limitaciones conocidas de esta fase

- El carrito vive en memoria: se vacía al recargar la página.
- No hay checkout ni backend: los datos salen de `public/servicios.json`.
- Sin autenticación.
- Lighthouse sobre producción (Mobile): _pendiente de anotar_ (Performance / Accessibility / Best Practices / SEO).

## Próximos pasos

Fase 2 (US-17 a US-23): datos en Firestore, login y rutas protegidas, alta, edición y baja de servicios,
validación de formularios y compra.
