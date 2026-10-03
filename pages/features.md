---
layout: default
title: Features
permalink: /features/
description: Everything Giggles&Shit does — toolbar injection, the picker, insertion engines, SPA resilience.
---

<div class="container prose">

<h1>Features</h1>
<p class="dim">What you get when you install Giggles&amp;Shit (GAS) v2.3.0. Implementation details for each
item are linked into the <a href="{{ '/docs/' | relative_url }}">Docusaurus docs</a>.</p>

<h2>🧰 Toolbar button injection</h2>
<p>GAS finds GitHub's own formatting toolbar next to every markdown editor
(<code>[role="toolbar"]</code>, with an <code>aria-label*="Formatting"</code> fallback search up to 8
ancestors) and appends a 20×20 trollge button to it. Injection is deduplicated: a toolbar that
already has the button is never touched twice. <a href="{{ '/docs/reference/api/' | relative_url }}#toolbar">API reference →</a></p>

<h2>🖼️ Emoji picker</h2>
<p>A floating panel (created lazily once, then reused) with a responsive grid of emoji cards —
image, name, and the exact tag it's going to insert (<code>&lt;img width="20px"&gt;</code>). Images
are lazy-loaded; a dead image link dims to 35% opacity instead of breaking the panel.
Positioning is viewport-aware: it clamps horizontally and flips above the button when the bottom
edge would overflow. <a href="{{ '/docs/guides/using-the-picker/' | relative_url }}">Usage guide →</a></p>

<h2>⚛️ Dual insertion engines</h2>
<ul>
  <li><strong>Textarea editors</strong> — the HTML string is spliced at the caret (or over the
  selection) and written through the <em>native prototype setter</em>, followed by bubbling
  <code>input</code> and <code>change</code> events. This is what keeps GitHub's React-controlled
  forms in sync.</li>
  <li><strong>Contenteditable editors</strong> — a real <code>Image</code> node is inserted through
  the live <code>Selection</code>/<code>Range</code>, caret collapsed after it, and an
  <code>InputEvent('insertElement')</code> is dispatched.</li>
</ul>
<p><a href="{{ '/docs/reference/api/' | relative_url }}#insertion">API reference →</a></p>

<h2>🔁 SPA-aware rescanning</h2>
<p>GitHub rarely does full page loads — it navigates with Turbo. A <code>MutationObserver</code> on
<code>document.body</code> watches for added nodes and triggers a 100&nbsp;ms-debounced rescan, so
editors that appear later (lazy comment boxes, new-issue forms, file editors) still get their
button. <a href="{{ '/docs/reference/architecture/' | relative_url }}">Architecture →</a></p>

<h2>🫥 Polite, keyboard-friendly UX</h2>
<ul>
  <li>Toggle from the same button; close with <code>Esc</code>, the × button, outside click, scroll or resize.</li>
  <li>Real <code>&lt;button&gt;</code> elements with <code>aria-label</code>s everywhere — tab order and screen readers work.</li>
  <li>Toast confirmation on every insertion (<code>Inserted skull</code>), auto-removed after 1.4s, never stacking.</li>
  <li>Scroll listeners are <code>passive</code> — no jank.</li>
</ul>

<h2>🔒 Zero permissions, zero residue</h2>
<p>The script runs with <code>@grant none</code>: no privileged APIs, no
<code>localStorage</code>, no cookies, no telemetry. The script itself makes no network requests —
the only traffic it triggers is your browser fetching emoji images from
<code>raw.githubusercontent.com</code> (the same host GitHub's own avatars use). Uninstalling the
script removes every trace.
<a href="{{ '/docs/reference/metadata/' | relative_url }}">Userscript metadata →</a></p>

<h2>🛠️ Built-in debug API</h2>
<p>A single global — <code>window.GAS</code> — exposes live state for console debugging:
<code>GAS.scan()</code>, <code>GAS.editors()</code>, <code>GAS.buttons()</code>,
<code>GAS.testButton()</code>, <code>GAS.gas()</code>, <code>GAS.close()</code>. The startup banner
in the console even tells you they exist.
<a href="{{ '/docs/reference/debug-api/' | relative_url }}">Debug API docs →</a></p>

<h2>🎨 Bring your own memes</h2>
<p>The emoji catalog is a plain array of <code>{name, url}</code> objects. Add yours in your
manager's script editor and reload — GIFs included.
<a href="{{ '/docs/guides/custom-emojis/' | relative_url }}">Customization guide →</a></p>

</div>
