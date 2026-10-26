# Viability: Flutter vs Tauri + web

Nithya builds the same design framework and the same demo studio twice. This report records what each build cost and what it gives a future app. All numbers come from one laptop (x86_64 Linux, Arch, kernel 7.2) on 2026-10-26.

## What was built

| | Flutter | Tauri + web |
| --- | --- | --- |
| Framework source (hand-written) | 1,563 lines of Dart | 683 lines of TSX + 676 lines of CSS |
| Generated tokens | `tokens.g.dart` | `tokens.css`, `tokens.ts` |
| Demo studio | 604 lines | 518 lines |
| Tests | 22 unit + 12 screen (pumped and rendered to PNG) | 23 unit (jsdom), studio smoke for all 6 modes |
| Components | 25 | 25, one-to-one with Flutter |
| Native shell | Flutter embedder per platform | 10 lines of Rust; undecorated window, web-drawn buttons |

Both builds pass the same behavioural checks: WCAG contrast for every theme, icon buttons always named, SOON cards inert, prompt dock Enter / Shift+Enter rules, sectioned dialog navigation and close.

## Measurements

Linux release builds of the demo studio:

| | Flutter (`flutter build linux --release`) | Tauri + web (`tauri build --bundles deb`) |
| --- | --- | --- |
| First build | 27 s | 248 s (Rust dependencies compile once; later builds reuse them) |
| App on disk | 24.5 MiB bundle (22 MiB is the Flutter engine) | 4.3 MiB binary, assets embedded |
| Download | 10.0 MiB (`.tar.gz` of the bundle) | 2.4 MiB (`.deb`) |
| Web assets | n/a | 255 KiB JS (81 KiB gzip), 18 KiB CSS, 2.2 MiB TTF fonts |
| Renderer | bundled engine, same pixels on every OS | the system WebView (WebKitGTK here), varies per OS |
| Test run | 22 + 12 tests in about 3 s | 23 tests in about 2 s |

The Tauri app is about a quarter of the size because it borrows the system WebView. The cost is that rendering depends on that WebView's version on each user's machine; Flutter ships its renderer and looks the same everywhere.

## Findings

**Token pipeline works.** One JSON file drives both runtimes. A theme added to the JSON appears in both with no hand edits. The `--check` mode makes stale output a CI failure. Dart's formatter would rewrap the generated file, so it carries `// dart format off`.

**Visual parity is high.** The two launchers are close to pixel-identical (see the README). Differences: Flutter draws its own text, so line heights differ by one or two pixels; the web build uses lucide icons and the Flutter build uses Material icons. Neither difference is a token problem.

**Glow themes are cheaper on the web.** CSS radial gradients express the glow layers directly. Flutter needs a `CustomPainter`.

**Accessibility is easier to enforce in the type system on both.** `NithyaIconButton` and `IconButton` both require `label`. The studied app left most icon buttons unnamed; neither Nithya build can.

**Accessibility is easier to test on the web.** Testing Library queries by role and name, which is how assistive technology sees the page. Flutter's semantics tests work, but the matcher API changed during this project (`containsSemantics` became deprecated for `isSemantics`).

**Web focus handling is manual.** The web `Dialog` moves focus in, closes on Escape and returns focus on close; Flutter's route system does this already. A focus trap (Tab cycling inside the dialog) is still missing on the web side.

**Badge contrast in the light theme is low.** The NEW / BETA badge text uses the hue at full strength on a 22% tint of itself. On Daylight that measures 1.6:1 to 2.0:1, against 4.5:1 to 5.4:1 on Dusk. Both runtimes share the issue because both read the same tokens; the fix belongs in the token file (a darker badge hue per light theme).

**Fonts ship once.** The web build reads the TTFs from the Flutter package. They are the largest part of the web bundle; WOFF2 subsets would cut that by about 70%.

## What porting existing apps would cost

The existing Flutter apps total about 140,000 lines of Dart. Moving them to Tauri + web would mean:

- rewriting every screen and the shared core library in TypeScript, roughly 4 to 6 months of full-time work;
- losing the Android build for those apps until Tauri's mobile targets are proven for them;
- rewriting their test suites.

Adopting Nithya inside the existing Flutter apps instead is a theme swap plus widget replacement per screen. It needs no runtime change.

## Recommendation

- **Existing Flutter apps:** stay on Flutter. If Nithya is adopted later, use the Flutter package.
- **New desktop-first apps** with heavy media, canvas or 3D work: Tauri + web is viable and much smaller to ship. The browser ecosystem (three.js, WebGL, WASM codecs) is the main reason to pick it.
- **New apps that need Android:** Flutter.
- **Either way:** keep the token file as the single source of truth so the choice of runtime stays reversible.
