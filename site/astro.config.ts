// ============================================================
//  astro.config.ts — KatanaKIT CSS Documentation Site
//  Uses @prosefly/astro-theme-lotus (Astro 7 + Tailwind v4)
// ============================================================
import { defineConfig } from 'astro/config';
import lotus from '@prosefly/astro-theme-lotus';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://senseikatana.github.io/katanakit-css/',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [lotus()],
});
