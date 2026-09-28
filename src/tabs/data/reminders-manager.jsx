


// #region Imports

import React from 'react'; // What: React. Why: Every component in this file is built directly on React's own APIs. How: This is used directly (React.useEffect, React.useRef, React.useState, React.Fragment) instead of importing individual named hooks.


import { ButBasCom   } from '../../ui/button.jsx';                 // What: Button Base Component. Why: The add form and each open reminder's own actions need consistently-styled buttons. How: This is rendered throughout RemManCom.
import { ColDisCom   } from '../../ui/collapse.jsx';               // What: Collapse Disclosure Component. Why: Each reminder row and the add form need to animate open and closed instead of snapping. How: This wraps each of those bodies in RemManCom, driven by its own open state.
import { EdiFooCom   } from '../../ui/editor-footer.jsx';          // What: Editor Footer Component. Why: Every reminder editor ends with the same Delete/Cancel/Save row. How: This is rendered at the bottom of each reminder editor.
import { freEdiFun   } from './list-sorting.js';                   // What: Freeze Edited Function. Why: The Data tab's reminder list must not visibly reorder out from under an open editor as its own fields change. How: This is called once to compute disTasArr from sorTasArr.
import { IcoSvgCom   } from '../../ui/icon.jsx';                   // What: Icon Svg Component. Why: Every reminder row and button needs a recognizable glyph. How: This is rendered throughout OptMatCom and RemManCom.
import { InfTipCom   } from '../../ui/info-tip.jsx';               // What: Info Tip Component. Why: A disabled add control still needs to explain why it can't be clicked while a mini-tour checklist is in progress. How: This wraps the disabled add button in RemManCom.
import { ONB_CHE_OBJ } from '../../state/onboarding-checklist.js'; // What: Onboarding Checklist Object. Why: Adding a reminder must stay disabled while any onboarding tutorial is still in progress. How: This is read via its own tutProFun helper in RemManCom.
import { redMotFun   } from '../../utils/motion.js';               // What: Reduce Motion Function. Why: A user who prefers reduced motion should get an instant close or remove instead of a timed animation. How: This is checked before every staged animation in RemManCom.
import { SchEdiCom   } from '../../ui/schedule-editor.jsx';        // What: Schedule Editor Component. Why: A reminder's own name, repeat, and schedule fields are edited with one shared editor. How: This is rendered for the add form and each open reminder.
import { sorEntFun   } from './list-sorting.js';                   // What: Sort Entries Function. Why: The Data tab's reminder list needs the exact same sort vocabulary as the rest of the Data tab. How: This is called once per comparison inside RemManCom's own sorTasArr sort.
import { SorSelCom   } from './sort-select.jsx';                   // What: Sort Select Component. Why: The Data tab's reminder Items list needs the same sort control as every other Data tab list. How: This is rendered in RemManCom, driven by ITE_SOR_ARR.
import { TAS_NAM_OBJ } from '../../core/tasks.js';                 // What: Tasks Namespace Object. Why: Every reminder's own summary, next date, and default shape defer to the reminders engine instead of duplicating its logic. How: This namespace object is called throughout RemManCom.

// #endregion Imports



/**
 * reminders-manager.jsx = Reminders Manager
 *
 * @summary
 * The Data tab's own Reminders section: RemManCom lists every reminder as a
 * collapsible, sortable row (ITE_SOR_ARR holds its sort options) whose body is
 * the shared schedule editor, with an add form above the list. OptMatCom is
 * the section's own Controls body, the participation matrix of global reminder
 * settings (one row per REM_MAT_ARR entry, whose sub-explanations paiSubFun
 * builds), with its own Cancel/Save.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

// #region ITE_SOR_ARR

/**
 * ITE_SOR_ARR = Item Sort Array
 *
 * @summary
 * Item-list sort options for the Data tab's Reminders section,
 * extrapolated from the same vocabulary as the Data tab's own
 * section/item sorts (see sorEntFun in list-sorting.js). Reminders
 * have no per-item Active/Inactive concept (no enabled/disabled
 * toggle, only a schedule and a today's-completion state, which isn't
 * the same thing) and no Group, so only Name and Type (One-time vs
 * Recurring) apply besides Date, the reminder's own next eligible
 * occurrence (TAS_NAM_OBJ.nexEliFun), the same date a Skip confirm
 * already computes elsewhere in this file. Labeled Soonest/Latest
 * rather than "Low to High"/"High to Low" like the numeric sorts
 * elsewhere, matching the app's own wording for date proximity (e.g.
 * the ease editor's Soonest/Latest). A reminder with no next
 * occurrence at all (rare, effectively stale, normally purged before
 * it'd ever be seen here) is a genuinely missing value, not an
 * irrelevant field the way Range/Odds/Boost are for a conditional
 * whose mode doesn't use them, so it uses sorEntFun's ordinary
 * top/bottom-by-direction N/A placement rather than always-last.
 *
 * Every entry shares one shape. Each row's own comment explains its
 * `keyStr`, while `labStr` repeats no comment of its own:
 *
 * - `keyStr` (String): Key String, the sort id SorSelCom compares
 *   against iteSorStr and reports via onChange.
 *
 * - `labStr` (String): Label String, the option's own visible menu
 *   text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const ITE_SOR_ARR = [ // What: Item Sort Array. Why: RemManCom's own Items list sort control needs one entry per supported sort. How: This is passed as SorSelCom's own options prop from RemManCom below.


	{ keyStr : 'name-asc',  labStr : 'Name (A–Z)' }, // What: Key String. Why: This is the section's own default sort. How: SorSelCom compares this against iteSorStr and reports it via onChange.
	{ keyStr : 'name-desc', labStr : 'Name (Z–A)' }, // What: Key String. Why: This is the reverse of the default sort. How: SorSelCom compares this against iteSorStr and reports it via onChange.
	{ keyStr : 'type-asc',  labStr : 'Type (A–Z)' }, // What: Key String. Why: Type (One-time vs Recurring) is the only other text-like field reminders have. How: SorSelCom compares this against iteSorStr and reports it via onChange.
	{ keyStr : 'type-desc', labStr : 'Type (Z–A)' }, // What: Key String. Why: This is the reverse of the type sort. How: SorSelCom compares this against iteSorStr and reports it via onChange.
	{ keyStr : 'date-asc',  labStr : 'Soonest'    }, // What: Key String. Why: Date sorts by each reminder's own next eligible occurrence. How: SorSelCom compares this against iteSorStr and reports it via onChange.
	{ keyStr : 'date-desc', labStr : 'Latest'     }  // What: Key String. Why: This is the reverse of the date sort. How: SorSelCom compares this against iteSorStr and reports it via onChange.


];

// #endregion ITE_SOR_ARR

// #endregion Constants



// #region Helpers

// #region paiSubFun

/**
 * paiSubFun = Pair Sub Function
 *
 * @summary
 * Data tab: full reminder management. Builds the dynamic
 * sub-explanation for a paired one-time/recurring toggle row, so it
 * always reflects which of the 2 types the setting actually applies
 * to right now.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param verTexStr - Version Text String: The trailing clause naming what the
 *                    setting does, e.g. 'trigger the day streak in the Today
 *                    page'.
 * @param neiConStr - Neither Conjunction String: The conjunction used in the
 *                    neither-selected phrasing, defaulting to 'and' ('nor'
 *                    reads better for a negatively-phrased verb).
 *
 * @returns A function of (oncEnaBoo, reuEnaBoo) that renders the correct
 * one of the 4 mutually-exclusive sub-explanation phrases.
 *
 * @example
 * ```ts
 * paiSubFun(verTexStr, neiConStr) // => (oncEnaBoo, reuEnaBoo) => <>...</>
 * ```
 *
*/

function paiSubFun ( verTexStr, neiConStr = 'and' ) {


	return ( oncEnaBoo, reuEnaBoo ) => ( // What: Pair Sub Return. Why: The caller (each REM_MAT_ARR entry's own dynFun) needs a function it can call with the live once/recurring toggle states. How: This renders one of the 4 mutually-exclusive phrases below.


		oncEnaBoo && reuEnaBoo // What: Both Check. Why: The phrase depends on which of the two classes has the setting on. How: This tests both flags first.
			? <><strong>both</strong> one-time and recurring items will { verTexStr }</>              // What: Both Phrase. Why: Both classes have this setting on. How: This names both item kinds.
			: oncEnaBoo                                                                               // What: Once-Only Check. Why: Only one class may have the setting on. How: This tests the one-time flag next.
			? <><strong>only</strong> one-time items will { verTexStr }</>                            // What: Once-Only Phrase. Why: Only the one-time class has this setting on. How: This names only one-time items.
			: reuEnaBoo                                                                               // What: Recurring-Only Check. Why: The recurring class may be the only one on. How: This tests the recurring flag last.
			? <><strong>only</strong> recurring items will { verTexStr }</>                           // What: Recurring-Only Phrase. Why: Only the recurring class has this setting on. How: This names only recurring items.
			: <><strong>neither</strong> one-time { neiConStr } recurring items will { verTexStr }</> // What: Neither Phrase. Why: Neither class has this setting on. How: This names neither item kind, joined by neiConStr.


	);


}

// #endregion paiSubFun



// #region REM_MAT_ARR

/**
 * REM_MAT_ARR = Reminder Matrix Array
 *
 * @summary
 * Every entry below shares this exact shape, mapped over in OptMatCom's
 * own JSX to render one participation-matrix row per entry; none of
 * the 5 entries repeat these same fields' own boilerplate comments on
 * their own lines (see the "Repeated-shape object literals" comment
 * exception in CLAUDE.md). Each entry's own leading comment instead
 * just names which specific setting it represents.
 *
 * - `dynFun` (Function): Dynamic Function is the row's own live
 *   sub-explanation, called by OptMatCom with the once/recurring
 *   classes' own current on/off state and returning the JSX phrase to
 *   render; every entry below builds this via paiSubFun, except the
 *   last, which is written out directly for its own documented reason.
 *
 * - `keyStr` (String): Key String ties this row to its own field on
 *   optObj[class], read and written by OptMatCom throughout.
 *
 * - `labStr` (String): Label String is the row's own visible setting
 *   name, rendered by OptMatCom as the row's own leading text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const REM_MAT_ARR = [ // What: Reminder Matrix Array. Why: OptMatCom needs one row per participation setting, each pivoted across the once/recurring classes. How: This is mapped over in OptMatCom's JSX to render one matrix row per entry.


	{ // What: Streak Row Entry. Why: Whether a class counts toward the Today page's own day streak is its own independent participation setting. How: This entry's own dynFun explains which classes currently count.


		dynFun : paiSubFun( 'trigger the day streak in the Today page', 'nor' ),
		keyStr : 'streak',
		labStr : 'Counts toward day streak'


	},

	{ // What: Ring Row Entry. Why: Whether a class counts toward the Today page's own completion ring is its own independent participation setting. How: This entry's own dynFun explains which classes currently count.


		dynFun : paiSubFun( 'trigger the completion ring in the Today page', 'nor' ),
		keyStr : 'ring',
		labStr : 'Include in completion ring'


	},

	{ // What: Exclude Weekends Row Entry. Why: Whether a class is excluded from the Today page on weekends is its own independent participation setting. How: This entry's own dynFun explains which classes are currently excluded.


		dynFun : paiSubFun( 'show in the Today page on weekends', 'nor' ),
		keyStr : 'excludeWeekends',
		labStr : 'Exclude on weekends'


	},

	{ // What: Exclude Holidays Row Entry. Why: Whether a class is excluded from the Today page on holidays is its own independent participation setting. How: This entry's own dynFun explains which classes are currently excluded.


		dynFun : paiSubFun( 'show in the Today page on holidays', 'nor' ),
		keyStr : 'excludeHolidays',
		labStr : 'Exclude on holidays'


	},

	{ // What: Stats Row Entry. Why: Whether a class's own statistics show in the Stats page is its own independent participation setting. How: This entry's own dynFun (written directly, not via paiSubFun) explains which classes currently show.


		keyStr : 'stats',
		labStr : 'Include in Stats',

		dynFun : ( oncEnaBoo, reuEnaBoo ) => ( // What: Dynamic Function. Why: This row's own sub-explanation needs custom wording ("statistics") rather than paiSubFun's own generic verb phrasing, so it's written out directly instead of reusing paiSubFun. How: OptMatCom calls this with the live once/recurring toggle states.


			oncEnaBoo && reuEnaBoo // What: Both Check. Why: The phrase depends on which of the two classes shows statistics. How: This tests both flags first.
				? <><strong>both</strong> one-time and recurring item statistics will be shown in the Stats page</>    // What: Both Phrase. Why: Both classes show statistics. How: This names both item kinds.
				: oncEnaBoo                                                                                            // What: Once-Only Check. Why: Only one class may show statistics. How: This tests the one-time flag next.
				? <><strong>only</strong> one-time item statistics will be shown in the Stats page</>                  // What: Once-Only Phrase. Why: Only one-time statistics show. How: This names only one-time items.
				: reuEnaBoo                                                                                            // What: Recurring-Only Check. Why: The recurring class may be the only one shown. How: This tests the recurring flag last.
				? <><strong>only</strong> recurring item statistics will be shown in the Stats page</>                 // What: Recurring-Only Phrase. Why: Only recurring statistics show. How: This names only recurring items.
				: <><strong>neither</strong> one-time nor recurring item statistics will be shown in the Stats page</> // What: Neither Phrase. Why: Neither class shows statistics. How: This names neither item kind.


		)


	}


];

// #endregion REM_MAT_ARR

// #endregion Helpers



// #region Components

// #region OptMatCom

/**
 * OptMatCom = Options Matrix Component
 *
 * @summary
 * Data tab: the Reminders Controls body, the participation matrix.
 * Rendered only while the Controls disclosure is open, so it snapshots
 * the options on mount; Cancel reverts every toggle changed since
 * opening, Save keeps them. Mirrors the picker Controls' own
 * Cancel/Save (no Delete, since these are global settings).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj   - Action Store Object: The shared actions bag.
 * @param props.onCloConFun - On Close Control Function: Collapses this
 *                            Controls body, called by both Cancel and Save.
 * @param props.remOptObj   - Reminder Option Object: The live { once,
 *                            recurring } participation options object.
 *
 * @returns The full participation matrix: its head row, one row per
 * REM_MAT_ARR entry, and its own Cancel/Save foot.
 *
 * @example
 * ```tsx
 * OptMatCom({ actStoObj, onCloConFun, remOptObj }) // => <OptMatCom />
 * ```
 *
*/

function OptMatCom ( { actStoObj, onCloConFun, remOptObj } ) {


	const snaOptRef = React.useRef( { once : { ...remOptObj.once }, recurring : { ...remOptObj.recurring } } ); // What: Snapshot Options Reference. Why: Cancel needs to restore every toggle exactly as it was when this component mounted. How: This shallow-copies both classes of remOptObj once, on mount, never updated afterward.

	const canMatFun = () => { // What: Cancel Matrix Function. Why: An explicit Cancel needs to both restore the snapshot and collapse the body. How: This calls actStoObj.revOptFun with snaOptRef's own snapshot, then onCloConFun.


		actStoObj.revOptFun( snaOptRef.current ); // What: Options Revert Call. Why: Cancel restores every toggle to its mount-time state. How: This passes the snapshot to revOptFun.

		onCloConFun(); // What: Controls Close Call. Why: A cancelled matrix has nothing left to show. How: This collapses the Controls body.


	};



	return (


		<div className='rd-matrix'>{ /* What: Matrix Div Element. Why: This is OptMatCom's own root element. How: This renders the head row, one row per REM_MAT_ARR entry, and the foot below. */ }


			<div className='rd-mx-head'>{ /* What: Matrix Head Div Element. Why: The 2 column labels need their own header row above the data rows. How: This renders an empty leading cell (aligning with each row's own name column) plus the 2 column-label spans. */ }


				<span></span>{ /* What: Matrix Head Spacer Span Element. Why: This aligns the head row's own 2 column labels under the data rows' own switch cells, leaving the name column's own header cell blank. How: This renders an empty span. */ }

				<span className='rd-mx-col'>One-time</span>{ /* What: Matrix Col Span Element. Why: This labels the first switch column. How: This renders the literal text "One-time". */ }

				<span className='rd-mx-col'>Recurring</span>{ /* What: Matrix Col Span Element. Why: This labels the second switch column. How: This renders the literal text "Recurring". */ }


			</div>

			{ REM_MAT_ARR.map( ( optDefObj ) => ( // What: Matrix Row List Render. Why: One row is needed per participation setting. How: This maps REM_MAT_ARR to one row div per entry, keyed by its own key.


				<div
					key={ optDefObj.keyStr }

					className='rd-mx-row'
				>{ /* What: Matrix Row Div Element. Why: One setting's own name/sub-explanation and both switch cells need to sit together as one row. How: This renders the name span, then maps the 2 classes into their own switch cells below. */ }


					<span className='rd-mx-name'>{ /* What: Matrix Name Span Element. Why: The plain label and its own live sub-explanation read together as one unit. How: This renders optDefObj's own label, then its dynFun's live result. */ }


						{ optDefObj.labStr }{ /* What: Matrix Name Render. Why: This is the row's own plain, static setting name. How: This renders optDefObj's own labStr directly as text. */ }

						<span
							key={ ( remOptObj.once[ optDefObj.keyStr ] ? 1 : 0 ) + '' + ( remOptObj.recurring[ optDefObj.keyStr ] ? 1 : 0 ) } // What: Toggle State Key. Why: The explanation should re-fade only when either class's toggle for this row flips. How: This joins the two toggle states into one key.

							className='rd-mx-sub set-sub-fade'
						>{ optDefObj.dynFun( !!remOptObj.once[ optDefObj.keyStr ], !!remOptObj.recurring[ optDefObj.keyStr ] ) }</span>{ /* What: Dynamic Sub Span Element. Why: Every row needs its own live, re-fading explanation. How: This re-keys on the combined once/recurring toggle state and calls optDefObj's own dynFun. */ }


					</span>

					{ [ 'once', 'recurring' ].map( ( tasClaStr ) => { // What: Switch Cell List Render. Why: Every row needs exactly 2 switch cells, one per participation class. How: This maps the 2 literal class keys to one switch cell each.


						const swtEnaBoo = !!remOptObj[ tasClaStr ][ optDefObj.keyStr ]; // What: Switch Enabled Boolean. Why: Each cell's own switch needs to know whether this specific class/setting pair is currently on. How: This reads remOptObj indexed first by tasClaStr, then by optDefObj's own keyStr.



						return (


							<span
								key={ tasClaStr }

								className='rd-mx-cell'
							>{ /* What: Matrix Cell Span Element. Why: Each switch needs its own cell wrapper for layout. How: This wraps the single switch button below. */ }


								<button
									className={ ` switch   ${ swtEnaBoo ? 'is-on' : '' } ` }

									data-element-name-hook='togSwiBut'

									aria-label={ `${ tasClaStr === 'once' ? 'One-time' : 'Recurring' }: ${ optDefObj.labStr }` } // What: Switch Label Pick. Why: Each switch's accessible name must say which class and setting it controls. How: This joins the class name with the row's own label.
									aria-pressed={ swtEnaBoo }

									onClick={ () => actStoObj.setOptFun( tasClaStr, optDefObj.keyStr, !swtEnaBoo ) }
								>{ /* What: Switch Button Element. Why: This is the actual toggle for this class/setting pair. How: This flips swtEnaBoo via actStoObj.setOptFun. Its data-element-name-hook is read by help mode's Today catalog. */ }


									<i />{ /* What: Switch Thumb Element. Why: The switch's own CSS-driven thumb needs a real (if empty) element to animate. How: This renders an empty, purely decorative i element. */ }


								</button>


							</span>


						);


					} ) }


				</div>


			) ) }


			<div className='rd-mx-foot'>{ /* What: Matrix Foot Div Element. Why: The Cancel/Save actions need their own row below every matrix row. How: This wraps the rem-foot-right div below. */ }


				<div className='rem-foot-right'>{ /* What: Foot Right Div Element. Why: Cancel and Save read as a pair, right-aligned. How: This wraps both ButBasCom elements below. */ }


					<ButBasCom
						kinValStr='ghost'
						sizValStr='sm'

						onClick={ canMatFun }
					>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This reverts every toggle changed since this component mounted. How: This calls canMatFun. */ }



					<ButBasCom
						kinValStr='ghost'
						sizValStr='sm'

						onClick={ onCloConFun }
					>Save</ButBasCom>{ /* What: Button Base Component. Why: This just collapses the body, keeping every toggle as-is (they already committed live, on each individual click). How: This calls onCloConFun directly. */ }


				</div>


			</div>


		</div>


	);


}

// #endregion OptMatCom



// #region RemManCom

/**
 * RemManCom = Reminder Manager Component
 *
 * @summary
 * The Data tab's full reminder management: a collapsible category holding the
 * participation Controls (OptMatCom) and the sortable Items list, where each
 * row expands into the same schedule editor and footer Today uses, committing
 * straight to the store. Rendered by tab-data.jsx.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj - Action Store Object: The shared app actions that
 *                          mutate props.staAppObj.
 * @param props.staAppObj - State App Object: The entire app's own persisted
 *                          state.
 *
 * @returns The Reminders category: its header, the Controls
 * disclosure (OptMatCom), and the Items disclosure (one row per
 * reminder, expanding into SchEdiCom plus EdiFooCom).
 *
 * @example
 * ```tsx
 * RemManCom({ actStoObj, staAppObj }) // => <RemManCom />
 * ```
 *
*/

function RemManCom ( { actStoObj, staAppObj } ) {


	// #region Open Row Tracking

	const [ opeIdeStr, setOpeIdeStr ] = React.useState( null ); // What: Open Identifier String And Setter. Why: This tracks which reminder's own row is currently expanded into its editor. How: This is compared against each row's own id throughout the render below.
	const [ insIdeStr, setInsIdeStr ] = React.useState( null ); // What: Insert Identifier String And Setter. Why: A just-inserted reminder row needs to play its own slide-in entrance exactly once. How: This is set right when a row is created or an editor closes, cleared on that row's own animation end.

	const newAddRef = React.useRef( null ); // What: New Added Reference. Why: A reminder just created via "New reminder" hasn't been kept yet; Cancel on such an item discards the whole add (removes it) rather than reverting to an empty snapshot. How: This holds that reminder's own id until it's kept, cleared by kepCloFun.
	const opeEdiRef = React.useRef( null ); // What: Open Editor Reference. Why: The currently-open reminder's own EdiFooCom instance needs to be reachable from outside itself, so the row's own collapse chevron can call its kepFun before closing. How: This is attached only to the currently-open row's own EdiFooCom, via its ref prop below.
	const froIndRef = React.useRef( null ); // What: Frozen Index Reference. Why: freEdiFun needs a place to remember whichever reminder's own render position is currently frozen. How: This is passed straight through to freEdiFun below.
	const preOpeRef = React.useRef( null ); // What: Previous Open Reference. Why: The effect right below needs opeIdeStr's own PRIOR value to detect a genuine close, not just its current value. How: This is read and overwritten at the end of that same effect.
	const opeRowRef = React.useRef( null ); // What: Open Row Reference. Why: A brand-new reminder's own "+ New reminder" click needs to scroll the resulting form into view, since it opens pinned below the sort control rather than guaranteed to already be on-screen. How: This is attached only to the currently-open row's own DOM node, via its ref prop below.
	const focInpRef = React.useRef( null ); // What: Focus Input Reference. Why: The open row's own name input focuses itself via a ref callback below instead of plain autoFocus, suppressing the browser's own instant focus-scroll so it doesn't fight the deliberate smooth scroll above. How: This is attached via that input's own ref callback in the render below.


	React.useEffect( () => { // What: Replay Insert Effect. Why: Whichever reminder's own editor just closed (Done, Cancel-revert, delete, or the row's own collapse chevron) should replay the insert entrance once it settles into its (possibly new, now-unfrozen) sorted position, instead of silently snapping there. How: This detects an opeIdeStr transition away from a real id, then stages that id as insIdeStr.


		const preOpeStr = preOpeRef.current; // What: Previous Open String. Why: This is compared against opeIdeStr below to detect the exact close transition. How: This reads preOpeRef's own remembered prior value.

		if ( preOpeStr != null && preOpeStr !== opeIdeStr ) setInsIdeStr( preOpeStr ); // What: Close Transition Guard. Why: Only a genuine "was open, now isn't (or moved to a different row)" transition should replay the insert entrance. How: This stages preOpeStr as insIdeStr only when both conditions hold.



		preOpeRef.current = opeIdeStr; // What: Previous Open Snapshot Update. Why: The next run of this effect needs to compare against whatever opeIdeStr is right now. How: This overwrites preOpeRef with opeIdeStr's own current value.


	}, [ opeIdeStr ] ); // What: Effect Dependency Array. Why: This effect only needs to re-run when opeIdeStr itself changes, since that's the exact transition it watches for. How: opeIdeStr is compared against preOpeRef's own remembered prior value every run.


	React.useEffect( () => { // What: Scroll Into View Effect. Why: Only a BRAND-NEW reminder's own editor opening should auto-scroll; reopening an existing reminder's editor should not yank the viewport. How: This guards on newAddRef still matching opeIdeStr, then scrolls opeRowRef's own current node into view, waiting for the ColDisCom open animation to finish first (unless reduced motion).


		if ( !opeIdeStr || newAddRef.current !== opeIdeStr || !opeRowRef.current ) return; // What: Not-A-New-Open Guard. Why: Every other case (no row open, a re-opened existing row, or the ref not yet attached) should do nothing at all. How: This bails out unless all 3 conditions hold.



		const rowCurEle = opeRowRef.current; // What: Row Current Element. Why: This gives a stable local reference to the live row DOM node for this scroll pass. How: This is read once from opeRowRef.current and reused below.



		if ( redMotFun() ) { rowCurEle.scrollIntoView( { behavior : 'auto', block : 'nearest' } ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should get an instant scroll instead of a smooth, timed one. How: This scrolls instantly and returns early when redMotFun reports true.



		const scrTimNum = setTimeout( () => rowCurEle.scrollIntoView( { behavior : 'smooth', block : 'nearest' } ), 300 ); // What: Scroll Timeout Number. Why: The ColDisCom open animation (.26s, see .collapse in styles2.css) needs to finish growing the editor below the row header before scrolling, or the scroll target would still be moving. How: This waits 300ms, then scrolls smoothly.



		return () => clearTimeout( scrTimNum ); // What: Effect Cleanup Return. Why: A pending scroll must not fire after this effect re-runs or the component unmounts. How: This clears scrTimNum.


	}, [ opeIdeStr ] ); // What: Effect Dependency Array. Why: This effect only needs to re-run when opeIdeStr itself changes, since that's the exact condition its own guard checks. How: opeIdeStr is read directly inside the effect body above.

	// #endregion Open Row Tracking



	// #region Items List Order

	const visTasArr = ( staAppObj.tasks || [] ).filter( ( curTasObj ) => !curTasObj.hidden );                     // What: Visible Task Array. Why: A hidden (mini-tour-linked) task must never appear in this real management list. How: This filters staAppObj's own tasks by their own hidden flag.
	const iteSorStr = ( staAppObj.ui && staAppObj.ui.dataSort && staAppObj.ui.dataSort.reminders ) || 'name-asc'; // What: Item Sort String. Why: The Items list's own sort needs a persisted, defaulted value to drive both the sort control and the comparator below. How: This reads staAppObj's own ui.dataSort.reminders, falling back to 'name-asc'.


	const tasDatMap = new Map( visTasArr.map( ( curTasObj ) => { // What: Task Date Map. Why: TAS_NAM_OBJ.nexEliFun can walk up to ~3 years of days per call; computing every task's own next date once up front (rather than inside the comparator below, which runs it on every comparison) avoids doing that work redundantly. How: This maps each visible task to a [id, time] pair.


		const nexEliObj = TAS_NAM_OBJ.nexEliFun( curTasObj, staAppObj.reminderOpts, staAppObj.holidays ); // What: Next Eligible Object. Why: This is the actual date sorEntFun sorts by for the date-asc/date-desc options. How: This calls TAS_NAM_OBJ.nexEliFun against curTasObj.



		return [ curTasObj.id, nexEliObj ? nexEliObj.getTime() : null ]; // What: Task Date Pair Return. Why: A Map needs a real, comparable numeric time (or null for "no next occurrence"), not a Date instance. How: This pairs curTasObj's own id with nexEliObj's own getTime(), or null when there's no next occurrence at all.


	} ) );


	const sorTasArr = [ ...visTasArr ].sort( ( tasOneObj, tasTwoObj ) => sorEntFun( // What: Sorted Task Array. Why: This is the Items list's own actual render order. How: This sorts a copy of visTasArr via sorEntFun, fed each side's own name/type/date shape and iteSorStr.


		{ // What: Row One Object. Why: sorEntFun needs a comparable shape for the left-hand side of this comparison. How: This builds it from tasOneObj, with every field this shape doesn't use left null.


			count    : null,                                                         // What: Count. Why: A reminder has no meaningful count field. How: This is always null for a reminder row.
			date     : tasDatMap.get( tasOneObj.id ),                                // What: Date. Why: This is the field sorEntFun sorts by for the date-asc/date-desc options. How: This looks up tasOneObj's own precomputed next-eligible time from tasDatMap.
			group    : null,                                                         // What: Group. Why: A reminder has no meaningful group field. How: This is always null for a reminder row.
			isActive : null,                                                         // What: Is Active. Why: A reminder has no meaningful active-state field. How: This is always null for a reminder row.
			name     : tasOneObj.name,                                               // What: Name. Why: This is the field sorEntFun sorts by for the name-asc/name-desc options, and the tie-break for every other sort. How: This reads tasOneObj's own name.
			type     : TAS_NAM_OBJ.isaReuFun( tasOneObj ) ? 'Recurring' : 'One-time' // What: Type. Why: This is the field sorEntFun sorts by for the type-asc/type-desc options. How: This picks the word based on TAS_NAM_OBJ.isaReuFun.


		},

		{ // What: Row Two Object. Why: sorEntFun needs a comparable shape for the right-hand side of this comparison. How: This builds it from tasTwoObj, mirroring Row One Object's own shape.


			count    : null,                                                         // What: Count. Why: A reminder has no meaningful count field. How: This is always null for a reminder row.
			date     : tasDatMap.get( tasTwoObj.id ),                                // What: Date. Why: This is the field sorEntFun sorts by for the date-asc/date-desc options. How: This looks up tasTwoObj's own precomputed next-eligible time from tasDatMap.
			group    : null,                                                         // What: Group. Why: A reminder has no meaningful group field. How: This is always null for a reminder row.
			isActive : null,                                                         // What: Is Active. Why: A reminder has no meaningful active-state field. How: This is always null for a reminder row.
			name     : tasTwoObj.name,                                               // What: Name. Why: This is the field sorEntFun sorts by for the name-asc/name-desc options, and the tie-break for every other sort. How: This reads tasTwoObj's own name.
			type     : TAS_NAM_OBJ.isaReuFun( tasTwoObj ) ? 'Recurring' : 'One-time' // What: Type. Why: This is the field sorEntFun sorts by for the type-asc/type-desc options. How: This picks the word based on TAS_NAM_OBJ.isaReuFun.


		},

		iteSorStr


	) );


	const disTasArr = freEdiFun( sorTasArr, opeIdeStr, newAddRef.current, froIndRef ); // What: Display Task Array. Why: The open editor's own row must not visibly reorder out from under it as its own fields change. How: This calls freEdiFun against sorTasArr, opeIdeStr, and newAddRef's own current value.

	// #endregion Items List Order



	// #region Category State

	const colMaiMap = ( staAppObj.ui && staAppObj.ui.controlsCollapsed ) || {}; // What: Collapsed Main Map. Why: The main section's own collapse state persists (like the pickers), so it survives tab switches. How: This reads staAppObj's own ui.controlsCollapsed, falling back to an empty object.
	const secOpeBoo = colMaiMap[ '__reminders_main' ] === false;                // What: Section Open Boolean. Why: This reserved key defaults COLLAPSED, so absent means collapsed and an explicit false means expanded. How: This checks colMaiMap's own '__reminders_main' entry against exactly false.
	const togMaiFun = () => actStoObj.togColFun( '__reminders_main', true );    // What: Toggle Main Function. Why: The header's own clickable area needs a single call to flip the main section's own collapse staAppObj. How: This calls actStoObj.togColFun against the same reserved key.

	const colSubMap = ( staAppObj.ui && staAppObj.ui.controlsCollapsed ) || {}; // What: Collapsed Sub Map. Why: The Controls and Items sub-panels each remember their own collapse state independently of the main section and of each other. How: This reads the same staAppObj's own ui.controlsCollapsed, kept as a separate read for its own 2 sub-keys below.
	const conColBoo = !!colSubMap[ '__reminders' ];                             // What: Controls Collapsed Boolean. Why: The Controls disclosure defaults OPEN, so absent means open. How: This checks colSubMap's own '__reminders' entry.
	const iteColBoo = !!colSubMap[ '__reminders:items' ];                       // What: Items Collapsed Boolean. Why: The Items disclosure likewise defaults open. How: This checks colSubMap's own '__reminders:items' entry.

	const norOptObj = TAS_NAM_OBJ.norOptFun( staAppObj.reminderOpts ); // What: Normalized Options Object. Why: OptMatCom needs a fully-shaped { once, recurring } object even from an older or partial saved staAppObj. How: This calls TAS_NAM_OBJ.norOptFun against staAppObj's own reminderOpts.
	const tutProBoo = ONB_CHE_OBJ.tutProFun( staAppObj );              // What: Tutorial Progress Boolean. Why: "New reminder" is a second, independent path to a real reminder, reachable from this page, and must stay disabled during any onboarding tutorial the same way RemSecCom's own add button does. How: This calls ONB_CHE_OBJ.tutProFun against staAppObj.

	// #endregion Category State



	// #region Row Actions

	const kepCloFun = ( tasIdeStr ) => { // What: Keep Close Function. Why: The row's own collapse chevron AND EdiFooCom's own Save mean "keep this, I'm done", and both need the exact same cleanup so the chevron can't drift out of sync with what Save already does. How: This calls the open editor's own kepFun, clears the new-item flag, and closes only if this row is still the open one.


		opeEdiRef.current?.kepFun(); // What: Keep Call. Why: EdiFooCom's own committed-edit lifecycle (the "keep" side of the mount-time snapshot it takes) must run before this row is allowed to close. How: This optionally chains onto opeEdiRef's own current ref, since it may be unmounted already.

		if ( newAddRef.current === tasIdeStr ) newAddRef.current = null; // What: New-Item Flag Clear Guard. Why: Once kept, a brand-new reminder is no longer "new" for isaNewBoo's own purposes. How: This clears newAddRef only while it still matches tasIdeStr.



		setOpeIdeStr( ( curOpeStr ) => curOpeStr === tasIdeStr ? null : curOpeStr ); // What: Open Row Close Call. Why: This is the actual collapse, closing the row only while it's still this exact one that was open. How: This clears opeIdeStr only while it still matches tasIdeStr.


	};


	const addEdiFun = () => { // What: Add Edit Function. Why: "New reminder" needs to create a real, minimal reminder AND immediately open its own editor, ensuring both the main section and the Items disclosure are expanded to actually show it. How: This mints a fresh id, adds the task, stages every relevant "just added"/open/insert flag, and expands whichever section is currently collapsed.


		if ( newAddRef.current ) return; // What: Guard: Ignore Rapid Double-Click. Why: A second "New reminder" click while the first add hasn't been kept yet would spawn a stray extra reminder. How: This bails out while newAddRef already holds an id.



		const newIdeStr = 'tk_' + Math.random().toString( 36 ).slice( 2, 8 ); // What: New Identifier String. Why: The freshly-created reminder needs a real, unique id before actStoObj.addTasFun is ever called. How: This mints a random 'tk_'-prefixed id, the same scheme TAS_NAM_OBJ.defTasFun itself uses.


		actStoObj.addTasFun( { id : newIdeStr, name : 'New reminder', repeat : 'once' } ); // What: Add Task Call. Why: This is the actual creation of the new, minimal reminder. How: This calls actStoObj.addTasFun with newIdeStr, a placeholder name, and a plain 'once' repeat.

		newAddRef.current = newIdeStr; // What: New-Item Flag Set. Why: The freshly-created row needs to know it's "new" for its own isaNewBoo prop and for kepCloFun's own guard above. How: This sets newAddRef to newIdeStr.

		setInsIdeStr( newIdeStr ); // What: Insert Identifier Stage Call. Why: The new row needs to play its own entrance animation exactly once. How: This sets insIdeStr to newIdeStr.
		setOpeIdeStr( newIdeStr ); // What: Open Row Stage Call. Why: The new reminder's own editor should open immediately so the user can fill it in. How: This sets opeIdeStr to newIdeStr.

		if ( !secOpeBoo ) actStoObj.togColFun( '__reminders_main', true ); // What: Main Section Expand Guard. Why: The newly-open editor must actually be visible, which requires the main section itself to be expanded. How: This expands the main section only while it was collapsed.


	};

	// #endregion Row Actions



	return (


		<section
			className='cat cat--reminders cat--enter'

			data-element-name-hook='datCatSec remCatSec'
		>{ /* What: Category Section Element. Why: This is RemManCom's own root element, matching every other Data tab category's own outer landmark. How: This renders the header, then the ColDisCom-wrapped body below. Its data-element-name-hook is read by the App Features tours and the Data page tour. */ }


			<header className='cat-h'>{ /* What: Category Header Element. Why: The whole header is one clickable disclosure toggling the main section. How: This wraps the single toggle button below. */ }


				<button
					className='cat-h-l'

					data-element-name-hook='catHeaBut'

					type='button'

					aria-expanded={ secOpeBoo }

					onClick={ togMaiFun }
				>{ /* What: Category Header Button Element. Why: This is the actual clickable disclosure control for the whole category. How: This toggles secOpeBoo via togMaiFun. Its data-element-name-hook is read by the App Features tours. */ }


					<span className={ ` chev   ${ secOpeBoo ? 'is-open' : '' } ` }>{ /* What: Chevron Span Element. Why: The chevron's own rotation communicates the disclosure's open/closed staAppObj. How: This marks itself is-open while secOpeBoo is true. */ }


						<IcoSvgCom
							icoNamStr='chvEle'
							sizValNum={ 14 }
						/>{ /* What: Icon Svg Component. Why: A chevron glyph gives the whole section's own disclosure a recognizable, rotating open/closed affordance. How: This renders the 'chvEle' icon at a small 14px size. */ }


					</span>

					<span className='cat-h-main'>{ /* What: Category Header Main Span Element. Why: The name and count read together as one unit, distinct from the chevron beside them. How: This wraps the heading and the count span below. */ }


						<h2 className='cat-name'>Reminders</h2>{ /* What: Category Name Heading Element. Why: This is the category's own fixed title. How: This renders the literal text "Reminders". */ }

						<span className='cat-count'>{ /* What: Category Count Span Element. Why: Reminders have no active/inactive concept yet (unlike pickers' eligible-of-total and Conditionals' active-of-total), so both numbers are the same for now, kept in this "N of N" shape for visual consistency and in case that changes later. How: This wraps 2 identical count spans and the literal word "of" between them. */ }


							<span className='cat-count-n'>{ visTasArr.length }</span>{ /* What: Category Count Number Span Element. Why: Reminders have no active/inactive split yet, so this same number stands in for both halves of the "N of N" shape. How: This renders visTasArr's own length. */ }

							<span className='cat-count-of'>of</span>{ /* What: Category Count Of Span Element. Why: This joins the two count numbers into one readable "N of N" phrase. How: This renders the literal text "of". */ }

							<span className='cat-count-n'>{ visTasArr.length }</span>{ /* What: Category Count Number Span Element. Why: See the leading count span's own comment above; this is its mirrored second half. How: This renders visTasArr's own length again. */ }


						</span>


					</span>


				</button>


			</header>



			<ColDisCom open={ secOpeBoo }>{ /* What: Collapse Disclosure Component. Why: The entire body below only exists while the category itself is expanded. How: This animates cat-body open/closed based on secOpeBoo. */ }


				<div
					className='cat-body'

					data-element-name-hook='catBodDiv'
				>{ /* What: Category Body Div Element. Why: The Controls and Items disclosures need to sit together as one scrollable body. How: This renders both disclosure toggles and their own ColDisCom-wrapped content below. Its data-element-name-hook is read by the App Features tours. */ }


					<button
						className='rd-ctl'

						data-element-name-hook='catTogBut'

						type='button'

						aria-expanded={ !conColBoo }

						onClick={ () => actStoObj.togColFun( '__reminders' ) }
					>{ /* What: Controls Disclosure Button Element. Why: Controls is a nested collapsible, open by default, remembered per section. How: This toggles conColBoo via actStoObj.togColFun. Its data-element-name-hook is read by the App Features tours. */ }


						<span className='rd-ctl-l'>{ /* What: Controls Left Span Element. Why: The chevron and the "Controls" kicker read together as one unit. How: This wraps both below. */ }


							<span className={ ` chev   ${ conColBoo ? '' : 'is-open' } ` }>{ /* What: Chevron Span Element. Why: The chevron's own rotation communicates whether Controls is currently open (note the inverted sense: is-open while NOT collapsed). How: This marks itself is-open while conColBoo is false. */ }


								<IcoSvgCom
									icoNamStr='chvEle'
									sizValNum={ 12 }
								/>{ /* What: Icon Svg Component. Why: A chevron glyph gives the disclosure a recognizable, rotating open/closed affordance. How: This renders the 'chvEle' icon at a small 12px size. */ }


							</span>

							<span className='kicker'>Controls</span>{ /* What: Kicker Span Element. Why: This is the disclosure's own plain label. How: This renders the literal text "Controls". */ }


						</span>

						{ conColBoo && <span className='rd-ctl-sum'>{ REM_MAT_ARR.length } settings</span> }{ /* What: Controls Summary Span Element. Why: A collapsed disclosure still needs a hint of how much content it's hiding. How: This renders REM_MAT_ARR's own length only while conColBoo is true. */ }


					</button>



					<ColDisCom open={ !conColBoo }>{ /* What: Collapse Disclosure Component. Why: OptMatCom's own matrix only exists while the Controls disclosure is open. How: This animates OptMatCom open/closed based on conColBoo. */ }


						<OptMatCom
							actStoObj={ actStoObj }
							remOptObj={ norOptObj }

							onCloConFun={ () => actStoObj.togColFun( '__reminders' ) }
						/>{ /* What: Option Matrix Component. Why: This is the actual once/recurring participation matrix, editing the normalized reminderOpts shape. How: This closes back via onCloConFun, collapsing the Controls disclosure above. */ }


					</ColDisCom>



					<button
						className='rd-ctl'

						data-element-name-hook='catTogBut'

						type='button'

						aria-expanded={ !iteColBoo }

						onClick={ () => actStoObj.togColFun( '__reminders:items' ) }
					>{ /* What: Items Disclosure Button Element. Why: Items is the same kind of nested collapsible as Controls, independently remembered. How: This toggles iteColBoo via actStoObj.togColFun. Its data-element-name-hook is read by the App Features tours. */ }


						<span className='rd-ctl-l'>{ /* What: Items Left Span Element. Why: The chevron and the "Items" kicker read together as one unit. How: This wraps both below. */ }


							<span className={ ` chev   ${ iteColBoo ? '' : 'is-open' } ` }>{ /* What: Chevron Span Element. Why: The chevron's own rotation communicates whether Items is currently open. How: This marks itself is-open while iteColBoo is false. */ }


								<IcoSvgCom
									icoNamStr='chvEle'
									sizValNum={ 12 }
								/>{ /* What: Icon Svg Component. Why: A chevron glyph gives the disclosure a recognizable, rotating open/closed affordance. How: This renders the 'chvEle' icon at a small 12px size. */ }


							</span>

							<span className='kicker'>Items</span>{ /* What: Kicker Span Element. Why: This is the disclosure's own plain label. How: This renders the literal text "Items". */ }


						</span>

						{ iteColBoo && <span className='rd-ctl-sum'>{ visTasArr.length } items</span> }{ /* What: Items Summary Span Element. Why: A collapsed disclosure still needs a hint of how many reminders it's hiding. How: This renders visTasArr's own length only while iteColBoo is true. */ }


					</button>



					<ColDisCom open={ !iteColBoo }>{ /* What: Collapse Disclosure Component. Why: The whole Items list (full-bleed rows: type icon + name + schedule, expanding into the exact Today editor) only exists while this disclosure is open. How: This animates the fragment below open/closed based on iteColBoo. */ }


						<React.Fragment>{ /* What: Items Fragment Element. Why: The add button and the list/empty-state below need to sit together with no extra dom wrapper of their own. How: This groups both below as one returned value. */ }


							{ tutProBoo ? ( // What: Tutorials In Progress Check. Why: This second add-reminder entry point must also stay disabled with an explanation while the guided checklist is running. How: This renders the disabled InfTipCom while tutProBoo is true, the real button otherwise.


								<InfTipCom
									className='rd-add is-tour-disabled'

									actNamStr='New reminder'
									labTexStr='This button is disabled until all tutorials are completed.'
								>{ /* What: Info Tip Component. Why: This is a second, independent path to a real reminder, so it must stay disabled during any onboarding tutorial the same way RemSecCom's own add button does. How: This wraps the plus icon and label text, standing in for the real button below. */ }


									<IcoSvgCom
										icoNamStr='pluEle'
										sizValNum={ 13 }
									/>{ /* What: Icon Svg Component. Why: This is the add control's own visible glyph, read together with the literal "New reminder" label right after it. How: This renders the 'pluEle' icon. */ } New reminder


								</InfTipCom>


							) : ( // What: Add Button Branch. Why: Outside the guided checklist, the real working Add button belongs here instead. How: This renders the else branch, taken while tutProBoo is false.


								<button
									className='rd-add'

									onClick={ addEdiFun }
								>{ /* What: Add Button Element. Why: This is the real, clickable "New reminder" entry point. How: This calls addEdiFun. */ }


									<IcoSvgCom
										icoNamStr='pluEle'
										sizValNum={ 13 }
									/>{ /* What: Icon Svg Component. Why: This is the add control's own visible glyph, read together with the literal "New reminder" label right after it. How: This renders the 'pluEle' icon. */ } New reminder


								</button>


							) }



							{ visTasArr.length === 0 ? ( // What: Empty List Check. Why: With no reminders at all, a plain empty-state message belongs here instead of a list. How: This renders the empty message while visTasArr is empty, the real list otherwise.


								<div className='rd-empty'>No reminders yet. Add one to see it on Today.</div> // What: Empty State Div Element. Why: With no reminders at all, the list area needs a plain explanation. How: This renders a fixed prompt to add one.


							) : ( // What: Reminder List Branch. Why: With at least one reminder, the real list of rows belongs here instead. How: This renders the else branch, taken while visTasArr has entries.


								<>{ /* What: Reminder List Fragment Element. Why: The sort control and the list rows render together as one branch. How: This groups them with no wrapper element. */ }


									{ visTasArr.length > 1 && ( // What: Sort Visibility Check. Why: Sorting only matters once there's more than 1 reminder to sort. How: This renders SorSelCom only while there are at least 2.


										<SorSelCom
											labTexStr='Sort'
											optLisArr={ ITE_SOR_ARR }
											selIdeStr='rem-item-sort'
											value={ iteSorStr }

											onChange={ ( sorKeyStr ) => actStoObj.setSorFun( 'reminders', sorKeyStr ) }
										/> // What: Sort Select Component. Why: The Items list needs the same sort control every other Data tab list uses. How: This is driven by ITE_SOR_ARR, committing through actStoObj.setSorFun.


									) }



									{ disTasArr.map( ( curTasObj ) => { // What: Task Row List Render. Why: One full-bleed row (plus its own expanding editor) is needed per visible reminder. How: This maps disTasArr to one row div per entry, keyed by its own id.


										const carOpeBoo = opeIdeStr === curTasObj.id;  // What: Card Open Boolean. Why: This single check decides both this row's own toggle-button-vs-name-input branch and whether its editor ColDisCom is open. How: This compares opeIdeStr against curTasObj's own id.
										const isaOncBoo = curTasObj.repeat === 'once'; // What: Is-A Once Boolean. Why: The row's own type icon depends on whether this is a one-time or recurring reminder. How: This checks curTasObj's own repeat.


										return (


											<div
												key={ curTasObj.id }
												ref={ carOpeBoo ? opeRowRef : undefined } // What: Open Row Ref. Why: Only the open row is scrolled into view. How: This attaches opeRowRef only while this row is open.

												className={ ` rd-item   ${ carOpeBoo ? 'is-editing' : '' }   ${ insIdeStr === curTasObj.id ? 'rd-item--insert' : '' } ` }

												data-element-name-hook='lisIteDiv'

												onAnimationEnd={ () => { if ( insIdeStr === curTasObj.id ) setInsIdeStr( null ); } } // What: Insert Flag Clear. Why: The entrance animation must play only once. How: This clears insIdeStr when this row's own animation ends while it still matches.
											>{ /* What: Row Div Element. Why: This is one reminder's own full-bleed row, holding either its plain summary or its live name input, plus its own expanding editor below. How: This renders one of the 2 header branches below, then the shared editor ColDisCom. Its data-element-name-hook is read by the App Features tours. */ }


												{ carOpeBoo ? ( // What: Row Editing Check. Why: The row's own header swaps between a live-editable div and a plain clickable button depending on whether it's open. How: This renders the editing div while carOpeBoo is true, the plain toggle button otherwise.


													<div
														className='rd-row'

														data-element-name-hook='lisRowDiv'
													>{ /* What: Row Editing Div Element. Why: While editing, this is a plain div rather than a button, since a button can't legally contain the input below it (interactive-in-interactive), which also cost it an accessible name of its own. How: This renders the type icon, the live name input, and a real, separate collapse-chevron button. Its data-element-name-hook is read by the App Features tours. */ }


														<span className={ ` rd-ico   ${ isaOncBoo ? 'is-once' : '' } ` }>{ /* What: Row Icon Span Element. Why: The type icon needs its own wrapper for styling. How: This wraps the single IcoSvgCom below. */ }


															<IcoSvgCom
																icoNamStr={ isaOncBoo ? 'pinEle' : 'calEle' } // What: Type Icon Pick. Why: A one-time reminder and a recurring one look different at a glance. How: This picks the pin while isaOncBoo and the calendar otherwise.
																sizValNum={ 15 }
															/>{ /* What: Icon Svg Component. Why: The row's own icon needs to distinguish a one-time reminder from a recurring one at a glance. How: This renders 'pin' while isaOncBoo, 'calendar' otherwise, at a small 15px size. */ }


														</span>

														<span className='rd-main'>{ /* What: Row Main Span Element. Why: The live name input needs its own wrapper matching the closed row's own layout. How: This wraps the single input below. */ }


															<input
																ref={ ( inpCurEle ) => { // What: Focus Ref Callback. Why: The input should focus once when it mounts, without the browser's own focus scroll fighting the smooth scroll above. How: This focuses a newly attached input with preventScroll and remembers it.


																	if ( inpCurEle && focInpRef.current !== inpCurEle ) { // What: New Input Guard. Why: Re-renders call this ref again, but focus should only happen once per input. How: This runs only for a real node not already focused.


																		inpCurEle.focus( { preventScroll : true } ); // What: Quiet Focus Call. Why: The row's own smooth scroll handles bringing it into view. How: This focuses without scrolling.

																		focInpRef.current = inpCurEle; // What: Focused Input Mark. Why: The guard above must skip this node next time. How: This stores it in focInpRef.


																	}


																} }

																className='rd-name-input'

																data-element-name-hook='rowNamInp'

																maxLength={ 60 }
																placeholder='Reminder name'
																type='text'
																value={ curTasObj.name }

																aria-label='Reminder name'

																onBlur={ ( bluEveObj ) => { // What: Name Blur Handler. Why: Leaving the input should commit the trimmed name, but never a blank one. How: This trims the value and commits it only when non-empty.


																	const namTriStr = bluEveObj.target.value.trim(); // What: Name Trimmed String. Why: Surrounding spaces are never part of a name. How: This trims the input's own value.


																	if ( namTriStr ) actStoObj.renTasFun( curTasObj.id, namTriStr ); // What: Non-Empty Name Guard. Why: A blank name must not replace the real one. How: This renames only when namTriStr has content.


																} }
																onChange={ ( chaEveObj ) => actStoObj.updTasFun( curTasObj.id, { name : chaEveObj.target.value } ) }
																onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } } // What: Enter Blur Shortcut. Why: Pressing Enter should finish the name the same way leaving the field does. How: This blurs the input on Enter, which runs onBlur's own commit.
															/>{ /* What: Name Input Element. Why: This is the row's own live-editable name field while carOpeBoo. How: This commits every keystroke, re-trims and re-commits (only if non-empty) on blur, and blurs itself on Enter; its own ref callback suppresses the browser's native focus-scroll so it doesn't fight opeRowRef's own smooth scroll. Its data-element-name-hook is read by the picker mini-tours. */ }


														</span>

														<button
															className='rd-chev chev is-open'

															type='button'

															aria-label='Collapse'

															onClick={ () => kepCloFun( curTasObj.id ) }
														>{ /* What: Collapse Chevron Button Element. Why: This is the row's own real, separate close affordance (see the row-editing div's own comment above for why it can't be the button itself). How: This calls kepCloFun, which marks the editor kept before closing it. */ }


															<IcoSvgCom
																icoNamStr='chvEle'
																sizValNum={ 16 }
															/>{ /* What: Icon Svg Component. Why: A chevron glyph gives this row's own open editor a recognizable close affordance. How: This renders the 'chvEle' icon at a 16px size. */ }


														</button>


													</div>


												) : ( // What: Row Toggle Branch. Why: A closed row just needs its own plain clickable toggle button instead. How: This renders the else branch, taken while carOpeBoo is false.


													<button
														className='rd-row'

														data-element-name-hook='lisRowBut'

														type='button'

														aria-expanded={ carOpeBoo }

														onClick={ () => setOpeIdeStr( carOpeBoo ? null : curTasObj.id ) } // What: Row Toggle Click. Why: The same row button opens and closes its own editor. How: This clears opeIdeStr while open and sets it to this row otherwise.
													>{ /* What: Row Toggle Button Element. Why: The plain, non-editing state is itself the clickable control that opens the editor. How: This toggles opeIdeStr to curTasObj's own id (or back to null). Its data-element-name-hook is read by the App Features tours. */ }


														<span className={ ` rd-ico   ${ isaOncBoo ? 'is-once' : '' } ` }>{ /* What: Row Icon Span Element. Why: The type icon needs its own wrapper for styling. How: This wraps the single IcoSvgCom below. */ }


															<IcoSvgCom
																icoNamStr={ isaOncBoo ? 'pinEle' : 'calEle' } // What: Type Icon Pick. Why: A one-time reminder and a recurring one look different at a glance. How: This picks the pin while isaOncBoo and the calendar otherwise.
																sizValNum={ 15 }
															/>{ /* What: Icon Svg Component. Why: The row's own icon needs to distinguish a one-time reminder from a recurring one at a glance. How: This renders 'pin' while isaOncBoo, 'calendar' otherwise, at a small 15px size. */ }


														</span>

														<span className='rd-main'>{ /* What: Row Main Span Element. Why: The name and schedule summary read together as one unit, matching the editing state's own layout. How: This wraps both spans below. */ }


															<span className='rd-name'>{ curTasObj.name }</span>{ /* What: Row Name Span Element. Why: This is the row's own primary text. How: This renders curTasObj's own name. */ }

															<span className='rd-sched'>{ TAS_NAM_OBJ.sumTasFun( curTasObj ) }</span>{ /* What: Row Schedule Span Element. Why: This is the row's own secondary, schedule-summary text. How: This calls TAS_NAM_OBJ.sumTasFun against curTasObj. */ }


														</span>

														<span
															className='rd-chev chev'

															aria-hidden='true'
														>{ /* What: Row Chevron Span Element. Why: The plain state's own chevron is purely decorative (the whole row is already the real toggle), so it's a span rather than a separate button. How: This wraps the single IcoSvgCom below, hidden from screen readers. */ }


															<IcoSvgCom
																icoNamStr='chvEle'
																sizValNum={ 16 }
															/>{ /* What: Icon Svg Component. Why: A chevron glyph gives this closed row's own real toggle a recognizable open affordance. How: This renders the 'chvEle' icon at a 16px size. */ }


														</span>


													</button>


												) }



												<ColDisCom open={ carOpeBoo }>{ /* What: Collapse Disclosure Component. Why: The schedule editor and its own footer only exist while this exact row is open. How: This animates the editor div below open/closed based on carOpeBoo. */ }


													<div className='rd-edit'>{ /* What: Edit Div Element. Why: The editor needs its own padding/framing distinct from the plain row above it. How: This wraps the shared rem-inline-editor div below. */ }


														<div
															className='rem-inline-editor'

															data-element-name-hook='inlEdiDiv'
														>{ /* What: Inline Editor Div Element. Why: The schedule editor and its own footer need to sit together, matching InlEdiCom's own root layout. How: This renders SchEdiCom against curTasObj directly (the real store, not a local draft), then EdiFooCom below it. Its data-element-name-hook is read by help mode's Today catalog. */ }


															<SchEdiCom
																actStoObj={ actStoObj }
																aniExtBoo
																staAppObj={ staAppObj }
																tasRcdObj={ curTasObj }
															/>{ /* What: Schedule Editor Component. Why: Unlike Today's own InlEdiCom, the Data tab commits every field change straight to the real store; there's no local draft to revert on Cancel here except via EdiFooCom's own snapshot. How: This is passed the real actStoObj bag directly as actStoObj. */ }



															<EdiFooCom
																ref={ carOpeBoo ? opeEdiRef : undefined } // What: Open Footer Ref. Why: The row's own chevron needs the open footer's kepFun handle. How: This attaches opeEdiRef only while this row is open.

																isaNewBoo={ newAddRef.current === curTasObj.id }
																tasRcdObj={ curTasObj }

																onCanTasFun={ ( snaTasObj ) => { // What: Cancel Handler. Why: Cancel behaves differently depending on whether this row is a brand-new, not-yet-kept reminder (discard outright) or an already-existing one (revert to its own mount-time snapshot). How: This branches on newAddRef, staging the same collapse-then-remove sequence Delete uses for the new-and-discarded case.


																	if ( newAddRef.current === curTasObj.id ) { // What: New-And-Discarded Branch. Why: A brand-new reminder should be discarded outright on Cancel, but still play the collapse-close animation Save uses, rather than vanish instantly. How: This clears newAddRef, snapshots the id, closes this row, then defers the actual delTasFun call.


																		newAddRef.current = null; // What: New-Item Flag Clear. Why: Cancelling a brand-new reminder discards it outright, so nothing "new" is left pointing at a soon-to-be-removed id. How: This resets newAddRef back to null unconditionally, since this whole branch only runs when it already matched curTasObj's own id.


																		const tasIdeStr = curTasObj.id; // What: Task Identifier String. Why: The deferred delTasFun call below must not close over curTasObj itself, in case it's captured after a later re-render. How: This snapshots curTasObj's own id right now.


																		setOpeIdeStr( ( curOpeStr ) => curOpeStr === curTasObj.id ? null : curOpeStr ); // What: Open Row Close Call. Why: The row must collapse right away rather than wait for the deferred remove below. How: This clears opeIdeStr only while it still matches curTasObj's own id.

																		setTimeout( () => actStoObj.delTasFun( tasIdeStr ), 280 ); // What: Deferred Remove Call. Why: This gives the row's own collapse-close animation time to finish before the underlying task actually disappears. How: This waits 280ms, then removes tasIdeStr's own snapshot.


																	}

																	else { // What: Existing-Reverted Branch. Why: An already-existing reminder should just revert to the snapshot EdiFooCom captured on mount, not be removed at all. How: This calls actStoObj.revTasFun with snaTasObj, then closes this row.


																		actStoObj.revTasFun( curTasObj.id, snaTasObj );                                 // What: Replace Task Call. Why: An existing reminder's own Cancel reverts it to the snapshot EdiFooCom captured on mount, discarding any in-progress edits. How: This calls actStoObj.revTasFun with curTasObj's own id and snaTasObj.
																		setOpeIdeStr( ( curOpeStr ) => curOpeStr === curTasObj.id ? null : curOpeStr ); // What: Open Row Close Call. Why: The row must collapse once the revert is complete. How: This clears opeIdeStr only while it still matches curTasObj's own id.


																	}


																} }
																onDelTasFun={ () => { // What: Delete Handler. Why: Deleting this row needs to clear a stale "new" flag, close the row, and stage the same collapse-then-remove sequence the card-level Delete uses. How: This snapshots the id, closes opeIdeStr, then either removes immediately (reduced motion) or defers it behind the collapse-out animation.


																	if ( newAddRef.current === curTasObj.id ) newAddRef.current = null; // What: New-Item Flag Clear Guard. Why: Deleting a brand-new reminder must not leave a stale "new" flag pointing at an id that no longer exists. How: This clears newAddRef only while it still matches curTasObj's own id.



																	const tasIdeStr = curTasObj.id; // What: Task Identifier String. Why: The deferred delTasFun call below must not close over curTasObj itself, in case it's captured after a later re-render. How: This snapshots curTasObj's own id right now.


																	setOpeIdeStr( ( curOpeStr ) => curOpeStr === curTasObj.id ? null : curOpeStr ); // What: Open Row Close Call. Why: The row must collapse right away rather than wait for the deferred remove below. How: This clears opeIdeStr only while it still matches curTasObj's own id.



																	if ( redMotFun() ) { actStoObj.delTasFun( tasIdeStr ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should get an instant remove instead of an animated collapse-then-remove. How: This calls actStoObj.delTasFun directly and returns early.



																	setTimeout( () => actStoObj.delTasFun( tasIdeStr ), 280 ); // What: Deferred Remove Call. Why: This can fire well after the user has already switched to a different reminder's editor, so it must only ever remove tasIdeStr's own snapshot, never whatever row happens to be open by then. How: This waits 280ms (matching the editor's own collapse-close animation) before actually removing the task.


																} }
																onDonTasFun={ () => kepCloFun( curTasObj.id ) }
															/>{ /* What: Editor Foot Component. Why: This is the shared Cancel/Save/Delete footer, same component InlEdiCom uses on Today. How: Delete and Cancel both defer their own delTasFun call by 280ms to let the collapse-close animation finish first (unless reduced motion); Save calls kepCloFun. */ }


														</div>


													</div>


												</ColDisCom>


											</div>


										);


									} ) }


								</>


							) }


						</React.Fragment>


					</ColDisCom>


				</div>


			</ColDisCom>


		</section>


	);


}

// #endregion RemManCom

// #endregion Components



// #region Exports

export { RemManCom }; // What: Named Export. Why: TabDatCom renders the Reminders section. How: This exports RemManCom by name; everything else in this file stays private.

// #endregion Exports


