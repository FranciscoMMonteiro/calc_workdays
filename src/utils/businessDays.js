import Holidays from 'date-holidays';
import { addDays, isWeekend, isSameDay, format, parseISO, differenceInCalendarDays, startOfDay } from 'date-fns';

// Map common country names to codes if needed, or just use codes in UI
export const SUPPORTED_COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'BR', name: 'Brazil' },
    { code: 'FR', name: 'France' },
    { code: 'CA', name: 'Canada' },
    { code: 'MX', name: 'Mexico' },
    { code: 'DE', name: 'Germany' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'AR', name: 'Argentina' },
    { code: 'GB', name: 'United Kingdom' },
];

const hd = new Holidays();

/**
 * Checks if a specific date is a holiday in the given country.
 * @param {Date} date 
 * @param {string} countryCode 
 * @returns {boolean}
 */
export const isHoliday = (date, countryCode) => {
    if (!countryCode) return false;
    hd.init(countryCode);
    const holiday = hd.isHoliday(date);
    // date-holidays returns an array of holidays or false/undefined.
    // Note: on weekends it might return "observed" types differently, but isHoliday check is usually sufficient.
    // We want to exclude public holidays where work is suspended.
    // Some entries might be 'optional'. For now, we treat standard output as holidays.

    if (holiday) {
        // Filter out optional if strictly needed, but usually isHoliday() returns public holidays.
        // holiday object structure: { type: 'public', name: '...' }
        return true;
    }
    return false;
};

/**
 * Checks if a date is a working day (not weekend, not holiday).
 * @param {Date} date 
 * @param {string} countryCode 
 * @returns {boolean}
 */
export const isBusinessDay = (date, countryCode) => {
    if (isWeekend(date)) return false;
    if (isHoliday(date, countryCode)) return false;
    return true;
};

/**
 * Calculates detailed statistics between two dates.
 * @param {string|Date} startDate 
 * @param {string|Date} endDate 
 * @param {string} countryCode 
 * @returns {object}
 */
export const calculateBusinessDaysDetails = (startDate, endDate, countryCode) => {
    let start = startOfDay(new Date(startDate));
    let end = startOfDay(new Date(endDate));

    // Ensure start <= end for calculation
    const isReverse = start > end;
    if (isReverse) {
        const temp = start;
        start = end;
        end = temp;
    }

    // Init stats
    let calendarDays = 0; // Inclusive of start/end depending on convention? 
    // User image: 01/01/2026 -> 31/12/2026 = 365 days. (Inclusive start, inclusive end implies 365).
    // Standard arithmetic (End - Start) would be 364 days.
    // "Dias corridos (incluindo a data final)" suggests inclusive count.
    // Let's assume Inclusive for "calendar days" count as per user reference.

    let businessDays = 0;
    let weekends = 0;
    let holidays = 0;
    let holidayDetails = [];

    let curr = new Date(start);

    // We'll iterate from start to end (inclusive)
    while (curr <= end) {
        calendarDays++;

        const isWknd = isWeekend(curr);

        // Check holiday
        // isHoliday returns true if public holiday.
        // We want to know if it's a holiday separate from weekend for the breakdown?
        // Or just count "Holiday on Weekday" vs "Holiday on Weekend"?
        // The image distinguishes "Sábados e Domingos" and "Feriados Nacionais".
        // Usually "Business Day" = Total - (Weekends) - (Holidays on Weekdays).

        let isHol = false;
        // We need holiday details
        hd.init(countryCode);
        const holList = hd.isHoliday(curr); // returns array or false

        if (holList && holList.length > 0) {
            // It is a holiday
            // Only count as "Holiday" deduction if it's NOT a weekend?
            // Or count total holidays?
            // Image: "Feriados Nacionais: 9". "Sábados e Domingos: 104". 
            // If a holiday falls on Saturday, is it counted in Holidays or Weekends?
            // Usually strict "Business Days" logic doesn't double deduct.
            // Let's record it.
            const holName = holList[0].name;
            holidayDetails.push({ date: new Date(curr), name: holName, onWeekend: isWknd });
            isHol = true;
        }

        if (isWknd) {
            weekends++;
        } else {
            if (isHol) {
                holidays++; // Holiday on a weekday
            } else {
                businessDays++;
            }
        }

        curr = addDays(curr, 1);
    }

    // Correct for initial swap if needed, but for "Details" we usually just show the range stats.

    return {
        startDate: isReverse ? end : start,
        endDate: isReverse ? start : end,
        calendarDays,
        businessDays,
        weekends,
        weekdaysHolidays: holidays, // Holidays that fell on weekdays
        totalHolidays: holidayDetails.length,
        holidayDetails
    };
};

/**
 * Adds business days and returns details.
 * @param {string|Date} startDate 
 * @param {number} daysToAdd 
 * @param {string} countryCode 
 * @returns {object}
 */
export const addBusinessDays = (startDate, daysToAdd, countryCode) => {
    let date = startOfDay(new Date(startDate));
    let daysAdded = 0;
    let direction = daysToAdd >= 0 ? 1 : -1;
    let absDays = Math.abs(daysToAdd);

    // Find target date first
    // Note: if we start on a non-business day, standard practice varies.
    // We'll increment until we find the date.

    // For the detailed stats, we essentially want the stats between Start and Result.
    // So we calculate the End Date first.
    let currentCalc = new Date(date);

    // Initial check: if we start on a weekend/holiday, do we jump immediately?
    // Usually: "Add 1 business day to Saturday" -> Tuesday (skip Sun, Mon-Holiday)? 
    // Loop logic:

    while (daysAdded < absDays) {
        currentCalc = addDays(currentCalc, direction);
        if (isBusinessDay(currentCalc, countryCode)) {
            daysAdded++;
        }
    }

    const endDate = currentCalc;

    // Now generate stats between start and end using the range function
    // We need to decide if "Start Date" is inclusive in the stats?
    // If I add 5 days, the range covers Start to End.
    return calculateBusinessDaysDetails(date, endDate, countryCode);
};

export const getBusinessDaysDifference = (startDate, endDate, countryCode) => {
    return calculateBusinessDaysDetails(startDate, endDate, countryCode);
};
