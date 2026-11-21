


// #region Imports

import { SegConCom } from './segmented-control.tsx'; // What: Segment Control Component. Why: The Date-vs-Weekday choice is drawn as the app's shared animated segmented control. How: This is rendered once by DatModCom with the two date mode options.


import type { DatModTyp } from '../core/data-model.ts'; // What: Date Mode Type. Why: Each date mode option's key is one of the fixed modes. How: This types DAT_MOD_ARR's keys and DmcProTyp's value, so the toggle hands back a real mode.

// #endregion Imports



/**
 * date-mode.tsx = Date Mode
 *
 * @summary
 * The shared Date-vs-Weekday toggle a monthly or yearly schedule offers,
 * choosing whether its day is a plain date or an Nth weekday (e.g. "the 2nd
 * Tuesday"), plus the two options it draws.
 *
 * Sections:
 *  - Constants
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const DAT_MOD_ARR : { keyStr : DatModTyp, labStr : string }[] = [ // What: Date Mode Array. Why: Every Date-vs-Weekday toggle offers the same two choices. How: This is passed as DatModCom's SegConCom optIteArr.


	{ keyStr : 'date',       labStr : 'Date'    }, // What: Key String. Why: This is the default day-of-month/day targeting mode's own value. How: This is the mode value the option stands for. // What: Label String. Why: This is the segmented control's own visible button text for this option. How: This is the option's visible button text.
	{ keyStr : 'nthWeekday', labStr : 'Weekday' }  // What: Key String. Why: This lets the user target e.g. "the 2nd Tuesday" instead of a fixed day number. How: This is the mode value the option stands for. // What: Label String. Why: This is the segmented control's own visible button text for this option. How: This is the option's visible button text.


];

// #endregion Constants



// #region Components

type DmcProTyp = { desIdeStr? : string, onChange : ( modKeyStr : DatModTyp ) => void, value : DatModTyp }; // What: Date-Mode-Component Props Type. Why: The toggle shows a schedule's date mode, may point at a note describing it, and hands back the mode chosen. How: This types DatModCom's props.

// #region DatModCom

/**
 * DatModCom = Date Mode Component
 *
 * @summary
 * Draws the Date-vs-Weekday toggle a monthly or yearly schedule offers, set
 * snug at its content's width. A schedule with any date mode other than
 * nthWeekday, an older one with none included, shows as the plain date
 * mode.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.desIdeStr - Describe Identifier String: The optional id of a
 *                          note describing the toggle.
 * @param props.onChange  - On Change: Called with the clicked date mode's key.
 * @param props.value     - Value: The schedule's own date mode.
 *
 * @returns The date mode toggle.
 *
 * @example
 * ```tsx
 * DatModCom({ desIdeStr, onChange, value }) // => <DatModCom />
 * ```
 *
*/

function DatModCom ( { desIdeStr, onChange, value } : DmcProTyp ) : React.JSX.Element {


	return (


		<SegConCom
			layVarStr='snug' // What: Layout Variant String. Why: The two Day selection options should sit snug at their content's width instead of spreading across the field. How: SegConCom applies its snug layout for this value.
			optIteArr={ DAT_MOD_ARR }
			value={ value === 'nthWeekday' ? 'nthWeekday' : 'date' } // What: Date Mode Value. Why: An older schedule may carry no dateMode at all, which should read as the plain date mode. How: This maps anything other than 'nthWeekday' to 'date'.

			ariLabStr='Day selection'
			desIdeStr={ desIdeStr }

			onChange={ onChange }
		/> // What: Segment Control Component. Why: This is the Date-vs-Weekday targeting mode toggle. How: This hands the clicked option's own key to onChange.


	);


}

// #endregion DatModCom

// #endregion Components



// #region Exports

export { DatModCom }; // What: Named Export. Why: The date mode toggle is one shared component. How: This exports DatModCom by name; DAT_MOD_ARR stays private to this file.

// #endregion Exports


