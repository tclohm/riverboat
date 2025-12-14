<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';
  import { onMount } from 'svelte';

  export let passId: number | null = null;
  export let onDateRangeSelect: (startDate: string, endDate: string) => void = () => {};

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  
  // Store full Date objects for multi-month selection
  let selectedStartDate: Date | null = null;
  let selectedEndDate: Date | null = null;
  let hoveredDate: Date | null = null;
  
  let bookedDates: {start: string, end: string}[] = [];
  let loading = true;

  // ===== FETCH DATA ===== 
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

  onMount(() => {
    if (passId) {
      fetchBookedDates()
    }
  })


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

  function isDateBooked(date: Date): boolean {
    const dateStr = formatDateForComparison(date);
    return bookedDates.some(range => dateStr >= range.start && dateStr <= range.end);
  }

  function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(month: number, year: number): number {
    return new Date(year, month, 1).getDay();
  }

  // ===== NAVIGATION =====
  function previousMonth() {
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

  // ===== SELECTION LOGIC =====
  function selectDate(day: number) {
    const date = new Date(currentYear, currentMonth, day);
    
    // Can't select booked dates
    if (isDateBooked(date)) return;

    if (selectedStartDate === null) {
      // First selection
      selectedStartDate = date;
      console.log('Start date selected:', selectedStartDate);
    } else if (selectedEndDate === null) {
      // Second selection - auto-sort
      if (date < selectedStartDate) {
        selectedEndDate = selectedStartDate;
        selectedStartDate = date;
      } else {
        selectedEndDate = date;
      }
      
      console.log('End date selected:', selectedEndDate);
      console.log('Ordered range:', {
        start: selectedStartDate,
        end: selectedEndDate
      });
      
      // Emit the range
      const startDisplay = formatDateForDisplay(selectedStartDate);
      const endDisplay = formatDateForDisplay(selectedEndDate);
      onDateRangeSelect(startDisplay, endDisplay);
    }
  }

  // Debug reactive ranges
  $: if (orderedRange) {
    console.log('Ordered range updated:', {
      start: orderedRange.start,
      end: orderedRange.end
    });
  }

  function resetSelection() {
    selectedStartDate = null;
    selectedEndDate = null;
  }

  // ===== REACTIVE CALCULATIONS =====
  
  // Normalize selected range (ensure start < end)
  $: orderedRange = selectedStartDate && selectedEndDate
    ? {
        start: selectedStartDate < selectedEndDate ? selectedStartDate : selectedEndDate,
        end: selectedStartDate < selectedEndDate ? selectedEndDate : selectedStartDate
      }
    : null;

  // Normalize hover range (for preview when start is selected but end is not)
  $: hoverRange = selectedStartDate && !selectedEndDate && hoveredDate
    ? {
        start: selectedStartDate < hoveredDate ? selectedStartDate : hoveredDate,
        end: selectedStartDate < hoveredDate ? hoveredDate : selectedStartDate
      }
    : null;

  // Display range text
  $: displayRangeText = selectedStartDate && selectedEndDate
    ? `${formatDateForDisplay(orderedRange!.start)} - ${formatDateForDisplay(orderedRange!.end)}`
    : '';

  // Calendar display values
  $: daysInMonth = getDaysInMonth(currentMonth, currentYear);
  $: firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  $: monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  $: days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  $: emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  // Helper to normalize date to midnight (remove time component)
  function getNormalizedDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  // ===== DAY CLASSIFICATION =====
  function getDayClass(day: number): string {
    const date = getNormalizedDate(new Date(currentYear, currentMonth, day));
    const classes: string[] = ['day'];

    // Check if booked
    if (isDateBooked(getNormalizedDate(date))) {
      return 'day booked';
    }

    classes.push('available');

    // Check if in confirmed selected range
    if (orderedRange) {
      const rangeStart = getNormalizedDate(orderedRange.start);
      const rangeEnd = getNormalizedDate(orderedRange.end);
      
      const inRange = date >= rangeStart && date <= rangeEnd;
      
      if (inRange) {
        classes.push('in-range');
        
        // Check if it's an endpoint
        if (date.getTime() === rangeStart.getTime() || date.getTime() === rangeEnd.getTime()) {
          classes.push('endpoint');
        }
        
        return classes.join(' ');
      }
    }

    // Check if in hover preview range (only if start selected but end not selected)
    if (hoverRange) {
      const rangeStart = getNormalizedDate(hoverRange.start);
      const rangeEnd = getNormalizedDate(hoverRange.end);
      
      const inRange = date >= rangeStart && date <= rangeEnd;
      
      if (inRange) {
        classes.push('hover-range');
        
        // Check if it's an endpoint of hover range
        if (date.getTime() === rangeStart.getTime() || date.getTime() === rangeEnd.getTime()) {
          classes.push('endpoint');
        }
        
        return classes.join(' ');
      }
    }

    // Check if it's the start selection (before end is selected)
    if (selectedStartDate && !selectedEndDate && date.getTime() === getNormalizedDate(selectedStartDate).getTime()) {
      classes.push('selected');
    }

    return classes.join(' ');
  }

  // FORCE recalculation of all day classes when:
  // - orderedRange changes (selection made)
  // - hoveredDate changes (hover preview)
  // - currentMonth/currentYear changes (month navigation)
  // - days changes (derived from month change)
  $: dayClassMap = (orderedRange, hoveredDate, hoverRange, selectedStartDate, selectedEndDate, currentMonth, currentYear, days) && days.map(day => ({
    day,
    class: getDayClass(day)
  }));
</script>

<div class="calendar">
  {#if loading}
    <div class="loading">Loading availability...</div>
  {:else}
    <!-- Header with month navigation -->
    <div class="calendar-header">
      <button 
        type="button"
        class="nav-btn"
        on:click={previousMonth}
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

    <!-- Selection status -->
    <div class="selection-status">
      {#if selectedStartDate === null}
        <p class="status-text">Tap start date</p>
      {:else if selectedEndDate === null}
        <p class="status-text">Tap end date</p>
      {:else}
        <p class="status-text selected">{displayRangeText}</p>
      {/if}
    </div>

    <!-- Weekday headers -->
    <div class="weekdays">
      <div class="weekday">Sun</div>
      <div class="weekday">Mon</div>
      <div class="weekday">Tue</div>
      <div class="weekday">Wed</div>
      <div class="weekday">Thu</div>
      <div class="weekday">Fri</div>
      <div class="weekday">Sat</div>
    </div>

    <!-- Days grid -->
    <div class="days-grid">
      {#each emptyDays as _}
        <div class="empty-day"></div>
      {/each}

      {#each dayClassMap as { day, class: dayClass } (day)}
        {@const date = new Date(currentYear, currentMonth, day)}
        {@const isBooked = isDateBooked(date)}
        
        <button
          type="button"
          class={dayClass}
          on:click={() => selectDate(day)}
          on:mouseenter={() => { hoveredDate = date; }}
          on:mouseleave={() => { hoveredDate = null; }}
          disabled={isBooked}
        >
          {day}
        </button>
      {/each}
    </div>

    <!-- Reset button -->
    <div class="calendar-actions">
      <button 
        type="button"
        class="reset-btn"
        on:click={resetSelection}
        disabled={selectedStartDate === null}
      >
        Reset
      </button>
    </div>

    <!-- Legend -->
    <div class="calendar-legend">
      <div class="legend-item">
        <div class="legend-color available"></div>
        <span>Available</span>
      </div>
      <div class="legend-item">
        <div class="legend-color booked"></div>
        <span>Booked</span>
      </div>
      <div class="legend-item">
        <div class="legend-color selected"></div>
        <span>Selected</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .calendar {
    background: #faf6f0;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    padding: 16px;
    margin-top: 24px;
  }

  .loading {
    padding: 32px;
    text-align: center;
    color: #8b7355;
    font-size: 14px;
  }

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

  .nav-btn:hover {
    background: rgba(217, 165, 116, 0.2);
    color: #5a4a3a;
  }

  .selection-status {
    text-align: center;
    margin-bottom: 12px;
    padding: 12px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 2px;
  }

  .status-text {
    margin: 0;
    font-size: 13px;
    color: #8b7355;
    font-weight: 600;
  }

  .status-text.selected {
    color: #d9a574;
    font-size: 14px;
    font-weight: 700;
  }

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

  /* Booked dates - disabled */
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

  /* Confirmed selected range - light highlight for middle dates */
  .day.in-range {
    background: rgba(217, 165, 116, 0.3);
    border-color: #d9a574;
    color: #5a4a3a;
  }

  .day.in-range:hover:not(:disabled) {
    background: rgba(217, 165, 116, 0.4);
    transform: scale(1.05);
  }

  /* Endpoints of confirmed range - dark highlight */
  .day.in-range.endpoint {
    background: #d9a574;
    color: white;
    border-color: #8b7355;
    font-weight: 700;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .day.in-range.endpoint:hover:not(:disabled) {
    background: #c85a54;
  }

  /* Hover preview range - very light highlight */
  .day.hover-range {
    background: rgba(217, 165, 116, 0.2);
    border-color: #d9a574;
    color: #5a4a3a;
  }

  .day.hover-range:hover:not(:disabled) {
    background: rgba(217, 165, 116, 0.3);
    transform: scale(1.05);
  }

  /* Endpoints during hover preview */
  .day.hover-range.endpoint {
    background: #d9a574;
    color: white;
    border-color: #8b7355;
    font-weight: 700;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  /* Initial start selection (before end date selected) */
  .day.selected {
    background: #d9a574;
    color: white;
    border-color: #8b7355;
    font-weight: 700;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .day.selected:hover:not(:disabled) {
    background: #c85a54;
  }

  .day:disabled {
    cursor: not-allowed;
  }

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

  .legend-color.booked {
    background: #d4c4b0;
  }

  .legend-color.selected {
    background: #d9a574;
  }

  @media (max-width: 480px) {
    .calendar {
      padding: 12px;
    }

    .calendar-header h3 {
      font-size: 14px;
    }

    .selection-status {
      padding: 10px;
      margin-bottom: 10px;
    }

    .status-text {
      font-size: 12px;
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
  }
</style>
