---
title: Quick start
description: Insert your first Giggles&Shit emoji into a GitHub comment in under a minute.
sidebar_position: 2
---

# Quick start

Assumes you finished [Installation](./installation.md). This takes about a minute.

## 1. Open a markdown editor on GitHub

Any page with a comment/description box works:

- a new or existing **issue**
- a **pull request** conversation
- a PR **review comment**
- a **gist** comment
- editing a repo `README` / any `.md` file in the web editor — anywhere GitHub shows the
  formatting toolbar

For a safe sandbox, open [a new issue on the GAS repo](https://github.com/havaianasdestruido/Giggles-Shit/issues/new)
(you can close the tab without submitting).

## 2. Find the GAS button

Look at the editor's **formatting toolbar** — the row with **B**, *I*, link, lists, and so on.
GAS appends its button at the far right end of that toolbar: a 20×20 **trollge face**.

Hovering it shows the tooltip `Giggles&Shit`.

## 3. Open the picker

Click the trollge button. A picker opens next to it showing the five bundled emoji:
**bulleh**, **crine**, **rose**, **skull** and **trollge**.

![GAS picker in action](pathname:///img/demo.gif)

## 4. Insert an emoji

Click any image in the grid. GAS inserts an inline `<img>` tag **at your cursor position**
(replacing any selected text), shows a toast like `Inserted skull`, and closes the picker.

What lands in the editor depends on the editor type:

```html title="Markdown (textarea) editors — raw HTML in the source"
<img src="https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/refs/heads/main/res/img/skull.jpg" alt="skull" width="20px">
```

In rich (`contenteditable`) editors a real `<img>` element is inserted into the DOM instead.
Either way, after you hit **Comment** GitHub renders it as a 20-pixel inline image.

## 5. Combine with text

The insertion is plain HTML inside Markdown, so it flows with your prose:

```markdown
this bug is **critical** <img src="https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/refs/heads/main/res/img/crine.jpg" alt="crine" width="20px"> please fix
```

## Things worth knowing

- **Cursor or selection?** Text you had selected is *replaced* by the image tag; otherwise it is
  inserted at the caret.
- **Closing without picking:** press `Esc`, click anywhere outside, or click the `×` in the picker
  header. The picker also auto-closes when you scroll or resize the window.
- **Button not there?** GitHub is a single-page app — if you navigated with pagination/turbo the
  editor may need a re-scan. See [Troubleshooting](../guides/troubleshooting.md).

Next: learn every interaction in [Using the picker](../guides/using-the-picker.md), or add your
own images in [Custom emoji](../guides/custom-emojis.md).
