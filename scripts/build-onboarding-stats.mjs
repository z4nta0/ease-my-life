


/**
 * build-onboarding-stats.mjs = Build Onboarding Stats
 *
 * @summary
 * One-off precompute script, NOT part of the app build or runtime. Run
 * it manually (`node scripts/build-onboarding-stats.mjs`) whenever the
 * sample picker/item/reminder data in src/onboarding-seed-data.js
 * changes, to regenerate src/onboarding-stats-data.js.
 *
 * Why this exists: the Welcome Tour seeds sample pickers on a fresh
 * install and wants Stats to already look like a real year of history,
 * not a blank slate. Generating that live (~365 days x a handful of
 * pickers) is cheap CPU-wise, but the user explicitly wants it
 * precomputed and shipped as static data rather than computed at
 * install time. The wrinkle: a year of "history" is meaningless
 * without a "today" to be relative to, and this script's "today"
 * (whenever it happens to run) is NOT the same day someone actually
 * installs the app. So instead of baking absolute dates, every row
 * stores a daysAgo offset; onboarding.jsx's seeding effect converts
 * those back to real ISO dates relative to the ACTUAL current date at
 * seed time, a trivial, instant per-row map, not a regeneration.
 *
 * The generated file's own JS source is hand-formatted here (tabs,
 * single quotes, space-colon-space) via forRowFun/forArrFun below,
 * rather than a plain JSON.stringify dump, so onboarding-stats-data.js
 * itself matches this repo's own formatting conventions even though
 * nothing ever hand-edits it. Individual data rows are NOT given their
 * own What/Why/How comments (unlike, say, seed.js's ITE_DEF_ARR) since
 * this file holds thousands of them and is never read row-by-row.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Imports

import path from 'node:path'; // What: Path. Why: This script needs to resolve the output file's own absolute path. How: This is used with curDirStr to build outPatStr below.


import { picLogFun     } from '../src/seed.js';                       // What: Pick Log Function. Why: This is the exact same pick-log simulator seed.js's own dev SEED() uses, reused here for realism. How: This is called once below with a 365-day span.
import { fileURLToPath    } from 'node:url';                             // What: File Url To Path. Why: ESM modules have no native __dirname, so this script reconstructs an equivalent. How: This converts import.meta.url into curDirStr below.
import { OB_EXAMPLE       } from '../src/onboarding-seed-data.js';       // What: Onboarding Example. Why: This is the Welcome Tour's own first sample picker definition. How: This is spread into PIC_DEF_ARR below alongside OB_EXTRA_PICKERS.
import { OB_EXTRA_PICKERS } from '../src/onboarding-seed-data.js';       // What: Onboarding Extra Pickers. Why: These are the Welcome Tour's own remaining sample picker definitions. How: This is spread into PIC_DEF_ARR below alongside OB_EXAMPLE.
import { OB_TASKS         } from '../src/onboarding-seed-data.js';       // What: Onboarding Tasks. Why: The sample reminder history below needs the real "Take trash out" task definition. How: This is searched by id for traTasObj below.
import { seeIsoFun       } from '../src/seed.js';                       // What: Seed Iso Function. Why: This script needs the exact same date-to-ISO-string conversion seed.js's own SEED() build uses, for consistency. How: This converts todDatObj into an ISO day string below.
import { writeFileSync    } from 'node:fs';                              // What: Write File Sync. Why: The generated output must land on disk before this script can report success. How: This writes outConStr to outPatStr below.

// #endregion Imports



const curDirStr = path.dirname( fileURLToPath( import.meta.url ) ); // What: Current Directory String. Why: The output path below is resolved relative to this script's own folder, not the process's current working directory. How: This converts import.meta.url to a file path, then takes its own directory.



/**
 * PIC_DEF_ARR / picRecArr / iteRecArr = Picker Definition Array /
 * Picker Record Array / Item Record Array
 *
 * @summary
 * Reconstructs the pickers/items exactly as store.jsx's own addPicker()
 * would create them live, so the simulated history lines up with what
 * the app actually seeds (see addPicker in src/store.jsx for the
 * source of truth this mirrors).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const PIC_DEF_ARR = [ OB_EXAMPLE, ...OB_EXTRA_PICKERS ]; // What: Picker Definition Array. Why: Both picRecArr and iteRecArr below are derived from this same combined list. How: This spreads OB_EXAMPLE and every OB_EXTRA_PICKERS entry into one array.
const picRecArr = PIC_DEF_ARR.map( ( curPicObj ) => ( { // What: Picker Record Array. Why: picLogFun below needs real picker records, not just their bare seed definitions. How: This maps each PIC_DEF_ARR entry to the exact shape addPicker() builds live.

	id : curPicObj.id, group : curPicObj.group, name : curPicObj.name, mode : curPicObj.mode,
	easeMin : 10, easeMax : 20, threshold : 100,
	daysOfWeek : [ 0, 1, 2, 3, 4, 5, 6 ]

} ) );
const iteRecArr = PIC_DEF_ARR.flatMap( ( curPicObj ) => curPicObj.items.map( ( curIteObj ) => { // What: Item Record Array. Why: picLogFun below needs real item records for every picker, not just their bare seed definitions. How: This flat-maps every PIC_DEF_ARR entry's own items into the exact shape addPicker() builds live.


	const isaDowBoo = curPicObj.mode === 'ease-down'; // What: Is-a Down Boolean. Why: An ease-down item's own weight/value defaults differ from every other mode. How: This checks curPicObj's own mode.
	const isaEasBoo = curPicObj.mode === 'ease-up' || isaDowBoo; // What: Is-an Ease Boolean. Why: Only an ease-up or ease-down item carries its own easeMin/easeMax fields at all. How: This is true for either ease mode.


	return { // What: Item Record Return. Why: This is one item, in the exact shape addPicker() builds live. How: This builds id/pickerId/name plus mode-dependent weight/value/ease fields.

		id : curIteObj.id, pickerId : curPicObj.id, name : curIteObj.name,
		weight : isaDowBoo ? 1 : ( curIteObj.weight || 1 ),
		value : curIteObj.value != null ? curIteObj.value : ( isaDowBoo ? 100 : 0 ),
		...( isaEasBoo ? { easeMin : curIteObj.easeMin ?? 7, easeMax : curIteObj.easeMax ?? 14 } : {} )

	};


} ) );



const onVacFun = () => false; // What: On Vacation Function. Why: picLogFun requires a vacation-check callback, but the sample pickers below have no vacation history at all. How: This always returns false, meaning "never on vacation".
const { rows : rawLogArr } = picLogFun( iteRecArr, picRecArr, onVacFun, 365 ); // What: Raw Log Array. Why: This is the full simulated year of pick-log rows, before daysAgo conversion below. How: This calls picLogFun with iteRecArr/picRecArr/onVacFun over a 365-day span.



const todDatObj = new Date(); // What: Today Date Object. Why: Every row's own daysAgo offset below is computed relative to this same instant. How: This is read as "now", then floored to midnight on the next line.
todDatObj.setHours( 0, 0, 0, 0 ); // What: Today Date Hours Reset. Why: Only the calendar day matters for the day-offset arithmetic below, not the current time of day. How: This zeroes out todDatObj's own hours/minutes/seconds/milliseconds in place.
const isoIndFun = ( isoStr ) => { // What: Iso Index Function. Why: dayAgoFun below needs a comparable, timezone-safe integer day count, not a raw ISO string. How: This parses isoStr's own year/month/day and converts them to a UTC day index.

	const [ yeaNum, monNum, dayNum ] = isoStr.split( '-' ).map( Number ); // What: Year Month Day Numbers. Why: Date.UTC below needs each component split out and parsed as a real number. How: This splits isoStr on its own dashes, mapping each piece through Number.


	return Math.floor( Date.UTC( yeaNum, monNum - 1, dayNum ) / 86400000 ); // What: Day Index Return. Why: The caller needs one plain integer comparable across any two dates. How: This converts the UTC timestamp to whole days since the epoch.

};
const todIndNum = isoIndFun( seeIsoFun( todDatObj ) ); // What: Today Index Number. Why: dayAgoFun below needs today's own day index to subtract every row's own day index from. How: This resolves todDatObj through seeIsoFun then isoIndFun.
const dayAgoFun = ( isoStr ) => todIndNum - isoIndFun( isoStr ); // What: Day Ago Function. Why: Every row below needs its own real ISO date converted into a portable daysAgo offset. How: This subtracts isoStr's own day index from todIndNum.



const finLogArr = rawLogArr.map( ( curRowObj ) => { // What: Final Log Array. Why: This is rawLogArr, converted from real dates to the portable daysAgo/houValNum/minValNum shape the generated file actually stores. How: This maps each rawLogArr entry through the conversion below.


	let houValNum = null, minValNum = null; // What: Hour Minute Values And Guard. Why: An entry that was never completed has no time of day to record at all. How: This starts both null and is only overwritten below when curRowObj carries a real completedAt.

	if ( curRowObj.completedAt ) { // What: Completed Check. Why: Only a genuinely completed row has a real timestamp to split into hour/minute. How: This gates the extraction below on completedAt actually being set.


		const comDatObj = new Date( curRowObj.completedAt ); // What: Completed Date Object. Why: curRowObj.completedAt is a plain ISO string, not yet a Date whose own hour/minute can be read. How: This parses it back into a real Date.


		houValNum = comDatObj.getHours(); // What: Hour Value Assignment. Why: The generated row needs this exact local hour to reconstruct a realistic timestamp later. How: This reads comDatObj's own local hour.
		minValNum = comDatObj.getMinutes(); // What: Minute Value Assignment. Why: The generated row needs this exact local minute to reconstruct a realistic timestamp later. How: This reads comDatObj's own local minute.


	}


	return { // What: Final Log Row Return. Why: This is one row, in the exact portable shape the generated onboarding-stats-data.js itself stores. How: This builds daysAgo via dayAgoFun plus curRowObj's own denormalized fields, passed through unchanged.

		daysAgo : dayAgoFun( curRowObj.date ), pickerId : curRowObj.pickerId, itemId : curRowObj.itemId,
		itemName : curRowObj.itemName, pickerName : curRowObj.pickerName, group : curRowObj.group,
		done : curRowObj.done, h : houValNum, m : minValNum, source : curRowObj.source,
		...( curRowObj.outcome ? { outcome : curRowObj.outcome } : {} ),
		...( curRowObj.depletedEnd ? { depletedEnd : true } : {} )

	};


} );



/**
 * traTasObj / monBacArr / remLogArr / remSkiArr = Trash Task Object /
 * Monday Back Array / Reminder Log Array / Reminder Skip Array
 *
 * @summary
 * Only "Take trash out for pickup" (tk_ob_trash) gets reminder history,
 * it's recurring (weekly, Mondays). "Pick up prescription" is one-time
 * and hasn't been completed yet in this fresh install, so it has no
 * history to seed. ~52 Mondays across a year; the large majority
 * completed, a handful skipped, matching the dev SEED()'s own realism
 * ratio.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const traTasObj = OB_TASKS.find( ( curTasObj ) => curTasObj.id === 'tk_ob_trash' ); // What: Trash Task Object. Why: Every row below shares this same single recurring task's own id/name. How: This finds OB_TASKS' own tk_ob_trash entry.
const monBacArr = []; // What: Monday Back Array And Guard. Why: The loop right below fills this with one daysAgo-style "back" offset per Monday found in the last 370 days. How: This starts empty and is pushed to once per matching weekday below.
for ( let bacDayNum = 1; bacDayNum <= 370; bacDayNum++ ) { // What: Monday Scan Loop. Why: Every day in the last 370 must be checked for whether it happens to be a Monday. How: This walks bacDayNum from 1 to 370, one day per iteration.


	const curDatObj = new Date( todDatObj ); // What: Current Date Object. Why: todDatObj itself must not be mutated by the offset below. How: This constructs a fresh copy of todDatObj to offset in place instead.
	curDatObj.setDate( todDatObj.getDate() - bacDayNum ); // What: Current Date Day Subtraction. Why: This is the actual day-offset arithmetic the loop exists to perform. How: This moves curDatObj back by bacDayNum days from todDatObj's own date.

	if ( curDatObj.getDay() === 1 ) monBacArr.push( bacDayNum ); // What: Monday Push Guard. Why: Only an actual Monday (weekday 1) belongs in monBacArr. How: This pushes bacDayNum only when curDatObj's own weekday is Monday.


}
const remLogArr = []; // What: Reminder Log Array And Guard. Why: The loop right below fills this with one completed-reminder row per "completed" Monday. How: This starts empty and is pushed to once per completed iteration below.
const remSkiArr = []; // What: Reminder Skip Array And Guard. Why: The loop right below fills this with one skipped-reminder row per "skipped" Monday. How: This starts empty and is pushed to once per skipped iteration below.
for ( const dayAgoNum of monBacArr ) { // What: Reminder History Populate Loop. Why: Every Monday found above needs to become either a completed or a skipped reminder row. How: This walks monBacArr, randomly assigning each entry to remLogArr or remSkiArr below.


	const houValNum = 8, minValNum = 10 + Math.floor( Math.random() * 40 ); // What: Hour Minute Values. Why: A completed reminder needs a plausible morning completion time. How: This fixes the hour at 8am, randomizing the minute across a 40-minute window.

	if ( Math.random() < 0.88 ) { // What: Completed Odds Check. Why: The large majority of Mondays should read as completed, matching the dev SEED()'s own realism ratio. How: This rolls true 88% of the time.

		remLogArr.push( { taskId : traTasObj.id, name : traTasObj.name, type : 'recurring', daysAgo : dayAgoNum, h : houValNum, m : minValNum } ); // What: Reminder Log Push. Why: This is one completed row, in the exact shape state.reminderLog itself expects. How: This pushes traTasObj's own id/name plus dayAgoNum/houValNum/minValNum.

	}

	else { // What: Skipped Reminder Branch. Why: The remaining minority of Mondays should read as skipped instead. How: This runs whenever the 88% roll above did not succeed.

		remSkiArr.push( { taskId : traTasObj.id, name : traTasObj.name, type : 'recurring', daysAgo : dayAgoNum, h : 7, m : 45 } ); // What: Reminder Skip Push. Why: This is one skipped row, in the exact shape state.reminderSkipLog itself expects. How: This pushes traTasObj's own id/name plus dayAgoNum and a fixed 7:45am skip time.

	}


}



const forStrFun = ( rawValStr ) => `'${ String( rawValStr ).replace( /'/g, '\\\'' ) }'`; // What: Format String Function. Why: Every string value in the generated file must use single quotes, per this repo's own quote convention, with any embedded single quote escaped. How: This wraps rawValStr in single quotes, backslash-escaping any of its own.
const forValFun = ( rawValAny ) => { // What: Format Value Function. Why: forRowFun below needs one shared place that knows how to render any of the plain scalar types a row's own fields ever hold. How: This dispatches on rawValAny's own type/nullness.


	if ( rawValAny === null ) return 'null'; // What: Null Guard. Why: A null field (an incomplete row's own h/m) must render as the bare literal null, not a quoted string. How: This returns the literal text 'null' whenever rawValAny is exactly null.
	if ( typeof rawValAny === 'string' ) return forStrFun( rawValAny ); // What: String Guard. Why: Every string field must be single-quoted per this repo's own convention. How: This delegates to forStrFun.


	return String( rawValAny ); // What: Number Boolean Return. Why: A number or boolean field renders identically whether hand-written or generated. How: This stringifies rawValAny directly, with no quoting.


};
const forRowFun = ( rowValObj ) => `{ ${ Object.keys( rowValObj ).map( ( curKeyStr ) => `${ curKeyStr } : ${ forValFun( rowValObj[ curKeyStr ] ) }` ).join( ', ' ) } }`; // What: Format Row Function. Why: Every row is a simple, literal-only object, so per this repo's own object-literal rule it stays on one line, space-colon-space, rather than forced multi-line. How: This joins every own key's own "key : value" pair with ', ', wrapped in braces.
const forArrFun = ( rowArrAny ) => rowArrAny.length ? `[\n\n\n${ rowArrAny.map( ( curRowAny ) => `\t\t${ forRowFun( curRowAny ) }` ).join( ',\n' ) }\n\n\n\t]` : '[]'; // What: Format Array Function. Why: A non-empty array of rows gets this repo's own 2-blank-line open/close padding with tight, tab-indented one-line entries; an empty array stays tight per the same rule's own exemption. How: This joins every row's own forRowFun output, tab-indented one level deeper than the enclosing object's own property line.



const outConStr = `



/**
 * ONBOARDING_STATS = Onboarding Stats
 *
 * @summary
 * AUTO-GENERATED by scripts/build-onboarding-stats.mjs, do not
 * hand-edit. Regenerate with \`node scripts/build-onboarding-stats.mjs\`
 * whenever src/onboarding-seed-data.js changes; see that script for why
 * this data is precomputed and stored as day-offsets rather than
 * absolute dates.
 *
 * pickLog rows mirror state.pickLog (minus id/eid/completedAt, which
 * onboarding.jsx's own seeding effect fills in at hydration time from
 * daysAgo/h/m). reminderLog/reminderSkipLog rows mirror
 * state.reminderLog/.reminderSkipLog the same way (minus rowId/
 * completedAt or skippedAt).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

export const ONBOARDING_STATS = {


	pickLog         : ${ forArrFun( finLogArr ) },

	reminderLog     : ${ forArrFun( remLogArr ) },

	reminderSkipLog : ${ forArrFun( remSkiArr ) }


};




`; // What: Output Content String. Why: This is the complete, ready-to-write source text of the generated onboarding-stats-data.js file. How: This is a template literal wrapping ONBOARDING_STATS around the 3 forArrFun-formatted logs above.
const outPatStr = path.join( curDirStr, '..', 'src', 'onboarding-stats-data.js' ); // What: Output Path String. Why: writeFileSync below needs the exact absolute destination path. How: This joins curDirStr with the fixed src/onboarding-stats-data.js relative path.
writeFileSync( outPatStr, outConStr ); // What: Write File Call. Why: This is the actual act of regenerating onboarding-stats-data.js on disk. How: This writes outConStr to outPatStr, overwriting whatever was there before.
console.log( `Wrote ${ finLogArr.length } pickLog rows, ${ remLogArr.length } reminderLog rows, ${ remSkiArr.length } reminderSkipLog rows to ${ outPatStr }` ); // What: Write Report Log. Why: Running this script manually needs some confirmation of what it actually did. How: This logs the 3 row counts plus outPatStr.



