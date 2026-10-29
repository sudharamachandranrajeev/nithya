# Rail on desktop, tabs on phones

**Kit:** Calm · **Problem:** separate navigation code for desktop and phone.

## How it works

- One list of `{ id, label, icon }` items drives both layouts.
- Wider than 860 px: a side rail with every item, the brand, and a footer slot.
- Narrower: the first four items become bottom tabs. The rest go under a **More** button.
- Icons are SVG components (Lucide, ISC licence), so they look the same on every device.
  Text symbols such as ⚕ or ⚙ were tried first. Each device draws them with whatever font it
  has, and some turn them into colour emoji even with the text selector `U+FE0E`.

## Where

- `kits/calm/src/components/Shell.svelte`
- `kits/calm/demo/Demo.svelte`: an example item list.

## Use it elsewhere

Keep navigation as data and let the shell decide the layout. Put the most-used four items
first.
