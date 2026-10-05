


/**
 * data-model.ts = Data Model
 *
 * @summary
 * The TypeScript types for the records the app saves: items, pickers,
 * conditionals, reminders (tasks), holiday settings, and pick-log rows, plus
 * the fixed value sets several of their fields draw from. They live in core/
 * because core/ is the lowest layer that reads these records, and nothing
 * below it may import from state/. Every field name is the one saved in user
 * data, so none of them follow the naming rule; renaming them waits for the
 * persisted-name migration. Fields only some records carry, such as the ease
 * band on items outside the ease modes, are optional.
 *
 * Sections:
 *  - Types
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type CadNamTyp = 'daily' | 'monthly' | 'weekly' | 'yearly';                    // What: Cadence Name Type. Why: A picker surfaces on one of four schedules. How: This lists every cadence a picker's own cadence field can hold.
type DatModTyp = 'date' | 'nthWeekday';                                         // What: Date Mode Type. Why: A monthly or yearly schedule falls either on a day of the month or on the Nth weekday. How: This lists both dateMode values.
type ModNamTyp = 'dynamic' | 'ease-down' | 'ease-up' | 'random' | 'weighted'; // What: Mode Name Type. Why: Pickers and conditionals share the same five ways of choosing. How: This lists every mode either one's own mode field can hold.
type PclOutTyp = 'rejected' | 'skipped';                                        // What: Pick-Log Outcome Type. Why: A pick that never counted as done records why. How: This lists both values a pick-log row's own optional outcome can hold.
type PclSouTyp = 'auto' | 'manual' | 'reroll';                                  // What: Pick-Log Source Type. Why: Stats breaks picks down by how each one was made. How: This lists every source a pick-log row records.
type RepNamTyp = 'annual' | 'interval' | 'monthly' | 'once' | 'weekly';         // What: Repeat Name Type. Why: A reminder either happens once or repeats on one of four patterns. How: This lists every value a task's own repeat field can hold.



type ConRcdTyp = { // What: Conditional Record Type. Why: A conditional is the day-off gate that can suppress its dependent pickers for a day. How: This describes one entry of state.conditionals.


	_cardPrev?   : { chargeStep? : number, triggered : boolean, value : number };                         // What: Card Previous. Why: Unchecking a completed day-off card has to restore exactly what checking it changed. How: This snapshots those fields, removed again on restore.
	_chargePrev? : { chargedToday : boolean, chargeStep? : number, triggered : boolean, value : number }; // What: Charge Previous. Why: Unchecking the completion that charged a conditional has to undo that charge. How: This snapshots the charge fields, removed again on restore.
	active       : boolean;                                                                               // What: Active. Why: A paused conditional never triggers. How: This is false while the user has it switched off.
	cardText     : string;                                                                                // What: Card Text. Why: A triggered conditional shows a day-off card on Today. How: This is that card's own text.
	chargedToday : boolean;                                                                               // What: Charged Today. Why: An ease conditional charges at most once per day. How: This is true once today's first dependent completion has charged it.
	chargeStep?  : number;                                                                                // What: Charge Step. Why: The ease modes move a conditional by a fixed planned step each cycle. How: This holds that step, absent until one is rolled.
	easeMax      : number;                                                                                // What: Ease Max. Why: The ease modes need an upper drift bound. How: This is the largest step a cycle can roll.
	easeMin      : number;                                                                                // What: Ease Min. Why: The ease modes need a lower drift bound. How: This is the smallest step a cycle can roll.
	id           : string;                                                                                // What: Id. Why: Pickers and log rows refer to a conditional by it. How: This is its stable identifier.
	mode         : ModNamTyp;                                                                             // What: Mode. Why: A conditional decides whether to trigger in one of the five picker ways. How: This names which.
	name         : string;                                                                                // What: Name. Why: The conditional is listed and logged by name. How: This is the user's own label for it.
	oddsPct      : number;                                                                                // What: Odds Percent. Why: The random mode triggers with a fixed chance. How: This is that chance, 0 to 100.
	threshold    : number;                                                                                // What: Threshold. Why: The ease and dynamic modes trigger once value crosses a line. How: This is that line, normally 100.
	triggered    : boolean;                                                                               // What: Triggered. Why: Today's generation needs to know whether the gate is closed. How: This is true while the conditional suppresses its pickers.
	value        : number;                                                                                // What: Value. Why: The ease and dynamic modes track their own drifting charge. How: This holds that charge.
	weight       : number;                                                                                // What: Weight. Why: The weighted modes scale the trigger chance. How: This is that weight.


};



type HolCusTyp = { day : number, id : string, month : number, name : string }; // What: Holiday Custom Type. Why: A user can add their own recurring days off. How: This describes one entry of state.holidays.custom, falling on day of month every year.



type HolStaTyp = { // What: Holiday State Type. Why: Reminders and pickers that skip holidays need to know which days count. How: This describes state.holidays.


	country  : string;      // What: Country. Why: Holidays are computed from one region's rule table. How: This is the region code, 'US' today.
	custom   : HolCusTyp[]; // What: Custom. Why: The user's own days off join the computed ones. How: This lists them.
	disabled : string[];    // What: Disabled. Why: A user can switch individual computed holidays off. How: This lists their keys.


};



type IteRcdTyp = { // What: Item Record Type. Why: An item is one choice in a picker's pool, chores, meals, or anything else. How: This describes one entry of state.items.


	chargeStep? : number;        // What: Charge Step. Why: An ease item charges or drains by a fixed planned step. How: This holds that step, absent until one is rolled.
	easeMax?    : number;        // What: Ease Max. Why: An ease item has its own drift band. How: This is the band's upper bound, absent outside the ease modes.
	easeMin?    : number;        // What: Ease Min. Why: An ease item has its own drift band. How: This is the band's lower bound, absent outside the ease modes.
	id          : string;        // What: Id. Why: Today entries and log rows refer to an item by it. How: This is its stable identifier.
	lastPicked  : string | null; // What: Last Picked. Why: Ties break toward the item picked longest ago. How: This is the last pick's ISO timestamp, or null if never picked.
	name        : string;        // What: Name. Why: The item is shown and logged by name. How: This is the user's own label for it.
	pickerId    : string;        // What: Picker Id. Why: A picker's pool is every item pointing at it. How: This is the owning picker's id.
	picks       : number;        // What: Picks. Why: Stats and the pickers count how often an item came up. How: This is its running pick count.
	vacation    : boolean;       // What: Vacation. Why: A deactivated item stays saved but is never picked. How: This is true while the item is switched off.
	value       : number;        // What: Value. Why: The dynamic and ease modes track a drifting charge per item. How: This holds that charge.
	weight      : number;        // What: Weight. Why: The weighted modes favor heavier items. How: This is the item's own weight.


};



type PclRowTyp = { // What: Pick-Log Row Type. Why: Stats is built from a flat history of every pick. How: This describes one entry of state.pickLog, with names copied in so the row survives a rename or delete.


	completedAt  : string | null; // What: Completed At. Why: Stats measures when picks were actually done. How: This is the completion's ISO timestamp, or null.
	date         : string;        // What: Date. Why: Stats groups picks by calendar day. How: This is the pick's 'YYYY-MM-DD' day.
	depletedEnd? : boolean;       // What: Depleted End. Why: An Ease Down streak ends when its item runs out. How: This is true on the row that ended one.
	done         : boolean;       // What: Done. Why: Stats separates finished picks from open ones. How: This is true once the pick was checked off.
	eid          : string | null; // What: Entry Identifier. Why: A row links back to its live Today entry until the day rolls. How: This is that entry's id, or null.
	group        : string;        // What: Group. Why: Stats filters by group. How: This copies the picker's group at pick time.
	id           : string;        // What: Id. Why: Every row needs its own identity. How: This is its unique identifier.
	itemId       : string;        // What: Item Id. Why: Stats groups rows by item. How: This is the picked item's id.
	itemName     : string;        // What: Item Name. Why: The row has to read correctly after the item is renamed or deleted. How: This copies the item's name at pick time.
	outcome?     : PclOutTyp;     // What: Outcome. Why: A pick that never counted needs its reason. How: This names it, absent on an ordinary pick.
	pickerId     : string;        // What: Picker Id. Why: Stats groups rows by picker. How: This is the owning picker's id.
	pickerName   : string;        // What: Picker Name. Why: The row has to read correctly after the picker is renamed or deleted. How: This copies the picker's name at pick time.
	source       : PclSouTyp;     // What: Source. Why: Stats breaks picks down by how they were made. How: This names the source.


};



type PicRcdTyp = { // What: Picker Record Type. Why: A picker is a pool of items chosen from on a schedule. How: This describes one entry of state.pickers.


	activeItemId?      : string | null; // What: Active Item Id. Why: Ease Down keeps one item active until it runs out. How: This is that item's id, or null between streaks.
	anchorDay          : number;        // What: Anchor Day. Why: A yearly picker runs on one day of the month. How: This is that day, 1 through 31.
	anchorDom          : number;        // What: Anchor Day Of Month. Why: A monthly picker runs on one day of the month. How: This is that day, 1 through 31.
	anchorDow          : number;        // What: Anchor Day Of Week. Why: A weekly picker runs on one weekday. How: This is that weekday, 0 for Sunday.
	anchorMonth        : number;        // What: Anchor Month. Why: A yearly picker runs in one month. How: This is that month, 1 through 12.
	avoidDuplicates    : boolean;       // What: Avoid Duplicates. Why: A picker can refuse to pick an item already on today's list. How: This is true when it does.
	cadence            : CadNamTyp;     // What: Cadence. Why: A picker surfaces on a schedule. How: This names which.
	conditionalId      : string | null; // What: Conditional Id. Why: A picker can be suppressed by a day-off conditional. How: This is that conditional's id, or null.
	createdFromSample? : string;        // What: Created From Sample. Why: A tour's replay has to find the picker it made before. How: This is the sample's id, absent on the user's own pickers.
	dateMode?          : DatModTyp;     // What: Date Mode. Why: A monthly or yearly picker falls on a day of the month or on the Nth weekday. How: This names which, absent meaning a day of the month.
	daysOfWeek         : number[];      // What: Days Of Week. Why: A picker can be limited to certain weekdays. How: This lists them, 0 for Sunday.
	easeMax            : number;        // What: Ease Max. Why: New ease items take the picker's default drift band. How: This is the band's upper bound.
	easeMin            : number;        // What: Ease Min. Why: New ease items take the picker's default drift band. How: This is the band's lower bound.
	group              : string;        // What: Group. Why: Today clusters pickers into groups. How: This is the group's label.
	hidden             : boolean;       // What: Hidden. Why: Sample pickers stay saved but out of sight until a tour shows them. How: This is true while hidden.
	id                 : string;        // What: Id. Why: Items, entries, and log rows refer to a picker by it. How: This is its stable identifier.
	lastRunPeriod?     : string;        // What: Last Run Period. Why: A non-daily picker counts as run for its period once its card is completed. How: This is the completed period's start date, absent until one completes.
	mode               : ModNamTyp;     // What: Mode. Why: A picker chooses in one of five ways. How: This names which.
	name               : string;        // What: Name. Why: The picker is shown by name. How: This is the user's own label for it.
	nthOrdinal?        : number;        // What: Nth Ordinal. Why: An Nth-weekday schedule needs which occurrence. How: This is 1 through 5.
	nthWeekday?        : number;        // What: Nth Weekday. Why: An Nth-weekday schedule needs which weekday. How: This is 0 for Sunday through 6.
	skipHolidays       : boolean;       // What: Skip Holidays. Why: A picker can sit out holidays. How: This is true when it does.
	threshold          : number;        // What: Threshold. Why: Ease items become eligible or run out at a line. How: This is that line, normally 100.


};



type TasRcdTyp = { // What: Task Record Type. Why: A reminder is a scheduled task, separate from the randomly picked items. How: This describes one entry of state.tasks.


	anchor             : string;        // What: Anchor. Why: Interval and annual reminders count their repeats from a starting day. How: This is that 'YYYY-MM-DD' day.
	createdAt          : string;        // What: Created At. Why: A reminder can't be due before it existed. How: This is its creation's ISO timestamp.
	createdFromSample? : string;        // What: Created From Sample. Why: A tour's replay has to find the reminder it made before. How: This is the sample's id, absent on the user's own reminders.
	dateMode           : DatModTyp;     // What: Date Mode. Why: A monthly or annual reminder falls on a day of the month or on the Nth weekday. How: This names which.
	day                : number;        // What: Day. Why: An annual reminder falls on one day of its month. How: This is that day, 1 through 31.
	dayOfMonth         : number;        // What: Day Of Month. Why: A monthly reminder falls on one day of the month. How: This is that day, 1 through 31.
	daysOfWeek         : number[];      // What: Days Of Week. Why: A weekly reminder falls on chosen weekdays. How: This lists them, 0 for Sunday.
	hidden             : boolean;       // What: Hidden. Why: Sample reminders stay saved but out of sight until a tour shows them. How: This is true while hidden.
	id                 : string;        // What: Id. Why: Log rows refer to a reminder by it. How: This is its stable identifier.
	interval           : number;        // What: Interval. Why: Interval and annual reminders repeat every N days or years. How: This is N.
	lastDone           : string | null; // What: Last Done. Why: A reminder done today shouldn't show again until it's next due. How: This is the last completion's day, or null.
	month              : number;        // What: Month. Why: An annual reminder falls in one month. How: This is that month, 1 through 12.
	name               : string;        // What: Name. Why: The reminder is shown and logged by name. How: This is the user's own label for it.
	nthOrdinal         : number;        // What: Nth Ordinal. Why: An Nth-weekday schedule needs which occurrence. How: This is 1 through 5.
	nthWeekday         : number;        // What: Nth Weekday. Why: An Nth-weekday schedule needs which weekday. How: This is 0 for Sunday through 6.
	onceDate?          : string;        // What: Once Date. Why: A one-time reminder falls on a single day. How: This is that 'YYYY-MM-DD' day, absent on repeating reminders.
	repeat             : RepNamTyp;     // What: Repeat. Why: A reminder happens once or repeats on a pattern. How: This names which.
	skipUntil          : string | null; // What: Skip Until. Why: A skipped reminder stays away until a set day. How: This is that day, or null.


};

// #endregion Types



// #region Exports

export { type CadNamTyp, type ConRcdTyp, type DatModTyp, type HolCusTyp, type HolStaTyp, type IteRcdTyp, type ModNamTyp, type PclOutTyp, type PclRowTyp, type PclSouTyp, type PicRcdTyp, type RepNamTyp, type TasRcdTyp }; // What: Named Type Exports. Why: core/, state/, and the UI all read the same saved records. How: This exports every record type and value set by name, each marked type so it disappears from the build.

// #endregion Exports


