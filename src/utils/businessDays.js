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

export const isPublicHoliday = (date, countryCode) => {
    if (!countryCode) return false;
    hd.init(countryCode);
    const holidays = hd.isHoliday(date);

    if (holidays) {
        // Check if any holiday is 'public'
        return holidays.some(h => h.type === 'public');
    }
    return false;
};

/**
 * Checks if a date is a working day (not weekend, not public holiday).
 * @param {Date} date 
 * @param {string} countryCode 
 * @returns {boolean}
 */
export const isBusinessDay = (date, countryCode) => {
    if (isWeekend(date)) return false;
    // strict check for business day: must NOT be a public holiday
    if (isPublicHoliday(date, countryCode)) return false;
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

    const isReverse = start > end;
    if (isReverse) {
        const temp = start;
        start = end;
        end = temp;
    }

    let calendarDays = 0;
    let businessDays = 0;
    let weekends = 0;
    let officialHolidaysOnWeekdays = 0;

    // Separate arrays for display
    let officialHolidaysList = [];
    let optionalHolidaysList = [];

    let curr = new Date(start);

    while (curr <= end) {
        calendarDays++;

        const isWknd = isWeekend(curr);

        hd.init(countryCode);
        const holList = hd.isHoliday(curr);

        let isPublic = false;
        let isOptional = false;
        let holidayName = '';

        if (holList && holList.length > 0) {
            // Prioritize 'public' if multiple
            const publicHol = holList.find(h => h.type === 'public');
            if (publicHol) {
                isPublic = true;
                holidayName = publicHol.name;
                officialHolidaysList.push({ date: new Date(curr), name: holidayName, onWeekend: isWknd });
            } else {
                // It is a holiday but not public (optional, observance, bank, etc)
                isOptional = true;
                holidayName = holList[0].name;
                optionalHolidaysList.push({ date: new Date(curr), name: holidayName, onWeekend: isWknd });
            }
        }

        if (isWknd) {
            weekends++;
            // Holidays on weekends are just recorded in lists, don't affect business/weekend counts in terms of sums usually, 
            // but users like to know if a weekend was also a holiday.
        } else {
            if (isPublic) {
                officialHolidaysOnWeekdays++; // Work suspended
            } else {
                // It is a working day, even if optional holiday
                businessDays++;
                // NOTE: Optional holidays are counted as business days here, but listed separately.
            }
        }

        curr = addDays(curr, 1);
    }

    return {
        startDate: isReverse ? end : start,
        endDate: isReverse ? start : end,
        calendarDays,
        businessDays,
        weekends,
        officialHolidaysOnWeekdays,
        officialHolidaysList,
        optionalHolidaysList
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
