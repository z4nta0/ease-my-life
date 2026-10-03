


// #region Imports

import cssModObj from './weekday-chips.module.css'; // What: CSS Module Object. Why: The chip row and its chips are styled from their own module. How: This maps each class name in weekday-chips.module.css to its hashed module class.


import { InfTipCom } from './info-tip.jsx'; // What: Info Tip Component. Why: A weekly cadence's pinned anchor day explains why it can't be turned off. How: This wraps that locked chip with locTipStr as its tip.

// #endregion Imports



/**
 * weekday-chips.jsx = Weekday Chips
 *
 * @summary
 * A row of seven day-of-week toggle chips used to pick which weekdays
 * something runs on. At least one day always stays selected, and a weekly
 * cadence can pin its own anchor day on with an explanatory tooltip.
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

const WEE_FUL_ARR = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]; // What: Week Full Array. Why: Each chip's own accessible name/title needs the full weekday name, not just its single-letter label. How: This is indexed by day number inside WeeChiCom below.



const WEE_LAB_ARR = [ 'S', 'M', 'T', 'W', 'T', 'F', 'S' ]; // What: Week Label Array. Why: Each weekday chip needs a single-letter visible label. How: This is mapped over by WeeChiCom below, indexed by day number (0=Sun).

// #endregion Constants



// #region Components

// #region WeeChiCom

/**
 * WeeChiCom = Weekday Chip Component
 *
 * @summary
 * A row of 7 toggle chips (Sun...Sat). value is an array of day
 * indices (0=Sun ... 6=Sat); onChange gets the next array. At least
 * one day must stay selected, so the last remaining chip can't be
 * turned off.
 *
 * locDayNum (0-6, or null) pins one day ON: a weekly-cadence picker's
 * anchor day must stay selected, so that chip renders as an InfTipCom
 * instead of a toggle. It still looks selected, but tapping explains
 * why it can't be turned off rather than silently doing nothing.
 * locTipStr is that explanation.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.desIdeStr - Described-By Identifier String: The id of an
 *                          element describing the chips, wired to aria-
 *                          describedby.
 * @param props.locDayNum - Locked Day Number: A day (0-6) pinned on,
 *                          defaulting to null for none.
 * @param props.locTipStr - Locked Tip String: Why the pinned day can't be
 *                          turned off, defaulting to an empty string.
 * @param props.onChange  - On Change: Called with the next array of selected
 *                          days.
 * @param props.sizValStr - Size Value String: The chip size modifier,
 *                          defaulting to 'md'.
 * @param props.value     - Value: The currently selected day indices.
 *
 * @returns The row of weekday chips.
 *
 * @example
 * ```tsx
 * WeeChiCom({ desIdeStr, onChange, value, ... }) // => <WeeChiCom />
 * ```
 *
*/

const WeeChiCom = ( { desIdeStr, locDayNum = null, locTipStr = '', onChange, sizValStr = 'md', value } ) => { // What: Weekday Chip Component. Why: See the design-rationale block above. How: This renders one chip per weekday, locked (InfTipCom) or toggleable (button) depending on locDayNum.


	const togDayFun = ( dayIndNum ) => { // What: Toggle Day Function. Why: Clicking an unlocked chip needs to add or remove that single day from the selection, while keeping at least one day selected. How: This flips dayIndNum's membership in value, re-sorts the result, and calls onChange unless doing so would leave the week empty.


		const hasDayBoo = value.includes( dayIndNum );                                                                    // What: Has Day Boolean. Why: Whether dayIndNum is already selected decides whether this toggle adds or removes it. How: This checks value's own current membership for dayIndNum.
		const nexDayArr = hasDayBoo ? value.filter( ( curDayNum ) => curDayNum !== dayIndNum ) : [ ...value, dayIndNum ]; // What: Next Day Array. Why: This is the candidate selection after the toggle, before it's confirmed safe to apply. How: This removes dayIndNum when it was already selected, otherwise appends it.


		nexDayArr.sort( ( dayOneNum, dayTwoNum ) => dayOneNum - dayTwoNum ); // What: Next Day Sort Call. Why: The selection should always stay in weekday order regardless of which day was toggled. How: This sorts nexDayArr ascending in place.



		if ( nexDayArr.length === 0 ) return; // What: Empty Week Guard. Why: At least one day must always stay selected. How: This bails out without calling onChange when the toggle would leave the week empty.



		onChange( nexDayArr ); // What: On Change Call. Why: The parent owns the actual persisted selection. How: This hands the new, validated day array up to the caller.


	};



	return (


		<div
			className={` ${ cssModObj.dowChiDiv }   ${ sizValStr === 'sm' ? cssModObj.dowChiDivSm : '' } `}

			data-element-name-hook='dowChiDiv'

			aria-describedby={ desIdeStr }
			aria-label='Days of the week'
			role='group'
		>{ /* What: Container Dow Chips Div Element. Why: This groups all 7 weekday toggle chips as one accessible group. How: This renders one chip per WEE_LAB_ARR entry below, locked or toggleable depending on locDayNum. Its data-element-name-hook is read by help mode's Data catalog. */ }


			{ WEE_LAB_ARR.map( ( labChrStr, dayIndNum ) => { // What: Weekday Chip Map. Why: One chip is needed per day of the week. How: This maps WEE_LAB_ARR to either a locked InfTipCom chip or a toggleable button chip, keyed by dayIndNum.


				const daySelBoo = value.includes( dayIndNum ); // What: Day Selected Boolean. Why: Both chip variants below need to know whether this day is currently selected. How: This checks value's own membership for dayIndNum.


				if ( dayIndNum === locDayNum ) return ( // What: Locked Day Check. Why: A locked day (e.g. a weekly picker's anchor day) can't be toggled off and needs an explanation instead. How: This renders an InfTipCom chip instead of a button when dayIndNum matches locDayNum.


					<InfTipCom
						key={ dayIndNum }

						className={ cssModObj.dowChiSpa }

						labTexStr={ locTipStr }
					>{ labChrStr }</InfTipCom> // What: Locked Day Chip Element. Why: This looks selected like any other "on" chip, but tapping explains why it can't be turned off instead of silently doing nothing. How: This renders as an InfTipCom whose trigger is the day's own single-letter label.


				);



				return (


					<button
						key={ dayIndNum }

						className={ cssModObj.dowChiBut }

						type='button'

						aria-describedby={ desIdeStr }
						aria-label={ WEE_FUL_ARR[ dayIndNum ] }
						aria-pressed={ daySelBoo }
						title={ WEE_FUL_ARR[ dayIndNum ] }

						onClick={ () => togDayFun( dayIndNum ) }
					>{ labChrStr }</button> // What: Toggle Day Chip Element. Why: This is the actual clickable control for an unlocked day. How: This shows daySelBoo as its own aria-pressed state, which its module styles as selected, and calls togDayFun with dayIndNum when clicked.


				);


			} ) }


		</div>


	);


};

// #endregion WeeChiCom

// #endregion Components



// #region Exports

export { WeeChiCom }; // What: Named Export. Why: The Pickers and Data tabs and the reminders editor all pick weekdays with these chips. How: This exports WeeChiCom by name.

// #endregion Exports


