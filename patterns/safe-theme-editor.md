# Theme editor that cannot inject code

**Kit:** Calm · **Problem:** user and shared themes are an easy way to smuggle CSS into an app.

## How it works

- Users change **colours** (hex only), **fonts** (from the kit's list), **corner roundness**
  (bounded number) and **looks** (background, cards, titles, navigation, rows).
- A look is never free text. Each look group copies its values from a built-in theme
  ("Cards like Aurora"). So every style string in a user theme matches one the kit ships.
- Shared themes travel as JSON text. On load, `validateTheme()` rebuilds the theme from known
  fields and rejects anything else, with a plain-words reason.
- Built-in theme ids cannot be overwritten.

## Where

- `kits/calm/src/presets.ts`: `styleGroups`, `applyPreset`, `validateTheme`.
- `kits/calm/src/components/ThemeEditor.svelte`: the editor, copy and load.
- `kits/calm/test/calm.test.ts`: the injection tests.

## Use it elsewhere

Allow-list values, never block-list them. Validate at the moment of import, and again when
loading saved prefs if those can be edited outside the app.
