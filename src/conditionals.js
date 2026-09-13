


/**
 * conditionals.js = Conditionals
 *
 * @summary
 * This is a single-slot per-day gate: a conditional resolves to
 * triggered (true) or not each day, and while triggered, every picker
 * that depends on it (via its own conditionalId field) skips for the
 * day entirely. This is suppress-only, there is no "run only when
 * true" direction. The picker that would otherwise run instead
 * surfaces a single day-off card (its own custom cardText), whose
 * completion drives the conditional's own reset or discharge.
 *
 * A conditional's own persisted shape: id, name, mode, cardText,
 * active (the enabled/disabled toggle, separate from triggered and
 * never touched by this file), triggered (the current resolved
 * boolean, persisted across days), value (the drift/charge state for
 * a value-family mode), oddsPct (the odds knob for a probability-
 * family mode), easeMin/easeMax (the per-day drift band a value-family
 * mode rolls its own cycle length from), threshold (the charge
 * ceiling, default 100), chargedToday (a guard so value advances at
 * most once per day), and chargeStep (the fixed step a value-family
 * mode's own current charge/discharge cycle has committed to, see
 * rolSteFun below). A dependent picker points back at its own gating
 * conditional via its own conditionalId field.
 *
 * Two timing families mirror pickers.js's own mode split. The
 * probability family (random, weighted) rolls triggered fresh at
 * generate time, with same-day effect: random is a fixed fifty
 * percent, weighted draws from oddsPct (ten to ninety percent, by
 * ten); its day-off card is purely informational, completing it
 * changes no conditional state at all. The value family (ease-up,
 * ease-down, dynamic) is completion-driven instead: value only
 * advances on the first completion of an item from a dependent picker
 * each day. Ease-up climbs value to threshold, which triggers on the
 * NEXT generate; completing its card resets it (value 0, triggered
 * false). Ease-down starts triggered (value at threshold), shows its
 * card daily, and each card completion discharges value by the ease
 * amount until it empties (triggered false); this is one-shot, since a
 * dependent then runs until its own first completion refills value
 * back to threshold. Dynamic rolls a coin flip at generate time like
 * weighted, but its own odds climb by ten points on every day's first
 * dependent completion (a miss makes tomorrow likelier); a completed
 * card resets it, same as ease-up.
 *
 * The exported CONDITIONALS namespace object's own property names
 * (isProbability, isValue, trueOdds, resolveForDay, suppresses,
 * advanceOnCompletion, cardComplete, clamp) are kept stable here even
 * though this file's internal implementation detail names below were
 * renamed, since that object is imported by name across store.jsx,
 * day-log.jsx, and tab-today.jsx.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const claValFun = ( curValNum, minValNum, maxValNum ) => Math.max( minValNum, Math.min( maxValNum, curValNum ) ); // What: Clamp Value Function. Why: Several value-family calculations below need a result kept within a hard [min, max] band, most often [0, threshold]. How: This nests Math.min/Math.max to floor curValNum at minValNum after first ceiling it at maxValNum.



const modProFun = ( modKeyStr ) => modKeyStr === 'random' || modKeyStr === 'weighted';                              // What: Mode Probability Function. Why: resDayFun below and the exported isProbability property both need to know whether a conditional's own mode rolls triggered fresh at generate time. How: This is true for exactly the two probability-family modes, random and weighted.
const modValFun = ( modKeyStr ) => modKeyStr === 'ease-up' || modKeyStr === 'ease-down' || modKeyStr === 'dynamic'; // What: Mode Value Function. Why: advValFun below and the exported isValue property both need to know whether a conditional's own mode is completion-driven instead of rolled. How: This is true for exactly the three value-family modes, ease-up, ease-down, and dynamic.



// #region truOddFun

/**
 * truOddFun = True Odds Function
 *
 * @summary
 * Odds that a probability/dynamic conditional resolves TRUE this run,
 * as a direct percentage. random = fixed 50%. weighted = oddsPct (10
 * to 90, by 10). dynamic = oddsPct + boost value (+10 per miss),
 * clamped to 100%.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param conCurObj - Conditional Current Object: The conditional to resolve
 *                    odds for.
 *
 * @returns A probability in [0, 1] that this conditional resolves
 * true this run.
 *
 * @example
 * ```ts
 * truOddFun(conCurObj) // => probability in [0, 1]
 * ```
 *
*/

function truOddFun( conCurObj ) {


	if ( conCurObj.mode === 'random' ) return 0.5; // What: Random Mode Guard. Why: A random-mode conditional always resolves at a fixed fifty percent, with no oddsPct or value involved at all. How: This returns 0.5 immediately when conCurObj's own mode is 'random'.


	const basPctNum = conCurObj.oddsPct ?? 50;                                                         // What: Base Percentage Number. Why: Every non-random mode starts from the conditional's own configured odds, defaulting to 50 for a legacy conditional with none. How: This reads conCurObj.oddsPct, falling back to 50 when it is nullish.
	const finPctNum = conCurObj.mode === 'dynamic' ? basPctNum + ( conCurObj.value || 0 ) : basPctNum; // What: Final Percentage Number. Why: A dynamic-mode conditional's own odds climb by its own accrued value (a miss boost), while every other mode stays at its base. How: This adds conCurObj.value on top of basPctNum only when conCurObj's own mode is 'dynamic'.



	return claValFun( finPctNum, 0, 100 ) / 100; // What: True Odds Return. Why: The caller needs a plain [0, 1] probability, not a raw (and possibly out-of-range) percentage. How: This clamps finPctNum to [0, 100] via claValFun, then divides the result by 100.


}

// #endregion truOddFun



// #region resDayFun

/**
 * resDayFun = Resolve Day Function
 *
 * @summary
 * Phase A of generate: resolves the day's own triggered state for
 * every conditional. Probability and dynamic modes roll fresh now
 * (dynamic's own odds already include its accrued value); ease-up and
 * ease-down instead carry forward whatever triggered state their own
 * last completion left behind, with the actual effect deferred to
 * this next generate. Also clears every conditional's own per-day
 * charge guard. A conditional's own active field (enabled or not) is
 * separate and is never touched here.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param conAllArr - Conditional All Array: Every persisted conditional to
 *                    resolve for the day, in no particular order; a missing or
 *                    empty array yields an empty patch.
 *
 * @returns A patch object keyed by conditional id, each value holding
 * the fields (triggered, chargedToday) to apply to that conditional
 * before today's picker gating runs.
 * @see {@link patIdeObj}
 *
 * @example
 * ```ts
 * resDayFun(conAllArr) // => patch object keyed by conditional id
 * ```
 *
*/

function resDayFun( conAllArr ) {


	const patIdeObj = {}; // What: Patch Identifier Object. Why: This collects every conditional's own resolved-for-today patch, to apply before this generate's own picker gating runs. How: This starts empty and is written to once per conditional in the loop below.


	for ( const conCurObj of conAllArr || [] ) { // What: Conditional Walk Loop. Why: Every persisted conditional needs its own triggered state resolved for today, independently of every other one. How: This iterates conAllArr, falling back to an empty array when none was given.


		if ( conCurObj.active === false ) { // What: Inactive Guard. Why: A disabled conditional is frozen entirely, with no roll and no state change of any kind. How: This writes only the charge-guard reset for conCurObj, then skips straight to the next conditional.


			patIdeObj[ conCurObj.id ] = { chargedToday : false }; // What: Frozen Patch Write. Why: An inactive conditional still needs its own per-day charge guard cleared, even though nothing else about it changes. How: This writes just chargedToday:false under conCurObj's own id.
			continue; // What: Next Conditional Continue. Why: An inactive conditional has nothing further to resolve this iteration. How: This skips the rest of the loop body, moving on to the next conCurObj.


		}


		let triValBoo = conCurObj.triggered; // What: Triggered Value Boolean. Why: Ease-up and ease-down carry their own persisted triggered state forward unchanged, so this starts from it before the roll below may overwrite it. How: This reads conCurObj's own current triggered field.

		if ( conCurObj.mode === 'random' || conCurObj.mode === 'weighted' || conCurObj.mode === 'dynamic' ) triValBoo = Math.random() < truOddFun( conCurObj ); // What: Probability Roll Check. Why: These three modes resolve triggered fresh every day, rather than carrying yesterday's value forward. How: This rolls a fresh random draw against truOddFun's own odds for conCurObj, replacing triValBoo when conCurObj's own mode calls for it.


		patIdeObj[ conCurObj.id ] = { triggered : triValBoo, chargedToday : false }; // What: Resolved Patch Write. Why: This conditional's own resolved-for-today state must be recorded under its own id, alongside the usual per-day charge-guard reset. How: This writes triValBoo and a cleared chargedToday under conCurObj's own id.


	}



	return patIdeObj; // What: Patch Identifier Return. Why: The caller needs every conditional's own resolved-for-today patch, keyed by id, to apply before gating. How: This returns the same object written to throughout the loop above.


}

// #endregion resDayFun



// #region supGatFun

/**
 * supGatFun = Suppress Gate Function
 *
 * @summary
 * A dependent picker is suppressed today if and only if its own
 * conditional is enabled (active, since a disabled one never
 * suppresses) AND currently triggered.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param conCurObj - Conditional Current Object: The conditional to check, or
 *                    a nullish value (checked defensively, since a picker's
 *                    own conditionalId may not resolve to a live conditional
 *                    at all).
 *
 * @returns True when conCurObj currently suppresses its own dependent
 * pickers, false otherwise.
 *
 * @example
 * ```ts
 * supGatFun(conCurObj) // => true or false
 * ```
 *
*/

function supGatFun( conCurObj ) { return !!( conCurObj && conCurObj.active !== false && conCurObj.triggered ); } // What: Suppress Gate Body. Why: The caller needs one single boolean covering both the enabled check and the triggered check at once. How: This combines both conditions with &&, wrapped in !! so a nullish conCurObj resolves to a real false rather than undefined.

// #endregion supGatFun



// #region rolSteFun

/**
 * rolSteFun = Roll Step Function
 *
 * @summary
 * Rolls a TARGET number of charge/discharge cycles uniformly within
 * the conditional's own [soonest, latest] day range (derived from
 * easeMin/easeMax the same way the picker editor's own Soonest/Latest
 * labels are, threshold/easeMax and threshold/easeMin), then returns
 * a FIXED step (threshold/N) sized so the cycle resolves in exactly N
 * cycles, giving every duration in the range equal odds. This mirrors
 * pickers.js's own decay-step roll exactly (see its own comment for
 * why a fresh random step every cycle, the previous approach here, is
 * biased: duration = threshold/step, so a uniform step does NOT give
 * a uniform duration). The caller (steResFun below) is the one that
 * actually persists the rolled step across cycles; a legacy
 * conditional with none lazily rolls one here instead.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param conCurObj - Conditional Current Object: The value-mode conditional to
 *                    roll a fresh plan for.
 * @param thrValNum - Threshold Value Number: The conditional's own resolved
 *                    charge ceiling (defaulted to 100 by every caller).
 *
 * @returns The fixed per-cycle charge/discharge step this new plan
 * commits to.
 *
 * @example
 * ```ts
 * rolSteFun(conCurObj, thrValNum) // => fixed per-cycle step
 * ```
 *
*/

function rolSteFun( conCurObj, thrValNum ) {


	const sooCycNum = Math.max( 1, Math.round( thrValNum / ( conCurObj.easeMax ?? 14 ) ) );
	const latCycNum = Math.max( sooCycNum, Math.round( thrValNum / ( conCurObj.easeMin ?? 7 ) ) );
	const tarCycNum = sooCycNum + Math.floor( Math.random() * ( latCycNum - sooCycNum + 1 ) );



	return thrValNum / tarCycNum; // What: Roll Step Return. Why: The caller needs a single fixed step that resolves the just-rolled tarCycNum cycles exactly. How: This divides thrValNum by tarCycNum.


}

// #endregion rolSteFun



const steResFun = ( conCurObj, thrValNum ) => ( conCurObj.chargeStep && conCurObj.chargeStep > 0 ? conCurObj.chargeStep : rolSteFun( conCurObj, thrValNum ) ); // What: Step Resolve Function. Why: A value-mode conditional mid-cycle must keep using its own already-rolled step, while a legacy one with none (or a just-started cycle) needs a fresh roll. How: This returns conCurObj's own chargeStep when it is a real positive number, calling rolSteFun otherwise.



// #region advValFun

/**
 * advValFun = Advance Value Function
 *
 * @summary
 * First-dependent-completion charge step, value-family modes only.
 * Advances a conditional's own value at most once per day. Handles
 * ease-down's own one-shot refill after it has fully discharged: a
 * new streak starts there, so a fresh plan is rolled the same way a
 * newly-chosen picker item rolls its own fresh decay plan.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param conCurObj - Conditional Current Object: The dependent picker's own
 *                    gating conditional whose first completion of the day is
 *                    being applied.
 *
 * @returns A patch object with whichever of value/triggered/
 * chargedToday/chargeStep actually changed, or null when conCurObj is
 * missing, disabled, not a value-family mode, or already charged
 * today.
 *
 * @example
 * ```ts
 * advValFun(conCurObj) // => patch object or null
 * ```
 *
*/

function advValFun( conCurObj ) {


	if ( !conCurObj || conCurObj.active === false || !modValFun( conCurObj.mode ) ) return null; // What: Ineligible Guard. Why: There is nothing to advance for a missing conditional, a disabled one, or a probability-family one, which never charges at all. How: This returns null immediately when any of those three hold.

	if ( conCurObj.chargedToday ) return null; // What: Already Charged Guard. Why: Value only advances once per day, no matter how many dependent completions happen after the first. How: This returns null immediately when conCurObj's own chargedToday guard is already set.


	const thrValNum = conCurObj.threshold ?? 100; // What: Threshold Value Number. Why: Every branch below needs the same resolved charge ceiling, defaulting to 100 for a legacy conditional with none. How: This reads conCurObj.threshold, falling back to 100 when it is nullish.


	if ( conCurObj.mode === 'ease-up' ) {


		const steValNum = steResFun( conCurObj, thrValNum );
		const newValNum = claValFun( ( conCurObj.value || 0 ) + steValNum, 0, thrValNum );



		return {


			value        : newValNum,              // What: Value. Why: This completion's own newly-advanced charge must land in the returned patch. How: This carries newValNum through unchanged.
			triggered    : newValNum >= thrValNum, // What: Triggered. Why: The conditional fires the moment its charge actually reaches thrValNum. How: This compares newValNum against thrValNum directly.
			chargedToday : true,                   // What: Charged Today. Why: This completion must not also charge this same conditional again later today. How: This is fixed true whenever this branch runs at all.
			chargeStep   : steValNum               // What: Charge Step. Why: The already-rolled plan for this streak must carry forward unchanged. How: This carries steValNum through unchanged.


		};


	}


	if ( conCurObj.mode === 'dynamic' ) return { // What: Dynamic Miss Accrual Return. Why: A dynamic conditional's own odds should climb after a completion that means today's roll did not fire. How: This adds a fixed 10 percentage points onto conCurObj's own value.


		value        : ( conCurObj.value || 0 ) + 10, // What: Value. Why: A dynamic conditional's own odds climb by a fixed amount after a miss. How: This adds 10 onto conCurObj's own current value, defaulting a missing value to 0 first.
		chargedToday : true                           // What: Charged Today. Why: This completion must not also charge this same conditional again later today. How: This is fixed true whenever this branch runs at all.


	};


	if ( conCurObj.mode === 'ease-down' ) {


		if ( !conCurObj.triggered ) return { value : thrValNum, triggered : true, chargedToday : true, chargeStep : rolSteFun( conCurObj, thrValNum ) }; // What: One-Shot Refill Guard. Why: A fully-discharged ease-down conditional starts a brand new streak on its own next dependent completion, which must roll a fresh plan rather than reuse the just-finished one. How: This re-arms conCurObj at full charge only when it is not currently triggered.



		return { chargedToday : true }; // What: Mid-Streak Charge Return. Why: A still-triggered ease-down conditional has nothing left to advance from this particular completion; only its own charge guard needs setting. How: This patches just chargedToday:true, leaving value/triggered untouched.


	}



	return null; // What: Default Return. Why: Every value-family mode is already handled above, so this only fires for an unrecognized mode, which has nothing defined to advance. How: This is the function's own final fallback.


}

// #endregion advValFun



// #region carComFun

/**
 * carComFun = Card Complete Function
 *
 * @summary
 * Day-off card completion. Drives a reset for ease-up and dynamic, or
 * a discharge step for ease-down. A probability-family mode's own
 * card is purely informational, so it changes no state at all.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param conCurObj - Conditional Current Object: The conditional whose own
 *                    day-off card was just completed.
 *
 * @returns A patch object with whichever of value/triggered/
 * chargeStep actually changed, or null for a missing conCurObj or a
 * probability-family mode.
 *
 * @example
 * ```ts
 * carComFun(conCurObj) // => patch object or null
 * ```
 *
*/

function carComFun( conCurObj ) {


	if ( !conCurObj ) return null; // What: No Conditional Guard. Why: There is nothing to reset or discharge for a conditional that does not exist. How: This returns null immediately when conCurObj is nullish.


	const thrValNum = conCurObj.threshold ?? 100; // What: Threshold Value Number. Why: Every branch below needs the same resolved charge ceiling, defaulting to 100 for a legacy conditional with none. How: This reads conCurObj.threshold, falling back to 100 when it is nullish.


	if ( conCurObj.mode === 'ease-up' ) return { value : 0, triggered : false, chargeStep : rolSteFun( conCurObj, thrValNum ) }; // What: Ease Up Reset Return. Why: Completing the card both resets this cycle and rolls a fresh plan for the next one, mirroring pickers.js's own reset-on-pick behavior. How: This zeroes value, clears triggered, and rolls a brand new chargeStep via rolSteFun.

	if ( conCurObj.mode === 'dynamic' ) return { value : 0, triggered : false }; // What: Dynamic Reset Return. Why: Completing the card means the fired day-off was actually handled, so the miss-accrual value resets for the next cycle. How: This zeroes value and clears triggered.

	if ( conCurObj.mode === 'ease-down' ) {


		const steValNum = steResFun( conCurObj, thrValNum );
		const newValNum = claValFun( ( conCurObj.value ?? thrValNum ) - steValNum, 0, thrValNum );



		return {


			value      : newValNum,     // What: Value. Why: This completion's own newly-discharged value must land in the returned patch. How: This carries newValNum through unchanged.
			triggered  : newValNum > 0, // What: Triggered. Why: This streak stays triggered only while it hasn't fully discharged to 0 yet. How: This compares newValNum against 0 directly.
			chargeStep : steValNum      // What: Charge Step. Why: The already-rolled plan for this streak must carry forward unchanged. How: This carries steValNum through unchanged.


		};


	}



	return null; // What: Default Return. Why: Every non-probability mode is already handled above, so this only fires for a probability-family mode (purely informational) or an unrecognized one. How: This is the function's own final fallback.


}

// #endregion carComFun



export const CONDITIONALS = { // What: Conditionals Namespace Object. Why: This is the single public entry point store.jsx, day-log.jsx, and tab-today.jsx all import, kept stable in shape even though the implementation names behind each property were renamed. How: This maps each of this file's own internal function names onto the exact public property names those callers already call.


	isProbability       : modProFun, // What: Is Probability. Why: day-log.jsx checks this to classify a conditional's own mode for display. How: This exposes modProFun under the property name every caller already imports.
	isValue             : modValFun, // What: Is Value. Why: day-log.jsx and store.jsx both check this to classify a conditional's own mode. How: This exposes modValFun under the property name every caller already imports.
	trueOdds            : truOddFun, // What: True Odds. Why: Nothing outside this file currently reads this directly, but it stays exported as part of CONDITIONALS' own stable public shape. How: This exposes truOddFun under the property name every caller already imports.
	resolveForDay       : resDayFun, // What: Resolve For Day. Why: store.jsx calls this once per generate to roll/carry every conditional's own triggered state for the day. How: This exposes resDayFun under the property name every caller already imports.
	suppresses          : supGatFun, // What: Suppresses. Why: tab-today.jsx calls this to decide whether a dependent picker's own day-off card should show instead of a real pick. How: This exposes supGatFun under the property name every caller already imports.
	advanceOnCompletion : advValFun, // What: Advance On Completion. Why: store.jsx calls this on a dependent picker's own first completion of the day. How: This exposes advValFun under the property name every caller already imports.
	cardComplete        : carComFun, // What: Card Complete. Why: store.jsx calls this when a day-off card itself is completed. How: This exposes carComFun under the property name every caller already imports.
	clamp               : claValFun  // What: Clamp. Why: Nothing outside this file currently reads this directly, but it stays exported as part of CONDITIONALS' own stable public shape. How: This exposes claValFun under the property name every caller already imports.


};



