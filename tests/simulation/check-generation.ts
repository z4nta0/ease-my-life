


// #region Imports

import { comPerFun } from './schedule.ts'; // What: Completed Period Function. Why: A period that already ran produces no pick. How: This checks the period against the log.
import { dowValFun } from './dates.ts';    // What: Day-Of-Week Value Function. Why: Pickers can be limited to weekdays. How: This reads the day's weekday.
import { isaHolFun } from './holidays.ts'; // What: Is-A Holiday Function. Why: Pickers can skip holidays. How: This checks the day against the saved holidays.
import { perStaFun } from './schedule.ts'; // What: Period Start Function. Why: Non-daily entries carry a period key. How: This finds the day's period start.


import type { ConRcdTyp } from '../../src/core/data-model.ts'; // What: Conditional Record Type. Why: The day-off gates read conditionals. How: This types the conditional lookups.
import type { IteRcdTyp } from '../../src/core/data-model.ts'; // What: Item Record Type. Why: Every pick is checked against the items before it. How: This types the item pools.
import type { PicRcdTyp } from '../../src/core/data-model.ts'; // What: Picker Record Type. Why: Every expectation starts from a picker. How: This types the picker parameters.
import type { PicUpdTyp } from '../../src/core/pickers.ts';    // What: Pick Update Type. Why: A pick stages its updates as rows. How: This types the expected and actual update rows.
import type { StaAppTyp } from '../../src/core/data-model.ts'; // What: State App Type. Why: Generation is checked from the state before it and after it. How: This types both states.
import type { TodEntTyp } from '../../src/core/data-model.ts'; // What: Today Entry Type. Why: The checks read the generated entries. How: This types the entries.

// #endregion Imports



/**
 * check-generation.ts = Check Generation
 *
 * @summary
 * Checks one day's generated list against what the rules say it should be,
 * given the saved state before the day began. Generation changes no item,
 * picker, or conditional value; everything a pick will do is staged in its
 * entry's pending updates, so every expectation here is exact except the
 * draws the rules leave to chance (which weighted item, a probability
 * gate's roll, a freshly rolled cycle length), where the check confirms the
 * draw is one the rules allow.
 *
 * Walking the daily list in order, a picker produces nothing when it is
 * missing, hidden, off for the weekday, or skipping a holiday. A non-daily
 * picker carries its unfinished entry from earlier in the same period,
 * produces nothing once its period has run, and otherwise picks once. A
 * picker whose conditional is active and triggered produces no pick, and its
 * conditional shows one day-off card in place of all its pickers. Every
 * other picker picks by its mode, and an Ease Up picker with nothing
 * eligible shows a charging card instead.
 *
 * Every rolled cycle length must be threshold / N for a whole N between the
 * soonest and latest cycle counts the item's ease range allows; ease ranges
 * an item doesn't set fall back to the average of its picker's pool.
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

const EPS_VAL_NUM = 1e-6; // What: Epsilon Value Number. Why: Ease values are floats built from repeated division and addition. How: This is the tolerance for comparing them.



const neaEquFun = ( oneValNum : number | undefined, twoValNum : number | undefined ) : boolean => typeof oneValNum === 'number' && typeof twoValNum === 'number' && Math.abs( oneValNum - twoValNum ) < EPS_VAL_NUM; // What: Near Equal Function. Why: Float results can differ in their last bits. How: This compares two numbers within the tolerance.



// #region aveEasFun

/**
 * aveEasFun = Average Ease Function
 *
 * @summary
 * The fallback ease range for items that don't set their own: the rounded
 * averages of the pool's ease maximums and minimums, each item counting as
 * 14 and 7 when unset, floored at 1. An empty pool falls back to 14 and 7.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param iteRcdArr - Item Record Array: The pool the range averages over.
 *
 * @returns The fallback maximum and minimum.
 *
 * @example
 * ```ts
 * aveEasFun(pooIteArr) // => { easMaxNum: 14, easMinNum: 7 }
 * ```
 *
*/

const aveEasFun = ( iteRcdArr : IteRcdTyp[] ) : { easMaxNum : number, easMinNum : number } => { // What: Average Ease Function. Why: Items without their own range use the pool's average. How: This averages the pool's ease limits.


	if ( !iteRcdArr.length ) return { easMaxNum : 14, easMinNum : 7 }; // What: Empty Pool Return. Why: An empty pool has nothing to average. How: This returns the defaults.



	const sumMaxNum = iteRcdArr.reduce( ( runSumNum, curIteObj ) => runSumNum + ( curIteObj.easeMax ?? 14 ), 0 ); // What: Sum Maximum Number. Why: The average needs the total. How: This sums each item's maximum, 14 when unset.
	const sumMinNum = iteRcdArr.reduce( ( runSumNum, curIteObj ) => runSumNum + ( curIteObj.easeMin ?? 7 ), 0 );  // What: Sum Minimum Number. Why: The average needs the total. How: This sums each item's minimum, 7 when unset.



	return { // What: Average Range Return. Why: Both averages are rounded and floored at 1. How: This divides each sum by the pool size.


		easMaxNum : Math.max( 1, Math.round( sumMaxNum / iteRcdArr.length ) ), // What: Ease Maximum Number. Why: The average maximum is a whole number of days. How: This rounds it, at least 1.
		easMinNum : Math.max( 1, Math.round( sumMinNum / iteRcdArr.length ) )  // What: Ease Minimum Number. Why: The average minimum is a whole number of days. How: This rounds it, at least 1.


	};


};

// #endregion aveEasFun



// #region steOkaFun

/**
 * steOkaFun = Step Okay Function
 *
 * @summary
 * Whether a cycle step is one the rules could have rolled: threshold / N for
 * a whole N between the soonest count, round(threshold / easeMax), and the
 * latest, round(threshold / easeMin), both at least 1.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param steValNum - Step Value Number: The step to check.
 * @param thrValNum - Threshold Value Number: The full charge.
 * @param easMaxNum - Ease Maximum Number: The range's maximum.
 * @param easMinNum - Ease Minimum Number: The range's minimum.
 *
 * @returns Whether the step is a legal roll.
 *
 * @example
 * ```ts
 * steOkaFun(100 / 9, 100, 14, 7) // => true
 * ```
 *
*/

const steOkaFun = ( steValNum : number | undefined, thrValNum : number, easMaxNum : number, easMinNum : number ) : boolean => { // What: Step Okay Function. Why: Rolled cycle lengths can't be predicted, only bounded. How: This checks the step divides the threshold into an allowed whole count.


	if ( typeof steValNum !== 'number' || !( steValNum > 0 ) ) return false; // What: Missing Step Guard. Why: A roll always produces a positive step. How: This rejects anything else.



	const cycCouNum = thrValNum / steValNum;                                         // What: Cycle Count Number. Why: A step is the threshold split into whole cycles. How: This recovers N.
	const sooCouNum = Math.max( 1, Math.round( thrValNum / easMaxNum ) );            // What: Soonest Count Number. Why: The shortest cycle the range allows. How: This rounds threshold / easeMax, at least 1.
	const latCouNum = Math.max( sooCouNum, Math.round( thrValNum / easMinNum ) );    // What: Latest Count Number. Why: The longest cycle the range allows. How: This rounds threshold / easeMin, at least the soonest.
	const isaWhoBoo = Math.abs( cycCouNum - Math.round( cycCouNum ) ) < EPS_VAL_NUM; // What: Is-A Whole Boolean. Why: The step must split the threshold into whole cycles. How: This checks N is whole within the tolerance.
	const aftSooBoo = Math.round( cycCouNum ) >= sooCouNum;                          // What: After Soonest Boolean. Why: The cycle can't be shorter than the range allows. How: This compares N with the soonest count.
	const befLatBoo = Math.round( cycCouNum ) <= latCouNum;                          // What: Before Latest Boolean. Why: The cycle can't be longer than the range allows. How: This compares N with the latest count.

	const legSteBoo = isaWhoBoo && aftSooBoo && befLatBoo; // What: Legal Step Boolean. Why: The step must be a whole, in-range split. How: This combines the checks.



	return legSteBoo; // What: Legal Step Return. Why: The step must be a whole, in-range split. How: This returns the combined check.


};

// #endregion steOkaFun



// #region updMapFun

/**
 * updMapFun = Update Map Function
 *
 * @summary
 * Folds update rows into one row per item, later rows winning field by
 * field, the way the app applies them when an entry is completed. Two rows
 * for one item happen when an Ease Down picker abandons a streak.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param updRowArr - Update Row Array: The rows to fold.
 *
 * @returns The rows keyed by item id.
 * @see {@link updMapObj}
 *
 * @example
 * ```ts
 * updMapFun(curEntObj.pending.updates) // => Map { 'it_a' => { id, value } }
 * ```
 *
*/

const updMapFun = ( updRowArr : PicUpdTyp[] ) : Map< string, PicUpdTyp > => { // What: Update Map Function. Why: Expected and actual updates are compared per item. How: This keys the rows by item id.


	const updMapObj = new Map< string, PicUpdTyp >(); // What: Update Map Object. Why: Each item's rows fold into one. How: This collects them by id.



	for ( const updRowObj of updRowArr ) updMapObj.set( updRowObj.id, updRowObj ); // What: Row Fold Loop. Why: The app keeps one row per item, the later one winning. How: This sets each row in turn.



	return updMapObj; // What: Map Return. Why: The caller compares per item. How: This returns the folded rows.


};

// #endregion updMapFun



// #region cmpUpdFun

/**
 * cmpUpdFun = Compare Updates Function
 *
 * @summary
 * Reports every difference between the expected and actual update rows: an
 * item missing from either side, or a value, weight, or charge step that
 * differs beyond float noise. A field the expected row leaves out isn't
 * checked, which is how rolled steps are left to steOkaFun.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param expUpdArr - Expected Update Array: The rows the rules call for.
 * @param actUpdArr - Actual Update Array: The rows the entry staged.
 * @param issAddFun - Issue Add Function: Reports each difference.
 * @param labTexStr - Label Text String: Names the pick in each report.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * cmpUpdFun(expUpdArr, actUpdArr, issAddFun, 'Chores') // => void
 * ```
 *
*/

const cmpUpdFun = ( expUpdArr : PicUpdTyp[], actUpdArr : PicUpdTyp[], issAddFun : IssAddTyp, labTexStr : string ) : void => { // What: Compare Updates Function. Why: Every staged update must match the rules. How: This compares the folded rows field by field.


	const expMapObj = updMapFun( expUpdArr ); // What: Expected Map Object. Why: Rows are compared per item. How: This folds the expected rows.
	const actMapObj = updMapFun( actUpdArr ); // What: Actual Map Object. Why: Rows are compared per item. How: This folds the actual rows.



	for ( const [ iteIdeStr, expRowObj ] of expMapObj ) { // What: Expected Row Loop. Why: Every expected row must be staged as expected. How: This checks each one against its actual row.


		const actRowObj = actMapObj.get( iteIdeStr ); // What: Actual Row Object. Why: The staged row for the same item. How: This looks it up.



		if ( !actRowObj ) { issAddFun( `${ labTexStr }: no update staged for item ${ iteIdeStr }` ); continue; } // What: Missing Row Guard. Why: An expected update that wasn't staged is a failure. How: This reports it and moves on.



		for ( const fieNamStr of [ 'chargeStep', 'value', 'weight' ] as const ) if ( fieNamStr in expRowObj && !neaEquFun( expRowObj[ fieNamStr ], actRowObj[ fieNamStr ] ) ) issAddFun( `${ labTexStr }: item ${ iteIdeStr } ${ fieNamStr } expected ${ expRowObj[ fieNamStr ] }, staged ${ actRowObj[ fieNamStr ] }` ); // What: Field Compare Loop. Why: Each field the rules fix must match. How: This compares the fields the expected row sets.


	}



	for ( const iteIdeStr of actMapObj.keys() ) if ( !expMapObj.has( iteIdeStr ) ) issAddFun( `${ labTexStr }: unexpected update staged for item ${ iteIdeStr }` ); // What: Extra Row Loop. Why: An update the rules don't call for is a failure too. How: This reports every staged item with no expected row.


};

// #endregion cmpUpdFun



// #region chePicFun

/**
 * chePicFun = Check Pick Function
 *
 * @summary
 * Checks one picker's pick against its mode, from the items as they were
 * before the day began. The pool is the picker's items not on vacation;
 * when the picker avoids duplicates, items whose names were already picked
 * today are dropped unless that would leave nothing. Updates are computed
 * over the full pool, duplicates included.
 *
 * Random and Weighted stage nothing. Dynamic sets the pick's value to 0 and
 * adds 1 to every other item's. Ease Up picks the highest-value eligible
 * item, value within 0.5 of the threshold, the longest-unpicked one on a
 * tie; every other item charges by its step, a pick rolls a fresh step and
 * resets to 0, and when more than one item overshoots the threshold all
 * overshooters drop by the smallest overshoot. With nothing eligible it
 * stages the charge on a charging card instead. Ease Down continues its
 * active item while that item has value left, otherwise starts a new streak
 * on an item with weight above 0, raising every other item's weight by 1
 * and setting the new one's to 0; either way the item drops by its step,
 * refilling to the threshold once it's within 0.5 of empty, which also
 * ends the streak.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param picRcdObj - Picker Record Object: The picker that picked.
 * @param preIteArr - Previous Item Array: Every item before the day began.
 * @param curEntObj - Current Entry Object: The entry the picker produced,
 *                    or undefined when it produced none.
 * @param picNamSet - Pick Name Set: Lowercased names picked earlier today.
 * @param issAddFun - Issue Add Function: Reports each problem.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * chePicFun(picRcdObj, preIteArr, curEntObj, picNamSet, issAddFun) // => void
 * ```
 *
*/

const chePicFun = ( picRcdObj : PicRcdTyp, preIteArr : IteRcdTyp[], curEntObj : TodEntTyp | undefined, picNamSet : Set< string >, issAddFun : IssAddTyp ) : void => { // What: Check Pick Function. Why: Each picker's pick must follow its mode exactly. How: This rebuilds the pool and compares the pick and its staged updates.


	const labTexStr = `${ picRcdObj.name } (${ picRcdObj.mode })`;                                                     // What: Label Text String. Why: Reports name the picker. How: This is its name and mode.
	const thrValNum = picRcdObj.threshold ?? 100;                                                                      // What: Threshold Value Number. Why: Ease modes charge toward the threshold. How: This reads it, defaulting to 100.
	const updPooArr = preIteArr.filter( ( curIteObj ) => curIteObj.pickerId === picRcdObj.id && !curIteObj.vacation ); // What: Update Pool Array. Why: Updates cover every active item, duplicates included. How: This is the picker's items not on vacation.
	const dedPooArr = updPooArr.filter( ( curIteObj ) => !picNamSet.has( curIteObj.name.toLowerCase() ) );             // What: Deduplicated Pool Array. Why: Avoiding duplicates drops names already picked. How: This removes them.
	const falEasObj = aveEasFun( updPooArr );                                                                          // What: Fallback Ease Object. Why: Items without their own range use the pool's average. How: This averages the pool.
	const entPenObj = curEntObj && curEntObj.pending;                                                                  // What: Entry Pending Object. Why: The staged effects are what's checked. How: This reads the entry's pending, when there is one.
	const avoDupBoo = picRcdObj.avoidDuplicates;                                                                       // What: Avoid Duplicates Boolean. Why: Only pickers set to avoid duplicates drop names. How: This reads the picker's flag.
	const namSizNum = picNamSet.size;                                                                                  // What: Name Size Number. Why: There's nothing to avoid until a name was picked. How: This reads how many names were picked.
	const dedLenNum = dedPooArr.length;                                                                                // What: Deduplicated Length Number. Why: Duplicates are avoided only when something else remains. How: This reads the deduplicated pool's size.

	const takDedBoo = avoDupBoo && namSizNum && dedLenNum; // What: Take Deduplicated Boolean. Why: The deduplicated pool is used only when all three hold. How: This combines them.


	const pooIteArr = takDedBoo ? dedPooArr : updPooArr; // What: Pool Item Array. Why: Duplicates are avoided only when something else remains. How: This uses the deduplicated pool when it isn't empty.

	const actUpdArr : PicUpdTyp[] = ( entPenObj && entPenObj.updates ) || []; // What: Actual Update Array. Why: The staged updates are compared with the expected ones. How: This reads them, empty when there are none.



	const iteSteFun = ( curIteObj : IteRcdTyp, steValNum : number | undefined ) => steOkaFun( steValNum, thrValNum, curIteObj.easeMax ?? falEasObj.easMaxNum, curIteObj.easeMin ?? falEasObj.easMinNum ); // What: Item Step Function. Why: Each item rolls within its own range or the fallback. How: This checks a step against the item's range.



	if ( !pooIteArr.length ) { // What: Empty Pool Branch. Why: A picker with no active items picks nothing. How: This checks nothing was produced.


		if ( curEntObj ) issAddFun( `${ labTexStr }: produced an entry from an empty pool` ); // What: Empty Pool Report. Why: There was nothing to pick. How: This reports the stray entry.



		return; // What: Empty Pool Return. Why: Nothing else applies. How: This ends the check.


	}



	if ( picRcdObj.mode === 'ease-up' ) { // What: Ease Up Branch. Why: Ease Up picks the fullest eligible item or charges. How: This rebuilds the eligible set and the staged charge.


		const eliIteArr = pooIteArr.filter( ( curIteObj ) => ( curIteObj.value ?? 0 ) >= thrValNum - 0.5 ); // What: Eligible Item Array. Why: Only items within 0.5 of the threshold can be picked. How: This filters the pool.
		const chaRowArr : PicUpdTyp[] = [];                                                                 // What: Charge Row Array. Why: The expected updates are built item by item. How: This collects them.



		if ( !eliIteArr.length ) { // What: Charging Branch. Why: With nothing eligible the picker charges instead of picking. How: This expects a charging card staging every item's charge.


			if ( !curEntObj || curEntObj.kind !== 'charging' ) { issAddFun( `${ labTexStr }: nothing eligible, expected a charging card` ); return; } // What: Charging Card Guard. Why: The charge shows as a charging card. How: This reports and stops when there isn't one.



			for ( const curIteObj of updPooArr ) { // What: Charge Expectation Loop. Why: Every active item charges by its step. How: This expects value plus step, checking any rolled step.


				const actRowObj = actUpdArr.find( ( updRowObj ) => updRowObj.id === curIteObj.id );                             // What: Actual Row Object. Why: A rolled step is read from what was staged. How: This finds the item's row.
				const steValNum = ( curIteObj.chargeStep ?? 0 ) > 0 ? curIteObj.chargeStep : actRowObj && actRowObj.chargeStep; // What: Step Value Number. Why: A set step is kept, an unset one is rolled. How: This uses the item's step or the staged roll.



				if ( !( ( curIteObj.chargeStep ?? 0 ) > 0 ) && !iteSteFun( curIteObj, steValNum ) ) issAddFun( `${ labTexStr }: charging step ${ steValNum } for ${ curIteObj.name } isn't a legal roll` ); // What: Rolled Step Check. Why: A fresh roll must be in range. How: This reports an out-of-range step.



				chaRowArr.push({ // What: Charge Row Push. Why: Each item's value rises by its step. How: This expects the new value.


					chargeStep : steValNum,                           // What: Charge Step. Why: The step is kept or rolled. How: This stores the expected step.
					id         : curIteObj.id,                        // What: Identifier. Why: The row names its item. How: This stores the item's id.
					value      : curIteObj.value + ( steValNum ?? 0 ) // What: Value. Why: The item charges by its step. How: This adds the step to its value.


				});


			}



			cmpUpdFun( chaRowArr, actUpdArr, issAddFun, labTexStr ); // What: Charge Compare Call. Why: The staged charge must match. How: This compares it.



			return; // What: Charging Return. Why: A charging card has no pick to check. How: This ends the check.


		}



		const expIteObj = eliIteArr.reduce( ( besIteObj, curIteObj ) => ( curIteObj.value > besIteObj.value || ( curIteObj.value === besIteObj.value && ( Date.parse( curIteObj.lastPicked || '' ) || 0 ) < ( Date.parse( besIteObj.lastPicked || '' ) || 0 ) ) ? curIteObj : besIteObj ) ); // What: Expected Item Object. Why: The fullest eligible item wins, the longest-unpicked on a tie. How: This reduces over the eligible items.



		if ( !curEntObj || curEntObj.itemId !== expIteObj.id ) { issAddFun( `${ labTexStr }: expected ${ expIteObj.name }, got ${ curEntObj ? curEntObj.itemId : 'nothing' }` ); return; } // What: Pick Guard. Why: Ease Up's pick is fully determined. How: This reports and stops when it differs.



		for ( const curIteObj of updPooArr ) { // What: Pick Expectation Loop. Why: The pick resets and every other item charges. How: This builds each expected row before compression.


			const actRowObj = actUpdArr.find( ( updRowObj ) => updRowObj.id === curIteObj.id );     // What: Actual Row Object. Why: Rolled steps are read from what was staged. How: This finds the item's row.
			const isaPicBoo = curIteObj.id === expIteObj.id;                                        // What: Is-A Pick Boolean. Why: The pick rolls a fresh step and resets. How: This marks it.
			const keeSteBoo = !isaPicBoo && ( curIteObj.chargeStep ?? 0 ) > 0;                      // What: Keep Step Boolean. Why: An unpicked item keeps a set step. How: This is true when it has one.
			const steValNum = keeSteBoo ? curIteObj.chargeStep : actRowObj && actRowObj.chargeStep; // What: Step Value Number. Why: The step either stays or was rolled. How: This uses the kept or staged step.



			if ( !keeSteBoo && !iteSteFun( curIteObj, steValNum ) ) issAddFun( `${ labTexStr }: step ${ steValNum } for ${ curIteObj.name } isn't a legal roll` ); // What: Rolled Step Check. Why: A fresh roll must be in range. How: This reports an out-of-range step.



			chaRowArr.push({ // What: Expected Row Push. Why: The pick resets to 0 and the rest charge. How: This expects each new value.


				chargeStep : steValNum,                                           // What: Charge Step. Why: The step is kept or rolled. How: This stores the expected step.
				id         : curIteObj.id,                                        // What: Identifier. Why: The row names its item. How: This stores the item's id.
				value      : isaPicBoo ? 0 : curIteObj.value + ( steValNum ?? 0 ) // What: Value. Why: The pick resets to 0 and the rest charge. How: This picks 0 or the charged value.


			});


		}



		const oveValArr = chaRowArr.filter( ( updRowObj ) => ( updRowObj.value ?? 0 ) > thrValNum ).map( ( updRowObj ) => ( updRowObj.value ?? 0 ) - thrValNum ); // What: Overshoot Value Array. Why: Several overshooters are pulled back together. How: This lists each overshoot.



		if ( oveValArr.length > 1 && Math.min( ...oveValArr ) > 0 ) for ( const updRowObj of chaRowArr ) if ( ( updRowObj.value ?? 0 ) > thrValNum ) updRowObj.value = ( updRowObj.value ?? 0 ) - Math.min( ...oveValArr ); // What: Overshoot Compression. Why: More than one overshooter drop by the smallest overshoot. How: This subtracts it from each.



		cmpUpdFun( chaRowArr, actUpdArr, issAddFun, labTexStr ); // What: Pick Update Compare Call. Why: The staged updates must match. How: This compares them.


	}

	else if ( picRcdObj.mode === 'ease-down' ) { // What: Ease Down Branch. Why: Ease Down drains one item at a time. How: This rebuilds the streak's continuation or new start.


		const actIteObj = picRcdObj.activeItemId ? updPooArr.find( ( curIteObj ) => curIteObj.id === picRcdObj.activeItemId && curIteObj.value > 0 ) : undefined; // What: Active Item Object. Why: A streak continues while its item has value left. How: This finds the active item in the full pool.



		if ( actIteObj && !pooIteArr.includes( actIteObj ) ) { // What: Paused Streak Branch. Why: An active item dropped as a duplicate pauses the streak. How: This expects no entry.


			if ( curEntObj ) issAddFun( `${ labTexStr }: streak item was a duplicate, expected no entry` ); // What: Paused Streak Report. Why: A paused streak produces nothing. How: This reports a stray entry.



			return; // What: Paused Return. Why: Nothing else applies. How: This ends the check.


		}



		const canIteArr = pooIteArr.filter( ( curIteObj ) => ( curIteObj.weight ?? 1 ) > 0 );                // What: Candidate Item Array. Why: A new streak starts on an item with weight above 0. How: This filters the pool.
		const choIteArr = actIteObj ? [ actIteObj ] : ( canIteArr.length ? canIteArr : pooIteArr );          // What: Choice Item Array. Why: A continuing streak keeps its item; a new one draws from the candidates. How: This lists the allowed picks.
		const picIteObj = curEntObj && choIteArr.find( ( curIteObj ) => curIteObj.id === curEntObj.itemId ); // What: Pick Item Object. Why: The pick must be one of the allowed items. How: This finds the picked item among them.



		if ( !picIteObj || !curEntObj || !entPenObj ) { issAddFun( `${ labTexStr }: pick ${ curEntObj ? curEntObj.itemId : 'nothing' } isn't an allowed ${ actIteObj ? 'continuation' : 'new streak' }` ); return; } // What: Pick Guard. Why: The pick must be allowed. How: This reports and stops when it isn't.



		const actRowObj = actUpdArr.find( ( updRowObj ) => updRowObj.id === picIteObj.id );                    // What: Actual Row Object. Why: A rolled step is read from what was staged. How: This finds the pick's row.
		const keeSteBoo = !!actIteObj && ( actIteObj.chargeStep ?? 0 ) > 0;                                    // What: Keep Step Boolean. Why: A continuing streak keeps its set step. How: This is true when it has one.
		const steValNum = keeSteBoo ? actIteObj!.chargeStep : actRowObj && actRowObj.chargeStep;               // What: Step Value Number. Why: The step either stays or was rolled. How: This uses the kept or staged step. // What: Non-Null Note. Why: keeSteBoo is only true when actIteObj exists. How: The ! tells TypeScript it's set here.
		const basValNum = actIteObj ? actIteObj.value : ( picIteObj.value > 0 ? picIteObj.value : thrValNum ); // What: Base Value Number. Why: A new streak on an empty item starts from full. How: This is the value the drain starts from.
		const nexValNum = Math.max( 0, basValNum - ( steValNum ?? 0 ) );                                       // What: Next Value Number. Why: The item drains by its step. How: This subtracts it, at least 0.
		const depEndBoo = nexValNum <= 0.5;                                                                    // What: Depleted End Boolean. Why: Within 0.5 of empty, the item is spent. How: This marks it.



		if ( !keeSteBoo && !iteSteFun( picIteObj, steValNum ) ) issAddFun( `${ labTexStr }: step ${ steValNum } for ${ picIteObj.name } isn't a legal roll` ); // What: Rolled Step Check. Why: A fresh roll must be in range. How: This reports an out-of-range step.



		const expRowArr : PicUpdTyp[] = actIteObj ? [] : updPooArr.filter( ( curIteObj ) => curIteObj.id !== picIteObj.id ).map( ( curIteObj ) => ( { // What: Expected Row Array. Why: A new streak raises every other item's weight by 1. How: This starts the expected rows with those raises.


			id     : curIteObj.id,                 // What: Identifier. Why: The row names its item. How: This stores the item's id.
			weight : ( curIteObj.weight ?? 1 ) + 1 // What: Weight. Why: A new streak raises the other items' weight. How: This adds 1, from a default of 1.


		} ) );


		expRowArr.push({ // What: Pick Row Push. Why: The pick drains, refilling when spent, and a new streak zeroes its weight. How: This expects the pick's row.


			chargeStep : steValNum,                         // What: Charge Step. Why: The step is kept or rolled. How: This stores the expected step.
			id         : picIteObj.id,                      // What: Identifier. Why: The row names the pick. How: This stores the pick's id.
			value      : depEndBoo ? thrValNum : nexValNum, // What: Value. Why: The pick drains, refilling when spent. How: This picks the threshold or the drained value.

			...( actIteObj ? {} : { weight : 0 } ) // What: New Streak Weight Spread. Why: A new streak zeroes its pick's weight. How: This adds weight 0 only for a new streak.


		});



		cmpUpdFun( expRowArr, actUpdArr, issAddFun, labTexStr ); // What: Drain Compare Call. Why: The staged updates must match. How: This compares them.



		if ( !!entPenObj.depletedEnd !== depEndBoo ) issAddFun( `${ labTexStr }: depletedEnd ${ entPenObj.depletedEnd }, expected ${ depEndBoo }` ); // What: Depleted Flag Check. Why: The log marks the spent day. How: This compares the flag.



		if ( !entPenObj.pickerPatch || entPenObj.pickerPatch.activeItemId !== ( depEndBoo ? null : picIteObj.id ) ) issAddFun( `${ labTexStr }: activeItemId patch ${ entPenObj.pickerPatch && entPenObj.pickerPatch.activeItemId }, expected ${ depEndBoo ? null : picIteObj.id }` ); // What: Active Patch Check. Why: A spent item ends the streak. How: This compares the picker patch.


	}

	else { // What: Draw Modes Branch. Why: Random, Weighted, and Dynamic draw from the pool. How: This checks the pick is in it and, for Dynamic, the drift.


		if ( !curEntObj || !pooIteArr.some( ( curIteObj ) => curIteObj.id === curEntObj.itemId ) ) { issAddFun( `${ labTexStr }: pick ${ curEntObj ? curEntObj.itemId : 'nothing' } isn't in the pool` ); return; } // What: Pool Guard. Why: A draw must come from the pool. How: This reports and stops when it doesn't.



		const driRowArr = updPooArr.map( ( curIteObj ) => ( { // What: Drift Row Array. Why: Dynamic resets the pick and raises the rest by 1. How: This builds each expected row.


			id    : curIteObj.id,                                               // What: Identifier. Why: The row names its item. How: This stores the item's id.
			value : curIteObj.id === curEntObj.itemId ? 0 : curIteObj.value + 1 // What: Value. Why: The pick resets and the rest drift up. How: This picks 0 or the value plus 1.


		} ) );


		cmpUpdFun( picRcdObj.mode === 'dynamic' ? driRowArr : [], actUpdArr, issAddFun, labTexStr ); // What: Drift Compare Call. Why: Dynamic resets the pick and raises the rest by 1; the others stage nothing. How: This compares the staged updates.


	}



	if ( curEntObj && entPenObj && ( entPenObj.pickedId !== curEntObj.itemId || !entPenObj.bumpPick ) ) issAddFun( `${ labTexStr }: pending pickedId ${ entPenObj.pickedId } or bumpPick ${ entPenObj.bumpPick } doesn't match the pick` ); // What: Pending Pick Check. Why: Completing the entry must count the pick. How: This checks pickedId and bumpPick.


};

// #endregion chePicFun



// #region cheGenFun

/**
 * cheGenFun = Check Generation Function
 *
 * @summary
 * Checks a whole generated day: that every active conditional's daily
 * charge flag was cleared and every Ease conditional kept its trigger, that
 * each picker produced exactly what the gates and its mode call for, that
 * day-off cards stand in for exactly the triggered conditionals, that
 * nothing unexpected was added, and that the pick log holds one auto row per
 * fresh pick. Returns every problem found, each prefixed with the day.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param preStaObj - Previous State Object: The saved state before the day.
 * @param genStaObj - Generated State Object: The saved state after the day's
 *                    list was generated.
 * @param dayIsoStr - Day ISO String: The day, as YYYY-MM-DD.
 *
 * @returns Every problem found.
 * @see {@link issMesArr}
 *
 * @example
 * ```ts
 * cheGenFun(preStaObj, genStaObj, '2026-10-06') // => [] when it's right
 * ```
 *
*/

const cheGenFun = ( preStaObj : StaAppTyp, genStaObj : StaAppTyp, dayIsoStr : string ) : string[] => { // What: Check Generation Function. Why: Every generated day must follow the rules. How: This walks the daily list and compares each picker's result.


	const issMesArr : string[] = [];                                                                                              // What: Issue Message Array. Why: Every problem is reported, not just the first. How: This collects them.
	const issAddFun = ( issMesStr : string ) => issMesArr.push( `${ dayIsoStr } generation: ${ issMesStr }` );                    // What: Issue Add Function. Why: Every report names the day and phase. How: This prefixes and stores a message.
	const conMapObj = new Map< string, ConRcdTyp >( genStaObj.conditionals.map( ( curConObj ) => [ curConObj.id, curConObj ] ) ); // What: Conditional Map Object. Why: Gates read the conditionals as resolved for today. How: This keys them by id.
	const preConMap = new Map< string, ConRcdTyp >( preStaObj.conditionals.map( ( curConObj ) => [ curConObj.id, curConObj ] ) ); // What: Previous Conditional Map. Why: Ease triggers must carry over from before. How: This keys the previous conditionals by id.
	const entRcdArr = genStaObj.today.entries;                                                                                    // What: Entry Record Array. Why: Every check reads the generated entries. How: This is today's list.
	const accEidSet = new Set< string >();                                                                                        // What: Accounted Eid Set. Why: Entries no rule called for are failures. How: This collects every entry a rule explained.
	const expDaoSet = new Set< string >();                                                                                        // What: Expected Day-Off Set. Why: Each triggered conditional shows one day-off card. How: This collects their ids.
	const picNamSet = new Set< string >();                                                                                        // What: Pick Name Set. Why: Avoiding duplicates reads the names picked so far. How: This collects them in list order.
	const freEidSet = new Set< string >();                                                                                        // What: Fresh Eid Set. Why: Only fresh picks get a new log row. How: This collects their entry ids.
	const dowValNum = dowValFun( dayIsoStr );                                                                                     // What: Day-Of-Week Value Number. Why: Pickers can be limited to weekdays. How: This reads the day's weekday.
	const holDayBoo = isaHolFun( genStaObj.holidays, dayIsoStr );                                                                 // What: Holiday Day Boolean. Why: Pickers can skip holidays. How: This checks the day.



	for ( const curConObj of genStaObj.conditionals ) { // What: Conditional Resolve Loop. Why: Generation clears every daily charge and keeps Ease triggers. How: This checks each conditional against its previous self.


		const preConObj = preConMap.get( curConObj.id ); // What: Previous Conditional Object. Why: Triggers carry over from before. How: This looks up the previous version.



		if ( curConObj.chargedToday ) issAddFun( `conditional ${ curConObj.name } still chargedToday after generating` ); // What: Charge Flag Check. Why: Every generate clears the daily charge flag. How: This reports one still set.



		const isaOffBoo = curConObj.active === false;     // What: Is-An Off Boolean. Why: An inactive conditional doesn't re-roll. How: This checks its active flag.
		const isaEauBoo = curConObj.mode === 'ease-up';   // What: Is-An Ease-Up Boolean. Why: Ease Up carries its trigger. How: This checks the mode.
		const isaEadBoo = curConObj.mode === 'ease-down'; // What: Is-An Ease-Down Boolean. Why: Ease Down carries its trigger. How: This checks the mode.

		const carTrgBoo = isaOffBoo || isaEauBoo || isaEadBoo; // What: Carried Trigger Boolean. Why: These conditionals keep their trigger on generate. How: This combines the checks.


		if ( preConObj && carTrgBoo && curConObj.triggered !== preConObj.triggered ) issAddFun( `conditional ${ curConObj.name } triggered changed on generate` ); // What: Carried Trigger Check. Why: Ease and inactive conditionals don't re-roll. How: This reports a changed trigger.


	}



	for ( const picIdeStr of genStaObj.daily.pickerIds ) { // What: Daily List Loop. Why: Generation walks the daily list in order. How: This applies every gate to each picker.


		const picRcdObj = genStaObj.pickers.find( ( curPicObj ) => curPicObj.id === picIdeStr ); // What: Picker Record Object. Why: Each id names a picker. How: This looks it up.



		if ( !picRcdObj || picRcdObj.hidden ) continue; // What: Missing Or Hidden Guard. Why: Missing and hidden pickers never run. How: This skips them.



		const picEntArr = entRcdArr.filter( ( curEntObj ) => curEntObj.pickerId === picRcdObj.id && curEntObj.kind !== 'dayoff' ); // What: Picker Entry Array. Why: Each picker's result is checked on its own. How: This collects the entries it produced.
		const offDayBoo = Array.isArray( picRcdObj.daysOfWeek ) && !picRcdObj.daysOfWeek.includes( dowValNum );                    // What: Off Day Boolean. Why: A picker can be off on some weekdays. How: This is true when today isn't one of its days.
		const nonDaiBoo = ( picRcdObj.cadence || 'daily' ) !== 'daily';                                                            // What: Non Daily Boolean. Why: Only non-daily pickers have periods. How: This reads the cadence.
		const perKeyStr = nonDaiBoo ? perStaFun( picRcdObj, dayIsoStr ) : undefined;                                               // What: Period Key String. Why: Non-daily entries carry their period's start. How: This finds it.



		if ( offDayBoo || ( picRcdObj.skipHolidays && holDayBoo ) ) { // What: Off Day Branch. Why: Weekday and holiday gates come first. How: This expects nothing from the picker.


			if ( picEntArr.length ) issAddFun( `${ picRcdObj.name } ran on an ${ offDayBoo ? 'off weekday' : 'holiday' }` ); // What: Off Day Report. Why: A gated picker produces nothing. How: This reports any entry.



			continue; // What: Off Day Continue. Why: Nothing else applies. How: This moves to the next picker.


		}



		if ( nonDaiBoo ) { // What: Period Branch. Why: Non-daily pickers carry, skip, or pick once per period. How: This checks the previous entry and the log.


			const preEntObj = preStaObj.today.entries.filter( ( curEntObj ) => curEntObj.pickerId === picRcdObj.id && curEntObj.kind !== 'dayoff' ).pop(); // What: Previous Entry Object. Why: An unfinished entry from this period carries over. How: This finds the picker's last entry before today.



			if ( preEntObj && preEntObj.periodKey === perKeyStr ) { // What: Same Period Branch. Why: An entry from this period either carries or is finished. How: This checks which.


				const carEntObj = picEntArr.find( ( curEntObj ) => curEntObj.eid === preEntObj.eid ); // What: Carried Entry Object. Why: A carried entry keeps its id. How: This finds it today.
				const notOneBoo = picEntArr.length !== 1;                                             // What: Not One Boolean. Why: A carried period has exactly one entry. How: This checks the count isn't 1.



				if ( preEntObj.done && picEntArr.length ) issAddFun( `${ picRcdObj.name } picked again after finishing its period` ); // What: Finished Period Check. Why: A finished period produces nothing. How: This reports any entry.



				if ( !preEntObj.done && ( !carEntObj || JSON.stringify( carEntObj.pending ) !== JSON.stringify( preEntObj.pending ) || notOneBoo ) ) issAddFun( `${ picRcdObj.name } didn't carry its unfinished entry unchanged` ); // What: Carry Check. Why: An unfinished entry carries over as it was. How: This reports a missing, changed, or extra entry.



				if ( carEntObj ) { accEidSet.add( carEntObj.eid ); if ( carEntObj.itemId ) picNamSet.add( ( preStaObj.items.find( ( curIteObj ) => curIteObj.id === carEntObj.itemId )?.name || '' ).toLowerCase() ); } // What: Carried Accounting. Why: A carried pick counts toward duplicates. How: This marks it explained and records its name.



				continue; // What: Same Period Continue. Why: Nothing else applies. How: This moves to the next picker.


			}



			if ( comPerFun( picRcdObj, preStaObj.pickLog, dayIsoStr ) ) { // What: Period Run Branch. Why: A period that already ran produces nothing. How: This expects no entry.


				if ( picEntArr.length ) issAddFun( `${ picRcdObj.name } picked again in a period that already ran` ); // What: Period Run Report. Why: The period is done. How: This reports any entry.



				continue; // What: Period Run Continue. Why: Nothing else applies. How: This moves to the next picker.


			}


		}



		const conRcdObj = picRcdObj.conditionalId ? conMapObj.get( picRcdObj.conditionalId ) : undefined; // What: Conditional Record Object. Why: A triggered conditional gives the picker the day off. How: This looks up the picker's gate.



		if ( conRcdObj && conRcdObj.active !== false && conRcdObj.triggered ) { // What: Day-Off Branch. Why: A triggered gate stands in a day-off card for the pick. How: This expects no pick and records the card.


			expDaoSet.add( conRcdObj.id ); // What: Expected Card Add. Why: The gate shows one card for all its pickers. How: This records the conditional.



			if ( picEntArr.length ) issAddFun( `${ picRcdObj.name } picked despite its conditional ${ conRcdObj.name } being triggered` ); // What: Gated Pick Report. Why: A gated picker produces no pick. How: This reports any entry.



			continue; // What: Day-Off Continue. Why: Nothing else applies. How: This moves to the next picker.


		}



		if ( picEntArr.length > 1 ) issAddFun( `${ picRcdObj.name } produced ${ picEntArr.length } entries` ); // What: Single Entry Check. Why: A picker produces at most one entry a day. How: This reports extras.



		const curEntObj = picEntArr[ 0 ]; // What: Current Entry Object. Why: The pick to check. How: This is the picker's entry, if any.



		chePicFun( picRcdObj, preStaObj.items, curEntObj, picNamSet, issAddFun ); // What: Pick Check Call. Why: The pick must follow the picker's mode. How: This checks it against the items before the day.



		if ( curEntObj ) { // What: Fresh Entry Branch. Why: A fresh entry needs its own shape checked. How: This checks it and records it.


			const isaDonBoo = curEntObj.done;                    // What: Is-A Done Boolean. Why: A fresh entry starts undone. How: This reads its done flag.
			const entRevObj = curEntObj.revert;                  // What: Entry Revert Object. Why: A fresh entry has no undo snapshot. How: This reads it.
			const perMisBoo = curEntObj.periodKey !== perKeyStr; // What: Period Mismatch Boolean. Why: A fresh entry carries today's period. How: This compares its period key.

			const notCleBoo = isaDonBoo || entRevObj || perMisBoo; // What: Not Clean Boolean. Why: Any of these means the entry isn't fresh. How: This combines them.


			if ( notCleBoo ) issAddFun( `${ picRcdObj.name } fresh entry isn't clean: done ${ curEntObj.done }, periodKey ${ curEntObj.periodKey }, expected ${ perKeyStr }` ); // What: Fresh Shape Check. Why: A fresh entry starts undone with today's period. How: This reports anything else.



			accEidSet.add( curEntObj.eid ); // What: Fresh Accounting. Why: This entry is explained. How: This marks it.



			if ( curEntObj.itemId ) { freEidSet.add( curEntObj.eid ); picNamSet.add( ( preStaObj.items.find( ( curIteObj ) => curIteObj.id === curEntObj.itemId )?.name || '' ).toLowerCase() ); } // What: Fresh Pick Record. Why: Fresh picks get log rows and count toward duplicates. How: This records the entry and its item's name.


		}


	}



	const daoEntArr = entRcdArr.filter( ( curEntObj ) => curEntObj.kind === 'dayoff' ); // What: Day-Off Entry Array. Why: Day-off cards are checked as a set. How: This collects them.



	for ( const daoEntObj of daoEntArr ) { // What: Day-Off Card Loop. Why: Each card must stand for one triggered conditional. How: This checks and accounts for each.


		const conRcdObj = conMapObj.get( daoEntObj.conditionalId || '' ); // What: Conditional Record Object. Why: The card names its conditional. How: This looks it up.



		if ( !conRcdObj || !expDaoSet.has( conRcdObj.id ) ) issAddFun( `unexpected day-off card for ${ daoEntObj.condName }` ); // What: Unexpected Card Report. Why: Only triggered gates show cards. How: This reports a card no gate called for.

		else { // What: Card Shape Branch. Why: An expected card must be clean. How: This checks its text, pending, and done flag.


			const texMisBoo = daoEntObj.cardText !== ( conRcdObj.cardText || conRcdObj.name ); // What: Text Mismatch Boolean. Why: A card shows its conditional's card text or name. How: This compares them.
			const entPenObj = daoEntObj.pending;                                               // What: Entry Pending Object. Why: A card stages nothing. How: This reads its pending.
			const isaDonBoo = daoEntObj.done;                                                  // What: Is-A Done Boolean. Why: A card starts undone. How: This reads its done flag.

			const notCleBoo = texMisBoo || entPenObj || isaDonBoo; // What: Not Clean Boolean. Why: Any of these means the card isn't clean. How: This combines them.


			if ( notCleBoo ) issAddFun( `day-off card for ${ conRcdObj.name } isn't clean` ); // What: Card Shape Report. Why: A card shows its text, starts undone, and stages nothing. How: This reports anything else.


		}



		accEidSet.add( daoEntObj.eid ); // What: Card Accounting. Why: This entry is explained. How: This marks it.


	}



	for ( const conIdeStr of expDaoSet ) if ( daoEntArr.filter( ( curEntObj ) => curEntObj.conditionalId === conIdeStr ).length !== 1 ) issAddFun( `expected exactly one day-off card for ${ conMapObj.get( conIdeStr )?.name }` ); // What: Card Count Loop. Why: Each triggered gate shows exactly one card. How: This counts each gate's cards.



	for ( const curEntObj of entRcdArr ) if ( !accEidSet.has( curEntObj.eid ) ) issAddFun( `unexpected entry ${ curEntObj.kind || 'pick' } for picker ${ curEntObj.pickerId }` ); // What: Stray Entry Loop. Why: Every entry must come from a rule. How: This reports any that didn't.



	const dayRowArr = genStaObj.pickLog.filter( ( logRowObj ) => logRowObj.date === dayIsoStr ); // What: Day Row Array. Why: Today's log rows must match the fresh picks. How: This collects rows dated today.



	for ( const freEidStr of freEidSet ) { // What: Fresh Row Loop. Why: Each fresh pick logs one auto row. How: This checks each pick's row.


		const freRowArr = dayRowArr.filter( ( logRowObj ) => logRowObj.eid === freEidStr ); // What: Fresh Row Array. Why: The pick's rows. How: This filters today's rows by its entry.



		if ( freRowArr.length !== 1 || freRowArr[ 0 ].source !== 'auto' || freRowArr[ 0 ].done || freRowArr[ 0 ].outcome ) issAddFun( `fresh pick ${ freEidStr } should have one clean auto log row, has ${ freRowArr.length }` ); // What: Fresh Row Check. Why: A fresh pick logs one undone auto row. How: This reports anything else.


	}



	for ( const logRowObj of dayRowArr ) if ( !freEidSet.has( logRowObj.eid || '' ) && !accEidSet.has( logRowObj.eid || '' ) ) issAddFun( `stray log row ${ logRowObj.id } dated today` ); // What: Stray Row Loop. Why: Generation purges other rows dated today. How: This reports any left.



	return issMesArr; // What: Issues Return. Why: The caller collects every day's problems. How: This returns the list.


};

// #endregion cheGenFun

// #endregion Helpers



// #region Exports

export { cheGenFun, neaEquFun, steOkaFun }; // What: Named Exports. Why: The simulation checks each day's list with cheGenFun, and the completion checks reuse the float and step helpers. How: This exports them by name.

// #endregion Exports


