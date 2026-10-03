---
title: Changelog
description: Version history of the Giggles&Shit userscript.
sidebar_position: 21
---

# Changelog

Version numbers come from the `@version` userscript header (mirrored in code as `GAS_VERSION`)
and drive the managers' auto-update checks.

## 2.2.0 — current

The version documented by this site. Highlights of the current codebase:

- Five bundled emoji (`bulleh`, `crine`, `rose`, `skull`, `trollge`) served from the repo's
  `res/img/` directory.
- Toolbar button injected into GitHub's formatting toolbar (`[role="toolbar"]`), with dedupe via
  `data-gas-button` / `data-gas-processed`.
- Lazy singleton picker (`.gas-picker`) with viewport-clamped positioning and flip-upward
  fallback.
- Dual editor support: `textarea` (React-safe native setter + `input`/`change` events) and
  `contenteditable` (Range insertion + `InputEvent('insertElement')`).
- SPA-aware re-scanning via `MutationObserver` with a 100 ms debounce.
- Dismissal: Esc, outside click, scroll, resize. Toast feedback on every insertion (1400 ms).
- `window.GAS` debug API: `version`, `gas()`, `scan()`, `editors()`, `buttons()`, `testButton()`,
  `close()`.

For the full prehistoric record, consult
[`git log -- gas.userscript.js`](https://github.com/havaianasdestruido/Giggles-Shit/commits/main/gas.userscript.js).

## Upcoming / ideas

Non-binding list of natural directions — contributions welcome:

- more default emoji from the [media library](./reference/media-library.md) (the GIFs are sitting
  right there),
- gist.github.com coverage (one `@match` line, see [metadata](./reference/metadata.md)),
- settings UI for user-managed emoji (would need a storage grant — trade-off vs `@grant none`).
