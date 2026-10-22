import { defineConfig } from 'astro/config';
import media from './src/integrations/media.mjs';

export default defineConfig({
  site: 'https://jyslash.github.io',
  trailingSlash: 'always',
  integrations: [media()],
  devToolbar: { enabled: false },
  // Journal is the home page, so its section URL points there.
  redirects: {
    '/ko/journal': '/ko/',
    '/en/journal': '/en/',
  },
});
