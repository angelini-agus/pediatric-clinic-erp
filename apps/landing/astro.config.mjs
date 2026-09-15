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
  site: 'https://dramartinangelio.com',
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
});
