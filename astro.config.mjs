import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.featheranalytics.dev',
  integrations: [mdx(), sitemap()],
  // Zone History was served at /znhstry as its own GitHub Pages deploy under this domain
  // until it moved to znhstry.com. Old links and search results still land here.
  redirects: {
    '/znhstry': 'https://znhstry.com',
    '/projects': '/#projects',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
