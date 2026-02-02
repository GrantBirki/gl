import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import { readingTimeRemarkPlugin } from './src/utils/frontmatter.mjs';
import { SITE } from './src/config/site/config.js';
import react from '@astrojs/react';
import icon from 'astro-icon';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const whenExternalScripts = (items = []) =>
  SITE.googleAnalyticsId ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

// https://astro.build/config
export default defineConfig({
  site: SITE.origin,
  base: SITE.basePathname,
  trailingSlash: SITE.trailingSlash ? 'always' : 'never',
  output: 'static',
  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin],
  },
  image: {
    domains: ['flowbite.s3.amazonaws.com', 'i.imgur.com', 'user-images.githubusercontent.com'],
  },

  redirects: {
    '/qrcode': {
      status: 302,
      destination: 'https://weduploader.com/upload/Q53WpiAyHCbZpTw8',
    },
  },

  integrations: [
    icon({
      include: {
        mdi: ['*'], // Loads entire Material Design Icon set
        tabler: ['*'], // Loads entire Tabler Icon set
        'flat-color-icons': ['*'], // Loads entire Flat Color Icon set
        'icon-park': ['*'], // Loads entire Icon Park Icon set
        ri: ['*'], // Loads entire Remix Icon set
      },
    }),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    mdx(),
    ...whenExternalScripts(() =>
      partytown({
        config: {
          forward: ['dataLayer.push'],
        },
      })
    ),
    react(),
  ],
  vite: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});
