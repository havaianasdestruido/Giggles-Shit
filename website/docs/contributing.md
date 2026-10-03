---
title: Contributing
description: How to report bugs, add emoji, and hack on gas.userscript.js.
sidebar_position: 20
---

# Contributing

GAS is small, single-file and dependency-free — contributing is refreshingly low-ceremony.

## Reporting bugs / requesting emoji

Open an issue: **[github.com/havaianasdestruido/Giggles-Shit/issues/new](https://github.com/havaianasdestruido/Giggles-Shit/issues/new)**
(also logged as `REPO_URL` in the startup banner).

A good bug report includes:

- the full `[GAS]` console log from page load,
- output of `GAS.version()`, `GAS.editors()` and `GAS.buttons()` (see the
  [debug API](./reference/debug-api.md)),
- browser + userscript manager + versions,
- the GitHub page URL and a screenshot of the editor area.

## Repository layout

```text
Giggles-Shit/
├── gas.userscript.js      ← the entire userscript (≈1,800 lines, no build step)
├── res/
│   └── img/
│       ├── *.jpg/*.webp   ← emoji art (84, boo, bulleh, crine, fire, hmm, rose, skull,
│       │                     trollge, wet, woah, yeah, …)
│       └── gifs/*.gif     ← animated emoji (funkycat, funni, nyan, wave)
├── screenshots/           ← demo GIF for README/docs
├── index.md, _config.yml, _layouts/, assets/   ← Jekyll primary website (/)
├── website/               ← this Docusaurus documentation site (/docs)
└── .github/workflows/     ← CI that builds both and deploys GitHub Pages
```

## Editing the userscript

1. Edit `gas.userscript.js` directly. There is no bundler, transpiler or linter — what you write
   is what runs.
2. Reload it in your userscript manager (Tampermonkey: just save, then refresh the GitHub tab).
3. Test on a mix of pages: issue create, PR conversation, PR review, file edit — the editor
   machinery differs between them.
4. Verify the console stays clean apart from deliberate `[GAS]` output, and run
   `GAS.testButton()` + a real insertion as a smoke test.

### Code style

The codebase has a distinctive style — vertical, one expression per line, section banners:

```js
// ============================================================
// SECTION NAME
// ============================================================

function doThing(
    param
) {
    const result =
        compute(
            param
        );
    return result;
}
```

Keep new code consistent with it: 4-space indent, single quotes, `===`, explicit braces, guard
clauses over nesting, and a `log`/`warn` for anything notable.

### Definition of done for a PR

- [ ] `@version` bumped (managers gate updates on it) — keep `GAS_VERSION` in sync.
- [ ] Works after Turbo/pjax navigation, not just on hard reload (the MutationObserver path).
- [ ] No new globals beyond `window.GAS`.
- [ ] No new permissions (`@grant none` is a feature).
- [ ] Docs updated under `website/docs/` if behavior changed.

## Editing this documentation

The docs source lives in `website/` (Docusaurus). From the repo root:

```bash
cd website
npm install
npm start   # dev server on :3000 with live reload, served under /docs
```

…then edit Markdown in `website/docs/`. The site builds in docs-only mode (`routeBasePath: '/'`)
with `baseUrl: /docs/` — keep internal links relative (e.g. `./api.md`) so they work under any
deployment prefix. See [Website & docs pipeline](https://github.com/havaianasdestruido/Giggles-Shit#website--documentation)
in the README for how it's deployed.

## Adding emoji to the media library

1. Optimize the image (small, ideally ≤ 100 KB — remember it renders at 20px).
2. Drop it in `res/img/` (or `res/img/gifs/` for animations).
3. Optionally wire it into `DEFAULT_GAS` so everyone gets it by default.
4. Add a card to the [media library](./reference/media-library.md) page and copy the asset into
   `website/static/img/emojis/` so the docs can display it.

Images pushed to the repo are processed by [ImgBot](https://imgbot.net/) (`.imgbotconfig`,
weekly schedule) — don't be surprised by an automated optimization PR.
