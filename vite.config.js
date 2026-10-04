


// #region Imports

import react from '@vitejs/plugin-react'; // What: React. Why: Vite needs the React plugin to compile JSX. How: This is called first in the plugins array.


import { defineConfig           } from 'vite';            // What: Define Config. Why: Vite's config helper passes the config through with its types. How: This wraps vitConObj.
import { minify                 } from 'vite';            // What: Minify. Why: The shipped boot-splash.js needs minifying with the same minifier Vite uses for the bundle. How: This is called in minShiFun's closeBundle step.
import { readFileSync           } from 'node:fs';         // What: Read File Sync. Why: The config reads package.json, and the build step reads the copied boot-splash.js. How: This reads each file as UTF-8 text.
import { transform as traCssFun } from 'lightningcss';    // What: Transform Css Function. Why: index.html's inline styles need minifying, and Vite already depends on lightningcss. How: This is called through minCssFun in minShiFun's index.html step.
import { VitePWA                } from 'vite-plugin-pwa'; // What: Vite PWA. Why: The app installs and works offline through a generated service worker. How: This is called in the plugins array with its options.
import { writeFileSync          } from 'node:fs';         // What: Write File Sync. Why: The minified boot-splash.js replaces the copy Vite wrote. How: This writes it back to the output folder.

// #endregion Imports



/**
 * vite.config.js = Vite Config
 *
 * @summary
 * The build and dev server config. It injects the package version as
 * __APP_VERSION__, reads CSS module classes as camelCase keys, compiles React,
 * generates the PWA's service worker around the hand-written manifest, and,
 * for production builds only, minifies the files Vite ships as written:
 * index.html and the copied public/boot-splash.js and public/sw-notify.js.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const MIN_SCR_ARR = [ 'boot-splash.js', 'sw-notify.js' ]; // What: Minify Script Array. Why: Scripts in public/ ship exactly as written unless the build minifies them. How: This lists every public/ script minShiFun's closeBundle step minifies, by its name in the output folder.



const pacJsoObj = JSON.parse( readFileSync( new URL( './package.json', import.meta.url ), 'utf-8' ) ); // What: Package Json Object. Why: The About section and the support form's diagnostic field should report the version npm version set, rather than a hardcoded string that drifts. How: This reads package.json at build time for its version field.

// #endregion Constants



// #region Helpers

const minCssFun = ( styTexStr ) => traCssFun({ // What: Minify Css Function. Why: Each inline style in index.html is minified the same way. How: This runs lightningcss on the style's text and returns the result as a string.


	code     : Buffer.from( styTexStr ), // What: Code. Why: lightningcss reads its input as bytes. How: This passes the style's text as a buffer.
	filename : 'inline.css',             // What: Filename. Why: lightningcss names its input in any error it reports. How: This labels it as an inline style.
	minify   : true                      // What: Minify. Why: The style should ship without its comments and whitespace. How: This turns minification on.


}).code.toString(); // What: Minified Code String. Why: The caller splices the minified CSS back into the page as text. How: This reads lightningcss's output buffer and converts it to a string.



// #region minShiFun

/**
 * minShiFun = Minify Shipped Function
 *
 * @summary
 * Builds the Vite plugin that compacts the files Vite ships exactly as
 * written. Vite minifies the src/ bundle, but index.html and everything in
 * public/ keep the repo's full comments and formatting, so for production
 * builds only, this strips index.html's comments (its HTML ones, and the JS
 * ones inside an external script tag) and indentation, minifies its inline
 * styles with lightningcss and its JSON-LD, and minifies the copied public/
 * scripts listed in MIN_SCR_ARR with Vite's own minify. The boot splash
 * script stays its own file so the Content-Security-Policy's script-src can
 * stay 'self', and the service worker loads sw-notify.js by its fixed path.
 * The script step runs before the PWA plugin fingerprints the precache, so
 * each precached revision matches its minified file.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The plugin object, for the config's plugins array.
 *
 * @example
 * ```ts
 * minShiFun() // => { apply, closeBundle, configResolved, name, ... }
 * ```
 *
*/

const minShiFun = () => { // What: Minify Shipped Function. Why: index.html and public/ files ship as written unless something minifies them. How: This returns a build-only Vite plugin that does.


	let outDirStr = 'dist'; // What: Output Directory String. Why: The script step has to find the copied scripts in whatever folder the build writes to. How: configResolved replaces this default with the resolved build.outDir.



	return { // What: Plugin Object. Why: Vite runs a plugin's hooks during the build. How: This names the plugin, limits it to builds, and defines its three hooks.


		apply          : 'build',                                                  // What: Apply. Why: The dev server should serve the files as written. How: This runs the plugin only during npm run build.
		configResolved : ( conResObj ) => { outDirStr = conResObj.build.outDir; }, // What: Config Resolved Hook. Why: The output folder can be configured. How: This stores the resolved build.outDir in outDirStr.
		name           : 'minify-shipped-files',                                   // What: Name. Why: Vite reports a plugin's warnings and errors under its name. How: This names the plugin.

		closeBundle : { // What: Close Bundle Hook. Why: The public/ scripts are only copied into the output folder once the bundle is written. How: This minifies each copy in place, ahead of the PWA plugin's precache step.


			order      : 'pre', // What: Order. Why: The PWA plugin fingerprints the precache in its own closeBundle step. How: This runs ahead of it, so each precached revision matches its minified file.
			sequential : true,  // What: Sequential. Why: closeBundle hooks run in parallel by default, so ordering alone wouldn't hold the PWA plugin back. How: This makes Vite finish this hook before starting the next.

			handler : async () => { // What: Handler. Why: This is the step's actual work. How: This reads each copied script, minifies it, and writes it back.


				for ( const scrNamStr of MIN_SCR_ARR ) { // What: Script Name Loop. Why: Every listed script gets the same treatment. How: This minifies each one in turn.


					const filPatStr = `${ outDirStr }/${ scrNamStr }`;                               // What: File Path String. Why: The step works on the copy in the output folder, never the source in public/. How: This joins the output folder and the script's name.
					const minResObj = await minify( filPatStr, readFileSync( filPatStr, 'utf-8' ) ); // What: Minify Result Object. Why: The script should ship without its comments and formatting. How: This runs Vite's minifier on the file's text.


					writeFileSync( filPatStr, minResObj.code ); // What: Minified Script Write. Why: The minified script replaces the copy Vite wrote. How: This writes the minified code over it.


				}


			}


		},

		transformIndexHtml : { // What: Transform Index Html Hook. Why: Vite processes index.html but doesn't minify it. How: This compacts the page after Vite's own changes.


			order : 'post', // What: Order. Why: The page should be compacted only after Vite has injected the bundle's script and stylesheet tags. How: This runs after Vite's own transforms.

			handler : ( htmTexStr ) => { // What: Handler. Why: This is the page step's actual work. How: This minifies the inline styles and JSON-LD, strips comments, and drops indentation and blank lines.


				return htmTexStr                                                                               // What: Compacted Page Return. Why: Vite writes whatever this returns as the shipped page. How: This chains each compaction over the page's text.
					.replace( /(?<=<style>)[\s\S]*?(?=<\/style>)/g, minCssFun )                                // What: Style Minify. Why: Inline styles would ship with their comments and formatting. How: This minifies each style's text with minCssFun.
					.replace( /(?<=<script type=["']application\/ld\+json["']>)[\s\S]*?(?=<\/script>)/g, ( jsoTexStr ) => JSON.stringify( JSON.parse( jsoTexStr ) ) ) // What: Json-Ld Minify. Why: The structured data would ship indented. How: This parses and restringifies it without whitespace.
					.replace( /(<script\b[^>]*\bsrc=[^>]*>)\s*(?:\/\*[\s\S]*?\*\/\s*)+(<\/script>)/g, '$1$2' ) // What: External Script Comment Strip. Why: An external script's only content is its comment. How: This empties the tag.
					.replace( /<!--[\s\S]*?-->/g, '' )                                                         // What: Html Comment Strip. Why: Comments mean nothing to the browser. How: This removes every HTML comment.
					.split( '\n' )                                                                             // What: Line Split. Why: Indentation and blank lines are dropped line by line. How: This splits the page into lines.
					.map( ( linTexStr ) => linTexStr.trim() )                                                  // What: Indentation Trim. Why: Indentation means nothing to the browser. How: This trims each line.
					.filter( Boolean )                                                                         // What: Blank Line Filter. Why: Blank lines mean nothing to the browser. How: This drops every empty line.
					.join( '\n' );                                                                             // What: Line Join. Why: The page has to be one string again. How: This rejoins the remaining lines with newlines, which keep the spaces between words in wrapped text.


			}


		}


	};


};

// #endregion minShiFun



const vitConObj = defineConfig({ // What: Vite Config Object. Why: Vite reads its whole configuration from this file's default export. How: This builds the config, including the minShiFun plugin above.


	css    : { modules : { localsConvention : 'camelCaseOnly' } },      // What: Css. Why: CSS modules expose their kebab-case class names as camelCase keys only, so .prog--warm is read as cssModObj.progWarm, per CLAUDE.md's "CSS modules and JS hooks" rules. How: This sets the locals convention.
	define : { __APP_VERSION__ : JSON.stringify( pacJsoObj.version ) }, // What: Define. Why: The app reports its own version without a hardcoded string. How: This replaces __APP_VERSION__ with the package version at build time.

	plugins : [ // What: Plugins. Why: Vite builds the app through these plugins, in this order. How: This lists React, the minify step, and the PWA plugin.


		react(),     // What: React Plugin Call. Why: JSX has to compile. How: This adds the React plugin.
		minShiFun(), // What: Minify Shipped Plugin Call. Why: The shipped page and splash script should be minified. How: This adds the build-only minify plugin.

		VitePWA({ // What: Vite PWA Plugin Call. Why: The app needs a service worker to install and work offline. How: This adds the PWA plugin with its options.


			devOptions   : { enabled : true }, // What: Dev Options. Why: The service worker can be exercised with npm run dev, not only in a real build. How: This enables it on the dev server.
			manifest     : false,              // What: Manifest. Why: There is one manifest, the hand-tuned public/manifest.webmanifest linked from index.html, not a generated second one. How: This tells the plugin not to generate or inject its own. // To let the plugin own the manifest instead, delete the static file and its link in index.html, then move the JSON into a manifest: {...} option here.
			registerType : 'autoUpdate',       // What: Register Type. Why: A new deploy should reach users without a manual refresh prompt. How: This updates the service worker automatically.

			workbox : { // What: Workbox. Why: Workbox generates the service worker's precache. How: This sets what it precaches and what it imports.


				globPatterns  : [ '**/*.{js,css,html,svg,png,ico,woff2}' ], // What: Glob Patterns. Why: The whole built app should work offline. How: This precaches every built asset type, fonts included, since they're self-hosted under src/ and fingerprinted.
				importScripts : [ '/sw-notify.js' ]                         // What: Import Scripts. Why: Notifications need a click handler in the service worker, and generateSW keeps Workbox writing the precache instead of a hand-maintained worker. How: This adds public/sw-notify.js to the generated worker.


			}


		})


	]


});

// #endregion Helpers



// #region Exports

export default vitConObj; // What: Default Export. Why: Vite reads its config from this file's default export. How: This exports vitConObj.

// #endregion Exports


