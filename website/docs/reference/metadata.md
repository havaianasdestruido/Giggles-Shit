---
title: Userscript metadata
description: The ==UserScript== header block of gas.userscript.js, field by field.
sidebar_position: 4
---

# Userscript metadata

Every userscript starts with a `==UserScript==` block that tells the manager how to run it. This
is GAS's exact header:

```js title="gas.userscript.js"
// ==UserScript==
// @name         Giggles&Shit (GAS)
// @namespace    https://github.com/havaianasdestruido/Giggles-Shit
// @version      2.3.0
// @description  Giggles&Shit emoji/image picker for GitHub
// @author       havaianasdestruido
// @match        https://github.com/*
// @match        https://gist.github.com/*
// @icon         https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/refs/heads/main/res/img/trollge.jpg
// @grant        none
// @run-at       document-idle
// ==/UserScript==
```

## Field-by-field

| Directive | Value | Why it matters |
|---|---|---|
| `@name` | `Giggles&Shit (GAS)` | Display name in the manager's dashboard. |
| `@namespace` | repo URL | Distinguishes this script from same-named ones; doubling as the canonical home link. |
| `@version` | `2.3.0` | Managers compare it during auto-update checks — **bump it on every release** or users won't get updates. Mirrored inside the code as `GAS_VERSION`. |
| `@description` | … | Shown on install dialogs. |
| `@author` | `havaianasdestruido` | Attribution. |
| `@match` | `https://github.com/*`<br/>`https://gist.github.com/*` | Injection rules: the script runs on **every** github.com page (needed because comment editors live on issues, PRs, discussions, …) and on every gist.github.com page (gist comments have the same formatting toolbar). Two separate lines because they're different hosts — see note below. |
| `@icon` | `res/img/trollge.jpg` (raw URL) | Icon shown in the manager UI — the trollge, obviously. |
| `@grant` | `none` | Requests **zero** privileged `GM_*` APIs; the script runs with plain page privileges. This keeps the install dialog permission-free. |
| `@run-at` | `document-idle` | Executes after the DOM is ready. The in-code bootstrap still handles the `readyState === 'loading'` edge for managers that fire early. |

## Notable absences

- **No `@require` / `@resource`** — zero external JS dependencies. The only network hits at
  runtime are the emoji images themselves.
- **No `@connect`** — nothing performs XHR, so no hosts need to be whitelisted.
- **No `@updateURL` / `@downloadURL`** — installed from the raw GitHub URL, managers infer
  update/download locations from it.
- **No `@noframes`** — GitHub editor usage lives in the top document; if embedded-frame issues
  ever appear, this is the directive to consider.

## `@match` vs gist.github.com

`https://github.com/*` does **not** cover `https://gist.github.com/*` (different host), so GAS
carries a second `@match` line for it:

```diff
 // @match        https://github.com/*
+// @match        https://gist.github.com/*
```

Gist's comment box renders the same `[role="toolbar"]` formatting toolbar as github.com, but its
textarea doesn't always carry the same `placeholder`/`aria-label`/`name` wording GAS looks for on
github.com. [`isEditor`](./api.md#iseditor) handles this with a fallback: if none of the attribute
heuristics match, it still treats a `<textarea>` as an editor when its enclosing `<form>` contains
a real formatting toolbar — scoped to the form (rather than an unbounded ancestor walk) so it
can't accidentally match an unrelated toolbar elsewhere on the page.
