import { defineConfig } from 'vite';

export default defineConfig({
  // SPA fallback: redirect all routes to index.html
  appType: 'spa',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
  },
  // Enable JSON imports
  json: {
    stringify: false,
  },
});
