const dateFormatter = new Intl.DateTimeFormat('en-us', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
});

/**
 * Return 'st', 'nd', 'rd', or 'th' to be appended to a given number
 */
function getOrdinalIndicator(n: number) {
    if (n > 10 && n <= 20) {
        return 'th';
    }

    switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

/**
 * Return a formatted date string, e.g. 'January 6th'
 */
export function formatUTCDate(date: Date) {
    return dateFormatter.format(date) + getOrdinalIndicator(date.getUTCDate());
}

/**
 * Return a new Date in UTC time with `localDate`'s year, month, and date
 */
function localDateToUTCDate(localDate: Date) {
    return new Date(Date.UTC(
        localDate.getFullYear(), localDate.getMonth(), localDate.getDate(),
    ));
}

function getISOString(date: Date) {
    return date.toISOString().slice(0, 10);
}

export function isValidISODate(isoDate: string) {
    return isoDate.length === 10 && getISOString(new Date(isoDate)) === isoDate;
}

/**
 * Return the number of days between `utcDate` and the nearest Tuesday
 * When `utcDate` is itself a Tuesday, 0 is returned
 *
 * @param future - Search forward if true, backward if false
 * When searching backward, the return value is negative or 0
 */
export function getDaysTillTuesday(utcDate: Date, future = true) {
    const TUESDAY = 2;
    const weekOffset = future ? 7 : -7;

    return (weekOffset + TUESDAY - utcDate.getUTCDay()) % weekOffset;
}

/**
 * Return the ISO date string for `refDate` shifted by `offset` days
 *
 * > getISOStringWithOffset(new Date('2015-01-06'), 1); // => '2015-01-07'
 * > getISOStringWithOffset(new Date('2015-01-06'), -1); // => '2015-01-05'
 */
export function getISOStringWithOffset(utcDate: Date, offset: number) {
    const utcResult = new Date(Date.UTC(
        utcDate.getUTCFullYear(),
        utcDate.getUTCMonth(),
        utcDate.getUTCDate() + offset
    ));

    return utcResult.toISOString().slice(0, 10);
}

/**
 * Return the ISO date string for the Tuesday after `refDate`
 *
 * > getNextTuesdayISOString('2015-01-05'); // => '2015-01-06'
 * > getNextTuesdayISOString('2015-01-06'); // => '2015-01-13'
 * > getNextTuesdayISOString(new Date(2015, 0, 6)); // => '2015-01-13'
 * > getNextTuesdayISOString(new Date()); // The first Tuesday after today
 *
 * @param refDate - The reference date from which to search
 * If a `string`: An ISO string in *UTC* time, e.g. `'2015-01-06'`
 * If a `Date`: A Date object in *local* time, e.g. `new Date()`
 */
export function getNextTuesdayISOString(refDate: string | Date) {
    const utcDate = refDate instanceof Date
        ? localDateToUTCDate(refDate)
        : new Date(refDate);

    // If refDate is a Tuesday itself, we want the *next* Tuesday
    const offset = getDaysTillTuesday(utcDate) || 7;

    return getISOStringWithOffset(utcDate, offset);
}
