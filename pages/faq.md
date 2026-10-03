---
layout: default
title: FAQ
permalink: /faq/
description: Frequently asked questions about Giggles&Shit (GAS).
---

<div class="container prose">

<h1>FAQ</h1>
<p class="dim">Frequently asked, rarely serious.</p>

<h2>Is this safe? What permissions does it need?</h2>
<p>GAS runs with <code>@grant none</code> — literally zero special permissions. It only works on
<code>github.com</code> (<code>@match https://github.com/*</code>) and makes no network requests of
its own: the script itself performs no API calls, while the emoji images in your comments are
loaded by the browser from <code>raw.githubusercontent.com</code> when picking and rendering.
There's also no telemetry. The entire source is one readable file you can audit:
<a href="https://github.com/havaianasdestruido/Giggles-Shit/blob/main/gas.userscript.js">gas.userscript.js</a>.</p>

<h2>Where does the button show up?</h2>
<p>In the formatting toolbar of GitHub's markdown editors: issue &amp; PR descriptions, comments,
PR reviews, replies, the web file editor — anywhere github.com renders a
<code>[role="toolbar"]</code> with formatting actions. (gist.github.com is a separate host and is
not covered — see the next question.)</p>

<h2>Can I use my own memes?</h2>
<p>Yes. Edit the <code>DEFAULT_GAS</code> array in the script — each entry is just
<code>{ name, url }</code>. The repo even keeps spare images and GIFs under
<code>res/img/</code>. GIFs animate. Guide:
<a href="{{ '/docs/guides/custom-emojis/' | relative_url }}">Adding custom emoji</a>.</p>

<h2>Why 20px?</h2>
<p>Because the inserted tag is <code>&lt;img ... width="20px"&gt;</code> — big enough to read the
joke, small enough to stay inline with text. Want bigger? Edit
<code>createImageHTML()</code> — documented in the
<a href="{{ '/docs/reference/api/' | relative_url }}#createimagehtml">function reference</a>.</p>

<h2>Does it work on gist.github.com?</h2>
<p>Not currently — the <code>@match</code> pattern covers <code>github.com</code> only. It's a
one-line change if you want it locally; see the
<a href="{{ '/docs/reference/metadata/' | relative_url }}">metadata reference</a>.</p>

<h2>The button disappeared after I navigated. Broken?</h2>
<p>Probably not: open the console and type <code>GAS.scan()</code>. GitHub's Turbo navigation
sometimes swaps toolbars faster than the MutationObserver rescan fires — a manual rescan (or a
reload) fixes it. Persistent cases are markup changes: please
<a href="https://github.com/havaianasdestruido/Giggles-Shit/issues/new">file an issue</a> with the
console output. Full steps: <a href="{{ '/docs/guides/troubleshooting/' | relative_url }}">troubleshooting</a>.</p>

<h2>Does it slow GitHub down?</h2>
<p>No. Work happens in short bursts: the observer only schedules a scan when nodes are added, and
the 100&nbsp;ms debounce collapses heavy DOM churn into one pass. Idle cost is one MutationObserver
and a couple of passive listeners.</p>

<h2>Why is it called Giggles&amp;Shit?</h2>
<p>Because "custom emoji userscript" doesn't make you giggle. And shit.</p>

<h2>How do I contribute?</h2>
<p>Issues and PRs welcome — see the
<a href="{{ '/docs/contributing/' | relative_url }}">contributing guide</a>. Meme donations go to
<code>res/img/</code>.</p>

</div>
