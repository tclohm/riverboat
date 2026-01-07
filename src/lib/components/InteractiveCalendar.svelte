<script lang="ts">
  import { ChevronLeft, ChevronRight, X, Calendar } from '@lucide/svelte';
  import { onMount } from 'svelte';

  // Props - same interface as before
  export let passId: number | null = null;
  export let onDateRangeSelect: (startDate: string, endDate: string) => void = () => {};

  // State
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  let numberOfMonths = 2;
  
  let selectedStartDate: Date | null = null;
  let selectedEndDate: Date | null = null;
  let hoveredDate: Date | null = null;
  let focusedInput: 'start' | 'end' = 'start';
  
  let bookedDates: {start: string, end: string}[] = [];
  let loading = true;
  let isOpen = false;

  // Memoization cache
  let gridCache: Record<string, (Date | null)[][]> = {};

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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

  onMount(() => {
    if (passId) {
      fetchBookedDates();
    } else {
      loading = false;
    }
  });

  // ===== UTILITY FUNCTIONS =====
  function formatDateForComparison(date: Date): string {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${m}-${d}`;
  }

  function formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  }

  function formatFullDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  function isDateBooked(date: Date): boolean {
    const dateStr = formatDateForComparison(date);
    return bookedDates.some(range => dateStr >= range.start && dateStr <= range.end);
  }

  function isDateInPast(date: Date): boolean {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return normalized < today;
  }

  function isSameDay(date1: Date | null, date2: Date | null): boolean {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  }

  function isInRange(date: Date): boolean {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date > selectedStartDate && date < selectedEndDate;
  }

  function isInHoverRange(date: Date): boolean {
    if (!selectedStartDate || !hoveredDate || selectedEndDate) return false;
    if (focusedInput !== 'end') return false;
    
    const start = selectedStartDate < hoveredDate ? selectedStartDate : hoveredDate;
    const end = selectedStartDate < hoveredDate ? hoveredDate : selectedStartDate;
    return date > start && date <= end;
  }

  function isDateDisabled(date: Date): boolean {
    return isDateInPast(date) || isDateBooked(date);
  }

  // ===== GRID GENERATION (MEMOIZED) =====
  function generateMonthGrid(year: number, month: number): (Date | null)[][] {
    const cacheKey = `${year}-${month}`;
    if (gridCache[cacheKey]) return gridCache[cacheKey];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();

    const grid: (Date | null)[][] = [];
    let dayCounter = 1 - startingDay;

    for (let week = 0; week < 6; week++) {
      const weekRow: (Date | null)[] = [];
      for (let day = 0; day < 7; day++) {
        if (dayCounter < 1 || dayCounter > lastDay.getDate()) {
          weekRow.push(null);
        } else {
          weekRow.push(new Date(year, month, dayCounter));
        }
        dayCounter++;
      }
      grid.push(weekRow);
    }

    gridCache[cacheKey] = grid;
    return grid;
  }

  // ===== VISIBLE MONTHS =====
  $: visibleMonths = Array.from({ length: numberOfMonths }, (_, i) => {
    const date = new Date(currentYear, currentMonth + i, 1);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      name: `${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
      grid: generateMonthGrid(date.getFullYear(), date.getMonth())
    };
  });

  // ===== NAVIGATION =====
  $: canGoPrevious = new Date(currentYear, currentMonth, 1) > today;

  function goToPreviousMonth() {
    if (!canGoPrevious) return;
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
  }

  function goToNextMonth() {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
  }

  // ===== SELECTION LOGIC =====
  function onDayClick(date: Date | null) {
    if (!date || isDateDisabled(date)) return;

    if (focusedInput === 'start') {
      selectedStartDate = date;
      selectedEndDate = null;
      focusedInput = 'end';
    } else {
      if (date < selectedStartDate!) {
        selectedEndDate = selectedStartDate;
        selectedStartDate = date;
      } else {
        selectedEndDate = date;
      }
      focusedInput = 'start';
      
      // Emit the completed range
      if (selectedStartDate && selectedEndDate) {
        onDateRangeSelect(
          formatFullDate(selectedStartDate),
          formatFullDate(selectedEndDate)
        );
      }
    }
  }

  function onDayHover(date: Date | null) {
    if (focusedInput === 'end' && selectedStartDate && !selectedEndDate && date) {
      hoveredDate = date;
    }
  }

  function onDayLeave() {
    hoveredDate = null;
  }

  function resetSelection() {
    selectedStartDate = null;
    selectedEndDate = null;
    focusedInput = 'start';
    hoveredDate = null;
  }

  function toggleCalendar() {
    isOpen = !isOpen;
  }

  // ===== DAY CLASSES =====
  function getDayClasses(date: Date | null): string {
    const classes: string[] = ['day'];

    if (!date) {
      classes.push('empty');
      return classes.join(' ');
    }

    if (isDateInPast(date)) {
      classes.push('past');
      return classes.join(' ');
    }

    if (isDateBooked(date)) {
      classes.push('booked');
      return classes.join(' ');
    }

    classes.push('available');

    // Selected endpoints
    if (isSameDay(date, selectedStartDate)) {
      classes.push('selected', 'start-date');
    }
    if (isSameDay(date, selectedEndDate)) {
      classes.push('selected', 'end-date');
    }

    // In confirmed range
    if (isInRange(date)) {
      classes.push('in-range');
    }

    // Hover preview range
    if (isInHoverRange(date)) {
      classes.push('hover-range');
    }

    // Today
    if (isSameDay(date, today)) {
      classes.push('today');
    }

    return classes.join(' ');
  }

  // ===== DISPLAY TEXT =====
  $: displayText = selectedStartDate && selectedEndDate
    ? `${formatDateForDisplay(selectedStartDate)} - ${formatDateForDisplay(selectedEndDate)}`
    : selectedStartDate
      ? `${formatDateForDisplay(selectedStartDate)} - ?`
      : 'Select dates';

  $: statusText = selectedStartDate === null
    ? 'Select check-in date'
    : selectedEndDate === null
      ? 'Select check-out date'
      : `${Math.round((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24))} nights selected`;

  // FORCE recalculation of day classes when state changes
  // This creates a reactive map that updates whenever selection/hover changes
  $: dayClassMaps = visibleMonths.map(month => {
    // These dependencies trigger recalculation
    const _deps = [selectedStartDate, selectedEndDate, hoveredDate, focusedInput];
    
    return month.grid.flat().map(date => ({
      date,
      class: getDayClasses(date)
    }));
  });
</script>

<div class="calendar-wrapper">
  <!-- Trigger Button -->
  <button 
    type="button"
    class="calendar-trigger"
    class:active={isOpen}
    class:has-selection={selectedStartDate}
    on:click={toggleCalendar}
  >
    <Calendar size={18} />
    <span class="trigger-text">{displayText}</span>
    {#if selectedStartDate}
      <button 
        type="button"
        class="clear-trigger"
        on:click|stopPropagation={resetSelection}
        aria-label="Clear dates"
      >
        <X size={14} />
      </button>
    {/if}
  </button>

  <!-- Inline Calendar (expands below trigger) -->
  {#if isOpen}
    <div class="calendar-panel">
      {#if loading}
        <div class="loading">Loading availability...</div>
      {:else}
        <!-- Header with navigation -->
        <div class="calendar-header">
          <button 
            type="button"
            class="nav-btn"
            on:click={goToPreviousMonth}
            disabled={!canGoPrevious}
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div class="months-title">
            {#each visibleMonths as month}
              <span class="month-name">{month.name}</span>
            {/each}
          </div>
          
          <button 
            type="button"
            class="nav-btn"
            on:click={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <!-- Status -->
        <div class="selection-status">
          <p>{statusText}</p>
        </div>

        <!-- Calendars -->
        <div class="calendars">
          {#each visibleMonths as month, monthIndex}
            <div class="calendar">
              <div class="month-label">{month.name}</div>
              <div class="weekdays">
                {#each DAYS as day}
                  <span class="weekday">{day}</span>
                {/each}
              </div>

              <div class="days-grid">
                {#each dayClassMaps[monthIndex] as { date, class: dayClass }}
                  <button
                    type="button"
                    class={dayClass}
                    disabled={!date || isDateDisabled(date)}
                    on:click={() => onDayClick(date)}
                    on:mouseenter={() => onDayHover(date)}
                    on:mouseleave={onDayLeave}
                  >
                    {date ? date.getDate() : ''}
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>

        <!-- Footer -->
        <div class="calendar-footer">
          <div class="legend">
            <div class="legend-item">
              <span class="legend-dot available"></span>
              <span>Available</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot booked"></span>
              <span>Booked</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot selected"></span>
              <span>Selected</span>
            </div>
          </div>
          
          <div class="footer-actions">
            <button 
              type="button"
              class="btn-clear"
              on:click={resetSelection}
              disabled={!selectedStartDate}
            >
              Clear
            </button>
            <button 
              type="button"
              class="btn-done"
              on:click={toggleCalendar}
            >
              Done
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .calendar-wrapper {
    width: 100%;
  }

  /* ===== TRIGGER BUTTON ===== */
  .calendar-trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 14px 16px;
    background: white;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Fredoka', sans-serif;
    color: #8b7355;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .calendar-trigger:hover {
    border-color: #8b7355;
    background: #faf6f0;
  }

  .calendar-trigger.active {
    border-color: #c85a54;
    box-shadow: 0 0 0 3px rgba(200, 90, 84, 0.15);
  }

  .calendar-trigger.has-selection {
    color: #5a4a3a;
    background: #faf6f0;
  }

  .trigger-text {
    flex: 1;
  }

  .clear-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    background: #d4c4b0;
    border: none;
    border-radius: 50%;
    color: #5a4a3a;
    cursor: pointer;
    transition: all 0.15s;
  }

  .clear-trigger:hover {
    background: #c85a54;
    color: white;
  }

  /* ===== CALENDAR PANEL (inline, not dropdown) ===== */
  .calendar-panel {
    background: #faf6f0;
    border: 2px solid #d4c4b0;
    border-top: none;
    border-radius: 0 0 4px 4px;
    padding: 16px;
    animation: slideDown 0.2s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .loading {
    padding: 32px;
    text-align: center;
    color: #8b7355;
    font-size: 14px;
  }

  /* ===== HEADER ===== */
  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    background: white;
    border: 1px solid #d4c4b0;
    border-radius: 2px;
    color: #8b7355;
    cursor: pointer;
    transition: all 0.15s;
  }

  .nav-btn:hover:not(:disabled) {
    background: #d9a574;
    border-color: #8b7355;
    color: white;
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .months-title {
    display: none; /* Hidden on desktop, shown per-calendar */
  }

  /* ===== STATUS ===== */
  .selection-status {
    text-align: center;
    padding: 8px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 2px;
    margin-bottom: 12px;
  }

  .selection-status p {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: #8b7355;
  }

  /* ===== CALENDARS ===== */
  .calendars {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .calendar {
    min-width: 0;
  }

  .month-label {
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    color: #5a4a3a;
    margin-bottom: 8px;
    font-family: 'Fredoka', sans-serif;
  }

  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 4px;
  }

  .weekday {
    text-align: center;
    font-size: 10px;
    font-weight: 700;
    color: #8b7355;
    padding: 4px 0;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  /* ===== DAY CELLS ===== */
  .day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Fredoka', sans-serif;
    background: white;
    border: 1px solid #e8dcc8;
    border-radius: 2px;
    color: #5a4a3a;
    cursor: pointer;
    transition: all 0.12s ease;
    padding: 0;
    min-width: 0;
  }

  .day.empty {
    background: transparent;
    border-color: transparent;
    cursor: default;
  }

  .day.past {
    background: #e8dcc8;
    color: #a0937f;
    cursor: not-allowed;
    border-color: #d4c4b0;
  }

  .day.booked {
    background: #d4c4b0;
    color: #8b7355;
    cursor: not-allowed;
    border-color: #a0937f;
    position: relative;
  }

  .day.booked::after {
    content: '';
    position: absolute;
    width: 60%;
    height: 2px;
    background: #8b7355;
    transform: rotate(-45deg);
  }

  .day.available:hover {
    background: #e8dcc8;
    border-color: #8b7355;
    transform: scale(1.08);
  }

  .day.today {
    font-weight: 800;
    border-color: #d9a574;
    border-width: 2px;
  }

  /* Selected states */
  .day.selected {
    background: #d9a574 !important;
    color: white !important;
    border-color: #8b7355 !important;
    font-weight: 700;
    box-shadow: 0 2px 6px rgba(217, 165, 116, 0.4);
    transform: scale(1.05);
  }

  .day.start-date {
    border-radius: 2px 0 0 2px;
  }

  .day.end-date {
    border-radius: 0 2px 2px 0;
  }

  .day.start-date.end-date {
    border-radius: 2px;
  }

  .day.in-range {
    background: rgba(217, 165, 116, 0.25);
    border-color: rgba(217, 165, 116, 0.5);
    border-radius: 0;
    color: #5a4a3a;
  }

  .day.hover-range {
    background: rgba(217, 165, 116, 0.15);
    border-color: rgba(217, 165, 116, 0.4);
    border-radius: 0;
  }

  /* ===== FOOTER ===== */
  .calendar-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #d4c4b0;
    flex-wrap: wrap;
    gap: 12px;
  }

  .legend {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 600;
    color: #8b7355;
  }

  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    border: 1px solid #8b7355;
  }

  .legend-dot.available {
    background: white;
  }

  .legend-dot.booked {
    background: #d4c4b0;
  }

  .legend-dot.selected {
    background: #d9a574;
  }

  .footer-actions {
    display: flex;
    gap: 8px;
  }

  .btn-clear,
  .btn-done {
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 700;
    font-family: 'Fredoka', sans-serif;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-clear {
    background: white;
    color: #8b7355;
    border: 1px solid #d4c4b0;
  }

  .btn-clear:hover:not(:disabled) {
    background: #c85a54;
    color: white;
    border-color: #8b7355;
  }

  .btn-clear:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-done {
    background: #d9a574;
    color: white;
    border: 1px solid #8b7355;
  }

  .btn-done:hover {
    background: #c85a54;
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 500px) {
    .calendars {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .calendar-header {
      margin-bottom: 8px;
    }

    .legend {
      width: 100%;
      justify-content: center;
    }

    .footer-actions {
      width: 100%;
    }

    .btn-clear,
    .btn-done {
      flex: 1;
      text-align: center;
    }

    .calendar-footer {
      flex-direction: column;
    }
  }
</style>
