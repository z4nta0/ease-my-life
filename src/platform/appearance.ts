


// #region Imports

import { durMilFun } from '../utils/rhythm.ts'; // What: Duration Millisecond Function. Why: Timers that wait on a CSS animation must end with it. How: This returns a duration step's length in milliseconds, matching the stylesheet's own --dur-* tokens.
import { redMotFun } from '../utils/motion.ts'; // What: Reduce Motion Function. Why: The palette cross-fade should be skipped for a user who prefers reduced motion. How: This is called inside appPalFun to gate the theme fade attribute toggle.


import type { AppSetTyp } from '../core/data-model.ts'; // What: Appearance Settings Type. Why: Picking the active theme reads the saved appearance settings. How: This types resTheFun's appSetObj.
import type { CusPalTyp } from '../core/data-model.ts'; // What: Custom Palette Type. Why: A custom theme is derived from the user's three saved colors. How: This types resCusFun's usrColObj.

// #endregion Imports



/**
 * appearance.ts = Appearance
 *
 * @summary
 * Palette tokens plus theme application, deliberately split out of app.tsx to
 * avoid an import cycle with tab-settings.tsx. PAL_SET_OBJ holds the app's
 * fixed set of built-in named palettes, each an 8-token OKLCH color set plus a
 * display name.
 *
 * appPalFun writes a resolved palette's own tokens onto the document's real
 * CSS custom properties, animating the cross-fade unless the user prefers
 * reduced motion. resCusFun derives a full palette from a user-picked custom
 * accent color (covHexFun/synTinFun handle the OKLCH conversion), and
 * resTheFun resolves which theme key is actually active, including "system"
 * auto-switching via THE_PAI_OBJ's own light/dark theme pairings.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Module State
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type PalTokTyp = { // What: Palette Tokens Type. Why: Built-in and custom themes alike resolve to the same color tokens before they're applied. How: This describes one palette, a PAL_SET_OBJ entry or resCusFun's derived one.


	accStr  : string; // What: Accent String. Why: Actions and selection use the primary accent. How: This is written onto --acc-mai-col.
	aceStr  : string; // What: Accent Soft String. Why: Accent text sits on a softened accent background. How: This is written onto --acc-tin-col.
	bacStr  : string; // What: Background String. Why: The page sits on its own base background. How: This is written onto --bac-pag-col.
	borStr  : string; // What: Border String. Why: Borders and dividers share one color. How: This is written onto --bor-mai-col.
	mutStr  : string; // What: Muted String. Why: De-emphasized text uses a muted color. How: This is written onto --tex-mut-col.
	namStr? : string; // What: Name String. Why: The Settings tab's theme picker labels each built-in theme. How: This is that label, never written onto a custom property, and absent on a derived custom palette.
	surStr  : string; // What: Surface String. Why: Cards and surfaces sit on their own background. How: This is written onto --bac-sur-col.
	texStr  : string; // What: Text String. Why: Body text uses the main text color. How: This is written onto --tex-mai-col.
	warStr  : string; // What: Warm String. Why: Celebrations use a warm second accent. How: This is written onto --acc-sec-col.


};

// #endregion Types



// #region Constants

// #region PAL_SET_OBJ

/**
 * PAL_SET_OBJ = Palette Set Object
 *
 * @summary
 * Every palette below shares one shape, and none of them repeat these
 * fields' own boilerplate comments on their own lines (see the
 * "Repeated-shape object literals" comment exception in CLAUDE.md). Each
 * color token is written onto its own CSS custom property by appPalFun:
 *
 * - `accStr` (String): Accent String, the primary accent color
 *   (--acc-mai-col).
 *
 * - `aceStr` (String): Accent Soft String, a softened accent background
 *   (--acc-tin-col).
 *
 * - `bacStr` (String): Background String, the page's own base background
 *   (--bac-pag-col).
 *
 * - `borStr` (String): Border String, the border color (--bor-mai-col).
 *
 * - `mutStr` (String): Muted String, de-emphasized text (--tex-mut-col).
 *
 * - `namStr` (String): Name String, the human-readable label shown in the
 *   Settings tab's theme picker, never written onto a custom property.
 *
 * - `surStr` (String): Surface String, card and surface backgrounds
 *   (--bac-sur-col).
 *
 * - `texStr` (String): Text String, body text (--tex-mai-col).
 *
 * - `warStr` (String): Warm String, the warm celebration accent
 *   (--acc-sec-col).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const PAL_SET_OBJ = { // What: Palette Set Object. Why: This is the app's fixed set of built-in color themes, each a full 8-token palette plus a display name. How: app.tsx looks the active theme's palette up here, and the Settings tab's theme picker reads every palette for its previews.


	ember : { // What: Ember Palette Object. Why: This is one of the app's built-in themes. How: This holds Ember's own 8 color tokens plus display name, read via PAL_SET_OBJ[theKeyStr] dynamic lookup when this key is the active theme.


		accStr : 'oklch(0.72 0.13 42)',
		aceStr : 'oklch(0.32 0.05 42)',
		bacStr : 'oklch(0.17 0.014 45)',
		borStr : 'oklch(0.28 0.018 45)',
		mutStr : 'oklch(0.65 0.016 50)',
		namStr : 'Ember',
		surStr : 'oklch(0.21 0.016 45)',
		texStr : 'oklch(0.95 0.012 50)',
		warStr : 'oklch(0.78 0.13 60)'


	},

	ink : { // What: Ink Palette Object. Why: This is one of the app's built-in themes. How: This holds Ink's own 8 color tokens plus display name, read via PAL_SET_OBJ[theKeyStr] dynamic lookup when this key is the active theme.


		accStr : 'oklch(0.5 0.14 250)',
		aceStr : 'oklch(0.95 0.025 250)',
		bacStr : 'oklch(0.985 0.003 240)',
		borStr : 'oklch(0.91 0.005 240)',
		mutStr : 'oklch(0.5 0.012 250)',
		namStr : 'Ink',
		surStr : 'oklch(0.975 0.004 240)',
		texStr : 'oklch(0.17 0.012 250)',
		warStr : 'oklch(0.62 0.13 50)'


	},

	moss : { // What: Moss Palette Object. Why: This is one of the app's built-in themes. How: This holds Moss's own 8 color tokens plus display name, read via PAL_SET_OBJ[theKeyStr] dynamic lookup when this key is the active theme.


		accStr : 'oklch(0.7 0.1 155)',
		aceStr : 'oklch(0.3 0.035 150)',
		bacStr : 'oklch(0.17 0.01 150)',
		borStr : 'oklch(0.28 0.016 150)',
		mutStr : 'oklch(0.65 0.012 150)',
		namStr : 'Moss',
		surStr : 'oklch(0.21 0.014 150)',
		texStr : 'oklch(0.95 0.008 150)',
		warStr : 'oklch(0.78 0.13 60)'


	},

	night : { // What: Night Palette Object. Why: This is one of the app's built-in themes. How: This holds Night's own 8 color tokens plus display name, read via PAL_SET_OBJ[theKeyStr] dynamic lookup when this key is the active theme.


		accStr : 'oklch(0.75 0.14 250)',
		aceStr : 'oklch(0.3 0.04 250)',
		bacStr : 'oklch(0.18 0.012 250)',
		borStr : 'oklch(0.3 0.014 250)',
		mutStr : 'oklch(0.65 0.012 250)',
		namStr : 'Night',
		surStr : 'oklch(0.22 0.014 250)',
		texStr : 'oklch(0.95 0.005 250)',
		warStr : 'oklch(0.78 0.13 60)'


	},

	sage : { // What: Sage Palette Object. Why: This is one of the app's built-in themes. How: This holds Sage's own 8 color tokens plus display name, read via PAL_SET_OBJ[theKeyStr] dynamic lookup when this key is the active theme.


		accStr : 'oklch(0.48 0.09 155)',
		aceStr : 'oklch(0.95 0.03 150)',
		bacStr : 'oklch(0.985 0.005 130)',
		borStr : 'oklch(0.9 0.012 130)',
		mutStr : 'oklch(0.5 0.012 150)',
		namStr : 'Sage',
		surStr : 'oklch(0.97 0.008 130)',
		texStr : 'oklch(0.19 0.015 150)',
		warStr : 'oklch(0.62 0.12 60)'


	},

	sand : { // What: Sand Palette Object. Why: This is one of the app's built-in themes. How: This holds Sand's own 8 color tokens plus display name, read via PAL_SET_OBJ[theKeyStr] dynamic lookup when this key is the active theme.


		accStr : 'oklch(0.5 0.12 40)',
		aceStr : 'oklch(0.94 0.03 60)',
		bacStr : 'oklch(0.98 0.008 80)',
		borStr : 'oklch(0.9 0.015 75)',
		mutStr : 'oklch(0.5 0.018 50)',
		namStr : 'Sand',
		surStr : 'oklch(0.96 0.012 80)',
		texStr : 'oklch(0.2 0.018 50)',
		warStr : 'oklch(0.6 0.14 30)'


	}


};

// #endregion PAL_SET_OBJ



// #region THE_PAI_OBJ

/**
 * THE_PAI_OBJ = Theme Pair Object
 *
 * @summary
 * Every row below shares one shape, read by resTheFun, and none of them
 * repeat these fields' own boilerplate comments on their own lines (see
 * the "Repeated-shape object literals" comment exception in CLAUDE.md):
 *
 * - `darStr` (String): Dark String, the theme key to use when the OS
 *   prefers dark mode.
 *
 * - `ligStr` (String): Light String, the theme key to use when the OS
 *   prefers light mode.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const THE_PAI_OBJ = { // What: Theme Pair Object. Why: "System preference" auto-switching needs to know each theme's light/dark sibling; built-ins mirror the palette design (Ink and Night, Sage and Moss, Sand and Ember), and the two custom slots pair with each other. How: This is looked up by the current theme key in resTheFun below.


	customDark  : { darStr : 'customDark', ligStr : 'customLight' }, // What: Custom Dark Pair Object. Why: System-preference switching needs Custom Dark's own dark and light siblings. How: resTheFun looks this row up under the active theme key.
	customLight : { darStr : 'customDark', ligStr : 'customLight' }, // What: Custom Light Pair Object. Why: System-preference switching needs Custom Light's own dark and light siblings. How: resTheFun looks this row up under the active theme key.
	ember       : { darStr : 'ember',      ligStr : 'sand'        }, // What: Ember Pair Object. Why: System-preference switching needs Ember's own dark and light siblings. How: resTheFun looks this row up under the active theme key.
	ink         : { darStr : 'night',      ligStr : 'ink'         }, // What: Ink Pair Object. Why: System-preference switching needs Ink's own dark and light siblings. How: resTheFun looks this row up under the active theme key.
	moss        : { darStr : 'moss',       ligStr : 'sage'        }, // What: Moss Pair Object. Why: System-preference switching needs Moss's own dark and light siblings. How: resTheFun looks this row up under the active theme key.
	night       : { darStr : 'night',      ligStr : 'ink'         }, // What: Night Pair Object. Why: System-preference switching needs Night's own dark and light siblings. How: resTheFun looks this row up under the active theme key.
	sage        : { darStr : 'moss',       ligStr : 'sage'        }, // What: Sage Pair Object. Why: System-preference switching needs Sage's own dark and light siblings. How: resTheFun looks this row up under the active theme key.
	sand        : { darStr : 'ember',      ligStr : 'sand'        }  // What: Sand Pair Object. Why: System-preference switching needs Sand's own dark and light siblings. How: resTheFun looks this row up under the active theme key.


};

// #endregion THE_PAI_OBJ

// #endregion Constants



// #region Module State

let __lasPalStr = null;  // What: Last Palette String. Why: The cross-fade should only run when the resolved palette's actual colors changed, not on every re-application. How: This holds the previous call's color signature string, compared against the current one below.
let __palAppBoo = false; // What: Palette Applied Boolean. Why: The very first palette application (initial page load) must never cross-fade, only later theme swaps should. How: This starts false and is set true at the end of appPalFun's first run.
let __tatIdeNum = null;  // What: Theme-Animation-Timeout Identifier Number. Why: A running cross-fade class needs to be removed again after its own duration, and a fast repeat swap must cancel the previous removal instead of racing it. How: This holds the current setTimeout id, cleared and reassigned on every appPalFun call that starts a new cross-fade.



let __tinProObj = null; // What: Tint Probe Object. Why: Resolving a CSS color string to hex needs a real canvas 2D context, which is comparatively expensive to create. How: This caches the first successfully-created context so later calls reuse it instead of creating a new canvas each time.

// #endregion Module State



// #region Helpers

// #region Palette Resolution

// #region resCusFun

/**
 * resCusFun = Resolve Custom Function
 *
 * @summary
 * Builds a full 8-token palette from the 3 colors a Custom theme lets
 * the user pick (background, text, accent), using CSS relative-color
 * syntax so the derived tokens (surface/border/muted/soft accent) are
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
 *                    direction the derived surface/border/muted/soft accent
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

function resCusFun ( modKeyStr : string, usrColObj : Pick< CusPalTyp, 'accent' | 'bg' | 'text' > ) : PalTokTyp {


	const bacColStr = usrColObj.bg;     // What: Background Color String. Why: This is one of the 3 user-chosen anchor colors every derived token is computed relative to. How: This is read once from usrColObj.bg and reused in the returned object and the relative-color expressions below.
	const texColStr = usrColObj.text;   // What: Text Color String. Why: This is one of the 3 user-chosen anchor colors every derived token is computed relative to. How: This is read once from usrColObj.text and reused in the returned object and the muted expression below.
	const accColStr = usrColObj.accent; // What: Accent Color String. Why: This is one of the 3 user-chosen anchor colors every derived token is computed relative to. How: This is read once from usrColObj.accent and reused in the returned object and the aceStr expression below.


	const modSgnNum = modKeyStr === 'dark' ? 1 : -1; // What: Mode Sign Number. Why: The mutStr/aceStr tokens need to move toward the page background in dark mode but away from it in light mode. How: This flips the sign of their lightness offset below based on the given mode.

	const calOffFun = ( offAmoNum : number, floValNum : number ) => ( modKeyStr === 'dark' // What: Calc Offset Function. Why: Dark mode needs a floored lightness offset to avoid the near-black gamma-encoding hazard described above, while light mode can use a plain one. How: This returns the appropriate CSS calc() expression string for whichever mode is active.

		? `calc(max(l + ${ offAmoNum }, ${ floValNum }))` // What: Dark Mode Calc Expression. Why: Flooring the result keeps surface/border from vanishing into true black. How: This raises the lightness by offAmoNum, but never below floValNum.

		: `calc(l - ${ offAmoNum })` ); // What: Light Mode Calc Expression. Why: Light mode has no black-end hazard, so a plain offset is enough. How: This simply lowers the lightness by offAmoNum.



	return { // What: Palette Object Return. Why: The derived custom palette must be handed back to the caller in the same 8-token shape as a PAL_SET_OBJ entry. How: This builds the object literal below from the 3 anchor colors and the CSS relative-color expressions computed above.


		accStr : accColStr,                                                                      // What: Accent String. Why: The user's own chosen accent color is used as-is, no derivation needed. How: This is just accColStr, computed above from usrColObj.accent.
		aceStr : `oklch(from ${ accColStr } calc(l + ${ modSgnNum * -0.42 }) calc(c - 0.08) h)`, // What: Accent String. Why: The softened accent token needs a lighter or darker, less saturated version of the chosen accent. How: This computes an oklch relative-color expression off accColStr, shifting both lightness (via modSgnNum) and chroma.
		bacStr : bacColStr,                                                                      // What: Background String. Why: The user's own chosen background color is used as-is, no derivation needed. How: This is just bacColStr, computed above from usrColObj.bg.
		borStr : `oklch(from ${ bacColStr } ${ calOffFun( 0.12, 0.26 ) } c h)`,                  // What: Border String. Why: The border token needs a stronger lightness shift off the background than surface does. How: This computes an oklch relative-color expression off bacColStr using calOffFun's larger offset/floor pair.
		mutStr : `oklch(from ${ texColStr } calc(l + ${ modSgnNum * -0.32 }) c h)`,              // What: Muted String. Why: The muted token needs to sit between text and background in lightness. How: This computes an oklch relative-color expression off texColStr, shifted by modSgnNum's signed offset.
		surStr : `oklch(from ${ bacColStr } ${ calOffFun( 0.04, 0.17 ) } c h)`,                  // What: Surface String. Why: The surface token needs to sit slightly toward/away from the background depending on mode. How: This computes an oklch relative-color expression off bacColStr using calOffFun's smaller offset/floor pair.
		texStr : texColStr,                                                                      // What: Text String. Why: The user's own chosen text color is used as-is, no derivation needed. How: This is just texColStr, computed above from usrColObj.text.
		warStr : modKeyStr === 'dark' ? 'oklch(0.78 0.13 60)' : 'oklch(0.62 0.13 50)'            // What: Warm String. Why: The warm/celebration token isn't derived from user input at all, unlike the other 7. How: This picks one of 2 fixed oklch values based on whether modKeyStr is 'dark' or 'light'.


	};


}

// #endregion resCusFun



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

function resTheFun ( appSetObj : AppSetTyp, sysDarBoo : boolean ) : string {


	const theKeyStr = appSetObj.theme || 'ink'; // What: Theme Key String. Why: Very old/incomplete persisted states might not have a theme field at all. How: This falls back to 'ink' when appSetObj.theme is missing.



	if ( !appSetObj.autoSystem ) return theKeyStr; // What: No Auto System Guard. Why: With "System preference" off, the user's own explicit choice always wins outright. How: This returns the resolved theme key as-is, skipping the counterpart lookup entirely.



	const curPaiObj = THE_PAI_OBJ[ theKeyStr ]; // What: Current Pair Object. Why: Only a theme with a known light/dark counterpart can auto-switch at all. How: This looks up the resolved theme key in THE_PAI_OBJ.


	if ( !curPaiObj ) return theKeyStr; // What: No Pair Guard. Why: A theme key with no known counterpart (should not normally happen) has nothing to switch to. How: This falls back to the resolved theme key unchanged.



	const wanKeyStr = sysDarBoo ? curPaiObj.darStr : curPaiObj.ligStr; // What: Wanted Key String. Why: This is the counterpart the OS's current preference actually calls for. How: This picks curPaiObj's dark or light side based on sysDarBoo.


	if ( wanKeyStr === 'customDark' && !appSetObj.customDark ) return theKeyStr; // What: No Custom Dark Guard. Why: Auto-switching to a custom slot that was never set up would apply a broken, empty palette. How: This falls back to the resolved theme key unchanged when customDark is wanted but missing.



	if ( wanKeyStr === 'customLight' && !appSetObj.customLight ) return theKeyStr; // What: No Custom Light Guard. Why: Same reasoning as the customDark guard above, for the light custom slot. How: This falls back to the resolved theme key unchanged when customLight is wanted but missing.



	return wanKeyStr; // What: Wanted Key Return. Why: Every guard above has already ruled out the cases where switching would be unsafe. How: This returns the OS-preference-driven counterpart key.


}

// #endregion resTheFun

// #endregion Palette Resolution



// #region Palette Application

// #region covHexFun

/**
 * covHexFun = Convert Hex Function
 *
 * @summary
 * Resolves an arbitrary CSS color string (palettes are authored in
 * oklch()) down to a plain hex string, the one color format every UA is
 * guaranteed to parse for a meta theme-color. It paints the color onto a
 * scratch canvas's single pixel and reads the pixel back with
 * getImageData, which always yields sRGB bytes. Reading fillStyle back
 * instead used to work, but modern browsers keep an oklch() string as-is
 * there, which silently disabled the whole theme-color sync.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param cssColStr - Css Color String: The CSS color string to resolve, e.g.
 *                    an oklch() palette token.
 *
 * @returns A hex color string (e.g. '#a1b2c3'), or null if the browser
 * cannot parse the given color or does not support a 2D canvas context
 * at all.
 * @see {@link hexResStr}
 *
 * @example
 * ```ts
 * covHexFun(cssColStr) // => hex color string or null
 * ```
 *
*/

function covHexFun ( cssColStr : string ) : string | null {


	try { // What: Fill Style Probe Try. Why: Assigning an unsupported color to a canvas context's fillStyle could throw in some environments rather than silently no-op. How: This wraps the whole probe-and-resolve sequence below so any such error is caught and treated as an ordinary parse failure.


		if ( window.CSS && CSS.supports && !CSS.supports( 'color', cssColStr ) ) return null; // What: Unsupported Color Guard. Why: Some very old browsers may not recognize a given color syntax at all, such as oklch(). How: This bails out early with null when the CSS.supports API exists and reports the color as unparseable.



		if ( !__tinProObj ) { // What: No Probe Object Check. Why: The scratch canvas 2D context only needs to be created once, ever. How: This gates the creation block below so it only runs on the very first call.


			const canProEle = document.createElement( 'canvas' ); // What: Canvas Probe Element. Why: A canvas 2D context is the mechanism used to resolve the color below. How: This creates a fresh, unattached canvas element.


			canProEle.height = 1; // What: Canvas Height Assignment. Why: The probe only ever paints and reads back a single pixel. How: This shrinks the canvas from its 300x150 default to 1 pixel tall.
			canProEle.width = 1;  // What: Canvas Width Assignment. Why: The probe only ever paints and reads back a single pixel. How: This shrinks the canvas from its 300x150 default to 1 pixel wide.

			__tinProObj = canProEle.getContext && canProEle.getContext( '2d', { willReadFrequently : true } ); // What: Tint Probe Object Assignment. Why: The created canvas must actually support a 2D context for this technique to work at all, and every call reads a pixel back. How: This requests a 2D context flagged for frequent readback, leaving __tinProObj null when getContext is unavailable.


		}



		if ( !__tinProObj ) return null; // What: No Probe Guard. Why: Without a working 2D context there is no way to resolve the color at all. How: This bails out with null when canvas 2D support is unavailable.



		__tinProObj.fillStyle = '#010203'; // What: Fill Style Sentinel. Why: fillStyle silently ignores a color it cannot parse, so an unusual known value must sit there first to detect that. How: This resets fillStyle to a near-black sentinel no palette uses.

		__tinProObj.fillStyle = cssColStr; // What: Fill Style Assignment. Why: This is the actual parse step. How: This assigns the given color, which the browser either accepts or ignores.



		if ( __tinProObj.fillStyle === '#010203' ) return null; // What: Unparsed Color Guard. Why: A fillStyle still holding the sentinel means the browser rejected the color, so any pixel painted with it would be wrong. How: This bails out with null in that case.



		__tinProObj.clearRect( 0, 0, 1, 1 ); // What: Pixel Clear Call. Why: A translucent color would otherwise blend with the previous call's pixel. How: This clears the probe's single pixel to transparent first.
		__tinProObj.fillRect( 0, 0, 1, 1 );  // What: Pixel Fill Call. Why: Modern browsers keep a color like oklch() as-is in fillStyle, so the only reliable way to get sRGB bytes is to actually paint it. How: This paints the probe's single pixel with the assigned color.


		const [ redValNum, greValNum, bluValNum ] = __tinProObj.getImageData( 0, 0, 1, 1 ).data; // What: Red Green Blue Value Numbers. Why: The painted pixel holds the color converted to sRGB, which is what a hex string needs. How: This reads the pixel back and destructures its first 3 channels, ignoring alpha.

		const hexResStr = '#' + [ redValNum, greValNum, bluValNum ].map( ( chaValNum ) => chaValNum.toString( 16 ).padStart( 2, '0' ) ).join( '' ); // What: Hex Result String. Why: A theme-color tag needs a plain hex color every browser parses. How: This formats each channel as 2 hex digits and joins them after a leading #.



		return hexResStr; // What: Hex Result Return. Why: The caller writes this straight into the theme-color tag. How: This returns hexResStr.


	}

	catch ( errCatObj ) { return null; } // What: Parse Error Guard. Why: Some environments could throw rather than silently no-op on an invalid assignment. How: This catches any such error and returns null, same as an ordinary parse failure.


}

// #endregion covHexFun



// #region synTinFun

/**
 * synTinFun = Sync Tint Function
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
 *                    covHexFun accepts.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * synTinFun(bacColStr) // => void
 * ```
 *
*/

function synTinFun ( bacColStr : string ) : void {


	const hexResStr = covHexFun( bacColStr ); // What: Hex Result String. Why: A <meta name="theme-color"> tag's content must be a color the UA will definitely parse. How: This resolves the given background color down to a plain hex string.


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

// #endregion synTinFun



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

function appPalFun ( palResObj : PalTokTyp, theKeyStr : string ) : void {


	const palSigStr = [ palResObj.bacStr, palResObj.surStr, palResObj.texStr, palResObj.accStr, palResObj.aceStr, palResObj.borStr, palResObj.mutStr, palResObj.warStr ].join( '|' ); // What: Palette Signature String. Why: Detecting an actual color change requires comparing against what was last applied, not just re-running on every call. How: This joins every token into one comparable string.
	const palChaBoo = palSigStr !== __lasPalStr; // What: Palette Changed Boolean. Why: The cross-fade must only run when the resolved colors actually differ from last time. How: This compares the freshly-built signature against the previous call's stored one.

	__lasPalStr = palSigStr; // What: Last Palette String Update. Why: The next call needs to compare against what is current now. How: This overwrites __lasPalStr with the freshly-computed signature.


	if ( __palAppBoo && palChaBoo && !redMotFun() ) { // What: Cross-Fade Trigger Check. Why: The cross-fade should only play when a palette had already been applied before, the resolved colors actually changed, and the user doesn't prefer reduced motion. How: This gates the class-add/timeout block below on all three conditions holding at once.


		const docRooEle = document.documentElement; // What: Document Root Element. Why: The cross-fade class toggles on the root element, which is what the app's CSS transition rules key off. How: This is read once and reused for both the add and remove below.

		docRooEle.setAttribute( 'data-theme-fade-active', '' ); // What: Theme Fade Attribute Set. Why: This is the attribute the app's CSS keys off to enable a brief cross-fade transition on the themable custom properties. How: This sets the presence-only attribute on the root element immediately, before the new values are written below.


		clearTimeout( __tatIdeNum ); // What: Theme-Animation-Timeout Identifier Number Clear. Why: A fast repeat theme swap must not let an earlier removal fire after this newer swap's own class add. How: This cancels whatever removal was previously scheduled.

		__tatIdeNum = setTimeout( () => docRooEle.removeAttribute( 'data-theme-fade-active' ), durMilFun( 'p04' ) ); // What: Theme-Animation-Timeout Identifier Number Schedule. Why: The cross-fade attribute must not stay on indefinitely, only for the duration of the transition. How: This schedules the attribute's removal after the CSS transition's own p04 duration step. // Duration Base Plus 4 ~= 486.1ms


	}



	__palAppBoo = true; // What: Palette Applied Boolean Update. Why: Every call after this one is a real theme swap, eligible for the cross-fade above. How: This is set true unconditionally, once, on the very first call.

	const rooStyObj = document.documentElement.style; // What: Root Style Object. Why: Every custom property write below targets the same style object. How: This is read once and reused for all 8 setProperty calls that follow.

	rooStyObj.setProperty( '--bac-pag-col', palResObj.bacStr ); // What: Background Property Write. Why: This is the actual CSS custom property the app's stylesheets read for the page background. How: This writes the palette's bacStr token onto the root element's inline style.
	rooStyObj.setProperty( '--bac-sur-col', palResObj.surStr ); // What: Surface Property Write. Why: This is the actual CSS custom property the app's stylesheets read for card/surface backgrounds. How: This writes the palette's surStr token onto the root element's inline style.
	rooStyObj.setProperty( '--bor-mai-col', palResObj.borStr ); // What: Border Property Write. Why: This is the actual CSS custom property the app's stylesheets read for border colors. How: This writes the palette's borStr token onto the root element's inline style.
	rooStyObj.setProperty( '--tex-mai-col', palResObj.texStr ); // What: Text Property Write. Why: This is the actual CSS custom property the app's stylesheets read for body text color. How: This writes the palette's texStr token onto the root element's inline style.
	rooStyObj.setProperty( '--tex-mut-col', palResObj.mutStr ); // What: Muted Property Write. Why: This is the actual CSS custom property the app's stylesheets read for de-emphasized text color. How: This writes the palette's mutStr token onto the root element's inline style.
	rooStyObj.setProperty( '--acc-mai-col', palResObj.accStr ); // What: Accent Property Write. Why: This is the actual CSS custom property the app's stylesheets read for the primary accent color. How: This writes the palette's accStr token onto the root element's inline style.
	rooStyObj.setProperty( '--acc-tin-col', palResObj.aceStr ); // What: Accent Soft Property Write. Why: This is the actual CSS custom property the app's stylesheets read for a softened accent background. How: This writes the palette's aceStr token onto the root element's inline style.
	rooStyObj.setProperty( '--acc-sec-col', palResObj.warStr ); // What: Warm Property Write. Why: This is the actual CSS custom property the app's stylesheets read for the warm/celebration accent color. How: This writes the palette's warStr token onto the root element's inline style.


	document.body.dataset.palette = theKeyStr || 'custom'; // What: Palette Dataset Write. Why: Some CSS keys off which specific palette is active, not just its raw token values. How: This writes the resolved theme key, or 'custom' if none was given, onto body's own dataset.



	synTinFun( palResObj.bacStr ); // What: Status Bar Tint Sync Call. Why: An installed PWA's status bar should follow the newly-applied background color too. How: This hands the resolved background color to synTinFun.


}

// #endregion appPalFun

// #endregion Palette Application

// #endregion Helpers



// #region Exports

const APP_NAM_OBJ = { // What: Appearance Namespace Object. Why: app.tsx and the Settings tab reach this file's palettes and theme functions through one namespaced import. How: This maps each external property name onto the internal binding of the same name.


	appPalFun   : appPalFun,   // What: Apply Palette Function. Why: app.tsx writes the resolved palette onto the document through this. How: This maps onto appPalFun.
	PAL_SET_OBJ : PAL_SET_OBJ, // What: Palette Set Object. Why: app.tsx resolves built-in themes and the Settings tab previews them from this. How: This maps onto PAL_SET_OBJ.
	resCusFun   : resCusFun,   // What: Resolve Custom Function. Why: app.tsx derives a user's custom palettes through this. How: This maps onto resCusFun.
	resTheFun   : resTheFun    // What: Resolve Theme Function. Why: app.tsx picks the active theme key, including system switching, through this. How: This maps onto resTheFun.


};



export { APP_NAM_OBJ, type PalTokTyp }; // What: Named Exports. Why: Every consumer reaches this file's palettes and theme functions through the one namespace object, and the theme picker types a previewed palette with PalTokTyp. How: This exports both by name at the very end of the file.

// #endregion Exports


