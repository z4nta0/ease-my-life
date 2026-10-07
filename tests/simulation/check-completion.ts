


// #region Imports

import { locDayFun } from '../support/clock.ts';   // What: Local Day Function. Why: Completion timestamps must fall on the simulated day. How: This reads their Chicago date.
import { neaEquFun } from './check-generation.ts'; // What: Near Equal Function. Why: Ease values are floats. How: This compares them within float noise.
import { steOkaFun } from './check-generation.ts'; // What: Step Okay Function. Why: Card and charge completions can roll a conditional's step. How: This checks a roll is legal.


import type { ConRcdTyp } from '../../src/core/data-model.ts'; // What: Conditional Record Type. Why: Completions can change conditionals. How: This types the conditional expectations.
import type { PicUpdTyp } from '../../src/core/pickers.ts';    // What: Pick Update Type. Why: Staged rows for one item are merged. How: This types the merged map.
import type { StaAppTyp } from '../../src/core/data-model.ts'; // What: State App Type. Why: Each check compares the state before and after a click. How: This types both states.
import type { TodEntTyp } from '../../src/core/data-model.ts'; // What: Today Entry Type. Why: The checks read the toggled entry. How: This types it.

// #endregion Imports



/**
 * check-completion.ts = Check Completion
 *
 * @summary
 * Checks what a single check-off did to the saved state, comparing the
 * state just before the click with the state just after it. Completing an
 * entry applies exactly what it staged: each update row's value, weight,
 * and charge step, one more pick and a fresh lastPicked on the picked item,
 * the picker patch, and for a non-daily entry the period it ran. Nothing
 * else may change, apart from the entry itself, its pick-log row, the
 * streak, and the conditional and conditional log effects below.
 *
 * Completing a day-off card resolves its conditional by mode: Ease Up and
 * Dynamic reset to 0 and untrigger, Ease Down drains by its step and stays
 * triggered while value remains, and probability modes are untouched. The
 * first of a conditional's dependent entries done each day charges it: Ease
 * Up by its step, triggering at the threshold; Dynamic by 10; and Ease Down,
 * when empty, refills and triggers again. One conditional log row records
 * each conditional's day, triggered when its card was done.
 *
 * Unchecking must restore everything to the state before the check, which
 * cheUndFun checks exactly, and checking a reminder sets its lastDone and
 * logs one completion, which cheRemFun checks.
 *
 * Sections:
 *  - Types
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type IssAddTyp = ( issMesStr : string ) => void; // What: Issue Add Type. Why: Every check reports through one callback. How: This types it.

// #endregion Types



// #region Helpers

const jsoStrFun = ( valAny : unknown ) : string => JSON.stringify( valAny ); // What: JSON String Function. Why: Saved records compare most simply as JSON, which drops undefined fields the same way the app's saves do. How: This serializes a value.



const unpConFun = ( conRcdObj : ConRcdTyp ) : string => { const { _cardPrev : carPreObj, _chargePrev : chrPreObj, ...resConObj } = conRcdObj; return jsoStrFun( resConObj ); }; // What: Unsnapshotted Conditional Function. Why: Undo snapshots linger from earlier days and aren't part of what a check-off restores. How: This serializes a conditional without them.



// #region expConFun

/**
 * expConFun = Expected Conditional Function
 *
 * @summary
 * The conditional a check-off should leave behind, or null when the
 * check-off doesn't touch it. A day-off card resolves the conditional by
 * mode; the first dependent entry done that day charges it. A rolled step
 * can't be predicted, so it's read from the actual result and checked to
 * be a legal roll; the rest of the expectation is exact.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param preStaObj - Previous State Object: The state just before the click.
 * @param aftStaObj - After State Object: The state just after the click.
 * @param curEntObj - Current Entry Object: The entry that was checked.
 * @param issAddFun - Issue Add Function: Reports an illegal roll.
 *
 * @returns The expected conditional, or null when none is touched.
 *
 * @example
 * ```ts
 * expConFun(preStaObj, aftStaObj, curEntObj, issAddFun) // => record or null
 * ```
 *
*/

const expConFun = ( preStaObj : StaAppTyp, aftStaObj : StaAppTyp, curEntObj : TodEntTyp, issAddFun : IssAddTyp ) : ConRcdTyp | null => { // What: Expected Conditional Function. Why: Check-offs drive the day-off conditionals. How: This builds the expected conditional for a card or the day's first dependent.


	const picRcdObj = aftStaObj.pickers.find( ( curPicObj ) => curPicObj.id === curEntObj.pickerId );               // What: Picker Record Object. Why: A dependent's conditional comes from its picker. How: This looks the picker up.
	const conIdeStr = curEntObj.kind === 'dayoff' ? curEntObj.conditionalId : picRcdObj && picRcdObj.conditionalId; // What: Conditional Identifier String. Why: Cards name their conditional; picks reach it through their picker. How: This reads whichever applies.
	const preConObj = preStaObj.conditionals.find( ( curConObj ) => curConObj.id === conIdeStr );                   // What: Previous Conditional Object. Why: The expectation builds on the conditional before the click. How: This looks it up.
	const aftConObj = aftStaObj.conditionals.find( ( curConObj ) => curConObj.id === conIdeStr );                   // What: After Conditional Object. Why: Rolled steps are read from the result. How: This looks it up after the click.



	if ( !preConObj || !aftConObj ) return null; // What: No Conditional Return. Why: A check-off without a conditional touches none. How: This returns null.



	const thrValNum = preConObj.threshold ?? 100;                                                                                               // What: Threshold Value Number. Why: Ease conditionals charge toward the threshold. How: This reads it, defaulting to 100.
	const rolOkaFun = ( steValNum : number | undefined ) => steOkaFun( steValNum, thrValNum, preConObj.easeMax ?? 14, preConObj.easeMin ?? 7 ); // What: Roll Okay Function. Why: A conditional rolls within its own range. How: This checks a step against it.
	const steResNum = ( preConObj.chargeStep ?? 0 ) > 0 ? preConObj.chargeStep! : aftConObj.chargeStep;                                         // What: Step Reserved Number. Why: A set step is kept, an unset one is rolled. How: This uses the set step or the rolled result. // What: Non-Null Note. Why: The branch only reads chargeStep after checking it's above 0. How: The ! tells TypeScript it's set here.
	const valFamBoo = [ 'dynamic', 'ease-down', 'ease-up' ].includes( preConObj.mode );                                                         // What: Value Family Boolean. Why: Only value modes charge and resolve. How: This checks the mode.



	if ( curEntObj.kind === 'dayoff' ) { // What: Card Branch. Why: A day-off card resolves its conditional by mode. How: This builds the resolved conditional.


		const cadPreObj = { chargeStep : preConObj.chargeStep, triggered : preConObj.triggered, value : preConObj.value }; // What: Card Previous Object. Why: The card's undo snapshot is the conditional before it. How: This builds the expected snapshot.



		if ( preConObj.mode === 'ease-up' ) { // What: Ease Up Card Branch. Why: Completing the card resets the charge and rolls a new cycle. How: This expects value 0, untriggered, and a fresh step.


			if ( !rolOkaFun( aftConObj.chargeStep ) ) issAddFun( `conditional ${ preConObj.name } card rolled an illegal step ${ aftConObj.chargeStep }` ); // What: Card Roll Check. Why: The fresh step must be legal. How: This reports an illegal one.



			return { ...preConObj, _cardPrev : cadPreObj, chargeStep : aftConObj.chargeStep, triggered : false, value : 0 }; // What: Ease Up Card Return. Why: The cycle starts over. How: This returns the reset conditional.


		}



		if ( preConObj.mode === 'dynamic' ) return { ...preConObj, _cardPrev : cadPreObj, triggered : false, value : 0 }; // What: Dynamic Card Return. Why: Completing the card clears the boost. How: This returns value 0, untriggered.



		if ( preConObj.mode === 'ease-down' ) { // What: Ease Down Card Branch. Why: Each card drains the conditional by its step. How: This expects the drained value, triggered while any remains.


			if ( !( ( preConObj.chargeStep ?? 0 ) > 0 ) && !rolOkaFun( steResNum ) ) issAddFun( `conditional ${ preConObj.name } card rolled an illegal step ${ steResNum }` ); // What: Drain Roll Check. Why: An unset step is rolled and must be legal. How: This reports an illegal one.



			const nexValNum = Math.min( thrValNum, Math.max( 0, ( preConObj.value ?? thrValNum ) - ( steResNum ?? 0 ) ) ); // What: Next Value Number. Why: The card drains by the step. How: This subtracts it, clamped to the range.



			return { // What: Ease Down Card Return. Why: The gate stays triggered until drained. How: This returns the drained conditional.


				...preConObj, // What: Previous Conditional Spread. Why: The card leaves every other field as it was. How: This copies the conditional before the click.

				_cardPrev  : cadPreObj,     // What: Card Previous. Why: The card's undo reads this snapshot. How: This stores the expected snapshot.
				chargeStep : steResNum,     // What: Charge Step. Why: An unset step is rolled on the card. How: This stores the kept or rolled step.
				triggered  : nexValNum > 0, // What: Triggered. Why: The gate stays on while any charge remains. How: This checks the drained value is above 0.
				value      : nexValNum      // What: Value. Why: The card drains the conditional. How: This stores the drained value.


			};


		}



		return null; // What: Probability Card Return. Why: Random and Weighted cards change nothing. How: This returns null.


	}



	const depDonNum = aftStaObj.today.entries.filter( ( depEntObj ) => { // What: Dependent Done Number. Why: Only the day's first dependent charges. How: This counts the conditional's done dependents after the click.


		const notDaoBoo = depEntObj.kind !== 'dayoff';                                                                                 // What: Not Day-Off Boolean. Why: Cards aren't dependents. How: This checks the entry's kind.
		const isaDonBoo = depEntObj.done;                                                                                              // What: Is-A Done Boolean. Why: Only done dependents charge. How: This reads the entry's done flag.
		const samConBoo = aftStaObj.pickers.find( ( curPicObj ) => curPicObj.id === depEntObj.pickerId )?.conditionalId === conIdeStr; // What: Same Conditional Boolean. Why: Only this conditional's dependents count. How: This checks the entry's picker's conditional.

		const isaDepBoo = notDaoBoo && isaDonBoo && samConBoo; // What: Is-A Dependent Boolean. Why: The count needs all three checks. How: This combines them.



		return isaDepBoo; // What: Dependent Return. Why: The filter keeps the conditional's done dependents. How: This returns the combined check.


	} ).length; // What: Dependent Count. Why: The kept entries are the done dependents. How: This reads their count.


	const notOneBoo = depDonNum !== 1;            // What: Not One Boolean. Why: Only the day's first dependent charges. How: This checks the count isn't exactly 1.
	const chrTodBoo = preConObj.chargedToday;     // What: Charged Today Boolean. Why: A conditional charges once a day. How: This reads its flag.
	const notValBoo = !valFamBoo;                 // What: Not Value Boolean. Why: Only value modes charge. How: This negates the mode check.
	const isaOffBoo = preConObj.active === false; // What: Is-An Off Boolean. Why: A paused conditional doesn't charge. How: This checks its active flag.

	const skiChrBoo = notOneBoo || chrTodBoo || notValBoo || isaOffBoo; // What: Skip Charge Boolean. Why: Any one of these skips the charge. How: This combines them.


	if ( skiChrBoo ) return null; // What: No Charge Return. Why: Only the first dependent of an active value conditional charges, once a day. How: This returns null otherwise.



	const chrPreObj = { chargedToday : preConObj.chargedToday, chargeStep : preConObj.chargeStep, triggered : preConObj.triggered, value : preConObj.value }; // What: Charge Previous Object. Why: The charge's undo snapshot is the conditional before it. How: This builds the expected snapshot.



	if ( preConObj.mode === 'ease-up' ) { // What: Ease Up Charge Branch. Why: The day's first dependent charges by the step. How: This expects the charged value, triggered at the threshold.


		if ( !( ( preConObj.chargeStep ?? 0 ) > 0 ) && !rolOkaFun( steResNum ) ) issAddFun( `conditional ${ preConObj.name } charge rolled an illegal step ${ steResNum }` ); // What: Charge Roll Check. Why: An unset step is rolled and must be legal. How: This reports an illegal one.



		const nexValNum = Math.min( thrValNum, Math.max( 0, ( preConObj.value || 0 ) + ( steResNum ?? 0 ) ) ); // What: Next Value Number. Why: The charge adds the step. How: This adds it, clamped to the range.



		return { // What: Ease Up Charge Return. Why: Reaching the threshold triggers the gate. How: This returns the charged conditional.


			...preConObj, // What: Previous Conditional Spread. Why: The charge leaves every other field as it was. How: This copies the conditional before the click.

			_chargePrev  : chrPreObj,              // What: Charge Previous. Why: The charge's undo reads this snapshot. How: This stores the expected snapshot.
			chargedToday : true,                   // What: Charged Today. Why: A conditional charges once a day. How: This marks the day.
			chargeStep   : steResNum,              // What: Charge Step. Why: An unset step is rolled on the charge. How: This stores the kept or rolled step.
			triggered    : nexValNum >= thrValNum, // What: Triggered. Why: Reaching the threshold triggers the gate. How: This compares the charged value to it.
			value        : nexValNum               // What: Value. Why: The charge adds the step. How: This stores the charged value.


		};


	}



	if ( preConObj.mode === 'dynamic' ) { // What: Dynamic Charge Branch. Why: Each working day raises the boost by 10. How: This expects the boosted conditional.


		return { // What: Dynamic Charge Return. Why: Each working day raises the boost by 10. How: This returns the boosted conditional.


			...preConObj, // What: Previous Conditional Spread. Why: The charge leaves every other field as it was. How: This copies the conditional before the click.

			_chargePrev  : chrPreObj,                    // What: Charge Previous. Why: The charge's undo reads this snapshot. How: This stores the expected snapshot.
			chargedToday : true,                         // What: Charged Today. Why: A conditional charges once a day. How: This marks the day.
			value        : ( preConObj.value || 0 ) + 10 // What: Value. Why: Each working day raises the boost by 10. How: This adds 10 to the current boost.


		};


	}



	if ( preConObj.triggered ) return { ...preConObj, _chargePrev : chrPreObj, chargedToday : true }; // What: Ease Down Busy Return. Why: A triggered Ease Down only marks the day. How: This returns it with chargedToday set.



	if ( !rolOkaFun( aftConObj.chargeStep ) ) issAddFun( `conditional ${ preConObj.name } refill rolled an illegal step ${ aftConObj.chargeStep }` ); // What: Refill Roll Check. Why: A refill rolls a fresh step. How: This reports an illegal one.



	return { ...preConObj, _chargePrev : chrPreObj, chargedToday : true, chargeStep : aftConObj.chargeStep, triggered : true, value : thrValNum }; // What: Ease Down Refill Return. Why: An empty Ease Down refills and triggers on the first working day. How: This returns the refilled conditional.


};

// #endregion expConFun



// #region cheDonFun

/**
 * cheDonFun = Check Done Function
 *
 * @summary
 * Checks one entry's check-off: the entry is done with an exact revert
 * snapshot, its staged effects landed on items and the picker and nothing
 * else changed, its conditional moved as the rules say, the conditional log
 * gained a row only where one belongs, and its live pick-log row is done
 * with a completion time on the simulated day. Returns every problem found,
 * each prefixed with the day.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param preStaObj - Previous State Object: The state just before the click.
 * @param aftStaObj - After State Object: The state just after the click.
 * @param entEidStr - Entry Eid String: The id of the entry checked off.
 * @param dayIsoStr - Day ISO String: The simulated day, as YYYY-MM-DD.
 *
 * @returns Every problem found.
 * @see {@link issMesArr}
 *
 * @example
 * ```ts
 * cheDonFun(preStaObj, aftStaObj, 'e_abc', '2026-10-06') // => [] when right
 * ```
 *
*/

const cheDonFun = ( preStaObj : StaAppTyp, aftStaObj : StaAppTyp, entEidStr : string, dayIsoStr : string ) : string[] => { // What: Check Done Function. Why: Every check-off must apply exactly what was staged. How: This compares the state around one click.


	const issMesArr : string[] = [];                                                                                 // What: Issue Message Array. Why: Every problem is reported. How: This collects them.
	const preEntObj = preStaObj.today.entries.find( ( curEntObj ) => curEntObj.eid === entEidStr );                  // What: Previous Entry Object. Why: The staged effects come from the entry before the click. How: This looks it up.
	const aftEntObj = aftStaObj.today.entries.find( ( curEntObj ) => curEntObj.eid === entEidStr );                  // What: After Entry Object. Why: The entry must now be done. How: This looks it up after.
	const labTexStr = `${ dayIsoStr } check-off ${ preEntObj ? ( preEntObj.kind || 'pick' ) : '?' } ${ entEidStr }`; // What: Label Text String. Why: Reports name the day and entry. How: This builds the prefix.
	const issAddFun = ( issMesStr : string ) => issMesArr.push( `${ labTexStr }: ${ issMesStr }` );                  // What: Issue Add Function. Why: Every report carries the label. How: This prefixes and stores a message.



	if ( !preEntObj || !aftEntObj || !aftEntObj.done ) { issAddFun( 'entry missing or not done after the click' ); return issMesArr; } // What: Done Guard. Why: Nothing else can be checked without a done entry. How: This reports and stops.



	const entPenObj = preEntObj.pending; // What: Entry Pending Object. Why: The staged effects drive every expectation. How: This reads them.
	const updMapObj = ( ( entPenObj && entPenObj.updates ) || [] ).reduce( ( accMapObj, updRowObj ) => accMapObj.set( updRowObj.id, { ...accMapObj.get( updRowObj.id ), ...updRowObj } ), new Map< string, PicUpdTyp >() ); // What: Update Map Object. Why: An item can carry several rows, and each adds its own fields. How: This folds the staged rows by item, merging a later row over an earlier one.
	const touIdeSet = new Set( [ ...updMapObj.keys(), ...( entPenObj && entPenObj.pickedId ? [ entPenObj.pickedId ] : [] ) ] );                                                                                             // What: Touched Identifier Set. Why: Only touched items may change. How: This is the updated ids plus the picked one.



	for ( const preIteObj of preStaObj.items ) { // What: Item Loop. Why: Every item must change exactly as staged, or not at all. How: This builds each expected item and compares.


		const aftIteObj = aftStaObj.items.find( ( curIteObj ) => curIteObj.id === preIteObj.id ); // What: After Item Object. Why: The item after the click. How: This looks it up.



		if ( !aftIteObj ) { issAddFun( `item ${ preIteObj.name } disappeared` ); continue; } // What: Missing Item Guard. Why: A check-off never deletes items. How: This reports and moves on.



		if ( !touIdeSet.has( preIteObj.id ) ) { if ( jsoStrFun( aftIteObj ) !== jsoStrFun( preIteObj ) ) issAddFun( `untouched item ${ preIteObj.name } changed` ); continue; } // What: Untouched Item Check. Why: Items the entry didn't stage stay exactly as they were. How: This compares them whole.



		const updRowObj = updMapObj.get( preIteObj.id );                                              // What: Update Row Object. Why: The staged fields for this item. How: This looks them up.
		const isaPicBoo = !!entPenObj && entPenObj.pickedId === preIteObj.id && !!entPenObj.bumpPick; // What: Is-A Pick Boolean. Why: The picked item counts one more pick. How: This checks pickedId and bumpPick.



		for ( const fieNamStr of [ 'chargeStep', 'value', 'weight' ] as const ) { // What: Staged Field Loop. Why: Each staged field lands exactly; unstaged ones stay. How: This compares each field.


			const expValNum = updRowObj && fieNamStr in updRowObj ? updRowObj[ fieNamStr ] : preIteObj[ fieNamStr ]; // What: Expected Value Number. Why: A staged field takes its new value, any other keeps its old one. How: This picks whichever applies.



			if ( expValNum !== aftIteObj[ fieNamStr ] && !neaEquFun( expValNum, aftIteObj[ fieNamStr ] ) ) issAddFun( `item ${ preIteObj.name } ${ fieNamStr } ${ aftIteObj[ fieNamStr ] }, expected ${ expValNum }` ); // What: Field Report. Why: A field that didn't land as staged is a failure. How: This reports the difference.


		}



		if ( aftIteObj.picks !== ( isaPicBoo ? ( preIteObj.picks || 0 ) + 1 : preIteObj.picks ) ) issAddFun( `item ${ preIteObj.name } picks ${ aftIteObj.picks }, expected ${ isaPicBoo ? ( preIteObj.picks || 0 ) + 1 : preIteObj.picks }` ); // What: Pick Count Check. Why: Only the picked item counts one more pick. How: This compares the count.



		if ( isaPicBoo ? !aftIteObj.lastPicked || locDayFun( aftIteObj.lastPicked ) !== dayIsoStr : aftIteObj.lastPicked !== preIteObj.lastPicked ) issAddFun( `item ${ preIteObj.name } lastPicked ${ aftIteObj.lastPicked }` ); // What: Last Picked Check. Why: Only the picked item's lastPicked moves, to today. How: This checks it.


	}



	for ( const prePicObj of preStaObj.pickers ) { // What: Picker Loop. Why: Only the entry's picker may change, by its patch. How: This builds each expected picker and compares.


		const aftPicObj = aftStaObj.pickers.find( ( curPicObj ) => curPicObj.id === prePicObj.id );                                                             // What: After Picker Object. Why: The picker after the click. How: This looks it up.
		const perRunStr = preEntObj.kind !== 'dayoff' && preEntObj.periodKey ? preEntObj.periodKey : null;                                                      // What: Period Run String. Why: A non-daily entry marks its period as run. How: This reads its period key.
		const ownPicBoo = prePicObj.id === preEntObj.pickerId && !!entPenObj;                                                                                   // What: Own Picker Boolean. Why: Only the entry's own picker is patched, and only when something was staged. How: This checks both.
		const expPicObj = ownPicBoo ? { ...prePicObj, ...( entPenObj!.pickerPatch || {} ), ...( perRunStr ? { lastRunPeriod : perRunStr } : {} ) } : prePicObj; // What: Expected Picker Object. Why: The patch and the period mark apply to the entry's picker. How: This merges them in. // What: Non-Null Note. Why: ownPicBoo is only true when pending exists. How: The ! tells TypeScript it's set here.



		if ( jsoStrFun( aftPicObj ) !== jsoStrFun( expPicObj ) ) issAddFun( `picker ${ prePicObj.name } changed unexpectedly` ); // What: Picker Compare Report. Why: A picker must match its expectation exactly. How: This compares them whole.


	}



	const expConObj = expConFun( preStaObj, aftStaObj, preEntObj, issAddFun ); // What: Expected Conditional Object. Why: A card or first dependent moves one conditional. How: This builds the expectation, or null.



	for ( const preConObj of preStaObj.conditionals ) { // What: Conditional Loop. Why: Only the expected conditional may change. How: This compares each one.


		const aftConObj = aftStaObj.conditionals.find( ( curConObj ) => curConObj.id === preConObj.id ); // What: After Conditional Object. Why: The conditional after the click. How: This looks it up.
		const expRcdObj = expConObj && expConObj.id === preConObj.id ? expConObj : preConObj;            // What: Expected Record Object. Why: The touched conditional uses its expectation, the rest stay. How: This picks which.



		if ( !aftConObj || jsoStrFun( aftConObj ) !== jsoStrFun( expRcdObj ) && !( neaEquFun( aftConObj.value, expRcdObj.value ) && unpConFun( { ...aftConObj, value : 0 } ) === unpConFun( { ...expRcdObj, value : 0 } ) ) ) issAddFun( `conditional ${ preConObj.name } is ${ jsoStrFun( aftConObj ) }, expected ${ jsoStrFun( expRcdObj ) }` ); // What: Conditional Compare Report. Why: The conditional must match, allowing float noise in its value. How: This compares whole, then without snapshots and value.


	}



	const picRcdObj = preStaObj.pickers.find( ( curPicObj ) => curPicObj.id === preEntObj.pickerId );                                   // What: Picker Record Object. Why: A dependent reaches its conditional through its picker. How: This looks the picker up.
	const conIdeStr = preEntObj.kind === 'dayoff' ? preEntObj.conditionalId : picRcdObj && picRcdObj.conditionalId;                     // What: Conditional Identifier String. Why: The log row belongs to that conditional. How: This reads it.
	const conRcdObj = preStaObj.conditionals.find( ( curConObj ) => curConObj.id === conIdeStr );                                       // What: Conditional Record Object. Why: Only active conditionals log. How: This looks it up.
	const hadRowBoo = preStaObj.conditionalLog.some( ( logRowObj ) => logRowObj.condId === conIdeStr && logRowObj.date === dayIsoStr ); // What: Had Row Boolean. Why: A conditional logs once a day. How: This checks for an earlier row today.


	const depDonNum = aftStaObj.today.entries.filter( ( depEntObj ) => { // What: Dependent Done Number. Why: Only the first dependent logs. How: This counts the done dependents after the click.


		const notDaoBoo = depEntObj.kind !== 'dayoff';                                                                                 // What: Not Day-Off Boolean. Why: Cards aren't dependents. How: This checks the entry's kind.
		const isaDonBoo = depEntObj.done;                                                                                              // What: Is-A Done Boolean. Why: Only done dependents log. How: This reads the entry's done flag.
		const samConBoo = aftStaObj.pickers.find( ( curPicObj ) => curPicObj.id === depEntObj.pickerId )?.conditionalId === conIdeStr; // What: Same Conditional Boolean. Why: Only this conditional's dependents count. How: This checks the entry's picker's conditional.

		const isaDepBoo = notDaoBoo && isaDonBoo && samConBoo; // What: Is-A Dependent Boolean. Why: The count needs all three checks. How: This combines them.



		return isaDepBoo; // What: Dependent Return. Why: The filter keeps the conditional's done dependents. How: This returns the combined check.


	} ).length; // What: Dependent Count. Why: The kept entries are the done dependents. How: This reads their count.


	const notHadBoo = !hadRowBoo;                                     // What: Not Had Boolean. Why: A conditional logs once a day. How: This negates the earlier-row check.
	const cofEntBoo = preEntObj.kind === 'dayoff' || depDonNum === 1; // What: Card-Or-First Entry Boolean. Why: Only a card or the first dependent logs. How: This checks the entry's kind and the dependent count.

	const addRowBoo = !!conRcdObj && conRcdObj.active !== false && notHadBoo && cofEntBoo; // What: Add Row Boolean. Why: A row is added for a card or the first dependent, once a day. How: This combines the conditions.


	if ( aftStaObj.conditionalLog.length !== preStaObj.conditionalLog.length + ( addRowBoo ? 1 : 0 ) ) issAddFun( `conditional log has ${ aftStaObj.conditionalLog.length } rows, expected ${ preStaObj.conditionalLog.length + ( addRowBoo ? 1 : 0 ) }` ); // What: Log Count Check. Why: Exactly the expected rows are added. How: This compares counts.

	else if ( addRowBoo ) { // What: New Row Branch. Why: The added row must describe the day. How: This checks the last row.


		const newRowObj = aftStaObj.conditionalLog[ aftStaObj.conditionalLog.length - 1 ]; // What: New Row Object. Why: The added row is appended. How: This reads the last row.
		const conMisBoo = newRowObj.condId !== conIdeStr;                                  // What: Conditional Mismatch Boolean. Why: The row records the conditional. How: This compares its id.
		const datMisBoo = newRowObj.date !== dayIsoStr;                                    // What: Date Mismatch Boolean. Why: The row records the day. How: This compares its date.
		const trgMisBoo = newRowObj.triggered !== ( preEntObj.kind === 'dayoff' );         // What: Triggered Mismatch Boolean. Why: The row records whether its card was done. How: This compares its triggered flag with the entry's kind.

		const rowBadBoo = conMisBoo || datMisBoo || trgMisBoo; // What: Row Bad Boolean. Why: Any mismatch means the row doesn't describe the day. How: This combines them.


		if ( rowBadBoo ) issAddFun( `conditional log row ${ jsoStrFun( newRowObj ) } doesn't describe the day` ); // What: New Row Report. Why: The row records the conditional, the day, and whether its card was done. How: This reports a mismatch.


	}



	const livRowObj = aftStaObj.pickLog.find( ( logRowObj ) => logRowObj.eid === entEidStr && !logRowObj.outcome ); // What: Live Row Object. Why: A pick's live log row records its completion. How: This finds it.



	if ( preEntObj.itemId && ( !livRowObj || !livRowObj.done || !livRowObj.completedAt || locDayFun( livRowObj.completedAt ) !== dayIsoStr || !!livRowObj.depletedEnd !== !!( entPenObj && entPenObj.depletedEnd ) ) ) issAddFun( `pick log row ${ jsoStrFun( livRowObj ) } isn't marked done today` ); // What: Live Row Check. Why: The pick's row is done today, flagged when it spent an item. How: This reports anything else.



	if ( preEntObj.itemId && entPenObj && jsoStrFun( ( aftEntObj.revert || { items : [] } ).items.slice().sort( ( oneRowObj, twoRowObj ) => oneRowObj.id < twoRowObj.id ? -1 : 1 ) ) !== jsoStrFun( preStaObj.items.filter( ( curIteObj ) => touIdeSet.has( curIteObj.id ) ).map( ( curIteObj ) => ( { chargeStep : curIteObj.chargeStep, id : curIteObj.id, lastPicked : curIteObj.lastPicked, picks : curIteObj.picks, value : curIteObj.value, weight : curIteObj.weight } ) ).sort( ( oneRowObj, twoRowObj ) => oneRowObj.id < twoRowObj.id ? -1 : 1 ) ) ) issAddFun( 'revert snapshot doesn\'t match the items before the click' ); // What: Revert Snapshot Check. Why: Unchecking restores from this snapshot, so it must hold the items as they were. How: This compares it with the touched items before the click.



	return issMesArr; // What: Issues Return. Why: The caller collects every check-off's problems. How: This returns the list.


};

// #endregion cheDonFun



// #region cheUndFun

/**
 * cheUndFun = Check Undo Function
 *
 * @summary
 * Checks that unchecking an entry restored the state before it was checked:
 * items, pickers, conditionals (undo snapshots aside), and the conditional
 * log exactly, the entry undone with no revert, and its live pick-log row
 * undone with no completion time. The only allowed leftover is the live
 * row's depletedEnd, which unchecking always writes as false.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param preStaObj - Previous State Object: The state before the check-off.
 * @param undStaObj - Undo State Object: The state after unchecking.
 * @param entEidStr - Entry Eid String: The id of the entry toggled.
 * @param dayIsoStr - Day ISO String: The simulated day, as YYYY-MM-DD.
 *
 * @returns Every problem found.
 * @see {@link issMesArr}
 *
 * @example
 * ```ts
 * cheUndFun(preStaObj, undStaObj, 'e_abc', '2026-10-06') // => [] when exact
 * ```
 *
*/

const cheUndFun = ( preStaObj : StaAppTyp, undStaObj : StaAppTyp, entEidStr : string, dayIsoStr : string ) : string[] => { // What: Check Undo Function. Why: Unchecking must undo a check-off exactly. How: This compares the state before the check with the state after the uncheck.


	const issMesArr : string[] = [];                                                                                    // What: Issue Message Array. Why: Every problem is reported. How: This collects them.
	const issAddFun = ( issMesStr : string ) => issMesArr.push( `${ dayIsoStr } undo ${ entEidStr }: ${ issMesStr }` ); // What: Issue Add Function. Why: Every report names the day and entry. How: This prefixes and stores a message.



	const rowNorFun = ( logRowObj : StaAppTyp[ 'pickLog' ][ number ] ) => jsoStrFun({ // What: Row Normalize Function. Why: Unchecking writes depletedEnd false where it was unset. How: This treats false and unset alike.


		...logRowObj, // What: Log Row Spread. Why: Every other field is compared as it is. How: This copies the row.

		depletedEnd : logRowObj.depletedEnd || undefined // What: Depleted End. Why: Unchecking writes false where it was unset. How: This turns false into unset.


	});



	if ( jsoStrFun( undStaObj.items ) !== jsoStrFun( preStaObj.items ) ) issAddFun( 'items weren\'t restored' );                                                // What: Item Restore Check. Why: Every item returns to its earlier state. How: This compares them whole.
	if ( jsoStrFun( undStaObj.pickers ) !== jsoStrFun( preStaObj.pickers ) ) issAddFun( 'pickers weren\'t restored' );                                          // What: Picker Restore Check. Why: The patch and period mark are undone. How: This compares them whole.
	if ( undStaObj.conditionals.map( unpConFun ).join() !== preStaObj.conditionals.map( unpConFun ).join() ) issAddFun( 'conditionals weren\'t restored' );      // What: Conditional Restore Check. Why: Charges and card effects are undone. How: This compares them without undo snapshots.
	if ( jsoStrFun( undStaObj.conditionalLog ) !== jsoStrFun( preStaObj.conditionalLog ) ) issAddFun( 'conditional log wasn\'t restored' );                     // What: Conditional Log Restore Check. Why: The day's row is removed again. How: This compares the logs.
	if ( undStaObj.pickLog.map( rowNorFun ).join() !== preStaObj.pickLog.map( rowNorFun ).join() ) issAddFun( 'pick log wasn\'t restored' );                    // What: Pick Log Restore Check. Why: The live row is undone again. How: This compares the logs, treating depletedEnd false as unset.



	const undEntObj = undStaObj.today.entries.find( ( curEntObj ) => curEntObj.eid === entEidStr ); // What: Undo Entry Object. Why: The entry must be undone again. How: This looks it up.



	if ( !undEntObj || undEntObj.done || undEntObj.revert ) issAddFun( 'entry isn\'t undone cleanly' ); // What: Entry Undone Check. Why: An unchecked entry is undone with no snapshot. How: This reports anything else.



	return issMesArr; // What: Issues Return. Why: The caller collects every undo's problems. How: This returns the list.


};

// #endregion cheUndFun



// #region cheRemFun

/**
 * cheRemFun = Check Reminder Function
 *
 * @summary
 * Checks one reminder check-off: its lastDone is the simulated day, the
 * reminder log gained exactly one row for it, completed on that day with the
 * reminder's name and class, and no other reminder changed.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param preStaObj - Previous State Object: The state just before the click.
 * @param aftStaObj - After State Object: The state just after the click.
 * @param tasIdeStr - Task Identifier String: The reminder checked off.
 * @param dayIsoStr - Day ISO String: The simulated day, as YYYY-MM-DD.
 *
 * @returns Every problem found.
 * @see {@link issMesArr}
 *
 * @example
 * ```ts
 * cheRemFun(preStaObj, aftStaObj, 'tk_abc', '2026-10-06') // => [] when right
 * ```
 *
*/

const cheRemFun = ( preStaObj : StaAppTyp, aftStaObj : StaAppTyp, tasIdeStr : string, dayIsoStr : string ) : string[] => { // What: Check Reminder Function. Why: Every reminder check-off must record exactly one completion. How: This compares the reminders and their log around the click.


	const issMesArr : string[] = [];                                                                                        // What: Issue Message Array. Why: Every problem is reported. How: This collects them.
	const issAddFun = ( issMesStr : string ) => issMesArr.push( `${ dayIsoStr } reminder ${ tasIdeStr }: ${ issMesStr }` ); // What: Issue Add Function. Why: Every report names the day and reminder. How: This prefixes and stores a message.
	const tasRcdObj = aftStaObj.tasks.find( ( curTasObj ) => curTasObj.id === tasIdeStr );                                  // What: Task Record Object. Why: The reminder after the click. How: This looks it up.
	const newRowArr = aftStaObj.reminderLog.slice( preStaObj.reminderLog.length );                                          // What: New Row Array. Why: The click appends one row. How: This takes the rows added since before.



	if ( !tasRcdObj || tasRcdObj.lastDone !== dayIsoStr ) issAddFun( `lastDone ${ tasRcdObj && tasRcdObj.lastDone }, expected ${ dayIsoStr }` ); // What: Last Done Check. Why: The reminder records today as done. How: This compares lastDone.



	if ( newRowArr.length !== 1 || newRowArr[ 0 ].taskId !== tasIdeStr || locDayFun( newRowArr[ 0 ].completedAt ) !== dayIsoStr || newRowArr[ 0 ].type !== ( tasRcdObj && tasRcdObj.repeat === 'once' ? 'once' : 'recurring' ) ) issAddFun( `reminder log added ${ jsoStrFun( newRowArr ) }` ); // What: Log Row Check. Why: One row records today's completion with the reminder's class. How: This checks the added rows.



	for ( const preTasObj of preStaObj.tasks ) if ( preTasObj.id !== tasIdeStr && jsoStrFun( preTasObj ) !== jsoStrFun( aftStaObj.tasks.find( ( curTasObj ) => curTasObj.id === preTasObj.id ) ) ) issAddFun( `other reminder ${ preTasObj.name } changed` ); // What: Other Reminder Loop. Why: A check-off touches only its reminder. How: This compares every other one.



	return issMesArr; // What: Issues Return. Why: The caller collects every reminder's problems. How: This returns the list.


};

// #endregion cheRemFun

// #endregion Helpers



// #region Exports

export { cheDonFun, cheRemFun, cheUndFun }; // What: Named Exports. Why: The simulation checks every check-off, undo, and reminder through these. How: This exports them by name.

// #endregion Exports


