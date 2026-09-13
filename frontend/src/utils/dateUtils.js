/**
 * Utility functions for safe date and time parsing, formatting, and slot expiry validation.
 */

/**
 * Safely parses any date string, array, or timestamp from backend or JS.
 * Handles:
 *  - ISO strings: "2026-09-11T21:46:39"
 *  - Strings with spaces: "2026-09-11 21:46:39"
 *  - Jackson arrays: [2026, 9, 11, 21, 46, 39]
 *  - Epoch timestamps: 1726071999000
 *  - Native Date objects
 *
 * @param {any} value
 * @returns {Date|null}
 */
export function parseSafeDate(value) {
    if (!value) return null;

    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }

    // Handle Jackson LocalDateTime serialization as array [year, month, day, hour, minute, second]
    if (Array.isArray(value)) {
        const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0] = value;
        const d = new Date(year, month - 1, day, hour, minute, second);
        return isNaN(d.getTime()) ? null : d;
    }

    if (typeof value === 'number') {
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;

        // If string contains space instead of 'T' (e.g., "2026-09-11 14:30:00")
        const normalized = trimmed.includes(' ') && !trimmed.includes('T')
            ? trimmed.replace(' ', 'T')
            : trimmed;

        const d = new Date(normalized);
        if (!isNaN(d.getTime())) return d;
    }

    const fallback = new Date(value);
    return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Reliably formats date into a readable string.
 *
 * @param {any} value
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
export function formatSafeDate(value, options = { weekday: 'short', month: 'short', day: 'numeric' }) {
    const d = parseSafeDate(value);
    if (!d) return 'Date TBD';
    return d.toLocaleDateString(undefined, options);
}

/**
 * Reliably formats time into a readable string (e.g., "09:30 AM").
 *
 * @param {any} value
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
export function formatSafeTime(value, options = { hour: '2-digit', minute: '2-digit' }) {
    const d = parseSafeDate(value);
    if (!d) return '';
    return d.toLocaleTimeString([], options);
}

/**
 * Formats a start and end time range (e.g. "09:00 AM – 10:30 AM").
 *
 * @param {any} startTime
 * @param {any} endTime
 * @returns {string}
 */
export function formatSafeTimeRange(startTime, endTime) {
    const start = parseSafeDate(startTime);
    const end = parseSafeDate(endTime);
    if (!start) return '';

    const sStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!end) return sStr;

    const eStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${sStr} – ${eStr}`;
}

/**
 * Checks if a slot has expired or is in the past.
 * A slot is considered expired if:
 *  - its sessionStatus is explicitly 'EXPIRED' or 'CLOSED'
 *  - its startTime is before Date.now()
 *
 * @param {object} slot
 * @returns {boolean}
 */
export function isSlotExpired(slot) {
    if (!slot) return true;
    const status = slot.sessionStatus || slot.status;
    if (status === 'EXPIRED' || status === 'CLOSED' || status === 'COMPLETED') {
        return true;
    }
    const start = parseSafeDate(slot.startTime || slot.slotDateTime);
    if (!start) return false;
    return start.getTime() < Date.now();
}

/**
 * Checks if a slot is valid and upcoming.
 *
 * @param {object} slot
 * @returns {boolean}
 */
export function isSlotUpcoming(slot) {
    return !isSlotExpired(slot);
}

/**
 * Calculates comprehensive slot metrics for a course card.
 * Distinguishes between courses with No Upcoming Sessions vs Truly Fully Booked / Sold Out courses.
 *
 * @param {object} course
 * @returns {{ totalUpcomingSlots: number, seatsLeft: number, isSoldOut: boolean, hasNoUpcoming: boolean }}
 */
export function getCourseSlotStats(course) {
    if (!course?.slots || !Array.isArray(course.slots) || course.slots.length === 0) {
        return { totalUpcomingSlots: 0, seatsLeft: 0, isSoldOut: false, hasNoUpcoming: true };
    }

    const upcoming = course.slots.filter(sl => {
        const s = sl.sessionStatus || sl.status;
        return !isSlotExpired(sl) && s !== 'CLOSED' && s !== 'EXPIRED' && s !== 'COMPLETED';
    });

    if (upcoming.length === 0) {
        return { totalUpcomingSlots: 0, seatsLeft: 0, isSoldOut: false, hasNoUpcoming: true };
    }

    const seatsLeft = upcoming.reduce((sum, sl) => sum + Math.max(0, (sl.maxSeats || 0) - (sl.currentEnrolled || 0)), 0);
    const isSoldOut = seatsLeft === 0;

    return {
        totalUpcomingSlots: upcoming.length,
        seatsLeft,
        isSoldOut,
        hasNoUpcoming: false
    };
}

