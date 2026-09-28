


// #region Imports

import cssModObj from './progress-bar.module.css'; // What: CSS Module Object. Why: The bar's own track and fill styles live in its own module. How: This maps each class name in progress-bar.module.css to its hashed module class.

// #endregion Imports



/**
 * progress-bar.jsx = Progress Bar
 *
 * @summary
 * The dash-bar used to show completion. Its fill is the current value over the
 * maximum, clamped to the 0-100% range so an over-full or negative value never
 * breaks the bar.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region ProBarCom

/**
 * ProBarCom = Progress Bar Component
 *
 * @summary
 * The dash-bar every group header and Stats card uses to show
 * completion. The fill is curValNum over maxValNum, clamped to the
 * 0-100% range, so an over-full or negative value never breaks the
 * bar.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.curValNum - Current Value Number: How far along the progress
 *                          is.
 * @param props.maxValNum - Maximum Value Number: The value that means full,
 *                          defaulting to 1.
 * @param props.tonValStr - Tone Value String: The color modifier, defaulting
 *                          to 'accent'.
 *
 * @returns The progress track and its fill.
 *
 * @example
 * ```tsx
 * ProBarCom({ curValNum, maxValNum, tonValStr }) // => <ProBarCom />
 * ```
 *
*/

const ProBarCom = ( { curValNum, maxValNum = 1, tonValStr = 'accent' } ) => ( // What: Progress Bar Component. Why: Every group header and Stats card needs the same visual dash-bar to show completion progress. How: This renders a track div plus a filled <i>, whose width is the clamped curValNum/maxValNum ratio, colored by the tonValStr modifier class.


	<div className={` ${ cssModObj.prog }   ${ tonValStr === 'warm' ? cssModObj.progWarm : '' } `}>{ /* What: Progress Track Div Element. Why: This is the fixed-width background track the filled bar sits inside. How: This applies the tonValStr modifier class and wraps the filled <i> below. */ }


		<i style={{ width : `${ Math.max( 0, Math.min( 1, curValNum / maxValNum ) ) * 100 }%` }} />{ /* What: Progress Fill Element. Why: This is the actual filled portion showing how far along curValNum is toward maxValNum. How: This is a self-closing <i>, purely styled via inline width, clamped to [0,100]%. */ }


	</div>


);

// #endregion ProBarCom

// #endregion Components



// #region Exports

export { ProBarCom }; // What: Named Export. Why: Progress displays render this bar. How: This exports ProBarCom by name.

// #endregion Exports


