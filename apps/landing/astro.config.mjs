// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // URL canónica del sitio: requerida por @astrojs/sitemap y por los
  // links canonical/OG. Si cambia el dominio, actualizar acá y en
  // src/pages/index.astro (SITE_URL).
  site: 'https://ipedierp.com.ar',
  integrations: [
    react(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});
