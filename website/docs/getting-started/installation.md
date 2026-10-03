---
title: Installation
description: Install the Giggles&Shit userscript with Tampermonkey, Violentmonkey or Greasemonkey.
sidebar_position: 1
---

# Installation

GAS is distributed as a single [userscript](https://en.wikipedia.org/wiki/Userscript):
[`gas.userscript.js`](https://github.com/havaianasdestruido/Giggles-Shit/blob/main/gas.userscript.js).
You need a userscript manager (a browser extension) to run it.

## Step 1 — Install a userscript manager

Pick one for your browser (any of these work — GAS requests no special privileges):

| Manager | Chrome / Edge | Firefox | Safari |
|---|---|---|---|
| [Tampermonkey](https://www.tampermonkey.net/) | ✅ | ✅ | ✅ |
| [Violentmonkey](https://violentmonkey.github.io/) | ✅ | ✅ | ✅ |
| [Greasemonkey](https://www.greasespot.net/) | — | ✅ | — |
| [Apple Userscripts](https://apps.apple.com/app/userscripts/id1463298887) | — | — | ✅ |

GAS uses `@grant none`, so it runs in page context and needs **no extended permissions**.

## Step 2 — Install the script

Open the raw file — every manager detects the `.user.js` suffix and shows an
install dialog (the `#.user.js` fragment below guarantees that match; fragments aren't sent to the
server, so the same file downloads):

**[➡ Install Giggles&Shit (raw userscript)](https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/main/gas.userscript.js#.user.js)**

Click **Install** in your manager's dialog. That's it — there is no build step, no configuration,
and nothing else to download.

:::info Manual install
You can also create a new userscript in your manager and paste the full contents of
[`gas.userscript.js`](https://github.com/havaianasdestruido/Giggles-Shit/blob/main/gas.userscript.js)
into it.
:::

## Step 3 — Verify it works

1. Open any GitHub page with a markdown editor — e.g. [open a new issue](https://github.com/havaianasdestruido/Giggles-Shit/issues/new).
2. Look at the editor's formatting toolbar (the row with **B**, *I*, link, ...). A **trollge
   button** should appear at the end of it.
3. Open your browser DevTools console. You should see the GAS banner:

```
[GAS] ==============================
[GAS] Starting GAS v2.3.0...
[GAS] URL: https://github.com/havaianasdestruido/Giggles-Shit/issues/new
[GAS] Debug API available as window.GAS
[GAS] Try: GAS.scan()
```

If the button is missing, see [Troubleshooting](../guides/troubleshooting.md).

## Updating

Userscript managers check for updates automatically (the script header carries a `@version`
field, currently **2.3.0**). If you installed by copy-paste, repeat Step 2 and overwrite the old
script code.

## Uninstalling

Remove or disable the script from your userscript manager's dashboard. GAS stores **nothing** in
`localStorage`/`cookies` and leaves no residue behind.
