---
title: Debug API (window.GAS)
description: The window.GAS console API exposed by the userscript for live debugging.
sidebar_position: 3
---

# Debug API — `window.GAS`

GAS exposes a deliberately small console API so anyone (users filing bug reports, contributors
hacking on the script) can probe its live state from DevTools. The startup banner advertises it:

```js
[GAS] Debug API available as window.GAS
[GAS] Try: GAS.scan()
[GAS] Try: GAS.editors()
[GAS] Try: GAS.buttons()
[GAS] Try: GAS.testButton()
```

## Reference

| Member | Type | Description |
|---|---|---|
| `GAS.version` | `string` | Current script version (`'2.2.0'`). |
| `GAS.version()` | `function → string` | Same value as a function call (both forms exist). |
| `GAS.gas()` | `function → Array<{name, url}>` | Copy of the `DEFAULT_GAS` emoji catalog. |
| `GAS.scan()` | `function → HTMLElement[]` | Forces an immediate editor scan + button injection (bypasses the 100 ms debounce). Returns detected editors. |
| `GAS.editors()` | `function → HTMLElement[]` | Lists candidate editors; also prints a `console.table` (index, tag, id, className, placeholder, ariaLabel, `processed`, `visible`). |
| `GAS.buttons()` | `function → HTMLButtonElement[]` | Lists injected toolbar buttons ([data-gas-button="true"]) with a `console.table` (index, title, `connected`). |
| `GAS.testButton()` | `function → HTMLElement \| null` | Opens the picker for the first **visible** editor, as if the toolbar button was clicked. Returns the button, or `null` (with a warning) if no visible editor/button exists. |
| `GAS.close()` | `function` | Closes the picker (same as pressing `Esc`). |

## Recipes

**The button vanished after GitHub navigated — rescan:**

```js
GAS.scan();
```

**Screenshot-ready state dump for a bug report:**

```js
GAS.version;      // '2.2.0'
GAS.editors();    // table of candidate editors
GAS.buttons();    // table of injected buttons
```

**Smoke-test the whole flow without clicking:**

```js
GAS.testButton(); // picker should open next to the first visible editor
GAS.close();
```

**Check the emoji catalog the picker renders:**

```js
console.table(GAS.gas());
```

## Notes

- `window.GAS` is the **only** global the script creates (everything else is trapped in the IIFE).
- All methods are safe to call repeatedly; `scan()` and `GAS.editors()` are read-mostly (scan may
  inject missing buttons — that's its job), and dedupe is handled by
  [`injectButton`](./api.md#toolbar).
- `GAS.version` existing as both a property and a function is quirky but intentional — both
  `GAS.version` and `GAS.version()` work in console auto-complete habits.
