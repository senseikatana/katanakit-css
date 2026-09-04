import { defineConfig } from 'vite';
import purgecss from 'vite-plugin-purgecss';

const PORT = Number(process.env.PORT) || 4321;

export default defineConfig({
  root: '.',
  // public/ sirve los CSS compilados por build:versions (public/versions/).
  publicDir: 'public',
  server: {
    port: PORT,
    open: false,
    host: true,
    cors: true,
    hmr: true,
  },
  build: {
    // La demo va a demo-dist/ para no pisar dist/css/katanakit.css (artefacto npm).
    outDir: 'demo-dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'index.html',
    },
  },
  plugins: [
    // PurgeCSS solo en build (en dev el CSS debe ser completo para HMR).
    purgecss({
      content: ['./index.html', './demo/**/*.{js,ts}'],
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: {
        standard: [
          /^sm:/,
          /^md:/,
          /^lg:/,
          /^xl:/,
          /^2xl:/,
          /^3xl:/,
          /^hover:/,
          /^focus:/,
          /^active:/,
          /^disabled:/,
          /^group-hover:/,
          /^peer-checked:/,
        ],
        deep: [/^data-/],
        greedy: [/^is-/, /^has-/],
      },
      keyframes: true,
      fontFace: true,
      // Conserva las custom properties de tokens (:root) aunque las clases
      // utilicen valores literales en vez de var().
      variables: false,
      rejected: false,
    }),
  ].filter(Boolean),
});
