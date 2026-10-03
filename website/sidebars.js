// @ts-check
// Sidebar configuration for the Giggles&Shit docs.
// See https://docusaurus.io/docs/sidebar

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting started',
      link: {
        type: 'generated-index',
        title: 'Getting started',
        description:
          'Install Giggles&Shit (GAS) and insert your first custom emoji into GitHub in under two minutes.',
        slug: '/getting-started',
      },
      items: ['getting-started/installation', 'getting-started/quick-start'],
    },
    {
      type: 'category',
      label: 'Guides',
      link: {
        type: 'generated-index',
        title: 'Guides',
        description:
          'Day-to-day usage of the picker, adding your own emoji, and fixing common problems.',
        slug: '/guides',
      },
      items: [
        'guides/using-the-picker',
        'guides/custom-emojis',
        'guides/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Technical reference',
      link: {
        type: 'generated-index',
        title: 'Technical reference',
        description:
          'Deep dive into the gas.userscript.js codebase: architecture, internal functions, state, DOM artifacts and the window.GAS debug API.',
        slug: '/reference',
      },
      items: [
        'reference/architecture',
        'reference/api',
        'reference/debug-api',
        'reference/metadata',
        'reference/media-library',
      ],
    },
    'contributing',
    'changelog',
  ],
};

export default sidebars;
