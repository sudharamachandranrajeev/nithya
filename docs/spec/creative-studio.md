# Spec: creative studio shell

Written in the observation room from ArtCraft 0.41.0 (see
[clean-room.md](../clean-room.md) for the evidence ledger). It describes what a user sees
and does. The build room implements it with Nithya's own tokens, names and copy.

## 1. Stack observed

Evidence: `ev_eee41bab`, `ev_6918157c`, recovered asset inventory.

- Desktop shell: Tauri 2 (Rust host, system webview). One window with a custom title bar
  (window controls drawn by the app, not the OS).
- Frontend: React single-page app, utility-class CSS (Tailwind) with a semantic colour
  layer, a 2D scene-graph canvas library (Konva) for image editing, three.js for 3D,
  a WASM module for video timeline work, and an icon set of rounded line icons.
- The host exposes about 47 IPC commands: generation (image, video, audio, mesh,
  splat), cost estimates per media kind, a task queue, account, credits and
  subscription, provider ordering, app preferences, and downloads.
- Network calls go through the host's HTTP plugin when running in the desktop shell,
  and through `fetch` in a browser, behind one wrapper.

## 2. Theme model

Evidence: recovered stylesheet.

- Two layers of colour roles:
  1. **Surface roles** that make up the app chrome: page background, panel, panel
     border, modal, controls (buttons, inputs), controls border, foreground text,
     divider, badge alpha, and photo tint/grayscale used to quiet background imagery.
  2. **Component roles** in the shadcn style: background, foreground, card, popover,
     primary, secondary, muted, accent, destructive, border, input, ring. Each comes
     with a matching "on" foreground.
- Themes are swapped by a class on the root element that rebinds the surface roles.
  Six themes: default dark neutral, light, gray (flatter borders), pure black,
  a blue-teal gradient, and a violet-orange gradient. The gradient themes set the
  page and modal backgrounds to layered radial gradients, not flat colours.
- A single saturated blue is the only brand accent: primary buttons, selected
  states, focus rings, links and the progress indicator.
- Typography: a geometric display face for headings (very large, tight tracking on
  hero titles) and a humanist sans for body and controls.
- Corner radius steps: 2, 4, 6, 8, 12, 16, 24 px and full pill. Cards use 16, dialogs 16
  to 24, buttons 8 to 12, mode switcher and chips use pill.
- All app text is non-selectable (`user-select: none`), as in a native tool.

## 3. App shell

Evidence: `ev_6f023148`, `ev_b33c865b`.

- **Top bar**, full width, about 56 px tall, transparent over the page with a 1 px divider
  under it.
  - Left: a **mode switcher**, a pill-shaped group of six icon-only buttons: Home, Image,
    Video, Audio, Canvas (2D edit), Stage (3D). The active one gets a filled pill with a
    primary-coloured ring.
  - Centre: app mark plus the current context title (app name on Home; tool name or a
    breadcrumb such as "Edit Scene / <scene name>" with a rename affordance elsewhere).
    Some modes add view toggles (grid/list) beside the title.
  - Right: credits indicator, a primary "Upgrade" button, then square icon buttons
    (share/export, settings), a labelled "Library" button, a task-queue button, and the
    three window controls.
  - The whole bar is a window drag region; buttons opt out.
- **Floating corner actions**, bottom right on tool screens: "Costs" and "Help" chips.
- **Gap noted:** the icon-only buttons in the mode switcher and right cluster have no
  accessible names. Nithya requires a label (tooltip plus semantics) on every icon
  button.

## 4. Screens

### 4.1 Home (launcher)

- Centred hero: a two-line headline in the display face at about 64 px, with one word
  in the brand accent, and a muted one-line subtitle.
- Sections with small headings ("Create", "Edit"). Each holds a 3-column grid of
  **tool cards**.
- Tool card: rounded 16 px, background = controls at about half opacity, brightening on
  hover. Left: a 44 px rounded-square icon tile whose tint is a per-tool hue (blue,
  amber, pink, green, sky, lime, slate, violet, red, teal) at low alpha, with the icon
  in that hue. Then a bold title, an optional status badge (NEW = teal, BETA = amber,
  SOON = neutral, which also disables the card) and a one-line muted description. A
  right arrow at the top right.

### 4.2 Generate (image / video / audio)

- Full-bleed page with a dimmed, desaturated photo backdrop (this is what the
  photo-tint and grayscale roles are for).
- Centred empty state: a large display title with a subtitle.
- **Prompt dock** pinned to the bottom centre, about 990 px wide, rounded 16 px, panel
  background:
  - Row 1: a dashed square "add reference" slot, a multi-line prompt field with a
    placeholder, an expand button and a character counter.
  - Row 2: chips for model, aspect ratio and resolution on the left; on the right a
    clear button, a batch-count control and a round primary send button (disabled until
    there is text).
  - A collapse chevron under the dock.
- Settings decide whether Enter submits; Shift+Enter always adds a newline.

### 4.3 Canvas (2D edit)

- Empty state: a large dashed drop zone (rounded 16 px, about 1020 by 570 px), a 128 px
  rounded icon tile tinted with primary, a title, a hint and three buttons: a primary
  upload button plus two secondary buttons ("from library", "blank canvas").
- "Blank canvas" opens a **size picker dialog**: groups (Square, Landscape, Portrait),
  each a row of selectable tiles that show a proportional white rectangle and a size
  label. Footer: secondary Cancel and primary Create (disabled until a tile is
  chosen).

### 4.4 Stage (3D)

- Full-bleed viewport with a perspective grid floor and a camera gizmo.
- Top-left toolbar: File menu button, Outliner toggle, Shortcuts.
- Top centre: a **segmented pill** with two modes, Build and Record.
- Below that, a **floating tool palette**: an add (+) primary square, a snap toggle,
  then Move / Rotate / Scale as icon+label buttons (the active one is outlined in
  primary), a divider and a World/Local space toggle.
- Top right: viewport options, aspect-ratio chip, save/sign-in chip.
- Left: a docked **outliner panel**, a rounded panel with a title, an "Add" action and
  close, listing scene objects. Each row has an icon, name and type, and hover actions
  (look through, lock, hide).
- Bottom centre: a **transport bar** with play, current time, a scrubber and duration,
  plus an expand-timeline chevron.

### 4.5 Video editor

- First run shows a centred coach-mark dialog ("welcome", short explanation, primary
  Next) over a blurred editor.
- Layout: a project title row with a primary Export button; a left media bin with
  vertical tab icons; a centre preview; a right properties panel with an empty state;
  a full-width timeline below with a toolbar, ruler and playhead in primary.

### 4.6 Settings

- Modal about 770 by 560 px. Left: a navigation list with an icon and label per section
  (General, Downloads, Accounts, Plan and credits, Appearance, Keybinds, Alerts,
  About). The selected item gets a controls-coloured pill. Right: the section title and
  a stack of settings.
- Setting row: bold title, muted multi-line explanation, a switch under it. The switch
  is a pill track that turns primary when on.
- The modal has a close button top right and a 1 px divider under the header.

## 5. Interaction patterns

- Dialogs dim the app with a black scrim at about 80%. The first-run sign-up dialog is a
  two-pane card: a form on the left, a promo video on the right.
- Form fields: label above, dark filled input, rounded 12 px, password reveal icon
  inside the field.
- Primary buttons are full-pill on forms and rounded 8 to 12 px in toolbars.
- Status is shown by a credits pill and a task-queue button; generations run as tasks
  with states pending, started, attempt failed, complete success, complete failure,
  dead and cancelled.
- The Ctrl (Cmd) key held alone shows a keyboard-shortcut cheat sheet in the editors.
- Model pickers group models by family by default (a setting can flatten them).
