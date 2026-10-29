# Glow backdrop

**Kits:** Studio, Calm · **Problem:** flat dark pages feel dead; images behind text hurt reading.

## How it works

Soft, large radial gradients sit behind the page, in the theme's own colours, at low strength.
They are tokens, so each theme decides whether it glows.

- **Studio:** each theme has a `glow` list of `{ color, alpha, x, y, radius }`. Flutter
  paints them with `RadialGradient`. The web joins them into one `background` value
  (`--n-backdrop`). Lagoon and Ember glow; the others are flat.
- **Calm:** the `pageBg` look refers to two colours per mode, `glowA` and `glowB`. Themes that
  should not glow set them equal to the page colour. Aurora glows; Sage and Journal stay flat.

## Where

- `kits/studio/tokens/build.mjs`, `kits/studio/flutter/lib/src/widgets/shell.dart` (`NithyaBackdrop`).
- `kits/calm/tokens/calm.tokens.json` (`pageBg`, `glowA`, `glowB`).

## Use it elsewhere

Keep text on solid or glass cards above the glow, and run the contrast check against the card,
not the glow.
