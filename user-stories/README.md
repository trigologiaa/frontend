# User stories — Trigologia Dev (React + JavaScript)

Online store of **developer services** (web, backend, mentoring). Visitors browse services, see
their detail, add them to a cart and review it. The owner will manage the catalog in Phase 2.

The project is built **one user story at a time**: one branch, one pull request and one green
pipeline per story, deployed to production as it merges. Each story is implemented with TDD (one
test, the minimum code, one commit).

## Phase 0 — Foundation (enablers)

| Story | Title | Type |
| ----- | ----- | ---- |
| [US-00](us-00-tooling-and-quality-gates.md) | Tooling and local quality gates | Technical |
| [US-01](us-01-ci-cd-and-live-deployment.md) | Continuous integration and live deployment | Technical |

## Phase 1 — Pre-delivery (what the assignment asks for)

| Story | Title | Assignment requirement |
| ----- | ----- | ---------------------- |
| [US-02](us-02-layout-and-navigation.md) | Layout and navigation between sections | 1.1, 1.2, 3.1, 3.2 |
| [US-03](us-03-active-section-and-not-found.md) | Know where I am, and recover from a wrong address | 3 (robustness) |
| [US-04](us-04-language-detection-and-switch.md) | See the site in my language | (product decision) |
| [US-05](us-05-company-and-team-in-footer.md) | Know who is behind the services | 1.3 |
| [US-06](us-06-landing-page.md) | Landing page with value proposition | 3.1 (`/`) |
| [US-07](us-07-product-data-source.md) | Load the services from a data source | 2.1 |
| [US-08](us-08-browse-service-catalog.md) | Browse the catalog of services | 2.1, 2.2 |
| [US-09](us-09-service-detail.md) | See the details of one service | 3.1 (`/servicio/:id`) |
| [US-10](us-10-cart-state.md) | A global cart state | 4.1 |
| [US-11](us-11-add-to-cart-from-detail.md) | Add a service to the cart | 4.2 |
| [US-12](us-12-cart-widget-in-navbar.md) | Cart widget in the navigation bar | 4.3 |
| [US-13](us-13-cart-page.md) | Review my cart | 4.4 |
| [US-14](us-14-visual-design-and-responsive.md) | A consistent, responsive visual design | design |
| [US-15](us-15-e2e-main-flow.md) | Protect the main flow with an end-to-end test | safety net |
| [US-16](us-16-pre-delivery-handoff.md) | Pre-delivery hand-off | 5 |

Recommended order is the numeric order. Dependencies are written in each story.

## Phase 2 — After the pre-delivery (anticipated, to refine)

| Story | Title |
| ----- | ----- |
| [US-17](us-17-firestore-catalog.md) | Services come from Firestore |
| [US-18](us-18-sign-in-and-protected-routes.md) | Sign in, and protect the admin area |
| [US-19](us-19-create-service.md) | Create a service |
| [US-20](us-20-edit-service.md) | Edit a service |
| [US-21](us-21-delete-service.md) | Delete a service |
| [US-22](us-22-form-validation.md) | Validate the service form |
| [US-23](us-23-checkout-and-order.md) | Finish the purchase and create an order |

## Conventions shared by every story

**Stack:** JavaScript, Node LTS, Vite, React, pnpm, react-router-dom, Context API, i18next; Vitest +
React Testing Library + user-event + MSW; Playwright + playwright-bdd (E2E only); Biome, Knip, Husky,
lint-staged, Commitlint, Commitizen; GitHub Actions; Vercel.

**Folder structure** (feature-based; `test/` sits next to `src/` and mirrors its structure):

```
src/
├── main.jsx                 # bootstrap (BrowserRouter, providers) — excluded from coverage
├── app/                   # App.jsx (routes), providers
├── layout/                # Layout, Header, NavBar, Footer
├── features/
│   ├── home/pages/        # Home
│   ├── products/
│   │   ├── components/    # Item, ItemList, ItemDetail, ItemCount   (presentational)
│   │   ├── pages/         # ItemListContainer, ItemDetailContainer  (containers)
│   │   ├── hooks/         # useProducts, useProduct
│   │   └── services/      # productsApi
│   ├── cart/
│   │   ├── components/    # CartWidget, CartItem
│   │   ├── pages/         # CartPage
│   │   ├── context/       # CartContext, CartProvider, useCart
│   │   └── cartReducer.js  # pure logic
│   └── team/              # team data, TeamList, TeamCard
├── i18n/                  # i18n setup and locales/es.json, locales/en.json
├── shared/                # generic helpers/components (formatPrice, localized, ...)
public/productos.json
test/                      # mirrors src/: layout/Header.test.jsx tests src/layout/Header.jsx
├── setup.js, renderWithProviders.jsx, server.js, handlers.js   # test infrastructure
└── ...                    # one *.test.* per source file, same relative path
```

**Every story has the same Definition of Done basics:** `pnpm verify` green, pipeline green, manual
check of the preview (desktop and phone width), no console errors, Conventional Commits, and
**no production code without a test that failed first**.

**Language:** the UI is bilingual (es/en, detected from the browser, US-04); code, tests, commits
and these documents are in English.

**Gherkin scenarios** describe behavior. They are executed as Vitest + RTL tests (the test name is
the scenario name) except in US-15, where they are a real `.feature` file run with Playwright.

**Provisional decisions to confirm** (recorded so they are not forgotten): brand name
"Trigologia Dev"; the routes `/servicios`, `/servicio/:id`, `/carrito` (they follow the assignment
PDF); the three team members of the footer (US-05); the price currency (USD).
