


/**
 * cadence.js = Picker Cadence
 *
 * @summary
 * A per-picker gate controlling WHEN a picker surfaces on Today, and (for
 * display) which unit word the ease Soonest/Latest steppers use. The
 * cadence field is one of 'daily' (the default), 'weekly', 'monthly', or
 * 'yearly'.
 *
 * Daily has no anchor at all: it surfaces every day, matching the app's
 * original behavior from before cadence existed. Weekly surfaces on a
 * chosen weekday (anchorDow, 0 for Sunday through 6 for Saturday).
 * Monthly surfaces on a chosen day of the month (dateMode 'date',
 * anchorDom 1 through 31, clamped to the month's own last day for a
 * short month, so 31 lands on Feb 28 or 29) or on the Nth occurrence of
 * a weekday within that month (dateMode 'nthWeekday', nthOrdinal 1
 * through 5, nthWeekday 0 through 6, clamped to the 4th whenever a
 * requested 5th doesn't occur that month; every month has at least 4 of
 * any given weekday, so only a 5th can ever be missing). Yearly works
 * the same way, but anchors to a chosen month and day instead of just a
 * day: dateMode 'date' with anchorMonth 1 through 12 and anchorDay 1
 * through 31 (Feb 29 clamps to Feb 28 in a common year), or dateMode
 * 'nthWeekday' with the same nthOrdinal/nthWeekday fields and clamp as
 * monthly, scoped to that one anchor month.
 *
 * The dateMode/nthOrdinal/nthWeekday fields and their semantics mirror
 * tasks.js' own monthly reminders exactly, duplicated here rather than
 * shared, per this module's own isolation from tasks.js (see CLAUDE.md's
 * domain modules section).
 *
 * Period model: each cadence divides the calendar into consecutive
 * periods whose boundary is the anchor. The period a date falls in is
 * identified by its own start date (perStaFun below), the most recent
 * anchor occurrence on or before that date. A picker's pick, once
 * surfaced, persists across days until it's completed; the next anchor
 * then opens a fresh period. "Completed this period" means a done
 * pick-log row dated on or after the current period's own start.
 *
 * Charging is per run (done-gated), and a cadence picker runs once per
 * period, so the ease Soonest/Latest stepper number is periods-until-due
 * in the cadence's own unit, not calendar days at all: there is no day
 * conversion anywhere in this file. Drift is 100 divided by periods,
 * exactly as the engine already stores it.
 *
 * The exported CAD_NAM_OBJ namespace object's own property names are a
 * cross-file contract read directly by store.jsx, tab-today.jsx,
 * tab-picker.jsx, tab-data.jsx, tab-stats.jsx, day-log.jsx, and
 * cadence-control.jsx. Same as pickers.js's own PIC_NAM_OBJ, CAD_NAM_OBJ's
 * own external names were swept to match their internal implementation
 * exactly (isaCadFun, uniWorFun, norCadFun, tipMesFun, locTipFun, enfWeeFun,
 * isaAncFun, perStaFun, perKeyFun, comPerFun, sumCadFun, forIsoFun,
 * dimCouFun, CAD_STR_ARR), with every external call site updated to match.
 * The explicit `name : name`
 * mapping (never JS shorthand) is kept anyway, so a future internal
 * rename still has to touch this export line deliberately rather than
 * silently renaming the external API out from under its callers.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const padNumFun = ( numValNum ) => String( numValNum ).padStart( 2, '0' );                                                                          // What: Pad Number Function. Why: An ISO date string needs its month and day both zero-padded to 2 digits. How: This is called twice by forIsoFun below, once for the month and once for the day.
const forIsoFun = ( inpDatObj ) => `${ inpDatObj.getFullYear() }-${ padNumFun( inpDatObj.getMonth() + 1 ) }-${ padNumFun( inpDatObj.getDate() ) }`; // What: Format Iso Function. Why: Period keys and pick-log date comparisons both need a plain YYYY-MM-DD string, not a Date instance. How: This reads inpDatObj's own year/month/day and zero-pads the month and day via padNumFun.
const dimCouFun = ( yeaValNum, monOneNum ) => new Date( yeaValNum, monOneNum, 0 ).getDate();                                                        // What: Days-In-Month Count Function. Why: Monthly/yearly clamping and nth-weekday math both need to know how many days a given month actually has. How: This asks for day 0 of the FOLLOWING month, which JS's own Date resolves back to the last real day of monOneNum.
const midDatFun = ( inpDatObj ) => new Date( inpDatObj.getFullYear(), inpDatObj.getMonth(), inpDatObj.getDate() );                                  // What: Midnight Date Function. Why: Period-start comparisons must ignore whatever time-of-day inpDatObj carries. How: This rebuilds a Date from inpDatObj's own year/month/day alone, dropping the time component entirely.



// #region nwmDayFun

/**
 * nwmDayFun = Nth-Weekday-Month Day Function
 *
 * @summary
 * Day-of-month of the Nth (1 through 5) occurrence of a given weekday in
 * a given year/month. Clamps down to the 4th whenever a requested 5th
 * doesn't exist: every month has at least 4 of any weekday (the
 * shortest month is 28 days, exactly 4 weeks), so only the 5th can ever
 * be missing, and the 4th is always a valid fallback. Same logic as
 * tasks.js' own nthWeekdayOfMonth, duplicated per this module's own
 * isolation from tasks.js.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param yeaValNum - Year Value Number: The calendar year to compute
 *                    against.
 * @param monOneNum - Month One Number: The 1-indexed month to compute
 *                    against (1 for January through 12 for December).
 * @param nthValNum - Nth Value Number: Which occurrence to find, 1
 *                    through 5.
 * @param weeValNum - Weekday Value Number: The target weekday, 0 for
 *                    Sunday through 6 for Saturday.
 *
 * @returns The day-of-month (1 through 31) of that Nth weekday
 * occurrence, clamped to the 4th when a requested 5th doesn't exist.
 *
 * @example
 * ```ts
 * nwmDayFun(yeaValNum, monOneNum, nthValNum, weeValNum) // => day number
 * ```
 *
*/

function nwmDayFun( yeaValNum, monOneNum, nthValNum, weeValNum ) {


	const firWeeNum = new Date( yeaValNum, monOneNum - 1, 1 ).getDay();                // What: First Weekday Number. Why: Finding the Nth occurrence of weeValNum needs to know which weekday the month itself starts on. How: This reads the weekday of that month's own 1st day.
	const firOccNum = 1 + ( ( weeValNum - firWeeNum + 7 ) % 7 );                       // What: First Occurrence Number. Why: This is the day-of-month of the VERY FIRST occurrence of weeValNum in this month, the base every later occurrence is counted from. How: This walks forward from firWeeNum to weeValNum, wrapping via modulo 7.
	const dimValNum = dimCouFun( yeaValNum, monOneNum );                               // What: Days-In-Month Value Number. Why: The clamp below needs to know how many real days this month actually has. How: This calls dimCouFun once and reuses the result.
	const canDayNum = firOccNum + ( Math.max( 1, Math.min( 5, nthValNum ) ) - 1 ) * 7; // What: Candidate Day Number. Why: This is the day-of-month the requested Nth occurrence would land on before any clamping. How: This adds 7 days per occurrence past the first, with nthValNum itself clamped to [1, 5].



	return canDayNum > dimValNum ? canDayNum - 7 : canDayNum; // What: Nth-Weekday-Month Day Return. Why: A requested 5th occurrence that overshoots the month's own real length must fall back to the 4th instead. How: This steps canDayNum back by exactly one week whenever it lands past dimValNum.


}

// #endregion nwmDayFun



// #region tdmResFun

/**
 * tdmResFun = Target-Day-Month Resolve Function
 *
 * @summary
 * Resolves a day-of-month for either a monthly (anchorDom) or yearly
 * (anchorDay, within its own fixed anchor month) cadence, honoring
 * nth-weekday mode for either. domFieStr is which raw field on
 * picCadObj holds its plain date-of-month value ('anchorDom' for
 * monthly, 'anchorDay' for yearly), shared so isaAncFun/perStaFun don't
 * each duplicate the dateMode branch below.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param picCadObj - Picker Cadence Object: The picker whose cadence
 *                    fields (dateMode, nthOrdinal, nthWeekday, and
 *                    whichever field domFieStr names) are being
 *                    resolved.
 * @param yeaValNum - Year Value Number: The calendar year to compute
 *                    against.
 * @param monOneNum - Month One Number: The 1-indexed month to compute
 *                    against.
 * @param domFieStr - Day-Of-Month Field String: Which of picCadObj's
 *                    own fields holds its plain date-of-month value,
 *                    'anchorDom' or 'anchorDay'.
 *
 * @returns The resolved day-of-month, from picCadObj's own plain value
 * (clamped to the month's own real length) or, in nth-weekday mode,
 * from nwmDayFun.
 *
 * @example
 * ```ts
 * tdmResFun(picCadObj, yeaValNum, monOneNum, domFieStr) // => day number
 * ```
 *
*/

function tdmResFun( picCadObj, yeaValNum, monOneNum, domFieStr ) { return picCadObj.dateMode === 'nthWeekday' ? nwmDayFun( yeaValNum, monOneNum, picCadObj.nthOrdinal ?? 1, picCadObj.nthWeekday ?? 0 ) : Math.min( picCadObj[ domFieStr ] ?? 1, dimCouFun( yeaValNum, monOneNum ) ); } // What: Target-Day-Month Resolve Body. Why: Both isaAncFun and perStaFun need this exact same dateMode branch for both monthly and yearly cadences. How: This resolves via nwmDayFun in nth-weekday mode, or picCadObj's own plain field (clamped to the real month length) otherwise.

// #endregion tdmResFun



const CAD_STR_ARR = [ 'daily', 'weekly', 'monthly', 'yearly' ];         // What: Cadence String Array. Why: This is the fixed set of valid cadence values every picker's own cadence field must fall back to one of. How: This is read by isaCadFun below, and re-exported under its own matching name on the CAD_NAM_OBJ object.
const isaCadFun   = ( cadValStr ) => CAD_STR_ARR.includes( cadValStr ); // What: Is-A Cadence Function. Why: norCadFun needs to tell a real, already-valid cadence value apart from a missing or corrupted one. How: This checks cadValStr against CAD_STR_ARR.



// #region uniWorFun

/**
 * uniWorFun = Unit Word Function
 *
 * @summary
 * The unit word for a cadence's ease Soonest/Latest steppers, singular
 * or plural depending on couValNum.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param cadValStr - Cadence Value String: The picker's own cadence
 *                    value.
 * @param couValNum - Count Value Number: How many of the unit are being
 *                    displayed; exactly 1 gets the singular form,
 *                    anything else the plural.
 *
 * @returns The matching unit word, e.g. 'week' or 'weeks'.
 *
 * @example
 * ```ts
 * uniWorFun(cadValStr, couValNum) // => unit word
 * ```
 *
*/

function uniWorFun( cadValStr, couValNum ) {


	switch ( cadValStr ) { // What: Cadence Switch. Why: Each cadence has its own unit word, singular or plural per couValNum. How: This branches on cadValStr, falling back to the daily day/days pair for anything else.


		case 'weekly'  : return couValNum === 1 ? 'week'  : 'weeks';  // What: Weekly Case Return. Why: A weekly cadence's own stepper counts in weeks. How: This returns the singular form only when couValNum is exactly 1.
		case 'monthly' : return couValNum === 1 ? 'month' : 'months'; // What: Monthly Case Return. Why: A monthly cadence's own stepper counts in months. How: This returns the singular form only when couValNum is exactly 1.
		case 'yearly'  : return couValNum === 1 ? 'year'  : 'years';  // What: Yearly Case Return. Why: A yearly cadence's own stepper counts in years. How: This returns the singular form only when couValNum is exactly 1.
		default        : return couValNum === 1 ? 'day'   : 'days';   // What: Default Case Return. Why: Daily (or an unrecognized cadence) counts in days. How: This returns the singular form only when couValNum is exactly 1.


	}


}

// #endregion uniWorFun



// #region norCadFun

/**
 * norCadFun = Normalize Cadence Function
 *
 * @summary
 * Normalizes/defaults the cadence fields on a picker-like object.
 * picLikObj may be a partial draft (a new-picker form value), not
 * necessarily an already-persisted picker, so every field below falls
 * back to a sensible default rather than assuming it's already present.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param picLikObj - Picker Like Object: The picker-like object to
 *                    normalize, defaulting to an empty object for a
 *                    brand new draft with nothing set yet.
 *
 * @returns A full { cadence, anchorDow, anchorDom, anchorMonth,
 * anchorDay, dateMode, nthOrdinal, nthWeekday } object, every field
 * either taken from picLikObj or defaulted against the current date.
 *
 * @example
 * ```ts
 * norCadFun(picLikObj) // => normalized cadence fields object
 * ```
 *
*/

function norCadFun( picLikObj = {} ) {


	const curDatObj = new Date();                                                   // What: Current Date Object. Why: Every default below (anchorDow, anchorDom, anchorMonth, anchorDay, nthWeekday) falls back to today's own value when picLikObj has nothing set. How: This is read once and reused across the whole return object below.
	const curCadStr = isaCadFun( picLikObj.cadence ) ? picLikObj.cadence : 'daily'; // What: Current Cadence String. Why: An invalid or missing cadence value must fall back to 'daily' rather than propagate a bad value. How: This checks picLikObj's own cadence via isaCadFun, defaulting to 'daily' otherwise.



	return { // What: Normalized Cadence Object Return. Why: Every caller of norCadFun needs this exact same full set of fields back, whatever picLikObj did or didn't already have. How: This builds the object below from curCadStr, curDatObj, and picLikObj's own existing fields.


		anchorDay   : Number.isInteger( picLikObj.anchorDay ) ? picLikObj.anchorDay : curDatObj.getDate(),          // What: Anchor Day. Why: A yearly cadence also needs its own chosen day within anchorMonth, defaulted to today's when not yet set. How: This keeps picLikObj's own anchorDay when it's a real integer, curDatObj's own date otherwise.
		anchorDom   : Number.isInteger( picLikObj.anchorDom ) ? picLikObj.anchorDom : curDatObj.getDate(),          // What: Anchor Dom. Why: A monthly cadence needs its own chosen day-of-month, defaulted to today's when not yet set. How: This keeps picLikObj's own anchorDom when it's a real integer, curDatObj's own date otherwise.
		anchorDow   : Number.isInteger( picLikObj.anchorDow ) ? picLikObj.anchorDow : curDatObj.getDay(),           // What: Anchor Dow. Why: A weekly cadence needs its own chosen weekday, defaulted to today's when not yet set. How: This keeps picLikObj's own anchorDow when it's a real integer, curDatObj's own weekday otherwise.
		anchorMonth : Number.isInteger( picLikObj.anchorMonth ) ? picLikObj.anchorMonth : curDatObj.getMonth() + 1, // What: Anchor Month. Why: A yearly cadence needs its own chosen month, defaulted to today's when not yet set. How: This keeps picLikObj's own anchorMonth when it's a real integer, curDatObj's own 1-indexed month otherwise.
		cadence     : curCadStr,                                                                                    // What: Cadence. Why: This is the already-validated/defaulted cadence value computed above. How: This is just curCadStr, computed above via isaCadFun.
		dateMode    : picLikObj.dateMode === 'nthWeekday' ? 'nthWeekday' : 'date',                                  // What: Date Mode. Why: Monthly/yearly cadences need to know whether a plain date or an nth-weekday rule decides the anchor day. How: This keeps 'nthWeekday' only when picLikObj already says so, 'date' otherwise.
		nthOrdinal  : Number.isInteger( picLikObj.nthOrdinal ) ? picLikObj.nthOrdinal : 1,                          // What: Nth Ordinal. Why: Nth-weekday mode needs which occurrence (1st through 5th) to target. How: This keeps picLikObj's own nthOrdinal when it's a real integer, 1 otherwise.
		nthWeekday  : Number.isInteger( picLikObj.nthWeekday ) ? picLikObj.nthWeekday : curDatObj.getDay()          // What: Nth Weekday. Why: Nth-weekday mode also needs which weekday to target. How: This keeps picLikObj's own nthWeekday when it's a real integer, curDatObj's own weekday otherwise.


	};


}

// #endregion norCadFun



// #region isaAncFun

/**
 * isaAncFun = Is-An Anchor Function
 *
 * @summary
 * Is cheDatObj an anchor day for picCadObj's own cadence? Daily has no
 * anchor at all, so every day counts as one.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param picCadObj - Picker Cadence Object: The picker whose cadence is
 *                    being checked.
 * @param cheDatObj - Check Date Object: The date to check, defaulting
 *                    to right now.
 *
 * @returns Whether cheDatObj is an anchor day for picCadObj's own
 * cadence.
 *
 * @example
 * ```ts
 * isaAncFun(picCadObj, cheDatObj) // => true or false
 * ```
 *
*/

function isaAncFun( picCadObj, cheDatObj = new Date() ) {


	const curCadStr = picCadObj.cadence || 'daily'; // What: Current Cadence String. Why: Every branch below needs picCadObj's own cadence, defaulted the same way every other function in this file defaults it. How: This reads picCadObj.cadence, falling back to 'daily' when missing.


	if ( curCadStr === 'daily' ) return true; // What: Daily Case Return. Why: Daily has no anchor at all, so every day counts as one. How: This returns true unconditionally for the daily case.



	if ( curCadStr === 'weekly' ) return cheDatObj.getDay() === ( picCadObj.anchorDow ?? cheDatObj.getDay() ); // What: Weekly Case Return. Why: A weekly cadence's own anchor day is whichever weekday anchorDow names. How: This compares cheDatObj's own weekday against picCadObj's own anchorDow, defaulted to cheDatObj's own weekday (a no-op match) when missing.



	if ( curCadStr === 'monthly' ) return cheDatObj.getDate() === tdmResFun( picCadObj, cheDatObj.getFullYear(), cheDatObj.getMonth() + 1, 'anchorDom' ); // What: Monthly Case Return. Why: A monthly cadence's own anchor day is whatever tdmResFun resolves for this month. How: This compares cheDatObj's own date-of-month against tdmResFun's own resolved target.



	if ( curCadStr === 'yearly' ) { // What: Yearly Case Check. Why: A yearly cadence needs its own multi-step resolution, checking the anchor month first and only then the anchor day within it, unlike the other cadences' plain one-line comparisons. How: This branches into the wrong-month guard and tdmResFun's own day resolution below whenever curCadStr is 'yearly'.


		const ancMonNum = picCadObj.anchorMonth ?? 1; // What: Anchor Month Number. Why: A yearly cadence only anchors within one specific month, needed both for the month check below and the day resolution that follows it. How: This reads picCadObj's own anchorMonth, defaulting to January.


		if ( cheDatObj.getMonth() + 1 !== ancMonNum ) return false; // What: Wrong Month Guard. Why: A yearly cadence can never anchor outside its own single anchor month. How: This returns false early when cheDatObj's own month doesn't match ancMonNum.



		return cheDatObj.getDate() === tdmResFun( picCadObj, cheDatObj.getFullYear(), ancMonNum, 'anchorDay' ); // What: Yearly Case Return. Why: Within the right month, the anchor day is whatever tdmResFun resolves. How: This compares cheDatObj's own date-of-month against tdmResFun's own resolved target.


	}



	return true; // What: Fallback Return. Why: An unrecognized cadence value has no defined rule, so this defaults to treating every day as an anchor, same as daily. How: This returns true for any cadence not already handled above.


}

// #endregion isaAncFun



// #region perStaFun

/**
 * perStaFun = Period Start Function
 *
 * @summary
 * The start date (a Date at midnight) of the period cheDatObj falls in,
 * the most recent anchor on or before cheDatObj. Daily returns cheDatObj
 * itself (at midnight).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param picCadObj - Picker Cadence Object: The picker whose cadence's
 *                    period is being resolved.
 * @param cheDatObj - Check Date Object: The date whose own period start
 *                    is wanted, defaulting to right now.
 *
 * @returns The Date (at midnight) that starts cheDatObj's own current
 * period.
 *
 * @example
 * ```ts
 * perStaFun(picCadObj, cheDatObj) // => period start Date
 * ```
 *
*/

function perStaFun( picCadObj, cheDatObj = new Date() ) {


	const curCadStr = picCadObj.cadence || 'daily'; // What: Current Cadence String. Why: Every branch below needs picCadObj's own cadence, defaulted the same way every other function in this file defaults it. How: This reads picCadObj.cadence, falling back to 'daily' when missing.
	const midDatObj = midDatFun( cheDatObj );       // What: Midnight Date Object. Why: Every branch below computes its own period start relative to cheDatObj with its time-of-day stripped. How: This calls midDatFun once and reuses the result throughout.


	if ( curCadStr === 'daily' ) return midDatObj; // What: Daily Case Return. Why: Daily has no anchor, so every day is its own period, starting at its own midnight. How: This returns midDatObj directly.



	if ( curCadStr === 'weekly' ) { // What: Weekly Case Check. Why: A weekly period's own start needs stepping back to the most recent anchor weekday, a multi-step calculation unlike daily's direct return. How: This branches into the anchor-weekday step-back below whenever curCadStr is 'weekly'.


		const ancDowNum = picCadObj.anchorDow ?? midDatObj.getDay();  // What: Anchor Dow Number. Why: A weekly period's own start is whichever weekday anchorDow names. How: This reads picCadObj's own anchorDow, defaulting to midDatObj's own weekday (a no-op) when missing.
		const bacDayNum = ( midDatObj.getDay() - ancDowNum + 7 ) % 7; // What: Back Day Number. Why: The period start is whatever anchor weekday most recently occurred on or before midDatObj. How: This computes how many days to step back from midDatObj's own weekday to reach ancDowNum, wrapping via modulo 7.
		const weeStaObj = new Date( midDatObj );                      // What: Weekly Start Object. Why: The actual period-start date must be built from a fresh Date, since setDate below mutates in place. How: This copies midDatObj so the mutation below doesn't affect the caller's own cheDatObj.


		weeStaObj.setDate( midDatObj.getDate() - bacDayNum ); // What: Weekly Start Date Set. Why: This is the actual step back to the most recent anchor weekday. How: This mutates weeStaObj in place to midDatObj's own date minus bacDayNum.



		return weeStaObj; // What: Weekly Case Return. Why: The caller needs the freshly-stepped-back Date, not midDatObj itself. How: This returns weeStaObj, already stepped back above.


	}


	if ( curCadStr === 'monthly' ) { // What: Monthly Case Check. Why: A monthly period's own start depends on whether midDatObj has already reached this month's anchor day or still belongs to the previous month's, a multi-step resolution unlike daily's direct return. How: This branches into the current-month guard and previous-month fallback below whenever curCadStr is 'monthly'.


		const curTarNum = tdmResFun( picCadObj, midDatObj.getFullYear(), midDatObj.getMonth() + 1, 'anchorDom' ); // What: Current Target Number. Why: This month's own anchor day-of-month must be known before deciding whether midDatObj has already passed it. How: This calls tdmResFun for midDatObj's own year and month.


		if ( midDatObj.getDate() >= curTarNum ) return new Date( midDatObj.getFullYear(), midDatObj.getMonth(), curTarNum ); // What: Current Month Guard. Why: Once midDatObj has reached (or passed) this month's own anchor day, that day itself is the period start. How: This returns that anchor date directly when midDatObj's own date is already at or past curTarNum.



		const preMonObj = new Date( midDatObj.getFullYear(), midDatObj.getMonth() - 1, 1 );                       // What: Previous Month Object. Why: Before this month's own anchor day, the period actually started back in the previous month. How: This builds a Date for the 1st of the month before midDatObj's own.
		const preTarNum = tdmResFun( picCadObj, preMonObj.getFullYear(), preMonObj.getMonth() + 1, 'anchorDom' ); // What: Previous Target Number. Why: The previous month's own anchor day is what the period actually started on. How: This calls tdmResFun for preMonObj's own year and month.



		return new Date( preMonObj.getFullYear(), preMonObj.getMonth(), preTarNum ); // What: Monthly Case Return. Why: The caller needs the previous month's own anchor date as the period start. How: This builds that Date from preMonObj's own year/month and preTarNum.


	}


	if ( curCadStr === 'yearly' ) { // What: Yearly Case Check. Why: A yearly period's own start depends on whether midDatObj has already reached this year's anchor date or still belongs to the previous year's, a multi-step resolution unlike daily's direct return. How: This branches into the current-year guard and previous-year fallback below whenever curCadStr is 'yearly'.


		const monIndNum = ( picCadObj.anchorMonth ?? 1 ) - 1;                                          // What: Month Index Number. Why: Every calculation below needs the anchor month as a 0-indexed JS Date month. How: This subtracts 1 from picCadObj's own anchorMonth, defaulted to January.
		const curTarNum = tdmResFun( picCadObj, midDatObj.getFullYear(), monIndNum + 1, 'anchorDay' ); // What: Current Target Number. Why: This year's own anchor day within anchorMonth must be known before deciding whether midDatObj has already passed it. How: This calls tdmResFun for midDatObj's own year and monIndNum.
		const curAncObj = new Date( midDatObj.getFullYear(), monIndNum, curTarNum );                   // What: Current Anchor Object. Why: The guard below needs a real Date to compare midDatObj against, not just a day number. How: This builds that Date from midDatObj's own year, monIndNum, and curTarNum.


		if ( midDatObj >= curAncObj ) return curAncObj; // What: Current Year Guard. Why: Once midDatObj has reached (or passed) this year's own anchor date, that date itself is the period start. How: This returns curAncObj directly when midDatObj is already at or past it.



		const preYeaNum = midDatObj.getFullYear() - 1;                                   // What: Previous Year Number. Why: Before this year's own anchor date, the period actually started back in the previous year. How: This subtracts 1 from midDatObj's own year.
		const preTarNum = tdmResFun( picCadObj, preYeaNum, monIndNum + 1, 'anchorDay' ); // What: Previous Target Number. Why: The previous year's own anchor day is what the period actually started on. How: This calls tdmResFun for preYeaNum and monIndNum.



		return new Date( preYeaNum, monIndNum, preTarNum ); // What: Yearly Case Return. Why: The caller needs the previous year's own anchor date as the period start. How: This builds that Date from preYeaNum, monIndNum, and preTarNum.


	}



	return midDatObj; // What: Fallback Return. Why: An unrecognized cadence value has no defined period rule, so this defaults to treating cheDatObj's own midnight as the period start, same as daily. How: This returns midDatObj for any cadence not already handled above.


}

// #endregion perStaFun



// #region perKeyFun

/**
 * perKeyFun = Period Key Function
 *
 * @summary
 * The ISO string of picCadObj's own current period start, the "period
 * key" used to tag a today-entry and to compare against pick-log rows.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param picCadObj - Picker Cadence Object: The picker whose current
 *                    period key is wanted.
 * @param cheDatObj - Check Date Object: The date to resolve the period
 *                    against, defaulting to right now.
 *
 * @returns The ISO date string of picCadObj's own current period start.
 *
 * @example
 * ```ts
 * perKeyFun(picCadObj, cheDatObj) // => 'YYYY-MM-DD'
 * ```
 *
*/

function perKeyFun( picCadObj, cheDatObj = new Date() ) { return forIsoFun( perStaFun( picCadObj, cheDatObj ) ); } // What: Period Key Body. Why: Every caller needs a plain comparable string, not a Date instance. How: This formats perStaFun's own resolved period start via forIsoFun.

// #endregion perKeyFun



// #region comPerFun

/**
 * comPerFun = Completed Period Function
 *
 * @summary
 * Has an item from picCadObj been COMPLETED within the current period?
 * picLogArr rows carry { pickerId, date (ISO), done }. Skips/rejects
 * don't count.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param picCadObj - Picker Cadence Object: The picker whose current
 *                    period is being checked.
 * @param picLogArr - Pick Log Array: The full pick log to search.
 * @param cheDatObj - Check Date Object: The date to resolve the current
 *                    period against, defaulting to right now.
 *
 * @returns Whether a done pick-log row for picCadObj exists dated on or
 * after the current period's own start. Always false for a daily
 * cadence, handled by a separate legacy path instead.
 *
 * @example
 * ```ts
 * comPerFun(picCadObj, picLogArr, cheDatObj) // => true or false
 * ```
 *
*/

function comPerFun( picCadObj, picLogArr, cheDatObj = new Date() ) {


	if ( ( picCadObj.cadence || 'daily' ) === 'daily' ) return false; // What: Daily Cadence Guard. Why: Daily pickers are handled entirely by a separate legacy path, not this period-based check. How: This returns false early whenever picCadObj's own (defaulted) cadence is 'daily'.



	const staIsoStr = perKeyFun( picCadObj, cheDatObj ); // What: Start Iso String. Why: A pick-log row's own date must be compared against the current period's start as a plain string. How: This calls perKeyFun once and reuses the result below.



	return ( picLogArr || [] ).some( ( curRowObj ) => curRowObj.pickerId === picCadObj.id && curRowObj.done && curRowObj.date >= staIsoStr ); // What: Completed Period Return. Why: The caller needs to know whether ANY matching row satisfies all 3 conditions at once. How: This searches picLogArr (or an empty array when missing) for a row matching picCadObj's own id, marked done, dated on or after staIsoStr.


}

// #endregion comPerFun



const DAY_FUL_ARR = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];       // What: Day Full Array. Why: sumCadFun's own weekly/monthly/yearly nth-weekday summaries need the full weekday name to display. How: This is indexed by anchorDow/nthWeekday throughout sumCadFun below.
const MON_SHO_ARR = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]; // What: Month Short Array. Why: sumCadFun's own yearly nth-weekday summary needs a short month name to display. How: This is indexed by anchorMonth (0-based) inside sumCadFun below.



// #region sumCadFun

/**
 * sumCadFun = Summary Cadence Function
 *
 * @summary
 * Short human label for a picker's cadence, for chips/summaries (e.g.
 * 'Weekly · Tuesday', 'Monthly · 3rd').
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param picCadObj - Picker Cadence Object: The picker whose cadence is
 *                    being summarized.
 *
 * @returns The short human summary string.
 *
 * @example
 * ```ts
 * sumCadFun(picCadObj) // => summary string
 * ```
 *
*/

function sumCadFun( picCadObj ) {


	const curCadStr = picCadObj.cadence || 'daily'; // What: Current Cadence String. Why: Every branch below needs picCadObj's own cadence, defaulted the same way every other function in this file defaults it. How: This reads picCadObj.cadence, falling back to 'daily' when missing.


	if ( curCadStr === 'daily' ) return 'Daily'; // What: Daily Case Return. Why: A daily cadence has no anchor to summarize at all. How: This returns the plain label unconditionally.



	if ( curCadStr === 'weekly' ) return 'Weekly · ' + DAY_FUL_ARR[ picCadObj.anchorDow ?? 0 ]; // What: Weekly Case Return. Why: A weekly cadence's own summary names its anchor weekday. How: This looks picCadObj's own anchorDow (defaulted to Sunday) up in DAY_FUL_ARR.



	if ( curCadStr === 'monthly' ) { // What: Monthly Case Check. Why: A monthly cadence's own summary branches on dateMode, a multi-line ternary unlike the other cadences' plain one-line returns. How: This branches into the nth-weekday-versus-plain-date summary below whenever curCadStr is 'monthly'.


		return picCadObj.dateMode === 'nthWeekday' // What: Monthly Case Return. Why: A monthly cadence summarizes differently depending on dateMode. How: This branches on picCadObj's own dateMode, naming either an nth-weekday or a plain day-of-month.
			? `Monthly · ${ ordSufFun( picCadObj.nthOrdinal ?? 1 ) } ${ DAY_FUL_ARR[ picCadObj.nthWeekday ?? 0 ] }`
			: 'Monthly · ' + ordSufFun( picCadObj.anchorDom ?? 1 );


	}


	if ( curCadStr === 'yearly' ) { // What: Yearly Case Check. Why: A yearly cadence's own summary needs one of two entirely different string shapes depending on dateMode, unlike the other cadences' plain one-line returns. How: This branches into the nth-weekday-versus-plain-date summary below whenever curCadStr is 'yearly'.


		if ( picCadObj.dateMode === 'nthWeekday' ) return `Yearly · ${ ordSufFun( picCadObj.nthOrdinal ?? 1 ) } ${ DAY_FUL_ARR[ picCadObj.nthWeekday ?? 0 ] } of ${ MON_SHO_ARR[ ( picCadObj.anchorMonth ?? 1 ) - 1 ] }`; // What: Yearly Nth-Weekday Case Return. Why: A yearly cadence in nth-weekday mode names its ordinal, weekday, and anchor month all at once. How: This builds the summary string from picCadObj's own nthOrdinal/nthWeekday/anchorMonth.



		return 'Yearly · ' + new Date( 2001, ( picCadObj.anchorMonth ?? 1 ) - 1, picCadObj.anchorDay ?? 1 ).toLocaleDateString( undefined, { month : 'short', day : 'numeric' } ); // What: Yearly Plain-Date Case Return. Why: A yearly cadence in plain-date mode names its anchor month and day via the locale's own short date formatting. How: This builds a throwaway Date (year 2001 is arbitrary) from picCadObj's own anchorMonth/anchorDay and formats it.


	}



	return 'Daily'; // What: Fallback Return. Why: An unrecognized cadence value has no defined summary, so this defaults to the same plain label as daily. How: This returns 'Daily' for any cadence not already handled above.


}

// #endregion sumCadFun



// #region ordSufFun

/**
 * ordSufFun = Ordinal Suffix Function
 *
 * @summary
 * Appends the correct English ordinal suffix to a number (1st, 2nd,
 * 3rd, 4th, 11th, 21st, ...).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param ordValNum - Ordinal Value Number: The number to suffix.
 *
 * @returns ordValNum followed by its correct ordinal suffix, as a
 * string.
 *
 * @example
 * ```ts
 * ordSufFun(ordValNum) // => '1st', '2nd', '3rd', '4th', ...
 * ```
 *
*/

function ordSufFun( ordValNum ) {


	const sufTexArr = [ 'th', 'st', 'nd', 'rd' ]; // What: Suffix Text Array. Why: Every English ordinal suffix boils down to one of just these 4 words. How: This is indexed below by lasTwoNum's own value.
	const lasTwoNum = ordValNum % 100;            // What: Last Two Number. Why: English ordinal suffixes are decided by a number's own last two digits (11th/12th/13th are the exception every other rule must respect). How: This is ordValNum modulo 100.



	return ordValNum + ( sufTexArr[ ( lasTwoNum - 20 ) % 10 ] || sufTexArr[ lasTwoNum ] || sufTexArr[ 0 ] ); // What: Ordinal Suffix Return. Why: The caller needs the full suffixed string back, not just the suffix. How: This picks sufTexArr's own entry for lasTwoNum minus 20 (handling 21st/22nd/23rd/31st/...), falling back to lasTwoNum directly (handling 11th/12th/13th), falling back to index 0 ('th') for everything else.


}

// #endregion ordSufFun



const tipMesFun = ( cadValStr, dayLabStr = 'Days' ) => { // What: Tip Message Function. Why: The "?" InfoTip on each cadence needs copy explaining how that cadence interacts with the Days control, and the control is named differently per surface. How: This switches on cadValStr (defaulted to 'daily'), interpolating dayLabStr into whichever message applies.


	switch ( cadValStr || 'daily' ) { // What: Cadence Tip Switch. Why: Each cadence needs its own tip copy explaining how it interacts with the Days control, defaulted to 'daily' the same way every other function in this file defaults a missing cadence. How: This branches on cadValStr, falling through the shared monthly/yearly warning and defaulting to a plain hint for daily.


		case 'weekly': // What: Weekly Case. Why: A weekly cadence force-selects its own anchor day in the days control below (see enfWeeFun), which the user needs to be warned about. How: This returns a WARNING explaining that lock.
			return `WARNING: The day you select here will be auto-selected in the ${ dayLabStr } control below and cannot be deselected.`;

		case 'monthly': // What: Monthly Case. Why: A monthly or yearly anchor landing on an excluded day is silently deferred rather than dropped, which the user needs to be warned about. How: This falls through to the shared 'yearly' return just below.
		case 'yearly' : // What: Yearly Case. Why: Same warning as monthly, since both cadences share this exact deferral behavior. How: This returns the shared WARNING message.
			return `WARNING: If the day that you select here falls on a day that is not selected in the ${ dayLabStr } control below, the picker will be deferred until the next eligible day.`;

		default: // What: Default Case. Why: A daily cadence has no anchor at all, so the days control is just a plain filter, not something that can conflict with it. How: This returns a plain HINT instead of a WARNING.
			return `HINT: You can select which days it will run using the ${ dayLabStr } control below.`;


	}


};



const locTipFun = ( dowValNum, souLabStr = 'How often?' ) => `Because you selected ${ DAY_FUL_ARR[ dowValNum ] || 'that day' } in the ${ souLabStr } control, this day cannot be turned off.`; // What: Locked Tip Function. Why: The tip shown when a user tries to turn off the locked weekly anchor day names both the day and the control that set it. How: This looks dowValNum up in DAY_FUL_ARR and interpolates it alongside souLabStr into the message.



// #region enfWeeFun

/**
 * enfWeeFun = Enforce Weekly Function
 *
 * @summary
 * Weekly cadence and daysOfWeek could otherwise contradict each other
 * (anchor Monday while Mondays are excluded means every run is
 * permanently deferred and every label is wrong). So a weekly picker's
 * own anchor day is always kept inside daysOfWeek.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param picCadObj - Picker Cadence Object: The picker-shaped object to
 *                    check.
 *
 * @returns The corrected daysOfWeek array (with the anchor day added
 * when it was missing), or the same array unchanged when nothing needs
 * adding.
 *
 * @example
 * ```ts
 * enfWeeFun(picCadObj) // => corrected daysOfWeek array
 * ```
 *
*/

function enfWeeFun( picCadObj ) {


	const dowSetArr = Array.isArray( picCadObj && picCadObj.daysOfWeek ) ? picCadObj.daysOfWeek : [ 0, 1, 2, 3, 4, 5, 6 ]; // What: Dow Set Array. Why: A missing or malformed daysOfWeek must still fall back to every day allowed. How: This keeps picCadObj's own daysOfWeek only when it's a real array, defaulting to all 7 days otherwise.


	if ( !picCadObj || ( picCadObj.cadence || 'daily' ) !== 'weekly' ) return dowSetArr; // What: Non-Weekly Guard. Why: This enforcement only applies to a weekly cadence at all. How: This returns dowSetArr unchanged when picCadObj is missing or not weekly.



	const ancDowNum = Number.isInteger( picCadObj.anchorDow ) ? picCadObj.anchorDow : null; // What: Anchor Dow Number. Why: The check below needs a real anchor day to compare against, not a possibly-missing one. How: This reads picCadObj's own anchorDow only when it's a real integer, null otherwise.


	if ( ancDowNum === null || dowSetArr.includes( ancDowNum ) ) return dowSetArr; // What: Already-Included Guard. Why: With no real anchor day, or one already inside dowSetArr, there is nothing to add. How: This returns dowSetArr unchanged in either case.



	return [ ...dowSetArr, ancDowNum ].sort( ( dowOneNum, dowTwoNum ) => dowOneNum - dowTwoNum ); // What: Corrected Return. Why: The anchor day must be added and the result kept in ascending weekday order. How: This appends ancDowNum to dowSetArr and sorts the result numerically.


}

// #endregion enfWeeFun



export const CAD_NAM_OBJ = { // What: Cadence Namespace Object. Why: store.jsx, tab-today.jsx, tab-picker.jsx, tab-data.jsx, tab-stats.jsx, day-log.jsx, and cadence-control.jsx all import this one namespace object rather than several individual named exports. How: This maps every one of this file's own internal implementations onto an external property name matching it exactly, swept everywhere at once so external and internal names never drift apart.


	CAD_STR_ARR : CAD_STR_ARR, // What: Cadence String Array. Why: Callers (a picker's own cadence dropdown) need the fixed list of valid cadence option values. How: This re-exports CAD_STR_ARR under its own matching name.
	comPerFun   : comPerFun,   // What: Completed Period Function. Why: Callers check whether a picker has already completed its own current period by this exact name. How: This re-exports comPerFun under its own matching name.
	dimCouFun   : dimCouFun,   // What: Days-In-Month Count Function. Why: Callers need a given year/month's own real day count by this exact name. How: This re-exports dimCouFun under its own matching name.
	enfWeeFun   : enfWeeFun,   // What: Enforce Weekly Function. Why: Callers need a weekly picker's own anchor day folded back into its selected days by this exact name. How: This re-exports enfWeeFun under its own matching name.
	forIsoFun   : forIsoFun,   // What: Format Iso Function. Why: Callers need a date's own ISO string by this exact name. How: This re-exports forIsoFun under its own matching name.
	isaAncFun   : isaAncFun,   // What: Is-An Anchor Function. Why: Callers check whether a given weekday is a weekly picker's own locked anchor by this exact name. How: This re-exports isaAncFun under its own matching name.
	isaCadFun   : isaCadFun,   // What: Is-A Cadence Function. Why: Callers validate an arbitrary string as a real cadence value by this exact name. How: This re-exports isaCadFun under its own matching name.
	locTipFun   : locTipFun,   // What: Locked Tip Function. Why: Callers need the explanatory tooltip text for a weekly cadence's own locked anchor day by this exact name. How: This re-exports locTipFun under its own matching name.
	norCadFun   : norCadFun,   // What: Normalize Cadence Function. Why: store.jsx calls this to fill in every cadence-related field a picker needs, defaulted consistently. How: This re-exports norCadFun under its own matching name.
	perKeyFun   : perKeyFun,   // What: Period Key Function. Why: Callers need a given date's own comparable period key by this exact name. How: This re-exports perKeyFun under its own matching name.
	perStaFun   : perStaFun,   // What: Period Start Function. Why: Callers need a given date's own period-start date by this exact name. How: This re-exports perStaFun under its own matching name.
	sumCadFun   : sumCadFun,   // What: Summary Cadence Function. Why: Callers need a picker's own human-readable cadence summary by this exact name. How: This re-exports sumCadFun under its own matching name.
	tipMesFun   : tipMesFun,   // What: Tip Message Function. Why: Callers need the explanatory tooltip text for a given cadence by this exact name. How: This re-exports tipMesFun under its own matching name.
	uniWorFun   : uniWorFun    // What: Unit Word Function. Why: Callers need a cadence's own human-readable unit word (day/week/month/year) by this exact name. How: This re-exports uniWorFun under its own matching name.


};


