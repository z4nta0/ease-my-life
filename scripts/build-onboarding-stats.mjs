


/**
 * build-onboarding-stats.mjs = Build Onboarding Stats
 *
 * @summary
 * One-off precompute script, NOT part of the app build or runtime. Run
 * it manually (`node scripts/build-onboarding-stats.mjs`) whenever the
 * sample picker/item/reminder data in src/state/onboarding-seed-data.js
 * changes, to regenerate src/state/onboarding-stats-data.js.
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
 * The generated file's own JS source is hand-formatted here (tabs, single
 * quotes, space-colon-space) via forValFun/forArrFun below, rather than a
 * plain JSON.stringify dump, so onboarding-stats-data.js itself matches this
 * repo's own formatting conventions even though nothing ever hand-edits it.
 * Run with `--reformat` to rewrite the existing data in a changed template
 * without re-simulating it. Individual data rows are NOT given their own
 * What/Why/How comments since this file holds thousands of them and is never
 * read row-by-row.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Imports

import path from 'node:path'; // What: Path. Why: This script needs to resolve the output file's own absolute path. How: This is used with curDirStr to build outPatStr below.


import { fileURLToPath } from 'node:url';                             // What: File Url To Path. Why: ESM modules have no native __dirname, so this script reconstructs an equivalent. How: This converts import.meta.url into curDirStr below.
import { isoDayFun     } from '../src/utils/date.js';                 // What: Iso Day Function. Why: Today's own index needs the same local-calendar YYYY-MM-DD key the app stores. How: This formats todDatObj as that key.
import { ONB_ESP_ARR   } from '../src/state/onboarding-seed-data.js'; // What: Onboarding Extra-Sample-Pickers Array. Why: These are the Welcome Tour's own remaining sample picker definitions. How: This is spread into PIC_DEF_ARR below alongside ONB_EXA_OBJ.
import { ONB_EXA_OBJ   } from '../src/state/onboarding-seed-data.js'; // What: Onboarding Example Object. Why: This is the Welcome Tour's own first sample picker definition. How: This is spread into PIC_DEF_ARR below alongside ONB_ESP_ARR.
import { ONB_TAS_ARR   } from '../src/state/onboarding-seed-data.js'; // What: Onboarding Task Array. Why: The sample reminder history below needs the real "Take trash out" task definition. How: This is searched by id for traTasObj below.
import { SED_NAM_OBJ   } from '../src/state/seed.js';                 // What: Seed Namespace Object. Why: This script reuses seed.js's own pick-log simulator (picLogFun) for realism/consistency with the dev SEED() build. How: This is called once below with a 365-day span.
import { writeFileSync } from 'node:fs';                              // What: Write File Sync. Why: The generated output must land on disk before this script can report success. How: This writes outConStr to outPatStr below.

// #endregion Imports



const curDirStr = path.dirname( fileURLToPath( import.meta.url ) ); // What: Current Directory String. Why: The output path below is resolved relative to this script's own folder, not the process's current working directory. How: This converts import.meta.url to a file path, then takes its own directory.



/**
 * PIC_DEF_ARR / picRecArr / iteRecArr = Picker Definition Array /
 * Picker Record Array / Item Record Array
 *
 * @summary
 * Reconstructs the pickers/items exactly as store.js's own addPicker()
 * would create them live, so the simulated history lines up with what
 * the app actually seeds (see addPicker in src/state/store.js for the
 * source of truth this mirrors).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const PIC_DEF_ARR = [ ONB_EXA_OBJ, ...ONB_ESP_ARR ]; // What: Picker Definition Array. Why: Both picRecArr and iteRecArr below are derived from this same combined list. How: This spreads ONB_EXA_OBJ and every ONB_ESP_ARR entry into one array.
const picRecArr = PIC_DEF_ARR.map( ( curPicObj ) => ( { // What: Picker Record Array. Why: SED_NAM_OBJ.picLogFun below needs real picker records, not just their bare seed definitions. How: This maps each PIC_DEF_ARR entry to the exact shape addPicker() builds live.

	id : curPicObj.id, group : curPicObj.group, name : curPicObj.name, mode : curPicObj.mode,
	easeMin : 10, easeMax : 20, threshold : 100,
	daysOfWeek : [ 0, 1, 2, 3, 4, 5, 6 ]

} ) );
const iteRecArr = PIC_DEF_ARR.flatMap( ( curPicObj ) => curPicObj.items.map( ( curIteObj ) => { // What: Item Record Array. Why: SED_NAM_OBJ.picLogFun below needs real item records for every picker, not just their bare seed definitions. How: This flat-maps every PIC_DEF_ARR entry's own items into the exact shape addPicker() builds live.


	const isaDowBoo = curPicObj.mode === 'ease-down'; // What: Is-a Down Boolean. Why: An ease-down item's own weight/value defaults differ from every other mode. How: This checks curPicObj's own mode.
	const isaEasBoo = curPicObj.mode === 'ease-up' || isaDowBoo; // What: Is-an Ease Boolean. Why: Only an ease-up or ease-down item carries its own easeMin/easeMax fields at all. How: This is true for either ease mode.


	return { // What: Item Record Return. Why: This is one item, in the exact shape addPicker() builds live. How: This builds id/pickerId/name plus mode-dependent weight/value/ease fields.

		id : curIteObj.id, pickerId : curPicObj.id, name : curIteObj.name,
		weight : isaDowBoo ? 1 : ( curIteObj.weight || 1 ),
		value : curIteObj.value != null ? curIteObj.value : ( isaDowBoo ? 100 : 0 ),
		...( isaEasBoo ? { easeMin : curIteObj.easeMin ?? 7, easeMax : curIteObj.easeMax ?? 14 } : {} )

	};


} ) );



const onVacFun = () => false; // What: On Vacation Function. Why: SED_NAM_OBJ.picLogFun requires a vacation-check callback, but the sample pickers below have no vacation history at all. How: This always returns false, meaning "never on vacation".
const { hisRowArr } = SED_NAM_OBJ.picLogFun( iteRecArr, picRecArr, onVacFun, 365 ); // What: History Row Array. Why: This is the full simulated year of pick-log rows, before daysAgo conversion below. How: This calls SED_NAM_OBJ.picLogFun with iteRecArr/picRecArr/onVacFun over a 365-day span.



const todDatObj = new Date(); // What: Today Date Object. Why: Every row's own daysAgo offset below is computed relative to this same instant. How: This is read as "now", then floored to midnight on the next line.
todDatObj.setHours( 0, 0, 0, 0 ); // What: Today Date Hours Reset. Why: Only the calendar day matters for the day-offset arithmetic below, not the current time of day. How: This zeroes out todDatObj's own hours/minutes/seconds/milliseconds in place.
const isoIndFun = ( isoStr ) => { // What: Iso Index Function. Why: dayAgoFun below needs a comparable, timezone-safe integer day count, not a raw ISO string. How: This parses isoStr's own year/month/day and converts them to a UTC day index.

	const [ yeaNum, monNum, dayNum ] = isoStr.split( '-' ).map( Number ); // What: Year Month Day Numbers. Why: Date.UTC below needs each component split out and parsed as a real number. How: This splits isoStr on its own dashes, mapping each piece through Number.


	return Math.floor( Date.UTC( yeaNum, monNum - 1, dayNum ) / 86400000 ); // What: Day Index Return. Why: The caller needs one plain integer comparable across any two dates. How: This converts the UTC timestamp to whole days since the epoch.

};
const todIndNum = isoIndFun( isoDayFun( todDatObj ) ); // What: Today Index Number. Why: dayAgoFun below needs today's own day index to subtract every row's own day index from. How: This resolves todDatObj through isoDayFun then isoIndFun.
const dayAgoFun = ( isoStr ) => todIndNum - isoIndFun( isoStr ); // What: Day Ago Function. Why: Every row below needs its own real ISO date converted into a portable daysAgo offset. How: This subtracts isoStr's own day index from todIndNum.



const finLogArr = hisRowArr.map( ( curRowObj ) => { // What: Final Log Array. Why: This is hisRowArr, converted from real dates to the portable daysAgo/houValNum/minValNum shape the generated file actually stores. How: This maps each hisRowArr entry through the conversion below.


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
 * completed, a handful skipped.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const traTasObj = ONB_TAS_ARR.find( ( curTasObj ) => curTasObj.id === 'tk_ob_trash' ); // What: Trash Task Object. Why: Every row below shares this same single recurring task's own id/name. How: This finds ONB_TAS_ARR' own tk_ob_trash entry.
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

	if ( Math.random() < 0.88 ) { // What: Completed Odds Check. Why: The large majority of Mondays should read as completed, with a handful skipped for realism. How: This rolls true 88% of the time.

		remLogArr.push( { taskId : traTasObj.id, name : traTasObj.name, type : 'recurring', daysAgo : dayAgoNum, h : houValNum, m : minValNum } ); // What: Reminder Log Push. Why: This is one completed row, in the exact shape state.reminderLog itself expects. How: This pushes traTasObj's own id/name plus dayAgoNum/houValNum/minValNum.

	}

	else { // What: Skipped Reminder Branch. Why: The remaining minority of Mondays should read as skipped instead. How: This runs whenever the 88% roll above did not succeed.

		remSkiArr.push( { taskId : traTasObj.id, name : traTasObj.name, type : 'recurring', daysAgo : dayAgoNum, h : 7, m : 45 } ); // What: Reminder Skip Push. Why: This is one skipped row, in the exact shape state.reminderSkipLog itself expects. How: This pushes traTasObj's own id/name plus dayAgoNum and a fixed 7:45am skip time.

	}


}



const forStrFun = ( rawValStr ) => `'${ String( rawValStr ).replace( /'/g, '\\\'' ) }'`; // What: Format String Function. Why: Every string value in the generated file must use single quotes, per this repo's own quote convention, with any embedded single quote escaped. How: This wraps rawValStr in single quotes, backslash-escaping any of its own.
const forValFun = ( rawValAny ) => { // What: Format Value Function. Why: forArrFun below needs one shared place that knows how to render any of the plain scalar types a row's own fields ever hold. How: This dispatches on rawValAny's own type/nullness.


	if ( rawValAny === null ) return 'null'; // What: Null Guard. Why: A null field (an incomplete row's own h/m) must render as the bare literal null, not a quoted string. How: This returns the literal text 'null' whenever rawValAny is exactly null.
	if ( typeof rawValAny === 'string' ) return forStrFun( rawValAny ); // What: String Guard. Why: Every string field must be single-quoted per this repo's own convention. How: This delegates to forStrFun.


	return String( rawValAny ); // What: Number Boolean Return. Why: A number or boolean field renders identically whether hand-written or generated. How: This stringifies rawValAny directly, with no quoting.


};
const forKeyFun = ( keyOneStr, keyTwoStr ) => keyOneStr.toLowerCase().localeCompare( keyTwoStr.toLowerCase() ); // What: Format Key Function. Why: Every row's own keys are written alphabetically, compared case-insensitively. How: This is the comparator both key groups below sort with.
const forArrFun = ( rowArrAny, trlStr, cmtStr ) => { // What: Format Array Function. Why: A non-empty array of rows is written as one column-aligned table, its opening bracket carrying its own comment; an empty array stays tight. How: This orders each row's keys (always-present keys alphabetically, then optional ones), pads every position's cells to a shared width, pads every closing brace to a shared column, and joins the rows.


	if ( !rowArrAny.length ) return `[]${ trlStr } ${ cmtStr }`; // What: Empty Array Guard. Why: An empty array needs no padding at all. How: This returns the tight brackets, the trailing text, and the comment.



	const allKeyArr = [ ...new Set( rowArrAny.flatMap( ( curRowAny ) => Object.keys( curRowAny ) ) ) ];               // What: All Key Array. Why: Both key groups are drawn from every key any row carries. How: This collects each distinct key once.
	const reqKeyArr = allKeyArr.filter( ( curKeyStr ) => rowArrAny.every( ( curRowAny ) => curKeyStr in curRowAny ) ).sort( forKeyFun ); // What: Required Key Array. Why: Keys every row carries form the aligned columns at the front. How: This keeps keys present in every row, sorted.
	const optKeyArr = allKeyArr.filter( ( curKeyStr ) => !reqKeyArr.includes( curKeyStr ) ).sort( forKeyFun );          // What: Optional Key Array. Why: A key only some rows carry goes after the aligned columns, so it never shifts them. How: This keeps every other key, sorted.
	const celArrArr = rowArrAny.map( ( curRowAny ) => [ ...reqKeyArr, ...optKeyArr ].filter( ( curKeyStr ) => curKeyStr in curRowAny ).map( ( curKeyStr ) => `${ curKeyStr } : ${ forValFun( curRowAny[ curKeyStr ] ) }` ) ); // What: Cell Array Array. Why: Each row needs its own "key : value" cells in the shared key order. How: This maps every row to its cells, skipping keys it lacks.
	const colCouNum = Math.max( ...celArrArr.map( ( curCelArr ) => curCelArr.length ) );                               // What: Column Count Number. Why: The widest row decides how many positions get padded. How: This is the largest cell count.



	for ( let colIndNum = 0; colIndNum < colCouNum; colIndNum++ ) { // What: Column Pad Loop. Why: Every position's cells must end at one shared column so the next position lines up. How: This pads each position's cells, a comma included when another cell follows.


		const celWidNum = Math.max( ...celArrArr.filter( ( curCelArr ) => colIndNum < curCelArr.length ).map( ( curCelArr ) => curCelArr[ colIndNum ].length + ( colIndNum < curCelArr.length - 1 ? 1 : 0 ) ) ); // What: Cell Width Number. Why: The widest cell at this position sets its column. How: This measures each row's cell here, counting its comma.


		celArrArr.forEach( ( curCelArr ) => { if ( colIndNum < curCelArr.length ) curCelArr[ colIndNum ] = ( curCelArr[ colIndNum ] + ( colIndNum < curCelArr.length - 1 ? ',' : '' ) ).padEnd( celWidNum ); } ); // What: Cell Pad Call. Why: Each cell at this position must reach the shared width. How: This appends the comma where needed, then pads.


	}



	const rowTexArr = celArrArr.map( ( curCelArr ) => curCelArr.join( ' ' ).trimEnd() );  // What: Row Text Array. Why: Each row's padded cells join into its inner text. How: This joins them with single spaces, trimming the last cell's padding.
	const rowWidNum = Math.max( ...rowTexArr.map( ( curTexStr ) => curTexStr.length ) ); // What: Row Width Number. Why: Every closing brace lines up at one shared column. How: This is the longest row's inner text.



	return `[ ${ cmtStr }\n\n\n${ rowTexArr.map( ( curTexStr ) => `\t\t{ ${ curTexStr.padEnd( rowWidNum ) } }` ).join( ',\n' ) }\n\n\n\t]${ trlStr }`; // What: Array Text Return. Why: The caller splices the finished table into the template. How: This wraps every padded row in braces, joins them, and adds the 2-blank padding, the trailing text and the comment.


};



const refModBoo = process.argv.includes( '--reformat' ); // What: Reformat Mode Boolean. Why: A template change should be applied to the existing data without replacing its randomly simulated history. How: This is true when the script is run with --reformat.
const exiDatObj = refModBoo ? ( await import( '../src/state/onboarding-stats-data.js' ) ).ONB_STA_OBJ : null; // What: Existing Data Object. Why: Reformat mode rewrites the data already on disk instead of the fresh simulation above. How: This imports the current ONB_STA_OBJ only in reformat mode.
const outPicArr = exiDatObj ? exiDatObj.pickLog : finLogArr;         // What: Output Pick Array. Why: The written pickLog comes from whichever source this run uses. How: This picks the existing rows in reformat mode, else the simulated ones.
const outRemArr = exiDatObj ? exiDatObj.reminderLog : remLogArr;     // What: Output Reminder Array. Why: The written reminderLog comes from whichever source this run uses. How: This picks the existing rows in reformat mode, else the simulated ones.
const outSkiArr = exiDatObj ? exiDatObj.reminderSkipLog : remSkiArr; // What: Output Skip Array. Why: The written reminderSkipLog comes from whichever source this run uses. How: This picks the existing rows in reformat mode, else the simulated ones.
const outConStr = `


/**
 * onboarding-stats-data.js = Onboarding Stats Data
 *
 * @summary
 * AUTO-GENERATED by scripts/build-onboarding-stats.mjs, do not
 * hand-edit. Regenerate with \`node scripts/build-onboarding-stats.mjs\`
 * whenever src/state/onboarding-seed-data.js changes, or rewrite the
 * existing data in the script's current template with \`--reformat\`; see
 * that script for why this data is precomputed and stored as day-offsets
 * rather than absolute dates.
 *
 * Sections:
 *  - Constants
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

// #region ONB_STA_OBJ

/**
 * ONB_STA_OBJ = Onboarding Stats Object
 *
 * @summary
 * Every row below is a one-line, literal-only object sharing its log's own
 * shape, so no row carries its own comment (see the "Generated files" rule in
 * CLAUDE.md). Keys every row carries come first, alphabetized and
 * column-aligned, then any optional ones. The rows mirror
 * state.pickLog/.reminderLog/.reminderSkipLog, minus the fields hydStaFun in
 * onboarding-seed-data.js fills in at hydration time (id/eid/completedAt for a
 * pick row, rowId plus completedAt or skippedAt for a reminder row) from each
 * row's own daysAgo/h/m:
 *
 * - \`pickLog\` rows: \`daysAgo\` (Number), \`depletedEnd\` (Boolean,
 *   optional), \`done\` (Boolean), \`group\` (String), \`h\`/\`m\` (Number or
 *   null, the completion time), \`itemId\`/\`itemName\` (String),
 *   \`outcome\` (String, optional), \`pickerId\`/\`pickerName\` (String),
 *   \`source\` (String).
 *
 * - \`reminderLog\`/\`reminderSkipLog\` rows: \`daysAgo\` (Number), \`h\`/\`m\`
 *   (Number, the time of day), \`name\` (String), \`taskId\` (String),
 *   \`type\` (String).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const ONB_STA_OBJ = { // What: Onboarding Stats Object. Why: The Welcome Tour and help mode seed a year of realistic history into Stats. How: This holds the 3 precomputed logs, turned into real dated rows by hydStaFun.


	pickLog : ${ forArrFun( outPicArr, ',', '// What: Pick Log. Why: Stats needs a year of sample picks. How: This lists every simulated pick as a daysAgo-based row.' ) }

	reminderLog : ${ forArrFun( outRemArr, ',', '// What: Reminder Log. Why: Stats needs a year of sample reminder completions. How: This lists every completed weekly trash reminder.' ) }

	reminderSkipLog : ${ forArrFun( outSkiArr, '', '// What: Reminder Skip Log. Why: Stats needs the occasional skipped reminder too. How: This lists every skipped weekly trash reminder.' ) }


};

// #endregion ONB_STA_OBJ

// #endregion Constants



// #region Exports

export { ONB_STA_OBJ }; // What: Named Exports. Why: The Welcome Tour, the Stats page tour and help mode each import this data lazily by name. How: This exports ONB_STA_OBJ.

// #endregion Exports


`; // What: Output Content String. Why: This is the complete, ready-to-write source text of the generated onboarding-stats-data.js file. How: This is a template literal wrapping ONB_STA_OBJ, its shape block and its sections around the 3 forArrFun-formatted logs above.
const outPatStr = path.join( curDirStr, '..', 'src', 'state', 'onboarding-stats-data.js' ); // What: Output Path String. Why: writeFileSync below needs the exact absolute destination path. How: This joins curDirStr with the fixed src/state/onboarding-stats-data.js relative path.
writeFileSync( outPatStr, outConStr ); // What: Write File Call. Why: This is the actual act of regenerating onboarding-stats-data.js on disk. How: This writes outConStr to outPatStr, overwriting whatever was there before.
console.log( `Wrote ${ outPicArr.length } pickLog rows, ${ outRemArr.length } reminderLog rows, ${ outSkiArr.length } reminderSkipLog rows to ${ outPatStr }` ); // What: Write Report Log. Why: Running this script manually needs some confirmation of what it actually did. How: This logs the 3 row counts plus outPatStr.



