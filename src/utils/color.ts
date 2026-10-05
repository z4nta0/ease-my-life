


/**
 * color.ts = Color
 *
 * @summary
 * Color math with no knowledge of the app: invColFun inverts a hex color's
 * lightness in OKLab while keeping its hue and chroma.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region invColFun

/**
 * invColFun = Invert Color Function
 *
 * @summary
 * Inverts a hex color's own lightness (keeping its hue/chroma) using
 * plain OKLab math, then reads back a plain hex string so the result
 * stays usable directly as an <input type="color"> value (which only
 * accepts hex; a raw "oklch(from ...)" string would be rejected). Used
 * to auto-derive a custom theme's dark/light counterpart from whichever
 * one the user actually edited.
 *
 * Hex/OKLab conversion follows Bjorn Ottosson's own reference formulas,
 * used here instead of round-tripping through the browser's own CSS
 * color parser: both getComputedStyle and canvas fillStyle produced
 * garbage in testing against "oklch(from ...)" relative-color strings.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param hexColStr - Hex Color String: The '#rrggbb' (or '#rgb') color to
 *                    invert.
 *
 * @returns The inverted color, as a '#rrggbb' string, or hexColStr
 * itself unchanged if the conversion throws.
 *
 * @example
 * ```ts
 * invColFun('#1e2230') // => '#e2ddc2'-ish inverted hex string
 * ```
 *
*/

function invColFun ( hexColStr : string ) : string {


	try { // What: Color Conversion Try. Why: Any malformed input must fall back to the original color instead of throwing. How: The catch below returns hexColStr unchanged.


		const rgbZerArr = ( () => { // What: Rgb Zero-One Array. Why: The OKLab math below operates on linear-light RGB, not raw hex. How: This strips the leading '#', expands a 3-digit shorthand, parses the hex to an integer, and splits it into 0-1 channel values.


			const hexBarStr = hexColStr.replace( '#', '' ); // What: Hex Bare String. Why: The '#' prefix isn't part of the actual hex digits parseInt below needs. How: This strips it from hexColStr.

			const hexFulStr = hexBarStr.length === 3 // What: Hex Full String. Why: A 3-digit shorthand ('abc') must be expanded to 6 digits ('aabbcc') before parseInt can read it as a 24-bit color. How: This doubles each of the 3 characters when hexBarStr is that short, otherwise uses it as-is.
				? hexBarStr.split( '' ).map( ( curChrStr ) => curChrStr + curChrStr ).join( '' ) // What: Shorthand Expand Branch. Why: A 3-digit color must double each digit first. How: This repeats every character once and joins them back.
				: hexBarStr;                                                                     // What: Full Hex Branch. Why: A 6-digit color is already in the needed form. How: This passes hexBarStr through.

			const hexIntNum = parseInt( hexFulStr, 16 ); // What: Hex Integer Number. Why: The channel splits below need one plain 24-bit integer to bit-shift/mask against. How: This parses hexFulStr as base-16.



			return [ ( hexIntNum >> 16 & 255 ) / 255, ( hexIntNum >> 8 & 255 ) / 255, ( hexIntNum & 255 ) / 255 ]; // What: Rgb Zero-One Return. Why: The caller needs each channel scaled to the 0-1 range OKLab math expects. How: This bit-shifts/masks out red, green, then blue, each divided by 255.


		} )();

		const srgLinFun = ( srgChaNum : number ) => srgChaNum <= 0.04045 ? srgChaNum / 12.92 : Math.pow( ( srgChaNum + 0.055 ) / 1.055, 2.4 ); // What: Srgb Linear Function. Why: sRGB's own gamma curve must be undone before OKLab's linear-light math applies. How: This applies the standard sRGB-to-linear piecewise formula to one channel.

		const linSrgFun = ( linChaNum : number ) => { // What: Linear Srgb Function. Why: The final result must be re-encoded back into sRGB gamma before it's a displayable hex color. How: This applies the standard linear-to-sRGB piecewise formula to one clamped channel.


			const claChaNum = Math.max( 0, Math.min( 1, linChaNum ) ); // What: Clamped Channel Number. Why: A channel driven outside 0-1 by the inversion math must be clamped before re-encoding. How: This clamps linChaNum into the [0,1] range.



			return claChaNum <= 0.0031308 ? claChaNum * 12.92 : 1.055 * Math.pow( claChaNum, 1 / 2.4 ) - 0.055; // What: Linear To Srgb Return. Why: The caller needs one re-encoded sRGB channel. How: This applies the piecewise sRGB encoding formula to claChaNum.


		};

		const linOklFun = ( [ linRedNum, linGrnNum, linBluNum ] : number[] ) => { // What: Linear Oklab Function. Why: Lightness must be inverted in OKLab space, not raw RGB, for a perceptually sane result. How: This applies Ottosson's own linear-RGB-to-OKLab matrix multiplication and cube roots.


			const lmsLonNum = 0.4122214708 * linRedNum + 0.5363325363 * linGrnNum + 0.0514459929 * linBluNum; // What: Long-Medium-Short Long Number. Why: OKLab's own Long/Medium/Short cone response must be computed before the cube root below. How: This is the Long-cone row of Ottosson's linear-RGB-to-LMS matrix.
			const lmsMedNum = 0.2119034982 * linRedNum + 0.6806995451 * linGrnNum + 0.1073969566 * linBluNum; // What: Long-Medium-Short Medium Number. Why: OKLab's own Long/Medium/Short cone response must be computed before the cube root below. How: This is the Medium-cone row of Ottosson's linear-RGB-to-LMS matrix.
			const lmsShoNum = 0.0883024619 * linRedNum + 0.2817188376 * linGrnNum + 0.6299787005 * linBluNum; // What: Long-Medium-Short Short Number. Why: OKLab's own Long/Medium/Short cone response must be computed before the cube root below. How: This is the Short-cone row of Ottosson's linear-RGB-to-LMS matrix.
			const cbrLonNum = Math.cbrt( lmsLonNum );                                                         // What: Cube-Root Long Number. Why: OKLab's own nonlinearity is a cube root of each cone response, applied before the final matrix. How: This cube-roots lmsLonNum.
			const cbrMedNum = Math.cbrt( lmsMedNum );                                                         // What: Cube-Root Medium Number. Why: OKLab's own nonlinearity is a cube root of each cone response, applied before the final matrix. How: This cube-roots lmsMedNum.
			const cbrShoNum = Math.cbrt( lmsShoNum );                                                         // What: Cube-Root Short Number. Why: OKLab's own nonlinearity is a cube root of each cone response, applied before the final matrix. How: This cube-roots lmsShoNum.



			return [ // What: Oklab Triple Return. Why: The caller needs the L/a/b triple OKLab itself defines. How: This applies Ottosson's own LMS-to-OKLab matrix to the cube-rooted values above.


				0.2104542553 * cbrLonNum + 0.7936177850 * cbrMedNum - 0.0040720468 * cbrShoNum, // What: Oklab Lightness Component. Why: This is OKLab's own L channel, the value the rest of this function actually inverts. How: This applies Ottosson's own LMS-to-OKLab matrix's L row to the cube-rooted Long/Medium/Short values.
				1.9779984951 * cbrLonNum - 2.4285922050 * cbrMedNum + 0.4505937099 * cbrShoNum, // What: Oklab A Component. Why: This is OKLab's own a channel, the green-red chroma axis. How: This applies Ottosson's own LMS-to-OKLab matrix's a row to the cube-rooted Long/Medium/Short values.
				0.0259040371 * cbrLonNum + 0.7827717662 * cbrMedNum - 0.8086757660 * cbrShoNum  // What: Oklab B Component. Why: This is OKLab's own b channel, the blue-yellow chroma axis. How: This applies Ottosson's own LMS-to-OKLab matrix's b row to the cube-rooted Long/Medium/Short values.


			];


		};

		const oklLinFun = ( [ oklLigNum, oklAaxNum, oklBaxNum ] : number[] ) => { // What: Oklab Linear Function. Why: Once lightness is inverted in OKLab, the result must be converted back to linear RGB before re-encoding. How: This applies Ottosson's own inverse OKLab-to-LMS matrix, cubes each term, then his inverse LMS-to-linear-RGB matrix.


			const lmsLonPriNum = oklLigNum + 0.3963377774 * oklAaxNum + 0.2158037573 * oklBaxNum; // What: Long-Medium-Short Long Prime Number. Why: OKLab's own inverse must first reconstruct the cube-rooted LMS terms before cubing them back. How: This is the Long-term row of Ottosson's inverse OKLab-to-LMS matrix.
			const lmsMedPriNum = oklLigNum - 0.1055613458 * oklAaxNum - 0.0638541728 * oklBaxNum; // What: Long-Medium-Short Medium Prime Number. Why: OKLab's own inverse must first reconstruct the cube-rooted LMS terms before cubing them back. How: This is the Medium-term row of Ottosson's inverse OKLab-to-LMS matrix.
			const lmsShoPriNum = oklLigNum - 0.0894841775 * oklAaxNum - 1.2914855480 * oklBaxNum; // What: Long-Medium-Short Short Prime Number. Why: OKLab's own inverse must first reconstruct the cube-rooted LMS terms before cubing them back. How: This is the Short-term row of Ottosson's inverse OKLab-to-LMS matrix.

			const lmsLonNum = lmsLonPriNum * lmsLonPriNum * lmsLonPriNum; // What: Long-Medium-Short Long Number. Why: The cube root taken on the forward pass must be undone by cubing here. How: This cubes lmsLonPriNum.
			const lmsMedNum = lmsMedPriNum * lmsMedPriNum * lmsMedPriNum; // What: Long-Medium-Short Medium Number. Why: The cube root taken on the forward pass must be undone by cubing here. How: This cubes lmsMedPriNum.
			const lmsShoNum = lmsShoPriNum * lmsShoPriNum * lmsShoPriNum; // What: Long-Medium-Short Short Number. Why: The cube root taken on the forward pass must be undone by cubing here. How: This cubes lmsShoPriNum.



			return [ // What: Linear Rgb Triple Return. Why: The caller needs plain linear-light RGB, ready for the sRGB re-encoding step. How: This applies Ottosson's own inverse LMS-to-linear-RGB matrix to lmsLonNum/lmsMedNum/lmsShoNum.


				4.0767416621 * lmsLonNum - 3.3077115913 * lmsMedNum + 0.2309699292 * lmsShoNum,  // What: Linear Red Channel. Why: The caller needs the red channel of the inverted color, still in linear light. How: This applies Ottosson's own inverse LMS-to-linear-RGB matrix's red row to lmsLonNum/lmsMedNum/lmsShoNum.
				-1.2684380046 * lmsLonNum + 2.6097574011 * lmsMedNum - 0.3413193965 * lmsShoNum, // What: Linear Green Channel. Why: The caller needs the green channel of the inverted color, still in linear light. How: This applies Ottosson's own inverse LMS-to-linear-RGB matrix's green row to lmsLonNum/lmsMedNum/lmsShoNum.
				-0.0041960863 * lmsLonNum - 0.7034186147 * lmsMedNum + 1.7076147010 * lmsShoNum  // What: Linear Blue Channel. Why: The caller needs the blue channel of the inverted color, still in linear light. How: This applies Ottosson's own inverse LMS-to-linear-RGB matrix's blue row to lmsLonNum/lmsMedNum/lmsShoNum.


			];


		};

		let [ oklLigNum, oklAaxNum, oklBaxNum ] = linOklFun( rgbZerArr.map( srgLinFun ) ); // What: Oklab Triple And Guard. Why: The rest of this function inverts and re-encodes this exact triple. How: This converts rgbZerArr through the linear-light/OKLab pipeline built above.


		if ( Math.hypot( oklAaxNum, oklBaxNum ) < 0.02 ) { // What: Chroma Near-Zero Guard. Why: Near-neutral colors carry a tiny residual a/b from floating-point noise in the forward conversion, which gets amplified when inverting an extreme lightness (e.g. a near-white background would invert to a visibly red-tinted near-black instead of neutral). How: This clamps a/b to true zero whenever their combined magnitude is below a small threshold.


			oklAaxNum = 0; // What: Oklab A-Axis Number Clamp. Why: This channel's own tiny residual must not survive the inversion below. How: This zeroes oklAaxNum.
			oklBaxNum = 0; // What: Oklab B-Axis Number Clamp. Why: This channel's own tiny residual must not survive the inversion below. How: This zeroes oklBaxNum.


		}



		const invRgbArr = oklLinFun( [ 1 - oklLigNum, oklAaxNum, oklBaxNum ] ) // What: Inverted Rgb Array. Why: This is the actual lightness inversion (1 - L), converted back to a displayable channel range. How: This inverts oklLigNum, converts back to linear RGB, re-encodes to sRGB, then scales/rounds each channel to a 0-255 integer.
			.map( linSrgFun )                                       // What: Gamma Encode Step. Why: Screen colors are gamma-encoded sRGB, not linear light. How: This maps every channel through linSrgFun.
			.map( ( srgChaNum ) => Math.round( srgChaNum * 255 ) ); // What: Byte Scale Step. Why: Hex output needs whole 0-255 channel values. How: This scales each 0-1 channel by 255 and rounds it.



		return '#' + invRgbArr.map( ( chaValNum ) => Math.max( 0, Math.min( 255, chaValNum ) ).toString( 16 ).padStart( 2, '0' ) ).join( '' ); // What: Inverted Hex String Return. Why: The caller needs a plain '#rrggbb' string usable directly as a color input value. How: This clamps each channel into 0-255, hex-encodes it padded to 2 digits, and joins the 3 channels together.


	}

	catch ( errCatObj ) { return hexColStr; } // What: Conversion Failure Guard. Why: A malformed hexColStr must fall back to itself rather than throw all the way up to the caller. How: This returns hexColStr unchanged whenever anything above throws.


}

// #endregion invColFun

// #endregion Helpers



// #region Exports

export { invColFun }; // What: Named Export. Why: The custom theme actions derive one theme's colors from the other's. How: This exports invColFun by name.

// #endregion Exports


