// @ts-check
// Docusaurus configuration for the Giggles&Shit documentation.
//
// Architecture note: the *primary* website is built with Jekyll and lives at
// the site root (`/`). Docusaurus ONLY owns the `/docs` subtree — the CI
// workflow builds this project and copies the output into `<jekyll>/_site/docs`.
//
// See https://docusaurus.io/docs/api/docusaurus-config for all options.

import {themes as prismThemes} from 'prism-react-renderer';

// Base URL the docs are served from. In production this includes the GitHub
// Pages project prefix (e.g. `/Giggles-Shit/docs/`); locally it's `/docs/`.
const docsBaseUrl = process.env.DOCS_BASE_URL ?? '/docs/';
// Where the Jekyll main site lives (navbar "Main site" link, footer site
// links). Must be an ABSOLUTE URL so Docusaurus treats it as external and
// doesn't broken-link-check it — root-relative paths would be resolved
// against the docs baseUrl. Defaults to the local Jekyll dev server; CI and
// the combined preview pass the real origin explicitly.
const mainSiteUrl =
  process.env.MAIN_SITE_URL ??
  'http://localhost:4000/'; // `bundle exec jekyll serve` default

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Giggles&Shit Docs',
  tagline: 'Custom emojis for GitHub — full codebase documentation',
  favicon: 'img/trollge.jpg',

  // Production URL of the GitHub Pages site.
  url: 'https://havaianasdestruido.github.io',
  baseUrl: docsBaseUrl,
  trailingSlash: true,

  // GitHub Pages metadata.
  organizationName: 'havaianasdestruido',
  projectName: 'Giggles-Shit',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          // Docs-only mode: this site is nothing but documentation, and the
          // docs plugin owns every route under `baseUrl` (`/docs`).
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/havaianasdestruido/Giggles-Shit/tree/main/website/',
        },
        blog: false,
        pages: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/demo.gif',
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Giggles&Shit',
        logo: {
          alt: 'Giggles&Shit logo',
          src: 'img/trollge.jpg',
        },
        items: [
          // Escape hatch back to the Jekyll primary website.
          {href: mainSiteUrl, label: '← Main site', position: 'left'},
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://github.com/havaianasdestruido/Giggles-Shit/blob/main/gas.userscript.js',
            label: 'Source',
            position: 'right',
          },
          {
            href: 'https://github.com/havaianasdestruido/Giggles-Shit',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {label: 'Introduction', to: '/'},
              {label: 'Installation', to: '/getting-started/installation/'},
              {label: 'Function reference', to: '/reference/api/'},
              {label: 'Debug API (window.GAS)', to: '/reference/debug-api/'},
            ],
          },
          {
            title: 'Main site',
            items: [
              {label: 'Home', href: mainSiteUrl},
              {label: 'Features', href: `${mainSiteUrl}features/`},
              {label: 'FAQ', href: `${mainSiteUrl}faq/`},
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/havaianasdestruido/Giggles-Shit',
              },
              {
                label: 'Report an issue',
                href: 'https://github.com/havaianasdestruido/Giggles-Shit/issues/new',
              },
              {
                label: 'Star history',
                href: 'https://www.star-history.com/?repos=havaianasdestruido%2FGiggles-Shit&type=date&legend=top-left',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Giggles&Shit contributors. Built with <a href="https://docusaurus.io/">Docusaurus</a>.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json', 'diff'],
      },
    }),
};

export default config;
