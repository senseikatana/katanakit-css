// ============================================================
//  site/astro.config.mjs — Sitio de documentación KatanaKIT CSS
//  (Astro + Starlight), estilo tailwindcss.com.
// ============================================================
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'KatanaKIT CSS',
      description:
        'A lightweight, modular SCSS mini-framework: design tokens, utility classes and layout mixins.',
      defaultLocale: 'root',
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
        es: {
          label: 'Español',
          lang: 'es',
        },
      },
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
            { label: 'Introduction', link: '/' },
            { label: 'Installation', slug: 'getting-started' },
          ],
        },
        {
          label: 'Core Concepts',
          items: [
            { label: 'Design Tokens', slug: 'core/tokens' },
            { label: 'Colors', slug: 'core/colors' },
            { label: 'Breakpoints', slug: 'core/breakpoints' },
            { label: 'Dark Mode', slug: 'core/dark-mode' },
            { label: '@apply', slug: 'core/apply' },
          ],
        },
        {
          label: 'Layout',
          collapsed: true,
          items: [
            { label: 'Display', slug: 'utilities/display' },
            { label: 'Position', slug: 'utilities/position' },
            { label: 'Overflow', slug: 'utilities/overflow' },
            { label: 'Z-Index', slug: 'utilities/z-index' },
          ],
        },
        {
          label: 'Spacing',
          collapsed: true,
          items: [
            { label: 'Padding', slug: 'utilities/padding' },
            { label: 'Margin', slug: 'utilities/margin' },
            { label: 'Gap', slug: 'utilities/gap' },
          ],
        },
        {
          label: 'Sizing',
          collapsed: true,
          items: [{ label: 'Width & Height', slug: 'utilities/sizing' }],
        },
        {
          label: 'Flexbox',
          collapsed: true,
          items: [
            { label: 'Flex Direction', slug: 'utilities/flex-direction' },
            { label: 'Flex Wrap', slug: 'utilities/flex-wrap' },
            { label: 'Align Items', slug: 'utilities/align-items' },
            { label: 'Justify Content', slug: 'utilities/justify-content' },
          ],
        },
        {
          label: 'Typography',
          collapsed: true,
          items: [
            { label: 'Font Size', slug: 'utilities/font-size' },
            { label: 'Font Weight', slug: 'utilities/font-weight' },
            { label: 'Text Align', slug: 'utilities/text-align' },
            { label: 'White Space', slug: 'utilities/whitespace' },
          ],
        },
        {
          label: 'Colors',
          collapsed: true,
          items: [
            { label: 'Text Color', slug: 'utilities/text-color' },
            { label: 'Background Color', slug: 'utilities/background-color' },
            { label: 'Border Color', slug: 'utilities/border-color' },
          ],
        },
        {
          label: 'Borders & Effects',
          collapsed: true,
          items: [
            { label: 'Border Width', slug: 'utilities/border-width' },
            { label: 'Border Radius', slug: 'utilities/border-radius' },
            { label: 'Box Shadow', slug: 'utilities/box-shadow' },
            { label: 'Opacity', slug: 'utilities/opacity' },
            { label: 'Transitions', slug: 'utilities/transitions' },
          ],
        },
        {
          label: 'Layout Mixins',
          collapsed: true,
          items: [
            { label: 'Grid', slug: 'mixins/grid' },
            { label: 'Flexbox', slug: 'mixins/flex' },
            { label: 'Breakpoints', slug: 'mixins/breakpoints' },
          ],
        },
        {
          label: 'Reference',
          collapsed: true,
          items: [
            { label: 'Functions', slug: 'reference/functions' },
            { label: 'API Reference', slug: 'reference/api-reference' },
            { label: 'Architecture', slug: 'reference/architecture' },
            { label: 'Examples', slug: 'reference/examples' },
            { label: 'Roadmap', slug: 'reference/roadmap' },
          ],
        },
      ],
      components: {
        SiteTitle: './src/components/VersionTitle.astro',
        ThemeSelect: './src/components/ThemeDropdown.astro',
      },
      customCss: ['./src/styles/custom.css', './src/styles/framework.scss'],
    }),
  ],
});
