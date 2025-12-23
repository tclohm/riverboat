<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';
  import { onMount } from 'svelte';

  export let passId: number | null = null;
  export let initialStartDate: string | null = null;
  export let initialEndDate: string | null = null;
  export let onDateRangeSelect: (startDate: string, endDate: string) => void = () => {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  
  // Current booking dates (reference only, shown at start)
  let currentStartDate: Date | null = null;
  let currentEndDate: Date | null = null;
  
  // New selection (what user is picking)
  let newStartDate: Date | null = null;
  let newEndDate: Date | null = null;
  
  let hoveredDate: Date | null = null;
  
  let bookedDates: {start: string, end: string}[] = [];
  let loading = true;

  // ===== INITIALIZATION =====
  onMount(() => {
    // Parse initial dates if provided
    if (initialStartDate && initialEndDate) {
      try {
        currentStartDate = parseDisplayDate(initialStartDate);
        currentEndDate = parseDisplayDate(initialEndDate);
      } catch (error) {
        console.error('Failed to parse initial dates:', error);
      }
    }

    if (passId) {
      fetchBookedDates();
    } else {
      loading = false;
    }
  });

  // ===== FETCH BOOKED DATES =====
  async function fetchBookedDates() {
    if (!passId) {
      loading = false;
      return;
    }

    try {
      const response = await fetch(`/api/passes/${passId}/booked-dates`);
      if (response.ok) {
        const data = await response.json();
        bookedDates = data.bookedDates || [];
      }
    } catch (error) {
      console.error('Failed to fetch booked dates:', error);
    } finally {
      loading = false;
    }
  }

  // ===== DATE UTILITIES =====
  function formatDateForComparison(date: Date): string {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${m}-${d}`;
  }

  function formatDateForDisplay(date: Date): string {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  function parseDisplayDate(dateString: string): Date {
    // Parse "Dec 23, 2025" format
    const [month, rest] = dateString.split(' ');
    const [day, year] = rest.split(', ');
    
    const monthMap: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    return new Date(parseInt(year), monthMap[month] || 0, parseInt(day));
  }

  function isDateBooked(date: Date): boolean {
    const dateStr = formatDateForComparison(date);
    return bookedDates.some(range => dateStr >= range.start && dateStr <= range.end);
  }

  function isDateInPast(date: Date): boolean {
    const normalized = getNormalizedDate(date);
    return normalized < today;
  }

  function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(month: number, year: number): number {
    return new Date(year, month, 1).getDay();
  }

  function getNormalizedDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  // ===== NAVIGATION =====
  function previousMonth() {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    if (firstDayOfMonth <= today) return;
    
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
  }

  $: canGoPrevious = new Date(currentYear, currentMonth, 1) > today;

  // ===== DATE SELECTION =====
  function selectDate(day: number) {
    const date = new Date(currentYear, currentMonth, day);
    
    // Can't select past or booked dates
    if (isDateInPast(date) || isDateBooked(date)) return;

    // If user is selecting their first new date, clear the old dates reference
    if (newStartDate === null && newEndDate === null) {
      currentStartDate = null;
      currentEndDate = null;
    }

    // First click = start date
    if (newStartDate === null) {
      newStartDate = date;
    } 
    // Second click = end date
    else if (newEndDate === null) {
      // Auto-sort: if they click an earlier date, make it start and push current start to end
      if (date < newStartDate) {
        newEndDate = newStartDate;
        newStartDate = date;
      } else {
        newEndDate = date;
      }
      
      // Emit the selection
      const startDisplay = formatDateForDisplay(newStartDate);
      const endDisplay = formatDateForDisplay(newEndDate);
      onDateRangeSelect(startDisplay, endDisplay);
    }
    // Subsequent clicks = adjust the range
    else {
      // Determine which end to adjust based on proximity
      const distToStart = Math.abs(date.getTime() - newStartDate.getTime());
      const distToEnd = Math.abs(date.getTime() - newEndDate.getTime());
      
      if (distToStart < distToEnd) {
        // Closer to start, adjust start
        if (date < newEndDate) {
          newStartDate = date;
        }
      } else {
        // Closer to end, adjust end
        if (date > newStartDate) {
          newEndDate = date;
        }
      }
      
      // Emit the update
      const startDisplay = formatDateForDisplay(newStartDate);
      const endDisplay = formatDateForDisplay(newEndDate);
      onDateRangeSelect(startDisplay, endDisplay);
    }
  }

  function resetSelection() {
    newStartDate = null;
    newEndDate = null;
    currentStartDate = initialStartDate ? parseDisplayDate(initialStartDate) : null;
    currentEndDate = initialEndDate ? parseDisplayDate(initialEndDate) : null;
  }

  // ===== CALENDAR DISPLAY VALUES =====
  $: daysInMonth = getDaysInMonth(currentMonth, currentYear);
  $: firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  $: monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  $: days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  $: emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  // ===== DAY CLASSIFICATION =====
  function getDayClass(day: number): string {
    const date = getNormalizedDate(new Date(currentYear, currentMonth, day));
    const classes: string[] = ['day'];

    // Check if past
    if (isDateInPast(date)) {
      return 'day past-date';
    }

    // Check if booked
    if (isDateBooked(date)) {
      return 'day booked';
    }

    classes.push('available');

    // Show current booking dates (only if no new selection has been made)
    if (newStartDate === null && newEndDate === null && currentStartDate && currentEndDate) {
      const currentStart = getNormalizedDate(currentStartDate);
      const currentEnd = getNormalizedDate(currentEndDate);
      
      const inCurrentRange = date >= currentStart && date <= currentEnd;
      
      if (inCurrentRange) {
        classes.push('current-booking');
        
        if (date.getTime() === currentStart.getTime() || date.getTime() === currentEnd.getTime()) {
          classes.push('current-endpoint');
        }
        
        return classes.join(' ');
      }
    }

    // Show new selection range
    if (newStartDate && newEndDate) {
      const newStart = getNormalizedDate(newStartDate);
      const newEnd = getNormalizedDate(newEndDate);
      
      const inNewRange = date >= newStart && date <= newEnd;
      
      if (inNewRange) {
        classes.push('new-selection');
        
        if (date.getTime() === newStart.getTime() || date.getTime() === newEnd.getTime()) {
          classes.push('new-endpoint');
        }
        
        return classes.join(' ');
      }
    }

    // Show preview range on hover when selecting
    if (newStartDate && !newEndDate && hoveredDate) {
      const start = getNormalizedDate(newStartDate);
      const end = getNormalizedDate(hoveredDate);
      const rangeStart = start < end ? start : end;
      const rangeEnd = start < end ? end : start;
      
      const inPreview = date >= rangeStart && date <= rangeEnd;
      
      if (inPreview) {
        classes.push('preview-range');
        return classes.join(' ');
      }
    }

    return classes.join(' ');
  }

  // ===== REACTIVE DAY CLASSES =====
  $: dayClassMap = (newStartDate, newEndDate, currentStartDate, currentEndDate, hoveredDate, currentMonth, currentYear, days) && 
    days.map(day => ({
      day,
      class: getDayClass(day)
    }));
</script>

<div class="edit-calendar">
  {#if loading}
    <div class="loading">Loading availability...</div>
  {:else}
    <!-- Current Booking Reference (shown only before first selection) -->
    {#if newStartDate === null && newEndDate === null && currentStartDate && currentEndDate}
      <div class="current-booking-info">
        <p class="info-label">Your Current Booking</p>
        <p class="info-dates">{formatDateForDisplay(currentStartDate)} – {formatDateForDisplay(currentEndDate)}</p>
        <p class="info-hint">Click to select new dates. Your current dates will disappear once you start selecting.</p>
      </div>
    {/if}

    <!-- New Selection Display -->
    {#if newStartDate && newEndDate}
      <div class="new-selection-info">
        <p class="info-label">New Dates Selected</p>
        <p class="info-dates">{formatDateForDisplay(newStartDate)} – {formatDateForDisplay(newEndDate)}</p>
        <p class="info-hint">Click dates to adjust. Click Reset to start over.</p>
      </div>
    {/if}

    <!-- Only Start Date Selected -->
    {#if newStartDate && !newEndDate}
      <div class="selection-progress-info">
        <p class="info-label">Start Date Selected</p>
        <p class="info-dates">{formatDateForDisplay(newStartDate)}</p>
        <p class="info-hint">Now click an end date to complete your selection.</p>
      </div>
    {/if}

    <!-- Calendar Header -->
    <div class="calendar-header">
      <button 
        type="button"
        class="nav-btn"
        on:click={previousMonth}
        disabled={!canGoPrevious}
        aria-label="Previous month"
      >
        <ChevronLeft size={20} />
      </button>
      <h3>{monthName}</h3>
      <button 
        type="button"
        class="nav-btn"
        on:click={nextMonth}
        aria-label="Next month"
      >
        <ChevronRight size={20} />
      </button>
    </div>

    <!-- Weekday Headers -->
    <div class="weekdays">
      <div class="weekday">Sun</div>
      <div class="weekday">Mon</div>
      <div class="weekday">Tue</div>
      <div class="weekday">Wed</div>
      <div class="weekday">Thu</div>
      <div class="weekday">Fri</div>
      <div class="weekday">Sat</div>
    </div>

    <!-- Days Grid -->
    <div class="days-grid">
      {#each emptyDays as _}
        <div class="empty-day"></div>
      {/each}

      {#each dayClassMap as { day, class: dayClass } (day)}
        {@const date = new Date(currentYear, currentMonth, day)}
        {@const isBooked = isDateBooked(date)}
        {@const isPast = isDateInPast(date)}
        {@const isClickable = !isBooked && !isPast}
        
        <button
          type="button"
          class={dayClass}
          on:click={() => isClickable && selectDate(day)}
          on:mouseenter={() => { hoveredDate = date; }}
          on:mouseleave={() => { hoveredDate = null; }}
          disabled={!isClickable}
        >
          {day}
        </button>
      {/each}
    </div>

    <!-- Calendar Actions -->
    <div class="calendar-actions">
      <button 
        type="button"
        class="reset-btn"
        on:click={resetSelection}
        disabled={newStartDate === null}
      >
        Reset Selection
      </button>
    </div>

    <!-- Legend -->
    <div class="calendar-legend">
      <div class="legend-item">
        <div class="legend-color available"></div>
        <span>Available</span>
      </div>
      <div class="legend-item">
        <div class="legend-color past"></div>
        <span>Past</span>
      </div>
      <div class="legend-item">
        <div class="legend-color booked"></div>
        <span>Booked</span>
      </div>
      {#if newStartDate === null && newEndDate === null && currentStartDate}
        <div class="legend-item">
          <div class="legend-color current"></div>
          <span>Your Current</span>
        </div>
      {/if}
      {#if newStartDate || newEndDate}
        <div class="legend-item">
          <div class="legend-color selected"></div>
          <span>Your New Dates</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .edit-calendar {
    background: #faf6f0;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    padding: 16px;
  }

  .loading {
    padding: 32px;
    text-align: center;
    color: #8b7355;
    font-size: 14px;
  }

  /* Info Boxes */
  .current-booking-info,
  .new-selection-info,
  .selection-progress-info {
    background: white;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .current-booking-info {
    border-left: 4px solid #d9a574;
  }

  .new-selection-info {
    border-left: 4px solid #8fa881;
  }

  .selection-progress-info {
    border-left: 4px solid #d9a574;
  }

  .info-label {
    margin: 0 0 4px 0;
    font-size: 12px;
    font-weight: 600;
    color: #8b7355;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-dates {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 700;
    color: #5a4a3a;
  }

  .info-hint {
    margin: 0;
    font-size: 12px;
    color: #8b7355;
    font-style: italic;
  }

  /* Calendar Header */
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #d4c4b0;
  }

  .calendar-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #5a4a3a;
  }

  .nav-btn {
    background: none;
    border: none;
    color: #8b7355;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    border-radius: 2px;
  }

  .nav-btn:hover:not(:disabled) {
    background: rgba(217, 165, 116, 0.2);
    color: #5a4a3a;
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Weekdays */
  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    margin-bottom: 8px;
  }

  .weekday {
    text-align: center;
    font-size: 11px;
    font-weight: 700;
    color: #8b7355;
    padding: 4px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Days Grid */
  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    margin-bottom: 12px;
  }

  .empty-day {
    aspect-ratio: 1;
  }

  .day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid #d4c4b0;
    background: white;
    color: #5a4a3a;
    font-family: 'Fredoka', sans-serif;
    padding: 0;
  }

  .day:hover:not(:disabled) {
    background: #e8dcc8;
    border-color: #8b7355;
    transform: scale(1.08);
  }

  .day.available {
    border-color: #d4c4b0;
    background: white;
  }

  /* Past dates */
  .day.past-date {
    background: #ccc;
    color: #999;
    border-color: #bbb;
    cursor: not-allowed;
    opacity: 0.4;
  }

  .day.past-date:hover {
    transform: none;
  }

  /* Booked dates */
  .day.booked {
    background: #d4c4b0;
    color: #8b7355;
    border-color: #a0937f;
    cursor: not-allowed;
    opacity: 0.5;
  }

  .day.booked:hover {
    transform: none;
  }

  /* Current booking dates (reference) */
  .day.current-booking {
    background: rgba(217, 165, 116, 0.2);
    border-color: #d9a574;
    color: #5a4a3a;
  }

  .day.current-booking:hover:not(:disabled) {
    background: rgba(217, 165, 116, 0.3);
    transform: scale(1.05);
  }

  .day.current-booking.current-endpoint {
    background: #d9a574;
    color: white;
    border-color: #8b7355;
    font-weight: 700;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .day.current-booking.current-endpoint:hover:not(:disabled) {
    background: #c85a54;
  }

  /* New selection range */
  .day.new-selection {
    background: rgba(143, 168, 129, 0.3);
    border-color: #8fa881;
    color: #5a4a3a;
  }

  .day.new-selection:hover:not(:disabled) {
    background: rgba(143, 168, 129, 0.4);
    transform: scale(1.05);
  }

  .day.new-selection.new-endpoint {
    background: #8fa881;
    color: white;
    border-color: #5a7a4a;
    font-weight: 700;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .day.new-selection.new-endpoint:hover:not(:disabled) {
    background: #7a9a6f;
  }

  /* Preview range on hover */
  .day.preview-range {
    background: rgba(143, 168, 129, 0.2);
    border-color: #8fa881;
  }

  .day:disabled {
    cursor: not-allowed;
  }

  /* Calendar Actions */
  .calendar-actions {
    margin-bottom: 12px;
    text-align: center;
  }

  .reset-btn {
    background: white;
    color: #8b7355;
    border: 1px solid #d4c4b0;
    padding: 8px 16px;
    border-radius: 2px;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-btn:hover:not(:disabled) {
    background: #e8dcc8;
    border-color: #8b7355;
  }

  .reset-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Legend */
  .calendar-legend {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding-top: 12px;
    border-top: 1px solid #d4c4b0;
    font-size: 12px;
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #8b7355;
  }

  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    border: 1px solid #8b7355;
  }

  .legend-color.available {
    background: white;
  }

  .legend-color.past {
    background: #ccc;
  }

  .legend-color.booked {
    background: #d4c4b0;
  }

  .legend-color.current {
    background: #d9a574;
  }

  .legend-color.selected {
    background: #8fa881;
  }

  @media (max-width: 480px) {
    .edit-calendar {
      padding: 12px;
    }

    .calendar-header h3 {
      font-size: 14px;
    }

    .day {
      font-size: 12px;
    }

    .calendar-legend {
      gap: 8px;
      font-size: 11px;
    }

    .legend-color {
      width: 12px;
      height: 12px;
    }

    .info-dates {
      font-size: 14px;
    }
  }
</style>
