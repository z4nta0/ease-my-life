


/**
 * holidays.js = Holidays
 *
 * @summary
 * A local-compute, offline holiday engine: no network calls at all.
 * Most public holidays are rule-based, either a fixed calendar date
 * (Dec 25), the Nth weekday of a month (Thanksgiving is the 4th
 * Thursday of November), or the last weekday of a month (Memorial Day
 * is the last Monday of May). Holidays are computed for any year from
 * a small ruleset, so the app never has to phone home and works the
 * same in 2026 or 2046.
 *
 * Only the United States is supported for now. The shape is
 * country-keyed so more regions can be added later without touching
 * callers.
 *
 * The persisted state shape (lives at state.holidays) is:
 * { country: 'US', disabled: [holidayKey, ...], custom: [{ id, name,
 * month, day }] }. disabled holds computed holidays the user has
 * switched off (won't trigger a skip); custom holds the user's own
 * added recurring days off, by month (1-12) and day (1-31).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const MON_DAY_NUM = 1; // What: Monday Day Number. Why: A holiday rule needs a plain weekday number to test against, matching Date.getDay()'s own encoding (Sun = 0 ... Sat = 6). How: This is read inside HOL_DEF_ARR's own nth/last rule entries below.
const THU_DAY_NUM = 4; // What: Thursday Day Number. Why: Same reasoning as MON_DAY_NUM above, for the one holiday (Thanksgiving) defined against Thursday instead of Monday. How: This is read inside HOL_DEF_ARR's own nth rule entry below.



/**
 * HOL_DEF_ARR = Holiday Definition Array
 *
 * @summary
 * The hard-coded table of US federal holidays this whole engine is
 * driven from. Every month value here is 1-based for readability. Each
 * entry carries exactly one of 3 rule shapes: fixArr ([month, day]) for
 * a fixed calendar date, nthArr ([month, weekday, n]) meaning the n-th
 * occurrence of that weekday in that month, or lasArr ([month,
 * weekday]) meaning the LAST occurrence of that weekday in that month.
 * weekday itself matches Date.getDay()'s own encoding (Sun = 0 ... Sat
 * = 6), which is why MON_DAY_NUM/THU_DAY_NUM above exist, rather than
 * spelling out the raw numbers inline below.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const HOL_DEF_ARR = [ // What: Holiday Definition Array. Why: This is the single source of truth every US holiday computation in this file reads from. How: This is read by comYeaFun below, resolving each entry's own rule via datDefFun into a concrete date for whatever year is requested.


	{ key : 'newyear',      name : 'New Year\'s Day',            fixArr : [ 1, 1 ] },               // What: New Year Definition Object. Why: This is a fixed-date federal holiday. How: This resolves to January 1st every year.
	{ key : 'mlk',          name : 'Martin Luther King Jr. Day', nthArr : [ 1, MON_DAY_NUM, 3 ] },  // What: MLK Day Definition Object. Why: This is an Nth-weekday federal holiday. How: This resolves to the 3rd Monday of January every year.
	{ key : 'presidents',   name : 'Presidents\' Day',           nthArr : [ 2, MON_DAY_NUM, 3 ] },  // What: Presidents Day Definition Object. Why: This is an Nth-weekday federal holiday. How: This resolves to the 3rd Monday of February every year.
	{ key : 'memorial',     name : 'Memorial Day',               lasArr : [ 5, MON_DAY_NUM ] },     // What: Memorial Day Definition Object. Why: This is a last-weekday federal holiday. How: This resolves to the last Monday of May every year.
	{ key : 'juneteenth',   name : 'Juneteenth',                 fixArr : [ 6, 19 ] },              // What: Juneteenth Definition Object. Why: This is a fixed-date federal holiday. How: This resolves to June 19th every year.
	{ key : 'independence', name : 'Independence Day',           fixArr : [ 7, 4 ] },               // What: Independence Day Definition Object. Why: This is a fixed-date federal holiday. How: This resolves to July 4th every year.
	{ key : 'labor',        name : 'Labor Day',                  nthArr : [ 9, MON_DAY_NUM, 1 ] },  // What: Labor Day Definition Object. Why: This is an Nth-weekday federal holiday. How: This resolves to the 1st Monday of September every year.
	{ key : 'columbus',     name : 'Columbus Day',               nthArr : [ 10, MON_DAY_NUM, 2 ] }, // What: Columbus Day Definition Object. Why: This is an Nth-weekday federal holiday. How: This resolves to the 2nd Monday of October every year.
	{ key : 'veterans',     name : 'Veterans Day',               fixArr : [ 11, 11 ] },             // What: Veterans Day Definition Object. Why: This is a fixed-date federal holiday. How: This resolves to November 11th every year.
	{ key : 'thanksgiving', name : 'Thanksgiving Day',           nthArr : [ 11, THU_DAY_NUM, 4 ] }, // What: Thanksgiving Definition Object. Why: This is an Nth-weekday federal holiday. How: This resolves to the 4th Thursday of November every year.
	{ key : 'christmas',    name : 'Christmas Day',              fixArr : [ 12, 25 ] }              // What: Christmas Definition Object. Why: This is a fixed-date federal holiday. How: This resolves to December 25th every year.


];



const REG_DEF_OBJ = { US : { labStr : 'United States', defArr : HOL_DEF_ARR } }; // What: Region Definition Object. Why: This is the country-keyed lookup every region-aware function below resolves against, shaped so more regions can be added later without touching any caller. How: This currently defines just one entry, US, pairing its own display label with HOL_DEF_ARR.



const padDigFun = ( digValNum ) => String( digValNum ).padStart( 2, '0' ); // What: Pad Digit Function. Why: Every ISO date string segment (month, day) needs to render as exactly 2 digits. How: This left-pads digValNum's own string form with a leading '0' when it's under 2 characters.
const isoDatFun = ( srcDatObj ) => `${ srcDatObj.getFullYear() }-${ padDigFun( srcDatObj.getMonth() + 1 ) }-${ padDigFun( srcDatObj.getDate() ) }`; // What: Iso Date Function. Why: Every date comparison and lookup in this module needs a plain, locale-independent, comparable string key, not a Date instance. How: This formats srcDatObj as YYYY-MM-DD using padDigFun for the 2-digit month/day segments.



// #region nthDayFun

/**
 * nthDayFun = Nth Day Function
 *
 * @summary
 * Resolves the actual calendar date of the Nth occurrence of a given
 * weekday within a month, e.g. the 2nd Monday of November.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param yeaValNum - The calendar year to resolve the date within.
 * @param monOneNum - The 1-based month number (1 = January).
 * @param dayIndNum - The target weekday, matching Date.getDay()'s own
 *                    encoding (Sun = 0 ... Sat = 6).
 * @param nthCouNum - Which occurrence of that weekday to resolve,
 *                    1-based (e.g. 2 for the 2nd Monday).
 *
 * @returns The resolved Date for the Nth occurrence of that weekday.
 *
 * @example
 * ```ts
 * nthDayFun(2026, 10, MON_DAY_NUM, 2) // => 2nd Monday of Nov. 2026
 * ```
 *
*/

function nthDayFun( yeaValNum, monOneNum, dayIndNum, nthCouNum ) {


	const firDatObj = new Date( yeaValNum, monOneNum - 1, 1 ); // What: First Date Object. Why: The month's own first day is the anchor every weekday-offset calculation below is computed from. How: This constructs a Date for day 1 of the given month/year.
	const shiDayNum = ( dayIndNum - firDatObj.getDay() + 7 ) % 7; // What: Shift Day Number. Why: The number of days to add to the 1st of the month to reach the FIRST occurrence of the target weekday must always be a non-negative offset. How: This computes ( target - actual + 7 ) % 7, wrapping a negative difference back into 0-6.



	return new Date( yeaValNum, monOneNum - 1, 1 + shiDayNum + ( nthCouNum - 1 ) * 7 ); // What: Nth Weekday Date Return. Why: The caller needs the actual resolved calendar date for the requested occurrence. How: This adds shiDayNum (to reach the first occurrence) plus 7 more days per additional occurrence requested.


}

// #endregion nthDayFun



// #region lasDayFun

/**
 * lasDayFun = Last Day Function
 *
 * @summary
 * Resolves the actual calendar date of the LAST occurrence of a given
 * weekday within a month, e.g. the last Monday of May.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param yeaValNum - The calendar year to resolve the date within.
 * @param monOneNum - The 1-based month number (1 = January).
 * @param dayIndNum - The target weekday, matching Date.getDay()'s own
 *                    encoding (Sun = 0 ... Sat = 6).
 *
 * @returns The resolved Date for the month's last occurrence of that
 * weekday.
 *
 * @example
 * ```ts
 * lasDayFun(2026, 5, MON_DAY_NUM) // => last Monday of May 2026
 * ```
 *
*/

function lasDayFun( yeaValNum, monOneNum, dayIndNum ) {


	const lasDatObj = new Date( yeaValNum, monOneNum, 0 ); // What: Last Date Object. Why: Day 0 of the NEXT month is JavaScript's own idiom for the last day of THIS month, which every offset below is computed from. How: This constructs a Date one month ahead with a day value of 0, which Date normalizes back to the prior month's final day.
	const shiDayNum = ( lasDatObj.getDay() - dayIndNum + 7 ) % 7; // What: Shift Day Number. Why: The number of days to subtract from the month's last day to reach the LAST occurrence of the target weekday must always be a non-negative offset. How: This computes ( actual - target + 7 ) % 7, wrapping a negative difference back into 0-6.



	return new Date( yeaValNum, monOneNum - 1, lasDatObj.getDate() - shiDayNum ); // What: Last Weekday Date Return. Why: The caller needs the actual resolved calendar date for the month's last occurrence of the target weekday. How: This subtracts shiDayNum days from the month's own last calendar day.


}

// #endregion lasDayFun



// #region datDefFun

/**
 * datDefFun = Date For Definition Function
 *
 * @summary
 * Resolves one HOL_DEF_ARR entry's own rule (fixArr/nthArr/lasArr) into
 * a concrete calendar date for a given year.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param holDefObj - The holiday definition to resolve, one HOL_DEF_ARR
 *                    entry carrying exactly one of fixArr/nthArr/lasArr.
 * @param yeaValNum - The calendar year to resolve the date within.
 *
 * @returns The resolved Date, or null if holDefObj carries none of the
 * 3 recognized rule shapes.
 *
 * @example
 * ```ts
 * datDefFun(holDefObj, 2026) // => resolved Date, or null
 * ```
 *
*/

function datDefFun( holDefObj, yeaValNum ) {


	if ( holDefObj.fixArr ) return new Date( yeaValNum, holDefObj.fixArr[ 0 ] - 1, holDefObj.fixArr[ 1 ] ); // What: Fixed Rule Branch. Why: A fixed-date holiday's actual calendar date never depends on any weekday math at all. How: This builds the date directly from the definition's own [month, day] pair.

	if ( holDefObj.nthArr ) return nthDayFun( yeaValNum, holDefObj.nthArr[ 0 ], holDefObj.nthArr[ 1 ], holDefObj.nthArr[ 2 ] ); // What: Nth Rule Branch. Why: An Nth-weekday holiday's actual calendar date depends on which weekday the month starts on. How: This delegates to nthDayFun with the definition's own [month, weekday, n] triple.

	if ( holDefObj.lasArr ) return lasDayFun( yeaValNum, holDefObj.lasArr[ 0 ], holDefObj.lasArr[ 1 ] ); // What: Last Rule Branch. Why: A last-weekday holiday's actual calendar date depends on which weekday the month ends on. How: This delegates to lasDayFun with the definition's own [month, weekday] pair.



	return null; // What: No Rule Return. Why: A malformed definition with none of fixArr/nthArr/lasArr set has no resolvable date at all. How: This returns null rather than throwing, matching this module's general null-for-unresolvable convention.


}

// #endregion datDefFun



// #region obsDatFun

/**
 * obsDatFun = Observed Date Function
 *
 * @summary
 * Applies the federal "observed" shift, for fixed-date holidays only: a
 * holiday landing on Saturday is observed the Friday before it, and one
 * landing on Sunday is observed the Monday after it. Weekday-based
 * holidays (an nth/last rule) never land on a weekend at all, so they
 * never need this.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param actDatObj - The holiday's own true, un-shifted calendar date.
 *
 * @returns The observed Date: actDatObj itself, unless it fell on a
 * Saturday or Sunday, in which case the shifted weekday instead.
 *
 * @example
 * ```ts
 * obsDatFun(actDatObj) // => observed Date
 * ```
 *
*/

function obsDatFun( actDatObj ) {


	const curDayNum = actDatObj.getDay(); // What: Current Day Number. Why: The federal observed-date shift depends on which weekday the actual holiday falls on. How: This reads actDatObj's own weekday via Date.getDay().

	if ( curDayNum === 6 ) return new Date( actDatObj.getFullYear(), actDatObj.getMonth(), actDatObj.getDate() - 1 ); // What: Saturday Shift Branch. Why: A federal holiday landing on Saturday is observed the Friday before it instead. How: This returns a Date one day earlier than actDatObj.

	if ( curDayNum === 0 ) return new Date( actDatObj.getFullYear(), actDatObj.getMonth(), actDatObj.getDate() + 1 ); // What: Sunday Shift Branch. Why: A federal holiday landing on Sunday is observed the Monday after it instead. How: This returns a Date one day later than actDatObj.



	return actDatObj; // What: Unshifted Date Return. Why: A holiday landing on any weekday but Saturday/Sunday is observed on its own actual date, unshifted. How: This returns actDatObj unchanged.


}

// #endregion obsDatFun



// #region comYeaFun

/**
 * comYeaFun = Compute Year Function
 *
 * @summary
 * Resolves every defined holiday for a country in a given year into a
 * concrete calendar record. date/iso on each returned record are the
 * OBSERVED day (what people actually get off); actual is the true
 * calendar day, and observed flags whether the two differ.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param yeaValNum - The calendar year to resolve every holiday for.
 * @param couCodStr - The 2-letter country code to resolve holidays
 *                    for, defaulting to 'US' (the only region this
 *                    module currently defines a rule table for).
 *
 * @returns An array of resolved holiday records, one per definition in
 * the resolved region's own table.
 *
 * @example
 * ```ts
 * comYeaFun(2026, 'US') // => array of resolved holiday records
 * ```
 *
*/

function comYeaFun( yeaValNum, couCodStr = 'US' ) {


	const curRegObj = REG_DEF_OBJ[ couCodStr ] || REG_DEF_OBJ.US; // What: Current Region Object. Why: Every holiday needs resolving against its own region's own rule table, falling back to the US table when the given code is unrecognized. How: This looks up couCodStr in REG_DEF_OBJ, defaulting to the US entry.



	return curRegObj.defArr.map( ( holDefObj ) => { // What: Holiday Record Map. Why: Every definition in the resolved region's table needs converting into one resolved holiday record. How: This maps curRegObj.defArr, computing each entry's actual and observed dates below.


		const actDatObj = datDefFun( holDefObj, yeaValNum );                     // What: Actual Date Object. Why: Every record needs its true, un-shifted calendar date before any observed-day adjustment. How: This resolves holDefObj's own fixed/nth/last rule for yeaValNum via datDefFun.
		const obsDatObj = holDefObj.fixArr ? obsDatFun( actDatObj ) : actDatObj; // What: Observed Date Object. Why: Only a fixed-date holiday can ever fall on a weekend and need the federal observed-day shift; a weekday-based rule never lands there. How: This applies obsDatFun only when holDefObj carries a fixArr rule, otherwise reuses actDatObj unshifted.



		return { // What: Holiday Record Object. Why: The caller needs one denormalized record per definition, carrying both the observed and actual dates so callers can tell whether they differ. How: This builds one plain object per curRegObj.defArr entry, mixing data straight from holDefObj with the two dates resolved above.


			key      : holDefObj.key,                                     // What: Key. Why: This is the stable identifier callers use to reference this specific holiday, e.g. to disable it. How: This is copied straight from holDefObj.key.
			name     : holDefObj.name,                                    // What: Name. Why: This is the human-readable label callers display for this holiday. How: This is copied straight from holDefObj.name.
			date     : obsDatObj,                                         // What: Date. Why: This is the OBSERVED day, what people actually get off, which is what most callers care about. How: This is obsDatObj, resolved above.
			iso      : isoDatFun( obsDatObj ),                            // What: Iso. Why: Callers matching against a specific calendar day need a plain comparable string, not a Date instance. How: This converts obsDatObj via isoDatFun.
			actual   : actDatObj,                                         // What: Actual. Why: A caller wording itself around an observed shift needs the true calendar date too. How: This is actDatObj, resolved above.
			observed : isoDatFun( obsDatObj ) !== isoDatFun( actDatObj )  // What: Observed. Why: A caller needs to know whether the observed and actual dates actually differ, to word itself accordingly. How: This compares the two dates' own iso strings for inequality.


		};


	} );


}

// #endregion comYeaFun



// #region defStaFun

/**
 * defStaFun = Default State Function
 *
 * @summary
 * Returns the canonical empty holidays-state shape: the US region, no
 * holidays disabled, and no custom recurring days off.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The canonical empty holidays-state object.
 *
 * @example
 * ```ts
 * defStaFun() // => { country: 'US', disabled: [], custom: [] }
 * ```
 *
*/

function defStaFun() { return { country : 'US', disabled : [], custom : [] }; } // What: Default State Body. Why: Every caller needs a safe, well-shaped holidays-state object to fall back to when state.holidays is missing entirely. How: This returns the canonical empty shape with no holidays disabled and no custom days off.

// #endregion defStaFun



// #region actYeaFun

/**
 * actYeaFun = Active Year Function
 *
 * @summary
 * Resolves the ACTIVE days off in a year: every computed holiday the
 * user hasn't disabled, plus their own custom recurring days resolved
 * to this specific year, as one combined, flat list.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param holStaObj - The persisted holidays state object ({ country,
 *                    disabled, custom }), or a falsy value to fall
 *                    back to defStaFun's canonical empty shape.
 * @param yeaValNum - The calendar year to resolve active days off for.
 *
 * @returns An array of active holiday/custom-day records for the year.
 *
 * @example
 * ```ts
 * actYeaFun(holStaObj, 2026) // => array of active day-off records
 * ```
 *
*/

function actYeaFun( holStaObj, yeaValNum ) {


	const resHolObj = holStaObj || defStaFun(); // What: Resolved Holidays Object. Why: A caller might pass a missing/undefined holidays state, which still needs a safe fallback to read from below. How: This falls back to defStaFun's canonical empty shape when holStaObj is falsy.
	const disKeyArr = resHolObj.disabled || [];  // What: Disabled Key Array. Why: A very old persisted state might be missing this field entirely. How: This falls back to an empty array when resHolObj.disabled is missing.


	const comActArr = comYeaFun( yeaValNum, resHolObj.country ) // What: Computed Active Array. Why: The caller only wants every defined holiday for the year, as a starting point before disabled ones are dropped. How: This computes every holiday record for yeaValNum against resHolObj.country.

		.filter( ( comRecObj ) => !disKeyArr.includes( comRecObj.key ) ) // What: Disabled Filter. Why: A holiday the user has switched off must never appear in the active list. How: This keeps only records whose key is absent from disKeyArr.

		.map( ( comRecObj ) => ( { ...comRecObj, custom : false } ) ); // What: Custom Flag Map. Why: Every surviving record needs marking as a computed (non-custom) holiday, for callers that tell the two kinds apart. How: This spreads each record and overrides custom to false.


	const cusDayArr = ( resHolObj.custom || [] ).map( ( cusDefObj ) => { // What: Custom Day Array. Why: The user's own recurring custom days off need resolving to this specific year too, each flagged as custom. How: This maps every saved custom definition to a concrete date for yeaValNum.


		const cusDatObj = new Date( yeaValNum, cusDefObj.month - 1, cusDefObj.day ); // What: Custom Date Object. Why: A custom definition only stores month/day; the specific year still needs resolving here. How: This constructs the Date from yeaValNum plus the definition's own month/day.



		return { // What: Custom Record Object. Why: Every resolved custom day needs the same record shape as a computed holiday, so callers can treat them uniformly. How: This builds one record, prefixing the key so it can never collide with a computed holiday's own key.


			key    : 'custom:' + cusDefObj.id, // What: Key. Why: This is the stable identifier for this custom day, namespaced so it can never collide with a computed holiday's own key. How: This prefixes cusDefObj.id with 'custom:'.
			name   : cusDefObj.name,           // What: Name. Why: This is the human-readable label callers display for this custom day. How: This is copied straight from cusDefObj.name.
			date   : cusDatObj,                // What: Date. Why: This is the resolved concrete date for yeaValNum. How: This is cusDatObj, resolved above.
			iso    : isoDatFun( cusDatObj ),   // What: Iso. Why: Callers matching against a specific calendar day need a plain comparable string, not a Date instance. How: This converts cusDatObj via isoDatFun.
			custom : true                      // What: Custom. Why: A caller needs to tell this record apart from a computed built-in holiday. How: This is always true for a record built from the user's own custom list.


		};


	} );



	return [ ...comActArr, ...cusDayArr ]; // What: Active Holidays Return. Why: The caller wants one combined, flat list of every active day off for the year. How: This concatenates the computed and custom arrays via spread.


}

// #endregion actYeaFun



// #region holDatFun

/**
 * holDatFun = Holiday On Date Function
 *
 * @summary
 * Checks whether a given date is an active day off, returning just its
 * name (or null). Checks the neighboring years too, because an
 * observed shift can push a holiday across a year boundary (New Year's
 * Day on a Saturday is observed Dec 31 of the prior year).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param holStaObj - The persisted holidays state object to check
 *                    against, in the same shape actYeaFun accepts.
 * @param chkDatObj - The date being checked.
 *
 * @returns The matching holiday/custom-day's own name, or null if
 * chkDatObj is not an active day off.
 *
 * @example
 * ```ts
 * holDatFun(holStaObj, chkDatObj) // => holiday name, or null
 * ```
 *
*/

function holDatFun( holStaObj, chkDatObj ) {


	const tgtIsoStr = isoDatFun( chkDatObj );  // What: Target Iso String. Why: Every candidate year's own active list needs comparing against the queried date as a plain string, not a Date instance. How: This converts chkDatObj via isoDatFun once, reused across every loop iteration below.
	const curYeaNum = chkDatObj.getFullYear(); // What: Current Year Number. Why: The neighboring-year search below needs an anchor year to offset from. How: This reads chkDatObj's own calendar year.


	for ( const chkYeaNum of [ curYeaNum - 1, curYeaNum, curYeaNum + 1 ] ) { // What: Neighboring Year Loop. Why: An observed shift can push a holiday across a year boundary, so the year before and after must be checked too, not just curYeaNum itself. How: This walks the prior, current, and next calendar year in turn.


		const hitHolObj = actYeaFun( holStaObj, chkYeaNum ).find( ( comRecObj ) => comRecObj.iso === tgtIsoStr ); // What: Hit Holiday Object. Why: Whichever active record (if any) actually falls on the queried date for this candidate year is what the caller wants. How: This searches chkYeaNum's own active list for a matching iso string.

		if ( hitHolObj ) return hitHolObj.name; // What: Hit Found Guard. Why: The first matching year's own record is enough; there's no need to keep searching once found. How: This returns the matched record's own name immediately.


	}



	return null; // What: No Hit Return. Why: None of the 3 candidate years had an active record on the queried date. How: This returns null, this module's convention for "not a day off".


}

// #endregion holDatFun



// #region holInfFun

/**
 * holInfFun = Holiday Info Function
 *
 * @summary
 * Same lookup as holDatFun, but returns the full record instead of
 * just the name, so a caller can tell a built-in holiday from a
 * user-added one and word itself accordingly.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param holStaObj - The persisted holidays state object to check
 *                    against, in the same shape actYeaFun accepts.
 * @param chkDatObj - The date being checked.
 *
 * @returns The matching full holiday/custom-day record, or null if
 * chkDatObj is not an active day off.
 *
 * @example
 * ```ts
 * holInfFun(holStaObj, chkDatObj) // => holiday record, or null
 * ```
 *
*/

function holInfFun( holStaObj, chkDatObj ) {


	const tgtIsoStr = isoDatFun( chkDatObj );  // What: Target Iso String. Why: Every candidate year's own active list needs comparing against the queried date as a plain string, not a Date instance. How: This converts chkDatObj via isoDatFun once, reused across every loop iteration below.
	const curYeaNum = chkDatObj.getFullYear(); // What: Current Year Number. Why: The neighboring-year search below needs an anchor year to offset from. How: This reads chkDatObj's own calendar year.


	for ( const chkYeaNum of [ curYeaNum - 1, curYeaNum, curYeaNum + 1 ] ) { // What: Neighboring Year Loop. Why: An observed shift can push a holiday across a year boundary, so the year before and after must be checked too, not just curYeaNum itself. How: This walks the prior, current, and next calendar year in turn.


		const hitHolObj = actYeaFun( holStaObj, chkYeaNum ).find( ( comRecObj ) => comRecObj.iso === tgtIsoStr ); // What: Hit Holiday Object. Why: Whichever active record (if any) actually falls on the queried date for this candidate year is what the caller wants. How: This searches chkYeaNum's own active list for a matching iso string.

		if ( hitHolObj ) return hitHolObj; // What: Hit Found Guard. Why: The first matching year's own record is enough; there's no need to keep searching once found. How: This returns the matched full record immediately, unlike holDatFun which returns just its name.


	}



	return null; // What: No Hit Return. Why: None of the 3 candidate years had an active record on the queried date. How: This returns null, this module's convention for "not a day off".


}

// #endregion holInfFun



// #region gueCouFun

/**
 * gueCouFun = Guess Country Function
 *
 * @summary
 * Best-effort region guess from the browser's own locale. Only 'US' is
 * wired up with a real rule table today, so this is purely
 * informational; every caller still falls back to 'US' regardless of
 * what this returns.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The guessed 2-letter region code, or 'US' when nothing
 * recognizable could be parsed out of the browser's own locale.
 *
 * @example
 * ```ts
 * gueCouFun() // => guessed region code, e.g. 'US'
 * ```
 *
*/

function gueCouFun() {


	try { // What: Locale Region Probe Try. Why: Reading navigator.language and probing REG_DEF_OBJ could throw in some environments rather than cleanly returning nothing. How: This wraps the whole guess-and-check sequence below so any such error falls through to the US default.


		const regCodStr = ( navigator.language || '' ).split( '-' )[ 1 ]; // What: Region Code String. Why: A BCP 47 locale tag's own region subtag (e.g. 'US' from 'en-US') is the only piece that could plausibly match a REG_DEF_OBJ key. How: This splits navigator.language on '-' and takes its second segment.

		if ( regCodStr && REG_DEF_OBJ[ regCodStr.toUpperCase() ] ) return regCodStr.toUpperCase(); // What: Known Region Guard. Why: Only a region this module actually has a rule table for is worth reporting back. How: This returns the upper-cased region code only when REG_DEF_OBJ recognizes it.


	}

	catch ( e ) { /* ignore: an unrecognized or unparsable locale just falls through to the US default below */ }



	return 'US'; // What: US Fallback Return. Why: Only the United States is supported for real today, so every other case (no match, or an outright parse error) should still land on a real, working region. How: This returns the literal 'US' region code.


}

// #endregion gueCouFun



// #region regLabFun

/**
 * regLabFun = Region Label Function
 *
 * @summary
 * Resolves a country/region code down to its own human-readable
 * display name, e.g. 'US' to 'United States'.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param couCodStr - The 2-letter country code to resolve a label for.
 *
 * @returns The resolved region's own display name, falling back to the
 * US entry's name when couCodStr is unrecognized.
 *
 * @example
 * ```ts
 * regLabFun('US') // => 'United States'
 * ```
 *
*/

function regLabFun( couCodStr ) { return ( REG_DEF_OBJ[ couCodStr ] || REG_DEF_OBJ.US ).labStr; } // What: Region Label Body. Why: Callers displaying the active region (e.g. Settings) need its human-readable name, not the raw code. How: This looks up couCodStr in REG_DEF_OBJ, falling back to the US entry, and reads its own labStr.

// #endregion regLabFun



export const HOL_NAM_OBJ = { comYeaFun, actYeaFun, holDatFun, holInfFun, defStaFun, gueCouFun, regLabFun, isoDatFun }; // What: Holidays Namespace Object. Why: This is the module's whole public API, the single object every consuming file imports and calls through. How: This groups every function above under one object via shorthand properties, each key matching that function's own already-renamed identifier.



