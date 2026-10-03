---
title: Troubleshooting
description: Diagnose and fix common GAS problems — missing button, broken images, React state issues.
sidebar_position: 3
---

# Troubleshooting

GAS logs everything to the browser console with a colored `[GAS]` prefix. Open DevTools
(`F12` → Console) first — the answer is usually already there. The
[`window.GAS` debug API](../reference/debug-api.md) is your best friend below.

## The toolbar button doesn't appear

GitHub is a single-page app and its DOM changes frequently. Work through this checklist:

1. **Hard-reload the page** (`Ctrl/Cmd + Shift + R`) and look for the `[GAS] Starting GAS` banner
   confirming the script is running at all. No banner → the script isn't running: check your
   manager's toggle and that the URL matches `@match https://github.com/*`.
2. **Rescan manually**:

   ```js
   GAS.scan()
   // → array of detected editors; also logs
   //   "Scan result: N editor(s), M button(s) handled."
   ```

3. **Inspect what GAS sees:**

   ```js
   GAS.editors()   // console.table of every candidate editor
   GAS.buttons()   // console.table of injected buttons (check 'connected')
   ```

4. **Interpret the table.** If `GAS.editors()` returns an empty table on a page with a comment
   box, GitHub changed its markup and the [editor heuristics](../reference/api.md#iseditor) no
   longer match — please [open an issue](https://github.com/havaianasdestruido/Giggles-Shit/issues/new)
   with the console output (`GAS` also runs a `pageDebug()` dump on load).
5. If the editor is found but no button is injected, `findToolbar()` couldn't locate a formatting
   toolbar (it looks for `[role="toolbar"]` near the editor, or
   `[role="toolbar"][aria-label*="Formatting"]` up to 8 ancestors). Also a markup-change symptom —
   issue welcome.

:::info Why scanning is continuous
A `MutationObserver` on `document.body` triggers a debounced re-scan (100 ms) whenever nodes are
added. So the button should *eventually* appear — e.g. after lazy-loading a comment box. If it
never does, that's the heuristic mismatch above, not a timing problem.
:::

## The picker opens but images never load

- Check DevTools → **Network** for blocked `raw.githubusercontent.com` requests (ad blockers,
  corporate proxies and strict CSP extensions sometimes block it).
- Try opening the image URL directly in a new tab. GAS pulls emoji from
  `raw.githubusercontent.com/.../res/img/...`.

## An emoji image shows dimmed/broken

The picker sets `opacity: 0.35` on images that fire an `error` event. If a card is dimmed, its
URL is dead or unreachable. For bundled emoji this means the repo file moved — report it. For
custom entries, re-check your `url` ([Custom emoji](./custom-emojis.md)).

## The emoji inserts but disappears when editing / previewing

This means GitHub's internal state wasn't notified of the DOM change. GAS already handles it:

- for `textarea` editors it sets the value via the **native prototype setter** and then dispatches
  bubbling `input` **and** `change` events (`setTextareaValue`)
- for `contenteditable` editors it uses a `Range` insertion and dispatches a bubbling `InputEvent`
  with `inputType: 'insertElement'`

If you still see desync on some exotic editor, capture it with `GAS.editors()` and open an issue.

## The toolbar button throws after I edited `DEFAULT_GAS`

`createGASButton()` builds its icon by looking up the entry named **`trollge`**:

```js
const icon = DEFAULT_GAS.find(gas => gas.name === 'trollge');
image.src = icon.url; // TypeError if that entry is gone
```

If you renamed or deleted `trollge`, restore the entry (or keep one entry named `trollge` and
point `url` at whatever you like). Details in [API reference → createGASButton](../reference/api.md#creategasbutton).

## The picker closes "by itself"

That's by design — it closes on **scroll** and **resize** (its position would otherwise be stale),
and on **Esc** or any outside click. Repositioning is cheap, so just reopen it. See
[Using the picker](./using-the-picker.md).

## Duplicate buttons in one toolbar

Shouldn't happen: `injectButton()` skips toolbars that already contain a `[data-gas-button="true"]`
element and marks editors with `data-gas-processed="true"`. If you do see duplicates, two copies
of the script are running (e.g. installed in two managers, or pasted twice). Check
`GAS.buttons()` and your manager dashboards.

## Still stuck?

[Open an issue](https://github.com/havaianasdestruido/Giggles-Shit/issues/new) and include:

- the full `[GAS]` console log (from the banner down),
- output of `GAS.editors()` and `GAS.buttons()`,
- your browser + userscript manager versions,
- the GitHub page URL where it fails.
