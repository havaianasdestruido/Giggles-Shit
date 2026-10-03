---
layout: default
title: Home
permalink: /
---

<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div class="hero-copy">
        <p class="kicker">A GitHub userscript · v2.3.0</p>
        <h1>issues, but with <span class="accent">giggles</span>.<br>and shit.</h1>
        <p class="lede">
          <strong>Giggles&amp;Shit</strong> is a tiny userscript that adds a custom emoji &amp; image
          picker to GitHub's markdown editors. One click on the trollge button, one click on a
          meme, and it's in your comment — rendered inline at 20px.
        </p>
        <div class="hero-cta">
          <a class="btn btn-primary" href="https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/main/gas.userscript.js#.user.js">Install the script</a>
          <a class="btn" href="{{ '/docs/' | relative_url }}">Read the docs →</a>
          <a class="btn btn-ghost" href="https://github.com/havaianasdestruido/Giggles-Shit">★ on GitHub</a>
        </div>
        <ul class="quick-facts">
          <li><strong>Zero permissions</strong> — runs with <code>@grant none</code></li>
          <li><strong>No build step</strong> — one file, ~1,800 lines, vanilla JS</li>
          <li><strong>SPA-ready</strong> — a MutationObserver keeps up with Turbo navigation</li>
        </ul>
      </div>
      <figure class="hero-media">
        <img src="{{ '/screenshots/2026-08-1212-13-00-ezgif.com-optimize.gif' | relative_url }}" alt="GAS picker demo — inserting a meme into a GitHub comment" loading="eager">
        <figcaption>The whole flow: toolbar button → picker → meme in comment.</figcaption>
      </figure>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2 class="section-title">What does it do?</h2>
    <p class="section-lede">
      GAS watches every GitHub page for markdown editors, sneaks a button into their formatting
      toolbar, and opens a floating picker with your emoji stash. Pick one and an
      <code>&lt;img width="20px"&gt;</code> lands exactly at your cursor — whether the editor is a
      plain <code>textarea</code> or a rich <code>contenteditable</code>.
    </p>
    <div class="card-grid">
      <div class="card">
        <h3>🧰 Toolbar injection</h3>
        <p>A 20×20 trollge button appears at the end of GitHub's own formatting toolbar — issues, PRs, comments, reviews, the works.</p>
      </div>
      <div class="card">
        <h3>🖼️ Built-in meme pack</h3>
        <p>Ships with bulleh, crine, rose, skull and trollge, lazy-loaded from the repo. Broken links just dim instead of exploding.</p>
      </div>
      <div class="card">
        <h3>⚛️ React-safe insertion</h3>
        <p>Textarea values are written through the native setter + <code>input</code>/<code>change</code> events, so GitHub's controlled components don't eat your memes.</p>
      </div>
      <div class="card">
        <h3>🔁 Keeps up with GitHub</h3>
        <p>GitHub is a single-page app. A debounced MutationObserver rescan finds editors added after the initial page load.</p>
      </div>
      <div class="card">
        <h3>🫥 Polite UI</h3>
        <p>Esc, outside-click, scroll and resize all close the picker. A tiny toast confirms every insertion. Nothing lingers.</p>
      </div>
      <div class="card">
        <h3>🛠️ Debuggable</h3>
        <p>Ships a console API: <code>GAS.scan()</code>, <code>GAS.editors()</code>, <code>GAS.buttons()</code>, <code>GAS.testButton()</code>. Bug reports write themselves.</p>
      </div>
    </div>
    <p class="section-more"><a href="{{ '/features/' | relative_url }}">Full feature breakdown →</a></p>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <h2 class="section-title">The stock pack</h2>
    <p class="section-lede">Five handcrafted masterpieces ship out of the box. The repo stores
    <a href="https://github.com/havaianasdestruido/Giggles-Shit/tree/main/res/img">more images and GIFs</a>
    you can wire up yourself.</p>
    <div class="emoji-strip">
      <figure><img src="{{ '/res/img/bulleh.jpg' | relative_url }}" alt="bulleh"><figcaption>bulleh</figcaption></figure>
      <figure><img src="{{ '/res/img/crine.jpg' | relative_url }}" alt="crine"><figcaption>crine</figcaption></figure>
      <figure><img src="{{ '/res/img/rose.jpg' | relative_url }}" alt="rose"><figcaption>rose</figcaption></figure>
      <figure><img src="{{ '/res/img/skull.jpg' | relative_url }}" alt="skull"><figcaption>skull</figcaption></figure>
      <figure><img src="{{ '/res/img/trollge.jpg' | relative_url }}" alt="trollge"><figcaption>trollge</figcaption></figure>
    </div>
    <p class="section-more"><a href="{{ '/docs/reference/media-library/' | relative_url }}">Browse the full media library →</a></p>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2 class="section-title">Install in three steps</h2>
    <ol class="steps">
      <li><h3>Get a userscript manager</h3><p>Tampermonkey, Violentmonkey, or Greasemonkey — anything that runs <code>.user.js</code> files.</p></li>
      <li><h3>Install GAS</h3><p><a href="https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/main/gas.userscript.js">Open the raw script</a> and click Install. No permissions required.</p></li>
      <li><h3>Open GitHub &amp; meme</h3><p>Find the trollge in any comment toolbar, click, pick, done.</p></li>
    </ol>
    <p class="section-more"><a href="{{ '/installation/' | relative_url }}">Detailed installation guide →</a></p>
  </div>
</section>

<section class="section section-cta">
  <div class="container cta-box">
    <h2>Want the nitty-gritty?</h2>
    <p>Full codebase documentation — architecture, every internal function, the debug API, and how to add your own emoji — lives in the Docusaurus docs.</p>
    <a class="btn btn-primary btn-lg" href="{{ '/docs/' | relative_url }}">Open /docs →</a>
  </div>
</section>
