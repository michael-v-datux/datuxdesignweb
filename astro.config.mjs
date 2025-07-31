import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import path from 'path';

if (!process.env.GA_ID) {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  Warning: GA_ID is not set in .env — Google Analytics will not be loaded.');
}

export default defineConfig({
  integrations: [react()],
  vite: {
    define: {
      'import.meta.env.PUBLIC_GA_ID': JSON.stringify(process.env.GA_ID),
    },
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },
});