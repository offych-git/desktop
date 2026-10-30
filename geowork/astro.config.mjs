import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://geowork.us',
  adapter: netlify(),
  integrations: [sitemap()],
  trailingSlash: 'never'
});
