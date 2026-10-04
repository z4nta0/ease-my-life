


// #region Imports

import globals    from 'globals';                   // What: Globals. Why: The browser's own globals have to be declared, or no-undef flags every window and document. How: Its browser set is spread into the src/ config's globals.
import react      from 'eslint-plugin-react';       // What: React. Why: no-undef can't see JSX element names, so an undefined component needs React's own rule. How: This registers the plugin behind react/jsx-no-undef.
import reactHooks from 'eslint-plugin-react-hooks'; // What: React Hooks. Why: Hook calls follow rules plain JS linting can't check. How: Its recommended rules are spread into the .jsx config.

// #endregion Imports



/**
 * eslint.config.js = ESLint Config
 *
 * @summary
 * The lint config. Every .js and .jsx file under src/ is checked by no-undef
 * and react/jsx-no-undef, with the browser's globals and __APP_VERSION__
 * declared, which catches a reference a rename missed. Every .jsx file also
 * gets the React Hooks plugin's recommended rules. No npm script runs it; it
 * runs only through npx eslint or an editor integration.
 *
 * Sections:
 *  - Constants
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const ESL_CON_ARR = [ // What: ESLint Config Array. Why: ESLint reads its flat config as an array of objects, each scoped to the files it lists. How: This holds the src/ undefined-reference config and the .jsx hooks config.


	{ // What: Source Config Object. Why: A reference a rename missed should fail lint everywhere under src/. How: This turns on the two undefined-reference rules for every .js and .jsx file there.


		files   : [ 'src/**/*.js', 'src/**/*.jsx' ],                        // What: Files. Why: Only the app's own source is linted by these rules. How: This lists two separate globs, since the brace-expansion override in package.json breaks ESLint's {a,b} matching.
		plugins : { react },                                                // What: Plugins. Why: react/jsx-no-undef comes from the React plugin. How: This registers it.
		rules   : { 'no-undef' : 'error', 'react/jsx-no-undef' : 'error' }, // What: Rules. Why: An undefined name, in JS or in a JSX tag, is always a bug. How: This makes both rules errors.

		languageOptions : { // What: Language Options. Why: The parser has to know the syntax and globals the source uses. How: This sets modern module syntax with JSX and declares the globals.


			ecmaVersion   : 'latest',                                             // What: Ecma Version. Why: The source uses current JavaScript syntax. How: This parses the latest version.
			globals       : { ...globals.browser, __APP_VERSION__ : 'readonly' }, // What: Globals. Why: Browser globals and the build-injected version would otherwise read as undefined. How: This declares the browser set plus __APP_VERSION__, which vite.config.js defines.
			parserOptions : { ecmaFeatures : { jsx : true } },                    // What: Parser Options. Why: The .jsx files contain JSX. How: This turns on JSX parsing.
			sourceType    : 'module'                                              // What: Source Type. Why: Every source file is an ES module. How: This parses import and export.


		}


	},

	{ // What: Jsx Config Object. Why: Hook calls in components follow rules of their own. How: This adds the React Hooks recommended rules for every .jsx file.


		files           : [ '**/*.jsx' ],                                        // What: Files. Why: Hooks only appear in .jsx files. How: This matches every one of them.
		languageOptions : { parserOptions : { ecmaFeatures : { jsx : true } } }, // What: Language Options. Why: These files contain JSX. How: This turns on JSX parsing.
		plugins         : { react, 'react-hooks' : reactHooks },                 // What: Plugins. Why: The hooks rules come from the React Hooks plugin. How: This registers it beside the React plugin.
		rules           : { ...reactHooks.configs.recommended.rules }            // What: Rules. Why: The plugin's recommended set is the standard hooks checks. How: This spreads it in.


	}


];

// #endregion Constants



// #region Exports

export default ESL_CON_ARR; // What: Default Export. Why: ESLint reads its config from this file's default export. How: This exports ESL_CON_ARR.

// #endregion Exports


