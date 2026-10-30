import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import sanity from '@sanity/astro';
import react from '@astrojs/react';

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || '';
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  site: 'https://geowork.us',
  integrations: [
    sitemap(),
    ...(projectId ? [
      react(),
      sanity({
        projectId,
        dataset,
        useCdn: false,
        studioBasePath: '/admin',
        studioRouterHistory: 'hash'
      })
    ] : [])
  ],
  trailingSlash: 'never'
});
