


// #region Imports

import { PIC_NAM_OBJ } from './pickers.ts'; // What: Pickers Namespace Object. Why: A conditional falls back to the pickers' shared full-charge ceiling and default drift band. How: This reads its THR_VAL_NUM and DEF_EAS_OBJ.


import type { ConRcdTyp } from './data-model.ts'; // What: Conditional Record Type. Why: The conditional functions here read a saved conditional or return a partial update to one. How: This types those parameters and patches.

// #endregion Imports



/**
 * conditionals.ts = Conditionals
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
 * ceiling, default THR_VAL_NUM), chargedToday (a guard so value advances at
 * most once per day), and chargeStep (the fixed step a value-family
 * mode's own current charge/discharge cycle has committed to, see
 * rolSteFun below). A dependent picker points back at its own gating
 * conditional via its own conditionalId field.
 *
 * Two timing families mirror pickers.ts's own mode split. The
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
 * The exported CON_NAM_OBJ namespace object's property names match the names
 * of the internal implementations they map to.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const DEF_ODD_NUM = 50; // What: Default Odds Number. Why: A weighted or dynamic conditional saved without its own odds, and a brand-new draft, both need one shared starting value. How: This is the odds percentage every oddsPct fallback reads.

// #endregion Constants



// #region Helpers

// #region claValFun

/**
 * claValFun = Clamp Value Function
 *
 * @summary
 * Keeps a number inside a [min, max] band: a value below the minimum returns
 * the minimum and one above the maximum returns the maximum.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curValNum - Current Value Number: The number to clamp.
 * @param minValNum - Minimum Value Number: The band's lower bound.
 * @param maxValNum - Maximum Value Number: The band's upper bound.
 *
 * @returns The clamped number.
 *
 * @example
 * ```ts
 * claValFun(120, 0, 100) // => 100
 * ```
 *
*/

const claValFun = ( curValNum : number, minValNum : number, maxValNum : number ) => Math.max( minValNum, Math.min( maxValNum, curValNum ) ); // What: Clamp Value Function. Why: Several value-family calculations below need a result kept within a hard [min, max] band, most often [0, threshold]. How: This nests Math.min/Math.max to floor curValNum at minValNum after first ceiling it at maxValNum.

// #endregion claValFun



// #region Mode Classification

const modProFun = ( modKeyStr : string ) => modKeyStr === 'random' || modKeyStr === 'weighted'; // What: Mode Probability Function. Why: resDayFun below needs to tell the probability-family modes, which roll triggered fresh at generate time, from the others. How: This is true for exactly the two probability-family modes, random and weighted.



// #region modValFun

/**
 * modValFun = Mode Value Function
 *
 * @summary
 * Whether a conditional's mode belongs to the value family (ease-up,
 * ease-down, dynamic), whose state advances on dependent completions,
 * rather than the probability family (random, weighted), which rolls
 * fresh each generate.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param modKeyStr - Mode Key String: The conditional's own mode value.
 *
 * @returns Whether modKeyStr is a value-family mode.
 *
 * @example
 * ```ts
 * modValFun('ease-up') // => true
 * ```
 *
*/

const modValFun = ( modKeyStr : string | undefined ) : boolean => !!modKeyStr && [ 'dynamic', 'ease-down', 'ease-up' ].includes( modKeyStr ); // What: Mode Value Function. Why: Callers need to know whether a conditional's own mode is completion-driven instead of rolled. How: This is true for exactly the three value-family modes, ease-up, ease-down, and dynamic.

// #endregion modValFun

// #endregion Mode Classification



// #region Day Resolution

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
 * @returns True when conCurObj currently suppresses its own dependent pickers,
 *          false otherwise.
 *
 * @example
 * ```ts
 * supGatFun(conCurObj) // => true or false
 * ```
 *
*/

function supGatFun ( conCurObj : ConRcdTyp | null | undefined ) : boolean { return !!( conCurObj && conCurObj.active !== false && conCurObj.triggered ); } // What: Suppress Gate Body. Why: The caller needs one single boolean covering both the enabled check and the triggered check at once. How: This combines both conditions with &&, wrapped in !! so a nullish conCurObj resolves to a real false rather than undefined.

// #endregion supGatFun



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
 * @returns A probability in [0, 1] that this conditional resolves true this
 *          run.
 *
 * @example
 * ```ts
 * truOddFun(conCurObj) // => probability in [0, 1]
 * ```
 *
*/

function truOddFun ( conCurObj : ConRcdTyp ) : number {


	if ( conCurObj.mode === 'random' ) return 0.5; // What: Random Mode Guard. Why: A random-mode conditional always resolves at a fixed fifty percent, with no oddsPct or value involved at all. How: This returns 0.5 immediately when conCurObj's own mode is 'random'.



	const basPerNum = conCurObj.oddsPct ?? DEF_ODD_NUM;                                                // What: Base Percentage Number. Why: Every non-random mode starts from the conditional's own configured odds, defaulting to DEF_ODD_NUM for a legacy conditional with none. How: This reads conCurObj.oddsPct, falling back to DEF_ODD_NUM when it is nullish.
	const finPerNum = conCurObj.mode === 'dynamic' ? basPerNum + ( conCurObj.value || 0 ) : basPerNum; // What: Final Percentage Number. Why: A dynamic-mode conditional's own odds climb by its own accrued value (a miss boost), while every other mode stays at its base. How: This adds conCurObj.value on top of basPerNum only when conCurObj's own mode is 'dynamic'.



	return claValFun( finPerNum, 0, 100 ) / 100; // What: True Odds Return. Why: The caller needs a plain [0, 1] probability, not a raw (and possibly out-of-range) percentage. How: This clamps finPerNum to [0, 100] via claValFun, then divides the result by 100.


}

// #endregion truOddFun



// #region resDayFun

/**
 * resDayFun = Resolve Day Function
 *
 * @summary
 * Phase A of generate: resolves the day's own triggered state for every active
 * conditional, leaving an inactive one's as it was. Probability and dynamic
 * modes roll fresh now (dynamic's own odds already include its accrued value);
 * ease-up and ease-down instead carry forward whatever triggered state their
 * own last completion left behind, with the actual effect deferred to this
 * next generate. Also clears every conditional's own per-day charge guard. A
 * conditional's own active field (enabled or not) is separate and is never
 * touched here.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param conAllArr - Conditional All Array: Every persisted conditional to
 *                    resolve for the day, in no particular order; a missing or
 *                    empty array yields an empty patch.
 *
 * @returns A patch object keyed by conditional id, each value holding the
 *          fields (triggered, chargedToday) to apply to that conditional
 *          before today's picker gating runs.
 * @see {@link patIdeObj}
 *
 * @example
 * ```ts
 * resDayFun(conAllArr) // => patch object keyed by conditional id
 * ```
 *
*/

function resDayFun ( conAllArr : ConRcdTyp[] | null | undefined ) : Record< string, Partial< ConRcdTyp > > {


	const patIdeObj : Record< string, Partial< ConRcdTyp > > = {}; // What: Patch Identifier Object. Why: This collects every conditional's own resolved-for-today patch, to apply before this generate's own picker gating runs. How: This starts empty and is written to once per conditional in the loop below.


	for ( const conCurObj of conAllArr || [] ) { // What: Conditional Walk Loop. Why: Every persisted conditional needs its own triggered state resolved for today, independently of every other one. How: This iterates conAllArr, falling back to an empty array when none was given.


		if ( conCurObj.active === false ) { // What: Inactive Guard. Why: A disabled conditional is frozen, with no roll and no change to its triggered state. How: This writes only the charge-guard reset for conCurObj, then skips straight to the next conditional.


			patIdeObj[ conCurObj.id ] = { chargedToday : false }; // What: Frozen Patch Write. Why: An inactive conditional still needs its own per-day charge guard cleared, even though nothing else about it changes. How: This writes just chargedToday:false under conCurObj's own id.



			continue; // What: Next Conditional Continue. Why: An inactive conditional has nothing further to resolve this iteration. How: This skips the rest of the loop body, moving on to the next conCurObj.


		}



		let trgValBoo = conCurObj.triggered; // What: Triggered Value Boolean. Why: Ease-up and ease-down carry their own persisted triggered state forward unchanged, so this starts from it before the roll below may overwrite it. How: This reads conCurObj's own current triggered field.


		if ( modProFun( conCurObj.mode ) || conCurObj.mode === 'dynamic' ) trgValBoo = Math.random() < truOddFun( conCurObj ); // What: Probability Roll Check. Why: These three modes resolve triggered fresh every day, rather than carrying yesterday's value forward. How: This rolls a fresh random draw against truOddFun's own odds for conCurObj, replacing trgValBoo when conCurObj's own mode calls for it.



		patIdeObj[ conCurObj.id ] = { chargedToday : false, triggered : trgValBoo }; // What: Resolved Patch Write. Why: This conditional's own resolved-for-today state must be recorded under its own id, alongside the usual per-day charge-guard reset. How: This writes a cleared chargedToday and trgValBoo under conCurObj's own id.


	}



	return patIdeObj; // What: Patch Identifier Return. Why: The caller needs every conditional's own resolved-for-today patch, keyed by id, to apply before gating. How: This returns the same object written to throughout the loop above.


}

// #endregion resDayFun

// #endregion Day Resolution



// #region Value Charging

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
 * pickers.ts's own decay-step roll (see its own comment for
 * why a fresh random step every cycle, the previous approach here, is
 * biased: duration = threshold/step, so a uniform step does NOT give
 * a uniform duration). steResFun below keeps reusing a step already
 * rolled; a legacy conditional with none rolls one here instead.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param conCurObj - Conditional Current Object: The value-mode conditional to
 *                    roll a fresh plan for.
 * @param thrValNum - Threshold Value Number: The conditional's own resolved
 *                    charge ceiling.
 *
 * @returns The fixed per-cycle charge/discharge step this new plan commits to.
 *
 * @example
 * ```ts
 * rolSteFun(conCurObj, thrValNum) // => fixed per-cycle step
 * ```
 *
*/

function rolSteFun ( conCurObj : ConRcdTyp, thrValNum : number ) : number {


	const sooCycNum = Math.max( 1, Math.round( thrValNum / ( conCurObj.easeMax ?? PIC_NAM_OBJ.DEF_EAS_OBJ.easeMax ) ) );         // What: Soonest Cycle Number. Why: The target cycle count must be rolled no sooner than the fastest possible cycle length, derived from easeMax the same way threshold/easeMax already bounds the fastest duration. How: This divides thrValNum by conCurObj's own easeMax (defaulted to the pickers' default band's), rounded and floored at 1 cycle via Math.max.
	const latCycNum = Math.max( sooCycNum, Math.round( thrValNum / ( conCurObj.easeMin ?? PIC_NAM_OBJ.DEF_EAS_OBJ.easeMin ) ) ); // What: Latest Cycle Number. Why: The target cycle count also needs its own slowest bound, derived from easeMin the same way threshold/easeMin already bounds the slowest duration, and must never resolve below sooCycNum. How: This divides thrValNum by conCurObj's own easeMin (defaulted to the pickers' default band's), rounded, then floored at sooCycNum via Math.max.
	const tarCycNum = sooCycNum + Math.floor( Math.random() * ( latCycNum - sooCycNum + 1 ) );                                   // What: Target Cycle Number. Why: Every cycle length within [sooCycNum, latCycNum] must have equal odds, which is what actually avoids the duration bias this function's own summary describes. How: This adds sooCycNum to a random integer offset within the inclusive range.



	return thrValNum / tarCycNum; // What: Roll Step Return. Why: The caller needs a single fixed step that resolves the just-rolled tarCycNum cycles exactly. How: This divides thrValNum by tarCycNum.


}

// #endregion rolSteFun



// #region steResFun

/**
 * steResFun = Step Resolve Function
 *
 * @summary
 * Resolves the fixed charge step a value-mode conditional uses: its own saved
 * chargeStep when it is a positive number, a freshly rolled one otherwise.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param conCurObj - Conditional Current Object: The value-mode conditional to
 *                    resolve a step for.
 * @param thrValNum - Threshold Value Number: The conditional's own resolved
 *                    charge ceiling.
 *
 * @returns The fixed per-cycle charge/discharge step.
 *
 * @example
 * ```ts
 * steResFun(conCurObj, thrValNum) // => 12
 * ```
 *
*/

const steResFun = ( conCurObj : ConRcdTyp, thrValNum : number ) => ( conCurObj.chargeStep && conCurObj.chargeStep > 0 ? conCurObj.chargeStep : rolSteFun( conCurObj, thrValNum ) ); // What: Step Resolve Function. Why: A value-mode conditional mid-cycle must keep using its own already-rolled step, while a legacy one with none (or a just-started cycle) needs a fresh roll. How: This returns conCurObj's own chargeStep when it is a real positive number, calling rolSteFun otherwise.

// #endregion steResFun



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
 *          chargedToday/chargeStep actually changed, or null when conCurObj is
 *          missing, disabled, not a value-family mode, or already charged
 *          today.
 *
 * @example
 * ```ts
 * advValFun(conCurObj) // => patch object or null
 * ```
 *
*/

function advValFun ( conCurObj : ConRcdTyp | null | undefined ) : Partial< ConRcdTyp > | null {


	const misConBoo = !conCurObj;                    // What: Missing Conditional Boolean. Why: There is nothing to advance for a conditional that doesn't exist. How: This is true when conCurObj is nullish.
	const disConBoo = conCurObj?.active === false;   // What: Disabled Conditional Boolean. Why: A disabled conditional is frozen and never charges. How: This reads conCurObj's own active flag, safely skipping a nullish conCurObj.
	const nonValBoo = !modValFun( conCurObj?.mode ); // What: Non Value Boolean. Why: A probability-family conditional never charges at all. How: This negates modValFun for conCurObj's own mode, safely skipping a nullish conCurObj.

	const ineConBoo = misConBoo || disConBoo || nonValBoo; // What: Ineligible Conditional Boolean. Why: The guard below needs one answer for whether this conditional can advance at all. How: This combines the three checks above with ||.


	if ( ineConBoo ) return null; // What: Ineligible Guard. Why: There is nothing to advance for a missing conditional, a disabled one, or a probability-family one. How: This returns null immediately when ineConBoo holds.



	if ( conCurObj.chargedToday ) return null; // What: Already Charged Guard. Why: Value only advances once per day, no matter how many dependent completions happen after the first. How: This returns null immediately when conCurObj's own chargedToday guard is already set.



	const thrValNum = conCurObj.threshold ?? PIC_NAM_OBJ.THR_VAL_NUM; // What: Threshold Value Number. Why: The ease-up and ease-down branches below need the same resolved charge ceiling, defaulting to the shared full-charge ceiling for a legacy conditional with none. How: This reads conCurObj.threshold, falling back to PIC_NAM_OBJ.THR_VAL_NUM when it is nullish.


	if ( conCurObj.mode === 'ease-up' ) { // What: Ease Up Mode Check. Why: An ease-up conditional's own advance needs a charge roll before it can build its patch, unlike dynamic's fixed 10-point accrual just below. How: This branches into the charge roll and patch object below whenever conCurObj's own mode is 'ease-up'.


		const steValNum = steResFun( conCurObj, thrValNum );                               // What: Step Value Number. Why: This completion's own advance needs the conditional's already-rolled (or freshly-rolled) fixed step before it can compute a new charge. How: This calls steResFun with conCurObj and thrValNum.
		const newValNum = claValFun( ( conCurObj.value || 0 ) + steValNum, 0, thrValNum ); // What: New Value Number. Why: The advanced charge must be clamped to [0, thrValNum] so it never over- or under-shoots. How: This adds steValNum onto conCurObj's own current value (defaulting a missing one to 0) and clamps the result via claValFun.



		return { // What: Ease Up Advance Return. Why: The caller needs this completion's own resolved charge, triggered state, and rolled step all landing together as one patch. How: This builds that patch from newValNum, thrValNum, and steValNum.


			chargedToday : true,                   // What: Charged Today. Why: This completion must not also charge this same conditional again later today. How: This is fixed true whenever this branch runs at all.
			chargeStep   : steValNum,              // What: Charge Step. Why: The already-rolled plan for this streak must carry forward unchanged. How: This carries steValNum through unchanged.
			triggered    : newValNum >= thrValNum, // What: Triggered. Why: The conditional fires the moment its charge actually reaches thrValNum. How: This compares newValNum against thrValNum directly.
			value        : newValNum               // What: Value. Why: This completion's own newly-advanced charge must land in the returned patch. How: This carries newValNum through unchanged.


		};


	}



	if ( conCurObj.mode === 'dynamic' ) return { // What: Dynamic Miss Accrual Return. Why: A dynamic conditional's own odds should climb after a completion that means today's roll did not fire. How: This adds a fixed 10 percentage points onto conCurObj's own value.


		chargedToday : true,                         // What: Charged Today. Why: This completion must not also charge this same conditional again later today. How: This is fixed true whenever this branch runs at all.
		value        : ( conCurObj.value || 0 ) + 10 // What: Value. Why: A dynamic conditional's own odds climb by a fixed amount after a miss. How: This adds 10 onto conCurObj's own current value, defaulting a missing value to 0 first.


	};



	if ( conCurObj.mode === 'ease-down' ) { // What: Ease Down Mode Check. Why: An ease-down conditional's own advance branches between a one-shot refill and an ordinary charge-guard patch, unlike the other modes' single return each. How: This branches into the refill guard and mid-streak return below whenever conCurObj's own mode is 'ease-down'.


		if ( !conCurObj.triggered ) return { // What: One-Shot Refill Guard. Why: A fully-discharged ease-down conditional starts a brand new streak on its own next dependent completion, which must roll a fresh plan rather than reuse the just-finished one. How: This re-arms conCurObj at full charge only when it is not currently triggered.


			chargedToday : true,                              // What: Charged Today. Why: This completion must not also charge this same conditional again later today. How: This is fixed true whenever this branch runs at all.
			chargeStep   : rolSteFun( conCurObj, thrValNum ), // What: Charge Step. Why: A brand new streak needs its own freshly rolled plan. How: This calls rolSteFun for conCurObj and thrValNum.
			triggered    : true,                              // What: Triggered. Why: A refilled ease-down conditional starts triggered again. How: This is fixed true on a refill.
			value        : thrValNum                          // What: Value. Why: A refill starts back at full charge. How: This is thrValNum itself.


		};



		return { chargedToday : true }; // What: Mid-Streak Charge Return. Why: A still-triggered ease-down conditional has nothing left to advance from this particular completion; only its own charge guard needs setting. How: This patches just chargedToday:true, leaving value/triggered untouched.


	}



	return null; // What: Default Return. Why: Every value-family mode is already handled above, so this line is only a type-level fallback. How: This is the function's own final fallback.


}

// #endregion advValFun



// #region carFulFun

/**
 * carFulFun = Card Full Function
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
 * @returns A patch object with whichever of value/triggered/ chargeStep
 *          actually changed, or null for a missing conCurObj or a
 *          probability-family mode.
 *
 * @example
 * ```ts
 * carFulFun(conCurObj) // => patch object or null
 * ```
 *
*/

function carFulFun ( conCurObj : ConRcdTyp | null | undefined ) : Partial< ConRcdTyp > | null {


	if ( !conCurObj ) return null; // What: No Conditional Guard. Why: There is nothing to reset or discharge for a conditional that does not exist. How: This returns null immediately when conCurObj is nullish.



	const thrValNum = conCurObj.threshold ?? PIC_NAM_OBJ.THR_VAL_NUM; // What: Threshold Value Number. Why: The ease-up and ease-down branches below need the same resolved charge ceiling, defaulting to the shared full-charge ceiling for a legacy conditional with none. How: This reads conCurObj.threshold, falling back to PIC_NAM_OBJ.THR_VAL_NUM when it is nullish.


	if ( conCurObj.mode === 'ease-up' ) return { // What: Ease Up Reset Return. Why: Completing the card both resets this cycle and rolls a fresh plan for the next one, mirroring pickers.ts's own reset-on-pick behavior. How: This zeroes value, clears triggered, and rolls a brand new chargeStep via rolSteFun.


		chargeStep : rolSteFun( conCurObj, thrValNum ), // What: Charge Step. Why: The next cycle needs its own freshly rolled plan. How: This calls rolSteFun for conCurObj and thrValNum.
		triggered  : false,                             // What: Triggered. Why: A completed card ends the fired day-off. How: This is fixed false on a reset.
		value      : 0                                  // What: Value. Why: A reset cycle starts from empty. How: This is fixed 0 on a reset.


	};



	if ( conCurObj.mode === 'dynamic' ) return { triggered : false, value : 0 }; // What: Dynamic Reset Return. Why: Completing the card means the fired day-off was actually handled, so the miss-accrual value resets for the next cycle. How: This clears triggered and zeroes value.



	if ( conCurObj.mode === 'ease-down' ) { // What: Ease Down Mode Check. Why: Completing an ease-down conditional's own card needs its own multi-step discharge-and-patch build, unlike ease-up's and dynamic's fixed resets just above. How: This branches into the discharge roll and patch object below whenever conCurObj's own mode is 'ease-down'.


		const steValNum = steResFun( conCurObj, thrValNum );                                       // What: Step Value Number. Why: This card completion's own discharge needs the conditional's already-rolled (or freshly-rolled) fixed step before it can compute a new charge. How: This calls steResFun with conCurObj and thrValNum.
		const newValNum = claValFun( ( conCurObj.value ?? thrValNum ) - steValNum, 0, thrValNum ); // What: New Value Number. Why: The discharged charge must be clamped to [0, thrValNum] so it never over- or under-shoots. How: This subtracts steValNum from conCurObj's own current value (defaulting a missing one to thrValNum) and clamps the result via claValFun.



		return { // What: Ease Down Discharge Return. Why: The caller needs this card completion's own resolved value, triggered state, and rolled step all landing together as one patch. How: This builds that patch from newValNum and steValNum.


			chargeStep : steValNum,     // What: Charge Step. Why: The already-rolled plan for this streak must carry forward unchanged. How: This carries steValNum through unchanged.
			triggered  : newValNum > 0, // What: Triggered. Why: This streak stays triggered only while it hasn't fully discharged to 0 yet. How: This compares newValNum against 0 directly.
			value      : newValNum      // What: Value. Why: This completion's own newly-discharged value must land in the returned patch. How: This carries newValNum through unchanged.


		};


	}



	return null; // What: Default Return. Why: Every non-probability mode is already handled above, so this only fires for a probability-family mode (purely informational) or an unrecognized one. How: This is the function's own final fallback.


}

// #endregion carFulFun

// #endregion Value Charging

// #endregion Helpers



// #region Exports

const CON_NAM_OBJ = { // What: Conditionals Namespace Object. Why: This is the single public entry point other files import. How: This maps each internal function another file uses, plus DEF_ODD_NUM, onto an external property name matching it exactly.


	advValFun   : advValFun,   // What: Advance Value Function. Why: Callers advance a conditional's value on a dependent picker's first completion of the day by this exact name. How: This exports advValFun under its own matching name.
	carFulFun   : carFulFun,   // What: Card Full Function. Why: Callers get the patch for a completed day-off card by this exact name. How: This exports carFulFun under its own matching name.
	DEF_ODD_NUM : DEF_ODD_NUM, // What: Default Odds Number. Why: Callers fall back to the same odds for a conditional saved without its own by this exact name. How: This exports DEF_ODD_NUM under its own matching name.
	modValFun   : modValFun,   // What: Mode Value Function. Why: Callers classify a conditional's own mode by this exact name. How: This exports modValFun under its own matching name.
	resDayFun   : resDayFun,   // What: Resolve Day Function. Why: Callers roll or carry each conditional's triggered state for the day by this exact name. How: This exports resDayFun under its own matching name.
	supGatFun   : supGatFun    // What: Suppress Gate Function. Why: Callers decide whether a dependent picker's day-off card shows instead of a real pick by this exact name. How: This exports supGatFun under its own matching name.


};



export { CON_NAM_OBJ }; // What: Named Export. Why: The namespace object carries this file's conditional logic. How: This exports CON_NAM_OBJ by name at the very end of the file.

// #endregion Exports


