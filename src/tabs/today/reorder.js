


/**
 * reorder.js = Reorder
 *
 * @summary
 * Hand-rolled pointer drag-to-reorder for the Today "Edit Mode", with no
 * external DnD library, built to work with variable-height rows. One
 * entry point, staDraFun (exported as REO_NAM_OBJ.staDraFun), is called from
 * a grip handle's onPointerDown and manages the whole gesture with
 * document-level listeners, committing a new order via the caller's own
 * onDroOrdFun callback.
 *
 * Technique: every sibling's rect is snapshotted at gesture start. The
 * grabbed element is translated by the pointer delta, lifted via a CSS
 * class, and raised above its siblings. The target index is derived from
 * where the grabbed element's projected center falls among the original
 * sibling centers. Siblings between the origin and target shift by the
 * grabbed element's outer height (plus gap) to open a hole at the
 * target, with a smooth CSS transition on transform animating them out
 * of the way. On release, every transform is cleared and the new index
 * order is handed to onDroOrdFun; React re-renders the list already in that
 * order, so the swap is seamless.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const EDG_SPE_NUM = 14;                                             // What: Edge Speed Number. Why: This is how many px the scroll container moves per animation frame once auto-scroll is active. How: This is multiplied by the current scroll direction and added to the scroll container's own scrollTop inside edgLooFun.
const EDG_THR_NUM = 64;                                             // What: Edge Threshold Number. Why: This is how close, in px, the pointer must sit to the scroll container's own top/bottom edge before auto-scroll kicks in. How: This is compared against the pointer's clientY relative to the scroll container's own rect inside onMovPoiFun.
const SHI_EAS_STR = 'transform 0.18s cubic-bezier(0.4, 0, 0.2, 1)'; // What: Shift Ease String. Why: This is the shared CSS transition every non-dragged sibling uses while shifting out of the way. How: This is written onto each sibling's own inline style.transition inside the prep forEach below.

// #endregion Constants



// #region Helpers

// #region staDraFun

/**
 * staDraFun = Start Drag Function
 *
 * @summary
 * Manages one full pointer drag-to-reorder gesture, from the initiating
 * pointerdown through every pointermove up to the terminating pointerup/
 * pointercancel. Captures the pointer on the grip element (falling back
 * to the dragged element itself) and listens for move/up on that same
 * captured element, since a captured element is guaranteed by spec to
 * receive every subsequent pointer event directly, regardless of what
 * sits under the cursor; relying on document bubbling alone silently
 * failed in Firefox for the item rows, whose clickable ancestor
 * intercepted the events. Capture-phase document listeners are also
 * bound unconditionally, since they survive Firefox silently dropping
 * the pointer capture, and Firefox's own native drag-and-drop on the
 * grip's SVG/icon (which otherwise kills every further pointermove
 * event) is suppressed for the gesture's duration by cancelling every
 * dragstart.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param dowEveObj - Down Event Object: The pointerdown event that started the
 *                    gesture, read for its button, pointerId, and clientY.
 * @param draConObj - Drag Configuration Object: The caller's own drag
 *                    configuration: conLisEle (the element whose direct
 *                    children matching iteSelStr are the reorderable list),
 *                    iteSelStr (a CSS selector identifying those siblings),
 *                    hanDraEle (the grabbed row/section being dragged),
 *                    griIcoEle (the specific element that received the
 *                    pointerdown, defaulting to hanDraEle when absent),
 *                    scrConEle (an optional scroll container for edge
 *                    auto-scroll), onDroOrdFun (called with an array of
 *                    original indices in their new order, only when the
 *                    order actually changed), and onStaDraFun/onEndDraFun
 *                    (optional lifecycle hooks).
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * staDraFun(dowEveObj, draConObj) // => void
 * ```
 *
*/

function staDraFun ( dowEveObj, draConObj ) {


	// #region Drag Configuration

	const { // What: Drag Configuration Destructure. Why: Every option the caller passed is read once, up front, under its own name. How: This destructures draConObj into one local per option, each key already matching its local's own name.


		conLisEle,   // What: Container List Element. Why: This is the reorderable list's own container, whose direct children matching iteSelStr are the draggable siblings. How: This is read once from draConObj and reused for the child query and the parent-match filter below.
		griIcoEle,   // What: Grip Icon Element. Why: The grip (often a small icon) is the element that actually receives the pointerdown and should own the pointer capture and move/up listeners. How: This is combined with hanDraEle below to resolve capTarEle.
		hanDraEle,   // What: Handle Drag Element. Why: This is the specific row/section actually being dragged. How: This is looked up in iteEleArr to find oriIndNum, and its own transform is set directly inside appShiFun.
		iteSelStr,   // What: Item Selector String. Why: Not every child of conLisEle is necessarily a draggable sibling. How: This is used as the CSS selector for the initial querySelectorAll below.
		onDroOrdFun, // What: On Drop Order Function. Why: The caller needs to be notified of the final reordering, but only once it actually changed. How: This is called from onRelPoiFun with the freshly-built index order.
		onEndDraFun, // What: On End Drag Function. Why: The caller may want to react to the gesture finishing, symmetrically with onStaDraFun above. How: This is called once, at the end of cleDraFun.
		onStaDraFun, // What: On Start Drag Function. Why: The caller may want to react to the gesture beginning, e.g. toggling a body class. How: This is called once, near the end of staDraFun's own setup.
		scrConEle    // What: Scroll Container Element. Why: Edge auto-scroll is optional and needs its own scrollable ancestor to act on. How: This is read by onMovPoiFun and edgLooFun, both of which no-op when it is absent.


	} = draConObj;


	const capTarEle = griIcoEle || hanDraEle; // What: Capture Target Element. Why: The pointer capture and every move/up listener must attach to whichever element actually received the pointerdown. How: This prefers griIcoEle, falling back to hanDraEle when no separate grip was given.

	// #endregion Drag Configuration



	if ( dowEveObj.button != null && dowEveObj.button !== 0 ) return; // What: Primary Button Guard. Why: Only the primary mouse button (or a touch/pen contact, which reports no button at all) should start a drag. How: This bails out early when a real, non-primary button value is present.



	// #region Origin Lookup

	const iteEleArr = Array.from( conLisEle.querySelectorAll( iteSelStr ) ) // What: Item Element Array. Why: Every reorderable sibling's rect needs to be snapshotted before the gesture moves anything. How: This queries every iteSelStr match under conLisEle, then keeps only its own direct children below.
		.filter( ( chiCurEle ) => chiCurEle.parentElement === conLisEle ); // What: Direct Child Filter. Why: A nested match (e.g. a card inside a card) would otherwise be mistaken for a top-level sibling. How: This keeps only the elements whose own parentElement is conLisEle itself.


	const oriIndNum = iteEleArr.indexOf( hanDraEle ); // What: Origin Index Number. Why: Every later shift/target computation is relative to where the dragged element actually started. How: This looks up hanDraEle's own position inside iteEleArr.


	if ( oriIndNum === -1 ) return; // What: No Origin Guard. Why: A dragged element that isn't one of iteEleArr's own entries has nothing valid to reorder against. How: This bails out early when the lookup above found no match.

	// #endregion Origin Lookup



	// #region Pointer Capture

	dowEveObj.preventDefault(); // What: Pointerdown Default Prevention. Why: The native press behavior (text selection, native drag-start on some elements) would otherwise fight this gesture. How: This suppresses it on the triggering pointerdown event.


	const poiIdeNum = dowEveObj.pointerId; // What: Pointer Identifier Number. Why: Both the capture call below and the eventual release inside cleDraFun need the exact same pointer id. How: This is read once from dowEveObj and reused in both places.

	let capSucBoo = false; // What: Capture Success Boolean. Why: cleDraFun must only attempt to release a capture that actually succeeded. How: This starts false and is flipped true only once setPointerCapture below returns without throwing.


	if ( poiIdeNum != null && capTarEle.setPointerCapture ) { // What: Pointer Capture Availability Guard. Why: Capture should only be attempted when the event actually carries a pointerId and the browser supports the capture API at all. How: This gates the capture attempt below on both conditions holding.


		try { // What: Pointer Capture Attempt. Why: A small number of environments can throw here even though the feature-detected method exists, so the actual capture call and its success flag must both stay inside this guarded block. How: This wraps the capture call and the success flag update below.


			capTarEle.setPointerCapture( poiIdeNum ); // What: Pointer Capture Call. Why: This is the spec-guaranteed mechanism that routes every later pointer event straight to capTarEle, regardless of what is under the cursor. How: This asks the browser to capture the given pointer id on capTarEle.

			capSucBoo = true; // What: Capture Success Boolean Update. Why: The release call inside cleDraFun must know whether this call actually succeeded. How: This is only reached when the call above did not throw.


		}

		catch ( e ) {} // What: Capture Failure Guard. Why: A small number of environments can throw here even though the feature-detected method exists. How: This silently ignores the failure, leaving capSucBoo at its default false.


	}

	// #endregion Pointer Capture



	// #region Layout Snapshot

	const recSnaArr = iteEleArr.map( ( iteCurEle ) => iteCurEle.getBoundingClientRect() );    // What: Rect Snapshot Array. Why: Every later shift/target computation compares against each sibling's position at gesture start, not its live (already-shifting) position. How: This measures every entry of iteEleArr exactly once, up front.
	const cenPosArr = recSnaArr.map( ( recCurObj ) => recCurObj.top + recCurObj.height / 2 ); // What: Center Position Array. Why: The target index is derived from comparing the dragged element's projected center against every sibling's own center. How: This computes each rect's own vertical center from recSnaArr.

	let gapPixNum = 0; // What: Gap Pixel Number. Why: A flex/grid gap between siblings must be folded into the shift distance below, or the opened hole would be short by exactly that gap. How: This starts at 0 and is measured from the first adjacent pair when one exists.


	if ( recSnaArr.length > 1 ) gapPixNum = Math.max( 0, recSnaArr[ 1 ].top - recSnaArr[ 0 ].bottom ); // What: Gap Measurement Guard. Why: A single-item list has no adjacent pair to measure a gap from. How: This measures the vertical space between the first two siblings' rects, floored at 0 in case they overlap.



	const shiDisNum = recSnaArr[ oriIndNum ].height + gapPixNum; // What: Shift Distance Number. Why: This is the exact distance every sibling between the origin and target needs to move to open/close the dragged element's own hole. How: This adds the dragged element's own measured height to gapPixNum.

	// #endregion Layout Snapshot



	// #region Gesture State

	const staCliNum = dowEveObj.clientY; // What: Start Client Y Number. Why: Every later delta is measured relative to where the gesture actually began. How: This is read once from the triggering pointerdown event.

	let delCliNum   = 0;         // What: Delta Client Y Number. Why: This is the gesture's own running vertical offset, driving every shift/target recomputation. How: This starts at 0 and is updated by onMovPoiFun and edgLooFun as the pointer moves and/or the container auto-scrolls.
	let tarIndNum   = oriIndNum; // What: Target Index Number. Why: This is the currently-computed drop target, read by onRelPoiFun once the gesture ends. How: This starts at oriIndNum (no movement yet) and is reassigned by appShiFun on every recomputation.
	let edgLooNum   = null;      // What: Edge Loop Number. Why: The auto-scroll rAF loop must be cancellable on cleanup. How: This holds the current requestAnimationFrame id, reassigned every frame by edgLooFun itself.
	let edgDirNum   = 0;         // What: Edge Direction Number. Why: edgLooFun needs to know which way (if any) to auto-scroll on its next frame. How: This is -1 for up, +1 for down, or 0 for no auto-scroll, set by onMovPoiFun.
	let scrComNum   = 0;         // What: Scroll Compensation Number. Why: Auto-scroll movement must be folded into delCliNum so the dragged element and its siblings stay visually anchored under the pointer. How: This accumulates every actual scroll movement edgLooFun applies.
	let cleDonBoo   = false;     // What: Cleanup Done Boolean. Why: cleDraFun can be reached from more than one path and must not tear things down twice. How: This starts false and is flipped true on cleDraFun's own first run.

	// #endregion Gesture State



	// #region Gesture Start Effects

	iteEleArr.forEach( ( iteCurEle, iteIndNum ) => { // What: Sibling Prep Loop. Why: Every sibling needs to be readied for smooth shifting before the gesture starts, with the grabbed element floating freely above the rest. How: This gives every sibling a willChange hint, then either marks the dragged one as lifted or gives the rest their shift transition.


		iteCurEle.style.willChange = 'transform'; // What: Will Change Style Write. Why: This hints the browser to optimize for an upcoming transform animation on every sibling, not just the dragged one. How: This is written unconditionally, before the branch below.

		if ( iteIndNum === oriIndNum ) { // What: Origin Sibling Check. Why: Only the dragged element itself gets lifted and floated; every other sibling gets the ordinary shift transition instead. How: This compares the current loop index against oriIndNum.


			iteCurEle.setAttribute( 'data-item-drag-active', '' ); // What: Drag Active Attribute Set. Why: This is the hook the dragged element's own stylesheet uses to visually lift it, whichever module it belongs to. How: This adds the presence-only attribute to the dragged element only.
			iteCurEle.style.transition = 'none';                   // What: Transition Disable. Why: The dragged element is translated directly by the pointer every frame and must never animate that, unlike its siblings. How: This clears any transition on the dragged element specifically.
			iteCurEle.style.zIndex = '50';                         // What: Z Index Raise. Why: The dragged element must render above every sibling it passes over while floating. How: This raises its stacking order via an inline z-index.
			iteCurEle.style.position = 'relative';    // What: Position Relative. Why: The z-index raise above only takes effect on a positioned element. How: This gives the dragged element a relative position context.


		}

		else { // What: Sibling Transition Setup. Why: Every non-dragged sibling needs the shared shift transition so its later transform change animates smoothly. How: This writes SHI_EAS_STR onto every sibling except the dragged one.


			iteCurEle.style.transition = SHI_EAS_STR; // What: Shift Transition Write. Why: This is what makes a sibling's later translateY change animate instead of jumping. How: This writes the shared SHI_EAS_STR constant onto the sibling's own inline style.


		}


	} );


	document.body.classList.add( 'is-reordering' ); // What: Reordering Class Add. Why: The app's own CSS may key off an active drag gesture globally, not just on the dragged element. How: This adds the class to the document body for the gesture's duration.


	const kilDraFun = ( draEveObj ) => draEveObj.preventDefault(); // What: Kill Drag Function. Why: Firefox starts a native drag-and-drop on the grip's SVG/icon that silently kills every further pointermove event, and preventDefault on pointerdown alone doesn't stop it. How: This cancels every dragstart event for the gesture's duration.


	document.addEventListener( 'dragstart', kilDraFun, true ); // What: Dragstart Suppression Subscribe. Why: kilDraFun must actually run for it to have any effect. How: This registers it on the capture phase, document-wide, for the gesture's duration.


	if ( onStaDraFun ) onStaDraFun(); // What: On Start Callback Guard. Why: The caller's own lifecycle hook is optional. How: This calls onStaDraFun only when the caller actually provided one.

	// #endregion Gesture Start Effects



	// #region Target And Shifts

	// #region cmpTarFun

	/**
	 * cmpTarFun = Compute Target Function
	 *
	 * @summary
	 * Derives which sibling index the dragged element's projected
	 * center currently falls among, by walking cenPosArr outward from
	 * oriIndNum in whichever direction delCliNum points.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns The sibling index the dragged element should currently
	 * be considered over.
	 * @see {@link tarCanNum}
	 *
	 * @example
	 * ```ts
	 * cmpTarFun() // => target index number
	 * ```
	 *
	*/

	function cmpTarFun() {


		const proCenNum = cenPosArr[ oriIndNum ] + delCliNum; // What: Projected Center Number. Why: This is where the dragged element's own center currently sits, used to compare against every other sibling's own center below. How: This adds the running delta to the dragged element's original center.

		let tarCanNum = oriIndNum; // What: Target Candidate Number. Why: This is the index being walked below until it lands on the sibling whose center the dragged element has crossed. How: This starts at oriIndNum, since no movement means no change yet.


		if ( delCliNum > 0 ) { // What: Downward Movement Check. Why: A positive delta means the dragged element moved down, so the candidate index should only ever walk forward. How: This gates the downward-walking while loop below.


			while ( tarCanNum < iteEleArr.length - 1 && proCenNum > cenPosArr[ tarCanNum + 1 ] ) tarCanNum++; // What: Downward Walk Loop. Why: The candidate must advance past every sibling whose own center the projected center has already crossed. How: This increments tarCanNum while a next sibling exists and its center is still below proCenNum.


		}

		else if ( delCliNum < 0 ) { // What: Upward Movement Check. Why: A negative delta means the dragged element moved up, so the candidate index should only ever walk backward. How: This gates the upward-walking while loop below.


			while ( tarCanNum > 0 && proCenNum < cenPosArr[ tarCanNum - 1 ] ) tarCanNum--; // What: Upward Walk Loop. Why: The candidate must retreat past every sibling whose own center the projected center has already crossed. How: This decrements tarCanNum while a previous sibling exists and its center is still above proCenNum.


		}



		return tarCanNum; // What: Target Candidate Return. Why: The caller needs the fully-walked candidate index, not the original oriIndNum. How: This returns whatever index the while loop above settled on.


	}

	// #endregion cmpTarFun



	// #region appShiFun

	/**
	 * appShiFun = Apply Shifts Function
	 *
	 * @summary
	 * Recomputes the current target index via cmpTarFun, then translates
	 * every non-dragged sibling that sits between the origin and target
	 * out of the way, and moves the dragged element itself by the
	 * current pointer delta.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * appShiFun() // => void
	 * ```
	 *
	*/

	function appShiFun() {


		tarIndNum = cmpTarFun(); // What: Target Index Recompute. Why: Every call to appShiFun reflects the gesture's own latest position, so the target must be recomputed first. How: This calls cmpTarFun and overwrites the outer tarIndNum with its result.

		iteEleArr.forEach( ( iteCurEle, iteIndNum ) => { // What: Sibling Shift Loop. Why: Every non-dragged sibling between the origin and target needs its own translateY set (or cleared) to open/close the dragged element's hole. How: This walks every sibling, skipping the dragged one, and sets eleOffNum from its own position relative to oriIndNum/tarIndNum.


			if ( iteIndNum === oriIndNum ) return; // What: Dragged Sibling Skip. Why: The dragged element's own transform is set separately below, driven directly by delCliNum rather than this shift logic. How: This skips straight to the next iteration when the current index is the dragged one.



			let eleOffNum = 0; // What: Element Offset Number. Why: This is the specific sibling's own shift amount, defaulting to no shift at all. How: This starts at 0 and is set by whichever branch below actually applies to this sibling.


			if ( tarIndNum > oriIndNum && iteIndNum > oriIndNum && iteIndNum <= tarIndNum ) eleOffNum = -shiDisNum; // What: Downward Range Check. Why: A sibling strictly between the origin and a lower target must shift up to close the gap the dragged element left behind. How: This applies -shiDisNum when all three range conditions hold.

			else if ( tarIndNum < oriIndNum && iteIndNum < oriIndNum && iteIndNum >= tarIndNum ) eleOffNum = shiDisNum; // What: Upward Range Check. Why: A sibling strictly between a higher target and the origin must shift down to open a hole at the target. How: This applies shiDisNum when all three range conditions hold.



			iteCurEle.style.transform = eleOffNum ? `translateY(${ eleOffNum }px)` : ''; // What: Sibling Transform Write. Why: A sibling outside both ranges above must have any earlier shift cleared, not left stuck. How: This writes the computed offset, or clears the transform entirely when eleOffNum is still 0.


		} );


		hanDraEle.style.transform = `translateY(${ delCliNum }px)`; // What: Dragged Element Transform Write. Why: The dragged element itself floats directly under the pointer, independent of the sibling-shift logic above. How: This translates hanDraEle by the current running delta.


	}

	// #endregion appShiFun

	// #endregion Target And Shifts



	// #region Edge Auto-Scroll

	// #region edgLooFun

	/**
	 * edgLooFun = Edge Loop Function
	 *
	 * @summary
	 * The auto-scroll animation loop, rescheduled every frame via
	 * requestAnimationFrame for as long as the gesture is active. While
	 * the pointer sits near scrConEle's own top/bottom edge, this nudges
	 * scrConEle's scrollTop and feeds the resulting movement back into
	 * delCliNum (via scrComNum), so the dragged element and its siblings
	 * stay visually anchored under the pointer instead of drifting.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * edgLooFun() // => void
	 * ```
	 *
	*/

	function edgLooFun() {


		if ( edgDirNum !== 0 && scrConEle ) { // What: Auto-Scroll Active Check. Why: Nudging scrollTop is only meaningful when a direction is set and an actual scroll container was given. How: This gates the whole scroll-and-compensate block below on both conditions holding.


			const preTopNum = scrConEle.scrollTop; // What: Previous Top Number. Why: The actual distance scrolled this frame can only be measured by comparing before and after. How: This reads scrConEle's own scrollTop before the write below.

			scrConEle.scrollTop += edgDirNum * EDG_SPE_NUM; // What: Scroll Top Write. Why: This is the actual auto-scroll step for this frame. How: This adds the fixed per-frame speed, signed by the current direction, onto scrConEle's own scrollTop.

			const movDelNum = scrConEle.scrollTop - preTopNum; // What: Moved Delta Number. Why: A container already at its scroll limit may not have moved at all, which must not still be treated as gesture movement. How: This compares the post-write scrollTop against preTopNum.


			if ( movDelNum !== 0 ) { // What: Real Movement Guard. Why: Only an actual scroll movement should feed back into the gesture's own delta/shift state. How: This skips the compensation block entirely when movDelNum came out to 0.


				scrComNum += movDelNum; // What: Scroll Compensation Accumulate. Why: onMovPoiFun's own next delta computation needs to account for every bit of auto-scroll that has happened so far. How: This adds this frame's own movement onto the running total.
				delCliNum += movDelNum; // What: Delta Client Y Accumulate. Why: The dragged element and its siblings must visually track the auto-scroll immediately, not wait for the next pointermove. How: This adds this frame's own movement directly onto the running delta.

				appShiFun(); // What: Shift Reapply Call. Why: The just-updated delCliNum needs to be reflected on screen right away. How: This recomputes the target and reapplies every transform.


			}


		}



		edgLooNum = requestAnimationFrame( edgLooFun ); // What: Next Frame Schedule. Why: This loop must keep running for as long as the gesture is active. How: This reschedules edgLooFun itself for the next animation frame, capturing the new id for cleDraFun to cancel later.


	}

	// #endregion edgLooFun



	edgLooNum = requestAnimationFrame( edgLooFun ); // What: Loop Start Schedule. Why: Auto-scroll must be armed from the very start of the gesture, not only once the pointer first moves. How: This schedules edgLooFun's own first run.

	// #endregion Edge Auto-Scroll



	// #region Pointer Handlers

	// #region onMovPoiFun

	/**
	 * onMovPoiFun = On Move Pointer Function
	 *
	 * @summary
	 * The pointermove handler for the active gesture. Updates the
	 * running delta from the pointer's own clientY, decides whether the
	 * pointer now sits close enough to scrConEle's own top/bottom edge
	 * to warrant auto-scroll, then reapplies every shift.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param movEveObj - Move Event Object: The pointermove event, read for
	 *                    its clientY.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * onMovPoiFun(movEveObj) // => void
	 * ```
	 *
	*/

	function onMovPoiFun( movEveObj ) {


		delCliNum = ( movEveObj.clientY - staCliNum ) + scrComNum; // What: Delta Client Y Recompute. Why: This is the gesture's own core measurement, combining the raw pointer movement with however much auto-scroll has already been compensated for. How: This subtracts the gesture's own start position from the pointer's current one, then adds scrComNum.

		if ( scrConEle ) { // What: Scroll Container Present Guard. Why: Deciding an auto-scroll direction is meaningless without a scroll container to act on. How: This gates the whole edge-proximity check below on scrConEle actually being given.


			const scrRecObj = scrConEle.getBoundingClientRect(); // What: Scroll Rect Object. Why: Edge proximity is measured against the scroll container's own current on-screen position. How: This measures scrConEle fresh on every move, since it could itself be scrolling the page.


			if ( movEveObj.clientY < scrRecObj.top + EDG_THR_NUM ) edgDirNum = -1; // What: Top Edge Check. Why: The pointer sitting within EDG_THR_NUM of the container's own top edge should trigger upward auto-scroll. How: This sets edgDirNum to -1 when that threshold is crossed.

			else if ( movEveObj.clientY > scrRecObj.bottom - EDG_THR_NUM ) edgDirNum = 1; // What: Bottom Edge Check. Why: The pointer sitting within EDG_THR_NUM of the container's own bottom edge should trigger downward auto-scroll. How: This sets edgDirNum to 1 when that threshold is crossed.

			else edgDirNum = 0; // What: No Edge Reset. Why: The pointer having moved back away from both edges must stop any auto-scroll already in progress. How: This resets edgDirNum to 0 when neither threshold above applies.


		}



		appShiFun(); // What: Shift Reapply Call. Why: Every pointermove must immediately reflect the freshly-updated delCliNum on screen. How: This recomputes the target and reapplies every transform.


	}

	// #endregion onMovPoiFun



	// #region cleDraFun

	/**
	 * cleDraFun = Cleanup Drag Function
	 *
	 * @summary
	 * Idempotent teardown for the whole gesture, reachable from both a
	 * successful drop and a cancel. Cancels the auto-scroll loop,
	 * releases the pointer capture and every listener this gesture
	 * added, restores every sibling's own inline style/class back to
	 * its pre-drag state, and finally calls the caller's own onEnd hook.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * cleDraFun() // => void
	 * ```
	 *
	*/

	function cleDraFun() {


		if ( cleDonBoo ) return; // What: Already Done Guard. Why: cleDraFun can be reached from more than one path (a real drop and a cancel) and must never tear down twice. How: This bails out immediately on any call after the first.



		cleDonBoo = true; // What: Cleanup Done Boolean Update. Why: Every call after this one must be caught by the guard above. How: This flips cleDonBoo true before any of the actual teardown below runs.


		cancelAnimationFrame( edgLooNum ); // What: Auto-Scroll Loop Cancel. Why: edgLooFun would otherwise keep rescheduling itself forever. How: This cancels whatever frame id edgLooNum currently holds.


		document.removeEventListener( 'dragstart', kilDraFun, true ); // What: Dragstart Suppression Unsubscribe. Why: Native drag-and-drop suppression is only needed for this gesture's own duration. How: This removes the exact same kilDraFun/capture-phase pair that staDraFun added earlier.


		if ( capSucBoo && capTarEle.releasePointerCapture ) { // What: Capture Release Guard. Why: Releasing a capture that was never actually acquired would be meaningless. How: This gates the release attempt below on both capSucBoo and browser support.


			try { capTarEle.releasePointerCapture( poiIdeNum ); } // What: Pointer Capture Release Call. Why: This is the actual release, matching the capture acquired earlier in staDraFun. How: This calls releasePointerCapture with the same poiIdeNum.

			catch ( e ) {} // What: Pointer Capture Release Failure Guard. Why: An already-implicitly-released capture (e.g. after a pointercancel) can throw on an explicit release attempt. How: This silently ignores any such failure.


		}



		capTarEle.removeEventListener( 'pointermove', onMovPoiFun );        // What: Grip Pointermove Unsubscribe. Why: This is one of the two listener paths staDraFun bound for reliability, and both must be undone. How: This removes onMovPoiFun from capTarEle's own pointermove.
		capTarEle.removeEventListener( 'pointerup', onRelPoiFun );          // What: Grip Pointerup Unsubscribe. Why: Same reasoning as the pointermove removal above, for the up path instead. How: This removes onRelPoiFun from capTarEle's own pointerup.
		capTarEle.removeEventListener( 'pointercancel', onRelPoiFun );      // What: Grip Pointercancel Unsubscribe. Why: A cancelled gesture must clean up exactly like a completed one. How: This removes onRelPoiFun from capTarEle's own pointercancel.
		document.removeEventListener( 'pointermove', onMovPoiFun, true );   // What: Document Pointermove Unsubscribe. Why: This is the capture-phase fallback path bound alongside the grip's own listeners above. How: This removes onMovPoiFun from the document's own capture-phase pointermove.
		document.removeEventListener( 'pointerup', onRelPoiFun, true );     // What: Document Pointerup Unsubscribe. Why: Same reasoning as the document pointermove removal above, for the up path instead. How: This removes onRelPoiFun from the document's own capture-phase pointerup.
		document.removeEventListener( 'pointercancel', onRelPoiFun, true ); // What: Document Pointercancel Unsubscribe. Why: A cancelled gesture must clean up exactly like a completed one. How: This removes onRelPoiFun from the document's own capture-phase pointercancel.


		iteEleArr.forEach( ( iteCurEle ) => { // What: Sibling Restore Loop. Why: Every inline style/class the prep loop and appShiFun added must be fully reverted, or a sibling could be left visually stuck. How: This clears every property staDraFun's own setup wrote, on every sibling.


			iteCurEle.removeAttribute( 'data-item-drag-active' ); // What: Drag Active Attribute Remove. Why: Only the dragged element ever received this attribute, but removing it unconditionally here is harmless and keeps this loop uniform. How: This removes the attribute from every element.
			iteCurEle.style.transition = '';                      // What: Transition Clear. Why: A lingering transition value would affect this element's very next unrelated style change. How: This clears the inline transition set by the prep loop.
			iteCurEle.style.transform = '';                       // What: Transform Clear. Why: The final shift/drag transform must not persist once the gesture ends. How: This clears whatever transform appShiFun last wrote.
			iteCurEle.style.zIndex = '';                          // What: Z Index Clear. Why: The dragged element's raised stacking order was only meant for the gesture's own duration. How: This clears the inline z-index set by the prep loop.
			iteCurEle.style.position = '';                        // What: Position Clear. Why: The dragged element's forced relative positioning was only needed to make the z-index raise above take effect. How: This clears the inline position set by the prep loop.
			iteCurEle.style.willChange = '';                      // What: Will Change Clear. Why: The optimization hint given to every sibling is no longer useful once no animation is pending. How: This clears the inline will-change set by the prep loop.


		} );

		document.body.classList.remove( 'is-reordering' ); // What: Reordering Class Remove. Why: The global gesture-active hook added at the very start of staDraFun must not outlive it. How: This removes the class from the document body.

		if ( onEndDraFun ) onEndDraFun(); // What: On End Callback Guard. Why: The caller's own lifecycle hook is optional. How: This calls onEndDraFun only when the caller actually provided one.


	}

	// #endregion cleDraFun



	// #region onRelPoiFun

	/**
	 * onRelPoiFun = On Release Pointer Function
	 *
	 * @summary
	 * The pointerup/pointercancel handler that ends the gesture. Snapshots
	 * the final target before tearing anything down, then, only if the
	 * index actually changed, builds the new index order and hands it to
	 * the caller's own onDroOrdFun.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * onRelPoiFun() // => void
	 * ```
	 *
	*/

	function onRelPoiFun() {


		const finTarNum = tarIndNum; // What: Final Target Number. Why: cleDraFun below doesn't touch tarIndNum, but capturing it first keeps this function's own intent explicit regardless. How: This reads the outer tarIndNum before any teardown runs.

		cleDraFun(); // What: Cleanup Call. Why: Every listener/style/class this gesture added must be undone as soon as the pointer is released, whether or not the order actually changed. How: This runs the full teardown described in cleDraFun's own comment.


		if ( finTarNum !== oriIndNum ) { // What: Order Changed Guard. Why: onDroOrdFun should only ever fire for a real reorder, never for a drag that snapped back to its own start. How: This gates the whole order-building block below on the index having actually moved.


			const ordIndArr = Array.from( iteEleArr.keys() ); // What: Order Index Array. Why: The caller expects an array of original indices in their new order, not the elements themselves. How: This builds the identity order [0, 1, 2, ...] as the starting point for the splice below.

			const [ movIndNum ] = ordIndArr.splice( oriIndNum, 1 ); // What: Moved Index Number. Why: The dragged item's own original index must be pulled out before it can be reinserted at its new position. How: This removes exactly one entry at oriIndNum and captures it.

			ordIndArr.splice( finTarNum, 0, movIndNum ); // What: Moved Index Reinsert. Why: This is what actually produces the final reordered index array. How: This reinserts movIndNum at finTarNum without removing anything else.

			if ( onDroOrdFun ) onDroOrdFun( ordIndArr ); // What: On Drop Callback Guard. Why: The caller's own onDroOrdFun is optional, same as onStaDraFun/onEndDraFun. How: This calls onDroOrdFun only when the caller actually provided one, passing the freshly-built order.


		}


	}

	// #endregion onRelPoiFun

	// #endregion Pointer Handlers



	// #region Listener Subscriptions

	capTarEle.addEventListener( 'pointermove', onMovPoiFun );        // What: Grip Pointermove Subscribe. Why: This is the primary listener path, since it fires reliably everywhere once the pointer is captured. How: This registers onMovPoiFun on capTarEle's own pointermove.
	capTarEle.addEventListener( 'pointerup', onRelPoiFun );          // What: Grip Pointerup Subscribe. Why: The gesture must end cleanly once the pointer is released. How: This registers onRelPoiFun on capTarEle's own pointerup.
	capTarEle.addEventListener( 'pointercancel', onRelPoiFun );      // What: Grip Pointercancel Subscribe. Why: A cancelled gesture (e.g. an interrupting system gesture) must be treated the same as a normal release. How: This registers onRelPoiFun on capTarEle's own pointercancel.
	document.addEventListener( 'pointermove', onMovPoiFun, true );   // What: Document Pointermove Subscribe. Why: This is the capture-phase fallback path, which survives Firefox silently dropping the pointer capture above. How: This registers onMovPoiFun on the document itself, capture phase.
	document.addEventListener( 'pointerup', onRelPoiFun, true );     // What: Document Pointerup Subscribe. Why: Same reasoning as the document pointermove subscribe above, for the up path instead. How: This registers onRelPoiFun on the document itself, capture phase.
	document.addEventListener( 'pointercancel', onRelPoiFun, true ); // What: Document Pointercancel Subscribe. Why: A cancelled gesture must be caught by the fallback path too, same as a normal release. How: This registers onRelPoiFun on the document itself, capture phase.

	// #endregion Listener Subscriptions


}

// #endregion staDraFun

// #endregion Helpers



// #region Exports

const REO_NAM_OBJ = { staDraFun : staDraFun }; // What: Reorder Namespace Object. Why: This is the single public entry point tab-today.jsx imports by name. How: This maps this file's own internal staDraFun name directly onto its own matching external property name.



export { REO_NAM_OBJ }; // What: Reorder Namespace Object Export. Why: tab-today.jsx reaches the drag gesture through the one namespace object. How: This exports REO_NAM_OBJ by name at the very end of the file.

// #endregion Exports


