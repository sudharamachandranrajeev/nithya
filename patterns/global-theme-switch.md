# One switch restyles the whole app

**Kit:** Calm · **Problem:** themes that only some screens follow, or that need a reload.

## How it works

1. Every colour, font and shape is a CSS variable, generated from one token file.
2. Each theme and mode is one CSS block: `[data-theme="aurora"][data-mode="dark"] { --c-bg: …; }`.
3. The app sets three attributes on `<html>`: `data-theme`, `data-mode`, `data-motion`.
   Changing one attribute repaints every screen at once.
4. The change runs inside `document.startViewTransition()`, so the old look cross-fades into
   the new one. Calm mode and browsers without the API switch instantly.
5. "Light / dark / system" is a preference. The resolved mode follows the OS while set to
   system. A theme without that mode shows its own default instead.

```ts
ui.set({ theme: 'journal' })   // every screen, saved
ui.set({ mode: 'dark' })
```

## Where

- `kits/calm/src/theme.svelte.ts`: the `ui` store, `set()`, the view transition, `#apply()`.
- `kits/calm/scripts/build.mjs`: writes one CSS block per theme and mode.

## Use it elsewhere

Any stack works: generate one CSS block per theme, read only variables in components, flip
attributes on the root element. In Flutter, the equivalent is one `ThemeData` per theme
swapped at the `MaterialApp`.
