# One token file, two runtimes

**Kit:** Studio · **Problem:** the same design kept by hand in Flutter and on the web drifts apart.

## How it works

1. `kits/studio/tokens/nithya.tokens.json` holds every colour, font, size and theme.
2. `node tokens/build.mjs` writes `flutter/lib/src/tokens.g.dart`, `web/src/nithya/tokens.css`
   and `web/src/nithya/tokens.ts`.
3. `--check` fails if a generated file differs from what the token file would make. Run it in CI.
4. Fonts ship once, in the Flutter package. The web CSS points at the same files.
5. A kit picked for one runtime has no folder for the other. The build skips it.

## Where

- `kits/studio/tokens/build.mjs`
- `docs/viability.md`: what each runtime costs and when to choose it.

## Use it elsewhere

The Calm kit uses the same idea with one target (`scripts/build.mjs`). Adding a Flutter target
to Calm means one more writer function in its build script.
