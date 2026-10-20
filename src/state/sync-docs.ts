


// #region Imports

import { isoDayFun } from '../utils/date.ts'; // What: ISO Day Function. Why: A reminder log row is dated by its timestamp, which has to become the local day it happened on. How: This formats a Date as the local 'YYYY-MM-DD'.


import type { RawSavTyp } from '../core/data-model.ts'; // What: Raw Save Type. Why: The cloud copy holds saved rows and state of any shape the app has written. How: This types the log rows and documents.
import type { StaAppTyp } from '../core/data-model.ts'; // What: State App Type. Why: Splitting starts from, and joining ends at, the whole app state. How: This types both.

// #endregion Imports



/**
 * sync-docs.ts = Sync Documents
 *
 * @summary
 * Splits the app state into the documents the cloud copy is stored as, and
 * joins them back. Uploading the whole state on every sync would resend
 * years of unchanging history, so the state is split by how often its parts
 * change: one core document holds everything except the five history logs,
 * and each log is stored one month per document, named like
 * pickLog-2026-10. A month in the past never changes again, so a device
 * downloads it once. Each document is fingerprinted with a hash of its
 * canonical JSON (keys sorted), so a sync sends only the documents whose
 * content changed, and two devices that hold the same content agree on its
 * hash whatever order their keys came back in.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type LogKeyTyp = 'conditionalLog' | 'pickLog' | 'reminderLog' | 'reminderSkipLog' | 'vacationLog'; // What: Log Key Type. Why: Five state fields are append-only history logs, each split by month. How: This names them.

type SynDocTyp = Record< string, RawSavTyp >; // What: Sync Document Type. Why: The cloud copy is a set of named documents. How: This maps each document's id to its content.

// #endregion Types



// #region Constants

const COR_DOC_STR = 'core'; // What: Core Document String. Why: Everything except the history logs travels together in one document. How: This is its id.



type LogSpeTyp = { dayFun : ( logRowObj : RawSavTyp ) => string, ideFun : ( logRowObj : RawSavTyp ) => string, keyStr : LogKeyTyp }; // What: Log Specification Type. Why: Each log is described by the same three facts. How: This types one row of LOG_SPE_ARR.

// #region LOG_SPE_ARR

/**
 * LOG_SPE_ARR = Log Specification Array
 *
 * @summary
 * How each history log is split and merged: which state field it is, what
 * identifies one of its rows, and which local day a row belongs to. Every row
 * shares one shape, so its fields carry no comments of their own:
 *
 * - `dayFun` (Function): Day Function, returning the row's local
 *   'YYYY-MM-DD' day, which also names its month's document.
 *
 * - `ideFun` (Function): Identity Function, returning what identifies the
 *   row across devices. A vacation row has no id of its own, so it's
 *   identified by its day, item, and direction.
 *
 * - `keyStr` (String): Key String, the state field holding the log.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const LOG_SPE_ARR : LogSpeTyp[] = [ // What: Log Specification Array. Why: Splitting and merging treat every log the same way, given these three facts about it. How: Each row names a log, its row identity, and its row's day.


	{ dayFun : ( logRowObj ) => logRowObj.date,                                 ideFun : ( logRowObj ) => logRowObj.id,                                                  keyStr : 'conditionalLog'  }, // What: Conditional Log Row. Why: A conditional's day-off history. How: Its rows carry an id and a day.
	{ dayFun : ( logRowObj ) => logRowObj.date,                                 ideFun : ( logRowObj ) => logRowObj.id,                                                  keyStr : 'pickLog'         }, // What: Pick Log Row. Why: Every pick's history. How: Its rows carry an id and a day.
	{ dayFun : ( logRowObj ) => isoDayFun( new Date( logRowObj.completedAt ) ), ideFun : ( logRowObj ) => logRowObj.rowId,                                               keyStr : 'reminderLog'     }, // What: Reminder Log Row. Why: Every completed reminder. How: Its rows carry a row id and a completion time.
	{ dayFun : ( logRowObj ) => isoDayFun( new Date( logRowObj.skippedAt ) ),   ideFun : ( logRowObj ) => logRowObj.rowId,                                               keyStr : 'reminderSkipLog' }, // What: Reminder Skip Log Row. Why: Every skipped reminder. How: Its rows carry a row id and a skip time.
	{ dayFun : ( logRowObj ) => logRowObj.date,                                 ideFun : ( logRowObj ) => `${ logRowObj.date }|${ logRowObj.itemId }|${ logRowObj.on }`, keyStr : 'vacationLog'     }  // What: Vacation Log Row. Why: Every switch of an item off or on. How: Its rows carry a day but no id, so the day, item, and direction identify one.


];

// #endregion LOG_SPE_ARR


// #endregion Constants



// #region Helpers

// #region canJsoFun

/**
 * canJsoFun = Canonical JSON Function
 *
 * @summary
 * Serializes a value as JSON with every object's keys sorted, so the same
 * content always produces the same text. Plain JSON.stringify keeps keys in
 * the order they were written, which differs between a state the app built
 * and the same state read back from the cloud. Undefined object fields are
 * left out, the same way JSON.stringify leaves them out.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param valAnyObj - Value Any Object: The value to serialize.
 *
 * @returns The value's canonical JSON text.
 *
 * @example
 * ```ts
 * canJsoFun({ b: 1, a: 2 }) // => '{"a":2,"b":1}'
 * ```
 *
*/

function canJsoFun ( valAnyObj : RawSavTyp ) : string {


	if ( Array.isArray( valAnyObj ) ) return `[${ valAnyObj.map( ( arrCurObj ) => arrCurObj === undefined ? 'null' : canJsoFun( arrCurObj ) ).join( ',' ) }]`; // What: Array Guard. Why: An array keeps its order, and JSON writes an undefined entry as null. How: This serializes each entry in place.



	if ( valAnyObj === null || typeof valAnyObj !== 'object' ) return JSON.stringify( valAnyObj ); // What: Plain Value Guard. Why: A string, number, boolean, or null serializes as JSON already does. How: This hands it to JSON.stringify.



	const keyStrArr = Object.keys( valAnyObj ).filter( ( keyCurStr ) => valAnyObj[ keyCurStr ] !== undefined ).sort(); // What: Key String Array. Why: The keys are written in one fixed order, and undefined fields are dropped. How: This lists the defined keys, sorted.



	return `{${ keyStrArr.map( ( keyCurStr ) => `${ JSON.stringify( keyCurStr ) }:${ canJsoFun( valAnyObj[ keyCurStr ] ) }` ).join( ',' ) }}`; // What: Object Return. Why: The object serializes with its keys in sorted order. How: This joins each key and its serialized value.


}

// #endregion canJsoFun



// #region hasDocFun

/**
 * hasDocFun = Hash Document Function
 *
 * @summary
 * Fingerprints a document's content as an 8-digit hexadecimal FNV-1a hash of
 * its canonical JSON. A sync compares these to find which documents changed,
 * so a collision would only ever skip one upload of a document whose content
 * changed to something with the same hash, which a 32-bit hash makes
 * vanishingly rare for the handful of documents one person keeps.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param docAnyObj - Document Any Object: The document's content.
 *
 * @returns The content's hash, as 8 hexadecimal digits.
 *
 * @example
 * ```ts
 * hasDocFun(docAnyObj) // => '1f3a9c04'
 * ```
 *
*/

function hasDocFun ( docAnyObj : RawSavTyp ) : string {


	const jsoTexStr = canJsoFun( docAnyObj ); // What: JSON Text String. Why: The hash is of the canonical text, so key order can't change it. How: This serializes the document.

	let hasValNum = 0x811c9dc5; // What: Hash Value Number. Why: FNV-1a starts from a fixed offset. How: This holds the running 32-bit hash.


	for ( let chaIndNum = 0; chaIndNum < jsoTexStr.length; chaIndNum++ ) { // What: Character Loop. Why: Every character feeds the hash. How: This walks the text one code unit at a time.


		hasValNum ^= jsoTexStr.charCodeAt( chaIndNum ); // What: Character Mix. Why: FNV-1a folds each unit in first. How: This XORs it into the hash.

		hasValNum = Math.imul( hasValNum, 0x01000193 ); // What: Prime Multiply. Why: FNV-1a then multiplies by its prime. How: This multiplies with 32-bit overflow.


	}



	return ( hasValNum >>> 0 ).toString( 16 ).padStart( 8, '0' ); // What: Hash Return. Why: The hash is compared as text. How: This writes it as 8 unsigned hexadecimal digits.


}

// #endregion hasDocFun



// #region splStaFun

/**
 * splStaFun = Split State Function
 *
 * @summary
 * Splits the app state into its cloud documents: core, holding every field
 * except the five history logs and storage's own __ markers, and one
 * document per log per month, holding that month's rows in their original
 * order. A log with no rows in a month has no document for it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param staAppObj - State App Object: The whole app state.
 *
 * @returns The documents, keyed by id.
 *
 * @example
 * ```ts
 * splStaFun(staAppObj) // => { core, 'pickLog-2026-10', ... }
 * ```
 *
*/

function splStaFun ( staAppObj : StaAppTyp ) : SynDocTyp {


	const corDocObj : RawSavTyp = Object.fromEntries( Object.entries( staAppObj ).filter( ( [ keyNamStr ] ) => !keyNamStr.startsWith( '__' ) ) ); // What: Core Document Object. Why: Core is the state minus its logs, and minus storage's own markers (__savedAt changes on every save, so it would make core look changed when nothing was). How: This copies every field without a __ prefix, and the loop below removes each log.

	const docMapObj : SynDocTyp = { [ COR_DOC_STR ] : corDocObj }; // What: Document Map Object. Why: Every document is collected under its id. How: This starts with core.


	for ( const logSpeObj of LOG_SPE_ARR ) { // What: Log Loop. Why: Each log is split by month. How: This walks the five logs.


		delete corDocObj[ logSpeObj.keyStr ]; // What: Log Removal. Why: A log travels in its own month documents, not in core. How: This drops it from the core copy.



		for ( const logRowObj of staAppObj[ logSpeObj.keyStr ] || [] ) { // What: Row Loop. Why: Each row joins its month's document. How: This walks the log's rows in order.


			const docIdeStr = `${ logSpeObj.keyStr }-${ logSpeObj.dayFun( logRowObj ).slice( 0, 7 ) }`; // What: Document Identifier String. Why: A row's month names its document. How: This joins the log's name and the row's 'YYYY-MM'.


			( docMapObj[ docIdeStr ] ||= [] ).push( logRowObj ); // What: Row Push Call. Why: The row belongs to its month. How: This appends it, creating the month's list on its first row.


		}


	}



	return docMapObj; // What: Document Map Return. Why: The caller syncs these documents. How: This returns them keyed by id.


}

// #endregion splStaFun



// #region joiDocFun

/**
 * joiDocFun = Join Documents Function
 *
 * @summary
 * Joins cloud documents back into one app state, the reverse of splStaFun:
 * core's fields, plus each log rebuilt from its month documents in month
 * order, each month's rows in their stored order. A log with no documents
 * comes back empty.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param docMapObj - Document Map Object: The documents, keyed by id, core
 *                    included.
 *
 * @returns The joined app state.
 *
 * @example
 * ```ts
 * joiDocFun(docMapObj) // => staAppObj
 * ```
 *
*/

function joiDocFun ( docMapObj : SynDocTyp ) : StaAppTyp {


	const joiStaObj : RawSavTyp = { ...docMapObj[ COR_DOC_STR ] }; // What: Joined State Object. Why: The state starts from core's fields. How: This copies core.


	for ( const logSpeObj of LOG_SPE_ARR ) { // What: Log Loop. Why: Each log is rebuilt from its months. How: This walks the five logs.


		const logPreStr = `${ logSpeObj.keyStr }-`; // What: Log Prefix String. Why: A log's month documents share its name as a prefix. How: This is that prefix.



		joiStaObj[ logSpeObj.keyStr ] = Object.keys( docMapObj ).filter( ( docIdeStr ) => docIdeStr.startsWith( logPreStr ) ).sort().flatMap( ( docIdeStr ) => docMapObj[ docIdeStr ] ); // What: Log Rebuild. Why: The log is its months' rows in month order. How: This sorts the log's document ids, which end in 'YYYY-MM', and concatenates their rows.


	}



	return joiStaObj; // What: Joined State Return. Why: The caller boots or merges this state. How: This returns it.


}

// #endregion joiDocFun

// #endregion Helpers



// #region Exports

export { canJsoFun, COR_DOC_STR, hasDocFun, joiDocFun, LOG_SPE_ARR, type LogKeyTyp, splStaFun, type SynDocTyp }; // What: Named Exports. Why: The merge and sync engine split, fingerprint, and join documents through these. How: This exports them by name.

// #endregion Exports


