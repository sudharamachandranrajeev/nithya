# Readable text, checked

**Kit:** Calm · **Problem:** themes that look good and are hard to read.

## How it works

1. The token file lists the pairs that must stay readable, each with a WCAG 2.2 minimum:
   body text on page and cards 4.5:1, accent text on its soft fill 4.5:1, focus ring 3:1.
2. The build computes the contrast ratio for every pair in every theme and mode. It
   **fails** and names the pair if one is short. A theme cannot ship unreadable.
3. The theme editor runs the same check as the user edits. It says in plain words what
   is hard to read , with the ratio it got and the ratio it needs. Saving stays possible, but the
   button says **Save anyway**.

## Where

- `kits/calm/src/contrast.ts`: `ratio()` and `check()` (WCAG relative luminance).
- `kits/calm/tokens/calm.tokens.json`: `contrast.pairs`.
- `kits/calm/scripts/build.mjs`: the build gate.
- `kits/calm/test/calm.test.ts`: reference values and every built-in theme.

## Use it elsewhere

`contrast.ts` has no dependencies. Copy it, list your pairs, and run it in CI. The Studio kit
still has one known gap: badge text on Daylight.
