---
title: Using the picker
description: Every interaction of the GAS emoji picker — opening, closing, positioning, toasts and edge cases.
sidebar_position: 1
---

# Using the picker

The picker is the floating panel GAS shows when you click its toolbar button. It's a singleton:
the DOM node is created lazily on first use and then reused for the whole page lifetime
(`.gas-picker` attached to `document.body`).

## Opening / closing

| Action | Result |
|---|---|
| Click the **trollge toolbar button** | Opens the picker next to the button. Clicking again while open **toggles it closed**. |
| Click the **×** in the picker header | Closes the picker. |
| Press **Esc** | Closes the picker (captured at document level, works from any focused element). |
| Click **outside** the picker or its button | Closes the picker (captured click handler; clicks *inside* the grid are swallowed). |
| **Scroll** or **resize** the window | Closes the picker if it is open (listeners are `passive`, so scrolling stays smooth). |

State is tracked in `state.activeEditor` (the editor that will receive the insertion) and in the
picker's `data-open` attribute (`"true"` / `"false"`).

## Positioning

Each time the picker opens it is positioned relative to the button you clicked:

- default: below the button, aligned to its left edge (`8px` gap)
- if it would overflow the **right edge** of the viewport → shifted left
- if it would overflow the **bottom** of the viewport → **flips above** the button
- if it would overflow the left/top edges → clamped to an `8px` screen margin

The picker re-computes this on every open, so it always lands on screen.

## The grid

The picker renders one card per entry of `DEFAULT_GAS`:

- the **image** (loaded with `loading="lazy"` so off-screen emoji don't fetch until needed)
- the emoji **name** (e.g. `crine`)
- the **insertion hint** — the literal text `<img width="20px">` so you know what you'll get

If an image fails to load, its card dims to 35% opacity instead of breaking the layout — a hint
that the URL is dead (see [Troubleshooting](./troubleshooting.md#an-emoji-image-shows-dimmedbroken)).

## After you pick

1. The image tag is inserted at the caret (see [insertion internals](../reference/api.md#insertion)).
2. A **toast** (`Inserted <name>`) appears at the bottom-center of the page and removes itself
   after **1400 ms**. A new toast replaces the old one rather than stacking.
3. The picker closes and `state.activeEditor` is reset to `null`.

## Keyboard & accessibility notes

- Toolbar button: real `<button type="button">`, `aria-label="Open Giggles&Shit"`, tooltip
  `Giggles&Shit` — so it participates in tab order and screen readers.
- Each picker item: `<button>` with `aria-label="Insert <name>"` and a matching `title`.
- The close button has `aria-label="Close GAS picker"`.
- Open state is machine-readable via the picker's `data-open` attribute — but the element only
  exists after the first open (it's created lazily by `createPicker()`), so guard the lookup:
  `document.querySelector('.gas-picker')?.dataset.open ?? 'false'`.
