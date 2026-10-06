


// #region Imports

import react      from 'eslint-plugin-react';       // What: React. Why: An undefined component in a JSX tag should fail lint. How: This registers the plugin behind react/jsx-no-undef.
import reactHooks from 'eslint-plugin-react-hooks'; // What: React Hooks. Why: Hook calls follow rules plain JS linting can't check. How: Its recommended rules are spread into the .tsx config.
import tseslint   from 'typescript-eslint';         // What: TypeScript ESLint. Why: ESLint's default parser can't read TypeScript's type annotations. How: Its parser is set on both configs below; its own rules aren't turned on yet.

// #endregion Imports



/**
 * eslint.config.ts = ESLint Config
 *
 * @summary
 * The lint config, reading every file through typescript-eslint's parser so
 * type annotations parse. Every .ts and .tsx file under src/ is checked by
 * react/jsx-no-undef, which catches a component reference a rename missed.
 * ESLint's own no-undef is left off, as typescript-eslint recommends, since
 * TypeScript already reports every undefined name and no-undef can't see
 * TypeScript's type-only names (IDBTransactionMode, ...). Every .tsx file
 * also gets the React Hooks plugin's recommended rules, minus the
 * four React Compiler readiness rules, which only matter to an app built with
 * the React Compiler, which this one isn't. Generated output (dist/,
 * dev-dist/) is ignored. No npm script runs it; it runs only through npx
 * eslint or an editor integration.
 *
 * Sections:
 *  - Constants
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const ESL_CON_ARR = [ // What: ESLint Config Array. Why: ESLint reads its flat config as an array of objects, each scoped to the files it lists. How: This holds the generated-output ignores, the src/ undefined-component config, and the .tsx hooks config.


	{ ignores : [ 'dev-dist/**', 'dist/**' ] }, // What: Ignores Object. Why: The build output and the PWA plugin's dev service worker are generated, not hand-written, so their lint results mean nothing. How: This global ignores entry skips both folders for every config below; two globs, since braces break ESLint's matching here.

	{ // What: Source Config Object. Why: A component reference a rename missed should fail lint everywhere under src/. How: This turns on react/jsx-no-undef for every .ts and .tsx file there.


		files   : [ 'src/**/*.ts', 'src/**/*.tsx' ],  // What: Files. Why: Only the app's own source is linted by these rules. How: This lists two separate globs, since the brace-expansion override in package.json breaks ESLint's {a,b} matching.
		plugins : { react },                          // What: Plugins. Why: react/jsx-no-undef comes from the React plugin. How: This registers it.
		rules   : { 'react/jsx-no-undef' : 'error' }, // What: Rules. Why: An undefined component in a JSX tag is always a bug, and TypeScript reports every other undefined name. How: This makes the JSX rule an error.

		languageOptions : { // What: Language Options. Why: The parser has to know the syntax the source uses. How: This sets the TypeScript parser and modern module syntax with JSX.


			ecmaVersion   : 'latest',                          // What: Ecma Version. Why: The source uses current JavaScript syntax. How: This parses the latest version.
			parser        : tseslint.parser,                   // What: Parser. Why: The source is TypeScript, which ESLint's default parser can't read. How: This sets typescript-eslint's parser.
			parserOptions : { ecmaFeatures : { jsx : true } }, // What: Parser Options. Why: The .tsx files contain JSX. How: This turns on JSX parsing.
			sourceType    : 'module'                           // What: Source Type. Why: Every source file is an ES module. How: This parses import and export.


		}


	},

	{ // What: Jsx Config Object. Why: Hook calls in components follow rules of their own. How: This adds the React Hooks recommended rules for every .tsx file.


		files   : [ '**/*.tsx' ],                        // What: Files. Why: Hooks only appear in .tsx files. How: This matches every one of them.
		plugins : { react, 'react-hooks' : reactHooks }, // What: Plugins. Why: The hooks rules come from the React Hooks plugin. How: This registers it beside the React plugin.

		languageOptions : { // What: Language Options. Why: These files are TypeScript with JSX. How: This sets the TypeScript parser and turns on JSX parsing.


			parser        : tseslint.parser,                   // What: Parser. Why: ESLint's default parser can't read TypeScript. How: This sets typescript-eslint's parser.
			parserOptions : { ecmaFeatures : { jsx : true } }, // What: Parser Options. Why: These files contain JSX. How: This turns on JSX parsing.


		},

		rules : { // What: Rules. Why: The plugin's recommended set is the standard hooks checks, but four of its rules only judge whether a component suits the React Compiler, which this app doesn't use. How: This spreads the recommended set in, then turns those four off.


			...reactHooks.configs.recommended.rules, // What: Recommended Rules Spread. Why: These are the standard hooks checks, rules-of-hooks and exhaustive-deps among them. How: This spreads the plugin's recommended set in first, so the overrides below win.

			'react-hooks/preserve-manual-memoization' : 'off', // What: Preserve Manual Memoization Rule. Why: It only reports where the compiler would skip a component. How: This turns it off.
			'react-hooks/purity'                      : 'off', // What: Purity Rule. Why: It flags impure calls the compiler can't place, including ones that only run in event handlers. How: This turns it off.
			'react-hooks/refs'                        : 'off', // What: Refs Rule. Why: The app reads refs during render on purpose, for latest-value refs and frozen editor rows, which only conflicts with the compiler. How: This turns it off.
			'react-hooks/set-state-in-effect'         : 'off'  // What: Set State In Effect Rule. Why: Syncing or measuring into state inside an effect is a working React pattern that only costs an extra render outside the compiler. How: This turns it off.


		}


	}


];

// #endregion Constants



// #region Exports

export default ESL_CON_ARR; // What: Default Export. Why: ESLint reads its config from this file's default export. How: This exports ESL_CON_ARR.

// #endregion Exports


