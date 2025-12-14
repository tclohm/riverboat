/**
 * Server-side date utilities for managing booked date ranges
 * Handles parsing calendar date strings and managing JSON array of booked dates
 */

interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

interface BookedDateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

/**
 * Parse calendar date string to date range
 * Handles formats:
 * - "Dec 15-17, 2025" (same month)
 * - "Dec 15 - Jan 5, 2026" (different months, same year)
 * - "Dec 15, 2025 - Jan 5, 2026" (different months and years)
 */
export function parseRequestedDatesToRange(dateString: string): DateRange | null {
  if (!dateString) return null;

  // Month name to number mapping
  const monthMap: { [key: string]: number } = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, sept: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11
  };

  function getMonthIndex(monthStr: string): number | undefined {
    return monthMap[monthStr.toLowerCase().slice(0, 3)];
  }

  // Format: "Dec 15-17, 2025" (same month)
  let match = dateString.match(/(\w+)\s+(\d+)-(\d+),?\s+(\d+)/);
  if (match) {
    const monthStr = match[1];
    const startDay = parseInt(match[2]);
    const endDay = parseInt(match[3]);
    const year = parseInt(match[4]);

    const month = getMonthIndex(monthStr);
    if (month === undefined) return null;

    const start = new Date(year, month, startDay);
    const end = new Date(year, month, endDay);
    
    return {
      start: formatDateToISO(start),
      end: formatDateToISO(end)
    };
  }

  // Format: "Nov 20 - Dec 2, 2025" (different months, same year)
  match = dateString.match(/(\w+)\s+(\d+)\s*-\s*(\w+)\s+(\d+),?\s+(\d+)/);
  if (match) {
    const startMonthStr = match[1];
    const startDay = parseInt(match[2]);
    const endMonthStr = match[3];
    const endDay = parseInt(match[4]);
    const year = parseInt(match[5]);

    const startMonth = getMonthIndex(startMonthStr);
    const endMonth = getMonthIndex(endMonthStr);

    if (startMonth === undefined || endMonth === undefined) return null;

    const start = new Date(year, startMonth, startDay);
    const end = new Date(year, endMonth, endDay);
    
    return {
      start: formatDateToISO(start),
      end: formatDateToISO(end)
    };
  }

  // Format: "Dec 15, 2025 - Jan 5, 2026" (different months and years)
  match = dateString.match(/(\w+)\s+(\d+),?\s+(\d+)\s*-\s*(\w+)\s+(\d+),?\s+(\d+)/);
  if (match) {
    const startMonthStr = match[1];
    const startDay = parseInt(match[2]);
    const startYear = parseInt(match[3]);
    const endMonthStr = match[4];
    const endDay = parseInt(match[5]);
    const endYear = parseInt(match[6]);

    const startMonth = getMonthIndex(startMonthStr);
    const endMonth = getMonthIndex(endMonthStr);

    if (startMonth === undefined || endMonth === undefined) return null;

    const start = new Date(startYear, startMonth, startDay);
    const end = new Date(endYear, endMonth, endDay);
    
    return {
      start: formatDateToISO(start),
      end: formatDateToISO(end)
    };
  }

  return null;
}

/**
 * Format Date object to ISO string (YYYY-MM-DD)
 */
function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add a booked date range to the pass's booked dates
 * Handles merging overlapping ranges
 */
export function addBookedDateRange(
  bookedDatesJson: string | null,
  startDate: string,
  endDate: string
): string {
  let bookedDates: BookedDateRange[] = [];

  // Parse existing booked dates
  if (bookedDatesJson) {
    try {
      bookedDates = JSON.parse(bookedDatesJson);
      if (!Array.isArray(bookedDates)) {
        bookedDates = [];
      }
    } catch (error) {
      console.error('Failed to parse booked dates JSON:', error);
      bookedDates = [];
    }
  }

  // Create new range
  const newRange: BookedDateRange = {
    start: startDate,
    end: endDate
  };

  // Check for overlapping ranges and merge if needed
  const mergedRanges = mergeOverlappingRanges([...bookedDates, newRange]);

  return JSON.stringify(mergedRanges);
}

/**
 * Merge overlapping or adjacent date ranges
 */
function mergeOverlappingRanges(ranges: BookedDateRange[]): BookedDateRange[] {
  if (ranges.length === 0) return [];

  // Sort ranges by start date
  const sorted = ranges.sort((a, b) => a.start.localeCompare(b.start));

  const merged: BookedDateRange[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    // Check if current range overlaps or is adjacent to the last merged range
    if (isOverlappingOrAdjacent(last, current)) {
      // Merge: extend the end date if needed
      last.end = current.end > last.end ? current.end : last.end;
    } else {
      // No overlap, add as new range
      merged.push(current);
    }
  }

  return merged;
}

/**
 * Check if two date ranges overlap or are adjacent (within 1 day)
 */
function isOverlappingOrAdjacent(range1: BookedDateRange, range2: BookedDateRange): boolean {
  const range1End = new Date(range1.end);
  const range2Start = new Date(range2.start);

  // Add 1 day to range1End to check adjacency
  range1End.setDate(range1End.getDate() + 1);

  // If range2 starts before or on range1End+1, they overlap or are adjacent
  return range2Start <= range1End;
}

/**
 * Check if a specific date is booked
 */
export function isDateBooked(bookedDatesJson: string | null, checkDate: string): boolean {
  if (!bookedDatesJson) return false;

  try {
    const bookedDates: BookedDateRange[] = JSON.parse(bookedDatesJson);
    const check = new Date(checkDate);

    return bookedDates.some(range => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      return check >= start && check <= end;
    });
  } catch (error) {
    console.error('Failed to check if date is booked:', error);
    return false;
  }
}

/**
 * Get all booked date ranges
 */
export function getBookedDateRanges(bookedDatesJson: string | null): BookedDateRange[] {
  if (!bookedDatesJson) return [];

  try {
    const ranges = JSON.parse(bookedDatesJson);
    return Array.isArray(ranges) ? ranges : [];
  } catch (error) {
    console.error('Failed to parse booked dates:', error);
    return [];
  }
}

/**
 * Remove a booked date range (for cancellations)
 */
export function removeBookedDateRange(
  bookedDatesJson: string | null,
  startDate: string,
  endDate: string
): string {
  if (!bookedDatesJson) return '[]';

  try {
    let bookedDates: BookedDateRange[] = JSON.parse(bookedDatesJson);
    
    // Filter out the range to remove
    bookedDates = bookedDates.filter(range => 
      !(range.start === startDate && range.end === endDate)
    );

    return JSON.stringify(bookedDates);
  } catch (error) {
    console.error('Failed to remove booked date range:', error);
    return bookedDatesJson;
  }
}
