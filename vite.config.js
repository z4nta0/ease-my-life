import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Read the version at build time so the About section and the support form's
// diagnostic field always report what `npm version` actually set. Without this
// the UI carries its own hardcoded string and silently drifts.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // ONE manifest, not two. public/manifest.webmanifest is already written,
      // hand-tuned, and linked from index.html — so the plugin is told not to
      // generate or inject its own. If you would rather the plugin own it,
      // delete the static file AND the <link rel="manifest"> in index.html,
      // then move the JSON into a `manifest: {...}` option here.
      manifest: false,
      workbox: {
        // Precache the built app. Fonts are self-hosted under src/, so they are
        // fingerprinted and covered by the glob below.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Adds our notificationclick handler to the generated worker. Keeps us
        // on generateSW (Workbox writes the precache) instead of having to
        // switch to injectManifest and hand-maintain the whole service worker.
        importScripts: ['/sw-notify.js'],
      },
      // Lets you exercise the service worker with `npm run dev`. Without this
      // the SW only exists in a real build (`npm run build && npm run preview`).
      devOptions: { enabled: true },
    }),
  ],
});
