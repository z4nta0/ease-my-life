


// #region Imports

import type { HelRecTyp } from './geometry.ts'; // What: Help Rect Type. Why: A title function receives its item's measured rect. How: This types HelIteTyp's titStr function.
import type { ReactNode } from 'react';         // What: React Node. Why: A tip's body is renderable content. How: This types HelIteTyp's bodEle.
import type { ShaRadTyp } from './geometry.ts'; // What: Shape Radius Type. Why: A shape function computes a cutout's radius. How: This types HelIteTyp's shaStr function's return.

// #endregion Imports



/**
 * catalog-item.ts = Catalog Item
 *
 * @summary
 * The shape every help catalog item shares, on every page, which help mode's
 * overlay and tip read. Each field is documented once, on the type below, so
 * none of the catalogs' items repeat those fields' boilerplate comments on
 * their own lines (see the "Repeated-shape object literals" comment exception
 * in CLAUDE.md); each item's opening line carries its identity comment
 * instead. The catalogs themselves live in their own files, one per page
 * (today-catalog.tsx, for example).
 *
 * Sections:
 *  - Types
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type HelIteTyp = { // What: Help Item Type. Why: Every help catalog item, on every page, shares one shape that HelOveCom and HelTipCom read. How: This describes one item.


	absStr?    : string;                                                               // What: Always-Below Selector String. Why: On some pages a tall target leaves no room above it for the tip. How: When this selector matches anything, the tip always opens below its target.
	bodEle     : ReactNode | ( () => ReactNode );                                      // What: Body Element. Why: The tip's body copy can bold phrases or carry an inline icon, and sometimes depends on live page state. How: This is JSX, or a function HelTipCom calls when the tip opens.
	feoBoo?    : boolean;                                                              // What: First-Element-Only Boolean. Why: Some selectors match one element per section where only the first should be highlighted. How: This keeps just the first match.
	groStr?    : string;                                                               // What: Group String. Why: The columns of one table-style row are highlighted flush together. How: HelOveCom groups every item sharing this value and snaps their highlights edge to edge.
	ideStr     : string;                                                               // What: Identifier String. Why: HelOveCom tracks which item is open. How: This is the item's unique key, also used in its badge and tip's React keys.
	labStr?    : string;                                                               // What: Label String. Why: A title can name the specific thing highlighted. How: This selector is read within the matched element for a live label, which the title function receives on its rect.
	mtwBoo?    : boolean;                                                              // What: Match-Target-Width Boolean. Why: A long tip reads better at its target's own width. How: HelTipCom sizes the tip to the rect's tipWidNum when this is set.
	mulBoo?    : boolean;                                                              // What: Multiple Boolean. Why: A selector can match several elements at once that each deserve a badge. How: This renders one badge per match instead of one union.
	mwsStr?    : string;                                                               // What: Match-Width Selector String. Why: A tip can match the width of a different element than the one highlighted. How: HelOveCom measures this selector's element for the tip's width.
	padXcoNum? : number;                                                               // What: Pad X-Coordinate Number. Why: Some targets' highlights would otherwise overlap a neighbor horizontally. How: This overrides the default horizontal padding, read by claPadFun and badRecFun.
	padYcoNum? : number;                                                               // What: Pad Y-Coordinate Number. Why: Some targets' highlights would otherwise overlap a neighbor vertically. How: This overrides the default vertical padding, read by claPadFun and badRecFun.
	scrBoo?    : boolean;                                                              // What: Scroll Boolean. Why: A long body could overflow past its target on a short viewport. How: This caps the tip's height and scrolls its content instead.
	selStr     : string;                                                               // What: Selector String. Why: Each item highlights on-page elements. How: This selector list is passed to finTarFun, which tries each alternative in turn.
	shaStr?    : string | ( ( padWidNum : number, padHeiNum : number ) => ShaRadTyp ); // What: Shape String. Why: Some targets look round for a reason CSS can't report, or are a union with no single element to read. How: This is 'circle', passed to shaRadFun, or a function computing the radius from the padded size.
	titStr     : string | ( ( tarRecObj : HelRecTyp ) => string );                     // What: Title String. Why: A heading can depend on something only known when the tip opens. How: This is the heading, or a function called with the item's own measured rect.


};

// #endregion Types



// #region Exports

export { type HelIteTyp }; // What: Named Export. Why: Every page's catalog types its items with HelIteTyp, and help mode's overlay and tip read them through it. How: This exports the item type by name.

// #endregion Exports


