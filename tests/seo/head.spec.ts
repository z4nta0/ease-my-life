


// #region Imports

import { expect        } from '@playwright/test';      // What: Expect. Why: Each check passes only when the page says what it should. How: This asserts on what each check reads, such as the page's head.
import { fileURLToPath } from 'node:url';              // What: File URL To Path. Why: The sync price is read from its source two folders above this file. How: This turns that file's URL into a path.
import { heaPatFun     } from '../support/headers.ts'; // What: Headers Path Function. Why: A header could keep a page out of search as surely as a tag. How: This reads the headers the built dist/_headers sends with one path.
import { opeStaFun     } from '../support/states.ts';  // What: Open State Function. Why: Each app state is opened the way the accessibility suite opens it. How: This loads the state and waits until it's settled.
import { PRE_URL_STR   } from '../support/servers.ts'; // What: Preview URL String. Why: Link scrapers read the shipped page, which the build minifies, so the raw pages are read from the build rather than the dev server. How: This is the address the preview server answers on.
import { readFileSync  } from 'node:fs';               // What: Read File Sync. Why: The structured data's price is checked against the app's own. How: This reads src/constants.ts.
import { STA_RCD_ARR   } from '../support/states.ts';  // What: State Record Array. Why: Every state's document has to keep one description. How: This lists the states to load.
import { test          } from '@playwright/test';      // What: Test. Why: Each page and each file is its own test. How: This declares them.
import { watErrFun     } from '../support/watch.ts';   // What: Watch Errors Function. Why: A page error during a check is a failure even when the check itself passes. How: This collects page and console errors.

// #endregion Imports



/**
 * head.spec.ts = Head Spec
 *
 * @summary
 * Checks the app's SEO setup in whichever engine the project runs. The app
 * answers at one address, with the privacy policy and terms on pages of their
 * own, and all three are indexed. Its checks cover each raw page, read from
 * the build without running a script the way link checkers read it, the head
 * every state keeps in a browser, and the files crawlers read, such as the
 * sitemap, which has to list exactly the three pages.
 *
 * Sections:
 *  - Constants
 *  - Module State
 *  - Helpers
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const CON_PAT_STR = fileURLToPath( new URL( '../../src/constants.ts', import.meta.url ) );                                                        // What: Constants Path String. Why: The sync price lives in the app's constants. How: This resolves src/constants.ts.
const HOM_DES_STR = 'Pick what to do today, without deciding. Your pickers choose for you, on the schedule you set and entirely on your device.'; // What: Home Description String. Why: The raw home page and every state in the shared list carry this one description. How: This is the exact text it should hold.
const HOM_TIT_STR = 'Ease My Life: pick what to do today, without deciding';                                                                      // What: Home Title String. Why: The app keeps index.html's title on every screen. How: This is the exact text it should hold.
const LIV_URL_STR = 'https://easemylife.app/';                                                                                                    // What: Live URL String. Why: The addresses the checks expect start from the live site's. How: This is its address.



// #region PAG_HEA_ARR

/**
 * PAG_HEA_ARR = Page Head Array
 *
 * @summary
 * What each indexed page's head should say. Every row shares one shape, so
 * its fields carry no comments of their own, its description last as the
 * row's prose:
 *
 * - `canStr` (String): Canonical String, the page's canonical address.
 *
 * - `desStr` (String): Description String, the page's own description.
 *
 * - `patStr` (String): Path String, the address the page is loaded from.
 *
 * - `titStr` (String): Title String, the page's exact title.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const PAG_HEA_ARR = [ // What: Page Head Array. Why: Every indexed page's head is checked against what it should say. How: Each row names one page, its title, its description, and its canonical address, in the sitemap's order.


	{ // What: Home Head Row. Why: The app's one address is its front door, so its head is checked first. How: This names its title, description, and canonical address.


		canStr : LIV_URL_STR,
		patStr : '/',
		titStr : HOM_TIT_STR,

		desStr : HOM_DES_STR


	},

	{ // What: Privacy Head Row. Why: The privacy policy is indexed with its own title. How: This names its title, description, and canonical address.


		canStr : 'https://easemylife.app/privacy',
		patStr : '/privacy',
		titStr : 'Ease My Life Privacy Policy',

		desStr : 'The Ease My Life Privacy Policy: how the app collects, uses, shares, and protects your information, and the rights you hold.'


	},

	{ // What: Terms Head Row. Why: The terms are indexed with their own title. How: This names their title, description, and canonical address.


		canStr : 'https://easemylife.app/terms',
		patStr : '/terms',
		titStr : 'Ease My Life Terms of Service',

		desStr : 'The Ease My Life Terms and Conditions: the agreement that governs your use of the app, its limits, and what each side owes.'


	}


];

// #endregion PAG_HEA_ARR



// #region SOC_KEY_ARR

/**
 * SOC_KEY_ARR = Social Key Array
 *
 * @summary
 * Every Open Graph and Twitter tag a complete link preview needs, per the
 * social preview rule, plus theme-color, which Discord edges its card with;
 * twitter:site and twitter:creator are left out, since the app has no X
 * account. Every row is one tag's property or name.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const SOC_KEY_ARR = [ // What: Social Key Array. Why: A complete link preview needs each of these tags. How: Each entry names one tag.


	'og:description',
	'og:image',
	'og:image:alt',
	'og:image:height',
	'og:image:type',
	'og:image:width',
	'og:locale',
	'og:site_name',
	'og:title',
	'og:type',
	'og:url',
	'theme-color',
	'twitter:card',
	'twitter:description',
	'twitter:image',
	'twitter:image:alt',
	'twitter:title'


];

// #endregion SOC_KEY_ARR

// #endregion Constants



// #region Module State

const SYN_PRI_STR = readFileSync( CON_PAT_STR, 'utf8' ).match( /SYN_PRI_STR = '\$([0-9.]+)'/ )?.[ 1 ] ?? ''; // What: Sync Price String. Why: The price lives in three places that must agree, and the structured data is one of them. How: This reads the app's own price from src/constants.ts, without its dollar sign, since that file reads build settings Node can't load.

// #endregion Module State



// #region Helpers

// #region imaSizFun

/**
 * imaSizFun = Image Size Function
 *
 * @summary
 * Reads a PNG's width and height from its own bytes, which a PNG keeps at a
 * fixed place in its header, or zeros for a file that isn't a PNG, so a
 * check of the size fails rather than throwing.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param imaBufObj - Image Buffer Object: The image's bytes.
 *
 * @returns The image's width and height in pixels, or zeros.
 *
 * @example
 * ```ts
 * imaSizFun(imaBufObj) // => [ 1200, 630 ]
 * ```
 *
*/

function imaSizFun ( imaBufObj : Buffer ) : [ number, number ] {


	if ( imaBufObj.length < 24 || imaBufObj.readUInt32BE( 0 ) !== 0x89504E47 ) return [ 0, 0 ]; // What: Not PNG Guard. Why: Only a PNG keeps its size where this reads it. How: This returns zeros when the PNG signature doesn't lead the file.



	return [ imaBufObj.readUInt32BE( 16 ), imaBufObj.readUInt32BE( 20 ) ]; // What: PNG Size Return. Why: A PNG's width and height sit at bytes 16 and 20 of its header. How: This reads both.


}

// #endregion imaSizFun



// #region metTagFun

/**
 * metTagFun = Meta Tag Function
 *
 * @summary
 * Lists the meta tags in a page's raw HTML as pairs of name or property and
 * decoded content, in the page's order, so a check reads tags the way a link
 * scraper does, without a browser and with repeats kept.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param htmTexStr - HTML Text String: The page's raw HTML.
 *
 * @returns One pair per meta tag, its name or property first and its decoded
 *          content second, in the page's order.
 *
 * @example
 * ```ts
 * metTagFun(rawHtmStr) // => [ [ 'description', 'Pick what to do today...' ] ]
 * ```
 *
*/

const metTagFun = ( htmTexStr : string ) : [ string, string ][] => [ ...htmTexStr.matchAll( /<meta\s+(?:name|property)=(['"])([^'"]+)\1\s+content=(['"])(.*?)\3/g ) ].map( ( tagMatArr ) => [ tagMatArr[ 2 ], tagMatArr[ 4 ].replace( /&quot;/g, '"' ).replace( /&#39;/g, "'" ).replace( /&amp;/g, '&' ) ] ); // What: Meta Tag Function. Why: The raw page's tags are read without a browser, the way a link scraper reads them, and repeats have to be counted. How: This lists each meta tag's name or property with its decoded content, in the page's order.

// #endregion metTagFun

// #endregion Helpers



// #region Module Init

for ( const heaRowObj of PAG_HEA_ARR ) { // What: Raw Head Loop. Why: Every indexed page's raw head is read the way a script-free crawler reads it. How: This declares one test per page.


	test( `${ heaRowObj.patStr } raw page has its own title, description, canonical, and author`, async ( { request : reqCotObj } ) => { // What: Raw Head Test. Why: Link checkers and many crawlers never run a script, so each page's head has to be complete in the file that ships. How: This fetches the built page without a browser and checks its title, description, canonical address, author, and that nothing keeps it out of search.


		// #region Raw Page Reading

		const rawHtmStr = await ( await reqCotObj.get( `${ PRE_URL_STR }${ heaRowObj.patStr }` ) ).text();                                              // What: Raw HTML String. Why: The page is read the way a script-free reader reads what ships. How: This fetches the built page's HTML without a browser.
		const titMatArr = [ ...rawHtmStr.matchAll( /<title>([^<]*)<\/title>/g ) ].map( ( titCurArr ) => titCurArr[ 1 ].replace( /&amp;/g, '&' ) );      // What: Title Match Array. Why: A page should have exactly one title. How: This reads every title element's decoded text.
		const desConArr = metTagFun( rawHtmStr ).filter( ( [ tagKeyStr ] ) => tagKeyStr === 'description' ).map( ( [ , tagConStr ] ) => tagConStr );    // What: Description Content Array. Why: A page should have exactly one description. How: This reads every description tag's text.
		const canHreArr = [ ...rawHtmStr.matchAll( /<link\s+href=(['"])([^'"]+)\1\s+rel=(['"])canonical\3/g ) ].map( ( canMatArr ) => canMatArr[ 2 ] ); // What: Canonical Hypertext-Reference Array. Why: A page should name exactly one canonical address. How: This reads every canonical link's address.

		// #endregion Raw Page Reading



		// #region Head Assertions

		expect( titMatArr ).toEqual( [ heaRowObj.titStr ] );                       // What: Single Title Assertion. Why: Search listings and tabs name the page by its one title. How: This checks the page has exactly its row's title.
		expect( heaRowObj.titStr.length ).toBeLessThanOrEqual( 60 );               // What: Title Length Assertion. Why: A page's title stays under about 60 characters. How: This checks it's at most 60 characters.
		expect( desConArr ).toEqual( [ heaRowObj.desStr ] );                       // What: Single Description Assertion. Why: Two descriptions leave search engines to guess, and each page should describe itself. How: This checks the page has exactly its row's description.
		expect( heaRowObj.desStr.length ).toBeGreaterThanOrEqual( 120 );           // What: Description Minimum Assertion. Why: Link preview checkers flag a description under 120 characters. How: This checks it runs at least 120 characters.
		expect( heaRowObj.desStr.length ).toBeLessThanOrEqual( 125 );              // What: Description Maximum Assertion. Why: Phones cut a summary off around 125 characters. How: This checks it stays within that.
		expect( canHreArr ).toEqual( [ heaRowObj.canStr ] );                       // What: Single Canonical Assertion. Why: Every address Netlify serves the page at should count as its live one. How: This checks the page names exactly its row's canonical address.
		expect( heaRowObj.canStr.startsWith( LIV_URL_STR ) ).toBe( true );         // What: Absolute Canonical Assertion. Why: A canonical address has to be absolute, on this domain, over HTTPS. How: This checks it starts with the live site's address.
		expect( metTagFun( rawHtmStr ).filter( ( [ tagKeyStr ] ) => tagKeyStr === 'author' ).map( ( [ , tagConStr ] ) => tagConStr ) ).toEqual( [ 'techgeek.dev' ] ); // What: Author Assertion. Why: The page names techgeek.dev, who built the app, as its author. How: This checks the one author tag.
		expect( rawHtmStr ).not.toContain( 'noindex' );                            // What: Indexable Page Assertion. Why: The page has to stay findable. How: This checks the page's raw HTML holds no noindex at all.
		expect( heaPatFun( heaRowObj.patStr )[ 'x-robots-tag' ] ).toBeUndefined(); // What: Indexable Header Assertion. Why: A robots header would keep the page out as surely as a tag. How: This checks the built headers file sends none with its path.

		// #endregion Head Assertions


	} );


}



test( 'every indexed page has its own title and description', () => { // What: Unique Head Test. Why: Search listings should tell the pages apart, so no two indexed pages share a title or a description. How: This checks the rows' titles and descriptions each hold no repeat, which the raw head tests prove each page shows.


	expect( new Set( PAG_HEA_ARR.map( ( heaRowObj ) => heaRowObj.titStr ) ).size ).toBe( PAG_HEA_ARR.length ); // What: Unique Title Assertion. Why: Two pages with one title read as the same page in a listing. How: This checks the set of titles is as large as the list.
	expect( new Set( PAG_HEA_ARR.map( ( heaRowObj ) => heaRowObj.desStr ) ).size ).toBe( PAG_HEA_ARR.length ); // What: Unique Description Assertion. Why: Two pages with one description read as the same page in a listing. How: This checks the set of descriptions is as large as the list.


} );



for ( const staRcdObj of STA_RCD_ARR ) { // What: State Head Loop. Why: The app renders every screen at one address, so no screen may add a second description or canonical link. How: This declares one test per state.


	test( `${ staRcdObj.ideStr } keeps the one title, description, and canonical link`, async ( { page : curPagObj } ) => { // What: State Head Test. Why: React adds a rendered description beside index.html's rather than replacing it, which would leave two. How: This opens the state in a browser and checks its title and that it has exactly one description and one canonical link, index.html's.


		// #region State Load

		const errMesArr = watErrFun( curPagObj ); // What: Error Message Array. Why: The state fails on any page error. How: This starts watching.


		await opeStaFun( curPagObj, staRcdObj ); // What: State Open Call. Why: The state's screens have to render before the head is read. How: This opens the state the way the accessibility suite does.

		// #endregion State Load



		// #region Head Checks

		await expect( curPagObj ).toHaveTitle( HOM_TIT_STR );                                                      // What: Title Assertion. Why: The app keeps its home title on every screen. How: This checks the document's title.
		await expect( curPagObj.locator( 'meta[name="description"]' ) ).toHaveCount( 1 );                          // What: Single Description Assertion. Why: Two descriptions leave search engines to guess. How: This checks there's exactly one.
		await expect( curPagObj.locator( 'meta[name="description"]' ) ).toHaveAttribute( 'content', HOM_DES_STR ); // What: Home Description Assertion. Why: Every screen sits at the home address, so it keeps the home description. How: This checks the one description holds it.
		await expect( curPagObj.locator( 'link[rel="canonical"]' ) ).toHaveAttribute( 'href', LIV_URL_STR );       // What: Canonical Assertion. Why: Every screen counts as the app's one address. How: This checks the one canonical link names it, which also fails on a second link.

		// #endregion Head Checks



		expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); // What: Error Assertion. Why: A state that logged an error failed even if it loaded. How: This expects no errors.


	} );


}



for ( const heaRowObj of PAG_HEA_ARR.slice( 1 ) ) { // What: Legal Head Loop. Why: The legal pages are static pages whose head a browser could still change through their script. How: This declares one test per legal page.


	test( `${ heaRowObj.patStr } shows its own head and one h1 in a browser`, async ( { page : curPagObj } ) => { // What: Legal Head Test. Why: A visitor's browser runs the page's script, which must leave its head as it ships. How: This loads the page and checks its title, its one description and canonical link, and its one h1.


		// #region Page Load

		const errMesArr = watErrFun( curPagObj ); // What: Error Message Array. Why: The page fails on any page error. How: This starts watching.


		await curPagObj.goto( heaRowObj.patStr ); // What: Legal Page Open Call. Why: The check starts on its page. How: This loads it.

		// #endregion Page Load



		// #region Head Checks

		await expect( curPagObj ).toHaveTitle( heaRowObj.titStr );                                                      // What: Title Assertion. Why: The tab and listings name the page by its title. How: This checks the page's own title.
		await expect( curPagObj.locator( 'meta[name="description"]' ) ).toHaveCount( 1 );                               // What: Single Description Assertion. Why: Two descriptions leave search engines to guess. How: This checks there's exactly one.
		await expect( curPagObj.locator( 'meta[name="description"]' ) ).toHaveAttribute( 'content', heaRowObj.desStr ); // What: Own Description Assertion. Why: Each page should describe itself. How: This checks the one description holds the row's text.
		await expect( curPagObj.locator( 'link[rel="canonical"]' ) ).toHaveAttribute( 'href', heaRowObj.canStr );       // What: Canonical Assertion. Why: Every address the page is served at should count as its live one. How: This checks the one canonical link names it.
		await expect( curPagObj.getByRole( 'heading', { level : 1 } ) ).toHaveCount( 1 );                               // What: Single Heading Assertion. Why: One h1 tells search engines and screen readers what the page is about. How: This checks there's exactly one.

		// #endregion Head Checks



		expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); // What: Error Assertion. Why: A page that logged an error failed even if it loaded. How: This expects no errors.


	} );


}



test( 'the raw home page carries its full link preview', async ( { request : reqCotObj } ) => { // What: Raw Preview Test. Why: Link scrapers never run the app's script, so the raw page alone decides the card a shared link shows. How: This fetches the built root without a browser and checks every preview tag, its addresses, its texts, and its image's stated type and size.


	// #region Raw Tags Reading

	const rawHtmStr = await ( await reqCotObj.get( `${ PRE_URL_STR }/` ) ).text(); // What: Raw HTML String. Why: The tags are read the way a scraper reads what ships. How: This fetches the built root's HTML without a browser.
	const socTagObj = Object.fromEntries( metTagFun( rawHtmStr ) );                // What: Social Tag Object. Why: Each tag is looked up by its name or property. How: This keys the page's meta tags, the later of two theme colors winning.
	const expImaStr = `${ LIV_URL_STR }assets/og-image-3.png`;                     // What: Expected Image String. Why: The card shows the app's preview image. How: This is its absolute address.

	// #endregion Raw Tags Reading



	// #region Preview Tag Checks

	expect( SOC_KEY_ARR.filter( ( socKeyStr ) => !socTagObj[ socKeyStr ] ) ).toEqual( [] );                                                      // What: Complete Tags Assertion. Why: An app shows a bare link when a tag it needs is missing. How: This lists any required tag the page lacks.
	expect( [ socTagObj[ 'og:url' ], socTagObj[ 'og:image' ], socTagObj[ 'twitter:image' ] ] ).toEqual( [ LIV_URL_STR, expImaStr, expImaStr ] ); // What: Address Assertion. Why: Scrapers need absolute HTTPS addresses for the page and its image. How: This checks each against the live site's.
	expect( [ socTagObj[ 'og:description' ], socTagObj[ 'twitter:description' ] ] ).toEqual( [ HOM_DES_STR, HOM_DES_STR ] );                     // What: Description Assertion. Why: The card's summary matches the page's own description. How: This checks both copies.
	expect( socTagObj[ 'twitter:title' ] ).toBe( socTagObj[ 'og:title' ] );                                                                      // What: Title Match Assertion. Why: The card's title reads the same under Open Graph and Twitter. How: This checks the two titles agree.
	expect( socTagObj[ 'og:title' ].length ).toBeLessThanOrEqual( 60 );                                                                          // What: Title Length Assertion. Why: A card title stays under about 60 characters. How: This checks it's at most 60 characters.
	expect( socTagObj[ 'twitter:image:alt' ] ).toBe( socTagObj[ 'og:image:alt' ] );                                                              // What: Image Text Assertion. Why: The image's alternative text reads the same under Open Graph and Twitter. How: This checks the two alternatives agree.
	expect( [ socTagObj[ 'og:image:type' ], socTagObj[ 'og:image:width' ], socTagObj[ 'og:image:height' ], socTagObj[ 'og:type' ], socTagObj[ 'twitter:card' ], socTagObj[ 'og:locale' ] ] ).toEqual( [ 'image/png', '1200', '630', 'website', 'summary_large_image', 'en_US' ] ); // What: Image And Type Assertion. Why: The card tags have to state the image's real type and size, the page's type, the card type, and the locale. How: This checks them, the page's type, the card type, and the locale.

	// #endregion Preview Tag Checks


} );



test( 'every icon the head links to is served at its size', async ( { page : curPagObj, request : reqCotObj } ) => { // What: Icons Test. Why: Browsers and apps fetch the icons the head names, and some show them beside a link's card, so a missing or wrong-sized one shows a blank or blurry mark. How: This reads every icon link and checks each file is served, the SVG as an SVG, the ICO as an icon file, and each PNG at the size its link promises.


	// #region Icon Link Reading

	await curPagObj.goto( '/' ); // What: Home Load Call. Why: The icon links live in the page's head. How: This opens the app.


	const icoLinArr = await curPagObj.locator( 'link[rel="icon"], link[rel="apple-touch-icon"]' ).evaluateAll( ( linEleArr ) => linEleArr.map( ( linCurEle ) => [ linCurEle.getAttribute( 'href' ) || '', linCurEle.getAttribute( 'sizes' ) || '' ] ) ); // What: Icon Link Array. Why: Each icon is checked against its own link. How: This reads every icon link's address and size.

	// #endregion Icon Link Reading



	// #region Icon List Checks

	expect( icoLinArr.map( ( [ icoHreStr ] ) => icoHreStr ) ).toContain( 'assets/apple-touch-icon.png' ); // What: Touch Icon Assertion. Why: iOS and some apps draw the app's mark from this link. How: This checks it's linked.
	expect( icoLinArr.length ).toBe( 6 );                                                                 // What: Icon Count Assertion. Why: The set is the SVG, two small PNGs, the ICO, the large PNG, and the Apple touch icon. How: This checks six icon links are present.

	// #endregion Icon List Checks



	for ( const [ icoHreStr, icoSizStr ] of icoLinArr ) { // What: Icon Check Loop. Why: Every linked icon has to be real. How: This fetches each one in turn.


		const icoResObj = await reqCotObj.get( icoHreStr ); // What: Icon Response Object. Why: The icon has to exist where its link points. How: This fetches it.
		const icoBufObj = await icoResObj.body();           // What: Icon Buffer Object. Why: A file's type and a PNG's size are read from its bytes. How: This reads them.


		expect( [ icoHreStr, icoResObj.ok() ] ).toEqual( [ icoHreStr, true ] ); // What: Icon Served Assertion. Why: A missing icon falls through to the app's HTML. How: This checks the file is served, naming it on failure.



		if ( icoHreStr.endsWith( '.svg' ) ) { // What: SVG Icon Guard. Why: The SVG mark has no fixed size to check. How: This checks it's served as an SVG and moves on.


			expect( icoResObj.headers()[ 'content-type' ] ).toContain( 'image/svg+xml' ); // What: SVG Type Assertion. Why: The icon link names an SVG file, so it has to be served as one. How: This checks the served type.



			continue; // What: SVG Skip. Why: The size checks below don't apply to it. How: This moves on to the next icon.


		}



		if ( icoHreStr.endsWith( '.ico' ) ) { // What: ICO Header Guard. Why: favicon.ico isn't a PNG and holds several sizes. How: This checks its header marks it an icon file and moves on.


			expect( icoBufObj.readUInt16LE( 2 ) ).toBe( 1 ); // What: ICO Type Assertion. Why: The file has to be a real icon file. How: This checks its header's type field reads 1.



			continue; // What: ICO Skip. Why: The PNG size check below doesn't apply to it. How: This moves on to the next icon.


		}



		const [ icoWidNum, icoHeiNum ] = imaSizFun( icoBufObj ); // What: Icon Width Number. Why: The size is compared with the link's. How: This reads the PNG's width. // What: Icon Height Number. Why: The size is compared with the link's. How: This reads the PNG's height.


		expect( [ icoHreStr, `${ icoWidNum }x${ icoHeiNum }` ] ).toEqual( [ icoHreStr, icoSizStr || '180x180' ] ); // What: PNG Icon Size Assertion. Why: Each PNG should be the size its link promises, and the Apple touch icon, whose link names no size, the 180px iOS draws. How: This checks the size read from its header, naming the file on failure.


	}


} );



test( 'the link preview image is 1,200x630 and under 300 KB', async ( { request : reqCotObj } ) => { // What: Preview Image Test. Why: The tags promise the image's size, and the Social Previews rule keeps the image under 300 KB. How: This fetches the image from the build and checks its type, its 1,200 by 630 size, and its bytes against the limit.


	const imaResObj = await reqCotObj.get( `${ PRE_URL_STR }/assets/og-image-3.png` ); // What: Image Response Object. Why: The image has to exist where the tags point. How: This fetches it from the build.
	const imaBufObj = await imaResObj.body();                                          // What: Image Buffer Object. Why: The image's size is read from its bytes. How: This reads them.


	expect( imaResObj.headers()[ 'content-type' ] ).toBe( 'image/png' ); // What: Image Type Assertion. Why: A missing image falls through to the app's HTML. How: This checks the file is served as a PNG.
	expect( imaSizFun( imaBufObj ) ).toEqual( [ 1200, 630 ] );           // What: Image Size Assertion. Why: The tags promise 1,200x630. How: This reads the image's real size.
	expect( imaBufObj.length ).toBeLessThan( 300 * 1024 );               // What: Image Bytes Assertion. Why: The Social Previews rule keeps the image under 300 KB. How: This checks the file is under the limit.


} );



test( 'the structured data describes the app and its sync price', async ( { request : reqCotObj } ) => { // What: Structured Data Test. Why: Search engines may show the app's details and price from the JSON-LD, so every claim has to match what the app shows. How: This parses the raw page's data and checks its type, name, address, and both offers against the app's own price.


	// #region Structured Data Reading

	const rawHtmStr = await ( await reqCotObj.get( `${ PRE_URL_STR }/` ) ).text();                                                                            // What: Raw HTML String. Why: Crawlers read the data from the page that ships. How: This fetches the built root's HTML without a browser.
	const ldjTexArr = [ ...rawHtmStr.matchAll( /<script type=(['"])application\/ld\+json\1>([\s\S]*?)<\/script>/g ) ].map( ( ldjMatArr ) => ldjMatArr[ 2 ] ); // What: Linked-Data-JSON Text Array. Why: The page should carry one block of data. How: This reads every JSON-LD script's text.

	type LdjAppTyp = { '@type'? : string, description? : string, name? : string, offers? : { name? : string, price? : string, priceCurrency? : string }[], url? : string }; // What: Linked-Data-JSON App Type. Why: The checks read a handful of the data's fields. How: This types the fields they use.

	const ldjAppObj : LdjAppTyp = JSON.parse( ldjTexArr[ 0 ] ?? '{}' ); // What: Linked-Data-JSON App Object. Why: The app's details are checked together. How: This parses the one block, or an empty object.

	// #endregion Structured Data Reading



	// #region Structured Data Checks

	expect( ldjTexArr.length ).toBe( 1 );                                                                                           // What: Single Block Assertion. Why: Two blocks could describe the app two ways. How: This checks there's one.
	expect( [ ldjAppObj[ '@type' ], ldjAppObj.name, ldjAppObj.url ] ).toEqual( [ 'WebApplication', 'Ease My Life', LIV_URL_STR ] ); // What: App Assertion. Why: The app is a web application at its one address. How: This checks its type, its name, and its address.
	expect( ldjAppObj.description ).toBeTruthy();                                                                                   // What: Description Assertion. Why: Search engines read what the app does from the data. How: This checks it carries a description.
	expect( SYN_PRI_STR ).not.toBe( '' );                                                                                           // What: Price Found Assertion. Why: A price that couldn't be read would compare against nothing. How: This checks the app's price was read.
	expect( ldjAppObj.offers?.map( ( offCurObj ) => [ offCurObj.name, offCurObj.price, offCurObj.priceCurrency ] ) ).toEqual( [ [ 'Ease My Life', '0', 'USD' ], [ 'Ease My Life Sync', SYN_PRI_STR, 'USD' ] ] ); // What: Offers Assertion. Why: The app is free, and the optional sync costs what the Account section shows. How: This checks the free offer and the sync offer, whose price must match SYN_PRI_STR.

	// #endregion Structured Data Checks


} );



test( 'robots.txt welcomes crawlers and names the sitemap', async ( { request : reqCotObj } ) => { // What: Robots File Test. Why: Crawlers read robots.txt before anything else. How: This fetches it from the build and checks its one rule group, that nothing is disallowed, and its sitemap line.


	const robTexStr = await ( await reqCotObj.get( `${ PRE_URL_STR }/robots.txt` ) ).text(); // What: Robots Text String. Why: The file's rules are checked as they ship. How: This fetches and reads it.


	expect( robTexStr ).toContain( 'User-agent: *\nAllow: /' );              // What: Allow All Assertion. Why: Every crawler may read the app and its legal pages. How: This checks the one rule group.
	expect( robTexStr ).not.toContain( 'Disallow' );                         // What: No Disallow Assertion. Why: Nothing public needs hiding from crawlers. How: This checks no rule shuts one out.
	expect( robTexStr ).toContain( `Sitemap: ${ LIV_URL_STR }sitemap.xml` ); // What: Sitemap Line Assertion. Why: Crawlers find the sitemap from this line. How: This checks it names the live sitemap.


} );



test( 'the sitemap lists exactly the indexed pages', async ( { request : reqCotObj } ) => { // What: Sitemap Test. Why: The sitemap should list exactly the indexed pages, by their canonical addresses. How: This fetches it from the build and compares its addresses with the rows'.


	const sitXmlStr = await ( await reqCotObj.get( `${ PRE_URL_STR }/sitemap.xml` ) ).text(); // What: Sitemap XML String. Why: The file's addresses are checked as they ship. How: This fetches and reads it.


	expect( [ ...sitXmlStr.matchAll( /<loc>([^<]+)<\/loc>/g ) ].map( ( locMatArr ) => locMatArr[ 1 ] ) ).toEqual( PAG_HEA_ARR.map( ( heaRowObj ) => heaRowObj.canStr ) ); // What: Indexed Pages Assertion. Why: Missing a page slows its discovery, and an extra one would point crawlers at an address the app replaces. How: This checks the sitemap's addresses equal the rows' canonical addresses, in order.


} );

// #endregion Module Init


