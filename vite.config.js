import { readFileSync, writeFileSync } from 'node:fs';
import { defineConfig, minify } from 'vite';
import { transform as transformCss } from 'lightningcss';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Read the version at build time so the About section and the support form's
// diagnostic field always report what `npm version` actually set. Without this
// the UI carries its own hardcoded string and silently drifts.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

// Vite minifies the src/ bundle but ships index.html and everything in public/
// exactly as written. Those files keep the repo's full comments and formatting
// in source, so this build-only plugin compacts what actually ships: it strips
// index.html's comments and indentation, minifies its inline <style> (with
// lightningcss, which Vite already depends on) and its JSON-LD, and minifies
// the copied public/boot-splash.js (with Vite's own minify). That script stays
// its own file so the Content-Security-Policy's script-src can stay 'self', and
// its step runs before the PWA plugin fingerprints the precache, so the
// precached revision matches the minified file.
const minifyShippedFiles = () => {
  let outDir = 'dist';
  return {
    name: 'minify-shipped-files',
    apply: 'build',
    configResolved(config) { outDir = config.build.outDir; },
    transformIndexHtml: {
      order: 'post',
      async handler(html) {
        const styles = [];
        for (const match of html.matchAll(/<style>([\s\S]*?)<\/style>/g)) {
          styles.push(transformCss({ filename: 'inline.css', code: Buffer.from(match[1]), minify: true }).code.toString());
        }
        let styleIndex = 0;
        return html
          .replace(/<style>[\s\S]*?<\/style>/g, () => `<style>${styles[styleIndex++]}</style>`)
          .replace(/(<script type=["']application\/ld\+json["']>)([\s\S]*?)(<\/script>)/g, (all, open, json, close) => open + JSON.stringify(JSON.parse(json)) + close)
          .replace(/<!--[\s\S]*?-->/g, '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .join('\n');
      },
    },
    closeBundle: {
      order: 'pre',
      sequential: true,
      async handler() {
        const file = `${outDir}/boot-splash.js`;
        const result = await minify(file, readFileSync(file, 'utf-8'));
        writeFileSync(file, result.code);
      },
    },
  };
};

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  // CSS modules expose their kebab-case class names as camelCase keys only
  // (`.prog--warm` is read as `cssModObj.progWarm`), per CLAUDE.md's
  // "CSS modules and JS hooks" rules.
  css: { modules: { localsConvention: 'camelCaseOnly' } },
  plugins: [
    react(),
    minifyShippedFiles(),
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
