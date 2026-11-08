# Trigologia Dev — tienda de servicios de desarrollo

Tienda online de servicios de desarrollo de software (web, backend y mentoría técnica), hecha con
React para el curso de Talento Tech. Entrega final: catálogo en Firebase, cuentas de usuario,
panel de administración con CRUD, carrito, búsqueda y paginación.

- **Sitio en vivo:** <https://frontend-trigologiaa.vercel.app/>
- **Repositorio:** <https://github.com/trigologiaa/frontend>
- **Cuenta de demostración (admin):** se entrega por mensaje, no está en el repositorio.

![CI](https://github.com/trigologiaa/frontend/actions/workflows/ci.yml/badge.svg)

## Qué incluye

- Catálogo de servicios leído de **Firestore**, con detalle, **búsqueda en tiempo real** (se guarda en la
  URL: `?q=`) y **paginador** (6 por página, `?page=`).
- **Carrito** con estado global (Context + `useReducer`): agregar, quitar y vaciar, y **compra simulada**
  que guarda una orden en Firestore.
- **Cuentas:** registro, inicio y cierre de sesión (Firebase Authentication), perfil, y rutas protegidas
  (`/perfil` para cualquier usuario con sesión, `/admin` solo para el rol `admin`).
- **Panel de administración** (`/admin`): crear, editar y eliminar servicios con validaciones y
  modal de confirmación; spinners mientras se cargan los datos y mensajes de error con "Reintentar".
- Diseño responsive (grilla de React-Bootstrap), botón compartido con styled-components, íconos de React
  Icons, títulos y metadatos por página (React Helmet), avisos (React-Toastify), cuatro temas
  [Catppuccin](https://catppuccin.com) y dos idiomas (es/en).

## Instalación

Requisitos: Node (la versión de `.nvmrc`) y pnpm.

```sh
git clone https://github.com/trigologiaa/frontend.git
cd frontend
pnpm install
```

## Variables de entorno

Copiá la plantilla y completala con los datos de tu proyecto de Firebase:

```sh
cp .env.example .env.local
```

| Variable | Qué es | Dónde se obtiene |
| -------- | ------ | ---------------- |
| `VITE_FIREBASE_API_KEY` | clave web del proyecto | Firebase → Configuración del proyecto → Tus apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | dominio de autenticación | idem |
| `VITE_FIREBASE_PROJECT_ID` | id del proyecto | idem |
| `VITE_FIREBASE_APP_ID` | id de la app web | idem |

> La configuración web de Firebase **no es un secreto**: la seguridad de los datos la dan las reglas
> de `firestore.rules`. Aun así `.env.local` no se versiona. Sin `VITE_FIREBASE_API_KEY` el sitio abre,
> pero no hay catálogo ni cuentas.

## Configurar Firebase

1. Creá un proyecto en la consola de Firebase y registrá una **app web**.
2. **Authentication → Sign-in method:** habilitá *Correo electrónico y contraseña*.
3. **Firestore Database:** creá la base (modo producción) y cargá los servicios de
   `public/servicios.json` en la colección `services` con el script de una sola vez
   `node --env-file=.env.local scripts/seed-services.mjs` (ver el aviso sobre las reglas más abajo).
4. **Reglas:** pegá el contenido de `firestore.rules` en *Firestore → Reglas* y publicá.
5. **Admin:** registrá tu cuenta en `/registro`, copiá su UID (*Authentication → Users*) y creá en
   Firestore el documento `usuarios/<UID>` con el campo `rol` (string) = `admin`.
6. **Dominios autorizados:** en *Authentication → Configuración → Dominios autorizados* agregá el
   dominio de producción (`frontend-trigologiaa.vercel.app`); sin esto el login falla en vivo.
7. **Vercel y GitHub:** cargá las cuatro variables `VITE_FIREBASE_*` en Vercel (Production y Preview)
   y como *Variables* de GitHub Actions (las usa el job `e2e`).

> **Cargar los servicios:** el script usa el SDK de cliente, así que las reglas finales (que prohíben
> escribir sin ser admin) lo rechazan. Se abren las reglas un minuto, se corre el script y se vuelven a
> publicar las de `firestore.rules`.

## Ejecutar el proyecto

| Comando | Qué hace |
| ------- | -------- |
| `pnpm dev` | servidor de desarrollo |
| `pnpm build` / `pnpm preview` | compila y sirve la versión de producción |
| `pnpm test` / `pnpm test:run` | tests (modo watch / una vez) |
| `pnpm e2e` | tests end-to-end en Chromium, Firefox, WebKit y celular (`pnpm e2e:install` instala los navegadores) |
| `pnpm verify` | lo que corre el pipeline: lint, Knip, tests con cobertura 100 % y build |

## Pruebas

Se escribe un test que falla antes de cada fragmento de código (TDD). Tests unitarios y de
componente con Vitest y Testing Library (Firebase se reemplaza por un doble en memoria en
`test/fakeFirestore.js`: ningún test toca la red), y escenarios end-to-end en Gherkin con Playwright.
`test/audit/` hace cumplir que no quede código de más (salidas de depuración, clases CSS sin usar,
claves de traducción huérfanas, secretos). El pipeline de GitHub Actions bloquea el merge si algo falla.

## Compatibilidad de navegadores

Los escenarios end-to-end corren en cuatro *projects* de Playwright. Los motores se prueban de forma
automática; la prueba manual sobre el sitio publicado todavía no se hizo, y por eso figura como
"no probado" (no se supone que funciona).

| Navegador | Motor | Cómo se prueba | Resultado |
| --------- | ----- | -------------- | --------- |
| Chrome / Edge (escritorio) | Blink | Playwright `chromium` | automático en el pipeline |
| Firefox (escritorio) | Gecko | Playwright `firefox` | automático en el pipeline |
| Safari (escritorio) | WebKit | Playwright `webkit` (no es Safari real) | automático en el pipeline |
| Chrome en celular | Blink | Playwright `mobile` (Pixel 7 emulado) | automático en el pipeline |
| Safari en iPhone real | WebKit | manual | no probado |
| Chrome en Android real | Blink | manual | no probado |

El build apunta a navegadores modernos (`baseline-widely-available` de Vite): no se transpila para
navegadores anteriores a 2023/2024.

## Rendimiento y SEO

- Lighthouse sobre producción: pendiente de medir una vez publicada esta versión (se anota en esta sección).
- JavaScript inicial (`pnpm build`): 1 016,64 kB (gzip 313,31 kB) antes de cargar las páginas privadas bajo
  demanda y 951,06 kB (gzip 290,78 kB) después. Login, registro, perfil, gestión y checkout son
  fragmentos aparte. El grueso que queda es el SDK de Firebase.
- Cada página declara su título y descripción con React Helmet; `index.html` trae un título y una
  descripción por defecto para los rastreadores que no ejecutan JavaScript.

## Estructura

```
src/
├── features/{home,services,cart,auth,admin,orders,team}/   # una carpeta por funcionalidad
├── layout/                                                 # header, navegación y pie
├── shared/                                                 # componentes y utilidades comunes (ui/Button, Spinner, Seo…)
├── i18n/                                                   # textos en español e inglés
├── firebase/                                               # configuración de Firebase
└── styles/                                                 # temas, tokens y estilos globales
test/                                                       # refleja src/ (más audit/ y el Firestore falso)
e2e/                                                        # escenarios Gherkin con Playwright
docs/                                                       # historias de usuario
scripts/                                                    # carga única del catálogo en Firestore
firestore.rules                                             # reglas de seguridad de Firestore
```

## Cómo se trabajó

Una rama, un pull request y un pipeline verde por historia de usuario, con commits chicos
(Conventional Commits) y hooks de Husky (formato, tests relacionados, `verify` al subir). Las
historias están en [docs/](docs/); el guion de la presentación, en [docs/presentacion.md](docs/presentacion.md).

## Trazabilidad (consigna de la entrega final)

| Requerimiento | Historia | Test | Dónde verlo |
| ------------- | -------- | ---- | ----------- |
| 1 · Carrito con Context (agregar, quitar, vaciar) | [US-10](docs/us-10-cart-state.md), [US-11](docs/us-11-add-to-cart-from-detail.md), [US-13](docs/us-13-cart-page.md) | `cartReducer`, `CartPage` | `/carrito` |
| 1 · `AuthContext`, login y registro | [US-18](docs/us-18-sign-in-and-protected-routes.md), [US-25](docs/us-25-register.md) | `auth-context`, `LoginPage`, `RegisterPage` | `/login`, `/registro` |
| 1 · Rutas protegidas y perfil | [US-26](docs/us-26-admin-role.md), [US-27](docs/us-27-profile-and-sign-out.md) | `ProtectedRoute`, `ProfilePage` | `/admin`, `/perfil` |
| 2 · Datos en Firebase | [US-17](docs/us-17-firestore-catalog.md) | `servicesApi` | `/servicios` |
| 2 · Formulario, validaciones, editar, eliminar con modal | [US-19](docs/us-19-create-service.md), [US-20](docs/us-20-edit-service.md), [US-21](docs/us-21-delete-service.md), [US-22](docs/us-22-form-validation.md) | `validateService`, `Gestion`, `ConfirmDialog` | `/admin` |
| 2 · Spinners y mensajes de error | [US-30](docs/us-30-loading-spinner.md), [US-31](docs/us-31-toast-notifications.md) | `Spinner`, `notify`, `AppToaster` | catálogo y detalle |
| 3 · Grilla responsive (React-Bootstrap) | [US-32](docs/us-32-responsive-grid.md) | `ItemList`, `grid.test`, e2e de columnas | `/servicios` a 3 anchos |
| 3 · styled-components | [US-33](docs/us-33-styled-buttons.md) | `Button` | botones del sitio |
| 3 · React Icons | [US-34](docs/us-34-icons.md) | `Icon`, `icons.test` | navegación y botones |
| 3 · React Helmet (título y meta) | [US-35](docs/us-35-page-titles-and-meta.md) | `Seo`, `seo.test` | pestaña y código fuente |
| 4 · Búsqueda en tiempo real | [US-28](docs/us-28-search-services.md) | `filterServices`, `ItemListContainer` | `/servicios?q=` |
| 4 · Paginador | [US-29](docs/us-29-paginate-catalog.md) | `paginate`, `Pagination` | `/servicios?page=2` |
| 5 · Compatibilidad de navegadores | [US-36](docs/us-36-browser-compatibility.md) | proyectos de Playwright | tabla de este README |
| 5 · Código sin sobrantes y carga diferida | [US-37](docs/us-37-lazy-pages.md), [US-38](docs/us-38-code-audit.md) | `test/audit/*`, e2e `lazy` | `pnpm verify` |
| 5 · README y entrega | [US-39](docs/us-39-final-handoff.md) | `readme.test.js` | este archivo |
| Extra · compra simulada | [US-23](docs/us-23-checkout-and-order.md) | `CheckoutPage`, `ordersApi` | `/carrito` → finalizar |
| Extra · temas | [US-24](docs/us-24-catppuccin-themes.md) | `themes`, contraste | selector del encabezado |

Historias de la pre-entrega: de [US-01](docs/us-01-ci-cd-and-live-deployment.md) a
[US-16](docs/us-16-pre-delivery-handoff.md), todas en [docs/](docs/).

## Limitaciones conocidas

- La compra es simulada: se guarda la orden, no hay pagos ni historial de pedidos.
- Safari se prueba con el WebKit de Playwright; no se probó en un dispositivo real.
- Las imágenes de los servicios son ilustraciones propias; el panel pide una URL de imagen (no sube archivos).
- El carrito vive en memoria: se vacía al recargar la página.
- El rol de administrador se asigna a mano en Firestore; ninguna pantalla del sitio crea administradores.
- Los avisos (toasts) y el modal de confirmación se verifican con tests de componente; la animación
  de salida solo se comprueba en el escenario end-to-end.
