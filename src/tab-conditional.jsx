


// #region Imports

import React from 'react'; // What: React. Why: This file's single component is built directly on React's own APIs. How: This is used directly (React.useId) below, instead of importing an individual named hook.


import { BoostReset               } from './ui.jsx';     // What: Boost Reset. Why: The dynamic mode's own accrued miss-boost needs a display plus a manual reset control. How: This is rendered in the dynamic-mode Boost row below.
import { Collapse                 } from './ui.jsx';     // What: Collapse. Why: Every mode's own settings subsection needs to animate open and closed as the selected mode changes. How: This wraps the mode hint text and every per-mode settings block throughout this file.
import { FillButton               } from './ui.jsx';     // What: Fill Button. Why: The ease-up and ease-down modes both need a manual full-charge control. How: This is rendered once per direction in the ease-mode settings block below.
import { MODES                    } from './seed.js';    // What: Modes. Why: The mode radio below must offer the exact same options and labels as the picker editor's own mode radio. How: This is walked via Object.entries to render one radio option per mode.
import { normalizeConditionalName } from './pickers.js'; // What: Normalize Conditional Name. Why: A typed conditional name needs the same tidy-casing rule pickers themselves already use. How: This is called on the name field's own blur and inside conditionalDraftDefault below.
import { NumStepper                } from './ui.jsx';    // What: Number Stepper. Why: The ease-up and ease-down modes both need a plain increment/decrement control for their own Soonest/Latest day counts. How: This is rendered once per bound in the ease-mode settings block below.

// #endregion Imports



/**
 * tab-conditional.jsx = Tab Conditional User Interface
 *
 * @summary
 * ConditionalControls is the reusable "type + settings" editor for a
 * single conditional, bound to a plain draft object via onChange. It is
 * rendered in two places: the Pickers create-flow and the Data tab's
 * own conditional editor (ConditionalEditor in tab-data.jsx). It
 * mirrors the per-item picker controls: a mode radio (sharing its own
 * options/copy with the picker editor's mode radio), then whichever
 * per-mode settings block matches the selected mode (an Odds stepper
 * for weighted/dynamic, a Boost readout for dynamic, Soonest/Latest
 * steppers plus a Fill/Refill button for the ease modes), plus a name
 * field, the day-off replacement card text, and an Active toggle.
 *
 * The exported ConditionalControls and conditionalDraftDefault names,
 * and ConditionalControls' own draft/onChange/nameError/variant/
 * hideName props, are a cross-file contract read directly by
 * tab-picker.jsx and tab-data.jsx. They are deliberately left unrenamed
 * on this formatting pass, the same way Segmented's own options/value/
 * onChange/ariaLabel/describedBy props were left unrenamed in
 * reminders.jsx for the identical reason.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const THR_DEF_NUM = 100; // What: Threshold Default Number. Why: The Soonest/Latest day-count math below approximates against the same default charge ceiling every brand-new conditional starts at. How: This is read by every function in the tight group right below it.



const easSooFun = ( easAmtNum ) => Math.max( 1, Math.round( THR_DEF_NUM / ( easAmtNum || 1 ) ) ); // What: Ease Soonest Function. Why: The Soonest/Shortest stepper needs a plain day count, not the raw per-day drift amount (easeMax) it is derived from. How: This divides THR_DEF_NUM by easAmtNum, rounds, and floors the result at 1 day.
const easLatFun = ( easAmtNum ) => Math.max( 1, Math.round( THR_DEF_NUM / ( easAmtNum || 1 ) ) );  // What: Ease Latest Function. Why: The Latest/Longest stepper needs a plain day count, not the raw per-day drift amount (easeMin) it is derived from. How: This divides THR_DEF_NUM by easAmtNum, rounds, and floors the result at 1 day.
const dayEasFun = ( dayCouNum ) => THR_DEF_NUM / Math.max( 1, dayCouNum );                          // What: Day Ease Function. Why: Editing either stepper needs to convert a plain day count back into the per-day drift amount easeMin/easeMax actually store. How: This divides THR_DEF_NUM by dayCouNum, floored at 1 day, with no rounding since this feeds a stored drift amount rather than a displayed count.



const CON_HIN_OBJ = { // What: Conditional Hint Object. Why: Conditional mode explanations differ from the picker editor's own MODES hints, since a conditional's own effect (suppressing a picker) needs its own framing. How: This is looked up by mode key inside the mode radio's own Collapse below, falling back to MODES' own hint when a mode has no override here.


	random      : [ 'Ruleset: This conditional’s ruleset uses a non-adjustable, static value of 50% for triggering the conditional.', 'Explanation: This is a good choice for being truly random, but it also has some drawbacks. e.g. it can be triggered multiple times in a row or it can go a long time without being triggered.' ],
	weighted    : [ 'Ruleset: This conditional’s ruleset uses an adjustable, weighted value that ranges from 10%–90%, with a default of 50%, for triggering the conditional.', 'Explanation: This is a good choice for mitigating some of the Truly Random drawbacks by tuning the % chance to make it more (or less) likely to trigger. e.g. it can still be triggered multiple times in a row or it can go a long time without being triggered, although it is less likely to do so.' ],
	dynamic     : [ 'Ruleset: This conditional’s ruleset is exactly the same as the Weighted conditional, but it also adds a second value that increments the weighted value every time it does not trigger and then resets its value every time that it does.', 'Explanation: This is a good choice for mitigating almost all of the Truly Random drawbacks by tuning the % chance to make it more (or less) likely to trigger. Furthermore, by adding a dynamic value it makes it increasingly likely to trigger when it doesn’t and less likely when it does. e.g. it can still be triggered multiple times in a row or it can go a long time without being triggered, although it is much less likely to do so.' ],
	'ease-up'   : [ 'Ruleset: This conditional’s ruleset makes it so that it is ineligible to be triggered until its value reaches 100, at which point it is guaranteed to trigger. Said value will start at 0 and is incremented every cycle by a random amount within a user defined range.', 'Explanation: This is a good choice for ensuring that the conditional can only be triggered once every N days and can never be triggered multiple times in a row. e.g. it can only be triggered at most once a week and must be triggered at least once every two weeks.' ],
	'ease-down' : [ 'Ruleset: This conditional’s ruleset is the opposite of the Ease Up conditional. It makes it so that it is guaranteed to be triggered until its value reaches 0, at which point it will be ineligible for exactly one cycle. Said value will start at 100 and is decremented every cycle by a random amount within a user defined range.', 'Explanation: This is a good choice for ensuring that the conditional stays triggered for at least N days and then is not triggered for exactly one day. e.g. it must remain triggered for at least a week and must not remain triggered for more than two weeks.' ]


};
const RAN_NOT_STR = 'Truly Random conditionals have no options and function like a coin flip. e.g. it is 50/50 whether it gets triggered or not.'; // What: Random Note String. Why: The random mode's own settings block has no adjustable control at all, just this fixed explanation. How: This is rendered directly in place of a control in the random-mode Collapse below.



// #region ConditionalControls

/**
 * ConditionalControls = Conditional Controls
 *
 * @summary
 * See this file's own header comment above for the full picture of
 * what this component renders and where it is reused. In short: a mode
 * radio plus whichever settings block matches the selected mode, plus
 * a name field, the replacement card text, and an Active toggle.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.draft     - Draft: The plain conditional draft object this
 *                          editor renders and patches; owned by the caller,
 *                          never mutated directly.
 * @param props.onChange  - On Change: Called with the whole next draft object
 *                          whenever any field changes.
 * @param props.nameError - Name Error: An optional validation message shown
 *                          under the name field, such as a name collision.
 * @param props.variant   - Variant: 'card' (the Pickers create-flow's own
 *                          boxed layout) or 'inline' (the Data tab's tighter
 *                          layout), defaulting to 'card'.
 * @param props.hideName  - Hide Name: Whether to omit the name field entirely,
 *                          for a caller (the Data tab) that already hosts its
 *                          own inline name input elsewhere; defaults to false.
 *
 * @returns The full editor: the name/card-text fields (name optional),
 * the mode radio, whichever mode-specific settings block matches the
 * current mode, and the Active toggle.
 *
 * @example
 * ```tsx
 * ConditionalControls({ draft, onChange, nameError, variant, hideName }) // => <ConditionalControls />
 * ```
 *
*/

function ConditionalControls ( { draft, onChange, nameError, variant = 'card', hideName = false } ) {


	const insIdeStr = React.useId(); // What: Instance Identifier String. Why: This component is reused in more than one place at once (see the file header comment), so its own field ids and the mode radio's own name must never collide across instances. How: This calls React.useId() once per mount, prefixed onto every id/name below.



	const patSetFun = ( patObj ) => onChange( { ...draft, ...patObj } ); // What: Patch Set Function. Why: Every field editor below needs one shared way to merge a partial change into the caller-owned draft. How: This spreads draft and then patObj on top of it, passing the merged result to onChange.



	const curModStr = draft.mode || 'random';                              // What: Current Mode String. Why: Every derived flag and every per-mode settings block below reads the conditional's own currently-selected mode. How: This falls back to 'random' for a brand-new draft with no mode set yet.
	const isaEasBoo = curModStr === 'ease-up' || curModStr === 'ease-down'; // What: Is-An Ease Boolean. Why: The ease-up and ease-down modes share one settings block, distinct from the probability-family modes. How: This is true only for those 2 mode keys.
	const isaDowBoo = curModStr === 'ease-down';                           // What: Is-A Down Boolean. Why: Ease-up and ease-down share most of their own settings block but differ in a few labels and directions. How: This is true only for the 'ease-down' mode key.
	const useWeiBoo = curModStr === 'weighted' || curModStr === 'dynamic'; // What: Use Weight Boolean. Why: The weighted and dynamic modes share one Odds settings block, distinct from random and the ease modes. How: This is true only for those 2 mode keys.
	const isaDynBoo = curModStr === 'dynamic';                             // What: Is-A Dynamic Boolean. Why: Only the dynamic mode also shows its own Boost row inside the shared Odds block. How: This is true only for the 'dynamic' mode key.
	const isaInlBoo = variant === 'inline';                                // What: Is-An Inline Boolean. Why: The Data tab's own inline editor variant needs a tighter layout than the Pickers create-flow's card variant. How: This is true only when the caller passed variant='inline'.



	const easMinNum = draft.easeMin ?? 7;     // What: Ease Minimum Number. Why: The ease-mode settings block needs a resolved lower bound of the drift range, defaulting a brand-new draft to 7 days. How: This reads draft.easeMin, falling back to 7 when it is nullish.
	const easMaxNum = draft.easeMax ?? 14;    // What: Ease Maximum Number. Why: The ease-mode settings block needs a resolved upper bound of the drift range, defaulting a brand-new draft to 14 days. How: This reads draft.easeMax, falling back to 14 when it is nullish.
	const sooDayNum = easSooFun( easMaxNum ); // What: Soonest Day Number. Why: The Soonest/Shortest stepper below needs a plain day count, not the raw drift amount it is derived from. How: This calls easSooFun against easMaxNum.
	const latDayNum = easLatFun( easMinNum ); // What: Latest Day Number. Why: The Latest/Longest stepper below needs a plain day count, not the raw drift amount it is derived from. How: This calls easLatFun against easMinNum.



	const appSooFun = ( dayCouNum ) => { // What: Apply Soonest Function. Why: Editing the Soonest/Shortest stepper must convert its own day count back into a drift amount and commit it. How: This clamps dayCouNum to [1, 100], converts it via dayEasFun, and patches easeMax, raising easeMin to match if it would otherwise fall below it.


		const newAmtNum = dayEasFun( Math.max( 1, Math.min( 100, dayCouNum ) ) ); // What: New Amount Number. Why: The clamped day count must be converted back into the drift amount easeMax actually stores. How: This calls dayEasFun against dayCouNum, clamped to [1, 100] first.


		patSetFun( { easeMax : newAmtNum, easeMin : Math.min( easMinNum, newAmtNum ) } ); // What: Ease Maximum Patch Call. Why: Raising the soonest bound past the latest bound would invert the range, so easeMin is pulled down to match when needed. How: This commits the new easeMax alongside whichever of easMinNum/newAmtNum is smaller.


	};

	const appLatFun = ( dayCouNum ) => { // What: Apply Latest Function. Why: Editing the Latest/Longest stepper must convert its own day count back into a drift amount and commit it. How: This clamps dayCouNum to [1, 100], converts it via dayEasFun, and patches easeMin, lowering easeMax to match if it would otherwise fall below it.


		const newAmtNum = dayEasFun( Math.max( 1, Math.min( 100, dayCouNum ) ) ); // What: New Amount Number. Why: The clamped day count must be converted back into the drift amount easeMin actually stores. How: This calls dayEasFun against dayCouNum, clamped to [1, 100] first.


		patSetFun( { easeMin : newAmtNum, easeMax : Math.max( easMaxNum, newAmtNum ) } ); // What: Ease Minimum Patch Call. Why: Lowering the latest bound past the soonest bound would invert the range, so easeMax is pulled up to match when needed. How: This commits the new easeMin alongside whichever of easMaxNum/newAmtNum is larger.


	};



	const sooLabStr = isaDowBoo ? 'Shortest' : 'Soonest'; // What: Soonest Label String. Why: Ease-down phrases this bound as "Shortest" instead of "Soonest". How: This picks the label based on isaDowBoo.
	const latLabStr = isaDowBoo ? 'Longest' : 'Latest';   // What: Latest Label String. Why: Ease-down phrases this bound as "Longest" instead of "Latest". How: This picks the label based on isaDowBoo.

	const sooSubStr = isaDowBoo


		? `stays triggered ${ sooDayNum } ${ sooDayNum === 1 ? 'day' : 'days' } minimum` // What: Ease-Down Soonest Phrase. Why: For ease-down this bound is a floor on how long the conditional stays triggered, not a wait before it can trigger. How: This names sooDayNum, pluralizing "day" to match it.

		: `${ sooDayNum } ${ sooDayNum === 1 ? 'day' : 'days' } until it can trigger`; // What: Ease-Up Soonest Phrase. Why: For ease-up this bound is a wait before the conditional can first trigger. How: This names sooDayNum, pluralizing "day" to match it.

	const latSubStr = isaDowBoo


		? `stays triggered ${ latDayNum } ${ latDayNum === 1 ? 'day' : 'days' } maximum` // What: Ease-Down Latest Phrase. Why: For ease-down this bound is a ceiling on how long the conditional stays triggered. How: This names latDayNum, pluralizing "day" to match it.

		: `${ latDayNum } ${ latDayNum === 1 ? 'day' : 'days' } until it must trigger`; // What: Ease-Up Latest Phrase. Why: For ease-up this bound is a deadline before the conditional must trigger. How: This names latDayNum, pluralizing "day" to match it.



	const thrValNum = draft.threshold ?? 100; // What: Threshold Value Number. Why: The Fill/Refill row below needs the conditional's own resolved charge ceiling to know when it is already full. How: This reads draft.threshold, falling back to 100 when it is nullish.



	return (


		<div className={ `cnd-controls   ${ isaInlBoo ? 'cnd-controls--inline' : '' }` }>{ /* What: Controls Container Div Element. Why: This is ConditionalControls' own root element, holding every field and settings block below. How: This renders as a plain div, switching to the tighter inline layout via a modifier class when isaInlBoo is true. */ }


			{ !hideName && ( // What: Name Field Visibility Check. Why: The caller can opt out of the whole name field via hideName. How: This renders the name field only while hideName is false.


				<div className='np-field'>{ /* What: Name Field Div Element. Why: This groups the conditional-name label, input, and its own validation error as one field. How: This is omitted entirely whenever the caller passed hideName. */ }


					<label
						className='np-label'
						htmlFor={ `${ insIdeStr }-name` }
					>Conditional name</label>{ /* What: Name Label Element. Why: This is the name field's own visible label, tied to the input below via htmlFor. How: This renders the literal text "Conditional name". */ }

					<input
						id={ `${ insIdeStr }-name` }
						className={ `np-input   ${ nameError ? 'is-error' : '' }` }
						type='text'
						value={ draft.name }
						maxLength={ 40 }
						placeholder='Conditional name'
						aria-invalid={ !!nameError }
						onChange={ ( chaEveObj ) => patSetFun( { name : chaEveObj.target.value } ) }
						onBlur={ ( bluEveObj ) => {


							const norNamStr = normalizeConditionalName( bluEveObj.target.value ); // What: Normalize Name String. Why: A typed name should be tidied to the same casing rule pickers use, once the field loses focus. How: This calls normalizeConditionalName against the input's own current value.

							if ( norNamStr ) patSetFun( { name : norNamStr } ); // What: Tidy Name Patch Guard. Why: An empty or whitespace-only typed name has nothing worth tidying into place. How: This only patches draft.name when normalizeConditionalName actually returned something.


						} }
						onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
					/>{ /* What: Name Input Element. Why: This is the actual editable conditional-name field. How: This commits every keystroke to draft.name directly, tidies the value on blur, and treats Enter as a blur shortcut. */ }

					{ nameError && ( // What: Name Error Visibility Check. Why: The error message should only show once a real validation problem exists. How: This renders the error paragraph only while nameError holds a value.


						<p className='np-error'>{ nameError }</p> // What: Name Error Paragraph Element. Why: A colliding or otherwise invalid typed name needs a visible reason why. How: This renders the caller-supplied nameError message only while one is present.


					) }


				</div>


			) }
			<div className='np-field np-field--cardtext'>{ /* What: Card Text Field Div Element. Why: This groups the day-off replacement card text's own label, help text, and input as one field. How: This is always shown, unlike the name field, since every conditional needs a card text. */ }


				<div className='np-cardtext-text'>{ /* What: Cardtext Text Div Element. Why: The label and its own help paragraph read best grouped together, apart from the input itself. How: This wraps the label and help paragraph below. */ }


					<label
						className='np-label'
						htmlFor={ `${ insIdeStr }-cardtext` }
					>Replacement card text</label>{ /* What: Cardtext Label Element. Why: This is the card-text field's own visible label. How: This renders the literal text "Replacement card text". */ }

					<p className='np-help'>This is the text that is shown on the card that appears on your todo list when this conditional suppresses its picker.</p>{ /* What: Cardtext Help Paragraph Element. Why: A user configuring this field for the first time needs to know exactly where and when this text appears. How: This renders a fixed explanatory sentence beneath the label. */ }


				</div>


				<input
					id={ `${ insIdeStr }-cardtext` }
					className='np-input'
					type='text'
					value={ draft.cardText }
					maxLength={ 60 }
					placeholder='Picker suppressed for today'
					onChange={ ( chaEveObj ) => patSetFun( { cardText : chaEveObj.target.value } ) }
				/>{ /* What: Cardtext Input Element. Why: This is the actual editable replacement card text field. How: This commits every keystroke straight to draft.cardText. */ }


			</div>

			<div className='cnd-type-group'>{ /* What: Type Group Div Element. Why: The mode radio and every per-mode settings block below need one shared wrapping element for layout. How: This wraps the mode fieldset and every Collapse-gated settings block that follows it. */ }


				<fieldset className='np-field'>{ /* What: Type Fieldset Element. Why: The mode radio's own options are a single logical group of controls. How: This wraps the legend and the mode radio list below. */ }


					<legend className='np-label'>Conditional type</legend>{ /* What: Type Legend Element. Why: A fieldset needs its own legend to label the group for assistive tech. How: This renders the literal text "Conditional type". */ }


					<div className={ isaInlBoo ? '' : 'cnd-mode-card style-radio-card' }>{ /* What: Mode Card Div Element. Why: The card variant wraps the radio list in its own bordered card, while the inline variant needs no extra wrapper styling. How: This applies the card classes only when isaInlBoo is false. */ }


						<div className='rd-mode-radio'>{ /* What: Mode Radio Div Element. Why: This is the actual list of mode options the user picks from. How: This maps MODES below into one option label per mode. */ }


							{ Object.entries( MODES ).map( ( [ modKeyStr, modConObj ] ) => { // What: Mode Option List Render. Why: One radio option is needed per configured mode, and the set of modes is data shared with the picker editor, not hardcoded markup. How: This maps MODES to one label per entry, keyed by its own mode key.


								const modSelBoo = curModStr === modKeyStr; // What: Mode Selected Boolean. Why: Both the label's own "is-on" styling and the nested Collapse below need to know whether this specific option is the currently-selected one. How: This compares modKeyStr against curModStr.


								return (


									<label
										key={ modKeyStr }
										className={ `rd-mode-opt   ${ modSelBoo ? 'is-on' : '' }` }
									>{ /* What: Mode Option Label Element. Why: This is one clickable mode option, marking itself "is-on" when it is the current selection. How: This wraps the radio input, the dot, and the name/hint text below. */ }


										<input
											name={ `${ insIdeStr }-cnd-mode` }
											type='radio'
											checked={ modSelBoo }
											onChange={ () => patSetFun({


												mode      : modKeyStr,
												value     : modKeyStr === 'ease-down' ? thrValNum : 0,
												triggered : modKeyStr === 'ease-down'


											}) }
										/>{ /* What: Mode Radio Input Element. Why: This is the actual selectable control for this mode option. How: This checks itself against modSelBoo and, on selection, patches mode plus the value/triggered reset every mode switch needs. */ }

										<span className='rd-mode-dot' aria-hidden='true' />{ /* What: Mode Dot Span Element. Why: This is the small decorative marker showing the option's own on/off state via CSS. How: This renders empty, styled purely through the "is-on" class on its parent label. */ }


										<span className='rd-mode-text'>{ /* What: Mode Text Span Element. Why: The option's own name and its expandable hint text need to sit together as one unit. How: This wraps the name span and the Collapse below. */ }


											<span className='rd-mode-name'>{ modConObj.label }</span>{ /* What: Mode Name Span Element. Why: This is the option's own visible mode name. How: This renders modConObj's own label. */ }


											<Collapse open={ modSelBoo }>{ /* What: Mode Hint Collapse Element. Why: The longer explanation of a mode should only take up space while that mode is actually selected. How: This animates the hint text below open only while modSelBoo is true. */ }


												{ Array.isArray( CON_HIN_OBJ[ modKeyStr ] ) // What: Hint Array Check. Why: The conditional-specific hints above are each a 2-paragraph array, while a mode with no override here falls back to a single plain hint string from MODES. How: This picks between rendering one span per paragraph or a single fallback span.
													? CON_HIN_OBJ[ modKeyStr ].map( ( parTexStr, parIndNum ) => <span key={ parIndNum } className='rd-mode-hint'>{ parTexStr }</span> )
													: <span className='rd-mode-hint'>{ CON_HIN_OBJ[ modKeyStr ] || modConObj.hint }</span> }


											</Collapse>


										</span>


									</label>


								);


							} ) }


						</div>


					</div>


				</fieldset>

				<Collapse open={ curModStr === 'random' }>{ /* What: Random Settings Collapse Element. Why: The random mode has no adjustable settings at all, just a note explaining why. How: This animates the fixed 50/50 explanation open only while curModStr is 'random'. */ }


					<div className='cnd-typectl pie-rows'>{ /* What: Random Type Control Div Element. Why: This groups the random mode's own single explanatory row using the shared pie-rows layout every other mode's settings reuse. How: This wraps the one pie-row below. */ }


						<div className='pie-row'>{ /* What: Random Row Div Element. Why: This is the shared row layout (a label plus a control) reused across every mode's settings. How: This wraps the label block and the "No weight" text in place of an actual control. */ }


							<div className='pie-rowlabel'>{ /* What: Random Rowlabel Div Element. Why: The row's own title and explanatory sub-text need to sit together. How: This wraps the "Weight" title span and the RAN_NOT_STR sub span below. */ }


								<span className='pie-lbl'>Weight</span>{ /* What: Random Label Span Element. Why: This names what the row would otherwise control. How: This renders the literal text "Weight". */ }

								<span className='pie-sub'>{ RAN_NOT_STR }</span>{ /* What: Random Sub Span Element. Why: The user needs to understand why there is no weight control at all for this mode. How: This renders the fixed RAN_NOT_STR explanation. */ }


							</div>


							<span className='pie-noweight'>No weight</span>{ /* What: Random Noweight Span Element. Why: This fills the control slot the other modes use for an actual adjustable value. How: This renders the fixed literal text "No weight". */ }


						</div>


					</div>


				</Collapse>

				<Collapse open={ useWeiBoo }>{ /* What: Weight Settings Collapse Element. Why: Only the weighted and dynamic modes have an adjustable odds percentage. How: This animates the Odds row, and for dynamic the nested Boost row, open only while useWeiBoo is true. */ }


					<div className='cnd-typectl pie-rows'>{ /* What: Weight Type Control Div Element. Why: This groups the Odds row and the dynamic-only Boost row using the shared pie-rows layout. How: This wraps the Odds pie-row and the nested Boost Collapse below. */ }


						<div className='pie-row'>{ /* What: Odds Row Div Element. Why: This is the shared row layout for the odds percentage control. How: This wraps the label block and the plus/minus stepper below. */ }


							<div className='pie-rowlabel'>{ /* What: Odds Rowlabel Div Element. Why: The row's own title and live percentage summary need to sit together. How: This wraps the "Odds" title span and the live sub span below. */ }


								<span className='pie-lbl'>Odds</span>{ /* What: Odds Label Span Element. Why: This names the row's own control. How: This renders the literal text "Odds". */ }

								<span className='pie-sub'><strong>{ draft.oddsPct ?? 50 }%</strong>{ ` chance to trigger${ isaDynBoo ? ' (before boost)' : '' }` }</span>{ /* What: Odds Sub Span Element. Why: The user needs to see the current odds value plainly, with a dynamic-mode caveat that boost adds on top of it. How: This bolds the resolved oddsPct and appends the caveat only while isaDynBoo is true. */ }


							</div>


							<div className='weight-stepper'>{ /* What: Odds Stepper Div Element. Why: The odds percentage needs a plain plus/minus control, distinct from the drag-free NumStepper used elsewhere. How: This wraps the lower button, the live value, and the raise button below. */ }


								<button
									disabled={ ( draft.oddsPct ?? 50 ) <= 10 }
									aria-label='Lower odds'
									onClick={ () => patSetFun( { oddsPct : Math.max( 10, ( draft.oddsPct ?? 50 ) - 10 ) } ) }
								>−</button>{ /* What: Odds Lower Button Element. Why: This is the actual control for decreasing the odds percentage. How: This steps oddsPct down by 10, disabling itself at the 10 floor. */ }

								<span className='weight-val'>{ draft.oddsPct ?? 50 }%</span>{ /* What: Odds Value Span Element. Why: The stepper needs its own plain numeric readout between the two buttons. How: This renders the resolved oddsPct directly. */ }

								<button
									disabled={ ( draft.oddsPct ?? 50 ) >= 90 }
									aria-label='Raise odds'
									onClick={ () => patSetFun( { oddsPct : Math.min( 90, ( draft.oddsPct ?? 50 ) + 10 ) } ) }
								>+</button>{ /* What: Odds Raise Button Element. Why: This is the actual control for increasing the odds percentage. How: This steps oddsPct up by 10, disabling itself at the 90 ceiling. */ }


							</div>


						</div>

						<Collapse open={ isaDynBoo }>{ /* What: Boost Settings Collapse Element. Why: Only the dynamic mode has an accrued miss-boost to show and reset. How: This animates the Boost row open only while isaDynBoo is true. */ }


							<div className='pie-row'>{ /* What: Boost Row Div Element. Why: This is the shared row layout for the dynamic mode's own boost display and reset control. How: This wraps the label block and the BoostReset control below. */ }


								<div className='pie-rowlabel'>{ /* What: Boost Rowlabel Div Element. Why: The row's own title and live boost summary need to sit together. How: This wraps the "Boost" title span and the fading summary span below. */ }


									<span className='pie-lbl'>Boost</span>{ /* What: Boost Label Span Element. Why: This names the row's own control. How: This renders the literal text "Boost". */ }

									<span
										key={ ( draft.value || 0 ) === 0 ? 'none' : 'boost' }
										className='pie-sub set-sub-fade'
									>{ ( draft.value || 0 ) === 0 ? <><strong>no bonus</strong> to odds, will increase when not triggered</> : <><strong>+{ draft.value }%</strong> to odds, resets when triggered</> }</span>{ /* What: Boost Sub Span Element. Why: The user needs to see whether a miss-boost has accrued yet, and what it is worth. How: This re-keys, and so re-fades, whenever the boost goes from zero to nonzero or back. */ }


								</div>


								<div className='pie-ctl'>{ /* What: Boost Control Div Element. Why: The control itself sits apart from the row's own label block. How: This wraps the BoostReset control below. */ }


									<BoostReset
										value={ draft.value || 0 }
										suffix='%'
										onReset={ () => patSetFun( { value : 0 } ) }
									/>{ /* What: Boost Reset. Why: A user who wants to discard an accrued miss-boost needs a direct way to zero it out. How: This shows the current boost value and zeroes draft.value when reset. */ }


								</div>


							</div>


						</Collapse>


					</div>


				</Collapse>

				<Collapse open={ isaEasBoo }>{ /* What: Ease Settings Collapse Element. Why: Only the ease-up and ease-down modes have a Soonest/Latest drift range and a Fill/Refill control. How: This animates the whole ease-mode settings block open only while isaEasBoo is true. */ }


					<div className='cnd-typectl pie-rows'>{ /* What: Ease Type Control Div Element. Why: cnd-ease-up-row/cnd-ease-down-row (in addition to the shared pie-row) are pure selector hooks for help mode, see help-content.jsx's newCondEaseUp/newCondEaseDown, split by direction the same way EntryEditor's own pie-ease-up-row/pie-ease-down-row are, since Soonest/Latest/Fill and Shortest/Longest/Refill need entirely different tip copy. How: This groups the Soonest/Shortest row, the Latest/Longest row, and the direction-specific Fill/Refill row below. */ }


						<div className={ `pie-row   ${ isaDowBoo ? 'cnd-ease-down-row' : 'cnd-ease-up-row' }` }>{ /* What: Soonest Row Div Element. Why: This is the shared row layout for the lower drift bound, labeled Shortest instead for ease-down. How: This wraps the label block and the NumStepper control below. */ }


							<div className='pie-rowlabel'>{ /* What: Soonest Rowlabel Div Element. Why: The row's own title and live day-count summary need to sit together. How: This wraps the title span and the fading summary span below. */ }


								<span className='pie-lbl-row'><span className='pie-lbl'>{ sooLabStr }</span></span>{ /* What: Soonest Label Span Element. Why: This names the row's own control, Shortest or Soonest depending on direction. How: This renders sooLabStr. */ }

								<span
									key={ sooDayNum }
									className='pie-sub set-sub-fade'
								>{ sooSubStr }</span>{ /* What: Soonest Sub Span Element. Why: The user needs a plain-English read of what this day count actually means for the current direction. How: This re-keys, and so re-fades, whenever sooDayNum changes. */ }


							</div>


							<div className='pie-ctl'>{ /* What: Soonest Control Div Element. Why: The stepper control itself sits apart from the row's own label block. How: This wraps the NumStepper and its own unit label below. */ }


								<NumStepper
									value={ sooDayNum }
									min={ 1 }
									max={ 100 }
									ariaLabel={ sooLabStr }
									onSet={ appSooFun }
								/>{ /* What: Number Stepper. Why: This is the actual increment/decrement control for the lower drift bound. How: This commits every change through appSooFun. */ }

								<span className='np-ease-unit'>{ sooDayNum === 1 ? 'day' : 'days' }</span>{ /* What: Soonest Unit Span Element. Why: The stepper's own raw number needs a "day"/"days" unit alongside it. How: This pluralizes based on sooDayNum. */ }


							</div>


						</div>

						<div className={ `pie-row   ${ isaDowBoo ? 'cnd-ease-down-row' : 'cnd-ease-up-row' }` }>{ /* What: Latest Row Div Element. Why: This is the shared row layout for the upper drift bound, labeled Longest instead for ease-down. How: This wraps the label block and the NumStepper control below. */ }


							<div className='pie-rowlabel'>{ /* What: Latest Rowlabel Div Element. Why: The row's own title and live day-count summary need to sit together. How: This wraps the title span and the fading summary span below. */ }


								<span className='pie-lbl-row'><span className='pie-lbl'>{ latLabStr }</span></span>{ /* What: Latest Label Span Element. Why: This names the row's own control, Longest or Latest depending on direction. How: This renders latLabStr. */ }

								<span
									key={ latDayNum }
									className='pie-sub set-sub-fade'
								>{ latSubStr }</span>{ /* What: Latest Sub Span Element. Why: The user needs a plain-English read of what this day count actually means for the current direction. How: This re-keys, and so re-fades, whenever latDayNum changes. */ }


							</div>


							<div className='pie-ctl'>{ /* What: Latest Control Div Element. Why: The stepper control itself sits apart from the row's own label block. How: This wraps the NumStepper and its own unit label below. */ }


								<NumStepper
									value={ latDayNum }
									min={ 1 }
									max={ 100 }
									ariaLabel={ latLabStr }
									onSet={ appLatFun }
								/>{ /* What: Number Stepper. Why: This is the actual increment/decrement control for the upper drift bound. How: This commits every change through appLatFun. */ }

								<span className='np-ease-unit'>{ latDayNum === 1 ? 'day' : 'days' }</span>{ /* What: Latest Unit Span Element. Why: The stepper's own raw number needs a "day"/"days" unit alongside it. How: This pluralizes based on latDayNum. */ }


							</div>


						</div>
						{ !isaDowBoo && ( // What: Fill Row Visibility Check. Why: Only ease-up's own charge can be jumped straight to full via this shortcut. How: This renders the Fill row only while isaDowBoo is false.


							<div className='pie-row cnd-ease-up-row'>{ /* What: Fill Row Div Element. Why: Ease-up's own charge can be jumped straight to full instead of waiting out the drift. How: This wraps the label block and the Fill button below. */ }


								<div className='pie-rowlabel'>{ /* What: Fill Rowlabel Div Element. Why: The row's own title and live charge summary need to sit together. How: This wraps the "Fill" title span and the fading charge summary span below. */ }


									<span className='pie-lbl'>Fill</span>{ /* What: Fill Label Span Element. Why: This names the row's own control. How: This renders the literal text "Fill". */ }

									<span
										key={ ( draft.value ?? 0 ) >= thrValNum ? 'full' : 'part' }
										className='pie-sub set-sub-fade'
									>{ ( draft.value ?? 0 ) >= thrValNum ? <>conditional is <strong>fully charged</strong></> : <>conditional at <strong>{ Math.round( draft.value ?? 0 ) } charge</strong></> }</span>{ /* What: Fill Sub Span Element. Why: The user needs to see the current charge, or know it is already full, before deciding to fill it. How: This re-keys, and so re-fades, whenever the full/part state flips. */ }


								</div>


								<FillButton
									label='Fill'
									disabled={ ( draft.value ?? 0 ) >= thrValNum }
									onClick={ () => patSetFun( { value : thrValNum, triggered : true } ) }
								/>{ /* What: Fill Button. Why: This is the actual jump-to-full control for ease-up. How: This sets value to thrValNum and triggered to true, disabling itself once already full. */ }


							</div>


						) }
						{ isaDowBoo && ( // What: Refill Row Visibility Check. Why: Only ease-down's own charge can be jumped straight back to full via this shortcut. How: This renders the Refill row only while isaDowBoo is true.


							<div className='pie-row cnd-ease-down-row'>{ /* What: Refill Row Div Element. Why: Ease-down's own charge can be jumped straight back to full instead of waiting out a fresh streak. How: This wraps the label block and the Refill button below. */ }


								<div className='pie-rowlabel'>{ /* What: Refill Rowlabel Div Element. Why: The row's own title and live charge summary need to sit together. How: This wraps the "Refill" title span and the fading charge summary span below. */ }


									<span className='pie-lbl'>Refill</span>{ /* What: Refill Label Span Element. Why: This names the row's own control. How: This renders the literal text "Refill". */ }

									<span
										key={ ( draft.value ?? 0 ) >= thrValNum ? 'full' : 'part' }
										className='pie-sub set-sub-fade'
									>{ ( draft.value ?? 0 ) >= thrValNum ? <>conditional is <strong>fully charged</strong></> : <>conditional at <strong>{ Math.round( draft.value ?? 0 ) } charge</strong></> }</span>{ /* What: Refill Sub Span Element. Why: The user needs to see the current charge, or know it is already full, before deciding to refill it. How: This re-keys, and so re-fades, whenever the full/part state flips. */ }


								</div>


								<FillButton
									label='Refill'
									disabled={ ( draft.value ?? 0 ) >= thrValNum }
									onClick={ () => patSetFun( { value : thrValNum, triggered : true } ) }
								/>{ /* What: Fill Button. Why: This is the actual jump-to-full control for ease-down. How: This sets value to thrValNum and triggered to true, disabling itself once already full. */ }


							</div>


						) }


					</div>


				</Collapse>


				<div className='cnd-typectl pie-rows'>{ /* What: Active Type Control Div Element. Why: The Active toggle applies regardless of mode, so it sits outside every mode-gated Collapse above. How: This wraps the one Active pie-row below. */ }


					<div className='pie-row'>{ /* What: Active Row Div Element. Why: This is the shared row layout for the enabled/disabled toggle. How: This wraps the label block and the switch button below. */ }


						<div className='pie-rowlabel'>{ /* What: Active Rowlabel Div Element. Why: The row's own state title and live explanation need to sit together. How: This wraps the fading state span and the fading explanation span below. */ }


							<span
								key={ draft.active !== false ? 'active' : 'inactive' }
								className='pie-lbl set-sub-fade'
							>{ draft.active !== false ? 'Active' : 'Inactive' }</span>{ /* What: Active Label Span Element. Why: The row's own title should read Active or Inactive to match the current toggle state. How: This re-keys, and so re-fades, whenever draft.active flips. */ }

							<span
								key={ draft.active !== false ? ( isaDowBoo ? 'on-down' : 'on' ) : 'off' }
								className='pie-sub set-sub-fade'
							>{ draft.active !== false ? ( isaDowBoo ? <>conditional <strong>is active</strong>, picker will not run until conditional fully discharges</> : <>conditional <strong>is active</strong>, if triggered picker will not run for one cycle</> ) : <>conditional is <strong>inactive</strong>, picker will always run</> }</span>{ /* What: Active Sub Span Element. Why: The user needs a plain-English read of what the current toggle state actually does, which differs for ease-down. How: This re-keys, and so re-fades, whenever the active/direction combination changes. */ }


						</div>


						<button
							className={ `switch   ${ draft.active !== false ? 'is-on' : '' }` }
							type='button'
							role='switch'
							aria-checked={ draft.active !== false }
							aria-label='Active'
							onClick={ () => patSetFun( { active : draft.active === false } ) }
						><i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off the "is-on" class on its parent button. */ }</button>{ /* What: Active Switch Button Element. Why: This is the actual enabled/disabled toggle control. How: This flips draft.active and marks itself pressed via aria-checked and the "is-on" class. */ }


					</div>


				</div>


			</div>


		</div>


	);


}

// #endregion ConditionalControls



export { ConditionalControls };



/**
 * conditionalDraftDefault = Conditional Draft Default
 *
 * @summary
 * Builds the default draft for a brand-new conditional, named
 * "{Picker} Conditional N" where N increments past any existing
 * conditional already sharing that base name (compared case-
 * insensitively), so a picker can accumulate several conditionals
 * without a name collision.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param picNamStr - Picker Name String: The picker's own name this
 *                    conditional's default name is prefixed with; normalized
 *                    the same way a typed conditional name is.
 * @param exiNamArr - Existing Name Array: Every existing conditional name
 *                    already in use, checked case-insensitively to pick a free
 *                    N; defaults to an empty array for a picker with none yet.
 *
 * @returns The new conditional's own default draft object.
 *
 * @example
 * ```ts
 * conditionalDraftDefault(picNamStr, exiNamArr) // => default draft object
 * ```
 *
*/

export const conditionalDraftDefault = ( picNamStr, exiNamArr = [] ) => { // What: Conditional Draft Default Body. Why: A brand-new conditional needs a sensible starting draft rather than a blank one. How: This resolves a free "{Picker} Conditional N" name, then returns it alongside every other field's own default value.


	const norPicStr = ( normalizeConditionalName( picNamStr ) || '' ).trim();                             // What: Normalize Picker String. Why: The default name's own picker-name prefix should be tidied the same way a typed name is. How: This calls normalizeConditionalName against picNamStr, falling back to an empty string when it returns nothing.
	const basNamStr = ( norPicStr ? norPicStr + ' ' : '' ) + 'Conditional';                                // What: Base Name String. Why: Every candidate name below is built from this same "{Picker} Conditional" prefix. How: This prepends norPicStr (plus a trailing space) when one exists, otherwise starts from "Conditional" alone.
	const takNamSet = new Set( exiNamArr.map( ( exiOneStr ) => ( exiOneStr || '' ).trim().toLowerCase() ) ); // What: Taken Name Set. Why: Finding a free N below needs a case-insensitive lookup of every name already in use. How: This lowercases and trims every entry of exiNamArr into a Set.

	let namCouNum = 1; // What: Name Count Number. Why: The candidate suffix N starts at 1 and climbs only as far as an actual collision requires. How: This is incremented by the while loop below until basNamStr plus this number is free.


	while ( takNamSet.has( `${ basNamStr } ${ namCouNum }`.toLowerCase() ) ) namCouNum++; // What: Free Suffix Search Loop. Why: The chosen name must not collide with any existing conditional's own name. How: This keeps incrementing namCouNum while the case-insensitive candidate is already present in takNamSet.



	return {


		name      : `${ basNamStr } ${ namCouNum }`, // What: Name. Why: This is the new conditional's own resolved, collision-free default name. How: This joins basNamStr and namCouNum with a space.
		cardText  : 'Picker suppressed for today',   // What: Card Text. Why: A brand-new conditional needs a sensible default day-off card message. How: This is a fixed starting sentence the user can freely edit afterward.
		mode      : 'random',                        // What: Mode. Why: A brand-new conditional defaults to the simplest, no-configuration mode. How: This matches the same 'random' fallback curModStr resolves to above.
		weight    : 1,                                // What: Weight. Why: This mirrors the picker item default weight, kept for parity even though conditionals do not currently expose their own weight control. How: This is a fixed starting value of 1.
		oddsPct   : 50,                                // What: Odds Percentage. Why: A brand-new weighted/dynamic-mode conditional should default to an even coin-flip odds value. How: This is a fixed starting value of 50.
		easeMin   : 7,                                 // What: Ease Minimum. Why: This matches the same 7-day fallback easMinNum resolves to above. How: This is a fixed starting value of 7.
		easeMax   : 14,                                // What: Ease Maximum. Why: This matches the same 14-day fallback easMaxNum resolves to above. How: This is a fixed starting value of 14.
		value     : 0,                                 // What: Value. Why: A brand-new value-family-mode conditional starts fully uncharged. How: This is a fixed starting value of 0.
		active    : true,                              // What: Active. Why: A brand-new conditional should take effect immediately rather than starting disabled. How: This is a fixed starting value of true.
		triggered : false,                             // What: Triggered. Why: A brand-new conditional has not yet resolved a triggered state for any day. How: This is a fixed starting value of false.
		threshold : 100                                // What: Threshold. Why: This matches the same 100 fallback thrValNum resolves to above, and THR_DEF_NUM's own value. How: This is a fixed starting value of 100.


	};


};



