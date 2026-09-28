





// #region Imports

import React from 'react'; // What: React. Why: This is the UI library the whole store hook is built on. How: This is used directly (React.useState, React.useMemo, React.useEffect, React.useRef, React.useCallback) instead of importing individual named hooks.


import { CAD_NAM_OBJ } from '../core/cadence.js';        // What: Cadence. Why: Every picker's own daily/weekly/monthly/yearly surfacing schedule is computed by this module. How: This is called (enfWeeFun/norCadFun/isaCadFun) from migStaFun and from the picker-authoring actions below.
import { CON_NAM_OBJ } from '../core/conditionals.js';   // What: Conditionals. Why: Day-off gate resolution/advancement logic lives here, not in this file. How: This is called from resConFun and from cotAplFun below.
import { HOL_NAM_OBJ } from '../core/holidays.js';       // What: Holidays Namespace Object. Why: The holiday list backfill and the holiday-editing actions both need the canonical empty holidays shape. How: This is called (defStaFun) from migStaFun and from the holiday actions below.
import { isoDayFun   } from '../utils/date.js';          // What: Iso Day Function. Why: Dates are stored and compared as local-calendar YYYY-MM-DD keys. How: This formats a Date (or now) as that key.
import { norConFun   } from '../core/pickers.js';        // What: Normalize Conditional Function. Why: A newly-authored inline conditional's own name needs the same tidy Title-Case treatment as a picker's. How: This is called from addPicFun and savEdiFun below.
import { norGroFun   } from '../core/pickers.js';        // What: Normalize Group Function. Why: A picker's own group label needs tidying/de-duplication in several places. How: This is called from migStaFun and from renGroFun/renTouFun below.
import { norPicFun   } from '../core/pickers.js';        // What: Normalize Picker Function. Why: A picker's own display name needs tidying wherever one is created or renamed. How: This is called from migStaFun, addPicFun, savEdiFun, and renPicFun below.
import { ONB_CHE_OBJ } from './onboarding-checklist.js'; // What: Onboarding Checklist Object. Why: Resolving a checklist item can flip the closing Generate card's own readiness. How: This is called (reaGenFun) from setCarFun below.
import { ONB_SPI_ARR } from './onboarding-seed-data.js'; // What: Onboarding Sample-Picker-Ids Array. Why: A sample picker being (re)seeded must skip the normal name de-duplication so its canonical name stays intact. How: This is checked against inside addPicFun below.
import { PIC_NAM_OBJ } from '../core/pickers.js';        // What: Pickers Namespace Object. Why: The item-authoring/editing actions need this module's own ease-band averaging and per-mode defaults. How: This is called (aveEasFun/DEF_EAS_OBJ) from addIteFun and savEdiFun below.
import { PWA_NAM_OBJ } from '../platform/pwa.js';        // What: Progressive Web App Namespace Object. Why: The very first picker a user creates is the first data worth protecting from storage eviction. How: This is called (askFirFun) once, from inside addPicFun below.
import { SED_NAM_OBJ } from './seed.js';                 // What: Seed Namespace Object. Why: A brand-new install, and a hard reset, both need this fresh empty-state shape rather than the design-time demo fixture. How: This is called (buiCleFun) by loaStaFun and by the reset action below.
import { STG_NAM_OBJ } from './storage.js';              // What: Storage Namespace Object. Why: This is the actual persistence engine this file's own load/save/flush wrappers delegate to. How: This is called from loaStaFun, wriStaFun, fluStaFun, and the reset/impDatFun actions below.
import { TAS_NAM_OBJ } from '../core/tasks.js';          // What: Tasks Namespace Object. Why: The reminders engine's own scheduling/eligibility/normalization logic lives here, not in this file. How: This is called throughout migStaFun, stkSynFun, and the task actions below.

// #endregion Imports



/**
 * store.js = Store And Persisted-State Layer
 *
 * @summary
 * The entire app state layer: one useState holding the whole app state
 * object, plus a useMemo'd object of state-transition functions (the
 * "actions"). Deliberately framework-light so every tab can call the
 * exact same helpers. Persistence is a separate concern delegated to
 * storage.js; this file only decides WHEN to save (debounced via
 * requestIdleCallback, flushed synchronously on pagehide/tab-hide) and
 * WHAT shape old saves get migrated into on load.
 *
 * A key invariant lives here: picking/re-rolling/sending an item to
 * Today stages its value/weight consequences as entry.pending rather
 * than applying them immediately; they only take effect once the entry
 * is marked done (enpAplFun/enpRevFun), and unchecking
 * a done entry must exactly revert via entry.revert. Every action below
 * that touches an entry's own done/pending/revert fields must preserve
 * this staging.
 *
 * Sections:
 *  - Constants
 *  - Module State
 *  - Helpers
 *  - Hooks
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

/**
 * SCH_VER_NUM = Schema Version Number
 *
 * @summary
 * The state schema version, stamped into state.v by migStaFun() and
 * therefore carried inside exported backup files. Distinct from the
 * IndexedDB database version (a structural concern of storage.js) and
 * from the eventual package.json release version. Bump this whenever a
 * new migration is added below, so an exported backup's own state.v
 * always reflects the shape it was actually migrated to.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const SCH_VER_NUM = 1; // What: Schema Version Number. Why: migStaFun() stamps this onto every loaded/imported state so an exported backup records the shape it was migrated to. How: This is read once, at the very end of migStaFun() below.



const STO_KEY_STR = 'easemylife.v2'; // What: Storage Key String. Why: The localStorage fallback/mirror needs a fixed key to read/write under. How: This is read by loaStaFun, wriStaFun, and fluStaFun below.

// #endregion Constants



// #region Module State

let __cdlSeqNum = 0; // What: Conditional-Log Sequence Number. Why: nclIdeFun below needs its own shared counter, separate from newLogFun's, so ids minted in the same millisecond still differ. How: This starts at 0 and is incremented once per nclIdeFun call.
let __eidSeqNum = 0; // What: Entry-Id Sequence Number. Why: newEidFun below needs a shared counter across every call so two ids minted in the same millisecond still differ. How: This starts at 0 and is incremented once per newEidFun call.
let __pclSeqNum = 0; // What: Pick-Log Sequence Number. Why: newLogFun below needs a shared counter across every call so two ids minted in the same millisecond still differ. How: This starts at 0 and is incremented once per newLogFun call.

// #endregion Module State



// #region Helpers

// #region Shared Utilities

// #region invColFun

/**
 * invColFun = Invert Color Function
 *
 * @summary
 * Inverts a hex color's own lightness (keeping its hue/chroma) using
 * plain OKLab math, then reads back a plain hex string so the result
 * stays usable directly as an <input type="color"> value (which only
 * accepts hex; a raw "oklch(from ...)" string would be rejected). Used
 * to auto-derive a custom theme's dark/light counterpart from whichever
 * one the user actually edited.
 *
 * Hex/OKLab conversion follows Bjorn Ottosson's own reference formulas,
 * used here instead of round-tripping through the browser's own CSS
 * color parser: both getComputedStyle and canvas fillStyle produced
 * garbage in testing against "oklch(from ...)" relative-color strings.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param hexColStr - Hex Color String: The '#rrggbb' (or '#rgb') color to
 *                    invert.
 *
 * @returns The inverted color, as a '#rrggbb' string, or hexColStr
 * itself unchanged if the conversion throws.
 *
 * @example
 * ```ts
 * invColFun('#1e2230') // => '#e2ddc2'-ish inverted hex string
 * ```
 *
*/

function invColFun( hexColStr ) {


	try { // What: Color Conversion Try. Why: Any malformed input must fall back to the original color instead of throwing. How: The catch below returns hexColStr unchanged.


		const rgbZerArr = ( () => { // What: Rgb Zero-One Array. Why: The OKLab math below operates on linear-light RGB, not raw hex. How: This strips the leading '#', expands a 3-digit shorthand, parses the hex to an integer, and splits it into 0-1 channel values.


			const hexBarStr = hexColStr.replace( '#', '' ); // What: Hex Bare String. Why: The '#' prefix isn't part of the actual hex digits parseInt below needs. How: This strips it from hexColStr.

			const hexFulStr = hexBarStr.length === 3 // What: Hex Full String. Why: A 3-digit shorthand ('abc') must be expanded to 6 digits ('aabbcc') before parseInt can read it as a 24-bit color. How: This doubles each of the 3 characters when hexBarStr is that short, otherwise uses it as-is.
				? hexBarStr.split( '' ).map( ( curChrStr ) => curChrStr + curChrStr ).join( '' ) // What: Shorthand Expand Branch. Why: A 3-digit color must double each digit first. How: This repeats every character once and joins them back.
				: hexBarStr;                                                                     // What: Full Hex Branch. Why: A 6-digit color is already in the needed form. How: This passes hexBarStr through.

			const hexIntNum = parseInt( hexFulStr, 16 ); // What: Hex Integer Number. Why: The channel splits below need one plain 24-bit integer to bit-shift/mask against. How: This parses hexFulStr as base-16.



			return [ ( hexIntNum >> 16 & 255 ) / 255, ( hexIntNum >> 8 & 255 ) / 255, ( hexIntNum & 255 ) / 255 ]; // What: Rgb Zero-One Return. Why: The caller needs each channel scaled to the 0-1 range OKLab math expects. How: This bit-shifts/masks out red, green, then blue, each divided by 255.


		} )();

		const srgLinFun = ( sRgbChaNum ) => sRgbChaNum <= 0.04045 ? sRgbChaNum / 12.92 : Math.pow( ( sRgbChaNum + 0.055 ) / 1.055, 2.4 ); // What: Srgb To Linear Function. Why: sRGB's own gamma curve must be undone before OKLab's linear-light math applies. How: This applies the standard sRGB-to-linear piecewise formula to one channel.

		const linSrgFun = ( linChaNum ) => { // What: Linear To Srgb Function. Why: The final result must be re-encoded back into sRGB gamma before it's a displayable hex color. How: This applies the standard linear-to-sRGB piecewise formula to one clamped channel.


			const claChaNum = Math.max( 0, Math.min( 1, linChaNum ) ); // What: Clamped Channel Number. Why: A channel driven outside 0-1 by the inversion math must be clamped before re-encoding. How: This clamps linChaNum into the [0,1] range.



			return claChaNum <= 0.0031308 ? claChaNum * 12.92 : 1.055 * Math.pow( claChaNum, 1 / 2.4 ) - 0.055; // What: Linear To Srgb Return. Why: The caller needs one re-encoded sRGB channel. How: This applies the piecewise sRGB encoding formula to claChaNum.


		};

		const linOklFun = ( [ linRedNum, linGrnNum, linBluNum ] ) => { // What: Linear Rgb To Oklab Function. Why: Lightness must be inverted in OKLab space, not raw RGB, for a perceptually sane result. How: This applies Ottosson's own linear-RGB-to-OKLab matrix multiplication and cube roots.


			const lmsLonNum = 0.4122214708 * linRedNum + 0.5363325363 * linGrnNum + 0.0514459929 * linBluNum;                 // What: Long-Medium-Short Long Number. Why: OKLab's own Long/Medium/Short cone response must be computed before the cube root below. How: This is the Long-cone row of Ottosson's linear-RGB-to-LMS matrix.
			const lmsMedNum = 0.2119034982 * linRedNum + 0.6806995451 * linGrnNum + 0.1073969566 * linBluNum;                 // What: Long-Medium-Short Medium Number. Why: OKLab's own Long/Medium/Short cone response must be computed before the cube root below. How: This is the Medium-cone row of Ottosson's linear-RGB-to-LMS matrix.
			const lmsShoNum = 0.0883024619 * linRedNum + 0.2817188376 * linGrnNum + 0.6299787005 * linBluNum;                 // What: Long-Medium-Short Short Number. Why: OKLab's own Long/Medium/Short cone response must be computed before the cube root below. How: This is the Short-cone row of Ottosson's linear-RGB-to-LMS matrix.
			const cbrLonNum = Math.cbrt( lmsLonNum ), cbrMedNum = Math.cbrt( lmsMedNum ), cbrShoNum = Math.cbrt( lmsShoNum ); // What: Cube-Rooted Long-Medium-Short Numbers. Why: OKLab's own nonlinearity is a cube root of the LMS response, applied before the final matrix. How: This cube-roots each of lmsLonNum/lmsMedNum/lmsShoNum.



			return [ // What: Oklab Triple Return. Why: The caller needs the L/a/b triple OKLab itself defines. How: This applies Ottosson's own LMS-to-OKLab matrix to the cube-rooted values above.

				0.2104542553 * cbrLonNum + 0.7936177850 * cbrMedNum - 0.0040720468 * cbrShoNum, // What: Oklab Lightness Component. Why: This is OKLab's own L channel, the value the rest of this function actually inverts. How: This applies Ottosson's own LMS-to-OKLab matrix's L row to the cube-rooted Long/Medium/Short values.
				1.9779984951 * cbrLonNum - 2.4285922050 * cbrMedNum + 0.4505937099 * cbrShoNum, // What: Oklab A Component. Why: This is OKLab's own a channel, the green-red chroma axis. How: This applies Ottosson's own LMS-to-OKLab matrix's a row to the cube-rooted Long/Medium/Short values.
				0.0259040371 * cbrLonNum + 0.7827717662 * cbrMedNum - 0.8086757660 * cbrShoNum, // What: Oklab B Component. Why: This is OKLab's own b channel, the blue-yellow chroma axis. How: This applies Ottosson's own LMS-to-OKLab matrix's b row to the cube-rooted Long/Medium/Short values.

			];


		};

		const oklLinFun = ( [ oklLigNum, oklAaxNum, oklBaxNum ] ) => { // What: Oklab To Linear Rgb Function. Why: Once lightness is inverted in OKLab, the result must be converted back to linear RGB before re-encoding. How: This applies Ottosson's own inverse OKLab-to-LMS matrix, cubes each term, then his inverse LMS-to-linear-RGB matrix.


			const lmsLonPriNum = oklLigNum + 0.3963377774 * oklAaxNum + 0.2158037573 * oklBaxNum; // What: Long-Medium-Short Long Prime Number. Why: OKLab's own inverse must first reconstruct the cube-rooted LMS terms before cubing them back. How: This is the Long-term row of Ottosson's inverse OKLab-to-LMS matrix.
			const lmsMedPriNum = oklLigNum - 0.1055613458 * oklAaxNum - 0.0638541728 * oklBaxNum; // What: Long-Medium-Short Medium Prime Number. Why: OKLab's own inverse must first reconstruct the cube-rooted LMS terms before cubing them back. How: This is the Medium-term row of Ottosson's inverse OKLab-to-LMS matrix.
			const lmsShoPriNum = oklLigNum - 0.0894841775 * oklAaxNum - 1.2914855480 * oklBaxNum; // What: Long-Medium-Short Short Prime Number. Why: OKLab's own inverse must first reconstruct the cube-rooted LMS terms before cubing them back. How: This is the Short-term row of Ottosson's inverse OKLab-to-LMS matrix.

			const lmsLonNum = lmsLonPriNum * lmsLonPriNum * lmsLonPriNum; // What: Long-Medium-Short Long Number. Why: The cube root taken on the forward pass must be undone by cubing here. How: This cubes lmsLonPriNum.
			const lmsMedNum = lmsMedPriNum * lmsMedPriNum * lmsMedPriNum; // What: Long-Medium-Short Medium Number. Why: The cube root taken on the forward pass must be undone by cubing here. How: This cubes lmsMedPriNum.
			const lmsShoNum = lmsShoPriNum * lmsShoPriNum * lmsShoPriNum; // What: Long-Medium-Short Short Number. Why: The cube root taken on the forward pass must be undone by cubing here. How: This cubes lmsShoPriNum.



			return [ // What: Linear Rgb Triple Return. Why: The caller needs plain linear-light RGB, ready for the sRGB re-encoding step. How: This applies Ottosson's own inverse LMS-to-linear-RGB matrix to lmsLonNum/lmsMedNum/lmsShoNum.

				4.0767416621 * lmsLonNum - 3.3077115913 * lmsMedNum + 0.2309699292 * lmsShoNum,  // What: Linear Red Channel. Why: The caller needs the red channel of the inverted color, still in linear light. How: This applies Ottosson's own inverse LMS-to-linear-RGB matrix's red row to lmsLonNum/lmsMedNum/lmsShoNum.
				-1.2684380046 * lmsLonNum + 2.6097574011 * lmsMedNum - 0.3413193965 * lmsShoNum, // What: Linear Green Channel. Why: The caller needs the green channel of the inverted color, still in linear light. How: This applies Ottosson's own inverse LMS-to-linear-RGB matrix's green row to lmsLonNum/lmsMedNum/lmsShoNum.
				-0.0041960863 * lmsLonNum - 0.7034186147 * lmsMedNum + 1.7076147010 * lmsShoNum, // What: Linear Blue Channel. Why: The caller needs the blue channel of the inverted color, still in linear light. How: This applies Ottosson's own inverse LMS-to-linear-RGB matrix's blue row to lmsLonNum/lmsMedNum/lmsShoNum.

			];


		};

		let [ oklLigNum, oklAaxNum, oklBaxNum ] = linOklFun( rgbZerArr.map( srgLinFun ) ); // What: Oklab Triple And Guard. Why: The rest of this function inverts and re-encodes this exact triple. How: This converts rgbZerArr through the linear-light/OKLab pipeline built above.


		if ( Math.hypot( oklAaxNum, oklBaxNum ) < 0.02 ) { // What: Chroma Near-Zero Guard. Why: Near-neutral colors carry a tiny residual a/b from floating-point noise in the forward conversion, which gets amplified when inverting an extreme lightness (e.g. a near-white background would invert to a visibly red-tinted near-black instead of neutral). How: This clamps a/b to true zero whenever their combined magnitude is below a small threshold.


			oklAaxNum = 0; // What: Oklab A-Axis Number Clamp. Why: This channel's own tiny residual must not survive the inversion below. How: This zeroes oklAaxNum.
			oklBaxNum = 0; // What: Oklab B-Axis Number Clamp. Why: This channel's own tiny residual must not survive the inversion below. How: This zeroes oklBaxNum.


		}



		const invRgbArr = oklLinFun( [ 1 - oklLigNum, oklAaxNum, oklBaxNum ] ) // What: Inverted Rgb Array. Why: This is the actual lightness inversion (1 - L), converted back to a displayable channel range. How: This inverts oklLigNum, converts back to linear RGB, re-encodes to sRGB, then scales/rounds each channel to a 0-255 integer.
			.map( linSrgFun )                                         // What: Gamma Encode Step. Why: Screen colors are gamma-encoded sRGB, not linear light. How: This maps every channel through linSrgFun.
			.map( ( sRgbChaNum ) => Math.round( sRgbChaNum * 255 ) ); // What: Byte Scale Step. Why: Hex output needs whole 0-255 channel values. How: This scales each 0-1 channel by 255 and rounds it.



		return '#' + invRgbArr.map( ( chaValNum ) => Math.max( 0, Math.min( 255, chaValNum ) ).toString( 16 ).padStart( 2, '0' ) ).join( '' ); // What: Inverted Hex String Return. Why: The caller needs a plain '#rrggbb' string usable directly as a color input value. How: This clamps each channel into 0-255, hex-encodes it padded to 2 digits, and joins the 3 channels together.


	}

	catch ( errCauObj ) { return hexColStr; } // What: Conversion Failure Guard. Why: A malformed hexColStr must fall back to itself rather than throw all the way up to the caller. How: This returns hexColStr unchanged whenever anything above throws.


}

// #endregion invColFun



// #region uniNamFun

/**
 * uniNamFun = Unique Name Function
 *
 * @summary
 * Makes name unique among siblings (an array of existing sibling
 * names) by appending " (2)", " (3)", ... as needed. Compares
 * case-insensitively so "vacuum"/"Vacuum" collide. Used whenever an
 * item/reminder/picker is added or renamed, so two entries in the same
 * scope can't share a name the user can't tell apart.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param namRawStr  - Name Raw String: The candidate name to make unique.
 * @param sibNamArr  - Sibling Name Array: The sibling names already in use in
 *                     this scope.
 *
 * @returns The unique name: namRawStr as-is if it doesn't collide,
 * otherwise namRawStr (or its already-numbered base) with the next
 * free " (N)" suffix appended.
 *
 * @example
 * ```ts
 * uniNamFun('Vacuum', ['vacuum']) // => 'Vacuum (2)'
 * ```
 *
*/

function uniNamFun( namRawStr, sibNamArr ) {


	const takNamSet = new Set( sibNamArr.map( ( curNamStr ) => ( curNamStr || '' ).trim().toLowerCase() ) ); // What: Taken Name Set. Why: The collision check below needs every sibling name normalized the same way as the candidate. How: This trims and lowercases every entry of sibNamArr into a Set.
	const basNamStr = ( namRawStr || '' ).trim();                                                            // What: Base Name String. Why: The candidate itself needs the same trim before it's compared or returned. How: This trims namRawStr, falling back to an empty string.


	if ( !takNamSet.has( basNamStr.toLowerCase() ) ) return basNamStr; // What: No-Collision Guard. Why: A name that doesn't collide at all needs no renumbering. How: This returns basNamStr unchanged as soon as its lowercase form isn't in takNamSet.



	const stiNamStr = basNamStr.replace( /\s*\(\d+\)$/, '' ); // What: Stripped Name String. Why: A name that already ends in " (N)" must be re-numbered from its own bare base, not stacked again. How: This strips a trailing " (N)" suffix from basNamStr, if present.

	let sufCanNum = 2; // What: Suffix Candidate Number And Guard. Why: The loop below needs a running candidate suffix, starting at the first number that could possibly be free. How: This starts at 2 and is incremented until a free suffix is found.


	while ( takNamSet.has( `${ stiNamStr } (${ sufCanNum })`.toLowerCase() ) ) sufCanNum++; // What: Free-Suffix Search Loop. Why: Every already-taken suffix must be skipped until a genuinely free one is found. How: This keeps incrementing sufCanNum while its candidate string is still present in takNamSet.



	return `${ stiNamStr } (${ sufCanNum })`; // What: Numbered Name Return. Why: The caller needs the final, guaranteed-unique name. How: This combines stiNamStr with the first free sufCanNum found above.


}

// #endregion uniNamFun

// #endregion Shared Utilities



// #region Id Generation

// #region nclIdeFun

/**
 * nclIdeFun = New-Conditional-Log Identifier Function
 *
 * @summary
 * Mints a new, distinct id for one state.conditionalLog row, mirroring
 * newLogFun's own shape but with its own separate counter and prefix so
 * the two logs' ids can never collide with each other.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A new conditional-log row id string, prefixed 'cl_'.
 *
 * @example
 * ```ts
 * nclIdeFun() // => 'cl_abc123xy'
 * ```
 *
*/

function nclIdeFun() {


	return 'cl_' + Date.now().toString( 36 ) + ( __cdlSeqNum++ ).toString( 36 ); // What: Conditional-Log Id Return. Why: The caller needs a short, sortable, collision-resistant id. How: This concatenates a fixed prefix, the current time base-36, and the incrementing counter base-36.


}

// #endregion nclIdeFun



// #region newEidFun

/**
 * newEidFun = New Entry-Id Function
 *
 * @summary
 * Mints a new, distinct id for one Today entry. Entries are keyed by
 * this (not by pickerId) so the same picker can contribute more than
 * one choice to Today, and check/skip/re-roll can act on exactly one of
 * them.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A new Today-entry id string, prefixed 'e_'.
 *
 * @example
 * ```ts
 * newEidFun() // => 'e_abc123xy'
 * ```
 *
*/

function newEidFun() {


	return 'e_' + Date.now().toString( 36 ) + ( __eidSeqNum++ ).toString( 36 ); // What: Entry Id Return. Why: The caller needs a short, sortable, collision-resistant id. How: This concatenates a fixed prefix, the current time base-36, and the incrementing counter base-36.


}

// #endregion newEidFun



// #region newLogFun

/**
 * newLogFun = New Log Function
 *
 * @summary
 * Mints a new, distinct id for one state.pickLog row, sharing one
 * module-private counter so two ids minted in the same millisecond
 * still never collide.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A new pick-log row id string, prefixed 'pl_'.
 *
 * @example
 * ```ts
 * newLogFun() // => 'pl_abc123xy'
 * ```
 *
*/

function newLogFun() {


	return 'pl_' + Date.now().toString( 36 ) + ( __pclSeqNum++ ).toString( 36 ); // What: Pick-Log Id Return. Why: The caller needs a short, sortable, collision-resistant id. How: This concatenates a fixed prefix, the current time base-36, and the incrementing counter base-36.


}

// #endregion newLogFun

// #endregion Id Generation



// #region Pick Log Subsystem

/**
 * store.js = Pick Log Subsystem
 *
 * @summary
 * The pick log (state.pickLog) is an append-only, per-pick history that
 * powers the Stats tab: one flat list, not a table per picker, filtered
 * by date/pickerId as needed. Each row is a single pick that landed on
 * the Today list:
 *   { id, eid, date, pickerId, itemId, itemName, pickerName, group,
 *     done, completedAt, source }
 * date is the 'YYYY-MM-DD' the pick was placed on Today; eid links to a
 * live today.entries row (null once the day rolls); source is 'auto'
 * (placed by the Daily generator) or 'manual' (sent from the Pickers
 * tab). itemName/pickerName/group are denormalized so the log survives
 * an item/picker rename or delete, the same trick reminderLog uses. The
 * old per-day aggregate `history` is gone: Stats derives daily totals,
 * rankings, and streaks from this log on the fly.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region logRowFun

/**
 * logRowFun = Log Row Function
 *
 * @summary
 * Builds a fresh state.pickLog row for itemId under pickerId,
 * denormalizing the item's/picker's own current name/group so the row
 * survives a later rename or delete of either.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj             - Current State Object: The current state,
 *                                read (not mutated) to look up the item and
 *                                picker being logged.
 * @param logFieObj.date        - Date: The 'YYYY-MM-DD' to stamp the row with;
 *                                defaults to today.
 * @param logFieObj.depletedEnd - Depleted End: Whether this row ends an Ease
 *                                Down depletion streak; defaults to false.
 * @param logFieObj.eid         - Eid: Links the row to its live today.entries
 *                                row; defaults to null.
 * @param logFieObj.itemId      - Item Id: The item that was picked.
 * @param logFieObj.pickerId    - Picker Id: The picker the pick belongs to.
 * @param logFieObj.source      - Source: How the pick was made: 'auto' |
 *                                'manual' | 'reroll'.
 *
 * @returns A new pickLog row, in state.pickLog's own shape.
 *
 * @example
 * ```ts
 * logRowFun(curStaObj, { itemId, pickerId, source: 'auto' }) // => row
 * ```
 *
*/

function logRowFun( curStaObj, { date : datValStr, depletedEnd : depEndBoo = false, eid : entIdeStr = null, itemId : iteIdeStr, pickerId : picIdeStr, source : souValStr } ) {


	const curIteObj = curStaObj.items.find( ( iteFinObj ) => iteFinObj.id === iteIdeStr );   // What: Current Item Object And Guard. Why: The row below needs the item's own live name, or a removed-item fallback. How: This looks up iteIdeStr in curStaObj.items, undefined once removed.
	const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === picIdeStr ); // What: Current Picker Object And Guard. Why: The row below needs the picker's own live name/group, or removed-picker fallbacks. How: This looks up picIdeStr in curStaObj.pickers, undefined once removed.



	return { // What: Pick-Log Row Return. Why: The caller needs one fresh row shaped to state.pickLog's own contract. How: This builds the row from every argument plus the lookups above.


		completedAt : null,                                     // What: Completed At. Why: A freshly-logged pick has no completion timestamp yet. How: This is always null for a brand-new row.
		date        : datValStr || isoDayFun(),                 // What: Date. Why: Stats groups/filters rows by their own calendar day. How: This uses the given datValStr, defaulting to isoDayFun() when omitted.
		done        : false,                                    // What: Done. Why: A freshly-logged pick was never yet completed. How: This is always false for a brand-new row.
		eid         : entIdeStr,                                // What: Entry Id. Why: This links the row back to its live today.entries row, until the day rolls. How: This is copied straight from the entIdeStr parameter.
		group       : curPicObj ? curPicObj.group : '',         // What: Group. Why: Stats groups rows by their own picker's group. How: This reads curPicObj's own group, else empty when the picker is gone.
		id          : newLogFun(),                              // What: Id. Why: Every row needs its own stable, unique identifier. How: This mints one via newLogFun.
		itemId      : iteIdeStr,                                // What: Item Id. Why: Every row must record which item it belongs to. How: This is copied straight from the iteIdeStr parameter.
		itemName    : curIteObj ? curIteObj.name : '(removed)', // What: Item Name. Why: This denormalized copy lets the row survive a later rename or deletion of the item itself. How: This reads curIteObj's own name, else a removed-item placeholder.
		pickerId    : picIdeStr,                                // What: Picker Id. Why: Every row must record which picker it belongs to. How: This is copied straight from the picIdeStr parameter.
		pickerName  : curPicObj ? curPicObj.name : '(removed)', // What: Picker Name. Why: This denormalized copy lets the row survive a later rename or deletion of the picker itself. How: This reads curPicObj's own name, else a removed-picker placeholder.
		source      : souValStr,                                // What: Source. Why: Stats breaks rows down by how the pick was made. How: This is copied straight from the souValStr parameter.

		...( depEndBoo ? { depletedEnd : true } : {} ) // What: Depleted End Spread. Why: Only a row ending an Ease Down depletion streak needs this flag at all. How: This spreads in depletedEnd:true only when the depEndBoo parameter is truthy.


	};


}

// #endregion logRowFun

// #endregion Pick Log Subsystem



// #region Done-Gated Pick Mutations Mechanism

/**
 * store.js = Done-Gated Pick Mutations Mechanism
 *
 * @summary
 * A pick's own VALUE consequences (item value/weight changes, an
 * activeItemId patch, picks/lastPicked bumps, depletedEnd on the log)
 * are not applied when an entry is generated, re-rolled, or sent to
 * Today; only when the entry is marked DONE. Until then nothing about
 * item state changes, so an untouched item keeps its own charge and
 * keeps resurfacing. The staged mutation rides on the entry as
 * entry.pending; applying it records an entry.revert snapshot so
 * unchecking restores exactly:
 *   pending = { updates:[{id,value?,weight?}], pickerPatch?,
 *               depletedEnd?, pickedId?, bumpPick? }
 *
 * A direct edit to an item's own value (Fill/Refill/Reset, all three
 * living on tab-today.jsx's EntEdiCom, patched via updIteFun below)
 * is meant to win immediately, so it deliberately bypasses this
 * staging. But ease-up/dynamic pick()s stash an updates row for EVERY
 * pool item on each not-yet-done entry's own pending, not just the one
 * actually picked (see pick()'s own ease-up/dynamic cases in
 * pickers.js), snapshotted from value at generation time. Left alone,
 * later completing a SIBLING entry for the same picker would silently
 * overwrite the fresh direct edit with that stale snapshot via
 * enpAplFun below, which is the actual bug spuDroFun exists to prevent
 * (items looked like they "lost" a manual Fill/Refill/Reset).
 * It strips the touched item's own stale row from
 * every OTHER entry's pending; an item's OWN entry is left alone on
 * purpose, since its completion is still supposed to perform its
 * designed effect regardless of an interim Fill.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region spuDroFun

/**
 * spuDroFun = Stale-Pending-Updates Drop Function
 *
 * @summary
 * Strips any stale updates row for the given item ids from every NOT-
 * YET-DONE entry's own pending, except an entry whose own itemId is one
 * of those ids (see the design-rationale comment above). See the
 * design-rationale comment above for why this exists at all.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param todEntArr - Today Entry Array: The today.entries array to scan.
 * @param iteIdeArr - Item Identifier Array: The item ids whose stale
 *                    pending rows should be dropped.
 *
 * @returns The same todEntArr reference when nothing changed, else a new
 * array with the affected entries' own pending.updates filtered.
 *
 * @example
 * ```ts
 * spuDroFun(state.today.entries, [itemId]) // => entries
 * ```
 *
*/

function spuDroFun( todEntArr, iteIdeArr ) {


	const iteIdeSet = new Set( iteIdeArr ); // What: Item Identifier Set. Why: The scan below needs fast membership checks against the touched ids. How: This wraps iteIdeArr in a Set.


	if ( !iteIdeSet.size ) return todEntArr; // What: No-Ids Guard. Why: Nothing was touched, so there's nothing stale to drop. How: This returns todEntArr unchanged when iteIdeSet is empty.



	let entChaBoo = false; // What: Entry Changed Boolean And Guard. Why: The caller only wants a new array reference when something actually changed. How: This starts false and flips true the first time a pending.updates row is actually dropped below.


	const nexEntArr = todEntArr.map( ( curEntObj ) => { // What: Next Entries Array. Why: Every entry must be checked for a stale pending row belonging to one of the touched items. How: This maps todEntArr, returning each entry unchanged unless it needs its own pending.updates filtered.


		if ( curEntObj.done || !curEntObj.pending || !curEntObj.pending.updates || !curEntObj.pending.updates.length ) return curEntObj; // What: Nothing-To-Strip Guard. Why: A done entry's pending no longer matters, and an entry with no pending.updates has nothing to filter. How: This returns curEntObj unchanged whenever any of those hold.



		if ( iteIdeSet.has( curEntObj.itemId ) ) return curEntObj; // What: Own-Entry Guard. Why: An item's OWN entry must keep its designed completion effect regardless of an interim Fill (see the design-rationale comment above). How: This returns curEntObj unchanged when its own itemId is one of the touched ids.



		const filUpdArr = curEntObj.pending.updates.filter( ( curUpdObj ) => !iteIdeSet.has( curUpdObj.id ) ); // What: Filtered Updates Array. Why: Only rows for OTHER touched items are the actual stale ones to drop. How: This keeps every update row whose own id isn't in iteIdeSet.


		if ( filUpdArr.length === curEntObj.pending.updates.length ) return curEntObj; // What: Unchanged-Length Guard. Why: Nothing was actually dropped for this entry, so its own reference can stay stable. How: This returns curEntObj unchanged when filUpdArr's own length matches the original.



		entChaBoo = true; // What: Entry Changed Flag Set. Why: At least one entry's own pending.updates was actually filtered. How: This flips entChaBoo to true.



		return { ...curEntObj, pending : { ...curEntObj.pending, updates : filUpdArr } }; // What: Filtered Entry Return. Why: The caller needs this entry's own pending.updates replaced with the stale rows stripped. How: This spreads curEntObj and its own pending, overriding just updates.


	} );



	return entChaBoo ? nexEntArr : todEntArr; // What: Conditional Array Return. Why: The caller relies on reference equality to know nothing changed. How: This returns nexEntArr only when entChaBoo is true, else the original todEntArr.


}

// #endregion spuDroFun



// #region enpAplFun

/**
 * enpAplFun = Entry-Pending Apply Function
 *
 * @summary
 * Applies one Today entry's own staged entry.pending mutation (see the
 * design-rationale comment above) to items/pickers/pickLog, and returns
 * a revert snapshot so the exact reverse can be replayed later.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The current state, read (not
 *                    mutated) for its own items/pickers/pickLog.
 * @param curEntObj - Current Entry Object: The Today entry whose own pending
 *                    is being applied.
 *
 * @returns { items, pickers, pickLog, revert } with pending applied, or
 * the same items/pickers/pickLog and revert:null when curEntObj has no
 * pending at all.
 *
 * @example
 * ```ts
 * enpAplFun(state, entry) // => { items, pickers, pickLog, revert }
 * ```
 *
*/

function enpAplFun( curStaObj, curEntObj ) {


	const curPenObj = curEntObj.pending; // What: Current Pending Object And Guard. Why: Every mutation below is driven entirely by this entry's own staged pending payload. How: This reads curEntObj's own pending field.


	if ( !curPenObj ) return { // What: No-Pending Guard. Why: An entry with nothing staged has nothing to apply. How: This returns the state's own arrays untouched, with revert:null.


		items   : curStaObj.items,         // What: Items. Why: Nothing is applied, so the items stay as they are. How: This passes curStaObj's own items through.
		pickers : curStaObj.pickers,       // What: Pickers. Why: Nothing is applied, so the pickers stay as they are. How: This passes curStaObj's own pickers through.
		pickLog : curStaObj.pickLog || [], // What: Pick Log. Why: Callers always expect an array here. How: This passes the pick log through, defaulting to an empty array.
		revert  : null                     // What: Revert. Why: There is nothing to undo later. How: This is null.


	};



	const updIdeMap = new Map( ( curPenObj.updates || [] ).map( ( curUpdObj ) => [ curUpdObj.id, curUpdObj ] ) );                               // What: Update Identifier Map. Why: The items map below needs O(1) lookup of a touched item's own staged update. How: This maps every pending.updates row by its own id.
	const touIdeSet = new Set( [ ...( curPenObj.updates || [] ).map( ( curUpdObj ) => curUpdObj.id ), curPenObj.pickedId ].filter( Boolean ) ); // What: Touched Identifier Set. Why: Both the revert snapshot and the items map below need to know every item id this pending payload actually touches. How: This unions every updates row's own id with pickedId, dropping falsy entries.

	const revIteArr = curStaObj.items.filter( ( curIteObj ) => touIdeSet.has( curIteObj.id ) ).map( ( curIteObj ) => ( // What: Revert Item Array. Why: An exact undo later needs each touched item's own pre-apply snapshot. How: This filters to just the touched items and copies their own value/weight/picks/lastPicked/chargeStep.


		{ chargeStep : curIteObj.chargeStep, id : curIteObj.id, lastPicked : curIteObj.lastPicked, picks : curIteObj.picks, value : curIteObj.value, weight : curIteObj.weight } // What: Item Snapshot Object. Why: The revert needs each touched field exactly as it was. How: This copies the item's own id, value, weight, picks, lastPicked and chargeStep.


	) );

	const nowIsoStr = new Date().toISOString(); // What: Now Iso String. Why: A picked-and-bumped item needs a real completion timestamp. How: This reads the current instant as an ISO string.

	const nexIteArr = curStaObj.items.map( ( curIteObj ) => { // What: Next Item Array. Why: Every item must be checked for a staged update or a pick bump before the caller gets a fresh items array. How: This maps curStaObj.items, applying updIdeMap's own patch and/or the pick bump to a touched item, leaving everything else unchanged.


		if ( !touIdeSet.has( curIteObj.id ) ) return curIteObj; // What: Untouched-Item Guard. Why: An item this pending payload never mentions must pass through unchanged. How: This returns curIteObj unchanged when it isn't in touIdeSet.



		const matUpdObj = updIdeMap.get( curIteObj.id ); // What: Matched Update Object And Guard. Why: This item may or may not have its own staged value/weight/chargeStep patch. How: This looks up curIteObj's own id in updIdeMap, undefined when only pickedId touched it.
		const nexIteObj = { ...curIteObj };              // What: Next Item Object. Why: The patch below must not mutate curIteObj itself. How: This starts as a shallow copy of curIteObj.


		if ( matUpdObj ) { // What: Staged Patch Application. Why: Only the fields actually present on matUpdObj are meant to change. How: This conditionally overwrites value/weight/chargeStep on nexIteObj when each key is present on matUpdObj.


			if ( 'value' in matUpdObj ) nexIteObj.value = matUpdObj.value;                // What: Value Patch. Why: An updates row only sometimes carries a new value. How: This applies matUpdObj's own value only when the key is present.
			if ( 'weight' in matUpdObj ) nexIteObj.weight = matUpdObj.weight;             // What: Weight Patch. Why: An updates row only sometimes carries a new weight. How: This applies matUpdObj's own weight only when the key is present.
			if ( 'chargeStep' in matUpdObj ) nexIteObj.chargeStep = matUpdObj.chargeStep; // What: Charge Step Patch. Why: An updates row only sometimes carries a new chargeStep. How: This applies matUpdObj's own chargeStep only when the key is present.


		}



		if ( curIteObj.id === curPenObj.pickedId && curPenObj.bumpPick ) { // What: Pick Bump Guard. Why: Only the actually-picked item, and only when bumpPick was requested, gets its own picks/lastPicked bumped. How: This increments picks and stamps lastPicked on nexIteObj when both conditions hold.


			nexIteObj.picks = ( curIteObj.picks || 0 ) + 1; // What: Picks Increment. Why: The actually-picked item's own pick count must reflect this new pick. How: This increments nexIteObj.picks by 1.
			nexIteObj.lastPicked = nowIsoStr;               // What: Last Picked Stamp. Why: The actually-picked item's own last-picked timestamp must reflect this new pick. How: This sets nexIteObj.lastPicked to nowIsoStr.


		}



		return nexIteObj; // What: Next Item Return. Why: The caller needs this item's own patched copy. How: This returns nexIteObj, built above.


	} );


	const hasPipBoo = !!curPenObj.pickerPatch; // What: Has Picker-Patch Boolean. Why: Both the previous-active lookup and the pickers map below share this same condition. How: This coerces curPenObj's own pickerPatch to a real boolean.

	const preActIde = hasPipBoo // What: Previous Active Identifier. Why: The revert snapshot needs the picker's own activeItemId as it stood BEFORE this apply, but only when a pickerPatch is actually being applied. How: This looks up curEntObj's own picker and reads its current activeItemId, else stays undefined.
		? ( curStaObj.pickers.find( ( curPicObj ) => curPicObj.id === curEntObj.pickerId ) || {} ).activeItemId // What: Picker Active Item Branch. Why: A pickerPatch is about to overwrite activeItemId, so its old value must be kept. How: This reads the entry's own picker's current activeItemId.
		: undefined;                                                                                            // What: No Patch Branch. Why: Without a pickerPatch nothing about the picker changes. How: This leaves the value undefined, which enpRevFun reads as nothing to restore.

	const nexPicArr = hasPipBoo // What: Next Picker Array. Why: Only a pending payload carrying pickerPatch (e.g. Ease Down's activeItemId) needs any picker actually rewritten. How: This patches curEntObj's own picker with pickerPatch's own fields, else passes pickers through unchanged.
		? curStaObj.pickers.map( ( curPicObj ) => curPicObj.id === curEntObj.pickerId ? { ...curPicObj, ...curPenObj.pickerPatch } : curPicObj ) // What: Patched Pickers Branch. Why: The entry's own picker takes the staged patch. How: This spreads pickerPatch onto the matching picker only.
		: curStaObj.pickers; // What: Unchanged Pickers Branch. Why: Without a pickerPatch nothing about the pickers changes. How: This passes the pickers through.

	const nexLogArr = curPenObj.depletedEnd // What: Next Pick-Log Array. Why: depletedEnd is a value consequence, so it's only recorded on the live log row once the pending payload is actually applied. How: This flags the live (no outcome) row sharing curEntObj's own eid, else passes pickLog through unchanged.
		? ( curStaObj.pickLog || [] ).map( ( curRowObj ) => ( curRowObj.eid === curEntObj.eid && !curRowObj.outcome ) ? { ...curRowObj, depletedEnd : true } : curRowObj ) // What: Depleted Flag Branch. Why: The live log row records that this pick ended a depletion streak. How: This flags only the entry's own live row.
		: ( curStaObj.pickLog || [] ); // What: Unchanged Log Branch. Why: Without depletedEnd the log stays as it is. How: This passes the pick log through, defaulting to an empty array.



	return { // What: Applied Pending Result Return. Why: The caller (togDonFun) needs the patched arrays plus a revert snapshot to stash on the entry. How: This bundles nexIteArr/nexPicArr/nexLogArr with a revert object capturing revIteArr/preActIde/the entry's own pickerId.


		items   : nexIteArr,                                                                     // What: Items. Why: The caller writes the patched items back to state. How: This is nexIteArr.
		pickers : nexPicArr,                                                                     // What: Pickers. Why: The caller writes the patched pickers back to state. How: This is nexPicArr.
		pickLog : nexLogArr,                                                                     // What: Pick Log. Why: The caller writes the updated pick log back to state. How: This is nexLogArr.
		revert  : { activeItemId : preActIde, items : revIteArr, pickerId : curEntObj.pickerId } // What: Revert. Why: The entry must be able to undo this apply exactly. How: This snapshots the touched items and the picker's previous activeItemId.


	};


}

// #endregion enpAplFun



// #region enpRevFun

/**
 * enpRevFun = Entry-Pending Revert Function
 *
 * @summary
 * Exactly undoes enpAplFun's own effect using the entry.revert
 * snapshot it recorded, restoring each touched item's own pre-apply
 * value/weight/picks/lastPicked/chargeStep and, when a pickerPatch was
 * applied, the picker's own prior activeItemId.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The current state, read (not
 *                    mutated) for its own items/pickers/pickLog.
 * @param curEntObj - Current Entry Object: The Today entry being un-done,
 *                    whose own revert snapshot drives the restoration.
 *
 * @returns { items, pickers, pickLog } restored to their pre-apply
 * values, or the state's own arrays untouched when curEntObj has no
 * revert snapshot at all.
 *
 * @example
 * ```ts
 * enpRevFun(state, entry) // => { items, pickers, pickLog }
 * ```
 *
*/

function enpRevFun( curStaObj, curEntObj ) {


	const curRevObj = curEntObj.revert; // What: Current Revert Object And Guard. Why: Every restoration below is driven entirely by this entry's own recorded snapshot. How: This reads curEntObj's own revert field.


	if ( !curRevObj ) return { // What: No-Revert Guard. Why: An entry that was never applied (or already reverted) has nothing to restore. How: This returns the state's own arrays untouched.


		items   : curStaObj.items,        // What: Items. Why: Nothing is reverted, so the items stay as they are. How: This passes curStaObj's own items through.
		pickers : curStaObj.pickers,      // What: Pickers. Why: Nothing is reverted, so the pickers stay as they are. How: This passes curStaObj's own pickers through.
		pickLog : curStaObj.pickLog || [] // What: Pick Log. Why: Callers always expect an array here. How: This passes the pick log through, defaulting to an empty array.


	};



	const revIdeMap = new Map( curRevObj.items.map( ( curSnaObj ) => [ curSnaObj.id, curSnaObj ] ) ); // What: Revert Identifier Map. Why: The items map below needs O(1) lookup of each item's own pre-apply snapshot. How: This maps every curRevObj.items row by its own id.

	const nexIteArr = curStaObj.items.map( ( curIteObj ) => { // What: Next Item Array. Why: Every item must be checked for a matching snapshot to restore. How: This maps curStaObj.items, restoring a matched item's own value/weight/picks/lastPicked/chargeStep, else leaving it unchanged.


		const matRevObj = revIdeMap.get( curIteObj.id ); // What: Matched Revert Object And Guard. Why: Only items this snapshot actually covers get restored. How: This looks up curIteObj's own id in revIdeMap, undefined when it wasn't touched.



		return matRevObj // What: Restored Item Return. Why: The caller needs either the restored copy or the item untouched. How: This spreads curIteObj with matRevObj's own fields when matched, else returns curIteObj as-is.
			? { ...curIteObj, chargeStep : matRevObj.chargeStep, lastPicked : matRevObj.lastPicked, picks : matRevObj.picks, value : matRevObj.value, weight : matRevObj.weight } // What: Restored Item Branch. Why: A matched item gets its snapshot fields back. How: This spreads the snapshot's own fields over curIteObj.
			: curIteObj; // What: Untouched Item Branch. Why: An item with no snapshot never changed. How: This returns curIteObj as it is.


	} );

	const nexPicArr = ( curRevObj.activeItemId !== undefined ) // What: Next Picker Array. Why: Only a snapshot that actually recorded a previous activeItemId needs any picker rewritten back. How: This restores curRevObj's own pickerId's activeItemId, else passes pickers through unchanged.
		? curStaObj.pickers.map( ( curPicObj ) => curPicObj.id === curRevObj.pickerId ? { ...curPicObj, activeItemId : curRevObj.activeItemId } : curPicObj ) // What: Restored Pickers Branch. Why: The entry's own picker gets its previous activeItemId back. How: This rewrites activeItemId on the matching picker only.
		: curStaObj.pickers; // What: Unchanged Pickers Branch. Why: With no recorded activeItemId there is nothing to restore. How: This passes the pickers through.

	const nexLogArr = ( curStaObj.pickLog || [] ).map( ( curRowObj ) => // What: Next Pick-Log Array. Why: A reverted day no longer counts as ending an Ease Down depletion streak. How: This strips depletedEnd back to false on the live (no outcome) row sharing curEntObj's own eid.
		( curRowObj.eid === curEntObj.eid && !curRowObj.outcome ) ? { ...curRowObj, depletedEnd : false } : curRowObj ); // What: Depleted Flag Clear. Why: Only the entry's own live row carried the flag. How: This sets depletedEnd back to false on that row and passes every other row through.



	return { items : nexIteArr, pickers : nexPicArr, pickLog : nexLogArr }; // What: Reverted Result Return. Why: The caller (togDonFun/skiEntFun/swaIteFun) needs the restored arrays. How: This bundles nexIteArr/nexPicArr/nexLogArr together.


}

// #endregion enpRevFun




// #region cotAplFun

/**
 * cotAplFun = Conditional-Toggle Apply Function
 *
 * @summary
 * Resolves the conditional consequences of toggling one Today entry
 * done/undone. A day-off CARD entry (kind:'dayoff') drives its own
 * conditional's carComFun (ease-up/dynamic reset, ease-down
 * discharge) with an undo snapshot in _cardPrev. A dependent PICKER
 * entry (whose own picker.conditionalId is set) advances its
 * conditional's own value on the FIRST dependent completion of the day
 * (the 0-to-1 count edge), and reverts when the count returns to 0,
 * with an undo snapshot in _chargePrev. _cardPrev/_chargePrev are real
 * persisted fields on the conditional, not local bookkeeping.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The current state, read (not
 *                    mutated) for its own pickers/conditionals.
 * @param nexEntArr - Next Entry Array: today.entries AFTER this toggle has
 *                    already been applied to it, used to count dependent
 *                    completions.
 * @param togEntObj - Toggle Entry Object: The entry that was just toggled.
 * @param nowDonBoo - Now Done Boolean: Whether togEntObj is now done (true)
 *                     or was just un-done (false).
 *
 * @returns The updated conditionals array, or the same reference when
 * nothing about it actually changes.
 *
 * @example
 * ```ts
 * cotAplFun(state, nextEntries, entry, true) // => conditionals
 * ```
 *
*/

function cotAplFun( curStaObj, nexEntArr, togEntObj, nowDonBoo ) {


	const curConArr = curStaObj.conditionals || []; // What: Current Conditionals Array And Guard. Why: Every branch below reads/maps over the live conditionals list. How: This reads curStaObj's own conditionals, defaulting to empty.


	if ( !curConArr.length ) return curConArr; // What: No-Conditionals Guard. Why: An app with no conditionals at all has nothing to resolve. How: This returns curConArr unchanged when it's empty.



	const conModObj = CON_NAM_OBJ; // What: Conditional Module Object. Why: Every branch below repeatedly calls into this module's own resolution helpers. How: This aliases the imported CON_NAM_OBJ namespace for brevity below.


	if ( togEntObj.kind === 'dayoff' && togEntObj.conditionalId ) { // What: Day-Off Card Branch. Why: A day-off card entry's own completion drives its conditional's carComFun instead of the dependent-picker charging logic below. How: This maps curConArr, resolving only the one matching conditional.


		return curConArr.map( ( curConObj ) => { // What: Card Toggle Conditionals Map. Why: Every conditional except the one matching togEntObj.conditionalId must pass through untouched, while the matching one needs its own day-off completion/reversion resolved. How: This maps curConArr, guarding on id first, then branching on nowDonBoo to apply carComFun's own patch (completion) or restore the earlier _cardPrev snapshot (reversion).


			if ( curConObj.id !== togEntObj.conditionalId ) return curConObj; // What: Non-Matching Guard. Why: Every other conditional is untouched by this card's own toggle. How: This returns curConObj unchanged when its own id doesn't match.



			if ( nowDonBoo ) { // What: Now-Done Branch. Why: Completing the card is what actually drives its own mode-specific completion effect. How: This calls carComFun and snapshots the pre-effect fields into _cardPrev before applying its own patch.


				const patValObj = conModObj.carComFun( curConObj ); // What: Patch Value Object And Guard. Why: Some modes (probability) treat completion as informational only, returning no patch. How: This calls conModObj's own carComFun on curConObj.


				if ( !patValObj ) return curConObj; // What: No-Patch Guard. Why: A probability-mode card has nothing to actually mutate on completion. How: This returns curConObj unchanged when patValObj is falsy.



				return { ...curConObj, _cardPrev : { chargeStep : curConObj.chargeStep, triggered : curConObj.triggered, value : curConObj.value }, ...patValObj }; // What: Applied Card Patch Return. Why: The caller needs curConObj patched, with its own pre-effect fields snapshotted for undo. How: This spreads curConObj, its own _cardPrev snapshot, then patValObj's own fields.


			}



			const preSnaObj = curConObj._cardPrev; // What: Previous Snapshot Object And Guard. Why: Un-completing the card only makes sense if it actually recorded a snapshot to restore. How: This reads curConObj's own _cardPrev field.


			if ( !preSnaObj ) return curConObj; // What: No-Snapshot Guard. Why: A card that was never completed (or already reverted) has nothing to restore. How: This returns curConObj unchanged when preSnaObj is falsy.



			const { _cardPrev, ...remFieObj } = curConObj; // What: Remaining Fields Object. Why: The restored object below must drop the now-consumed _cardPrev snapshot. How: This destructures _cardPrev off curConObj, keeping every other field in remFieObj.



			return { ...remFieObj, chargeStep : preSnaObj.chargeStep, triggered : preSnaObj.triggered, value : preSnaObj.value }; // What: Restored Card Return. Why: The caller needs curConObj's own pre-completion fields restored exactly. How: This spreads remFieObj, overriding value/triggered/chargeStep from preSnaObj.


		} );


	}



	const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === togEntObj.pickerId ); // What: Current Picker Object And Guard. Why: A dependent entry's own conditional is looked up through its picker, not the entry itself. How: This looks up togEntObj's own pickerId in curStaObj.pickers.
	const conIdeStr = curPicObj && curPicObj.conditionalId;                                           // What: Conditional Identifier String And Guard. Why: An entry whose picker has no conditionalId gates nothing. How: This reads curPicObj's own conditionalId, or stays falsy when curPicObj is missing.


	if ( !conIdeStr ) return curConArr; // What: No-Conditional Guard. Why: An ungated picker's entry has no dependent conditional to charge. How: This returns curConArr unchanged when conIdeStr is falsy.



	const depDonNum = nexEntArr.filter( ( curEntObj ) => { // What: Dependent Done Number. Why: The charging edge below only fires on the FIRST dependent completion of the day, so every OTHER done dependent entry for this same conditional must be counted. How: This counts entries (excluding day-off cards) whose own picker shares conIdeStr and are done.


		if ( curEntObj.kind === 'dayoff' || !curEntObj.done ) return false; // What: Non-Dependent Guard. Why: A day-off card, or an entry that isn't done, never counts as a dependent completion. How: This excludes both cases from the count.



		const matPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === curEntObj.pickerId ); // What: Matched Picker Object And Guard. Why: Only an entry whose own picker shares this exact conditional counts. How: This looks up curEntObj's own pickerId in curStaObj.pickers.



		return matPicObj && matPicObj.conditionalId === conIdeStr; // What: Dependent Match Return. Why: The filter above needs a plain boolean verdict. How: This is true only when matPicObj exists and shares conIdeStr.


	} ).length; // What: Match Count Read. Why: The caller only needs how many entries matched. How: This reads the filtered array's own length.



	return curConArr.map( ( curConObj ) => { // What: Charged Conditionals Return. Why: Only the one matching value-mode conditional can advance or revert here. How: This maps curConArr, resolving the charging/reverting edges for the matching conditional only.


		if ( curConObj.id !== conIdeStr || !conModObj.modValFun( curConObj.mode ) ) return curConObj; // What: Non-Matching Guard. Why: Every other conditional, and a non-value-mode match, is untouched here. How: This returns curConObj unchanged when either condition holds.



		if ( nowDonBoo && depDonNum === 1 && !curConObj.chargedToday ) { // What: Charging-Edge Branch. Why: The FIRST dependent completion of an as-yet-uncharged day is what actually advances the conditional's own value. How: This calls advValFun and snapshots the pre-effect fields into _chargePrev before applying its own patch.


			const patValObj = conModObj.advValFun( curConObj ); // What: Patch Value Object And Guard. Why: Some modes may decline to advance at all. How: This calls conModObj's own advValFun on curConObj.


			if ( !patValObj ) return curConObj; // What: No-Patch Guard. Why: A decline to advance leaves curConObj with nothing to mutate. How: This returns curConObj unchanged when patValObj is falsy.



			return { ...curConObj, _chargePrev : { chargedToday : curConObj.chargedToday, chargeStep : curConObj.chargeStep, triggered : curConObj.triggered, value : curConObj.value }, ...patValObj }; // What: Applied Charge Patch Return. Why: The caller needs curConObj patched, with its own pre-effect fields snapshotted for undo. How: This spreads curConObj, its own _chargePrev snapshot, then patValObj's own fields.


		}



		if ( !nowDonBoo && depDonNum === 0 && curConObj._chargePrev ) { // What: Reverting-Edge Branch. Why: Once the LAST dependent completion of the day is un-done, the earlier charge must be undone too. How: This restores curConObj's own pre-charge fields from _chargePrev.


			const preSnaObj = curConObj._chargePrev; // What: Previous Snapshot Object. Why: The restoration below needs the exact pre-charge fields recorded earlier. How: This reads curConObj's own _chargePrev field.

			const { _chargePrev, ...remFieObj } = curConObj; // What: Remaining Fields Object. Why: The restored object below must drop the now-consumed _chargePrev snapshot. How: This destructures _chargePrev off curConObj, keeping every other field in remFieObj.



			return { ...remFieObj, chargedToday : preSnaObj.chargedToday, chargeStep : preSnaObj.chargeStep, triggered : preSnaObj.triggered, value : preSnaObj.value }; // What: Restored Charge Return. Why: The caller needs curConObj's own pre-charge fields restored exactly. How: This spreads remFieObj, overriding value/triggered/chargedToday/chargeStep from preSnaObj.


		}



		return curConObj; // What: Unchanged Conditional Return. Why: Neither edge condition applied, so curConObj passes through untouched. How: This returns curConObj as-is.


	} );


}

// #endregion cotAplFun



// #region cdlAplFun

/**
 * cdlAplFun = Conditional-Log Apply Function
 *
 * @summary
 * Mirrors cotAplFun's own completion edges, but records ONE
 * row per conditional per cycle (keyed condId + ISO day) in
 * state.conditionalLog instead of mutating the conditional itself. A
 * day-off CARD completion always logs triggered:true; the FIRST
 * dependent completion of an untriggered cycle logs triggered:false
 * (the "evaluated but didn't fire" denominator). An inactive
 * conditional (active:false) logs nothing. Undo removes the cycle's own
 * row once the confirming completion is gone. Rows denormalize name and
 * mode so the log survives edits/deletes.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The current state, read (not
 *                    mutated) for its own pickers/conditionals/conditionalLog.
 * @param nexEntArr - Next Entry Array: today.entries AFTER this toggle has
 *                    already been applied to it, used to count dependent
 *                    completions.
 * @param togEntObj - Toggle Entry Object: The entry that was just toggled.
 * @param nowDonBoo - Now Done Boolean: Whether togEntObj is now done (true)
 *                     or was just un-done (false).
 *
 * @returns The updated conditionalLog array, or the same reference when
 * nothing about it actually changes.
 *
 * @example
 * ```ts
 * cdlAplFun(state, nextEntries, entry, true) // => conditionalLog
 * ```
 *
*/

function cdlAplFun( curStaObj, nexEntArr, togEntObj, nowDonBoo ) {


	const curLogArr = curStaObj.conditionalLog || []; // What: Current Log Array. Why: Every branch below either returns this untouched or derives a new array from it. How: This reads curStaObj's own conditionalLog, defaulting to empty.
	const curConArr = curStaObj.conditionals || [];   // What: Current Conditionals Array And Guard. Why: The lookups below need the live conditionals list. How: This reads curStaObj's own conditionals, defaulting to empty.


	if ( !curConArr.length ) return curLogArr; // What: No-Conditionals Guard. Why: An app with no conditionals at all has nothing to log. How: This returns curLogArr unchanged when curConArr is empty.



	let conIdeStr = null; // What: Conditional Identifier String And Guard. Why: Both branches below need somewhere to record which conditional (if any) this toggle concerns. How: This starts null and is set by whichever branch below actually matches.
	let trgValBoo = null; // What: Triggered Value Boolean And Guard. Why: Both branches below need somewhere to record whether this toggle counts as triggered. How: This starts null and is set alongside conIdeStr by whichever branch below actually matches.


	if ( togEntObj.kind === 'dayoff' && togEntObj.conditionalId ) { // What: Day-Off Card Branch. Why: A day-off card's own completion always logs as triggered. How: This sets conIdeStr/trgValBoo directly from togEntObj.


		conIdeStr = togEntObj.conditionalId; // What: Conditional Id String Set. Why: A day-off card's own log entry names the exact conditional it belongs to. How: This sets conIdeStr to togEntObj's own conditionalId.
		trgValBoo = true;                    // What: Trigger Value Boolean Set. Why: A day-off card's own completion always counts as triggered. How: This sets trgValBoo true.


	}

	else if ( togEntObj.pickerId ) { // What: Dependent Picker Branch. Why: A dependent entry's own conditional is looked up through its picker, and always logs as not-yet-triggered. How: This looks up the picker and, if gated, sets conIdeStr/trgValBoo.


		const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === togEntObj.pickerId ); // What: Current Picker Object And Guard. Why: Only a gated picker's entry logs anything at all. How: This looks up togEntObj's own pickerId in curStaObj.pickers.


		if ( curPicObj && curPicObj.conditionalId ) { // What: Gated-Picker Guard. Why: An ungated picker's entry logs nothing. How: This sets conIdeStr/trgValBoo only when curPicObj exists and carries a conditionalId.


			conIdeStr = curPicObj.conditionalId; // What: Conditional Id String Set. Why: The log entry needs to know which conditional this dependent picker is actually gated by. How: This sets conIdeStr to curPicObj's own conditionalId.
			trgValBoo = false;                   // What: Trigger Value Boolean Set. Why: A dependent entry always logs as not-yet-triggered. How: This sets trgValBoo false.


		}


	}



	if ( !conIdeStr ) return curLogArr; // What: No-Match Guard. Why: Neither branch above found a conditional to log against. How: This returns curLogArr unchanged when conIdeStr is still null.



	const curConObj = curConArr.find( ( conFinObj ) => conFinObj.id === conIdeStr ); // What: Current Conditional Object And Guard. Why: An inactive conditional must log nothing at all. How: This looks up conIdeStr in curConArr.


	if ( !curConObj || curConObj.active === false ) return curLogArr; // What: Inactive Guard. Why: An inactive conditional (or one that vanished) runs no logic and logs nothing. How: This returns curLogArr unchanged when curConObj is missing or explicitly inactive.



	const curDayStr = isoDayFun();                                                                                       // What: Current Day String. Why: A conditionalLog row is keyed by conditional id plus this exact calendar day. How: This reads today's own isoDayFun().
	const exiRowObj = curLogArr.find( ( curRowObj ) => curRowObj.condId === conIdeStr && curRowObj.date === curDayStr ); // What: Existing Row Object And Guard. Why: Only one row per conditional per cycle is ever kept. How: This looks up an existing row sharing conIdeStr and curDayStr.


	const depDonFun = () => nexEntArr.filter( ( curEntObj ) => { // What: Dependent Done Function. Why: Both branches below need to know how many dependent entries for this exact conditional are currently done. How: This counts entries (excluding day-off cards) whose own picker shares conIdeStr and are done.


		if ( curEntObj.kind === 'dayoff' || !curEntObj.done ) return false; // What: Non-Dependent Guard. Why: A day-off card, or an entry that isn't done, never counts as a dependent completion. How: This excludes both cases from the count.



		const matPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === curEntObj.pickerId ); // What: Matched Picker Object And Guard. Why: Only an entry whose own picker shares this exact conditional counts. How: This looks up curEntObj's own pickerId in curStaObj.pickers.



		return matPicObj && matPicObj.conditionalId === conIdeStr; // What: Dependent Match Return. Why: The filter above needs a plain boolean verdict. How: This is true only when matPicObj exists and shares conIdeStr.


	} ).length; // What: Match Count Read. Why: The caller only needs how many entries matched. How: This reads the filtered array's own length.


	if ( nowDonBoo ) { // What: Now-Done Branch. Why: A completion may add a new row, subject to the one-row-per-cycle and first-dependent rules. How: This either returns curLogArr unchanged or appends one fresh row.


		if ( exiRowObj ) return curLogArr; // What: One-Row-Per-Cycle Guard. Why: This cycle already has its own row; a second completion mustn't duplicate it. How: This returns curLogArr unchanged when exiRowObj already exists.



		if ( !trgValBoo && depDonFun() !== 1 ) return curLogArr; // What: First-Dependent Guard. Why: An untriggered cycle only logs on its FIRST dependent completion, not every subsequent one. How: This returns curLogArr unchanged when trgValBoo is false and depDonFun() isn't exactly 1.



		return [ // What: Appended Row Return. Why: The caller needs this cycle's own new row appended. How: This appends one row shaped to state.conditionalLog's own contract.


			...curLogArr, // What: Current Log Spread. Why: Every earlier row must stay in place. How: This spreads curLogArr first.

			{ // What: New Row Object. Why: This is the cycle's own new conditional-log row. How: Its fields below follow state.conditionalLog's contract.


				condId    : conIdeStr,      // What: Conditional Identifier. Why: The row must name the conditional it belongs to. How: This is conIdeStr.
				date      : curDayStr,      // What: Date. Why: The Stats tab groups conditional history by day. How: This is today's own ISO date.
				id        : nclIdeFun(),    // What: Identifier. Why: Every log row needs its own unique id. How: This draws the next conditional-log id.
				mode      : curConObj.mode, // What: Mode. Why: Log rows denormalize the mode so history survives a later mode change. How: This copies the conditional's own mode.
				name      : curConObj.name, // What: Name. Why: Log rows denormalize the name so history survives a rename. How: This copies the conditional's own name.
				triggered : trgValBoo       // What: Triggered. Why: This records whether the gate fired this cycle. How: This is trgValBoo.


			}


		];


	}



	if ( !exiRowObj ) return curLogArr; // What: No-Existing-Row Guard. Why: Un-doing a completion that never actually logged a row has nothing to remove. How: This returns curLogArr unchanged when exiRowObj is missing.



	if ( !trgValBoo && depDonFun() > 0 ) return curLogArr; // What: Still-Confirmed Guard. Why: Another dependent completion still stands, so this cycle's own row must stay. How: This returns curLogArr unchanged when trgValBoo is false and depDonFun() is still above 0.



	return curLogArr.filter( ( curRowObj ) => !( curRowObj.condId === conIdeStr && curRowObj.date === curDayStr ) ); // What: Row-Removed Return. Why: The confirming completion is gone, so this cycle's own row must be dropped. How: This filters out the one row sharing conIdeStr and curDayStr.


}

// #endregion cdlAplFun

// #endregion Done-Gated Pick Mutations Mechanism



// #region State Persistence

// #region migStaFun

/**
 * migStaFun = Migrate State Function
 *
 * @summary
 * The one-time migration point for old persisted state: every save
 * loaded from disk, and every imported backup, passes through here so
 * a missing field gets backfilled one `if` block at a time instead of
 * the rest of the app seeing "Invalid Date" or a missing key. Every
 * check below tests/writes a REAL persisted field by its own exact
 * property name; those names are the actual schema and must never be
 * "helpfully" renamed, only their surrounding code reformatted. New
 * migrations get added here as the state shape grows; state.v is
 * stamped with SCH_VER_NUM at the very end.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The raw, possibly-old-shaped state
 *                    to migStaFun in place.
 *
 * @returns curStaObj itself, mutated in place with every missing field
 * backfilled and state.v stamped.
 *
 * @example
 * ```ts
 * migStaFun(rawState) // => state
 * ```
 *
*/

function migStaFun( curStaObj ) {


	if ( curStaObj && curStaObj.today && !curStaObj.today.generatedAt ) { // What: Generated-At Backfill Guard. Why: Old state predates today.generatedAt entirely, and the footer needs SOME timestamp to read sensibly until the next regen. How: This backfills to "this morning" (7:12am) when today exists but generatedAt is missing.


		const defDatObj = new Date(); // What: Default Date Object. Why: A plausible "already generated this morning" moment is friendlier than an obviously-fake placeholder. How: This takes the current date as a starting point, pinned to 7:12am below.

		defDatObj.setHours( 7, 12, 0, 0 ); // What: Default Date Hours Pin. Why: The backfilled timestamp must read as "this morning" rather than the actual current moment. How: This pins defDatObj's own time to 7:12am.

		curStaObj.today.generatedAt = defDatObj.toISOString(); // What: Generated-At Backfill. Why: today.generatedAt must exist for the footer/streak logic elsewhere to read. How: This stamps defDatObj's own ISO string onto curStaObj.today.generatedAt.


	}



	if ( curStaObj && curStaObj.today && curStaObj.today.streakClaimed === undefined ) { // What: Streak-Claimed Backfill Guard. Why: Old state predates today.streakClaimed; whether today already counts toward the streak must be inferred from whether anything is done. How: This backfills true when any existing entry is already done, else false.


		curStaObj.today.streakClaimed = ( curStaObj.today.entries || [] ).some( ( curEntObj ) => curEntObj.done ); // What: Streak-Claimed Backfill. Why: This is the same "was anything already done today" rule stkSynFun itself uses. How: This checks whether any of today's own entries is already done.


	}



	if ( curStaObj && curStaObj.today && Array.isArray( curStaObj.today.entries ) ) { // What: Entry-Id Backfill Guard. Why: Older state (and the seed) predates per-entry eids, needed to support more than one entry per picker. How: This mints a fresh eid for any entry that doesn't already have one.


		for ( const curEntObj of curStaObj.today.entries ) { if ( !curEntObj.eid ) curEntObj.eid = newEidFun(); } // What: Entry-Id Backfill Loop. Why: Every entry needs its own stable eid, whether or not it already had one. How: This mints a fresh eid for any entry currently missing one, in place.


	}



	if ( curStaObj && Array.isArray( curStaObj.pickers ) && curStaObj.pickers.some( ( curPicObj ) => Array.isArray( curPicObj.itemIds ) ) ) { // What: Category-Collapse Backfill Guard. Why: The old category layer (picker.itemIds + item.categoryId) is collapsed into a direct item.pickerId link; detected by any picker still carrying an itemIds array. How: This rebuilds every item's own pickerId from whichever picker's itemIds listed it, then drops itemIds/categoryId/categories entirely.


		const itePicObj = {}; // What: Item Picker Object And Guard. Why: The item map below needs O(1) lookup of which picker (if any) used to list a given item id. How: This starts empty and is filled by the loop directly below.


		for ( const curPicObj of curStaObj.pickers ) { // What: Item-Picker Fill Loop. Why: Every old itemIds list must be inverted into itePicObj before the item map below can use it. How: This iterates every picker with an itemIds array, filing each listed id under this picker's own id.


			if ( Array.isArray( curPicObj.itemIds ) ) for ( const ownIdeStr of curPicObj.itemIds ) itePicObj[ ownIdeStr ] = curPicObj.id; // What: Owned-Id Fill. Why: Every item id this picker used to own must map back to this picker's own id. How: This assigns curPicObj.id under ownIdeStr for every id in curPicObj.itemIds.


		}


		if ( Array.isArray( curStaObj.items ) ) { // What: Item Pickerid Rewrite Guard. Why: Only when items actually exist is there anything to rewrite. How: This maps every item to carry a real pickerId and drop its own old categoryId.


			curStaObj.items = curStaObj.items.map( ( curIteObj ) => { // What: Item Picker Rewrite Map. Why: Every item must end up carrying a real pickerId. How: This maps each item, resolving its picker below.


				const rspIdeStr = curIteObj.pickerId || itePicObj[ curIteObj.id ] || null; // What: Resolved-Picker Identifier String. Why: An item may already carry a pickerId, or only be inferable from the old itemIds inversion above. How: This prefers curIteObj's own pickerId, falling back to itePicObj's lookup, then null.

				const { categoryId, ...remFieObj } = curIteObj; // What: Remaining Fields Object. Why: The old categoryId field must be dropped entirely, not merely ignored. How: This destructures categoryId off curIteObj, keeping every other field in remFieObj.



				return { ...remFieObj, pickerId : rspIdeStr }; // What: Rewritten Item Return. Why: The caller needs this item's own real pickerId written, with categoryId gone. How: This spreads remFieObj with pickerId set to rspIdeStr.


			} );


		}



		curStaObj.pickers = curStaObj.pickers.map( ( curPicObj ) => { const { itemIds, ...remFieObj } = curPicObj; return remFieObj; } ); // What: Picker Itemids Drop. Why: A picker no longer owns an itemIds list at all once items carry their own pickerId. How: This destructures itemIds off every picker, keeping every other field.

		delete curStaObj.categories; // What: Categories Entity Drop. Why: The categories entity is gone entirely under the new model. How: This deletes curStaObj's own categories field outright.


	}



	if ( curStaObj && !curStaObj.holidays && HOL_NAM_OBJ ) curStaObj.holidays = HOL_NAM_OBJ.defStaFun(); // What: Holidays Backfill. Why: The daily-schedule config (a global editable holiday list) was added later than this file's own first save shape. How: This backfills curStaObj.holidays to HOL_NAM_OBJ's own default state when it's missing.



	if ( curStaObj && curStaObj.daily && !curStaObj.daily.runTime ) curStaObj.daily.runTime = '04:00'; // What: Daily Run-Time Backfill. Why: The Daily generator's own auto-run time was added later, defaulting to 4:00am. How: This backfills curStaObj.daily.runTime when curStaObj.daily exists but lacks one.



	if ( curStaObj && !curStaObj.appearance ) curStaObj.appearance = { autoSystem : false, completionStyle : 'ripple', customDark : null, customLight : null, pickAnim : 'reel', tabPlacement : 'bottom', theme : 'ink' }; // What: Appearance Backfill. Why: The Settings tab's real persisted theme choice was added later, replacing a design-time-only palette default. How: This backfills curStaObj.appearance to a full default object when it's entirely missing.



	if ( curStaObj && curStaObj.appearance && curStaObj.appearance.autoSystem === undefined ) curStaObj.appearance.autoSystem = false; // What: Appearance Auto-System Backfill. Why: The "match system dark mode" toggle was added after appearance itself existed for some users. How: This backfills autoSystem to false when curStaObj.appearance exists but lacks it.



	if ( curStaObj && curStaObj.appearance && !curStaObj.appearance.pickAnim ) curStaObj.appearance.pickAnim = 'reel'; // What: Appearance Pick-Anim Backfill. Why: The pick-reveal animation style was added after appearance itself existed for some users. How: This backfills pickAnim to 'reel' when curStaObj.appearance exists but lacks it.



	if ( curStaObj && curStaObj.appearance && !curStaObj.appearance.completionStyle ) curStaObj.appearance.completionStyle = 'ripple'; // What: Appearance Completion-Style Backfill. Why: The completion-celebration style was added after appearance itself existed for some users. How: This backfills completionStyle to 'ripple' when curStaObj.appearance exists but lacks it.



	if ( curStaObj && curStaObj.appearance && !curStaObj.appearance.tabPlacement ) curStaObj.appearance.tabPlacement = 'bottom'; // What: Appearance Tab-Placement Backfill. Why: The tab bar placement option was added after appearance itself existed for some users. How: This backfills tabPlacement to 'bottom' when curStaObj.appearance exists but lacks it.



	if ( curStaObj && curStaObj.daily && !curStaObj.daily.mode ) curStaObj.daily.mode = 'auto'; // What: Daily Mode Backfill. Why: Whether the Daily generator runs on its own or only manually was added later, defaulting to 'auto'. How: This backfills curStaObj.daily.mode when curStaObj.daily exists but lacks one.



	if ( curStaObj && !Array.isArray( curStaObj.tasks ) ) curStaObj.tasks = []; // What: Tasks Array Backfill. Why: The manual reminders entity was added later; old state has no tasks array at all. How: This backfills curStaObj.tasks to an empty array when it isn't already one.



	if ( curStaObj && Array.isArray( curStaObj.tasks ) && TAS_NAM_OBJ ) { // What: Stale One-Time Task Purge Guard. Why: A one-time reminder completed on a previous day shouldn't linger forever. How: This drops every task TAS_NAM_OBJ itself considers stale-once.


		curStaObj.tasks = curStaObj.tasks.filter( ( curTasObj ) => !TAS_NAM_OBJ.isaStaFun( curTasObj ) ); // What: Stale-Once Filter. Why: Only TAS_NAM_OBJ itself knows the exact staleness rule for a one-time reminder. How: This keeps every task TAS_NAM_OBJ.isaStaFun reports false for.


	}



	if ( curStaObj && Array.isArray( curStaObj.tasks ) ) { // What: Task Hidden-Flag Backfill Guard. Why: The hidden flag (lets a picker/task be kept but excluded from every list/count/generator run) was added later; used to tuck the Welcome Tour's own sample pickers/reminders out of sight without deleting their history. How: This backfills hidden:false on any task that doesn't already carry a real boolean there.


		curStaObj.tasks = curStaObj.tasks.map( ( curTasObj ) => ( typeof curTasObj.hidden === 'boolean' ? curTasObj : { ...curTasObj, hidden : false } ) ); // What: Task Hidden-Flag Map. Why: Only a task genuinely missing a real boolean hidden field needs patching. How: This passes a task through unchanged when hidden is already boolean, else spreads in hidden:false.


	}



	if ( curStaObj && Array.isArray( curStaObj.tasks ) ) { // What: Task Scheduling-Fields Backfill Guard. Why: Every-N-weeks/months/years plus "Nth weekday" scheduling added dateMode/nthOrdinal/nthWeekday, which the UI now reads directly and so must be backfilled explicitly. How: This leaves an already-migrated task alone, else defaults it to plain date-based scheduling anchored on today.


		curStaObj.tasks = curStaObj.tasks.map( ( curTasObj ) => { // What: Task Scheduling Backfill Map. Why: Every task must carry the newer scheduling fields. How: This maps each task, backfilling only the ones that lack them.


			if ( curTasObj.dateMode === 'date' || curTasObj.dateMode === 'nthWeekday' ) return curTasObj; // What: Already-Migrated Guard. Why: A task that already carries a real dateMode needs no further backfill here. How: This returns curTasObj unchanged when dateMode is already one of the 2 known values.



			const nowDatObj = new Date(); // What: Now Date Object. Why: An old task's own nthWeekday default falls back to today's own weekday. How: This reads the current moment.



			return { // What: Backfilled Task Return. Why: The caller needs every new scheduling field present with a sensible default. How: This spreads curTasObj with dateMode/nthOrdinal/nthWeekday defaulted.


				...curTasObj, // What: Current Task Spread. Why: Every existing field must survive the backfill. How: This spreads curTasObj first so the defaults below only add fields.

				dateMode   : 'date',                                    // What: Date Mode. Why: Old tasks always meant a plain day-of-month date. How: This is the 'date' mode.
				nthOrdinal : curTasObj.nthOrdinal || 1,                 // What: Nth Ordinal. Why: The nth-weekday picker needs a starting ordinal. How: This keeps any existing value, else 1.
				nthWeekday : curTasObj.nthWeekday ?? nowDatObj.getDay() // What: Nth Weekday. Why: The nth-weekday picker needs a starting weekday. How: This keeps any existing value, else today's own weekday.


			};


		} );


	}



	// #region Task Interval One-Shot Reset

	/**
	 * store.js = Task Interval One-Shot Reset
	 *
	 * @summary
	 * `interval` is reused for weekly/monthly/annual's own "every N
	 * ___", but defTasFun has ALWAYS unconditionally set interval:2
	 * on every new task regardless of repeat kind (a leftover default
	 * from when only the 'interval' repeat used it), so every pre-
	 * existing weekly/monthly/annual reminder already carries a real
	 * interval:2, completely unused until this migration existed.
	 * Without this reset, every one of them would silently start
	 * meaning "every 2 weeks/months/years" the moment this shipped.
	 * This must run only ONCE: after a user deliberately sets an
	 * interval via the new controls, this reset must never fire again
	 * and clobber it, hence the _taskIntervalReset guard flag.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && !curStaObj._taskIntervalReset && Array.isArray( curStaObj.tasks ) ) { // What: Task Interval One-Shot Reset Guard. Why: The stale, unused interval:2 default must only ever be reset once, per the design-rationale comment above. How: This gates the reset block below on the guard flag not yet being set, and tasks actually being a real array.


		curStaObj.tasks = curStaObj.tasks.map( ( curTasObj ) => // What: Interval Reset Map. Why: Only a weekly/monthly/annual task actually inherited the stale, unused interval:2. How: This resets interval to 1 for those 3 repeat kinds, leaving every other task untouched.
			( curTasObj.repeat === 'weekly' || curTasObj.repeat === 'monthly' || curTasObj.repeat === 'annual' ) ? { ...curTasObj, interval : 1 } : curTasObj ); // What: Interval Reset Test. Why: Only the three kinds that inherited the stale interval need resetting. How: This resets interval to 1 for weekly, monthly and annual tasks and passes every other task through.

		curStaObj._taskIntervalReset = true; // What: Reset-Guard Set. Why: This one-shot reset must never re-fire and clobber a user's own later interval choice. How: This flips the guard flag permanently true.


	}

	// #endregion Task Interval One-Shot Reset



	if ( curStaObj && TAS_NAM_OBJ ) curStaObj.reminderOpts = TAS_NAM_OBJ.norOptFun( curStaObj.reminderOpts ); // What: Reminder Options Normalize. Why: Per-type reminder participation options were added later; partial or absent state must get the full default switch set. How: This calls TAS_NAM_OBJ.norOptFun on whatever curStaObj.reminderOpts currently holds.



	// #region Data-Tab Collapse Defaults V2

	/**
	 * store.js = Data-Tab Collapse Defaults V2
	 *
	 * @summary
	 * The Data tab's main sections (Conditionals, Reminders, each
	 * picker card) all default COLLAPSED and are read via `=== false`
	 * for expanded, so no seeding is normally needed (see
	 * togColFun's own defaultCollapsed argument). But
	 * values saved by the OLD, inverted picker-card flag must be
	 * dropped once, so those cards don't load pre-expanded under the
	 * new polarity; the __collapseDefaultsV2 flag guards this so it
	 * only ever strips old values one time.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && Array.isArray( curStaObj.pickers ) ) { // What: Collapse-Defaults Flip Guard. Why: The old inverted collapse-flag polarity must only ever be stripped from a real, migratable state, per the design-rationale comment above. How: This gates the one-shot strip block below on curStaObj existing with a real pickers array.


		const curUsiObj = curStaObj.ui || {};                           // What: Current User-Interface Object. Why: The collapse-state copy below needs curStaObj's own ui object, or an empty fallback. How: This reads curStaObj.ui, defaulting to {}.
		const conColObj = { ...( curUsiObj.controlsCollapsed || {} ) }; // What: Controls Collapsed Object. Why: The old flags must be stripped from a COPY, never the live object directly. How: This shallow-copies curUsiObj's own controlsCollapsed, defaulting to {}.


		if ( !conColObj.__collapseDefaultsV2 ) { // What: One-Shot Strip Guard. Why: This must only ever run once per save, per the design-rationale comment above. How: This strips every old per-picker/section flag and sets the guard, only when it hasn't run yet.


			conColObj.__collapseDefaultsV2 = true; // What: Guard Flag Set. Why: This one-shot strip must never re-run and clobber a user's own later collapse choices. How: This flips the guard flag permanently true.

			delete conColObj.__sectionsSeeded; // What: Old Sections-Seeded Flag Drop. Why: This flag belonged to the old polarity and has no meaning under the new one. How: This deletes it from conColObj outright.

			curStaObj.pickers.forEach( ( curPicObj ) => { delete conColObj[ curPicObj.id ]; } ); // What: Old Picker-Card Flags Drop. Why: Every picker's own old inverted flag must be cleared so it loads collapsed under the new polarity. How: This deletes conColObj's own entry for every picker's id.

			delete conColObj.__reminders_main; // What: Old Reminders-Main Flag Drop. Why: This flag belonged to the old polarity and has no meaning under the new one. How: This deletes it from conColObj outright.
			delete conColObj.__conditionals;   // What: Old Conditionals Flag Drop. Why: This flag belonged to the old polarity and has no meaning under the new one. How: This deletes it from conColObj outright.


		}



		curStaObj.ui = { ...curUsiObj, controlsCollapsed : conColObj }; // What: Ui Object Writeback. Why: The (possibly-stripped) collapse-state copy must actually land back on curStaObj. How: This spreads curUsiObj with controlsCollapsed replaced by conColObj.


	}

	// #endregion Data-Tab Collapse Defaults V2



	// #region Reminders Stats-Default Flip

	/**
	 * store.js = Reminders Stats-Default Flip
	 *
	 * @summary
	 * Reminders now count toward Stats by default, a one-time flip for
	 * state saved before that change. Guarded by _remStatsDefaultOn so
	 * a user who later turns the toggle back off isn't silently
	 * overridden on every subsequent load.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && !curStaObj._remStatsDefaultOn && curStaObj.reminderOpts ) { // What: Reminders Stats-Default Flip Guard. Why: The one-time flip to make reminders count toward Stats must only ever run once, per the design-rationale comment above. How: This gates the flip block below on the guard flag not yet being set, and reminderOpts actually existing.


		curStaObj.reminderOpts.once.stats      = true; // What: Once-Reminder Stats Flip. Why: One-time reminders must count toward Stats by the new default. How: This sets curStaObj.reminderOpts.once.stats to true.
		curStaObj.reminderOpts.recurring.stats = true; // What: Recurring-Reminder Stats Flip. Why: Recurring reminders must count toward Stats by the new default. How: This sets curStaObj.reminderOpts.recurring.stats to true.
		curStaObj._remStatsDefaultOn           = true; // What: Flip-Guard Set. Why: This one-shot flip must never re-fire and override a user's own later choice to turn it off. How: This flips the guard flag permanently true.


	}

	// #endregion Reminders Stats-Default Flip



	// #region Onboarding Backfill

	/**
	 * store.js = Onboarding Backfill
	 *
	 * @summary
	 * Onboarding was added later; existing users must NOT be re-
	 * onboarded, so any state that lacks the field is treated as
	 * already welcomed/dismissed AND already past the mini-tour
	 * checklist (checklistDone:true), since this data predates the
	 * checklist system entirely and unambiguously belongs to an
	 * established account, not a first-time one.
	 *
	 * Without checklistDone set here too, the very next backfill below
	 * (which defaults it to false for ANY onboarding object still
	 * missing the field, including the one just created on this exact
	 * line) put such an account back into "first-time" mode the moment
	 * they next hit Replay Tour: the checklist's own real-picker name-
	 * collision suppression and the App Features section both require
	 * checklistDone to already be true, and the closing Generate card
	 * requires it to be false. So with it wrongly false, a Replay
	 * showed every mini-tour regardless of name collisions, hid App
	 * Features entirely, and left Generate stuck permanently visible
	 * (and permanently unreachable, since nothing tracked it as done).
	 *
	 * Fresh clean state sets welcomed:false (and, via the block below,
	 * checklistDone:false) explicitly to trigger the real first-run
	 * flow; this branch only ever fires for existing data an actual
	 * SED_NAM_OBJ.buiCleFun() never produces.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && !curStaObj.onboarding ) curStaObj.onboarding = { checklistDone : true, dismissed : true, welcomed : true }; // What: Onboarding Backfill Guard. Why: An account missing onboarding entirely predates the checklist system and must be treated as already established, per the design-rationale comment above. How: This backfills curStaObj.onboarding to welcomed/dismissed/checklistDone all true when it's entirely missing.

	// #endregion Onboarding Backfill



	if ( curStaObj && curStaObj.onboarding && ( !curStaObj.onboarding.checklist || typeof curStaObj.onboarding.checklist !== 'object' ) ) { // What: Onboarding Checklist-Map Backfill. Why: The mini-tour checklist (see onboarding-checklist.js) maps an item id to its own resolution; an object map needs no per-item backfill of its own, just a manifest entry there. How: This backfills curStaObj.onboarding.checklist to {} when it's missing or not a plain object.


		curStaObj.onboarding.checklist = {}; // What: Checklist Map Set. Why: The checklist manifest itself must exist as a real object before any item resolution can be written into it. How: This sets curStaObj.onboarding.checklist to a fresh empty object.


	}



	// #region Onboarding Checklist-Done Backfill

	/**
	 * store.js = Onboarding Checklist-Done Backfill
	 *
	 * @summary
	 * The same reasoning as the missing-onboarding branch above applies
	 * here too: an account whose onboarding object ALREADY existed
	 * (from an even older build, before checklistDone was ever added as
	 * a field) is just as established as one missing onboarding
	 * entirely, since it predates the checklist system either way.
	 * Defaulting to welcomed's own value tells the two cases apart:
	 * SED_NAM_OBJ.buiCleFun()'s own fresh onboarding is {welcomed:false,
	 * dismissed:false} at this point (no checklistDone key yet either),
	 * so this correctly still defaults false for a genuine first-time
	 * user, but an existing account that had already dismissed the
	 * (pre-checklist-era) welcome modal (welcomed:true) gets
	 * checklistDone:true instead of the unconditional false this used
	 * to backfill. That unconditional false is exactly what silently
	 * broke Replay Tour for real, established accounts that updated
	 * through this exact version gap: it got written back into their
	 * save the very first time migStaFun() ran post-update, so it stayed
	 * false in every export/import from that point on, permanently
	 * defeating collision suppression, App Features, and the Generate
	 * card for them.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && curStaObj.onboarding && typeof curStaObj.onboarding.checklistDone !== 'boolean' ) { // What: Onboarding Checklist-Done Backfill Guard. Why: An account whose onboarding object already existed from before checklistDone was added needs it backfilled, per the design-rationale comment above. How: This gates the backfill below on curStaObj.onboarding existing but its own checklistDone not yet being a real boolean.


		curStaObj.onboarding.checklistDone = !!curStaObj.onboarding.welcomed; // What: Checklist-Done Set. Why: An account whose onboarding already existed is told apart from a genuine first-time user by its own welcomed value, per the design-rationale comment above. How: This sets curStaObj.onboarding.checklistDone to curStaObj.onboarding's own welcomed, coerced to a real boolean.


	}

	// #endregion Onboarding Checklist-Done Backfill



	// #region Generate-Scroll-Pending Backfill

	/**
	 * store.js = Generate-Scroll-Pending Backfill
	 *
	 * @summary
	 * A one-shot signal (added later) for tab-today.jsx's own auto-
	 * scroll to the Generate card: set the instant every OTHER
	 * checklist item becomes resolved (see setCarFun below),
	 * consumed (and cleared back to false) the next time TabTodCom
	 * renders with it true. Persisted state rather than a local ref/
	 * effect, deliberately: the LAST checklist item to resolve is very
	 * often finished from a mini-tour or Page Tour running on a
	 * DIFFERENT tab, which unmounts TabTodCom for the whole tour, so a
	 * plain "did I see false-then-true" ref would miss the transition
	 * entirely (it only resets, matching whatever the value already
	 * is, on each fresh mount). This flag survives that gap by living
	 * in state instead of the component.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && curStaObj.onboarding && typeof curStaObj.onboarding.generateScrollPending !== 'boolean' ) { // What: Generate-Scroll-Pending Backfill Guard. Why: An account whose onboarding object predates this flag needs it backfilled, per the design-rationale comment above. How: This gates the backfill below on curStaObj.onboarding existing but its own generateScrollPending not yet being a real boolean.


		curStaObj.onboarding.generateScrollPending = false; // What: Generate-Scroll-Pending Set. Why: An account predating this flag has nothing pending to auto-scroll to yet. How: This sets curStaObj.onboarding.generateScrollPending to false.


	}

	// #endregion Generate-Scroll-Pending Backfill



	if ( curStaObj && curStaObj.onboarding && typeof curStaObj.onboarding.pageToursName !== 'string' ) { // What: Page-Tours Name Backfill. Why: The Edit Mode-rename-able display name for the Page Tours group was added later; unlike a real group's name this doesn't double as the group's own identity (still the fixed '__pageTours' sentinel everywhere else), so renaming it is a plain label swap. How: This backfills pageToursName to 'Page Tours' when it isn't already a string.


		curStaObj.onboarding.pageToursName = 'Page Tours'; // What: Page-Tours Name Set. Why: An account predating this field needs the same default display name the group itself already ships with. How: This sets curStaObj.onboarding.pageToursName to 'Page Tours'.


	}



	if ( curStaObj && curStaObj.onboarding && typeof curStaObj.onboarding.activeTour === 'undefined' ) { // What: Active-Tour Backfill. Why: Active tour progress ({id,step}|null, added later) lets a guided tour resume exactly where a reload interrupted it. How: This backfills activeTour to null when the field is entirely absent.


		curStaObj.onboarding.activeTour = null; // What: Active-Tour Set. Why: An account predating this field has no in-progress guided tour to resume. How: This sets curStaObj.onboarding.activeTour to null.


	}



	if ( curStaObj && curStaObj.onboarding && ( !curStaObj.onboarding.appFeatures || typeof curStaObj.onboarding.appFeatures !== 'object' ) ) { // What: App-Features Map Backfill. Why: App Features tutorials (see onboarding/app-features.jsx) are deliberately separate from checklist above (no donCouNum/total ring, no closing Generate-style card), just a per-item resolved/not flag. How: This backfills appFeatures to {} when it's missing or not a plain object.


		curStaObj.onboarding.appFeatures = {}; // What: App-Features Map Set. Why: The per-item resolved/not map itself must exist as a real object before any item can be written into it. How: This sets curStaObj.onboarding.appFeatures to a fresh empty object.


	}



	// #region App-Features Intro-Seen Backfill

	/**
	 * store.js = App-Features Intro-Seen Backfill
	 *
	 * @summary
	 * The "One Last Thing..." App Features intro tip (see onboarding-
	 * app-features.jsx's own AppFeaturesIntroTip) shows exactly once,
	 * right after the closing checklist's own generate() finishes,
	 * pointing at the freshly-appeared App Features section. An
	 * existing user whose checklist was ALREADY done before this
	 * existed has long since passed that moment, so backfilling them
	 * straight to "already seen" avoids ambushing a returning user with
	 * it on their next ordinary Regenerate; a brand-new save (or one
	 * still mid-checklist) keeps the real default (false), so the tip
	 * still fires naturally once they finish for the first time.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && curStaObj.onboarding && typeof curStaObj.onboarding.appFeaturesIntroSeen !== 'boolean' ) { // What: App-Features Intro-Seen Backfill Guard. Why: An account whose onboarding object predates this flag needs it backfilled, per the design-rationale comment above. How: This gates the backfill below on curStaObj.onboarding existing but its own appFeaturesIntroSeen not yet being a real boolean.


		curStaObj.onboarding.appFeaturesIntroSeen = !!curStaObj.onboarding.checklistDone; // What: App-Features Intro-Seen Set. Why: An account whose checklist was already done has long since passed the moment this tip would fire, per the design-rationale comment above. How: This sets curStaObj.onboarding.appFeaturesIntroSeen to curStaObj.onboarding's own checklistDone, coerced to a real boolean.


	}

	// #endregion App-Features Intro-Seen Backfill



	if ( curStaObj && !Array.isArray( curStaObj.reminderLog ) ) curStaObj.reminderLog = []; // What: Reminder-Log Backfill. Why: The reminder completion log (append-only history of check-offs) was added later. How: This backfills reminderLog to [] when it isn't already an array.



	if ( curStaObj && !Array.isArray( curStaObj.reminderSkipLog ) ) curStaObj.reminderSkipLog = []; // What: Reminder-Skip-Log Backfill. Why: The reminder skip log (append-only history of skip actions) was added later. How: This backfills reminderSkipLog to [] when it isn't already an array.



	if ( curStaObj && !Array.isArray( curStaObj.vacationLog ) ) curStaObj.vacationLog = []; // What: Vacation-Log Backfill. Why: The inactive-state event log (append-only on/off transitions per item, so Stats can exclude ineligible days) was added later; old state is treated as always-eligible in the past, with the live item.vacation flag as current truth. How: This backfills vacationLog to [] when it isn't already an array.



	if ( curStaObj && !Array.isArray( curStaObj.conditionals ) ) curStaObj.conditionals = []; // What: Conditionals-Array Backfill. Why: Conditionals (per-day picker gates) were added later. How: This backfills conditionals to [] when it isn't already an array.



	// #region Conditional Active/Triggered Split

	/**
	 * store.js = Conditional Active/Triggered Split
	 *
	 * @summary
	 * Splits the old single `active` field into `active` (enabled, not
	 * inactive) and `triggered` (currently firing). Old `active` was
	 * really the trigger, so it migrates straight across. Also migrates
	 * old weight-ratio odds (weight 1-9 via w/(w+1)) into a direct
	 * percentage, oddsPct (10-90 by 10): weight 1 becomes 50, weight 9
	 * becomes 90.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && Array.isArray( curStaObj.conditionals ) ) { // What: Conditional Active/Triggered Split Guard. Why: Every persisted conditional needs the old single active field split into active/triggered, per the design-rationale comment above. How: This gates the split below on curStaObj carrying a real conditionals array.


		curStaObj.conditionals = curStaObj.conditionals.map( ( curConObj ) => { // What: Conditional Split-And-Odds Map. Why: Every conditional needs both migrations applied, in order, before it's usable under the new shape. How: This applies the active/triggered split, then the weight-to-oddsPct migration, to each conditional.


			let nexConObj = ( 'triggered' in curConObj ) ? curConObj : { ...curConObj, active : true, triggered : !!curConObj.active }; // What: Split Conditional And Guard. Why: A conditional already carrying its own triggered field is already past this migration. How: This passes curConObj through unchanged when triggered already exists, else derives it from the old active value.


			if ( !( 'oddsPct' in nexConObj ) ) { // What: Odds-Percentage Migrate Guard. Why: Only a conditional still missing oddsPct needs its old weight-ratio odds converted. How: This derives oddsPct from nexConObj's own weight, clamped to the 10-90 range in steps of 10.


				const weiValNum = nexConObj.weight ?? 1; // What: Weight Value Number. Why: The odds formula below needs this conditional's own old weight, defaulting to 1 when absent. How: This reads nexConObj.weight, defaulting via ??.

				nexConObj = { ...nexConObj, oddsPct : Math.min( 90, Math.max( 10, Math.round( ( weiValNum / ( weiValNum + 1 ) ) * 10 ) * 10 ) ) }; // What: Odds-Percentage Set. Why: The caller needs a direct percentage replacing the old ratio-weight scheme. How: This converts weiValNum via w/(w+1), rounds to the nearest 10, then clamps to [10,90].


			}



			return nexConObj; // What: Migrated Conditional Return. Why: The map above needs the fully-migrated conditional. How: This returns nexConObj, built above.


		} );


	}

	// #endregion Conditional Active/Triggered Split



	if ( curStaObj && Array.isArray( curStaObj.pickers ) ) { // What: Picker Conditionalid Backfill. Why: Every picker needs a conditionalId slot so gating code elsewhere can read it uniformly, whether or not the picker is actually gated. How: This backfills conditionalId to null on any picker that doesn't already carry the field.


		curStaObj.pickers = curStaObj.pickers.map( ( curPicObj ) => ( 'conditionalId' in curPicObj ? curPicObj : { ...curPicObj, conditionalId : null } ) ); // What: Picker Conditionalid Map. Why: A picker already carrying conditionalId (even null) needs no change. How: This passes curPicObj through unchanged when it already has the field, else spreads in conditionalId:null.


	}



	if ( curStaObj && !Array.isArray( curStaObj.pickLog ) ) curStaObj.pickLog = []; // What: Pick-Log Backfill. Why: The per-pick history log was added later; old state has none, while a fresh seed ships a full year of rows via seed.js instead. How: This backfills pickLog to [] when it isn't already an array.



	if ( curStaObj && !Array.isArray( curStaObj.conditionalLog ) ) curStaObj.conditionalLog = []; // What: Conditional-Log Backfill. Why: The conditional history log (append-only, one row per conditional per completed cycle) was added later. How: This backfills conditionalLog to [] when it isn't already an array.



	// #region Ease-Down Weights Normalize

	/**
	 * store.js = Ease-Down Weights Normalize
	 *
	 * @summary
	 * Ease Down's own fair-rotation weights were added later. Older
	 * state carried arbitrary static per-item weights, so every ease-
	 * down picker is normalized once to the real invariant: its active
	 * item sits at weight 0 (barred from an immediate re-pick) and
	 * every other item sits at weight 1, so the fair rotation starts
	 * from a clean footing. Guarded by _easeDownWeightsInit so later
	 * accumulated weights are never reset again.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && !curStaObj._easeDownWeightsInit && Array.isArray( curStaObj.pickers ) && Array.isArray( curStaObj.items ) ) { // What: Ease-Down Weights Normalize Guard. Why: Every ease-down item's own fair-rotation weight must be normalized from a clean footing exactly once, per the design-rationale comment above. How: This gates the normalize block below on the guard flag not yet being set, and both pickers/items actually being real arrays.


		for ( const curPicObj of curStaObj.pickers ) { // What: Ease-Down Normalize Loop. Why: Only an ease-down picker's own items need this one-time weight reset. How: This skips every non-ease-down picker, else rewrites its own items' weights below.


			if ( curPicObj.mode !== 'ease-down' ) continue; // What: Non-Ease-Down Skip Guard. Why: Every other mode's items already own their real weights. How: This skips straight to the next picker when curPicObj.mode isn't 'ease-down'.



			curStaObj.items = curStaObj.items.map( ( curIteObj ) => // What: Ease-Down Weight Reset. Why: The active item must sit at weight 0 and every sibling at weight 1, per the design-rationale comment above. How: This rewrites weight only for items owned by curPicObj, leaving every other item untouched.
				curIteObj.pickerId === curPicObj.id ? { ...curIteObj, weight : curIteObj.id === curPicObj.activeItemId ? 0 : 1 } : curIteObj ); // What: Weight Assignment. Why: Only this picker's own items are affected. How: This gives the active item weight 0, every sibling weight 1, and passes other pickers' items through.


		}


		curStaObj._easeDownWeightsInit = true; // What: Init-Guard Set. Why: This one-shot normalize must never re-fire and clobber real accumulated fairness weights. How: This flips the guard flag permanently true.


	}

	// #endregion Ease-Down Weights Normalize



	if ( curStaObj && Array.isArray( curStaObj.pickers ) ) { // What: Picker Fields Normalize Guard. Why: Several independent per-picker fields (daysOfWeek, the weekly-cadence anchor-day rule, skipHolidays, avoidDuplicates, Picker Cadence, hidden) were each added at different times and all need backfilling together. How: This maps every picker through each field's own default/normalize step.


		curStaObj.pickers = curStaObj.pickers.map( ( curPicObj ) => { // What: Picker Fields Normalize Map. Why: Every picker needs its own copy patched field-by-field before the caller gets the fully-backfilled array. How: This maps curStaObj.pickers, building nexPicObj from each field's own backfill/normalize step below.


			const nexPicObj = { ...curPicObj }; // What: Next Picker Object. Why: Every backfill below patches a copy, never curPicObj itself. How: This starts as a shallow copy of curPicObj.


			if ( !Array.isArray( nexPicObj.daysOfWeek ) ) nexPicObj.daysOfWeek = [ 0, 1, 2, 3, 4, 5, 6 ]; // What: Days-Of-Week Backfill. Why: A picker with no schedule override at all still needs an explicit "every day" default. How: This backfills daysOfWeek to every weekday when it isn't already an array.

			if ( CAD_NAM_OBJ ) nexPicObj.daysOfWeek = CAD_NAM_OBJ.enfWeeFun( nexPicObj ); // What: Weekly-Anchor Enforce. Why: For weekly cadence, the anchor day must always be one of the allowed days, backfilling state saved before this rule existed. How: This calls CAD_NAM_OBJ.enfWeeFun to fold nexPicObj's own anchor into its daysOfWeek.

			if ( typeof nexPicObj.skipHolidays !== 'boolean' ) nexPicObj.skipHolidays = false; // What: Skip-Holidays Backfill. Why: Every picker needs an explicit holiday-skipping flag. How: This backfills skipHolidays to false when it isn't already a boolean.

			if ( typeof nexPicObj.avoidDuplicates !== 'boolean' ) nexPicObj.avoidDuplicates = false; // What: Avoid-Duplicates Backfill. Why: The avoid-duplicate-item-names flag was added later. How: This backfills avoidDuplicates to false when it isn't already a boolean.

			if ( !CAD_NAM_OBJ.isaCadFun( nexPicObj.cadence ) ) Object.assign( nexPicObj, CAD_NAM_OBJ.norCadFun( nexPicObj ) ); // What: Picker-Cadence Normalize. Why: Picker Cadence (surfacing anchor + display unit) was added later; old state defaults to 'daily' (the original behavior) with sensible anchors. How: This calls CAD_NAM_OBJ.norCadFun and merges its own result onto nexPicObj when nexPicObj's own cadence isn't already a real one.

			if ( typeof nexPicObj.hidden !== 'boolean' ) nexPicObj.hidden = false; // What: Hidden-Flag Backfill. Why: Every picker needs an explicit hidden flag, same reasoning as the tasks backfill above. How: This backfills hidden to false when it isn't already a boolean.



			return nexPicObj; // What: Normalized Picker Return. Why: The map above needs the fully-backfilled picker. How: This returns nexPicObj, built above.


		} );


	}



	if ( curStaObj && ( !curStaObj.ui || typeof curStaObj.ui !== 'object' ) ) curStaObj.ui = {}; // What: Ui Object Backfill. Why: Persisted UI prefs need a real object to build on. How: This backfills curStaObj.ui to {} when it's missing or not a plain object.

	if ( curStaObj && ( !curStaObj.ui.controlsCollapsed || typeof curStaObj.ui.controlsCollapsed !== 'object' ) ) curStaObj.ui.controlsCollapsed = {}; // What: Controls-Collapsed Object Backfill. Why: controlsCollapsed maps a section id to whether its own Controls sub-panel is collapsed (absent/false means open) and was added later. How: This backfills curStaObj.ui.controlsCollapsed to {} when it's missing or not a plain object.



	// #region Today Ordering Backfill

	/**
	 * store.js = Today Ordering Backfill
	 *
	 * @summary
	 * Today ordering (Edit Mode, added later): groupOrder is the
	 * display order of the picker-based groups on Today; pickerOrder
	 * maps a group label to the ordered picker ids within it (drives
	 * per-row order). Both are backfilled from first-occurrence order
	 * in state.pickers so nothing shifts on upgrade, and any newly-seen
	 * group/picker is appended to the end. This block also tidies
	 * every stored picker group/name to the same Title-Case form the
	 * group/name selectors now produce (transform only, no mass de-dup,
	 * so a user's own pickers are never silently renamed into
	 * collision), and brings groupOrder/pickerOrder's own keys onto the
	 * normalized group names too.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && Array.isArray( curStaObj.pickers ) ) { // What: Today Ordering Backfill Guard. Why: groupOrder/pickerOrder and the group/name tidy pass below all need a real pickers array to backfill from, per the design-rationale comment above. How: This gates the whole block below on curStaObj carrying a real pickers array.


		if ( norGroFun ) { // What: Name-Tidy Guard. Why: The tidy/normalize pass below only makes sense when the normalizer itself is actually available. How: This runs the whole tidy pass only when norGroFun is truthy.


			curStaObj.pickers.forEach( ( curPicObj ) => { // What: Picker Tidy Loop. Why: Every picker's own group and name need the same Title-Case tidy applied in place. How: This normalizes curPicObj.group and curPicObj.name, each only when the normalizer actually returns something.


				if ( curPicObj.group ) { // What: Group Tidy Guard. Why: A picker with no group at all has nothing to tidy. How: This normalizes curPicObj.group only when it's truthy.


					const norGroStr = norGroFun( curPicObj.group ); // What: Normalized Group String And Guard. Why: The normalizer may decline to return anything for an unusual input. How: This calls norGroFun on curPicObj's own group.

					if ( norGroStr ) curPicObj.group = norGroStr; // What: Group Tidy Write. Why: Only a genuine normalized result should overwrite the picker's own group. How: This writes norGroStr back onto curPicObj.group when it's truthy.


				}



				if ( curPicObj.name && norPicFun ) { // What: Name Tidy Guard. Why: A picker with no name, or with no normalizer available, has nothing to tidy. How: This normalizes curPicObj.name only when both are truthy.


					const norNamStr = norPicFun( curPicObj.name ); // What: Normalized Name String And Guard. Why: The normalizer may decline to return anything for an unusual input. How: This calls norPicFun on curPicObj's own name.

					if ( norNamStr ) curPicObj.name = norNamStr; // What: Name Tidy Write. Why: Only a genuine normalized result should overwrite the picker's own name. How: This writes norNamStr back onto curPicObj.name when it's truthy.


				}


			} );


			if ( Array.isArray( curStaObj.groupOrder ) ) { // What: Group-Order Normalize. Why: Stored order structures must land on the same normalized group names the tidy pass above just applied to every picker. How: This maps every groupOrder entry through norGroFun, except the 2 fixed sentinels which are never real group names.


				curStaObj.groupOrder = curStaObj.groupOrder.map( ( curGroStr ) => ( // What: Group-Order Normalize Map. Why: Every stored group name must match the normalized form the tidy pass above just wrote onto each picker, or ordering lookups would miss. How: This passes the '__reminders'/'__pageTours' sentinels through untouched, else normalizes curGroStr via norGroFun, falling back to itself.


					( curGroStr === '__reminders' || curGroStr === '__pageTours' ) ? curGroStr : ( norGroFun( curGroStr ) || curGroStr ) // What: Group Name Pick. Why: The two built-in pseudo-groups must keep their exact keys. How: This passes '__reminders' and '__pageTours' through and normalizes every other group name.


				) );


			}



			if ( curStaObj.pickerOrder && typeof curStaObj.pickerOrder === 'object' ) { // What: Picker-Order Remap Guard. Why: pickerOrder's own keys are group names too, so they need the exact same normalization, merging any pre-existing/post-existing keys that collide once normalized. How: This rebuilds pickerOrder keyed by normalized group name.


				const rmpOrdObj = {}; // What: Remapped Order Object And Guard. Why: The loop below needs somewhere to accumulate the re-keyed pickerOrder. How: This starts empty and is filled by the loop directly below.


				for ( const [ curGroStr, picIdeArr ] of Object.entries( curStaObj.pickerOrder ) ) { // What: Picker-Order Remap Loop. Why: Every old group key must be normalized and merged into rmpOrdObj before it replaces curStaObj's own pickerOrder. How: This iterates curStaObj.pickerOrder's own entries, concatenating each onto its own normalized key's bucket.


					const norKeyStr = norGroFun( curGroStr ) || curGroStr; // What: Normalized Key String. Why: The new pickerOrder must be keyed the same way groupOrder now is. How: This normalizes curGroStr, falling back to itself when the normalizer declines.

					rmpOrdObj[ norKeyStr ] = ( rmpOrdObj[ norKeyStr ] || [] ).concat( picIdeArr ); // What: Remapped Bucket Concat. Why: 2 old keys that normalize to the same new key must have their own picker-id lists merged, not overwrite each other. How: This concatenates picIdeArr onto whatever's already filed under norKeyStr.


				}


				curStaObj.pickerOrder = rmpOrdObj; // What: Picker-Order Writeback. Why: The remapped object must actually replace the old one. How: This assigns rmpOrdObj onto curStaObj.pickerOrder.


			}


		}



		const seeGroArr = []; // What: Seen Group Array And Guard. Why: The loop below needs to record each group's own first-occurrence order exactly once. How: This starts empty and is pushed into (without duplicates) by the loop directly below.
		const groIdeObj = {}; // What: Group Identifier Object And Guard. Why: The loop below needs to bucket every picker's own id under its own group. How: This starts empty and is filled by the loop directly below.


		for ( const curPicObj of curStaObj.pickers ) { // What: Group/Bucket Fill Loop. Why: Every picker must contribute its own group (once) to seeGroArr and its own id to groIdeObj's matching bucket. How: This iterates curStaObj.pickers, updating both structures per picker.


			const curGroStr = curPicObj.group || 'Other'; // What: Current Group String. Why: A picker with no group at all still needs a real bucket to file under. How: This reads curPicObj's own group, defaulting to 'Other'.


			if ( !seeGroArr.includes( curGroStr ) ) seeGroArr.push( curGroStr ); // What: First-Occurrence Push Guard. Why: Each group must appear in seeGroArr exactly once, in its own first-seen order. How: This pushes curGroStr only when it isn't already present.



			( groIdeObj[ curGroStr ] = groIdeObj[ curGroStr ] || [] ).push( curPicObj.id ); // What: Bucket Push. Why: This picker's own id must join every other picker already filed under the same group. How: This creates curGroStr's own bucket on first use, then pushes curPicObj.id into it.


		}



		if ( !Array.isArray( curStaObj.groupOrder ) ) curStaObj.groupOrder = seeGroArr.slice(); // What: Group-Order Seed. Why: State with no groupOrder at all starts from the natural first-occurrence order computed above. How: This assigns a fresh copy of seeGroArr.

		else for ( const curGroStr of seeGroArr ) if ( !curStaObj.groupOrder.includes( curGroStr ) ) curStaObj.groupOrder.push( curGroStr ); // What: Group-Order Append. Why: An EXISTING groupOrder must keep its own saved order, only gaining any newly-seen group at the end. How: This appends curGroStr only when it isn't already present.



		if ( !curStaObj.groupOrder.includes( '__reminders' ) ) curStaObj.groupOrder.unshift( '__reminders' ); // What: Reminders-Sentinel Backfill. Why: The Reminders block participates in the same Edit Mode ordering (via the '__reminders' sentinel) and defaults to the front for anyone who hasn't reordered it. How: This unshifts '__reminders' onto groupOrder when it isn't already present.



		if ( !curStaObj.pickerOrder || typeof curStaObj.pickerOrder !== 'object' ) curStaObj.pickerOrder = {}; // What: Picker-Order Object Backfill. Why: A pickerOrder that isn't already a plain object needs a fresh one before the loop below can write into it. How: This resets curStaObj.pickerOrder to {} when it fails either check.



		for ( const curGroStr of seeGroArr ) { // What: Per-Group Order Reconcile Loop. Why: Every seen group needs its own pickerOrder entry reconciled: real picker ids plus any surviving synthetic day-off/charging ids, deduped, with newly-seen pickers appended. How: This rebuilds curStaObj.pickerOrder[curGroStr] for every group in seeGroArr.


			const vldIdeSet = new Set( groIdeObj[ curGroStr ] ); // What: Valid Identifier Set. Why: The filter below needs fast membership checks against this group's own real picker ids. How: This wraps groIdeObj's own bucket for curGroStr in a Set.
			const seeIdeSet = new Set();                         // What: Seen Identifier Set And Guard. Why: The filter below must defensively dedupe, self-healing any older corrupted order. How: This starts empty and is filled as the filter below runs.

			const exiOrdArr = ( Array.isArray( curStaObj.pickerOrder[ curGroStr ] ) ? curStaObj.pickerOrder[ curGroStr ] : [] ) // What: Existing Order Array. Why: A saved order must be kept when present, dropping anything no longer valid and any duplicate. How: This keeps ids that are either a real current picker or a surviving synthetic 'dayoff_' id, each only once.
				.filter( ( curIdeStr ) => ( vldIdeSet.has( curIdeStr ) || String( curIdeStr ).startsWith( 'dayoff_' ) ) && !seeIdeSet.has( curIdeStr ) && seeIdeSet.add( curIdeStr ) ); // What: Valid Unique Filter. Why: A saved order may hold ids that no longer exist or repeat. How: This keeps valid ids (and day-off cards) the first time each one appears.


			for ( const curIdeStr of groIdeObj[ curGroStr ] ) if ( !exiOrdArr.includes( curIdeStr ) ) exiOrdArr.push( curIdeStr ); // What: Newly-Seen Append. Why: A picker not yet present in the saved order (new since last save) must still be appended at the end. How: This pushes curIdeStr onto exiOrdArr only when it isn't already present.



			curStaObj.pickerOrder[ curGroStr ] = exiOrdArr; // What: Per-Group Order Writeback. Why: The reconciled order must actually replace whatever curStaObj.pickerOrder[curGroStr] held before. How: This assigns exiOrdArr onto curStaObj.pickerOrder[curGroStr].


		}


	}

	// #endregion Today Ordering Backfill



	if ( curStaObj ) curStaObj.v = SCH_VER_NUM; // What: Schema-Version Stamp. Why: Every migrated state (and every exported backup) must record which schema shape it was actually migrated to. How: This writes SCH_VER_NUM onto curStaObj.v.



	return curStaObj; // What: Migrated State Return. Why: The caller needs the fully-backfilled state, mutated in place above. How: This returns curStaObj itself.


}

// #endregion migStaFun



// #region fluStaFun

/**
 * fluStaFun = Flush State Function
 *
 * @summary
 * The teardown path (pagehide / tab-hide): an in-flight async IDB write
 * may not survive the page going away, so this also mirrors
 * synchronously to localStorage as a last-resort safety net.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The state to flush synchronously.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * fluStaFun(state) // => undefined
 * ```
 *
*/

function fluStaFun( curStaObj ) {


	try { // What: Flush Attempt. Why: A storage failure during teardown must never throw while the page is going away. How: This delegates to STG_NAM_OBJ.fluSynFun when available, else falls back to a raw localStorage write.


		if ( STG_NAM_OBJ ) return STG_NAM_OBJ.fluSynFun( curStaObj ); // What: Storage Delegate Return. Why: STG_NAM_OBJ's own fluSynFun is the real synchronous-write path. How: This returns STG_NAM_OBJ.fluSynFun(curStaObj) as soon as STG_NAM_OBJ exists.



		localStorage.setItem( STO_KEY_STR, JSON.stringify( curStaObj ) ); // What: Localstorage Fallback Write. Why: This only runs when STG_NAM_OBJ itself failed to load at all. How: This writes curStaObj's own JSON string under STO_KEY_STR.


	}

	catch ( errCauObj ) {} // What: Flush Failure Guard. Why: A write failure must never propagate up while the page is unloading. How: This swallows the error silently.


}

// #endregion fluStaFun



// #region loaStaFun

/**
 * loaStaFun = Load State Function
 *
 * @summary
 * Synchronous by design: STG_NAM_OBJ.iniStoFun() has already resolved before
 * React mounts (see the boot gate in the HTML shell), so the loaded
 * state is sitting in memory and no component had to become async. The
 * localStorage read is kept as a fallback for the case where storage.js
 * failed to load at all. A brand-new user (nothing stored anywhere)
 * starts from SED_NAM_OBJ.buiCleFun() and is met by onboarding; the
 * demo fixture in seed.js (SED_NAM_OBJ.buiSeeFun) is design-time only
 * and deliberately not used here.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The migrated state to boot React with.
 *
 * @example
 * ```ts
 * loaStaFun() // => state
 * ```
 *
*/

function loaStaFun() {


	try { // What: Cached-State Attempt. Why: STG_NAM_OBJ's own warm cache is the fastest, most authoritative source when it's available. How: This returns migStaFun() of STG_NAM_OBJ's own cached state, when there is one.


		const cacStaObj = STG_NAM_OBJ && STG_NAM_OBJ.cacStaFun(); // What: Cached State Object And Guard. Why: STG_NAM_OBJ may not exist at all, or may have nothing cached yet. How: This reads STG_NAM_OBJ.cacStaFun(), short-circuiting to undefined when STG_NAM_OBJ itself is falsy.


		if ( cacStaObj ) return migStaFun( cacStaObj ); // What: Cached-Hit Return. Why: A cached state is the normal, fast path and needs no further fallback. How: This returns migStaFun(cacStaObj) as soon as one exists.


	}

	catch ( errCauObj ) { /* fall through */ } // What: Cached-State Failure Guard. Why: A broken STG_NAM_OBJ module must not prevent booting from the localStorage fallback below. How: This swallows the error and falls through.



	try { // What: Localstorage Fallback Attempt. Why: This is the last-resort source when STG_NAM_OBJ itself failed to load at all. How: This returns migStaFun() of the parsed localStorage value, when there is one.


		const rawJsoStr = localStorage.getItem( STO_KEY_STR ); // What: Raw Json String And Guard. Why: There may be nothing stored under this key yet. How: This reads STO_KEY_STR from localStorage, null when absent.


		if ( rawJsoStr ) return migStaFun( JSON.parse( rawJsoStr ) ); // What: Localstorage-Hit Return. Why: A parsed localStorage value is the fallback path's own normal case. How: This returns migStaFun() of the JSON-parsed rawJsoStr as soon as one exists.


	}

	catch ( errCauObj ) { /* fall through */ } // What: Localstorage Failure Guard. Why: Malformed or inaccessible localStorage must not crash boot. How: This swallows the error and falls through to the clean-state return below.



	return migStaFun( SED_NAM_OBJ.buiCleFun() ); // What: Clean-State Return. Why: Nothing was stored anywhere, so a brand-new user starts empty and is met by onboarding. How: This returns migStaFun() of a fresh SED_NAM_OBJ.buiCleFun().


}

// #endregion loaStaFun



// #region wriStaFun

/**
 * wriStaFun = Write State Function
 *
 * @summary
 * Persists curStaObj through STG_NAM_OBJ when it's available (the real,
 * debounced/idle-safe persistence engine), falling back to a plain
 * synchronous localStorage.setItem only when STG_NAM_OBJ itself is absent.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The state to persist.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * wriStaFun(state) // => undefined
 * ```
 *
*/

function wriStaFun( curStaObj ) {


	try { // What: Persist Attempt. Why: A storage failure (quota, disabled storage, ...) must never crash the caller. How: This delegates to STG_NAM_OBJ.savStaFun when available, else falls back to a raw localStorage write.


		if ( STG_NAM_OBJ ) return STG_NAM_OBJ.savStaFun( curStaObj ); // What: Storage Delegate Return. Why: STG_NAM_OBJ is the real, debounced/idle-safe persistence engine and should always be preferred. How: This returns STG_NAM_OBJ.savStaFun(curStaObj) as soon as STG_NAM_OBJ exists.



		localStorage.setItem( STO_KEY_STR, JSON.stringify( curStaObj ) ); // What: Localstorage Fallback Write. Why: This only runs when STG_NAM_OBJ itself failed to load at all. How: This writes curStaObj's own JSON string under STO_KEY_STR.


	}

	catch ( errCauObj ) {} // What: Persist Failure Guard. Why: A write failure must never propagate up to the caller. How: This swallows the error silently.


}

// #endregion wriStaFun

// #endregion State Persistence



// #region stkSynFun

/**
 * stkSynFun = Streak Sync Function
 *
 * @summary
 * Decides whether "today" counts toward the streak: it counts if ANY
 * picker entry is done OR any streak-participating manual reminder was
 * completed today, but only once EVERYTHING currently on Today is
 * actually done (a day with nothing to do can't claim a streak).
 * Reconciles that verdict against whether the day was already claimed,
 * so toggling the last done item back off un-claims it, and a day is
 * never double-counted. Entries belonging to a hidden picker (see the
 * hidden flag backfilled in migStaFun above) don't count toward, or
 * block, the streak, same as if that picker didn't exist. Reminders
 * are checked against the last generation's own anchor date (not live
 * "now"), so this must always agree with whatever RemSecCom is
 * actually showing right now.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The current state, read (not
 *                    mutated) for its own
 *                    pickers/today/reminderOpts/holidays/streak.
 * @param entArgArr - Entry Argument Array: The today.entries to reconcile
 *                    against (may already reflect an in-progress toggle).
 * @param tasArgArr - Task Argument Array: The tasks to reconcile against.
 *
 * @returns { stkClaBoo, stkValNum } reflecting the reconciled verdict.
 *
 * @example
 * ```ts
 * stkSynFun(state, entries, tasks) // => { stkClaBoo, stkValNum }
 * ```
 *
*/

function stkSynFun( curStaObj, entArgArr, tasArgArr ) {


	const hidPicSet = new Set( ( curStaObj.pickers || [] ).filter( ( curPicObj ) => curPicObj.hidden ).map( ( curPicObj ) => curPicObj.id ) ); // What: Hidden Picker Set. Why: The visible-entries filter below needs fast membership checks against every hidden picker's own id. How: This collects the id of every picker whose own hidden flag is true.
	const visEntArr = ( entArgArr || [] ).filter( ( curEntObj ) => !curEntObj.pickerId || !hidPicSet.has( curEntObj.pickerId ) );              // What: Visible Entry Array. Why: An entry belonging to a hidden picker must not count toward, or block, the streak. How: This keeps every entry with no pickerId at all, or whose pickerId isn't in hidPicSet.

	const curAncObj = TAS_NAM_OBJ.ancDatFun( curStaObj.today && curStaObj.today.generatedAt );                                // What: Current Anchor Object. Why: Reminder eligibility below must be pinned to the last generation's own day, matching whatever RemSecCom is actually showing right now. How: This calls TAS_NAM_OBJ.ancDatFun with today's own generatedAt.
	const visTasArr = TAS_NAM_OBJ.visTodFun( tasArgArr, curStaObj.reminderOpts, curStaObj.holidays, curAncObj );              // What: Visible Task Array. Why: Only a reminder actually shown today can participate in the streak at all. How: This calls TAS_NAM_OBJ.visTodFun with curAncObj as the anchor.
	const stkTasArr = visTasArr.filter( ( curTasObj ) => TAS_NAM_OBJ.optForFun( curTasObj, curStaObj.reminderOpts ).streak ); // What: Streak Task Array. Why: Only a reminder whose own type has the streak switch on actually counts. How: This filters visTasArr to those TAS_NAM_OBJ.optForFun reports streak:true for.

	const hasAnyBoo = visEntArr.length > 0 || stkTasArr.length > 0;                                      // What: Has Any Boolean. Why: A day with nothing eligible on it at all can't claim a streak either way. How: This is true when either visEntArr or stkTasArr is non-empty.
	const entDonBoo = visEntArr.every( ( curEntObj ) => curEntObj.done );                                // What: Entries Done Boolean. Why: The streak requires every visible entry to be done, not just some. How: This is true only when every entry in visEntArr is done.
	const tasDonBoo = stkTasArr.every( ( curTasObj ) => TAS_NAM_OBJ.isaDonFun( curTasObj, curAncObj ) ); // What: Tasks Done Boolean. Why: The streak requires every streak-counting reminder to be done today too. How: This is true only when every task in stkTasArr is done as of curAncObj.

	const nowDonBoo = hasAnyBoo && entDonBoo && tasDonBoo; // What: Now Done Boolean. Why: The final streak verdict needs all 3 conditions to hold at once. How: This combines hasAnyBoo/entDonBoo/tasDonBoo with &&.


	const wasClaBoo = !!curStaObj.today.streakClaimed; // What: Was Claimed Boolean. Why: The reconciliation below needs to compare the new verdict against the PRIOR claimed state. How: This coerces curStaObj.today.streakClaimed to a real boolean.

	let stkValNum = curStaObj.streak; // What: Streak Value Number. Why: The 2 branches below may adjust this starting from curStaObj's own current streak. How: This starts at curStaObj.streak and is reassigned by whichever branch below actually fires.
	let stkClaBoo = wasClaBoo;        // What: Streak Claimed Boolean. Why: The 2 branches below may flip this starting from the prior claimed state. How: This starts at wasClaBoo and is reassigned by whichever branch below actually fires.


	if ( nowDonBoo && !wasClaBoo ) { // What: Claim Branch. Why: The day just became fully done and wasn't already claimed, so it banks a new streak point. How: This increments stkValNum and flips stkClaBoo true.


		stkValNum = stkValNum + 1; // What: Streak Value Increment. Why: A newly-claimed day banks a new streak point. How: This increments stkValNum by 1.
		stkClaBoo = true;          // What: Streak Claimed Flip. Why: Today's own claimed state must reflect this new claim. How: This sets stkClaBoo true.


	}

	else if ( !nowDonBoo && wasClaBoo ) { // What: Unclaim Branch. Why: The day is no longer fully done but was previously claimed (e.g. an item got un-checked), so its point must be given back. How: This decrements stkValNum (floored at 0) and flips stkClaBoo false.


		stkValNum = Math.max( 0, stkValNum - 1 ); // What: Streak Value Decrement. Why: A day that lost its claim must give back the streak point it previously banked, floored at 0. How: This decrements stkValNum by 1, never below 0.
		stkClaBoo = false;                        // What: Streak Claimed Flip. Why: Today's own claimed state must reflect this lost claim. How: This sets stkClaBoo false.


	}



	return { stkClaBoo, stkValNum }; // What: Reconciled Streak Return. Why: The caller needs both the adjusted streak count and its own new claimed state. How: This bundles stkValNum/stkClaBoo together.


}

// #endregion stkSynFun

// #endregion Helpers



// #region Hooks

// #region useAppStaFun

/**
 * useAppStaFun = Use App State Function
 *
 * @summary
 * The entire app state layer. Holds one useState for the whole app
 * state object, seeded either from optArgObj.initial (the onboarding
 * demo's own non-persisted state) or from loaStaFun()'s own migrated
 * result. Persistence is a synchronous localStorage.setItem(JSON.
 * stringify(state)) underneath, and the state itself carries a long
 * pick log, so writing on every setState blocked the main thread (it
 * janked the Regenerate loader whenever a store update fired mid-
 * animation). The write is instead scheduled during idle time and
 * coalesced across rapid updates, then flushed synchronously on hide/
 * unload/unmount so nothing is ever lost. Returns [state, actions],
 * where actions is a useMemo'd object of state-transition functions;
 * every key of that object, and every top-level field of state itself,
 * is a real contract every tab reads by name and must never be renamed.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param optArgObj - Option Argument Object: Optional. { initial, persist }:
 *                    initial supplies a non-persisted starting state (used by
 *                    the onboarding demo) instead of loaStaFun(); persist:
 *                    false (used by the same demo) disables the idle-
 *                    save/flush effects entirely. Omitted entirely for every
 *                    normal, real-data caller.
 *
 * @returns [state, actions]: the current app state, and the memoized
 * object of state-transition functions that mutate it.
 *
 * @example
 * ```ts
 * useAppStaFun() // => [state, actions]
 * ```
 *
*/

function useAppStaFun( optArgObj ) {


	const [ appStaObj, setAppStaObj ] = React.useState( () => ( optArgObj && optArgObj.initial ? migStaFun( optArgObj.initial ) : loaStaFun() ) ); // What: App State Object And Setter. Why: This one useState is the entire app's own persisted state. How: This lazily seeds from optArgObj.initial when given, else from loaStaFun()'s own migrated result.

	const perActBoo = !( optArgObj && optArgObj.persist === false ); // What: Persist Active Boolean. Why: The onboarding demo needs to opt entirely out of the idle-save/flush effects below. How: This is false only when optArgObj.persist is explicitly false.


	const latStaRef = React.useRef( appStaObj ); // What: Latest State Reference And Guard. Why: The idle-save/flush effects below need the CURRENT state even when they fire outside a fresh render (e.g. from a pagehide handler). How: This starts pointing at appStaObj and is kept in sync on every render below.

	latStaRef.current = appStaObj; // What: Latest State Reference Sync. Why: Every render must re-point latStaRef at whatever appStaObj currently is. How: This assigns appStaObj onto latStaRef.current directly in the render body.


	const idlTimRef = React.useRef( null ); // What: Idle Timeout Reference And Guard. Why: The debounced save effect below needs to remember its own pending idle-callback/timeout handle so a later update can cancel it. How: This starts at null and is set/cleared by canPenFun and the save effect below.

	const canPenFun = React.useCallback( () => { // What: Cancel Pending Function. Why: Both the debounced save effect and the flush effect need to cancel any still-pending idle-callback/timeout before scheduling or flushing again. How: This cancels whatever idlTimRef currently holds and clears the ref.


		if ( idlTimRef.current == null ) return; // What: Nothing-Pending Guard. Why: There's nothing to cancel when no idle callback/timeout is currently scheduled. How: This returns immediately when idlTimRef.current is null/undefined.



		( window.cancelIdleCallback || clearTimeout )( idlTimRef.current ); // What: Pending Cancel Call. Why: Whichever scheduling primitive was actually used to schedule it is the one that can cancel it. How: This calls cancelIdleCallback when available, else clearTimeout, passing idlTimRef's own current handle.

		idlTimRef.current = null; // What: Reference Clear. Why: A cancelled handle must not be mistaken for a still-pending one later. How: This resets idlTimRef.current back to null.


	}, [] ); // What: Callback Dependency Array. Why: This callback closes over only the stable idlTimRef, so it never needs to be recreated. How: An empty array means canPenFun is created once and reused for the lifetime of this component.


	React.useEffect( () => { // What: Debounced Save Effect. Why: Every app-state change must eventually be persisted, but not synchronously on the hot path of every single update. How: This cancels any previously-scheduled save, then schedules a fresh one during idle time (or a 200ms timeout fallback), capped at a 2s max wait.


		if ( !perActBoo ) return; // What: Persist-Disabled Guard. Why: The onboarding demo explicitly opts out of ever persisting at all. How: This returns immediately when perActBoo is false.



		canPenFun(); // What: Prior Schedule Cancel. Why: A save already queued for the previous state must not also fire and overwrite this newer one out of order. How: This calls canPenFun to cancel whatever idlTimRef currently holds.


		const schIdlFun = window.requestIdleCallback || ( ( schCalFun ) => setTimeout( schCalFun, 200 ) ); // What: Schedule Idle Function. Why: Not every browser supports requestIdleCallback, so a plain 200ms timeout is the fallback scheduler. How: This picks requestIdleCallback when available, else wraps setTimeout at a fixed 200ms delay.

		idlTimRef.current = schIdlFun( () => { // What: Idle Save Schedule. Why: The scheduled callback must clear its own handle before saving, and save whatever the LATEST state is by the time it actually runs. How: This calls schIdlFun with a callback that clears idlTimRef.current then calls wriStaFun(latStaRef.current), capped by a 2000ms max wait.


			idlTimRef.current = null; // What: Idle Timeout Reference Clear. Why: This scheduled run is about to fire, so its own handle must no longer be treated as pending. How: This clears idlTimRef.current back to null.

			wriStaFun( latStaRef.current ); // What: Write State Call. Why: The save must use whatever the LATEST state is by the time this callback actually runs, not whatever it was when scheduled. How: This calls wriStaFun with latStaRef's own current value.


		}, { timeout : 2000 } ); // What: Idle Callback Options. Why: A save must still happen soon even on a page that never goes idle. How: This caps the idle wait at 2 seconds.


	}, [ appStaObj, perActBoo ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever a change to one of these values could need a fresh save scheduled. How: appStaObj changing means there's new state to eventually persist, and perActBoo changing means persistence itself was just turned on or off.


	React.useEffect( () => { // What: Flush-On-Hide Effect. Why: An async IDB write scheduled by the debounced effect above may not survive the page actually going away, so a synchronous flush must run on pagehide, tab-hide, and unmount. How: This wires pagehide/visibilitychange listeners that flush, and returns a cleanup that flushes once more.


		if ( !perActBoo ) return; // What: Persist-Disabled Guard. Why: The onboarding demo explicitly opts out of ever persisting at all. How: This returns immediately when perActBoo is false.



		const runFluFun = () => { // What: Run Flush Function. Why: A synchronous flush must first cancel any still-pending idle save so the 2 writes don't race each other. How: This calls canPenFun then fluStaFun(latStaRef.current).


			canPenFun(); // What: Prior Schedule Cancel. Why: A save already queued via the debounced effect above must not also fire and race this synchronous flush. How: This calls canPenFun to cancel whatever idlTimRef currently holds.

			fluStaFun( latStaRef.current ); // What: Flush State Call. Why: The flush must use whatever the LATEST state is, not whatever it was when this handler was registered. How: This calls fluStaFun with latStaRef's own current value.


		};


		const onVisChaFun = () => { if ( document.visibilityState === 'hidden' ) runFluFun(); }; // What: On Visibility Change Function. Why: A tab being hidden (not just closed) is another moment a pending save could otherwise be lost. How: This calls runFluFun only when the document's own visibilityState just became 'hidden'.


		window.addEventListener( 'pagehide', runFluFun );             // What: Pagehide Listener Attach. Why: The page actually going away is the primary moment this flush must catch. How: This wires runFluFun to the window's own 'pagehide' event.
		document.addEventListener( 'visibilitychange', onVisChaFun ); // What: Visibilitychange Listener Attach. Why: A tab merely being hidden (not unloaded) is the secondary moment this flush must catch. How: This wires onVisChaFun to the document's own 'visibilitychange' event.



		return () => { // What: Cleanup Return. Why: This effect's own listeners must be removed, and one final flush run, whenever perActBoo changes or the component unmounts. How: This flushes once more, then removes both listeners.


			runFluFun(); // What: Unmount Flush. Why: An unmount is itself a moment a pending save could otherwise be lost. How: This calls runFluFun one final time.

			window.removeEventListener( 'pagehide', runFluFun );             // What: Pagehide Listener Detach. Why: A stale listener must not linger past this effect's own lifetime. How: This removes runFluFun from the window's own 'pagehide' event.
			document.removeEventListener( 'visibilitychange', onVisChaFun ); // What: Visibilitychange Listener Detach. Why: A stale listener must not linger past this effect's own lifetime. How: This removes onVisChaFun from the document's own 'visibilitychange' event.


		};


	}, [ perActBoo ] ); // What: Effect Dependency Array. Why: This effect must re-run only when perActBoo itself changes, since that's the only thing that could turn persistence on or off. How: perActBoo changing means the listeners themselves need re-wiring (or tearing down) under the new persistence setting.


	const actStoObj = React.useMemo( () => ( { // What: Action Store Object. Why: This is the entire mutation surface of the app's own state: a tab reads/calls these exact keys by name, so every key here is a real, load-bearing external contract. How: This builds a memoized object of state-transition functions, computed once (empty dependency array below).


		// #region App Data

		// #region impDatFun

		/**
		 * impDatFun = Import Data Function
		 *
		 * @summary
		 * Replaces the whole store from an imported JSON blob (Settings
		 * tab's Data control's own Import). Runs through migStaFun() so an
		 * older/partial export gets the same backfills a fresh load would.
		 * An imported backup's own pickLog is authoritative even when
		 * empty: it replaces ALL data, so stale local history must not
		 * survive it.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param impRawObj - Import Raw Object: The parsed JSON blob from the
		 *                    imported backup file.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * impDatFun(impRawObj) // => void
		 * ```
		 *
		*/

		impDatFun : ( impRawObj ) => { // What: Import Data Function. Why: This is called with the parsed JSON blob a user just imported. How: This marks the next save authoritative (so an empty imported pickLog isn't treated as "nothing to save yet"), then replaces state wholesale via migStaFun().


			try { if ( STG_NAM_OBJ ) STG_NAM_OBJ.logAutFun(); } // What: Authoritative-Write Marker Try. Why: STG_NAM_OBJ must treat the very next save as authoritative, not incremental, so an intentionally-empty imported log actually overwrites the old one. How: This calls STG_NAM_OBJ.logAutFun() when STG_NAM_OBJ exists.

			catch ( errCauObj ) {} // What: Authoritative-Write Marker Guard. Why: A throwing logAutFun call must not abort the state replace below. How: This silently ignores any error from the call above.



			setAppStaObj( migStaFun( impRawObj ) ); // What: State Replace. Why: The imported blob becomes the entire new state, once migrated to the current shape. How: This calls setAppStaObj with migStaFun(impRawObj).


		},

		// #endregion impDatFun



		// #region wipAppFun

		/**
		 * wipAppFun = Wipe App Function
		 *
		 * @summary
		 * Wipes persisted storage, then hard-RELOADS rather than setState-
		 * ing a clean state in place and stopping there: a plain in-memory
		 * reset left stale module-level singletons behind (state/tour-bus.js's
		 * bus, etc.), which is what made onboarding misbehave after "Reset
		 * all data". wipe() is async (an IDB clear); awaiting it before
		 * reloading matters here specifically, unlike a fire-and-forget
		 * call, since a reload can tear down the page mid-transaction,
		 * something setState() never could guard against.
		 *
		 * latStaRef.current is updated (not just setAppStaObj) before
		 * reloading, even though nothing will ever render it: window.
		 * location.reload() fires a pagehide event, and this file's own
		 * flush effect above synchronously re-persists whatever
		 * latStaRef.current holds at that moment. Without this, that flush
		 * would silently re-save the STALE pre-wipe state right back into
		 * the storage this action just cleared, undoing the wipe before
		 * the reload even finishes loading; setAppStaObj() alone isn't
		 * enough since React's own re-render (which is what actually
		 * updates latStaRef.current, via this file's own render-phase
		 * `latStaRef.current = appStaObj` line above) isn't guaranteed to
		 * have committed yet by the time reload() below fires.
		 *
		 * The URL hash is cleared too: app.jsx's own initial active-tab
		 * read consults location.hash for its #settings deep link, and a
		 * reload alone would otherwise land right back on Settings for
		 * anyone who'd arrived that way, the same "onboarding anchors only
		 * exist on Today" problem the Settings button's own onNavTab
		 * ('today') call exists to avoid.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param void - This function takes no parameters.
		 *
		 * @returns A promise that settles once every store has been cleared.
		 *
		 * @example
		 * ```ts
		 * wipAppFun() // => Promise
		 * ```
		 *
		*/

		wipAppFun : async () => { // What: Wipe App Function. Why: This is the "Delete all data" action, and it must fully clear storage AND reload before anything (including this file's own flush effect) can re-persist stale state. How: See the design-rationale comment directly above.


			try { // What: Wipe Attempt. Why: A storage failure here must not prevent the clean reload below from still happening. How: This awaits STG_NAM_OBJ.wipDatFun() then STG_NAM_OBJ.logAutFun(), only when STG_NAM_OBJ itself exists.


				if ( STG_NAM_OBJ ) { // What: Storage Wipe And Log. Why: Both the actual IDB/localStorage clear and the authoritative-write marker must happen before anything else below runs. How: This awaits STG_NAM_OBJ.wipDatFun(), then calls STG_NAM_OBJ.logAutFun().


					await STG_NAM_OBJ.wipDatFun(); // What: Storage Wipe Call. Why: The actual IDB/localStorage clear must happen before anything else below runs. How: This awaits STG_NAM_OBJ.wipDatFun().


					STG_NAM_OBJ.logAutFun(); // What: Authoritative-Write Marker Call. Why: The very next save after this wipe must be treated as authoritative, not incremental. How: This calls STG_NAM_OBJ.logAutFun().


				}


			}

			catch ( errCauObj ) {} // What: Wipe Failure Guard. Why: A wipe failure must never prevent the reload below from still happening. How: This swallows the error silently.



			const cleStaObj = migStaFun( SED_NAM_OBJ.buiCleFun() ); // What: Clean State Object. Why: The freshly-reloaded app needs a real, migrated empty state ready in latStaRef before reload() fires. How: This builds a fresh SED_NAM_OBJ.buiCleFun() and runs it through migStaFun().

			latStaRef.current = cleStaObj; // What: Latest State Reference Update. Why: The flush effect's own pagehide handler must see this clean state, not the stale pre-wipe one, per the design-rationale comment above. How: This assigns cleStaObj directly onto latStaRef.current.

			setAppStaObj( cleStaObj ); // What: App State Set. Why: React itself should also reflect the clean state, even though the reload below discards this render anyway. How: This calls setAppStaObj with cleStaObj.



			try { window.location.hash = ''; } // What: Hash Clear Try. Why: A stale #settings deep link must not survive the reload, per the design-rationale comment above. How: This clears location.hash before the reload below.

			catch ( errCauObj ) {} // What: Hash Clear Guard. Why: A throwing location.hash write must not abort the reload below. How: This silently ignores any error from the clear above.



			window.location.reload(); // What: Hard Reload. Why: Only a real reload clears stale module-level singletons left behind by an in-memory-only reset. How: This calls window.location.reload().


		},

		// #endregion wipAppFun

		// #endregion App Data



		// #region Appearance Settings

		// #region renCusFun

		/**
		 * renCusFun = Rename Custom Function
		 *
		 * @summary
		 * Renames a custom theme slot without touching its own colors or
		 * activating it (renaming while just browsing shouldn't force-
		 * switch the live theme). Mirrors the color auto-derive above:
		 * renaming one slot also renames its own counterpart, UNLESS the
		 * counterpart's own name has since been edited directly (tracked
		 * separately from the color derived flag, since a user might
		 * customize one without touching the other).
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param theModStr - Theme Mode String: 'light' or 'dark', picking the
		 *                    custom
		 *                    slot to rename.
		 * @param newNamStr - New Name String: The name typed for that slot.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * renCusFun('dark', newNamStr) // => void
		 * ```
		 *
		*/

		renCusFun : ( theModStr, newNamStr ) => setAppStaObj( ( curStaObj ) => { // What: Rename Custom Function. Why: A custom theme slot needs its own editable display name without switching the live theme. How: This renames theModStr's own slot and its counterpart too, unless the counterpart's name was edited directly.


			const keyNamStr = theModStr === 'dark' ? 'customDark' : 'customLight'; // What: Key Name String. Why: The rename below is written under whichever slot this exact mode owns. How: This picks 'customDark' or 'customLight' from theModStr.
			const couKeyStr = theModStr === 'dark' ? 'customLight' : 'customDark'; // What: Counter Key String. Why: The auto-derive step below writes onto the OPPOSITE slot from keyNamStr. How: This picks the opposite of keyNamStr.

			const sedDefObj = theModStr === 'dark' // What: Seed Defaults Object. Why: The counterpart fallback below needs plausible starting colors when it has no slot of its own yet at all. How: This picks the light-mode defaults when theModStr is 'dark' (since the counterpart would be light), else the dark-mode defaults.
				? { accent : '#3360a8', bg : '#fcfbf9', text : '#242629' }  // What: Light Seed Branch. Why: A light slot starts from light colors. How: This is the default light palette.
				: { accent : '#7da4ff', bg : '#1e2230', text : '#f2f3f6' }; // What: Dark Seed Branch. Why: A dark slot starts from dark colors. How: This is the default dark palette.

			const curColObj = ( curStaObj.appearance || {} )[ keyNamStr ] || ( theModStr === 'dark' // What: Current Colors Object. Why: The rename below must preserve this slot's own existing colors, falling back to plausible defaults when it has none yet. How: This reads curStaObj's own appearance[keyNamStr], else a dark/light default shape matching mode.
				? { accent : '#7da4ff', bg : '#1e2230', text : '#f2f3f6' }    // What: Dark Default Branch. Why: A dark slot with no colors of its own falls back to dark colors. How: This is the default dark palette.
				: { accent : '#3360a8', bg : '#fcfbf9', text : '#242629' } ); // What: Light Default Branch. Why: A light slot with no colors of its own falls back to light colors. How: This is the default light palette.

			const nexAppObj = { // What: Next Appearance Object. Why: This slot's own colors are kept, but its name is now explicitly set (nameDerived:false, since a direct rename is never itself derived). How: This spreads curStaObj's own appearance, writing the renamed slot under keyNamStr.


				...( curStaObj.appearance || {} ), // What: Current Appearance Spread. Why: Every other appearance setting must carry over unchanged. How: This spreads curStaObj.appearance, defaulting to {} for state that predates it.

				[ keyNamStr ] : { ...curColObj, name : newNamStr, nameDerived : false } // What: Renamed Slot. Why: This slot keeps its own colors but takes the new name, flagged as set directly. How: This spreads curColObj, writing newNamStr as name and nameDerived:false.


			};

			const couSloObj = nexAppObj[ couKeyStr ]; // What: Counter Slot Object And Guard. Why: The auto-rename check below needs to know whether the counterpart's own name was already set directly. How: This reads nexAppObj's own counterpart slot.


			if ( !couSloObj || couSloObj.nameDerived !== false ) { // What: Auto-Rename Guard. Why: Only a counterpart whose own name is missing, or ITSELF still auto-derived, should be renamed along with this one. How: This rewrites nexAppObj's own counterpart slot only when this condition holds.


				nexAppObj[ couKeyStr ] = { // What: Counterpart Slot Rename. Why: The counterpart needs the same name, flagged as auto-derived rather than a direct user choice. How: This spreads the prior counterpart slot (or sedDefObj) with name/nameDerived overridden.


					...( couSloObj || sedDefObj ), // What: Prior Counterpart Spread. Why: The counterpart keeps its own colors, or starts from plausible defaults when it has no slot yet. How: This spreads couSloObj, falling back to sedDefObj.

					name        : newNamStr, // What: Name. Why: The counterpart takes the same name as the slot just renamed. How: This is newNamStr.
					nameDerived : true       // What: Name Derived. Why: This name was copied automatically, so a later direct rename of this counterpart may still replace it. How: This is true.


				};


			}



			return { ...curStaObj, appearance : nexAppObj }; // What: Next State Return. Why: The caller needs appearance replaced on a fresh state. How: This spreads curStaObj with appearance replaced by nexAppObj.


		} ),

		// #endregion renCusFun



		setAniFun : ( picAniStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Set Animation Function. Why: This picks the Today tab's own pick-reveal animation style ('reel' | 'spotlight' | 'dissolve'). How: This writes pickAnim (from picAniStr) onto appearance.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the appearance override below.

			appearance : { // What: Appearance. Why: Only one appearance setting changes, every other one must survive. How: This rebuilds appearance from its own current settings plus the one override below.


				...( curStaObj.appearance || {} ), // What: Current Appearance Spread. Why: Every other appearance setting must carry over unchanged. How: This spreads curStaObj.appearance, defaulting to {} for state that predates it.

				pickAnim : picAniStr // What: Pick Animation. Why: This is the Today tab's own pick-reveal animation style. How: This is picAniStr.


			}


		} ) ),



		setCelFun : ( celStyStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Set Celebration Function. Why: This picks the Today tab's own ring-fill completion-celebration style ('ripple' | 'confetti' | 'sparkle'). How: This writes completionStyle (from celStyStr) onto appearance.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the appearance override below.

			appearance : { // What: Appearance. Why: Only one appearance setting changes, every other one must survive. How: This rebuilds appearance from its own current settings plus the one override below.


				...( curStaObj.appearance || {} ), // What: Current Appearance Spread. Why: Every other appearance setting must carry over unchanged. How: This spreads curStaObj.appearance, defaulting to {} for state that predates it.

				completionStyle : celStyStr // What: Completion Style. Why: This is the Today tab's own ring-fill celebration style. How: This is celStyStr.


			}


		} ) ),



		// #region setCusFun

		/**
		 * setCusFun = Set Custom Function
		 *
		 * @summary
		 * Saves the 3 user-picked colors (bg/text/accent) for the light or
		 * dark custom slot, and immediately makes it the active theme.
		 * Also auto-generates/updates the OTHER mode's own custom slot as
		 * an inverted counterpart (same hue, flipped lightness), so
		 * creating one custom palette gives you both for free. That auto-
		 * fill stops the moment the user edits the counterpart directly
		 * (its own derived flag flips to false), so a real manual edit is
		 * never clobbered.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param theModStr - Theme Mode String: 'light' or 'dark', picking the
		 *                    custom
		 *                    slot to save.
		 * @param cusColObj - Custom Color Object: The picked colors to save into
		 *                    that
		 *                    slot.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * setCusFun('light', cusColObj) // => void
		 * ```
		 *
		*/

		setCusFun : ( theModStr, cusColObj ) => setAppStaObj( ( curStaObj ) => { // What: Set Custom Function. Why: Appearance's own custom color pickers need to save a palette and make it live immediately. How: This writes the 3 colors to theModStr's own custom slot, activates it, and auto-derives the other mode's counterpart unless that one was edited directly.


			const keyNamStr = theModStr === 'dark' ? 'customDark' : 'customLight'; // What: Key Name String. Why: Every field below is written under whichever slot this exact mode owns. How: This picks 'customDark' or 'customLight' from theModStr.
			const couKeyStr = theModStr === 'dark' ? 'customLight' : 'customDark'; // What: Counter Key String. Why: The auto-derive step below writes onto the OPPOSITE slot from keyNamStr. How: This picks the opposite of keyNamStr.

			const savColObj = { ...cusColObj, derived : false }; // What: Saved Colors Object. Why: A directly-saved slot is by definition NOT auto-derived from its own counterpart. How: This spreads cusColObj with derived explicitly set false.

			const nexAppObj = { // What: Next Appearance Object. Why: The caller needs this slot saved and immediately activated as the live theme. How: This spreads curStaObj's own appearance, writing savColObj under keyNamStr and setting theme to keyNamStr.


				...( curStaObj.appearance || {} ), // What: Current Appearance Spread. Why: Every other appearance setting must carry over unchanged. How: This spreads curStaObj.appearance, defaulting to {} for state that predates it.

				[ keyNamStr ] : savColObj, // What: Saved Slot. Why: The chosen custom slot must hold the colors just picked. How: This writes savColObj under keyNamStr.

				theme : keyNamStr // What: Theme. Why: A saved custom palette becomes the live theme immediately. How: This sets theme to keyNamStr.


			};

			const couSloObj = nexAppObj[ couKeyStr ]; // What: Counter Slot Object And Guard. Why: The auto-derive check below needs to know whether the counterpart slot already has a real, manually-derived value. How: This reads nexAppObj's own counterpart slot.


			if ( !couSloObj || couSloObj.derived !== false ) { // What: Auto-Derive Guard. Why: Only a counterpart that's missing, or ITSELF still auto-derived, should be overwritten; a real manual edit (derived:false) must never be clobbered. How: This rewrites nexAppObj's own counterpart slot only when this condition holds.


				nexAppObj[ couKeyStr ] = { // What: Counterpart Slot Write. Why: The counterpart needs its own bg/text/accent inverted from the slot that was just saved, keeping any existing name. How: This spreads the prior counterpart slot (or {}), overriding bg/text/accent via invColFun on cusColObj and flagging derived:true.


					...( couSloObj || {} ), // What: Existing Name Keep Spread. Why: A counterpart slot's own name (if it had one) shouldn't be lost just because its colors are being re-derived. How: This spreads couSloObj (or {}) first, so bg/text/accent/derived below still win.

					accent  : invColFun( cusColObj.accent ), // What: Accent. Why: The counterpart gets the inverted accent color. How: This calls invColFun on cusColObj.accent.
					bg      : invColFun( cusColObj.bg ),     // What: Background. Why: The counterpart gets the inverted background color. How: This calls invColFun on cusColObj.bg.
					derived : true,                          // What: Derived. Why: This slot was auto-generated, so a later save of its own counterpart may overwrite it again. How: This is true.
					text    : invColFun( cusColObj.text )    // What: Text. Why: The counterpart gets the inverted text color. How: This calls invColFun on cusColObj.text.


				};


			}



			return { ...curStaObj, appearance : nexAppObj }; // What: Next State Return. Why: The caller needs appearance replaced on a fresh state. How: This spreads curStaObj with appearance replaced by nexAppObj.


		} ),

		// #endregion setCusFun



		setPlaFun : ( tabPlaStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Set Placement Function. Why: This picks the tab bar's own placement ('bottom' | 'side' | 'top') from Appearance's own Layout control. How: This writes tabPlacement (from tabPlaStr) onto appearance.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the appearance override below.

			appearance : { // What: Appearance. Why: Only one appearance setting changes, every other one must survive. How: This rebuilds appearance from its own current settings plus the one override below.


				...( curStaObj.appearance || {} ), // What: Current Appearance Spread. Why: Every other appearance setting must carry over unchanged. How: This spreads curStaObj.appearance, defaulting to {} for state that predates it.

				tabPlacement : tabPlaStr // What: Tab Placement. Why: This is where the tab bar sits. How: This is tabPlaStr.


			}


		} ) ),



		setSysFun : ( autSysBoo ) => setAppStaObj( ( curStaObj ) => ( { // What: Set System Function. Why: "System preference" (Appearance) makes the app auto-swap between the current theme and its own light/dark counterpart to match the OS's own prefers-color-scheme, rather than always applying whichever was picked. How: This writes autoSystem (from autSysBoo) onto appearance.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the appearance override below.

			appearance : { // What: Appearance. Why: Only one appearance setting changes, every other one must survive. How: This rebuilds appearance from its own current settings plus the one override below.


				...( curStaObj.appearance || {} ), // What: Current Appearance Spread. Why: Every other appearance setting must carry over unchanged. How: This spreads curStaObj.appearance, defaulting to {} for state that predates it.

				autoSystem : autSysBoo // What: Auto System. Why: This decides whether the app follows the OS's own light/dark preference. How: This is autSysBoo.


			}


		} ) ),



		setTheFun : ( theKeyStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Set Theme Function. Why: This picks a built-in theme by key ('ink' | 'sage' | 'sand' | 'night' | 'moss' | 'ember'), or 'customLight'/'customDark' once the matching custom colors have been set via setCusFun. How: This writes theme (from theKeyStr) onto appearance.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the appearance override below.

			appearance : { // What: Appearance. Why: Only one appearance setting changes, every other one must survive. How: This rebuilds appearance from its own current settings plus the one override below.


				...( curStaObj.appearance || {} ), // What: Current Appearance Spread. Why: Every other appearance setting must carry over unchanged. How: This spreads curStaObj.appearance, defaulting to {} for state that predates it.

				theme : theKeyStr // What: Theme. Why: This is the active built-in or custom theme's own key. How: This is theKeyStr.


			}


		} ) ),

		// #endregion Appearance Settings



		// #region Conditionals

		// #region addConFun

		/**
		 * addConFun = Add Conditional Function
		 *
		 * @summary
		 * Creates a brand-new conditional (a day-off gate) from the Data tab's own
		 * authoring form and prepends it onto the conditionals list. Every field
		 * the form leaves out gets its default, so a caller only needs to pass
		 * what the user actually set.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param conArgObj - Conditional Argument Object: The authoring form's
		 *                    fields; any field left out gets its default.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * addConFun(conArgObj) // => void
		 * ```
		 *
		*/

		addConFun : ( conArgObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Add Conditional Function. Why: This creates a brand-new conditional (a day-off gate) from the Data tab's own authoring form. How: This builds a full conditional object from conArgObj's own fields (defaulting every field not given) and prepends it onto conditionals.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the conditionals override below.

			conditionals : [ // What: Conditionals. Why: The new conditional must appear at the top of the list, ahead of every existing one. How: This builds a fresh array with the new conditional first, then every existing one.


				{ // What: New Conditional Object. Why: This is the brand-new conditional itself, with every field conArgObj didn't supply filled with its default. How: This builds each field from conArgObj or its own default.


					active       : conArgObj.active !== undefined ? conArgObj.active : true,                                     // What: Active. Why: A new conditional is enabled unless the form says otherwise. How: This honors conArgObj.active when given, else defaults to true. // What: Active/Triggered Defaults. Why: active means enabled (not inactive); triggered means currently firing, defaulting true only for ease-down (which starts "charged"). How: This honors an explicit value when given, else applies each field's own default.
					cardText     : conArgObj.cardText || 'Day off',                                                              // What: Card Text. Why: The day-off card shown on Today needs its own display text. How: This reads conArgObj.cardText, defaulting to 'Day off'.
					chargedToday : false,                                                                                        // What: Charged Today. Why: A brand-new conditional hasn't charged yet today, so its per-day charge guard starts clear. How: This is false.
					easeMax      : conArgObj.easeMax ?? 14,                                                                      // What: Ease Max. Why: An ease-mode conditional needs the upper end of its own drift band. How: This reads conArgObj.easeMax, defaulting to 14.
					easeMin      : conArgObj.easeMin ?? 7,                                                                       // What: Ease Min. Why: An ease-mode conditional needs the lower end of its own drift band. How: This reads conArgObj.easeMin, defaulting to 7.
					id           : conArgObj.id || ( 'cnd_' + Math.random().toString( 36 ).slice( 2, 8 ) ),                      // What: Id. Why: Every conditional needs a stable id pickers can link to. How: This uses conArgObj.id when given, else mints a random 'cnd_' id.
					mode         : conArgObj.mode || 'ease-up',                                                                  // What: Mode. Why: The mode decides how this conditional rolls or charges each day. How: This reads conArgObj.mode, defaulting to 'ease-up'.
					name         : conArgObj.name || 'Conditional',                                                              // What: Name. Why: The conditional needs a display name across the Data tab and its own day-off card. How: This reads conArgObj.name, defaulting to 'Conditional'.
					oddsPct      : conArgObj.oddsPct ?? 50,                                                                      // What: Odds Percent. Why: A probability-mode conditional needs its own daily firing odds. How: This reads conArgObj.oddsPct, defaulting to 50.
					threshold    : conArgObj.threshold ?? 100,                                                                   // What: Threshold. Why: An ease-mode conditional charges toward (or decays from) this value. How: This reads conArgObj.threshold, defaulting to 100.
					triggered    : conArgObj.triggered !== undefined ? conArgObj.triggered : ( conArgObj.mode === 'ease-down' ), // What: Triggered. Why: A new conditional starts firing only when it's ease-down, which starts charged. How: This honors conArgObj.triggered when given, else defaults to whether mode is 'ease-down'. // What: Active/Triggered Defaults. Why: active means enabled (not inactive); triggered means currently firing, defaulting true only for ease-down (which starts "charged"). How: This honors an explicit value when given, else applies each field's own default.
					value        : conArgObj.mode === 'ease-down' ? ( conArgObj.threshold ?? 100 ) : 0,                          // What: Value. Why: Ease Down starts fully charged at its threshold while every other mode starts empty. How: This is the threshold (default 100) for ease-down, else 0.
					weight       : conArgObj.weight ?? 1                                                                         // What: Weight. Why: A weighted conditional needs its own draw weight. How: This reads conArgObj.weight, defaulting to 1.


				},

				...( curStaObj.conditionals || [] ) // What: Existing Conditionals Spread. Why: Every existing conditional must survive, after the new one. How: This spreads curStaObj.conditionals, defaulting to [].


			]


		} ) ),

		// #endregion addConFun



		// #region delConFun

		/**
		 * delConFun = Delete Conditional Function
		 *
		 * @summary
		 * Deletes a conditional and detaches it from every picker it gated, by
		 * nulling each such picker's own conditionalId, so nothing is left
		 * pointing at an id that no longer exists.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param conIdeStr - Conditional Identifier String: The conditional to
		 *                    delete.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * delConFun(conIdeStr) // => void
		 * ```
		 *
		*/

		delConFun : ( conIdeStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Delete Conditional Function. Why: Deleting a conditional must also detach it from every picker that was gated by it, so nothing references a now-gone id. How: This filters the conditional out, and nulls conditionalId on every picker that pointed at it.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			conditionals : ( curStaObj.conditionals || [] ).filter( ( curConObj ) => curConObj.id !== conIdeStr ),                                              // What: Conditionals. Why: The deleted conditional must actually be gone from state. How: This filters out the one whose own id matches conIdeStr.
			pickers      : curStaObj.pickers.map( ( curPicObj ) => curPicObj.conditionalId === conIdeStr ? { ...curPicObj, conditionalId : null } : curPicObj ) // What: Pickers. Why: No picker may keep pointing at a conditional that no longer exists. How: This nulls conditionalId on every picker that pointed at conIdeStr.


		} ) ),

		// #endregion delConFun



		// #region resConFun

		/**
		 * resConFun = Resolve Conditionals Function
		 *
		 * @summary
		 * Phase A of Generate. It rolls the probability and dynamic modes, carries
		 * the persisted active flag for the ease modes, and clears each
		 * conditional's per-day charge guard. Unlike most actions it also returns
		 * the resolved array directly, so the generator can gate pickers off the
		 * fresh values in the same pass instead of waiting for React state.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param void - This function takes no parameters.
		 *
		 * @returns The conditionals resolved for this Generate pass.
		 * @see {@link resConArr}
		 *
		 * @example
		 * ```ts
		 * resConFun() // => resolved conditionals array
		 * ```
		 *
		*/

		resConFun : () => { // What: Resolve Conditionals Function. Why: Phase A of Generate: rolls probability/dynamic modes and carries persisted active for ease modes, clearing the per-day charge guard, so the generator can gate pickers off fresh values in the same pass. How: This calls CON_NAM_OBJ.resDayFun, applies its own per-conditional patch, and returns the resolved array directly (not just via setAppStaObj).


			let resConArr = null; // What: Resolved Conditionals Array. Why: The caller needs the resolved array back directly, not only via the next render's own state. How: This starts null and is captured inside the setAppStaObj updater below.


			setAppStaObj( ( curStaObj ) => { // What: State Update Call. Why: The per-day patches must be computed from, and merged into, the latest state rather than a stale closure copy. How: This runs an updater that resolves every conditional's own patch, captures the result in resConArr, and returns the patched state.


				const patIdeObj = CON_NAM_OBJ.resDayFun( curStaObj.conditionals || [] );                                                       // What: Patch Identifier Object. Why: CON_NAM_OBJ itself decides each conditional's own per-day patch (or none). How: This calls CON_NAM_OBJ.resDayFun with curStaObj's own conditionals.
				const nexConArr = ( curStaObj.conditionals || [] ).map( ( curConObj ) => ( { ...curConObj, ...patIdeObj[ curConObj.id ] } ) ); // What: Next Conditionals Array. Why: Every conditional gets its own matching patch (if any) merged on. How: This maps every conditional, spreading in patIdeObj's own entry for its id.

				resConArr = nexConArr; // What: Resolved Array Capture. Why: The outer resConArr must be set from inside this updater, the only place nexConArr actually exists. How: This assigns nexConArr onto the closed-over resConArr.



				return { ...curStaObj, conditionals : nexConArr }; // What: Next State Return. Why: The caller needs conditionals replaced on a fresh state. How: This spreads curStaObj with conditionals replaced by nexConArr.


			} );



			return resConArr; // What: Resolved Conditionals Return. Why: The generator needs the resolved array synchronously, not just via the next render. How: This returns resConArr, captured above.


		},

		// #endregion resConFun



		updConFun : ( conIdeStr, patValObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Update Conditional Function. Why: Callers need to patch one existing conditional's own fields in place, without touching any other. How: This merges patValObj onto the one conditional whose own id matches conIdeStr.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			conditionals : ( curStaObj.conditionals || [] ).map( ( curConObj ) => curConObj.id === conIdeStr ? { ...curConObj, ...patValObj } : curConObj ) // What: Conditionals. Why: Only the one matching conditional changes. How: This merges patValObj onto the conditional whose own id matches conIdeStr, leaving every other one as-is.


		} ) ),

		// #endregion Conditionals



		// #region Daily Generator

		daiModFun : ( daiModStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Daily Mode Function. Why: This decides whether the Daily generator runs on its own each day, or only when the user triggers it ('auto' | 'manual'). How: This writes daiModStr as mode onto daily.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			daily : { ...curStaObj.daily, mode : daiModStr } // What: Daily. Why: Only the generator's own run mode changes. How: This spreads curStaObj.daily with mode replaced by daiModStr.


		} ) ),



		daiPicFun : ( picIdeArr ) => setAppStaObj( ( curStaObj ) => ( { // What: Daily Pickers Function. Why: This is the Daily generator's own picker membership list. How: This writes picIdeArr as pickerIds onto daily.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			daily : { ...curStaObj.daily, pickerIds : picIdeArr } // What: Daily. Why: Only the generator's own picker membership changes. How: This spreads curStaObj.daily with pickerIds replaced by picIdeArr.


		} ) ),



		daiTimFun : ( runTimStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Daily Time Function. Why: This is the time of day (HH:MM, 24h) the Daily generator auto-runs. How: This writes runTimStr as runTime onto daily.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			daily : { ...curStaObj.daily, runTime : runTimStr } // What: Daily. Why: Only the generator's own auto-run time changes. How: This spreads curStaObj.daily with runTime replaced by runTimStr.


		} ) ),



		// #region marGenFun

		/**
		 * marGenFun = Mark Generated Function
		 *
		 * @summary
		 * Stamps the generation time and snapshots every item's and
		 * conditional's own value at that moment, so the Day Log can show "value
		 * at generation, then after". It is Today-only and overwritten by every
		 * Regenerate; because values are done-gated, the live values only drift
		 * from this snapshot once entries are completed.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param void - This function takes no parameters.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * marGenFun() // => void
		 * ```
		 *
		*/

		marGenFun : () => setAppStaObj( ( curStaObj ) => { // What: Mark Generated Function. Why: This stamps the generation time AND snapshots every item's/conditional's own value at that moment, so the Day Log can show "value at generation to after". Today-only: overwritten on each Regenerate; values are done-gated so the live values only diverge from this snapshot once entries are completed. How: This builds a genLog of {items, conds} keyed by id, alongside a fresh generatedAt.


			const iteValObj = {}; // What: Item Values Object. Why: The Day Log needs every item's own value AS OF right now, keyed by id. How: This starts empty and is filled by the loop below.


			( curStaObj.items || [] ).forEach( ( curIteObj ) => { iteValObj[ curIteObj.id ] = curIteObj.value; } ); // What: Item Value Fill. Why: Every item's own current value must be captured before anything changes it. How: This writes each item's value under its own id.


			const conValObj = {}; // What: Conditional Values Object. Why: The Day Log needs every conditional's own value/triggered state AS OF right now, keyed by id. How: This starts empty and is filled by the loop below.


			( curStaObj.conditionals || [] ).forEach( ( curConObj ) => { conValObj[ curConObj.id ] = { triggered : curConObj.triggered, value : curConObj.value }; } ); // What: Conditional Value Fill. Why: Every conditional's own current value and triggered flag must be captured before anything changes them. How: This writes a { value, triggered } pair under each conditional's own id.



			return { // What: Next State Return. Why: The caller needs a fresh generatedAt timestamp plus the snapshot genLog written onto today. How: This spreads curStaObj.today with generatedAt/genLog replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				today : { // What: Today. Why: Only today's own generation stamp and snapshot change. How: This rebuilds today from its own current fields plus the two overrides below.


					...curStaObj.today, // What: Current Today Spread. Why: Every other today field (entries, streakClaimed, ...) must carry over unchanged. How: This spreads curStaObj.today before the overrides below.

					generatedAt : new Date().toISOString(),                // What: Generated At. Why: This marks exactly when today's list was generated. How: This stamps the current time as an ISO string.
					genLog      : { conds : conValObj, items : iteValObj } // What: Generation Log. Why: The Day Log compares these snapshot values against later ones. How: This bundles conValObj/iteValObj under the log's own conds/items keys.


				}


			};


		} ),

		// #endregion marGenFun

		// #endregion Daily Generator



		// #region Data Tab UI

		setSorFun : ( sorScoStr, sorKeyStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Set Sort Function. Why: This is the Data tab's own persisted sort preference; sorScoStr is 'sections' (the top-level Conditionals/Reminders/picker card order) or a picker id/'conditionals'/'reminders' (that section's own item-list order). How: This writes sorKeyStr onto ui.dataSort[sorScoStr].


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			ui : { // What: UI. Why: Only the sort-preference map inside ui changes, every other ui field must survive. How: This rebuilds ui from its own current fields plus the updated map.


				...( curStaObj.ui || {} ), // What: Current UI Spread. Why: Every other ui field (controlsCollapsed, ...) must carry over unchanged. How: This spreads curStaObj.ui, defaulting to {} for state that predates it.

				dataSort : { // What: Data Sort. Why: Only this one scope's own sort key changes, every other scope's must survive. How: This rebuilds dataSort from its own current entries plus the one override below.


					...( ( curStaObj.ui && curStaObj.ui.dataSort ) || {} ), // What: Current Data-Sort Spread. Why: Every other scope's own saved sort key must carry over unchanged. How: This spreads curStaObj.ui.dataSort, defaulting to {}.

					[ sorScoStr ] : sorKeyStr // What: Scope Sort Key. Why: This scope's own sort preference must be saved. How: This writes sorKeyStr under sorScoStr's own key.


				}


			}


		} ) ),



		togColFun : ( secIdeStr, defColBoo = false ) => setAppStaObj( ( curStaObj ) => { // What: Toggle Collapsed Function. Why: Persisted collapse state for the Data tab's own disclosures, uniform polarity everywhere (true means COLLAPSED, false means expanded); the main sections default collapsed via defColBoo so the first click expands rather than re-collapsing. How: This flips ui.controlsCollapsed[secIdeStr], falling back to defColBoo when it has no value yet.


			const curColObj = ( curStaObj.ui && curStaObj.ui.controlsCollapsed ) || {};                  // What: Current Collapsed Object. Why: The flip below needs the live collapse-state map, or an empty fallback. How: This reads curStaObj's own ui.controlsCollapsed, defaulting to {}.
			const curValBoo = curColObj[ secIdeStr ] === undefined ? defColBoo : curColObj[ secIdeStr ]; // What: Current Value Boolean. Why: A section with no saved value yet starts from its own caller-supplied default, not always false. How: This reads curColObj's own secIdeStr entry, falling back to defColBoo when it's undefined.
			const nexColObj = { ...curColObj, [ secIdeStr ] : !curValBoo };                              // What: Next Collapsed Object. Why: The caller needs exactly this one section's own collapse state flipped. How: This spreads curColObj, negating secIdeStr's own entry.



			return { // What: Next State Return. Why: The caller needs controlsCollapsed replaced on a fresh ui object. How: This spreads curStaObj's own ui with controlsCollapsed replaced by nexColObj.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				ui : { // What: UI. Why: Only the collapse-state map inside ui changes, every other ui field must survive. How: This rebuilds ui from its own current fields plus the new map.


					...( curStaObj.ui || {} ), // What: Current UI Spread. Why: Every other ui field (dataSort, ...) must carry over unchanged. How: This spreads curStaObj.ui, defaulting to {} for state that predates it.

					controlsCollapsed : nexColObj // What: Controls Collapsed. Why: This is the Data tab's own per-section collapse-state map. How: This is nexColObj.


				}


			};


		} ),

		// #endregion Data Tab UI



		// #region Groups

		// #region renGroFun

		/**
		 * renGroFun = Rename Group Function
		 *
		 * @summary
		 * Renames a group everywhere: every member picker's own group, the
		 * groupOrder slot and the pickerOrder key. If the new name matches an
		 * existing group (case-insensitively), this becomes a merge that folds
		 * the 2 groups together, so the caller (Edit Mode) must confirm a merge
		 * before calling it.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param oldNamStr - Old Name String: The group's current name.
		 * @param rawNamStr - Raw Name String: The new name as typed, before
		 *                    normalizing.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * renGroFun(oldNamStr, rawNamStr) // => void
		 * ```
		 *
		*/

		renGroFun : ( oldNamStr, rawNamStr ) => setAppStaObj( ( curStaObj ) => { // What: Rename Group Function. Why: This renames a group everywhere: rewriting every member picker's own group, remapping the groupOrder slot + pickerOrder key. If the new name matches an existing group (case-insensitively, via the normalizer's own collision reuse) this becomes a MERGE, folding the 2 groups together; the caller (Edit Mode) confirms the merge before invoking. How: See the inline comments below for each step.


			const othGroArr = [ ...new Set( curStaObj.pickers.filter( ( curPicObj ) => curPicObj.group && curPicObj.group !== oldNamStr ).map( ( curPicObj ) => curPicObj.group ) ) ]; // What: Other Group Array. Why: The normalizer needs every OTHER existing group name to detect a same-name collision (a merge). How: This collects the distinct group of every picker not already in oldNamStr.
			const nexNamStr = ( norGroFun && norGroFun( rawNamStr, othGroArr ) ) || String( rawNamStr || '' ).trim();                                                                  // What: Next Name String. Why: The normalizer both tidies rawNamStr and reuses an existing collision's own exact casing. How: This calls norGroFun with othGroArr, else falls back to a plain trim.


			if ( !nexNamStr || nexNamStr === oldNamStr ) return curStaObj; // What: No-Op Guard. Why: An empty result, or a name that didn't actually change, has nothing to rename. How: This returns curStaObj unchanged when either holds.



			const nexPicArr = curStaObj.pickers.map( ( curPicObj ) => curPicObj.group === oldNamStr ? { ...curPicObj, group : nexNamStr } : curPicObj ); // What: Next Picker Array. Why: Every picker that belonged to oldNamStr must now belong to nexNamStr. How: This maps curStaObj.pickers, rewriting group on every matching picker.

			let nexOrdArr = ( curStaObj.groupOrder || [] ).map( ( curGroStr ) => curGroStr === oldNamStr ? nexNamStr : curGroStr ); // What: Next Order Array. Why: The display-order slot itself must follow the rename too. How: This maps groupOrder, replacing oldNamStr with nexNamStr.

			nexOrdArr = nexOrdArr.filter( ( curGroStr, curIndNum ) => nexOrdArr.indexOf( curGroStr ) === curIndNum ); // What: Merge De-Duplicate. Why: A MERGE (renaming onto an existing group) would otherwise leave 2 entries for the same name in groupOrder. How: This keeps only each group name's own first occurrence.

			const nexPodObj = { ...curStaObj.pickerOrder }; // What: Next Picker-Order Object. Why: The per-group row order must be remapped (and merged, on a collision) the same way groupOrder itself was above. How: This starts as a shallow copy of curStaObj.pickerOrder, patched below.


			if ( nexPodObj[ oldNamStr ] ) { // What: Old-Key Remap Guard. Why: Only a group that actually had its own saved row order needs remapping at all. How: This merges oldNamStr's own order into nexNamStr's own (deduped), then drops the old key entirely.


				const exiIdeArr = nexPodObj[ nexNamStr ] || []; // What: Existing Identifier Array. Why: A MERGE must append oldNamStr's own order onto whatever nexNamStr already had, not overwrite it. How: This reads nexPodObj's own current entry for nexNamStr, defaulting to empty.

				nexPodObj[ nexNamStr ] = exiIdeArr.concat( nexPodObj[ oldNamStr ].filter( ( curIdeStr ) => !exiIdeArr.includes( curIdeStr ) ) ); // What: Merged Order Write. Why: Every id from oldNamStr's own order must join nexNamStr's own, without duplicating one already present. How: This concatenates exiIdeArr with oldNamStr's own order filtered to non-duplicates.

				delete nexPodObj[ oldNamStr ]; // What: Old Key Drop. Why: oldNamStr no longer exists as a group, so its own pickerOrder key must be removed entirely. How: This deletes nexPodObj's own oldNamStr key.


			}



			return { ...curStaObj, groupOrder : nexOrdArr, pickerOrder : nexPodObj, pickers : nexPicArr }; // What: Next State Return. Why: Every affected field must land together on one fresh state. How: This spreads curStaObj with pickers/groupOrder/pickerOrder all replaced.


		} ),

		// #endregion renGroFun



		renTouFun : ( rawNamStr ) => setAppStaObj( ( curStaObj ) => { // What: Rename Tours Function. Why: Page Tours has no pickers to rewrite (unlike renGroFun), just a label swap; collision-with-an-existing-group blocking happens in the UI before this ever fires. How: This normalizes rawNamStr and writes it onto onboarding.pageToursName.


			const nexNamStr = ( norGroFun && norGroFun( rawNamStr ) ) || String( rawNamStr || '' ).trim(); // What: Next Name String. Why: The write below needs a tidied, real name. How: This calls norGroFun, else falls back to a plain trim.


			if ( !nexNamStr ) return curStaObj; // What: Empty-Name Guard. Why: An empty result has nothing meaningful to write. How: This returns curStaObj unchanged when nexNamStr is falsy.



			return { // What: Next State Return. Why: The caller needs pageToursName replaced on a fresh state. How: This spreads curStaObj's own onboarding with pageToursName replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				onboarding : { // What: Onboarding Override. Why: Only the Page Tours group label changes, every other onboarding field must survive. How: This rebuilds onboarding from its own current fields plus the new label.


					...( curStaObj.onboarding || {} ), // What: Current Onboarding Spread. Why: Every other onboarding field must carry over unchanged. How: This spreads curStaObj.onboarding, defaulting to {} for state that predates it.

					pageToursName : nexNamStr // What: Page Tours Name. Why: This is the display label for the Page Tours group. How: This is nexNamStr.


				}


			};


		} ),

		// #endregion Groups



		// #region Holiday List Subsystem

		/**
		 * addHolFun = Add Holiday Function
		 *
		 * @summary
		 * The global "days off" the skip-holidays gate reads. togHolFun
		 * turns a computed holiday on/off (off means listed in disabled);
		 * addHolFun/delHolFun manage the user's own extra,
		 * hand-entered holidays alongside the computed ones.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param props.day   - Day: The holiday's day of the month.
		 * @param props.month - Month: The holiday's month, 1 through 12.
		 * @param props.name  - Name: The holiday's display name.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * addHolFun({ day, month, name }) // => void
		 * ```
		 *
		*/



		addHolFun : ( { day : dayValNum, month : monValNum, name : holNamStr } ) => setAppStaObj( ( curStaObj ) => { // What: Add Holiday Function. Why: A user's own hand-entered holiday needs its own fresh id before it can be appended. How: This appends a new row to holidays.custom.


			const curHolObj = curStaObj.holidays || HOL_NAM_OBJ.defStaFun(); // What: Current Holidays Object. Why: The append below needs a real holidays shape even for state that predates this field. How: This reads curStaObj's own holidays, falling back to HOL_NAM_OBJ's own default state.

			const newHolObj = { // What: New Holiday Object. Why: This is the actual custom-holiday row being added. How: This bundles a fresh id with holNamStr/monValNum/dayValNum.


				day   : dayValNum,                                         // What: Day. Why: The holiday recurs on this day of the month every year. How: This is dayValNum.
				id    : 'h_' + Math.random().toString( 36 ).slice( 2, 7 ), // What: Id. Why: A custom holiday must be removable by its own unique id. How: This mints a random 'h_' id.
				month : monValNum,                                         // What: Month. Why: The holiday recurs in this month every year. How: This is monValNum.
				name  : holNamStr                                          // What: Name. Why: The holiday list shows the user's own name for it. How: This is holNamStr.


			};



			return { // What: Next State Return. Why: The caller needs newHolObj appended to a fresh holidays object. How: This spreads curHolObj with custom replaced, newHolObj appended.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				holidays : { // What: Holidays. Why: Only one part of the holidays object changes, every other field must survive. How: This rebuilds holidays from curHolObj plus the one override below.


					...curHolObj, // What: Current Holidays Spread. Why: Every other holidays field must carry over unchanged. How: This spreads curHolObj before the override below.

					custom : [ ...( curHolObj.custom || [] ), newHolObj ] // What: Custom. Why: The user's own hand-entered holidays gain the new one. How: This appends newHolObj to curHolObj.custom, defaulting to [].


				}


			};


		} ),



		delHolFun : ( tarIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Delete Holiday Function. Why: A user's own hand-entered holiday must be removable by its own id. How: This filters holidays.custom down to every entry but the matching one.


			const curHolObj = curStaObj.holidays || HOL_NAM_OBJ.defStaFun(); // What: Current Holidays Object. Why: The filter below needs a real holidays shape even for state that predates this field. How: This reads curStaObj's own holidays, falling back to HOL_NAM_OBJ's own default state.



			return { // What: Next State Return. Why: The caller needs the one matching custom holiday removed from a fresh holidays object. How: This spreads curHolObj with custom filtered.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				holidays : { // What: Holidays. Why: Only one part of the holidays object changes, every other field must survive. How: This rebuilds holidays from curHolObj plus the one override below.


					...curHolObj, // What: Current Holidays Spread. Why: Every other holidays field must carry over unchanged. How: This spreads curHolObj before the override below.

					custom : ( curHolObj.custom || [] ).filter( ( curCusObj ) => curCusObj.id !== tarIdeStr ) // What: Custom. Why: The deleted custom holiday must be gone. How: This filters out the one whose own id matches tarIdeStr, defaulting to [].


				}


			};


		} ),



		togHolFun : ( holKeyStr ) => setAppStaObj( ( curStaObj ) => { // What: Toggle Holiday Function. Why: A computed holiday must be switchable off and back on for the skip-holidays gate. How: This adds holKeyStr to, or removes it from, the holidays object's own disabled list.


			const curHolObj = curStaObj.holidays || HOL_NAM_OBJ.defStaFun(); // What: Current Holidays Object. Why: The toggle below needs a real holidays shape even for state that predates this field. How: This reads curStaObj's own holidays, falling back to HOL_NAM_OBJ's own default state.

			const nexDisArr = curHolObj.disabled.includes( holKeyStr ) // What: Next Disabled Array. Why: Toggling off removes holKeyStr from disabled; toggling on (re-enabling) adds it. How: This filters holKeyStr out when already present, else appends it.
				? curHolObj.disabled.filter( ( curKeyStr ) => curKeyStr !== holKeyStr ) // What: Re-Enable Branch. Why: A disabled holiday being turned back on leaves the list. How: This filters holKeyStr out.
				: [ ...curHolObj.disabled, holKeyStr ];                                 // What: Disable Branch. Why: An enabled holiday being turned off joins the list. How: This appends holKeyStr.



			return { // What: Next State Return. Why: The caller needs disabled replaced on a fresh holidays object. How: This spreads curHolObj with disabled replaced by nexDisArr.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				holidays : { // What: Holidays. Why: Only one part of the holidays object changes, every other field must survive. How: This rebuilds holidays from curHolObj plus the one override below.


					...curHolObj, // What: Current Holidays Spread. Why: Every other holidays field must carry over unchanged. How: This spreads curHolObj before the override below.

					disabled : nexDisArr // What: Disabled. Why: This is the list of computed holidays the user switched off. How: This is nexDisArr.


				}


			};


		} ),

		// #endregion Holiday List Subsystem



		// #region Items

		// #region addIteFun

		/**
		 * addIteFun = Add Item Function
		 *
		 * @summary
		 * Adds one brand-new item to pickerId's own pool. Ease Down items
		 * start fully charged (value at threshold) and join the fairness
		 * rotation at the AVERAGE weight of existing items (excluding the
		 * weight-0 active item, so a fresh streak's own zero can't drag the
		 * newcomer down), rounded and floored at 1 so it's never a second
		 * weight-0; with no peers yet, weight defaults to 1. An ease-mode
		 * item is also stamped immediately with this picker's own current
		 * average drift band (see PIC_NAM_OBJ.aveEasFun), the only place that
		 * still matters now that pick()/the Data tab/the item editor all
		 * compute this same average live instead of reading a picker-level
		 * default.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param picIdeStr - Picker Identifier String: The picker gaining the item.
		 * @param newNamStr - New Name String: The item's name.
		 * @param optIdeStr - Optional Identifier String: An id to use instead of
		 *                    minting a random one.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * addIteFun(picIdeStr, newNamStr) // => void
		 * ```
		 *
		*/

		addIteFun : ( picIdeStr, newNamStr, optIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Add Item Function. Why: A picker's own pool needs a way to gain a brand-new item with sensible mode-specific defaults. How: This builds a de-duplicated item for picIdeStr (Ease Down items fully charged at the peers' average weight, ease-mode items stamped with the current average drift band) and appends it.


			const sibIteArr = curStaObj.items.filter( ( curIteObj ) => curIteObj.pickerId === picIdeStr );     // What: Sibling Item Array. Why: Both the name de-duplication and the ease-down weight averaging below need this picker's own existing items. How: This filters curStaObj.items to those owned by pickerId.
			const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === picIdeStr );           // What: Current Picker Object And Guard. Why: The mode checks below need this picker's own live mode. How: This looks up picIdeStr in curStaObj.pickers.
			const isaDowBoo = curPicObj && curPicObj.mode === 'ease-down';                                     // What: Is-A Down Boolean. Why: Only Ease Down needs the special charged-value/fairness-weight treatment below. How: This is true only when curPicObj exists and its own mode is 'ease-down'.
			const isaEasBoo = curPicObj && ( curPicObj.mode === 'ease-up' || curPicObj.mode === 'ease-down' ); // What: Is-An Ease Boolean. Why: Both ease modes need their own drift-band fields stamped below. How: This is true when curPicObj's own mode is either ease-up or ease-down.

			let weiValNum = 1; // What: Weight Value Number. Why: Every non-ease-down item just uses the plain default weight; only ease-down overrides it below. How: This starts at 1.
			let iniValNum = 0; // What: Initial Value Number. Why: Every non-ease-down item just uses the plain default value; only ease-down overrides it below. How: This starts at 0.


			if ( isaDowBoo ) { // What: Ease-Down Defaults Guard. Why: Only ease-down needs its own charged value and fairness-averaged weight computed. How: This overwrites iniValNum/weiValNum with the ease-down-specific computation below.


				iniValNum = curPicObj.threshold ?? 100; // What: Charged Value Set. Why: A new ease-down item starts fully charged, same as every other item in that mode. How: This reads curPicObj's own threshold, defaulting to 100.

				const perWeiArr = sibIteArr.map( ( curIteObj ) => curIteObj.weight ?? 1 ).filter( ( curWeiNum ) => curWeiNum > 0 ); // What: Peer Weight Array. Why: The average below must exclude the weight-0 active item, so a fresh streak's own zero can't drag the newcomer down. How: This maps sibIteArr to its own weights (defaulting 1), then drops any that are 0 or below.

				weiValNum = perWeiArr.length // What: Fairness Weight Average. Why: A brand-new item should join the rotation at roughly its peers' own average standing, not always at 1. How: This averages perWeiArr, rounds, and floors at 1, else falls back to 1 when there are no peers yet.
					? Math.max( 1, Math.round( perWeiArr.reduce( ( sumValNum, curValNum ) => sumValNum + curValNum, 0 ) / perWeiArr.length ) ) // What: Peer Average Branch. Why: Existing peers give a fair starting weight. How: This averages the peers' weights, rounded and floored at 1.
					: 1; // What: No Peers Branch. Why: A first item has no peers to average. How: This starts it at weight 1.


			}



			const newIteObj = { // What: New Item Object. Why: This is the actual item being added, in state.items' own shape. How: This bundles a fresh id, the de-duplicated name, pickerId, the resolved weight/value, and (for ease modes) a fresh drift band.


				id         : optIdeStr || ( 'it_' + Math.random().toString( 36 ).slice( 2, 8 ) ),      // What: Id. Why: Every item needs a stable id. How: This uses optIdeStr when given, else mints a random 'it_' id.
				lastPicked : null,                                                                     // What: Last Picked. Why: A brand-new item has never been picked. How: This is null.
				name       : uniNamFun( newNamStr, sibIteArr.map( ( curIteObj ) => curIteObj.name ) ), // What: Name. Why: Two items in the same picker can't share a name. How: This de-duplicates newNamStr against every sibling item's own name via uniNamFun.
				pickerId   : picIdeStr,                                                                // What: Picker Id. Why: Every item belongs to exactly one picker. How: This is picIdeStr.
				picks      : 0,                                                                        // What: Picks. Why: A brand-new item has never been picked. How: This is 0.
				vacation   : false,                                                                    // What: Vacation. Why: A brand-new item starts active. How: This is false.
				value      : iniValNum,                                                                // What: Value. Why: Ease Down items start fully charged while every other mode starts empty. How: This is iniValNum, resolved above.
				weight     : weiValNum,                                                                // What: Weight. Why: Ease Down items join at their peers' average weight while every other mode starts at 1. How: This is weiValNum, resolved above.

				...( isaEasBoo ? PIC_NAM_OBJ.aveEasFun( sibIteArr, picIdeStr ) : {} ) // What: Drift Band Spread. Why: An ease-mode item needs its own drift band stamped at creation, matching this picker's current average. How: This spreads PIC_NAM_OBJ.aveEasFun's easeMin/easeMax only when isaEasBoo is true.


			};



			return { // What: Next State Return. Why: A newly-added item is prepended to the global items array. How: This spreads curStaObj with items rebuilt as newIteObj first, then everything else.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the items override below.

				items : [ newIteObj, ...curStaObj.items ] // What: Items. Why: A newly-added item goes to the front of the global items array. How: This puts newIteObj first, then every existing item.


			};


		} ),

		// #endregion addIteFun



		// #region delIteFun

		/**
		 * delIteFun = Delete Item Function
		 *
		 * @summary
		 * Deletes an item along with every trace of it on Today: the entries
		 * pointing at it, today's own live log rows for it, and any picker's
		 * activeItemId pointer at it, then reconciles the streak as a removal
		 * would. Historical log rows are kept, so Stats still counts past picks.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param tarIdeStr - Target Identifier String: The item to delete.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * delIteFun(tarIdeStr) // => void
		 * ```
		 *
		*/

		delIteFun : ( tarIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Delete Item Function. Why: Deleting an item must also drop today's own entries pointing at it (keeping the ring/group totals honest), reconcile the streak as a removal would, drop today's own live log rows for it (keeping historical rows for Stats survivability), and clear any picker's own activeItemId pointer at it. How: See the inline comments below for each step.


			const nexIteArr = curStaObj.items.filter( ( curIteObj ) => curIteObj.id !== tarIdeStr );                       // What: Next Item Array. Why: The removed item must actually be gone from state.items. How: This filters out the one matching tarIdeStr.
			const nexEntArr = ( curStaObj.today.entries || [] ).filter( ( curEntObj ) => curEntObj.itemId !== tarIdeStr ); // What: Next Entry Array. Why: A removed item can no longer have a live Today entry pointing at it. How: This filters out every entry whose own itemId matches tarIdeStr.

			const curDayStr = isoDayFun(); // What: Current Day String. Why: The pick-log purge below only drops TODAY's own rows, keeping history intact. How: This reads isoDayFun().
			const nexLogArr = ( curStaObj.pickLog || [] ).filter( ( curRowObj ) => !( curRowObj.itemId === tarIdeStr && curRowObj.date === curDayStr ) ); // What: Next Pick-Log Array. Why: Only today's own live rows for this item are dropped; historical rows survive (their own denormalized name preserves past stats, like reminderLog does). How: This filters out rows matching both tarIdeStr and curDayStr.

			const { stkClaBoo, stkValNum } = stkSynFun( curStaObj, nexEntArr, curStaObj.tasks ); // What: Streak Reconcile. Why: Removing an item can drop entries off today, which can flip whether today counts as fully done. How: This calls stkSynFun against the already-filtered entries.

			const nexPicArr = curStaObj.pickers.map( ( curPicObj ) => curPicObj.activeItemId === tarIdeStr ? { ...curPicObj, activeItemId : null } : curPicObj ); // What: Next Picker Array. Why: A removed item that was some ease-down picker's own in-progress item must no longer be pointed at. How: This nulls activeItemId on any picker that was pointing at tarIdeStr.



			return { // What: Next State Return. Why: Every affected field must land together on one fresh state. How: This spreads curStaObj with items/pickers/streak/pickLog/today all replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				items   : nexIteArr,                                                             // What: Items. Why: The removed item must be gone. How: This is nexIteArr.
				pickers : nexPicArr,                                                             // What: Pickers. Why: A nulled activeItemId must land here. How: This is nexPicArr.
				pickLog : nexLogArr,                                                             // What: Pick Log. Why: Today's own live rows for the removed item must be gone. How: This is nexLogArr.
				streak  : stkValNum,                                                             // What: Streak. Why: The persisted streak count must reflect the reconciled verdict. How: This is stkValNum, from stkSynFun.
				today   : { ...curStaObj.today, entries : nexEntArr, streakClaimed : stkClaBoo } // What: Today. Why: Today's own entries and claimed flag must both reflect this change. How: This spreads curStaObj.today with entries replaced and streakClaimed set to stkClaBoo.


			};


		} ),

		// #endregion delIteFun



		movIteFun : ( tarIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Move Item Function. Why: The Pickers-tab add flow renders a picker's own items in array order, so this lands a just-saved item at the bottom of that picker's own list. How: This moves the one matching item to the end of the global items array.


			const tarIteObj = curStaObj.items.find( ( iteFinObj ) => iteFinObj.id === tarIdeStr ); // What: Target Item Object And Guard. Why: A stale tarIdeStr must be a no-op rather than silently dropping the item. How: This looks up tarIdeStr in curStaObj.items.


			if ( !tarIteObj ) return curStaObj; // What: Missing-Item Guard. Why: There's nothing to move when tarIteObj wasn't found. How: This returns curStaObj unchanged.



			return { // What: Next State Return. Why: The caller needs tarIteObj moved to the end of the items array. How: This spreads curStaObj with items rebuilt as everything else, then tarIteObj last.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				items : [ ...curStaObj.items.filter( ( iteFilObj ) => iteFilObj.id !== tarIdeStr ), tarIteObj ] // What: Items. Why: The item must land at the very end of the array. How: This rebuilds items as every other item, then tarIteObj.


			};


		} ),



		// #region renIteFun

		/**
		 * renIteFun = Rename Item Function
		 *
		 * @summary
		 * Commits an item rename (on blur, Enter or Save, never per keystroke).
		 * The name is de-duplicated against the item's own siblings in the same
		 * picker, so the saved name can differ from what was typed, e.g. gaining
		 * a " (2)" suffix.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param tarIdeStr - Target Identifier String: The item to rename.
		 * @param newNamStr - New Name String: The name as typed.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * renIteFun(tarIdeStr, newNamStr) // => void
		 * ```
		 *
		*/

		renIteFun : ( tarIdeStr, newNamStr ) => setAppStaObj( ( curStaObj ) => { // What: Rename Item Function. Why: Commit-time rename (blur/Enter/Save only, not every keystroke) with de-duplication, so 2 items in the same picker can't share a name. How: This resolves a unique name against the item's own sibling item names, then writes it onto the one matching item.


			const tarIteObj = curStaObj.items.find( ( iteFinObj ) => iteFinObj.id === tarIdeStr ); // What: Target Item Object And Guard. Why: The sibling filter below needs to know this item's own pickerId to scope the collision check correctly. How: This looks up tarIdeStr in curStaObj.items.

			const sibNamArr = curStaObj.items.filter( ( iteFilObj ) => iteFilObj.pickerId === ( tarIteObj && tarIteObj.pickerId ) && iteFilObj.id !== tarIdeStr ).map( ( iteFilObj ) => iteFilObj.name ); // What: Sibling Name Array. Why: A name only needs to be unique among items owned by the SAME picker, excluding the item being renamed itself. How: This filters curStaObj.items to same-picker siblings, then maps to their own names.

			const uniNamStr = uniNamFun( newNamStr, sibNamArr ); // What: Unique Name String. Why: The write below needs the actual de-duplicated name to apply. How: This calls uniNamFun with newNamStr and sibNamArr.



			return { // What: Next State Return. Why: The caller needs the one matching item's own name replaced. How: This spreads curStaObj with items rebuilt, patching only the one matching item.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				items : curStaObj.items.map( ( curIteObj ) => curIteObj.id === tarIdeStr ? { ...curIteObj, name : uniNamStr } : curIteObj ) // What: Items. Why: Only the one matching item's own name changes. How: This writes uniNamStr as name on the item matching tarIdeStr.


			};


		} ),

		// #endregion renIteFun



		revIteFun : ( tarIdeStr, snaIteObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Revert Item Function. Why: This is the full-replace path used to revert an item to a snapshot on editor Cancel. How: This overwrites the one matching item entirely with snaIteObj.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			items : curStaObj.items.map( ( curIteObj ) => curIteObj.id === tarIdeStr ? { ...snaIteObj } : curIteObj ) // What: Items. Why: Only the one matching item is restored. How: This replaces the item matching tarIdeStr with a copy of snaIteObj.


		} ) ),



		setWeiFun : ( tarIdeStr, weiValNum ) => setAppStaObj( ( curStaObj ) => ( { // What: Set Weight Function. Why: A direct weight override (Data tab) needs to patch just this one field on one item. How: This maps items, setting weight to weiValNum on the one matching tarIdeStr.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			items : curStaObj.items.map( ( curIteObj ) => curIteObj.id === tarIdeStr ? { ...curIteObj, weight : weiValNum } : curIteObj ) // What: Items. Why: Only the one matching item's own weight changes. How: This maps items, writing weiValNum as weight on the item matching tarIdeStr.


		} ) ),



		// #region togVacFun

		/**
		 * togVacFun = Toggle Vacation Function
		 *
		 * @summary
		 * Flips one item's own vacation flag, or (tarKinStr:'picker') every item
		 * owned by a picker at once. When an in-progress Ease Down item
		 * (its own picker's activeItemId) is marked inactive, that streak
		 * is abandoned: the picker's activeItemId is nulled and the item
		 * recharges to full, since an abandoned streak never reached 0 and
		 * so must never count toward Spent.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param tarIdeStr - Target Identifier String: The item or picker to toggle.
		 * @param tarKinStr - Target Kind String: 'item' for one item, or anything
		 *                    else for every item the picker owns.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * togVacFun(tarIdeStr, 'item') // => void
		 * ```
		 *
		*/

		togVacFun : ( tarIdeStr, tarKinStr ) => setAppStaObj( ( curStaObj ) => { // What: Toggle Vacation Function. Why: Marking one item, or every item a picker owns, inactive must also abandon any in-progress Ease Down streak and log the transition for Stats. How: This branches on tarKinStr ('item' or 'picker'), flips the matching vacation flag(s), runs abaStkFun when going inactive, and appends vacationLog rows.


			const curDayStr = isoDayFun(); // What: Current Day String. Why: Every vacationLog row below is stamped with today's own calendar day. How: This reads isoDayFun().


			const abaStkFun = ( picArgArr, iteArgArr, iteIdeArr ) => { // What: Abandon Streak Function. Why: Both branches below (single item, whole picker) share this same abandon-in-progress-streak logic. How: This walks iteIdeArr, and for any item that's some ease-down picker's own activeItemId, nulls that pointer and recharges the item to full.


				let nexPicArr = picArgArr; // What: Next Picker Array. Why: The loop below folds its own patch onto this on each iteration that actually finds a match. How: This starts at picArgArr, the caller's own current pickers.
				let nexIteArr = iteArgArr; // What: Next Item Array. Why: The loop below folds its own patch onto this on each iteration that actually finds a match. How: This starts at iteArgArr, the caller's own current items.


				for ( const cuiIdeStr of iteIdeArr ) { // What: Abandon Loop. Why: Every touched item id must be checked for whether it's currently some ease-down picker's own in-progress item. How: This iterates iteIdeArr, patching nexPicArr/nexIteArr only for a genuine match.


					const curPicObj = nexPicArr.find( ( picFinObj ) => picFinObj.mode === 'ease-down' && picFinObj.activeItemId === cuiIdeStr ); // What: Current Picker Object And Guard. Why: Only an ease-down picker currently working down exactly this item needs anything abandoned. How: This looks for a picker whose own mode is 'ease-down' and activeItemId matches cuiIdeStr.


					if ( !curPicObj ) continue; // What: No-Match Skip Guard. Why: An item not currently in progress for any picker needs nothing abandoned. How: This skips to the next id when curPicObj wasn't found.



					const thrValNum = curPicObj.threshold ?? 100; // What: Threshold Value Number. Why: An abandoned item must recharge back to this exact threshold, as if it were never touched. How: This reads curPicObj's own threshold, defaulting to 100.

					nexPicArr = nexPicArr.map( ( picMapObj ) => picMapObj.id === curPicObj.id ? { ...picMapObj, activeItemId : null } : picMapObj ); // What: Picker Pointer Null. Why: The abandoned picker must no longer point at this item as its own in-progress one. How: This nulls activeItemId on the one matching picker.
					nexIteArr = nexIteArr.map( ( iteMapObj ) => iteMapObj.id === cuiIdeStr ? { ...iteMapObj, value : thrValNum } : iteMapObj );      // What: Item Recharge. Why: An abandoned streak must recharge to full, never counting toward Spent. How: This sets the one matching item's own value to thrValNum.


				}



				return { items : nexIteArr, pickers : nexPicArr }; // What: Abandon Result Return. Why: The caller needs both patched arrays back together. How: This bundles nexPicArr/nexIteArr.


			};


			if ( tarKinStr === 'item' ) { // What: Single-Item Branch. Why: Toggling one item's own vacation flag is a narrower case than the whole-picker branch below. How: This flips tarIdeStr's own vacation flag, abandons its own in-progress streak if it just went inactive, and logs the transition.


				const curIteObj = curStaObj.items.find( ( iteFinObj ) => iteFinObj.id === tarIdeStr ); // What: Current Item Object And Guard. Why: The vacationLog row below needs to know the item's own vacation state BEFORE this toggle. How: This looks up tarIdeStr in curStaObj.items.
				const nexVacBoo = curIteObj ? !curIteObj.vacation : true;                              // What: Next Vacation Boolean. Why: The vacationLog row records whether the item just went ON (inactive) or OFF (active again). How: This is curIteObj's own negated vacation flag, else true when curIteObj is somehow missing.

				let nexIteArr = curStaObj.items.map( ( iteMapObj ) => iteMapObj.id === tarIdeStr ? { ...iteMapObj, vacation : !iteMapObj.vacation } : iteMapObj ); // What: Next Item Array. Why: Only the one matching item's own vacation flag actually flips. How: This maps curStaObj.items, negating vacation on the one matching item.
				let nexPicArr = curStaObj.pickers; // What: Next Picker Array. Why: This only changes below when the item just went inactive and needs its own in-progress streak abandoned. How: This starts at curStaObj's own current pickers.


				if ( nexVacBoo ) ( { items : nexIteArr, pickers : nexPicArr } = abaStkFun( nexPicArr, nexIteArr, [ tarIdeStr ] ) ); // What: Abandon Streak Call Guard. Why: Only going INTO vacation (not coming back out of it) can abandon an in-progress streak. How: This calls abaStkFun and destructures its own result back onto nexPicArr/nexIteArr, only when nexVacBoo is true.



				return { // What: Single-Item Return. Why: The caller needs the patched arrays plus a fresh vacationLog row recording this exact transition. How: This spreads curStaObj with items/pickers replaced and appends one row to vacationLog.


					...curStaObj, // What: Current State Spread. Why: Every field this branch doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

					items   : nexIteArr, // What: Items. Why: The one toggled item's own new vacation flag (and any recharge) must land in state. How: This is nexIteArr.
					pickers : nexPicArr, // What: Pickers. Why: An abandoned streak's own nulled activeItemId must land in state. How: This is nexPicArr.

					vacationLog : [ ...( curStaObj.vacationLog || [] ), { date : curDayStr, itemId : tarIdeStr, on : nexVacBoo } ] // What: Vacation Log. Why: Stats needs a row recording exactly when this item went inactive or came back. How: This appends one row for tarIdeStr to the existing log.


				};


			}



			const ownIteArr = curStaObj.items.filter( ( curIteObj ) => curIteObj.pickerId === tarIdeStr );     // What: Owned Item Array. Why: The whole-picker branch needs every item this picker actually owns. How: This filters curStaObj.items to those whose own pickerId matches tarIdeStr.
			const nexVacBoo = !( ownIteArr.length && ownIteArr.every( ( curIteObj ) => curIteObj.vacation ) ); // What: Next Vacation Boolean. Why: A picker's own toggle flips to the OPPOSITE of "every owned item is already inactive" (so a mixed state turns everything ON first). How: This negates whether ownIteArr is non-empty and every item in it is already vacation:true.
			const chaIteArr = ownIteArr.filter( ( curIteObj ) => curIteObj.vacation !== nexVacBoo );           // What: Changed Item Array. Why: Only an item whose own vacation flag actually differs from nexVacBoo needs a vacationLog row of its own. How: This filters ownIteArr to items whose own vacation doesn't already match nexVacBoo.

			let nexIteArr = curStaObj.items.map( ( curIteObj ) => curIteObj.pickerId === tarIdeStr ? { ...curIteObj, vacation : nexVacBoo } : curIteObj ); // What: Next Item Array. Why: Every item owned by this picker gets the same new vacation state. How: This maps curStaObj.items, setting vacation:nexVacBoo on every item owned by tarIdeStr.
			let nexPicArr = curStaObj.pickers; // What: Next Picker Array. Why: This only changes below when the picker's own items just went inactive and need their own in-progress streaks abandoned. How: This starts at curStaObj's own current pickers.


			if ( nexVacBoo ) ( { items : nexIteArr, pickers : nexPicArr } = abaStkFun( nexPicArr, nexIteArr, chaIteArr.map( ( curIteObj ) => curIteObj.id ) ) ); // What: Abandon Streak Call Guard. Why: Only going INTO vacation can abandon an in-progress streak, same reasoning as the single-item branch above. How: This calls abaStkFun (over just the CHANGED items) and destructures its own result, only when nexVacBoo is true.



			return { // What: Whole-Picker Return. Why: The caller needs the patched arrays plus one fresh vacationLog row per actually-changed item. How: This spreads curStaObj with items/pickers replaced and appends chaIteArr's own rows to vacationLog.


				...curStaObj, // What: Current State Spread. Why: Every field this branch doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				items   : nexIteArr, // What: Items. Why: Every owned item's own new vacation flag (and any recharge) must land in state. How: This is nexIteArr.
				pickers : nexPicArr, // What: Pickers. Why: Any abandoned streak's own nulled activeItemId must land in state. How: This is nexPicArr.

				vacationLog : [ ...( curStaObj.vacationLog || [] ), ...chaIteArr.map( ( curIteObj ) => ( { date : curDayStr, itemId : curIteObj.id, on : nexVacBoo } ) ) ] // What: Vacation Log. Why: Stats needs one row per item whose own state actually changed. How: This appends one row per chaIteArr entry to the existing log.


			};


		} ),

		// #endregion togVacFun



		// #region updIteFun

		/**
		 * updIteFun = Update Item Function
		 *
		 * @summary
		 * The general per-item field patch (Fill, Refill, Reset boost, editor
		 * saves). When the patch touches value, it also strips any stale pending
		 * update for this item from every other Today entry, since completing
		 * one of those entries later would otherwise silently overwrite the
		 * value just set.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param tarIdeStr - Target Identifier String: The item to patch.
		 * @param patValObj - Patch Value Object: The fields to merge onto the item.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * updIteFun(tarIdeStr, patValObj) // => void
		 * ```
		 *
		*/

		updIteFun : ( tarIdeStr, patValObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Update Item Function. Why: This is the general per-item field patch (Fill/Refill/Reset boost, editor saves, ...), which must ALSO strip any stale pending mutation a direct value edit would otherwise be silently overwritten by later (see spuDroFun above). How: This merges patValObj onto the one matching item, and when patValObj touches value, also drops stale pending rows for tarIdeStr from every other Today entry.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			items : curStaObj.items.map( ( curIteObj ) => curIteObj.id === tarIdeStr ? { ...curIteObj, ...patValObj } : curIteObj ), // What: Items. Why: Only the one matching item gets patched. How: This merges patValObj onto the item matching tarIdeStr.

			...( 'value' in patValObj ? { // What: Stale-Pending Drop Spread. Why: A direct value edit would otherwise be silently overwritten later by a still-staged pending mutation on one of today's entries. How: This replaces today.entries with spuDroFun's output, stripping stale pending for tarIdeStr, only when patValObj sets value.


				today : { // What: Today. Why: Only today's own entries list changes here. How: This rebuilds today with its entries replaced.


					...curStaObj.today, // What: Current Today Spread. Why: Every other today field must carry over unchanged. How: This spreads curStaObj.today before the entries override below.

					entries : spuDroFun( curStaObj.today.entries, [ tarIdeStr ] ) // What: Entries. Why: Any stale pending mutation targeting this item must be stripped. How: This calls spuDroFun with today's entries and tarIdeStr.


				}


			} : {} )


		} ) ),

		// #endregion updIteFun

		// #endregion Items



		// #region Manual Reminders Subsystem

		/**
		 * addTasFun = Add Task Function
		 *
		 * @summary
		 * Statically-scheduled tasks shown atop Today, distinct from the
		 * randomly-picked items above. fields.replaceId updates THIS
		 * existing task in place (same id) instead of prepending a new
		 * one, mirroring addPicFun's own replaceId, used when a reminder
		 * mini-tour is replayed after already finishing once (see
		 * reminders.jsx's own commit(), which looks up the prior real task
		 * via createdFromSample).
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param tasArgObj - Task Argument Object: The reminder's fields; any field
		 *                    left out gets its default.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * addTasFun(tasArgObj) // => void
		 * ```
		 *
		*/



		addTasFun : ( tasArgObj ) => setAppStaObj( ( curStaObj ) => { // What: Add Task Function. Why: Hidden reminders (onboarding's own sample reminders, plus any real reminder still hidden pending the checklist's closing Generate step) are excluded from the sibling-name check, same policy as addPicFun's own uniNamFun call, otherwise the FIRST real reminder a tutorial ever creates would collide with its own still-hidden sample template. How: This builds a default task via TAS_NAM_OBJ.defTasFun, resolves tasArgObj.replaceId, de-duplicates its own name, then replaces or prepends it.


			const newTasObj = TAS_NAM_OBJ.defTasFun( tasArgObj );  // What: New Task Object. Why: TAS_NAM_OBJ itself owns the real default shape for a brand-new task. How: This calls TAS_NAM_OBJ.defTasFun with the given tasArgObj.
			const tasIdeStr = tasArgObj.replaceId || newTasObj.id; // What: Task Identifier String. Why: A replace keeps the existing id alive; a fresh add uses the one TAS_NAM_OBJ.defTasFun just minted. How: This prefers tasArgObj.replaceId, else newTasObj's own id.
			const finTasObj = { ...newTasObj, id : tasIdeStr };    // What: Final Task Object. Why: The task actually written must carry tasIdeStr, not necessarily newTasObj's own freshly-minted one. How: This spreads newTasObj with id overridden.

			const sibNamArr = curStaObj.tasks.filter( ( curTasObj ) => curTasObj.id !== tasIdeStr && !curTasObj.hidden ).map( ( curTasObj ) => curTasObj.name ); // What: Sibling Name Array. Why: The de-duplication below must exclude both this task itself and every hidden (invisible) reminder. How: This filters curStaObj.tasks down to visible siblings, then maps to their own names.
			const namTasObj = { ...finTasObj, name : uniNamFun( finTasObj.name, sibNamArr ) };                                                                   // What: Named Task Object. Why: The task actually written must carry its own de-duplicated name. How: This spreads finTasObj with name replaced by uniNamFun's own result.

			const nexTasArr = tasArgObj.replaceId // What: Next Task Array. Why: A replace updates the one matching task in place; a fresh add prepends the new one. How: This maps in namTasObj for the matching id when tasArgObj.replaceId was given, else prepends namTasObj.
				? curStaObj.tasks.map( ( curTasObj ) => curTasObj.id === tasIdeStr ? namTasObj : curTasObj ) // What: Replace Branch. Why: An existing task keeps its own place in the list. How: This swaps namTasObj in for the matching task.
				: [ namTasObj, ...curStaObj.tasks ];                                                         // What: Add Branch. Why: A brand-new task goes first in the list. How: This prepends namTasObj.



			return { ...curStaObj, tasks : nexTasArr }; // What: Next State Return. Why: The caller needs tasks replaced on a fresh state. How: This spreads curStaObj with tasks replaced by nexTasArr.


		} ),



		delTasFun : ( tarIdeStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Delete Task Function. Why: Deleting a reminder must actually drop it from state.tasks. How: This filters out the one matching tarIdeStr.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			tasks : curStaObj.tasks.filter( ( curTasObj ) => curTasObj.id !== tarIdeStr ) // What: Tasks. Why: The deleted reminder must actually be gone from state. How: This filters out the task matching tarIdeStr.


		} ) ),



		// #region renTasFun

		/**
		 * renTasFun = Rename Task Function
		 *
		 * @summary
		 * Commits a reminder rename (on blur, Enter or Save). The name is
		 * de-duplicated against every other reminder's own name, so the saved
		 * name can differ from what was typed.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param tarIdeStr - Target Identifier String: The reminder to rename.
		 * @param newNamStr - New Name String: The name as typed.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * renTasFun(tarIdeStr, newNamStr) // => void
		 * ```
		 *
		*/

		renTasFun : ( tarIdeStr, newNamStr ) => setAppStaObj( ( curStaObj ) => { // What: Rename Task Function. Why: Commit-time reminder rename (blur/Enter/Save only) with de-duplication. How: This resolves a unique name against every OTHER task's own name, then writes it onto the one matching task.


			const sibNamArr = curStaObj.tasks.filter( ( curTasObj ) => curTasObj.id !== tarIdeStr ).map( ( curTasObj ) => curTasObj.name ); // What: Sibling Name Array. Why: A reminder name only needs to be unique among every OTHER reminder. How: This filters curStaObj.tasks to every task but the one being renamed, then maps to their own names.
			const uniNamStr = uniNamFun( newNamStr, sibNamArr );                                                                            // What: Unique Name String. Why: The write below needs the actual de-duplicated name to apply. How: This calls uniNamFun with newNamStr and sibNamArr.



			return { // What: Next State Return. Why: The caller needs the one matching task's own name replaced. How: This spreads curStaObj with tasks rebuilt, patching only the one matching task.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				tasks : curStaObj.tasks.map( ( curTasObj ) => curTasObj.id === tarIdeStr ? { ...curTasObj, name : uniNamStr } : curTasObj ) // What: Tasks. Why: Only the one matching reminder's own name changes. How: This writes uniNamStr as name on the task matching tarIdeStr.


			};


		} ),

		// #endregion renTasFun



		revOptFun : ( optArgObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Revert Options Function. Why: This is the full-replace path used to revert the participation options on Controls Cancel. How: This overwrites reminderOpts entirely with a copy of optArgObj.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			reminderOpts : { ...optArgObj } // What: Reminder Options. Why: Cancel must restore the full snapshot of every participation switch. How: This copies optArgObj so later edits to the snapshot can't leak in.


		} ) ),



		revTasFun : ( tarIdeStr, snaTasObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Revert Task Function. Why: This is the full-replace path used to revert a reminder to a snapshot on editor Cancel. How: This overwrites the one matching task entirely with snaTasObj.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			tasks : curStaObj.tasks.map( ( curTasObj ) => curTasObj.id === tarIdeStr ? { ...snaTasObj } : curTasObj ) // What: Tasks. Why: Only the one matching task is restored. How: This replaces the task matching tarIdeStr with a copy of snaTasObj.


		} ) ),



		setOptFun : ( tasTypStr, optKeyStr, optValBoo ) => setAppStaObj( ( curStaObj ) => { // What: Set Option Function. Why: This flips one participation switch for a reminder type ('once' | 'recurring'), without callers re-specifying every other switch. How: This normalizes the current options, then merges one key onto the matching type's own sub-object.


			const norOptObj = TAS_NAM_OBJ.norOptFun( curStaObj.reminderOpts ); // What: Normalized Options Object. Why: A patch must be applied against the FULL, normalized switch set, never a possibly-partial raw one. How: This calls TAS_NAM_OBJ.norOptFun with curStaObj's own reminderOpts.



			return { // What: Next State Return. Why: The caller needs just this one switch flipped, every other one untouched. How: This spreads norOptObj, overriding [tasTypStr]'s own sub-object with [optKeyStr] replaced by value.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				reminderOpts : { // What: Reminder Options. Why: Only one switch of one reminder type changes, every other switch must survive. How: This rebuilds reminderOpts from the normalized full set plus the one patched type.


					...norOptObj, // What: Normalized Options Spread. Why: Every other reminder type's own switches must carry over unchanged. How: This spreads norOptObj before the one type override below.

					[ tasTypStr ] : { ...norOptObj[ tasTypStr ], [ optKeyStr ] : optValBoo } // What: Patched Type Options. Why: Only the one requested switch of this type flips. How: This spreads the type's own current switches, then writes optValBoo under optKeyStr.


				}


			};


		} ),



		// #region skiTasFun

		/**
		 * skiTasFun = Skip Task Function
		 *
		 * @summary
		 * Hides a reminder until its own next eligible day, which the caller
		 * computes from the reminder's rules. It never marks the reminder done
		 * or logs a completion, but it does append a skip row so Stats can tally
		 * skips per reminder.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param tarIdeStr - Target Identifier String: The reminder to skip.
		 * @param untIsoStr - Until Iso String: The next eligible day, as YYYY-MM-DD,
		 *                    computed by the caller.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * skiTasFun(tarIdeStr, untIsoStr) // => void
		 * ```
		 *
		*/

		skiTasFun : ( tarIdeStr, untIsoStr ) => setAppStaObj( ( curStaObj ) => { // What: Skip Task Function. Why: This hides a reminder until its own next eligible day (computed by the caller from the reminder's own rules), without marking it done or logging a completion, but DOES append a skip row so Stats can tally per-reminder skips. How: This writes skipUntil onto the matching task and appends one row to reminderSkipLog.


			const curTasObj = curStaObj.tasks.find( ( tasFinObj ) => tasFinObj.id === tarIdeStr ); // What: Current Task Object And Guard. Why: The skip row below needs this task's own name and recurrence type, when it still exists. How: This looks up tarIdeStr in curStaObj.tasks.

			const skiRowArr = curTasObj ? [ // What: Skip Row Array. Why: A stale tarIdeStr (already removed) must log no row at all. How: This builds one reminderSkipLog row when curTasObj was found, else stays empty.


				{ // What: Skip Row Object. Why: This is the one reminderSkipLog row recording this skip. How: This bundles the task's own id/name/type with a fresh row id and timestamp.


					name      : curTasObj.name,                                           // What: Name. Why: The skip row keeps the reminder's own name, denormalized so history survives a later rename or delete. How: This is curTasObj.name.
					rowId     : 'rs_' + Math.random().toString( 36 ).slice( 2, 9 ),       // What: Row Id. Why: Every log row needs its own unique id. How: This mints a random 'rs_' id.
					skippedAt : new Date().toISOString(),                                 // What: Skipped At. Why: Stats needs the exact moment of the skip. How: This stamps the current time as an ISO string.
					taskId    : tarIdeStr,                                                // What: Task Id. Why: The row must point back at the reminder it belongs to. How: This is tarIdeStr.
					type      : TAS_NAM_OBJ.isaReuFun( curTasObj ) ? 'recurring' : 'once' // What: Type. Why: Stats tallies skips separately for one-time and recurring reminders. How: This is 'recurring' when TAS_NAM_OBJ.isaReuFun says so, else 'once'.


				}


			] : [];



			return { // What: Next State Return. Why: The caller needs skipUntil written on the matching task, and the skip row (if any) appended to reminderSkipLog. How: This spreads curStaObj with tasks/reminderSkipLog both replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				reminderSkipLog : [ ...( curStaObj.reminderSkipLog || [] ), ...skiRowArr ],                                                                // What: Reminder Skip Log. Why: Stats needs a row for every skip. How: This appends skiRowArr (empty for a stale id) to the existing log.
				tasks           : curStaObj.tasks.map( ( tasMapObj ) => tasMapObj.id === tarIdeStr ? { ...tasMapObj, skipUntil : untIsoStr } : tasMapObj ) // What: Tasks. Why: The skipped reminder must stay hidden until its own next eligible day. How: This writes untIsoStr as skipUntil on the task matching tarIdeStr.


			};


		} ),

		// #endregion skiTasFun



		// #region togTasFun

		/**
		 * togTasFun = Toggle Task Function
		 *
		 * @summary
		 * Checks/un-checks today's own occurrence of a reminder. Completing
		 * stamps lastDone with today AND appends a row to the completion
		 * log; un-checking clears lastDone and voids today's own log row
		 * for that reminder. Either way the streak is reconciled, since
		 * reminders count toward the daily streak per their own type's
		 * switch, but the Stats log itself is kept regardless of the
		 * Stats toggle. Stamped against the generator's own day
		 * (TAS_NAM_OBJ.ancDatFun), not live real time, since Today's own reminders
		 * list is itself pinned to the last generation, so "done" must
		 * agree with whatever day that list is currently showing.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param tarIdeStr - Target Identifier String: The reminder to check or
		 *                    uncheck.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * togTasFun(tarIdeStr) // => void
		 * ```
		 *
		*/

		togTasFun : ( tarIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Toggle Task Function. Why: Checking a reminder off (or back on) must update its own done state, the completion log, and the streak together. How: This stamps or clears lastDone against the generator's anchor day, appends or voids today's log row, and reconciles the streak via stkSynFun.


			const curTasObj = curStaObj.tasks.find( ( tasFinObj ) => tasFinObj.id === tarIdeStr ); // What: Current Task Object And Guard. Why: A stale tarIdeStr (already removed) must be a no-op. How: This looks up tarIdeStr in curStaObj.tasks.


			if ( !curTasObj ) return curStaObj; // What: Missing-Task Guard. Why: There's nothing to toggle when curTasObj wasn't found. How: This returns curStaObj unchanged.



			const curAncObj = TAS_NAM_OBJ.ancDatFun( curStaObj.today && curStaObj.today.generatedAt ); // What: Current Anchor Object. Why: Every day-comparison below must be pinned to the last generation's own day, not live "now". How: This calls TAS_NAM_OBJ.ancDatFun with today's own generatedAt.
			const curDayStr = isoDayFun( curAncObj );                                      // What: Current Day String. Why: Both the lastDone stamp and the completion-log row below need this exact ISO day. How: This calls isoDayFun with curAncObj.
			const wasDonBoo = TAS_NAM_OBJ.isaDonFun( curTasObj, curAncObj );                           // What: Was Done Boolean. Why: Every branch below depends on which direction this toggle is heading. How: This calls TAS_NAM_OBJ.isaDonFun with curTasObj and curAncObj.

			const nexTasArr = curStaObj.tasks.map( ( tasMapObj ) => // What: Next Task Array. Why: Only the toggled task's own lastDone actually changes. How: This maps curStaObj.tasks, setting lastDone to null (un-checking) or curDayStr (completing) on the one matching task.
				tasMapObj.id === tarIdeStr ? { ...tasMapObj, lastDone : wasDonBoo ? null : curDayStr } : tasMapObj ); // What: Toggled Task Patch. Why: Only the toggled task changes. How: This clears lastDone when un-checking, sets it to today when checking, and passes every other task through.

			let nexLogArr = curStaObj.reminderLog || []; // What: Next Reminder-Log Array. Why: Both branches below patch this same array, one way or the other. How: This starts at curStaObj's own current reminderLog.


			if ( wasDonBoo ) { // What: Un-Check Branch. Why: Un-checking must void today's own completion row for this reminder. How: This filters out the one row matching taskId and curDayStr.


				nexLogArr = nexLogArr.filter( ( curRowObj ) => // What: Completion Row Void. Why: Un-checking means today's own completion never happened. How: This drops the row whose taskId matches tarIdeStr and whose completedAt falls on curDayStr.
					!( curRowObj.taskId === tarIdeStr && isoDayFun( new Date( curRowObj.completedAt ) ) === curDayStr ) ); // What: Today Completion Test. Why: Only today's own completion of this task is voided. How: This keeps every row except the one for tarIdeStr completed today.


			}

			else { // What: Complete Branch. Why: Completing must append a fresh completion row for this reminder. How: This appends one row shaped to state.reminderLog's own contract.


				nexLogArr = [ // What: Completion Row Append. Why: Completing must add a fresh completion row for this reminder. How: This rebuilds the log as every existing row plus one new row.


					...nexLogArr, // What: Existing Rows Spread. Why: Every earlier completion row must survive. How: This spreads the current nexLogArr first.

					{ // What: Completion Row Object. Why: This is the one reminderLog row recording this completion. How: This bundles the task's own id/name/type with a fresh row id and timestamp.


						completedAt : new Date().toISOString(),                                 // What: Completed At. Why: Stats needs the exact moment of the completion. How: This stamps the current time as an ISO string.
						name        : curTasObj.name,                                           // What: Name. Why: The row keeps the reminder's own name, denormalized so history survives a later rename or delete. How: This is curTasObj.name.
						rowId       : 'rl_' + Math.random().toString( 36 ).slice( 2, 9 ),       // What: Row Id. Why: Every log row needs its own unique id. How: This mints a random 'rl_' id.
						taskId      : tarIdeStr,                                                // What: Task Id. Why: The row must point back at the reminder it belongs to. How: This is tarIdeStr.
						type        : TAS_NAM_OBJ.isaReuFun( curTasObj ) ? 'recurring' : 'once' // What: Type. Why: Stats tallies completions separately for one-time and recurring reminders. How: This is 'recurring' when TAS_NAM_OBJ.isaReuFun says so, else 'once'.


					}


				];


			}



			const { stkClaBoo, stkValNum } = stkSynFun( curStaObj, curStaObj.today.entries, nexTasArr ); // What: Streak Reconcile. Why: Toggling a reminder can flip whether today counts as fully done. How: This calls stkSynFun against curStaObj's own current entries and the already-toggled nexTasArr.



			return { // What: Next State Return. Why: Every affected field must land together on one fresh state. How: This spreads curStaObj with streak/tasks/reminderLog/today all replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				reminderLog : nexLogArr,                                        // What: Reminder Log. Why: The toggle's own completion row must be recorded. How: This is nexLogArr.
				streak      : stkValNum,                                        // What: Streak. Why: The persisted streak count must reflect the reconciled verdict. How: This is stkValNum, from stkSynFun.
				tasks       : nexTasArr,                                        // What: Tasks. Why: The toggled reminder's own done state lands here. How: This is nexTasArr.
				today       : { ...curStaObj.today, streakClaimed : stkClaBoo } // What: Today. Why: Today's own claimed flag must reflect the reconciled verdict. How: This spreads curStaObj.today with streakClaimed set to stkClaBoo.


			};


		} ),

		// #endregion togTasFun



		updTasFun : ( tarIdeStr, patValObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Update Task Function. Why: Callers need to patch one existing task's own fields in place, without touching any other. How: This merges patValObj onto the one task whose own id matches tarIdeStr.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			tasks : curStaObj.tasks.map( ( curTasObj ) => curTasObj.id === tarIdeStr ? { ...curTasObj, ...patValObj } : curTasObj ) // What: Tasks. Why: Only the one matching task gets patched. How: This merges patValObj onto the task matching tarIdeStr.


		} ) ),

		// #endregion Manual Reminders Subsystem



		// #region Onboarding

		finCheFun : ( donValBoo = true ) => setAppStaObj( ( curStaObj ) => ( { // What: Finish Checklist Function. Why: This flips the instant the closing Generate card's own flow completes; every checklist card stops rendering the moment it's true. How: This writes donValBoo (defaulting to true) as checklistDone onto curStaObj.onboarding.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the onboarding override below.

			onboarding : { // What: Onboarding Override. Why: Only the checklistDone flag inside onboarding changes, every sibling onboarding field must survive. How: This rebuilds onboarding from its own current fields plus the new flag.


				...( curStaObj.onboarding || {} ), // What: Current Onboarding Spread. Why: Every other onboarding field must carry over unchanged. How: This spreads curStaObj.onboarding, defaulting to {} for state that predates it.

				checklistDone : donValBoo // What: Checklist Done. Why: This is the flag every checklist card checks before rendering. How: This is donValBoo.


			}


		} ) ),



		sedHisFun : ( { pickLog : picLogArr, reminderLog : remLogArr, reminderSkipLog : skiLogArr } ) => setAppStaObj( ( curStaObj ) => ( { // What: Seed History Function. Why: This merges precomputed, already-hydrated history rows into state, used only by the Welcome Tour's own onboarding seeding to backfill Stats for the sample pickers/reminders without computing about a year of rows live. How: This prepends pickLog/reminderLog/reminderSkipLog rows (each already in their own full row shape) onto whatever curStaObj already holds.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the log overrides below.

			pickLog         : [ ...( picLogArr || [] ), ...( curStaObj.pickLog || [] ) ],        // What: Pick Log. Why: The seeded pick history must sit ahead of any rows already logged. How: This puts picLogArr (defaulting to []) before the existing pickLog.
			reminderLog     : [ ...( remLogArr || [] ), ...( curStaObj.reminderLog || [] ) ],    // What: Reminder Log. Why: The seeded reminder completions must sit ahead of any already logged. How: This puts remLogArr (defaulting to []) before the existing reminderLog.
			reminderSkipLog : [ ...( skiLogArr || [] ), ...( curStaObj.reminderSkipLog || [] ) ] // What: Reminder Skip Log. Why: The seeded reminder skips must sit ahead of any already logged. How: This puts skiLogArr (defaulting to []) before the existing reminderSkipLog.


		} ) ),



		// #region setCarFun

		/**
		 * setCarFun = Set Card Function
		 *
		 * @summary
		 * Resolves (or un-resolves) one mini-tour checklist item (see
		 * onboarding-checklist.js). patValObj is {status:'finished'|
		 * 'skipped'|'cancelled', createdId?} to resolve it, or null to
		 * uncheck it back to pending (redo). Never touches the underlying
		 * sample picker/task; resolution is tracked here only, which is
		 * exactly what makes unchecking free. Also flags the exact moment
		 * reaGenFun flips false-to-true, for tab-today.jsx's own
		 * auto-scroll (see generateScrollPending's own migStaFun() comment
		 * for why this has to be captured HERE, the actual mutation
		 * point, rather than as a derived-value comparison inside
		 * TabTodCom itself, which may not even be mounted right now).
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param iteIdeStr - Item Identifier String: The checklist card to resolve
		 *                    or
		 *                    unresolve.
		 * @param patValObj - Patch Value Object: The value to resolve the card with,
		 *                    or null to unresolve it.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * setCarFun(iteIdeStr, patValObj) // => void
		 * ```
		 *
		*/

		setCarFun : ( iteIdeStr, patValObj ) => setAppStaObj( ( curStaObj ) => { // What: Set Card Function. Why: Every mini-tour launcher (picker, page and reminder tours, plus Today's own Skip button) needs to resolve or un-resolve its own checklist card without re-specifying the whole checklist. How: This patches or deletes iteIdeStr's own entry in onboarding.checklist, then flags generateScrollPending if readiness to generate just flipped on.


			const curCheObj = { ...( ( curStaObj.onboarding && curStaObj.onboarding.checklist ) || {} ) }; // What: Current Checklist Object. Why: The resolve/unresolve below must patch a COPY, never curStaObj.onboarding.checklist directly. How: This shallow-copies curStaObj's own onboarding.checklist, defaulting to {}.


			if ( patValObj ) curCheObj[ iteIdeStr ] = patValObj; // What: Resolve Branch. Why: A truthy patValObj resolves the item, giving it a real value. How: This writes patValObj onto curCheObj[iteIdeStr].

			else delete curCheObj[ iteIdeStr ]; // What: Unresolve Branch. Why: A falsy patValObj (null/undefined) unchecks the item back to pending. How: This deletes curCheObj[iteIdeStr] entirely.



			const nexStaObj = { // What: Next State Object. Why: The caller needs a fresh state with the patched checklist written on. How: This spreads curStaObj with onboarding's own checklist replaced by curCheObj.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the onboarding override below.

				onboarding : { // What: Onboarding Override. Why: Only the checklist map inside onboarding changes, every sibling onboarding field must survive. How: This rebuilds onboarding from its own current fields plus the patched checklist.


					...( curStaObj.onboarding || {} ), // What: Current Onboarding Spread. Why: Every other onboarding field (welcome/tour flags, appFeatures, ...) must carry over unchanged. How: This spreads curStaObj.onboarding, defaulting to {} for state that predates it.

					checklist : curCheObj // What: Checklist. Why: The resolve/unresolve above must land in state. How: This is curCheObj.


				}


			};


			if ( !ONB_CHE_OBJ.reaGenFun( curStaObj ) && ONB_CHE_OBJ.reaGenFun( nexStaObj ) ) { // What: Ready-To-Generate Edge Guard. Why: tab-today.jsx's own auto-scroll needs to know the EXACT moment readiness just flipped on, not merely that it's on now. How: This flags generateScrollPending only when curStaObj was not-yet-ready and nexStaObj now is.


				nexStaObj.onboarding.generateScrollPending = true; // What: Generate-Scroll-Pending Flag Set. Why: TabTodCom consumes (and clears) this the next time it renders with it true, per its own migStaFun() comment. How: This flips nexStaObj.onboarding.generateScrollPending to true.


			}



			return nexStaObj; // What: Next State Return. Why: The caller needs the fully-patched state. How: This returns nexStaObj, built above.


		} ),

		// #endregion setCarFun



		setFeaFun : ( iteIdeStr, patValObj ) => setAppStaObj( ( curStaObj ) => { // What: Set Feature Function. Why: App Features tutorials (see onboarding/app-features.jsx) resolve independently of the checklist, in their own separate map, for the same reasons documented on its own migStaFun() backfill. How: This mirrors setCarFun's own resolve/unresolve shape, but against onboarding.appFeatures instead.


			const appFeaObj = { ...( ( curStaObj.onboarding && curStaObj.onboarding.appFeatures ) || {} ) }; // What: App Features Object. Why: The resolve/unresolve below must patch a COPY, never curStaObj.onboarding.appFeatures directly. How: This shallow-copies curStaObj's own onboarding.appFeatures, defaulting to {}.


			if ( patValObj ) appFeaObj[ iteIdeStr ] = patValObj; // What: Resolve Branch. Why: A truthy patValObj resolves the item, giving it a real value. How: This writes patValObj onto appFeaObj[iteIdeStr].

			else delete appFeaObj[ iteIdeStr ]; // What: Unresolve Branch. Why: A falsy patValObj (null/undefined) unchecks the item back to pending. How: This deletes appFeaObj[iteIdeStr] entirely.



			return { // What: Next State Return. Why: The caller needs a fresh state with the patched appFeatures written on. How: This spreads curStaObj with onboarding's own appFeatures replaced by appFeaObj.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the onboarding override below.

				onboarding : { // What: Onboarding Override. Why: Only the appFeatures map inside onboarding changes, every sibling onboarding field must survive. How: This rebuilds onboarding from its own current fields plus the patched appFeatures.


					...( curStaObj.onboarding || {} ), // What: Current Onboarding Spread. Why: Every other onboarding field (checklist, welcome/tour flags, ...) must carry over unchanged. How: This spreads curStaObj.onboarding, defaulting to {} for state that predates it.

					appFeatures : appFeaObj // What: App Features. Why: The resolve/unresolve above must land in state. How: This is appFeaObj.


				}


			};


		} ),



		setOnbFun : ( patValObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Set Onboarding Function. Why: The welcome modal/mini-tour checklist need to flip individual flags without callers re-specifying the whole onboarding object. How: This merges patValObj onto curStaObj.onboarding, defaulting to {} when onboarding doesn't exist yet.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			onboarding : { // What: Onboarding. Why: Only the flags in patValObj change, every other onboarding field must survive. How: This rebuilds onboarding from its own current fields with patValObj merged on top.


				...( curStaObj.onboarding || {} ), // What: Current Onboarding Spread. Why: Every onboarding flag the patch doesn't mention must carry over unchanged. How: This spreads curStaObj.onboarding, defaulting to {} for state that predates it.
				...patValObj                       // What: Patch Spread. Why: The caller's own flags must override the current ones. How: This spreads patValObj last, so its keys win.


			}


		} ) ),

		// #endregion Onboarding



		// #region Pickers

		// #region addPicFun

		/**
		 * addPicFun = Add Picker Function
		 *
		 * @summary
		 * Creates a brand-new picker from the Add-Picker flow. Builds a
		 * fresh pool (Option B): each typed item becomes a new item owned
		 * by this picker via pickerId. For ease modes each item carries its
		 * OWN drift band; the picker-level easeMin/easeMax is just a
		 * fallback span. Initial drift value depends on mode: ease-down
		 * items start "charged" at the threshold, else 0. replaceId
		 * updates THIS existing picker in place (same id) instead of
		 * appending a new one, used when a picker mini-tour is replayed
		 * after already finishing once; keeping the id alive is what makes
		 * it "the same picker" rather than a renamed-on-collision
		 * duplicate, so Stats history/pick log/daily generator membership
		 * all keep pointing at it. Returns the new (or reused) picker id.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param picArgObj - Picker Argument Object: The new picker's fields, items
		 *                    and options.
		 *
		 * @returns The created (or replaced) picker's own id.
		 * @see {@link picIdeStr}
		 *
		 * @example
		 * ```ts
		 * addPicFun(picArgObj) // => picIdeStr
		 * ```
		 *
		*/

		addPicFun : ( picArgObj ) => { // What: Add Picker Function. Why: The Add-Picker flow needs to create a whole picker, its own item pool, and any new conditional in one step. How: This normalizes the submitted fields, builds the picker and its items, attaches or creates its conditional, updates daily membership, and returns the new (or replaced) picker's id.


			try { // What: First-Picker Persistence Request Guard. Why: The first picker a user creates is the first data worth protecting from browser storage eviction, best asked for now rather than on a cold first load (where a denial would be sticky for the session). How: This calls PWA_NAM_OBJ.askFirFun only when this is genuinely the user's very first picker.


				const curLatObj = latStaRef.current; // What: Current Latest Object. Why: The check below needs the freshest state, not a possibly-stale closed-over one. How: This reads latStaRef's own current value.

				if ( PWA_NAM_OBJ && curLatObj && ( curLatObj.pickers || [] ).length === 0 ) PWA_NAM_OBJ.askFirFun(); // What: First-Picker Call Guard. Why: Only an account with zero existing pickers is about to create its own first one. How: This calls PWA_NAM_OBJ.askFirFun only when PWA_NAM_OBJ/curLatObj exist and curLatObj.pickers is empty.


			}

			catch ( errCauObj ) {} // What: Persistence-Request Failure Guard. Why: A failed permission request must never block picker creation itself. How: This swallows the error silently.



			const picIdeStr = picArgObj.replaceId || picArgObj.id || ( 'pkr_' + Math.random().toString( 36 ).slice( 2, 8 ) ); // What: Picker Id String. Why: An explicit id (onboarding's own sample pickers only, so their ids match the ones baked into precomputed Stats history) must win; every other caller gets a fresh random one. How: This prefers picArgObj.replaceId, then id, else mints a fresh 'pkr_' id.
			const iniValNum = picArgObj.mode === 'ease-down' ? 100 : 0;                                                       // What: Initial Value Number. Why: Every new item's own starting drift value depends on the picker's own mode. How: This is 100 for ease-down (starts "charged"), else 0.
			const isaEasBoo = picArgObj.mode === 'ease-up' || picArgObj.mode === 'ease-down';                                 // What: Is-An Ease Boolean. Why: Only an ease-mode item carries its own per-item drift band. How: This is true when mode is either ease-up or ease-down.
			const isaDowBoo = picArgObj.mode === 'ease-down';                                                                 // What: Is-A Down Boolean. Why: Only ease-down forces every item to a uniform starting weight of 1 regardless of any user-supplied weight. How: This is true only when mode is 'ease-down'.

			const newConObj = picArgObj.newConditional; // What: New Conditional Object. Why: The inline-conditional build below reads many of this one field's own properties. How: This reads picArgObj.newConditional, which is null/undefined when no inline conditional was authored.

			const newIteArr = ( picArgObj.items || [] ).map( ( curIteObj ) => ( { // What: New Item Array. Why: Every typed item in the create form becomes a real item object owned by this picker. How: This maps each raw item into state.items' own shape, honoring a form-set value/vacation and defaulting the rest per mode.


				id         : curIteObj.id || ( 'it_' + Math.random().toString( 36 ).slice( 2, 8 ) ), // What: Id. Why: Every item needs a stable id. How: This keeps curIteObj.id when given, else mints a random 'it_' id.
				lastPicked : null,                                                                   // What: Last Picked. Why: A brand-new item has never been picked. How: This is null.
				name       : curIteObj.name,                                                         // What: Name. Why: The item keeps whatever name was typed into the create form. How: This is curIteObj.name.
				pickerId   : picIdeStr,                                                              // What: Picker Id. Why: Every item belongs to exactly this picker. How: This is picIdeStr.
				picks      : 0,                                                                      // What: Picks. Why: A brand-new item has never been picked. How: This is 0.
				vacation   : !!curIteObj.vacation,                                                   // What: Vacation. Why: A form-set vacation flag must be honored. How: This coerces curIteObj.vacation to a real boolean.
				value      : curIteObj.value != null ? curIteObj.value : iniValNum,                  // What: Value Honor-Or-Default. Why: A value the create form already set (e.g. Fill/Refill charging an ease item to threshold) must be honored; otherwise the mode's own default applies. How: This uses curIteObj.value when it isn't null/undefined, else iniValNum.
				weight     : isaDowBoo ? 1 : ( curIteObj.weight || 1 ),                              // What: Weight. Why: Ease Down forces every item to a uniform starting weight while other modes honor a form-set one. How: This is 1 for ease-down, else curIteObj.weight defaulting to 1.

				...( isaEasBoo ? { // What: Drift Band Spread. Why: Only an ease-mode item carries its own per-item drift band. How: This adds easeMin/easeMax (defaulting to 7/14) only when isaEasBoo is true.


					easeMax : curIteObj.easeMax ?? 14, // What: Ease Max. Why: An ease-mode item needs the upper end of its own drift band. How: This reads curIteObj.easeMax, defaulting to 14.
					easeMin : curIteObj.easeMin ?? 7   // What: Ease Min. Why: An ease-mode item needs the lower end of its own drift band. How: This reads curIteObj.easeMin, defaulting to 7.


				} : {} )


			} ) );

			const madConObj = newConObj ? { // What: Made Conditional Object. Why: A brand-new inline conditional (authored inline in this same form) needs its own fresh id minted here so the picker below can attach to it. How: This builds a full conditional object from newConObj's own fields, mirroring addConFun's own defaults.


				active       : newConObj.active !== undefined ? newConObj.active : true,                                     // What: Active. Why: A new conditional is enabled unless the form says otherwise. How: This honors newConObj.active when given, else defaults to true.
				cardText     : newConObj.cardText || 'Day off',                                                              // What: Card Text. Why: The day-off card shown on Today needs its own display text. How: This reads newConObj.cardText, defaulting to 'Day off'.
				chargedToday : false,                                                                                        // What: Charged Today. Why: A brand-new conditional hasn't charged yet today, so its per-day charge guard starts clear. How: This is false.
				easeMax      : newConObj.easeMax ?? 14,                                                                      // What: Ease Max. Why: An ease-mode conditional needs the upper end of its own drift band. How: This reads newConObj.easeMax, defaulting to 14.
				easeMin      : newConObj.easeMin ?? 7,                                                                       // What: Ease Min. Why: An ease-mode conditional needs the lower end of its own drift band. How: This reads newConObj.easeMin, defaulting to 7.
				id           : 'cnd_' + Math.random().toString( 36 ).slice( 2, 8 ),                                          // What: Id. Why: The picker below attaches to this conditional by id, so it must exist before the picker is built. How: This mints a random 'cnd_' id.
				mode         : newConObj.mode || 'random',                                                                   // What: Mode. Why: The mode decides how this conditional rolls or charges each day. How: This reads newConObj.mode, defaulting to 'random'.
				name         : ( norConFun && norConFun( newConObj.name ) ) || newConObj.name || 'Conditional',              // What: Name. Why: The conditional needs a tidied display name. How: This title-cases newConObj.name via norConFun, falling back to the raw name, then 'Conditional'.
				oddsPct      : newConObj.oddsPct ?? 50,                                                                      // What: Odds Percent. Why: A probability-mode conditional needs its own daily firing odds. How: This reads newConObj.oddsPct, defaulting to 50.
				threshold    : newConObj.threshold ?? 100,                                                                   // What: Threshold. Why: An ease-mode conditional charges toward (or decays from) this value. How: This reads newConObj.threshold, defaulting to 100.
				triggered    : newConObj.triggered !== undefined ? newConObj.triggered : ( newConObj.mode === 'ease-down' ), // What: Triggered. Why: A new conditional starts firing only when it's ease-down, which starts charged. How: This honors newConObj.triggered when given, else defaults to whether mode is 'ease-down'.
				value        : newConObj.mode === 'ease-down' ? ( newConObj.threshold ?? 100 ) : ( newConObj.value ?? 0 ),   // What: Value. Why: Ease Down starts fully charged at its threshold while every other mode starts from its own given value. How: This is the threshold (default 100) for ease-down, else newConObj.value (default 0).
				weight       : newConObj.weight ?? 1                                                                         // What: Weight. Why: A weighted conditional needs its own draw weight. How: This reads newConObj.weight, defaulting to 1.


			} : null;

			const norCadObj = CAD_NAM_OBJ.norCadFun({ // What: Normalized Cadence Object. Why: The schedule resolve and the cadence spread below both need the same normalized cadence fields. How: This calls CAD_NAM_OBJ.norCadFun once with picArgObj's own 8 cadence fields, reused by both the daysOfWeek resolve and the cadence spread below.


				anchorDay   : picArgObj.anchorDay,   // What: Anchor Day. Why: A yearly cadence needs its own day of the month. How: This passes picArgObj.anchorDay through.
				anchorDom   : picArgObj.anchorDom,   // What: Anchor Dom. Why: A monthly cadence needs its own day of the month. How: This passes picArgObj.anchorDom through.
				anchorDow   : picArgObj.anchorDow,   // What: Anchor Dow. Why: A weekly cadence needs its own day of the week. How: This passes picArgObj.anchorDow through.
				anchorMonth : picArgObj.anchorMonth, // What: Anchor Month. Why: A yearly cadence needs its own month. How: This passes picArgObj.anchorMonth through.
				cadence     : picArgObj.cadence,     // What: Cadence. Why: This decides whether the picker surfaces daily, weekly, monthly, or yearly. How: This passes picArgObj.cadence through; norCadFun itself defaults a missing one to 'daily'.
				dateMode    : picArgObj.dateMode,    // What: Date Mode. Why: A monthly/yearly cadence can anchor on a date or an nth weekday. How: This passes picArgObj.dateMode through.
				nthOrdinal  : picArgObj.nthOrdinal,  // What: Nth Ordinal. Why: An nth-weekday anchor needs which occurrence (1st, 2nd, ...). How: This passes picArgObj.nthOrdinal through.
				nthWeekday  : picArgObj.nthWeekday   // What: Nth Weekday. Why: An nth-weekday anchor needs which weekday. How: This passes picArgObj.nthWeekday through.


			});

			const newPicObj = { // What: New Picker Object. Why: This is the actual picker being created (or, with replaceId, re-created in place). How: This bundles the given fields with schedule/gate/visibility defaults resolved below.


				avoidDuplicates : !!picArgObj.avoidDuplicates,                                    // What: Avoid-Duplicates Flag. Why: This excludes an item from this picker's own pool for the day if its name (case-insensitively) is already present elsewhere on today's list. How: This coerces picArgObj.avoidDuplicates to a real boolean; see pickers.js's own pick() for how it's applied.
				conditionalId   : madConObj ? madConObj.id : ( picArgObj.conditionalId || null ), // What: Conditional Id Resolve. Why: A freshly-made inline conditional wins over an explicitly-passed existing one. How: This prefers madConObj's own id, else picArgObj.conditionalId, else null.
				easeMax         : picArgObj.easeMax ?? 20,                                        // What: Ease Max. Why: The picker-level drift band is only a fallback span for its items. How: This reads picArgObj.easeMax, defaulting to 20.
				easeMin         : picArgObj.easeMin ?? 10,                                        // What: Ease Min. Why: The picker-level drift band is only a fallback span for its items. How: This reads picArgObj.easeMin, defaulting to 10.
				group           : picArgObj.group,                                                // What: Group. Why: The picker must land in the group chosen in the form. How: This is picArgObj.group.
				hidden          : picArgObj.hidden === undefined ? false : picArgObj.hidden,      // What: Hidden Flag. Why: tab-picker.jsx passes true while the mini-tour checklist is up (mirrors reminders.jsx's own startAdd) so a picker created during onboarding stays out of the real list until the closing Generate step. How: This copies picArgObj.hidden, defaulting to false when it was never given.
				id              : picIdeStr,                                                      // What: Id. Why: The picker keeps whichever id was resolved above (replaceId, a given id, or a fresh one). How: This is picIdeStr.
				mode            : picArgObj.mode,                                                 // What: Mode. Why: The mode decides which selection algorithm this picker uses. How: This is picArgObj.mode.
				name            : picArgObj.name,                                                 // What: Name. Why: This is the raw name; the de-duplicated one replaces it below, once state is available. How: This is picArgObj.name.
				skipHolidays    : !!picArgObj.skipHolidays,                                       // What: Skip Holidays. Why: The generator must know whether this picker sits out public holidays. How: This coerces picArgObj.skipHolidays to a real boolean.
				threshold       : 100,                                                            // What: Threshold. Why: Every new picker starts with the standard full-charge threshold. How: This is 100.

				daysOfWeek : CAD_NAM_OBJ.enfWeeFun({ // What: Daily-Generator Schedule. Why: Which weekdays this picker may run on must be resolved before the generator can use it. How: This calls CAD_NAM_OBJ.enfWeeFun over norCadObj plus an explicit daysOfWeek, defaulting to every day.


					...norCadObj, // What: Normalized Cadence Spread. Why: enfWeeFun needs the picker's own resolved cadence and anchor to force a weekly picker's anchor day into its days. How: This spreads norCadObj before the daysOfWeek override below.

					daysOfWeek : Array.isArray( picArgObj.daysOfWeek ) && picArgObj.daysOfWeek.length ? picArgObj.daysOfWeek : [ 0, 1, 2, 3, 4, 5, 6 ] // What: Days Of Week. Why: An empty or missing selection must mean every day, never no day. How: This uses picArgObj.daysOfWeek when it's a non-empty array, else all 7 days.


				} ),

				...norCadObj,                                                                                 // What: Normalized Cadence Spread. Why: The surfacing anchor and display unit must be resolved (and defaulted) the same way for every picker. How: This spreads norCadObj's own 8 cadence fields onto the picker.
				...( picArgObj.createdFromSample ? { createdFromSample : picArgObj.createdFromSample } : {} ) // What: Created-From-Sample Spread. Why: This links back to the sample template a mini-tour-created picker was built from (see onboarding-checklist.js); ignored everywhere else in the app. How: This spreads createdFromSample only when it was actually given.


			};


			setAppStaObj( ( curStaObj ) => { // What: State Update Call. Why: The name de-duplication and the replace-or-append writes all need the latest state. How: This runs an updater that finalizes the picker's name, then writes items/pickers/conditionals/daily together.


				// #region finNamStr

				/**
				 * finNamStr = Final Name String
				 *
				 * @summary
				 * Tidies and de-duplicates the picker name against existing,
				 * VISIBLE pickers only (same policy as items/reminders, but
				 * scoped globally since picker names are container-style
				 * identifiers shown across every tab). Hidden ones
				 * (onboarding's own sample pickers) are excluded: they're
				 * invisible reference data the user can't see or tell apart
				 * from, so a collision with something the user doesn't know
				 * exists shouldn't cost a real picker an ugly " (2)" suffix
				 * (seen concretely: the Picker mini-tour's own "Create
				 * Picker" step recreates a sample by name, e.g. "Daily
				 * Chores"). Excludes itself too, so a replaceId update
				 * keeping the same name never collides with its own prior
				 * name.
				 *
				 * Skipped entirely (name kept verbatim) when THIS call is
				 * (re)seeding a sample itself, i.e. id is one of onboarding's
				 * own fixed sample ids. A freshly (re)seeded sample starts
				 * out visible (hidden defaults false; the tour's own later
				 * step is what hides it), so if a real picker already
				 * happens to share its exact name, the dedup below would
				 * otherwise rename the SAMPLE before onboarding's own name-
				 * collision suppression (tab-today.jsx's groupEntries) ever
				 * runs, which compares against the sample's own exact,
				 * canonical name; that would silently defeat the
				 * suppression instead of triggering it, since the renamed
				 * sample would no longer match anything, so its own
				 * "already have one" tutorial card would keep offering
				 * itself.
				 *
				*/

				const finNamStr = ONB_SPI_ARR.includes( picArgObj.id ) ? ( norPicFun( picArgObj.name ) || picArgObj.name ) : uniNamFun( // What: Final Name String. Why: Onboarding sample pickers keep their exact names; every other picker needs a unique name. How: This tidies the name for a sample picker, else de-duplicates it against the other visible pickers.
					norPicFun( picArgObj.name ) || picArgObj.name,                                                                                      // What: Tidied Name Argument. Why: The de-duplication starts from the tidied name. How: This normalizes picArgObj.name, falling back to the raw name.
					curStaObj.pickers.filter( ( curPicObj ) => !curPicObj.hidden && curPicObj.id !== picIdeStr ).map( ( curPicObj ) => curPicObj.name ) // What: Sibling Names Argument. Why: The new name must not collide with another visible picker. How: This lists every other visible picker's own name.
				);

				// #endregion finNamStr



				const finPicObj = { ...newPicObj, name : finNamStr }; // What: Final Picker Object. Why: The picker actually written to state must carry the de-duplicated name, not the raw one. How: This spreads newPicObj with name replaced by finNamStr.

				const nexPidArr = ( picArgObj.includeInDaily === undefined ? true : picArgObj.includeInDaily ) // What: Next Picker-Ids Array. Why: picArgObj.includeInDaily (defaulting to true) decides whether this picker joins or leaves the Daily generator's own membership list. How: This adds picIdeStr when it's included and it isn't already present, else removes it.
					? ( curStaObj.daily.pickerIds.includes( picIdeStr ) ? curStaObj.daily.pickerIds : [ ...curStaObj.daily.pickerIds, picIdeStr ] ) // What: Include Branch. Why: The picker joins the Daily generator. How: This appends picIdeStr unless it's already listed.
					: curStaObj.daily.pickerIds.filter( ( curPidStr ) => curPidStr !== picIdeStr );                                                 // What: Exclude Branch. Why: The picker leaves the Daily generator. How: This filters picIdeStr out.



				return { // What: Next State Return. Why: The caller needs items/pickers/conditionals/daily all updated together, honoring picArgObj.replaceId's own "recreate but keep the id" semantics when given. How: This spreads curStaObj, replacing or appending each field depending on whether picArgObj.replaceId was given.


					...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

					conditionals : madConObj ? [ ...( curStaObj.conditionals || [] ), madConObj ] : ( curStaObj.conditionals || [] ), // What: Conditionals. Why: A freshly-made inline conditional must be saved alongside the picker that uses it. How: This appends madConObj when there is one, else keeps the existing list.
					daily        : { ...curStaObj.daily, pickerIds : nexPidArr },                                                     // What: Daily. Why: The picker's own daily-generator membership must be updated. How: This spreads curStaObj.daily with pickerIds replaced by nexPidArr.

					items : picArgObj.replaceId // What: Items Replace-Or-Append. Why: On a replace, the picker's own OLD items are dropped wholesale and rebuilt from this run's own payload, not merged with whatever was there before. How: This drops picArgObj.replaceId's own old items then appends newIteArr, or simply appends newIteArr when there's no picArgObj.replaceId.
						? [ ...curStaObj.items.filter( ( curIteObj ) => curIteObj.pickerId !== picArgObj.replaceId ), ...newIteArr ] // What: Replace Items Branch. Why: A replayed tour rebuilds its picker's items from scratch. How: This drops the old picker's items, then appends the new ones.
						: [ ...curStaObj.items, ...newIteArr ],                                                                      // What: Append Items Branch. Why: A fresh picker only adds items. How: This appends the new items.

					pickers : picArgObj.replaceId // What: Pickers Replace-Or-Append. Why: On a replace, the picker keeps its own slot and id instead of appearing twice. How: This swaps finPicObj in for the picker matching picArgObj.replaceId, or appends finPicObj when there's no replace.
						? curStaObj.pickers.map( ( curPicObj ) => curPicObj.id === picArgObj.replaceId ? finPicObj : curPicObj ) // What: Replace Picker Branch. Why: A replayed tour keeps its picker's slot and id. How: This swaps finPicObj in for the matching picker.
						: [ ...curStaObj.pickers, finPicObj ]                                                                    // What: Append Picker Branch. Why: A fresh picker goes at the end. How: This appends finPicObj.


				};


			} );



			return picIdeStr; // What: Picker Id Return. Why: The caller (the Add-Picker form) needs the new or reused picker's own id back. How: This returns picIdeStr, resolved above.


		},

		// #endregion addPicFun



		// #region delPicFun

		/**
		 * delPicFun = Delete Picker Function
		 *
		 * @summary
		 * Deletes a picker together with every item it owns, and unhooks it from
		 * the Daily generator and from Today. Only today's own live log rows are
		 * purged, so the picker's history stays in Stats.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param picIdeStr - Picker Identifier String: The picker to delete.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * delPicFun(picIdeStr) // => void
		 * ```
		 *
		*/

		delPicFun : ( picIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Delete Picker Function. Why: Deleting a picker must also delete every item it owns (items are tied to one picker), and unhook it from both the daily generator and today's list. How: This filters items/pickers/entries/pickerIds, and purges only today's own live pick-log rows (keeping history intact).


			const curDayStr = isoDayFun(); // What: Current Day String. Why: The pick-log purge below only drops TODAY's own rows, keeping history intact. How: This reads isoDayFun().



			return { // What: Next State Return. Why: Every field this picker touches must be cleaned up together. How: This spreads curStaObj, filtering items/pickers/daily.pickerIds/today.entries/pickLog.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				items   : curStaObj.items.filter( ( curIteObj ) => curIteObj.pickerId !== picIdeStr ),                                                  // What: Items. Why: Items belong to exactly one picker, so every item this picker owned goes with it. How: This filters out every item whose own pickerId matches picIdeStr.
				pickers : curStaObj.pickers.filter( ( curPicObj ) => curPicObj.id !== picIdeStr ),                                                      // What: Pickers. Why: The deleted picker must actually be gone from state. How: This filters out the picker matching picIdeStr.
				pickLog : ( curStaObj.pickLog || [] ).filter( ( curRowObj ) => !( curRowObj.pickerId === picIdeStr && curRowObj.date === curDayStr ) ), // What: Pick-Log Purge. Why: Historical rows are kept (denormalized survivability); only today's own live ones for this picker are dropped. How: This filters out rows matching both pickerId and curDayStr.

				daily : { // What: Daily. Why: The deleted picker must leave the daily generator's own membership list. How: This rebuilds daily with only its pickerIds replaced.


					...curStaObj.daily, // What: Current Daily Spread. Why: Every other daily setting (mode, run time, ...) must carry over unchanged. How: This spreads curStaObj.daily before the pickerIds override below.

					pickerIds : ( curStaObj.daily.pickerIds || [] ).filter( ( curPidStr ) => curPidStr !== picIdeStr ) // What: Picker Ids. Why: The deleted picker's id must not linger in the generator's list. How: This filters picIdeStr out of daily.pickerIds, defaulting to [].


				},

				today : { // What: Today. Why: The deleted picker's own entries must leave today's list. How: This rebuilds today with only its entries replaced.


					...curStaObj.today, // What: Current Today Spread. Why: Every other today field must carry over unchanged. How: This spreads curStaObj.today before the entries override below.

					entries : ( curStaObj.today.entries || [] ).filter( ( curEntObj ) => curEntObj.pickerId !== picIdeStr ) // What: Entries. Why: No Today entry may keep pointing at a deleted picker. How: This filters out every entry whose own pickerId matches picIdeStr, defaulting to [].


				}


			};


		} ),

		// #endregion delPicFun



		// #region filPicFun

		/**
		 * filPicFun = Fill Picker Function
		 *
		 * @summary
		 * Fill RAISES to the threshold; it must never pull a value down.
		 * Ease Up items keep charging past the threshold while they wait,
		 * and that overshoot is what orders them (highest value is picked
		 * first, and re-roll cycles highest-to-lowest); assigning the
		 * threshold flat-out would erase that ordering and reset every
		 * waiting item to a tie. Ease Down values only ever decay from the
		 * threshold, so the max() below is a no-op there. A full recharge
		 * also clears any in-progress ease-down item.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param picIdeStr - Picker Identifier String: The picker to fill.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * filPicFun(picIdeStr) // => void
		 * ```
		 *
		*/

		filPicFun : ( picIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Fill Picker Function. Why: The Fill/Refill button needs to bring every item in a picker back to full charge at once. How: This raises every owned item's value to at least the threshold (never lowering an Ease Up overshoot) and clears any in-progress ease-down item.


			const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === picIdeStr ); // What: Current Picker Object And Guard. Why: A stale picIdeStr (already removed) must be a no-op. How: This looks up picIdeStr in curStaObj.pickers.


			if ( !curPicObj ) return curStaObj; // What: Missing-Picker Guard. Why: There's nothing to refill when curPicObj wasn't found. How: This returns curStaObj unchanged.



			const thrValNum = curPicObj.threshold ?? 100; // What: Threshold Value Number. Why: Every owned item's own value below must be raised to (at least) this exact number. How: This reads curPicObj's own threshold, defaulting to 100.



			return { // What: Next State Return. Why: The caller needs every owned item's own value raised (never lowered), and any in-progress ease-down item cleared. How: This spreads curStaObj with items/pickers replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				items   : curStaObj.items.map( ( curIteObj ) => curIteObj.pickerId === picIdeStr ? { ...curIteObj, value : Math.max( curIteObj.value ?? 0, thrValNum ) } : curIteObj ), // What: Items. Why: Every owned item must be raised to full charge, but an Ease Up overshoot above the threshold must never be pulled back down. How: This sets each owned item's value to the larger of its current value and thrValNum.
				pickers : curStaObj.pickers.map( ( picMapObj ) => picMapObj.id === picIdeStr ? { ...picMapObj, activeItemId : null } : picMapObj )                                      // What: Pickers. Why: A full recharge ends any in-progress ease-down item, so the picker must stop pointing at one. How: This nulls activeItemId on the picker matching picIdeStr.


			};


		} ),

		// #endregion filPicFun



		// #region renPicFun

		/**
		 * renPicFun = Rename Picker Function
		 *
		 * @summary
		 * Commits a picker rename (on blur, Enter or Save). The name is tidied to
		 * Title Case and de-duplicated against every other picker, so the saved
		 * name can differ from what was typed.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param picIdeStr - Picker Identifier String: The picker to rename.
		 * @param newNamStr - New Name String: The name as typed.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * renPicFun(picIdeStr, newNamStr) // => void
		 * ```
		 *
		*/

		renPicFun : ( picIdeStr, newNamStr ) => setAppStaObj( ( curStaObj ) => { // What: Rename Picker Function. Why: Commit-time picker rename (blur/Enter/Save only): tidy to Title Case and de-duplicate against every OTHER picker so 2 can't share a display name. How: This resolves a unique tidied name, then writes it onto the one matching picker.


			const sibNamArr = curStaObj.pickers.filter( ( curPicObj ) => curPicObj.id !== picIdeStr ).map( ( curPicObj ) => curPicObj.name ); // What: Sibling Name Array. Why: A picker name only needs to be unique among every OTHER picker. How: This filters curStaObj.pickers to every picker but the one being renamed, then maps to their own names.
			const tidNamStr = ( norPicFun && norPicFun( newNamStr ) ) || newNamStr;                                                           // What: Tidied Name String. Why: The name must be normalized to Title Case before the collision check below. How: This calls norPicFun when available, else falls back to newNamStr.
			const uniNamStr = uniNamFun( tidNamStr, sibNamArr );                                                                              // What: Unique Name String. Why: The write below needs the actual de-duplicated name to apply. How: This calls uniNamFun with tidNamStr and sibNamArr.



			return { // What: Next State Return. Why: The caller needs the one matching picker's own name replaced. How: This spreads curStaObj with pickers rebuilt, patching only the one matching picker.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				pickers : curStaObj.pickers.map( ( curPicObj ) => curPicObj.id === picIdeStr ? { ...curPicObj, name : uniNamStr } : curPicObj ) // What: Pickers. Why: Only the one matching picker's own name changes. How: This writes uniNamStr as name on the picker matching picIdeStr.


			};


		} ),

		// #endregion renPicFun



		revPicFun : ( picIdeStr, snaPicObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Revert Picker Function. Why: This is the full-replace path used to revert a picker to a snapshot on Controls Cancel. How: This overwrites the one matching picker entirely with snaPicObj.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			pickers : curStaObj.pickers.map( ( curPicObj ) => curPicObj.id === picIdeStr ? { ...snaPicObj } : curPicObj ) // What: Pickers. Why: Only the one matching picker is restored. How: This replaces the picker matching picIdeStr with a copy of snaPicObj.


		} ) ),



		// #region savEdiFun

		/**
		 * savEdiFun = Save Edit Function
		 *
		 * @summary
		 * Commits an edit made via the Pickers page's own "Edit" button,
		 * which reuses NewPickerForm's own Details step (items aren't
		 * touched by this flow; those are edited via the Data tab or the
		 * live Pickers-tab pool instead). Mirrors addPicFun's own field
		 * normalization (name dedup, cadence/days, conditional attach) but
		 * as an in-place UPDATE, and additionally resets every one of this
		 * picker's own items to fresh defaults for the NEW mode whenever
		 * mode actually changes: an item's own weight/value/easeMin/easeMax
		 * from the OLD mode has no meaningful translation to the new one
		 * (e.g. a Weighted item's own weight doesn't mean anything as an
		 * Ease Up drift band). This deliberately resets rather than tries
		 * to preserve old values; the user can revisit the item list after
		 * saving to tune them for the new mode.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param picIdeStr - Picker Identifier String: The picker being edited.
		 * @param picArgObj - Picker Argument Object: The edited picker's fields.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * savEdiFun(picIdeStr, picArgObj) // => void
		 * ```
		 *
		*/

		savEdiFun : ( picIdeStr, picArgObj ) => setAppStaObj( ( curStaObj ) => { // What: Save Edit Function. Why: The Pickers page's own Edit button needs to save changed picker details in place, keeping its id and history. How: This mirrors addPicFun's own normalization as an in-place update, resetting every owned item to fresh defaults whenever mode actually changes.


			const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === picIdeStr ); // What: Current Picker Object And Guard. Why: A stale picIdeStr (already removed) must be a no-op. How: This looks up picIdeStr in curStaObj.pickers.


			if ( !curPicObj ) return curStaObj; // What: Missing-Picker Guard. Why: There's nothing to edit when curPicObj wasn't found. How: This returns curStaObj unchanged.



			const modChaBoo = picArgObj.mode !== curPicObj.mode; // What: Mode Changed Boolean. Why: Only an actual mode change triggers the item-defaults reset further below. How: This is true when the new mode differs from curPicObj's own current one.
			const newConObj = picArgObj.newConditional;          // What: New Conditional Object. Why: The inline-conditional build below reads many of this one field's own properties. How: This reads picArgObj.newConditional, which is null/undefined when no inline conditional was authored.

			const finNamStr = uniNamFun( // What: Final Name String. Why: The committed picker still needs its own name tidied and de-duplicated against every OTHER visible picker. How: This calls uniNamFun with the tidied name against every sibling picker's own name, excluding itself.
				norPicFun( picArgObj.name ) || picArgObj.name,                                                                                      // What: Tidied Name Argument. Why: The de-duplication starts from the tidied name. How: This normalizes picArgObj.name, falling back to the raw name.
				curStaObj.pickers.filter( ( picFilObj ) => !picFilObj.hidden && picFilObj.id !== picIdeStr ).map( ( picFilObj ) => picFilObj.name ) // What: Sibling Names Argument. Why: The edited name must not collide with another visible picker. How: This lists every other visible picker's own name.
			);

			const madConObj = newConObj ? { // What: Made Conditional Object. Why: A brand-new inline conditional authored inline in this same edit form needs its own fresh id, mirroring addPicFun's own madConObj. How: This builds a full conditional object from newConObj's own fields.


				active       : newConObj.active !== undefined ? newConObj.active : true,                                     // What: Active. Why: A new conditional is enabled unless the form says otherwise. How: This honors newConObj.active when given, else defaults to true.
				cardText     : newConObj.cardText || 'Day off',                                                              // What: Card Text. Why: The day-off card shown on Today needs its own display text. How: This reads newConObj.cardText, defaulting to 'Day off'.
				chargedToday : false,                                                                                        // What: Charged Today. Why: A brand-new conditional hasn't charged yet today, so its per-day charge guard starts clear. How: This is false.
				easeMax      : newConObj.easeMax ?? 14,                                                                      // What: Ease Max. Why: An ease-mode conditional needs the upper end of its own drift band. How: This reads newConObj.easeMax, defaulting to 14.
				easeMin      : newConObj.easeMin ?? 7,                                                                       // What: Ease Min. Why: An ease-mode conditional needs the lower end of its own drift band. How: This reads newConObj.easeMin, defaulting to 7.
				id           : 'cnd_' + Math.random().toString( 36 ).slice( 2, 8 ),                                          // What: Id. Why: The picker below attaches to this conditional by id, so it must exist before the picker is built. How: This mints a random 'cnd_' id.
				mode         : newConObj.mode || 'random',                                                                   // What: Mode. Why: The mode decides how this conditional rolls or charges each day. How: This reads newConObj.mode, defaulting to 'random'.
				name         : norConFun( newConObj.name ) || newConObj.name || 'Conditional',                               // What: Name. Why: The conditional needs a tidied display name. How: This title-cases newConObj.name via norConFun, falling back to the raw name, then 'Conditional'.
				oddsPct      : newConObj.oddsPct ?? 50,                                                                      // What: Odds Percent. Why: A probability-mode conditional needs its own daily firing odds. How: This reads newConObj.oddsPct, defaulting to 50.
				threshold    : newConObj.threshold ?? 100,                                                                   // What: Threshold. Why: An ease-mode conditional charges toward (or decays from) this value. How: This reads newConObj.threshold, defaulting to 100.
				triggered    : newConObj.triggered !== undefined ? newConObj.triggered : ( newConObj.mode === 'ease-down' ), // What: Triggered. Why: A new conditional starts firing only when it's ease-down, which starts charged. How: This honors newConObj.triggered when given, else defaults to whether mode is 'ease-down'.
				value        : newConObj.mode === 'ease-down' ? ( newConObj.threshold ?? 100 ) : ( newConObj.value ?? 0 ),   // What: Value. Why: Ease Down starts fully charged at its threshold while every other mode starts from its own given value. How: This is the threshold (default 100) for ease-down, else newConObj.value (default 0).
				weight       : newConObj.weight ?? 1                                                                         // What: Weight. Why: A weighted conditional needs its own draw weight. How: This reads newConObj.weight, defaulting to 1.


			} : null;

			const norCadObj = CAD_NAM_OBJ.norCadFun({ // What: Normalized Cadence Object. Why: The schedule resolve and the cadence spread below both need the same normalized cadence fields. How: This calls CAD_NAM_OBJ.norCadFun once with picArgObj's own 8 cadence fields, reused by both the daysOfWeek resolve and the cadence spread below.


				anchorDay   : picArgObj.anchorDay,   // What: Anchor Day. Why: A yearly cadence needs its own day of the month. How: This passes picArgObj.anchorDay through.
				anchorDom   : picArgObj.anchorDom,   // What: Anchor Dom. Why: A monthly cadence needs its own day of the month. How: This passes picArgObj.anchorDom through.
				anchorDow   : picArgObj.anchorDow,   // What: Anchor Dow. Why: A weekly cadence needs its own day of the week. How: This passes picArgObj.anchorDow through.
				anchorMonth : picArgObj.anchorMonth, // What: Anchor Month. Why: A yearly cadence needs its own month. How: This passes picArgObj.anchorMonth through.
				cadence     : picArgObj.cadence,     // What: Cadence. Why: This decides whether the picker surfaces daily, weekly, monthly, or yearly. How: This passes picArgObj.cadence through; norCadFun itself defaults a missing one to 'daily'.
				dateMode    : picArgObj.dateMode,    // What: Date Mode. Why: A monthly/yearly cadence can anchor on a date or an nth weekday. How: This passes picArgObj.dateMode through.
				nthOrdinal  : picArgObj.nthOrdinal,  // What: Nth Ordinal. Why: An nth-weekday anchor needs which occurrence (1st, 2nd, ...). How: This passes picArgObj.nthOrdinal through.
				nthWeekday  : picArgObj.nthWeekday   // What: Nth Weekday. Why: An nth-weekday anchor needs which weekday. How: This passes picArgObj.nthWeekday through.


			});

			const finPicObj = { // What: Final Picker Object. Why: This is curPicObj patched with every field this edit form can change. How: This spreads curPicObj, overriding name/group/mode/schedule/gate fields with the resolved values below.


				...curPicObj, // What: Current Picker Spread. Why: Every picker field this edit form can't change (id, threshold, activeItemId, ...) must carry over unchanged. How: This spreads curPicObj before the overrides below.

				avoidDuplicates : !!picArgObj.avoidDuplicates,                                    // What: Avoid Duplicates. Why: The edit form can toggle whether this picker skips items already on today's list. How: This coerces picArgObj.avoidDuplicates to a real boolean.
				conditionalId   : madConObj ? madConObj.id : ( picArgObj.conditionalId || null ), // What: Conditional Id Resolve. Why: Unlike addPicFun's own create-only flow, this can also DETACH a conditional the picker already had, so there's no bare "keep the old one" default to fall back on here. How: This prefers madConObj's own id, else the given conditionalId, else null.
				group           : picArgObj.group,                                                // What: Group. Why: The edit form can move the picker to another group. How: This is picArgObj.group.
				mode            : picArgObj.mode,                                                 // What: Mode. Why: The edit form can switch the picker's selection algorithm. How: This is picArgObj.mode.
				name            : finNamStr,                                                      // What: Name. Why: The committed name must be tidied and de-duplicated. How: This is finNamStr.
				skipHolidays    : !!picArgObj.skipHolidays,                                       // What: Skip Holidays. Why: The edit form can toggle whether this picker sits out public holidays. How: This coerces picArgObj.skipHolidays to a real boolean.

				daysOfWeek : CAD_NAM_OBJ.enfWeeFun({ // What: Daily-Generator Schedule. Why: The schedule must be re-resolved the same way addPicFun itself resolves it. How: This calls CAD_NAM_OBJ.enfWeeFun over norCadObj plus an explicit daysOfWeek, defaulting to every day.


					...norCadObj, // What: Normalized Cadence Spread. Why: enfWeeFun needs the picker's own resolved cadence and anchor to force a weekly picker's anchor day into its days. How: This spreads norCadObj before the daysOfWeek override below.

					daysOfWeek : Array.isArray( picArgObj.daysOfWeek ) && picArgObj.daysOfWeek.length ? picArgObj.daysOfWeek : [ 0, 1, 2, 3, 4, 5, 6 ] // What: Days Of Week. Why: An empty or missing selection must mean every day, never no day. How: This uses picArgObj.daysOfWeek when it's a non-empty array, else all 7 days.


				} ),

				...norCadObj // What: Normalized Cadence Spread. Why: The surfacing anchor and display unit must be resolved (and defaulted) the same way for every picker. How: This spreads norCadObj's own 8 cadence fields onto the picker.


			};

			const thrValNum = curPicObj.threshold ?? 100; // What: Threshold Value Number. Why: The ease-down item-defaults branch below needs this picker's own threshold. How: This reads curPicObj's own threshold, defaulting to 100.

			const modDefObj = picArgObj.mode === 'ease-down' // What: Mode Defaults Object. Why: Every item's own weight/value/drift-band must reset to sensible defaults for whichever mode was just switched to. How: This picks the ease-down, ease-up, or plain-weighted default shape depending on mode.
				? { easeMax : PIC_NAM_OBJ.DEF_EAS_OBJ.easeMax, easeMin : PIC_NAM_OBJ.DEF_EAS_OBJ.easeMin, value : thrValNum, weight : 1 } // What: Ease Down Defaults Branch. Why: Ease Down items start fully charged. How: This sets value to the threshold with the default drift band and weight 1.
				: picArgObj.mode === 'ease-up'                                                                                            // What: Ease Up Check. Why: Ease Up needs its own defaults. How: This tests for the ease-up mode next.
				? { easeMax : PIC_NAM_OBJ.DEF_EAS_OBJ.easeMax, easeMin : PIC_NAM_OBJ.DEF_EAS_OBJ.easeMin, value : 0, weight : 1 }         // What: Ease Up Defaults Branch. Why: Ease Up items start uncharged. How: This sets value to 0 with the default drift band and weight 1.
				: { value : 0, weight : 1 };                                                                                              // What: Plain Defaults Branch. Why: Every other mode only uses weight and value. How: This resets both to their neutral values.

			const nexIteArr = modChaBoo // What: Next Item Array. Why: Only an ACTUAL mode change resets this picker's own items; an unchanged mode leaves every item's own tuning untouched. How: This maps curStaObj.items, merging modDefObj onto every item owned by picIdeStr, only when modChaBoo is true.
				? curStaObj.items.map( ( curIteObj ) => curIteObj.pickerId === picIdeStr ? { ...curIteObj, ...modDefObj } : curIteObj ) // What: Reset Items Branch. Why: A mode change resets this picker's own items. How: This spreads modDefObj onto each of its items.
				: curStaObj.items; // What: Unchanged Items Branch. Why: An unchanged mode keeps every item's tuning. How: This passes the items through.

			const nexPidArr = picArgObj.includeInDaily // What: Next Picker-Ids Array. Why: picArgObj.includeInDaily decides whether this picker joins or leaves the Daily generator's own membership list, same as addPicFun's own resolution. How: This adds picIdeStr when it's included and it isn't already present, else removes it.
				? ( curStaObj.daily.pickerIds.includes( picIdeStr ) ? curStaObj.daily.pickerIds : [ ...curStaObj.daily.pickerIds, picIdeStr ] ) // What: Include Branch. Why: The picker joins the Daily generator. How: This appends picIdeStr unless it's already listed.
				: curStaObj.daily.pickerIds.filter( ( curPidStr ) => curPidStr !== picIdeStr );                                                 // What: Exclude Branch. Why: The picker leaves the Daily generator. How: This filters picIdeStr out.



			return { // What: Next State Return. Why: The caller needs items/pickers/conditionals/daily all updated together. How: This spreads curStaObj, replacing each field with the values resolved above.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				conditionals : madConObj ? [ ...( curStaObj.conditionals || [] ), madConObj ] : ( curStaObj.conditionals || [] ), // What: Conditionals. Why: A freshly-made inline conditional must be saved alongside the picker that uses it. How: This appends madConObj when there is one, else keeps the existing list.
				daily        : { ...curStaObj.daily, pickerIds : nexPidArr },                                                     // What: Daily. Why: The picker's own daily-generator membership must be updated. How: This spreads curStaObj.daily with pickerIds replaced by nexPidArr.
				items        : nexIteArr,                                                                                         // What: Items. Why: A mode change resets this picker's own items. How: This is nexIteArr.
				pickers      : curStaObj.pickers.map( ( picMapObj ) => picMapObj.id === picIdeStr ? finPicObj : picMapObj )       // What: Pickers. Why: Only the edited picker is replaced. How: This swaps finPicObj in for the picker matching picIdeStr.


			};


		} ),

		// #endregion savEdiFun



		// #region updPicFun

		/**
		 * updPicFun = Update Picker Function
		 *
		 * @summary
		 * Merges a patch onto one picker, then re-derives its daysOfWeek through
		 * the weekly-day rule, so switching to Weekly (or changing its day)
		 * selects that day in the Days control automatically.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param picIdeStr - Picker Identifier String: The picker to patch.
		 * @param patValObj - Patch Value Object: The fields to merge onto the
		 *                    picker.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * updPicFun(picIdeStr, patValObj) // => void
		 * ```
		 *
		*/

		updPicFun : ( picIdeStr, patValObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Update Picker Function. Why: Any patch touching cadence/anchorDow/daysOfWeek must be re-run through enforceWeeklyDay, so switching to Weekly (or changing its own day) selects that day in the Days control automatically. How: This merges patValObj onto the one matching picker, then re-derives daysOfWeek.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			pickers : curStaObj.pickers.map( ( curPicObj ) => { // What: Pickers. Why: Only the one matching picker is patched, with its weekly anchor day re-enforced. How: This maps pickers, returning every other one unchanged and the matching one patched and re-derived.


				if ( curPicObj.id !== picIdeStr ) return curPicObj; // What: Non-Matching Guard. Why: Every other picker is untouched by this patch. How: This returns curPicObj unchanged when its own id doesn't match picIdeStr.



				const nexPicObj = { ...curPicObj, ...patValObj }; // What: Next Picker Object. Why: The patch itself must land before daysOfWeek is re-derived from it. How: This spreads curPicObj with patValObj merged on.

				nexPicObj.daysOfWeek = CAD_NAM_OBJ.enfWeeFun( nexPicObj ); // What: Days-Of-Week Re-Derive. Why: A cadence/anchorDow/daysOfWeek change must keep the weekly-cadence anchor day selected in the Days control. How: This calls CAD_NAM_OBJ.enfWeeFun against nexPicObj's own just-patched fields.



				return nexPicObj; // What: Next Picker Return. Why: The map above needs the fully-patched picker. How: This returns nexPicObj, built above.


			} )


		} ) ),

		// #endregion updPicFun

		// #endregion Pickers



		// #region Today Edit-Mode Reordering Mechanism

		/**
		 * reoGroFun = Reorder Groups Function
		 *
		 * @summary
		 * groupOrder is the display order of the picker-based groups on
		 * Today; pickerOrder maps a group label to the ordered picker ids
		 * within it, driving per-row order. Unknown groups fall back to
		 * first-occurrence order in the render layer. setOrdFun is the
		 * bulk restore Edit Mode's own "Cancel" uses to revert to the
		 * entry snapshot.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param ordGroArr - Order Group Array: The group names in their new display
		 *                    order.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * reoGroFun(ordGroArr) // => void
		 * ```
		 *
		*/



		reoGroFun : ( ordGroArr ) => setAppStaObj( ( curStaObj ) => ( { // What: Reorder Groups Function. Why: Edit Mode needs to persist a fresh group display order after a drag. How: This copies ordGroArr onto groupOrder.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			groupOrder : ordGroArr.slice() // What: Group Order. Why: The dragged group order must be saved as-is. How: This copies ordGroArr so later edits to the caller's own array can't leak in.


		} ) ),



		reoPicFun : ( groNamStr, picIdeArr ) => setAppStaObj( ( curStaObj ) => ( { // What: Reorder Pickers Function. Why: Edit Mode needs to persist a fresh per-group row order after a drag. How: This copies picIdeArr onto pickerOrder's own entry for groNamStr.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			pickerOrder : { // What: Picker Order. Why: Only this one group's own row order changes, every other group's must survive. How: This rebuilds pickerOrder from its own current entries plus the one override below.


				...curStaObj.pickerOrder, // What: Current Picker-Order Spread. Why: Every other group's own saved row order must carry over unchanged. How: This spreads curStaObj.pickerOrder before the override below.

				[ groNamStr ] : picIdeArr.slice() // What: Group Row Order. Why: The dragged row order for this group must be saved as-is. How: This copies picIdeArr under groNamStr's own key.


			}


		} ) ),



		setOrdFun : ( ordGroArr, ordPicObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Set Order Function. Why: This is the bulk restore Edit Mode's own "Cancel" uses to revert both order structures to their entry snapshot at once. How: This copies ordGroArr onto groupOrder and deep-clones ordPicObj onto pickerOrder.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			groupOrder  : ordGroArr.slice(),                        // What: Group Order. Why: Cancel must restore the group order snapshot taken on entry. How: This copies ordGroArr.
			pickerOrder : JSON.parse( JSON.stringify( ordPicObj ) ) // What: Picker Order. Why: Cancel must restore every group's row order snapshot taken on entry. How: This deep-copies ordPicObj so nested arrays can't be shared with the snapshot.


		} ) ),

		// #endregion Today Edit-Mode Reordering Mechanism



		// #region Today Entries

		// #region addEntFun

		/**
		 * addEntFun = Add Entry Function
		 *
		 * @summary
		 * Adds a NEW today entry for picIdeStr showing iteIdeStr. Multiple
		 * entries per picker are allowed for other modes; the Pickers tab
		 * uses this to ADD a choice, and the user prunes any they don't
		 * want via each entry's own Skip button. Ease Down is the one
		 * exception: since it's a single ongoing "active item", sending a
		 * new pick REPLACES today's existing entry for that picker rather
		 * than stacking a second one. A manual send stages its own value
		 * mutation as `pending` (applied on DONE), so sending an item
		 * doesn't change picker state until it's completed; the caller
		 * (Pickers-tab spin) normally passes the full staged pick result,
		 * falling back to the ease-down default (make this item active,
		 * recharge the previously-active one on done) only when it
		 * doesn't.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param picIdeStr - Picker Identifier String: The picker the item belongs
		 *                    to.
		 * @param iteIdeStr - Item Identifier String: The item to send to Today.
		 * @param penArgObj - Pending Argument Object: The staged consequences to
		 *                    apply once the entry is done.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * addEntFun(picIdeStr, iteIdeStr, penArgObj) // => void
		 * ```
		 *
		*/

		addEntFun : ( picIdeStr, iteIdeStr, penArgObj ) => setAppStaObj( ( curStaObj ) => { // What: Add Entry Function. Why: The Pickers tab needs to send a chosen item to Today as its own new entry, without changing any picker state until that entry is completed. How: This appends a fresh entry (or, for Ease Down, replaces that picker's existing one) with its value consequences staged as pending, and logs a live pick-log row.


			const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === picIdeStr ); // What: Current Picker Object And Guard. Why: Every branch below needs to know this picker's own mode/activeItemId/conditionalId. How: This looks up picIdeStr in curStaObj.pickers.
			const easDowBoo = curPicObj && curPicObj.mode === 'ease-down';                           // What: Ease-Down Boolean. Why: Ease Down's own single-entry-per-picker replace behavior branches everywhere below. How: This is true only when curPicObj exists and its own mode is 'ease-down'.

			const entIdeStr = easDowBoo // What: Entry Identifier String. Why: Ease Down reuses its own existing entry's eid (so a replace, not a stack); every other mode always mints a fresh one. How: This reuses the picker's own current entry's eid when found, else mints a new one via newEidFun.
				? ( curStaObj.today.entries.find( ( curEntObj ) => curEntObj.pickerId === picIdeStr )?.eid || newEidFun() ) // What: Reused Eid Branch. Why: Ease Down replaces its own existing entry. How: This reuses that entry's eid, minting one when there is none.
				: newEidFun();                                                                                              // What: Fresh Eid Branch. Why: Every other mode stacks a new entry. How: This mints a new eid.

			let penValObj = penArgObj; // What: Pending Value Object. Why: The caller's own staged pick result is normally used as-is, but a fallback must be computed when none was given. How: This starts at penArgObj and is resolved below when it's undefined.


			if ( penValObj === undefined ) { // What: Fallback-Pending Guard. Why: Only a caller that passed no pending at all needs the ease-down default computed here. How: This resolves penValObj to null, then to the ease-down default when applicable.


				penValObj = null; // What: Default Pending Reset. Why: Every mode besides ease-down's own re-activation case has no mutation to stage at all. How: This starts penValObj at null before the ease-down check below.


				if ( easDowBoo && curPicObj.activeItemId !== iteIdeStr ) { // What: Ease-Down Reactivation Guard. Why: Only switching to a DIFFERENT active item needs its own staged recharge-and-activate pending. How: This builds penValObj only when curPicObj is ease-down and itemId isn't already its own active item.


					const thrValNum = curPicObj.threshold ?? 100; // What: Threshold Value Number. Why: The previously-active item (if any) must be staged to recharge back to this exact threshold. How: This reads curPicObj's own threshold, defaulting to 100.

					penValObj = { // What: Ease-Down Pending Object. Why: The caller needs a real pending payload staging both the recharge and the activation switch. How: This stages the previously-active item's own recharge (if any), the activeItemId patch, and the pick bump.


						bumpPick    : false,                                                                               // What: Bump Pick. Why: A re-activation is not a fresh pick, so the item's own pick count must not rise. How: This is always false here.
						pickedId    : iteIdeStr,                                                                           // What: Picked Id. Why: The completion step needs to know which item this pending belongs to. How: This is iteIdeStr.
						pickerPatch : { activeItemId : iteIdeStr },                                                        // What: Picker Patch. Why: Completing this entry must make iteIdeStr the picker's own active item. How: This stages activeItemId as iteIdeStr.
						updates     : curPicObj.activeItemId ? [ { id : curPicObj.activeItemId, value : thrValNum } ] : [] // What: Updates. Why: The previously-active item (if any) must recharge to full on completion. How: This stages one value:thrValNum update for it, else none.


					};


				}


			}



			const newEntObj = { done : false, eid : entIdeStr, itemId : iteIdeStr, pending : penValObj, pickerId : picIdeStr, revert : null, skipped : false }; // What: New Entry Object. Why: This is the actual Today entry being added, in today.entries' own shape. How: This bundles entIdeStr/picIdeStr/iteIdeStr, under the entry's own persisted eid/pickerId/itemId keys, with a fresh not-done/not-skipped state and penValObj as its own pending.
			const logRowObj = logRowFun( curStaObj, { eid : entIdeStr, itemId : iteIdeStr, pickerId : picIdeStr, source : 'manual' } );                         // What: Log Row Object. Why: A manual send must be reflected in the pick log too, denormalized the same way every other pick is. How: This calls logRowFun with source:'manual'.

			const conIdeStr = curPicObj && curPicObj.conditionalId; // What: Conditional Identifier String. Why: The day-off-card check below needs to know which conditional (if any) gates this picker. How: This reads curPicObj's own conditionalId, or stays falsy when curPicObj is missing.

			const hasDofBoo = easDowBoo && conIdeStr && // What: Has Day-Off Boolean. Why: An ease-down picker that's currently suppressed behind its own day-off card must NOT have that card silently replaced by this manual override. How: This is true only when this is ease-down, gated, and today already shows a live day-off card for that same conditional.
				curStaObj.today.entries.some( ( curEntObj ) => curEntObj.kind === 'dayoff' && curEntObj.conditionalId === conIdeStr ); // What: Day-Off Card Test. Why: The picker is suppressed only when its own conditional's day-off card is on Today. How: This looks for a day-off entry with conIdeStr.

			const nexEntArr = ( easDowBoo && !hasDofBoo ) // What: Next Entry Array. Why: Ease Down normally REPLACES its own picker's existing entry; the day-off-card exception instead ADDS an extra entry alongside the still-showing card. How: This filters out this picker's own prior entry (unless the exception applies) before appending newEntObj.
				? [ ...curStaObj.today.entries.filter( ( curEntObj ) => curEntObj.pickerId !== picIdeStr ), newEntObj ] // What: Replace Entry Branch. Why: Ease Down replaces its own picker's entry. How: This drops the old entry and appends newEntObj.
				: [ ...curStaObj.today.entries, newEntObj ];                                                            // What: Add Entry Branch. Why: Every other case adds an entry. How: This appends newEntObj.

			const nexLogArr = easDowBoo // What: Next Pick-Log Array. Why: A replaced Ease Down entry must not leave its own prior log row behind under the same eid. How: This drops any earlier row sharing eid before appending logRowObj, only for ease-down; every other mode simply appends.
				? [ ...( curStaObj.pickLog || [] ).filter( ( curRowObj ) => curRowObj.eid !== entIdeStr ), logRowObj ] // What: Replace Row Branch. Why: A replaced entry's old row must not linger under the same eid. How: This drops that row and appends logRowObj.
				: [ ...( curStaObj.pickLog || [] ), logRowObj ];                                                       // What: Append Row Branch. Why: A new entry just adds its row. How: This appends logRowObj.



			return { // What: Next State Return. Why: The caller needs the new entry and its own log row written onto a fresh state. How: This spreads curStaObj with today.entries and pickLog replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				pickLog : nexLogArr,                                  // What: Pick Log. Why: The manual send's own log row must land in state. How: This is nexLogArr.
				today   : { ...curStaObj.today, entries : nexEntArr } // What: Today. Why: The new (or replacing) entry must land in today's own list. How: This spreads curStaObj.today with entries replaced by nexEntArr.


			};


		} ),

		// #endregion addEntFun



		cleEntFun : () => setAppStaObj( ( curStaObj ) => ( { // What: Clear Entries Function. Why: The Welcome Tour uses this to back up to its own Generate step, showing the same pristine "nothing generated yet" state it did the first time through. How: This empties today.entries without touching generatedAt/streakClaimed/anything else about today.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			today : { ...curStaObj.today, entries : [] } // What: Today. Why: The Welcome Tour's own back-up step needs Today emptied without touching any other today field. How: This spreads curStaObj.today with entries replaced by an empty array.


		} ) ),



		// #region setEntFun

		/**
		 * setEntFun = Set Entries Function
		 *
		 * @summary
		 * Rebuilds the entire entries list from scratch (used by
		 * Generate). lisEntArr holds 2 kinds of descriptors: a CARRIED
		 * entry (has _carry + entry) is kept VERBATIM (same eid/itemId/
		 * pending/done/revert/periodKey) so a cadence pick persists across
		 * days until completed, log row included; a FRESH descriptor (no
		 * eid) gets a new eid and a fresh 'auto' log row. optArgObj.
		 * resetStreak, only ever passed by the scheduled auto-run (never a
		 * manual Regenerate, and deliberately not derived from the date),
		 * clears today.streakClaimed so the new period starts unclaimed;
		 * this is what stops a user from "farming" extra streak points by
		 * repeatedly regenerating and completing within the same day.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param lisEntArr - List Entry Array: The fresh entries this Generate
		 *                    produced.
		 * @param optArgObj - Option Argument Object: Optional flags; resetStreak
		 *                    starts the new period unclaimed.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * setEntFun(lisEntArr, { resetStreak: true }) // => void
		 * ```
		 *
		*/

		setEntFun : ( lisEntArr, optArgObj ) => setAppStaObj( ( curStaObj ) => { // What: Set Entries Function. Why: Generate rebuilds the whole Today list at once, carrying unfinished cadence picks forward and adding fresh ones. How: This keeps every carried entry verbatim, gives every fresh descriptor a new eid and 'auto' log row, and clears streakClaimed only when optArgObj.resetStreak is set.


			const curDayStr = isoDayFun(); // What: Current Day String. Why: The fresh-row and pick-log-purge logic below both need today's own calendar day. How: This reads isoDayFun().

			const carEntArr = lisEntArr.filter( ( curDesObj ) => curDesObj._carry ).map( ( curDesObj ) => curDesObj.entry ); // What: Carried Entry Array. Why: A carried descriptor's own already-formed entry must be kept verbatim, unwrapped from its own _carry marker. How: This filters lisEntArr to _carry descriptors and unwraps each one's own entry.
			const carEidSet = new Set( carEntArr.map( ( curEntObj ) => curEntObj.eid ) );                                    // What: Carried Eid Set. Why: The pick-log purge below must never drop a carried entry's own still-live row. How: This collects every carried entry's own eid.

			const freEntArr = lisEntArr.filter( ( curDesObj ) => !curDesObj._carry ).map( ( curDesObj ) => ( { // What: Fresh Entry Array. Why: Every non-carried descriptor becomes a brand-new Today entry with its own fresh eid. How: This maps each descriptor into a full entry, spreading in periodKey/day-off-card fields only when present.


				done     : false,                      // What: Done. Why: A freshly generated entry always starts not-done. How: This is false.
				eid      : newEidFun(),                // What: Entry Id. Why: Every fresh entry needs its own brand-new id. How: This mints one via newEidFun.
				itemId   : curDesObj.itemId || null,   // What: Item Id. Why: This is the item the generator picked for this entry, if any. How: This reads curDesObj.itemId, defaulting to null.
				pending  : curDesObj.pending || null,  // What: Pending. Why: The pick's own value consequences stay staged until the entry is completed. How: This reads curDesObj.pending, defaulting to null.
				pickerId : curDesObj.pickerId || null, // What: Picker Id. Why: Every entry records which picker produced it. How: This reads curDesObj.pickerId, defaulting to null.
				revert   : null,                       // What: Revert. Why: Nothing has been applied yet, so there is nothing to revert. How: This is null until the entry is completed.
				skipped  : false,                      // What: Skipped. Why: A freshly generated entry always starts not-skipped. How: This is false.

				...( curDesObj.periodKey ? { periodKey : curDesObj.periodKey } : {} ), // What: Period-Key Spread. Why: A non-daily cadence pick must remember which period it belongs to, so it can carry across days until completed. How: This adds periodKey only when curDesObj carries one.

				...( curDesObj.kind ? { // What: Day-Off Card Fields Spread. Why: A day-off card entry carries a kind + conditional link + display text and has no itemId, and never writes to the pick log (excluded from stats). How: This spreads kind/conditionalId/cardText/group/pickerName/condName only when curDesObj.kind is present.


					cardText      : curDesObj.cardText || '',        // What: Card Text. Why: The day-off card shows its own explanatory line. How: This reads curDesObj.cardText, defaulting to ''.
					conditionalId : curDesObj.conditionalId || null, // What: Conditional Id. Why: The card must stay linked to the conditional that suppressed its picker today. How: This reads curDesObj.conditionalId, defaulting to null.
					condName      : curDesObj.condName || '',        // What: Conditional Name. Why: The card's own title shows the conditional's name, denormalized so it survives a later rename. How: This reads curDesObj.condName, defaulting to ''.
					group         : curDesObj.group || 'Other',      // What: Group. Why: The card must render inside its picker's own Today group. How: This reads curDesObj.group, defaulting to 'Other'.
					kind          : curDesObj.kind,                  // What: Kind. Why: This marks the entry as a day-off card rather than a real pick. How: This copies curDesObj.kind, which is always truthy on this branch.
					pickerName    : curDesObj.pickerName || ''       // What: Picker Name. Why: The card's own title shows the suppressed picker's name, denormalized so it survives a later rename. How: This reads curDesObj.pickerName, defaulting to ''.


				} : {} )


			} ) );

			const nexEntArr = [ ...carEntArr, ...freEntArr ]; // What: Next Entry Array. Why: The new today.entries list is exactly the carried entries plus the freshly-built ones. How: This concatenates carEntArr and freEntArr.

			const newRowArr = freEntArr.filter( ( curEntObj ) => !curEntObj.kind && curEntObj.pickerId ).map( ( curEntObj ) => // What: New Row Array. Why: Only a real (non-day-off-card) fresh entry needs its own auto pick-log row; depletedEnd is deliberately NOT written here, since it's a value consequence recorded only on completion. How: This builds one logRowFun row per qualifying fresh entry, source:'auto'.
				logRowFun( curStaObj, { date : curDayStr, eid : curEntObj.eid, itemId : curEntObj.itemId, pickerId : curEntObj.pickerId, source : 'auto' } ) ); // What: Auto Row Build. Why: Every fresh entry logs as an automatic pick. How: This builds the row from the entry's own eid, item and picker.

			const nexLogArr = ( curStaObj.pickLog || [] ).filter( ( curRowObj ) => curRowObj.date !== curDayStr || carEidSet.has( curRowObj.eid ) ).concat( newRowArr ); // What: Next Pick-Log Array. Why: The generator owns today, so every OTHER row logged today (auto or manual) must be dropped, except a carried entry's own still-live row. How: This keeps every row not dated today (or belonging to a carried eid), then appends newRowArr.

			const nexTodObj = { ...curStaObj.today, entries : nexEntArr }; // What: Next Today Object. Why: The caller needs a fresh today object carrying the new entries. How: This spreads curStaObj.today with entries replaced by nexEntArr.


			if ( optArgObj && optArgObj.resetStreak ) nexTodObj.streakClaimed = false; // What: Streak-Claimed Reset Guard. Why: Only the scheduled auto-run (never a manual Regenerate) starts the new period unclaimed, per the design-rationale comment above. How: This sets nexTodObj.streakClaimed to false only when optArgObj.resetStreak is truthy.



			const nexTasArr = ( curStaObj.tasks || [] ).filter( ( curTasObj ) => !TAS_NAM_OBJ.isaComFun( curTasObj ) ); // What: Next Task Array. Why: Every Generate also drops completed one-time reminders outright, rather than waiting for a future reload/day-change. How: This keeps every task TAS_NAM_OBJ.isaComFun reports false for.



			return { ...curStaObj, pickLog : nexLogArr, tasks : nexTasArr, today : nexTodObj }; // What: Next State Return. Why: The caller needs today/pickLog/tasks all replaced on a fresh state. How: This spreads curStaObj with the 3 fields replaced.


		} ),

		// #endregion setEntFun



		// #region skiEntFun

		/**
		 * skiEntFun = Skip Entry Function
		 *
		 * @summary
		 * Removes the entry from today, but its own live log row is KEPT
		 * and marked outcome:'skipped' (like re-roll's own 'rejected') so
		 * Stats can tally per-item skips. Skipped rows never count toward
		 * pick totals; rejected rows for the same eid stay as they are. If
		 * the entry had been completed, its own applied mutation is undone
		 * first (it's no longer a completion), and any conditional charge
		 * it drove is reverted too.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param entIdeStr - Entry Identifier String: The Today entry to skip.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * skiEntFun(entIdeStr) // => void
		 * ```
		 *
		*/

		skiEntFun : ( entIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Skip Entry Function. Why: A user must be able to drop an entry from today while Stats still counts it as a skip. How: This undoes any completed mutation and conditional charge first, removes the entry, marks its own live log row skipped, and reconciles the streak.


			const curEntObj = curStaObj.today.entries.find( ( entFinObj ) => entFinObj.eid === entIdeStr ); // What: Current Entry Object And Guard. Why: The undo-before-skip branch below needs to know whether this entry was already completed. How: This looks up entIdeStr in curStaObj.today.entries.

			let nexIteArr = curStaObj.items;         // What: Next Item Array. Why: This defaults to the unchanged items and is only replaced below when an already-done entry needs its own pending undone first. How: This starts at curStaObj.items.
			let nexPicArr = curStaObj.pickers;       // What: Next Picker Array. Why: This defaults to the unchanged pickers and is only replaced below when an already-done entry needs its own pending undone first. How: This starts at curStaObj.pickers.
			let nexLogArr = curStaObj.pickLog || []; // What: Next Pick-Log Array. Why: This defaults to the unchanged pick log and is only replaced below when an already-done entry needs its own pending undone first. How: This starts at curStaObj.pickLog, defaulting to [].


			if ( curEntObj && curEntObj.done && curEntObj.revert ) { // What: Already-Done Undo Guard. Why: A skipped entry is no longer a completion, so any staged mutation it already applied must be undone first. How: This calls enpRevFun and adopts its own result.


				const resValObj = enpRevFun( { ...curStaObj }, curEntObj ); // What: Result Value Object. Why: enpRevFun returns the restored items/pickers/pickLog together. How: This calls enpRevFun with a shallow copy of curStaObj and curEntObj.

				nexIteArr = resValObj.items;   // What: Restored Items Array Adopt. Why: Every downstream line below must build on the RESTORED items. How: This adopts resValObj's own items onto the outer nexIteArr binding.
				nexPicArr = resValObj.pickers; // What: Restored Pickers Array Adopt. Why: Every downstream line below must build on the RESTORED pickers. How: This adopts resValObj's own pickers onto the outer nexPicArr binding.
				nexLogArr = resValObj.pickLog; // What: Restored Pick Log Array Adopt. Why: Every downstream line below must build on the RESTORED pick log. How: This adopts resValObj's own pickLog onto the outer nexLogArr binding.


			}



			const nexEntArr = curStaObj.today.entries.filter( ( entFilObj ) => entFilObj.eid !== entIdeStr ); // What: Next Entry Array. Why: A skipped entry is removed from today entirely, not merely marked. How: This filters out the one entry matching entIdeStr.

			const nexConArr = ( curEntObj && curEntObj.done ) // What: Next Conditionals Array. Why: A completed entry being skipped is no longer a completion, so any conditional charge/discharge it drove must be reverted. How: This calls cotAplFun with nowDone:false only when curEntObj was actually done, else passes conditionals through unchanged.
				? cotAplFun( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curEntObj, false ) // What: Undo Charge Branch. Why: A done entry being skipped must undo the conditional charge it drove. How: This re-runs cotAplFun as not-done.
				: ( curStaObj.conditionals || [] );                                                                  // What: Unchanged Conditionals Branch. Why: A not-done entry never drove a charge. How: This passes the conditionals through.

			const nexCdlArr = ( curEntObj && curEntObj.done ) // What: Next Conditional-Log Array. Why: The matching cycle's own log row must be un-recorded too, for the same reason as nexConArr above. How: This calls cdlAplFun with nowDone:false only when curEntObj was actually done, else passes conditionalLog through unchanged.
				? cdlAplFun( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curEntObj, false ) // What: Undo Log Branch. Why: The matching cycle's row must be un-recorded too. How: This re-runs cdlAplFun as not-done.
				: ( curStaObj.conditionalLog || [] );                                                                // What: Unchanged Log Branch. Why: A not-done entry never logged a cycle. How: This passes the conditional log through.

			nexLogArr = nexLogArr.map( ( curRowObj ) => // What: Live Log Row Skip. Why: The live row for this entry must be marked skipped (never overwriting an already-rejected row from an earlier re-roll). How: This flags the matching row outcome:'skipped', done:false, completedAt:null.
				( curRowObj.eid === entIdeStr && curRowObj.outcome !== 'rejected' ) ? { ...curRowObj, completedAt : null, done : false, outcome : 'skipped' } : curRowObj ); // What: Skip Row Patch. Why: Only this entry's non-rejected row becomes skipped. How: This marks it skipped and not done, and passes every other row through.

			const { stkClaBoo, stkValNum } = stkSynFun( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curStaObj.tasks ); // What: Streak Reconcile. Why: Removing an entry from today can flip whether today counts as fully done. How: This calls stkSynFun against the already-patched items/pickers and the already-filtered entries.



			return { // What: Next State Return. Why: Every affected field must land together on one fresh state. How: This spreads curStaObj with items/pickers/conditionals/conditionalLog/streak/today/pickLog all replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				conditionalLog : nexCdlArr,                                                             // What: Conditional Log. Why: Skipping an already-completed entry must revert its conditional's own logged cycle. How: This is nexCdlArr.
				conditionals   : nexConArr,                                                             // What: Conditionals. Why: Skipping an already-completed entry must revert its gating conditional's own charge. How: This is nexConArr.
				items          : nexIteArr,                                                             // What: Items. Why: Any completed consequences this skip reverts land here. How: This is nexIteArr.
				pickers        : nexPicArr,                                                             // What: Pickers. Why: Any completed picker-level consequences this skip reverts land here. How: This is nexPicArr.
				pickLog        : nexLogArr,                                                             // What: Pick Log. Why: The live row for this entry must be marked skipped. How: This is nexLogArr.
				streak         : stkValNum,                                                             // What: Streak. Why: The persisted streak count must reflect the reconciled verdict. How: This is stkValNum, from stkSynFun.
				today          : { ...curStaObj.today, entries : nexEntArr, streakClaimed : stkClaBoo } // What: Today. Why: Today's own entries and claimed flag must both reflect this change. How: This spreads curStaObj.today with entries replaced and streakClaimed set to stkClaBoo.


			};


		} ),

		// #endregion skiEntFun



		// #region swaIteFun

		/**
		 * swaIteFun = Swap Item Function
		 *
		 * @summary
		 * Replaces the item shown by ONE entry (Today's own Re-roll).
		 * Instead of overwriting the row, the rolled-away row is marked
		 * outcome:'rejected' (keeping its own itemId so it's known what
		 * was rejected), and a fresh 'reroll' row is APPENDED for the item
		 * landed on. Consecutive re-rolls leave a chain of rejected rows
		 * plus one live row, all sharing the same eid. Rejected rows never
		 * count toward day totals; they power the per-item "re-rolled
		 * away" metric.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param entIdeStr - Entry Identifier String: The Today entry to re-roll.
		 * @param iteIdeStr - Item Identifier String: The item it swaps to.
		 * @param penArgObj - Pending Argument Object: The new item's staged
		 *                    consequences.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * swaIteFun(entIdeStr, iteIdeStr, penArgObj) // => void
		 * ```
		 *
		*/

		swaIteFun : ( entIdeStr, iteIdeStr, penArgObj ) => setAppStaObj( ( curStaObj ) => { // What: Swap Item Function. Why: Today's own Re-roll must swap the item one entry shows while keeping a record of what was rolled away. How: This points the entry at the new item with freshly staged pending, marks the old live log row rejected, and appends a new 'reroll' row under the same eid.


			const curEntObj = curStaObj.today.entries.find( ( entFinObj ) => entFinObj.eid === entIdeStr ); // What: Current Entry Object And Guard. Why: The undo-then-restage flow below needs to know whether this entry was already completed. How: This looks up entIdeStr in curStaObj.today.entries.

			let nexIteArr = curStaObj.items;         // What: Next Item Array. Why: This defaults to the unchanged items and is only replaced below when an already-completed entry needs its own pending undone first. How: This starts at curStaObj.items.
			let nexPicArr = curStaObj.pickers;       // What: Next Picker Array. Why: This defaults to the unchanged pickers and is only replaced below when an already-completed entry needs its own pending undone first. How: This starts at curStaObj.pickers.
			let nexLogArr = curStaObj.pickLog || []; // What: Next Pick-Log Array. Why: This defaults to the unchanged pick log and is only replaced below when an already-completed entry needs its own pending undone first. How: This starts at curStaObj.pickLog, defaulting to [].


			if ( curEntObj && curEntObj.done && curEntObj.revert ) { // What: Already-Done Undo Guard. Why: A re-roll always lands not-done, so an already-completed entry's own staged mutation must be undone first. How: This calls enpRevFun and adopts its own result when curEntObj is done and carries a revert snapshot.


				const resValObj = enpRevFun( { ...curStaObj }, curEntObj ); // What: Result Value Object. Why: enpRevFun returns the restored items/pickers/pickLog together. How: This calls enpRevFun with a shallow copy of curStaObj and curEntObj.

				nexIteArr = resValObj.items;   // What: Restored Items Array Adopt. Why: Every downstream line below must build on the RESTORED items, not the still-applied ones. How: This adopts resValObj's own items onto the outer nexIteArr binding.
				nexPicArr = resValObj.pickers; // What: Restored Pickers Array Adopt. Why: Every downstream line below must build on the RESTORED pickers, not the still-applied ones. How: This adopts resValObj's own pickers onto the outer nexPicArr binding.
				nexLogArr = resValObj.pickLog; // What: Restored Pick Log Array Adopt. Why: Every downstream line below must build on the RESTORED pick log, not the still-applied one. How: This adopts resValObj's own pickLog onto the outer nexLogArr binding.


			}



			const curRowObj = nexLogArr.find( ( logFinObj ) => logFinObj.eid === entIdeStr && !logFinObj.outcome ); // What: Current Row Object And Guard. Why: The live log row (if any) is where this entry's own current pickerId can still be read from. How: This finds the one row sharing entIdeStr with no outcome yet.

			const picIdeStr = curRowObj ? curRowObj.pickerId // What: Picker Identifier String. Why: The fresh reroll log row below needs a pickerId, preferring the live log row's own, falling back to the live entry's own. How: This reads curRowObj's own pickerId, else the matching today.entries row's own pickerId.
				: ( curStaObj.today.entries.find( ( entFinObj ) => entFinObj.eid === entIdeStr ) || {} ).pickerId; // What: Entry Picker Fallback. Why: With no live row, the entry itself still knows its picker. How: This reads the matching entry's own pickerId.

			let rejLogArr = nexLogArr.map( ( logMapObj ) => // What: Rejected Log Array. Why: The rolled-away row must be marked rejected, keeping its own itemId, before the fresh reroll row is appended. How: This flags the live row sharing entIdeStr as outcome:'rejected'.
				( logMapObj.eid === entIdeStr && !logMapObj.outcome ) ? { ...logMapObj, outcome : 'rejected' } : logMapObj ); // What: Reject Row Patch. Why: Only this entry's live row is rolled away. How: This marks it rejected and passes every other row through.


			if ( picIdeStr ) rejLogArr.push( logRowFun( { ...curStaObj, items : nexIteArr }, { eid : entIdeStr, itemId : iteIdeStr, pickerId : picIdeStr, source : 'reroll' } ) ); // What: Reroll Row Append. Why: Only when a picker id could actually be resolved does a fresh reroll row make sense to log. How: This pushes a new logRowFun row with source:'reroll' onto rejLogArr.



			return { // What: Next State Return. Why: The caller needs the entry re-pointed at iteIdeStr (not-done, not-skipped, freshly staged), plus the updated log. How: This spreads curStaObj with items/pickers/today.entries/pickLog all replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				items   : nexIteArr, // What: Items. Why: Any undone completion's own restored items must land in state. How: This is nexIteArr.
				pickers : nexPicArr, // What: Pickers. Why: Any undone completion's own restored pickers must land in state. How: This is nexPicArr.
				pickLog : rejLogArr, // What: Pick Log. Why: The rejected row and the fresh reroll row must both land in state. How: This is rejLogArr.

				today : { // What: Today. Why: The re-rolled entry itself must be re-pointed at its new item. How: This rebuilds today with only its own entries list replaced.


					...curStaObj.today, // What: Current Today Spread. Why: Every other today field (generatedAt, streakClaimed, ...) must carry over unchanged. How: This spreads curStaObj.today before the entries override below.

					entries : curStaObj.today.entries.map( ( entMapObj ) => entMapObj.eid === entIdeStr ? { ...entMapObj, done : false, itemId : iteIdeStr, pending : penArgObj || null, revert : null, skipped : false } : entMapObj ) // What: Entries. Why: A re-rolled entry always lands not-done and not-skipped, with its own freshly staged pending. How: This re-points the one entry matching entIdeStr at iteIdeStr and resets its own done/skipped/pending/revert.


				}


			};


		} ),

		// #endregion swaIteFun



		// #region togDonFun

		/**
		 * togDonFun = Toggle Done Function
		 *
		 * @summary
		 * The central done and undone mutation for a Today entry. From one toggle
		 * it applies (or reverts) the entry's staged pending, resolves the
		 * conditional consequences, updates the entry's live pick-log row and
		 * reconciles the streak.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param entIdeStr - Entry Identifier String: The Today entry to check or
		 *                    uncheck.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * togDonFun(entIdeStr) // => void
		 * ```
		 *
		*/

		togDonFun : ( entIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Toggle Done Function. Why: This is THE central done/undone mutation for a Today entry: it applies (or reverts) the entry's own staged pending, resolves conditional consequences, updates the live pick-log row, and reconciles the streak, all from one toggle. How: See the inline comments below for each step.


			const curEntObj = curStaObj.today.entries.find( ( entFinObj ) => entFinObj.eid === entIdeStr ); // What: Current Entry Object And Guard. Why: A stale entIdeStr (already removed) must be a no-op. How: This looks up entIdeStr in curStaObj.today.entries.


			if ( !curEntObj ) return curStaObj; // What: Missing-Entry Guard. Why: There's nothing to toggle when curEntObj wasn't found. How: This returns curStaObj unchanged.



			const nowDonBoo = !curEntObj.done; // What: Now Done Boolean. Why: Every branch below needs to know which direction this toggle is heading. How: This is the logical negation of curEntObj's own current done state.

			let nexIteArr = curStaObj.items;         // What: Next Item Array. Why: This defaults to the unchanged items and is replaced below by whichever branch fires. How: This starts at curStaObj.items.
			let nexPicArr = curStaObj.pickers;       // What: Next Picker Array. Why: This defaults to the unchanged pickers and is replaced below by whichever branch fires. How: This starts at curStaObj.pickers.
			let nexLogArr = curStaObj.pickLog || []; // What: Next Pick-Log Array. Why: This defaults to the unchanged pick log and is replaced below by whichever branch fires. How: This starts at curStaObj.pickLog, defaulting to [].
			let nexRevObj = null;                    // What: Next Revert Object. Why: Only the apply branch stages a fresh revert snapshot; the revert branch leaves this null. How: This starts at null.


			if ( nowDonBoo ) { // What: Apply Branch. Why: Marking DONE is what actually applies curEntObj's own staged pending mutation. How: This calls enpAplFun and adopts its own result, including the revert snapshot it returns.


				const resValObj = enpAplFun( { ...curStaObj }, curEntObj ); // What: Result Value Object. Why: enpAplFun returns the patched arrays plus a fresh revert snapshot together. How: This calls enpAplFun with a shallow copy of curStaObj and curEntObj.

				nexIteArr = resValObj.items;   // What: Patched Items Array Adopt. Why: Every downstream line below must build on the PATCHED items. How: This adopts resValObj's own items onto the outer nexIteArr binding.
				nexPicArr = resValObj.pickers; // What: Patched Pickers Array Adopt. Why: Every downstream line below must build on the PATCHED pickers. How: This adopts resValObj's own pickers onto the outer nexPicArr binding.
				nexLogArr = resValObj.pickLog; // What: Patched Pick Log Array Adopt. Why: Every downstream line below must build on the PATCHED pick log. How: This adopts resValObj's own pickLog onto the outer nexLogArr binding.
				nexRevObj = resValObj.revert;  // What: Fresh Revert Object Stage. Why: The entry being marked done needs a revert snapshot staged on it so unchecking it later can undo this exact mutation. How: This adopts resValObj's own revert onto the outer nexRevObj binding.


			}

			else { // What: Revert Branch. Why: Un-marking DONE must undo exactly whatever the apply branch above staged, using the entry's own prior revert snapshot. How: This calls enpRevFun and adopts its own result, clearing nexRevObj back to null.


				const resValObj = enpRevFun( { ...curStaObj }, curEntObj ); // What: Result Value Object. Why: enpRevFun returns the restored arrays together. How: This calls enpRevFun with a shallow copy of curStaObj and curEntObj.

				nexIteArr = resValObj.items;   // What: Reverted Items Array Adopt. Why: Every downstream line below must build on the REVERTED items. How: This adopts resValObj's own items onto the outer nexIteArr binding.
				nexPicArr = resValObj.pickers; // What: Reverted Pickers Array Adopt. Why: Every downstream line below must build on the REVERTED pickers. How: This adopts resValObj's own pickers onto the outer nexPicArr binding.
				nexLogArr = resValObj.pickLog; // What: Reverted Pick Log Array Adopt. Why: Every downstream line below must build on the REVERTED pick log. How: This adopts resValObj's own pickLog onto the outer nexLogArr binding.
				nexRevObj = null;              // What: Revert Object Clear. Why: An un-done entry no longer carries any revert snapshot of its own. How: This nulls nexRevObj.


			}



			const nexEntArr = curStaObj.today.entries.map( ( entMapObj ) => // What: Next Entry Array. Why: Only the toggled entry's own done/skipped/revert fields actually change. How: This maps today.entries, patching the one entry matching entIdeStr.
				entMapObj.eid === entIdeStr ? { ...entMapObj, done : nowDonBoo, revert : nexRevObj, skipped : false } : entMapObj ); // What: Toggled Entry Patch. Why: Only the toggled entry changes. How: This sets done, clears skipped, stores the revert snapshot, and passes every other entry through.

			const nexConArr = cotAplFun( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curEntObj, nowDonBoo ); // What: Next Conditionals Array. Why: A charge on the first dependent completion, or a day-off card reset/discharge, must be resolved against the ALREADY-toggled entries list. How: This calls cotAplFun against the patched items/pickers.
			const nexCdlArr = cdlAplFun( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curEntObj, nowDonBoo ); // What: Next Conditional-Log Array. Why: The matching cycle's own log row must be resolved against the same ALREADY-toggled entries list. How: This calls cdlAplFun against the patched items/pickers.

			nexLogArr = nexLogArr.map( ( curRowObj ) => ( curRowObj.eid === entIdeStr && !curRowObj.outcome ) // What: Live Log Row Toggle. Why: Only the live (active, non-rejected/non-skipped) row for this entry ever toggles its own done/completedAt. How: This stamps done/completedAt on the one matching row, leaving every other row untouched.
				? { ...curRowObj, completedAt : nowDonBoo ? new Date().toISOString() : null, done : nowDonBoo } // What: Toggled Row Branch. Why: The live row mirrors the entry's new done state. How: This sets done and stamps or clears completedAt.
				: curRowObj );                                                                                  // What: Other Row Branch. Why: Every other row is untouched. How: This passes curRowObj through.

			const { stkClaBoo, stkValNum } = stkSynFun( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curStaObj.tasks ); // What: Streak Reconcile. Why: Toggling any entry can flip whether today counts as fully done. How: This calls stkSynFun against the already-patched items/pickers and the already-toggled entries.



			return { // What: Next State Return. Why: Every affected field must land together on one fresh state. How: This spreads curStaObj with items/pickers/conditionals/conditionalLog/streak/today/pickLog all replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				conditionalLog : nexCdlArr,                                                             // What: Conditional Log. Why: A done/undone flip can open or close a conditional's own logged cycle. How: This is nexCdlArr.
				conditionals   : nexConArr,                                                             // What: Conditionals. Why: A done/undone flip can change a gating conditional's own charge. How: This is nexConArr.
				items          : nexIteArr,                                                             // What: Items. Why: The entry's own staged value/weight consequences land here. How: This is nexIteArr.
				pickers        : nexPicArr,                                                             // What: Pickers. Why: The entry's own staged picker-level consequences land here. How: This is nexPicArr.
				pickLog        : nexLogArr,                                                             // What: Pick Log. Why: The live row for this entry must reflect its new outcome. How: This is nexLogArr.
				streak         : stkValNum,                                                             // What: Streak. Why: The persisted streak count must reflect the reconciled verdict. How: This is stkValNum, from stkSynFun.
				today          : { ...curStaObj.today, entries : nexEntArr, streakClaimed : stkClaBoo } // What: Today. Why: Today's own entries and claimed flag must both reflect this change. How: This spreads curStaObj.today with entries replaced and streakClaimed set to stkClaBoo.


			};


		} )

		// #endregion togDonFun

		// #endregion Today Entries


	} ), [] ); // What: Actions Memo Dependency Array. Why: Every action closes over stable references (setAppStaObj, latStaRef, canPenFun), none of which ever change identity across renders, so this object never needs to be recomputed. How: An empty array means actStoObj is built exactly once, for the lifetime of this component.



	return [ appStaObj, actStoObj ]; // What: Store Tuple Return. Why: Every caller (AppRooCom) destructures this into its own state/actStoObj pair. How: This returns the current appStaObj alongside the memoized actStoObj object.


}

// #endregion useAppStaFun

// #endregion Hooks



// #region Exports

export { useAppStaFun }; // What: Use App State Function Export. Why: This hook is the entire app's own state layer, imported by app.jsx (and nowhere else). How: This re-exports the useAppStaFun function declared above by name.

// #endregion Exports


