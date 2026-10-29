# Live previews of other themes

**Kit:** Calm · **Problem:** theme pickers that show a flat colour swatch, not the real look.

## How it works

Theme selectors are attribute selectors, not `:root` rules. So any element can carry its own
`data-theme` and `data-mode`, and everything inside it takes that theme's variables:

```html
<div data-theme="journal" data-mode="light"> …a real card, row and pill… </div>
```

The picker draws one small real screen per theme, side by side, each scoped to its own theme.
The theme editor uses the same trick: it writes the draft theme as a CSS block for
`[data-theme="__draft"]` and scopes its preview to that id.

## Where

- `kits/calm/src/compile.ts`: `themeSelector(id, mode)`.
- `kits/calm/src/components/ThemePicker.svelte`: the previews.
- `kits/calm/src/components/ThemeEditor.svelte`: the draft preview.

## Use it elsewhere

Keep theme rules as attribute selectors, and set every themed property (background, colour,
font) on the scoped element itself, not only on `body`.
