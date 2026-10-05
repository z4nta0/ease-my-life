


// #region Imports

import path from 'node:path'; // What: Path. Why: The output file's absolute path is built from this script's own folder. How: This joins and resolves the path parts for OUT_PAT_STR.


import { fileURLToPath } from 'node:url';                             // What: File Url To Path. Why: ESM modules have no __dirname, so this script reconstructs its own folder. How: This converts import.meta.url for CUR_DIR_STR.
import { isoDayFun     } from '../src/utils/date.js';                 // What: Iso Day Function. Why: Today's day index needs the same local-calendar YYYY-MM-DD key the app stores. How: This formats today's date as that key in simDatFun.
import { ONB_ESP_ARR   } from '../src/state/onboarding-seed-data.js'; // What: Onboarding Extra-Sample-Pickers Array. Why: These are the Welcome Tour's remaining sample picker definitions. How: This is spread into PIC_DEF_ARR after ONB_EXA_OBJ.
import { ONB_EXA_OBJ   } from '../src/state/onboarding-seed-data.js'; // What: Onboarding Example Object. Why: This is the Welcome Tour's first sample picker definition. How: This leads PIC_DEF_ARR.
import { ONB_TAS_ARR   } from '../src/state/onboarding-seed-data.js'; // What: Onboarding Task Array. Why: The sample reminder history needs the real "Take trash out" task definition. How: This is searched by id for TRA_TAS_OBJ.
import { SED_NAM_OBJ   } from '../src/state/seed.js';                 // What: Seed Namespace Object. Why: The sample history should come from the same pick simulator the app's own seeding uses. How: Its picLogFun runs once in simDatFun over a 365-day span.
import { writeFileSync } from 'node:fs';                              // What: Write File Sync. Why: The generated file has to land on disk. How: This writes buiOutFun's text to OUT_PAT_STR in the module init.

// #endregion Imports



/**
 * build-onboarding-stats.mjs = Build Onboarding Stats
 *
 * @summary
 * A one-off precompute script, not part of the app's build or runtime. Run
 * it by hand (`node scripts/build-onboarding-stats.mjs`) whenever the sample
 * picker, item, or reminder data in src/state/onboarding-seed-data.js
 * changes, to regenerate src/state/onboarding-stats-data.js.
 *
 * The Welcome Tour seeds sample pickers on a fresh install and wants Stats
 * to already look like a real year of history rather than a blank slate.
 * Simulating that live would be cheap, but it's precomputed and shipped as
 * static data instead. A year of history only means something relative to a
 * "today", and this script's today isn't the day someone installs the app,
 * so every row stores a daysAgo offset rather than an absolute date, and
 * hydStaFun in onboarding-seed-data.js turns each offset back into a real
 * date relative to the actual day it seeds.
 *
 * The generated file's source is formatted here (tabs, single quotes, space
 * colon space, column-aligned rows) by forArrFun and buiOutFun rather than
 * dumped with JSON.stringify, so onboarding-stats-data.js follows this repo's
 * formatting rules even though nobody hand-edits it, per the "Generated
 * files" rule in CLAUDE.md. Run with `--reformat` to rewrite the existing
 * data in a changed template without simulating new history.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const CUR_DIR_STR = path.dirname( fileURLToPath( import.meta.url ) );                           // What: Current Directory String. Why: The output path is resolved from this script's own folder, not the folder it's run from. How: This converts import.meta.url to a file path and takes its directory.
const OUT_PAT_STR = path.join( CUR_DIR_STR, '..', 'src', 'state', 'onboarding-stats-data.js' ); // What: Output Path String. Why: The generated file always lands in the same place. How: This joins CUR_DIR_STR with the data file's path in src/state.
const PIC_DEF_ARR = [ ONB_EXA_OBJ, ...ONB_ESP_ARR ];                                            // What: Picker Definition Array. Why: The picker and item records are both built from the same combined list of sample pickers. How: This puts ONB_EXA_OBJ ahead of every ONB_ESP_ARR entry.
const TRA_TAS_OBJ = ONB_TAS_ARR.find( ( curTasObj ) => curTasObj.id === 'tk_ob_trash' );        // What: Trash Task Object. Why: Only the weekly "Take trash out for pickup" reminder gets history, since the one-time prescription reminder hasn't been completed on a fresh install. How: This finds its definition by id.

// #endregion Constants



// #region Helpers

// #region Record Building

// #region buiPicFun

/**
 * buiPicFun = Build Picker Function
 *
 * @summary
 * Rebuilds every sample picker as the record store.js's addPicFun creates
 * live, so the simulated history lines up with what the app actually seeds.
 * addPicFun in src/state/store.js is the source of truth this mirrors.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns One picker record per PIC_DEF_ARR entry.
 *
 * @example
 * ```ts
 * buiPicFun() // => [ { daysOfWeek, easeMax, easeMin, group, id, ... } ]
 * ```
 *
*/

const buiPicFun = () => PIC_DEF_ARR.map( ( curPicObj ) => ( { // What: Build Picker Function. Why: The pick simulator needs real picker records, not their bare seed definitions. How: This maps each PIC_DEF_ARR entry to the record shape addPicFun builds.


	daysOfWeek : [ 0, 1, 2, 3, 4, 5, 6 ], // What: Days Of Week. Why: The sample pickers run every day. How: This lists all seven weekdays.
	easeMax    : 20,                      // What: Ease Max. Why: Every new picker starts with the default latest drift. How: This mirrors addPicFun's default.
	easeMin    : 10,                      // What: Ease Min. Why: Every new picker starts with the default soonest drift. How: This mirrors addPicFun's default.
	group      : curPicObj.group,         // What: Group. Why: Each sample picker keeps its own group. How: This copies it from the definition.
	id         : curPicObj.id,            // What: Id. Why: Each sample picker keeps its own id, which its items point at. How: This copies it from the definition.
	mode       : curPicObj.mode,          // What: Mode. Why: Each sample picker keeps its own picking mode. How: This copies it from the definition.
	name       : curPicObj.name,          // What: Name. Why: Each sample picker keeps its own name. How: This copies it from the definition.
	threshold  : 100                      // What: Threshold. Why: Every new picker starts with the default charge threshold. How: This mirrors addPicFun's default.


} ) );

// #endregion buiPicFun



// #region buiIteFun

/**
 * buiIteFun = Build Item Function
 *
 * @summary
 * Rebuilds every sample picker's items as the records store.js's addPicFun
 * creates live. An ease-down item starts at weight 1 and full value 100, an
 * ease-up or ease-down item carries its own soonest and latest drift, and
 * every other item takes its definition's weight and value.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns One item record per item across every PIC_DEF_ARR entry.
 *
 * @example
 * ```ts
 * buiIteFun() // => [ { id, name, pickerId, value, weight, ... } ]
 * ```
 *
*/

const buiIteFun = () => PIC_DEF_ARR.flatMap( ( curPicObj ) => curPicObj.items.map( ( curIteObj ) => { // What: Build Item Function. Why: The pick simulator needs real item records for every picker. How: This flat-maps every definition's items into the record shape addPicFun builds.


	const isaDowBoo = curPicObj.mode === 'ease-down';            // What: Is-A Down Boolean. Why: An ease-down item's weight and value defaults differ from every other mode's. How: This checks the picker's mode.
	const isaEasBoo = curPicObj.mode === 'ease-up' || isaDowBoo; // What: Is-An Ease Boolean. Why: Only an ease-up or ease-down item carries its own drift fields. How: This is true for either ease mode.



	return { // What: Item Record Return. Why: This is one item in the record shape addPicFun builds. How: This sets its ids, name, weight, and value, then the drift fields for an ease item.


		id       : curIteObj.id,                                                        // What: Id. Why: Each item keeps its own id. How: This copies it from the definition.
		name     : curIteObj.name,                                                      // What: Name. Why: Each item keeps its own name. How: This copies it from the definition.
		pickerId : curPicObj.id,                                                        // What: Picker Id. Why: Each item points at its picker. How: This copies the picker's id.
		value    : curIteObj.value != null ? curIteObj.value : ( isaDowBoo ? 100 : 0 ), // What: Value. Why: An item without a set value starts full for ease-down and empty otherwise. How: This keeps the definition's value or falls back by mode.
		weight   : isaDowBoo ? 1 : ( curIteObj.weight || 1 ),                           // What: Weight. Why: Ease-down items all weigh the same, and others default to 1. How: This forces 1 for ease-down and otherwise keeps the definition's weight.

		...( isaEasBoo ? { // What: Ease Drift Spread. Why: Only an ease item carries soonest and latest drift. How: This adds both, with the app's defaults, for an ease item only.


			easeMax : curIteObj.easeMax ?? 14, // What: Ease Max. Why: The latest drift defaults to 14 days. How: This keeps the definition's value or falls back.
			easeMin : curIteObj.easeMin ?? 7   // What: Ease Min. Why: The soonest drift defaults to 7 days. How: This keeps the definition's value or falls back.


		} : {} )


	};


} ) );

// #endregion buiIteFun

// #endregion Record Building



// #region History Building

const isoIndFun = ( isoDayStr ) => { // What: Iso Index Function. Why: Day offsets need a comparable, timezone-safe day count rather than an ISO string. How: This parses the date's parts and converts them to whole UTC days since the epoch.


	const [ yeaValNum, monValNum, dayValNum ] = isoDayStr.split( '-' ).map( Number ); // What: Year Month Day Numbers. Why: Date.UTC needs each part as a number. How: This splits the ISO string on its dashes and parses each piece.



	return Math.floor( Date.UTC( yeaValNum, monValNum - 1, dayValNum ) / 86400000 ); // What: Day Index Return. Why: The caller compares two dates as plain integers. How: This converts the UTC timestamp to whole days.


};



// #region conLogFun

/**
 * conLogFun = Convert Log Function
 *
 * @summary
 * Converts the simulator's pick-log rows from real dates to the portable
 * shape the generated file stores: a daysAgo offset from today, the hour and
 * minute it was completed (null for a row never completed), and the row's
 * denormalized names passed through unchanged, plus the optional outcome and
 * depletedEnd fields only on the rows that carry them.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param hisRowArr - History Row Array: The simulator's pick-log rows.
 * @param todIndNum - Today Index Number: Today's day index, from isoIndFun.
 *
 * @returns One portable row per history row.
 *
 * @example
 * ```ts
 * conLogFun(hisRowArr, todIndNum) // => [ { daysAgo, done, group, h, ... } ]
 * ```
 *
*/

const conLogFun = ( hisRowArr, todIndNum ) => hisRowArr.map( ( curRowObj ) => { // What: Convert Log Function. Why: The generated file stores day offsets rather than dates. How: This maps each history row to its portable shape.


	const comDatObj = curRowObj.completedAt ? new Date( curRowObj.completedAt ) : null; // What: Completed Date Object. Why: Only a completed row has a time of day to record. How: This parses its completedAt, or stays null for a row never completed.



	return { // What: Portable Row Return. Why: This is one row in the shape the generated file stores. How: This sets its day offset and completion time, passes its other fields through, and adds its optional fields only when set.


		daysAgo    : todIndNum - isoIndFun( curRowObj.date ),   // What: Days Ago. Why: The row's date is stored relative to today. How: This subtracts its day index from today's.
		done       : curRowObj.done,                            // What: Done. Why: The row keeps whether it was completed. How: This copies it.
		group      : curRowObj.group,                           // What: Group. Why: The row keeps its denormalized group name. How: This copies it.
		h          : comDatObj ? comDatObj.getHours() : null,   // What: Hour. Why: A completed row is rebuilt with a realistic time of day. How: This reads the local hour, or null for a row never completed.
		itemId     : curRowObj.itemId,                          // What: Item Id. Why: The row keeps which item it picked. How: This copies it.
		itemName   : curRowObj.itemName,                        // What: Item Name. Why: The row keeps its denormalized item name. How: This copies it.
		m          : comDatObj ? comDatObj.getMinutes() : null, // What: Minute. Why: A completed row is rebuilt with a realistic time of day. How: This reads the local minute, or null for a row never completed.
		pickerId   : curRowObj.pickerId,                        // What: Picker Id. Why: The row keeps which picker made it. How: This copies it.
		pickerName : curRowObj.pickerName,                      // What: Picker Name. Why: The row keeps its denormalized picker name. How: This copies it.
		source     : curRowObj.source,                          // What: Source. Why: The row keeps how it was picked. How: This copies it.

		...( curRowObj.outcome ? { outcome : curRowObj.outcome } : {} ), // What: Outcome Spread. Why: Only some rows record an outcome. How: This adds it only when set.
		...( curRowObj.depletedEnd ? { depletedEnd : true } : {} )       // What: Depleted End Spread. Why: Only a row that emptied its item records it. How: This adds the flag only when set.


	};


} );

// #endregion conLogFun



// #region buiRemFun

/**
 * buiRemFun = Build Reminder Function
 *
 * @summary
 * Builds the trash reminder's year of history: one row for every Monday in
 * the last 370 days, about 88% of them completed between 8:10 and 8:49 in
 * the morning, and the rest skipped at 7:45.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param todDatObj - Today Date Object: Today at midnight.
 *
 * @returns The completed and skipped reminder rows, as
 *          { remLogArr, remSkiArr }.
 *
 * @example
 * ```ts
 * buiRemFun(todDatObj) // => { remLogArr, remSkiArr }
 * ```
 *
*/

const buiRemFun = ( todDatObj ) => { // What: Build Reminder Function. Why: Stats should show a realistic year of the weekly trash reminder. How: This finds every Monday in range and rolls each as completed or skipped.


	const monBacArr = []; // What: Monday Back Array. Why: Each reminder row is one Monday's day offset. How: The loop below fills this with every Monday in the last 370 days.
	const remLogArr = []; // What: Reminder Log Array. Why: Completed Mondays become reminder log rows. How: The second loop below fills this.
	const remSkiArr = []; // What: Reminder Skip Array. Why: Skipped Mondays become skip log rows. How: The second loop below fills this.


	for ( let bacDayNum = 1; bacDayNum <= 370; bacDayNum++ ) { // What: Monday Scan Loop. Why: Every day in range has to be checked for whether it's a Monday. How: This walks back one day at a time from yesterday.


		const curDatObj = new Date( todDatObj ); // What: Current Date Object. Why: Today's date must not move while the loop offsets from it. How: This copies it.


		curDatObj.setDate( todDatObj.getDate() - bacDayNum ); // What: Day Offset Call. Why: The copy has to land on the day being checked. How: This moves it back bacDayNum days.


		if ( curDatObj.getDay() === 1 ) monBacArr.push( bacDayNum ); // What: Monday Push. Why: Only Mondays get a reminder row. How: This keeps the offset when the day is a Monday.


	}



	for ( const dayAgoNum of monBacArr ) { // What: Reminder Roll Loop. Why: Every Monday becomes either a completed or a skipped row. How: This rolls each one.


		const houValNum = 8;                                     // What: Hour Value Number. Why: The reminder is done in the morning. How: This fixes the hour at 8.
		const minValNum = 10 + Math.floor( Math.random() * 40 ); // What: Minute Value Number. Why: Completion times should vary a little. How: This picks a minute from 10 to 49.


		if ( Math.random() < 0.88 ) remLogArr.push( { daysAgo : dayAgoNum, h : houValNum, m : minValNum, name : TRA_TAS_OBJ.name, taskId : TRA_TAS_OBJ.id, type : 'recurring' } ); // What: Completed Row Push. Why: Most Mondays read as completed. How: This adds a reminder log row 88% of the time.

		else remSkiArr.push( { daysAgo : dayAgoNum, h : 7, m : 45, name : TRA_TAS_OBJ.name, taskId : TRA_TAS_OBJ.id, type : 'recurring' } ); // What: Skipped Row Push. Why: A handful of Mondays read as skipped, for realism. How: This adds a skip log row at a fixed 7:45 otherwise.


	}



	return { remLogArr, remSkiArr }; // What: Reminder Rows Return. Why: The caller stores the completed and skipped rows in separate logs. How: This returns both arrays.


};

// #endregion buiRemFun



// #region simDatFun

/**
 * simDatFun = Simulate Data Function
 *
 * @summary
 * Simulates a fresh year of sample history: it rebuilds the sample picker
 * and item records, runs seed.js's pick simulator over 365 days with no
 * vacations, converts its rows to day offsets from today, and builds the
 * trash reminder's history. The result has the same shape as the generated
 * file's ONB_STA_OBJ, so reformat mode can use the existing data instead.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The three logs, as { pickLog, reminderLog, reminderSkipLog }.
 *
 * @example
 * ```ts
 * simDatFun() // => { pickLog, reminderLog, reminderSkipLog }
 * ```
 *
*/

const simDatFun = () => { // What: Simulate Data Function. Why: A normal run writes freshly simulated history. How: This builds the records, runs the simulator, and assembles the three logs.


	const { hisRowArr } = SED_NAM_OBJ.picLogFun( buiIteFun(), buiPicFun(), () => false, 365 ); // What: History Row Array. Why: This is the simulated year of pick-log rows, still dated. How: This runs the simulator over 365 days, with a vacation check that always says no.

	const todDatObj = new Date(); // What: Today Date Object. Why: Every day offset is measured from today. How: This reads now, floored to midnight on the next line.


	todDatObj.setHours( 0, 0, 0, 0 ); // What: Midnight Reset Call. Why: Only the calendar day matters to the offsets. How: This zeroes the time of day.


	const { remLogArr, remSkiArr } = buiRemFun( todDatObj ); // What: Reminder Rows. Why: The trash reminder's history is built from the same today. How: This calls buiRemFun.



	return { // What: Simulated Data Return. Why: The caller writes these three logs. How: This converts the pick rows and pairs them with the reminder rows.


		pickLog         : conLogFun( hisRowArr, isoIndFun( isoDayFun( todDatObj ) ) ), // What: Pick Log. Why: The pick rows are stored as day offsets. How: This converts them against today's day index.
		reminderLog     : remLogArr,                                                   // What: Reminder Log. Why: Completed Mondays are stored as reminder log rows. How: This passes them through.
		reminderSkipLog : remSkiArr                                                    // What: Reminder Skip Log. Why: Skipped Mondays are stored as skip log rows. How: This passes them through.


	};


};

// #endregion simDatFun

// #endregion History Building



// #region Output Formatting

const forStrFun = ( rawValStr ) => `'${ String( rawValStr ).replace( /'/g, '\\\'' ) }'`; // What: Format String Function. Why: Every string in the generated file uses single quotes, per this repo's quote rule. How: This wraps the value in single quotes, escaping any inside it.



const forValFun = ( rawValAny ) => { // What: Format Value Function. Why: forArrFun needs one place that renders any scalar a row holds. How: This dispatches on the value's type.


	if ( rawValAny === null ) return 'null'; // What: Null Guard. Why: A null field, such as an incomplete row's hour, renders as the bare literal. How: This returns the text null.



	if ( typeof rawValAny === 'string' ) return forStrFun( rawValAny ); // What: String Guard. Why: Every string field is single-quoted. How: This delegates to forStrFun.



	return String( rawValAny ); // What: Number Boolean Return. Why: A number or boolean renders as written. How: This stringifies it unquoted.


};



const forKeyFun = ( keyOneStr, keyTwoStr ) => keyOneStr.toLowerCase().localeCompare( keyTwoStr.toLowerCase() ); // What: Format Key Function. Why: Every row's keys are written alphabetically, compared case-insensitively. How: This is the comparator both key groups sort with.



// #region forArrFun

/**
 * forArrFun = Format Array Function
 *
 * @summary
 * Writes an array of rows as one column-aligned table, per the "Generated
 * files" rule in CLAUDE.md. Keys every row carries come first, alphabetized,
 * then any optional keys only some rows carry, alphabetized, so an optional
 * key never shifts the aligned columns. Every position's cells are padded to
 * one shared width, and every closing brace to one shared column. A
 * non-empty table opens with its bracket and comment and gets 2 blank lines
 * of padding inside, while an empty one stays a tight [].
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param rowArrAny - Row Array Any: The rows to write.
 * @param traTexStr - Trailing Text String: Text after the closing bracket,
 *                    such as a comma.
 * @param comTexStr - Comment Text String: The array's own one-line comment.
 *
 * @returns The array's source text, ready to splice into the template.
 *
 * @example
 * ```ts
 * forArrFun(outPicArr, ',', '// What: Pick Log. ...') // => '[ // What: ...'
 * ```
 *
*/

const forArrFun = ( rowArrAny, traTexStr, comTexStr ) => { // What: Format Array Function. Why: Each log is written as one aligned table. How: This orders, pads, and joins the rows.


	if ( !rowArrAny.length ) return `[]${ traTexStr } ${ comTexStr }`; // What: Empty Array Guard. Why: An empty array needs no padding. How: This returns the tight brackets, the trailing text, and the comment.



	// #region Cell Building

	const allKeyArr = [ ...new Set( rowArrAny.flatMap( ( curRowAny ) => Object.keys( curRowAny ) ) ) ];                                  // What: All Key Array. Why: Both key groups are drawn from every key any row carries. How: This collects each distinct key once.
	const reqKeyArr = allKeyArr.filter( ( curKeyStr ) => rowArrAny.every( ( curRowAny ) => curKeyStr in curRowAny ) ).sort( forKeyFun ); // What: Required Key Array. Why: Keys every row carries form the aligned columns at the front. How: This keeps the keys present in every row, sorted.
	const optKeyArr = allKeyArr.filter( ( curKeyStr ) => !reqKeyArr.includes( curKeyStr ) ).sort( forKeyFun );                           // What: Optional Key Array. Why: A key only some rows carry goes after the aligned columns, so it never shifts them. How: This keeps every other key, sorted.
	const celArrArr = rowArrAny.map( ( curRowAny ) => [ ...reqKeyArr, ...optKeyArr ].filter( ( curKeyStr ) => curKeyStr in curRowAny ).map( ( curKeyStr ) => `${ curKeyStr } : ${ forValFun( curRowAny[ curKeyStr ] ) }` ) ); // What: Cell Array Array. Why: Each row needs its own "key : value" cells in the shared key order. How: This maps every row to its cells, skipping keys it lacks.
	const colCouNum = Math.max( ...celArrArr.map( ( curCelArr ) => curCelArr.length ) );                                                 // What: Column Count Number. Why: The widest row decides how many positions get padded. How: This is the largest cell count.

	// #endregion Cell Building



	for ( let colIndNum = 0; colIndNum < colCouNum; colIndNum++ ) { // What: Column Pad Loop. Why: Every position's cells must end at one shared column so the next position lines up. How: This pads each position's cells, a comma included when another cell follows.


		const celWidNum = Math.max( ...celArrArr.filter( ( curCelArr ) => colIndNum < curCelArr.length ).map( ( curCelArr ) => curCelArr[ colIndNum ].length + ( colIndNum < curCelArr.length - 1 ? 1 : 0 ) ) ); // What: Cell Width Number. Why: The widest cell at this position sets its column. How: This measures each row's cell here, counting its comma.


		celArrArr.forEach( ( curCelArr ) => { if ( colIndNum < curCelArr.length ) curCelArr[ colIndNum ] = ( curCelArr[ colIndNum ] + ( colIndNum < curCelArr.length - 1 ? ',' : '' ) ).padEnd( celWidNum ); } ); // What: Cell Pad Call. Why: Each cell at this position has to reach the shared width. How: This appends the comma where needed, then pads.


	}



	// #region Row Joining

	const rowTexArr = celArrArr.map( ( curCelArr ) => curCelArr.join( ' ' ).trimEnd() ); // What: Row Text Array. Why: Each row's padded cells join into its inner text. How: This joins them with single spaces, trimming the last cell's padding.
	const rowWidNum = Math.max( ...rowTexArr.map( ( curTexStr ) => curTexStr.length ) ); // What: Row Width Number. Why: Every closing brace lines up at one shared column. How: This is the longest row's inner text.

	// #endregion Row Joining



	return `[ ${ comTexStr }\n\n\n${ rowTexArr.map( ( curTexStr ) => `\t\t{ ${ curTexStr.padEnd( rowWidNum ) } }` ).join( ',\n' ) }\n\n\n\t]${ traTexStr }`; // What: Array Text Return. Why: The caller splices the finished table into the template. How: This wraps every padded row in braces, joins them, and adds the 2-blank padding, the trailing text, and the comment.


};

// #endregion forArrFun



// #region buiOutFun

/**
 * buiOutFun = Build Output Function
 *
 * @summary
 * Builds the complete source text of the generated onboarding-stats-data.js:
 * its file header, its ONB_STA_OBJ with the shape block documenting every
 * row's fields, and its export, all following this repo's formatting rules,
 * with the three logs written as aligned tables by forArrFun.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param outDatObj - Output Data Object: The three logs to write, as
 *                    { pickLog, reminderLog, reminderSkipLog }.
 *
 * @returns The generated file's full source text.
 *
 * @example
 * ```ts
 * buiOutFun(outDatObj) // => '\n\n\n/**\n * onboarding-stats-data.js = ...'
 * ```
 *
*/

const buiOutFun = ( outDatObj ) => `


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
 *   optional), \`done\` (Boolean), \`group\` (String), \`h\` (Number or null,
 *   the completion hour), \`itemId\`/\`itemName\` (String), \`m\` (Number or
 *   null, the completion minute), \`outcome\` (String, optional),
 *   \`pickerId\`/\`pickerName\` (String), \`source\` (String).
 *
 * - \`reminderLog\`/\`reminderSkipLog\` rows: \`daysAgo\` (Number), \`h\`/\`m\`
 *   (Number, the time of day), \`name\` (String), \`taskId\` (String),
 *   \`type\` (String).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const ONB_STA_OBJ = { // What: Onboarding Stats Object. Why: The Welcome Tour and help mode seed a year of realistic history into Stats. How: This holds the 3 precomputed logs, turned into real dated rows by hydStaFun.


	pickLog : ${ forArrFun( outDatObj.pickLog, ',', '// What: Pick Log. Why: Stats needs a year of sample picks. How: This lists every simulated pick as a daysAgo-based row.' ) }

	reminderLog : ${ forArrFun( outDatObj.reminderLog, ',', '// What: Reminder Log. Why: Stats needs a year of sample reminder completions. How: This lists every completed weekly trash reminder.' ) }

	reminderSkipLog : ${ forArrFun( outDatObj.reminderSkipLog, '', '// What: Reminder Skip Log. Why: Stats needs the occasional skipped reminder too. How: This lists every skipped weekly trash reminder.' ) }


};

// #endregion ONB_STA_OBJ

// #endregion Constants



// #region Exports

export { ONB_STA_OBJ }; // What: Named Exports. Why: The Welcome Tour, the Stats page tour and help mode each import this data lazily by name. How: This exports ONB_STA_OBJ.

// #endregion Exports


`; // What: Build Output Function. Why: This is the complete source text of the generated file, ready to write. How: This wraps the three forArrFun tables in the file's header, shape block, sections, and export.

// #endregion buiOutFun

// #endregion Output Formatting

// #endregion Helpers



// #region Module Init

const refModBoo = process.argv.includes( '--reformat' );                                                             // What: Reformat Mode Boolean. Why: A template change should be applied to the existing data without replacing its simulated history. How: This is true when the script runs with --reformat.
const outDatObj = refModBoo ? ( await import( '../src/state/onboarding-stats-data.js' ) ).ONB_STA_OBJ : simDatFun(); // What: Output Data Object. Why: The written logs come from the existing file in reformat mode, or a fresh simulation otherwise. How: This imports the current ONB_STA_OBJ or calls simDatFun.


writeFileSync( OUT_PAT_STR, buiOutFun( outDatObj ) ); // What: Write File Call. Why: This regenerates onboarding-stats-data.js on disk. How: This writes the built source text over the old file.

console.log( `Wrote ${ outDatObj.pickLog.length } pickLog rows, ${ outDatObj.reminderLog.length } reminderLog rows, ${ outDatObj.reminderSkipLog.length } reminderSkipLog rows to ${ OUT_PAT_STR }` ); // What: Write Report Log. Why: A manual run needs confirmation of what it did. How: This logs the three row counts and the output path.

// #endregion Module Init


