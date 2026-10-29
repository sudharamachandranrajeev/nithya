# Calm mode

**Kit:** Calm · **Problem:** motion that some people find tiring or that triggers vestibular symptoms.

## How it works

- The preference has three values: **system** (default), **calm**, **full**.
- **System** follows `prefers-reduced-motion` and keeps following it while the app runs.
- In calm, `<html data-motion="calm">` sets every `--dur-*` token and the glow to zero.
  A catch-all rule sets every animation and transition to 0 ms, so third-party parts calm
  down too.
- Theme changes skip the cross-fade in calm.

## Where

- `kits/calm/src/base.css`: the `[data-motion='calm']` rules.
- `kits/calm/src/theme.svelte.ts`: `ui.calm` and the OS watcher.
- `kits/calm/src/components/ThemePicker.svelte`: the Motion control.

## Use it elsewhere

Give every duration a token, never a literal. Then calm is one attribute. In Flutter, read
`MediaQuery.disableAnimationsOf(context)` and pass `Duration.zero`.
