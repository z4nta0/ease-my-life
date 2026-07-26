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
        // Precache the built app. Fonts are NOT covered until they are
        // self-hosted — a cross-origin Google Fonts stylesheet cannot be
        // precached, which is why offline still renders fallback faces.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
      // Lets you exercise the service worker with `npm run dev`. Without this
      // the SW only exists in a real build (`npm run build && npm run preview`).
      devOptions: { enabled: true },
    }),
  ],
});
