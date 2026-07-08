# MUI → shadcn/ui Migration Plan

## ✅ COMPLETE — all 8 phases done

Source is 100% MUI/Emotion-free (`grep @mui|@emotion src` → none). Full suite: 144 files / 619
tests passing; typecheck 0; eslint 0; production `vite build` succeeds. `@mui/*` + `@emotion/*`
removed from package.json; MUI theme files deleted; theming is CSS-vars via `[data-theme]`.

**Remaining housekeeping (user):**
1. `pnpm install` — prune `@mui/*` + `@emotion/*` from node_modules and regenerate the lockfile
   (package.json no longer lists them, but they're still physically installed until a reinstall).
2. Restart the Standalone dev server — `vite.config.ts` changed (removed MUI chunking + emotion
   optimizeDeps; Tailwind plugin) and Vite doesn't hot-apply config.
3. CSP: the Emotion runtime style-injection + nonce cache is gone (Tailwind ships a static
   stylesheet). Verify the app's CSP still passes in the running instance (Radix uses inline style
   *attributes*, governed by style-src-attr/'unsafe-inline', not the nonce).
4. Optional follow-up: `OneTimeCodeTextField` and `OTPDial` still use single `Input` /
   `react18-input-otp` respectively; the shadcn segmented `input-otp` primitive is available if a
   segmented look is desired later.

---


Migrate the Authelia web frontend from **MUI 7 + Emotion** to **shadcn/ui (Radix + Tailwind v4)**.
Strategy: **incremental, bottom-up.** Set up the toolchain and theme bridge first, then
convert base primitives, then leaf components, then layouts, then views, then remove MUI.

## Current state (inventory)

- React 19.2 / Vite 8 (rolldown) / TypeScript 6 / Vitest 4 (happy-dom).
- **98 non-test `.tsx`**: 30 components, 3 layouts, ~59 view files.
- **76 files import `@mui/material`.** Top usage: `Box` ×29, `Typography` ×20, `Button` ×20,
  `Grid` ×31, `Tooltip` ×13, `Paper` ×9, plus `Dialog`/`Alert`/`Checkbox`/`TextField`/`Menu`/
  `List`/`Divider`/`Container`/`Stack`/`FormControl` families.
- Styling: `sx=` in 44 files, `styled()`/`makeStyles` in only 3 → almost all inline `sx`.
- **4 themes** (`src/themes/{Light,Dark,Grey,Oled}.ts`) via `createTheme`, plus a `theme.custom`
  extension (`icon`, `loadingBar`). Switched at runtime by `ThemeContext` (localStorage +
  `prefers-color-scheme`, `auto` mode).
- Emotion wired in `main.tsx` with a **CSP nonce** cache (`createCache`).
- `vite.config` has **MUI-specific bundle chunking** (`@mui/` → `mui.[name]` chunks) and
  `optimizeDeps.include: ["@emotion/react","@emotion/styled"]` — both need cleanup at the end.
- Every source file has a co-located `.test.tsx` (Testing Library) — updated per file as migrated.
- Icons: FontAwesome (MUI-independent) + `@mui/icons-material` (13 files). Keep FA; replace only
  the `@mui/icons-material` usages (with `lucide-react` or FA equivalents).

## Dev environment

The **Standalone** suite runs the app with **hot-reload** at `https://login.example.com:8080`
(see `~/src/authelia/DEVELOPMENT_ENVIRONMENT.md`). **Do not start/stop/restart any server** —
source edits (`.tsx`, `index.css`, themes) are picked up automatically. The one exception is
`vite.config` changes (adding the Tailwind plugin in Phase 1), which require a dev-server restart
the user performs (`authelia-scripts suites setup Standalone`). Flag that edit when it lands.

## Guiding rules

1. **Do NOT remove `@mui/*` / `@emotion/*` from `package.json` until the final cleanup phase.**
   Both style engines coexist during migration (Tailwind = static CSS, Emotion = runtime). Removing
   MUI up front forces an all-or-nothing branch with no safe checkpoints.
2. **Theme bridge before any component** — un-migrated MUI and migrated Tailwind components must read
   the same theme selection, or the UI looks inconsistent mid-migration.
3. **Bottom-up**: primitives → leaves → shared → layouts → views. A file is only migrated once all
   its children are.
4. Each PR/unit: swap component + rewrite `sx=`/`Grid` to Tailwind classes + update co-located test.
   Keep `pnpm test`, `pnpm lint`, `pnpm build` green at each step.

## Theme token mapping

Convert each `createTheme` palette into a `[data-theme="…"]` CSS-variable block using shadcn token
names. Drive it from `ThemeContext` by setting `document.documentElement.dataset.theme` alongside the
existing MUI `ThemeProvider` (keep both until cleanup).

| shadcn var | source (MUI palette) |
|---|---|
| `--background` / `--foreground` | `palette.background.default` / `palette.text.primary` |
| `--card` / `--card-foreground` | `palette.background.paper` / `palette.text.primary` |
| `--primary` / `--primary-foreground` | `palette.primary.main` / contrastText |
| `--secondary` … | `palette.secondary.*` |
| `--muted` / `--muted-foreground` | `palette.grey.*` / `palette.text.secondary` |
| `--destructive` | `palette.error.main` |
| `--border` / `--input` | `palette.divider` |
| `--ring` | `palette.primary.main` |
| `--icon`, `--loading-bar` (custom) | `theme.custom.icon`, `theme.custom.loadingBar` |

Themes to preserve: `light`, `dark`, `grey`, `oled` (+ `auto` resolves to light/dark via media query).

## Component mapping

| MUI | shadcn / replacement |
|---|---|
| `Button`, `IconButton` | `ui/button` (+ `size="icon"`) |
| `Paper`, `Card` | `ui/card` |
| `TextField` | `ui/input` + `ui/label` (+ `ui/form` if wanted) |
| `Dialog*` family | `ui/dialog` |
| `Tooltip` | `ui/tooltip` |
| `Alert`, `AlertTitle` | `ui/alert` |
| `Checkbox` + `FormControlLabel` | `ui/checkbox` + `ui/label` |
| `RadioGroup` | `ui/radio-group` |
| `Menu`, `MenuItem` | `ui/dropdown-menu` |
| `Drawer` (PrivacyPolicyDrawer) | `ui/sheet` or `ui/drawer` |
| `List`/`ListItem*` | Tailwind list markup |
| `Divider` | `ui/separator` |
| `LinearProgress`/`CircularProgress` | `ui/progress` / `react-spinners` (already a dep) |
| `OneTimeCodeTextField` (`react18-input-otp`) | `ui/input-otp` |
| `Box`/`Typography`/`Grid`/`Stack`/`Container` | plain elements + Tailwind utilities (no primitive) |

## Generated-component fixups (every `shadcn add`)

shadcn output doesn't match this repo's lint config. After each `pnpm dlx shadcn@latest add <c>`:
1. Replace `import * as React from "react"` with named imports (e.g. `ComponentProps`,
   `forwardRef`) and update usages — the repo bans the default/namespace React import
   (`no-restricted-imports`). JSX transform is automatic (React 19), so no React import is needed
   for JSX itself.
2. Format with `./node_modules/.bin/prettier --write <file>` (editorconfig ON is now correct — see
   below). Validate with `./node_modules/.bin/prettier --check <file>`.
   (Note: `pnpm exec` currently errors on a deps-status precheck — call `./node_modules/.bin/*`
   binaries directly.)

   **Indentation / `.editorconfig` (RESOLVED):** the parent `authelia/.editorconfig` sets
   `[*] indent_style = tab`, and its `[web/**]` space override does NOT match this `web-fork/` path.
   The container's `eslint-plugin-prettier` DOES read editorconfig, so it demanded tabs on every file
   (15k+ errors) — the whole fork is spaces. Fixed by adding **`web-fork/.editorconfig`** with
   `root = true` + `indent_style = space` (indent_size 4; json/yaml 2), which stops the cascade to the
   parent and makes editorconfig, `prettier.config.mjs`, and the existing files all agree on spaces.
   So: use plain `prettier`/`eslint --fix` now (no `--no-editorconfig` needed); tabs are gone.
3. Confirm the `cn` import resolved to `@utils/cn` (driven by `components.json` aliases).

Toolchain established in Phase 1: Tailwind v4 via `@tailwindcss/vite`, `components.json` (aliases →
`@components`, `@components/ui`, `cn`→`@utils/cn`), `src/utils/cn.ts`, token layer in `src/index.css`.
`src/components/ui/button.tsx` added as the smoke test. Radix ships as the unified `radix-ui` pkg.

## Known environment gotchas

- **pnpm store mismatch when adding deps.** `node_modules/.modules.yaml` is bind-mounted and records
  the container-internal store `/app/.pnpm-store` (unreachable from the host). Host `pnpm add` and the
  shadcn CLI's internal `pnpm add` now fail with `ERR_PNPM_UNEXPECTED_STORE`. Do NOT run `pnpm install`
  on the host (churns the `node_modules` the live dev server uses). To add a runtime dep (e.g.
  `input-otp` for Phase 5), add it from **inside the Standalone container** where the store is
  consistent, or have the user run it. shadcn components that only need `radix-ui` (already installed)
  add fine because the CLI skips the install step.
- **Deferred:** `input-otp` primitive (needs the `input-otp` npm pkg) — add before Phase 5's
  `OneTimeCodeTextField`. `TooltipProvider` must wrap the app (or each tooltip) once tooltips render —
  wire at the app root in Phase 5.

## Phase 3 status

13 primitives in `src/components/ui/`: alert, button, card, checkbox, dialog, dropdown-menu, input,
label, progress, radio-group, separator, sheet, tooltip. All normalized: named React imports (no
`import * as React`), no `"use client"`, 4-space (container style). Codemod for future `shadcn add`:
strip `"use client"`, rewrite `React.<X>` → named import, `eslint --fix` (import order) then
`prettier --no-editorconfig --write` (→ spaces). Verify with `eslint --rule '{"prettier/prettier":"off"}'`
(the local prettier/prettier rule is tab-noise; the container gate is spaces).

## Phase 5 status (partial)

Migrated & green (tsc + prettier + eslint real-rules): CopyButton, HomeButton, SignOutButton,
ComponentOrLoading, ComponentWithTooltip, TypographyWithTooltip, PasswordMeter, NotificationBar
(Snackbar → fixed shadcn Alert), AppBarLoginPortal, PrivacyPolicyDrawer (Drawer → Sheet),
OpenIDConnect (MUI icons → lucide w/ `scope-avatar-*` testids). Also made `ui/tooltip` `Tooltip`
self-wrap its `TooltipProvider` (so tooltip components need no app-root provider and test bare).
Tests rewritten where MUI-coupled: ComponentWithTooltip (Radix-hover→structural), ComponentOrLoading
(`.MuiBox-root`→text parent), NotificationBar (`MuiAlert-*`→`data-level`), OpenIDConnect (icon testids).

Menus migrated to shadcn `DropdownMenu`: `AppBarItemAccountSettings` (uses `DropdownMenuItem`s) and
`AppBarItemLanguage` (controlled menu with custom row buttons to preserve the inline expand/collapse
accordion without Radix's auto-close; chevrons are lucide with `data-testid="expand-less|expand-more"`).
**⚠ Their tests need container verification** — rewritten to open the menu via
`fireEvent.keyDown(button, { key: "Enter" })` (Radix keyboard path; no pointer-capture dependency)
since Radix menu open/portal behaves differently under happy-dom than MUI. If they don't open that
way in the container, switch the open step to `fireEvent.pointerDown` or `@testing-library/user-event`.

**Deferred:** `OneTimeCodeTextField` — `TextField` → `input-otp`; blocked until the `input-otp` dep is
added from inside the container (host pnpm store mismatch). Blocks the Phase 7 OTP views.

## Local validation (this environment)

- `./node_modules/.bin/tsc --noEmit` — typechecks all `.tsx` incl. tests. **Primary gate.**
- `./node_modules/.bin/prettier --check <files>` — format gate (matches container now that
  `web-fork/.editorconfig` exists; earlier notes said `--no-editorconfig` — no longer needed).
- **Vitest does NOT run locally**: `node_modules` lacks `@rolldown/binding-linux-x64-gnu` (optional
  native dep missing for this arch). The Standalone container has the correct binding, so the test
  suite runs there / in CI. Update co-located tests as part of each migration, but expect to verify
  their pass in the container, not locally.

## Phases → see task list

1. **Tooling & deps** — Tailwind v4 + `@tailwindcss/vite`, shadcn init, `cn()`, path aliases.
2. **Theme bridge** — 4 themes as CSS-var blocks, wire `ThemeContext` → `data-theme`.
3. **Base primitives** — generate/adapt the `ui/*` set above.
4. **Leaf components** — icons + pure presentational components.
5. **Shared components** — Brand, CopyButton, NotificationBar, PasswordMeter, AppBar items, buttons,
   tooltip wrappers, drawers, OneTimeCodeTextField.
6. **Layouts** — `LoginLayout`, `MinimalLayout`, `SettingsLayout`.
7. **Views** — LoginPortal → Settings → ConsentPortal → ResetPassword/Revoke/LoadingPage.
8. **Cleanup & verify** — remove `@mui/*`/`@emotion/*`, strip Emotion cache from `main.tsx`, remove
   MUI chunking + `optimizeDeps` from `vite.config`, delete `src/themes/*.ts`, drop MUI `types`
   augmentation; verify CSP (no runtime style injection), lint, test, build.
