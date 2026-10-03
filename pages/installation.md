---
layout: default
title: Installation
permalink: /installation/
description: Install the Giggles&Shit userscript in three steps with any userscript manager.
---

<div class="container prose">

<h1>Installation</h1>
<p class="dim">Three steps, about two minutes. GAS needs no permissions and no configuration.</p>

<h2>Step 1 — install a userscript manager</h2>
<p>Pick any manager for your browser:</p>
<table>
  <thead>
    <tr><th>Manager</th><th>Chrome / Edge</th><th>Firefox</th><th>Safari</th></tr>
  </thead>
  <tbody>
    <tr><td><a href="https://www.tampermonkey.net/">Tampermonkey</a></td><td>✅</td><td>✅</td><td>✅</td></tr>
    <tr><td><a href="https://violentmonkey.github.io/">Violentmonkey</a></td><td>✅</td><td>✅</td><td>✅</td></tr>
    <tr><td><a href="https://www.greasespot.net/">Greasemonkey</a></td><td>—</td><td>✅</td><td>—</td></tr>
    <tr><td><a href="https://apps.apple.com/app/userscripts/id1463298887">Apple Userscripts</a></td><td>—</td><td>—</td><td>✅</td></tr>
  </tbody>
</table>

<h2>Step 2 — install the script</h2>
<p>Open the raw file and your manager will offer to install it (the
<code>#.user.js</code> fragment makes manager detection reliable — it's stripped before the
request reaches GitHub):</p>
<p><a class="btn btn-primary" href="https://raw.githubusercontent.com/havaianasdestruido/Giggles-Shit/main/gas.userscript.js#.user.js">➡ Install Giggles&Shit</a></p>
<div class="callout">
  <p><strong>Manual install:</strong> create a new script in your manager and paste the full
  contents of
  <a href="https://github.com/havaianasdestruido/Giggles-Shit/blob/main/gas.userscript.js">gas.userscript.js</a>.</p>
</div>

<h2>Step 3 — verify</h2>
<ol>
  <li>Open any GitHub page with a comment box — e.g.
  <a href="https://github.com/havaianasdestruido/Giggles-Shit/issues/new">open a new issue</a>.</li>
  <li>Find the <strong>trollge button</strong> at the end of the formatting toolbar.</li>
  <li>Open DevTools — the colored <code>[GAS]</code> banner confirms the script is running.</li>
</ol>

<h2>Updating &amp; uninstalling</h2>
<p>If you installed through the link above, your manager keeps the install URL as the update source
and will fetch new releases when <code>@version</code> (currently <strong>2.2.0</strong>) increases
(the script header declares no explicit <code>@updateURL</code>, so the install URL is used).
Copies that were pasted in manually have no tracked update source and do
<strong>not</strong> auto-update — repeat Step 2 to update them. To uninstall: remove the script
from your manager's dashboard. GAS stores nothing and leaves no residue.</p>

<div class="callout">
  <p><strong>Trouble?</strong> Check the <a href="{{ '/faq/' | relative_url }}">FAQ</a> or the
  <a href="{{ '/docs/guides/troubleshooting/' | relative_url }}">troubleshooting guide</a> in the docs.</p>
</div>

</div>
