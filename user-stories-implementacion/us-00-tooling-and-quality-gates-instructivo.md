# Instructivo US-00: herramientas y controles de calidad locales (JavaScript)

Guía paso a paso para implementar [US-00](../user-stories/us-00-tooling-and-quality-gates.md) siguiendo
el [flujo de trabajo](00-workflow.md): primero las herramientas (commits `chore:`), después el primer
ciclo TDD con todos los controles ya activos.

> Leé antes `00-workflow.md` (ciclo TDD, tipos de commit, vocabulario). Los comandos y versiones
> pueden variar un poco: si algo falla, leé el error y la doc oficial, y anotá tu corrección.

## Qué vas a construir

Un esqueleto de aplicación React + JavaScript que, antes de tener una sola funcionalidad, ya rechaza
código mal formateado, tests rotos, mensajes de commit sin formato y pushes con errores. La única
pantalla: un `<h1>` con el nombre de la marca.

### Archivos

| Paso | Archivo | Qué es | Acción |
| ---- | ------- | ------ | ------ |
| 1 | todo el andamiaje de Vite | proyecto base | crear (generado) |
| 2 | `.nvmrc`, `package.json` (`engines`, `packageManager`) | versiones fijas | crear/editar |
| 3 | `biome.json`, scripts `lint`/`format` | formato y lint | crear/editar |
| 4 | `vite.config.js`, `test/setup.js` | Vitest + RTL + cobertura | editar/crear |
| 5 | `.husky/*`, `commitlint.config.js`, `package.json` (`lint-staged`, `config.commitizen`) | hooks y commits | crear/editar |
| 6 | `knip.json` (si hace falta) | código muerto | crear |
| 7 | `test/app/App.test.jsx`, `src/app/App.jsx`, `src/main.jsx` | primer ciclo TDD | crear/editar |
| 8 | scripts `verify`, `.husky/pre-push` | el comando único | editar/crear |
| 9 | repo en GitHub | publicar `main` | crear |

Nada de esto toca la lógica de negocio: todavía no existe.

## Paso 0: Preparar

Necesitás: Node LTS más reciente, `git`, una cuenta de GitHub y (opcional) `gh` (CLI de GitHub).

```sh
node -v                      # anotá el número mayor del LTS (por ejemplo 24)
corepack enable              # habilita pnpm incluido con Node
pnpm -v                      # debe responder; si no: npm i -g pnpm
git config --global user.name  "Tu Nombre"
git config --global user.email "tu@email.com"
```

> **Concepto — pnpm:** administrador de paquetes como npm, pero más rápido y más estricto con las
> dependencias. `package.json` es el `Gemfile`; `pnpm-lock.yaml` es el `Gemfile.lock`.

## Paso 1: Crear el proyecto con Vite

```sh
cd ~/Projects/talento-tech/react            # o donde quieras el repo
pnpm create vite@latest trigologia-dev-javascript --template react
```

Si pregunta por opciones experimentales (rolldown) o por instalar e iniciar: respondé **No** a
ambas. Después:

```sh
cd trigologia-dev-javascript
pnpm install
git init -b main
pnpm dev                     # abrí la URL que muestra; debe verse la página de Vite. Ctrl+C para salir
git add -A
git commit -m "chore: scaffold vite react app"
```

> Todavía no hay hooks, así que este commit pasa sin controles. El código generado por la plantilla
> **no es tu código productivo**: lo vas a reemplazar con TDD en el Paso 7.

## Paso 2: Fijar versiones

```sh
echo "24" > .nvmrc          # poné el número mayor de tu Node LTS
corepack use pnpm@latest     # escribe "packageManager" en package.json
```

En `package.json`, agregá (con el mismo número mayor):

```json
"engines": { "node": ">=24" }
```

```sh
git add -A
git commit -m "chore: pin node and pnpm versions"
```

## Paso 3: Biome en lugar de ESLint + Prettier

La plantilla de Vite trae ESLint. Sacalo:

```sh
rm -f eslint.config.js .eslintrc* 
```

Abrí `package.json`, mirá `devDependencies` y **quitá todo lo de ESLint**: los que empiezan con
`eslint`, `@eslint/`, `globals`. Por ejemplo:

```sh
pnpm remove eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals
# (si alguno no existe en tu plantilla, quitalo de la lista)
pnpm add -D -E @biomejs/biome
pnpm exec biome init
```

En `package.json`, reemplazá el script `lint` y agregá `format`:

```json
"lint": "biome check .",
"lint:ci": "biome ci .",
"format": "biome check --write ."
```

Abrí `biome.json` y revisá que:

- `vcs` esté habilitado con `useIgnoreFile: true` (Biome respeta tu `.gitignore`);
- el formateador use lo que prefieras (comillas simples: `javascript.formatter.quoteStyle`);
- las reglas recomendadas estén activas.

Si Biome dice que el `$schema` no coincide con la versión instalada: `pnpm exec biome migrate --write`.

Formateá todo el código de la plantilla y verificá:

```sh
pnpm format
pnpm lint                     # debe terminar sin errores (corregí lo que marque)
git add -A
git commit -m "chore: replace eslint with biome"
```

> **Concepto — linter vs formateador:** el formateador decide *cómo se ve* el código (espacios,
> comillas); el linter detecta *errores y malas prácticas* (variables sin usar, hooks mal usados).
> Biome hace ambas.

## Paso 4: Vitest + React Testing Library

```sh
pnpm add -D vitest jsdom @vitest/coverage-v8 \
  @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom
```

Reemplazá `vite.config.js` por:

```js
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './test/setup.js',
    include: ['test/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx'],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
})
```

(Si tu plantilla usa `@vitejs/plugin-react-swc`, dejá ese import; lo importante es cambiar
`defineConfig` a `vitest/config`.)

Creá `test/setup.js`:

```js
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

> **Por qué `cleanup`:** RTL desmonta los componentes entre tests automáticamente solo si hay
> `globals`. Como importamos `describe/it/expect` de forma explícita (sin globals), lo hacemos a mano.

Scripts en `package.json`:

```json
"test": "vitest",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage"
```

Comprobá que Vitest arranca (todavía no hay tests):

```sh
pnpm test:run
```

Debe decir `No test files found` y salir con error: es lo correcto, la configuración se valida
cuando el primer test falle por la razón correcta (Paso 7).

```sh
git add -A
git commit -m "chore: set up vitest and testing library"
```

## Paso 5: Hooks, lint-staged, Commitlint y Commitizen

```sh
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional \
  commitizen cz-conventional-changelog
pnpm exec husky init
```

`husky init` crea `.husky/pre-commit` y agrega `"prepare": "husky"` (así cualquiera que haga
`pnpm install` obtiene los hooks).

**`.husky/pre-commit`** (reemplazá el contenido):

```sh
pnpm exec lint-staged
```

**`package.json`**, agregá:

```json
"lint-staged": {
  "*": "biome check --write --no-errors-on-unmatched --files-ignore-unknown=true",
  "*.{js,jsx}": "vitest related --run --passWithNoTests"
},
"config": {
  "commitizen": { "path": "cz-conventional-changelog" }
},
"scripts": {
  "commit": "cz"
}
```

(el script `commit` va dentro del objeto `scripts` que ya existe; no dupliques la clave).

**`commitlint.config.js`:**

```js
export default { extends: ['@commitlint/config-conventional'] }
```

**`.husky/commit-msg`:**

```sh
pnpm exec commitlint --edit "$1"
```

### Probar que los controles bloquean de verdad

```sh
# 1) Mensaje inválido:
git add -A
git commit -m "changes"
#   ✖ subject may not be empty / type may not be empty  → el commit NO se crea

# 2) Mensaje válido:
git commit -m "chore: add husky, lint-staged, commitlint and commitizen"
#   debe pasar (Biome corre sobre los archivos staged)

# 3) Formato: creá src/tmp.js con   const  a=1;;   ,  hacé add y commit:
#    Biome lo reformatea o falla → probá ambos resultados y después borrá el archivo:
git restore --staged src/tmp.js; rm src/tmp.js

# 4) Commitizen (opcional, asistente interactivo):
#    pnpm commit
```

> **Concepto — Conventional Commits:** `tipo(alcance opcional): descripción`. Los tipos están en
> `00-workflow.md`. Sirven para historial legible y, más adelante, changelogs automáticos.

## Paso 6: Knip

```sh
pnpm add -D knip
```

Agregá el script `"knip": "knip"`. Corrélo:

```sh
pnpm knip
```

Knip entiende Vite, Vitest y Husky sin configuración. Si marca una dependencia que en realidad
**sí usan tus archivos de configuración** (por ejemplo `@commitlint/config-conventional`,
`cz-conventional-changelog`, `@vitest/coverage-v8`, `jsdom`), agregala a `knip.json` con un
comentario de por qué:

```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "ignoreDependencies": ["cz-conventional-changelog", "@commitlint/config-conventional"]
}
```

Por ahora Knip puede marcar `src/App.jsx` como archivo sin usar… o no: depende de la plantilla.
Lo importante es que el comando corra. Se vuelve estricto en el Paso 7.

```sh
git add -A
git commit -m "chore: add knip to detect unused code"
```

## Paso 7: 🔴🟢 El primer ciclo TDD

Ahora sí: todos los controles están activos. Escenario: *The app renders its name*.

### 🔴 Red

Creá `test/app/App.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../../src/app/App'

describe('App', () => {
  it('renders the brand name as the main heading', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Trigologia Dev' })).toBeInTheDocument()
  })
})
```

```sh
pnpm test:run
```

Rojo esperado (falla porque el comportamiento no existe: ni siquiera el archivo):

```
Error: Failed to resolve import "../../src/app/App" from "test/app/App.test.jsx". Does the file exist?
```

> Un rojo por "no existe el módulo" es válido en el primer ciclo. En los siguientes vas a ver
> rojos por aserciones (`Unable to find an accessible element...`), que son más informativos.

**No commitees en rojo.**

### 🟢 Green (mínimo)

Creá `src/app/App.jsx`:

```jsx
export function App() {
  return <h1>Trigologia Dev</h1>
}
```

Actualizá `src/main.jsx` para usarlo:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Borrá lo que dejó la plantilla: `src/App.jsx`, `src/App.css`, `src/assets/react.svg`,
`public/vite.svg` (y la línea `<link rel="icon" ... vite.svg>` de `index.html`). Vaciá `src/index.css`
(queda un archivo vacío; US-05 lo reemplaza por los tokens y estilos globales).

```sh
pnpm test:run               # 1 passed
pnpm knip                   # sin hallazgos
pnpm dev                    # se ve el título; Ctrl+C
git add -A
git commit -m "feat: render the app name"
```

El `pre-commit` corre Biome y `vitest related` sobre lo staged: si algo falla, el commit no se hace.
Revisá el resultado con `git log --oneline`.

### 🔵 Refactor

No hay nada que limpiar. Si no hay qué mejorar, no se inventa.

## Paso 8: El comando único `verify` y el hook `pre-push`

Scripts en `package.json`:

```json
"verify": "pnpm lint:ci && pnpm knip && pnpm test:coverage && pnpm build"
```

```sh
pnpm verify
```

Debe terminar bien: Biome sin errores, Knip limpio, `1 passed` y cobertura 100 %, y el build
generando `dist/`.

**`.husky/pre-push`:**

```sh
pnpm verify
```

```sh
git add -A
git commit -m "chore: add verify script and pre-push hook"
```

### Probar cada control (hacelo una vez; aprendés cómo se ve cada fallo)

1. **Cobertura:** en `src/app/App.jsx` agregá una rama sin test, por ejemplo
   `if (Math.random() > 2) return null` antes del `return`. `pnpm test:coverage` debe fallar:
   `ERROR: Coverage for branches (50%) does not meet global threshold (100%)`. Revertí con
   `git restore src/app/App.jsx`.
2. **Código muerto:** creá `src/shared/unused.js` con `export const x = 1`. `pnpm knip` debe
   nombrarlo como archivo sin usar. Borralo.
3. **Test roto bloquea el commit:** cambiá el texto del test a `'Otra cosa'`, `git add` y
   `git commit -m "test: break on purpose"` → el `pre-commit` falla. `git restore --staged .` y
   `git restore .`.
4. **Push bloqueado:** por ahora no hay remoto; lo verificás en el Paso 9.

## Paso 9: Publicar `main` (la única vez que se empuja directo)

Agregá al `.gitignore`: `coverage`, `.env*` (pero `!.env.example`), `playwright-report`,
`test-results`, `blob-report`.

```sh
git add -A && git commit -m "chore: extend gitignore"
gh repo create trigologia-dev-javascript --public --source=. --remote=origin --push
```

(sin `gh`: creá el repositorio vacío en github.com, `git remote add origin <url>` y
`git push -u origin main`). El `pre-push` corre `verify` antes de subir: mirá cómo se ejecuta.

Ahora probá el control 4 (push bloqueado), sin `--no-verify`: en una rama descartable
(`git switch -c tmp/probar-prepush`) poné `thresholds` en un valor imposible de cumplir en
`vite.config`, commiteá (el `pre-commit` no corre cobertura, así que pasa) y hacé `git push -u origin
HEAD`: el `pre-push` corre `verify` y debe rechazar el push. Volvé a `main` y borrá la rama
(`git switch main && git branch -D tmp/probar-prepush`).

## Verificación manual

- [ ] `pnpm dev` muestra el título "Trigologia Dev".
- [ ] `git log --oneline` muestra commits convencionales, cada uno verde.
- [ ] `pnpm verify` pasa desde una carpeta recién clonada (`git clone`, `pnpm install`,
      `pnpm verify`). Esto prueba que no dependés de nada de tu máquina.

## Commits sugeridos

```
chore: scaffold vite react app
chore: pin node and pnpm versions
chore: replace eslint with biome
chore: set up vitest and testing library
chore: add husky, lint-staged, commitlint and commitizen
chore: add knip to detect unused code
feat: render the app name
chore: add verify script and pre-push hook
chore: extend gitignore
```

## Definition of Done

- [ ] `pnpm verify` verde en tu máquina y en un clon limpio.
- [ ] Probaste que cada control bloquea (commit malo, formato, test roto, cobertura, Knip, push).
- [ ] El repositorio está en GitHub con `main` publicado.
- [ ] Commits en Conventional Commits.

## Qué aprendiste

- Un *gate* que nunca viste fallar no es un gate.
- Configuración ≠ código productivo: no lleva test; el comportamiento sí.
- El mismo comando (`verify`) va a correr en local y en el pipeline (US-01).
