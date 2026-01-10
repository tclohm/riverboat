import { DatabaseClient } from '$lib/db/client';
import { passes } from '$lib/db/schema';
import { fail } from '@sveltejs/kit';

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

interface DateRange {
  startDate: Date;
  endDate: Date;
}

function parseRequestedDates(dateString: string): DateRange | null {
  if (!dateString) return null;

  // Format: "Dec 15-17, 2025" (same month)
  let match = dateString.match(/(\w+)\s+(\d+)-(\d+),?\s+(\d+)/);
  if (match) {
    const monthStr = match[1];
    const startDay = parseInt(match[2]);
    const endDay = parseInt(match[3]);
    const year = parseInt(match[4]);

    const month = getMonthIndex(monthStr);
    if (month === undefined) return null;

    const startDate = new Date(year, month, startDay);
    const endDate = new Date(year, month, endDay);
    return { startDate, endDate };
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

    const startDate = new Date(year, startMonth, startDay);
    const endDate = new Date(year, endMonth, endDay);
    return { startDate, endDate };
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

    const startDate = new Date(startYear, startMonth, startDay);
    const endDate = new Date(endYear, endMonth, endDay);
    return { startDate, endDate };
  }

  return null;
}

// Convert Date to YYYY-MM-DD string for comparison
function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Check if two date ranges overlap
function rangesOverlap(
  searchStart: string, 
  searchEnd: string, 
  bookedStart: string, 
  bookedEnd: string
): boolean {
  // Two ranges overlap if one starts before the other ends AND ends after the other starts
  return searchStart <= bookedEnd && searchEnd >= bookedStart;
}

// Check if a pass is available for the given date range
function isPassAvailable(
  bookedDatesJson: string | null, 
  searchStart: string, 
  searchEnd: string
): boolean {
  if (!bookedDatesJson) return true;

  try {
    const bookedRanges: { start: string; end: string }[] = JSON.parse(bookedDatesJson);
    
    // If ANY booked range overlaps with search range, pass is NOT available
    for (const range of bookedRanges) {
      if (rangesOverlap(searchStart, searchEnd, range.start, range.end)) {
        return false;
      }
    }
    
    return true;
  } catch {
    return true; // If we can't parse, assume available
  }
}

export async function load({ platform, locals, url }) {
  const mode = import.meta.env.MODE;
  const client = DatabaseClient.getInstance();
  const db = client.getDb();

  const allPasses = await db.select().from(passes).all();

  // Get search params
  const searchDates = url.searchParams.get('requestedDates');
  const guests = url.searchParams.get('guests');
  const passType = url.searchParams.get('passType');
  const sort = url.searchParams.get('sort') || 'price-asc';

  let filteredPasses = allPasses;

  // Filter by date availability
  if (searchDates) {
    const parsed = parseRequestedDates(searchDates);
    
    if (parsed) {
      const searchStart = toISODate(parsed.startDate);
      const searchEnd = toISODate(parsed.endDate);
      
      filteredPasses = filteredPasses.filter(pass => 
        isPassAvailable(pass.bookedDates, searchStart, searchEnd)
      );
    }
  }

  // Filter by pass type
  if (passType) {
    filteredPasses = filteredPasses.filter(pass => pass.passType === passType);
  }

  // Sort passes
  filteredPasses = filteredPasses.sort((a, b) => {
    switch (sort) {
      case 'price-desc':
        return b.price - a.price;
      case 'newest':
        return b.id - a.id; // Higher ID = newer
      case 'price-asc':
      default:
        return a.price - b.price;
    }
  });

  return { 
    passes: filteredPasses,
    user: locals.user,
    searchDates: searchDates || null,
    guests: guests ? parseInt(guests) : null,
    passType: passType || null,
    sort: sort,
    totalCount: allPasses.length,
    filteredCount: filteredPasses.length
  };
}

export const actions = {
  search: async ({ request }) => {
    const formData = await request.formData();
    const dates = formData.get('requestedDates')?.toString();
    const guests = formData.get('guests')?.toString();
    const passType = formData.get('passType')?.toString();

    if (!dates) {
      return fail(400, { error: 'Please select dates' });
    }

    // Build search URL with params
    const url = new URL(request.url);
    url.searchParams.set('requestedDates', dates);
    if (guests) {
      url.searchParams.set('guests', guests);
    }
    if (passType) {
      url.searchParams.set('passType', passType);
    }

    return { success: true, searchUrl: url.pathname + url.search };
  }
};
