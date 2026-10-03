---
title: Architecture
description: How gas.userscript.js is structured — the IIFE, state, lifecycle, DOM artifacts and editor strategy.
sidebar_position: 1
---

# Architecture

GAS is a **single ES5→modern-JS hybrid file** (≈1,800 lines) with zero dependencies, zero build
step, and zero granted privileges. Everything lives inside one
[IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) so nothing leaks into GitHub's
global scope except the intentional `window.GAS` debug handle.

```text title="gas.userscript.js — top-level layout"
// ==UserScript==  … metadata block (name, version, match, grant, run-at …)
(() => {
    'use strict';
    CONFIG            ← constants: GAS_VERSION, REPO_URL, DEFAULT_GAS
    STATE             ← the mutable `state` object
    LOGGING           ← log / warn / error  (colored [GAS] console output)
    STYLES            ← installStyles() — one <style id="gas-styles">
    UTILITIES         ← isVisible, isEditor
    EDITOR VALUE      ← setTextareaValue (native setter + events)
    HTML IMAGE        ← createImageHTML
    INSERT IMAGE      ← insertIntoTextarea, insertIntoContentEditable
    INSERT GAS        ← insertGAS  (dispatch layer)
    TOAST             ← showToast
    PICKER            ← createPicker  (lazy singleton .gas-picker)
    PICKER POSITION   ← positionPicker (viewport clamping / flip)
    OPEN / CLOSE      ← openPicker, closePicker
    GAS BUTTON        ← createGASButton (trollge toolbar button)
    TOOLBAR DETECTION ← findToolbar
    INJECT BUTTON     ← injectButton
    EDITOR SCANNER    ← findEditors, scan
    MUTATION OBSERVER ← scheduleScan (100 ms debounce), startObserver
    GLOBAL HANDLERS   ← outside-click · Escape · resize · scroll
    DEBUG API         ← window.GAS
    PAGE DEBUG        ← pageDebug
    INIT / START      ← init() guarded by state.initialized
})();
```

## Lifecycle

```text
userscript manager loads file  (@run-at document-idle)
        │
        ▼
if document.readyState === 'loading' ──► wait for DOMContentLoaded
        │ otherwise run immediately
        ▼
init()  ── guard: state.initialized? → return
        │  1. console banner  ("Starting GAS v2.2.0...", REPO_URL)
        │  2. installStyles() — inject all picker/button/toast CSS
        │  3. log debug-API hints (GAS.scan(), GAS.editors(), …)
        │  4. pageDebug() — dump URL/title/editor counts
        │  5. scan() — find editors, inject toolbar buttons
        │  6. log each detected editor's identifying attributes
        │  7. startObserver() — MutationObserver for future editors
        ▼
steady state: observer fires → scheduleScan() → (100 ms) → scan()
        ▼
user clicks toolbar button → openPicker(editor, button)
        │      createPicker() on first use (lazy singleton)
        ▼
user picks an emoji → insertGAS(activeEditor, gas)
        │      ├── HTMLTextAreaElement → insertIntoTextarea(html)
        │      └── contenteditable   → insertIntoContentEditable(gas)
        ▼
showToast("Inserted <name>") → closePicker()
```

## State

All mutable state sits in one object — the closest thing GAS has to a "store":

| Field | Type | Purpose |
|---|---|---|
| `state.editors` | `Set<HTMLElement>` | Editors that received a button. |
| `state.buttons` | `Set<HTMLButtonElement>` | Injected toolbar buttons (for debugging). |
| `state.activeEditor` | `HTMLElement \| null` | Where the next insertion goes; set on open, cleared on close. |
| `state.picker` | `HTMLElement \| null` | The singleton picker element, created on first open. |
| `state.observer` | `MutationObserver \| null` | Guard so the observer starts exactly once. |
| `state.scanTimer` | `number \| null` | Handle for the debounced scan timer. |
| `state.initialized` | `boolean` | Guard so `init()` runs exactly once. |

There is comprehensively **no persistence**: no `localStorage`, no `GM_*` APIs (`@grant none`),
no cookies. Refresh and everything is rebuilt from scratch.

## DOM artifacts

GAS only ever *adds* nodes; it never mutates GitHub's own DOM besides appending its button:

| Artifact | Selector | Where |
|---|---|---|
| Stylesheet | `<style id="gas-styles">` | `document.head` (once) |
| Toolbar button | `button.gas-toolbar-button[data-gas-button="true"]` | appended into `[role="toolbar"]` |
| Picker | `div.gas-picker[data-open]` | `document.body` (singleton) |
| Toast | `div.gas-toast` | `document.body` (auto-removed after 1400 ms) |
| Inserted image | `img[alt="<name>"][width="20px"]` | inside the editor / editor value |
| Editor marker | `data-gas-processed="true"` | on every handled editor |

## Two editor strategies

GitHub uses different editor implementations, so insertion is polymorphic:

1. **Textarea path** (issue/PR descriptions, most comment boxes): the literal string
   `<img src="…" alt="…" width="20px">` is spliced into `textarea.value` at
   `selectionStart`/`selectionEnd`, via the native `value` setter followed by `input` + `change`
   events — required for GitHub's React-driven forms to notice the change. The caret is restored
   after the inserted tag.
2. **Contenteditable path** (rich editors): a real `Image` node is inserted through the current
   `Selection`/`Range` (deleting any selected range first), caret collapsed after the image, and a
   bubbling `InputEvent('insertElement')` dispatched. No selection → appended to the editor.

Both paths end the same way: toast, log, `closePicker()`.

## Why a MutationObserver (and not polling)?

GitHub navigates with Turbo/pjax — full page loads are rare, so a one-shot scan would miss most
editors that appear later. The observer watches `document.body` for `childList`/`subtree` additions
and schedules one scan per burst (the loop `break`s after the first relevant mutation). The 100 ms
debounce collapses heavy DOM churn (large comment threads loading) into a single cheap rescan.

## Security / privacy posture

- `@grant none` → runs in page context, requests no privileged APIs.
- No network requests of its own — the only fetches are the emoji images your browser loads.
- No telemetry, no cookies, no storage; all state is in-page memory.
- The CSS is scoped to GAS's own classes to avoid leaking styles into GitHub (`.gas-*` prefix).
