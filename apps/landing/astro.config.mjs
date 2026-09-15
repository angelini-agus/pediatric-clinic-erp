// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // URL canónica del sitio: única fuente de verdad. La consumen
  // @astrojs/sitemap, los links canonical/OG y los datos estructurados
  // (vía Astro.site en src/pages/index.astro).
  // IMPORTANTE: debe ser el dominio PRIMARIO — el apex dramartinangelio.com
  // redirige 308 a www, así que el canonical apunta a www para no declarar
  // una URL que redirige (mala señal para Google).
  site: 'https://www.dramartinangelio.com',
  integrations: [
    react(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
  },
  // Landing de una sola página: inlinear todo el CSS elimina la única
  // request render-blocking que quedaba (medido con Lighthouse).
  build: {
    inlineStylesheets: 'always',
  },
});
