


// #region Imports

import cssModObj from './picker-form.module.css'; // What: CSS Module Object. Why: PicForCom's own styles live in its module. How: Each className reads its hashed class from here.
import React     from 'react';                    // What: React. Why: PicForCom is built directly on React's own APIs. How: This is used directly (React.useCallback, for one) instead of importing individual named hooks.


import { ButBasCom    } from '../../ui/button.tsx';               // What: Button Base Component. Why: The form's step, add, save and cancel actions need consistently-styled controls. How: This is rendered for each of those actions.
import { CAD_NAM_OBJ  } from '../../core/cadence.ts';             // What: Cadence Namespace Object. Why: This is the namespace of pure functions this file uses to normalize and edit a picker's own cadence. How: This is called for its cadence helpers, such as norCadFun, throughout PicForCom.
import { CadConCom    } from '../../ui/cadence-control.tsx';      // What: Cadence Control Component. Why: This is the shared editor for a picker's cadence settings. How: This is rendered inside PicForCom's daily-schedule block, wired to the local cadence state.
import { CodConCom    } from '../../ui/conditional-controls.tsx'; // What: Conditional Control Component. Why: Attaching a brand-new inline conditional needs the same editor the Data tab uses. How: This is rendered inside PicForCom's conditional-attach block, wired to the local conDraObj state.
import { ColDisCom    } from '../../ui/collapse.tsx';             // What: Collapse Disclosure Component. Why: Several optional sections need an animated expand/collapse instead of an abrupt show/hide. How: This wraps each optional section, such as the add-group input, gated on its own open condition.
import { conDraFun    } from '../../ui/conditional-controls.tsx'; // What: Conditional Draft Function. Why: Starting a new inline conditional needs a sensible starting draft shape. How: This builds the initial draft at mount and again whenever the user opens the Add New Conditional pill, seeded from the picker's own name.
import { durMilFun    } from '../../utils/rhythm.ts';             // What: Duration Millisecond Function. Why: Timers that wait on a CSS animation must end with it. How: This returns a duration step's length in milliseconds, matching the stylesheet's own --dur-* tokens.
import { emlTouObj    } from '../../state/tour-bus.ts';           // What: Ease-My-Life Tour Object. Why: A couple of tour-driven behaviors need to read the shared tour bus's current value synchronously, not through React state. How: This is read via emlTouObj.get() when staging a new draft item's tour prefill.
import { IcoSvgCom    } from '../../ui/icon.tsx';                 // What: Icon SVG Component. Why: Buttons and status rows throughout this file need a small recognizable glyph. How: This is rendered wherever an icon is needed, given a name and a size.
import { InfTipCom    } from '../../ui/info-tip.tsx';             // What: Info Tip Component. Why: A pool row's Delete must explain why it is unavailable once the pool is at its 2-item floor. How: This wraps that row's trash glyph with the requirement as its tip.
import { IteCarCom    } from './item-card.tsx';                   // What: Item Card Component. Why: Adding or editing a pool item opens the shared item card, holding the same weight/ease editor the Today tab uses. How: This is rendered below the pool list, wired to the local draft-item actions.
import { norConFun    } from '../../core/pickers.ts';             // What: Normalize Conditional Function. Why: A new inline conditional's name must be compared against existing ones the same way the store itself normalizes them. How: This is called on the conditional draft's own name before checking it for a collision.
import { norGroFun    } from '../../core/pickers.ts';             // What: Normalize Group Function. Why: A newly-typed group name must be normalized the same way the store itself normalizes group names. How: This is called on the new-group input's value to compute the picker's effective group.
import { PIC_NAM_OBJ  } from '../../core/pickers.ts';             // What: Pickers Namespace Object. Why: A newly added item takes the same default drift band and full-charge ceiling the pickers module uses, and its ease band reads as days. How: This is read for those shared defaults, such as DEF_EAS_OBJ, and called to convert the band to days.
import { ranIdeFun    } from '../../utils/random-id.ts';          // What: Random Identifier Function. Why: A new item needs a stable id from the moment it's added. How: This mints an 'it_' id.
import { redMotFun    } from '../../utils/motion.ts';             // What: Reduced Motion Function. Why: The Daily section's scroll must not wait on an animation that reduced motion skips. How: This is checked once, to drop the reveal delay to 0 under reduced motion.
import { rhyPixFun    } from '../../utils/rhythm.ts';             // What: Rhythm Pixel Function. Why: Pixel layout math here needs the same step sizes the stylesheet uses. How: This returns a vertical rhythm step in pixels at the current root font size.
import { scrBehFun    } from '../../utils/motion.ts';             // What: Scroll Behavior Function. Why: Script-driven scrolls here should jump instead of glide for a user who prefers reduced motion. How: This is called for each scroll's behavior.
import { SED_NAM_OBJ  } from '../../state/seed.ts';               // What: Seed Namespace Object. Why: This is the canonical lookup of every picker mode's own label and hint text. How: This is read (MOD_DEF_OBJ) throughout to show the active mode's label/hint and to render the mode-choice radio list.
import { selAllFun    } from '../../utils/input.ts';              // What: Select All Function. Why: A new pool item opens with a default name that typing should replace outright. How: This is the name field's ref callback, selecting its text once as it mounts.
import { togFadFun    } from '../../ui/edge-fade.ts';             // What: Toggle Fade Function. Why: The conditional rail hides each edge fade once that edge is reached. How: This is called by the rail's scroll and resize handlers.
import { useDelConFun } from './delete-confirm.ts';               // What: Use Delete Confirm Function. Why: A pool row's inline delete confirmation is shared with the other pool on this tab. How: This is called once for the confirm state and its Cancel handler.
import { useEmlTouFun } from '../../state/tour-bus.ts';           // What: Use Ease-My-Life Tour Function. Why: Several behaviors here read the shared tour bus as React state. How: This is called once per component to subscribe to the tour bus's phase, staged item name, and reopen nonce.
import { useFliRaiFun } from '../../ui/flip-rail.ts';             // What: Use Flip Rail Function. Why: The conditional rail's selected pill should glide to the front instead of snapping, matching the Data tab. How: This is called once with the rail ref and a trigger key.
import { useIteDraFun } from '../../ui/record-draft.ts';          // What: Use Item Draft Function. Why: An added pool item's editor edits a local draft, committed into the pool only on Save. How: This is called once with whichever pool item's editor is open.
import { WeeChiCom    } from '../../ui/weekday-chips.tsx';        // What: Weekday Chip Component. Why: The daily-schedule block needs a 7-day picker for which weekdays a picker may run on. How: This is rendered in PicForCom's schedule block, wired to the runDowArr state.


import type { ActStoTyp } from '../../state/store.ts';     // What: Action Store Type. Why: The new picker's local pool mirrors the store's item actions. How: This types draActObj's methods.
import type { ConRcdTyp } from '../../core/data-model.ts'; // What: Conditional Record Type. Why: The form offers every existing conditional for attachment. How: This types PfcProTyp's conObjArr.
import type { IteRcdTyp } from '../../core/data-model.ts'; // What: Item Record Type. Why: The new picker's pool is built from items. How: This types the pool the item editors read.
import type { ModNamTyp } from '../../core/data-model.ts'; // What: Mode Name Type. Why: The mode radios pick one of the five modes. How: This types the chosen mode.
import type { PicArgTyp } from '../../core/data-model.ts'; // What: Picker Argument Type. Why: The form can start from an optional prefill. How: This types the prefill.
import type { PicForTyp } from '../../core/data-model.ts'; // What: Picker Form Type. Why: The form hands back a finished picker with its name, group, and mode. How: This types the payload it builds and the callbacks that receive it.

// #endregion Imports



/**
 * picker-form.tsx = Picker Form
 *
 * @summary
 * The two-step create form for a brand-new picker, and the Details-only editor
 * for an existing one. Step 1 (Details) covers the name, group, mode,
 * conditional and daily schedule; Step 2 (Items) builds the first pool by
 * typing item names. Editing shows only Step 1, since an existing picker's
 * items are edited in its own pool or on the Data tab. On submit it calls
 * onCrePicFun for a new picker or onSavEdiFun for an edit.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

type TwcProTyp = { 'data-element-name-hook' : string, className : string, disHelEle : React.ReactNode, enaHelEle : React.ReactNode, ideValStr : string, labTexStr : string, onClick : () => void, value : boolean }; // What: Toggle-Row-Component Props Type. Why: Each toggle row names its own wrapper, id, label, and help wording, and shows and flips its own setting. How: This types TogRowCom's props.

// #region TogRowCom

/**
 * TogRowCom = Toggle Row Component
 *
 * @summary
 * Renders one form toggle: a label and a live help paragraph beside an
 * on/off switch. The paragraph shows the on or off wording for the
 * setting's current state and cross-fades whenever the state flips, and the
 * switch takes the label as its own accessible name.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.data-element-name-hook - Data Element Name Hook: The row's own
 *                                       identity hook, forwarded onto it.
 * @param props.className              - Class Name: The row's own class.
 * @param props.disHelEle              - Disabled Help Element: The help
 *                                       wording while the setting is off.
 * @param props.enaHelEle              - Enabled Help Element: The help
 *                                       wording while the setting is on.
 * @param props.ideValStr              - Identifier Value String: The switch's
 *                                       id, which the label points at.
 * @param props.labTexStr              - Label Text String: The toggle's own
 *                                       label.
 * @param props.onClick                - On Click: Called when the switch is
 *                                       pressed.
 * @param props.value                  - Value: Whether the setting is on.
 *
 * @returns The toggle row.
 *
 * @example
 * ```tsx
 * TogRowCom({ className, ideValStr, labTexStr, ... }) // => <TogRowCom />
 * ```
 *
*/

function TogRowCom ( { 'data-element-name-hook' : hooNamStr, className, disHelEle, enaHelEle, ideValStr, labTexStr, onClick, value } : TwcProTyp ) : React.JSX.Element {


	return (


		<div
			className={ className }

			data-element-name-hook={ hooNamStr }
		>{ /* What: Toggle Row Div Element. Why: The label/help text block and its own switch sit side by side. How: This wraps togTexDiv and the switch button. Its data-element-name-hook is read by help mode. */ }


			<div className={ cssModObj.togTexDiv }>{ /* What: Toggle Text Div Element. Why: The toggle's own label and live explanation belong together. How: This wraps the label and help paragraph below. */ }


				<label
					className={ cssModObj.forLabLab }
					htmlFor={ ideValStr }
				>{ labTexStr }</label>{ /* What: Form Label Label Element. Why: The switch below needs an associated, readable label. How: This is linked to the switch through ideValStr. */ }

				<p
					key={ value ? 'on' : 'off' } // What: Help Text Key. Why: The help line fades between its on and off text. How: This keys the paragraph 'on' while value is true and 'off' otherwise, so a toggle remounts it.

					className={` ${ cssModObj.forHelPar }   ${ cssModObj.forHelParFade } `}
				>{ value ? enaHelEle : disHelEle }</p>{ /* What: Form Help Paragraph Fade Element. Why: The user should immediately see the practical consequence of the toggle's own current state. How: This is re-keyed by value so the text cross-fades on every flip, showing enaHelEle or disHelEle. */ }


			</div>

			<button
				id={ ideValStr }

				className={ cssModObj.togSwiBut }

				data-element-name-hook='togSwiBut'

				type='button'

				aria-checked={ value }
				aria-label={ labTexStr }
				role='switch'

				onClick={ onClick }
			>{ /* What: Toggle Switch Button Element. Why: This is the actual on/off control for the setting. How: This calls onClick when pressed. Its data-element-name-hook is read by help mode and the test suites. */ }


				<i className={ cssModObj.swiKnoIta } />{ /* What: Switch Knob Italic Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off its parent switch's own aria-checked state. */ }


			</button>


		</div>


	);


}

// #endregion TogRowCom



type PfcProTyp = { conObjArr? : ConRcdTyp[], exiGroArr : string[], iniForObj? : ( PicArgTyp & { focusName? : boolean } ) | null, iniGroStr? : string, isaEdiBoo? : boolean, onCanForFun : () => void, onCrePicFun? : ( payForObj : PicForTyp ) => void, onSavEdiFun? : ( payForObj : PicForTyp ) => void }; // What: Picker-Form-Component Props Type. Why: The form creates a new picker or edits an existing one's details, starting from an optional prefill. How: This types PicForCom's props, with the create and save callbacks both taking the finished payload.

// #region PicForCom

/**
 * PicForCom = Picker Form Component
 *
 * @summary
 * The setup view for a brand-new picker, and (via isaEdiBoo) the shared
 * Details-only editor for an existing one. Renders in the same slot a
 * selected picker's own PicVieCom would, so creating a picker reuses the
 * mental model of "this is what a picker looks like" the whole app
 * already teaches: Step 1 (Details) covers Name/Group/Mode/Conditional/
 * Daily schedule, Step 2 (Items) builds a fresh pool by typing item
 * names. Editing only ever shows Step 1, since an existing picker's own
 * items are edited via the Data tab or PicVieCom's own live pool instead.
 * On submit this calls onCrePicFun (a fresh picker) or onSavEdiFun (an
 * in-place edit), depending on isaEdiBoo.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.conObjArr   - Conditional Object Array: Every existing
 *                            conditional, offered for attachment; defaults to
 *                            an empty array.
 * @param props.exiGroArr   - Existing Group Array: Every distinct group name
 *                            already in use, offered as chips.
 * @param props.iniForObj   - Initial Form Object: A prefilled starting shape
 *                            (edit values, a tour's staged sample, or an
 *                            empty-state quick-start prefill); optional.
 * @param props.iniGroStr   - Initial Group String: A group name to prefill the
 *                            picker onto, without opening the add-a-new-group
 *                            sub-form.
 * @param props.isaEdiBoo   - Is-An Edit Boolean: Switches between the create
 *                            flow (both steps, onCrePicFun) and the edit flow
 *                            (Step 1 only, onSavEdiFun); defaults to undefined
 *                            (falsy).
 * @param props.onCanForFun - On Cancel Form Function: Called when the user
 *                            backs out without creating/saving anything.
 * @param props.onCrePicFun - On Create Picker Function: Called with the
 *                            finished payload when a new picker is submitted
 *                            (isaEdiBoo false).
 * @param props.onSavEdiFun - On Save Edit Function: Called with the finished
 *                            payload when an edit is submitted (isaEdiBoo
 *                            true).
 *
 * @returns The form's own current step (Details or Items), or, while
 * isaEdiBoo is true, only ever the Details step.
 *
 * @example
 * ```tsx
 * PicForCom({ conObjArr, exiGroArr, iniForObj, ... }) // => <PicForCom />
 * ```
 *
*/

function PicForCom ( { conObjArr = [], exiGroArr, iniForObj, iniGroStr, isaEdiBoo, onCanForFun, onCrePicFun, onSavEdiFun } : PfcProTyp ) : React.JSX.Element {


	// #region Form Step And Name

	const touBusObj = useEmlTouFun();                                  // What: Tour Bus Object. Why: advSteFun needs to know whether a guided tour (of any kind) is currently driving the page, so it can skip its own scroll-to-top when a picker mini-tour is mid-flight. How: This subscribes to the shared tour event bus.
	const namInpRef = React.useRef< HTMLInputElement | null >( null ); // What: Name Input Reference. Why: The focus effect right below needs a handle on the real input DOM node. How: This is attached to the name input's own ref prop, below.

	const [ forSteNum, setForSteNum ] = React.useState( ( iniForObj && iniForObj.step ) || 1 );  // What: Form Step Number And Setter. Why: This is the whole form's own current sub-step (1 Details, 2 Items). How: This starts from a prefilled step (a tour resuming mid-form) or 1.
	const [ newNamStr, setNewNamStr ] = React.useState( ( iniForObj && iniForObj.name ) || '' ); // What: New Name String And Setter. Why: This is the picker's own live-typed name field. How: This starts from a prefilled name, or empty.


	React.useEffect( () => { // What: Focus Name Effect. Why: Arriving from Today's empty-state card should land the cursor directly in the name field, ready to type. How: This focuses and selects the name input only when iniForObj explicitly asks for it.


		if ( iniForObj && iniForObj.focusName && namInpRef.current ) { // What: Focus Request Guard. Why: Only an explicit focusName request should steal focus on mount. How: This checks both that a prefill exists and that it actually asked for focus.


			namInpRef.current.focus(); // What: Focus Call. Why: The cursor needs to land in the name field. How: This calls the native focus() on the input DOM node.

			namInpRef.current.select(); // What: Select Call. Why: A pre-filled placeholder value (if any) should be fully selected, ready to be typed over. How: This calls the native select() on the input DOM node.


		}


	}, [ iniForObj ] ); // What: Effect Dependency Array. Why: Only a new prefill can ask for focus. How: A new iniForObj re-runs the effect, and it acts only when that prefill carries focusName.

	// #endregion Form Step And Name



	// #region Group Mode And Daily

	const [ selGroStr, setSelGroStr ] = React.useState( iniGroStr || exiGroArr[ 0 ] || '' );                                                  // What: Selected Group String And Setter. Why: This is which existing group chip is currently chosen. How: This starts from iniGroStr, or the first existing group, or empty.
	const [ addGroBoo, setAddGroBoo ] = React.useState( ( iniForObj && iniForObj.group ) ? true : exiGroArr.length === 0 );                   // What: Adding Group Boolean And Setter. Why: The inline "New Group" sub-form is its own mode, distinct from picking an existing chip. How: This starts open when a prefill explicitly stages a new group name, or when there are no existing groups to choose from at all.
	const [ newGroStr, setNewGroStr ] = React.useState( ( iniForObj && iniForObj.group ) || '' );                                             // What: New Group String And Setter. Why: This is the live-typed value of the inline "New Group" sub-form. How: This starts from a prefilled group name, or empty.
	const [ selModStr, setSelModStr ] = React.useState( ( iniForObj && iniForObj.mode ) || 'random' );                                        // What: Selected Mode String And Setter. Why: This is which picker mode is currently chosen. How: This starts from a prefilled mode, or 'random'.
	const [ incDaiBoo, setIncDaiBoo ] = React.useState( ( iniForObj && 'includeInDaily' in iniForObj ) ? !!iniForObj.includeInDaily : true ); // What: Include Daily Boolean And Setter. Why: Whether this picker is included when the user taps Regenerate on Today. How: This defaults on, matching existing behavior for newly-created pickers, unless editing an existing one, which prefills its own current membership.

	const daiBloRef = React.useRef< HTMLDivElement | null >( null ); // What: Daily Block Reference. Why: The reveal effect right below needs a handle on the schedule block's own DOM node. How: This is attached to the schedule block's own ref prop, below.
	const daiTogRef = React.useRef( false );                         // What: Daily Toggled Reference. Why: The reveal effect below must only fire when the USER actually flipped the switch, not on an initial prefilled-true render. How: This is set true by the switch's own onClick and read (but never itself triggers a re-render) by the effect below.


	React.useEffect( () => { // What: Daily Reveal Effect. Why: Re-enabling the Daily section should bring the newly-revealed block fully into view, since it can unfurl below the fold. How: This waits for the ColDisCom unfurl to finish, then scrolls the shared main container just enough to bring the block fully into view.


		if ( !incDaiBoo || !daiTogRef.current ) return; // What: Not User-Toggled Guard. Why: Only a genuine user toggle-on should trigger this scroll, not a prefilled initial value. How: This bails out unless both incDaiBoo is true and daiTogRef.current is true.



		const scrTimNum = setTimeout( () => { // What: Scroll Timeout Number. Why: The block must be measured only after ColDisCom's own unfurl animation has actually finished expanding it to full height. How: This waits redMotFun() ? 0 : the unfurl's own p02 duration step before measuring and scrolling.


			const daiBloEle = daiBloRef.current;                                                         // What: Daily Block Element. Why: The scroll calculation needs the actual DOM node. How: This reads daiBloRef.current once and reuses it below.
			const scrConEle = daiBloEle && daiBloEle.closest( '[data-element-name-hook~="appConMai"]' ); // What: Scroll Container Element. Why: The shared scrollable container is what actually needs to move. How: This walks up from daiBloEle to the nearest main ancestor.


			if ( !daiBloEle || !scrConEle ) return; // What: Missing Element Guard. Why: Either element may not exist yet if this fires after an unrelated unmount. How: This bails out of the scroll calculation entirely when either is missing.



			const oveBelNum = daiBloEle.getBoundingClientRect().bottom - scrConEle.getBoundingClientRect().bottom + rhyPixFun( 'p07' ); // What: Overflow Below Number. Why: This is how far below the visible fold the block actually sits, plus a small comfort margin. How: This subtracts the container's own bottom edge from the block's own bottom edge. // Vertical Rhythm Base Plus 7 ~= 104.323px


			if ( oveBelNum > 0 ) scrConEle.scrollTo({ // What: Scroll Adjust Guard. Why: Only an actually-overflowing block needs to be scrolled into view at all. How: This scrolls the container down by exactly the overflow amount.


				behavior : scrBehFun(),                    // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
				top      : scrConEle.scrollTop + oveBelNum // What: Top. Why: The page scrolls just enough to reveal the Daily schedule block's bottom edge. How: This adds oveBelNum to the current scroll.


			});


		}, redMotFun() ? 0 : durMilFun( 'p02' ) ); // What: Reveal Delay. Why: The scroll should wait for the Daily section's own expand animation, except under reduced motion. How: This waits that animation's own p02 duration step, or 0 under reduced motion. // Duration Base Plus 2 ~= 277.0ms



		return () => clearTimeout( scrTimNum ); // What: Effect Cleanup Return. Why: A stale scroll must not fire after this effect re-runs or unmounts. How: This cancels the scheduled scrTimNum timeout.


	}, [ incDaiBoo ] ); // What: Effect Dependency Array. Why: This only needs re-evaluating when the Daily toggle itself changes. How: incDaiBoo is the sole value this effect's own guard checks.

	// #endregion Group Mode And Daily



	// #region Schedule Options

	const [ runDowArr, setRunDowArr ] = React.useState( ( iniForObj && iniForObj.daysOfWeek ) || [ 0, 1, 2, 3, 4, 5, 6 ] ); // What: Run Day-Of-Week Array And Setter. Why: When included, an optional schedule of which weekdays the picker may run on. How: This defaults to every day, unless a prefill (e.g. a picker mini-tour's sample data) specifies otherwise.
	const [ skiHolBoo, setSkiHolBoo ] = React.useState( ( iniForObj && iniForObj.skipHolidays ) || false );                 // What: Skip Holidays Boolean And Setter. Why: Whether this picker sits out major U.S. holidays. How: This starts from a prefilled value, or false.
	const [ avoDupBoo, setAvoDupBoo ] = React.useState( ( iniForObj && iniForObj.avoidDuplicates ) || false );              // What: Avoid Duplicates Boolean And Setter. Why: Excludes an item from this picker's own pool for the day if its name (case-insensitive) is already present elsewhere on today's list, for pickers that intentionally share items with another picker and don't want the same one to surface twice. How: This defaults off, since most pickers don't share a pool with anything else, so this should stay opt-in.
	const [ cadCurObj, setCadCurObj ] = React.useState( () => CAD_NAM_OBJ.norCadFun( iniForObj || {} ) );                   // What: Cadence Current Object And Setter. Why: How often this picker surfaces, plus its anchor. How: This defaults to daily, unless editing an existing picker (which prefills its current cadence): CAD_NAM_OBJ.norCadFun picks up whichever cadence fields iniForObj carries and falls back to daily defaults for the rest.

	const locDowNum = cadCurObj.cadence === 'weekly' ? cadCurObj.anchorDow : null;                                   // What: Locked Day-Of-Week Number. Why: Weekly cadence pins its anchor day ON in the Days control (and blocks the presets from dropping it), so the two controls can't contradict each other. How: This is the anchor day while weekly, otherwise null.
	const witLocFun = ( dayInpArr : number[] ) => CAD_NAM_OBJ.enfWeeFun( { ...cadCurObj, daysOfWeek : dayInpArr } ); // What: With Locked Function. Why: Every preset button below needs to apply the same locked-day enforcement the effect below already applies to manual edits. How: This calls the shared CAD_NAM_OBJ helper with the candidate days merged into the current cadence.


	React.useEffect( () => { // What: Enforce Weekly Day Effect. Why: A cadence change (e.g. switching into weekly, or changing which day is anchored) must also keep runDowArr consistent with the new anchor. How: This re-applies CAD_NAM_OBJ.enfWeeFun whenever the cadence or its anchor day changes.


		setRunDowArr( ( curDayArr ) => { // What: Days Reconcile Call. Why: Only a genuinely different result should trigger a re-render. How: This computes the enforced days and returns the previous array unchanged if nothing actually changed.


			const nexDayArr = CAD_NAM_OBJ.enfWeeFun( { ...cadCurObj, daysOfWeek : curDayArr } ); // What: Next Day Array. Why: This is the actual enforced result to compare against. How: This calls the shared CAD_NAM_OBJ helper with the current days.



			return nexDayArr.length === curDayArr.length ? curDayArr : nexDayArr; // What: Unchanged Guard Return. Why: Returning the SAME array reference when nothing changed avoids a pointless extra render. How: This compares lengths as a cheap proxy for "did enforcement actually add the missing anchor day".


		} );


	}, [ cadCurObj ] ); // What: Effect Dependency Array. Why: Only the cadence and its anchor day can change which day must be locked on, and both live in cadCurObj. How: A re-run from any other cadence edit computes the same days, so the reconcile returns the previous array and nothing re-renders.

	// #endregion Schedule Options



	// #region Conditional Attachment

	const [ conAttBoo, setConAttBoo ] = React.useState( !!( iniForObj && iniForObj.conditionalId ) );       // What: Conditional Attach Boolean And Setter. Why: An optional conditional gate; when on, the user attaches an existing conditional or creates a fresh inline one. How: This starts on only when the prefill already names an attached conditional.
	const [ conSelStr, setConSelStr ] = React.useState( ( iniForObj && iniForObj.conditionalId ) || null ); // What: Conditional Selected String And Setter. Why: This holds which conditional is chosen: an existing id, the literal 'new', or null. How: This starts from a prefilled conditionalId, or null.
	const [ conDraObj, setConDraObj ] = React.useState( () => conDraFun( '' ) );                            // What: Conditional Draft Object And Setter. Why: Creating a fresh inline conditional needs its own draft shape to edit. How: This starts from the shared default, seeded with an empty name until the user actually opens the "Add New Conditional" pill.

	const conTidStr = norConFun( conDraObj.name ) || ''; // What: Conditional Tidy String. Why: Create-new requires a UNIQUE name; normalizing first, then comparing against existing conditionals (which are stored normalized), is what actually detects a real collision, not just a surface-level text match. How: This runs conDraObj's own name through the shared normalizer.


	const conColBoo = conAttBoo && conSelStr === 'new' && conObjArr.some( ( conCurObj ) => ( conCurObj.name || '' ).toLowerCase() === conTidStr.toLowerCase() ); // What: Conditional Collides Boolean. Why: Reuse is the deliberate act of tapping an existing pill, not a silent name match, so only the create-new path can ever collide. How: This checks conTidStr against every existing conditional's own name, case-insensitively.


	const conErrStr = conColBoo // What: Conditional Error String. Why: The name field needs a concrete, actionable message once a collision is actually detected. How: This names the colliding conditional directly and suggests reusing it instead.
		? `A conditional named “${ conTidStr }” already exists. Choose a different name, or select it from the list above to reuse it.` // What: Collision Message Branch. Why: A colliding name needs a concrete, actionable message. How: This names the colliding conditional and suggests reusing it.
		: null; // What: No Collision Branch. Why: A unique name has no error. How: This returns null.


	const raiCleRef = React.useRef< ( () => void ) | null >( null ); // What: Rail Cleanup Reference. Why: The edge-fade cue on the conditional rail (matching the app's other horizontal rails) needs its own teardown function remembered across callback-ref re-invocations. How: This holds whatever cleanup function raiCalFun most recently registered, run and cleared at the top of every subsequent call.
	const raiNodRef = React.useRef< HTMLElement | null >( null );    // What: Rail Node Reference. Why: The scroll-to-start effect and the reorder animation below both need to read back the same DOM node raiCalFun most recently attached to. How: This mirrors whatever element is currently mounted, or null while the rail itself isn't rendered.


	// #region raiCalFun

	/**
	 * raiCalFun = Rail Callback Function
	 *
	 * @summary
	 * The callback ref for the create form's conditional pill rail. ColDisCom
	 * mounts the rail a render after the conditional toggle turns on, so a
	 * plain effect would run while the ref is still empty; this ref runs as
	 * the node attaches and again with null as it detaches. Every call first
	 * tears down the previous attachment's listeners, records the new node in
	 * raiNodRef, and wires the rail's edge-fade attributes to its own scroll
	 * and a ResizeObserver.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param raiCurEle - Rail Current Element: The rail's DOM node on attach,
	 *                    or null on detach.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * raiCalFun(raiCurEle) // => void
	 * ```
	 *
	*/

	const raiCalFun = React.useCallback( ( raiCurEle : HTMLElement | null ) => { // What: Rail Callback Function. Why: ColDisCom (below) mounts this rail one render AFTER conAttBoo flips true (it mounts its children from an effect once open flips), so a plain useEffect keyed on conAttBoo would fire while the ref is still null and never get another chance to run once the rail actually appears; a callback ref, which fires as the DOM node attaches (and with null when it detaches), plus a ResizeObserver, which re-fires whenever conditionals are added/removed and the rail's content width changes, sidesteps that race entirely. How: This registers a scroll listener and a ResizeObserver on whatever element the rail's own ref prop attaches to below, tearing down the previous ones first.


		if ( raiCleRef.current ) { // What: Previous Cleanup Guard. Why: A remount (or unmount) must not leave the prior element's own listeners dangling. How: This runs and clears whatever teardown function was registered for the previous element, if any.


			raiCleRef.current();      // What: Previous Cleanup Call. Why: The old rail's listeners must not outlive it. How: This runs the stored cleanup.
			raiCleRef.current = null; // What: Cleanup Clear. Why: The stored cleanup has run and must not run again. How: This resets raiCleRef to null.


		}



		raiNodRef.current = raiCurEle; // What: Node Mirror Write. Why: The scroll-to-start effect and the reorder animation below need to read back the current node outside of this callback's own closure. How: This mirrors raiCurEle into raiNodRef.current.



		if ( !raiCurEle ) return; // What: Unmount Guard. Why: A null element means the rail just unmounted, with nothing left to observe. How: This bails out before registering anything.



		const updRaiFun = () => togFadFun( raiCurEle ); // What: Update Rail Function. Why: The scroll-edge attributes need recomputing every time the rail scrolls or resizes. How: This calls togFadFun on raiCurEle.


		updRaiFun(); // What: Initial Update Call. Why: The attributes need to be correct immediately on mount, without waiting for a scroll or resize event. How: This invokes updRaiFun once, synchronously.

		raiCurEle.addEventListener( 'scroll', updRaiFun, { passive : true } ); // What: Scroll Listener Call. Why: The attributes must stay correct as the user actually scrolls the rail. How: This re-runs updRaiFun on every scroll event.


		const resObsObj = new ResizeObserver( updRaiFun ); // What: Resize Observer Object. Why: Adding or removing a conditional pill can change the rail's own scrollable width without the rail itself scrolling. How: This re-runs updRaiFun whenever the observed element's size changes.


		resObsObj.observe( raiCurEle ); // What: Resize Observer Start Call. Why: The observer above does nothing until it's actually told what to watch. How: This starts watching raiCurEle for size changes.

		raiCleRef.current = () => { // What: Cleanup Registration. Why: The next callback-ref invocation (a remount or unmount) needs a teardown function ready to run. How: This stores a closure removing the scroll listener and disconnecting the observer.


			raiCurEle.removeEventListener( 'scroll', updRaiFun ); // What: Scroll Unsubscribe Call. Why: The listener must not outlive this rail. How: This removes updRaiFun from raiCurEle.
			resObsObj.disconnect();                               // What: Observer Disconnect Call. Why: The observer must not outlive this rail either. How: This disconnects resObsObj.


		};


	}, [] ); // What: Effect Dependency Array. Why: This callback ref never needs to change identity; the element it receives is a normal parameter, not a dependency. How: An empty array means React never has to detach and reattach it across renders.

	// #endregion raiCalFun



	useFliRaiFun( raiNodRef, `${ conSelStr }|${ conAttBoo }|${ conObjArr.length }` ); // What: Use Flip Rail Call. Why: Selecting a conditional pins its pill to the front of the rail, and this plays the shared glide instead of a silent snap, matching the Data tab. How: This passes the rail ref and a trigger key built from the selection, the attach toggle, and the conditional count.


	React.useEffect( () => { // What: Scroll To Start Effect. Why: Selecting a conditional pins it to the front of the rail (see the sort in the render below), so the rail should scroll back to the start to bring it into view, same idea as the Data tab's own attached-conditional pin. How: This scrolls raiNodRef's own current element back to its start whenever conSelStr changes to a real, non-'new' selection.


		const raiCurEle = raiNodRef.current; // What: Rail Current Element. Why: The scroll call below needs the actual live DOM node. How: This reads raiNodRef.current once.

		const notRaiBoo = !raiCurEle;          // What: Not Rail Boolean. Why: An unmounted rail has nothing to scroll. How: This negates raiCurEle.
		const notSelBoo = conSelStr == null;   // What: Not Selected Boolean. Why: With nothing selected there's no pill to scroll to. How: This checks conSelStr is null or undefined.
		const newSelBoo = conSelStr === 'new'; // What: New Selected Boolean. Why: The 'new' pill already sits at the rail's start. How: This checks conSelStr is 'new'.

		const skiScrBoo = notRaiBoo || notSelBoo || newSelBoo; // What: Skip Scroll Boolean. Why: Any one of these means there's no real selection to scroll to. How: This ORs the 3 checks above.


		if ( skiScrBoo ) return; // What: No Real Selection Guard. Why: Only picking a REAL existing conditional should trigger this scroll; neither an unmounted rail nor the 'new' pill (which has nothing to scroll to) should. How: This bails out unless a real element exists and conSelStr is a genuine id.



		if ( raiCurEle.scrollLeft > 1 ) raiCurEle.scrollTo({ // What: Scroll Adjust Guard. Why: A rail that's already at its start needs no animation at all. How: This scrolls back to the start only when it's actually scrolled away from it.


			behavior : scrBehFun(), // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
			left     : 0            // What: Left. Why: The rail's start is its left edge. How: This scrolls to x 0.


		});


	}, [ conSelStr ] ); // What: Effect Dependency Array. Why: Only a genuine change to which conditional is selected should trigger this scroll. How: conSelStr is the sole value this effect's own guard checks.

	// #endregion Conditional Attachment



	// #region Item Pool And Step Advance

	const [ pooIteArr, setPooIteArr ] = React.useState< IteRcdTyp[] >( ( ( iniForObj && iniForObj.items ) || [] ) as IteRcdTyp[] ); // What: Pool Item Array And Setter. Why: Step 2's own pool; each item carries a name and a weight among its other fields, weight only mattering for weighted/dynamic modes and only editable inline then. How: This is a fresh pool (Option B, not a pick-from-library), starting from a prefilled items list, or empty; other defaults (drift value, ease knobs) are applied at commit time. // What: Type Assertion Note. Why: A prefilled form item may lack fields a stored item has. How: The pool is read as items, since the shared item editors read only the fields every pool item already carries.

	const forWraRef = React.useRef< HTMLDivElement | null >( null ); // What: Form Wrap Reference. Why: advSteFun needs a handle on this form's own root so it can walk up to whichever ancestor actually scrolls. How: This is attached to the form's own root div, below.


	const advSteFun = () => { // What: Advance Step Function. Why: Moving to Step 2 from the bottom-of-form button leaves the user scrolled down; the form's own scroll container should be pulled back to the top so the add-item field is in view without a manual scroll. How: This always steps to Step 2, and skips the scroll-to-top while a guided tour is active, since a tour's next step may highlight something further down the Items step.


		setForSteNum( 2 ); // What: Step Advance Call. Why: This is the actual step transition. How: This writes 2 into forSteNum.



		if ( touBusObj.touPhaStr === 'tour' ) return; // What: Tour Active Guard. Why: A running tour's own positioning must not be fought by this scroll-to-top. How: This bails out before scheduling any scroll at all.



		requestAnimationFrame( () => { // What: Scroll To Top Call. Why: The add-item field should be visible without a manual scroll. How: This walks up from forWraRef looking for the nearest genuinely-scrollable ancestor, falling back to the shared app content container (the appConMai element).


			let curWalEle : HTMLElement | null = forWraRef.current; // What: Current Walk Element. Why: The loop below needs a mutable pointer to walk up the DOM tree with. How: This starts at the form's own root and is reassigned to each ancestor in turn.


			while ( curWalEle && curWalEle !== document.body ) { // What: Ancestor Walk Loop. Why: The nearest ACTUALLY-scrollable ancestor (not just any parent) is what needs scrolling. How: This checks each ancestor's own computed overflow-y and real scroll height before deciding it's the one.


				const oveStyStr = getComputedStyle( curWalEle ).overflowY; // What: Overflow Style String. Why: Only an ancestor whose own CSS actually allows scrolling is a real candidate. How: This reads the computed overflowY value for curWalEle.


				if ( ( oveStyStr === 'auto' || oveStyStr === 'scroll' ) && curWalEle.scrollHeight > curWalEle.clientHeight ) { // What: Scrollable Ancestor Found Guard. Why: The first genuinely-scrollable ancestor found is the one that actually needs resetting. How: This scrolls it to the top and returns immediately, skipping every further ancestor.


					curWalEle.scrollTo({ // What: Ancestor Scroll Call. Why: This is the actual reset of the found ancestor. How: This scrolls curWalEle to its top.


						behavior : scrBehFun(), // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
						top      : 0            // What: Top. Why: The form's start is the top of the page. How: This scrolls to y 0.


					});



					return; // What: Early Return. Why: The nearest scrollable ancestor was handled, so no fallback is needed. How: This exits the frame callback.


				}



				curWalEle = curWalEle.parentElement; // What: Walk Advance. Why: No scrollable ancestor was found yet, so the search continues one level up. How: This reassigns curWalEle to its own parent.


			}


			const scrConEle = document.querySelector( '[data-element-name-hook~="appConMai"]' ); // What: Scroll Container Element. Why: No scrollable ancestor was found in the walk above, so the shared app-wide scroller is the fallback target. How: This queries for the main element directly.


			if ( scrConEle ) { // What: Fallback Scroll Guard. Why: Only a genuinely-found fallback container should be scrolled. How: This scrolls the app content container to the top if it exists.


				scrConEle.scrollTo({ // What: Fallback Scroll Call. Why: This is the actual reset of the main container. How: This scrolls scrConEle to its top.


					behavior : scrBehFun(), // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
					top      : 0            // What: Top. Why: The form's start is the top of the page. How: This scrolls to y 0.


				});


			}


		} );


	};

	// #endregion Item Pool And Step Advance



	// #region Mode Derivations

	const effGroStr = addGroBoo ? norGroFun( newGroStr, exiGroArr ) : selGroStr; // What: Effective Group String. Why: The picker's own real group is whichever of the two group controls (existing chip or new-group input) is currently active. How: This normalizes newGroStr when addGroBoo is on, otherwise it's just selGroStr directly.
	const detReaBoo = !!( newNamStr.trim() && effGroStr && selModStr );          // What: Details Ready Boolean. Why: Both steps' own footer buttons need to know whether Step 1's own required fields are actually complete. How: This requires a non-blank trimmed name, a real effective group, and a chosen mode.
	const shoWeiBoo = selModStr === 'weighted' || selModStr === 'dynamic';       // What: Show Weight Boolean. Why: Weight is a lever for these two modes. How: This gates the weight column throughout Step 2.
	const isaEasBoo = selModStr === 'ease-up' || selModStr === 'ease-down';      // What: Is-An Ease Boolean. Why: Only these two modes use the easeMin/easeMax drift band at all. How: This gates the ease controls throughout Step 2.

	// #endregion Mode Derivations



	const capStrFun = ( souTexStr : string ) => souTexStr.length ? souTexStr[ 0 ].toUpperCase() + souTexStr.slice( 1 ) : souTexStr; // What: Capitalize String Function. Why: A picker name this form commits should read with a capitalized first letter, however the user typed it. How: This upper-cases just the first character and leaves the rest untouched.



	// #region Draft Item Editing

	const [ actNewStr, setActNewStr ] = React.useState< string | null >( null );              // What: Active New String And Setter. Why: This holds the id of whichever draft item is currently being newly added (as opposed to an already-committed row being edited). How: This is set by addDraFun and cleared once its own closing animation finishes. // What: Reused Item Editor Design Note. Why: This is the same UI as the live Pickers-tab add flow; draft items carry a stable id so the shared EntEdiCom plus a synthetic actions object (backed by the draft array, not the store) can key off it. How: Adding opens the editor inline at the bottom; Save/Cancel play the same fade animations as the live flow.
	const [ actCloStr, setActCloStr ] = React.useState< false | 'cancel' | 'save' >( false ); // What: Active Closing String And Setter. Why: The new-item draft's own editor needs to play a closing animation before it's actually torn down. How: This holds 'save', 'cancel', or false, consumed by the draft wrap's own onAnimationEnd handler below. // What: Closing Values Note. Why: The close reason decides whether the draft is kept. How: It is false while open, otherwise 'save' or 'cancel'.
	const [ insDraStr, setInsDraStr ] = React.useState< string | null >( null );              // What: Insert Draft String And Setter. Why: A freshly-committed pool row needs its own insert animation, keyed to its own id. How: This is set once a new-item draft's own closing animation reports 'save'.

	const { canConFun, conDelStr, conLeaStr, setConDelStr } = useDelConFun(); // What: Cancel Confirm Function. Why: Cancel backs out of a pending delete. How: This plays the confirm row's leaving animation, then clears it. // What: Confirm Delete String. Why: A pool row asks before deleting, in place of its normal content. How: This holds the id showing its delete-confirm row. // What: Confirm Leaving String. Why: The confirm row plays an out-animation after Cancel. How: This holds the id playing it. // What: Set Confirm Delete String. Why: The delete button starts a row's confirmation, and the confirmed delete ends it. How: This sets conDelStr.

	const [ rmvIdeStr, setRmvIdeStr ] = React.useState< string | null >( null ); // What: Removing Identifier String And Setter. Why: A deleted pool row needs its own removal animation to finish before it's actually taken out of pooIteArr. How: This holds the id currently playing that removal animation.

	const addWraRef = React.useRef< HTMLDivElement | null >( null ); // What: Add Wrap Reference. Why: Both the new-item and edit-item flows render into this same below-the-list slot, which needs a stable handle so it can be scrolled into view. How: This is attached to the iteAddDiv div's own ref prop, below.

	const [ ediIteStr, setEdiIteStr ] = React.useState< string | null >( null ); // What: Editing Item String And Setter. Why: Editing an already-added draft item mirrors the live Pickers tab's own ediIteStr/opeEdiFun/staEdiFun in picker-view.tsx, just bound to pooIteArr + draActObj instead of the real store. How: This holds the id of whichever committed draft item currently has its editor open, or null.
	const [ ediCloBoo, setEdiCloBoo ] = React.useState( false );                 // What: Editing Closing Boolean And Setter. Why: Closing a committed draft item's editor needs its own out-animation before it's actually torn down. How: This is flipped true to start that animation.

	const penEdiRef = React.useRef< string | null >( null );                                  // What: Pending Edit Reference. Why: Switching straight from the new-item form (or a different item's editor) into this one must not silently drop the request. How: This holds the target id to reopen once whatever's currently closing finishes.
	const cmtCouNum = pooIteArr.filter( ( iteCurObj ) => iteCurObj.id !== actNewStr ).length; // What: Committed Count Number. Why: The count and the Create button must not react early to a row still being edited, so its own Save hasn't landed yet. How: This counts every pool item except the one still being newly added (actNewStr), so it is declared after actNewStr.
	const enoIteBoo = cmtCouNum >= 2;                                                         // What: Enough Item Boolean. Why: A picker must have at least 2 real, committed items before it can be created. How: This is true once cmtCouNum reaches 2.


	const draActObj : Pick< ActStoTyp, 'delIteFun' | 'renIteFun' | 'setWeiFun' | 'togVacFun' | 'updIteFun' > = { // What: Draft Actions Object. Why: The pool rows and useIteDraFun's commit both need store-shaped actions, but pooIteArr isn't the real store. How: Every method below mirrors the real store action's own name and signature, but writes into pooIteArr instead of dispatching a real store update.


		delIteFun : ( tarIdeStr ) => setPooIteArr( ( preIteArr ) => preIteArr.filter( ( iteCurObj ) => iteCurObj.id !== tarIdeStr ) ),                                                            // What: Delete Item Function. Why: A removed pool row and a discarded in-progress item both drop out of the pool. How: This filters the matching entry out entirely.
		renIteFun : ( tarIdeStr, newNamStr ) => setPooIteArr( ( preIteArr ) => preIteArr.map( ( iteCurObj ) => iteCurObj.id === tarIdeStr ? { ...iteCurObj, name : newNamStr } : iteCurObj ) ),   // What: Rename Item Function. Why: useIteDraFun's commit and the new item's name input blur call this exactly like the real store action. How: This overwrites just the name field on the matching entry.
		setWeiFun : ( tarIdeStr, weiValNum ) => setPooIteArr( ( preIteArr ) => preIteArr.map( ( iteCurObj ) => iteCurObj.id === tarIdeStr ? { ...iteCurObj, weight : weiValNum } : iteCurObj ) ), // What: Set Weight Function. Why: useIteDraFun's commit sends a changed weight through this exactly like the real store action. How: This overwrites just the weight field on the matching entry.
		updIteFun : ( tarIdeStr, patIteObj ) => setPooIteArr( ( preIteArr ) => preIteArr.map( ( iteCurObj ) => iteCurObj.id === tarIdeStr ? { ...iteCurObj, ...patIteObj } : iteCurObj ) ),       // What: Update Item Function. Why: useIteDraFun's commit and the new item's editor call this exactly like the real store action to apply a field patch. How: This merges patIteObj into whichever pooIteArr entry matches tarIdeStr.

		togVacFun : ( tarIdeStr ) => setPooIteArr( ( preIteArr ) => preIteArr.map( ( iteCurObj ) => iteCurObj.id === tarIdeStr ? { // What: Toggle Vacation Function. Why: useIteDraFun's commit sends a changed Active state through this exactly like the real store action. How: This flips just the vacation field on the matching entry.


			...iteCurObj, // What: Current Item Spread. Why: Every other field stays as it was. How: This copies iteCurObj.

			vacation : !iteCurObj.vacation // What: Vacation. Why: This is the flag being toggled. How: This inverts the item's current vacation value.


		} : iteCurObj ) ) // What: Unchanged Item Fallback. Why: Every other item keeps its own vacation flag. How: This returns iteCurObj unchanged.


	};


	const ediOpeObj = ediIteStr && !ediCloBoo ? pooIteArr.find( ( iteCurObj ) => iteCurObj.id === ediIteStr ) || null : null; // What: Editing Open Object. Why: Only an editor that's open, not one playing its closing animation, has a draft. How: This looks up the edited pool item while its editor is open and not closing, else null.

	const { cmtDraFun, draIteObj, patDraFun } = useIteDraFun( draActObj, ediOpeObj ); // What: Commit Draft Function. Why: An already-added pool item's editor edits its own local draft, committed into the pool only on Save, the same as every other item editor. How: This calls useIteDraFun with the open pool item and the pool's own actions, and keeps its commit. // What: Draft Item Object. Why: The editor's controls show the draft. How: This keeps the draft item. // What: Patch Draft Function. Why: Each control edits the draft. How: This keeps the hook's patcher.


	const draPicObj = { cadence : cadCurObj.cadence, mode : selModStr, threshold : PIC_NAM_OBJ.THR_VAL_NUM }; // What: Draft Picker Object. Why: EntEdiCom still expects a picker-shaped object to read mode/threshold/cadence off of, even though the real picker doesn't exist yet. How: This carries no id and no easeMin or easeMax, so the shared editor reads each item's own ease band.


	// #region scrAddFun

	/**
	 * scrAddFun = Scroll Add Function
	 *
	 * @summary
	 * Scrolls the shared main container just enough to bring the
	 * below-the-list editor slot fully into view, plus a small margin, once
	 * two animation frames have let the just-opened editor lay out. It does
	 * nothing when the slot already fits or either element is gone.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * scrAddFun() // => void
	 * ```
	 *
	*/

	const scrAddFun = () => { // What: Scroll Add Function. Why: Opening a new item or an added item's editor both show it in the slot below a possibly long pool. How: This waits two animation frames for layout to settle, then scrolls the container by however far the slot sits below its fold.


		requestAnimationFrame( () => requestAnimationFrame( () => { // What: Double Frame Wait Call. Why: The just-opened slot has to lay out before it can be measured. How: This waits two animation frames, then measures and scrolls.


			const addWraEle = addWraRef.current;                                                         // What: Add Wrap Element. Why: The scroll calculation needs the actual DOM node, not just the ref object. How: This reads addWraRef.current once and reuses it below.
			const scrConEle = addWraEle && addWraEle.closest( '[data-element-name-hook~="appConMai"]' ); // What: Scroll Container Element. Why: The shared scrollable container is what actually needs to move, not the slot itself. How: This walks up from addWraEle to the nearest main ancestor.


			if ( !addWraEle || !scrConEle ) return; // What: Missing Element Guard. Why: Either element may not exist yet if this fires after an unrelated unmount. How: This bails out of the scroll calculation entirely when either is missing.



			const oveBelNum = addWraEle.getBoundingClientRect().bottom - scrConEle.getBoundingClientRect().bottom + rhyPixFun( 'p07' ); // What: Overflow Below Number. Why: This is how far below the visible fold the slot actually sits, plus a small comfort margin. How: This subtracts the container's own bottom edge from the slot's own bottom edge. // Vertical Rhythm Base Plus 7 ~= 104.323px


			if ( oveBelNum > 0 ) scrConEle.scrollTo({ // What: Scroll Adjust Guard. Why: Only an actually-overflowing slot needs to be scrolled into view at all. How: This scrolls the container down by exactly the overflow amount.


				behavior : scrBehFun(),                    // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
				top      : scrConEle.scrollTop + oveBelNum // What: Top. Why: The page scrolls just enough to reveal the editor's bottom edge. How: This adds oveBelNum to the current scroll.


			});


		} ) );


	};

	// #endregion scrAddFun



	// #region addDraFun

	/**
	 * addDraFun = Add Draft Function
	 *
	 * @summary
	 * Opens a brand-new draft item in the create form's items step. It does
	 * nothing while another editor is open; otherwise it creates a draft with
	 * a fresh id and default values, applying any name and ease band a guided
	 * tour has staged, then scrolls the new slot into view.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * addDraFun() // => void
	 * ```
	 *
	*/

	const addDraFun = () => { // What: Add Draft Function. Why: Starting a brand-new draft item opens the same slot the edit flow uses, seeded with sensible defaults (including any staged tour prefill), then scrolls it into view. How: This bails out if another editor is already open, otherwise generates a fresh id, resolves the tour's own staged name/ease if one applies, then seeds and scrolls the new slot into view.


		if ( actNewStr || ediIteStr ) return; // What: One Editor Guard. Why: Only one item editor (new or existing) may be open at a time. How: This bails out if either a new draft or an existing edit is already in progress.



		setActCloStr( false ); // What: Stale Closing Clear Call. Why: A prior editor's own closing state must not carry over onto this fresh one. How: This clears any stale closing state left behind by whatever was open before.


		const newIdeStr = ranIdeFun( 'it_' ); // What: New Identifier String. Why: The new item needs a stable id from the moment it's added, and it keeps that id once the picker is created. How: This builds a short random suffix onto the 'it_' item prefix.



		// #region Draft Name Resolution

		const curBusObj = emlTouObj.get();                                                  // What: Current Bus Object. Why: The synchronous read described in the note below needs the bus's own live snapshot. How: This calls emlTouObj.get() directly. // What: Tour Prefill Read Note. Why: This reads the bus's synchronous getter instead of the React-state touBusObj, which may not yet have caught up with the bus within the same click. How: emlTouObj.get() returns the bus's current value at once, so a staged name and ease band reach the item this creates.
		const curTouBoo = Boolean( curBusObj.touPhaStr === 'tour' && curBusObj.itePreStr ); // What: Current Tour Boolean. Why: Only an actively-running tour that staged a specific item name should override the generated default below. How: This checks both the bus's own phase and its itePreStr field.

		let newNamStr; // What: New Name String. Why: The actual name to seed the draft with depends on which branch below resolves it. How: This is declared here and assigned in exactly one of the two branches that follow.


		if ( curTouBoo ) { // What: Tour Name Branch. Why: A tour stages a specific name for its own walkthrough item (see the picker tour's own run()), rather than falling back to a generic default. How: This takes the staged name directly off the bus.


			newNamStr = curBusObj.itePreStr; // What: Tour Name Assign. Why: This is the actual staged value described above. How: This reads curBusObj.itePreStr.


		}

		else { // What: Generated Name Branch. Why: Outside a tour, a fresh item needs a sensible, non-colliding default name. How: This starts from "New item" and appends an incrementing number until it no longer collides with an existing name.


			const basNamStr = 'New item'; // What: Base Name String. Why: This is the starting point every generated name is built from. How: This is reused below both as the bare default and as the prefix for a numbered variant.

			let dupCouNum = 1; // What: Duplicate Count Number. Why: The loop below needs a running counter to append once the bare name collides. How: This starts at 1 and increments each time the candidate name still collides.


			newNamStr = basNamStr; // What: Candidate Name Seed. Why: The loop below needs a starting candidate to test. How: This starts as the bare basNamStr before any numbering is applied.


			const lowNamSet = new Set( pooIteArr.map( ( iteCurObj ) => iteCurObj.name.toLowerCase() ) ); // What: Lowercase Name Set. Why: The collision check must be case-insensitive. How: This lowercases every existing draft item's own name into a Set for fast lookup.


			while ( lowNamSet.has( newNamStr.toLowerCase() ) ) { // What: Collision Loop. Why: The candidate name must keep incrementing until it's genuinely unique. How: This appends the next dupCouNum onto basNamStr each time the current candidate still collides.


				dupCouNum++;                                 // What: Duplicate Count Increment. Why: Each collision tries the next number. How: This adds 1 to dupCouNum.
				newNamStr = `${ basNamStr } ${ dupCouNum }`; // What: Numbered Name Assignment. Why: A numbered suffix makes the name unique. How: This appends dupCouNum to basNamStr.


			}


		}

		// #endregion Draft Name Resolution



		// #region Seed Item Build

		const fulChrBoo = Boolean( selModStr === 'ease-down' || ( curTouBoo && selModStr === 'ease-up' ) ); // What: Full Charge Boolean. Why: Ease Down items start fully charged (mirrors addPicFun's own iniValNum), otherwise the editor would show a spent item needing a Refill it never needed; the tour's own Ease Up item is also given a full charge (like the rest of the sample pool) so the later generation demo step has something eligible to pick, but this doesn't apply to Weighted/Dynamic/Random tour samples, since those modes have no eligibility gate at all (value there is a weight boost, not a charge), so forcing 100 would just unfairly skew the new item's odds against its siblings for no reason. How: This is true for Ease Down items, and for Ease Up items added during a tour.


		const easBanObj = curTouBoo && curBusObj.iteMinNum != null && curBusObj.iteMaxNum != null // What: Ease Band Object. Why: A tour can override the generic 7/14-day DEF_EAS_OBJ for its own added item (e.g. a monthly-cadence sample's own item shouldn't look like a daily one). How: This uses the bus's own staged easeMin/easeMax when a tour supplied both, otherwise DEF_EAS_OBJ.
			? { easeMax : curBusObj.iteMaxNum, easeMin : curBusObj.iteMinNum } // What: Tour Band Branch. Why: A tour can stage its own ease band for the added item. How: This uses the bus's iteMinNum/iteMaxNum.
			: PIC_NAM_OBJ.DEF_EAS_OBJ;                                         // What: Default Band Branch. Why: Every other add uses the generic defaults. How: This returns the pickers module's DEF_EAS_OBJ. // What: Default Band Note. Why: The raw numbers are easier to picture as days. How: This band works out to roughly a 7-day soonest and a 14-day latest.


		setPooIteArr( ( preIteArr ) => [ // What: Seed Item Call. Why: The freshly-opened editor needs a complete, sensible item already sitting in pooIteArr to edit. How: This appends the new item with every field resolved above.


			...preIteArr, // What: Previous Items Spread. Why: Every item already in the pool stays where it is. How: This spreads preIteArr ahead of the new item.

			{ // What: New Item Object. Why: The new item needs every field resolved above. How: This builds the item the editor opens on. // What: Type Assertion Note. Why: The new item lacks the fields only a saved item has. How: It's read as an item, since the store fills those in when the picker is created.


				id     : newIdeStr,                               // What: ID. Why: The pool item needs its own id. How: This uses newIdeStr.
				name   : newNamStr,                               // What: Name. Why: The item starts with its de-duplicated name. How: This uses newNamStr.
				value  : fulChrBoo ? PIC_NAM_OBJ.THR_VAL_NUM : 0, // What: Value. Why: An item that should start full begins at the threshold, otherwise at 0. How: This uses THR_VAL_NUM when fulChrBoo, otherwise 0.
				weight : 1,                                       // What: Weight. Why: Every item starts at the baseline weight. How: This is 1.

				...easBanObj // What: Ease Band Spread. Why: The item carries the tour's or the default drift band. How: This spreads in easeMin and easeMax.


			} as IteRcdTyp


		] );

		// #endregion Seed Item Build



		// #region Editor Open And Scroll

		setActNewStr( newIdeStr ); // What: Open Editor Call. Why: This is the actual state change that shows the new-item editor. How: This writes newIdeStr into actNewStr.

		scrAddFun(); // What: Scroll Into View Call. Why: The just-opened creation slot can be well out of view at the bottom of a long pool. How: This scrolls the slot into view through scrAddFun.

		// #endregion Editor Open And Scroll


	};

	// #endregion addDraFun


	// #region opeDraFun

	/**
	 * opeDraFun = Open Draft Function
	 *
	 * @summary
	 * Opens the editor for an item already added to the create form, which
	 * edits a draft copy of the item (see useIteDraFun), and scrolls the
	 * editor into view. It does nothing if the item is gone.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param tarIdeStr - Target Identifier String: The id of the draft item to
	 *                    edit.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * opeDraFun(tarIdeStr) // => void
	 * ```
	 *
	*/

	const opeDraFun = ( tarIdeStr : string ) => { // What: Open Draft Function. Why: Opening an already-committed draft item's editor must check the item still exists before showing it. How: This looks up the item, bails out if it's gone, opens its editor, then scrolls the editor into view.


		const fouIteObj = pooIteArr.find( ( iteCurObj ) => iteCurObj.id === tarIdeStr ); // What: Found Item Object. Why: The editor needs the real, current draft item record to open against. How: This looks up tarIdeStr in pooIteArr.


		if ( !fouIteObj ) return; // What: Missing Item Guard. Why: A stale id (already deleted) must not open an editor with nothing to show. How: This bails out before touching any state.



		setEdiIteStr( tarIdeStr ); // What: Open Editor Call. Why: This is the actual state change that shows the editor. How: This writes tarIdeStr into ediIteStr.

		scrAddFun(); // What: Scroll Into View Call. Why: The editor renders in the same below-the-list slot, which can be well out of view from wherever in a long pool the Edit button that opened it was. How: This scrolls the slot into view through scrAddFun.


	};

	// #endregion opeDraFun


	// #region opePenFun

	/**
	 * opePenFun = Open Pending Function
	 *
	 * @summary
	 * Opens the editor staDraFun staged in penEdiRef while another editor or
	 * the new-item form was closing, clearing the request first so it runs
	 * once. It does nothing when no editor is pending.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * opePenFun() // => void
	 * ```
	 *
	*/

	const opePenFun = () => { // What: Open Pending Function. Why: Both closing editor slots finish by opening whatever edit was requested meanwhile. How: This reads and clears penEdiRef, then opens that editor through opeDraFun.


		const tarIdeStr = penEdiRef.current; // What: Target Identifier String. Why: The pending editor request must be read before it's cleared. How: This copies penEdiRef.current.


		if ( !tarIdeStr ) return; // What: No Pending Guard. Why: Most closes have no editor waiting. How: This bails out when penEdiRef held nothing.



		penEdiRef.current = null; // What: Pending Clear. Why: The request is being handled now, so it must not run twice. How: This resets penEdiRef to null.

		opeDraFun( tarIdeStr ); // What: Open Draft Call. Why: The editor the user asked for opens once the previous one has closed. How: This calls opeDraFun with tarIdeStr.


	};

	// #endregion opePenFun



	// #region staDraFun

	/**
	 * staDraFun = Start Draft Function
	 *
	 * @summary
	 * Starts editing a create-form item from any state. When another item's
	 * editor or the new-item form is open, it closes that one first (dropping
	 * its unsaved draft) and stages tarIdeStr so the requested editor opens
	 * once the closing animation finishes; otherwise it opens the editor
	 * directly.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param tarIdeStr - Target Identifier String: The id of the draft item to
	 *                    edit.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * staDraFun(tarIdeStr) // => void
	 * ```
	 *
	*/

	const staDraFun = ( tarIdeStr : string ) => { // What: Start Draft Function. Why: Switching straight from one open editor to another (or from the new-item form) needs to close whatever's currently open first, dropping its unsaved draft, before this edit can actually open. How: This closes an existing editor or the new-item form, staging tarIdeStr to reopen once that closing animation finishes; otherwise it opens directly.


		if ( ediIteStr === tarIdeStr ) return; // What: Already Open Guard. Why: Re-clicking Edit on the exact same row that's already open should do nothing. How: This bails out when tarIdeStr matches the currently-open editor.



		if ( ediIteStr ) { // What: Other Editor Open Branch. Why: Another item's editor is already open and must be closed, dropping its unsaved draft, before this one can open. How: This stages tarIdeStr and starts that editor's own closing animation.


			penEdiRef.current = tarIdeStr; // What: Stage Reopen Call. Why: The requested edit must still open once the current one finishes closing. How: This stores tarIdeStr for the closing editor's own onAnimationEnd handler to pick up.

			setEdiCloBoo( true ); // What: Start Closing Call. Why: This is what actually plays the current editor's own out-animation. How: This flips ediCloBoo.



			return; // What: Early Return. Why: The requested edit must wait for the closing animation, not open immediately. How: This exits staDraFun without calling opeDraFun yet.


		}



		if ( actNewStr ) { // What: New Draft Open Branch. Why: A brand-new item's own form is in progress and must be closed (without saving) instead of silently no-oping. How: This stages tarIdeStr and starts the new-item form's own closing animation.


			penEdiRef.current = tarIdeStr; // What: Stage Reopen Call. Why: The requested edit must still open once the new-item form finishes closing. How: This stores tarIdeStr for the new-item wrap's own onAnimationEnd handler to pick up.

			setActCloStr( 'cancel' ); // What: Cancel New Call. Why: Switching away from an in-progress new item discards it rather than silently saving it. How: This starts the new-item wrap's own closing animation in its 'cancel' shape.



			return; // What: Early Return. Why: The requested edit must wait for the closing animation, not open immediately. How: This exits staDraFun without calling opeDraFun yet.


		}



		opeDraFun( tarIdeStr ); // What: Direct Open Call. Why: Neither another editor nor the new-item form was in the way, so the requested edit can open immediately. How: This calls opeDraFun with the same tarIdeStr.


	};

	// #endregion staDraFun

	// #endregion Draft Item Editing



	// #region Step Navigation And Submit

	React.useEffect( () => { // What: Reopen Tour Item Effect. Why: Back from a picker tour's own Step 12 (Create Picker) to Step 11 (Save this task item) needs that item's editor open again, since its own Save already committed it into pooIteArr (there's no separate "draft" vs "committed" state once saved, just actNewStr no longer pointing at it), so Step 11's own target has nothing left to click; there's no real DOM control left that would reverse this, which is why this needs a bus nonce at all. How: This reopens the SAME item, found by matching the tour's own itePreStr name (still sitting on the bus since nothing clears it until the whole tour closes), rather than creating a fresh one, preserving whatever the user actually edited in the earlier steps instead of resetting it.


		if ( !touBusObj.reoNonNum ) return; // What: No Bump Guard. Why: A fresh mount's own initial nonce value must not trigger a reopen. How: This bails out unless the nonce is genuinely truthy.



		const matIteObj = pooIteArr.find( ( iteCurObj ) => iteCurObj.name === touBusObj.itePreStr ); // What: Matched Item Object. Why: The exact item the tour walked the user through creating needs to be found again by name. How: This searches pooIteArr for an entry whose own name matches the bus's own staged itePreStr.


		if ( matIteObj ) { // What: Reopen Guard. Why: Only a genuinely-found match should be reopened. How: This clears any stale closing state and writes the matched item's own id into actNewStr.


			setActCloStr( false );        // What: Closing Clear Call. Why: The matched item's editor must not be mid-close. How: This resets actCloStr to false.
			setActNewStr( matIteObj.id ); // What: Active New Set Call. Why: The tour's prefilled item opens in the editor. How: This writes the matched item's id into actNewStr.


		}


		// eslint-disable-next-line react-hooks/exhaustive-deps -- What: Deliberate Dependency Omission. Why: The reopen must run only on a genuine nonce bump, so the values it reads fresh stay out of the array. How: This silences the react-hooks exhaustive-deps warning for the dependency array below.
	}, [ touBusObj.reoNonNum ] ); // What: Effect Dependency Array. Why: Only a genuine bump of this exact nonce should re-run this reopen. How: touBusObj.reoNonNum is the sole trigger; pooIteArr/touBusObj.itePreStr are read fresh from the closure each time it fires.


	// #region bacSteFun

	/**
	 * bacSteFun = Back Step Function
	 *
	 * @summary
	 * Returns the create form from its items step to its details step. It
	 * discards any in-progress item first, so + Add Item still works
	 * afterward.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * bacSteFun() // => void
	 * ```
	 *
	*/

	const bacSteFun = () => { // What: Back Step Function. Why: Returning to Step 1 must not leave Step 2 stuck with a stale actNewStr (which would make + Add Item a no-op), so any in-progress item is discarded first. How: This removes the in-progress item, clears the closing flag, and steps back.


		if ( actNewStr ) { // What: Discard In-Progress Guard. Why: An unsaved in-progress item must not linger once the user navigates away from it. How: This removes it from pooIteArr and clears actNewStr, only if one was actually open.


			draActObj.delIteFun( actNewStr ); // What: Remove Draft Call. Why: The unfinished new item is discarded. How: This removes actNewStr from the draft pool.
			setActNewStr( null );             // What: Active New Clear Call. Why: No new item is being added anymore. How: This resets actNewStr to null.


		}



		setActCloStr( false ); // What: Closing Reset Call. Why: A stale closing flag must not carry over into Step 1. How: This resets actCloStr to false.

		setForSteNum( 1 ); // What: Step Back Call. Why: This is the actual navigation back to Step 1. How: This writes 1 into forSteNum.


	};

	// #endregion bacSteFun



	// #region subForFun

	/**
	 * subForFun = Submit Form Function
	 *
	 * @summary
	 * Creates or saves the picker. It builds the shared payload from both
	 * steps, attaches the chosen or newly named conditional (or detaches one
	 * when editing), adds the ease summary fields on create only, then calls
	 * onSavEdiFun in edit mode or onCrePicFun otherwise.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * subForFun() // => void
	 * ```
	 *
	*/

	const subForFun = () => { // What: Submit Form Function. Why: This is the actual create/save commit, gated on both steps' own readiness and a resolved name collision. How: This builds the shared payload shape, attaches a conditional (or detaches one, on edit), attaches the legacy ease summary fields (create only), then routes to onSavEdiFun or onCrePicFun.


		if ( !detReaBoo || ( !isaEdiBoo && !enoIteBoo ) ) return; // What: Not Ready Guard. Why: Neither flow can submit until Step 1's own fields are complete, and creating additionally needs at least 2 real items. How: This bails out unless both conditions hold for the active flow.



		if ( conAttBoo && conSelStr === 'new' && conColBoo ) return; // What: Name Collision Guard. Why: A colliding new-conditional name must surface its own error instead of silently submitting. How: This bails out of the submit while conColBoo holds, leaving conErrStr visible on the name field.



		const payForObj : PicForTyp = { // What: Payload Form Object. Why: Both onCrePicFun and onSavEdiFun expect this exact shared shape. How: This gathers every Step 1 field that both flows always send, typed as the picker form payload so the optional fields attached below are allowed.


			avoidDuplicates : avoDupBoo,                     // What: Avoid Duplicates. Why: The picker saves the duplicates toggle. How: This passes avoDupBoo.
			daysOfWeek      : runDowArr,                     // What: Days Of Week. Why: The picker saves its chosen run days. How: This passes runDowArr.
			group           : effGroStr,                     // What: Group. Why: The picker saves its chosen or newly-typed group. How: This passes effGroStr.
			includeInDaily  : incDaiBoo,                     // What: Include In Daily. Why: The store adds or removes the picker from the daily generator. How: This passes incDaiBoo.
			mode            : selModStr,                     // What: Mode. Why: The picker saves its chosen mode. How: This passes selModStr.
			name            : capStrFun( newNamStr.trim() ), // What: Name. Why: The picker saves a tidied, capitalized name. How: This trims newNamStr and capitalizes it.
			skipHolidays    : skiHolBoo,                     // What: Skip Holidays. Why: The picker saves the holiday toggle. How: This passes skiHolBoo.

			...cadCurObj // What: Cadence Spread. Why: Every cadence field the control produced is saved alongside. How: This spreads in cadCurObj.


		};


		if ( !isaEdiBoo ) payForObj.items = pooIteArr; // What: Items Attach Guard. Why: Only a fresh create actually needs to send a full items array; an edit's own items are managed elsewhere. How: This attaches pooIteArr to payForObj only while isaEdiBoo is false.



		if ( conAttBoo && conSelStr === 'new' ) { // What: Conditional Attach Note. Why: Create-new names are unique by validation above, so no silent reuse happens here; edit explicitly clears the field (conditionalId: null) when turned off, since unlike a fresh create, this can also DETACH one the picker already had, so there's no bare "just omit the field" default to fall back on. How: This chain's three branches attach a fresh inline conditional, attach an existing one, or detach on edit.


			payForObj.newConditional = { // What: New Conditional Attach. Why: A freshly-created inline conditional needs its own draft shape sent through, under its own tidied name. How: This spreads conDraObj and overwrites its name with conTidStr (or a bare fallback).


				...conDraObj, // What: Conditional Draft Spread. Why: The new conditional keeps every field the inline editor set. How: This copies conDraObj.

				name : conTidStr || 'Conditional' // What: Name. Why: The saved conditional needs a tidy name, even if the field was left blank. How: This uses conTidStr, falling back to 'Conditional'.


			};


		}

		else if ( conAttBoo && conSelStr ) { // What: Existing Conditional Branch. Why: Attaching an existing conditional only needs its id. How: This sets conditionalId to conSelStr.


			payForObj.conditionalId = conSelStr; // What: Existing Conditional Attach. Why: Reusing an existing conditional only needs its own id sent through. How: This writes conSelStr directly onto payForObj.conditionalId.


		}

		else if ( isaEdiBoo ) { // What: Detach On Edit Branch. Why: Turning the attach toggle off while editing must clear the old attachment. How: This sets conditionalId to null.


			payForObj.conditionalId = null; // What: Conditional Detach. Why: Turning the toggle off while editing must actively clear whatever conditional was previously attached, not just omit the field. How: This writes an explicit null onto payForObj.conditionalId.


		}



		if ( isaEasBoo && !isaEdiBoo ) { // What: Legacy Ease Summary Guard. Why: Items carry their own ease bands, and the picker-level easeMin/easeMax is only a legacy summary that addPicFun still accepts. How: This is skipped for edit, which leaves the picker's existing summary fields alone.


			payForObj.easeMin = Math.min( ...pooIteArr.map( ( iteCurObj ) => iteCurObj.easeMin ?? PIC_NAM_OBJ.DEF_EAS_OBJ.easeMin ) ); // What: Legacy Ease Minimum Attach. Why: A summary value is still expected on the created payload. How: This takes the smallest easeMin across every committed item.

			payForObj.easeMax = Math.max( ...pooIteArr.map( ( iteCurObj ) => iteCurObj.easeMax ?? PIC_NAM_OBJ.DEF_EAS_OBJ.easeMax ) ); // What: Legacy Ease Maximum Attach. Why: A summary value is still expected on the created payload. How: This takes the largest easeMax across every committed item.


		}



		if ( isaEdiBoo ) onSavEdiFun!( payForObj ); // What: Edit Route Branch. Why: An in-progress edit of an existing picker must reach the save flow. How: This calls onSavEdiFun with payForObj. // What: Non-Null Note. Why: The Pickers view opens the form in edit mode and always passes onSavEdiFun with it. How: The ! tells TypeScript the callback is set here.

		else onCrePicFun!( payForObj ); // What: Create Route Branch. Why: A brand-new picker must reach the create flow instead. How: This calls onCrePicFun with payForObj. // What: Non-Null Note. Why: The Pickers tab opens the form for a create and always passes onCrePicFun with it. How: The ! tells TypeScript the callback is set here.


	};

	// #endregion subForFun

	// #endregion Step Navigation And Submit



	return (


		<div
			ref={ forWraRef }

			className={ cssModObj.picForDiv }
		>{ /* What: Picker Form Div Element. Why: This is PicForCom's own root, holding the header, the step indicator (create only), and whichever step's own content is active. How: This wraps every piece of the create/edit form. */ }


			<header className={ cssModObj.forHeaHed }>{ /* What: Form Header Header Element. Why: The kicker and heading read as one title block. How: This wraps those two pieces. */ }


				<div>{ /* What: Header Text Div Element. Why: The form's kicker and title belong together. How: This wraps the two lines below. */ }


					<div className={ cssModObj.forKicDiv }>{ isaEdiBoo ? 'Editing' : 'New picker' }</div>{ /* What: Form Kicker Div Element. Why: A small eyebrow label orients the reader before the heading below. How: This renders "Editing" or "New picker" depending on isaEdiBoo. */ }

					<h2 className={ cssModObj.forTitHea }>{ isaEdiBoo ? ( newNamStr.trim() || 'Editing picker' ) : 'Create a picker' }</h2>{ /* What: Form Title Heading Element. Why: This form's own main heading should reflect whatever the user has typed so far while editing. How: This shows the live-typed name (or a fallback) while editing, otherwise a fixed create-mode heading. */ }


				</div>


			</header>


			{ !isaEdiBoo && ( // What: Step Indicator Check. Why: Only the create flow ever has a second step to indicate. How: This renders the whole step indicator only while isaEdiBoo is false. // What: Edit Steps Design Note. Why: Edit reuses only the Details step, since this picker's items already exist and are edited via the Data tab or PicVieCom's own live pool instead. How: There's no Items step to switch to here, so the step indicator below is skipped entirely while isaEdiBoo is true.


				<div className={ cssModObj.steBarDiv }>{ /* What: Step Bar Div Element. Why: Details and Items need a shared two-step indicator row. How: This wraps both step buttons and the connecting line between them. */ }


					<button
						className={ cssModObj.detSteBut }

						data-element-name-hook='detSteBut'
						data-step-current-active={ forSteNum === 1 || undefined } // What: Step Current Active Attribute. Why: The step being filled in reads as current. How: This sets the presence-only attribute while forSteNum is 1.
						data-step-done-active={ forSteNum !== 1 || undefined } // What: Step Done Active Attribute. Why: Once past Details, its step reads as finished. How: This sets the presence-only attribute while forSteNum isn't 1.

						type='button'

						onClick={ () => setForSteNum( 1 ) }
					>{ /* What: Details Step Button Element. Why: The user needs a way to jump back to Step 1 at any time. How: This marks itself current while forSteNum is 1, otherwise done, through its data-step-*-active attributes, and always allows navigating back. Its data-element-name-hook is read by the tours. */ }


						<span className={ cssModObj.steNumSpa }>{ /* What: Step Number Span Element. Why: A completed step shows a checkmark instead of its own number. How: This renders a check icon once forSteNum has advanced past 1, otherwise the literal "1". */ }


							{ forSteNum > 1 ? ( // What: Step Done Check. Why: A completed Details step shows a checkmark in place of its number. How: This renders the check icon once forSteNum is past 1.


								<IcoSvgCom
									icoNamStr='cheEle'
									sizSteStr='m01' // Vertical Rhythm Base Minus 1 = 11px
								/> // What: Icon SVG Component. Why: The finished step needs a recognizable checkmark. How: This renders the 'cheEle' icon at a fixed size.


							) : ( // What: Step Number Branch. Why: An unfinished step shows its own number. How: This renders the else branch while forSteNum is 1.


								'1' // What: Step Number Literal. Why: This is the Details step's own position. How: This renders the literal text "1".


							) }


						</span>

						<span className={ cssModObj.steLabSpa }>Details</span>{ /* What: Step Label Span Element. Why: The step needs a readable name alongside its number. How: This renders the fixed literal text. */ }


					</button>

					<span className={ cssModObj.steLinSpa } />{ /* What: Step Line Span Element. Why: The two step buttons need a visible connecting line between them. How: This is a purely decorative element, styled entirely via CSS. */ }

					<button
						className={ cssModObj.iteSteBut }

						data-step-current-active={ forSteNum === 2 || undefined } // What: Step Current Active Attribute. Why: The step being filled in reads as current. How: This sets the presence-only attribute while forSteNum is 2.

						disabled={ !detReaBoo }
						type='button'

						onClick={ () => detReaBoo && setForSteNum( 2 ) } // What: On Click Handler. Why: The button is disabled until Step 1 is complete, but a click must still not advance early. How: This advances to Step 2 only while detReaBoo is true.
					>{ /* What: Items Step Button Element. Why: The user needs a way to jump to Step 2 once it's actually reachable. How: This stays disabled until detReaBoo is true, and marks itself current through data-step-current-active while forSteNum is 2. */ }


						<span className={ cssModObj.steNumSpa }>2</span>{ /* What: Step Number Span Element. Why: The step needs its own visible number. How: This renders the literal "2". */ }

						<span className={ cssModObj.steLabSpa }>Items</span>{ /* What: Step Label Span Element. Why: The step needs a readable name alongside its number. How: This renders the fixed literal text. */ }


					</button>


				</div>


			) }



			{ forSteNum === 1 ? ( // What: Step One Check. Why: Exactly one step's own content shows at a time. How: This renders the Details step below while forSteNum is 1, otherwise the Items step further down.


				<div
					key='np-step1'

					className={ cssModObj.steFadDiv }
				>{ /* What: Step Fade Div Element. Why: Switching steps should play a fade transition, and React needs a stable key to treat each step as a distinct mounted instance. How: This wraps the whole Details step's own fields and footer. */ }


					<p className={ cssModObj.steHinPar }>{ /* What: Step Hint Paragraph Element. Why: A first-time user needs a plain-language orientation before the fields below. How: This shows a slightly different phrasing for edit versus create. */ }


						{ isaEdiBoo // What: Edit Mode Check. Why: Editing and creating need different intro text. How: This picks one of the two paragraphs below based on isaEdiBoo.


							? <React.Fragment>Pickers are the heart of the Ease My Life app. They are small machines that chooses one item for you from a list, e.g. a chore to do, a meal to make, a way to wind down. Adjust its name, group, how it should pick and when it should run below.</React.Fragment> // What: Editing Intro Fragment. Why: An existing picker's own intro reads slightly differently since it's being adjusted rather than created for the first time. How: This renders while isaEdiBoo is true.

							: <React.Fragment>Pickers are the heart of the Ease My Life app. They are small machines that chooses one item for you from a list, e.g. a chore to do, a meal to make, a way to wind down. Give it a name, attach a group, choose how it should pick and when it should run. You&rsquo;ll fill its list of items in the next step.</React.Fragment> // What: Create Intro Fragment. Why: A brand-new picker's own intro needs to set up the next Items step too. How: This renders while isaEdiBoo is false.


						}


					</p>



					<div
						className={ cssModObj.picFieDiv }

						data-element-name-hook='picFieDiv'
					>{ /* What: Picker Fields Div Element. Why: Every Details field (Name, Group, Picker type, conditional attach, daily schedule) belongs in one shared column. How: This wraps the Name, Group, Picker type, Conditional, and Daily field blocks below. Its data-element-name-hook is read by the tours. */ }


						<div
							className={ cssModObj.forFieDiv }

							data-element-name-hook='forFieDiv'
						>{ /* What: Form Field Div Element. Why: The label, its help text, and the input itself form one field unit. How: This wraps those three pieces. Its data-element-name-hook is read by the tours and help mode. */ }


							<label
								className={ cssModObj.forLabLab }

								htmlFor='picNamInp'
							>Name</label>{ /* What: Form Label Label Element. Why: The input below needs an associated, readable label. How: This is linked to the input via the shared 'picNamInp' id. */ }

							<p className={ cssModObj.forHelPar }>What you&rsquo;ll see on the picker bar above and on your todo list cards. Short and plain works best, e.g. &ldquo;Daily Chore&rdquo;, &ldquo;Dinner&rdquo;, &ldquo;Coffee Creamer&rdquo;.</p>{ /* What: Form Help Paragraph Element. Why: A first-time user needs guidance on what makes a good picker name. How: This renders a fixed explanatory sentence with a couple of worked examples. */ }

							<input
								ref={ namInpRef }

								id='picNamInp'

								className={ cssModObj.forTexInp }

								autoComplete='off'
								maxLength={ 40 }
								placeholder='e.g. Daily Chore'
								type='text'
								value={ newNamStr }

								onChange={ ( chaEveObj ) => setNewNamStr( chaEveObj.target.value ) }
							/>{ /* What: Form Text Input Element. Why: This is the actual live-typed name field. How: This writes into newNamStr on every change. */ }


						</div>


						<div
							className={ cssModObj.forFieDiv }

							data-element-name-hook='forFieDiv'
						>{ /* What: Form Field Div Element. Why: The label, help text, group chips, and the inline new-group input form one field unit. How: This wraps those pieces. Its data-element-name-hook is read by the tours and help mode. */ }


							<span className={ cssModObj.forLabSpa }>Group</span>{ /* What: Form Label Span Element. Why: The controls below need a readable label. How: This renders the literal word "Group". */ }

							<p className={ cssModObj.forHelPar }>Pickers are clustered into groups on your todo list, like &ldquo;Chores&rdquo; or &ldquo;Food&rdquo;, so that related picks sit together. You may choose an existing group or create a new one.</p>{ /* What: Form Help Paragraph Element. Why: A first-time user needs to understand what a group actually does before choosing one. How: This renders a fixed explanatory sentence. */ }

							<div
								className={ cssModObj.forGroDiv }

								data-element-name-hook='forGroDiv'
							>{ /* What: Form Groups Div Element. Why: Every existing group chip plus the "New Group" chip sit in one row, wrapping onto two lines at about 545px wide and below for the fixture's groups. How: This maps exiGroArr to one chip each, then appends the fixed "New Group" chip. Its data-element-name-hook is read by help mode and the test suites. */ }


								{ exiGroArr.map( ( curGroStr ) => ( // What: Group Chip List Render. Why: Every existing group needs its own selectable chip. How: This maps exiGroArr to one button per curGroStr.


									<button
										key={ curGroStr }

										className={ cssModObj.groChiBut }

										data-chip-select-active={ ( !addGroBoo && selGroStr === curGroStr ) || undefined } // What: Chip Select Active Attribute. Why: The picker's group should stand out. How: This sets the presence-only attribute while this chip's group is chosen and the new-group field is closed.

										type='button'

										onClick={ () => { // What: On Click Handler. Why: Tapping an existing group selects it. How: This closes the new-group sub-form and selects this chip's group.


											setAddGroBoo( false );     // What: Add Group Close Call. Why: Picking an existing group closes the new-group sub-form. How: This resets addGroBoo to false.
											setSelGroStr( curGroStr ); // What: Group Select Call. Why: This chip's group becomes the picker's group. How: This writes curGroStr into selGroStr.


										} }
									>{ /* What: Group Chip Button Element. Why: Tapping an existing group chip should select it and close the new-group sub-form. How: This clears addGroBoo and writes curGroStr into selGroStr. */ }


										{ curGroStr }{ /* What: Chip Name Expression. Why: Every group chip needs its own visible label. How: This renders curGroStr. */ }


									</button>


								)) }

								<button
									className={` ${ cssModObj.groChiBut }   ${ cssModObj.groChiButNew } `}

									data-chip-select-active={ addGroBoo || undefined } // What: Chip Select Active Attribute. Why: While the new-group field is open, its chip reads as chosen. How: This sets the presence-only attribute while addGroBoo is true.

									type='button'

									onClick={ () => setAddGroBoo( true ) }
								>{ /* What: Group Chip Button New Element. Why: The user needs an explicit way to open the inline new-group sub-form. How: This flips addGroBoo true. */ }


									<IcoSvgCom
										icoNamStr='pluEle'
										sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
									/>{ /* What: Icon SVG Component. Why: The button needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } New Group


								</button>


							</div>



							<ColDisCom open={ addGroBoo }>{ /* What: Collapse Disclosure Component. Why: The new-group input only needs to exist while addGroBoo is actually on. How: This animates the input open/closed around that boolean. */ }


								<input
									className={` ${ cssModObj.forTexInp }   ${ cssModObj.forTexInpShort } `}

									autoComplete='off'
									autoFocus
									maxLength={ 30 }
									placeholder='Name the new group'
									type='text'
									value={ newGroStr }

									aria-label='New group name'

									onChange={ ( chaEveObj ) => setNewGroStr( chaEveObj.target.value ) }
								/>{ /* What: Form Text Input Short Element. Why: A brand-new group needs its own typed name. How: This is a controlled text input writing into newGroStr on every change. */ }


							</ColDisCom>


						</div>


						<fieldset
							className={ cssModObj.forFieFie }

							data-element-name-hook='forFieFie'
						>{ /* What: Form Field Fieldset Element. Why: The picker-type radio group needs its own labelled fieldset. How: This wraps the legend, help text, and the radio list below. Its data-element-name-hook is read by the tours and help mode. */ }


							<legend className={ cssModObj.forLabLeg }>Picker type</legend>{ /* What: Form Label Legend Element. Why: A fieldset needs its own accessible legend. How: This renders the literal text "Picker type". */ }

							<p className={ cssModObj.forHelPar }>This is the ruleset that the picker follows each time it runs. &ldquo;Truly Random&rdquo; is the simplest where every item has an equal chance. The others nudge the odds in different ways. Not sure? We recommend the Dynamic Weighted type but you can change a picker&rsquo;s type at any time.</p>{ /* What: Form Help Paragraph Element. Why: A first-time user needs to understand what a "mode" even means before picking one. How: This renders a fixed explanatory sentence with a recommendation. */ }

							<div
								className={ cssModObj.modRadDiv }

								data-element-name-hook='modRadDiv'
							>{ /* What: Mode Radio Div Element. Why: Every mode in SED_NAM_OBJ.MOD_DEF_OBJ needs its own selectable radio row. How: This maps Object.entries(SED_NAM_OBJ.MOD_DEF_OBJ) to one label per entry. Its data-element-name-hook is read by help mode. */ }


								{ Object.entries( SED_NAM_OBJ.MOD_DEF_OBJ ).map( ( [ modKeyStr, modInfObj ] ) => ( // What: Mode Option List Render. Why: The picker's own mode choice must be built from the shared SED_NAM_OBJ.MOD_DEF_OBJ table, not hardcoded. How: This maps each [key, info] pair to one radio label.


									<label
										key={ modKeyStr }

										className={ cssModObj.modOptLab }

										data-element-name-hook='modOptLab'
										data-mode-option-key={ modKeyStr }
										data-option-select-active={ selModStr === modKeyStr || undefined } // What: Option Select Active Attribute. Why: The picker's mode should stand out. How: This sets the presence-only attribute while this option is the chosen mode.
									>{ /* What: Mode Option Label Element. Why: The radio input and its own name/hint text must all be one clickable label. How: This wraps the radio input and its description block. Its data-element-name-hook is read by the tours and the test suites. */ }


										<input
											className={ cssModObj.modOptInp }

											name='forModRad'

											checked={ selModStr === modKeyStr }
											type='radio'

											onChange={ () => setSelModStr( modKeyStr as ModNamTyp ) } // What: On Change Handler. Why: Choosing a mode radio selects that mode. How: This sets selModStr to modKeyStr. // What: Type Assertion Note. Why: Object.entries types its keys as plain strings. How: modKeyStr is read as a mode name, since it comes from the mode table's own keys.
										/>{ /* What: Mode Option Input Element. Why: This is the actual selectable control. How: This is checked when selModStr matches modKeyStr, and selects it on change. */ }

										<div>{ /* What: Mode Text Div Element. Why: The mode's own name and hint text need to sit beside the radio input. How: This wraps modNamDiv and modHinDiv. */ }


											<div className={ cssModObj.modNamDiv }>{ modInfObj.labStr }</div>{ /* What: Mode Name Div Element. Why: The mode needs its own readable name. How: This renders modInfObj.labStr. */ }

											{ Array.isArray( modInfObj.hinArr ) // What: Hint Content Check. Why: A mode's own hint can be one paragraph or several. How: This maps every paragraph when hint is an array, otherwise renders the single hint.


												? modInfObj.hinArr.map( ( parTexStr, parIndNum ) => ( // What: Multi-Paragraph Hint Render. Why: Some modes explain themselves across more than one short paragraph. How: This maps modInfObj.hinArr to one div per entry when it's an array.


													<div
														key={ parIndNum }

														className={ cssModObj.modHinDiv }
													>{ parTexStr }</div> // What: Mode Hint Div Element. Why: Each paragraph renders as its own hint line. How: This renders parTexStr, keyed by its index.


												) )

												: <div className={ cssModObj.modHinDiv }>{ modInfObj.hinArr }</div> // What: Mode Hint Div Element. Why: A mode with a string hint needs one short hint line. How: This renders modInfObj.hinArr directly when it's a plain string.


											}


										</div>


									</label>


								)) }


							</div>


						</fieldset>



						<div
							className={` ${ cssModObj.forFieDiv }   ${ cssModObj.forFieDivConditional } `}

							data-element-name-hook='forFieDiv'
						>{ /* What: Form Field Div Conditional Element. Why: The attach-a-conditional toggle and its own collapsible content form one field unit. How: This wraps conTogDiv and the ColDisCom below it. Its data-element-name-hook is read by the tours and help mode. */ }


							<div
								className={ cssModObj.conTogDiv }

								data-element-name-hook='conTogDiv'
							>{ /* What: Conditional Toggle Div Element. Why: The label/help text block and the switch control sit side by side. How: This wraps togTexDiv and the switch button. Its data-element-name-hook is read by help mode. */ }


								<div className={ cssModObj.togTexDiv }>{ /* What: Toggle Text Div Element. Why: The label and its two help paragraphs read as one block. How: This wraps those three pieces. */ }


									<span className={ cssModObj.forLabSpa }>Attach a conditional</span>{ /* What: Form Label Span Element. Why: The toggle below needs a readable label. How: This renders the literal text. */ }

									<p className={ cssModObj.forHelPar }>Conditionals can be attached to a picker that will determine whether a picker should be run on any given day during the auto generator phase for the Today page. Run eligibility can be determined using the same rules that the pickers use, e.g. Truly Random, Weighted, Dynamic Weighted, Ease Up and Ease Down.</p>{ /* What: Form Help Paragraph Element. Why: A first-time user needs to understand what a conditional even does. How: This renders a fixed explanatory sentence. */ }

									<p className={ cssModObj.forHelPar }>Example: You have a Daily Chore picker that you attach a Weighted conditional to in order to determine whether a Day Off should should be triggered and therefore no chores should be chosen for that day.</p>{ /* What: Form Help Paragraph Element. Why: A concrete example lands faster than the abstract explanation above alone. How: This renders a fixed worked example sentence. */ }


								</div>

								<button
									className={ cssModObj.togSwiBut }

									data-element-name-hook='togSwiBut'

									type='button'

									aria-checked={ conAttBoo }
									aria-label='Attach a conditional'
									role='switch'

									onClick={ () => setConAttBoo( ( preValBoo ) => !preValBoo ) }
								>{ /* What: Conditional Switch Button Element. Why: This is the actual on/off control for the conditional attachment. How: This flips conAttBoo on click. Its data-element-name-hook is read by help mode and the test suites. */ }


									<i className={ cssModObj.swiKnoIta } />{ /* What: Switch Knob Italic Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off its parent button's own aria-checked. */ }


								</button>


							</div>



							<ColDisCom open={ conAttBoo }>{ /* What: Collapse Disclosure Component. Why: The whole conditional-attach block only needs to exist while conAttBoo is actually on. How: This animates conAttDiv open/closed around that boolean. */ }


								<div className={ cssModObj.conAttDiv }>{ /* What: Conditional Attach Div Element. Why: The pill rail and the inline new-conditional editor form one block. How: This wraps conRaiDiv and the ColDisCom around CodConCom. */ }


									<div
										ref={ raiCalFun }

										className={ cssModObj.conRaiDiv }

										data-element-name-hook='conRaiDiv'
										data-rail-wheel-scroll // What: Rail Wheel Scroll Attribute. Why: A rail that scrolls sideways needs the shared wheel and focus scrolling to reach it. How: This presence-only attribute marks the scroller for the handlers that find it by the attribute.
										data-scroll-end-active // What: Scroll End Active Attribute. Why: The rail starts with no edge fades until edge-fade.ts first measures it. How: This sets the presence-only attribute that togFadFun later toggles.
										data-scroll-start-active // What: Scroll Start Active Attribute. Why: The rail starts with no edge fades until edge-fade.ts first measures it. How: This sets the presence-only attribute that togFadFun later toggles.
									>{ /* What: Conditional Rail Div Element. Why: Every existing conditional plus the "Add New" pill need a horizontally-scrolling rail. How: This wraps one pill per sorted entry in conObjArr, then the fixed "Add New Conditional" pill. Its data-element-name-hook is read by help mode. */ }


										{ [ ...conObjArr ].sort( ( conOneObj, conTwoObj ) => { // What: Sorted Conditional List Render. Why: The rail needs a stable order with the active selection pinned to the front. How: This sorts alphabetically, except the conditional matching conSelStr is forced to the very front. // What: Conditional Sort Design Note. Why: The rail reads alphabetically, except the currently-selected conditional (once the user has picked one) pins to the front. How: This is the same "selected stays first" convention as the Data tab's own rail.


											if ( conOneObj.id === conSelStr ) return -1; // What: First Pinned Guard. Why: The currently-selected conditional must sort before everything else. How: This returns -1 whenever conOneObj is the selection.



											if ( conTwoObj.id === conSelStr ) return 1; // What: Second Pinned Guard. Why: Same reasoning as above, for the other comparison side. How: This returns 1 whenever conTwoObj is the selection.



											return conOneObj.name.localeCompare( conTwoObj.name ); // What: Alphabetical Fallback Return. Why: Every other pair sorts by plain alphabetical name. How: This delegates to String.localeCompare.


										} ).map( ( curConObj ) => ( // What: Conditional Pill Map. Why: Every sorted conditional renders as one pill. How: This maps the sorted list to one pill per conditional.


											<button
												key={ curConObj.id }

												className={ cssModObj.conPilBut }

												data-flip-item-key={ curConObj.id } // What: Flip Item Key Attribute. Why: The shared reorder animation slides each pill from its old spot to its new one. How: This gives useFliRaiFun the pill's own conditional id to track it by.
												data-pill-select-active={ conSelStr === curConObj.id || undefined } // What: Pill Select Active Attribute. Why: The conditional to attach should stand out. How: This sets the presence-only attribute while this pill is chosen.

												type='button'

												onClick={ () => setConSelStr( curConObj.id ) }
											>{ /* What: Conditional Pill Button Element. Why: Every existing conditional needs its own selectable pill showing its name and mode. How: This selects curConObj.id on click. */ }


												<span className={ cssModObj.conNamSpa }>{ curConObj.name }</span>{ /* What: Conditional Name Span Element. Why: The pill needs its own readable name. How: This renders curConObj.name. */ }

												<span className={ cssModObj.conModSpa }>{ ( SED_NAM_OBJ.MOD_DEF_OBJ[ curConObj.mode ] || {} ).labStr || curConObj.mode }</span>{ /* What: Conditional Mode Span Element. Why: The pill also needs to show which mode the conditional itself runs under. How: This looks up the mode's own label in SED_NAM_OBJ.MOD_DEF_OBJ, falling back to the raw mode string. */ }


											</button>


										)) }

										<button
											className={` ${ cssModObj.conPilBut }   ${ cssModObj.conPilButNew } `}

											data-pill-select-active={ conSelStr === 'new' || undefined } // What: Pill Select Active Attribute. Why: While the new-conditional editor is open, its pill reads as chosen. How: This sets the presence-only attribute while conSelStr is 'new'.

											type='button'

											onClick={ () => { // What: On Click Handler. Why: Tapping New opens the inline conditional editor with a fresh draft. How: This selects 'new' and seeds conDraObj.


												setConSelStr( 'new' );                                                                           // What: New Conditional Select Call. Why: The new-conditional pill becomes the selected one. How: This writes 'new' into conSelStr.
												setConDraObj( conDraFun( newNamStr.trim(), conObjArr.map( ( conCurObj ) => conCurObj.name ) ) ); // What: Conditional Draft Seed Call. Why: The inline editor needs a sensible starting draft whose name won't collide. How: This builds one from the picker's name and every existing conditional name.


											} }
										>{ /* What: Conditional Pill Button New Element. Why: The user needs an explicit way to open the inline new-conditional editor. How: This selects the 'new' pill and seeds conDraObj from the shared default, pre-filled with this picker's own name. */ }


											<IcoSvgCom
												icoNamStr='pluEle'
												sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
											/>{ /* What: Icon SVG Component. Why: The new-conditional pill needs a recognizable "add" glyph. How: This renders the 'pluEle' icon at a fixed size. */ }

											<span className={ cssModObj.conNamSpa }>Add New Conditional</span>{ /* What: Conditional Name Span Element. Why: The new-conditional pill needs its own visible label. How: This renders the literal text "Add New Conditional". */ }


										</button>


									</div>



									<ColDisCom open={ conSelStr === 'new' }>{ /* What: Collapse Disclosure Component. Why: The inline new-conditional editor only needs to exist while conSelStr is actually 'new'. How: This animates CodConCom open/closed around that check. */ }


										<CodConCom
											conDraObj={ conDraObj }
											namErrStr={ conErrStr }

											onChange={ setConDraObj }
										/>{ /* What: Conditional Control Component. Why: A new inline conditional is edited through the same control the Data tab uses. How: This is passed the draft and its own name error. */ }


									</ColDisCom>


								</div>


							</ColDisCom>


						</div>



						<div
							className={` ${ cssModObj.forFieDiv }   ${ cssModObj.forFieDivDaily } `}

							data-element-name-hook='forFieDiv'
						>{ /* What: Form Field Div Daily Element. Why: The daily-generator toggle and its own collapsible schedule content form one field unit. How: This wraps daiTogDiv and the ColDisCom below it. Its data-element-name-hook is read by the tours and help mode. */ }


							<TogRowCom
								ideValStr='daiTogBut'

								className={ cssModObj.daiTogDiv }

								data-element-name-hook='daiTogDiv'

								disHelEle={ <React.Fragment>This picker <strong>will not run</strong> automatically, but you can still run it manually from this tab.</React.Fragment> } // What: Daily Disabled Fragment. Why: The daily-generator note needs its own live wording for the disabled state. How: This renders while incDaiBoo is false.
								enaHelEle={ <React.Fragment>This picker <strong>will run</strong> automatically as part of your daily list or whenever you tap Regenerate in the Today tab.</React.Fragment> } // What: Daily Enabled Fragment. Why: The daily-generator note needs its own live wording for the enabled state. How: This renders while incDaiBoo is true.
								labTexStr='Include in the daily generator'
								value={ incDaiBoo }

								onClick={ () => { // What: On Click Handler. Why: The daily switch should also let the schedule scroll into view. How: This marks the toggle as user-driven, then flips incDaiBoo.


									daiTogRef.current = true;                    // What: Daily Toggled Mark. Why: The schedule's scroll-into-view should only follow a real user toggle. How: This flags daiTogRef.
									setIncDaiBoo( ( preValBoo ) => !preValBoo ); // What: Daily Toggle Call. Why: This is the actual daily-generator switch. How: This flips incDaiBoo.


								} }
							/>{ /* What: Toggle Row Component. Why: The label/help text block and the switch control sit side by side. How: This renders the label, its live help paragraph, and the switch. Its data-element-name-hook is read by help mode. */ }



							<ColDisCom open={ incDaiBoo }>{ /* What: Collapse Disclosure Component. Why: The whole schedule block only needs to exist while incDaiBoo is actually on. How: This animates schSetDiv open/closed around that boolean. */ }


								<div
									ref={ daiBloRef }

									className={ cssModObj.schSetDiv }
								>{ /* What: Schedule Settings Div Element. Why: The cadence control, the weekday picker, and the two schedule toggles form one collapsible block. How: This wraps schBloDiv/schTogDiv sections below. */ }


									<div
										className={ cssModObj.schBloDiv }

										data-element-name-hook='schBloDiv'
									>{ /* What: Schedule Block Div Element. Why: The shared cadence editor needs its own labelled block. How: This wraps a single CadConCom, wired to cadCurObj. Its data-element-name-hook is read by help mode. */ }


										<CadConCom
											value={ cadCurObj }

											onChange={ ( patCadObj ) => setCadCurObj( ( preCadObj ) => CAD_NAM_OBJ.norCadFun( { ...preCadObj, ...patCadObj } ) ) }
										/>{ /* What: Cadence Control Component. Why: The schedule's own cadence is edited through the shared cadence control. How: This normalizes every patch into cadCurObj. */ }


									</div>



									<div
										className={ cssModObj.schBloDiv }

										data-element-name-hook='schBloDiv'
									>{ /* What: Schedule Block Div Element. Why: The weekday picker and its own presets form one block. How: This wraps the label, help text, chips, and preset buttons below. Its data-element-name-hook is read by help mode. */ }


										<span className={ cssModObj.forLabSpa }>Which days?</span>{ /* What: Form Label Span Element. Why: The weekday picker below needs a readable label. How: This renders the literal text. */ }

										<p className={ cssModObj.forHelPar }>Pick the days that this picker is allowed to run on. Tap a day to turn it off. This is handy for things like chores, that you&rsquo;d rather not see on weekends.</p>{ /* What: Form Help Paragraph Element. Why: A first-time user needs to understand what tapping a day chip actually does. How: This renders a fixed explanatory sentence. */ }


										<div
											className={ cssModObj.schRowDiv }

											data-element-name-hook='schRowDiv'
										>{ /* What: Schedule Row Div Element. Why: The weekday chips and their preset shortcuts sit side by side, wrapping the presets under the chips at about 530px wide and below. How: This wraps WeeChiCom and schPreDiv. Its data-element-name-hook is read by help mode. */ }


											<WeeChiCom
												locDayNum={ locDowNum }
												locTipStr={ locDowNum === null ? '' : CAD_NAM_OBJ.locTipFun( locDowNum, 'On which day?' ) } // What: Locked Tip String. Why: The weekday chips explain a locked day only while a weekly cadence locks one. How: This is empty when no day is locked, otherwise the tip CAD_NAM_OBJ.locTipFun builds for that day, naming the "On which day?" control.
												value={ runDowArr }

												onChange={ setRunDowArr }
											/>{ /* What: Weekday Chip Component. Why: The user needs a direct way to toggle individual weekdays on or off. How: This is passed runDowArr and locDowNum so a weekly cadence's own anchor day can't be turned off here. */ }



											<div className={ cssModObj.schPreDiv }>{ /* What: Schedule Presets Div Element. Why: Three common day patterns deserve one-tap shortcuts instead of manual chip-tapping every time. How: This wraps the Every day/Weekdays/Weekends buttons. */ }


												<button
													className={ cssModObj.dayPreBut }

													type='button'

													onClick={ () => setRunDowArr( witLocFun( [ 0, 1, 2, 3, 4, 5, 6 ] ) ) }
												>Every day</button>{ /* What: Day Preset Button Element. Why: This is the fastest way to select every day at once. How: This calls witLocFun with the full week, keeping any locked anchor day intact. */ }

												<button
													className={ cssModObj.dayPreBut }

													type='button'

													onClick={ () => setRunDowArr( witLocFun( [ 1, 2, 3, 4, 5 ] ) ) }
												>Weekdays</button>{ /* What: Day Preset Button Element. Why: This is a common one-tap pattern for chore-like pickers. How: This calls witLocFun with Monday through Friday. */ }

												<button
													className={ cssModObj.dayPreBut }

													type='button'

													onClick={ () => setRunDowArr( witLocFun( [ 0, 6 ] ) ) }
												>Weekends</button>{ /* What: Day Preset Button Element. Why: This is the inverse common one-tap pattern. How: This calls witLocFun with Saturday and Sunday. */ }


											</div>


										</div>


									</div>



									<TogRowCom
										ideValStr='skiHolBut'

										className={ cssModObj.schTogDiv }

										data-element-name-hook='schTogDiv'

										disHelEle={ <React.Fragment>This picker <strong>will always run</strong>, even on major U.S. holidays.</React.Fragment> } // What: Holidays Run Fragment. Why: The holiday note needs its own live wording for the always-run state. How: This renders while skiHolBoo is false.
										enaHelEle={ <React.Fragment>This picker <strong>will not run</strong> on major U.S. holidays. You can edit which days count as holidays, or even add your own, on the Settings page.</React.Fragment> } // What: Holidays Skip Fragment. Why: The holiday note needs its own live wording for the skip-enabled state. How: This renders while skiHolBoo is true.
										labTexStr='Skip on holidays'
										value={ skiHolBoo }

										onClick={ () => setSkiHolBoo( ( preValBoo ) => !preValBoo ) }
									/>{ /* What: Toggle Row Component. Why: The label/help text block and its own switch sit side by side. How: This renders the label, its live help paragraph, and the switch. Its data-element-name-hook is read by help mode. */ }



									<TogRowCom
										ideValStr='avoDupBut'

										className={ cssModObj.schTogDiv }

										data-element-name-hook='schTogDiv'

										disHelEle={ <React.Fragment>This picker <strong>may pick</strong> an item even if its name is already on today&rsquo;s todo list.</React.Fragment> } // What: Avoid Duplicates Off Fragment. Why: The duplicate-avoidance note needs its own live wording for the disabled state. How: This renders while avoDupBoo is false.
										enaHelEle={ <React.Fragment>This picker <strong>won&rsquo;t pick</strong> an item whose name is already on today&rsquo;s todo list.</React.Fragment> } // What: Avoid Duplicates On Fragment. Why: The duplicate-avoidance note needs its own live wording for the enabled state. How: This renders while avoDupBoo is true.
										labTexStr='Avoid duplicate items'
										value={ avoDupBoo }

										onClick={ () => setAvoDupBoo( ( preValBoo ) => !preValBoo ) }
									/>{ /* What: Toggle Row Component. Why: The label/help text block and its own switch sit side by side. How: This renders the label, its live help paragraph, and the switch. Its data-element-name-hook is read by help mode. */ }


								</div>


							</ColDisCom>


						</div>


					</div>



					<div
						className={ cssModObj.detFooDiv }

						data-element-name-hook='detFooDiv'
					>{ /* What: Details Footer Div Element. Why: The step's own guidance note and its Cancel and Save or Add Items actions sit in one footer row. How: This wraps fooNotDiv and forActDiv. Its data-element-name-hook is read by help mode. */ }


						<div
							className={ cssModObj.fooNotDiv }

							data-element-name-hook='fooNotDiv'
						>{ /* What: Footer Note Div Element. Why: The Step 1 footer explains what's still missing before Add Items works. How: This renders the note text below. Its data-element-name-hook is read by help mode. */ }


							{ ( () => { // What: Footer Note Render. Why: The exact guidance sentence depends on which required field (if any) is still missing, and whether this is a create or an edit. How: This checks name/group completeness first, branching separately for edit versus create phrasing.


								const neeNamBoo = !newNamStr.trim(); // What: Need Name Boolean. Why: The guidance text needs to know specifically whether the name field is the one still missing. How: This is true whenever the trimmed name is empty.
								const neeGroBoo = !effGroStr;        // What: Need Group Boolean. Why: The guidance text needs to know specifically whether the group field is the one still missing. How: This is true whenever effGroStr resolves to nothing.


								if ( isaEdiBoo ) { // What: Edit Guidance Branch. Why: An edit's own missing-field wording differs slightly from create's. How: This covers the (ordinarily unreachable, since an existing picker already has both) case of the user clearing either field while editing.


									if ( neeNamBoo && neeGroBoo ) return 'A picker name and group are both required.'; // What: Both Missing Return. Why: Both fields being blank needs its own combined sentence. How: This is the first, most specific case checked.



									if ( neeNamBoo ) return 'A picker name is required.'; // What: Name Missing Return. Why: Only the name being blank needs its own sentence. How: This is checked once the combined case above is ruled out.



									if ( neeGroBoo ) return 'A group name is required.'; // What: Group Missing Return. Why: Only the group being blank needs its own sentence. How: This is checked once both prior cases are ruled out.



									return 'Everything looks good, click Save to save this picker’s new settings.'; // What: Ready Return. Why: Neither field is missing, so the user is ready to save. How: This is the final fallback once every missing-field case above is ruled out.


								}



								if ( neeNamBoo && neeGroBoo ) return 'A picker name and group are both required before advancing to the next step to create items for the picker’s list.'; // What: Both Missing Return. Why: Both fields being blank needs its own combined sentence for the create flow. How: This is the first, most specific case checked.



								if ( neeNamBoo ) return 'A picker name is required before advancing to the next step to create items for the picker’s list.'; // What: Name Missing Return. Why: Only the name being blank needs its own sentence for the create flow. How: This is checked once the combined case above is ruled out.



								if ( neeGroBoo ) return 'A group name is required before advancing to the next step to create items for the picker’s list.'; // What: Group Missing Return. Why: Only the group being blank needs its own sentence for the create flow. How: This is checked once both prior cases are ruled out.



								return <React.Fragment>Up next, create items to be included in this picker&rsquo;s list.</React.Fragment>; // What: Ready Return. Why: Neither field is missing, so the user is ready to advance to Step 2. How: This is the final fallback once every missing-field case above is ruled out.


							} )() }


						</div>

						<div
							className={ cssModObj.forActDiv }

							data-element-name-hook='forActDiv'
						>{ /* What: Form Actions Div Element. Why: Cancel and the Save/Add Items button sit side by side. How: This wraps those two controls. Its data-element-name-hook is read by help mode. */ }


							<ButBasCom
								kinValStr='ghost'

								onClick={ onCanForFun }
							>Cancel</ButBasCom>{ /* What: Button Base Component. Why: The user needs a way to back out of this form entirely. How: This calls onCanForFun. */ }



							{ isaEdiBoo ? ( // What: Edit Mode Check. Why: Editing saves right away, while creating still has an Items step. How: This picks the Save or Add Items button based on isaEdiBoo.


								<ButBasCom
									disabled={ !detReaBoo || conColBoo } // What: Save Disabled Check. Why: Saving needs Step 1's required fields and no clash with an existing conditional's name. How: This disables the button until detReaBoo holds, and while conColBoo flags a clash.
									icoNamStr='cheEle'
									kinValStr='primary'

									onClick={ subForFun }
								>Save</ButBasCom> // What: Button Base Component. Why: Editing only ever has one step, so this button both validates and commits. How: This calls subForFun directly, disabled until detReaBoo holds and no conditional name collides.


							) : ( // What: Add Items Branch. Why: Creating still has an Items step to fill in. How: This renders the else branch while isaEdiBoo is false.


								<ButBasCom
									data-element-name-hook='forNexBut'

									disabled={ !detReaBoo || conColBoo } // What: Next Disabled Check. Why: Moving on needs Step 1's required fields and no clash with an existing conditional's name. How: This disables the button until detReaBoo holds, and while conColBoo flags a clash.
									icoNamStr='chvEle'
									kinValStr='primary'

									onClick={ advSteFun }
								>Add Items</ButBasCom> // What: Button Base Component. Why: Creating still has an Items step to fill in. How: This calls advSteFun to advance, disabled under the same conditions as the edit Save button above. Its data-element-name-hook is read by the tours and the test suites.


							) }


						</div>


					</div>


				</div>


			) : ( // What: Step Two Branch. Why: With forSteNum at 2, the Items step's own content shows instead. How: This renders the else branch, taken while forSteNum isn't 1.


				<div
					key='np-step2'

					className={ cssModObj.steFadDiv }
				>{ /* What: Step Fade Div Element. Why: Switching steps should play a fade transition, and React needs a stable key to treat each step as a distinct mounted instance. How: This wraps the whole Items step's own hint text, pool, and footer. */ }


					<p className={ cssModObj.steHinPar }>{ /* What: Step Hint Paragraph Element. Why: A first-time user needs to be reminded which picker/mode they're building items for. How: This renders the live-typed name (or a fallback) and the chosen mode's own label. */ }


						This is the list of items that your
						{ ' ' }{ newNamStr.trim() ? `“${ newNamStr.trim() }”` : 'this picker' } picker chooses from.
						Each time it runs it picks one of these items, following the
						{ ' ' }&ldquo;{ SED_NAM_OBJ.MOD_DEF_OBJ[ selModStr ].labStr }&rdquo; rule that you chose. You will need
						to add at least 2 items before you can finish creating this picker. You
						can always add, edit or remove items later.


					</p>

					{ selModStr === 'random' && ( // What: Random Note Check. Why: Only Truly Random has literally nothing extra to explain about its own items. How: This renders the note only for that mode.


						<p className={ cssModObj.steHinPar }>Because you chose &ldquo;Truly Random&rdquo;, there are no extra controls to tweak for these items since they all have an equal chance of being picked.</p> // What: Step Hint Paragraph Element. Why: A Truly Random picker has no per-item controls, which is worth saying. How: This renders a fixed explanation.


					) }

					{ selModStr === 'weighted' && ( // What: Weighted Note Check. Why: Weighted and Dynamic both introduce the per-item weight concept, worth explaining once items are being added. How: This renders the note only for that mode.


						<p className={ cssModObj.steHinPar }>Because you chose &ldquo;Weighted&rdquo;, each item also has a weight. A higher weight means an item has a higher chance of being picked. e.g. a w2 item will be picked about twice as often as a w1. Leave them all at w1 for an even start, you can always change these later.</p> // What: Step Hint Paragraph Element. Why: Weighted items carry a weight the user should understand. How: This renders a fixed explanation.


					) }

					{ selModStr === 'dynamic' && ( // What: Dynamic Note Check. Why: Same reasoning as the Weighted note above, worded to also quote the mode's own live label. How: This renders the note only for that mode.


						<p className={ cssModObj.steHinPar }>Because you chose &ldquo;{ SED_NAM_OBJ.MOD_DEF_OBJ[ selModStr ].labStr }&rdquo;, each item also has a weight. A higher weight means an item has a higher chance of being picked. e.g. a w2 item will be picked about twice as often as a w1. Leave them all at w1 for an even start, you can always change these later.</p> // What: Step Hint Paragraph Element. Why: Dynamic items carry a weight plus a drift bonus the user should understand. How: This renders an explanation naming the chosen mode.


					) }

					{ selModStr === 'ease-up' && ( // What: Ease Up Note Check. Why: Ease Up/Ease Down both introduce the per-item drift-cadence concept, worth explaining once items are being added. How: This renders the note only for that mode.


						<p className={ cssModObj.steHinPar }>Because you chose &ldquo;Ease Up&rdquo;, each item gets its own cadence. This is set per item below, since each item might need a different timeout period. For each one you will need to pick a soonest and a latest value, which will be used to determine its new value as it charges towards becoming eligible again.</p> // What: Step Hint Paragraph Element. Why: Ease Up items each need their own timeout band. How: This renders a fixed explanation.


					) }

					{ selModStr === 'ease-down' && ( // What: Ease Down Note Check. Why: Same reasoning as the Ease Up note above, worded for discharging instead of charging. How: This renders the note only for that mode.


						<p className={ cssModObj.steHinPar }>Because you chose &ldquo;Ease Down&rdquo;, each item gets its own cadence. This is set per item below, since each item might need a different selection period. For each one you will need to pick a soonest and a latest value, which will be used to determine its new value as it discharges towards deselection.</p> // What: Step Hint Paragraph Element. Why: Ease Down items each need their own selection band. How: This renders a fixed explanation.


					) }



					<div className={ cssModObj.itePooDiv }>{ /* What: Item Pool Div Element. Why: The empty-state message, the real pool list, and the add/edit slot below it all share this one section. How: This wraps whichever of those currently applies. */ }


						{ pooIteArr.filter( ( iteCurObj ) => iteCurObj.id !== actNewStr ).length === 0 && !actNewStr && ( // What: Empty Pool Check. Why: A pool with no committed items yet (and nothing currently being added) needs its own placeholder message. How: This renders the placeholder only under both conditions.


							<div className={ cssModObj.pooEmpDiv }>Nothing here yet. Add at least 2 items that this picker can choose between, so that there&rsquo;s a real choice to make.</div> // What: Pool Empty Div Element. Why: An empty draft pool needs a nudge toward adding items. How: This renders a fixed message.


						) }



						{ pooIteArr.filter( ( iteCurObj ) => iteCurObj.id !== actNewStr ).length > 0 && ( // What: Non-Empty Pool Check. Why: The real list only needs to render once at least one committed item actually exists. How: This renders pooLisDiv only while that count is above 0.


							<div className={ cssModObj.pooLisDiv }>{ /* What: Pool List Div Element. Why: One row per committed draft item needs a shared list container. How: This maps every committed entry of pooIteArr to one row below. */ }


								{ pooIteArr.filter( ( iteCurObj ) => iteCurObj.id !== actNewStr ).map( ( curIteObj ) => { // What: Pool Row List Render. Why: Every committed draft item needs its own row, showing its own cadence/weight summary. How: This maps the filtered list to one row per curIteObj.


									const sooDayNum = PIC_NAM_OBJ.driDayFun( curIteObj.easeMax ); // What: Soonest Day Number. Why: The row's own ease-meta text needs a human-readable soonest value. How: This converts curIteObj.easeMax back into days.
									const latDayNum = PIC_NAM_OBJ.driDayFun( curIteObj.easeMin ); // What: Latest Day Number. Why: The row's own ease-meta text needs a human-readable latest value. How: This converts curIteObj.easeMin back into days.



									return (


										<div
											key={ curIteObj.id }

											className={` ${ cssModObj.pooRowDiv }   ${ insDraStr === curIteObj.id ? cssModObj.pooRowDivInsert : '' }   ${ conDelStr === curIteObj.id ? cssModObj.pooRowDivConfirm : '' }   ${ rmvIdeStr === curIteObj.id ? cssModObj.pooRowDivRemoving : '' } `}

											onAnimationEnd={ ( aniEveObj ) => { // What: On Animation End Handler. Why: A new row's slide-in and a deleted row's removal both finish on this row's own animation end. How: This clears the insert flag, and removes the draft item once its removal animation is done.


												if ( insDraStr === curIteObj.id ) setInsDraStr( null ); // What: Insert Clear Guard. Why: A just-added row's slide-in plays only once. How: This clears insDraStr when its animation belongs to this row.



												if ( rmvIdeStr === curIteObj.id && aniEveObj.target === aniEveObj.currentTarget ) { // What: Removal Finished Guard. Why: The item leaves the draft pool only after its own row finishes the removal animation. How: This checks the row is the one being removed and the event came from the row itself.


													draActObj.delIteFun( curIteObj.id ); // What: Remove Item Call. Why: The row's removal animation has finished, so the draft pool can drop it. How: This calls delIteFun with this row's id.
													setRmvIdeStr( null );                // What: Removing Clear Call. Why: The removal is finished. How: This resets rmvIdeStr to null.


												}


											} }
										>{ /* What: Pool Row Div Element. Why: Every committed draft item needs one row, whichever of its own name/meta/actions or delete-confirm content currently applies. How: This carries this row's own transient animation classes, and commits the real removal once its own leaving keyframe finishes. */ }


											{ conDelStr === curIteObj.id ? ( // What: Delete Confirm Check. Why: A row pending delete confirmation replaces its own normal content entirely. How: This renders the confirm row while conDelStr matches this item, otherwise the row's real content below.


												<div className={` ${ cssModObj.delConDiv }   ${ conLeaStr === curIteObj.id ? cssModObj.delConDivLeaving : '' } `}>{ /* What: Delete Confirm Div Element. Why: The delete question and its Cancel/Delete buttons form one block. How: This wraps delMesSpa and delActDiv. Its leaving modifier slides it back out once the delete is cancelled. */ }


													<span className={ cssModObj.delMesSpa }>Delete <strong>{ curIteObj.name }</strong>?</span>{ /* What: Delete Message Span Element. Why: The user must see exactly which item they're about to remove from the draft. How: This renders curIteObj.name inside the fixed question text. */ }

													<div className={ cssModObj.delActDiv }>{ /* What: Delete Actions Div Element. Why: Cancel and Delete need to sit side by side. How: This wraps those two buttons. */ }


														<ButBasCom
															kinValStr='ghost'
															sizValStr='sm'

															onClick={ canConFun }
														>Cancel</ButBasCom>{ /* What: Button Base Component. Why: The user needs a clear way to back out of a delete they didn't mean to start. How: This calls canConFun. */ }



														<ButBasCom
															icoNamStr='traEle'
															kinValStr='danger'
															sizValStr='sm'

															onClick={ () => { // What: On Click Handler. Why: Confirming a delete starts the row's removal animation. How: This clears the confirm state and marks the row as removing.


																setConDelStr( null );         // What: Confirm Clear Call. Why: No row stays in its delete-confirm state. How: This resets conDelStr to null.
																setRmvIdeStr( curIteObj.id ); // What: Removing Set Call. Why: The row plays its removal animation before the item is dropped. How: This writes this row's id into rmvIdeStr.


															} }
														>Delete</ButBasCom>{ /* What: Button Base Component. Why: This is the actual confirmed removal action. How: This clears the confirm state and starts the row's own removal animation. */ }


													</div>


												</div>


											) : ( // What: Row Content Branch. Why: A row not pending delete confirmation shows its own normal name/meta/actions content instead. How: This renders the else branch, taken while conDelStr doesn't match this item.


												<React.Fragment>{ /* What: Row Content Fragment. Why: The name/meta block and the edit/delete actions below are true siblings with no shared wrapper of their own. How: This groups all of this draft row's own real content without adding an extra DOM node. */ }


													<div className={ cssModObj.pooNamDiv }>{ curIteObj.name }</div>{ /* What: Pool Name Div Element. Why: Every row needs its own visible item name. How: This renders curIteObj.name. */ }

													<div className={ cssModObj.pooMetDiv }>{ /* What: Pool Meta Div Element. Why: The optional cadence summary and the optional weight pill sit side by side. How: This wraps both, each independently gated. */ }


														{ isaEasBoo && <span className={ cssModObj.pooEasSpa }>{ sooDayNum }&ndash;{ latDayNum } { CAD_NAM_OBJ.uniWorFun( cadCurObj.cadence, latDayNum ) }</span> }{ /* What: Ease Meta Span Check. Why: Only ease-up/ease-down items have a cadence summary worth showing. How: This renders the soonest-latest range, unit-worded per the picker's own cadence, only while isaEasBoo is true. */ }

														{ shoWeiBoo && <span className={ cssModObj.pooWeiSpa }>w{ curIteObj.weight }</span> }{ /* What: Weight Span Check. Why: Only weighted/dynamic items have a weight worth showing. How: This renders the raw weight only while shoWeiBoo is true. */ }


													</div>

													<div aria-hidden='true' />{ /* What: Spacer Div Element. Why: The row's own CSS grid still expects a cell in this column, even though the live pool's own drift/status pills have no equivalent here yet. How: This is an empty, hidden placeholder cell. */ }

													<button
														className={ cssModObj.pooEdiBut }

														type='button'

														aria-label={ `Edit ${ curIteObj.name }` }
														title='Edit'

														onClick={ () => staDraFun( curIteObj.id ) }
													>{ /* What: Pool Edit Button Element. Why: Every row needs a way to open its own item in the shared editor slot below. How: This calls staDraFun with this row's own item id. */ }


														<IcoSvgCom
															icoNamStr='ediEle'
															sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
														/>{ /* What: Icon SVG Component. Why: The edit action needs a recognizable pencil glyph. How: This renders the 'ediEle' icon at a fixed size. */ }


													</button>



													{ pooIteArr.filter( ( iteCurObj ) => iteCurObj.id !== actNewStr ).length <= 2 ? ( // What: Delete Guard Check. Why: A picker must always keep at least 2 committed items, so the last two rows can't offer a real delete button at all. How: This renders a disabled, explanatory InfTipCom instead of a working Delete button whenever the pool is at that floor.


														<InfTipCom
															className={ cssModObj.pooDelSpa }

															actNamStr='Delete'
															labTexStr='Pickers require at least 2 items in their list, you need to add another item first or delete the entire picker instead.'
														>{ /* What: Info Tip Component. Why: The user should understand why Delete is unavailable rather than it just silently not working. How: This wraps the trash glyph with the explanatory tooltip above. */ }


															<IcoSvgCom
																icoNamStr='traEle'
																sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
															/>{ /* What: Icon SVG Component. Why: The delete action needs a recognizable trash glyph. How: This renders the 'traEle' icon at a fixed size. */ }


														</InfTipCom>


													) : ( // What: Delete Button Branch. Why: With more than 2 committed items in the draft, a real working Delete button belongs here instead. How: This renders the else branch, taken while the draft pool is above that floor.


														<button
															className={ cssModObj.pooDelBut }

															type='button'

															aria-label={ `Delete ${ curIteObj.name }` }

															onClick={ () => setConDelStr( curIteObj.id ) }
														>{ /* What: Pool Delete Button Element. Why: This starts this row's own delete-confirm flow. How: This writes curIteObj.id into conDelStr. */ }


															<IcoSvgCom
																icoNamStr='traEle'
																sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
															/>{ /* What: Icon SVG Component. Why: The delete action needs a recognizable trash glyph. How: This renders the 'traEle' icon at a fixed size. */ }


														</button>


													) }


												</React.Fragment>


											) }


										</div>


									);


								} ) }


							</div>


						) }



						<div
							ref={ addWraRef }

							className={ cssModObj.iteAddDiv }

							data-element-name-hook='iteAddDiv'
						>{ /* What: Item Add Div Element. Why: The new-item form, an already-committed item's editor, and the plain "+ Add Item" button all share this one below-the-list slot. How: This wraps whichever of those three the IIFE below currently resolves to. Its data-element-name-hook is read by the tours. */ }


							{ ( () => { // What: Add Item Slot Render. Why: Exactly one of three things belongs in this slot at a time, easier to express as a small function than as a nested ternary. How: This checks ediIteStr first, then actNewStr, falling back to the plain button.


								if ( ediIteStr ) { // What: Committed Item Editor Branch. Why: An already-committed draft item's own editor takes priority whenever one is open. How: This looks up the item and renders its editor, or nothing if it vanished out from under itself.


									const ediLivObj = pooIteArr.find( ( iteCurObj ) => iteCurObj.id === ediIteStr ); // What: Editing Live Object. Why: The editor needs the exact current draft item record to open against. How: This looks up ediIteStr in pooIteArr.


									if ( !ediLivObj ) return null; // What: Missing Item Guard. Why: The item may have been removed via the row's own trash icon while this was open; that confirm flow already owns closing this out. How: This renders nothing rather than crashing against a missing item.



									return (


										<IteCarCom
											ediKeyStr={ ediLivObj.id }
											iteCloBoo={ ediCloBoo }
											iteDatObj={ draIteObj && draIteObj.id === ediLivObj.id ? draIteObj : ediLivObj } // What: Item Data Object. Why: The open editor shows its draft, while a closing one shows the pool item itself. How: This picks the draft only when it belongs to this item.
											namValStr={ draIteObj && draIteObj.id === ediLivObj.id ? draIteObj.name : ediLivObj.name } // What: Name Value String. Why: The open editor's name lives in its draft until Save, while a closing editor shows the real name. How: This shows the draft's name when the draft belongs to this item, else the item's own.
											picDatObj={ draPicObj }
											picIteArr={ pooIteArr }

											onCanEdiFun={ () => setEdiCloBoo( true ) } // What: On Cancel Edit Function. Why: Cancel only has to close the editor, since closing drops its draft. How: This starts the editor's closing animation.
											onCloEndFun={ () => { // What: On Close End Function. Why: The draft item editor's own close animation must finish before its state clears. How: This clears the closing and open flags, then opens any editor requested meanwhile.


												setEdiCloBoo( false ); // What: Closing Clear Call. Why: The close animation is over. How: This resets ediCloBoo to false.

												setEdiIteStr( null ); // What: Editor Clear Call. Why: No item's editor stays open. How: This resets ediIteStr to null.

												opePenFun(); // What: Pending Editor Open Call. Why: A different item's editor may have been requested while this one was closing. How: This opens it through opePenFun once this editor has finished closing.


											} }
											onNamChaFun={ ( namValStr ) => patDraFun( { name : namValStr } ) }
											onPatIteFun={ patDraFun }
											onSavEdiFun={ () => { // What: On Save Edit Function. Why: Save must apply the draft to the pool item before the editor closes. How: This commits the draft, then starts the editor's closing animation.


												cmtDraFun(); // What: Commit Draft Call. Why: The draft's edits only reach the pool item on Save. How: This calls cmtDraFun.

												setEdiCloBoo( true ); // What: Start Closing Call. Why: A saved editor has nothing left to show. How: This flips ediCloBoo, which plays the closing animation.


											} }
										/> // What: Item Card Component. Why: This is the whole committed-item editor slot, playing its own closing animation before actually unmounting. How: This is passed the item's draft (or the pool item while closing) and the draft-bound handlers, and reopens whatever edit staDraFun staged in penEdiRef once its closing animation ends.


									);


								}



								const newIteObj = pooIteArr.find( ( iteCurObj ) => iteCurObj.id === actNewStr ); // What: New Item Object. Why: The branch below needs a stable local alias to check and render from. How: This looks up actNewStr in pooIteArr.


								if ( !newIteObj ) return ( // What: No Draft Branch. Why: When neither a committed edit nor a new draft is open, the plain add button belongs in this slot. How: This returns the "+ Add Item" button directly.


									<button
										className={ cssModObj.iteAddBut }

										data-element-name-hook='iteAddBut'

										type='button'

										onClick={ addDraFun }
									>{ /* What: Add Item Button Element. Why: This starts a brand-new item draft in the pool. How: This calls addDraFun on click. Its data-element-name-hook is read by the tours, help mode, and the test suites. */ }


										<IcoSvgCom
											icoNamStr='pluEle'
											sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
										/>{ /* What: Icon SVG Component. Why: The button needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } Add Item


									</button>


								);



								return (


									<IteCarCom
										iteCloBoo={ !!actCloStr }
										iteDatObj={ newIteObj }
										namInpRef={ selAllFun }
										namValStr={ newIteObj.name }
										picDatObj={ draPicObj }
										picIteArr={ pooIteArr }

										onCanEdiFun={ () => setActCloStr( 'cancel' ) }
										onCloEndFun={ () => { // What: On Close End Function. Why: The new draft item's own close animation must finish before the add is kept or dropped. How: This keeps or discards the draft, clears the add state, then opens any editor requested meanwhile.


											const savIdeStr = newIteObj.id; // What: Saved Identifier String. Why: The new item's id is needed after the draft state below is cleared. How: This copies newIteObj.id.


											if ( actCloStr === 'save' ) setInsDraStr( savIdeStr ); // What: Commit Save Branch. Why: A saved new item's row plays its slide-in once, keyed to its own id. How: This calls setInsDraStr with savIdeStr.

											else draActObj.delIteFun( savIdeStr ); // What: Discard Draft Branch. Why: Any other closing reason (cancel, etc.) should just discard the in-progress draft item entirely. How: This calls draActObj.delIteFun with savIdeStr.



											setActCloStr( false ); // What: Closing Clear Call. Why: The close animation is over. How: This resets actCloStr to false.

											setActNewStr( null ); // What: Active New Clear Call. Why: No new item is being added anymore. How: This resets actNewStr to null.

											opePenFun(); // What: Pending Editor Open Call. Why: A different item's editor may have been requested while this one was closing. How: This opens it through opePenFun once this editor has finished closing.


										} }
										onNamChaFun={ ( namValStr ) => draActObj.updIteFun( newIteObj.id, { name : namValStr } ) }
										onNamCmtFun={ ( namValStr ) => draActObj.renIteFun( newIteObj.id, namValStr ) } // What: On Name Commit Function. Why: Leaving the name field commits a tidied name. How: This renames the draft item to the trimmed name.
										onPatIteFun={ ( patIteObj ) => draActObj.updIteFun( newIteObj.id, patIteObj ) } // What: On Patch Item Function. Why: A brand-new pool item is still unsaved, since Cancel removes it from the pool, so its edits can go straight onto it. How: This merges each change into the new item through the pool's own updIteFun.
										onSavEdiFun={ () => setActCloStr( 'save' ) }
									/> // What: Item Card Component. Why: This is the whole new-item draft editor slot, playing its own closing animation before actually keeping or discarding it. How: This is passed the new pool item and the pool-bound handlers, flags the row for its own insert animation only when actCloStr is 'save', otherwise removes it, then reopens whatever staDraFun staged in penEdiRef.


								);


							} )() }


						</div>


					</div>



					<div
						className={ cssModObj.iteFooDiv }

						data-element-name-hook='iteFooDiv'
					>{ /* What: Items Footer Div Element. Why: The step's own guidance note and its Back/Create actions sit in one footer row. How: This wraps fooNotDiv and forActDiv. Its data-element-name-hook is read by help mode. */ }


						<div
							className={ cssModObj.fooNotDiv }

							data-element-name-hook='fooNotDiv'
						>{ /* What: Footer Note Div Element. Why: The exact guidance sentence depends on how many committed items exist and whether weight is relevant. How: This branches on enoIteBoo first, then shoWeiBoo, otherwise counting toward the 2-item minimum. Its data-element-name-hook is read by help mode. */ }


							{ !enoIteBoo // What: Not Enough Items Check. Why: The footer note either says how many more items are needed or confirms the minimum is met. How: This picks the add-more message first, then the weight or minimum message.


								? `Add at least 2 items to create this picker${ cmtCouNum === 1 ? ' (1 so far)' : '' }.` // What: Add More Message. Why: A picker needs at least 2 items to be a real choice. How: This notes the one item added so far, when there is one.

								: shoWeiBoo // What: Show Weight Check. Why: Weighted pools get a hint about setting weights. How: This checks shoWeiBoo.

								? 'Looks good, set each item’s weight above, or leave them even.' // What: Weight Hint Message. Why: The minimum is met and weights are worth a look. How: This renders a fixed sentence.

								: `Minimum number of items added (${ cmtCouNum } so far). You can always add more items later.` // What: Minimum Met Message. Why: The minimum is met with no weights to set. How: This names the item count so far.


							}


						</div>

						<div
							className={ cssModObj.forActDiv }

							data-element-name-hook='forActDiv'
						>{ /* What: Form Actions Div Element. Why: Back and Create Picker sit side by side. How: This wraps those two buttons. Its data-element-name-hook is read by help mode. */ }


							<ButBasCom
								kinValStr='ghost'

								onClick={ bacSteFun }
							>Back</ButBasCom>{ /* What: Button Base Component. Why: The user needs a way to return to Step 1 without losing their in-progress items. How: This calls bacSteFun. */ }



							<ButBasCom
								data-element-name-hook='forCreBut'

								disabled={ !enoIteBoo || conColBoo } // What: Create Disabled Check. Why: Creating needs at least 2 committed items and no clash with an existing conditional's name. How: This disables the button until enoIteBoo holds, and while conColBoo flags a clash.
								icoNamStr='cheEle'
								kinValStr='primary'

								onClick={ subForFun }
							>Create Picker</ButBasCom>{ /* What: Button Base Component. Why: This is the actual final commit for a brand-new picker. How: This calls subForFun, disabled until enoIteBoo holds and no conditional name collides. Its data-element-name-hook is read by the tours and the test suites. */ }


						</div>


					</div>


				</div>


			) }


		</div>


	);


}

// #endregion PicForCom

// #endregion Components



// #region Exports

export { PicForCom }; // What: Named Export. Why: The picker form is this file's one public binding. How: This exports PicForCom by name.

// #endregion Exports


