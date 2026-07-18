# Zenoway Design System — Tailwind v4, CSS-first

## Why this approach

Tailwind v4 moved theme config out of `tailwind.config.ts` and into CSS
itself via `@theme`. For a design system in 2026, that's the better
default:

- **One file, one language.** Tokens, dark overrides, and custom utilities
  all live in CSS — no JS/CSS split to keep in sync.
- **Real runtime variables.** Every token is an actual CSS custom property,
  so theming (dark mode, future brand variants) is just overriding
  variable values under a class — zero `dark:` prefixes needed anywhere
  in your components.
- **No content array, no PurgeCSS config.** v4's engine scans automatically.

## Setup

1. **Install** (v4 uses a new engine — different package than v3):
   ```bash
   npm install tailwindcss @tailwindcss/postcss
   ```
   PostCSS config:
   ```js
   // postcss.config.mjs
   export default { plugins: { "@tailwindcss/postcss": {} } };
   ```

2. **Tokens** — copy `globals.css` in as your global stylesheet (or merge
   the three layers into your existing one). Import it once, in
   `app/layout.tsx`:
   ```tsx
   import "./globals.css";
   ```

3. **Fonts** — copy `fonts.ts`, wire it into `layout.tsx`:
   ```tsx
   import { spaceGrotesk, inter, plexMono } from "@/design-system/fonts";

   export default function RootLayout({ children }) {
     return (
       <html lang="en">
         <body className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} font-body`}>
           {children}
         </body>
       </html>
     );
   }
   ```
   `globals.css` points `--font-display` etc. at the variable names
   `fonts.ts` generates, so font loading stays self-hosted via `next/font`
   while the token *names* stay CSS-first.

4. **Dark mode toggle** — `ThemeSwitcher.tsx` + the anti-flash script in
   `layout-snippet.tsx` still apply as-is. They just toggle a `.dark` class
   on `<html>`; the three-layer CSS handles the rest.

## The three layers, and why

| Layer | File location | Rule |
|---|---|---|
| **Primitives** | `:root` in `globals.css`, `--p-*` prefix | Raw values. Never used directly in components. |
| **Semantic** | `@theme` block in `globals.css`, `--color-*` etc. | What components use (`bg-canvas`, `text-accent`). Named by role, not appearance. |
| **Dark overrides** | `.dark { }` in `globals.css` | Same semantic names, different primitives. Nothing else changes. |

This is what "semantic theming" means in practice: `accent` is a role, not
a color. If Zenoway's brand color ever changes from indigo to something
else, you edit the primitive in one place — no component, no `bg-[#5B57F2]`
scattered anywhere, ever gets touched.

## Tokens at a glance

| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#F3F3F0` | `#15161C` | page background |
| `ink` | `#15161C` | `#F3F3F0` | primary text |
| `subtle` | `#4A4A52` | `#C8C8C3` | body copy |
| `muted` | `#8A8A82` | `#8C8C87` | captions, metadata |
| `line` | `#DCDCD6` | `#2D2E36` | borders |
| `accent` | `#5B57F2` | `#827EFF` | links, CTAs, focus |
| `signal` | `#B6FF3C` | same | live/active indicators only |
| `warn` | `#FF6B57` | `#FF8270` | alerts, "new" badges |

Type: `font-display` (Space Grotesk), `font-body` (Inter), `font-mono`
(IBM Plex Mono).

## Rules for extending this

- Never add a raw hex value in a component. If a token doesn't exist yet,
  add a primitive, then a semantic alias — in that order.
- `signal` is reserved for "this is happening right now." Using it as a
  generic accent kills its meaning.
- `FlowStep` numbering is only for genuinely sequential content.
- Every job card anywhere on the site renders through `JobCard` so the
  visual vocabulary for "this is a job" never forks.
