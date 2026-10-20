


// #region Imports

import React from 'react'; // What: React. Why: useModIneFun applies and lifts the inert state from an effect. How: This is used directly (React.useEffect).

// #endregion Imports



/**
 * modal-inert.ts = Modal Inert
 *
 * @summary
 * Keeps keyboard focus and screen readers inside an open modal dialog. The
 * app's modals render into the body through a portal and mark themselves
 * aria-modal, but nothing stopped Tab from leaving them for the page behind,
 * where a keyboard user would land on controls they can't see. While a modal
 * is mounted, useModIneFun marks every other top-level element of the body
 * inert (unfocusable, unclickable, and hidden from assistive technology), and
 * lifts it again on unmount. Live regions are left alone, so announcements
 * made while the modal is open still reach screen readers.
 *
 * Sections:
 *  - Hooks
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Hooks

// #region useModIneFun

/**
 * useModIneFun = Use Modal Inert Function
 *
 * @summary
 * Marks everything outside the modal inert for as long as the calling modal
 * is open. It finds the modal's own top-level node, the ancestor of
 * insEleRef's element that sits directly in the body (the portal's root),
 * then sets inert on each of that node's siblings except live regions, and
 * on unmount removes it from exactly the elements it set it on, so an
 * element that was already inert stays that way.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param insEleRef - Inside Element Reference: A ref to any element inside
 *                    the modal, such as its panel or its primary button.
 * @param opeBoo    - Open Boolean: Whether the modal is open now, for a
 *                    modal component that stays mounted while closed.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * useModIneFun(panEleRef, opeBoo) // => void
 * ```
 *
*/

function useModIneFun ( insEleRef : React.RefObject< HTMLElement | null >, opeBoo : boolean ) : void {


	React.useEffect( () => { // What: Inert Effect. Why: The page behind the modal must stay out of reach only while the modal is open. How: This sets inert on the modal's siblings when it opens and lifts it on cleanup.


		if ( !opeBoo ) return; // What: Closed Modal Guard. Why: A closed modal leaves the page alone. How: This returns early.



		let topEleObj : Element | null = insEleRef.current; // What: Top Element Object. Why: The siblings to make inert are those of the modal's own body-level node. How: This starts at the ref's element and climbs below.



		while ( topEleObj && topEleObj.parentElement !== document.body ) topEleObj = topEleObj.parentElement; // What: Body Child Climb. Why: The portal's root is the ancestor sitting directly in the body. How: This climbs until the parent is the body, or runs out at null when the modal isn't in the body.



		if ( !topEleObj ) return; // What: Missing Modal Guard. Why: A modal that isn't mounted in the body has no siblings to make inert. How: This returns early.



		const modTopEle = topEleObj; // What: Modal Top Element. Why: The filter below runs in a callback, which can't rely on the loop variable's narrowed type. How: This holds the found node.

		const ineEleArr = [ ...document.body.children ].filter( ( sibCurEle ) => sibCurEle !== modTopEle && !sibCurEle.hasAttribute( 'inert' ) && !sibCurEle.hasAttribute( 'aria-live' ) ); // What: Inert Element Array. Why: Only the modal's siblings that aren't already inert, and aren't live regions that still need to speak, should change. How: This filters the body's children down to them.


		ineEleArr.forEach( ( ineCurEle ) => ineCurEle.setAttribute( 'inert', '' ) ); // What: Inert Set Loop. Why: The page behind the modal must not take focus or be read. How: This sets inert on each of them.



		return () => ineEleArr.forEach( ( ineCurEle ) => ineCurEle.removeAttribute( 'inert' ) ); // What: Inert Cleanup. Why: The page has to come back once the modal closes. How: This removes inert from exactly the elements the effect set it on.


	}, [ insEleRef, opeBoo ] ); // What: Effect Dependency Array. Why: The page has to change whenever the modal opens or closes, or a different ref is passed. How: opeBoo flipping runs or cleans up the effect, and insEleRef keeps its identity across renders.


}

// #endregion useModIneFun

// #endregion Hooks



// #region Exports

export { useModIneFun }; // What: Named Export. Why: Every modal dialog keeps focus inside itself through this hook. How: This exports useModIneFun by name.

// #endregion Exports


