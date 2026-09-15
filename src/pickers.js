



/**
 * pickers.js = Pickers
 *
 * @summary
 * Picker selection algorithms. Each mode-specific branch inside pikIteFun
 * runs against a snapshot of items and returns one common shape:
 * { picked: item|null, updates: [{id, value}], cycleCandidates: [item,
 * item, ...] }. `updates` is the list of items whose own value (and
 * sometimes weight/chargeStep) changed as a side effect of this one pick
 * (drift, reset, decay, fairness bookkeeping). `cycleCandidates` is the
 * pool the cycle animation flashes through before settling on `picked`;
 * it is just the eligible set for that mode.
 *
 * The exported PICKERS namespace object's own property names (pick,
 * readiness, easeEligible, modeEligible, EASE_TOL, avgEase,
 * DEFAULT_EASE) and the { picked, updates, cycleCandidates, depletedEnd,
 * pickerPatch } return shape itself are a cross-file contract read
 * directly by store.jsx, tab-today.jsx, tab-picker.jsx, tab-data.jsx,
 * and tab-conditional.jsx. They are deliberately left unrenamed for
 * now; renaming any of them needs its own cross-file pass, the same
 * way appearance.js's own exported bindings were deferred on its own
 * first single-file formatting pass. The three name normalizers
 * (norGroFun, norPicFun, norConFun) were swept to their own 9-char
 * names, with every one of those same 5 consumer files updated in the
 * same pass, since the blast radius was small and non-persisted.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region titCasFun

/**
 * titCasFun = Title Case Function
 *
 * @summary
 * Tidies a user-typed container-style name: collapses any separator run
 * (dashes, underscores, extra spaces) down to a single space, trims the
 * ends, then Title Cases every word. Any run of non-alphanumeric
 * characters becomes a single space, so "wind_down", "WIND-DOWN!", and
 * "wind  down" all normalize to "Wind Down". Shared by the group, picker,
 * and conditional name normalizers below, since all three are short,
 * container-type names that want the exact same tidy-up.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param rawNamStr - Raw Name String: The raw, possibly messy, user-typed name
 *                    to tidy.
 *
 * @returns The tidied, Title Cased name, or an empty string when
 * rawNamStr had no alphanumeric content at all to tidy.
 *
 * @example
 * ```ts
 * titCasFun(rawNamStr) // => tidied, Title Cased name
 * ```
 *
*/

function titCasFun( rawNamStr ) {


	const cleNamStr = String( rawNamStr || '' ).replace( /[^a-z0-9]+/gi, ' ' ).trim().replace( /\s+/g, ' ' ); // What: Cleaned Name String. Why: A messy user-typed name needs every separator run collapsed to plain single spacing before it can be split into words. How: This coerces rawNamStr to a string, turns every run of non-alphanumeric characters into one space, trims the ends, then collapses any remaining space run to one.

	if ( !cleNamStr ) return ''; // What: No Cleaned Name Guard. Why: An input with no alphanumeric content at all has nothing left to Title Case. How: This returns an empty string early when cleNamStr came out empty.



	return cleNamStr.split( ' ' ).map( ( curWorStr ) => curWorStr.charAt( 0 ).toUpperCase() + curWorStr.slice( 1 ).toLowerCase() ).join( ' ' ); // What: Title Cased Name Return. Why: The caller needs every word capitalized, not just the cleaned-up spacing. How: This splits cleNamStr on its spaces, upper-cases each word's own first letter while lower-casing the rest, then rejoins the words with single spaces.


}

// #endregion titCasFun



// #region norGroFun

/**
 * norGroFun = Normalize Group Function
 *
 * @summary
 * Title Cases a user-typed group name via {@link titCasFun}, then, if it
 * case-insensitively matches a group that already exists, returns that
 * existing entry's own exact spelling instead of the freshly Title Cased
 * one, so normalizing a name never creates a near-duplicate group that
 * only differs by casing.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param rawNamStr - Raw Name String: The raw, possibly messy, user-typed
 *                    group name.
 * @param exiGroArr - Existing Group Array: The list of group names already in
 *                    use, checked case-insensitively for a match; anything
 *                    other than a real array (including undefined) skips this
 *                    check entirely.
 *
 * @returns The existing group's own exact spelling on a case-insensitive
 * match, the freshly Title Cased name otherwise, or an empty string when
 * rawNamStr had no alphanumeric content at all.
 *
 * @example
 * ```ts
 * norGroFun(rawNamStr, exiGroArr) // => resolved group name
 * ```
 *
*/

function norGroFun( rawNamStr, exiGroArr ) {


	const titNamStr = titCasFun( rawNamStr ); // What: Titled Name String. Why: Every further step below needs the already Title Cased version of rawNamStr to compare and possibly return. How: This calls titCasFun once and reuses the result throughout.

	if ( !titNamStr ) return ''; // What: No Titled Name Guard. Why: An input with no alphanumeric content at all has no existing group worth matching against. How: This returns an empty string early when titNamStr came out empty.


	if ( Array.isArray( exiGroArr ) ) { // What: Existing Group Array Check. Why: The case-insensitive reuse lookup below only makes sense when a real array of existing names was actually given. How: This gates the lookup block so a missing or non-array exiGroArr just falls through to the plain Title Cased return.


		const hitGroStr = exiGroArr.find( ( curGroStr ) => curGroStr.toLowerCase() === titNamStr.toLowerCase() ); // What: Hit Group String. Why: An existing group whose name only differs from titNamStr by casing must be reused, not duplicated. How: This searches exiGroArr for the first entry whose lower-cased spelling matches titNamStr's own lower-cased spelling.

		if ( hitGroStr ) return hitGroStr; // What: Hit Group Guard. Why: The existing group's own exact spelling must win over the freshly Title Cased one. How: This returns hitGroStr early the moment a case-insensitive match is found.


	}



	return titNamStr; // What: Titled Name Return. Why: No existing group matched (or none was given to check against), so the freshly Title Cased name is the final result. How: This returns the same value computed by titCasFun above.


}

// #endregion norGroFun



// #region norPicFun

/**
 * norPicFun = Normalize Picker Function
 *
 * @summary
 * Title Cases a user-typed picker name via {@link titCasFun}. Unlike
 * {@link norGroFun}, this never reuses an existing spelling on a
 * case-insensitive match, since pickers are distinct entities; a
 * same-name collision is instead resolved by the store appending a "(2)"
 * suffix at its own call site.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param rawNamStr - Raw Name String: The raw, possibly messy, user-typed
 *                    picker name.
 *
 * @returns The tidied, Title Cased picker name, or an empty string when
 * rawNamStr had no alphanumeric content at all.
 *
 * @example
 * ```ts
 * norPicFun(rawNamStr) // => tidied picker name
 * ```
 *
*/

function norPicFun( rawNamStr ) { return titCasFun( rawNamStr ); } // What: Tidied Picker Name Body. Why: A picker name only ever needs the shared Title Case tidy-up, with no collision-reuse step. How: This is a thin wrapper straight over titCasFun.

// #endregion norPicFun



// #region norConFun

/**
 * norConFun = Normalize Conditional Function
 *
 * @summary
 * Title Cases a user-typed conditional name via {@link titCasFun}, the
 * same tidy-up {@link norPicFun} applies. Collision handling
 * (reusing an existing conditional on an exact case-insensitive match) is
 * left to the call site, mirroring how {@link norGroFun}'s own
 * reuse step works for groups.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param rawNamStr - Raw Name String: The raw, possibly messy, user-typed
 *                    conditional name.
 *
 * @returns The tidied, Title Cased conditional name, or an empty string
 * when rawNamStr had no alphanumeric content at all.
 *
 * @example
 * ```ts
 * norConFun(rawNamStr) // => tidied conditional name
 * ```
 *
*/

function norConFun( rawNamStr ) { return titCasFun( rawNamStr ); } // What: Tidied Conditional Name Body. Why: A conditional name only ever needs the shared Title Case tidy-up; collision reuse happens at the call site instead. How: This is a thin wrapper straight over titCasFun.

// #endregion norConFun



export { norConFun, norGroFun, norPicFun }; // What: Named Exports. Why: store.jsx, tab-picker.jsx, tab-conditional.jsx, tab-data.jsx, and tab-today.jsx all import these three normalizers individually, by these exact names. How: This re-exports all three under their own newly-renamed names, already rippled into every one of those files.



// #region ranValFun

/**
 * ranValFun = Random Value Function
 *
 * @summary
 * Returns a random floating-point value uniformly distributed in
 * [minValNum, maxValNum). Currently unused anywhere in this codebase;
 * left in place as-is during this formatting pass rather than removed,
 * since removing dead code is outside the scope of a pure
 * formatting/naming/comment pass.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param minValNum - Minimum Value Number: The smallest value the result can
 *                    take.
 * @param maxValNum - Maximum Value Number: The upper bound the result stays
 *                    strictly under.
 *
 * @returns A random value in [minValNum, maxValNum).
 *
 * @example
 * ```ts
 * ranValFun(minValNum, maxValNum) // => random value in the given range
 * ```
 *
*/

function ranValFun( minValNum, maxValNum ) { return minValNum + Math.random() * ( maxValNum - minValNum ); } // What: Random Value Body. Why: The caller needs one random value uniformly spread across the given range. How: This scales Math.random()'s own [0,1) output by the range's width, then offsets it by minValNum.

// #endregion ranValFun



// #region weiPicFun

/**
 * weiPicFun = Weighted Pick Function
 *
 * @summary
 * Picks one item from itePooArr via a weighted-random roulette-wheel
 * draw: every item's own weight (computed by weiGetFun) becomes a band on
 * a number line from 0 up to the total weight, a single random point on
 * that line is rolled, and whichever band it lands in wins. Falls back to
 * a plain uniform-random pick across itePooArr when every weight is 0 or
 * the total is otherwise non-positive, so a degenerate all-zero-weight
 * pool still produces a pick instead of always returning null.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param itePooArr - Item Pool Array: The pool of items to pick from.
 * @param weiGetFun - Weight Get Function: A function called once per item in
 *                    itePooArr, returning that item's own weight for this
 *                    draw.
 *
 * @returns The item this draw picked, or null when itePooArr is empty.
 *
 * @example
 * ```ts
 * weiPicFun(itePooArr, weiGetFun) // => picked item or null
 * ```
 *
*/

function weiPicFun( itePooArr, weiGetFun ) {


	const weiValArr = itePooArr.map( weiGetFun );                                                 // What: Weight Value Array. Why: The roulette-wheel draw below needs every item's own weight resolved up front, not recomputed on each loop iteration. How: This calls weiGetFun once per item in itePooArr.
	const totWeiNum = weiValArr.reduce( ( accValNum, curValNum ) => accValNum + curValNum, 0 ); // What: Total Weight Number. Why: The roulette wheel's own full number line spans exactly the sum of every item's weight. How: This sums every value in weiValArr.

	if ( totWeiNum <= 0 ) return itePooArr[ Math.floor( Math.random() * itePooArr.length ) ] || null; // What: Non-Positive Total Guard. Why: A degenerate all-zero (or negative) weight pool has no real roulette wheel to draw from, but should still produce a pick rather than none at all. How: This falls back to a plain uniform-random index into itePooArr.


	let rouRemNum = Math.random() * totWeiNum; // What: Roulette Remaining Number. Why: This is the single random point rolled on the roulette wheel's own number line, decremented below until it lands inside the winning item's own band. How: This scales Math.random()'s own [0,1) output by totWeiNum.


	for ( let curIndNum = 0; curIndNum < itePooArr.length; curIndNum++ ) { // What: Roulette Walk Loop. Why: Every item's own band must be walked in order until the one containing rouRemNum's own point is found. How: This walks curIndNum across itePooArr, subtracting each item's own weight from rouRemNum in turn.


		rouRemNum -= weiValArr[ curIndNum ]; // What: Roulette Remaining Decrement. Why: Subtracting this item's own weight moves the remaining point past this item's own band. How: This subtracts weiValArr's own value at curIndNum from rouRemNum.

		if ( rouRemNum <= 0 ) return itePooArr[ curIndNum ]; // What: Roulette Winner Guard. Why: rouRemNum crossing to zero or below means the rolled point landed inside this item's own band. How: This returns itePooArr's own item at curIndNum the moment that happens.


	}



	return itePooArr[ itePooArr.length - 1 ]; // What: Roulette Fallback Return. Why: Floating-point rounding could in rare cases leave rouRemNum still positive after every band has been walked. How: This returns the very last item in itePooArr as a safe fallback.


}

// #endregion weiPicFun



// #region eliPooFun

/**
 * eliPooFun = Eligible Pool Function
 *
 * @summary
 * Filters iteSouArr down to items not currently on vacation. Vacation is
 * a blanket per-item override that suppresses an item from every mode's
 * pool regardless of its own weight/value/threshold state.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param iteSouArr - Item Source Array: The items to filter.
 *
 * @returns A new array holding only iteSouArr's own non-vacationing
 * items.
 *
 * @example
 * ```ts
 * eliPooFun(iteSouArr) // => non-vacationing items
 * ```
 *
*/

function eliPooFun( iteSouArr ) { return iteSouArr.filter( ( curIteObj ) => !curIteObj.vacation ); } // What: Eligible Pool Body. Why: The caller needs only the items actually available to pick from right now. How: This keeps every item in iteSouArr whose own vacation field is falsy.

// #endregion eliPooFun



// #region pikIteFun

/**
 * pikIteFun = Pick Item Function
 *
 * @summary
 * Runs one pick against pikRecObj's own pool of eligible items, branching
 * on pikRecObj's own mode (random / weighted / dynamic / ease-up /
 * ease-down). Every branch returns the same shape: { picked, updates,
 * cycleCandidates }, with ease-down additionally returning depletedEnd
 * and pickerPatch. See this file's own header comment for the full
 * return-shape contract and why its own property names stay unrenamed.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param pikRecObj - Picker Record Object: The picker record this pick runs
 *                    against (mode, threshold, activeItemId, avoidDuplicates,
 *                    ...).
 * @param iteAllArr - Item All Array: The FULL items snapshot, not yet filtered
 *                    down to this picker's own pool; ease-down's
 *                    abandoned-item lookup deliberately searches this instead
 *                    of the filtered pool, since an abandoned item may no
 *                    longer be eligible.
 * @param optConObj - Option Control Object: Options controlling this specific
 *                    pick: excludeIds (a Set of item ids already live on
 *                    Today), excludeNames (a Set of lower-cased names already
 *                    on today's list), forceItemId (a manual, specific pick
 *                    that bypasses the normal draw), and forceNew (ease-down
 *                    only, abandons the current active item to start a fresh
 *                    streak).
 *
 * @returns This pick's own result. See this file's own header comment
 * for the full shape.
 *
 * @example
 * ```ts
 * pikIteFun(pikRecObj, iteAllArr, optConObj) // => pick result
 * ```
 *
*/

function pikIteFun( pikRecObj, iteAllArr, optConObj ) {


	let itePooArr = eliPooFun( iteAllArr.filter( ( curIteObj ) => curIteObj.pickerId === pikRecObj.id ) ); // What: Item Pool Array. Why: Every mode below draws from this picker's own eligible items only. How: This filters iteAllArr down to this picker's own items, then drops any currently on vacation via eliPooFun.


	const excIdeSet = optConObj && optConObj.excludeIds; // What: Exclude Identifier Set. Why: A manual "Pick One" spin must not land on an item already live on Today. How: This reads optConObj's own excludeIds Set, if any was given.

	if ( excIdeSet && excIdeSet.size && !( optConObj && optConObj.forceItemId ) ) { // What: Exclude Ids Check. Why: A direct forceItemId send bypasses this drop entirely, since its own button is already disabled in the UI whenever the target item is on Today. How: This gates the filter below on a real, non-empty excIdeSet and the absence of a forced pick.


		itePooArr = itePooArr.filter( ( curIteObj ) => !excIdeSet.has( curIteObj.id ) ); // What: Item Pool Exclude-Ids Filter. Why: Every id already live on Today must actually be dropped from the pool a normal draw can land on. How: This keeps only items whose own id is absent from excIdeSet.


	}


	const excNamSet = optConObj && optConObj.excludeNames; // What: Exclude Name Set. Why: A picker opted into avoidDuplicates must not resurface an item another picker already placed on Today under the same name. How: This reads optConObj's own excludeNames Set, if any was given.

	if ( pikRecObj.avoidDuplicates && excNamSet && excNamSet.size && !( optConObj && optConObj.forceItemId ) ) { // What: Avoid Duplicates Check. Why: This behavior is opt-in per picker (avoidDuplicates), skipped entirely on a forced pick, and must never leave the picker with zero eligible items. How: This gates the dedup block below on the picker's own flag, a real non-empty excNamSet, and the absence of a forced pick.


		const dedIteArr = itePooArr.filter( ( curIteObj ) => !excNamSet.has( curIteObj.name.toLowerCase() ) ); // What: Deduped Item Array. Why: This is the pool with same-named items dropped, but it must never actually replace itePooArr if doing so would leave nothing to pick from. How: This keeps only items whose own lower-cased name is absent from excNamSet.

		if ( dedIteArr.length ) itePooArr = dedIteArr; // What: Deduped Pool Guard. Why: Duplication across pickers is preferred over leaving this picker with no pick at all. How: This only swaps in dedIteArr when it actually left at least one item.


	}


	if ( !itePooArr.length ) return { picked : null, updates : [], cycleCandidates : [] }; // What: Empty Pool Guard. Why: A picker with nothing eligible at all (after vacation/exclude/dedup filtering) has no pick to make. How: This returns the same empty result shape every mode falls back to.



	switch ( pikRecObj.mode ) { // What: Mode Switch. Why: Each mode below implements a completely different selection algorithm over the same itePooArr. How: This branches on pikRecObj's own mode field.


		case 'random': { // What: Random Mode Branch. Why: This is the simplest mode, an unweighted uniform-random pick with no side effects on item state. How: This either honors a forced pick or draws one uniformly-random index from itePooArr.


			const forIdeStr = optConObj && optConObj.forceItemId; // What: Force Identifier String. Why: A manual send targets one specific item directly. How: This reads optConObj's own forceItemId, if any was given.
			const pikResObj = ( forIdeStr && itePooArr.find( ( curIteObj ) => curIteObj.id === forIdeStr ) ) || itePooArr[ Math.floor( Math.random() * itePooArr.length ) ]; // What: Picked Result Object. Why: The forced item wins outright when given and actually found; otherwise a uniform-random item is drawn. How: This tries the forced lookup first, falling back to Math.random() against itePooArr's own length.



			return { picked : pikResObj, updates : [], cycleCandidates : itePooArr }; // What: Random Mode Return. Why: Random mode never mutates item state, so updates is always empty. How: This hands back the picked item alongside the full pool as the cycle animation's own candidates.


		}

		case 'weighted': { // What: Weighted Mode Branch. Why: This mode draws proportionally to each item's own user-set weight, with no drift/decay side effects. How: This either honors a forced pick or draws via weiPicFun keyed on each item's own weight.


			const forIdeStr = optConObj && optConObj.forceItemId; // What: Force Identifier String. Why: A manual send targets one specific item directly. How: This reads optConObj's own forceItemId, if any was given.
			const pikResObj = ( forIdeStr && itePooArr.find( ( curIteObj ) => curIteObj.id === forIdeStr ) ) || weiPicFun( itePooArr, ( curIteObj ) => Math.max( 0.0001, curIteObj.weight ) ); // What: Picked Result Object. Why: The forced item wins outright when given and actually found; otherwise the weighted draw picks proportionally to weight. How: This tries the forced lookup first, falling back to weiPicFun with a floored weight so a literal 0 weight still has a sliver of a chance.



			return { picked : pikResObj, updates : [], cycleCandidates : itePooArr }; // What: Weighted Mode Return. Why: Weighted mode never mutates item state, so updates is always empty. How: This hands back the picked item alongside the full pool as the cycle animation's own candidates.


		}

		case 'dynamic': { // What: Dynamic Mode Branch. Why: This mode draws on base weight plus an accumulating drift value, so low-weight items reliably catch up over time instead of starving. How: This either honors a forced pick or draws via weiPicFun keyed on weight plus drift, then charges every item's own drift value as a side effect below.


			const forIdeStr = optConObj && optConObj.forceItemId; // What: Force Identifier String. Why: A manual send targets one specific item directly. How: This reads optConObj's own forceItemId, if any was given.
			const pikResObj = ( forIdeStr && itePooArr.find( ( curIteObj ) => curIteObj.id === forIdeStr ) ) || weiPicFun( itePooArr, ( curIteObj ) => Math.max( 0.0001, curIteObj.weight + curIteObj.value ) ); // What: Picked Result Object. Why: The forced item wins outright when given and actually found; otherwise the weighted draw picks proportionally to weight plus drift. How: This tries the forced lookup first, falling back to weiPicFun with a floored weight-plus-drift value.
			const updIteArr = []; // What: Update Item Array. Why: Every eligible item's own drift value changes as a side effect of this one pick, whether picked or not. How: This starts empty and is pushed to once per item in the loop below.


			for ( const curIteObj of itePooArr ) { // What: Drift Charge Loop. Why: Every eligible item's own drift value must be updated by this pick, not just the picked one. How: This walks itePooArr, resetting the picked item to 0 and incrementing every other item by a flat +1.


				if ( curIteObj.id === pikResObj.id ) updIteArr.push( { id : curIteObj.id, value : 0 } ); // What: Picked Item Reset. Why: The item that was just picked should not keep accumulating drift toward its own next pick. How: This pushes a value:0 update for the picked item.

				else updIteArr.push( { id : curIteObj.id, value : curIteObj.value + 1 } ); // What: Other Item Drift Increment. Why: Every eligible item that wasn't picked should get one step closer to its own next pick. How: This pushes a flat +1 drift update for every other item.


			}



			return { picked : pikResObj, updates : updIteArr, cycleCandidates : itePooArr }; // What: Dynamic Mode Return. Why: The caller needs both the pick and every drift-value change this pick caused. How: This hands back the picked item, the full drift updates, and the pool as the cycle animation's own candidates.


		}

		case 'ease-up': { // What: Ease Up Mode Branch. Why: This mode picks whichever eligible item is most overdue, on a fixed per-item charge plan rather than fresh random drift each run. How: See the design-rationale comment attached to thrValNum below for the full charge-plan model.


			/**
			 * thrValNum (ease-up) = Threshold Value Number
			 *
			 * @summary
			 * "Most overdue wins." Instead of a fresh random drift each
			 * run, each item rolls a TARGET number of cycles uniformly in
			 * its own [soonest, latest] range when it resets to 0, then
			 * charges by a FIXED step (threshold/N) so it lands in
			 * exactly N cycles, giving every duration in the range equal
			 * odds (the reciprocal drift-band collapse a naive per-cycle
			 * random step would have is gone). chargeStep persists that
			 * plan across cycles; a legacy item with none lazily rolls
			 * one via getSteFun below. Among eligible items, the MOST
			 * overdue one wins (highest value); ties break on oldest
			 * lastPicked. Weight is deliberately NOT used at all here,
			 * since ease-up is a cadence system, not a preference one.
			 *
			 * @author z4nta0 <https://github.com/z4nta0>
			 *
			*/

			const thrValNum = pikRecObj.threshold ?? 100; // What: Threshold Value Number. Why: Every charge/eligibility calculation below is relative to this picker's own threshold. How: This reads pikRecObj's own threshold, defaulting to 100 for older pickers with none set.
			const falEasObj = aveEasFun( itePooArr, pikRecObj.id ); // What: Fallback Ease Object. Why: An item with no easeMin/easeMax of its own still needs a drift band to roll a target cycle count from. How: This computes the sibling-average fallback band via aveEasFun.
			const rolSteFun = ( curIteObj ) => { // What: Roll Step Function. Why: A freshly-reset item needs a brand new fixed charge step planned, uniformly across its own eligible cycle-count range. How: This rolls a target cycle count in [sooCycNum, latCycNum], then returns the fixed step that lands the item exactly on thrValNum in that many cycles.


				const sooCycNum = Math.max( 1, Math.round( thrValNum / ( curIteObj.easeMax ?? falEasObj.easeMax ) ) );                  // What: Soonest Cycle Number. Why: This is the fewest cycles this item's own band allows before becoming eligible. How: This divides thrValNum by the item's own (or fallback) easeMax, its fastest charge rate.
				const latCycNum = Math.max( sooCycNum, Math.round( thrValNum / ( curIteObj.easeMin ?? falEasObj.easeMin ) ) ); // What: Latest Cycle Number. Why: This is the most cycles this item's own band allows before becoming eligible. How: This divides thrValNum by the item's own (or fallback) easeMin, its slowest charge rate, floored at sooCycNum so the range is never inverted.
				const tarCycNum = sooCycNum + Math.floor( Math.random() * ( latCycNum - sooCycNum + 1 ) );                             // What: Target Cycle Number. Why: Every duration in [sooCycNum, latCycNum] should have equal odds of being this item's own plan. How: This rolls a uniform-random integer across that inclusive range.



				return thrValNum / tarCycNum; // What: Roll Step Return. Why: A fixed step of this size charges the item from 0 to exactly thrValNum in exactly tarCycNum cycles. How: This divides thrValNum by tarCycNum.


			};

			const getSteFun = ( curIteObj ) => ( curIteObj.chargeStep && curIteObj.chargeStep > 0 ) ? curIteObj.chargeStep : rolSteFun( curIteObj ); // What: Get Step Function. Why: An item already mid-plan must keep charging by its own already-rolled step; only a legacy item with none rolls a fresh one. How: This returns curIteObj's own chargeStep when it's a real positive number, rolling one via rolSteFun otherwise.
			const chgUpdFun = ( curIteObj ) => { // What: Charge Update Function. Why: A waiting item needs its own resolved step both applied to its value and persisted for next cycle. How: This resolves the step once via getSteFun, then returns an update carrying both the new value and that same step.


				const curSteNum = getSteFun( curIteObj ); // What: Current Step Number. Why: This item's own resolved charge step is needed twice below, for the value increment and the persisted chargeStep. How: This calls getSteFun once and reuses the result.



				return { // What: Charge Update Return. Why: The caller needs this item's own newly-charged value and the step that produced it landing together as one update. How: This builds that update from curIteObj's own id, its incremented value, and curSteNum.


					id         : curIteObj.id,               // What: Id. Why: The caller needs to know which item this update applies to. How: This carries curIteObj's own id through unchanged.
					value      : curIteObj.value + curSteNum, // What: Value. Why: This is the actual charged value the caller needs to persist. How: This adds curSteNum onto curIteObj's own current value.
					chargeStep : curSteNum                    // What: Charge Step. Why: Next cycle must keep charging by this exact same step, not roll a new one. How: This carries curSteNum through unchanged for getSteFun to find on the next pass.


				};


			};

			const eliIteArr = itePooArr.filter( ( curIteObj ) => easEliFun( curIteObj, thrValNum ) ); // What: Eligible Item Array. Why: Only items that have actually charged up to (within tolerance of) thrValNum can be picked naturally. How: This keeps every item in itePooArr that easEliFun reports as eligible.
			const forIdeStr = optConObj && optConObj.forceItemId; // What: Force Identifier String. Why: A manual send (Today's Re-roll) may target any item in the pool, bypassing the eligibility gate entirely. How: This reads optConObj's own forceItemId, if any was given.
			const forIteObj = forIdeStr && itePooArr.find( ( curIteObj ) => curIteObj.id === forIdeStr ); // What: Forced Item Object. Why: A forced pick searches the WHOLE pool, not just eliIteArr, since the user chose this item directly. How: This looks forIdeStr up against itePooArr rather than eliIteArr.

			if ( !eliIteArr.length && !forIteObj ) { // What: No Eligible Item Guard. Why: With nothing eligible and no forced target, this cycle can only charge every waiting item, not actually pick one. How: This gates the early-return charge-only branch below.


				const updIteArr = itePooArr.map( chgUpdFun ); // What: Update Item Array. Why: Every item still needs its own charge applied even when nothing becomes eligible this cycle. How: This maps chgUpdFun across the whole pool.



				return { picked : null, updates : updIteArr, cycleCandidates : itePooArr }; // What: No Eligible Item Return. Why: The caller needs the charge updates applied even though there is no pick this cycle. How: This returns a null pick alongside updIteArr and the full pool.


			}


			const getTimFun = ( curIteObj ) => curIteObj.lastPicked ? Date.parse( curIteObj.lastPicked ) : 0; // What: Get Time Function. Why: A tie between equally-overdue items must break on whichever waited longest. How: This resolves an item's own lastPicked into a comparable timestamp, treating a never-picked item as the oldest possible (0).
			const pikResObj = forIteObj || eliIteArr.reduce( ( besIteObj, curIteObj ) => { // What: Picked Result Object. Why: A forced target wins outright; otherwise the most overdue eligible item (by value, ties broken by oldest lastPicked) is picked. How: This reduces eliIteArr, keeping whichever of besIteObj/curIteObj is more overdue by the rules in its own body.


				if ( !besIteObj ) return curIteObj; // What: First Candidate Guard. Why: The very first item walked by the reduce has nothing yet to compare against. How: This seeds besIteObj with curIteObj on that first iteration.

				if ( curIteObj.value !== besIteObj.value ) return curIteObj.value > besIteObj.value ? curIteObj : besIteObj; // What: Higher Value Check. Why: A strictly more-overdue item (higher value) always wins over a less-overdue one. How: This compares curIteObj's own value against besIteObj's own value directly.



				return getTimFun( curIteObj ) < getTimFun( besIteObj ) ? curIteObj : besIteObj; // What: Oldest Timestamp Tiebreak Return. Why: Two equally-overdue items must break their tie on whichever has waited longest. How: This compares both items' own resolved timestamps via getTimFun, keeping the older one.


			}, null );

			const updIteArr = itePooArr.map( ( curIteObj ) => curIteObj.id === pikResObj.id ? { id : curIteObj.id, value : 0, chargeStep : rolSteFun( curIteObj ) } : chgUpdFun( curIteObj ) ); // What: Update Item Array. Why: The picked item must reset to 0 and roll a fresh plan, while every other item charges by its own existing plan. How: This maps itePooArr, branching per item on whether it matches pikResObj's own id.

			/**
			 * ovrShoArr = Overshoot Array
			 *
			 * @summary
			 * Values overshoot thrValNum while waiting, and with many
			 * items that overshoot can drift into the hundreds over
			 * time. This compresses it by pulling every still-waiting
			 * item (value > thrValNum) down by the SMALLEST overshoot in
			 * that group, so the least-overdue waiter lands back at
			 * exactly thrValNum and the rest keep their own relative
			 * order. Sub-threshold charging items are untouched, so each
			 * item's own time-to-eligible (its cadence) is preserved
			 * exactly; only the unbounded slack is removed. This needs
			 * at least 2 overshooting items to mean anything; with only
			 * one, "compress relative to the smallest" degenerates into
			 * subtracting the item's own overshoot from itself,
			 * unconditionally clamping any lone waiter back to exactly
			 * thrValNum every cycle it isn't picked. That was the actual
			 * bug this guards against: items looked like they could
			 * never exceed 100.
			 *
			 * @author z4nta0 <https://github.com/z4nta0>
			 *
			*/

			const ovrShoArr = updIteArr.filter( ( curUpdObj ) => curUpdObj.value > thrValNum ).map( ( curUpdObj ) => curUpdObj.value - thrValNum ); // What: Overshoot Array. Why: Compressing the inflation below needs every still-waiting item's own overshoot amount, not just which items overshot. How: This keeps updates whose value exceeds thrValNum, then maps each to how far past thrValNum it landed.

			if ( ovrShoArr.length > 1 ) { // What: Multiple Overshoot Guard. Why: Compressing relative to the smallest overshoot only means something with at least 2 overshooting items; with only one, it degenerates into clamping that lone item back to exactly thrValNum every cycle. How: This gates the compression block below on there being more than one overshooting item.


				const minOvrNum = Math.min( ...ovrShoArr ); // What: Minimum Overshoot Number. Why: Pulling every overshooting item down by the SMALLEST overshoot preserves their relative order while removing the shared unbounded slack. How: This finds the smallest value in ovrShoArr.

				if ( minOvrNum > 0 ) { // What: Positive Minimum Guard. Why: A zero minimum overshoot means nothing to compress at all. How: This gates the actual subtraction loop below on minOvrNum being genuinely positive.


					for ( const curUpdObj of updIteArr ) if ( curUpdObj.value > thrValNum ) curUpdObj.value -= minOvrNum; // What: Overshoot Compression Loop. Why: Every still-waiting item above thrValNum needs the same minOvrNum subtracted, so the least-overdue waiter lands back at exactly thrValNum. How: This walks updIteArr, decrementing value in place for every entry still above thrValNum.


				}


			}



			return { picked : pikResObj, updates : updIteArr, cycleCandidates : eliIteArr }; // What: Ease Up Mode Return. Why: The caller needs the pick, every item's own charge/reset update, and the naturally-eligible set as the cycle animation's own candidates. How: This hands back pikResObj, updIteArr, and eliIteArr.


		}

		case 'ease-down': { // What: Ease Down Mode Branch. Why: This mode maintains a perpetual fair-rotation streak, one active item depleting over several cycles before a new one starts. How: See the design-rationale comment attached to thrValNum below for the full two-counter model.


			/**
			 * thrValNum (ease-down) = Threshold Value Number
			 *
			 * @summary
			 * Perpetual fair-rotation model. Two things drive it, tracked
			 * separately. value is the active item's own remaining
			 * CHARGE: it decays each run while active, and at or below
			 * EAS_TOL_NUM's own tolerance the item auto-recharges to full
			 * and is released back into the pool, never depleting
			 * permanently. weight is a system-managed FAIRNESS counter
			 * (NOT a user preference, not surfaced in the UI): it changes
			 * ONLY when a NEW active item is chosen, never on the
			 * intermediate decay runs. At that moment the chosen item
			 * resets to 0 and every OTHER item gains +1. A weight of 0 is
			 * excluded from selection, so exactly one item (the
			 * most-recently-picked) is barred from being re-picked on the
			 * very next draw; it re-enters at weight 1 on the following
			 * pick. Long-ignored items climb and grow steadily more
			 * likely, fixing truly-random's own "an item can be ignored
			 * forever / picked twice in a row" failure mode. A newly
			 * chosen item rolls a target N cycles uniformly in its own
			 * [shortest, longest] range and decays by a fixed step
			 * (thrValNum/N), emptying in exactly N cycles; chargeStep
			 * persists that plan across the streak, and a legacy item
			 * with none lazily rolls one via rolSteFun below.
			 *
			 * @author z4nta0 <https://github.com/z4nta0>
			 *
			*/

			const thrValNum = pikRecObj.threshold ?? 100; // What: Threshold Value Number. Why: Every charge/decay calculation below is relative to this picker's own threshold. How: This reads pikRecObj's own threshold, defaulting to 100 for older pickers with none set.
			const falEasObj = aveEasFun( itePooArr, pikRecObj.id ); // What: Fallback Ease Object. Why: An item with no easeMin/easeMax of its own still needs a decay band to roll a target cycle count from. How: This computes the sibling-average fallback band via aveEasFun.
			const rolSteFun = ( curIteObj ) => { // What: Roll Step Function. Why: A freshly-chosen item needs a brand new fixed decay step planned, uniformly across its own eligible cycle-count range. How: This rolls a target cycle count in [sooCycNum, latCycNum], then returns the fixed step that empties the item exactly in that many cycles.


				const sooCycNum = Math.max( 1, Math.round( thrValNum / ( curIteObj.easeMax ?? falEasObj.easeMax ) ) );                  // What: Soonest Cycle Number. Why: This is the fewest cycles this item's own band allows before fully depleting. How: This divides thrValNum by the item's own (or fallback) easeMax, its fastest decay rate.
				const latCycNum = Math.max( sooCycNum, Math.round( thrValNum / ( curIteObj.easeMin ?? falEasObj.easeMin ) ) ); // What: Latest Cycle Number. Why: This is the most cycles this item's own band allows before fully depleting. How: This divides thrValNum by the item's own (or fallback) easeMin, its slowest decay rate, floored at sooCycNum so the range is never inverted.
				const tarCycNum = sooCycNum + Math.floor( Math.random() * ( latCycNum - sooCycNum + 1 ) );                             // What: Target Cycle Number. Why: Every duration in [sooCycNum, latCycNum] should have equal odds of being this item's own plan. How: This rolls a uniform-random integer across that inclusive range.



				return thrValNum / tarCycNum; // What: Roll Step Return. Why: A fixed step of this size decays the item from thrValNum to 0 in exactly tarCycNum cycles. How: This divides thrValNum by tarCycNum.


			};

			const forIdeStr = optConObj && optConObj.forceItemId; // What: Force Identifier String. Why: A manual send may target a specific item directly. How: This reads optConObj's own forceItemId, if any was given.
			const forNewBoo = !!( optConObj && optConObj.forceNew ) || !!( forIdeStr && forIdeStr !== pikRecObj.activeItemId ); // What: Force New Boolean. Why: A manual send of a DIFFERENT item than the current active one must start a fresh streak, same as an explicit re-roll. How: This is true when optConObj.forceNew was given directly, or when forIdeStr names an item other than pikRecObj's own current activeItemId.
			const updIteArr = []; // What: Update Item Array. Why: Both branches below (continue vs. start new) need a shared place to collect their own item-state changes. How: This starts empty and is pushed to by whichever branch below actually runs.


			let actIteObj = null; // What: Active Item Object. Why: The continue-branch below needs to know whether there is a real, still-charged active item to keep decaying. How: This starts null and is only assigned when pikRecObj's own activeItemId resolves to a real, still-positive item.

			if ( pikRecObj.activeItemId && !forNewBoo ) { // What: Active Item Lookup Check. Why: A streak can only continue when this picker actually has an active item AND this draw isn't forcing a new one. How: This gates the lookup below on both conditions holding.


				actIteObj = itePooArr.find( ( curIteObj ) => curIteObj.id === pikRecObj.activeItemId && curIteObj.value > 0 ); // What: Active Item Object Assignment. Why: An active item that has already fully depleted (value at or below 0) doesn't count as still active. How: This searches itePooArr for the item matching pikRecObj's own activeItemId with a positive value remaining.


			}


			if ( actIteObj ) { // What: Continue Streak Check. Why: A real active item found above means this draw continues its own depletion rather than starting a new streak. How: This gates the whole continue-branch below, which returns directly.


				const decValNum = ( actIteObj.chargeStep && actIteObj.chargeStep > 0 ) ? actIteObj.chargeStep : rolSteFun( actIteObj ); // What: Decay Value Number. Why: An item already mid-plan must keep decaying by its own already-rolled step; only a legacy item with none rolls a fresh one. How: This returns actIteObj's own chargeStep when it's a real positive number, rolling one via rolSteFun otherwise.
				const newValNum = Math.max( 0, actIteObj.value - decValNum );                                                          // What: New Value Number. Why: The active item's own remaining charge must never go negative. How: This subtracts decValNum from actIteObj's own value, floored at 0.
				const depEndBoo = newValNum <= 0.5;                                                                                     // What: Depleted End Boolean. Why: A half-unit tolerance matches easEliFun's own, so a step that lands a hair under 0 still counts as fully depleted this cycle. How: This checks newValNum against 0.5 rather than a strict 0.

				updIteArr.push( { id : actIteObj.id, value : depEndBoo ? thrValNum : newValNum, chargeStep : decValNum } ); // What: Continue Update Push. Why: A depleted item must auto-recharge to full rather than sit at (or below) 0 forever. How: This pushes newValNum normally, or thrValNum when depEndBoo, alongside the same decValNum for the next cycle's own plan.



				return { // What: Continue Streak Return. Why: The active item stays picked while it decays, releasing back into the pool (activeItemId cleared) only once fully depleted. How: This returns actIteObj as the pick, updIteArr, itself as the sole cycle candidate, and a pickerPatch clearing activeItemId only when depEndBoo.


					picked          : actIteObj,
					updates         : updIteArr,
					cycleCandidates : [ actIteObj ],
					depletedEnd     : depEndBoo,
					pickerPatch     : { activeItemId : depEndBoo ? null : actIteObj.id }


				};


			}


			const abaIdeStr = forNewBoo ? pikRecObj.activeItemId : null; // What: Abandoned Identifier String. Why: A forced new streak abandons whatever was active, which still needs recharging back to full below. How: This reads pikRecObj's own activeItemId only when forNewBoo, null otherwise.

			if ( abaIdeStr ) { // What: Abandoned Item Check. Why: An abandoned item needs recharging back to full charge, just like a naturally-released one. How: This gates the lookup-and-recharge block below on there actually being an abandoned item.


				const oldIteObj = iteAllArr.find( ( curIteObj ) => curIteObj.id === abaIdeStr ); // What: Old Item Object. Why: The abandoned item may no longer be eligible (or even still exist), so this must search the FULL snapshot, not just itePooArr. How: This searches iteAllArr for the item matching abaIdeStr.

				if ( oldIteObj ) updIteArr.push( { id : oldIteObj.id, value : thrValNum } ); // What: Abandoned Item Recharge Push. Why: The abandoned item must recharge to full even though this draw is choosing a different one. How: This pushes a value:thrValNum update for oldIteObj, only when it was actually found.


			}


			let canIteArr = itePooArr.filter( ( curIteObj ) => ( curIteObj.weight ?? 1 ) > 0 && curIteObj.id !== abaIdeStr ); // What: Candidate Item Array. Why: The new streak's draw excludes the single most-recently-picked item (weight 0) and the just-abandoned one. How: This keeps items with a positive (or defaulted) weight whose id doesn't match abaIdeStr.

			if ( !canIteArr.length ) canIteArr = itePooArr.filter( ( curIteObj ) => curIteObj.id !== abaIdeStr ); // What: No Weighted Candidate Fallback. Why: An all-zero-weight pool would otherwise leave nothing to draw from. How: This falls back to every item except the abandoned one, ignoring weight entirely.

			if ( !canIteArr.length ) canIteArr = itePooArr; // What: No Candidate Fallback. Why: A pool of exactly one item (which is also the abandoned one) would otherwise leave nothing at all. How: This falls back to the full pool as a last resort.


			const chsIteObj = ( forIdeStr && itePooArr.find( ( curIteObj ) => curIteObj.id === forIdeStr ) ) || weiPicFun( canIteArr, ( curIteObj ) => Math.max( 0, curIteObj.weight ?? 1 ) ); // What: Chosen Item Object. Why: A forced target wins outright when given and actually found; otherwise the new streak draws weighted by fairness weight. How: This tries the forced lookup first, falling back to weiPicFun against canIteArr.


			for ( const curIteObj of itePooArr ) { // What: Fairness Bookkeeping Loop. Why: Every OTHER item's own fairness weight must climb by 1, and this happens only here, on a new-streak draw. How: This walks itePooArr, skipping the chosen item and pushing a weight+1 update for every other one.


				if ( curIteObj.id === chsIteObj.id ) continue; // What: Chosen Item Skip. Why: The chosen item's own weight resets to 0 below instead, not +1 here. How: This skips straight to the next item when curIteObj is the one just chosen.

				updIteArr.push( { id : curIteObj.id, weight : ( curIteObj.weight ?? 1 ) + 1 } ); // What: Other Item Weight Increment Push. Why: Every item not chosen this draw should become steadily more likely on a future one. How: This pushes a weight update one higher than curIteObj's own current (or defaulted) weight.


			}


			const basValNum = chsIteObj.value > 0 ? chsIteObj.value : thrValNum; // What: Base Value Number. Why: The freshly-chosen item decays from its own full charge, which may already be sitting at thrValNum or need defaulting there. How: This uses chsIteObj's own value when positive, thrValNum otherwise.
			const decValNum = rolSteFun( chsIteObj );                              // What: Decay Value Number. Why: A brand new streak always rolls a fresh decay plan, never reusing a stale chargeStep. How: This calls rolSteFun directly for chsIteObj.
			const newValNum = Math.max( 0, basValNum - decValNum );                // What: New Value Number. Why: The freshly-chosen item's own first decay step must never go negative. How: This subtracts decValNum from basValNum, floored at 0.
			const depEndBoo = newValNum <= 0.5;                                    // What: Depleted End Boolean. Why: Same half-unit tolerance as the continue-branch above, in case a single-cycle plan empties immediately. How: This checks newValNum against 0.5 rather than a strict 0.

			updIteArr.push( { id : chsIteObj.id, value : depEndBoo ? thrValNum : newValNum, weight : 0, chargeStep : decValNum } ); // What: New Streak Update Push. Why: The chosen item's own weight resets to 0 (excluding it from the very next draw) alongside its first decay step. How: This pushes the resolved value, a weight of 0, and decValNum for next cycle's own plan.



			return { // What: New Streak Return. Why: The chosen item becomes the new active one while it decays, tracked via pickerPatch's own activeItemId. How: This returns chsIteObj as the pick, updIteArr, canIteArr as the cycle candidates, and a pickerPatch setting activeItemId only when not already depEndBoo.


				picked          : chsIteObj,
				updates         : updIteArr,
				cycleCandidates : canIteArr,
				depletedEnd     : depEndBoo,
				pickerPatch     : { activeItemId : depEndBoo ? null : chsIteObj.id }


			};


		}

		default: // What: Default Branch. Why: An unrecognized or missing mode has no defined algorithm to run. How: This falls through to the same empty result shape every mode falls back to below.


			return { picked : null, updates : [], cycleCandidates : [] }; // What: Default Branch Return. Why: There is no algorithm defined for an unrecognized mode. How: This returns the same empty result shape used by the empty-pool guard above.


	}


}

// #endregion pikIteFun



// #region reaValFun

/**
 * reaValFun = Readiness Value Function
 *
 * @summary
 * Computes a 0-1 readiness number for one item under its own picker's
 * mode, used by the Pickers view's "current state" rows as a visual
 * progress indicator. Modes with no meaningful readiness concept (random,
 * weighted) return null.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param iteRecObj - Item Record Object: The item to compute readiness for.
 * @param modKeyStr - Mode Key String: The item's own picker's mode.
 * @param thrValNum - Threshold Value Number: The item's own picker's
 *                    threshold, defaulting to 100 to match every other
 *                    threshold default in this file.
 *
 * @returns A 0-1 readiness number, or null when modKeyStr has no
 * meaningful readiness concept.
 *
 * @example
 * ```ts
 * reaValFun(iteRecObj, modKeyStr, thrValNum) // => 0-1 readiness or null
 * ```
 *
*/

function reaValFun( iteRecObj, modKeyStr, thrValNum = 100 ) {


	if ( modKeyStr === 'ease-up' ) return Math.min( 1, iteRecObj.value / thrValNum ); // What: Ease Up Readiness Check. Why: Ease Up's own readiness is how close the item's value has charged toward thrValNum. How: This divides iteRecObj's own value by thrValNum, capped at 1.

	if ( modKeyStr === 'ease-down' ) return Math.max( 0, iteRecObj.value / thrValNum ); // What: Ease Down Readiness Check. Why: Ease Down's own readiness is how much charge the active item has left before depleting. How: This divides iteRecObj's own value by thrValNum, floored at 0.

	if ( modKeyStr === 'dynamic' ) return Math.min( 1, iteRecObj.value / 50 ); // What: Dynamic Readiness Check. Why: Dynamic's own drift value has no fixed threshold, so this uses a flat soft cap purely for visualization. How: This divides iteRecObj's own value by a fixed 50, capped at 1.



	return null; // What: No Readiness Return. Why: Random and weighted modes have no meaningful readiness concept at all. How: This returns null for every mode not already handled above.


}

// #endregion reaValFun



const DEF_EAS_OBJ = { easeMin : 7, easeMax : 14 }; // What: Default Ease Object. Why: A brand new picker with no items yet (or an ease-mode switch before any item has its own band) needs some flat drift band to fall back to. How: This is read directly by aveEasFun below whenever every sibling item (or the pool itself) has nothing better to offer.



// #region aveEasFun

/**
 * aveEasFun = Average Ease Function
 *
 * @summary
 * Computes a fallback easeMin/easeMax drift band for an ease-up/ease-down
 * item with no band of its own, by averaging the OTHER items already on
 * the same picker (each falling back to DEF_EAS_OBJ itself, so a single
 * bare sibling can't skew this into NaN), rather than keeping a separate
 * per-picker default in sync by hand. Used both to stamp a freshly added
 * item's own easeMin/easeMax immediately, and, for any item that still
 * doesn't have its own values, as the same safety-net fallback pikIteFun
 * itself uses.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param iteAllArr - Item All Array: The items to average siblings from (only
 *                    entries matching pikIdeStr are actually used).
 * @param pikIdeStr - Picker Identifier String: The picker id whose own items'
 *                    band should be averaged.
 *
 * @returns { easeMin, easeMax }, averaged from iteAllArr's own matching
 * items, or a copy of DEF_EAS_OBJ when none exist at all.
 *
 * @example
 * ```ts
 * aveEasFun(iteAllArr, pikIdeStr) // => { easeMin, easeMax }
 * ```
 *
*/

function aveEasFun( iteAllArr, pikIdeStr ) {


	const sibIteArr = ( iteAllArr || [] ).filter( ( curIteObj ) => curIteObj.pickerId === pikIdeStr ); // What: Sibling Item Array. Why: Only this picker's own items should factor into its own averaged band. How: This filters iteAllArr down to items whose own pickerId matches pikIdeStr.

	if ( !sibIteArr.length ) return { ...DEF_EAS_OBJ }; // What: No Sibling Guard. Why: A picker with no items yet at all has nothing real to average. How: This returns a fresh copy of DEF_EAS_OBJ early when sibIteArr came out empty.


	const aveKeyFun = ( curKeyStr ) => sibIteArr.reduce( ( sumValNum, curIteObj ) => sumValNum + ( curIteObj[ curKeyStr ] ?? DEF_EAS_OBJ[ curKeyStr ] ), 0 ) / sibIteArr.length; // What: Average Key Function. Why: Both easeMin and easeMax need the exact same averaging logic, just keyed differently. How: This sums curKeyStr across sibIteArr (each falling back to DEF_EAS_OBJ's own value when missing), divided by the sibling count.



	return { easeMin : Math.max( 1, Math.round( aveKeyFun( 'easeMin' ) ) ), easeMax : Math.max( 1, Math.round( aveKeyFun( 'easeMax' ) ) ) }; // What: Averaged Ease Return. Why: The caller needs a real, rounded, at-least-1 band, not a raw (possibly fractional or zero) average. How: This rounds and floors-at-1 both aveKeyFun results.


}

// #endregion aveEasFun



const EAS_TOL_NUM = 0.5; // What: Ease Tolerance Number. Why: A threshold/N charge step (100/3, say) can land a hair under thrValNum on the very cycle it was planned to become eligible, and this tolerance must be the ONE place that's decided, not re-derived per caller. How: This is read directly by easEliFun below, the single source every eligibility check in this file and its callers must use.
const easEliFun   = ( iteRecObj, thrValNum ) => ( iteRecObj.value ?? 0 ) >= ( ( thrValNum ?? 100 ) - EAS_TOL_NUM ); // What: Ease Eligible Function. Why: Comparing an item's own value against its threshold directly (with no tolerance) can make an item at 99.7 invisible to a re-roll cycle count while still being eligible to the generator itself, a real inconsistency this file used to have. How: This treats iteRecObj as eligible once its own value reaches thrValNum minus EAS_TOL_NUM, both defaulted the same way pikIteFun defaults them.



const modEliFun = ( iteRecObj, pikRecObj ) => { // What: Mode Eligible Function. Why: Some callers need to know whether an item could be picked RIGHT NOW under its own picker's mode, independent of whether the item is active/inactive. How: This branches on pikRecObj's own mode, delegating ease-up to easEliFun and treating ease-down/dynamic/random/weighted by their own simpler rules.


	if ( !pikRecObj ) return true; // What: No Picker Guard. Why: With no picker to check a mode against, nothing can be ruled ineligible. How: This returns true early when pikRecObj is missing.

	if ( pikRecObj.mode === 'ease-up' ) return easEliFun( iteRecObj, pikRecObj.threshold ); // What: Ease Up Mode Check. Why: Ease Up's own eligibility is exactly easEliFun's own tolerance-aware threshold check. How: This delegates straight to easEliFun.

	if ( pikRecObj.mode === 'ease-down' ) return ( iteRecObj.value ?? 0 ) > 0; // What: Ease Down Mode Check. Why: Ease Down's own eligibility is simply having any charge left at all. How: This checks iteRecObj's own value against 0 directly.



	return true; // What: Default Mode Return. Why: Random, weighted, and dynamic modes have no additional eligibility rule beyond already being in the pool. How: This returns true for every mode not already handled above.


};



export const PICKERS = { // What: Pickers Namespace Object. Why: store.jsx, tab-today.jsx, and tab-picker.jsx all import this one namespace object rather than several individual named exports. How: This maps every one of this file's own renamed internal implementations back onto the SAME external property names those callers already depend on, deliberately left unrenamed (see this file's own header comment).


	pick         : pikIteFun,   // What: Pick Function. Why: tab-today.jsx and tab-picker.jsx both call this to actually pick a new item from a picker's own pool. How: This re-exports pikIteFun under its own matching name.
	readiness    : reaValFun,   // What: Readiness Function. Why: tab-picker.jsx reads this for a pool item's own readiness value. How: This re-exports reaValFun under its own matching name.
	easeEligible : easEliFun,   // What: Ease Eligible Function. Why: tab-today.jsx checks this to decide whether an ease-mode item is currently eligible to be picked. How: This re-exports easEliFun under its own matching name.
	modeEligible : modEliFun,   // What: Mode Eligible Function. Why: tab-picker.jsx checks this for a pool item's own mode-specific eligibility. How: This re-exports modEliFun under its own matching name.
	EASE_TOL     : EAS_TOL_NUM, // What: Ease Tolerance Number. Why: Nothing outside this file currently reads this directly, but it stays exported as part of PICKERS' own stable public shape. How: This re-exports EAS_TOL_NUM under its own matching name.
	avgEase      : aveEasFun,   // What: Average Ease Function. Why: store.jsx, tab-today.jsx, and tab-picker.jsx all call this for a picker's own average ease-band value. How: This re-exports aveEasFun under its own matching name.
	DEFAULT_EASE : DEF_EAS_OBJ  // What: Default Ease Object. Why: store.jsx reads this for a fresh item's own starting ease-band shape. How: This re-exports DEF_EAS_OBJ under its own matching name.


};


