---
title: Adding custom emoji
description: Extend GAS with your own images by editing the DEFAULT_GAS array.
sidebar_position: 2
---

# Adding custom emoji

GAS ships with twelve bundled emoji, but the source list is intentionally trivial to extend.
Everything flows from one array in
[`gas.userscript.js`](https://github.com/havaianasdestruido/Giggles-Shit/blob/main/gas.userscript.js):

## The `DEFAULT_GAS` array

Near the top of the script (the `CONFIG` section):

```js title="gas.userscript.js — CONFIG"
const DEFAULT_GAS = [
    {
        name: 'bulleh',
        url: 'https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/refs/heads/main/res/img/bulleh.jpg'
    },
    // ... 84, boo, crine, fire, hmm, rose, skull, trollge, wet, woah, yeah
];
```

Each entry is a plain object:

| Field | Type | Meaning |
|---|---|---|
| `name` | `string` | Label shown in the picker card, used as the `<img alt>` text and in the `Inserted <name>` toast. |
| `url`  | `string` | Absolute `https://` URL of the image. Used for both the picker thumbnail and the inserted tag. |

## Add your own

1. In your userscript manager, open the GAS script for editing.
2. Add an entry to `DEFAULT_GAS`:

```js
{
    name: 'labubu',
    url: 'https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/refs/heads/main/res/img/labubudubaichocolatematcha.jpg'
},
```

3. Save. Reload any GitHub page — the picker now shows the new card. Done.

:::tip GIFs work too
The repo keeps animated options in [`res/img/gifs/`](https://github.com/havaianasdestruido/Giggles-Shit/tree/main/res/img/gifs)
(`funkycat.gif`, `funni.gif`, `nyan.gif`, `wave.gif`). Reference them the same way —
the whole [media library](../reference/media-library.md) is there to be used.
:::

## Rules of thumb

- **Use absolute HTTPS URLs.** Relative URLs would break because the inserted `<img>` is rendered
  by github.com, not by your script. `raw.githubusercontent.com` URLs of files committed to the
  repo are the canonical pattern.
- **Any image GitHub renders works** — JPG/PNG/GIF/WebP. GitHub proxies hotlinked images through
  Camo, so external hosts work too, but repo-hosted images are the most reliable.
- **Size doesn't matter (much).** Full-size images are downscaled by the `width="20px"` attribute,
  both in the inserted tag and (via CSS) in the picker. For snappier renders prefer small files.
- **Name uniqueness** isn't enforced, but duplicate names make toasts/alt-text ambiguous — keep
  them unique and short.
- The grid auto-sizes (`minmax(72px, 1fr)` columns), so adding many emoji just wraps onto more
  rows — no extra styling needed.

## What you cannot change (without more edits)

- The picker is **not user-extensible at runtime** — there is no settings UI and no
  `localStorage` persistence. All customization happens by editing the script.
- The inserted tag is always `<img src="{url}" alt="{name}" width="20px">` — see
  [`createImageHTML`](../reference/api.md#createimagehtml) if you want a different width/format.
- The toolbar button icon is hardcoded to the entry whose `name === 'trollge'` — rename/remove it
  and `createGASButton()` throws (`icon.url` of `undefined`). See
  [Troubleshooting](./troubleshooting.md#the-toolbar-button-throws-after-i-edited-default_gas).

## Persisting across updates

If you installed via the raw URL, upstream updates overwrite your edits. Options:

- fork the repo and update your manager's URL to your fork, or
- keep a local copy (manual install) and re-apply your `DEFAULT_GAS` additions when updating.
