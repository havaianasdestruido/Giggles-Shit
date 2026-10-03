---
title: Media library
description: All images bundled in the repository — ready to use as GAS emoji.
sidebar_position: 5
---

# Media library

The repository keeps every image under
[`res/img/`](https://github.com/havaianasdestruido/Giggles-Shit/tree/main/res/img). Anything here
can be used as a GAS emoji by referencing its raw URL — see
[Adding custom emoji](../guides/custom-emojis.md). The raw URL pattern is:

```text
https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/refs/heads/main/res/img/<file>
```

## Bundled in `DEFAULT_GAS`

These twelve ship out of the box:

<div className="gas-emoji-grid">
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/84.jpeg').default} alt="84" />
    <code>84</code>
  </div>
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/boo.gif').default} alt="boo" />
    <code>boo</code>
  </div>
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/bulleh.jpg').default} alt="bulleh" />
    <code>bulleh</code>
  </div>
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/crine.jpg').default} alt="crine" />
    <code>crine</code>
  </div>
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/fire.jpeg').default} alt="fire" />
    <code>fire</code>
  </div>
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/hmm.webp').default} alt="hmm" />
    <code>hmm</code>
  </div>
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/rose.jpg').default} alt="rose" />
    <code>rose</code>
  </div>
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/skull.jpg').default} alt="skull" />
    <code>skull</code>
  </div>
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/trollge.jpg').default} alt="trollge" />
    <code>trollge</code>
  </div>
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/wet.webp').default} alt="wet" />
    <code>wet</code>
  </div>
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/woah.webp').default} alt="woah" />
    <code>woah</code>
  </div>
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/yeah.webp').default} alt="yeah" />
    <code>yeah</code>
  </div>
</div>

`res/img/84.jpeg` · `res/img/boo.gif` · `res/img/bulleh.jpg` · `res/img/crine.jpg` ·
`res/img/fire.jpeg` · `res/img/hmm.webp` · `res/img/rose.jpg` · `res/img/skull.jpg` ·
`res/img/trollge.jpg` · `res/img/wet.webp` · `res/img/woah.webp` · `res/img/yeah.webp`

:::caution
`trollge` is load-bearing: the toolbar button icon is the entry named `trollge`. Keep it (or keep
the name) if you reshuffle the array.
:::

## Extra stills

Already in the repo, but **not** wired into `DEFAULT_GAS` by default:

<div className="gas-emoji-grid">
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/labubudubaichocolatematcha.jpg').default} alt="labubudubaichocolatematcha" />
    <code>labubudubaichocolatematcha</code>
  </div>
</div>

`res/img/labubudubaichocolatematcha.jpg` — add it with:

```js
{
    name: 'labubu',
    url: 'https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/refs/heads/main/res/img/labubudubaichocolatematcha.jpg'
},
```

## Animated GIFs

From [`res/img/gifs/`](https://github.com/havaianasdestruido/Giggles-Shit/tree/main/res/img/gifs):

<div className="gas-emoji-grid">
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/funkycat.gif').default} alt="funkycat" />
    <code>funkycat.gif</code>
  </div>
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/funni.gif').default} alt="funni" />
    <code>funni.gif</code>
  </div>
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/nyan.gif').default} alt="nyan" />
    <code>nyan.gif</code>
  </div>
  <div className="gas-emoji-card">
    <img src={require('@site/static/img/emojis/wave.gif').default} alt="wave" />
    <code>wave.gif</code>
  </div>
</div>

Example:

```js
{
    name: 'nyan',
    url: 'https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/refs/heads/main/res/img/gifs/nyan.gif'
},
```

GIFs animate fine in the 20px inline rendering — GitHub serves them through its Camo proxy
without flattening animation.

## Screenshots

[`screenshots/`](https://github.com/havaianasdestruido/Giggles-Shit/tree/main/screenshots) holds
the demo GIF used by the README and this documentation — not an emoji, but feel free to reuse it
when showing GAS off.
