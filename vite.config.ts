


// #region Imports

import react from '@vitejs/plugin-react'; // What: React. Why: Vite needs the React plugin to compile JSX. How: This is called first in the plugins array.


import { createElement          } from 'react';            // What: Create Element. Why: A legal document component has to become an element before it can be rendered to HTML. How: This is called in legPagFun's page step.
import { defineConfig           } from 'vite';             // What: Define Config. Why: Vite's config helper passes the config through with its types. How: This wraps vitConObj.
import { fileURLToPath          } from 'node:url';         // What: File URL To Path. Why: The legal documents' module has to be named by a file path. How: This turns its URL beside this config into one.
import { minify                 } from 'vite';             // What: Minify. Why: The shipped boot-splash.js needs minifying with the same minifier Vite uses for the bundle. How: This is called in minShiFun's closeBundle step.
import { readFileSync           } from 'node:fs';          // What: Read File Sync. Why: The config reads package.json, and the build step reads the copied boot-splash.js. How: This reads each file as UTF-8 text.
import { renderToStaticMarkup   } from 'react-dom/server'; // What: Render To Static Markup. Why: The legal pages have to carry their document as plain HTML, readable without JavaScript. How: This is called in legPagFun's page step.
import { runnerImport           } from 'vite';             // What: Runner Import. Why: The legal documents are TSX, which Node can't load on its own. How: This loads them through Vite's module runner in legPagFun's page step.
import { transform as traCssFun } from 'lightningcss';     // What: Transform Css Function. Why: index.html's inline styles need minifying, and Vite already depends on lightningcss. How: This is called through minCssFun in minShiFun's index.html step.
import { VitePWA                } from 'vite-plugin-pwa';  // What: Vite PWA. Why: The app installs and works offline through a generated service worker. How: This is called in the plugins array with its options.
import { writeFileSync          } from 'node:fs';          // What: Write File Sync. Why: The minified boot-splash.js replaces the copy Vite wrote. How: This writes it back to the output folder.


import type { FunctionComponent } from 'react'; // What: Function Component. Why: The legal documents' module is loaded at run time, so its shape is declared here. How: This types each document in LegTexTyp.
import type { Plugin            } from 'vite';  // What: Plugin. Why: The legal pages step and the shipped-files minifier are Vite plugins. How: This types the returns of legPagFun and minShiFun, which type each of their hooks.

// #endregion Imports



/**
 * vite.config.ts = Vite Config
 *
 * @summary
 * The build and dev server config. It injects the package version as
 * __APP_VERSION__, reads CSS module classes as camelCase keys, compiles React,
 * builds the standalone legal pages beside the app with their documents
 * rendered in, generates the PWA's service worker around the hand-written
 * manifest, and, for production builds only, minifies the files Vite ships as
 * written, such as index.html and the copied public/ scripts. It also raises
 * the chunk size warning to 1000 kB, since the main bundle is past Vite's
 * default 500 kB.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type LegTexTyp = Record< 'PriPolCom' | 'TerSerCom', FunctionComponent >; // What: Legal Text Type. Why: legPagFun reads the two documents from the module it loads at run time. How: This types that module's exports.

// #endregion Types



// #region Constants

const LEG_DOC_REG = /data-legal-document-body='(privacy|terms)'\s*>(?=<\/article>)/;                         // What: Legal Document Regular Expression. Why: A legal page marks where its document goes. How: This matches the end of an empty article's opening tag that names a document, capturing the name.
const LEG_TEX_PAT = fileURLToPath( new URL( './src/tabs/settings/legal-text.tsx', import.meta.url ) ); // What: Legal Text Path. Why: The documents live in one module the Settings modal shares. How: This is that module's absolute path, built from this config's own address.
const MIN_SCR_ARR = [ 'boot-splash.js', 'sw-notify.js' ];                                            // What: Minify Script Array. Why: Scripts in public/ ship exactly as written unless the build minifies them. How: This lists every public/ script minShiFun's closeBundle step minifies, by its name in the output folder.



const pacJsoObj = JSON.parse( readFileSync( new URL( './package.json', import.meta.url ), 'utf-8' ) ); // What: Package Json Object. Why: The About section and the support form's diagnostic field should report the version npm version set, rather than a hardcoded string that drifts. How: This reads package.json at build time for its version field.

// #endregion Constants



// #region Helpers

const minCssFun = ( styTexStr : string ) => traCssFun({ // What: Minify Css Function. Why: Each inline style in index.html is minified the same way. How: This runs lightningcss on the style's text and returns the result as a string.


	code     : Buffer.from( styTexStr ), // What: Code. Why: lightningcss reads its input as bytes. How: This passes the style's text as a buffer.
	filename : 'inline.css',             // What: Filename. Why: lightningcss names its input in any error it reports. How: This labels it as an inline style.
	minify   : true                      // What: Minify. Why: The style should ship without its comments and whitespace. How: This turns minification on.


}).code.toString(); // What: Minified Code String. Why: The caller splices the minified CSS back into the page as text. How: This reads lightningcss's output buffer and converts it to a string.



// #region legPagFun

/**
 * legPagFun = Legal Pages Function
 *
 * @summary
 * Builds the Vite plugin that fills the standalone legal pages, privacy.html
 * and terms.html, with their documents. Each page holds an empty article
 * whose data-legal-document-body attribute names its document. For a page
 * with one, in dev and in builds, the plugin loads legal-text.tsx through
 * Vite's module runner, renders the named component to static HTML, and
 * places it inside the article, so the pages carry the same text as the
 * Settings modal, readable without JavaScript. Every other page passes
 * through unchanged.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The plugin object, for the config's plugins array.
 *
 * @example
 * ```ts
 * legPagFun() // => { name, transformIndexHtml }
 * ```
 *
*/

const legPagFun = () : Plugin => ({ // What: Legal Pages Function. Why: The legal pages' documents have to be rendered in from their shared module. How: This returns the plugin that does it.


	name : 'legal-pages', // What: Name. Why: Vite reports a plugin's warnings and errors under its name. How: This names the plugin.

	transformIndexHtml : async ( htmTexStr ) => { // What: Transform Index Html Hook. Why: Vite hands every page it serves or builds to this hook. How: This renders a legal page's document into it and returns the page.


		const docMatArr = htmTexStr.match( LEG_DOC_REG ); // What: Document Match Array. Why: Only a page that names a document has one to render. How: This finds the article's marker and captures the document's name.


		if ( !docMatArr ) return htmTexStr; // What: No Document Guard. Why: The app's own page holds no legal document. How: This returns any page without a marker unchanged.



		const { module : legTexObj } = await runnerImport< LegTexTyp >( LEG_TEX_PAT, { configFile : false } ); // What: Legal Text Object. Why: The documents are TSX, which Node can't load on its own. How: This loads the module through Vite's runner, without loading this config again inside it.

		const docComFun = docMatArr[ 1 ] === 'privacy' ? legTexObj.PriPolCom : legTexObj.TerSerCom; // What: Document Component Function. Why: Each page shows its own document. How: This picks the component the marker names.



		return htmTexStr.replace( LEG_DOC_REG, ( matTexStr ) => matTexStr + renderToStaticMarkup( createElement( docComFun ) ) ); // What: Filled Page Return. Why: Vite serves or writes whatever this returns. How: This places the document's static HTML right after the article's opening tag.


	}


});

// #endregion legPagFun



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

const minShiFun = () : Plugin => { // What: Minify Shipped Function. Why: index.html and public/ files ship as written unless something minifies them. How: This returns a build-only Vite plugin that does.


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

	build : { // What: Build. Why: The production build needs its pages and its warning threshold set. How: This lists both.


		chunkSizeWarningLimit : 1000,                                                  // What: Chunk Size Warning Limit. Why: The main bundle (about 917 kB before gzip) is past Vite's default 500 kB chunk warning, which would otherwise fire on every build. How: This raises the warning threshold to 1000 kB.
		rolldownOptions       : { input : [ 'index.html', 'privacy.html', 'terms.html' ] } // What: Rolldown Options. Why: The legal pages are built as pages of their own, beside the app. How: This lists every HTML page the build starts from.


	},

	plugins : [ // What: Plugins. Why: Vite builds the app through these plugins, in this order. How: This lists React, the legal pages step, the minify step, and the PWA plugin.


		react(),     // What: React Plugin Call. Why: JSX has to compile. How: This adds the React plugin.
		legPagFun(), // What: Legal Pages Plugin Call. Why: The legal pages need their documents rendered in before the minify step compacts them. How: This adds the legal pages plugin ahead of it.
		minShiFun(), // What: Minify Shipped Plugin Call. Why: The shipped pages and splash script should be minified. How: This adds the build-only minify plugin.

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


