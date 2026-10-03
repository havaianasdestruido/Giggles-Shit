---
slug: /
title: Introduction
description: Giggles&Shit (GAS) — a userscript that adds a custom emoji/image picker to GitHub's markdown editors.
sidebar_position: 1
---

# Giggles&Shit documentation

**Giggles&Shit** (**GAS** for short) is a userscript for custom emojis on GitHub. It injects a small
button into the formatting toolbar of GitHub's markdown editors (issues, pull requests, comments,
gists, ...) that opens an image picker. Picking an image inserts a 20px `<img>` right where your
cursor is:

![Giggles&Shit demo](pathname:///img/demo.gif)

- **Current version:** 2.2.0
- **Runs on:** `https://github.com/*`
- **Permissions:** none (`@grant none`)
- **Bundled emoji:** bulleh, crine, rose, skull, trollge (+ more images in the repo you can wire up yourself)

```html
<!-- This is what gets inserted when you pick "trollge" -->
<img src="https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/refs/heads/main/res/img/trollge.jpg" alt="trollge" width="20px">
```

## How it works, in one paragraph

GAS is a single file — [`gas.userscript.js`](https://github.com/havaianasdestruido/Giggles-Shit/blob/main/gas.userscript.js)
— wrapped in an IIFE. On page load it scans the DOM for markdown editors
(`textarea` and `contenteditable` elements), finds the nearest formatting toolbar, and appends a
trollge button to it. A `MutationObserver` keeps watching for editors added later (GitHub is a
single-page app), with a 100&nbsp;ms debounce so it stays cheap. Clicking the button opens a lazy singleton
picker positioned next to it; choosing an image splices an `<img>` tag into the editor using the
native setter trick so GitHub's internal state stays in sync. A debug API is exposed as `window.GAS`.
See [Architecture](./reference/architecture.md) for the full breakdown.

## Where to next?

- **Use it:** [Installation](./getting-started/installation.md) → [Quick start](./getting-started/quick-start.md)
- **Customize it:** [Adding your own emoji](./guides/custom-emojis.md)
- **Understand it:** [Technical reference](./reference/architecture.md) · [Function reference](./reference/api.md)
- **Debug it:** [`window.GAS` debug API](./reference/debug-api.md) · [Troubleshooting](./guides/troubleshooting.md)
- **Hack on it:** [Contributing](./contributing.md)

:::tip Looking for the main website?
This site is documentation only, served under `/docs`. Head back to the
[main website](https://havaianasdestruido.github.io/Giggles-Shit/) for the landing page, feature overview and FAQ.
:::
