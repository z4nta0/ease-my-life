


// #region Imports

import { reduceMotion } from './ui.jsx'; // What: Reduce Motion. Why: The palette cross-fade should be skipped for a user who prefers reduced motion. How: This is called inside appPalFun to gate the theme-animating class toggle.

// #endregion Imports



const PAL_SET_OBJ = { // What: Palette Set Object. Why: This is the app's fixed set of built-in color themes, each a full 8-token palette plus a display name. How: This is read directly by resTheFun/appPalFun and exported for the Settings tab's theme picker.


	ink : { // What: Ink Palette Object. Why: This is one of the app's built-in themes. How: This holds Ink's own 8 color tokens plus display name, read via PAL_SET_OBJ[theKeyStr] dynamic lookup when this key is the active theme.


		namStr : 'Ink',                    // What: Name String. Why: This is the human-readable label shown in the Settings tab's theme picker. How: This is read as palette.namStr in tab-settings.jsx's ThemeRow.
		bacStr : 'oklch(0.985 0.003 240)', // What: Background String. Why: This is the page's own base background color token. How: This is written onto the --bg custom property by appPalFun.
		surStr : 'oklch(0.975 0.004 240)', // What: Surface String. Why: This is the color token for card/surface backgrounds. How: This is written onto the --surface custom property by appPalFun.
		borStr : 'oklch(0.91 0.005 240)',  // What: Border String. Why: This is the color token for border colors. How: This is written onto the --border custom property by appPalFun.
		texStr : 'oklch(0.17 0.012 250)',  // What: Text String. Why: This is the color token for body text. How: This is written onto the --text custom property by appPalFun.
		mutStr : 'oklch(0.5 0.012 250)',   // What: Muted String. Why: This is the color token for de-emphasized text. How: This is written onto the --muted custom property by appPalFun.
		accStr : 'oklch(0.5 0.14 250)',    // What: Accent String. Why: This is the color token for the primary accent color. How: This is written onto the --accent custom property by appPalFun.
		aceStr : 'oklch(0.95 0.025 250)',  // What: Accent Soft String. Why: This is the color token for a softened accent background. How: This is written onto the --accent-soft custom property by appPalFun.
		warStr : 'oklch(0.62 0.13 50)'     // What: Warm String. Why: This is the color token for the warm/celebration accent color. How: This is written onto the --warm custom property by appPalFun.


	},

	sage : { // What: Sage Palette Object. Why: This is one of the app's built-in themes. How: This holds Sage's own 8 color tokens plus display name, read via PAL_SET_OBJ[theKeyStr] dynamic lookup when this key is the active theme.


		namStr : 'Sage',                   // What: Name String. Why: This is the human-readable label shown in the Settings tab's theme picker. How: This is read as palette.namStr in tab-settings.jsx's ThemeRow.
		bacStr : 'oklch(0.985 0.005 130)', // What: Background String. Why: This is the page's own base background color token. How: This is written onto the --bg custom property by appPalFun.
		surStr : 'oklch(0.97 0.008 130)',  // What: Surface String. Why: This is the color token for card/surface backgrounds. How: This is written onto the --surface custom property by appPalFun.
		borStr : 'oklch(0.9 0.012 130)',   // What: Border String. Why: This is the color token for border colors. How: This is written onto the --border custom property by appPalFun.
		texStr : 'oklch(0.19 0.015 150)',  // What: Text String. Why: This is the color token for body text. How: This is written onto the --text custom property by appPalFun.
		mutStr : 'oklch(0.5 0.012 150)',   // What: Muted String. Why: This is the color token for de-emphasized text. How: This is written onto the --muted custom property by appPalFun.
		accStr : 'oklch(0.48 0.09 155)',   // What: Accent String. Why: This is the color token for the primary accent color. How: This is written onto the --accent custom property by appPalFun.
		aceStr : 'oklch(0.95 0.03 150)',   // What: Accent Soft String. Why: This is the color token for a softened accent background. How: This is written onto the --accent-soft custom property by appPalFun.
		warStr : 'oklch(0.62 0.12 60)'     // What: Warm String. Why: This is the color token for the warm/celebration accent color. How: This is written onto the --warm custom property by appPalFun.


	},

	sand : { // What: Sand Palette Object. Why: This is one of the app's built-in themes. How: This holds Sand's own 8 color tokens plus display name, read via PAL_SET_OBJ[theKeyStr] dynamic lookup when this key is the active theme.


		namStr : 'Sand',                 // What: Name String. Why: This is the human-readable label shown in the Settings tab's theme picker. How: This is read as palette.namStr in tab-settings.jsx's ThemeRow.
		bacStr : 'oklch(0.98 0.008 80)', // What: Background String. Why: This is the page's own base background color token. How: This is written onto the --bg custom property by appPalFun.
		surStr : 'oklch(0.96 0.012 80)', // What: Surface String. Why: This is the color token for card/surface backgrounds. How: This is written onto the --surface custom property by appPalFun.
		borStr : 'oklch(0.9 0.015 75)',  // What: Border String. Why: This is the color token for border colors. How: This is written onto the --border custom property by appPalFun.
		texStr : 'oklch(0.2 0.018 50)',  // What: Text String. Why: This is the color token for body text. How: This is written onto the --text custom property by appPalFun.
		mutStr : 'oklch(0.5 0.018 50)',  // What: Muted String. Why: This is the color token for de-emphasized text. How: This is written onto the --muted custom property by appPalFun.
		accStr : 'oklch(0.5 0.12 40)',   // What: Accent String. Why: This is the color token for the primary accent color. How: This is written onto the --accent custom property by appPalFun.
		aceStr : 'oklch(0.94 0.03 60)',  // What: Accent Soft String. Why: This is the color token for a softened accent background. How: This is written onto the --accent-soft custom property by appPalFun.
		warStr : 'oklch(0.6 0.14 30)'    // What: Warm String. Why: This is the color token for the warm/celebration accent color. How: This is written onto the --warm custom property by appPalFun.


	},

	night : { // What: Night Palette Object. Why: This is one of the app's built-in themes. How: This holds Night's own 8 color tokens plus display name, read via PAL_SET_OBJ[theKeyStr] dynamic lookup when this key is the active theme.


		namStr : 'Night',                 // What: Name String. Why: This is the human-readable label shown in the Settings tab's theme picker. How: This is read as palette.namStr in tab-settings.jsx's ThemeRow.
		bacStr : 'oklch(0.18 0.012 250)', // What: Background String. Why: This is the page's own base background color token. How: This is written onto the --bg custom property by appPalFun.
		surStr : 'oklch(0.22 0.014 250)', // What: Surface String. Why: This is the color token for card/surface backgrounds. How: This is written onto the --surface custom property by appPalFun.
		borStr : 'oklch(0.3 0.014 250)',  // What: Border String. Why: This is the color token for border colors. How: This is written onto the --border custom property by appPalFun.
		texStr : 'oklch(0.95 0.005 250)', // What: Text String. Why: This is the color token for body text. How: This is written onto the --text custom property by appPalFun.
		mutStr : 'oklch(0.65 0.012 250)', // What: Muted String. Why: This is the color token for de-emphasized text. How: This is written onto the --muted custom property by appPalFun.
		accStr : 'oklch(0.75 0.14 250)',  // What: Accent String. Why: This is the color token for the primary accent color. How: This is written onto the --accent custom property by appPalFun.
		aceStr : 'oklch(0.3 0.04 250)',   // What: Accent Soft String. Why: This is the color token for a softened accent background. How: This is written onto the --accent-soft custom property by appPalFun.
		warStr : 'oklch(0.78 0.13 60)'    // What: Warm String. Why: This is the color token for the warm/celebration accent color. How: This is written onto the --warm custom property by appPalFun.


	},

	moss : { // What: Moss Palette Object. Why: This is one of the app's built-in themes. How: This holds Moss's own 8 color tokens plus display name, read via PAL_SET_OBJ[theKeyStr] dynamic lookup when this key is the active theme.


		namStr : 'Moss',                  // What: Name String. Why: This is the human-readable label shown in the Settings tab's theme picker. How: This is read as palette.namStr in tab-settings.jsx's ThemeRow.
		bacStr : 'oklch(0.17 0.01 150)',  // What: Background String. Why: This is the page's own base background color token. How: This is written onto the --bg custom property by appPalFun.
		surStr : 'oklch(0.21 0.014 150)', // What: Surface String. Why: This is the color token for card/surface backgrounds. How: This is written onto the --surface custom property by appPalFun.
		borStr : 'oklch(0.28 0.016 150)', // What: Border String. Why: This is the color token for border colors. How: This is written onto the --border custom property by appPalFun.
		texStr : 'oklch(0.95 0.008 150)', // What: Text String. Why: This is the color token for body text. How: This is written onto the --text custom property by appPalFun.
		mutStr : 'oklch(0.65 0.012 150)', // What: Muted String. Why: This is the color token for de-emphasized text. How: This is written onto the --muted custom property by appPalFun.
		accStr : 'oklch(0.7 0.1 155)',    // What: Accent String. Why: This is the color token for the primary accent color. How: This is written onto the --accent custom property by appPalFun.
		aceStr : 'oklch(0.3 0.035 150)',  // What: Accent Soft String. Why: This is the color token for a softened accent background. How: This is written onto the --accent-soft custom property by appPalFun.
		warStr : 'oklch(0.78 0.13 60)'    // What: Warm String. Why: This is the color token for the warm/celebration accent color. How: This is written onto the --warm custom property by appPalFun.


	},

	ember : { // What: Ember Palette Object. Why: This is one of the app's built-in themes. How: This holds Ember's own 8 color tokens plus display name, read via PAL_SET_OBJ[theKeyStr] dynamic lookup when this key is the active theme.


		namStr : 'Ember',                // What: Name String. Why: This is the human-readable label shown in the Settings tab's theme picker. How: This is read as palette.namStr in tab-settings.jsx's ThemeRow.
		bacStr : 'oklch(0.17 0.014 45)', // What: Background String. Why: This is the page's own base background color token. How: This is written onto the --bg custom property by appPalFun.
		surStr : 'oklch(0.21 0.016 45)', // What: Surface String. Why: This is the color token for card/surface backgrounds. How: This is written onto the --surface custom property by appPalFun.
		borStr : 'oklch(0.28 0.018 45)', // What: Border String. Why: This is the color token for border colors. How: This is written onto the --border custom property by appPalFun.
		texStr : 'oklch(0.95 0.012 50)', // What: Text String. Why: This is the color token for body text. How: This is written onto the --text custom property by appPalFun.
		mutStr : 'oklch(0.65 0.016 50)', // What: Muted String. Why: This is the color token for de-emphasized text. How: This is written onto the --muted custom property by appPalFun.
		accStr : 'oklch(0.72 0.13 42)',  // What: Accent String. Why: This is the color token for the primary accent color. How: This is written onto the --accent custom property by appPalFun.
		aceStr : 'oklch(0.32 0.05 42)',  // What: Accent Soft String. Why: This is the color token for a softened accent background. How: This is written onto the --accent-soft custom property by appPalFun.
		warStr : 'oklch(0.78 0.13 60)'   // What: Warm String. Why: This is the color token for the warm/celebration accent color. How: This is written onto the --warm custom property by appPalFun.


	}


};



let __palAppBoo = false; // What: Palette Applied Boolean. Why: The very first palette application (initial page load) must never cross-fade, only later theme swaps should. How: This starts false and is set true at the end of appPalFun's first run.
let __tatIdeNum = null;  // What: Theme-Animation-Timeout Identifier Number. Why: A running cross-fade class needs to be removed again after its own duration, and a fast repeat swap must cancel the previous removal instead of racing it. How: This holds the current setTimeout id, cleared and reassigned on every appPalFun call that starts a new cross-fade.
let __lasPalStr = null;  // What: Last Palette String. Why: The cross-fade should only run when the resolved palette's actual colors changed, not on every re-application. How: This holds the previous call's color signature string, compared against the current one below.



// #region appPalFun

/**
 * appPalFun = Apply Palette Function
 *
 * @summary
 * Applies a full 8-token palette object (a PAL_SET_OBJ entry, or a
 * derived custom one built by resCusFun) directly onto the document
 * root as CSS custom properties, and records the active palette name
 * for CSS that keys off it. Cross-fades the themable properties on
 * every change after the first, so the initial page load never
 * animates but every later user-driven theme swap does. Also keeps the
 * installed PWA's status-bar tint in sync with the newly-applied
 * background color.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param palResObj - Palette Resolved Object: The full 8-token palette object
 *                    to apply (bacStr, surStr, borStr, texStr, mutStr, accStr,
 *                    aceStr, warStr), either a PAL_SET_OBJ entry or a derived
 *                    custom palette from resCusFun.
 * @param theKeyStr - Theme Key String: The resolved theme key this palette
 *                    corresponds to (e.g. 'ink', 'customLight'), written onto
 *                    document.body's dataset for CSS to key off.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * appPalFun(palResObj, theKeyStr) // => void
 * ```
 *
*/

function appPalFun( palResObj, theKeyStr ) {


	const palSigStr = [ palResObj.bacStr, palResObj.surStr, palResObj.texStr, palResObj.accStr, palResObj.aceStr, palResObj.borStr, palResObj.mutStr, palResObj.warStr ].join( '|' ); // What: Palette Signature String. Why: Detecting an actual color change requires comparing against what was last applied, not just re-running on every call. How: This joins every token into one comparable string.
	const palChaBoo = palSigStr !== __lasPalStr;                                                                                                                                      // What: Palette Changed Boolean. Why: The cross-fade must only run when the resolved colors actually differ from last time. How: This compares the freshly-built signature against the previous call's stored one.

	__lasPalStr = palSigStr; // What: Last Palette String Update. Why: The next call needs to compare against what is current now. How: This overwrites __lasPalStr with the freshly-computed signature.


	if ( __palAppBoo && palChaBoo && !reduceMotion() ) { // What: Cross-Fade Trigger Check. Why: The cross-fade should only play when a palette had already been applied before, the resolved colors actually changed, and the user doesn't prefer reduced motion. How: This gates the class-add/timeout block below on all three conditions holding at once.


		const docRooEle = document.documentElement; // What: Document Root Element. Why: The cross-fade class toggles on the root element, which is what the app's CSS transition rules key off. How: This is read once and reused for both the add and remove below.

		docRooEle.classList.add( 'theme-animating' ); // What: Theme Animating Class Add. Why: This is the actual class the app's CSS uses to enable a brief cross-fade transition on the themable custom properties. How: This adds the class to the root element immediately, before the new values are written below.


		clearTimeout( __tatIdeNum ); // What: Theme-Animation-Timeout Identifier Number Clear. Why: A fast repeat theme swap must not let an earlier removal fire after this newer swap's own class add. How: This cancels whatever removal was previously scheduled.

		__tatIdeNum = setTimeout( () => docRooEle.classList.remove( 'theme-animating' ), 480 ); // What: Theme-Animation-Timeout Identifier Number Schedule. Why: The cross-fade class must not stay on indefinitely, only for the duration of the transition. How: This schedules the class's removal 480ms later, matching the CSS transition's own duration.


	}


	__palAppBoo = true; // What: Palette Applied Boolean Update. Why: Every call after this one is a real theme swap, eligible for the cross-fade above. How: This is set true unconditionally, once, on the very first call.

	const rooStyObj = document.documentElement.style; // What: Root Style Object. Why: Every custom property write below targets the same style object. How: This is read once and reused for all 8 setProperty calls that follow.

	rooStyObj.setProperty( '--bg', palResObj.bacStr );          // What: Background Property Write. Why: This is the actual CSS custom property the app's stylesheets read for the page background. How: This writes the palette's bacStr token onto the root element's inline style.
	rooStyObj.setProperty( '--surface', palResObj.surStr );     // What: Surface Property Write. Why: This is the actual CSS custom property the app's stylesheets read for card/surface backgrounds. How: This writes the palette's surStr token onto the root element's inline style.
	rooStyObj.setProperty( '--border', palResObj.borStr );      // What: Border Property Write. Why: This is the actual CSS custom property the app's stylesheets read for border colors. How: This writes the palette's borStr token onto the root element's inline style.
	rooStyObj.setProperty( '--text', palResObj.texStr );        // What: Text Property Write. Why: This is the actual CSS custom property the app's stylesheets read for body text color. How: This writes the palette's texStr token onto the root element's inline style.
	rooStyObj.setProperty( '--muted', palResObj.mutStr );       // What: Muted Property Write. Why: This is the actual CSS custom property the app's stylesheets read for de-emphasized text color. How: This writes the palette's mutStr token onto the root element's inline style.
	rooStyObj.setProperty( '--accent', palResObj.accStr );      // What: Accent Property Write. Why: This is the actual CSS custom property the app's stylesheets read for the primary accent color. How: This writes the palette's accStr token onto the root element's inline style.
	rooStyObj.setProperty( '--accent-soft', palResObj.aceStr ); // What: Accent Soft Property Write. Why: This is the actual CSS custom property the app's stylesheets read for a softened accent background. How: This writes the palette's aceStr token onto the root element's inline style.
	rooStyObj.setProperty( '--warm', palResObj.warStr );        // What: Warm Property Write. Why: This is the actual CSS custom property the app's stylesheets read for the warm/celebration accent color. How: This writes the palette's warStr token onto the root element's inline style.


	document.body.dataset.palette = theKeyStr || 'custom'; // What: Palette Dataset Write. Why: Some CSS keys off which specific palette is active, not just its raw token values. How: This writes the resolved theme key, or 'custom' if none was given, onto body's own dataset.


	syncTinFun( palResObj.bacStr ); // What: Status Bar Tint Sync Call. Why: An installed PWA's status bar should follow the newly-applied background color too. How: This hands the resolved background color to syncTinFun.


}

// #endregion appPalFun



let __tinProObj = null; // What: Tint Probe Object. Why: Resolving a CSS color string to hex needs a real canvas 2D context, which is comparatively expensive to create. How: This caches the first successfully-created context so later calls reuse it instead of creating a new canvas each time.



// #region toHexFun

/**
 * toHexFun = To Hex Function
 *
 * @summary
 * Resolves an arbitrary CSS color string (palettes are authored in
 * oklch()) down to a plain hex string, by round-tripping it through a
 * scratch canvas's 2D context: assigning the color to fillStyle and
 * reading it back always yields a browser-normalized hex value, since
 * that is the one color format every UA is guaranteed to parse for a
 * PWA manifest/meta theme-color.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param cssColStr - Css Color String: The CSS color string to resolve, e.g.
 *                    an oklch() palette token.
 *
 * @returns A hex color string (e.g. '#a1b2c3'), or null if the browser
 * cannot parse the given color or does not support a 2D canvas context
 * at all.
 *
 * @example
 * ```ts
 * toHexFun(cssColStr) // => hex color string or null
 * ```
 *
*/

function toHexFun( cssColStr ) {


	try { // What: Fill Style Probe Try. Why: Assigning an unsupported color to a canvas context's fillStyle could throw in some environments rather than silently no-op. How: This wraps the whole probe-and-resolve sequence below so any such error is caught and treated as an ordinary parse failure.


		if ( window.CSS && CSS.supports && !CSS.supports( 'color', cssColStr ) ) return null; // What: Unsupported Color Guard. Why: Some very old browsers may not recognize a given color syntax at all, such as oklch(). How: This bails out early with null when the CSS.supports API exists and reports the color as unparseable.


		if ( !__tinProObj ) { // What: No Probe Object Check. Why: The scratch canvas 2D context only needs to be created once, ever. How: This gates the creation block below so it only runs on the very first call.


			const canProEle = document.createElement( 'canvas' ); // What: Canvas Probe Element. Why: A canvas 2D context is the mechanism used to normalize the color below. How: This creates a fresh, unattached canvas purely to obtain its context.

			__tinProObj = canProEle.getContext && canProEle.getContext( '2d' ); // What: Tint Probe Object Assignment. Why: The created canvas must actually support a 2D context for this technique to work at all. How: This guards the getContext call itself and caches whatever it returns, including undefined.


		}


		if ( !__tinProObj ) return null; // What: No Probe Guard. Why: Without a working 2D context there is no way to resolve the color at all. How: This bails out with null when canvas 2D support is unavailable.


		__tinProObj.fillStyle = '#000000'; // What: Fill Style Reset. Why: fillStyle silently ignores an invalid assignment rather than throwing, so a stale previous value could otherwise be mistaken for a successful parse. How: This resets fillStyle to a known value before attempting the real assignment below.

		__tinProObj.fillStyle = cssColStr; // What: Fill Style Assignment. Why: This is the actual parse step; the browser normalizes whatever valid color string is assigned here. How: This assigns the given CSS color string, which silently no-ops if it fails to parse.

		const hexResStr = __tinProObj.fillStyle; // What: Hex Result String. Why: Reading fillStyle back after assignment is what yields the browser's normalized value. How: This reads the (possibly unchanged, on parse failure) current fillStyle value.



		return typeof hexResStr === 'string' && hexResStr.charAt( 0 ) === '#' ? hexResStr : null; // What: Hex Result Return. Why: A failed parse leaves fillStyle at its prior value, which this codebase always resets to a non-hex sentinel first, so this is what actually detects success. How: This returns the read-back value only when it is a real hex string, null otherwise.


	}

	catch ( e ) { return null; } // What: Parse Error Guard. Why: Some environments could throw rather than silently no-op on an invalid assignment. How: This catches any such error and returns null, same as an ordinary parse failure.


}

// #endregion toHexFun



// #region syncTinFun

/**
 * syncTinFun = Sync Tint Function
 *
 * @summary
 * Keeps an installed PWA's status-bar tint in sync with the app's own
 * in-app theme and palette choice. A manifest's theme_color is static
 * and has no media-query support, which is why the light/dark
 * <meta name="theme-color"> pair in index.html only works in a browser
 * tab, not once installed. Chrome on Android does honor runtime changes
 * to the meta tag in standalone mode, so this rewrites it on every
 * palette application instead, collapsing the light/dark pair down to
 * one tag JS now fully owns.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param bacColStr - Background Color String: The resolved background color to
 *                    tint the status bar with, in any CSS color syntax
 *                    toHexFun accepts.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * syncTinFun(bacColStr) // => void
 * ```
 *
*/

function syncTinFun( bacColStr ) {


	const hexResStr = toHexFun( bacColStr ); // What: Hex Result String. Why: A <meta name="theme-color"> tag's content must be a color the UA will definitely parse. How: This resolves the given background color down to a plain hex string.

	if ( !hexResStr ) return; // What: No Hex Guard. Why: There is nothing safe to write if the color could not be resolved. How: This bails out early, leaving whatever theme-color tag already exists untouched.


	const metTagLis = document.querySelectorAll( 'meta[name="theme-color"]' ); // What: Meta Tag List. Why: index.html ships a light/dark pair of theme-color tags, both of which need collapsing down to one. How: This finds every existing theme-color meta tag, in document order.

	let priMetEle = null; // What: Primary Meta Element And Setter. Why: Exactly one theme-color tag should survive; every other one gets removed below. How: This starts null and is assigned the first tag found in the loop that follows.

	for ( const metCurEle of metTagLis ) { // What: Meta Tag Loop. Why: Every existing theme-color tag must be visited once, to keep the first and discard the rest. How: This iterates metTagLis in document order.


		if ( !priMetEle ) priMetEle = metCurEle; // What: Primary Assignment Guard. Why: Only the very first tag encountered should be kept. How: This assigns priMetEle once, on the first iteration only.

		else metCurEle.remove(); // What: Duplicate Meta Removal. Why: A second static tag with a stale media attribute would stop matching once the in-app theme and the OS preference disagree. How: This removes every theme-color tag after the first.


	}


	if ( !priMetEle ) { // What: No Primary Meta Element Check. Why: index.html may not ship a theme-color tag at all in some old/edited builds. How: This gates the creation block below so a fresh tag is only made when none already survived the loop above.


		priMetEle = document.createElement( 'meta' ); // What: Primary Meta Element Creation. Why: Some old persisted markup, or a future index.html edit, might ship with no theme-color tag at all. How: This creates a fresh meta element to fill that gap.

		priMetEle.setAttribute( 'name', 'theme-color' ); // What: Meta Name Attribute. Why: This is what makes the created element an actual theme-color tag rather than an inert one. How: This sets the standard name attribute UAs look for.

		document.head.appendChild( priMetEle ); // What: Meta Element Append Call. Why: An element with no parent has no effect on the page at all. How: This inserts the newly-created tag into the document head.


	}


	priMetEle.removeAttribute( 'media' ); // What: Media Attribute Removal. Why: A leftover light/dark media query would stop matching once the in-app theme and OS preference disagree. How: This strips any media attribute the surviving tag may have shipped with.

	priMetEle.setAttribute( 'content', hexResStr ); // What: Content Attribute Write. Why: This is the actual value the UA reads to tint the status bar. How: This writes the freshly-resolved hex color onto the surviving tag.


}

// #endregion syncTinFun



// #region resCusFun

/**
 * resCusFun = Resolve Custom Function
 *
 * @summary
 * Builds a full 8-token palette from the 3 colors a Custom theme lets
 * the user pick (background, text, accent), using CSS relative-color
 * syntax so the derived tokens (surface/border/muted/accentSoft) are
 * computed by the browser itself off the literal color the user chose,
 * with no color-math library needed here. Dark mode floors the derived
 * lightness rather than using a plain offset, since a plain offset
 * breaks down at the black end of the gamma-encoded sRGB scale (a flat
 * +0.04 lightness step lands very differently near true black than it
 * does a few steps away from it); light mode has no matching hazard, so
 * it keeps the plain offset.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param modKeyStr - Mode Key String: Either 'light' or 'dark'; flips which
 *                    direction the derived surface/border/muted/accentSoft
 *                    tokens move away from the user's own chosen colors.
 * @param usrColObj - User Color Object: The user's own 3 chosen colors: { bg,
 *                    text, accent }. This is a separate, persisted contract
 *                    from the returned palette shape below, so its own
 *                    bg/text/ accent keys stay as-is rather than following the
 *                    palette-shape renames.
 *
 * @returns A full 8-token palette object in the same shape as a
 * PAL_SET_OBJ entry, ready to hand to appPalFun.
 *
 * @example
 * ```ts
 * resCusFun(modKeyStr, usrColObj) // => full palette object
 * ```
 *
*/

function resCusFun( modKeyStr, usrColObj ) {


	const bacColStr = usrColObj.bg;     // What: Background Color String. Why: This is one of the 3 user-chosen anchor colors every derived token is computed relative to. How: This is read once from usrColObj.bg and reused in the returned object and the relative-color expressions below.
	const texColStr = usrColObj.text;   // What: Text Color String. Why: This is one of the 3 user-chosen anchor colors every derived token is computed relative to. How: This is read once from usrColObj.text and reused in the returned object and the muted expression below.
	const accColStr = usrColObj.accent; // What: Accent Color String. Why: This is one of the 3 user-chosen anchor colors every derived token is computed relative to. How: This is read once from usrColObj.accent and reused in the returned object and the accentSoft expression below.


	const modSgnNum = modKeyStr === 'dark' ? 1 : -1; // What: Mode Sign Number. Why: The muted/accentSoft tokens need to move toward the page background in dark mode but away from it in light mode. How: This flips the sign of their lightness offset below based on the given mode.

	const calOffFun = ( offAmtNum, floValNum ) => ( modKeyStr === 'dark' // What: Calc Offset Function. Why: Dark mode needs a floored lightness offset to avoid the near-black gamma-encoding hazard described above, while light mode can use a plain one. How: This returns the appropriate CSS calc() expression string for whichever mode is active.

		? `calc(max(l + ${ offAmtNum }, ${ floValNum }))` // What: Dark Mode Calc Expression. Why: Flooring the result keeps surface/border from vanishing into true black. How: This raises the lightness by offAmtNum, but never below floValNum.

		: `calc(l - ${ offAmtNum })` ); // What: Light Mode Calc Expression. Why: Light mode has no black-end hazard, so a plain offset is enough. How: This simply lowers the lightness by offAmtNum.



	return { // What: Palette Object Return. Why: The derived custom palette must be handed back to the caller in the same 8-token shape as a PAL_SET_OBJ entry. How: This builds the object literal below from the 3 anchor colors and the CSS relative-color expressions computed above.


		bacStr : bacColStr,                                                                      // What: Background String. Why: The user's own chosen background color is used as-is, no derivation needed. How: This is just bacColStr, computed above from usrColObj.bg.
		texStr : texColStr,                                                                      // What: Text String. Why: The user's own chosen text color is used as-is, no derivation needed. How: This is just texColStr, computed above from usrColObj.text.
		accStr : accColStr,                                                                      // What: Accent String. Why: The user's own chosen accent color is used as-is, no derivation needed. How: This is just accColStr, computed above from usrColObj.accent.
		surStr : `oklch(from ${ bacColStr } ${ calOffFun( 0.04, 0.17 ) } c h)`,                  // What: Surface String. Why: The surface token needs to sit slightly toward/away from the background depending on mode. How: This computes an oklch relative-color expression off bacColStr using calOffFun's smaller offset/floor pair.
		borStr : `oklch(from ${ bacColStr } ${ calOffFun( 0.12, 0.26 ) } c h)`,                  // What: Border String. Why: The border token needs a stronger lightness shift off the background than surface does. How: This computes an oklch relative-color expression off bacColStr using calOffFun's larger offset/floor pair.
		mutStr : `oklch(from ${ texColStr } calc(l + ${ modSgnNum * -0.32 }) c h)`,              // What: Muted String. Why: The muted token needs to sit between text and background in lightness. How: This computes an oklch relative-color expression off texColStr, shifted by modSgnNum's signed offset.
		aceStr : `oklch(from ${ accColStr } calc(l + ${ modSgnNum * -0.42 }) calc(c - 0.08) h)`, // What: Accent Soft String. Why: The softened accent token needs a lighter or darker, less saturated version of the chosen accent. How: This computes an oklch relative-color expression off accColStr, shifting both lightness (via modSgnNum) and chroma.
		warStr : modKeyStr === 'dark' ? 'oklch(0.78 0.13 60)' : 'oklch(0.62 0.13 50)'            // What: Warm String. Why: The warm/celebration token isn't derived from user input at all, unlike the other 7. How: This picks one of 2 fixed oklch values based on whether modKeyStr is 'dark' or 'light'.


	};


}

// #endregion resCusFun



const THE_PAI_OBJ = { // What: Theme Pair Object. Why: "System preference" auto-switching needs to know each theme's light/dark sibling; built-ins mirror the palette design (Ink and Night, Sage and Moss, Sand and Ember), and the two custom slots pair with each other. How: This is looked up by the current theme key in resTheFun below.


	ink         : { ligStr : 'ink',         drkStr : 'night' },      // What: Light String. Why: This is the theme key to use when the OS prefers light mode. How: This is read via curPaiObj.ligStr in resTheFun. What: Dark String. Why: This is the theme key to use when the OS prefers dark mode. How: This is read via curPaiObj.drkStr in resTheFun.
	night       : { ligStr : 'ink',         drkStr : 'night' },      // What: Light String. Why: This is the theme key to use when the OS prefers light mode. How: This is read via curPaiObj.ligStr in resTheFun. What: Dark String. Why: This is the theme key to use when the OS prefers dark mode. How: This is read via curPaiObj.drkStr in resTheFun.
	sage        : { ligStr : 'sage',        drkStr : 'moss' },       // What: Light String. Why: This is the theme key to use when the OS prefers light mode. How: This is read via curPaiObj.ligStr in resTheFun. What: Dark String. Why: This is the theme key to use when the OS prefers dark mode. How: This is read via curPaiObj.drkStr in resTheFun.
	moss        : { ligStr : 'sage',        drkStr : 'moss' },       // What: Light String. Why: This is the theme key to use when the OS prefers light mode. How: This is read via curPaiObj.ligStr in resTheFun. What: Dark String. Why: This is the theme key to use when the OS prefers dark mode. How: This is read via curPaiObj.drkStr in resTheFun.
	sand        : { ligStr : 'sand',        drkStr : 'ember' },      // What: Light String. Why: This is the theme key to use when the OS prefers light mode. How: This is read via curPaiObj.ligStr in resTheFun. What: Dark String. Why: This is the theme key to use when the OS prefers dark mode. How: This is read via curPaiObj.drkStr in resTheFun.
	ember       : { ligStr : 'sand',        drkStr : 'ember' },      // What: Light String. Why: This is the theme key to use when the OS prefers light mode. How: This is read via curPaiObj.ligStr in resTheFun. What: Dark String. Why: This is the theme key to use when the OS prefers dark mode. How: This is read via curPaiObj.drkStr in resTheFun.
	customLight : { ligStr : 'customLight', drkStr : 'customDark' }, // What: Light String. Why: This is the theme key to use when the OS prefers light mode. How: This is read via curPaiObj.ligStr in resTheFun. What: Dark String. Why: This is the theme key to use when the OS prefers dark mode. How: This is read via curPaiObj.drkStr in resTheFun.
	customDark  : { ligStr : 'customLight', drkStr : 'customDark' }  // What: Light String. Why: This is the theme key to use when the OS prefers light mode. How: This is read via curPaiObj.ligStr in resTheFun. What: Dark String. Why: This is the theme key to use when the OS prefers dark mode. How: This is read via curPaiObj.drkStr in resTheFun.


};



// #region resTheFun

/**
 * resTheFun = Resolve Theme Function
 *
 * @summary
 * Resolves which theme key should actually be applied right now. If
 * "System preference" auto-switching is off, or the current theme has
 * no known light/dark counterpart at all (or that counterpart is one of
 * the custom slots and hasn't been set up yet), the theme is used
 * exactly as chosen; otherwise the OS's current light/dark preference
 * picks between the two counterparts.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param appSetObj - App Settings Object: The persisted appearance settings
 *                    object (theme, autoSystem, customLight, customDark).
 * @param sysDarBoo - System Dark Boolean: Whether the OS currently prefers
 *                    dark mode.
 *
 * @returns The theme key that should actually be applied, e.g. 'ink' or
 * 'customDark'.
 *
 * @example
 * ```ts
 * resTheFun(appSetObj, sysDarBoo) // => theme key string
 * ```
 *
*/

export function resTheFun( appSetObj, sysDarBoo ) {


	const theKeyStr = appSetObj.theme || 'ink'; // What: Theme Key String. Why: Very old/incomplete persisted states might not have a theme field at all. How: This falls back to 'ink' when appSetObj.theme is missing.

	if ( !appSetObj.autoSystem ) return theKeyStr; // What: No Auto System Guard. Why: With "System preference" off, the user's own explicit choice always wins outright. How: This returns the resolved theme key as-is, skipping the counterpart lookup entirely.


	const curPaiObj = THE_PAI_OBJ[ theKeyStr ]; // What: Current Pair Object. Why: Only a theme with a known light/dark counterpart can auto-switch at all. How: This looks up the resolved theme key in THE_PAI_OBJ.

	if ( !curPaiObj ) return theKeyStr; // What: No Pair Guard. Why: A theme key with no known counterpart (should not normally happen) has nothing to switch to. How: This falls back to the resolved theme key unchanged.


	const wanKeyStr = sysDarBoo ? curPaiObj.drkStr : curPaiObj.ligStr; // What: Wanted Key String. Why: This is the counterpart the OS's current preference actually calls for. How: This picks curPaiObj's dark or light side based on sysDarBoo.

	if ( wanKeyStr === 'customDark' && !appSetObj.customDark ) return theKeyStr; // What: No Custom Dark Guard. Why: Auto-switching to a custom slot that was never set up would apply a broken, empty palette. How: This falls back to the resolved theme key unchanged when customDark is wanted but missing.

	if ( wanKeyStr === 'customLight' && !appSetObj.customLight ) return theKeyStr; // What: No Custom Light Guard. Why: Same reasoning as the customDark guard above, for the light custom slot. How: This falls back to the resolved theme key unchanged when customLight is wanted but missing.



	return wanKeyStr; // What: Wanted Key Return. Why: Every guard above has already ruled out the cases where switching would be unsafe. How: This returns the OS-preference-driven counterpart key.


}

// #endregion resTheFun



export const APP_NAM_OBJ = { PAL_SET_OBJ, appPalFun, resCusFun, resTheFun }; // What: Appearance Namespace Object. Why: Some callers prefer one namespaced import over several individual named ones. How: This groups the same 4 bindings already exported individually below under one object.

export { PAL_SET_OBJ, appPalFun, resCusFun }; // What: Named Exports. Why: Most callers import these individually rather than through the APP_NAM_OBJ namespace object above. How: This re-exports PAL_SET_OBJ, appPalFun, and resCusFun by name (resTheFun is already exported directly at its own declaration above).


