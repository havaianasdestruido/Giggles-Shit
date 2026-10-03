---
title: Function reference
description: Every internal function of gas.userscript.js — signatures, behavior and edge cases.
sidebar_position: 2
---

# Function reference

Internal functions of the GAS IIFE, grouped by section. None of these are exported; the public
surface is [`window.GAS`](./debug-api.md). Line numbers drift with edits, so navigate by section
comment headers (`// ===== SECTION =====`) in the source.

## Configuration & state {#config}

### `GAS_VERSION` / `REPO_URL` / `DEFAULT_GAS` _(constants)_

```js
const GAS_VERSION = '2.3.0';
const REPO_URL = 'https://github.com/havaianasdestruido/Giggles-Shit/issues/new';
const DEFAULT_GAS = [ { name, url }, /* … */ ];
```

- `GAS_VERSION` — reported in the startup banner and by `GAS.version()`.
- `REPO_URL` — logged in the startup banner so a console screenshot always contains a link to file
  bug reports (the `/issues/new` endpoint).
- `DEFAULT_GAS` — the emoji catalog; full schema in [Custom emoji](../guides/custom-emojis.md)
  and the bundled assets in the [media library](./media-library.md).

### `state` _(object)_

Single mutable store — see the [state table](./architecture.md#state).

## Logging {#logging}

### `log(...args)` · `warn(...args)` · `error(...args)`

Thin wrappers over `console.log/warn/error` that prefix output with a styled `%c[GAS]%c` badge:

| Function | Console method | Badge color |
|---|---|---|
| `log` | `console.log` | `#f85149` (red) |
| `warn` | `console.warn` | `#d29922` (amber) |
| `error` | `console.error` | `#ff7b72` (light red) |

Everything the script does (startup, scans, injections, inserts) flows through these — grep the
console for `[GAS]` to see the world through its eyes.

## Styles {#styles}

### `installStyles()`

- Injects one `<style id="gas-styles">` into `<head>` with all CSS for the toolbar button, picker,
  grid items, animations and toast. Skips injection if `#gas-styles` already exists (idempotent).
- Styling highlights: picker is `position: fixed`, uses the GitHub Primer scale (`8`/`12` px
  radii/shadows), `max-width/max-height` of `calc(100vw|vh - 24px)`; grid is
  `repeat(auto-fill, minmax(72px, 1fr))`; open/close uses `translateY`/`scale` keyframe animations;
  the toast is bottom-center, `translateX(-50%)`, with a slide-up entrance.
- Ends with `log('Styles installed.')`.

## Utilities {#utilities}

### `isVisible(element) → boolean`

`false` for nullish input; otherwise checks `getBoundingClientRect()` is non-zero **and** computed
`display !== 'none'` **and** `visibility !== 'hidden'`. Used by `GAS.testButton()` to pick a
sensible editor and by the debug table.

### `isEditor(element) → boolean` {#iseditor}

Decides whether a DOM node is a GAS-compatible editor:

1. Must be an `HTMLElement`.
2. `<textarea>` → heuristics on its attributes — matches if **any** of:
   - `placeholder` matches `/description|comment/i` ("Add a description…", "Leave a comment…")
   - `aria-label` matches `/markdown|comment/i` ("Markdown value: …")
   - `name` matches `/description|comment|body/i`
   - none of the above match, but the element's enclosing `<form>` contains a
     `[role="toolbar"][aria-label*="Formatting"]` anyway — a fallback for hosts like
     gist.github.com whose comment textarea doesn't carry the same attribute wording as
     github.com. Scoping to the enclosing form (rather than an unbounded ancestor walk)
     avoids matching an unrelated toolbar elsewhere on the page.
3. Otherwise: `element.isContentEditable === true`.

These heuristics are the main place GitHub markup changes break GAS — see
[Troubleshooting](../guides/troubleshooting.md#the-toolbar-button-doesnt-appear).

## Editor value handling {#value}

### `setTextareaValue(textarea, value)`

Assigns `value` via the **`HTMLTextAreaElement.prototype` `value` setter**
(`Object.getOwnPropertyDescriptor(proto, 'value').set.call(...)`) instead of a plain assignment —
this bypasses any framework (React) property override — then dispatches bubbling, composed
`input` and `change` events so GitHub's controlled components pick the change up. Falls back to
plain assignment if the descriptor is unavailable.

## Image HTML {#createimagehtml}

### `createImageHTML(gas) → string`

```js
`<img src="${gas.url}" alt="${gas.name}" width="20px">`
```

The exact string spliced into textareas. **Note:** `name`/`url` are interpolated raw — emoji
definitions come from the trusted in-script array, but never wire untrusted input into
`DEFAULT_GAS` without escaping.

## Insertion {#insertion}

### `insertIntoTextarea(editor, html)`

1. Reads `selectionStart`/`selectionEnd` (defaults to end-of-value if not numbers).
2. `newValue = before + html + after` → `setTextareaValue(editor, newValue)`.
3. Collapses the caret to just after the inserted tag (`setSelectionRange`, try/catch guarded).
4. Refocuses the editor.

### `insertIntoContentEditable(editor, gas)`

1. Focuses the editor.
2. Builds a real `Image` node (`src`, `alt`, `width="20px"`).
3. No selection/range → `appendChild(image)` + bubbling `InputEvent('input', {inputType: 'insertElement'})`.
4. Otherwise: `range.deleteContents()` → `range.insertNode(image)` → caret moved after the image →
   selection collapsed → same `InputEvent` dispatched.

### `insertGAS(editor, gas)` {#insertgas}

The dispatch layer the picker's click handler calls:

- warns and returns if `editor` is null (`'No active editor.'`)
- `HTMLTextAreaElement` → `insertIntoTextarea(editor, createImageHTML(gas))`
- `editor.isContentEditable` → `insertIntoContentEditable(editor, gas)`
- anything else → `warn('Unsupported editor:', editor)` and abort
- on success: `showToast('Inserted ' + gas.name)`, `log(...)`, `closePicker()`

## Toast {#toast}

### `showToast(message)`

Appends a `div.gas-toast` to `<body>`; any previous toast is removed first (no stacking).
Self-removes after **1400 ms** via a shared `toastTimer` that is reset on each call.

## Picker {#picker}

### `createPicker() → HTMLElement`

Creates the picker **lazily** — if `state.picker` exists it is returned unchanged. Builds:

```text
div.gas-picker
├── div.gas-picker-header
│   ├── div.gas-picker-title        "Giggles&Shit"
│   ├── div.gas-picker-subtitle     "Choose a GAS image"
│   └── button.gas-picker-close     ×   (aria-label="Close GAS picker")
└── div.gas-grid
    └── button.gas-item × N         one per DEFAULT_GAS entry
        ├── img (lazy, error → opacity .35)
        ├── div.gas-item-name       gas.name
        └── div.gas-item-code       "<img width=\"20px\">"
```

Behavior wiring: item click → `insertGAS(state.activeEditor, gas)`; close click → `closePicker()`;
any internal click → `stopPropagation()` (so the outside-click handler doesn't close it).
Appended to `document.body`, cached in `state.picker`.

### `positionPicker(button)`

Positions the (displayed) picker against the toolbar button with an `8px` margin: prefers
below-left; clamps into the viewport horizontally; **flips above** the button when it would
overflow the bottom edge; finally clamps vertically. Recomputed on every open.

### `openPicker(editor, button)`

- Sets `state.activeEditor = editor`.
- If the picker's `data-open` is already `'true'` → acts as a toggle: `closePicker()` and return.
- Otherwise sets `data-open = 'true'`, `display: block`, calls `positionPicker(button)`, logs.

### `closePicker()`

Null-safe: sets `data-open = 'false'`, `display: none`, clears `state.activeEditor`.

## Button & toolbar {#toolbar}

### `createGASButton(editor) → HTMLButtonElement` {#creategasbutton}

- `<button type="button" class="gas-toolbar-button" data-gas-button="true">`, tooltip
  `Giggles&Shit`, `aria-label="Open Giggles&Shit"`.
- Icon: the `DEFAULT_GAS` entry where `name === 'trollge'`, rendered at 20×20, `draggable=false`.
  ⚠ Throws a `TypeError` if no entry is named `trollge` — see
  [Troubleshooting](../guides/troubleshooting.md#the-toolbar-button-throws-after-i-edited-default_gas).
- Click → `openPicker(editor, button)`.
- Registers itself in `state.buttons`.

### `findToolbar(editor) → HTMLElement | null`

Two strategies, in order:

1. `editor.closest('div[class*="Textarea"]')` → `parentElement.querySelector('[role="toolbar"]')`
   (GitHub's modern React editor wrapper).
2. Climb up to **8 ancestors** from `editor.parentElement`, looking for
   `[role="toolbar"][aria-label*="Formatting"]` (classic comment toolbar).

Returns `null` when neither matches.

### `injectButton(editor) → boolean`

- `false` if the editor or its toolbar is missing.
- `false` (and marks `editor.dataset.gasProcessed = 'true'`) if the toolbar already contains a
  `[data-gas-button="true"]` — **dedupe guarantee**.
- Otherwise appends a fresh `createGASButton(editor)` to the toolbar, marks the editor processed,
  adds it to `state.editors`, logs, `true`.

## Scanning & observing {#scanning}

### `findEditors() → HTMLElement[]`

`document.querySelectorAll('textarea, [contenteditable="true"]')` filtered through `isEditor()`.

### `scan() → HTMLElement[]`

Calls `injectButton()` on every candidate and logs
`Scan result: <n> editor(s), <m> button(s) handled.`

### `scheduleScan()`

Resets `state.scanTimer` and fires `scan()` after **100 ms** — the debounce used by the observer.

### `startObserver()`

Guarded singleton (`state.observer`). Watches `document.body` with
`{childList: true, subtree: true}`; on the first mutation with added nodes it calls
`scheduleScan()` and `break`s.

## Global event handlers {#handlers}

| Event | Bound on | Capture? | Behavior |
|---|---|---|---|
| `click` | `document` | yes | close picker when clicking outside picker/button |
| `keydown` (Escape) | `document` | yes | close picker |
| `resize` | `window` | (passive) | close picker if open |
| `scroll` | `window` | (passive) | close picker if open |

The open picker's own clicks are stopped from reaching the first handler; clicks with the Gas
toolbar button in their `closest()` chain are explicitly ignored.

## Init {#init}

### `init()`

Once-only (`state.initialized`). Sequence: banner (`[GAS] ===…`) → `Starting GAS v<version>` →
log `REPO_URL` → `installStyles()` → debug-usage hints → `pageDebug()` → `scan()` → per-editor
attribute dump (`tag`, `id`, `className`, `name`, `role`, `placeholder`, `aria-label`) →
`startObserver()` → `GAS initialization complete.`

### `pageDebug()`

Logs URL, title, and counts of textareas / contenteditables / buttons — the context needed to
debug markup mismatches from a screenshot alone.

### bootstrap

```js
if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init, { once: true });
else
    init();
```

Combined with `@run-at document-idle` this means GAS effectively starts as early as safely
possible on every Turbo navigation.
