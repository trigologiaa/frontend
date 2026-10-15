# Instructivo US-01: CI/CD y despliegue en vivo (JavaScript)

Guía para implementar [US-01](../user-stories/us-01-ci-cd-and-live-deployment.md). Esta story no tiene
código de aplicación: el "test" es **ver al pipeline fallar y pasar de verdad**. Seguí igual el
[flujo](00-workflow.md): rama, commits convencionales, PR.

> Las pantallas de GitHub y Vercel cambian de lugar con frecuencia. Los nombres de las opciones son
> los esperados; si no los encontrás, buscá por el nombre en la ayuda del sitio.

## Qué vas a construir

1. La página mínima (solo el título) **publicada en Vercel**, con URL pública.
2. Un workflow de **GitHub Actions** que corre `pnpm verify` en cada PR y en cada push a `main`.
3. **Protección de `main`**: solo entra código por PR con el check `verify` en verde.
4. Una plantilla de PR y un README mínimo con la URL en vivo.

### Archivos

| Paso | Archivo | Qué es | Acción |
| ---- | ------- | ------ | ------ |
| 1 | `docs/user-stories/*.md` | las stories publicadas (US-00 y US-01 por ahora) | crear |
| 2 | (Vercel, sin archivos) | deploy de `main` | configurar |
| 3 | `.github/workflows/ci.yml` | el pipeline | crear |
| 4 | `.github/pull_request_template.md` | plantilla de PR | crear |
| 5 | `README.md` | URL en vivo + badge de CI | crear |
| 6 | (GitHub Settings) | protección de `main` | configurar |

## Paso 0: Preparar

```sh
git switch main && git pull
pnpm verify                                   # debe estar verde antes de tocar nada
git switch -c us-01-ci-cd-and-live-deployment
mkdir -p docs/user-stories
cp <ruta-a>/javascript/user-stories/*.md docs/user-stories/   # solo las stories que ya existan
git add docs
git commit -m "docs: add user stories"
```

> Las stories viven en el repo (`docs/user-stories/`): la especificación queda versionada con el
> código. Los instructivos **no** se suben.

## Paso 1: Publicar la página en Vercel (todavía sin pipeline)

1. Entrá a <https://vercel.com/new> e ingresá con tu cuenta de GitHub.
2. **Import** del repositorio `trigologia-dev-javascript`.
3. Vercel detecta **Vite**. Verificá: *Build Command* `pnpm build`, *Output Directory* `dist`,
   *Install Command* `pnpm install` (toma la versión de `packageManager`).
4. **Deploy**. En un par de minutos tenés una URL `https://<proyecto>.vercel.app`.
5. En *Settings → General → Node.js Version* elegí la misma versión mayor que `.nvmrc`.
6. En *Settings → Git* confirmá: *Production Branch* = `main` y previews para *pull requests*.

Abrí la URL: debe verse **Trigologia Dev**. Desde ahora la página existe en Internet; lo que sigue
es que cada cambio llegue ahí de forma segura.

> **Concepto — preview deployments:** cada PR recibe su propia URL temporal (Vercel la comenta en
> el PR). Revisás el cambio funcionando *antes* de mergear.

## Paso 2: 🔴 El pipeline (primero el check que falta)

No hay test de Vitest para esto. La "falla esperada" es que hoy **nada** verifica tus PR. Vas a
comprobarlo al final del Paso 4 (antes de crear el workflow, un PR no muestra ningún check).

## Paso 3: 🟢 El workflow

Creá `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm verify
```

Puntos para entender:

- El **nombre del job** (`verify`) es el nombre del check que vas a exigir en la protección de
  `main`. No lo cambies después sin actualizar la regla.
- `pnpm/action-setup` lee la versión de `packageManager` de tu `package.json`: por eso la fijamos
  en US-00.
- `--frozen-lockfile` falla si `package.json` y `pnpm-lock.yaml` no coinciden: evita que "en mi máquina
  anda".
- `permissions: contents: read` = mínimo privilegio. `concurrency` cancela ejecuciones viejas de la
  misma rama.
- Revisá en GitHub Marketplace que los *majors* de las actions (`@v4`) sigan siendo los vigentes.
- El workflow solo llama a `pnpm verify`: no hay ningún control que no puedas correr localmente.

```sh
git add .github/workflows/ci.yml
git commit -m "ci: run verify on pull requests and main"
```

## Paso 4: Plantilla de PR

`.github/pull_request_template.md`:

```markdown
## What
<!-- Qué cambia, en una o dos frases -->

## Story
<!-- US-NN y link a docs/user-stories/... -->

## How it was tested
- [ ] Tests written first (red → green), one cycle per commit
- [ ] `pnpm verify` is green

## Manual checks (preview URL)
- [ ] Desktop and phone width (360 px)
- [ ] Keyboard only
- [ ] No errors in the browser console

## Notes
<!-- Decisiones, deuda conocida, TODOs con issue -->
```

```sh
git add .github/pull_request_template.md
git commit -m "docs: add pull request template"
```

## Paso 5: README mínimo

```markdown
# Trigologia Dev (JavaScript)

Tienda de servicios de desarrollo de software.

- **En vivo:** https://<tu-proyecto>.vercel.app
- **Stories:** [docs/user-stories](docs/user-stories)

![CI](https://github.com/<tu-usuario>/trigologia-dev-javascript/actions/workflows/ci.yml/badge.svg)

## Scripts

| Comando | Qué hace |
| ------- | -------- |
| `pnpm dev` | servidor de desarrollo |
| `pnpm test` | tests en modo watch |
| `pnpm verify` | lo mismo que corre el pipeline |
```

```sh
git add README.md
git commit -m "docs: add readme with live url"
```

## Paso 6: Subir la rama y abrir el PR

```sh
git push -u origin us-01-ci-cd-and-live-deployment     # el pre-push corre pnpm verify
gh pr create --fill --base main                        # o desde la web de GitHub
gh pr checks --watch                                   # mirá el check "verify"
```

Debe aparecer `verify` corriendo y terminar en ✓. En el PR Vercel comenta con la URL de preview:
abrila y verificá que muestra el título.

## Paso 7: Proteger `main`

En GitHub → *Settings → Rules → Rulesets → New branch ruleset*:

- **Name:** `protect-main`; **Enforcement:** Active; **Target branches:** `main` (Include default
  branch).
- Activá: **Restrict deletions**, **Block force pushes**, **Require a pull request before merging**
  (approvals requeridos: **0**, sos la única persona), **Require status checks to pass** → agregá
  `verify` (aparece en el buscador porque ya corrió) y **Require branches to be up to date**.
- En *Settings → General → Pull Requests*: dejá solo **Allow squash merging** y activá
  **Automatically delete head branches**.

> Tip: el check `verify` solo aparece en el buscador después de que corrió al menos una vez. Por eso
> la protección va después del primer PR.

## Paso 8: Probarla (el "rojo" real)

1. **Push directo a `main`** debe ser rechazado:

   ```sh
   git switch main && git commit --allow-empty -m "chore: should be rejected" && git push
   #  remote: error: GH013: Repository rule violations found ...
   git reset --hard origin/main
   ```

2. **PR roja no mergeable.** Única excepción a la regla "nunca saltear hooks", en una **rama
   descartable que jamás se mergea**:

   ```sh
   git switch -c tmp/ci-should-fail
   # cambiá el texto esperado del test para que falle:  'Trigologia Dev' → 'Otra cosa'
   git commit -am "test: break on purpose" --no-verify
   HUSKY=0 git push -u origin tmp/ci-should-fail
   gh pr create --fill --base main
   gh pr checks --watch        # verify ✗
   ```

   En el PR, el botón de merge debe estar bloqueado ("Required statuses must pass"). Cerrá el PR y
   borrá la rama remota y local.

3. **PR verde mergeable:** volvé al PR real de US-01 (`verify` ✓) y verificá que el botón de merge
   está habilitado.

## Paso 9: Mergear y ver producción

1. **Squash and merge** del PR de US-01. Título: `ci: add verification pipeline and production deploy`
   (se convierte en el commit de `main`).
2. Mirá la pestaña *Deployments* de Vercel: aparece un deploy de producción desde `main`.
3. Abrí la URL de producción: debe mostrar el título.

```sh
git switch main && git pull
git branch -d us-01-ci-cd-and-live-deployment
```

## Verificación manual

- [ ] La URL de producción responde y muestra "Trigologia Dev".
- [ ] El PR de esta story mostró el check `verify` y un preview de Vercel.
- [ ] Un PR roto quedó bloqueado; un push directo a `main` fue rechazado.
- [ ] El README tiene la URL real y el badge muestra "passing".

## Commits sugeridos

```
docs: add user stories
ci: run verify on pull requests and main
docs: add pull request template
docs: add readme with live url
```

(en `main` queda un solo commit por el squash: `ci: add verification pipeline and production deploy`)

## Definition of Done

- [ ] El PR de esta story corrió `verify` en GitHub y pasó.
- [ ] Un PR roto fue bloqueado y descartado.
- [ ] `main` está protegida como se describe.
- [ ] La URL de producción muestra el título; viste un preview de PR.
- [ ] El README contiene la URL de producción.

## Qué aprendiste

- Desplegar **primero** el esqueleto mínimo hace que los problemas de despliegue aparezcan cuando
  son baratos.
- Un pipeline que nunca viste fallar no te protege; por eso lo rompiste a propósito.
- La protección de la rama convierte "buenas intenciones" en regla.
