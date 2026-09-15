


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library the whole store hook is built on. How: This is used directly (React.useState, React.useMemo, React.useEffect, React.useRef, React.useCallback) instead of importing individual named hooks.


import { CAD_NAM_OBJ               } from './cadence.js';               // What: Cadence. Why: Every picker's own daily/weekly/monthly/yearly surfacing schedule is computed by this module. How: This is called (enfWeeFun/norCadFun/isaCadFun) from migrate and from the picker-authoring actions below.
import { CLEAN_STATE               } from './seed.js';                 // What: Clean State. Why: A brand-new install, and a hard reset, both need this fresh empty-state shape rather than the design-time demo fixture. How: This is called by loadState and by the reset action below.
import { CON_NAM_OBJ               } from './conditionals.js';         // What: Conditionals. Why: Day-off gate resolution/advancement logic lives here, not in this file. How: This is called from resolveConditionalsForDay and from applyConditionalToggle below.
import { HOL_NAM_OBJ               } from './holidays.js';             // What: Holidays Namespace Object. Why: The holiday list backfill and the holiday-editing actions both need the canonical empty holidays shape. How: This is called (defStaFun) from migrate and from the holiday actions below.
import { normalizeConditionalName  } from './pickers.js';              // What: Normalize Conditional Name. Why: A newly-authored inline conditional's own name needs the same tidy Title-Case treatment as a picker's. How: This is called from addPicker and commitPickerEdit below.
import { normalizeGroupName        } from './pickers.js';              // What: Normalize Group Name. Why: A picker's own group label needs tidying/de-duplication in several places. How: This is called from migrate and from renameGroup/renamePageTours below.
import { normalizePickerName       } from './pickers.js';              // What: Normalize Picker Name. Why: A picker's own display name needs tidying wherever one is created or renamed. How: This is called from migrate, addPicker, commitPickerEdit, and renamePicker below.
import { OB_CHECKLIST              } from './onboarding-checklist.js'; // What: Onboarding Checklist. Why: Resolving a checklist item can flip the closing Generate card's own readiness. How: This is called (readyToGenerate) from setChecklistItem below.
import { OB_SAMPLE_PICKER_IDS      } from './onboarding-seed-data.js'; // What: Onboarding Sample Picker Ids. Why: A sample picker being (re)seeded must skip the normal name de-duplication so its canonical name stays intact. How: This is checked against inside addPicker below.
import { PICKERS                   } from './pickers.js';              // What: Pickers. Why: The item-authoring/editing actions need this module's own ease-band averaging and per-mode defaults. How: This is called (avgEase/DEFAULT_EASE) from addItem and commitPickerEdit below.
import { PWA                       } from './pwa.js';                  // What: Progressive Web App. Why: The very first picker a user creates is the first data worth protecting from storage eviction. How: This is called (noteFirstPicker) once, from inside addPicker below.
import { STORAGE                   } from './storage.js';              // What: Storage. Why: This is the actual persistence engine this file's own load/save/flush wrappers delegate to. How: This is called from loadState, saveState, flushState, and the reset/importData actions below.
import { TASKS                     } from './tasks.js';                // What: Tasks. Why: The reminders engine's own scheduling/eligibility/normalization logic lives here, not in this file. How: This is called throughout migrate, reconcileStreak, and the task actions below.

// #endregion Imports



/**
 * store.jsx = Store And Persisted-State Layer
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
 * is marked done (applyEntryPending/revertEntryPending), and unchecking
 * a done entry must exactly revert via entry.revert. Every action below
 * that touches an entry's own done/pending/revert fields must preserve
 * this staging.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const STO_KEY_STR = 'easemylife.v2'; // What: Storage Key String. Why: The localStorage fallback/mirror needs a fixed key to read/write under. How: This is read by loadState, saveState, and flushState below.



/**
 * SCH_VER_NUM = Schema Version Number
 *
 * @summary
 * The state schema version, stamped into state.v by migrate() and
 * therefore carried inside exported backup files. Distinct from the
 * IndexedDB database version (a structural concern of storage.js) and
 * from the eventual package.json release version. Bump this whenever a
 * new migration is added below, so an exported backup's own state.v
 * always reflects the shape it was actually migrated to.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const SCH_VER_NUM = 1; // What: Schema Version Number. Why: migrate() stamps this onto every loaded/imported state so an exported backup records the shape it was migrated to. How: This is read once, at the very end of migrate() below.



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


	try {


		// What: Rgb Zero-One Array. Why: The OKLab math below operates on linear-light RGB, not raw hex. How: This strips the leading '#', expands a 3-digit shorthand, parses the hex to an integer, and splits it into 0-1 channel values.
		const rgbZerArr = ( () => {

			const hexBarStr = hexColStr.replace( '#', '' ); // What: Hex Bare String. Why: The '#' prefix isn't part of the actual hex digits parseInt below needs. How: This strips it from hexColStr.
			const hexFulStr = hexBarStr.length === 3 // What: Hex Full String. Why: A 3-digit shorthand ('abc') must be expanded to 6 digits ('aabbcc') before parseInt can read it as a 24-bit color. How: This doubles each of the 3 characters when hexBarStr is that short, otherwise uses it as-is.
				? hexBarStr.split( '' ).map( ( curChrStr ) => curChrStr + curChrStr ).join( '' )
				: hexBarStr;
			const hexIntNum = parseInt( hexFulStr, 16 ); // What: Hex Integer Number. Why: The channel splits below need one plain 24-bit integer to bit-shift/mask against. How: This parses hexFulStr as base-16.


			return [ ( hexIntNum >> 16 & 255 ) / 255, ( hexIntNum >> 8 & 255 ) / 255, ( hexIntNum & 255 ) / 255 ]; // What: Rgb Zero-One Return. Why: The caller needs each channel scaled to the 0-1 range OKLab math expects. How: This bit-shifts/masks out red, green, then blue, each divided by 255.


		} )();

		// What: Srgb To Linear Function. Why: sRGB's own gamma curve must be undone before OKLab's linear-light math applies. How: This applies the standard sRGB-to-linear piecewise formula to one channel.
		const srgLinFun = ( sRgbChaNum ) => sRgbChaNum <= 0.04045 ? sRgbChaNum / 12.92 : Math.pow( ( sRgbChaNum + 0.055 ) / 1.055, 2.4 );

		// What: Linear To Srgb Function. Why: The final result must be re-encoded back into sRGB gamma before it's a displayable hex color. How: This applies the standard linear-to-sRGB piecewise formula to one clamped channel.
		const linSrgFun = ( linChaNum ) => {

			const claChaNum = Math.max( 0, Math.min( 1, linChaNum ) ); // What: Clamped Channel Number. Why: A channel driven outside 0-1 by the inversion math must be clamped before re-encoding. How: This clamps linChaNum into the [0,1] range.


			return claChaNum <= 0.0031308 ? claChaNum * 12.92 : 1.055 * Math.pow( claChaNum, 1 / 2.4 ) - 0.055; // What: Linear To Srgb Return. Why: The caller needs one re-encoded sRGB channel. How: This applies the piecewise sRGB encoding formula to claChaNum.


		};

		// What: Linear Rgb To Oklab Function. Why: Lightness must be inverted in OKLab space, not raw RGB, for a perceptually sane result. How: This applies Ottosson's own linear-RGB-to-OKLab matrix multiplication and cube roots.
		const linOklFun = ( [ linRedNum, linGrnNum, linBluNum ] ) => {

			const lmsLNum = 0.4122214708 * linRedNum + 0.5363325363 * linGrnNum + 0.0514459929 * linBluNum; // What: Lms L Number. Why: OKLab's own L/M/S cone response must be computed before the cube root below. How: This is the L-cone row of Ottosson's linear-RGB-to-LMS matrix.
			const lmsMNum = 0.2119034982 * linRedNum + 0.6806995451 * linGrnNum + 0.1073969566 * linBluNum; // What: Lms M Number. Why: OKLab's own L/M/S cone response must be computed before the cube root below. How: This is the M-cone row of Ottosson's linear-RGB-to-LMS matrix.
			const lmsSNum = 0.0883024619 * linRedNum + 0.2817188376 * linGrnNum + 0.6299787005 * linBluNum; // What: Lms S Number. Why: OKLab's own L/M/S cone response must be computed before the cube root below. How: This is the S-cone row of Ottosson's linear-RGB-to-LMS matrix.
			const cbrLNum = Math.cbrt( lmsLNum ), cbrMNum = Math.cbrt( lmsMNum ), cbrSNum = Math.cbrt( lmsSNum ); // What: Cube-Rooted Lms Numbers. Why: OKLab's own nonlinearity is a cube root of the LMS response, applied before the final matrix. How: This cube-roots each of lmsLNum/lmsMNum/lmsSNum.


			return [ // What: Oklab Triple Return. Why: The caller needs the L/a/b triple OKLab itself defines. How: This applies Ottosson's own LMS-to-OKLab matrix to the cube-rooted values above.

				0.2104542553 * cbrLNum + 0.7936177850 * cbrMNum - 0.0040720468 * cbrSNum,
				1.9779984951 * cbrLNum - 2.4285922050 * cbrMNum + 0.4505937099 * cbrSNum,
				0.0259040371 * cbrLNum + 0.7827717662 * cbrMNum - 0.8086757660 * cbrSNum,

			];


		};

		// What: Oklab To Linear Rgb Function. Why: Once lightness is inverted in OKLab, the result must be converted back to linear RGB before re-encoding. How: This applies Ottosson's own inverse OKLab-to-LMS matrix, cubes each term, then his inverse LMS-to-linear-RGB matrix.
		const oklLinFun = ( [ okLLitNum, okLANum, okLBNum ] ) => {

			const lmsLPriNum = okLLitNum + 0.3963377774 * okLANum + 0.2158037573 * okLBNum; // What: Lms L Prime Number. Why: OKLab's own inverse must first reconstruct the cube-rooted LMS terms before cubing them back. How: This is the L-term row of Ottosson's inverse OKLab-to-LMS matrix.
			const lmsMPriNum = okLLitNum - 0.1055613458 * okLANum - 0.0638541728 * okLBNum;       // What: Lms M Prime Number. Why: OKLab's own inverse must first reconstruct the cube-rooted LMS terms before cubing them back. How: This is the M-term row of Ottosson's inverse OKLab-to-LMS matrix.
			const lmsSPriNum = okLLitNum - 0.0894841775 * okLANum - 1.2914855480 * okLBNum;       // What: Lms S Prime Number. Why: OKLab's own inverse must first reconstruct the cube-rooted LMS terms before cubing them back. How: This is the S-term row of Ottosson's inverse OKLab-to-LMS matrix.
			const lmsLNum = lmsLPriNum * lmsLPriNum * lmsLPriNum; // What: Lms L Number. Why: The cube root taken on the forward pass must be undone by cubing here. How: This cubes lmsLPriNum.
			const lmsMNum = lmsMPriNum * lmsMPriNum * lmsMPriNum; // What: Lms M Number. Why: The cube root taken on the forward pass must be undone by cubing here. How: This cubes lmsMPriNum.
			const lmsSNum = lmsSPriNum * lmsSPriNum * lmsSPriNum; // What: Lms S Number. Why: The cube root taken on the forward pass must be undone by cubing here. How: This cubes lmsSPriNum.


			return [ // What: Linear Rgb Triple Return. Why: The caller needs plain linear-light RGB, ready for the sRGB re-encoding step. How: This applies Ottosson's own inverse LMS-to-linear-RGB matrix to lmsLNum/lmsMNum/lmsSNum.

				4.0767416621 * lmsLNum - 3.3077115913 * lmsMNum + 0.2309699292 * lmsSNum,
				-1.2684380046 * lmsLNum + 2.6097574011 * lmsMNum - 0.3413193965 * lmsSNum,
				-0.0041960863 * lmsLNum - 0.7034186147 * lmsMNum + 1.7076147010 * lmsSNum,

			];


		};

		let [ okLLitNum, okLANum, okLBNum ] = linOklFun( rgbZerArr.map( srgLinFun ) ); // What: Oklab Triple And Guard. Why: The rest of this function inverts and re-encodes this exact triple. How: This converts rgbZerArr through the linear-light/OKLab pipeline built above.

		// What: Chroma Near-Zero Guard. Why: Near-neutral colors carry a tiny residual a/b from floating-point noise in the forward conversion, which gets amplified when inverting an extreme lightness (e.g. a near-white background would invert to a visibly red-tinted near-black instead of neutral). How: This clamps a/b to true zero whenever their combined magnitude is below a small threshold.
		if ( Math.hypot( okLANum, okLBNum ) < 0.02 ) { okLANum = 0; okLBNum = 0; }

		const invRgbArr = oklLinFun( [ 1 - okLLitNum, okLANum, okLBNum ] ) // What: Inverted Rgb Array. Why: This is the actual lightness inversion (1 - L), converted back to a displayable channel range. How: This inverts okLLitNum, converts back to linear RGB, re-encodes to sRGB, then scales/rounds each channel to a 0-255 integer.
			.map( linSrgFun )
			.map( ( sRgbChaNum ) => Math.round( sRgbChaNum * 255 ) );


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
	const baseNamStr = ( namRawStr || '' ).trim(); // What: Base Name String. Why: The candidate itself needs the same trim before it's compared or returned. How: This trims namRawStr, falling back to an empty string.

	if ( !takNamSet.has( baseNamStr.toLowerCase() ) ) return baseNamStr; // What: No-Collision Guard. Why: A name that doesn't collide at all needs no renumbering. How: This returns baseNamStr unchanged as soon as its lowercase form isn't in takNamSet.

	const stpNamStr = baseNamStr.replace( /\s*\(\d+\)$/, '' ); // What: Stripped Name String. Why: A name that already ends in " (N)" must be re-numbered from its own bare base, not stacked again. How: This strips a trailing " (N)" suffix from baseNamStr, if present.
	let sufNumNum = 2; // What: Suffix Number And Guard. Why: The loop below needs a running candidate suffix, starting at the first number that could possibly be free. How: This starts at 2 and is incremented until a free suffix is found.


	while ( takNamSet.has( `${ stpNamStr } (${ sufNumNum })`.toLowerCase() ) ) sufNumNum++; // What: Free-Suffix Search Loop. Why: Every already-taken suffix must be skipped until a genuinely free one is found. How: This keeps incrementing sufNumNum while its candidate string is still present in takNamSet.



	return `${ stpNamStr } (${ sufNumNum })`; // What: Numbered Name Return. Why: The caller needs the final, guaranteed-unique name. How: This combines stpNamStr with the first free sufNumNum found above.


}

// #endregion uniNamFun



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

let __plSeqNum = 0; // What: Pick-Log Sequence Number. Why: newLogFun below needs a shared counter across every call so two ids minted in the same millisecond still differ. How: This starts at 0 and is incremented once per newLogFun call.

function newLogFun() {


	return 'pl_' + Date.now().toString( 36 ) + ( __plSeqNum++ ).toString( 36 ); // What: Pick-Log Id Return. Why: The caller needs a short, sortable, collision-resistant id. How: This concatenates a fixed prefix, the current time base-36, and the incrementing counter base-36.


}

// #endregion newLogFun



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

let __clSeqNum = 0; // What: Conditional-Log Sequence Number. Why: nclIdeFun below needs its own shared counter, separate from newLogFun's, so ids minted in the same millisecond still differ. How: This starts at 0 and is incremented once per nclIdeFun call.

function nclIdeFun() {


	return 'cl_' + Date.now().toString( 36 ) + ( __clSeqNum++ ).toString( 36 ); // What: Conditional-Log Id Return. Why: The caller needs a short, sortable, collision-resistant id. How: This concatenates a fixed prefix, the current time base-36, and the incrementing counter base-36.


}

// #endregion nclIdeFun



// #region isoDayFun

/**
 * isoDayFun = Iso Day Function
 *
 * @summary
 * Converts a Date into its own local-timezone calendar day, as a plain
 * 'YYYY-MM-DD' string. Every pick/conditional/reminder log row and
 * every day-scoped comparison in this file goes through this, so "today"
 * always means the same local calendar day everywhere.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param datInpObj - Date Input Object: The date to convert; defaults to the
 *                    current moment when omitted.
 *
 * @returns datInpObj's own local calendar day, as a 'YYYY-MM-DD' string.
 *
 * @example
 * ```ts
 * isoDayFun(new Date()) // => 'YYYY-MM-DD'
 * ```
 *
*/

const isoDayFun = ( datInpObj = new Date() ) => {


	const datCopObj = new Date( datInpObj ); // What: Date Copy Object. Why: datInpObj itself must not be mutated by the timezone shift below. How: This constructs a fresh Date instance from datInpObj.

	datCopObj.setMinutes( datCopObj.getMinutes() - datCopObj.getTimezoneOffset() ); // What: Date Copy Minutes Adjustment. Why: Shifting by the local timezone offset is what makes the ISO string below reflect the local calendar day instead of UTC's. How: This subtracts the local timezone offset, in minutes, from the copy's own minutes.



	return datCopObj.toISOString().slice( 0, 10 ); // What: Iso Day String Return. Why: The caller only wants the calendar-day portion, not a full timestamp. How: This takes the shifted copy's own ISO string and slices off everything after the first 10 characters.


};

// #endregion isoDayFun




/**
 * store.jsx = Pick Log
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
 * @param curStaObj    - Current State Object: The current state, read (not
 *                       mutated) to look up the item/picker being logged.
 * @param logFieObj.eid         - Eid: Links the row to its live today.entries
 *                                row; defaults to null.
 * @param logFieObj.pickerId    - Picker Id: The picker the pick belongs to.
 * @param logFieObj.itemId      - Item Id: The item that was picked.
 * @param logFieObj.source      - Source: How the pick was made: 'auto' |
 *                                'manual' | 'reroll'.
 * @param logFieObj.date        - Date: The 'YYYY-MM-DD' to stamp the row with;
 *                                defaults to today.
 * @param logFieObj.depletedEnd - Depleted End: Whether this row ends an Ease
 *                                Down depletion streak; defaults to false.
 *
 * @returns A new pickLog row, in state.pickLog's own shape.
 *
 * @example
 * ```ts
 * logRowFun(curStaObj, { pickerId, itemId, source: 'auto' }) // => row
 * ```
 *
*/

function logRowFun( curStaObj, { eid = null, pickerId, itemId, source, date, depletedEnd = false } ) {


	const curIteObj = curStaObj.items.find( ( iteFinObj ) => iteFinObj.id === itemId );    // What: Current Item Object And Guard. Why: The row below needs the item's own live name, or a removed-item fallback. How: This looks up itemId in curStaObj.items, undefined once removed.
	const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === pickerId ); // What: Current Picker Object And Guard. Why: The row below needs the picker's own live name/group, or removed-picker fallbacks. How: This looks up pickerId in curStaObj.pickers, undefined once removed.


	return { // What: Pick-Log Row Return. Why: The caller needs one fresh row shaped to state.pickLog's own contract. How: This builds the row from every argument plus the lookups above.


		id          : newLogFun(),                              // What: Id. Why: Every row needs its own stable, unique identifier. How: This mints one via newLogFun.
		eid         : eid,                                       // What: Entry Id. Why: This links the row back to its live today.entries row, until the day rolls. How: This is copied straight from the eid parameter.
		date        : date || isoDayFun(),                       // What: Date. Why: Stats groups/filters rows by their own calendar day. How: This uses the given date, defaulting to isoDayFun() when omitted.
		pickerId    : pickerId,                                  // What: Picker Id. Why: Every row must record which picker it belongs to. How: This is copied straight from the pickerId parameter.
		itemId      : itemId,                                    // What: Item Id. Why: Every row must record which item it belongs to. How: This is copied straight from the itemId parameter.
		itemName    : curIteObj ? curIteObj.name : '(removed)',  // What: Item Name. Why: This denormalized copy lets the row survive a later rename or deletion of the item itself. How: This reads curIteObj's own name, else a removed-item placeholder.
		pickerName  : curPicObj ? curPicObj.name : '(removed)',  // What: Picker Name. Why: This denormalized copy lets the row survive a later rename or deletion of the picker itself. How: This reads curPicObj's own name, else a removed-picker placeholder.
		group       : curPicObj ? curPicObj.group : '',          // What: Group. Why: Stats groups rows by their own picker's group. How: This reads curPicObj's own group, else empty when the picker is gone.
		done        : false,                                     // What: Done. Why: A freshly-logged pick was never yet completed. How: This is always false for a brand-new row.
		completedAt : null,                                      // What: Completed At. Why: A freshly-logged pick has no completion timestamp yet. How: This is always null for a brand-new row.
		source      : source,                                    // What: Source. Why: Stats breaks rows down by how the pick was made. How: This is copied straight from the source parameter.
		...( depletedEnd ? { depletedEnd : true } : {} )         // What: Depleted End Spread. Why: Only a row ending an Ease Down depletion streak needs this flag at all. How: This spreads in depletedEnd:true only when the depletedEnd parameter is truthy.


	};


}

// #endregion logRowFun



/**
 * store.jsx = Done-Gated Pick Mutations
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
 * living on tab-today.jsx's EntryEditor, patched via updateItem below)
 * is meant to win immediately, so it deliberately bypasses this
 * staging. But ease-up/dynamic pick()s stash an updates row for EVERY
 * pool item on each not-yet-done entry's own pending, not just the one
 * actually picked (see pick()'s own ease-up/dynamic cases in
 * pickers.js), snapshotted from value at generation time. Left alone,
 * later completing a SIBLING entry for the same picker would silently
 * overwrite the fresh direct edit with that stale snapshot via
 * applyEntryPending below, which is the actual bug dropStalePending
 * UpdatesFun exists to prevent (items looked like they "lost" a manual
 * Fill/Refill/Reset). It strips the touched item's own stale row from
 * every OTHER entry's pending; an item's OWN entry is left alone on
 * purpose, since its completion is still supposed to perform its
 * designed effect regardless of an interim Fill.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region dropStalePendingUpdates

/**
 * dropStalePendingUpdates = Drop Stale Pending Updates
 *
 * @summary
 * Strips any stale updates row for the given item ids from every NOT-
 * YET-DONE entry's own pending, except an entry whose own itemId is one
 * of those ids (see the design-rationale comment above). See the
 * design-rationale comment above for why this exists at all.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param entArr - Entry Array: The today.entries array to scan.
 * @param iteIdsArr - Item Ids Array: The item ids whose stale pending rows
 *                    should be dropped.
 *
 * @returns The same entArr reference when nothing changed, else a new
 * array with the affected entries' own pending.updates filtered.
 *
 * @example
 * ```ts
 * dropStalePendingUpdates(state.today.entries, [itemId]) // => entries
 * ```
 *
*/

function dropStalePendingUpdates( entArr, iteIdsArr ) {


	const iteIdeSet = new Set( iteIdsArr ); // What: Item Ids Set. Why: The scan below needs fast membership checks against the touched ids. How: This wraps iteIdsArr in a Set.

	if ( !iteIdeSet.size ) return entArr; // What: No-Ids Guard. Why: Nothing was touched, so there's nothing stale to drop. How: This returns entArr unchanged when iteIdeSet is empty.

	let dirBoo = false; // What: Dirty Boolean And Guard. Why: The caller only wants a new array reference when something actually changed. How: This starts false and flips true the first time a pending.updates row is actually dropped below.


	const nextEntArr = entArr.map( ( curEntObj ) => { // What: Next Entries Map. Why: Every entry must be checked for a stale pending row belonging to one of the touched items. How: This maps entArr, returning each entry unchanged unless it needs its own pending.updates filtered.


		if ( curEntObj.done || !curEntObj.pending || !curEntObj.pending.updates || !curEntObj.pending.updates.length ) return curEntObj; // What: Nothing-To-Strip Guard. Why: A done entry's pending no longer matters, and an entry with no pending.updates has nothing to filter. How: This returns curEntObj unchanged whenever any of those hold.

		if ( iteIdeSet.has( curEntObj.itemId ) ) return curEntObj; // What: Own-Entry Guard. Why: An item's OWN entry must keep its designed completion effect regardless of an interim Fill (see the design-rationale comment above). How: This returns curEntObj unchanged when its own itemId is one of the touched ids.

		const filUpdArr = curEntObj.pending.updates.filter( ( curUpdObj ) => !iteIdeSet.has( curUpdObj.id ) ); // What: Filtered Updates Array. Why: Only rows for OTHER touched items are the actual stale ones to drop. How: This keeps every update row whose own id isn't in iteIdeSet.

		if ( filUpdArr.length === curEntObj.pending.updates.length ) return curEntObj; // What: Unchanged-Length Guard. Why: Nothing was actually dropped for this entry, so its own reference can stay stable. How: This returns curEntObj unchanged when filUpdArr's own length matches the original.

		dirBoo = true; // What: Dirty Flag Set. Why: At least one entry's own pending.updates was actually filtered. How: This flips dirBoo to true.


		return { ...curEntObj, pending : { ...curEntObj.pending, updates : filUpdArr } }; // What: Filtered Entry Return. Why: The caller needs this entry's own pending.updates replaced with the stale rows stripped. How: This spreads curEntObj and its own pending, overriding just updates.


	} );


	return dirBoo ? nextEntArr : entArr; // What: Conditional Array Return. Why: The caller relies on reference equality to know nothing changed. How: This returns nextEntArr only when dirBoo is true, else the original entArr.


}

// #endregion dropStalePendingUpdates




// #region applyEntryPending

/**
 * applyEntryPending = Apply Entry Pending
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
 * applyEntryPending(state, entry) // => { items, pickers, pickLog, revert }
 * ```
 *
*/

function applyEntryPending( curStaObj, curEntObj ) {


	const curPenObj = curEntObj.pending; // What: Current Pending Object And Guard. Why: Every mutation below is driven entirely by this entry's own staged pending payload. How: This reads curEntObj's own pending field.

	if ( !curPenObj ) return { items : curStaObj.items, pickers : curStaObj.pickers, pickLog : curStaObj.pickLog || [], revert : null }; // What: No-Pending Guard. Why: An entry with nothing staged has nothing to apply. How: This returns the state's own arrays untouched, with revert:null.

	const updIdeMap = new Map( ( curPenObj.updates || [] ).map( ( curUpdObj ) => [ curUpdObj.id, curUpdObj ] ) ); // What: Update Identifier Map. Why: The items map below needs O(1) lookup of a touched item's own staged update. How: This maps every pending.updates row by its own id.
	const touIdeSet = new Set( [ ...( curPenObj.updates || [] ).map( ( curUpdObj ) => curUpdObj.id ), curPenObj.pickedId ].filter( Boolean ) ); // What: Touched Identifier Set. Why: Both the revert snapshot and the items map below need to know every item id this pending payload actually touches. How: This unions every updates row's own id with pickedId, dropping falsy entries.

	const revIteArr = curStaObj.items.filter( ( curIteObj ) => touIdeSet.has( curIteObj.id ) ).map( ( curIteObj ) => ( // What: Revert Item Array. Why: An exact undo later needs each touched item's own pre-apply snapshot. How: This filters to just the touched items and copies their own value/weight/picks/lastPicked/chargeStep.

		{ id : curIteObj.id, value : curIteObj.value, weight : curIteObj.weight, picks : curIteObj.picks, lastPicked : curIteObj.lastPicked, chargeStep : curIteObj.chargeStep }

	) );

	const nowIsoStr = new Date().toISOString(); // What: Now Iso String. Why: A picked-and-bumped item needs a real completion timestamp. How: This reads the current instant as an ISO string.

	const nexIteArr = curStaObj.items.map( ( curIteObj ) => { // What: Next Item Array. Why: Every item must be checked for a staged update or a pick bump before the caller gets a fresh items array. How: This maps curStaObj.items, applying updIdeMap's own patch and/or the pick bump to a touched item, leaving everything else unchanged.


		if ( !touIdeSet.has( curIteObj.id ) ) return curIteObj; // What: Untouched-Item Guard. Why: An item this pending payload never mentions must pass through unchanged. How: This returns curIteObj unchanged when it isn't in touIdeSet.

		const matUpdObj = updIdeMap.get( curIteObj.id ); // What: Matched Update Object And Guard. Why: This item may or may not have its own staged value/weight/chargeStep patch. How: This looks up curIteObj's own id in updIdeMap, undefined when only pickedId touched it.
		const nexIteObj = { ...curIteObj }; // What: Next Item Object. Why: The patch below must not mutate curIteObj itself. How: This starts as a shallow copy of curIteObj.

		if ( matUpdObj ) { // What: Staged Patch Application. Why: Only the fields actually present on matUpdObj are meant to change. How: This conditionally overwrites value/weight/chargeStep on nexIteObj when each key is present on matUpdObj.


			if ( 'value' in matUpdObj ) nexIteObj.value = matUpdObj.value;           // What: Value Patch. Why: An updates row only sometimes carries a new value. How: This applies matUpdObj's own value only when the key is present.
			if ( 'weight' in matUpdObj ) nexIteObj.weight = matUpdObj.weight;       // What: Weight Patch. Why: An updates row only sometimes carries a new weight. How: This applies matUpdObj's own weight only when the key is present.
			if ( 'chargeStep' in matUpdObj ) nexIteObj.chargeStep = matUpdObj.chargeStep; // What: Charge Step Patch. Why: An updates row only sometimes carries a new chargeStep. How: This applies matUpdObj's own chargeStep only when the key is present.


		}

		if ( curIteObj.id === curPenObj.pickedId && curPenObj.bumpPick ) { nexIteObj.picks = ( curIteObj.picks || 0 ) + 1; nexIteObj.lastPicked = nowIsoStr; } // What: Pick Bump Guard. Why: Only the actually-picked item, and only when bumpPick was requested, gets its own picks/lastPicked bumped. How: This increments picks and stamps lastPicked on nexIteObj when both conditions hold.


		return nexIteObj; // What: Next Item Return. Why: The caller needs this item's own patched copy. How: This returns nexIteObj, built above.


	} );

	const havPicPatBoo = !!curPenObj.pickerPatch; // What: Have Picker Patch Boolean. Why: Both the previous-active lookup and the pickers map below share this same condition. How: This coerces curPenObj's own pickerPatch to a real boolean.

	const preActIde = havPicPatBoo // What: Previous Active Identifier. Why: The revert snapshot needs the picker's own activeItemId as it stood BEFORE this apply, but only when a pickerPatch is actually being applied. How: This looks up curEntObj's own picker and reads its current activeItemId, else stays undefined.
		? ( curStaObj.pickers.find( ( curPicObj ) => curPicObj.id === curEntObj.pickerId ) || {} ).activeItemId
		: undefined;

	const nexPicArr = havPicPatBoo // What: Next Picker Array. Why: Only a pending payload carrying pickerPatch (e.g. Ease Down's activeItemId) needs any picker actually rewritten. How: This patches curEntObj's own picker with pickerPatch's own fields, else passes pickers through unchanged.
		? curStaObj.pickers.map( ( curPicObj ) => curPicObj.id === curEntObj.pickerId ? { ...curPicObj, ...curPenObj.pickerPatch } : curPicObj )
		: curStaObj.pickers;

	const nexLogArr = curPenObj.depletedEnd // What: Next Pick-Log Array. Why: depletedEnd is a value consequence, so it's only recorded on the live log row once the pending payload is actually applied. How: This flags the live (no outcome) row sharing curEntObj's own eid, else passes pickLog through unchanged.
		? ( curStaObj.pickLog || [] ).map( ( curRowObj ) => ( curRowObj.eid === curEntObj.eid && !curRowObj.outcome ) ? { ...curRowObj, depletedEnd : true } : curRowObj )
		: ( curStaObj.pickLog || [] );


	return { // What: Applied Pending Result Return. Why: The caller (toggleDone) needs the patched arrays plus a revert snapshot to stash on the entry. How: This bundles nexIteArr/nexPicArr/nexLogArr with a revert object capturing revIteArr/preActIde/the entry's own pickerId.

		items : nexIteArr, pickers : nexPicArr, pickLog : nexLogArr,
		revert : { items : revIteArr, activeItemId : preActIde, pickerId : curEntObj.pickerId }

	};


}

// #endregion applyEntryPending



// #region revertEntryPending

/**
 * revertEntryPending = Revert Entry Pending
 *
 * @summary
 * Exactly undoes applyEntryPending's own effect using the entry.revert
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
 * revertEntryPending(state, entry) // => { items, pickers, pickLog }
 * ```
 *
*/

function revertEntryPending( curStaObj, curEntObj ) {


	const curRevObj = curEntObj.revert; // What: Current Revert Object And Guard. Why: Every restoration below is driven entirely by this entry's own recorded snapshot. How: This reads curEntObj's own revert field.

	if ( !curRevObj ) return { items : curStaObj.items, pickers : curStaObj.pickers, pickLog : curStaObj.pickLog || [] }; // What: No-Revert Guard. Why: An entry that was never applied (or already reverted) has nothing to restore. How: This returns the state's own arrays untouched.

	const revIdeMap = new Map( curRevObj.items.map( ( curSnpObj ) => [ curSnpObj.id, curSnpObj ] ) ); // What: Revert Identifier Map. Why: The items map below needs O(1) lookup of each item's own pre-apply snapshot. How: This maps every curRevObj.items row by its own id.

	const nexIteArr = curStaObj.items.map( ( curIteObj ) => { // What: Next Item Array. Why: Every item must be checked for a matching snapshot to restore. How: This maps curStaObj.items, restoring a matched item's own value/weight/picks/lastPicked/chargeStep, else leaving it unchanged.


		const matRevObj = revIdeMap.get( curIteObj.id ); // What: Matched Revert Object And Guard. Why: Only items this snapshot actually covers get restored. How: This looks up curIteObj's own id in revIdeMap, undefined when it wasn't touched.


		return matRevObj // What: Restored Item Return. Why: The caller needs either the restored copy or the item untouched. How: This spreads curIteObj with matRevObj's own fields when matched, else returns curIteObj as-is.
			? { ...curIteObj, value : matRevObj.value, weight : matRevObj.weight, picks : matRevObj.picks, lastPicked : matRevObj.lastPicked, chargeStep : matRevObj.chargeStep }
			: curIteObj;


	} );

	const nexPicArr = ( curRevObj.activeItemId !== undefined ) // What: Next Picker Array. Why: Only a snapshot that actually recorded a previous activeItemId needs any picker rewritten back. How: This restores curRevObj's own pickerId's activeItemId, else passes pickers through unchanged.
		? curStaObj.pickers.map( ( curPicObj ) => curPicObj.id === curRevObj.pickerId ? { ...curPicObj, activeItemId : curRevObj.activeItemId } : curPicObj )
		: curStaObj.pickers;

	const nexLogArr = ( curStaObj.pickLog || [] ).map( ( curRowObj ) => // What: Next Pick-Log Array. Why: A reverted day no longer counts as ending an Ease Down depletion streak. How: This strips depletedEnd back to false on the live (no outcome) row sharing curEntObj's own eid.
		( curRowObj.eid === curEntObj.eid && !curRowObj.outcome ) ? { ...curRowObj, depletedEnd : false } : curRowObj );


	return { items : nexIteArr, pickers : nexPicArr, pickLog : nexLogArr }; // What: Reverted Result Return. Why: The caller (toggleDone/skipEntry/setEntryItem) needs the restored arrays. How: This bundles nexIteArr/nexPicArr/nexLogArr together.


}

// #endregion revertEntryPending




// #region applyConditionalToggle

/**
 * applyConditionalToggle = Apply Conditional Toggle
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
 * @param nowDoneBoo - Now Done Boolean: Whether togEntObj is now done (true)
 *                     or was just un-done (false).
 *
 * @returns The updated conditionals array, or the same reference when
 * nothing about it actually changes.
 *
 * @example
 * ```ts
 * applyConditionalToggle(state, nextEntries, entry, true) // => conditionals
 * ```
 *
*/

function applyConditionalToggle( curStaObj, nexEntArr, togEntObj, nowDoneBoo ) {


	const curConArr = curStaObj.conditionals || []; // What: Current Conditionals Array And Guard. Why: Every branch below reads/maps over the live conditionals list. How: This reads curStaObj's own conditionals, defaulting to empty.

	if ( !curConArr.length ) return curConArr; // What: No-Conditionals Guard. Why: An app with no conditionals at all has nothing to resolve. How: This returns curConArr unchanged when it's empty.

	const conModObj = CON_NAM_OBJ; // What: Conditional Module Object. Why: Every branch below repeatedly calls into this module's own resolution helpers. How: This aliases the imported CON_NAM_OBJ namespace for brevity below.

	if ( togEntObj.kind === 'dayoff' && togEntObj.conditionalId ) { // What: Day-Off Card Branch. Why: A day-off card entry's own completion drives its conditional's carComFun instead of the dependent-picker charging logic below. How: This maps curConArr, resolving only the one matching conditional.


		return curConArr.map( ( curConObj ) => {


			if ( curConObj.id !== togEntObj.conditionalId ) return curConObj; // What: Non-Matching Guard. Why: Every other conditional is untouched by this card's own toggle. How: This returns curConObj unchanged when its own id doesn't match.

			if ( nowDoneBoo ) { // What: Now-Done Branch. Why: Completing the card is what actually drives its own mode-specific completion effect. How: This calls carComFun and snapshots the pre-effect fields into _cardPrev before applying its own patch.


				const patValObj = conModObj.carComFun( curConObj ); // What: Patch Value Object And Guard. Why: Some modes (probability) treat completion as informational only, returning no patch. How: This calls conModObj's own carComFun on curConObj.

				if ( !patValObj ) return curConObj; // What: No-Patch Guard. Why: A probability-mode card has nothing to actually mutate on completion. How: This returns curConObj unchanged when patValObj is falsy.


				return { ...curConObj, _cardPrev : { value : curConObj.value, triggered : curConObj.triggered, chargeStep : curConObj.chargeStep }, ...patValObj }; // What: Applied Card Patch Return. Why: The caller needs curConObj patched, with its own pre-effect fields snapshotted for undo. How: This spreads curConObj, its own _cardPrev snapshot, then patValObj's own fields.


			}

			const preSnpObj = curConObj._cardPrev; // What: Previous Snapshot Object And Guard. Why: Un-completing the card only makes sense if it actually recorded a snapshot to restore. How: This reads curConObj's own _cardPrev field.

			if ( !preSnpObj ) return curConObj; // What: No-Snapshot Guard. Why: A card that was never completed (or already reverted) has nothing to restore. How: This returns curConObj unchanged when preSnpObj is falsy.

			const { _cardPrev, ...remFieObj } = curConObj; // What: Remaining Fields Object. Why: The restored object below must drop the now-consumed _cardPrev snapshot. How: This destructures _cardPrev off curConObj, keeping every other field in remFieObj.


			return { ...remFieObj, value : preSnpObj.value, triggered : preSnpObj.triggered, chargeStep : preSnpObj.chargeStep }; // What: Restored Card Return. Why: The caller needs curConObj's own pre-completion fields restored exactly. How: This spreads remFieObj, overriding value/triggered/chargeStep from preSnpObj.


		} );


	}

	const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === togEntObj.pickerId ); // What: Current Picker Object And Guard. Why: A dependent entry's own conditional is looked up through its picker, not the entry itself. How: This looks up togEntObj's own pickerId in curStaObj.pickers.
	const conIdeStr = curPicObj && curPicObj.conditionalId; // What: Conditional Identifier String And Guard. Why: An entry whose picker has no conditionalId gates nothing. How: This reads curPicObj's own conditionalId, or stays falsy when curPicObj is missing.

	if ( !conIdeStr ) return curConArr; // What: No-Conditional Guard. Why: An ungated picker's entry has no dependent conditional to charge. How: This returns curConArr unchanged when conIdeStr is falsy.

	const depDonNum = nexEntArr.filter( ( curEntObj ) => { // What: Dependent Done Number. Why: The charging edge below only fires on the FIRST dependent completion of the day, so every OTHER done dependent entry for this same conditional must be counted. How: This counts entries (excluding day-off cards) whose own picker shares conIdeStr and are done.


		if ( curEntObj.kind === 'dayoff' || !curEntObj.done ) return false; // What: Non-Dependent Guard. Why: A day-off card, or an entry that isn't done, never counts as a dependent completion. How: This excludes both cases from the count.

		const matPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === curEntObj.pickerId ); // What: Matched Picker Object And Guard. Why: Only an entry whose own picker shares this exact conditional counts. How: This looks up curEntObj's own pickerId in curStaObj.pickers.


		return matPicObj && matPicObj.conditionalId === conIdeStr; // What: Dependent Match Return. Why: The filter above needs a plain boolean verdict. How: This is true only when matPicObj exists and shares conIdeStr.


	} ).length;


	return curConArr.map( ( curConObj ) => { // What: Charged Conditionals Return. Why: Only the one matching value-mode conditional can advance or revert here. How: This maps curConArr, resolving the charging/reverting edges for the matching conditional only.


		if ( curConObj.id !== conIdeStr || !conModObj.modValFun( curConObj.mode ) ) return curConObj; // What: Non-Matching Guard. Why: Every other conditional, and a non-value-mode match, is untouched here. How: This returns curConObj unchanged when either condition holds.

		if ( nowDoneBoo && depDonNum === 1 && !curConObj.chargedToday ) { // What: Charging-Edge Branch. Why: The FIRST dependent completion of an as-yet-uncharged day is what actually advances the conditional's own value. How: This calls advValFun and snapshots the pre-effect fields into _chargePrev before applying its own patch.


			const patValObj = conModObj.advValFun( curConObj ); // What: Patch Value Object And Guard. Why: Some modes may decline to advance at all. How: This calls conModObj's own advValFun on curConObj.

			if ( !patValObj ) return curConObj; // What: No-Patch Guard. Why: A decline to advance leaves curConObj with nothing to mutate. How: This returns curConObj unchanged when patValObj is falsy.


			return { ...curConObj, _chargePrev : { value : curConObj.value, triggered : curConObj.triggered, chargedToday : curConObj.chargedToday, chargeStep : curConObj.chargeStep }, ...patValObj }; // What: Applied Charge Patch Return. Why: The caller needs curConObj patched, with its own pre-effect fields snapshotted for undo. How: This spreads curConObj, its own _chargePrev snapshot, then patValObj's own fields.


		}

		if ( !nowDoneBoo && depDonNum === 0 && curConObj._chargePrev ) { // What: Reverting-Edge Branch. Why: Once the LAST dependent completion of the day is un-done, the earlier charge must be undone too. How: This restores curConObj's own pre-charge fields from _chargePrev.


			const preSnpObj = curConObj._chargePrev; // What: Previous Snapshot Object. Why: The restoration below needs the exact pre-charge fields recorded earlier. How: This reads curConObj's own _chargePrev field.
			const { _chargePrev, ...remFieObj } = curConObj; // What: Remaining Fields Object. Why: The restored object below must drop the now-consumed _chargePrev snapshot. How: This destructures _chargePrev off curConObj, keeping every other field in remFieObj.


			return { ...remFieObj, value : preSnpObj.value, triggered : preSnpObj.triggered, chargedToday : preSnpObj.chargedToday, chargeStep : preSnpObj.chargeStep }; // What: Restored Charge Return. Why: The caller needs curConObj's own pre-charge fields restored exactly. How: This spreads remFieObj, overriding value/triggered/chargedToday/chargeStep from preSnpObj.


		}


		return curConObj; // What: Unchanged Conditional Return. Why: Neither edge condition applied, so curConObj passes through untouched. How: This returns curConObj as-is.


	} );


}

// #endregion applyConditionalToggle



// #region applyConditionalLog

/**
 * applyConditionalLog = Apply Conditional Log
 *
 * @summary
 * Mirrors applyConditionalToggle's own completion edges, but records ONE
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
 * @param nowDoneBoo - Now Done Boolean: Whether togEntObj is now done (true)
 *                     or was just un-done (false).
 *
 * @returns The updated conditionalLog array, or the same reference when
 * nothing about it actually changes.
 *
 * @example
 * ```ts
 * applyConditionalLog(state, nextEntries, entry, true) // => conditionalLog
 * ```
 *
*/

function applyConditionalLog( curStaObj, nexEntArr, togEntObj, nowDoneBoo ) {


	const curLogArr = curStaObj.conditionalLog || []; // What: Current Log Array. Why: Every branch below either returns this untouched or derives a new array from it. How: This reads curStaObj's own conditionalLog, defaulting to empty.
	const curConArr = curStaObj.conditionals || []; // What: Current Conditionals Array And Guard. Why: The lookups below need the live conditionals list. How: This reads curStaObj's own conditionals, defaulting to empty.

	if ( !curConArr.length ) return curLogArr; // What: No-Conditionals Guard. Why: An app with no conditionals at all has nothing to log. How: This returns curLogArr unchanged when curConArr is empty.

	let conIdeStr = null, trgValBoo = null; // What: Conditional Identifier And Triggered Value, And Guard. Why: Both branches below need somewhere to record which conditional (if any) this toggle concerns, and whether it counts as triggered. How: This starts both null and is set by whichever branch below actually matches.


	if ( togEntObj.kind === 'dayoff' && togEntObj.conditionalId ) { // What: Day-Off Card Branch. Why: A day-off card's own completion always logs as triggered. How: This sets conIdeStr/trgValBoo directly from togEntObj.


		conIdeStr = togEntObj.conditionalId; trgValBoo = true;


	}

	else if ( togEntObj.pickerId ) { // What: Dependent Picker Branch. Why: A dependent entry's own conditional is looked up through its picker, and always logs as not-yet-triggered. How: This looks up the picker and, if gated, sets conIdeStr/trgValBoo.


		const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === togEntObj.pickerId ); // What: Current Picker Object And Guard. Why: Only a gated picker's entry logs anything at all. How: This looks up togEntObj's own pickerId in curStaObj.pickers.

		if ( curPicObj && curPicObj.conditionalId ) { conIdeStr = curPicObj.conditionalId; trgValBoo = false; } // What: Gated-Picker Guard. Why: An ungated picker's entry logs nothing. How: This sets conIdeStr/trgValBoo only when curPicObj exists and carries a conditionalId.


	}

	if ( !conIdeStr ) return curLogArr; // What: No-Match Guard. Why: Neither branch above found a conditional to log against. How: This returns curLogArr unchanged when conIdeStr is still null.

	const curConObj = curConArr.find( ( conFinObj ) => conFinObj.id === conIdeStr ); // What: Current Conditional Object And Guard. Why: An inactive conditional must log nothing at all. How: This looks up conIdeStr in curConArr.

	if ( !curConObj || curConObj.active === false ) return curLogArr; // What: Inactive Guard. Why: An inactive conditional (or one that vanished) runs no logic and logs nothing. How: This returns curLogArr unchanged when curConObj is missing or explicitly inactive.

	const curDayStr = isoDayFun(); // What: Current Day String. Why: A conditionalLog row is keyed by conditional id plus this exact calendar day. How: This reads today's own isoDayFun().
	const exiRowObj = curLogArr.find( ( curRowObj ) => curRowObj.condId === conIdeStr && curRowObj.date === curDayStr ); // What: Existing Row Object And Guard. Why: Only one row per conditional per cycle is ever kept. How: This looks up an existing row sharing conIdeStr and curDayStr.

	const depDonFun = () => nexEntArr.filter( ( curEntObj ) => { // What: Dependent Done Function. Why: Both branches below need to know how many dependent entries for this exact conditional are currently done. How: This counts entries (excluding day-off cards) whose own picker shares conIdeStr and are done.


		if ( curEntObj.kind === 'dayoff' || !curEntObj.done ) return false; // What: Non-Dependent Guard. Why: A day-off card, or an entry that isn't done, never counts as a dependent completion. How: This excludes both cases from the count.

		const matPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === curEntObj.pickerId ); // What: Matched Picker Object And Guard. Why: Only an entry whose own picker shares this exact conditional counts. How: This looks up curEntObj's own pickerId in curStaObj.pickers.


		return matPicObj && matPicObj.conditionalId === conIdeStr; // What: Dependent Match Return. Why: The filter above needs a plain boolean verdict. How: This is true only when matPicObj exists and shares conIdeStr.


	} ).length;

	if ( nowDoneBoo ) { // What: Now-Done Branch. Why: A completion may add a new row, subject to the one-row-per-cycle and first-dependent rules. How: This either returns curLogArr unchanged or appends one fresh row.


		if ( exiRowObj ) return curLogArr; // What: One-Row-Per-Cycle Guard. Why: This cycle already has its own row; a second completion mustn't duplicate it. How: This returns curLogArr unchanged when exiRowObj already exists.

		if ( !trgValBoo && depDonFun() !== 1 ) return curLogArr; // What: First-Dependent Guard. Why: An untriggered cycle only logs on its FIRST dependent completion, not every subsequent one. How: This returns curLogArr unchanged when trgValBoo is false and depDonFun() isn't exactly 1.


		return [ ...curLogArr, { id : nclIdeFun(), condId : conIdeStr, date : curDayStr, triggered : trgValBoo, mode : curConObj.mode, name : curConObj.name } ]; // What: Appended Row Return. Why: The caller needs this cycle's own new row appended. How: This appends one row shaped to state.conditionalLog's own contract.


	}

	if ( !exiRowObj ) return curLogArr; // What: No-Existing-Row Guard. Why: Un-doing a completion that never actually logged a row has nothing to remove. How: This returns curLogArr unchanged when exiRowObj is missing.

	if ( !trgValBoo && depDonFun() > 0 ) return curLogArr; // What: Still-Confirmed Guard. Why: Another dependent completion still stands, so this cycle's own row must stay. How: This returns curLogArr unchanged when trgValBoo is false and depDonFun() is still above 0.


	return curLogArr.filter( ( curRowObj ) => !( curRowObj.condId === conIdeStr && curRowObj.date === curDayStr ) ); // What: Row-Removed Return. Why: The confirming completion is gone, so this cycle's own row must be dropped. How: This filters out the one row sharing conIdeStr and curDayStr.


}

// #endregion applyConditionalLog



// #region newEidFun

/**
 * newEidFun = New Entry Id Function
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

let __eidSeqNum = 0; // What: Entry-Id Sequence Number. Why: newEidFun below needs a shared counter across every call so two ids minted in the same millisecond still differ. How: This starts at 0 and is incremented once per newEidFun call.

function newEidFun() {


	return 'e_' + Date.now().toString( 36 ) + ( __eidSeqNum++ ).toString( 36 ); // What: Entry Id Return. Why: The caller needs a short, sortable, collision-resistant id. How: This concatenates a fixed prefix, the current time base-36, and the incrementing counter base-36.


}

// #endregion newEidFun




// #region loadState

/**
 * loadState = Load State
 *
 * @summary
 * Synchronous by design: STORAGE.init() has already resolved before
 * React mounts (see the boot gate in the HTML shell), so the loaded
 * state is sitting in memory and no component had to become async. The
 * localStorage read is kept as a fallback for the case where storage.js
 * failed to load at all. A brand-new user (nothing stored anywhere)
 * starts from CLEAN_STATE() and is met by onboarding; the demo fixture
 * in seed.js (buildSeed/SEED) is design-time only and deliberately not
 * used here.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The migrated state to boot React with.
 *
 * @example
 * ```ts
 * loadState() // => state
 * ```
 *
*/

function loadState() {


	try { // What: Cached-State Attempt. Why: STORAGE's own warm cache is the fastest, most authoritative source when it's available. How: This returns migrate() of STORAGE's own cached state, when there is one.


		const cchStaObj = STORAGE && STORAGE.cached(); // What: Cached State Object And Guard. Why: STORAGE may not exist at all, or may have nothing cached yet. How: This reads STORAGE.cached(), short-circuiting to undefined when STORAGE itself is falsy.

		if ( cchStaObj ) return migrate( cchStaObj ); // What: Cached-Hit Return. Why: A cached state is the normal, fast path and needs no further fallback. How: This returns migrate(cchStaObj) as soon as one exists.


	}

	catch ( errCauObj ) { /* fall through */ } // What: Cached-State Failure Guard. Why: A broken STORAGE module must not prevent booting from the localStorage fallback below. How: This swallows the error and falls through.


	try { // What: Localstorage Fallback Attempt. Why: This is the last-resort source when STORAGE itself failed to load at all. How: This returns migrate() of the parsed localStorage value, when there is one.


		const rawJsnStr = localStorage.getItem( STO_KEY_STR ); // What: Raw Json String And Guard. Why: There may be nothing stored under this key yet. How: This reads STO_KEY_STR from localStorage, null when absent.

		if ( rawJsnStr ) return migrate( JSON.parse( rawJsnStr ) ); // What: Localstorage-Hit Return. Why: A parsed localStorage value is the fallback path's own normal case. How: This returns migrate() of the JSON-parsed rawJsnStr as soon as one exists.


	}

	catch ( errCauObj ) { /* fall through */ } // What: Localstorage Failure Guard. Why: Malformed or inaccessible localStorage must not crash boot. How: This swallows the error and falls through to the clean-state return below.



	return migrate( CLEAN_STATE() ); // What: Clean-State Return. Why: Nothing was stored anywhere, so a brand-new user starts empty and is met by onboarding. How: This returns migrate() of a fresh CLEAN_STATE().


}

// #endregion loadState




// #region migrate

/**
 * migrate = Migrate
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
 *                    to migrate in place.
 *
 * @returns curStaObj itself, mutated in place with every missing field
 * backfilled and state.v stamped.
 *
 * @example
 * ```ts
 * migrate(rawState) // => state
 * ```
 *
*/

function migrate( curStaObj ) {


	// What: Generated-At Backfill Guard. Why: Old state predates today.generatedAt entirely, and the footer needs SOME timestamp to read sensibly until the next regen. How: This backfills to "this morning" (7:12am) when today exists but generatedAt is missing.
	if ( curStaObj && curStaObj.today && !curStaObj.today.generatedAt ) {


		const defDatObj = new Date(); defDatObj.setHours( 7, 12, 0, 0 ); // What: Default Date Object. Why: A plausible "already generated this morning" moment is friendlier than an obviously-fake placeholder. How: This takes the current date and pins its own time to 7:12am.

		curStaObj.today.generatedAt = defDatObj.toISOString(); // What: Generated-At Backfill. Why: today.generatedAt must exist for the footer/streak logic elsewhere to read. How: This stamps defDatObj's own ISO string onto curStaObj.today.generatedAt.


	}

	// What: Streak-Claimed Backfill Guard. Why: Old state predates today.streakClaimed; whether today already counts toward the streak must be inferred from whether anything is done. How: This backfills true when any existing entry is already done, else false.
	if ( curStaObj && curStaObj.today && curStaObj.today.streakClaimed === undefined ) {

		curStaObj.today.streakClaimed = ( curStaObj.today.entries || [] ).some( ( curEntObj ) => curEntObj.done ); // What: Streak-Claimed Backfill. Why: This is the same "was anything already done today" rule reconcileStreak itself uses. How: This checks whether any of today's own entries is already done.


	}

	// What: Entry-Id Backfill Guard. Why: Older state (and the seed) predates per-entry eids, needed to support more than one entry per picker. How: This mints a fresh eid for any entry that doesn't already have one.
	if ( curStaObj && curStaObj.today && Array.isArray( curStaObj.today.entries ) ) {


		for ( const curEntObj of curStaObj.today.entries ) { if ( !curEntObj.eid ) curEntObj.eid = newEidFun(); } // What: Entry-Id Backfill Loop. Why: Every entry needs its own stable eid, whether or not it already had one. How: This mints a fresh eid for any entry currently missing one, in place.


	}

	// What: Category-Collapse Backfill Guard. Why: The old category layer (picker.itemIds + item.categoryId) is collapsed into a direct item.pickerId link; detected by any picker still carrying an itemIds array. How: This rebuilds every item's own pickerId from whichever picker's itemIds listed it, then drops itemIds/categoryId/categories entirely.
	if ( curStaObj && Array.isArray( curStaObj.pickers ) && curStaObj.pickers.some( ( curPicObj ) => Array.isArray( curPicObj.itemIds ) ) ) {


		const itePicObj = {}; // What: Item-Picker Object And Guard. Why: The item map below needs O(1) lookup of which picker (if any) used to list a given item id. How: This starts empty and is filled by the loop directly below.


		for ( const curPicObj of curStaObj.pickers ) { // What: Item-Picker Fill Loop. Why: Every old itemIds list must be inverted into itePicObj before the item map below can use it. How: This iterates every picker with an itemIds array, filing each listed id under this picker's own id.


			if ( Array.isArray( curPicObj.itemIds ) ) for ( const ownIdeStr of curPicObj.itemIds ) itePicObj[ ownIdeStr ] = curPicObj.id; // What: Owned-Id Fill. Why: Every item id this picker used to own must map back to this picker's own id. How: This assigns curPicObj.id under ownIdeStr for every id in curPicObj.itemIds.


		}

		if ( Array.isArray( curStaObj.items ) ) { // What: Item Pickerid Rewrite Guard. Why: Only when items actually exist is there anything to rewrite. How: This maps every item to carry a real pickerId and drop its own old categoryId.


			curStaObj.items = curStaObj.items.map( ( curIteObj ) => {

				const rsvPicIde = curIteObj.pickerId || itePicObj[ curIteObj.id ] || null; // What: Resolved Picker Identifier. Why: An item may already carry a pickerId, or only be inferable from the old itemIds inversion above. How: This prefers curIteObj's own pickerId, falling back to itePicObj's lookup, then null.
				const { categoryId, ...remFieObj } = curIteObj; // What: Remaining Fields Object. Why: The old categoryId field must be dropped entirely, not merely ignored. How: This destructures categoryId off curIteObj, keeping every other field in remFieObj.


				return { ...remFieObj, pickerId : rsvPicIde }; // What: Rewritten Item Return. Why: The caller needs this item's own real pickerId written, with categoryId gone. How: This spreads remFieObj with pickerId set to rsvPicIde.


			} );


		}

		curStaObj.pickers = curStaObj.pickers.map( ( curPicObj ) => { const { itemIds, ...remFieObj } = curPicObj; return remFieObj; } ); // What: Picker Itemids Drop. Why: A picker no longer owns an itemIds list at all once items carry their own pickerId. How: This destructures itemIds off every picker, keeping every other field.
		delete curStaObj.categories; // What: Categories Entity Drop. Why: The categories entity is gone entirely under the new model. How: This deletes curStaObj's own categories field outright.


	}

	// What: Holidays Backfill. Why: The daily-schedule config (a global editable holiday list) was added later than this file's own first save shape. How: This backfills curStaObj.holidays to HOL_NAM_OBJ's own default state when it's missing.
	if ( curStaObj && !curStaObj.holidays && HOL_NAM_OBJ ) curStaObj.holidays = HOL_NAM_OBJ.defStaFun();

	// What: Daily Run-Time Backfill. Why: The Daily generator's own auto-run time was added later, defaulting to 4:00am. How: This backfills curStaObj.daily.runTime when curStaObj.daily exists but lacks one.
	if ( curStaObj && curStaObj.daily && !curStaObj.daily.runTime ) curStaObj.daily.runTime = '04:00';

	// What: Appearance Backfill. Why: The Settings tab's real persisted theme choice was added later, replacing a design-time-only palette default. How: This backfills curStaObj.appearance to a full default object when it's entirely missing.
	if ( curStaObj && !curStaObj.appearance ) curStaObj.appearance = { theme : 'ink', customLight : null, customDark : null, autoSystem : false, pickAnim : 'reel', completionStyle : 'ripple', tabPlacement : 'bottom' };
	// What: Appearance Auto-System Backfill. Why: The "match system dark mode" toggle was added after appearance itself existed for some users. How: This backfills autoSystem to false when curStaObj.appearance exists but lacks it.
	if ( curStaObj && curStaObj.appearance && curStaObj.appearance.autoSystem === undefined ) curStaObj.appearance.autoSystem = false;
	// What: Appearance Pick-Anim Backfill. Why: The pick-reveal animation style was added after appearance itself existed for some users. How: This backfills pickAnim to 'reel' when curStaObj.appearance exists but lacks it.
	if ( curStaObj && curStaObj.appearance && !curStaObj.appearance.pickAnim ) curStaObj.appearance.pickAnim = 'reel';
	// What: Appearance Completion-Style Backfill. Why: The completion-celebration style was added after appearance itself existed for some users. How: This backfills completionStyle to 'ripple' when curStaObj.appearance exists but lacks it.
	if ( curStaObj && curStaObj.appearance && !curStaObj.appearance.completionStyle ) curStaObj.appearance.completionStyle = 'ripple';
	// What: Appearance Tab-Placement Backfill. Why: The tab bar placement option was added after appearance itself existed for some users. How: This backfills tabPlacement to 'bottom' when curStaObj.appearance exists but lacks it.
	if ( curStaObj && curStaObj.appearance && !curStaObj.appearance.tabPlacement ) curStaObj.appearance.tabPlacement = 'bottom';

	// What: Daily Mode Backfill. Why: Whether the Daily generator runs on its own or only manually was added later, defaulting to 'auto'. How: This backfills curStaObj.daily.mode when curStaObj.daily exists but lacks one.
	if ( curStaObj && curStaObj.daily && !curStaObj.daily.mode ) curStaObj.daily.mode = 'auto';

	// What: Tasks Array Backfill. Why: The manual reminders entity was added later; old state has no tasks array at all. How: This backfills curStaObj.tasks to an empty array when it isn't already one.
	if ( curStaObj && !Array.isArray( curStaObj.tasks ) ) curStaObj.tasks = [];
	// What: Stale One-Time Task Purge Guard. Why: A one-time reminder completed on a previous day shouldn't linger forever. How: This drops every task TASKS itself considers stale-once.
	if ( curStaObj && Array.isArray( curStaObj.tasks ) && TASKS ) {

		curStaObj.tasks = curStaObj.tasks.filter( ( curTasObj ) => !TASKS.isStaleOnce( curTasObj ) ); // What: Stale-Once Filter. Why: Only TASKS itself knows the exact staleness rule for a one-time reminder. How: This keeps every task TASKS.isStaleOnce reports false for.


	}

	// What: Task Hidden-Flag Backfill Guard. Why: The hidden flag (lets a picker/task be kept but excluded from every list/count/generator run) was added later; used to tuck the Welcome Tour's own sample pickers/reminders out of sight without deleting their history. How: This backfills hidden:false on any task that doesn't already carry a real boolean there.
	if ( curStaObj && Array.isArray( curStaObj.tasks ) ) {

		curStaObj.tasks = curStaObj.tasks.map( ( curTasObj ) => ( typeof curTasObj.hidden === 'boolean' ? curTasObj : { ...curTasObj, hidden : false } ) ); // What: Task Hidden-Flag Map. Why: Only a task genuinely missing a real boolean hidden field needs patching. How: This passes a task through unchanged when hidden is already boolean, else spreads in hidden:false.


	}

	// What: Task Scheduling-Fields Backfill Guard. Why: Every-N-weeks/months/years plus "Nth weekday" scheduling added dateMode/nthOrdinal/nthWeekday, which the UI now reads directly and so must be backfilled explicitly. How: This leaves an already-migrated task alone, else defaults it to plain date-based scheduling anchored on today.
	if ( curStaObj && Array.isArray( curStaObj.tasks ) ) {


		curStaObj.tasks = curStaObj.tasks.map( ( curTasObj ) => {

			if ( curTasObj.dateMode === 'date' || curTasObj.dateMode === 'nthWeekday' ) return curTasObj; // What: Already-Migrated Guard. Why: A task that already carries a real dateMode needs no further backfill here. How: This returns curTasObj unchanged when dateMode is already one of the 2 known values.

			const nowDatObj = new Date(); // What: Now Date Object. Why: An old task's own nthWeekday default falls back to today's own weekday. How: This reads the current moment.


			return { ...curTasObj, dateMode : 'date', nthOrdinal : curTasObj.nthOrdinal || 1, nthWeekday : curTasObj.nthWeekday ?? nowDatObj.getDay() }; // What: Backfilled Task Return. Why: The caller needs every new scheduling field present with a sensible default. How: This spreads curTasObj with dateMode/nthOrdinal/nthWeekday defaulted.


		} );


	}

	/**
	 * store.jsx = Task Interval One-Shot Reset
	 *
	 * @summary
	 * `interval` is reused for weekly/monthly/annual's own "every N
	 * ___", but defaultTask has ALWAYS unconditionally set interval:2
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

	if ( curStaObj && !curStaObj._taskIntervalReset && Array.isArray( curStaObj.tasks ) ) {


		curStaObj.tasks = curStaObj.tasks.map( ( curTasObj ) => // What: Interval Reset Map. Why: Only a weekly/monthly/annual task actually inherited the stale, unused interval:2. How: This resets interval to 1 for those 3 repeat kinds, leaving every other task untouched.
			( curTasObj.repeat === 'weekly' || curTasObj.repeat === 'monthly' || curTasObj.repeat === 'annual' ) ? { ...curTasObj, interval : 1 } : curTasObj );

		curStaObj._taskIntervalReset = true; // What: Reset-Guard Set. Why: This one-shot reset must never re-fire and clobber a user's own later interval choice. How: This flips the guard flag permanently true.


	}

	// What: Reminder Options Normalize. Why: Per-type reminder participation options were added later; partial or absent state must get the full default switch set. How: This calls TASKS.normalizeOpts on whatever curStaObj.reminderOpts currently holds.
	if ( curStaObj && TASKS ) curStaObj.reminderOpts = TASKS.normalizeOpts( curStaObj.reminderOpts );

	/**
	 * store.jsx = Data-Tab Collapse Defaults V2
	 *
	 * @summary
	 * The Data tab's main sections (Conditionals, Reminders, each
	 * picker card) all default COLLAPSED and are read via `=== false`
	 * for expanded, so no seeding is normally needed (see
	 * toggleControlsCollapsed's own defaultCollapsed argument). But
	 * values saved by the OLD, inverted picker-card flag must be
	 * dropped once, so those cards don't load pre-expanded under the
	 * new polarity; the __collapseDefaultsV2 flag guards this so it
	 * only ever strips old values one time.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && Array.isArray( curStaObj.pickers ) ) {


		const curUiObj = curStaObj.ui || {}; // What: Current Ui Object. Why: The collapse-state copy below needs curStaObj's own ui object, or an empty fallback. How: This reads curStaObj.ui, defaulting to {}.
		const conColObj = { ...( curUiObj.controlsCollapsed || {} ) }; // What: Controls Collapsed Object. Why: The old flags must be stripped from a COPY, never the live object directly. How: This shallow-copies curUiObj's own controlsCollapsed, defaulting to {}.

		if ( !conColObj.__collapseDefaultsV2 ) { // What: One-Shot Strip Guard. Why: This must only ever run once per save, per the design-rationale comment above. How: This strips every old per-picker/section flag and sets the guard, only when it hasn't run yet.


			conColObj.__collapseDefaultsV2 = true; // What: Guard Flag Set. Why: This one-shot strip must never re-run and clobber a user's own later collapse choices. How: This flips the guard flag permanently true.
			delete conColObj.__sectionsSeeded; // What: Old Sections-Seeded Flag Drop. Why: This flag belonged to the old polarity and has no meaning under the new one. How: This deletes it from conColObj outright.
			curStaObj.pickers.forEach( ( curPicObj ) => { delete conColObj[ curPicObj.id ]; } ); // What: Old Picker-Card Flags Drop. Why: Every picker's own old inverted flag must be cleared so it loads collapsed under the new polarity. How: This deletes conColObj's own entry for every picker's id.
			delete conColObj.__reminders_main; // What: Old Reminders-Main Flag Drop. Why: This flag belonged to the old polarity and has no meaning under the new one. How: This deletes it from conColObj outright.
			delete conColObj.__conditionals; // What: Old Conditionals Flag Drop. Why: This flag belonged to the old polarity and has no meaning under the new one. How: This deletes it from conColObj outright.


		}

		curStaObj.ui = { ...curUiObj, controlsCollapsed : conColObj }; // What: Ui Object Writeback. Why: The (possibly-stripped) collapse-state copy must actually land back on curStaObj. How: This spreads curUiObj with controlsCollapsed replaced by conColObj.


	}

	/**
	 * store.jsx = Reminders Stats-Default Flip
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

	if ( curStaObj && !curStaObj._remStatsDefaultOn && curStaObj.reminderOpts ) {


		curStaObj.reminderOpts.once.stats = true;     // What: Once-Reminder Stats Flip. Why: One-time reminders must count toward Stats by the new default. How: This sets curStaObj.reminderOpts.once.stats to true.
		curStaObj.reminderOpts.recurring.stats = true; // What: Recurring-Reminder Stats Flip. Why: Recurring reminders must count toward Stats by the new default. How: This sets curStaObj.reminderOpts.recurring.stats to true.
		curStaObj._remStatsDefaultOn = true;           // What: Flip-Guard Set. Why: This one-shot flip must never re-fire and override a user's own later choice to turn it off. How: This flips the guard flag permanently true.


	}


	/**
	 * store.jsx = Onboarding Backfill
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
	 * CLEAN_STATE() never produces.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && !curStaObj.onboarding ) curStaObj.onboarding = { welcomed : true, dismissed : true, checklistDone : true };

	// What: Onboarding Checklist-Map Backfill. Why: The mini-tour checklist (see onboarding-checklist.js) maps an item id to its own resolution; an object map needs no per-item backfill of its own, just a manifest entry there. How: This backfills curStaObj.onboarding.checklist to {} when it's missing or not a plain object.
	if ( curStaObj && curStaObj.onboarding && ( !curStaObj.onboarding.checklist || typeof curStaObj.onboarding.checklist !== 'object' ) ) {

		curStaObj.onboarding.checklist = {};


	}

	/**
	 * store.jsx = Onboarding Checklist-Done Backfill
	 *
	 * @summary
	 * The same reasoning as the missing-onboarding branch above applies
	 * here too: an account whose onboarding object ALREADY existed
	 * (from an even older build, before checklistDone was ever added as
	 * a field) is just as established as one missing onboarding
	 * entirely, since it predates the checklist system either way.
	 * Defaulting to welcomed's own value tells the two cases apart:
	 * CLEAN_STATE()'s own fresh onboarding is {welcomed:false,
	 * dismissed:false} at this point (no checklistDone key yet either),
	 * so this correctly still defaults false for a genuine first-time
	 * user, but an existing account that had already dismissed the
	 * (pre-checklist-era) welcome modal (welcomed:true) gets
	 * checklistDone:true instead of the unconditional false this used
	 * to backfill. That unconditional false is exactly what silently
	 * broke Replay Tour for real, established accounts that updated
	 * through this exact version gap: it got written back into their
	 * save the very first time migrate() ran post-update, so it stayed
	 * false in every export/import from that point on, permanently
	 * defeating collision suppression, App Features, and the Generate
	 * card for them.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && curStaObj.onboarding && typeof curStaObj.onboarding.checklistDone !== 'boolean' ) {

		curStaObj.onboarding.checklistDone = !!curStaObj.onboarding.welcomed;


	}

	/**
	 * store.jsx = Generate-Scroll-Pending Backfill
	 *
	 * @summary
	 * A one-shot signal (added later) for tab-today.jsx's own auto-
	 * scroll to the Generate card: set the instant every OTHER
	 * checklist item becomes resolved (see setChecklistItem below),
	 * consumed (and cleared back to false) the next time TabToday
	 * renders with it true. Persisted state rather than a local ref/
	 * effect, deliberately: the LAST checklist item to resolve is very
	 * often finished from a mini-tour or Page Tour running on a
	 * DIFFERENT tab, which unmounts TabToday for the whole tour, so a
	 * plain "did I see false-then-true" ref would miss the transition
	 * entirely (it only resets, matching whatever the value already
	 * is, on each fresh mount). This flag survives that gap by living
	 * in state instead of the component.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && curStaObj.onboarding && typeof curStaObj.onboarding.generateScrollPending !== 'boolean' ) {

		curStaObj.onboarding.generateScrollPending = false;


	}

	// What: Page-Tours Name Backfill. Why: The Edit Mode-rename-able display name for the Page Tours group was added later; unlike a real group's name this doesn't double as the group's own identity (still the fixed '__pageTours' sentinel everywhere else), so renaming it is a plain label swap. How: This backfills pageToursName to 'Page Tours' when it isn't already a string.
	if ( curStaObj && curStaObj.onboarding && typeof curStaObj.onboarding.pageToursName !== 'string' ) {

		curStaObj.onboarding.pageToursName = 'Page Tours';


	}

	// What: Active-Tour Backfill. Why: Active tour progress ({id,step}|null, added later) lets a guided tour resume exactly where a reload interrupted it. How: This backfills activeTour to null when the field is entirely absent.
	if ( curStaObj && curStaObj.onboarding && typeof curStaObj.onboarding.activeTour === 'undefined' ) {

		curStaObj.onboarding.activeTour = null;


	}

	// What: App-Features Map Backfill. Why: App Features tutorials (see onboarding-app-features.jsx) are deliberately separate from checklist above (no doneCount/total ring, no closing Generate-style card), just a per-item resolved/not flag. How: This backfills appFeatures to {} when it's missing or not a plain object.
	if ( curStaObj && curStaObj.onboarding && ( !curStaObj.onboarding.appFeatures || typeof curStaObj.onboarding.appFeatures !== 'object' ) ) {

		curStaObj.onboarding.appFeatures = {};


	}

	/**
	 * store.jsx = App-Features Intro-Seen Backfill
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

	if ( curStaObj && curStaObj.onboarding && typeof curStaObj.onboarding.appFeaturesIntroSeen !== 'boolean' ) {

		curStaObj.onboarding.appFeaturesIntroSeen = !!curStaObj.onboarding.checklistDone;


	}

	// What: Reminder-Log Backfill. Why: The reminder completion log (append-only history of check-offs) was added later. How: This backfills reminderLog to [] when it isn't already an array.
	if ( curStaObj && !Array.isArray( curStaObj.reminderLog ) ) curStaObj.reminderLog = [];

	// What: Reminder-Skip-Log Backfill. Why: The reminder skip log (append-only history of skip actions) was added later. How: This backfills reminderSkipLog to [] when it isn't already an array.
	if ( curStaObj && !Array.isArray( curStaObj.reminderSkipLog ) ) curStaObj.reminderSkipLog = [];

	// What: Vacation-Log Backfill. Why: The inactive-state event log (append-only on/off transitions per item, so Stats can exclude ineligible days) was added later; old state is treated as always-eligible in the past, with the live item.vacation flag as current truth. How: This backfills vacationLog to [] when it isn't already an array.
	if ( curStaObj && !Array.isArray( curStaObj.vacationLog ) ) curStaObj.vacationLog = [];

	// What: Conditionals-Array Backfill. Why: Conditionals (per-day picker gates) were added later. How: This backfills conditionals to [] when it isn't already an array.
	if ( curStaObj && !Array.isArray( curStaObj.conditionals ) ) curStaObj.conditionals = [];

	/**
	 * store.jsx = Conditional Active/Triggered Split
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

	if ( curStaObj && Array.isArray( curStaObj.conditionals ) ) {


		curStaObj.conditionals = curStaObj.conditionals.map( ( curConObj ) => { // What: Conditional Split-And-Odds Map. Why: Every conditional needs both migrations applied, in order, before it's usable under the new shape. How: This applies the active/triggered split, then the weight-to-oddsPct migration, to each conditional.


			let nexConObj = ( 'triggered' in curConObj ) ? curConObj : { ...curConObj, triggered : !!curConObj.active, active : true }; // What: Split Conditional And Guard. Why: A conditional already carrying its own triggered field is already past this migration. How: This passes curConObj through unchanged when triggered already exists, else derives it from the old active value.

			if ( !( 'oddsPct' in nexConObj ) ) { // What: Odds-Percentage Migrate Guard. Why: Only a conditional still missing oddsPct needs its old weight-ratio odds converted. How: This derives oddsPct from nexConObj's own weight, clamped to the 10-90 range in steps of 10.


				const wgtValNum = nexConObj.weight ?? 1; // What: Weight Value Number. Why: The odds formula below needs this conditional's own old weight, defaulting to 1 when absent. How: This reads nexConObj.weight, defaulting via ??.

				nexConObj = { ...nexConObj, oddsPct : Math.min( 90, Math.max( 10, Math.round( ( wgtValNum / ( wgtValNum + 1 ) ) * 10 ) * 10 ) ) }; // What: Odds-Percentage Set. Why: The caller needs a direct percentage replacing the old ratio-weight scheme. How: This converts wgtValNum via w/(w+1), rounds to the nearest 10, then clamps to [10,90].


			}


			return nexConObj; // What: Migrated Conditional Return. Why: The map above needs the fully-migrated conditional. How: This returns nexConObj, built above.


		} );


	}

	// What: Picker Conditionalid Backfill. Why: Every picker needs a conditionalId slot so gating code elsewhere can read it uniformly, whether or not the picker is actually gated. How: This backfills conditionalId to null on any picker that doesn't already carry the field.
	if ( curStaObj && Array.isArray( curStaObj.pickers ) ) {

		curStaObj.pickers = curStaObj.pickers.map( ( curPicObj ) => ( 'conditionalId' in curPicObj ? curPicObj : { ...curPicObj, conditionalId : null } ) );


	}

	// What: Pick-Log Backfill. Why: The per-pick history log was added later; old state has none, while a fresh seed ships a full year of rows via seed.js instead. How: This backfills pickLog to [] when it isn't already an array.
	if ( curStaObj && !Array.isArray( curStaObj.pickLog ) ) curStaObj.pickLog = [];

	// What: Conditional-Log Backfill. Why: The conditional history log (append-only, one row per conditional per completed cycle) was added later. How: This backfills conditionalLog to [] when it isn't already an array.
	if ( curStaObj && !Array.isArray( curStaObj.conditionalLog ) ) curStaObj.conditionalLog = [];

	/**
	 * store.jsx = Ease-Down Weights Normalize
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

	if ( curStaObj && !curStaObj._easeDownWeightsInit && Array.isArray( curStaObj.pickers ) && Array.isArray( curStaObj.items ) ) {


		for ( const curPicObj of curStaObj.pickers ) { // What: Ease-Down Normalize Loop. Why: Only an ease-down picker's own items need this one-time weight reset. How: This skips every non-ease-down picker, else rewrites its own items' weights below.


			if ( curPicObj.mode !== 'ease-down' ) continue; // What: Non-Ease-Down Skip Guard. Why: Every other mode's items already own their real weights. How: This skips straight to the next picker when curPicObj.mode isn't 'ease-down'.

			curStaObj.items = curStaObj.items.map( ( curIteObj ) => // What: Ease-Down Weight Reset. Why: The active item must sit at weight 0 and every sibling at weight 1, per the design-rationale comment above. How: This rewrites weight only for items owned by curPicObj, leaving every other item untouched.
				curIteObj.pickerId === curPicObj.id ? { ...curIteObj, weight : curIteObj.id === curPicObj.activeItemId ? 0 : 1 } : curIteObj );


		}

		curStaObj._easeDownWeightsInit = true; // What: Init-Guard Set. Why: This one-shot normalize must never re-fire and clobber real accumulated fairness weights. How: This flips the guard flag permanently true.


	}

	// What: Picker Fields Normalize Guard. Why: Several independent per-picker fields (daysOfWeek, the weekly-cadence anchor-day rule, skipHolidays, avoidDuplicates, Picker Cadence, hidden) were each added at different times and all need backfilling together. How: This maps every picker through each field's own default/normalize step.
	if ( curStaObj && Array.isArray( curStaObj.pickers ) ) {


		curStaObj.pickers = curStaObj.pickers.map( ( curPicObj ) => {

			const nexPicObj = { ...curPicObj }; // What: Next Picker Object. Why: Every backfill below patches a copy, never curPicObj itself. How: This starts as a shallow copy of curPicObj.

			if ( !Array.isArray( nexPicObj.daysOfWeek ) ) nexPicObj.daysOfWeek = [ 0, 1, 2, 3, 4, 5, 6 ]; // What: Days-Of-Week Backfill. Why: A picker with no schedule override at all still needs an explicit "every day" default. How: This backfills daysOfWeek to every weekday when it isn't already an array.

			// What: Weekly-Anchor Enforce. Why: For weekly cadence, the anchor day must always be one of the allowed days, backfilling state saved before this rule existed. How: This calls CAD_NAM_OBJ.enfWeeFun to fold nexPicObj's own anchor into its daysOfWeek.
			if ( CAD_NAM_OBJ ) nexPicObj.daysOfWeek = CAD_NAM_OBJ.enfWeeFun( nexPicObj );

			if ( typeof nexPicObj.skipHolidays !== 'boolean' ) nexPicObj.skipHolidays = false; // What: Skip-Holidays Backfill. Why: Every picker needs an explicit holiday-skipping flag. How: This backfills skipHolidays to false when it isn't already a boolean.

			// What: Avoid-Duplicates Backfill. Why: The avoid-duplicate-item-names flag was added later. How: This backfills avoidDuplicates to false when it isn't already a boolean.
			if ( typeof nexPicObj.avoidDuplicates !== 'boolean' ) nexPicObj.avoidDuplicates = false;

			// What: Picker-Cadence Normalize. Why: Picker Cadence (surfacing anchor + display unit) was added later; old state defaults to 'daily' (the original behavior) with sensible anchors. How: This calls CAD_NAM_OBJ.norCadFun and merges its own result onto nexPicObj when nexPicObj's own cadence isn't already a real one.
			if ( !CAD_NAM_OBJ.isaCadFun( nexPicObj.cadence ) ) Object.assign( nexPicObj, CAD_NAM_OBJ.norCadFun( nexPicObj ) );

			if ( typeof nexPicObj.hidden !== 'boolean' ) nexPicObj.hidden = false; // What: Hidden-Flag Backfill. Why: Every picker needs an explicit hidden flag, same reasoning as the tasks backfill above. How: This backfills hidden to false when it isn't already a boolean.


			return nexPicObj; // What: Normalized Picker Return. Why: The map above needs the fully-backfilled picker. How: This returns nexPicObj, built above.


		} );


	}

	// What: Ui-Prefs Object Backfill. Why: Persisted UI prefs (controlsCollapsed maps a section id to whether its Controls sub-panel is collapsed; absent/false means open) were added later. How: This backfills curStaObj.ui, then its own controlsCollapsed sub-field, to plain objects when either is missing.
	if ( curStaObj && ( !curStaObj.ui || typeof curStaObj.ui !== 'object' ) ) curStaObj.ui = {};
	if ( curStaObj && ( !curStaObj.ui.controlsCollapsed || typeof curStaObj.ui.controlsCollapsed !== 'object' ) ) curStaObj.ui.controlsCollapsed = {};


	/**
	 * store.jsx = Today Ordering Backfill
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

	if ( curStaObj && Array.isArray( curStaObj.pickers ) ) {


		if ( normalizeGroupName ) { // What: Name-Tidy Guard. Why: The tidy/normalize pass below only makes sense when the normalizer itself is actually available. How: This runs the whole tidy pass only when normalizeGroupName is truthy.


			curStaObj.pickers.forEach( ( curPicObj ) => { // What: Picker Tidy Loop. Why: Every picker's own group and name need the same Title-Case tidy applied in place. How: This normalizes curPicObj.group and curPicObj.name, each only when the normalizer actually returns something.


				if ( curPicObj.group ) { // What: Group Tidy Guard. Why: A picker with no group at all has nothing to tidy. How: This normalizes curPicObj.group only when it's truthy.


					const nrmGroStr = normalizeGroupName( curPicObj.group ); // What: Normalized Group String And Guard. Why: The normalizer may decline to return anything for an unusual input. How: This calls normalizeGroupName on curPicObj's own group.

					if ( nrmGroStr ) curPicObj.group = nrmGroStr; // What: Group Tidy Write. Why: Only a genuine normalized result should overwrite the picker's own group. How: This writes nrmGroStr back onto curPicObj.group when it's truthy.


				}

				if ( curPicObj.name && normalizePickerName ) { // What: Name Tidy Guard. Why: A picker with no name, or with no normalizer available, has nothing to tidy. How: This normalizes curPicObj.name only when both are truthy.


					const nrmNamStr = normalizePickerName( curPicObj.name ); // What: Normalized Name String And Guard. Why: The normalizer may decline to return anything for an unusual input. How: This calls normalizePickerName on curPicObj's own name.

					if ( nrmNamStr ) curPicObj.name = nrmNamStr; // What: Name Tidy Write. Why: Only a genuine normalized result should overwrite the picker's own name. How: This writes nrmNamStr back onto curPicObj.name when it's truthy.


				}


			} );

			// What: Group-Order Normalize. Why: Stored order structures must land on the same normalized group names the tidy pass above just applied to every picker. How: This maps every groupOrder entry through normalizeGroupName, except the 2 fixed sentinels which are never real group names.
			if ( Array.isArray( curStaObj.groupOrder ) ) {

				curStaObj.groupOrder = curStaObj.groupOrder.map( ( curGroStr ) => (
					( curGroStr === '__reminders' || curGroStr === '__pageTours' ) ? curGroStr : ( normalizeGroupName( curGroStr ) || curGroStr )
				) );


			}

			if ( curStaObj.pickerOrder && typeof curStaObj.pickerOrder === 'object' ) { // What: Picker-Order Remap Guard. Why: pickerOrder's own keys are group names too, so they need the exact same normalization, merging any pre-existing/post-existing keys that collide once normalized. How: This rebuilds pickerOrder keyed by normalized group name.


				const rmpOrdObj = {}; // What: Remapped Order Object And Guard. Why: The loop below needs somewhere to accumulate the re-keyed pickerOrder. How: This starts empty and is filled by the loop directly below.


				for ( const [ curGroStr, picIdeArr ] of Object.entries( curStaObj.pickerOrder ) ) { // What: Picker-Order Remap Loop. Why: Every old group key must be normalized and merged into rmpOrdObj before it replaces curStaObj's own pickerOrder. How: This iterates curStaObj.pickerOrder's own entries, concatenating each onto its own normalized key's bucket.


					const nrmKeyStr = normalizeGroupName( curGroStr ) || curGroStr; // What: Normalized Key String. Why: The new pickerOrder must be keyed the same way groupOrder now is. How: This normalizes curGroStr, falling back to itself when the normalizer declines.

					rmpOrdObj[ nrmKeyStr ] = ( rmpOrdObj[ nrmKeyStr ] || [] ).concat( picIdeArr ); // What: Remapped Bucket Concat. Why: 2 old keys that normalize to the same new key must have their own picker-id lists merged, not overwrite each other. How: This concatenates picIdeArr onto whatever's already filed under nrmKeyStr.


				}

				curStaObj.pickerOrder = rmpOrdObj; // What: Picker-Order Writeback. Why: The remapped object must actually replace the old one. How: This assigns rmpOrdObj onto curStaObj.pickerOrder.


			}


		}

		const seeGroArr = [];  // What: Seen Group Array And Guard. Why: The loop below needs to record each group's own first-occurrence order exactly once. How: This starts empty and is pushed into (without duplicates) by the loop directly below.
		const ideByGroObj = {}; // What: Ids-By-Group Object And Guard. Why: The loop below needs to bucket every picker's own id under its own group. How: This starts empty and is filled by the loop directly below.


		for ( const curPicObj of curStaObj.pickers ) { // What: Group/Bucket Fill Loop. Why: Every picker must contribute its own group (once) to seeGroArr and its own id to ideByGroObj's matching bucket. How: This iterates curStaObj.pickers, updating both structures per picker.


			const curGroStr = curPicObj.group || 'Other'; // What: Current Group String. Why: A picker with no group at all still needs a real bucket to file under. How: This reads curPicObj's own group, defaulting to 'Other'.

			if ( !seeGroArr.includes( curGroStr ) ) seeGroArr.push( curGroStr ); // What: First-Occurrence Push Guard. Why: Each group must appear in seeGroArr exactly once, in its own first-seen order. How: This pushes curGroStr only when it isn't already present.

			( ideByGroObj[ curGroStr ] = ideByGroObj[ curGroStr ] || [] ).push( curPicObj.id ); // What: Bucket Push. Why: This picker's own id must join every other picker already filed under the same group. How: This creates curGroStr's own bucket on first use, then pushes curPicObj.id into it.


		}

		if ( !Array.isArray( curStaObj.groupOrder ) ) curStaObj.groupOrder = seeGroArr.slice(); // What: Group-Order Seed. Why: State with no groupOrder at all starts from the natural first-occurrence order computed above. How: This assigns a fresh copy of seeGroArr.

		else for ( const curGroStr of seeGroArr ) if ( !curStaObj.groupOrder.includes( curGroStr ) ) curStaObj.groupOrder.push( curGroStr ); // What: Group-Order Append. Why: An EXISTING groupOrder must keep its own saved order, only gaining any newly-seen group at the end. How: This appends curGroStr only when it isn't already present.

		// What: Reminders-Sentinel Backfill. Why: The Reminders block participates in the same Edit Mode ordering (via the '__reminders' sentinel) and defaults to the front for anyone who hasn't reordered it. How: This unshifts '__reminders' onto groupOrder when it isn't already present.
		if ( !curStaObj.groupOrder.includes( '__reminders' ) ) curStaObj.groupOrder.unshift( '__reminders' );

		if ( !curStaObj.pickerOrder || typeof curStaObj.pickerOrder !== 'object' ) curStaObj.pickerOrder = {}; // What: Picker-Order Object Backfill. Why: A pickerOrder that isn't already a plain object needs a fresh one before the loop below can write into it. How: This resets curStaObj.pickerOrder to {} when it fails either check.

		for ( const curGroStr of seeGroArr ) { // What: Per-Group Order Reconcile Loop. Why: Every seen group needs its own pickerOrder entry reconciled: real picker ids plus any surviving synthetic day-off/charging ids, deduped, with newly-seen pickers appended. How: This rebuilds curStaObj.pickerOrder[curGroStr] for every group in seeGroArr.


			const vldIdeSet = new Set( ideByGroObj[ curGroStr ] ); // What: Valid Identifier Set. Why: The filter below needs fast membership checks against this group's own real picker ids. How: This wraps ideByGroObj's own bucket for curGroStr in a Set.
			const seeIdeSet = new Set(); // What: Seen Identifier Set And Guard. Why: The filter below must defensively dedupe, self-healing any older corrupted order. How: This starts empty and is filled as the filter below runs.

			const exiOrdArr = ( Array.isArray( curStaObj.pickerOrder[ curGroStr ] ) ? curStaObj.pickerOrder[ curGroStr ] : [] ) // What: Existing Order Array. Why: A saved order must be kept when present, dropping anything no longer valid and any duplicate. How: This keeps ids that are either a real current picker or a surviving synthetic 'dayoff_' id, each only once.
				.filter( ( curIdeStr ) => ( vldIdeSet.has( curIdeStr ) || String( curIdeStr ).startsWith( 'dayoff_' ) ) && !seeIdeSet.has( curIdeStr ) && seeIdeSet.add( curIdeStr ) );

			for ( const curIdeStr of ideByGroObj[ curGroStr ] ) if ( !exiOrdArr.includes( curIdeStr ) ) exiOrdArr.push( curIdeStr ); // What: Newly-Seen Append. Why: A picker not yet present in the saved order (new since last save) must still be appended at the end. How: This pushes curIdeStr onto exiOrdArr only when it isn't already present.

			curStaObj.pickerOrder[ curGroStr ] = exiOrdArr; // What: Per-Group Order Writeback. Why: The reconciled order must actually replace whatever curStaObj.pickerOrder[curGroStr] held before. How: This assigns exiOrdArr onto curStaObj.pickerOrder[curGroStr].


		}


	}

	if ( curStaObj ) curStaObj.v = SCH_VER_NUM; // What: Schema-Version Stamp. Why: Every migrated state (and every exported backup) must record which schema shape it was actually migrated to. How: This writes SCH_VER_NUM onto curStaObj.v.



	return curStaObj; // What: Migrated State Return. Why: The caller needs the fully-backfilled state, mutated in place above. How: This returns curStaObj itself.


}

// #endregion migrate




// #region saveState

/**
 * saveState = Save State
 *
 * @summary
 * Persists curStaObj through STORAGE when it's available (the real,
 * debounced/idle-safe persistence engine), falling back to a plain
 * synchronous localStorage.setItem only when STORAGE itself is absent.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The state to persist.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * saveState(state) // => undefined
 * ```
 *
*/

function saveState( curStaObj ) {


	try { // What: Persist Attempt. Why: A storage failure (quota, disabled storage, ...) must never crash the caller. How: This delegates to STORAGE.save when available, else falls back to a raw localStorage write.


		if ( STORAGE ) return STORAGE.save( curStaObj ); // What: Storage Delegate Return. Why: STORAGE is the real, debounced/idle-safe persistence engine and should always be preferred. How: This returns STORAGE.save(curStaObj) as soon as STORAGE exists.

		localStorage.setItem( STO_KEY_STR, JSON.stringify( curStaObj ) ); // What: Localstorage Fallback Write. Why: This only runs when STORAGE itself failed to load at all. How: This writes curStaObj's own JSON string under STO_KEY_STR.


	}

	catch ( errCauObj ) {} // What: Persist Failure Guard. Why: A write failure must never propagate up to the caller. How: This swallows the error silently.


}

// #endregion saveState



// #region flushState

/**
 * flushState = Flush State
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
 * flushState(state) // => undefined
 * ```
 *
*/

function flushState( curStaObj ) {


	try { // What: Flush Attempt. Why: A storage failure during teardown must never throw while the page is going away. How: This delegates to STORAGE.flushSync when available, else falls back to a raw localStorage write.


		if ( STORAGE ) return STORAGE.flushSync( curStaObj ); // What: Storage Delegate Return. Why: STORAGE's own flushSync is the real synchronous-write path. How: This returns STORAGE.flushSync(curStaObj) as soon as STORAGE exists.

		localStorage.setItem( STO_KEY_STR, JSON.stringify( curStaObj ) ); // What: Localstorage Fallback Write. Why: This only runs when STORAGE itself failed to load at all. How: This writes curStaObj's own JSON string under STO_KEY_STR.


	}

	catch ( errCauObj ) {} // What: Flush Failure Guard. Why: A write failure must never propagate up while the page is unloading. How: This swallows the error silently.


}

// #endregion flushState



// #region reconcileStreak

/**
 * reconcileStreak = Reconcile Streak
 *
 * @summary
 * Decides whether "today" counts toward the streak: it counts if ANY
 * picker entry is done OR any streak-participating manual reminder was
 * completed today, but only once EVERYTHING currently on Today is
 * actually done (a day with nothing to do can't claim a streak).
 * Reconciles that verdict against whether the day was already claimed,
 * so toggling the last done item back off un-claims it, and a day is
 * never double-counted. Entries belonging to a hidden picker (see the
 * hidden flag backfilled in migrate above) don't count toward, or
 * block, the streak, same as if that picker didn't exist. Reminders
 * are checked against the last generation's own anchor date (not live
 * "now"), so this must always agree with whatever ReminderSection is
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
 * @returns { streak, streakClaimed } reflecting the reconciled verdict.
 * @see {@link strNumVal}
 *
 * @example
 * ```ts
 * reconcileStreak(state, entries, tasks) // => { streak, streakClaimed }
 * ```
 *
*/

function reconcileStreak( curStaObj, entArgArr, tasArgArr ) {


	const hidPicSet = new Set( ( curStaObj.pickers || [] ).filter( ( curPicObj ) => curPicObj.hidden ).map( ( curPicObj ) => curPicObj.id ) ); // What: Hidden Picker Set. Why: The visible-entries filter below needs fast membership checks against every hidden picker's own id. How: This collects the id of every picker whose own hidden flag is true.
	const vsbEntArr = ( entArgArr || [] ).filter( ( curEntObj ) => !curEntObj.pickerId || !hidPicSet.has( curEntObj.pickerId ) ); // What: Visible Entry Array. Why: An entry belonging to a hidden picker must not count toward, or block, the streak. How: This keeps every entry with no pickerId at all, or whose pickerId isn't in hidPicSet.

	const curAncObj = TASKS.anchorDate( curStaObj.today && curStaObj.today.generatedAt ); // What: Current Anchor Object. Why: Reminder eligibility below must be pinned to the last generation's own day, matching whatever ReminderSection is actually showing right now. How: This calls TASKS.anchorDate with today's own generatedAt.
	const vsbTasArr = TASKS.visibleToday( tasArgArr, curStaObj.reminderOpts, curStaObj.holidays, curAncObj ); // What: Visible Task Array. Why: Only a reminder actually shown today can participate in the streak at all. How: This calls TASKS.visibleToday with curAncObj as the anchor.
	const strTasArr = vsbTasArr.filter( ( curTasObj ) => TASKS.optsFor( curTasObj, curStaObj.reminderOpts ).streak ); // What: Streak Task Array. Why: Only a reminder whose own type has the streak switch on actually counts. How: This filters vsbTasArr to those TASKS.optsFor reports streak:true for.

	const hasAnyBoo = vsbEntArr.length > 0 || strTasArr.length > 0;                              // What: Has Any Boolean. Why: A day with nothing eligible on it at all can't claim a streak either way. How: This is true when either vsbEntArr or strTasArr is non-empty.
	const allEntDonBoo = vsbEntArr.every( ( curEntObj ) => curEntObj.done );                      // What: All Entries Done Boolean. Why: The streak requires every visible entry to be done, not just some. How: This is true only when every entry in vsbEntArr is done.
	const allTasDonBoo = strTasArr.every( ( curTasObj ) => TASKS.isDoneToday( curTasObj, curAncObj ) ); // What: All Tasks Done Boolean. Why: The streak requires every streak-counting reminder to be done today too. How: This is true only when every task in strTasArr is done as of curAncObj.
	const nowDoneBoo = hasAnyBoo && allEntDonBoo && allTasDonBoo;                                 // What: Now Done Boolean. Why: The final streak verdict needs all 3 conditions to hold at once. How: This combines hasAnyBoo/allEntDonBoo/allTasDonBoo with &&.

	const wasClmBoo = !!curStaObj.today.streakClaimed; // What: Was Claimed Boolean. Why: The reconciliation below needs to compare the new verdict against the PRIOR claimed state. How: This coerces curStaObj.today.streakClaimed to a real boolean.
	let strNumVal = curStaObj.streak;   // What: Streak Number Value And Guard. Why: The 2 branches below may adjust this starting from curStaObj's own current streak. How: This starts at curStaObj.streak and is reassigned by whichever branch below actually fires.
	let strClmBoo = wasClmBoo; // What: Streak Claimed Boolean And Guard. Why: The 2 branches below may flip this starting from the prior claimed state. How: This starts at wasClmBoo and is reassigned by whichever branch below actually fires.

	if ( nowDoneBoo && !wasClmBoo ) { strNumVal = strNumVal + 1; strClmBoo = true; } // What: Claim Branch. Why: The day just became fully done and wasn't already claimed, so it banks a new streak point. How: This increments strNumVal and flips strClmBoo true.

	else if ( !nowDoneBoo && wasClmBoo ) { strNumVal = Math.max( 0, strNumVal - 1 ); strClmBoo = false; } // What: Unclaim Branch. Why: The day is no longer fully done but was previously claimed (e.g. an item got un-checked), so its point must be given back. How: This decrements strNumVal (floored at 0) and flips strClmBoo false.



	return { streak : strNumVal, streakClaimed : strClmBoo }; // What: Reconciled Streak Return. Why: The caller needs both the adjusted streak count and its own new claimed state. How: This bundles strNumVal/strClmBoo together.


}

// #endregion reconcileStreak




// #region useStore

/**
 * useStore = Use Store
 *
 * @summary
 * The entire app state layer. Holds one useState for the whole app
 * state object, seeded either from optArgObj.initial (the onboarding
 * demo's own non-persisted state) or from loadState()'s own migrated
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
 *                    the onboarding demo) instead of loadState(); persist:
 *                    false (used by the same demo) disables the idle-
 *                    save/flush effects entirely. Omitted entirely for every
 *                    normal, real-data caller.
 *
 * @returns [state, actions]: the current app state, and the memoized
 * object of state-transition functions that mutate it.
 *
 * @example
 * ```ts
 * useStore() // => [state, actions]
 * ```
 *
*/

function useStore( optArgObj ) {


	const [ appStaObj, setAppStaObj ] = React.useState( () => ( optArgObj && optArgObj.initial ? migrate( optArgObj.initial ) : loadState() ) ); // What: App State Object And Setter. Why: This one useState is the entire app's own persisted state. How: This lazily seeds from optArgObj.initial when given, else from loadState()'s own migrated result.
	const perActBoo = !( optArgObj && optArgObj.persist === false ); // What: Persist Active Boolean. Why: The onboarding demo needs to opt entirely out of the idle-save/flush effects below. How: This is false only when optArgObj.persist is explicitly false.

	const latStaRef = React.useRef( appStaObj ); // What: Latest State Reference And Guard. Why: The idle-save/flush effects below need the CURRENT state even when they fire outside a fresh render (e.g. from a pagehide handler). How: This starts pointing at appStaObj and is kept in sync on every render below.

	latStaRef.current = appStaObj; // What: Latest State Reference Sync. Why: Every render must re-point latStaRef at whatever appStaObj currently is. How: This assigns appStaObj onto latStaRef.current directly in the render body.

	const idlTmoRef = React.useRef( null ); // What: Idle Timeout Reference And Guard. Why: The debounced save effect below needs to remember its own pending idle-callback/timeout handle so a later update can cancel it. How: This starts at null and is set/cleared by canPenFun and the save effect below.

	const canPenFun = React.useCallback( () => { // What: Cancel Pending Function. Why: Both the debounced save effect and the flush effect need to cancel any still-pending idle-callback/timeout before scheduling or flushing again. How: This cancels whatever idlTmoRef currently holds and clears the ref.


		if ( idlTmoRef.current == null ) return; // What: Nothing-Pending Guard. Why: There's nothing to cancel when no idle callback/timeout is currently scheduled. How: This returns immediately when idlTmoRef.current is null/undefined.

		( window.cancelIdleCallback || clearTimeout )( idlTmoRef.current ); // What: Pending Cancel Call. Why: Whichever scheduling primitive was actually used to schedule it is the one that can cancel it. How: This calls cancelIdleCallback when available, else clearTimeout, passing idlTmoRef's own current handle.
		idlTmoRef.current = null; // What: Reference Clear. Why: A cancelled handle must not be mistaken for a still-pending one later. How: This resets idlTmoRef.current back to null.


	}, [] ); // What: Callback Dependency Array. Why: This callback closes over only the stable idlTmoRef, so it never needs to be recreated. How: An empty array means canPenFun is created once and reused for the lifetime of this component.

	React.useEffect( () => { // What: Debounced Save Effect. Why: Every app-state change must eventually be persisted, but not synchronously on the hot path of every single update. How: This cancels any previously-scheduled save, then schedules a fresh one during idle time (or a 200ms timeout fallback), capped at a 2s max wait.


		if ( !perActBoo ) return; // What: Persist-Disabled Guard. Why: The onboarding demo explicitly opts out of ever persisting at all. How: This returns immediately when perActBoo is false.

		canPenFun(); // What: Prior Schedule Cancel. Why: A save already queued for the previous state must not also fire and overwrite this newer one out of order. How: This calls canPenFun to cancel whatever idlTmoRef currently holds.

		const schIdlFun = window.requestIdleCallback || ( ( schCalFun ) => setTimeout( schCalFun, 200 ) ); // What: Schedule Idle Function. Why: Not every browser supports requestIdleCallback, so a plain 200ms timeout is the fallback scheduler. How: This picks requestIdleCallback when available, else wraps setTimeout at a fixed 200ms delay.

		idlTmoRef.current = schIdlFun( () => { idlTmoRef.current = null; saveState( latStaRef.current ); }, { timeout : 2000 } ); // What: Idle Save Schedule. Why: The scheduled callback must clear its own handle before saving, and save whatever the LATEST state is by the time it actually runs. How: This calls schIdlFun with a callback that clears idlTmoRef.current then calls saveState(latStaRef.current), capped by a 2000ms max wait.


	}, [ appStaObj, perActBoo ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever a change to one of these values could need a fresh save scheduled. How: appStaObj changing means there's new state to eventually persist, and perActBoo changing means persistence itself was just turned on or off.

	React.useEffect( () => { // What: Flush-On-Hide Effect. Why: An async IDB write scheduled by the debounced effect above may not survive the page actually going away, so a synchronous flush must run on pagehide, tab-hide, and unmount. How: This wires pagehide/visibilitychange listeners that flush, and returns a cleanup that flushes once more.


		if ( !perActBoo ) return; // What: Persist-Disabled Guard. Why: The onboarding demo explicitly opts out of ever persisting at all. How: This returns immediately when perActBoo is false.

		const runFlsFun = () => { canPenFun(); flushState( latStaRef.current ); }; // What: Run Flush Function. Why: A synchronous flush must first cancel any still-pending idle save so the 2 writes don't race each other. How: This calls canPenFun then flushState(latStaRef.current).
		const onVisFun = () => { if ( document.visibilityState === 'hidden' ) runFlsFun(); }; // What: On Visibility Function. Why: A tab being hidden (not just closed) is another moment a pending save could otherwise be lost. How: This calls runFlsFun only when the document's own visibilityState just became 'hidden'.

		window.addEventListener( 'pagehide', runFlsFun );             // What: Pagehide Listener Attach. Why: The page actually going away is the primary moment this flush must catch. How: This wires runFlsFun to the window's own 'pagehide' event.
		document.addEventListener( 'visibilitychange', onVisFun );    // What: Visibilitychange Listener Attach. Why: A tab merely being hidden (not unloaded) is the secondary moment this flush must catch. How: This wires onVisFun to the document's own 'visibilitychange' event.


		return () => { // What: Cleanup Return. Why: This effect's own listeners must be removed, and one final flush run, whenever perActBoo changes or the component unmounts. How: This flushes once more, then removes both listeners.


			runFlsFun();                                                          // What: Unmount Flush. Why: An unmount is itself a moment a pending save could otherwise be lost. How: This calls runFlsFun one final time.
			window.removeEventListener( 'pagehide', runFlsFun );                  // What: Pagehide Listener Detach. Why: A stale listener must not linger past this effect's own lifetime. How: This removes runFlsFun from the window's own 'pagehide' event.
			document.removeEventListener( 'visibilitychange', onVisFun );         // What: Visibilitychange Listener Detach. Why: A stale listener must not linger past this effect's own lifetime. How: This removes onVisFun from the document's own 'visibilitychange' event.


		};


	}, [ perActBoo ] ); // What: Effect Dependency Array. Why: This effect must re-run only when perActBoo itself changes, since that's the only thing that could turn persistence on or off. How: perActBoo changing means the listeners themselves need re-wiring (or tearing down) under the new persistence setting.


	const actions = React.useMemo( () => ( { // What: Actions Object. Why: This is the entire mutation surface of the app's own state: a tab reads/calls these exact keys by name, so every key here is a real, load-bearing external contract. How: This builds a memoized object of state-transition functions, computed once (empty dependency array below).


		/**
		 * store.jsx = Reset Action
		 *
		 * @summary
		 * Wipes persisted storage, then hard-RELOADS rather than setState-
		 * ing a clean state in place and stopping there: a plain in-memory
		 * reset left stale module-level singletons behind (eml-tour-bus.js's
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
		*/

		reset : async () => { // What: Reset Async Function. Why: This is the "Delete all data" action, and it must fully clear storage AND reload before anything (including this file's own flush effect) can re-persist stale state. How: See the design-rationale comment directly above.


			try { // What: Wipe Attempt. Why: A storage failure here must not prevent the clean reload below from still happening. How: This awaits STORAGE.wipe() then STORAGE.logAuthoritative(), only when STORAGE itself exists.


				if ( STORAGE ) { await STORAGE.wipe(); STORAGE.logAuthoritative(); } // What: Storage Wipe And Log. Why: Both the actual IDB/localStorage clear and the authoritative-write marker must happen before anything else below runs. How: This awaits STORAGE.wipe(), then calls STORAGE.logAuthoritative().


			}

			catch ( errCauObj ) {} // What: Wipe Failure Guard. Why: A wipe failure must never prevent the reload below from still happening. How: This swallows the error silently.

			const cleStaObj = migrate( CLEAN_STATE() ); // What: Clean State Object. Why: The freshly-reloaded app needs a real, migrated empty state ready in latStaRef before reload() fires. How: This builds a fresh CLEAN_STATE() and runs it through migrate().

			latStaRef.current = cleStaObj; // What: Latest State Reference Update. Why: The flush effect's own pagehide handler must see this clean state, not the stale pre-wipe one, per the design-rationale comment above. How: This assigns cleStaObj directly onto latStaRef.current.
			setAppStaObj( cleStaObj );     // What: App State Set. Why: React itself should also reflect the clean state, even though the reload below discards this render anyway. How: This calls setAppStaObj with cleStaObj.

			try { window.location.hash = ''; } catch ( errCauObj ) {} // What: Hash Clear Guard. Why: A stale #settings deep link must not survive the reload, per the design-rationale comment above. How: This clears location.hash, swallowing any error.
			window.location.reload(); // What: Hard Reload. Why: Only a real reload clears stale module-level singletons left behind by an in-memory-only reset. How: This calls window.location.reload().


		},

		// What: Set Onboarding Action. Why: The welcome modal/mini-tour checklist need to flip individual flags without callers re-specifying the whole onboarding object. How: This merges patValObj onto curStaObj.onboarding, defaulting to {} when onboarding doesn't exist yet.
		setOnboarding : ( patValObj ) => setAppStaObj( ( curStaObj ) => ( { ...curStaObj, onboarding : { ...( curStaObj.onboarding || {} ), ...patValObj } } ) ),

		/**
		 * store.jsx = Set Checklist Item Action
		 *
		 * @summary
		 * Resolves (or un-resolves) one mini-tour checklist item (see
		 * onboarding-checklist.js). patValObj is {status:'finished'|
		 * 'skipped'|'cancelled', createdId?} to resolve it, or null to
		 * uncheck it back to pending (redo). Never touches the underlying
		 * sample picker/task; resolution is tracked here only, which is
		 * exactly what makes unchecking free. Also flags the exact moment
		 * readyToGenerate flips false-to-true, for tab-today.jsx's own
		 * auto-scroll (see generateScrollPending's own migrate() comment
		 * for why this has to be captured HERE, the actual mutation
		 * point, rather than as a derived-value comparison inside
		 * TabToday itself, which may not even be mounted right now).
		 *
		*/

		setChecklistItem : ( itemId, patValObj ) => setAppStaObj( ( curStaObj ) => {


			const curCheObj = { ...( ( curStaObj.onboarding && curStaObj.onboarding.checklist ) || {} ) }; // What: Current Checklist Object. Why: The resolve/unresolve below must patch a COPY, never curStaObj.onboarding.checklist directly. How: This shallow-copies curStaObj's own onboarding.checklist, defaulting to {}.

			if ( patValObj ) curCheObj[ itemId ] = patValObj; // What: Resolve Branch. Why: A truthy patValObj resolves the item, giving it a real value. How: This writes patValObj onto curCheObj[itemId].

			else delete curCheObj[ itemId ]; // What: Unresolve Branch. Why: A falsy patValObj (null/undefined) unchecks the item back to pending. How: This deletes curCheObj[itemId] entirely.

			const nexStaObj = { ...curStaObj, onboarding : { ...( curStaObj.onboarding || {} ), checklist : curCheObj } }; // What: Next State Object. Why: The caller needs a fresh state with the patched checklist written on. How: This spreads curStaObj with onboarding's own checklist replaced by curCheObj.

			if ( !OB_CHECKLIST.readyToGenerate( curStaObj ) && OB_CHECKLIST.readyToGenerate( nexStaObj ) ) { // What: Ready-To-Generate Edge Guard. Why: tab-today.jsx's own auto-scroll needs to know the EXACT moment readiness just flipped on, not merely that it's on now. How: This flags generateScrollPending only when curStaObj was not-yet-ready and nexStaObj now is.


				nexStaObj.onboarding.generateScrollPending = true; // What: Generate-Scroll-Pending Flag Set. Why: TabToday consumes (and clears) this the next time it renders with it true, per its own migrate() comment. How: This flips nexStaObj.onboarding.generateScrollPending to true.


			}


			return nexStaObj; // What: Next State Return. Why: The caller needs the fully-patched state. How: This returns nexStaObj, built above.


		} ),

		// What: Set App-Feature Item Action. Why: App Features tutorials (see onboarding-app-features.jsx) resolve independently of the checklist, in their own separate map, for the same reasons documented on its own migrate() backfill. How: This mirrors setChecklistItem's own resolve/unresolve shape, but against onboarding.appFeatures instead.
		setAppFeatureItem : ( itemId, patValObj ) => setAppStaObj( ( curStaObj ) => {


			const appFeaObj = { ...( ( curStaObj.onboarding && curStaObj.onboarding.appFeatures ) || {} ) }; // What: App Features Object. Why: The resolve/unresolve below must patch a COPY, never curStaObj.onboarding.appFeatures directly. How: This shallow-copies curStaObj's own onboarding.appFeatures, defaulting to {}.

			if ( patValObj ) appFeaObj[ itemId ] = patValObj; // What: Resolve Branch. Why: A truthy patValObj resolves the item, giving it a real value. How: This writes patValObj onto appFeaObj[itemId].

			else delete appFeaObj[ itemId ]; // What: Unresolve Branch. Why: A falsy patValObj (null/undefined) unchecks the item back to pending. How: This deletes appFeaObj[itemId] entirely.


			return { ...curStaObj, onboarding : { ...( curStaObj.onboarding || {} ), appFeatures : appFeaObj } }; // What: Next State Return. Why: The caller needs a fresh state with the patched appFeatures written on. How: This spreads curStaObj with onboarding's own appFeatures replaced by appFeaObj.


		} ),

		// What: Set Checklist-Done Action. Why: This flips the instant the closing Generate card's own flow completes; every checklist card stops rendering the moment it's true. How: This writes checklistDone (defaulting to true) onto curStaObj.onboarding.
		setChecklistDone : ( done = true ) => setAppStaObj( ( curStaObj ) => ( { ...curStaObj, onboarding : { ...( curStaObj.onboarding || {} ), checklistDone : done } } ) ),

		/**
		 * store.jsx = Import Data Action
		 *
		 * @summary
		 * Replaces the whole store from an imported JSON blob (Settings
		 * tab's Data control's own Import). Runs through migrate() so an
		 * older/partial export gets the same backfills a fresh load would.
		 * An imported backup's own pickLog is authoritative even when
		 * empty: it replaces ALL data, so stale local history must not
		 * survive it.
		 *
		*/

		importData : ( impObjRaw ) => { // What: Import Data Function. Why: This is called with the parsed JSON blob a user just imported. How: This marks the next save authoritative (so an empty imported pickLog isn't treated as "nothing to save yet"), then replaces state wholesale via migrate().


			try { if ( STORAGE ) STORAGE.logAuthoritative(); } catch ( errCauObj ) {} // What: Authoritative-Write Marker Guard. Why: STORAGE must treat the very next save as authoritative, not incremental, so an intentionally-empty imported log actually overwrites the old one. How: This calls STORAGE.logAuthoritative(), swallowing any error.
			setAppStaObj( migrate( impObjRaw ) ); // What: State Replace. Why: The imported blob becomes the entire new state, once migrated to the current shape. How: This calls setAppStaObj with migrate(impObjRaw).


		},

		// What: Apply Pick-Result Action. Why: Some callers (outside the entry.pending staging path) need to apply a picker's own `updates`/pickerPatch/pick-bump directly. How: This patches value/weight per resValObj.updates, bumps the picked item's own picks/lastPicked, and applies resValObj.pickerPatch when present.
		applyPickResult : ( pickerId, resValObj ) => setAppStaObj( ( curStaObj ) => {


			const updIdeMap = new Map( resValObj.updates.map( ( curUpdObj ) => [ curUpdObj.id, curUpdObj ] ) ); // What: Update Identifier Map. Why: The items map below needs O(1) lookup of each touched item's own update row. How: This maps every resValObj.updates row by its own id.

			const nexIteArr = curStaObj.items.map( ( curIteObj ) => { // What: Next Item Array. Why: Every item must be checked for a staged update or the pick bump. How: This maps curStaObj.items, applying updIdeMap's own patch and/or the pick bump to a touched item, leaving everything else unchanged.


				const matUpdObj = updIdeMap.get( curIteObj.id ); // What: Matched Update Object And Guard. Why: An item this result never mentions has nothing to apply. How: This looks up curIteObj's own id in updIdeMap, undefined when absent.

				if ( !matUpdObj ) return curIteObj; // What: No-Update Guard. Why: An untouched item passes through unchanged. How: This returns curIteObj unchanged when matUpdObj is falsy.

				const nexIteObj = { ...curIteObj }; // What: Next Item Object. Why: The patch below must not mutate curIteObj itself. How: This starts as a shallow copy of curIteObj.

				if ( 'value' in matUpdObj ) nexIteObj.value = matUpdObj.value;   // What: Value Patch. Why: An update row only sometimes carries a new drift/charge value. How: This applies matUpdObj's own value only when the key is present.
				if ( 'weight' in matUpdObj ) nexIteObj.weight = matUpdObj.weight; // What: Weight Patch. Why: An update row only sometimes carries a new ease-down fairness weight. How: This applies matUpdObj's own weight only when the key is present.

				if ( resValObj.picked && resValObj.picked.id === curIteObj.id ) { // What: Pick Bump Guard. Why: Only the item resValObj itself reports as picked gets its own picks/lastPicked bumped. How: This increments picks and stamps lastPicked on nexIteObj when curIteObj matches resValObj.picked.


					nexIteObj.picks = ( curIteObj.picks || 0 ) + 1;             // What: Picks Increment. Why: A real pick must be reflected in this item's own running pick count. How: This increments curIteObj's own picks, defaulting to 0.
					nexIteObj.lastPicked = new Date().toISOString();           // What: Last-Picked Stamp. Why: A real pick must be reflected in this item's own last-picked timestamp. How: This stamps the current instant's own ISO string.


				}


				return nexIteObj; // What: Next Item Return. Why: The caller needs this item's own patched copy. How: This returns nexIteObj, built above.


			} );

			const nexPicArr = resValObj.pickerPatch // What: Next Picker Array. Why: Only a result carrying its own pickerPatch (e.g. Ease Down's activeItemId) needs any picker actually rewritten. How: This patches pickerId's own picker with pickerPatch's own fields, else passes pickers through unchanged.
				? curStaObj.pickers.map( ( curPicObj ) => curPicObj.id === pickerId ? { ...curPicObj, ...resValObj.pickerPatch } : curPicObj )
				: curStaObj.pickers;


			return { ...curStaObj, items : nexIteArr, pickers : nexPicArr }; // What: Next State Return. Why: The caller needs the patched items/pickers written onto a fresh state. How: This spreads curStaObj with items/pickers replaced.


		} ),

		// What: Clear Today-Entries Action. Why: The Welcome Tour uses this to back up to its own Generate step, showing the same pristine "nothing generated yet" state it did the first time through. How: This empties today.entries without touching generatedAt/streakClaimed/anything else about today.
		clearTodayEntries : () => setAppStaObj( ( curStaObj ) => ( { ...curStaObj, today : { ...curStaObj.today, entries : [] } } ) ),


		/**
		 * store.jsx = Add Today-Entry Action
		 *
		 * @summary
		 * Adds a NEW today entry for pickerId showing itemId. Multiple
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
		*/

		addTodayEntry : ( pickerId, itemId, penArgObj ) => setAppStaObj( ( curStaObj ) => {


			const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === pickerId ); // What: Current Picker Object And Guard. Why: Every branch below needs to know this picker's own mode/activeItemId/conditionalId. How: This looks up pickerId in curStaObj.pickers.
			const easDwnBoo = curPicObj && curPicObj.mode === 'ease-down'; // What: Ease-Down Boolean. Why: Ease Down's own single-entry-per-picker replace behavior branches everywhere below. How: This is true only when curPicObj exists and its own mode is 'ease-down'.

			const eid = easDwnBoo // What: Entry Id. Why: Ease Down reuses its own existing entry's eid (so a replace, not a stack); every other mode always mints a fresh one. How: This reuses the picker's own current entry's eid when found, else mints a new one via newEidFun.
				? ( curStaObj.today.entries.find( ( curEntObj ) => curEntObj.pickerId === pickerId )?.eid || newEidFun() )
				: newEidFun();

			let penValObj = penArgObj; // What: Pending Value Object And Guard. Why: The caller's own staged pick result is normally used as-is, but a fallback must be computed when none was given. How: This starts at penArgObj and is resolved below when it's undefined.

			if ( penValObj === undefined ) { // What: Fallback-Pending Guard. Why: Only a caller that passed no pending at all needs the ease-down default computed here. How: This resolves penValObj to null, then to the ease-down default when applicable.


				penValObj = null; // What: Default Pending Reset. Why: Every mode besides ease-down's own re-activation case has no mutation to stage at all. How: This starts penValObj at null before the ease-down check below.

				if ( easDwnBoo && curPicObj.activeItemId !== itemId ) { // What: Ease-Down Reactivation Guard. Why: Only switching to a DIFFERENT active item needs its own staged recharge-and-activate pending. How: This builds penValObj only when curPicObj is ease-down and itemId isn't already its own active item.


					const thrValNum = curPicObj.threshold ?? 100; // What: Threshold Value Number. Why: The previously-active item (if any) must be staged to recharge back to this exact threshold. How: This reads curPicObj's own threshold, defaulting to 100.

					penValObj = { // What: Ease-Down Pending Object. Why: The caller needs a real pending payload staging both the recharge and the activation switch. How: This stages the previously-active item's own recharge (if any), the activeItemId patch, and the pick bump.


						updates : curPicObj.activeItemId ? [ { id : curPicObj.activeItemId, value : thrValNum } ] : [],
						pickerPatch : { activeItemId : itemId },
						pickedId : itemId, bumpPick : false

					};


				}


			}

			const newEntObj = { eid, pickerId, itemId, done : false, skipped : false, pending : penValObj, revert : null }; // What: New Entry Object. Why: This is the actual Today entry being added, in today.entries' own shape. How: This bundles eid/pickerId/itemId with a fresh not-done/not-skipped state and penValObj as its own pending.
			const logRowObj = logRowFun( curStaObj, { eid, pickerId, itemId, source : 'manual' } ); // What: Log Row Object. Why: A manual send must be reflected in the pick log too, denormalized the same way every other pick is. How: This calls logRowFun with source:'manual'.

			const conIdeStr = curPicObj && curPicObj.conditionalId; // What: Conditional Identifier String. Why: The day-off-card check below needs to know which conditional (if any) gates this picker. How: This reads curPicObj's own conditionalId, or stays falsy when curPicObj is missing.
			const hasDofBoo = easDwnBoo && conIdeStr && // What: Has Day-Off Boolean. Why: An ease-down picker that's currently suppressed behind its own day-off card must NOT have that card silently replaced by this manual override. How: This is true only when this is ease-down, gated, and today already shows a live day-off card for that same conditional.
				curStaObj.today.entries.some( ( curEntObj ) => curEntObj.kind === 'dayoff' && curEntObj.conditionalId === conIdeStr );

			const nexEntArr = ( easDwnBoo && !hasDofBoo ) // What: Next Entry Array. Why: Ease Down normally REPLACES its own picker's existing entry; the day-off-card exception instead ADDS an extra entry alongside the still-showing card. How: This filters out this picker's own prior entry (unless the exception applies) before appending newEntObj.
				? [ ...curStaObj.today.entries.filter( ( curEntObj ) => curEntObj.pickerId !== pickerId ), newEntObj ]
				: [ ...curStaObj.today.entries, newEntObj ];

			const nexLogArr = easDwnBoo // What: Next Pick-Log Array. Why: A replaced Ease Down entry must not leave its own prior log row behind under the same eid. How: This drops any earlier row sharing eid before appending logRowObj, only for ease-down; every other mode simply appends.
				? [ ...( curStaObj.pickLog || [] ).filter( ( curRowObj ) => curRowObj.eid !== eid ), logRowObj ]
				: [ ...( curStaObj.pickLog || [] ), logRowObj ];


			return { ...curStaObj, today : { ...curStaObj.today, entries : nexEntArr }, pickLog : nexLogArr }; // What: Next State Return. Why: The caller needs the new entry and its own log row written onto a fresh state. How: This spreads curStaObj with today.entries and pickLog replaced.


		} ),

		/**
		 * store.jsx = Set Entry-Item Action
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
		*/

		setEntryItem : ( eid, itemId, penArgObj ) => setAppStaObj( ( curStaObj ) => {


			const curEntObj = curStaObj.today.entries.find( ( entFinObj ) => entFinObj.eid === eid ); // What: Current Entry Object And Guard. Why: The undo-then-restage flow below needs to know whether this entry was already completed. How: This looks up eid in curStaObj.today.entries.
			let nexIteArr = curStaObj.items, nexPicArr = curStaObj.pickers, nexLogArr = curStaObj.pickLog || []; // What: Next Item/Picker/Pick-Log Arrays And Guard. Why: These default to the unchanged state and are only replaced below when an already-completed entry needs its own pending undone first. How: This starts at curStaObj's own current arrays.

			if ( curEntObj && curEntObj.done && curEntObj.revert ) { // What: Already-Done Undo Guard. Why: A re-roll always lands not-done, so an already-completed entry's own staged mutation must be undone first. How: This calls revertEntryPending and adopts its own result when curEntObj is done and carries a revert snapshot.


				const resValObj = revertEntryPending( { ...curStaObj }, curEntObj ); // What: Result Value Object. Why: revertEntryPending returns the restored items/pickers/pickLog together. How: This calls revertEntryPending with a shallow copy of curStaObj and curEntObj.

				nexIteArr = resValObj.items; nexPicArr = resValObj.pickers; nexLogArr = resValObj.pickLog; // What: Restored Arrays Adopt. Why: Every downstream line below must build on the RESTORED arrays, not the still-applied ones. How: This destructures resValObj's own items/pickers/pickLog onto the outer let bindings.


			}

			const curRowObj = nexLogArr.find( ( logFinObj ) => logFinObj.eid === eid && !logFinObj.outcome ); // What: Current Row Object And Guard. Why: The live log row (if any) is where this eid's own current pickerId can still be read from. How: This finds the one row sharing eid with no outcome yet.
			const pickerId = curRowObj ? curRowObj.pickerId // What: Picker Id. Why: The fresh reroll log row below needs a pickerId, preferring the live log row's own, falling back to the live entry's own. How: This reads curRowObj's own pickerId, else the matching today.entries row's own pickerId.
				: ( curStaObj.today.entries.find( ( entFinObj ) => entFinObj.eid === eid ) || {} ).pickerId;

			let nexLogArr2 = nexLogArr.map( ( logMapObj ) => // What: Next Pick-Log Array (Rejected). Why: The rolled-away row must be marked rejected, keeping its own itemId, before the fresh reroll row is appended. How: This flags the live row sharing eid as outcome:'rejected'.
				( logMapObj.eid === eid && !logMapObj.outcome ) ? { ...logMapObj, outcome : 'rejected' } : logMapObj );

			if ( pickerId ) nexLogArr2.push( logRowFun( { ...curStaObj, items : nexIteArr }, { eid, pickerId, itemId, source : 'reroll' } ) ); // What: Reroll Row Append. Why: Only when a pickerId could actually be resolved does a fresh reroll row make sense to log. How: This pushes a new logRowFun row with source:'reroll' onto nexLogArr2.


			return { // What: Next State Return. Why: The caller needs the entry re-pointed at itemId (not-done, not-skipped, freshly staged), plus the updated log. How: This spreads curStaObj with items/pickers/today.entries/pickLog all replaced.

				...curStaObj, items : nexIteArr, pickers : nexPicArr,
				today : { ...curStaObj.today, entries : curStaObj.today.entries.map( ( entMapObj ) =>
					entMapObj.eid === eid ? { ...entMapObj, itemId, done : false, skipped : false, pending : penArgObj || null, revert : null } : entMapObj ) },
				pickLog : nexLogArr2

			};


		} ),


		/**
		 * store.jsx = Replace Today-Entries Action
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
		*/

		replaceTodayEntries : ( lisEntArr, optArgObj ) => setAppStaObj( ( curStaObj ) => {


			const curDayStr = isoDayFun(); // What: Current Day String. Why: The fresh-row and pick-log-purge logic below both need today's own calendar day. How: This reads isoDayFun().

			const carEntArr = lisEntArr.filter( ( curDscObj ) => curDscObj._carry ).map( ( curDscObj ) => curDscObj.entry ); // What: Carried Entry Array. Why: A carried descriptor's own already-formed entry must be kept verbatim, unwrapped from its own _carry marker. How: This filters lisEntArr to _carry descriptors and unwraps each one's own entry.
			const carEidSet = new Set( carEntArr.map( ( curEntObj ) => curEntObj.eid ) ); // What: Carried Eid Set. Why: The pick-log purge below must never drop a carried entry's own still-live row. How: This collects every carried entry's own eid.

			const frsEntArr = lisEntArr.filter( ( curDscObj ) => !curDscObj._carry ).map( ( curDscObj ) => ( { // What: Fresh Entry Array. Why: Every non-carried descriptor becomes a brand-new Today entry with its own fresh eid. How: This maps each descriptor into a full entry, spreading in periodKey/day-off-card fields only when present.


				eid : newEidFun(), pickerId : curDscObj.pickerId || null, itemId : curDscObj.itemId || null,
				done : false, skipped : false, pending : curDscObj.pending || null, revert : null,
				...( curDscObj.periodKey ? { periodKey : curDscObj.periodKey } : {} ),
				// What: Day-Off Card Fields Spread. Why: A day-off card entry carries a kind + conditional link + display text and has no itemId, and never writes to the pick log (excluded from stats). How: This spreads kind/conditionalId/cardText/group/pickerName/condName only when curDscObj.kind is present.
				...( curDscObj.kind ? { kind : curDscObj.kind, conditionalId : curDscObj.conditionalId || null, cardText : curDscObj.cardText || '', group : curDscObj.group || 'Other', pickerName : curDscObj.pickerName || '', condName : curDscObj.condName || '' } : {} )

			} ) );

			const nexEntArr = [ ...carEntArr, ...frsEntArr ]; // What: Next Entry Array. Why: The new today.entries list is exactly the carried entries plus the freshly-built ones. How: This concatenates carEntArr and frsEntArr.

			const newRowArr = frsEntArr.filter( ( curEntObj ) => !curEntObj.kind && curEntObj.pickerId ).map( ( curEntObj ) => // What: New Row Array. Why: Only a real (non-day-off-card) fresh entry needs its own auto pick-log row; depletedEnd is deliberately NOT written here, since it's a value consequence recorded only on completion. How: This builds one logRowFun row per qualifying fresh entry, source:'auto'.
				logRowFun( curStaObj, { eid : curEntObj.eid, pickerId : curEntObj.pickerId, itemId : curEntObj.itemId, source : 'auto', date : curDayStr } ) );

			const nexLogArr = ( curStaObj.pickLog || [] ).filter( ( curRowObj ) => curRowObj.date !== curDayStr || carEidSet.has( curRowObj.eid ) ).concat( newRowArr ); // What: Next Pick-Log Array. Why: The generator owns today, so every OTHER row logged today (auto or manual) must be dropped, except a carried entry's own still-live row. How: This keeps every row not dated today (or belonging to a carried eid), then appends newRowArr.

			const nexTodObj = { ...curStaObj.today, entries : nexEntArr }; // What: Next Today Object. Why: The caller needs a fresh today object carrying the new entries. How: This spreads curStaObj.today with entries replaced by nexEntArr.

			if ( optArgObj && optArgObj.resetStreak ) nexTodObj.streakClaimed = false; // What: Streak-Claimed Reset Guard. Why: Only the scheduled auto-run (never a manual Regenerate) starts the new period unclaimed, per the design-rationale comment above. How: This sets nexTodObj.streakClaimed to false only when optArgObj.resetStreak is truthy.

			const nexTasArr = ( curStaObj.tasks || [] ).filter( ( curTasObj ) => !TASKS.isCompletedOnce( curTasObj ) ); // What: Next Task Array. Why: Every Generate also drops completed one-time reminders outright, rather than waiting for a future reload/day-change. How: This keeps every task TASKS.isCompletedOnce reports false for.


			return { ...curStaObj, today : nexTodObj, pickLog : nexLogArr, tasks : nexTasArr }; // What: Next State Return. Why: The caller needs today/pickLog/tasks all replaced on a fresh state. How: This spreads curStaObj with the 3 fields replaced.


		} ),

		// What: Resolve Conditionals-For-Day Action. Why: Phase A of Generate: rolls probability/dynamic modes and carries persisted active for ease modes, clearing the per-day charge guard, so the generator can gate pickers off fresh values in the same pass. How: This calls CON_NAM_OBJ.resDayFun, applies its own per-conditional patch, and returns the resolved array directly (not just via setAppStaObj).
		resolveConditionalsForDay : () => {


			let resConArr = null; // What: Resolved Conditionals Array And Guard. Why: The caller needs the resolved array back directly, not only via the next render's own state. How: This starts null and is captured inside the setAppStaObj updater below.

			setAppStaObj( ( curStaObj ) => {

				const patByIdObj = CON_NAM_OBJ.resDayFun( curStaObj.conditionals || [] ); // What: Patch By Id Object. Why: CON_NAM_OBJ itself decides each conditional's own per-day patch (or none). How: This calls CON_NAM_OBJ.resDayFun with curStaObj's own conditionals.
				const nexConArr = ( curStaObj.conditionals || [] ).map( ( curConObj ) => ( { ...curConObj, ...patByIdObj[ curConObj.id ] } ) ); // What: Next Conditionals Array. Why: Every conditional gets its own matching patch (if any) merged on. How: This maps every conditional, spreading in patByIdObj's own entry for its id.

				resConArr = nexConArr; // What: Resolved Array Capture. Why: The outer resConArr must be set from inside this updater, the only place nexConArr actually exists. How: This assigns nexConArr onto the closed-over resConArr.


				return { ...curStaObj, conditionals : nexConArr }; // What: Next State Return. Why: The caller needs conditionals replaced on a fresh state. How: This spreads curStaObj with conditionals replaced by nexConArr.


			} );


			return resConArr; // What: Resolved Conditionals Return. Why: The generator needs the resolved array synchronously, not just via the next render. How: This returns resConArr, captured above.


		},

		// What: Add Conditional Action. Why: This creates a brand-new conditional (a day-off gate) from the Data tab's own authoring form. How: This builds a full conditional object from conArgObj's own fields (defaulting every field not given) and prepends it onto conditionals.
		addConditional : ( conArgObj ) => setAppStaObj( ( curStaObj ) => ( {


			...curStaObj, conditionals : [ {

				id : conArgObj.id || ( 'cnd_' + Math.random().toString( 36 ).slice( 2, 8 ) ),
				name : conArgObj.name || 'Conditional', mode : conArgObj.mode || 'ease-up',
				cardText : conArgObj.cardText || 'Day off', value : conArgObj.mode === 'ease-down' ? ( conArgObj.threshold ?? 100 ) : 0,
				weight : conArgObj.weight ?? 1, oddsPct : conArgObj.oddsPct ?? 50,
				// What: Active/Triggered Defaults. Why: active means enabled (not inactive); triggered means currently firing, defaulting true only for ease-down (which starts "charged"). How: This honors an explicit value when given, else applies each field's own default.
				active : conArgObj.active !== undefined ? conArgObj.active : true,
				triggered : conArgObj.triggered !== undefined ? conArgObj.triggered : ( conArgObj.mode === 'ease-down' ),
				easeMin : conArgObj.easeMin ?? 7, easeMax : conArgObj.easeMax ?? 14,
				threshold : conArgObj.threshold ?? 100, chargedToday : false

			}, ...( curStaObj.conditionals || [] ) ]


		} ) ),

		// What: Update Conditional Action. Why: Callers need to patch one existing conditional's own fields in place, without touching any other. How: This merges patValObj onto the one conditional whose own id matches conIdeStr.
		updateConditional : ( conIdeStr, patValObj ) => setAppStaObj( ( curStaObj ) => ( {

			...curStaObj, conditionals : ( curStaObj.conditionals || [] ).map( ( curConObj ) => curConObj.id === conIdeStr ? { ...curConObj, ...patValObj } : curConObj )

		} ) ),

		// What: Remove Conditional Action. Why: Deleting a conditional must also detach it from every picker that was gated by it, so nothing references a now-gone id. How: This filters the conditional out, and nulls conditionalId on every picker that pointed at it.
		removeConditional : ( conIdeStr ) => setAppStaObj( ( curStaObj ) => ( {

			...curStaObj, conditionals : ( curStaObj.conditionals || [] ).filter( ( curConObj ) => curConObj.id !== conIdeStr ),
			pickers : curStaObj.pickers.map( ( curPicObj ) => curPicObj.conditionalId === conIdeStr ? { ...curPicObj, conditionalId : null } : curPicObj )

		} ) ),


		// What: Toggle Done Action. Why: This is THE central done/undone mutation for a Today entry: it applies (or reverts) the entry's own staged pending, resolves conditional consequences, updates the live pick-log row, and reconciles the streak, all from one toggle. How: See the inline comments below for each step.
		toggleDone : ( eid ) => setAppStaObj( ( curStaObj ) => {


			const curEntObj = curStaObj.today.entries.find( ( entFinObj ) => entFinObj.eid === eid ); // What: Current Entry Object And Guard. Why: A stale eid (already removed) must be a no-op. How: This looks up eid in curStaObj.today.entries.

			if ( !curEntObj ) return curStaObj; // What: Missing-Entry Guard. Why: There's nothing to toggle when curEntObj wasn't found. How: This returns curStaObj unchanged.

			const nowDoneBoo = !curEntObj.done; // What: Now Done Boolean. Why: Every branch below needs to know which direction this toggle is heading. How: This is the logical negation of curEntObj's own current done state.

			let nexIteArr = curStaObj.items, nexPicArr = curStaObj.pickers, nexLogArr = curStaObj.pickLog || [], nexRevObj = null; // What: Next Item/Picker/Pick-Log Arrays And Revert Object, And Guard. Why: These default to the unchanged state and are only replaced by whichever branch below actually fires. How: This starts at curStaObj's own current arrays, with nexRevObj starting null.

			if ( nowDoneBoo ) { // What: Apply Branch. Why: Marking DONE is what actually applies curEntObj's own staged pending mutation. How: This calls applyEntryPending and adopts its own result, including the revert snapshot it returns.


				const resValObj = applyEntryPending( { ...curStaObj }, curEntObj ); // What: Result Value Object. Why: applyEntryPending returns the patched arrays plus a fresh revert snapshot together. How: This calls applyEntryPending with a shallow copy of curStaObj and curEntObj.

				nexIteArr = resValObj.items; nexPicArr = resValObj.pickers; nexLogArr = resValObj.pickLog; nexRevObj = resValObj.revert; // What: Applied Arrays Adopt. Why: Every downstream line below must build on the PATCHED arrays, with the fresh revert snapshot staged on the entry itself. How: This destructures resValObj's own items/pickers/pickLog/revert onto the outer let bindings.


			}

			else { // What: Revert Branch. Why: Un-marking DONE must undo exactly whatever the apply branch above staged, using the entry's own prior revert snapshot. How: This calls revertEntryPending and adopts its own result, clearing nexRevObj back to null.


				const resValObj = revertEntryPending( { ...curStaObj }, curEntObj ); // What: Result Value Object. Why: revertEntryPending returns the restored arrays together. How: This calls revertEntryPending with a shallow copy of curStaObj and curEntObj.

				nexIteArr = resValObj.items; nexPicArr = resValObj.pickers; nexLogArr = resValObj.pickLog; nexRevObj = null; // What: Reverted Arrays Adopt. Why: An un-done entry no longer carries any revert snapshot of its own. How: This destructures resValObj's own items/pickers/pickLog onto the outer let bindings, and nulls nexRevObj.


			}

			const nexEntArr = curStaObj.today.entries.map( ( entMapObj ) => // What: Next Entry Array. Why: Only the toggled entry's own done/skipped/revert fields actually change. How: This maps today.entries, patching the one entry matching eid.
				entMapObj.eid === eid ? { ...entMapObj, done : nowDoneBoo, skipped : false, revert : nexRevObj } : entMapObj );

			// What: Conditional Consequences Resolve. Why: A charge on the first dependent completion, or a day-off card reset/discharge, must be resolved against the ALREADY-toggled entries list. How: This calls applyConditionalToggle then applyConditionalLog, both against the patched items/pickers.
			const nexConArr = applyConditionalToggle( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curEntObj, nowDoneBoo );
			const nexConLogArr = applyConditionalLog( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curEntObj, nowDoneBoo );

			nexLogArr = nexLogArr.map( ( curRowObj ) => ( curRowObj.eid === eid && !curRowObj.outcome ) // What: Live Log Row Toggle. Why: Only the live (active, non-rejected/non-skipped) row for this eid ever toggles its own done/completedAt. How: This stamps done/completedAt on the one matching row, leaving every other row untouched.
				? { ...curRowObj, done : nowDoneBoo, completedAt : nowDoneBoo ? new Date().toISOString() : null }
				: curRowObj );

			const { streak, streakClaimed } = reconcileStreak( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curStaObj.tasks ); // What: Streak Reconcile. Why: Toggling any entry can flip whether today counts as fully done. How: This calls reconcileStreak against the already-patched items/pickers and the already-toggled entries.


			return { ...curStaObj, items : nexIteArr, pickers : nexPicArr, conditionals : nexConArr, conditionalLog : nexConLogArr, streak, today : { ...curStaObj.today, entries : nexEntArr, streakClaimed }, pickLog : nexLogArr }; // What: Next State Return. Why: Every affected field must land together on one fresh state. How: This spreads curStaObj with items/pickers/conditionals/conditionalLog/streak/today/pickLog all replaced.


		} ),

		/**
		 * store.jsx = Skip Entry Action
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
		*/

		skipEntry : ( eid ) => setAppStaObj( ( curStaObj ) => {


			const curEntObj = curStaObj.today.entries.find( ( entFinObj ) => entFinObj.eid === eid ); // What: Current Entry Object And Guard. Why: The undo-before-skip branch below needs to know whether this entry was already completed. How: This looks up eid in curStaObj.today.entries.
			let nexIteArr = curStaObj.items, nexPicArr = curStaObj.pickers, nexLogArr = curStaObj.pickLog || []; // What: Next Item/Picker/Pick-Log Arrays And Guard. Why: These default to the unchanged state and are only replaced below when an already-done entry needs its own pending undone first. How: This starts at curStaObj's own current arrays.

			if ( curEntObj && curEntObj.done && curEntObj.revert ) { // What: Already-Done Undo Guard. Why: A skipped entry is no longer a completion, so any staged mutation it already applied must be undone first. How: This calls revertEntryPending and adopts its own result.


				const resValObj = revertEntryPending( { ...curStaObj }, curEntObj ); // What: Result Value Object. Why: revertEntryPending returns the restored items/pickers/pickLog together. How: This calls revertEntryPending with a shallow copy of curStaObj and curEntObj.

				nexIteArr = resValObj.items; nexPicArr = resValObj.pickers; nexLogArr = resValObj.pickLog; // What: Restored Arrays Adopt. Why: Every downstream line below must build on the RESTORED arrays. How: This destructures resValObj's own items/pickers/pickLog onto the outer let bindings.


			}

			const nexEntArr = curStaObj.today.entries.filter( ( entFilObj ) => entFilObj.eid !== eid ); // What: Next Entry Array. Why: A skipped entry is removed from today entirely, not merely marked. How: This filters out the one entry matching eid.

			const nexConArr = ( curEntObj && curEntObj.done ) // What: Next Conditionals Array. Why: A completed entry being skipped is no longer a completion, so any conditional charge/discharge it drove must be reverted. How: This calls applyConditionalToggle with nowDone:false only when curEntObj was actually done, else passes conditionals through unchanged.
				? applyConditionalToggle( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curEntObj, false )
				: ( curStaObj.conditionals || [] );
			const nexConLogArr = ( curEntObj && curEntObj.done ) // What: Next Conditional-Log Array. Why: The matching cycle's own log row must be un-recorded too, for the same reason as nexConArr above. How: This calls applyConditionalLog with nowDone:false only when curEntObj was actually done, else passes conditionalLog through unchanged.
				? applyConditionalLog( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curEntObj, false )
				: ( curStaObj.conditionalLog || [] );

			nexLogArr = nexLogArr.map( ( curRowObj ) => // What: Live Log Row Skip. Why: The live row for this eid must be marked skipped (never overwriting an already-rejected row from an earlier re-roll). How: This flags the matching row outcome:'skipped', done:false, completedAt:null.
				( curRowObj.eid === eid && curRowObj.outcome !== 'rejected' ) ? { ...curRowObj, outcome : 'skipped', done : false, completedAt : null } : curRowObj );

			const { streak, streakClaimed } = reconcileStreak( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curStaObj.tasks ); // What: Streak Reconcile. Why: Removing an entry from today can flip whether today counts as fully done. How: This calls reconcileStreak against the already-patched items/pickers and the already-filtered entries.


			return { ...curStaObj, items : nexIteArr, pickers : nexPicArr, conditionals : nexConArr, conditionalLog : nexConLogArr, streak, today : { ...curStaObj.today, entries : nexEntArr, streakClaimed }, pickLog : nexLogArr }; // What: Next State Return. Why: Every affected field must land together on one fresh state. How: This spreads curStaObj with items/pickers/conditionals/conditionalLog/streak/today/pickLog all replaced.


		} ),

		/**
		 * store.jsx = Toggle Vacation Action
		 *
		 * @summary
		 * Flips one item's own vacation flag, or (kind:'picker') every item
		 * owned by a picker at once. When an in-progress Ease Down item
		 * (its own picker's activeItemId) is marked inactive, that streak
		 * is abandoned: the picker's activeItemId is nulled and the item
		 * recharges to full, since an abandoned streak never reached 0 and
		 * so must never count toward Spent.
		 *
		*/

		toggleVacation : ( tarIdeStr, kind ) => setAppStaObj( ( curStaObj ) => {


			const curDayStr = isoDayFun(); // What: Current Day String. Why: Every vacationLog row below is stamped with today's own calendar day. How: This reads isoDayFun().

			const abnIfActFun = ( picArgArr, iteArgArr, iteIdsArr ) => { // What: Abandon-If-Active Function. Why: Both branches below (single item, whole picker) share this same abandon-in-progress-streak logic. How: This walks iteIdsArr, and for any item that's some ease-down picker's own activeItemId, nulls that pointer and recharges the item to full.


				let nexPicArr = picArgArr, nexIteArr = iteArgArr; // What: Next Picker/Item Arrays And Guard. Why: The loop below folds its own patch onto these on each iteration that actually finds a match. How: This starts at picArgArr/iteArgArr, the caller's own current arrays.


				for ( const curIteIdeStr of iteIdsArr ) { // What: Abandon Loop. Why: Every touched item id must be checked for whether it's currently some ease-down picker's own in-progress item. How: This iterates iteIdsArr, patching nexPicArr/nexIteArr only for a genuine match.


					const curPicObj = nexPicArr.find( ( picFinObj ) => picFinObj.mode === 'ease-down' && picFinObj.activeItemId === curIteIdeStr ); // What: Current Picker Object And Guard. Why: Only an ease-down picker currently working down exactly this item needs anything abandoned. How: This looks for a picker whose own mode is 'ease-down' and activeItemId matches curIteIdeStr.

					if ( !curPicObj ) continue; // What: No-Match Skip Guard. Why: An item not currently in progress for any picker needs nothing abandoned. How: This skips to the next id when curPicObj wasn't found.

					const thrValNum = curPicObj.threshold ?? 100; // What: Threshold Value Number. Why: An abandoned item must recharge back to this exact threshold, as if it were never touched. How: This reads curPicObj's own threshold, defaulting to 100.

					nexPicArr = nexPicArr.map( ( curPicObj2 ) => curPicObj2.id === curPicObj.id ? { ...curPicObj2, activeItemId : null } : curPicObj2 ); // What: Picker Pointer Null. Why: The abandoned picker must no longer point at this item as its own in-progress one. How: This nulls activeItemId on the one matching picker.
					nexIteArr = nexIteArr.map( ( curIteObj ) => curIteObj.id === curIteIdeStr ? { ...curIteObj, value : thrValNum } : curIteObj );         // What: Item Recharge. Why: An abandoned streak must recharge to full, never counting toward Spent. How: This sets the one matching item's own value to thrValNum.


				}


				return { pickers : nexPicArr, items : nexIteArr }; // What: Abandon Result Return. Why: The caller needs both patched arrays back together. How: This bundles nexPicArr/nexIteArr.


			};

			if ( kind === 'item' ) { // What: Single-Item Branch. Why: Toggling one item's own vacation flag is a narrower case than the whole-picker branch below. How: This flips tarIdeStr's own vacation flag, abandons its own in-progress streak if it just went inactive, and logs the transition.


				const curIteObj = curStaObj.items.find( ( iteFinObj ) => iteFinObj.id === tarIdeStr ); // What: Current Item Object And Guard. Why: The vacationLog row below needs to know the item's own vacation state BEFORE this toggle. How: This looks up tarIdeStr in curStaObj.items.
				const onValBoo = curIteObj ? !curIteObj.vacation : true; // What: On Value Boolean. Why: The vacationLog row records whether the item just went ON (inactive) or OFF (active again). How: This is curIteObj's own negated vacation flag, else true when curIteObj is somehow missing.

				let nexIteArr = curStaObj.items.map( ( curIteObj2 ) => curIteObj2.id === tarIdeStr ? { ...curIteObj2, vacation : !curIteObj2.vacation } : curIteObj2 ); // What: Next Item Array. Why: Only the one matching item's own vacation flag actually flips. How: This maps curStaObj.items, negating vacation on the one matching item.
				let nexPicArr = curStaObj.pickers; // What: Next Picker Array And Guard. Why: This only changes below when the item just went inactive and needs its own in-progress streak abandoned. How: This starts at curStaObj's own current pickers.

				if ( onValBoo ) ( { pickers : nexPicArr, items : nexIteArr } = abnIfActFun( nexPicArr, nexIteArr, [ tarIdeStr ] ) ); // What: Abandon-If-Active Call Guard. Why: Only going INTO vacation (not coming back out of it) can abandon an in-progress streak. How: This calls abnIfActFun and destructures its own result back onto nexPicArr/nexIteArr, only when onValBoo is true.


				return { ...curStaObj, items : nexIteArr, pickers : nexPicArr, // What: Single-Item Return. Why: The caller needs the patched arrays plus a fresh vacationLog row recording this exact transition. How: This spreads curStaObj with items/pickers replaced and appends one row to vacationLog.

					vacationLog : [ ...( curStaObj.vacationLog || [] ), { itemId : tarIdeStr, date : curDayStr, on : onValBoo } ] };


			}

			const ownIteArr = curStaObj.items.filter( ( curIteObj ) => curIteObj.pickerId === tarIdeStr ); // What: Owned Item Array. Why: The whole-picker branch needs every item this picker actually owns. How: This filters curStaObj.items to those whose own pickerId matches tarIdeStr.
			const nexVacBoo = !( ownIteArr.length && ownIteArr.every( ( curIteObj ) => curIteObj.vacation ) ); // What: Next Vacation Boolean. Why: A picker's own toggle flips to the OPPOSITE of "every owned item is already inactive" (so a mixed state turns everything ON first). How: This negates whether ownIteArr is non-empty and every item in it is already vacation:true.
			const chgIteArr = ownIteArr.filter( ( curIteObj ) => curIteObj.vacation !== nexVacBoo ); // What: Changed Item Array. Why: Only an item whose own vacation flag actually differs from nexVacBoo needs a vacationLog row of its own. How: This filters ownIteArr to items whose own vacation doesn't already match nexVacBoo.

			let nexIteArr = curStaObj.items.map( ( curIteObj ) => curIteObj.pickerId === tarIdeStr ? { ...curIteObj, vacation : nexVacBoo } : curIteObj ); // What: Next Item Array. Why: Every item owned by this picker gets the same new vacation state. How: This maps curStaObj.items, setting vacation:nexVacBoo on every item owned by tarIdeStr.
			let nexPicArr = curStaObj.pickers; // What: Next Picker Array And Guard. Why: This only changes below when the picker's own items just went inactive and need their own in-progress streaks abandoned. How: This starts at curStaObj's own current pickers.

			if ( nexVacBoo ) ( { pickers : nexPicArr, items : nexIteArr } = abnIfActFun( nexPicArr, nexIteArr, chgIteArr.map( ( curIteObj ) => curIteObj.id ) ) ); // What: Abandon-If-Active Call Guard. Why: Only going INTO vacation can abandon an in-progress streak, same reasoning as the single-item branch above. How: This calls abnIfActFun (over just the CHANGED items) and destructures its own result, only when nexVacBoo is true.


			return { // What: Whole-Picker Return. Why: The caller needs the patched arrays plus one fresh vacationLog row per actually-changed item. How: This spreads curStaObj with items/pickers replaced and appends chgIteArr's own rows to vacationLog.

				...curStaObj,
				items : nexIteArr,
				pickers : nexPicArr,
				vacationLog : [ ...( curStaObj.vacationLog || [] ), ...chgIteArr.map( ( curIteObj ) => ( { itemId : curIteObj.id, date : curDayStr, on : nexVacBoo } ) ) ]

			};


		} ),


		// What: Set Item-Weight Action. Why: A direct weight override (Data tab) needs to patch just this one field on one item. How: This maps items, setting weight on the one matching tarIdeStr.
		setItemWeight : ( tarIdeStr, weight ) => setAppStaObj( ( curStaObj ) => ( {

			...curStaObj,
			items : curStaObj.items.map( ( curIteObj ) => curIteObj.id === tarIdeStr ? { ...curIteObj, weight } : curIteObj )

		} ) ),

		// What: Update Item Action. Why: This is the general per-item field patch (Fill/Refill/Reset boost, editor saves, ...), which must ALSO strip any stale pending mutation a direct value edit would otherwise be silently overwritten by later (see dropStalePendingUpdates above). How: This merges patValObj onto the one matching item, and when patValObj touches value, also drops stale pending rows for tarIdeStr from every other Today entry.
		updateItem : ( tarIdeStr, patValObj ) => setAppStaObj( ( curStaObj ) => ( {

			...curStaObj,
			items : curStaObj.items.map( ( curIteObj ) => curIteObj.id === tarIdeStr ? { ...curIteObj, ...patValObj } : curIteObj ),
			...( 'value' in patValObj ? { today : { ...curStaObj.today, entries : dropStalePendingUpdates( curStaObj.today.entries, [ tarIdeStr ] ) } } : {} )

		} ) ),

		// What: Move Item-To-End Action. Why: The Pickers-tab add flow renders a picker's own items in array order, so this lands a just-saved item at the bottom of that picker's own list. How: This moves the one matching item to the end of the global items array.
		moveItemToEnd : ( tarIdeStr ) => setAppStaObj( ( curStaObj ) => {


			const tarIteObj = curStaObj.items.find( ( iteFinObj ) => iteFinObj.id === tarIdeStr ); // What: Target Item Object And Guard. Why: A stale tarIdeStr must be a no-op rather than silently dropping the item. How: This looks up tarIdeStr in curStaObj.items.

			if ( !tarIteObj ) return curStaObj; // What: Missing-Item Guard. Why: There's nothing to move when tarIteObj wasn't found. How: This returns curStaObj unchanged.


			return { ...curStaObj, items : [ ...curStaObj.items.filter( ( iteFilObj ) => iteFilObj.id !== tarIdeStr ), tarIteObj ] }; // What: Next State Return. Why: The caller needs tarIteObj moved to the end of the items array. How: This spreads curStaObj with items rebuilt as everything else, then tarIteObj last.


		} ),

		// What: Rename Item Action. Why: Commit-time rename (blur/Enter/Save only, not every keystroke) with de-duplication, so 2 items in the same picker can't share a name. How: This resolves a unique name against the item's own sibling item names, then writes it onto the one matching item.
		renameItem : ( tarIdeStr, name ) => setAppStaObj( ( curStaObj ) => {


			const tarIteObj = curStaObj.items.find( ( iteFinObj ) => iteFinObj.id === tarIdeStr ); // What: Target Item Object And Guard. Why: The sibling filter below needs to know this item's own pickerId to scope the collision check correctly. How: This looks up tarIdeStr in curStaObj.items.
			const sibNamArr = curStaObj.items.filter( ( iteFilObj ) => iteFilObj.pickerId === ( tarIteObj && tarIteObj.pickerId ) && iteFilObj.id !== tarIdeStr ).map( ( iteFilObj ) => iteFilObj.name ); // What: Sibling Name Array. Why: A name only needs to be unique among items owned by the SAME picker, excluding the item being renamed itself. How: This filters curStaObj.items to same-picker siblings, then maps to their own names.
			const uniNamStr = uniNamFun( name, sibNamArr ); // What: Unique Name String. Why: The write below needs the actual de-duplicated name to apply. How: This calls uniNamFun with the requested name and sibNamArr.


			return { ...curStaObj, items : curStaObj.items.map( ( curIteObj ) => curIteObj.id === tarIdeStr ? { ...curIteObj, name : uniNamStr } : curIteObj ) }; // What: Next State Return. Why: The caller needs the one matching item's own name replaced. How: This spreads curStaObj with items rebuilt, patching only the one matching item.


		} ),

		// What: Replace Item Action. Why: This is the full-replace path used to revert an item to a snapshot on editor Cancel. How: This overwrites the one matching item entirely with snpIteObj.
		replaceItem : ( tarIdeStr, snpIteObj ) => setAppStaObj( ( curStaObj ) => ( {

			...curStaObj,
			items : curStaObj.items.map( ( curIteObj ) => curIteObj.id === tarIdeStr ? { ...snpIteObj } : curIteObj )

		} ) ),

		/**
		 * store.jsx = Add Item Action
		 *
		 * @summary
		 * Adds one brand-new item to pickerId's own pool. Ease Down items
		 * start fully charged (value at threshold) and join the fairness
		 * rotation at the AVERAGE weight of existing items (excluding the
		 * weight-0 active item, so a fresh streak's own zero can't drag the
		 * newcomer down), rounded and floored at 1 so it's never a second
		 * weight-0; with no peers yet, weight defaults to 1. An ease-mode
		 * item is also stamped immediately with this picker's own current
		 * average drift band (see PICKERS.avgEase), the only place that
		 * still matters now that pick()/the Data tab/the item editor all
		 * compute this same average live instead of reading a picker-level
		 * default.
		 *
		*/

		addItem : ( pickerId, name, optIdeStr ) => setAppStaObj( ( curStaObj ) => {


			const sibIteArr = curStaObj.items.filter( ( curIteObj ) => curIteObj.pickerId === pickerId ); // What: Sibling Item Array. Why: Both the name de-duplication and the ease-down weight averaging below need this picker's own existing items. How: This filters curStaObj.items to those owned by pickerId.
			const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === pickerId ); // What: Current Picker Object And Guard. Why: The mode checks below need this picker's own live mode. How: This looks up pickerId in curStaObj.pickers.
			const isDwnBoo = curPicObj && curPicObj.mode === 'ease-down'; // What: Is Down Boolean. Why: Only Ease Down needs the special charged-value/fairness-weight treatment below. How: This is true only when curPicObj exists and its own mode is 'ease-down'.
			const isEasBoo = curPicObj && ( curPicObj.mode === 'ease-up' || curPicObj.mode === 'ease-down' ); // What: Is Ease Boolean. Why: Both ease modes need their own drift-band fields stamped below. How: This is true when curPicObj's own mode is either ease-up or ease-down.

			let wgtValNum = 1, valValNum = 0; // What: Weight/Value Values And Guard. Why: Every non-ease-down item just uses these plain defaults; only ease-down overrides them below. How: This starts at weight 1, value 0.

			if ( isDwnBoo ) { // What: Ease-Down Defaults Guard. Why: Only ease-down needs its own charged value and fairness-averaged weight computed. How: This overwrites valValNum/wgtValNum with the ease-down-specific computation below.


				valValNum = curPicObj.threshold ?? 100; // What: Charged Value Set. Why: A new ease-down item starts fully charged, same as every other item in that mode. How: This reads curPicObj's own threshold, defaulting to 100.

				const perWeiArr = sibIteArr.map( ( curIteObj ) => curIteObj.weight ?? 1 ).filter( ( curWeiNum ) => curWeiNum > 0 ); // What: Peer Weight Array. Why: The average below must exclude the weight-0 active item, so a fresh streak's own zero can't drag the newcomer down. How: This maps sibIteArr to its own weights (defaulting 1), then drops any that are 0 or below.

				wgtValNum = perWeiArr.length // What: Fairness Weight Average. Why: A brand-new item should join the rotation at roughly its peers' own average standing, not always at 1. How: This averages perWeiArr, rounds, and floors at 1, else falls back to 1 when there are no peers yet.
					? Math.max( 1, Math.round( perWeiArr.reduce( ( sumValNum, curValNum ) => sumValNum + curValNum, 0 ) / perWeiArr.length ) )
					: 1;


			}

			const newIteObj = { // What: New Item Object. Why: This is the actual item being added, in state.items' own shape. How: This bundles a fresh id, the de-duplicated name, pickerId, the resolved weight/value, and (for ease modes) a fresh drift band.

				id : optIdeStr || ( 'it_' + Math.random().toString( 36 ).slice( 2, 8 ) ),
				name : uniNamFun( name, sibIteArr.map( ( curIteObj ) => curIteObj.name ) ), pickerId,
				weight : wgtValNum, value : valValNum, vacation : false, picks : 0, lastPicked : null,
				...( isEasBoo ? PICKERS.avgEase( sibIteArr, pickerId ) : {} )

			};


			return { ...curStaObj, items : [ newIteObj, ...curStaObj.items ] }; // What: Next State Return. Why: A newly-added item is prepended to the global items array. How: This spreads curStaObj with items rebuilt as newIteObj first, then everything else.


		} ),


		/**
		 * store.jsx = Add Picker Action
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
		*/

		addPicker : ( { id, name, group, mode, items, easeMin, easeMax, includeInDaily = true, daysOfWeek, skipHolidays = false, avoidDuplicates = false, conditionalId = null, newConditional = null, cadence = 'daily', anchorDow, anchorDom, anchorMonth, anchorDay, dateMode, nthOrdinal, nthWeekday, createdFromSample, replaceId, hidden = false } ) => {


			try { // What: First-Picker Persistence Request Guard. Why: The first picker a user creates is the first data worth protecting from browser storage eviction, best asked for now rather than on a cold first load (where a denial would be sticky for the session). How: This calls PWA.noteFirstPicker only when this is genuinely the user's very first picker.


				const curLatObj = latStaRef.current; // What: Current Latest Object. Why: The check below needs the freshest state, not a possibly-stale closed-over one. How: This reads latStaRef's own current value.

				if ( PWA && curLatObj && ( curLatObj.pickers || [] ).length === 0 ) PWA.noteFirstPicker(); // What: First-Picker Call Guard. Why: Only an account with zero existing pickers is about to create its own first one. How: This calls PWA.noteFirstPicker only when PWA/curLatObj exist and curLatObj.pickers is empty.


			}

			catch ( errCauObj ) {} // What: Persistence-Request Failure Guard. Why: A failed permission request must never block picker creation itself. How: This swallows the error silently.

			// What: Picker Id String. Why: An explicit id (onboarding's own sample pickers only, so their ids match the ones baked into precomputed Stats history) must win; every other caller gets a fresh random one. How: This prefers replaceId, then id, else mints a fresh 'pkr_' id.
			const picIdeStr = replaceId || id || ( 'pkr_' + Math.random().toString( 36 ).slice( 2, 8 ) );
			const iniValNum = mode === 'ease-down' ? 100 : 0; // What: Initial Value Number. Why: Every new item's own starting drift value depends on the picker's own mode. How: This is 100 for ease-down (starts "charged"), else 0.
			const isEasBoo = mode === 'ease-up' || mode === 'ease-down'; // What: Is Ease Boolean. Why: Only an ease-mode item carries its own per-item drift band. How: This is true when mode is either ease-up or ease-down.
			const isDwnBoo = mode === 'ease-down'; // What: Is Down Boolean. Why: Only ease-down forces every item to a uniform starting weight of 1 regardless of any user-supplied weight. How: This is true only when mode is 'ease-down'.

			const newIteArr = ( items || [] ).map( ( curIteObj ) => ( { // What: New Item Array. Why: Every typed item in the create form becomes a real item object owned by this picker. How: This maps each raw item into state.items' own shape, honoring a form-set value/vacation and defaulting the rest per mode.


				id : curIteObj.id || ( 'it_' + Math.random().toString( 36 ).slice( 2, 8 ) ),
				name : curIteObj.name, pickerId : picIdeStr,
				weight : isDwnBoo ? 1 : ( curIteObj.weight || 1 ),
				// What: Value Honor-Or-Default. Why: A value the create form already set (e.g. Fill/Refill charging an ease item to threshold) must be honored; otherwise the mode's own default applies. How: This uses curIteObj.value when it isn't null/undefined, else iniValNum.
				value : curIteObj.value != null ? curIteObj.value : iniValNum,
				...( isEasBoo ? { easeMin : curIteObj.easeMin ?? 7, easeMax : curIteObj.easeMax ?? 14 } : {} ),
				vacation : !!curIteObj.vacation, picks : 0, lastPicked : null

			} ) );

			const madConObj = newConditional ? { // What: Made Conditional Object. Why: A brand-new inline conditional (authored inline in this same form) needs its own fresh id minted here so the picker below can attach to it. How: This builds a full conditional object from newConditional's own fields, mirroring addConditional's own defaults.


				id : 'cnd_' + Math.random().toString( 36 ).slice( 2, 8 ),
				name : ( normalizeConditionalName && normalizeConditionalName( newConditional.name ) ) || newConditional.name || 'Conditional', mode : newConditional.mode || 'random',
				cardText : newConditional.cardText || 'Day off',
				value : newConditional.mode === 'ease-down' ? ( newConditional.threshold ?? 100 ) : ( newConditional.value ?? 0 ),
				weight : newConditional.weight ?? 1, oddsPct : newConditional.oddsPct ?? 50,
				active : newConditional.active !== undefined ? newConditional.active : true,
				triggered : newConditional.triggered !== undefined ? newConditional.triggered : ( newConditional.mode === 'ease-down' ),
				easeMin : newConditional.easeMin ?? 7, easeMax : newConditional.easeMax ?? 14,
				threshold : newConditional.threshold ?? 100, chargedToday : false

			} : null;

			const newPicObj = { // What: New Picker Object. Why: This is the actual picker being created (or, with replaceId, re-created in place). How: This bundles the given fields with schedule/gate/visibility defaults resolved below.


				id : picIdeStr, group, name, mode,
				easeMin : easeMin ?? 10, easeMax : easeMax ?? 20, threshold : 100,
				// What: Daily-Generator Schedule. Why: Which weekdays this picker may run on, and whether it sits out public holidays, must be resolved before this picker is usable by the generator. How: This calls CAD_NAM_OBJ.enfWeeFun over CAD_NAM_OBJ.norCadFun's own result, honoring an explicit daysOfWeek or defaulting to every day.
				daysOfWeek : CAD_NAM_OBJ.enfWeeFun( {
					...CAD_NAM_OBJ.norCadFun( { cadence, anchorDow, anchorDom, anchorMonth, anchorDay, dateMode, nthOrdinal, nthWeekday } ),
					daysOfWeek : Array.isArray( daysOfWeek ) && daysOfWeek.length ? daysOfWeek : [ 0, 1, 2, 3, 4, 5, 6 ]
				} ),
				skipHolidays : !!skipHolidays,
				// What: Avoid-Duplicates Flag. Why: This excludes an item from this picker's own pool for the day if its name (case-insensitively) is already present elsewhere on today's list. How: This coerces avoidDuplicates to a real boolean; see pickers.js's own pick() for how it's applied.
				avoidDuplicates : !!avoidDuplicates,
				// What: Picker-Cadence Normalize Spread. Why: The surfacing anchor + display unit must be resolved (and defaulted) the same way for every picker. How: This spreads CAD_NAM_OBJ.norCadFun's own result over newPicObj.
				...CAD_NAM_OBJ.norCadFun( { cadence, anchorDow, anchorDom, anchorMonth, anchorDay, dateMode, nthOrdinal, nthWeekday } ),
				// What: Conditional Id Resolve. Why: A freshly-made inline conditional wins over an explicitly-passed existing one. How: This prefers madConObj's own id, else conditionalId, else null.
				conditionalId : madConObj ? madConObj.id : ( conditionalId || null ),
				// What: Hidden Flag. Why: tab-picker.jsx passes true while the mini-tour checklist is up (mirrors reminders.jsx's own startAdd) so a picker created during onboarding stays out of the real list until the closing Generate step. How: This is copied straight from the hidden parameter (defaulting false).
				hidden,
				// What: Created-From-Sample Spread. Why: This links back to the sample template a mini-tour-created picker was built from (see onboarding-checklist.js); ignored everywhere else in the app. How: This spreads createdFromSample only when it was actually given.
				...( createdFromSample ? { createdFromSample } : {} )

			};

			setAppStaObj( ( curStaObj ) => {


				/**
				 * store.jsx = Picker Name De-Duplication
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

				const finNamStr = OB_SAMPLE_PICKER_IDS.includes( id ) ? ( normalizePickerName( name ) || name ) : uniNamFun(
					normalizePickerName( name ) || name,
					curStaObj.pickers.filter( ( curPicObj ) => !curPicObj.hidden && curPicObj.id !== picIdeStr ).map( ( curPicObj ) => curPicObj.name )
				);
				const finPicObj = { ...newPicObj, name : finNamStr }; // What: Final Picker Object. Why: The picker actually written to state must carry the de-duplicated name, not the raw one. How: This spreads newPicObj with name replaced by finNamStr.

				// What: Next Picker-Ids Array. Why: includeInDaily decides whether this picker joins or leaves the Daily generator's own membership list. How: This adds picIdeStr when includeInDaily and it isn't already present, else removes it.
				const nexPidArr = includeInDaily
					? ( curStaObj.daily.pickerIds.includes( picIdeStr ) ? curStaObj.daily.pickerIds : [ ...curStaObj.daily.pickerIds, picIdeStr ] )
					: curStaObj.daily.pickerIds.filter( ( curPidStr ) => curPidStr !== picIdeStr );


				return { // What: Next State Return. Why: The caller needs items/pickers/conditionals/daily all updated together, honoring replaceId's own "recreate but keep the id" semantics when given. How: This spreads curStaObj, replacing or appending each field depending on whether replaceId was given.

					...curStaObj,
					// What: Items Replace-Or-Append. Why: On a replace, the picker's own OLD items are dropped wholesale and rebuilt from this run's own payload, not merged with whatever was there before. How: This drops replaceId's own old items then appends newIteArr, or simply appends newIteArr when there's no replaceId.
					items : replaceId
						? [ ...curStaObj.items.filter( ( curIteObj ) => curIteObj.pickerId !== replaceId ), ...newIteArr ]
						: [ ...curStaObj.items, ...newIteArr ],
					pickers : replaceId
						? curStaObj.pickers.map( ( curPicObj ) => curPicObj.id === replaceId ? finPicObj : curPicObj )
						: [ ...curStaObj.pickers, finPicObj ],
					conditionals : madConObj ? [ ...( curStaObj.conditionals || [] ), madConObj ] : ( curStaObj.conditionals || [] ),
					daily : { ...curStaObj.daily, pickerIds : nexPidArr }

				};


			} );


			return picIdeStr; // What: Picker Id Return. Why: The caller (the Add-Picker form) needs the new or reused picker's own id back. How: This returns picIdeStr, resolved above.


		},


		/**
		 * store.jsx = Commit Picker-Edit Action
		 *
		 * @summary
		 * Commits an edit made via the Pickers page's own "Edit" button,
		 * which reuses NewPickerForm's own Details step (items aren't
		 * touched by this flow; those are edited via the Data tab or the
		 * live Pickers-tab pool instead). Mirrors addPicker's own field
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
		*/

		commitPickerEdit : ( pickerId, { name, group, mode, includeInDaily, daysOfWeek, skipHolidays, avoidDuplicates, conditionalId, newConditional, cadence, anchorDow, anchorDom, anchorMonth, anchorDay, dateMode, nthOrdinal, nthWeekday } ) => setAppStaObj( ( curStaObj ) => {


			const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === pickerId ); // What: Current Picker Object And Guard. Why: A stale pickerId (already removed) must be a no-op. How: This looks up pickerId in curStaObj.pickers.

			if ( !curPicObj ) return curStaObj; // What: Missing-Picker Guard. Why: There's nothing to edit when curPicObj wasn't found. How: This returns curStaObj unchanged.

			const modChgBoo = mode !== curPicObj.mode; // What: Mode Changed Boolean. Why: Only an actual mode change triggers the item-defaults reset further below. How: This is true when the new mode differs from curPicObj's own current one.
			const finNamStr = uniNamFun( // What: Final Name String. Why: The committed picker still needs its own name tidied and de-duplicated against every OTHER visible picker. How: This calls uniNamFun with the tidied name against every sibling picker's own name, excluding itself.
				normalizePickerName( name ) || name,
				curStaObj.pickers.filter( ( picFilObj ) => !picFilObj.hidden && picFilObj.id !== pickerId ).map( ( picFilObj ) => picFilObj.name )
			);

			const madConObj = newConditional ? { // What: Made Conditional Object. Why: A brand-new inline conditional authored inline in this same edit form needs its own fresh id, mirroring addPicker's own madConObj. How: This builds a full conditional object from newConditional's own fields.


				id : 'cnd_' + Math.random().toString( 36 ).slice( 2, 8 ),
				name : normalizeConditionalName( newConditional.name ) || newConditional.name || 'Conditional', mode : newConditional.mode || 'random',
				cardText : newConditional.cardText || 'Day off',
				value : newConditional.mode === 'ease-down' ? ( newConditional.threshold ?? 100 ) : ( newConditional.value ?? 0 ),
				weight : newConditional.weight ?? 1, oddsPct : newConditional.oddsPct ?? 50,
				active : newConditional.active !== undefined ? newConditional.active : true,
				triggered : newConditional.triggered !== undefined ? newConditional.triggered : ( newConditional.mode === 'ease-down' ),
				easeMin : newConditional.easeMin ?? 7, easeMax : newConditional.easeMax ?? 14,
				threshold : newConditional.threshold ?? 100, chargedToday : false

			} : null;

			const finPicObj = { // What: Final Picker Object. Why: This is curPicObj patched with every field this edit form can change. How: This spreads curPicObj, overriding name/group/mode/schedule/gate fields with the resolved values below.


				...curPicObj, name : finNamStr, group, mode,
				// What: Daily-Generator Schedule. Why: The schedule must be re-resolved the same way addPicker itself resolves it. How: This calls CAD_NAM_OBJ.enfWeeFun over CAD_NAM_OBJ.norCadFun's own result, honoring an explicit daysOfWeek or defaulting to every day.
				daysOfWeek : CAD_NAM_OBJ.enfWeeFun( {
					...CAD_NAM_OBJ.norCadFun( { cadence, anchorDow, anchorDom, anchorMonth, anchorDay, dateMode, nthOrdinal, nthWeekday } ),
					daysOfWeek : Array.isArray( daysOfWeek ) && daysOfWeek.length ? daysOfWeek : [ 0, 1, 2, 3, 4, 5, 6 ]
				} ),
				skipHolidays : !!skipHolidays,
				avoidDuplicates : !!avoidDuplicates,
				...CAD_NAM_OBJ.norCadFun( { cadence, anchorDow, anchorDom, anchorMonth, anchorDay, dateMode, nthOrdinal, nthWeekday } ),
				// What: Conditional Id Resolve. Why: Unlike addPicker's own create-only flow, this can also DETACH a conditional the picker already had, so there's no bare "keep the old one" default to fall back on here. How: This prefers madConObj's own id, else the given conditionalId, else null.
				conditionalId : madConObj ? madConObj.id : ( conditionalId || null )

			};

			const thrValNum = curPicObj.threshold ?? 100; // What: Threshold Value Number. Why: The ease-down item-defaults branch below needs this picker's own threshold. How: This reads curPicObj's own threshold, defaulting to 100.
			const modDefObj = mode === 'ease-down' // What: Mode Defaults Object. Why: Every item's own weight/value/drift-band must reset to sensible defaults for whichever mode was just switched to. How: This picks the ease-down, ease-up, or plain-weighted default shape depending on mode.
				? { weight : 1, value : thrValNum, easeMin : PICKERS.DEFAULT_EASE.easeMin, easeMax : PICKERS.DEFAULT_EASE.easeMax }
				: mode === 'ease-up'
				? { weight : 1, value : 0, easeMin : PICKERS.DEFAULT_EASE.easeMin, easeMax : PICKERS.DEFAULT_EASE.easeMax }
				: { weight : 1, value : 0 };

			const nexIteArr = modChgBoo // What: Next Item Array. Why: Only an ACTUAL mode change resets this picker's own items; an unchanged mode leaves every item's own tuning untouched. How: This maps curStaObj.items, merging modDefObj onto every item owned by pickerId, only when modChgBoo is true.
				? curStaObj.items.map( ( curIteObj ) => curIteObj.pickerId === pickerId ? { ...curIteObj, ...modDefObj } : curIteObj )
				: curStaObj.items;

			const nexPidArr = includeInDaily // What: Next Picker-Ids Array. Why: includeInDaily decides whether this picker joins or leaves the Daily generator's own membership list, same as addPicker's own resolution. How: This adds pickerId when includeInDaily and it isn't already present, else removes it.
				? ( curStaObj.daily.pickerIds.includes( pickerId ) ? curStaObj.daily.pickerIds : [ ...curStaObj.daily.pickerIds, pickerId ] )
				: curStaObj.daily.pickerIds.filter( ( curPidStr ) => curPidStr !== pickerId );


			return { // What: Next State Return. Why: The caller needs items/pickers/conditionals/daily all updated together. How: This spreads curStaObj, replacing each field with the values resolved above.

				...curStaObj,
				items : nexIteArr,
				pickers : curStaObj.pickers.map( ( picMapObj ) => picMapObj.id === pickerId ? finPicObj : picMapObj ),
				conditionals : madConObj ? [ ...( curStaObj.conditionals || [] ), madConObj ] : ( curStaObj.conditionals || [] ),
				daily : { ...curStaObj.daily, pickerIds : nexPidArr }

			};


		} ),

		// What: Seed History Action. Why: This merges precomputed, already-hydrated history rows into state, used only by the Welcome Tour's own onboarding seeding to backfill Stats for the sample pickers/reminders without computing about a year of rows live. How: This prepends pickLog/reminderLog/reminderSkipLog rows (each already in their own full row shape) onto whatever curStaObj already holds.
		seedHistory : ( { pickLog, reminderLog, reminderSkipLog } ) => setAppStaObj( ( curStaObj ) => ( {

			...curStaObj,
			pickLog : [ ...( pickLog || [] ), ...( curStaObj.pickLog || [] ) ],
			reminderLog : [ ...( reminderLog || [] ), ...( curStaObj.reminderLog || [] ) ],
			reminderSkipLog : [ ...( reminderSkipLog || [] ), ...( curStaObj.reminderSkipLog || [] ) ]

		} ) ),

		// What: Remove Item Action. Why: Deleting an item must also drop today's own entries pointing at it (keeping the ring/group totals honest), reconcile the streak as a removal would, drop today's own live log rows for it (keeping historical rows for Stats survivability), and clear any picker's own activeItemId pointer at it. How: See the inline comments below for each step.
		removeItem : ( tarIdeStr ) => setAppStaObj( ( curStaObj ) => {


			const nexIteArr = curStaObj.items.filter( ( curIteObj ) => curIteObj.id !== tarIdeStr ); // What: Next Item Array. Why: The removed item must actually be gone from state.items. How: This filters out the one matching tarIdeStr.
			const nexEntArr = ( curStaObj.today.entries || [] ).filter( ( curEntObj ) => curEntObj.itemId !== tarIdeStr ); // What: Next Entry Array. Why: A removed item can no longer have a live Today entry pointing at it. How: This filters out every entry whose own itemId matches tarIdeStr.

			const curDayStr = isoDayFun(); // What: Current Day String. Why: The pick-log purge below only drops TODAY's own rows, keeping history intact. How: This reads isoDayFun().
			const nexLogArr = ( curStaObj.pickLog || [] ).filter( ( curRowObj ) => !( curRowObj.itemId === tarIdeStr && curRowObj.date === curDayStr ) ); // What: Next Pick-Log Array. Why: Only today's own live rows for this item are dropped; historical rows survive (their own denormalized name preserves past stats, like reminderLog does). How: This filters out rows matching both tarIdeStr and curDayStr.

			const { streak, streakClaimed } = reconcileStreak( curStaObj, nexEntArr, curStaObj.tasks ); // What: Streak Reconcile. Why: Removing an item can drop entries off today, which can flip whether today counts as fully done. How: This calls reconcileStreak against the already-filtered entries.
			const nexPicArr = curStaObj.pickers.map( ( curPicObj ) => curPicObj.activeItemId === tarIdeStr ? { ...curPicObj, activeItemId : null } : curPicObj ); // What: Next Picker Array. Why: A removed item that was some ease-down picker's own in-progress item must no longer be pointed at. How: This nulls activeItemId on any picker that was pointing at tarIdeStr.


			return { ...curStaObj, items : nexIteArr, pickers : nexPicArr, streak, pickLog : nexLogArr, today : { ...curStaObj.today, entries : nexEntArr, streakClaimed } }; // What: Next State Return. Why: Every affected field must land together on one fresh state. How: This spreads curStaObj with items/pickers/streak/pickLog/today all replaced.


		} ),

		// What: Remove Picker Action. Why: Deleting a picker must also delete every item it owns (items are tied to one picker), and unhook it from both the daily generator and today's list. How: This filters items/pickers/entries/pickerIds, and purges only today's own live pick-log rows (keeping history intact).
		removePicker : ( pickerId ) => setAppStaObj( ( curStaObj ) => {


			const curDayStr = isoDayFun(); // What: Current Day String. Why: The pick-log purge below only drops TODAY's own rows, keeping history intact. How: This reads isoDayFun().


			return { // What: Next State Return. Why: Every field this picker touches must be cleaned up together. How: This spreads curStaObj, filtering items/pickers/daily.pickerIds/today.entries/pickLog.

				...curStaObj,
				items : curStaObj.items.filter( ( curIteObj ) => curIteObj.pickerId !== pickerId ),
				pickers : curStaObj.pickers.filter( ( curPicObj ) => curPicObj.id !== pickerId ),
				daily : { ...curStaObj.daily, pickerIds : ( curStaObj.daily.pickerIds || [] ).filter( ( curPidStr ) => curPidStr !== pickerId ) },
				today : { ...curStaObj.today, entries : ( curStaObj.today.entries || [] ).filter( ( curEntObj ) => curEntObj.pickerId !== pickerId ) },
				// What: Pick-Log Purge. Why: Historical rows are kept (denormalized survivability); only today's own live ones for this picker are dropped. How: This filters out rows matching both pickerId and curDayStr.
				pickLog : ( curStaObj.pickLog || [] ).filter( ( curRowObj ) => !( curRowObj.pickerId === pickerId && curRowObj.date === curDayStr ) )

			};


		} ),

		/**
		 * store.jsx = Refill Picker Action
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
		*/

		refillPicker : ( pickerId ) => setAppStaObj( ( curStaObj ) => {


			const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === pickerId ); // What: Current Picker Object And Guard. Why: A stale pickerId (already removed) must be a no-op. How: This looks up pickerId in curStaObj.pickers.

			if ( !curPicObj ) return curStaObj; // What: Missing-Picker Guard. Why: There's nothing to refill when curPicObj wasn't found. How: This returns curStaObj unchanged.

			const thrValNum = curPicObj.threshold ?? 100; // What: Threshold Value Number. Why: Every owned item's own value below must be raised to (at least) this exact number. How: This reads curPicObj's own threshold, defaulting to 100.


			return { // What: Next State Return. Why: The caller needs every owned item's own value raised (never lowered), and any in-progress ease-down item cleared. How: This spreads curStaObj with items/pickers replaced.

				...curStaObj,
				items : curStaObj.items.map( ( curIteObj ) =>
					curIteObj.pickerId === pickerId ? { ...curIteObj, value : Math.max( curIteObj.value ?? 0, thrValNum ) } : curIteObj ),
				pickers : curStaObj.pickers.map( ( picMapObj ) => picMapObj.id === pickerId ? { ...picMapObj, activeItemId : null } : picMapObj )

			};


		} ),


		/**
		 * store.jsx = Manual Reminders
		 *
		 * @summary
		 * Statically-scheduled tasks shown atop Today, distinct from the
		 * randomly-picked items above. fields.replaceId updates THIS
		 * existing task in place (same id) instead of prepending a new
		 * one, mirroring addPicker's own replaceId, used when a reminder
		 * mini-tour is replayed after already finishing once (see
		 * reminders.jsx's own commit(), which looks up the prior real task
		 * via createdFromSample).
		 *
		*/

		// What: Add Task Action. Why: Hidden reminders (onboarding's own sample reminders, plus any real reminder still hidden pending the checklist's closing Generate step) are excluded from the sibling-name check, same policy as addPicker's own uniNamFun call, otherwise the FIRST real reminder a tutorial ever creates would collide with its own still-hidden sample template. How: This builds a default task via TASKS.defaultTask, resolves fields.replaceId, de-duplicates its own name, then replaces or prepends it.
		addTask : ( fields ) => setAppStaObj( ( curStaObj ) => {


			const newTasObj = TASKS.defaultTask( fields ); // What: New Task Object. Why: TASKS itself owns the real default shape for a brand-new task. How: This calls TASKS.defaultTask with the given fields.
			const tasIdeStr = fields.replaceId || newTasObj.id; // What: Task Identifier String. Why: A replace keeps the existing id alive; a fresh add uses the one TASKS.defaultTask just minted. How: This prefers fields.replaceId, else newTasObj's own id.
			const finTasObj = { ...newTasObj, id : tasIdeStr }; // What: Final Task Object. Why: The task actually written must carry tasIdeStr, not necessarily newTasObj's own freshly-minted one. How: This spreads newTasObj with id overridden.

			const sibNamArr = curStaObj.tasks.filter( ( curTasObj ) => curTasObj.id !== tasIdeStr && !curTasObj.hidden ).map( ( curTasObj ) => curTasObj.name ); // What: Sibling Name Array. Why: The de-duplication below must exclude both this task itself and every hidden (invisible) reminder. How: This filters curStaObj.tasks down to visible siblings, then maps to their own names.
			const nmdTasObj = { ...finTasObj, name : uniNamFun( finTasObj.name, sibNamArr ) }; // What: Named Task Object. Why: The task actually written must carry its own de-duplicated name. How: This spreads finTasObj with name replaced by uniNamFun's own result.

			const nexTasArr = fields.replaceId // What: Next Task Array. Why: A replace updates the one matching task in place; a fresh add prepends the new one. How: This maps in nmdTasObj for the matching id when fields.replaceId was given, else prepends nmdTasObj.
				? curStaObj.tasks.map( ( curTasObj ) => curTasObj.id === tasIdeStr ? nmdTasObj : curTasObj )
				: [ nmdTasObj, ...curStaObj.tasks ];


			return { ...curStaObj, tasks : nexTasArr }; // What: Next State Return. Why: The caller needs tasks replaced on a fresh state. How: This spreads curStaObj with tasks replaced by nexTasArr.


		} ),

		// What: Update Task Action. Why: Callers need to patch one existing task's own fields in place, without touching any other. How: This merges patValObj onto the one task whose own id matches tarIdeStr.
		updateTask : ( tarIdeStr, patValObj ) => setAppStaObj( ( curStaObj ) => ( {

			...curStaObj, tasks : curStaObj.tasks.map( ( curTasObj ) => curTasObj.id === tarIdeStr ? { ...curTasObj, ...patValObj } : curTasObj )

		} ) ),

		// What: Rename Task Action. Why: Commit-time reminder rename (blur/Enter/Save only) with de-duplication. How: This resolves a unique name against every OTHER task's own name, then writes it onto the one matching task.
		renameTask : ( tarIdeStr, name ) => setAppStaObj( ( curStaObj ) => {


			const sibNamArr = curStaObj.tasks.filter( ( curTasObj ) => curTasObj.id !== tarIdeStr ).map( ( curTasObj ) => curTasObj.name ); // What: Sibling Name Array. Why: A reminder name only needs to be unique among every OTHER reminder. How: This filters curStaObj.tasks to every task but the one being renamed, then maps to their own names.
			const uniNamStr = uniNamFun( name, sibNamArr ); // What: Unique Name String. Why: The write below needs the actual de-duplicated name to apply. How: This calls uniNamFun with the requested name and sibNamArr.


			return { ...curStaObj, tasks : curStaObj.tasks.map( ( curTasObj ) => curTasObj.id === tarIdeStr ? { ...curTasObj, name : uniNamStr } : curTasObj ) }; // What: Next State Return. Why: The caller needs the one matching task's own name replaced. How: This spreads curStaObj with tasks rebuilt, patching only the one matching task.


		} ),

		// What: Replace Task Action. Why: This is the full-replace path used to revert a reminder to a snapshot on editor Cancel. How: This overwrites the one matching task entirely with snpTasObj.
		replaceTask : ( tarIdeStr, snpTasObj ) => setAppStaObj( ( curStaObj ) => ( {

			...curStaObj, tasks : curStaObj.tasks.map( ( curTasObj ) => curTasObj.id === tarIdeStr ? { ...snpTasObj } : curTasObj )

		} ) ),

		// What: Remove Task Action. Why: Deleting a reminder must actually drop it from state.tasks. How: This filters out the one matching tarIdeStr.
		removeTask : ( tarIdeStr ) => setAppStaObj( ( curStaObj ) => ( {

			...curStaObj, tasks : curStaObj.tasks.filter( ( curTasObj ) => curTasObj.id !== tarIdeStr )

		} ) ),

		// What: Skip Task Action. Why: This hides a reminder until its own next eligible day (computed by the caller from the reminder's own rules), without marking it done or logging a completion, but DOES append a skip row so Stats can tally per-reminder skips. How: This writes skipUntil onto the matching task and appends one row to reminderSkipLog.
		skipTask : ( tarIdeStr, untilIso ) => setAppStaObj( ( curStaObj ) => {


			const curTasObj = curStaObj.tasks.find( ( tasFinObj ) => tasFinObj.id === tarIdeStr ); // What: Current Task Object And Guard. Why: The skip row below needs this task's own name and recurrence type, when it still exists. How: This looks up tarIdeStr in curStaObj.tasks.
			const skpRowArr = curTasObj ? [ { // What: Skip Row Array. Why: A stale tarIdeStr (already removed) must log no row at all. How: This builds one reminderSkipLog row when curTasObj was found, else stays empty.


				rowId : 'rs_' + Math.random().toString( 36 ).slice( 2, 9 ),
				taskId : tarIdeStr,
				name : curTasObj.name,
				type : TASKS.isRecurring( curTasObj ) ? 'recurring' : 'once',
				skippedAt : new Date().toISOString()

			} ] : [];


			return { // What: Next State Return. Why: The caller needs skipUntil written on the matching task, and the skip row (if any) appended to reminderSkipLog. How: This spreads curStaObj with tasks/reminderSkipLog both replaced.

				...curStaObj,
				tasks : curStaObj.tasks.map( ( curTasObj2 ) => curTasObj2.id === tarIdeStr ? { ...curTasObj2, skipUntil : untilIso } : curTasObj2 ),
				reminderSkipLog : [ ...( curStaObj.reminderSkipLog || [] ), ...skpRowArr ]

			};


		} ),

		// What: Set Reminder-Opt Action. Why: This flips one participation switch for a reminder type ('once' | 'recurring'), without callers re-specifying every other switch. How: This normalizes the current options, then merges one key onto the matching type's own sub-object.
		setReminderOpt : ( type, key, value ) => setAppStaObj( ( curStaObj ) => {


			const nrmOptObj = TASKS.normalizeOpts( curStaObj.reminderOpts ); // What: Normalized Options Object. Why: A patch must be applied against the FULL, normalized switch set, never a possibly-partial raw one. How: This calls TASKS.normalizeOpts with curStaObj's own reminderOpts.


			return { ...curStaObj, reminderOpts : { ...nrmOptObj, [ type ] : { ...nrmOptObj[ type ], [ key ] : value } } }; // What: Next State Return. Why: The caller needs just this one switch flipped, every other one untouched. How: This spreads nrmOptObj, overriding [type]'s own sub-object with [key] replaced by value.


		} ),

		// What: Set Reminder-Opts Action. Why: This is the full-replace path used to revert the participation options on Controls Cancel. How: This overwrites reminderOpts entirely with a copy of optArgObj.
		setReminderOpts : ( optArgObj ) => setAppStaObj( ( curStaObj ) => ( { ...curStaObj, reminderOpts : { ...optArgObj } } ) ),

		// What: Set Appearance-Auto-System Action. Why: "System preference" (Appearance) makes the app auto-swap between the current theme and its own light/dark counterpart to match the OS's own prefers-color-scheme, rather than always applying whichever was picked. How: This writes autoSystem onto appearance.
		setAppearanceAutoSystem : ( on ) => setAppStaObj( ( curStaObj ) => ( {
			...curStaObj, appearance : { ...( curStaObj.appearance || {} ), autoSystem : on }
		} ) ),

		// What: Set Pick-Anim Action. Why: This picks the Today tab's own pick-reveal animation style ('reel' | 'spotlight' | 'dissolve'). How: This writes pickAnim onto appearance.
		setPickAnim : ( style ) => setAppStaObj( ( curStaObj ) => ( {
			...curStaObj, appearance : { ...( curStaObj.appearance || {} ), pickAnim : style }
		} ) ),

		// What: Set Completion-Style Action. Why: This picks the Today tab's own ring-fill completion-celebration style ('ripple' | 'confetti' | 'sparkle'). How: This writes completionStyle onto appearance.
		setCompletionStyle : ( style ) => setAppStaObj( ( curStaObj ) => ( {
			...curStaObj, appearance : { ...( curStaObj.appearance || {} ), completionStyle : style }
		} ) ),

		// What: Set Tab-Placement Action. Why: This picks the tab bar's own placement ('bottom' | 'side' | 'top') from Appearance's own Layout control. How: This writes tabPlacement onto appearance.
		setTabPlacement : ( placement ) => setAppStaObj( ( curStaObj ) => ( {
			...curStaObj, appearance : { ...( curStaObj.appearance || {} ), tabPlacement : placement }
		} ) ),

		// What: Set Appearance-Theme Action. Why: This picks a built-in theme by key ('ink' | 'sage' | 'sand' | 'night' | 'moss' | 'ember'), or 'customLight'/'customDark' once the matching custom colors have been set via setCustomTheme. How: This writes theme onto appearance.
		setAppearanceTheme : ( theme ) => setAppStaObj( ( curStaObj ) => ( {
			...curStaObj, appearance : { ...( curStaObj.appearance || {} ), theme }
		} ) ),


		/**
		 * store.jsx = Set Custom-Theme Action
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
		*/

		setCustomTheme : ( mode, colors ) => setAppStaObj( ( curStaObj ) => {


			const keyNamStr = mode === 'dark' ? 'customDark' : 'customLight'; // What: Key Name String. Why: Every field below is written under whichever slot this exact mode owns. How: This picks 'customDark' or 'customLight' from mode.
			const couKeyStr = mode === 'dark' ? 'customLight' : 'customDark'; // What: Counter Key String. Why: The auto-derive step below writes onto the OPPOSITE slot from keyNamStr. How: This picks the opposite of keyNamStr.
			const couModStr = mode === 'dark' ? 'light' : 'dark'; // What: Counter Mode String. Why: This names the opposite mode for clarity alongside couKeyStr, even though nothing below currently reads it. How: This picks the opposite of mode.

			const savColObj = { ...colors, derived : false }; // What: Saved Colors Object. Why: A directly-saved slot is by definition NOT auto-derived from its own counterpart. How: This spreads colors with derived explicitly set false.
			const nexApeObj = { // What: Next Appearance Object. Why: The caller needs this slot saved and immediately activated as the live theme. How: This spreads curStaObj's own appearance, writing savColObj under keyNamStr and setting theme to keyNamStr.


				...( curStaObj.appearance || {} ),
				[ keyNamStr ] : savColObj,
				theme : keyNamStr

			};

			const couSlotObj = nexApeObj[ couKeyStr ]; // What: Counter Slot Object And Guard. Why: The auto-derive check below needs to know whether the counterpart slot already has a real, manually-derived value. How: This reads nexApeObj's own counterpart slot.

			if ( !couSlotObj || couSlotObj.derived !== false ) { // What: Auto-Derive Guard. Why: Only a counterpart that's missing, or ITSELF still auto-derived, should be overwritten; a real manual edit (derived:false) must never be clobbered. How: This rewrites nexApeObj's own counterpart slot only when this condition holds.


				nexApeObj[ couKeyStr ] = { // What: Counterpart Slot Write. Why: The counterpart needs its own bg/text/accent inverted from the slot that was just saved, keeping any existing name. How: This spreads the prior counterpart slot (or {}), overriding bg/text/accent via invColFun and flagging derived:true.

					...( couSlotObj || {} ), // What: Existing Name Keep Spread. Why: A counterpart slot's own name (if it had one) shouldn't be lost just because its colors are being re-derived. How: This spreads couSlotObj (or {}) first, so bg/text/accent/derived below still win.
					bg : invColFun( colors.bg ), text : invColFun( colors.text ), accent : invColFun( colors.accent ),
					derived : true

				};


			}


			return { ...curStaObj, appearance : nexApeObj }; // What: Next State Return. Why: The caller needs appearance replaced on a fresh state. How: This spreads curStaObj with appearance replaced by nexApeObj.


		} ),

		/**
		 * store.jsx = Set Custom-Theme-Name Action
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
		*/

		setCustomThemeName : ( mode, name ) => setAppStaObj( ( curStaObj ) => {


			const keyNamStr = mode === 'dark' ? 'customDark' : 'customLight'; // What: Key Name String. Why: The rename below is written under whichever slot this exact mode owns. How: This picks 'customDark' or 'customLight' from mode.
			const couKeyStr = mode === 'dark' ? 'customLight' : 'customDark'; // What: Counter Key String. Why: The auto-derive step below writes onto the OPPOSITE slot from keyNamStr. How: This picks the opposite of keyNamStr.

			const sedDefObj = mode === 'dark' // What: Seed Defaults Object. Why: The counterpart fallback below needs plausible starting colors when it has no slot of its own yet at all. How: This picks the light-mode defaults when mode is 'dark' (since the counterpart would be light), else the dark-mode defaults.
				? { bg : '#fcfbf9', text : '#242629', accent : '#3360a8' }
				: { bg : '#1e2230', text : '#f2f3f6', accent : '#7da4ff' };

			const curColObj = ( curStaObj.appearance || {} )[ keyNamStr ] || ( mode === 'dark' // What: Current Colors Object. Why: The rename below must preserve this slot's own existing colors, falling back to plausible defaults when it has none yet. How: This reads curStaObj's own appearance[keyNamStr], else a dark/light default shape matching mode.
				? { bg : '#1e2230', text : '#f2f3f6', accent : '#7da4ff' }
				: { bg : '#fcfbf9', text : '#242629', accent : '#3360a8' } );

			const nexApeObj = { ...( curStaObj.appearance || {} ), [ keyNamStr ] : { ...curColObj, name, nameDerived : false } }; // What: Next Appearance Object. Why: This slot's own colors are kept, but its name is now explicitly set (nameDerived:false, since a direct rename is never itself derived). How: This spreads curStaObj's own appearance, writing the renamed slot under keyNamStr.

			const couSlotObj = nexApeObj[ couKeyStr ]; // What: Counter Slot Object And Guard. Why: The auto-rename check below needs to know whether the counterpart's own name was already set directly. How: This reads nexApeObj's own counterpart slot.

			if ( !couSlotObj || couSlotObj.nameDerived !== false ) { // What: Auto-Rename Guard. Why: Only a counterpart whose own name is missing, or ITSELF still auto-derived, should be renamed along with this one. How: This rewrites nexApeObj's own counterpart slot only when this condition holds.

				nexApeObj[ couKeyStr ] = { ...( couSlotObj || sedDefObj ), name, nameDerived : true }; // What: Counterpart Slot Rename. Why: The counterpart needs the same name, flagged as auto-derived rather than a direct user choice. How: This spreads the prior counterpart slot (or sedDefObj) with name/nameDerived overridden.


			}


			return { ...curStaObj, appearance : nexApeObj }; // What: Next State Return. Why: The caller needs appearance replaced on a fresh state. How: This spreads curStaObj with appearance replaced by nexApeObj.


		} ),

		/**
		 * store.jsx = Toggle Task-Done Action
		 *
		 * @summary
		 * Checks/un-checks today's own occurrence of a reminder. Completing
		 * stamps lastDone with today AND appends a row to the completion
		 * log; un-checking clears lastDone and voids today's own log row
		 * for that reminder. Either way the streak is reconciled, since
		 * reminders count toward the daily streak per their own type's
		 * switch, but the Stats log itself is kept regardless of the
		 * Stats toggle. Stamped against the generator's own day (TASKS.
		 * anchorDate), not live real time, since Today's own reminders
		 * list is itself pinned to the last generation, so "done" must
		 * agree with whatever day that list is currently showing.
		 *
		*/

		toggleTaskDone : ( tarIdeStr ) => setAppStaObj( ( curStaObj ) => {


			const curTasObj = curStaObj.tasks.find( ( tasFinObj ) => tasFinObj.id === tarIdeStr ); // What: Current Task Object And Guard. Why: A stale tarIdeStr (already removed) must be a no-op. How: This looks up tarIdeStr in curStaObj.tasks.

			if ( !curTasObj ) return curStaObj; // What: Missing-Task Guard. Why: There's nothing to toggle when curTasObj wasn't found. How: This returns curStaObj unchanged.

			const curAncObj = TASKS.anchorDate( curStaObj.today && curStaObj.today.generatedAt ); // What: Current Anchor Object. Why: Every day-comparison below must be pinned to the last generation's own day, not live "now". How: This calls TASKS.anchorDate with today's own generatedAt.
			const curDayStr = TASKS.isoOf( curAncObj ); // What: Current Day String. Why: Both the lastDone stamp and the completion-log row below need this exact ISO day. How: This calls TASKS.isoOf with curAncObj.
			const wasDoneBoo = TASKS.isDoneToday( curTasObj, curAncObj ); // What: Was Done Boolean. Why: Every branch below depends on which direction this toggle is heading. How: This calls TASKS.isDoneToday with curTasObj and curAncObj.
			const nexTasArr = curStaObj.tasks.map( ( curTasObj2 ) => // What: Next Task Array. Why: Only the toggled task's own lastDone actually changes. How: This maps curStaObj.tasks, setting lastDone to null (un-checking) or curDayStr (completing) on the one matching task.
				curTasObj2.id === tarIdeStr ? { ...curTasObj2, lastDone : wasDoneBoo ? null : curDayStr } : curTasObj2 );

			let nexLogArr = curStaObj.reminderLog || []; // What: Next Reminder-Log Array And Guard. Why: Both branches below patch this same array, one way or the other. How: This starts at curStaObj's own current reminderLog.

			if ( wasDoneBoo ) { // What: Un-Check Branch. Why: Un-checking must void today's own completion row for this reminder. How: This filters out the one row matching taskId and curDayStr.


				nexLogArr = nexLogArr.filter( ( curRowObj ) =>
					!( curRowObj.taskId === tarIdeStr && TASKS.isoOf( new Date( curRowObj.completedAt ) ) === curDayStr ) );


			}

			else { // What: Complete Branch. Why: Completing must append a fresh completion row for this reminder. How: This appends one row shaped to state.reminderLog's own contract.


				nexLogArr = [ ...nexLogArr, {

					rowId : 'rl_' + Math.random().toString( 36 ).slice( 2, 9 ),
					taskId : tarIdeStr,
					name : curTasObj.name,
					type : TASKS.isRecurring( curTasObj ) ? 'recurring' : 'once',
					completedAt : new Date().toISOString()

				} ];


			}

			const { streak, streakClaimed } = reconcileStreak( curStaObj, curStaObj.today.entries, nexTasArr ); // What: Streak Reconcile. Why: Toggling a reminder can flip whether today counts as fully done. How: This calls reconcileStreak against curStaObj's own current entries and the already-toggled nexTasArr.


			return { ...curStaObj, streak, tasks : nexTasArr, reminderLog : nexLogArr, today : { ...curStaObj.today, streakClaimed } }; // What: Next State Return. Why: Every affected field must land together on one fresh state. How: This spreads curStaObj with streak/tasks/reminderLog/today all replaced.


		} ),

		// What: Update Picker Action. Why: Any patch touching cadence/anchorDow/daysOfWeek must be re-run through enforceWeeklyDay, so switching to Weekly (or changing its own day) selects that day in the Days control automatically. How: This merges patValObj onto the one matching picker, then re-derives daysOfWeek.
		updatePicker : ( pickerId, patValObj ) => setAppStaObj( ( curStaObj ) => ( {


			...curStaObj,
			pickers : curStaObj.pickers.map( ( curPicObj ) => {

				if ( curPicObj.id !== pickerId ) return curPicObj; // What: Non-Matching Guard. Why: Every other picker is untouched by this patch. How: This returns curPicObj unchanged when its own id doesn't match pickerId.

				const nexPicObj = { ...curPicObj, ...patValObj }; // What: Next Picker Object. Why: The patch itself must land before daysOfWeek is re-derived from it. How: This spreads curPicObj with patValObj merged on.

				nexPicObj.daysOfWeek = CAD_NAM_OBJ.enfWeeFun( nexPicObj ); // What: Days-Of-Week Re-Derive. Why: A cadence/anchorDow/daysOfWeek change must keep the weekly-cadence anchor day selected in the Days control. How: This calls CAD_NAM_OBJ.enfWeeFun against nexPicObj's own just-patched fields.


				return nexPicObj; // What: Next Picker Return. Why: The map above needs the fully-patched picker. How: This returns nexPicObj, built above.


			} )

		} ) ),

		// What: Replace Picker Action. Why: This is the full-replace path used to revert a picker to a snapshot on Controls Cancel. How: This overwrites the one matching picker entirely with snpPicObj.
		replacePicker : ( pickerId, snpPicObj ) => setAppStaObj( ( curStaObj ) => ( {

			...curStaObj,
			pickers : curStaObj.pickers.map( ( curPicObj ) => curPicObj.id === pickerId ? { ...snpPicObj } : curPicObj )

		} ) ),

		// What: Rename Picker Action. Why: Commit-time picker rename (blur/Enter/Save only): tidy to Title Case and de-duplicate against every OTHER picker so 2 can't share a display name. How: This resolves a unique tidied name, then writes it onto the one matching picker.
		renamePicker : ( pickerId, name ) => setAppStaObj( ( curStaObj ) => {


			const sibNamArr = curStaObj.pickers.filter( ( curPicObj ) => curPicObj.id !== pickerId ).map( ( curPicObj ) => curPicObj.name ); // What: Sibling Name Array. Why: A picker name only needs to be unique among every OTHER picker. How: This filters curStaObj.pickers to every picker but the one being renamed, then maps to their own names.
			const tdyNamStr = ( normalizePickerName && normalizePickerName( name ) ) || name; // What: Tidied Name String. Why: The name must be normalized to Title Case before the collision check below. How: This calls normalizePickerName when available, else falls back to the raw name.
			const uniNamStr = uniNamFun( tdyNamStr, sibNamArr ); // What: Unique Name String. Why: The write below needs the actual de-duplicated name to apply. How: This calls uniNamFun with tdyNamStr and sibNamArr.


			return { ...curStaObj, pickers : curStaObj.pickers.map( ( curPicObj ) => curPicObj.id === pickerId ? { ...curPicObj, name : uniNamStr } : curPicObj ) }; // What: Next State Return. Why: The caller needs the one matching picker's own name replaced. How: This spreads curStaObj with pickers rebuilt, patching only the one matching picker.


		} ),


		// What: Rename Group Action. Why: This renames a group everywhere: rewriting every member picker's own group, remapping the groupOrder slot + pickerOrder key. If the new name matches an existing group (case-insensitively, via the normalizer's own collision reuse) this becomes a MERGE, folding the 2 groups together; the caller (Edit Mode) confirms the merge before invoking. How: See the inline comments below for each step.
		renameGroup : ( oldName, rawNew ) => setAppStaObj( ( curStaObj ) => {


			const othGroArr = [ ...new Set( curStaObj.pickers.filter( ( curPicObj ) => curPicObj.group && curPicObj.group !== oldName ).map( ( curPicObj ) => curPicObj.group ) ) ]; // What: Other Group Array. Why: The normalizer needs every OTHER existing group name to detect a same-name collision (a merge). How: This collects the distinct group of every picker not already in oldName.
			const nexNamStr = ( normalizeGroupName && normalizeGroupName( rawNew, othGroArr ) ) || String( rawNew || '' ).trim(); // What: Next Name String. Why: The normalizer both tidies rawNew and reuses an existing collision's own exact casing. How: This calls normalizeGroupName with othGroArr, else falls back to a plain trim.

			if ( !nexNamStr || nexNamStr === oldName ) return curStaObj; // What: No-Op Guard. Why: An empty result, or a name that didn't actually change, has nothing to rename. How: This returns curStaObj unchanged when either holds.

			const nexPicArr = curStaObj.pickers.map( ( curPicObj ) => curPicObj.group === oldName ? { ...curPicObj, group : nexNamStr } : curPicObj ); // What: Next Picker Array. Why: Every picker that belonged to oldName must now belong to nexNamStr. How: This maps curStaObj.pickers, rewriting group on every matching picker.

			let nexOrdArr = ( curStaObj.groupOrder || [] ).map( ( curGroStr ) => curGroStr === oldName ? nexNamStr : curGroStr ); // What: Next Order Array And Guard. Why: The display-order slot itself must follow the rename too. How: This maps groupOrder, replacing oldName with nexNamStr.

			nexOrdArr = nexOrdArr.filter( ( curGroStr, curIndNum ) => nexOrdArr.indexOf( curGroStr ) === curIndNum ); // What: Merge De-Duplicate. Why: A MERGE (renaming onto an existing group) would otherwise leave 2 entries for the same name in groupOrder. How: This keeps only each group name's own first occurrence.

			const nexPodObj = { ...curStaObj.pickerOrder }; // What: Next Picker-Order Object. Why: The per-group row order must be remapped (and merged, on a collision) the same way groupOrder itself was above. How: This starts as a shallow copy of curStaObj.pickerOrder, patched below.

			if ( nexPodObj[ oldName ] ) { // What: Old-Key Remap Guard. Why: Only a group that actually had its own saved row order needs remapping at all. How: This merges oldName's own order into nexNamStr's own (deduped), then drops the old key entirely.


				const exiIdeArr = nexPodObj[ nexNamStr ] || []; // What: Existing Identifier Array. Why: A MERGE must append oldName's own order onto whatever nexNamStr already had, not overwrite it. How: This reads nexPodObj's own current entry for nexNamStr, defaulting to empty.

				nexPodObj[ nexNamStr ] = exiIdeArr.concat( nexPodObj[ oldName ].filter( ( curIdeStr ) => !exiIdeArr.includes( curIdeStr ) ) ); // What: Merged Order Write. Why: Every id from oldName's own order must join nexNamStr's own, without duplicating one already present. How: This concatenates exiIdeArr with oldName's own order filtered to non-duplicates.
				delete nexPodObj[ oldName ]; // What: Old Key Drop. Why: oldName no longer exists as a group, so its own pickerOrder key must be removed entirely. How: This deletes nexPodObj's own oldName key.


			}


			return { ...curStaObj, pickers : nexPicArr, groupOrder : nexOrdArr, pickerOrder : nexPodObj }; // What: Next State Return. Why: Every affected field must land together on one fresh state. How: This spreads curStaObj with pickers/groupOrder/pickerOrder all replaced.


		} ),

		// What: Rename Page-Tours Action. Why: Page Tours has no pickers to rewrite (unlike renameGroup), just a label swap; collision-with-an-existing-group blocking happens in the UI before this ever fires. How: This normalizes rawNew and writes it onto onboarding.pageToursName.
		renamePageTours : ( rawNew ) => setAppStaObj( ( curStaObj ) => {


			const nexNamStr = ( normalizeGroupName && normalizeGroupName( rawNew ) ) || String( rawNew || '' ).trim(); // What: Next Name String. Why: The write below needs a tidied, real name. How: This calls normalizeGroupName, else falls back to a plain trim.

			if ( !nexNamStr ) return curStaObj; // What: Empty-Name Guard. Why: An empty result has nothing meaningful to write. How: This returns curStaObj unchanged when nexNamStr is falsy.


			return { ...curStaObj, onboarding : { ...( curStaObj.onboarding || {} ), pageToursName : nexNamStr } }; // What: Next State Return. Why: The caller needs pageToursName replaced on a fresh state. How: This spreads curStaObj's own onboarding with pageToursName replaced.


		} ),

		// What: Set Daily-Pickers Action. Why: This is the Daily generator's own picker membership list. How: This writes pickerIds onto daily.
		setDailyPickers : ( pickerIds ) => setAppStaObj( ( curStaObj ) => ( {
			...curStaObj, daily : { ...curStaObj.daily, pickerIds }
		} ) ),

		// What: Set Daily-Run-Time Action. Why: This is the time of day (HH:MM, 24h) the Daily generator auto-runs. How: This writes runTime onto daily.
		setDailyRunTime : ( runTime ) => setAppStaObj( ( curStaObj ) => ( {
			...curStaObj, daily : { ...curStaObj.daily, runTime }
		} ) ),

		// What: Set Daily-Mode Action. Why: This decides whether the Daily generator runs on its own each day, or only when the user triggers it ('auto' | 'manual'). How: This writes mode onto daily.
		setDailyMode : ( mode ) => setAppStaObj( ( curStaObj ) => ( {
			...curStaObj, daily : { ...curStaObj.daily, mode }
		} ) ),

		/**
		 * store.jsx = Holiday List
		 *
		 * @summary
		 * The global "days off" the skip-holidays gate reads. toggleHoliday
		 * turns a computed holiday on/off (off means listed in disabled);
		 * addCustomHoliday/removeCustomHoliday manage the user's own extra,
		 * hand-entered holidays alongside the computed ones.
		 *
		*/

		toggleHoliday : ( key ) => setAppStaObj( ( curStaObj ) => {


			const curHolObj = curStaObj.holidays || HOL_NAM_OBJ.defStaFun(); // What: Current Holidays Object. Why: The toggle below needs a real holidays shape even for state that predates this field. How: This reads curStaObj's own holidays, falling back to HOL_NAM_OBJ's own default state.
			const nexDisArr = curHolObj.disabled.includes( key ) // What: Next Disabled Array. Why: Toggling off removes key from disabled; toggling on (re-enabling) adds it. How: This filters key out when already present, else appends it.
				? curHolObj.disabled.filter( ( curKeyStr ) => curKeyStr !== key )
				: [ ...curHolObj.disabled, key ];


			return { ...curStaObj, holidays : { ...curHolObj, disabled : nexDisArr } }; // What: Next State Return. Why: The caller needs disabled replaced on a fresh holidays object. How: This spreads curHolObj with disabled replaced by nexDisArr.


		} ),

		addCustomHoliday : ( { name, month, day } ) => setAppStaObj( ( curStaObj ) => { // What: Add Custom-Holiday Function. Why: A user's own hand-entered holiday needs its own fresh id before it can be appended. How: This appends a new row to holidays.custom.


			const curHolObj = curStaObj.holidays || HOL_NAM_OBJ.defStaFun(); // What: Current Holidays Object. Why: The append below needs a real holidays shape even for state that predates this field. How: This reads curStaObj's own holidays, falling back to HOL_NAM_OBJ's own default state.
			const newHolObj = { id : 'h_' + Math.random().toString( 36 ).slice( 2, 7 ), name, month, day }; // What: New Holiday Object. Why: This is the actual custom-holiday row being added. How: This bundles a fresh id with the given name/month/day.


			return { ...curStaObj, holidays : { ...curHolObj, custom : [ ...( curHolObj.custom || [] ), newHolObj ] } }; // What: Next State Return. Why: The caller needs newHolObj appended to a fresh holidays object. How: This spreads curHolObj with custom replaced, newHolObj appended.


		} ),

		removeCustomHoliday : ( tarIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Remove Custom-Holiday Function. Why: A user's own hand-entered holiday must be removable by its own id. How: This filters holidays.custom down to every entry but the matching one.


			const curHolObj = curStaObj.holidays || HOL_NAM_OBJ.defStaFun(); // What: Current Holidays Object. Why: The filter below needs a real holidays shape even for state that predates this field. How: This reads curStaObj's own holidays, falling back to HOL_NAM_OBJ's own default state.


			return { ...curStaObj, holidays : { ...curHolObj, custom : ( curHolObj.custom || [] ).filter( ( curCstObj ) => curCstObj.id !== tarIdeStr ) } }; // What: Next State Return. Why: The caller needs the one matching custom holiday removed from a fresh holidays object. How: This spreads curHolObj with custom filtered.


		} ),

		// What: Mark Generated Action. Why: This stamps the generation time AND snapshots every item's/conditional's own value at that moment, so the Day Log can show "value at generation to after". Today-only: overwritten on each Regenerate; values are done-gated so the live values only diverge from this snapshot once entries are completed. How: This builds a genLog of {items, conds} keyed by id, alongside a fresh generatedAt.
		markGenerated : () => setAppStaObj( ( curStaObj ) => {


			const iteValObj = {}; ( curStaObj.items || [] ).forEach( ( curIteObj ) => { iteValObj[ curIteObj.id ] = curIteObj.value; } ); // What: Item Values Object And Guard. Why: The Day Log needs every item's own value AS OF right now, keyed by id. How: This starts empty and is filled by recording every item's own current value.
			const conValObj = {}; ( curStaObj.conditionals || [] ).forEach( ( curConObj ) => { conValObj[ curConObj.id ] = { value : curConObj.value, triggered : curConObj.triggered }; } ); // What: Conditional Values Object And Guard. Why: The Day Log needs every conditional's own value/triggered state AS OF right now, keyed by id. How: This starts empty and is filled by recording each conditional's own current value/triggered.


			return { ...curStaObj, today : { ...curStaObj.today, generatedAt : new Date().toISOString(), genLog : { items : iteValObj, conds : conValObj } } }; // What: Next State Return. Why: The caller needs a fresh generatedAt timestamp plus the snapshot genLog written onto today. How: This spreads curStaObj.today with generatedAt/genLog replaced.


		} ),

		/**
		 * store.jsx = Today Edit-Mode Reordering
		 *
		 * @summary
		 * groupOrder is the display order of the picker-based groups on
		 * Today; pickerOrder maps a group label to the ordered picker ids
		 * within it, driving per-row order. Unknown groups fall back to
		 * first-occurrence order in the render layer. setTodayOrder is the
		 * bulk restore Edit Mode's own "Cancel" uses to revert to the
		 * entry snapshot.
		 *
		*/

		// What: Reorder Groups Action. Why: Edit Mode needs to persist a fresh group display order after a drag. How: This copies ordGroArr onto groupOrder.
		reorderGroups : ( ordGroArr ) => setAppStaObj( ( curStaObj ) => ( { ...curStaObj, groupOrder : ordGroArr.slice() } ) ),

		// What: Reorder Pickers-In-Group Action. Why: Edit Mode needs to persist a fresh per-group row order after a drag. How: This copies picIdeArr onto pickerOrder's own entry for group.
		reorderPickersInGroup : ( group, picIdeArr ) => setAppStaObj( ( curStaObj ) => ( {
			...curStaObj, pickerOrder : { ...curStaObj.pickerOrder, [ group ] : picIdeArr.slice() }
		} ) ),

		// What: Set Today-Order Action. Why: This is the bulk restore Edit Mode's own "Cancel" uses to revert both order structures to their entry snapshot at once. How: This copies ordGroArr onto groupOrder and deep-clones ordPicObj onto pickerOrder.
		setTodayOrder : ( ordGroArr, ordPicObj ) => setAppStaObj( ( curStaObj ) => ( {
			...curStaObj, groupOrder : ordGroArr.slice(),
			pickerOrder : JSON.parse( JSON.stringify( ordPicObj ) )
		} ) ),

		// What: Toggle Controls-Collapsed Action. Why: Persisted collapse state for the Data tab's own disclosures, uniform polarity everywhere (true means COLLAPSED, false means expanded); the main sections default collapsed via defColBoo so the first click expands rather than re-collapsing. How: This flips ui.controlsCollapsed[secIdeStr], falling back to defColBoo when it has no value yet.
		toggleControlsCollapsed : ( secIdeStr, defColBoo = false ) => setAppStaObj( ( curStaObj ) => {


			const curColObj = ( curStaObj.ui && curStaObj.ui.controlsCollapsed ) || {}; // What: Current Collapsed Object. Why: The flip below needs the live collapse-state map, or an empty fallback. How: This reads curStaObj's own ui.controlsCollapsed, defaulting to {}.
			const curValBoo = curColObj[ secIdeStr ] === undefined ? defColBoo : curColObj[ secIdeStr ]; // What: Current Value Boolean. Why: A section with no saved value yet starts from its own caller-supplied default, not always false. How: This reads curColObj's own secIdeStr entry, falling back to defColBoo when it's undefined.
			const nexColObj = { ...curColObj, [ secIdeStr ] : !curValBoo }; // What: Next Collapsed Object. Why: The caller needs exactly this one section's own collapse state flipped. How: This spreads curColObj, negating secIdeStr's own entry.


			return { ...curStaObj, ui : { ...( curStaObj.ui || {} ), controlsCollapsed : nexColObj } }; // What: Next State Return. Why: The caller needs controlsCollapsed replaced on a fresh ui object. How: This spreads curStaObj's own ui with controlsCollapsed replaced by nexColObj.


		} ),

		// What: Set Data-Sort Action. Why: This is the Data tab's own persisted sort preference; scope is 'sections' (the top-level Conditionals/Reminders/picker card order) or a picker id/'conditionals'/'reminders' (that section's own item-list order). How: This writes key onto ui.dataSort[scope].
		setDataSort : ( scope, key ) => setAppStaObj( ( curStaObj ) => ( {
			...curStaObj, ui : { ...( curStaObj.ui || {} ), dataSort : { ...( ( curStaObj.ui && curStaObj.ui.dataSort ) || {} ), [ scope ] : key } }
		} ) )


	} ), [] ); // What: Actions Memo Dependency Array. Why: Every action closes over stable references (setAppStaObj, latStaRef, canPenFun), none of which ever change identity across renders, so this object never needs to be recomputed. How: An empty array means actions is built exactly once, for the lifetime of this component.



	return [ appStaObj, actions ]; // What: Store Tuple Return. Why: Every caller (AppRooCom) destructures this into its own state/actions pair. How: This returns the current appStaObj alongside the memoized actions object.


}

// #endregion useStore



export { useStore }; // What: Use Store Export. Why: This hook is the entire app's own state layer, imported by app.jsx (and nowhere else). How: This re-exports the useStore function declared above by name.



