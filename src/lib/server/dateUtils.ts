/**
 * Server-side utility functions for managing booked dates on passes
 * Booked dates are stored as JSON array: [{start: "YYYY-MM-DD", end: "YYYY-MM-DD"}, ...]
 */

export interface DateRange {
  start: string; // YYYY-MM-DD format
  end: string;   // YYYY-MM-DD format
}

/**
 * Parse booked dates JSON string into DateRange array
 */
export function parseBookedDates(bookedDatesJson: string | null): DateRange[] {
  if (!bookedDatesJson) return [];
  try {
    const parsed = JSON.parse(bookedDatesJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Convert DateRange array back to JSON string
 */
export function serializeBookedDates(dateRanges: DateRange[]): string {
  return JSON.stringify(dateRanges);
}

/**
 * Add a new booked date range to existing booked dates
 * Merges overlapping ranges
 */
export function addBookedDateRange(existingJson: string | null, startDate: string, endDate: string): string {
  const ranges = parseBookedDates(existingJson);
  ranges.push({ start: startDate, end: endDate });
  return serializeBookedDates(mergeOverlappingRanges(ranges));
}

/**
 * Merge overlapping date ranges
 */
export function mergeOverlappingRanges(ranges: DateRange[]): DateRange[] {
  if (ranges.length === 0) return [];

  const sorted = ranges.sort((a, b) => a.start.localeCompare(b.start));
  const merged: DateRange[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    // Check if ranges overlap or are adjacent
    if (current.start <= last.end) {
      // Merge ranges
      last.end = current.end > last.end ? current.end : last.end;
    } else {
      merged.push(current);
    }
  }

  return merged;
}

/**
 * Check if a specific date falls within any booked range
 */
export function isDateBooked(date: string, bookedDatesJson: string | null): boolean {
  const ranges = parseBookedDates(bookedDatesJson);
  return ranges.some(range => date >= range.start && date <= range.end);
}

/**
 * Parse requested dates string to start and end dates
 * Handles formats like "Dec 15-17, 2025" or "Dec 15 - Jan 5, 2025"
 */
export function parseRequestedDatesToRange(dateString: string): DateRange | null {
  if (!dateString) return null;

  function getMonthIndex(monthStr: string): number | undefined {
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
    return monthMap[monthStr.toLowerCase().slice(0, 3)];
  }

  function formatDate(day: number, month: number, year: number): string {
    const d = new Date(year, month, day);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day_ = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day_}`;
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

    return {
      start: formatDate(startDay, month, year),
      end: formatDate(endDay, month, year)
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

    return {
      start: formatDate(startDay, startMonth, year),
      end: formatDate(endDay, endMonth, year)
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

    return {
      start: formatDate(startDay, startMonth, startYear),
      end: formatDate(endDay, endMonth, endYear)
    };
  }

  return null;
}
