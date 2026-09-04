// ============================================================
//  site/astro.config.mjs — Sitio de documentación KatanaKIT CSS
//  (Astro + Starlight).
// ============================================================
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://senseikatana.github.io/katanakit-css/',
  base: '/katanakit-css/',
  integrations: [
    starlight({
      title: 'KatanaKIT CSS',
      description:
        'A lightweight, modular SCSS mini-framework: design tokens, utility classes and layout mixins.',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/senseikatana/katanakit-css',
        },
      ],
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Introduction', link: '/katanakit-css/' },
            { label: 'Getting Started', slug: 'getting-started' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'API Reference', slug: 'api-reference' },
            { label: 'Architecture', slug: 'architecture' },
            { label: 'Roadmap', slug: 'roadmap' },
          ],
        },
      ],
      components: {
        // Selector de versiones en la cabecera del sitio de docs.
        SiteTitle: './src/components/VersionTitle.astro',
      },
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
