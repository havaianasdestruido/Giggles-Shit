#!/usr/bin/env node
/**
 * Combined website preview server.
 *
 * The production pipeline is:
 *   Docusaurus (./website)  ──build──▶ website/build ──copy──▶ _site/docs
 *   Jekyll (repo root)      ──build──▶ _site  (everything else)
 *
 * GitHub Actions runs the real Jekyll build. This script *simulates* that
 * pipeline locally WITHOUT requiring Ruby, so you can preview the combined
 * site in one shot:
 *
 *   cd website && npm install && npm run build && cd ..
 *   node scripts/serve-preview.js          # → http://localhost:3000
 *
 * It renders the (deliberately small) Liquid subset the Jekyll templates use:
 *   {{ content }}, {{ site.title }}, {{ page.title }}, {{ site.description }},
 *   {{ '/path' | relative_url }}, {% seo %}
 * Keep templates within that subset and this preview stays faithful.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '.preview');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

/* ---------------- tiny "jekyll" renderer ---------------- */

function parseFrontMatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^(\w[\w-]*):\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    data[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return { data, body: raw.slice(m[0].length) };
}

function readSiteConfig() {
  // Extract the couple of scalar fields the templates use from _config.yml.
  const cfg = {};
  try {
    const raw = fs.readFileSync(path.join(ROOT, '_config.yml'), 'utf8');
    for (const key of ['title', 'description']) {
      const re = new RegExp(`^${key}:\\s*"?(.+?)"?\\s*$`, 'm');
      const mm = re.exec(raw);
      if (mm) cfg[key] = mm[1].replace(/^>-\s*$/, '').trim();
    }
  } catch {
    cfg.title = 'Giggles&Shit';
    cfg.description = 'Custom emojis for GitHub';
  }
  return cfg;
}

const site = readSiteConfig();

function renderLiquid(tpl, page, content) {
  return tpl
    .replace(/\{%\s*seo\s*%\}/g, '')
    .replace(/\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}/g, (_, p) => p)
    .replace(/\{\{\s*content\s*\}\}/g, () => content ?? '')
    .replace(/\{\{\s*page\.title\s*\}\}/g, page.title || '')
    .replace(/\{\{\s*page\.description\s*\}\}/g, page.description || '')
    .replace(/\{\{\s*site\.title\s*\}\}/g, site.title || '')
    .replace(/\{\{\s*site\.description\s*\}\}/g, site.description || '');
}

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function cpdir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) cpdir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function buildPreview() {
  rmrf(OUT);
  fs.mkdirSync(OUT, { recursive: true });

  // 1) "Jekyll": render markdown pages through their layout.
  const pageFiles = [path.join(ROOT, 'index.md')];
  const pagesDir = path.join(ROOT, 'pages');
  if (fs.existsSync(pagesDir)) {
    for (const f of fs.readdirSync(pagesDir)) {
      if (f.endsWith('.md')) pageFiles.push(path.join(pagesDir, f));
    }
  }

  for (const file of pageFiles) {
    const { data, body } = parseFrontMatter(fs.readFileSync(file, 'utf8'));
    const layoutName = data.layout || 'default';
    const layoutRaw = fs.readFileSync(
      path.join(ROOT, '_layouts', `${layoutName}.html`),
      'utf8'
    );
    const bodyRendered = renderLiquid(body, data);
    const html = renderLiquid(layoutRaw, data, bodyRendered);
    const permalink = data.permalink || `/${path.basename(file, '.md')}/`;
    const outDir = path.join(OUT, permalink.replace(/^\//, ''));
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log('  rendered', permalink);
  }

  // 2) "Jekyll": copy static assets the templates reference.
  for (const dir of ['assets', 'res', 'screenshots']) {
    const src = path.join(ROOT, dir);
    if (fs.existsSync(src)) cpdir(src, path.join(OUT, dir));
  }

  // 3) "Docusaurus": copy website/build → .preview/docs
  const docsBuild = path.join(ROOT, 'website', 'build');
  if (!fs.existsSync(docsBuild)) {
    console.error(
      '\n  ✖ website/build not found. Run "cd website && npm run build" first.\n'
    );
    process.exit(1);
  }
  cpdir(docsBuild, path.join(OUT, 'docs'));
  console.log('  copied website/build → /docs');
}

/* ---------------- static file server ---------------- */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.avif': 'image/avif'
};

// Containment check: resolve `p` relative to OUT and reject anything that
// escapes the preview root (parent traversal) or is absolute. Unlike a
// string-prefix check this is not fooled by siblings like `.preview-evil`.
function isContained(p) {
  const rel = path.relative(OUT, p);
  return rel !== '' && rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel);
}

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (urlPath.endsWith('/')) urlPath += 'index.html';
    let file = path.join(OUT, urlPath);
    if (!isContained(file)) {
      res.writeHead(403).end('forbidden');
      return;
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      // SPA-ish fallback for directory-style URLs without trailing slash
      const alt = path.join(OUT, urlPath, 'index.html');
      if (isContained(alt) && fs.existsSync(alt) && !fs.statSync(alt).isDirectory()) {
        file = alt;
      } else {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end(`404 — ${urlPath}\n(root: ${OUT})`);
        return;
      }
    }
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'content-type': type,
      'cache-control': 'no-store'
    });
    fs.createReadStream(file).pipe(res);
  } catch (err) {
    res.writeHead(500).end(String(err));
  }
});

buildPreview();
server.listen(PORT, HOST, () => {
  console.log(`\n  ▶ Combined preview on http://${HOST}:${PORT}`);
  console.log('    /        → Jekyll primary website (simulated render)');
  console.log('    /docs/   → Docusaurus build output\n');
});
