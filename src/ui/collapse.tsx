


// #region Imports

import cssModObj from './collapse.module.css'; // What: CSS Module Object. Why: The disclosure's grid and content styles live in its own module. How: This maps each class name in collapse.module.css to its hashed module class.
import React     from 'react';                 // What: React. Why: ColDisCom is built directly on React's own APIs. How: This is used directly (React.useEffect, React.useState) instead of importing individual named hooks.


import { redMotFun } from '../utils/motion.ts'; // What: Reduce Motion Function. Why: Under reduced motion the closed panel unmounts at once instead of waiting for a transition that never fires. How: This is checked when the panel closes.

// #endregion Imports



/**
 * collapse.tsx = Collapse
 *
 * @summary
 * The app's animated disclosure: it eases a panel's height to and from auto
 * without hardcoded max-heights, fades and slides the content, and unmounts
 * children once closed so editors inside take a fresh snapshot each time they
 * open.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

type CdcProTyp = { children : React.ReactNode, className? : string, isaInsBoo? : boolean, open : boolean }; // What: Collapse-Disclosure-Component Props Type. Why: A disclosure shows or hides its content, optionally without animating. How: This types ColDisCom's props.

// #region ColDisCom

/**
 * ColDisCom = Collapse Disclosure Component
 *
 * @summary
 * Animated disclosure. Wraps children in a grid whose single row
 * transitions 0fr<->1fr, so it eases height to/from auto without
 * hardcoded max-heights, plus a fade+slide on the inner content.
 * Crucially it UNMOUNTS children after the close animation and
 * remounts them on open, which preserves the snapshot-on-open behavior
 * that the Controls panels and item editors rely on for Cancel.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.children  - Children: The section's own content, unmounted
 *                          while closed and remounted on open.
 * @param props.className - Class Name: Extra class name(s) to append; defaults
 *                          to an empty string.
 * @param props.isaInsBoo - Is-An Instant Boolean: Opts a specific mount out of
 *                          the open animation, snapping straight to expanded
 *                          instead (e.g. a freshly-created draft picker's
 *                          Controls section); defaults to false.
 * @param props.open      - Open: Whether this section should be expanded.
 *
 * @returns The section's own animated wrapper and its children, or
 * null while fully closed and unmounted.
 *
 * @example
 * ```tsx
 * ColDisCom({ children, className, isaInsBoo, open }) // => <ColDisCom />
 * ```
 *
*/

function ColDisCom ( { children, className = '', isaInsBoo = false, open } : CdcProTyp ) : React.JSX.Element | null {


	const [ chiMouBoo, setChiMouBoo ] = React.useState( open );              // What: Child Mounted Boolean And Setter. Why: Children must stay in the DOM through the close animation and unmount only once it finishes. How: This starts matching the initial open value and is flipped by the effects below.
	const [ expStaBoo, setExpStaBoo ] = React.useState( isaInsBoo && open ); // What: Expand State Boolean And Setter. Why: This drives the 0fr/1fr grid row, starting collapsed even when open so a fresh mount-while-open still animates open instead of snapping. How: isaInsBoo opts a specific mount out of that behavior by starting already expanded.


	React.useEffect( () => { // What: Mount Sync Effect. Why: A newly-opened section must mount its children before it can animate expanding, and a newly-closed one must animate before unmounting. How: This mounts immediately on open, or starts the close animation (unmounting right away under reduced motion, since transitionend never fires) on close.


		if ( open ) { setChiMouBoo( true ); return; } // What: Open Mount Guard. Why: Expanding is handled by the next effect below; this one only needs to ensure the child is mounted first. How: This mounts the child and bails out of the rest of this effect.



		setExpStaBoo( false ); // What: Expand State Clear Call. Why: Closing must animate the grid row back to 0fr before anything unmounts. How: This flips expStaBoo false, which the JSX below reflects by dropping its data-collapse-open-active attribute.


		if ( redMotFun() ) setChiMouBoo( false ); // What: Reduced Motion Unmount Guard. Why: transitionend never fires without a real transition, so nothing else would ever unmount the child. How: This unmounts the child immediately when the user prefers reduced motion.


	}, [ open ] ); // What: Effect Dependency Array. Why: This effect only needs to re-run when the open prop itself changes. How: open is read directly inside the guard above.


	React.useEffect( () => { // What: Expand Trigger Effect. Why: The collapsed 0fr state must have painted before flipping to expanded, or a fresh open-from-unmounted mount races the paint and snaps open instead of animating. How: This waits two animation frames after the child is mounted and committed before flipping expStaBoo true.


		if ( !open || !chiMouBoo || expStaBoo ) return; // What: Already Handled Guard. Why: There is nothing to animate unless this is an open section whose child just mounted and isn't already expanded. How: This bails out of the rest of the effect when any of those 3 conditions fails.



		const rafOneNum = requestAnimationFrame( () => { // What: Request-Animation-Frame One Number. Why: One frame lets the collapsed 0fr state actually paint before the second frame flips it. How: This schedules the second frame request below, itself cleaned up if this effect re-runs first.


			const rafTwoNum = requestAnimationFrame( () => setExpStaBoo( true ) ); // What: Request-Animation-Frame Two Number. Why: This is the actual frame that flips the grid row to 1fr, animating the expand. How: This schedules setExpStaBoo(true) one more frame later.



			return () => cancelAnimationFrame( rafTwoNum ); // What: Second Frame Cleanup. Why: A re-run before the second frame fires must not let a stale expand still happen. How: This cancels the second animation frame request.


		} );



		return () => cancelAnimationFrame( rafOneNum ); // What: First Frame Cleanup. Why: A re-run before the first frame fires must not let a stale chain still start. How: This cancels the first animation frame request.


	}, [ chiMouBoo, expStaBoo, open ] ); // What: Effect Dependency Array. Why: open decides whether an expand should happen at all, chiMouBoo re-runs this on the mount commit rather than only on the open change, and expStaBoo keeps the guard reading the current expand state. How: All three are read in the guard above, and a re-run caused by expStaBoo itself just returns there.


	const onTraEndFun = ( traEndObj : React.TransitionEvent ) => { // What: On Transition End Function. Why: The child can only safely unmount once the close animation has actually finished playing. How: This checks that the event is the grid-row transition finishing on this element itself while closed, then unmounts the child.


		const tarSelBoo = traEndObj.target === traEndObj.currentTarget;    // What: Target Self Boolean. Why: A transitionend can bubble up from an unrelated descendant's own transition. How: This confirms the event fired on this element itself, not a child.
		const rowProBoo = traEndObj.propertyName === 'grid-template-rows'; // What: Row Property Boolean. Why: Other CSS properties on this element could also transition and fire their own events. How: This confirms the specific property that finished is the grid row driving the collapse.
		const notOpeBoo = !open;                                           // What: Not Open Boolean. Why: Only a genuine close should ever unmount the child. How: This confirms open is currently false.

		const cloEndBoo = tarSelBoo && rowProBoo && notOpeBoo; // What: Close End Boolean. Why: The panel should only unmount once its own row transition has finished closing it. How: This combines the 3 checks above.


		if ( cloEndBoo ) setChiMouBoo( false ); // What: Unmount Guard. Why: All 3 conditions above must hold before it's actually safe to unmount. How: This unmounts the child once the real close transition has genuinely finished.


	};



	if ( !chiMouBoo ) return null; // What: Unmounted Guard. Why: Nothing should render at all once the child has actually unmounted. How: This returns null before building the wrapper JSX below.



	return (


		<div
			className={` ${ cssModObj.colDisDiv }   ${ className } `}

			data-collapse-open-active={ expStaBoo || undefined } // What: Collapse Open Active Attribute. Why: The disclosure's open state drives its CSS row and fade transitions. How: This is present only while expStaBoo is true, since undefined drops the attribute entirely.

			onTransitionEnd={ onTraEndFun }
		>{ /* What: Disclosure Div Element. Why: This is ColDisCom's own root wrapper, whose CSS grid-template-rows transition drives the whole expand/collapse animation. How: This sets its data-collapse-open-active attribute per expStaBoo and reacts to its own transitionend via onTraEndFun. */ }


			<div className={ cssModObj.colInnDiv }>{ children }</div>{ /* What: Disclosure Inner Div Element. Why: The fade+slide-on-content animation needs its own inner element separate from the row-height transition on the outer div. How: This wraps whatever children the caller passed. */ }


		</div>


	);


}

// #endregion ColDisCom

// #endregion Components



// #region Exports

export { ColDisCom }; // What: Named Export. Why: Every expandable panel in the app opens and closes through this disclosure. How: This exports ColDisCom by name.

// #endregion Exports


