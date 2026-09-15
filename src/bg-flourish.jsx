


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library this file's two components are built on. How: This is used directly (React.useState, React.useEffect, React.Fragment) throughout, instead of importing individual named hooks.

// #endregion Imports



/**
 * bg-flourish.jsx = Background Flourish
 *
 * @summary
 * Subtle decorative math/randomness glyphs sprinkled in the empty side margins
 * around the main content column, never behind actual content, purely in the
 * gutters .main-inner (or Today's own .today-body, which shares the same
 * centered-column shape) leaves open once there's enough room for at least a
 * couple of grid columns (see MIN_COL_NUM below).
 *
 * Placement is a real pixel grid, not percentages: fixed-size columns across
 * the gutter's actual measured width, fixed-size rows down the container's
 * actual measured content height (via scrollHeight, which is why it needs a
 * DOM measurement instead of the pure-CSS trick the previous version used).
 * Once a glyph claims a cell, every neighboring cell (including diagonals) is
 * excluded for every other glyph. This is what guarantees real spacing in both
 * x and y at once, instead of the independent-per-axis bands the previous
 * version used, which still let two glyphs land close to each other whenever
 * they happened to share an axis. A minority of glyphs claim a 2x2 block
 * (bigger, spans two rows and two columns) instead of a single cell; at most
 * one per row.
 *
 * Generated once per real page load, cached per tab the first time that tab is
 * actually visited (not all five upfront); each tab has its own gutter width
 * and content height, so a single shared layout can't fit all of them
 * accurately. The cache lives in this module's own closure, so it resets on an
 * actual page reload but survives switching tabs back and forth within the
 * same session.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const FLO_SYM_ARR = [ '✓', '⁓', '←', '→', '△', '∑', '√', '∛', '∳', '≤', '≥', '±', '∞', '≈', '∅' ]; // What: Flourish Symbol Array. Why: This is the fixed pool of glyphs a placed item can render as. How: This is drawn from by the symbol cycler inside genSidFun below.



/**
 * COL_WID_NUM = Column Width Number
 *
 * @summary
 * Originally calibrated against a 1920px-wide viewport on a tab using the
 * wider of the app's two content max-widths (Today's own .today-body, 960px,
 * the tighter case, leaving less gutter than the other tabs' 720px at the same
 * viewport width): (1920 - 40 padding - 960) / 2 = 460px of gutter, for 6 full
 * columns + 1 half column. Sized down twice since (71->60->50, 60->48->40) for
 * more density each time; how many columns/rows actually fit at any width/tab
 * still just falls out of the real measured gutter width and content height
 * divided by these, no separate lookup table needed.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const COL_WID_NUM = 50; // What: Column Width Number. Why: This is the fixed pixel width every full placement column is divided into. How: This is used throughout genSidFun/plaGriFun to convert the measured gutter width into a column count and per-column pixel offsets.
const ROW_HEI_NUM = 40; // What: Row Height Number. Why: This is the fixed pixel height every placement row is divided into. How: This is used throughout genSidFun/plaGriFun to convert the measured content height into a row count and per-row pixel offsets.



/**
 * MIN_COL_NUM = Minimum Column Number
 *
 * @summary
 * Below this many full columns there's not enough room to bother; no point
 * placing glyphs into a sliver of margin.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const MIN_COL_NUM = 2; // What: Minimum Column Number. Why: A gutter too narrow for at least this many full columns isn't worth decorating at all. How: This is checked in genSidFun, which returns no items at all when the measured gutter falls short of it.



/**
 * BIG_CHA_NUM = Big Chance Number
 *
 * @summary
 * Chance, per available row, of attempting a 2x2 "big" glyph there instead of
 * (or in addition to, in other cells) a normal one.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const BIG_CHA_NUM = 0.12; // What: Big Chance Number. Why: A minority of glyphs should render noticeably larger, for visual variety. How: This is the probability, checked once per eligible row in plaGriFun, of that row's glyph claiming a 2x2 block instead of a single cell.



// #region shuArrFun

/**
 * shuArrFun = Shuffle Array Function
 *
 * @summary
 * Returns a shuffled copy of the given array, using an in-place
 * Fisher-Yates shuffle on a duplicate so the caller's own array is never
 * mutated.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param souEleArr - Source Element Array: The array to shuffle. Left
 *                    untouched; a shuffled copy is returned instead.
 *
 * @returns A new array holding the same elements as souEleArr, in random
 * order.
 *
 * @example
 * ```ts
 * shuArrFun(souEleArr) // => shuffled copy of souEleArr
 * ```
 *
*/

function shuArrFun( souEleArr ) {


	const copSouArr = souEleArr.slice(); // What: Copy Source Array. Why: The caller's own array must not be mutated by the shuffle below. How: This makes a shallow copy that the loop below shuffles in place instead.


	for ( let curIndNum = copSouArr.length - 1; curIndNum > 0; curIndNum-- ) { // What: Fisher-Yates Loop. Why: This is the standard algorithm for an unbiased in-place shuffle. How: This walks the array backward, swapping each element with a randomly-chosen earlier (or same) one.


		const swaIndNum = Math.floor( Math.random() * ( curIndNum + 1 ) ); // What: Swap Index Number. Why: The element at curIndNum needs a random partner at or before its own position to swap with. How: This picks a uniform random integer in [0, curIndNum].


		[ copSouArr[ curIndNum ], copSouArr[ swaIndNum ] ] = [ copSouArr[ swaIndNum ], copSouArr[ curIndNum ] ]; // What: Element Swap. Why: This is the actual shuffle step for this iteration. How: This swaps the two chosen positions via array destructuring.


	}



	return copSouArr; // What: Copy Source Return. Why: The caller needs the shuffled result back. How: This returns the same array the loop above shuffled in place.


}

// #endregion shuArrFun



// #region ranArrFun

/**
 * ranArrFun = Range Array Function
 *
 * @summary
 * Builds a plain array of sequential integers from 0 up to (but not
 * including) the given length.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param lenValNum - Length Value Number: How many integers to produce.
 *
 * @returns An array [0, 1, 2, ..., lenValNum - 1].
 *
 * @example
 * ```ts
 * ranArrFun(lenValNum) // => [0, 1, ..., lenValNum - 1]
 * ```
 *
*/

function ranArrFun( lenValNum ) { return Array.from( { length : lenValNum }, ( _, i ) => i ); } // What: Range Array Body. Why: A plain sequential-integer array is needed repeatedly throughout this file to drive shuffled row/column walks. How: This is a thin wrapper over Array.from's own index-generator form.

// #endregion ranArrFun



// #region makCycFun

/**
 * makCycFun = Make Cycler Function
 *
 * @summary
 * Builds a "cycler": a zero-argument function that hands out values from
 * a shuffled pool, reshuffling a fresh pool once the current one is
 * exhausted. This keeps values well-distributed over any window without
 * needing to know the total count of calls up front, unlike a
 * fixed-total "generate N unique values" approach.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param pooFacFun - Pool Factor Function: A zero-argument function that
 *                    produces a fresh pool array each time it's called.
 *
 * @returns A zero-argument function that returns one value from
 * pooFacFun's pool per call, reshuffling automatically once exhausted.
 *
 * @example
 * ```ts
 * makCycFun(pooFacFun) // => () => next value from the cycled pool
 * ```
 *
*/

function makCycFun( pooFacFun ) {


	let curPooArr = []; // What: Current Pool Array. Why: This is the shuffled pool values are currently being handed out from. How: This starts empty so the very first call below immediately triggers a fresh pool.
	let pooIndNum = 0;  // What: Pool Index Number. Why: This tracks how far through curPooArr the cycler has already handed out. How: This starts at 0 and advances by 1 on every call, reset to 0 whenever a fresh pool is drawn.



	return () => {


		if ( pooIndNum >= curPooArr.length ) { // What: Pool Exhausted Guard. Why: Once every value in the current pool has been handed out, a fresh shuffled pool is needed. How: This draws a new pool from pooFacFun and resets the index when the current one runs out.


			curPooArr = pooFacFun(); // What: Pool Refill. Why: The exhausted pool must be replaced before a value can be handed out. How: This calls pooFacFun again to draw a freshly-shuffled pool.

			pooIndNum = 0; // What: Pool Index Reset. Why: The freshly-drawn pool must be handed out starting from its own first element. How: This resets the index back to 0 to match the new pool.


		}



		return curPooArr[ pooIndNum++ ]; // What: Next Value Return. Why: This is the actual value this call hands back. How: This reads the pool at the current index, then advances the index for next time.


	};


}

// #endregion makCycFun



// #region eveSpaFun

/**
 * eveSpaFun = Evenly Spaced Function
 *
 * @summary
 * Builds an array of n values evenly spaced between min and max
 * inclusive.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param minValNum - Minimum Value Number: The smallest value in the returned
 *                    array.
 * @param maxValNum - Maximum Value Number: The largest value in the returned
 *                    array.
 * @param couValNum - Count Value Number: How many values to produce.
 *
 * @returns An array of couValNum values, evenly spaced from minValNum to
 * maxValNum inclusive (or just [minValNum] when couValNum is 1 or less).
 *
 * @example
 * ```ts
 * eveSpaFun(minValNum, maxValNum, couValNum) // => evenly spaced array
 * ```
 *
*/

function eveSpaFun( minValNum, maxValNum, couValNum ) {


	if ( couValNum <= 1 ) return [ minValNum ]; // What: Single Value Guard. Why: A step can't be computed with fewer than 2 points, and a single point should just be the minimum. How: This returns a one-element array early when couValNum doesn't call for a real spread.



	const steValNum = ( maxValNum - minValNum ) / ( couValNum - 1 ); // What: Step Value Number. Why: This is the fixed increment between each consecutive returned value. How: This divides the full range by one less than the requested count.



	return ranArrFun( couValNum ).map( ( i ) => minValNum + steValNum * i ); // What: Evenly Spaced Return. Why: The caller needs the actual spread values, not just the step. How: This maps each sequential index onto minValNum plus that many steps.


}

// #endregion eveSpaFun



// #region bloAroFun

/**
 * bloAroFun = Block Around Function
 *
 * @summary
 * Marks every cell in the 3x3-or-larger neighborhood around a placed
 * glyph (including diagonals, and the full footprint of a 2x2 "big"
 * glyph) as excluded in the given grid, mutating it in place.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param bloGriArr - Blocked Grid Array: The 2D excluded-cells grid to mutate.
 * @param rowIndNum - Row Index Number: The row of the placed glyph's own
 *                    top-left cell.
 * @param colIndNum - Column Index Number: The column of the placed glyph's own
 *                    top-left cell.
 * @param heiSpaNum - Height Spacing Number: How many rows the placed glyph
 *                    itself spans (1 for a normal glyph, 2 for a "big" one).
 * @param widSpaNum - Width Spacing Number: How many columns the placed glyph
 *                    itself spans (1 for a normal glyph, 2 for a "big" one).
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * bloAroFun(bloGriArr, rowIndNum, colIndNum, heiSpaNum, widSpaNum) // => void
 * ```
 *
*/

function bloAroFun( bloGriArr, rowIndNum, colIndNum, heiSpaNum, widSpaNum ) {


	const rowCouNum = bloGriArr.length;      // What: Row Count Number. Why: The neighborhood walk below must not read or write past the grid's own real bounds. How: This is read once from the grid's own outer length and reused in the guard below.
	const colCouNum = bloGriArr[ 0 ].length; // What: Column Count Number. Why: Same reasoning as rowCouNum, for the grid's own column bound. How: This is read once from the first row's own length and reused in the guard below.


	for ( let curRowNum = rowIndNum - 1; curRowNum <= rowIndNum + heiSpaNum; curRowNum++ ) { // What: Row Neighborhood Loop. Why: Every row from one above the glyph's own top edge to one below its own bottom edge must be excluded. How: This walks curRowNum across that full span.


		for ( let curColNum = colIndNum - 1; curColNum <= colIndNum + widSpaNum; curColNum++ ) { // What: Column Neighborhood Loop. Why: Every column from one left of the glyph's own left edge to one right of its own right edge must be excluded. How: This walks curColNum across that full span for each curRowNum above.


			const rowMinBoo = curRowNum >= 0;        // What: Row Min Boolean. Why: A neighborhood row above the glyph's own top edge can fall above the grid's own first row entirely. How: This checks that curRowNum hasn't gone negative.
			const rowMaxBoo = curRowNum < rowCouNum; // What: Row Max Boolean. Why: A neighborhood row below the glyph's own bottom edge can fall past the grid's own last row entirely. How: This checks that curRowNum stays under rowCouNum.
			const colMinBoo = curColNum >= 0;        // What: Column Min Boolean. Why: A neighborhood column left of the glyph's own left edge can fall before the grid's own first column entirely. How: This checks that curColNum hasn't gone negative.
			const colMaxBoo = curColNum < colCouNum; // What: Column Max Boolean. Why: A neighborhood column right of the glyph's own right edge can fall past the grid's own last column entirely. How: This checks that curColNum stays under colCouNum.

			const witBouBoo = rowMinBoo && rowMaxBoo && colMinBoo && colMaxBoo; // What: Within Bound Boolean. Why: A neighborhood cell that falls outside the grid's own real edges doesn't exist and must not be written to. How: This combines all 4 individual checks with &&, true only when both the row and column stay within the grid's own bounds.


			if ( witBouBoo ) bloGriArr[ curRowNum ][ curColNum ] = true; // What: In Bounds Exclusion. Why: The cell just confirmed safe by witBouBoo needs to actually be marked excluded for later placements. How: This writes true into bloGriArr once witBouBoo allows it.


		}


	}


}

// #endregion bloAroFun



// #region plaGriFun

/**
 * plaGriFun = Place Grid Function
 *
 * @summary
 * Greedy grid placement for one gutter: walks rows in random order, and
 * within each row walks columns in random order, placing a glyph (maybe
 * a 2x2 "big" one, at most once per row) into any cell not already
 * excluded by an earlier placement, then excluding its own neighborhood
 * so nothing else can land adjacent to it. Density falls out of however
 * many rows/columns actually fit; there's no separate "N per row" cap.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param colCouNum - Column Count Number: How many columns the grid has.
 * @param rowCouNum - Row Count Number: How many rows the grid has.
 *
 * @returns An array of { row, col, big } placements, one per glyph.
 *
 * @example
 * ```ts
 * plaGriFun(colCouNum, rowCouNum) // => array of { row, col, big }
 * ```
 *
*/

function plaGriFun( colCouNum, rowCouNum ) {


	const bloGriArr = ranArrFun( rowCouNum ).map( () => new Array( colCouNum ).fill( false ) ); // What: Blocked Grid Array. Why: This is the excluded-cells grid every placement below both reads from and writes into. How: This builds a rowCouNum by colCouNum grid, starting with every cell unexcluded.
	const plaIteArr = [];                                                                       // What: Placement Item Array. Why: This collects every glyph placement this function produces. How: This starts empty and is pushed to once per placed glyph below.


	for ( const rowIndNum of shuArrFun( ranArrFun( rowCouNum ) ) ) { // What: Row Walk Loop. Why: Walking rows in random order avoids any systematic bias toward the top or bottom of the gutter. How: This iterates a shuffled copy of every row index.


		let rowBigBoo = false; // What: Row Big Boolean. Why: At most one "big" glyph is allowed per row. How: This starts false and is set true the moment a big glyph is actually placed in the current row.


		for ( const colIndNum of shuArrFun( ranArrFun( colCouNum ) ) ) { // What: Column Walk Loop. Why: Walking columns in random order, within each row, avoids any systematic bias toward either edge of the gutter. How: This iterates a shuffled copy of every column index for the current row.


			if ( bloGriArr[ rowIndNum ][ colIndNum ] ) continue; // What: Excluded Cell Guard. Why: A cell already excluded by an earlier placement's own neighborhood can't take a glyph. How: This skips straight to the next column when the current cell is already blocked.



			const rowOpeBoo = !rowBigBoo;                                                             // What: Row Open Boolean. Why: At most one "big" glyph is allowed per row, so a row that already claimed one can't be considered for another. How: This is the negation of rowBigBoo, true only while this row's own big-glyph budget is still unspent.
			const rowFitBoo = rowIndNum + 1 < rowCouNum;                                              // What: Row Fit Boolean. Why: A 2x2 glyph needs one additional row below its own top-left cell, which must still fall inside the grid. How: This checks that rowIndNum plus 1 stays under rowCouNum.
			const colFitBoo = colIndNum + 1 < colCouNum;                                              // What: Column Fit Boolean. Why: A 2x2 glyph also needs one additional column to the right of its own top-left cell, which must still fall inside the grid. How: This checks that colIndNum plus 1 stays under colCouNum.
			const rigOpeBoo = colFitBoo && !bloGriArr[ rowIndNum ][ colIndNum + 1 ];                  // What: Right Open Boolean. Why: The cell directly to the right of the glyph's own top-left cell must itself be unexcluded for a 2x2 glyph to fit there, but only exists to check when colFitBoo already confirmed that column is in bounds. How: This short-circuits on colFitBoo before reading bloGriArr, avoiding an out-of-bounds access when the column doesn't exist.
			const botOpeBoo = rowFitBoo && !bloGriArr[ rowIndNum + 1 ][ colIndNum ];                  // What: Bottom Open Boolean. Why: The cell directly below the glyph's own top-left cell must itself be unexcluded for a 2x2 glyph to fit there, but only exists to check when rowFitBoo already confirmed that row is in bounds. How: This short-circuits on rowFitBoo before reading bloGriArr, avoiding an out-of-bounds access when the row doesn't exist.
			const diaOpeBoo = rowFitBoo && colFitBoo && !bloGriArr[ rowIndNum + 1 ][ colIndNum + 1 ]; // What: Diagonal Open Boolean. Why: The cell diagonally opposite the glyph's own top-left cell must itself be unexcluded for a 2x2 glyph to fit there, but only exists to check when both rowFitBoo and colFitBoo already confirmed that row and column are in bounds. How: This short-circuits on both fit checks before reading bloGriArr, avoiding an out-of-bounds access when either doesn't exist.

			const canBigBoo = rowOpeBoo && rowFitBoo && colFitBoo && rigOpeBoo && botOpeBoo && diaOpeBoo; // What: Can Big Boolean. Why: A 2x2 glyph can only be placed here when the row still has budget for one and all 4 of its own cells are free. How: This combines all 6 individual checks with &&, true only when every one of them holds.


			const isaBigBoo = canBigBoo && Math.random() < BIG_CHA_NUM; // What: Is-A Big Boolean. Why: Even when a big glyph COULD fit here, it should only actually happen sometimes. How: This rolls against BIG_CHA_NUM, only when canBigBoo already allows it.


			plaIteArr.push( { row : rowIndNum, col : colIndNum, big : isaBigBoo } ); // What: Placement Push. Why: This is the actual glyph placement this iteration produces. How: This records the chosen cell and whether it claimed a big footprint.

			bloAroFun( bloGriArr, rowIndNum, colIndNum, isaBigBoo ? 2 : 1, isaBigBoo ? 2 : 1 ); // What: Block Around Call. Why: Nothing else may land adjacent to the glyph just placed. How: This excludes the placed glyph's own full neighborhood, sized to match whether it was big.


			if ( isaBigBoo ) rowBigBoo = true; // What: Row Big Flag Update. Why: This row's own big-glyph budget is now spent. How: This flips rowBigBoo so no later column in this same row can also claim a big glyph.


		}


	}



	return plaIteArr; // What: Placement Item Return. Why: The caller needs every placement this function produced. How: This returns the same array pushed to throughout the loop above.


}

// #endregion plaGriFun



// #region genSidFun

/**
 * genSidFun = Generate Side Function
 *
 * @summary
 * Generates one gutter's worth of placed, styled glyph data. Column
 * index 0 is innermost (against the content edge); the last column is
 * the roughly-half-width one meant to visually bleed off the edge of the
 * viewport. Its band width is whatever's actually left over after
 * fitting as many full columns as possible, not a fixed half-COL_WID_NUM,
 * which (since gutter width rarely divides evenly by COL_WID_NUM) would
 * usually end up short of the true gutter edge and leave a strip of dead
 * space beyond it, defeating the bleed entirely. Anchoring flush against
 * the real edge instead means a glyph's own rendered width (up to 92px,
 * much wider than that leftover band) does the bleeding on its own;
 * body's own overflow-x: hidden clips whatever crosses the actual
 * viewport edge.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param gutWidNum - Gutter Width Number: The gutter's own measured width, in
 *                    pixels.
 * @param conHeiNum - Content Height Number: The tab's own measured content
 *                    height, in pixels.
 *
 * @returns An array of styled glyph items ready to render, or an empty
 * array when the gutter is too narrow to bother decorating at all.
 *
 * @example
 * ```ts
 * genSidFun(gutWidNum, conHeiNum) // => array of styled glyph items
 * ```
 *
*/

function genSidFun( gutWidNum, conHeiNum ) {


	const fulColNum = Math.max( 0, Math.floor( gutWidNum / COL_WID_NUM - 0.3 ) ); // What: Full Column Number. Why: This is how many complete, fixed-width columns actually fit in the measured gutter. How: This divides the gutter width by the fixed column width, nudged down slightly so a column that just barely fits isn't counted.


	if ( fulColNum < MIN_COL_NUM ) return []; // What: Too Narrow Guard. Why: A gutter too narrow to bother decorating should render nothing at all. How: This returns an empty array early when fulColNum falls short of MIN_COL_NUM.



	const colCouNum = fulColNum + 1;                                        // What: Column Count Number. Why: Placement itself needs one extra column beyond the full ones, for the half-width bleed column. How: This adds 1 to fulColNum.
	const outBanNum = gutWidNum - fulColNum * COL_WID_NUM;                  // What: Outer Band Number. Why: The bleed column's own real width is whatever pixels are left over, not a fixed half-column guess. How: This subtracts every full column's own width from the total gutter width.
	const rowCouNum = Math.max( 1, Math.floor( conHeiNum / ROW_HEI_NUM ) ); // What: Row Count Number. Why: Placement needs to know how many fixed-height rows fit down the tab's own measured content height. How: This divides the content height by the fixed row height, with at least 1 row even for very short content.


	const nexSymFun = makCycFun( () => shuArrFun( FLO_SYM_ARR ) );              // What: Next Symbol Function. Why: Each placed glyph needs a symbol, well-distributed across the whole pool rather than repeating nearby. How: This is a cycler drawing from a freshly-shuffled copy of FLO_SYM_ARR each time it's exhausted.
	const nexRotFun = makCycFun( () => shuArrFun( eveSpaFun( -28, 28, 11 ) ) ); // What: Next Rotation Function. Why: Each placed glyph needs a rotation angle, well-distributed across the whole range rather than repeating nearby. How: This is a cycler drawing from a freshly-shuffled copy of 11 evenly-spaced angles between -28 and 28 degrees.
	const nexSizFun = makCycFun( () => shuArrFun( eveSpaFun( 24, 48, 9 ) ) );   // What: Next Size Function. Why: Each normal placed glyph needs a font size, well-distributed across the whole range rather than repeating nearby. How: This is a cycler drawing from a freshly-shuffled copy of 9 evenly-spaced sizes between 24 and 48.
	const nexBigFun = makCycFun( () => shuArrFun( eveSpaFun( 64, 66, 5 ) ) );   // What: Next Big Function. Why: A "big" placed glyph needs its own, larger font size range. How: This is a cycler drawing from a freshly-shuffled copy of 5 evenly-spaced sizes between 64 and 66.



	return plaGriFun( colCouNum, rowCouNum ).map( ( { row : rowIndNum, col : colIndNum, big : isaBigBoo }, iteIndNum ) => { // What: Placement Map Callback. Why: Every raw grid placement above still needs to become one fully-styled, renderable glyph item. How: This maps each { row, col, big } placement onto a { id, big, top, inset, symbol, size, opacity, rotate } item.


		const isaOutBoo = colIndNum === colCouNum - 1;                                // What: Is-An Outer Boolean. Why: The bleed column needs a different band width than every full column. How: This checks whether the placement's own column is the last (bleed) one.
		const banWidNum = isaOutBoo ? outBanNum : COL_WID_NUM;                        // What: Band Width Number. Why: The jitter below needs to know how wide this specific placement's own column band actually is. How: This picks outBanNum for the bleed column, COL_WID_NUM for every full one.
		const colJitNum = banWidNum * 0.1 + Math.random() * ( banWidNum * 0.85 );     // What: Column Jitter Number. Why: A glyph sitting at the exact same offset within every column would look too mechanical. How: This picks a random horizontal offset within the column's own band, inset slightly from both its edges.
		const insPosNum = colIndNum * COL_WID_NUM + colJitNum;                        // What: Inset Position Number. Why: This is the glyph's own final horizontal offset from the content edge. How: This adds the jittered offset within its own column to that column's own starting position.
		const rowJitNum = ROW_HEI_NUM * 0.15 + Math.random() * ( ROW_HEI_NUM * 0.7 ); // What: Row Jitter Number. Why: Same reasoning as colJitNum, for the vertical axis. How: This picks a random vertical offset within the row's own band, inset slightly from both its edges.



		return { // What: Placement Item Return. Why: Every raw grid placement needs to become one fully-styled, renderable item using all the values computed above. How: This builds the final { id, big, top, inset, symbol, size, opacity, rotate } object for this one glyph.


			ideStr  : `${ rowIndNum }-${ colIndNum }-${ iteIndNum }`,                       // What: Identifier String. Why: Each rendered glyph needs a stable, unique React key. How: This concatenates the placement's own row, column, and item index into one string.
			bigBoo  : isaBigBoo,                                                            // What: Big Boolean. Why: The rendering component needs to know whether this glyph claimed a 2x2 footprint. How: This carries the same isaBigBoo value computed above straight through.
			topNum  : rowIndNum * ROW_HEI_NUM + rowJitNum,                                  // What: Top Number. Why: The rendered glyph needs its own absolute vertical offset within the gutter. How: This converts the placement's own row index into pixels and adds the jittered offset.
			insNum  : insPosNum,                                                            // What: Inset Number. Why: The rendered glyph needs its own absolute horizontal offset from the content edge. How: This carries the same insPosNum value computed above straight through.
			symStr  : nexSymFun(),                                                          // What: Symbol String. Why: Each glyph needs an actual character to render. How: This draws the next well-distributed symbol from the cycler built above.
			sizNum  : isaBigBoo ? nexBigFun() : nexSizFun(),                                // What: Size Number. Why: A big glyph needs its own larger font-size range than a normal one. How: This draws from nexBigFun when isaBigBoo, nexSizFun otherwise.
			opaNum  : 0.08 + Math.random() * 0.1,                                           // What: Opacity Number. Why: Glyphs should stay subtle, not compete with real content. How: This picks a random opacity in a narrow, low-visibility range.
			rotNum  : nexRotFun()                                                           // What: Rotate Number. Why: Each glyph needs its own rotation angle for visual variety. How: This draws the next well-distributed angle from the cycler built above.


		};


	} );


}

// #endregion genSidFun



const floCacMap = new Map(); // What: Flourish Cache Map. Why: Every generated side must survive switching tabs back and forth within the same session, without regenerating on every visit. How: This is read/written by useFloIteFun below, keyed by tab id.



// #region useFloIteFun

/**
 * useFloIteFun = Use Flourish Items
 *
 * @summary
 * Loads (from floCacMap) or generates this tab's own left/right flourish
 * items, caching the result once generated. Uses a plain useEffect
 * rather than useLayoutEffect deliberately: meaEleRef points at this
 * component's own PARENT (.main-inner / .today-body), and React attaches
 * refs and fires layout effects bottom-up within the same commit, so a
 * child's useLayoutEffect would run before its ancestor's own ref has
 * even been attached, leaving meaEleRef.current still null. A plain
 * useEffect fires after that commit settles, at the cost of a
 * one-frame-later pop-in that's a non-issue for a decorative background
 * layer.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tabIdeStr - Tab Identifier String: The current tab's own id, used as
 *                    the cache key.
 * @param meaEleRef - Measure Element Reference: A ref pointing at the tab's
 *                    own centered-column container, whose real measured
 *                    width/height the grid is generated against.
 *
 * @returns The tab's own { left, right } generated flourish items, or
 * null before the first measurement has completed.
 *
 * @example
 * ```tsx
 * useFloIteFun(tabIdeStr, meaEleRef) // => { left, right } or null
 * ```
 *
*/

function useFloIteFun( tabIdeStr, meaEleRef ) {


	const [ floIteObj, setFloIteObj ] = React.useState( () => floCacMap.get( tabIdeStr ) || null ); // What: Flourish Item Object And Setter. Why: A tab already generated earlier in this session should render immediately, without waiting on the effect below. How: This seeds itself from floCacMap if this tab's own entry already exists, null otherwise.


	React.useEffect( () => { // What: Generate Effect. Why: A tab not already cached needs its own gutters measured and generated exactly once. How: This checks the cache first, then measures meaEleRef's own parent .main and generates both sides if nothing was cached.


		if ( floCacMap.has( tabIdeStr ) ) { setFloIteObj( floCacMap.get( tabIdeStr ) ); return; } // What: Cache Hit Guard. Why: A tab generated earlier in this session must not be regenerated. How: This applies the cached entry directly and bails out of the rest of the effect.



		const meaCurEle = meaEleRef.current;                         // What: Measure Current Element. Why: This is the actual DOM node whose real size the grid is generated against. How: This is read once from meaEleRef.current and reused for every measurement below.
		const maiCurEle = meaCurEle && meaCurEle.closest( '.main' ); // What: Main Current Element. Why: The gutter width is measured relative to the shared .main wrapper, not the centered column itself. How: This walks up from meaCurEle to its nearest .main ancestor.


		if ( !meaCurEle || !maiCurEle ) return; // What: No Element Guard. Why: Without both elements mounted there is nothing real to measure yet. How: This bails out of the effect early, leaving floIteObj at its prior (likely null) value.



		const maiStyObj = getComputedStyle( maiCurEle );                                                                                        // What: Main Style Object. Why: The gutter width calculation below needs .main's own actual left/right padding. How: This reads .main's live computed style once, reused for both padding reads.
		const padSumNum = ( parseFloat( maiStyObj.paddingLeft ) || 0 ) + ( parseFloat( maiStyObj.paddingRight ) || 0 );                         // What: Padding Sum Number. Why: The measured gutter width must exclude .main's own inner padding on both sides. How: This adds maiStyObj's own left and right padding together, falling back to 0 for either if unparseable.
		const gutWidNum = Math.max( 0, ( maiCurEle.getBoundingClientRect().width - padSumNum - meaCurEle.getBoundingClientRect().width ) / 2 ); // What: Gutter Width Number. Why: This is the actual per-side gutter width every placement below is generated against. How: This subtracts the padding and the centered column's own width from .main's total width, then halves what remains.
		const conHeiNum = meaCurEle.scrollHeight;                                                                                               // What: Content Height Number. Why: Row placement needs to know how tall the tab's own real content actually is. How: This reads meaCurEle's own scrollHeight, which (unlike a pure-CSS approach) reflects the true rendered content height.
		const genIteObj = { left : genSidFun( gutWidNum, conHeiNum ), right : genSidFun( gutWidNum, conHeiNum ) };                              // What: Generated Item Object. Why: Both gutters need their own independently-generated placement. How: This calls genSidFun twice, once per side, with the same measured dimensions.


		floCacMap.set( tabIdeStr, genIteObj ); // What: Flourish Cache Set. Why: This tab must not be regenerated on a later visit within the same session. How: This stores the freshly-generated items under this tab's own id.


		setFloIteObj( genIteObj ); // What: Flourish Item Object Update. Why: The freshly-generated items need to actually render. How: This applies the same object just cached above.


	}, [ tabIdeStr, meaEleRef ] ); // What: Effect Dependency Array. Why: A different tab needs its own cache lookup/generation, and a changed ref (rare, but possible across remounts) needs to re-measure. How: tabIdeStr changes which cache entry applies; meaEleRef changes what gets measured.



	return floIteObj; // What: Flourish Item Object Return. Why: The caller needs this tab's own current items (or null, before the first measurement). How: This returns the same state the effect above populates.


}

// #endregion useFloIteFun



// #region FloColCom

/**
 * FloColCom = Flourish Column Component
 *
 * @summary
 * Renders one gutter's worth of already-generated, already-styled
 * flourish items as absolutely-positioned decorative spans.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.sidKeyStr - Side Key String: Which side this column renders on,
 *                          'left' or 'right'; flips which CSS inset property
 *                          each item's own insNum applies to.
 * @param props.floIteArr - Floor Item Array: This side's own array of
 *                          already-generated, already-styled items to render.
 *
 * @returns This side's own flourish items, each as one absolutely-
 * positioned decorative span, or null when there is nothing to render.
 *
 * @example
 * ```tsx
 * FloColCom({ sidKeyStr, floIteArr }) // => <FloColCom />
 * ```
 *
*/

function FloColCom( { side : sidKeyStr, items : floIteArr } ) {


	if ( !floIteArr.length ) return null; // What: No Items Guard. Why: An empty side has nothing decorative to render at all. How: This returns null early rather than rendering an empty wrapper div.



	return (


		<div
			className={ ` bg-flourish   bg-flourish--${ sidKeyStr } ` }
			aria-hidden='true'
		>{ /* What: Flourish Column Div Element. Why: This is one gutter's own root wrapper, positioned by CSS per its own bg-flourish--{side} modifier class. How: This renders every item below as an absolutely-positioned child span. */ }


			{ floIteArr.map( ( floCurObj ) => ( // What: Flourish Item Map. Why: One span is needed per already-generated item. How: This maps floIteArr to one absolutely-positioned span per entry, keyed by its own ideStr.


				<span
					key={ floCurObj.ideStr }
					className={ ` bg-flourish-item   ${ floCurObj.bigBoo ? 'is-big' : '' } ` }
					style={{
						top       : `${ floCurObj.topNum }px`,
						fontSize  : `${ floCurObj.sizNum }px`,
						opacity   : floCurObj.opaNum,
						transform : `rotate(${ floCurObj.rotNum }deg)`,

						[ sidKeyStr === 'left' ? 'right' : 'left' ] : `${ floCurObj.insNum }px`
					}}
				>{ /* What: Flourish Item Span Element. Why: This is the actual decorative glyph, absolutely positioned within its own parent gutter. How: This renders floCurObj's own symbol, sized/rotated/positioned entirely via the inline style above. */ }


					{ floCurObj.symStr }


				</span>


			) ) }


		</div>


	);


}

// #endregion FloColCom



// #region BacFloCom

/**
 * BacFloCom = Background Flourish Component
 *
 * @summary
 * Renders both of a tab's decorative gutters (left and right), loading
 * or generating this tab's own flourish items via useFloIteFun and
 * handing each side's own array to its own FloColCom instance.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.tabId      - Tab Id: The current tab's own id, used as the
 *                           cache key.
 * @param props.measureRef - Measure Reference: A ref pointing at the tab's own
 *                           centered- column container, whose real measured
 *                           width/height the grid is generated against.
 *
 * @returns Both of this tab's own gutters, each as one FloColCom
 * instance, or null before the first measurement has completed.
 *
 * @example
 * ```tsx
 * BacFloCom({ tabId, measureRef }) // => <BacFloCom />
 * ```
 *
*/

function BacFloCom( { tabId : tabIdeStr, measureRef : meaEleRef } ) {


	const floIteObj = useFloIteFun( tabIdeStr, meaEleRef ); // What: Flourish Item Object. Why: Both gutters below need this tab's own already-generated (or not-yet-generated) items. How: This calls the hook above, which returns null until the first measurement completes.


	if ( !floIteObj ) return null; // What: No Items Guard. Why: There is nothing to render before the first measurement has completed. How: This returns null early rather than rendering two empty gutters.



	return (


		<React.Fragment>{ /* What: Flourish Fragment Element. Why: The two gutters are true siblings with no shared wrapper element of their own. How: This groups FloColCom's own left and right instances without adding an extra DOM node. */ }


			<FloColCom side='left' items={ floIteObj.left } />{ /* What: Flourish Column Component. Why: This renders the left gutter's own already-generated items. How: This is passed 'left' and floIteObj's own left array. */ }

			<FloColCom side='right' items={ floIteObj.right } />{ /* What: Flourish Column Component. Why: This renders the right gutter's own already-generated items. How: This is passed 'right' and floIteObj's own right array. */ }


		</React.Fragment>


	);


}

// #endregion BacFloCom



export { BacFloCom }; // What: Named Exports. Why: app.jsx and tab-today.jsx both render this behind their own tab content. How: This re-exports BacFloCom; every other binding in this file is internal-only.



