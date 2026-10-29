# Clean-room process

Nithya studies shipped applications to learn how good creative-tool interfaces are put
together, then rebuilds those ideas from a written description. It never copies source.

This process covers the **Studio** kit only. The **Calm** kit is our own design, first built
for Arogya Swasthya. No shipped app was studied for it, so it has no observation room.

## Rules

1. **Two rooms.** The *observation room* looks at a shipped release with REA and writes
   behaviour, layout and design-role descriptions in plain words into `docs/spec/`.
   The *build room* (`kits/studio/`) works only from those spec files.
2. **No source, ever.** The upstream repository's source tree is not opened, cloned or
   searched. Only the published release binary is analysed.
3. **Recovered bytes stay in the scratch area.** Recovered bundles, decompiled modules,
   screenshots of the upstream app and its images, video, fonts or icons are never
   committed. The repository holds descriptions and evidence identifiers only.
4. **Describe roles, not values.** The spec says "dark neutral panel slightly lighter
   than the page" rather than quoting a hex value. The build room picks its own numbers.
5. **No upstream names in the product.** No logos, product names, model catalogues,
   API hosts or copy text leave the observation room.
6. **Every claim carries evidence.** Each spec section names the REA evidence it rests on
   (see the ledger below), so a reviewer can trace it back to the shipped artifact.
7. **Analysis never phones home.** Captures run offline against a loopback copy of the
   recovered frontend with an inert IPC stub; analytics scripts are removed first and
   every remote request is answered locally.

## Evidence ledger: ArtCraft 0.41.0

Target: the ArtCraft desktop app, GitHub release `artcraft-v0.41.0` (2026-09-26),
Apache-2.0. Captured 2026-10-26 with REA.

| Step | Tool | Subject | Evidence |
| --- | --- | --- | --- |
| Download | `gh release download` | `ArtCraft_universal.app.tar.gz` | sha256 `812d7b4e…0d673` |
| Bundle inventory | `inspect_artifact` | `ArtCraft.app` | `ev_13768c32…0693a` |
| Thin slice | own script (FAT header split) | x86_64 Mach-O | sha256 `73e7d8a0…aa3b` |
| Toolchain | `inspect_rust_binary` | x86_64 slice | `ev_eee41bab…7f4a` |
| Frontend recovery | own script (Tauri asset table + brotli) | 203 embedded assets | n/a |
| Static JS graph | `analyze_javascript_application` | recovered frontend | `ev_6918157c…1e68` (partial: worker heap limit on the 9 MB main chunk) |
| Home + Create Image | `capture_browser_scenario` | loopback copy | `ev_6f023148…7e06` |
| Canvas, 3D stage, video editor | `capture_browser_scenario` | loopback copy | `ev_b33c865b…217f` |
| Canvas size dialog, settings | `capture_browser_scenario` | loopback copy | `ev_130c9684…0f9d` |

### How the frontend was recovered

The Windows installer is NSIS, which REA cannot unpack, so the macOS universal app was
used. A Tauri app embeds its web frontend inside the executable as a table of
`(path, bytes)` pairs, with the bytes brotli-compressed. The x86_64 slice was split out
of the universal binary. A small script then walked every segment for 8-byte-aligned
`(key ptr, key len, value ptr, value len)` tuples whose key is a `/`-prefixed path, and
decompressed each value. That produced 203 files: `index.html`, one 9 MB React chunk,
one 160 KB stylesheet, a WASM module and media.

The recovered `index.html` loads two analytics scripts. Both were stripped from the
loopback copy before any capture.
