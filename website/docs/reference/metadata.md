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
// @version      2.2.0
// @description  Giggles&Shit emoji/image picker for GitHub
// @author       havaianasdestruido
// @match        https://github.com/*
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
| `@version` | `2.2.0` | Managers compare it during auto-update checks — **bump it on every release** or users won't get updates. Mirrored inside the code as `GAS_VERSION`. |
| `@description` | … | Shown on install dialogs. |
| `@author` | `havaianasdestruido` | Attribution. |
| `@match` | `https://github.com/*` | Injection rule: the script runs on **every** github.com page (needed because comment editors live on issues, PRs, gists, discussions, …). Excludes gist.github.com and other subdomains — see note below. |
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

`https://github.com/*` does **not** cover `https://gist.github.com/*` (different host). Extending
coverage is a single-line change:

```diff
 // @match        https://github.com/*
+// @match        https://gist.github.com/*
```

Just verify the editor/toolbar heuristics tolerate gist markup before shipping it (see
[`isEditor`](./api.md#iseditor) and [`findToolbar`](./api.md#toolbar)).
