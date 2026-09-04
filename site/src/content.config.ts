// ============================================================
//  site/src/content.config.ts — Registro de la colección de
//  documentación para Astro 7 + Starlight 0.42.
// ============================================================
import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
