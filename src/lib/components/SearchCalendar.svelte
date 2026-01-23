<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';

  export let onDateRangeSelect: (startDate: string, endDate: string) => void = () => {};
  export let initialStartDate: string = '';
  export let initialEndDate: string = '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from current month, show 2 months (3 on xl)
  let startMonth = today.getMonth();
  let startYear = today.getFullYear();
  
  let selectedStartDate: Date | null = null;
  let selectedEndDate: Date | null = null;
  let hoveredDate: Date | null = null;
  let showThirdMonth = false;

  // Check screen size on mount
  import { onMount } from 'svelte';
  
  onMount(() => {
    const checkWidth = () => {
      showThirdMonth = window.innerWidth >= 1200;
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  });

  // Generate array of 2 or 3 consecutive months
  $: monthCount = showThirdMonth ? 3 : 2;
  $: months = Array.from({ length: monthCount }, (_, offset) => {
    let month = startMonth + offset;
    let year = startYear;
    while (month > 11) {
      month -= 12;
      year++;
    }
    return { month, year };
  });

  function previousMonths() {
    // Don't go before current month
    const firstVisible = new Date(startYear, startMonth, 1);
    if (firstVisible <= today) return;
    
    startMonth--;
    if (startMonth < 0) {
      startMonth = 11;
      startYear--;
    }
  }

  function nextMonths() {
    startMonth++;
    if (startMonth > 11) {
      startMonth = 0;
      startYear++;
    }
  }

  $: canGoPrevious = new Date(startYear, startMonth, 1) > today;

  // Date utilities
  function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(month: number, year: number): number {
    return new Date(year, month, 1).getDay();
  }

  function getMonthName(month: number, year: number): string {
    return new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  function getNormalizedDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function formatDateForDisplay(date: Date): string {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  function isDateInPast(date: Date): boolean {
    return getNormalizedDate(date) < today;
  }

  // Selection logic
  function selectDate(day: number, month: number, year: number) {
    const date = new Date(year, month, day);
    
    if (isDateInPast(date)) return;

    if (selectedStartDate === null) {
      selectedStartDate = date;
    } else if (selectedEndDate === null) {
      if (date < selectedStartDate) {
        selectedEndDate = selectedStartDate;
        selectedStartDate = date;
      } else {
        selectedEndDate = date;
      }
      
      // Emit the range
      const startDisplay = formatDateForDisplay(selectedStartDate);
      const endDisplay = formatDateForDisplay(selectedEndDate);
      onDateRangeSelect(startDisplay, endDisplay);
    } else {
      // Reset and start new selection
      selectedStartDate = date;
      selectedEndDate = null;
    }
  }

  function resetSelection() {
    selectedStartDate = null;
    selectedEndDate = null;
    hoveredDate = null;
  }

  // Computed ranges
  $: orderedRange = selectedStartDate && selectedEndDate
    ? {
        start: selectedStartDate < selectedEndDate ? selectedStartDate : selectedEndDate,
        end: selectedStartDate < selectedEndDate ? selectedEndDate : selectedStartDate
      }
    : null;

  $: hoverRange = selectedStartDate && !selectedEndDate && hoveredDate
    ? {
        start: selectedStartDate < hoveredDate ? selectedStartDate : hoveredDate,
        end: selectedStartDate < hoveredDate ? hoveredDate : selectedStartDate
      }
    : null;

  $: displayRangeText = selectedStartDate && selectedEndDate
    ? `${formatDateForDisplay(orderedRange!.start)} - ${formatDateForDisplay(orderedRange!.end)}`
    : selectedStartDate 
    ? `${formatDateForDisplay(selectedStartDate)} - Select end date`
    : 'Select check-in date';

  // INLINE day class computation - this ensures Svelte reactivity works properly
  // Instead of using a Map and getDayData, we compute classes directly in the template
  function getDayClass(day: number, month: number, year: number, currentHoverRange: typeof hoverRange, currentOrderedRange: typeof orderedRange, currentSelectedStart: Date | null, currentSelectedEnd: Date | null): string {
    const date = getNormalizedDate(new Date(year, month, day));
    const classes: string[] = ['day'];

    if (isDateInPast(date)) {
      return 'day past';
    }

    classes.push('available');

    // Check confirmed range
    if (currentOrderedRange) {
      const rangeStart = getNormalizedDate(currentOrderedRange.start);
      const rangeEnd = getNormalizedDate(currentOrderedRange.end);
      
      if (date >= rangeStart && date <= rangeEnd) {
        classes.push('in-range');
        if (date.getTime() === rangeStart.getTime() || date.getTime() === rangeEnd.getTime()) {
          classes.push('endpoint');
        }
        return classes.join(' ');
      }
    }

    // Check hover preview - THIS IS THE KEY FIX
    // By passing hoverRange as a parameter, Svelte will re-run this when hoverRange changes
    if (currentHoverRange) {
      const rangeStart = getNormalizedDate(currentHoverRange.start);
      const rangeEnd = getNormalizedDate(currentHoverRange.end);
      
      if (date >= rangeStart && date <= rangeEnd) {
        classes.push('hover-range');
        if (date.getTime() === rangeStart.getTime() || date.getTime() === rangeEnd.getTime()) {
          classes.push('endpoint');
        }
        return classes.join(' ');
      }
    }

    // Single start selection
    if (currentSelectedStart && !currentSelectedEnd && date.getTime() === getNormalizedDate(currentSelectedStart).getTime()) {
      classes.push('selected');
    }

    return classes.join(' ');
  }

  // Check if today
  function isToday(day: number, month: number, year: number): boolean {
    const date = new Date(year, month, day);
    return date.toDateString() === today.toDateString();
  }
</script>

<div class="search-calendar">
  <!-- Header with navigation and status -->
  <div class="calendar-header">
    <button 
      type="button"
      class="nav-btn"
      on:click={previousMonths}
      disabled={!canGoPrevious}
      aria-label="Previous months"
    >
      <ChevronLeft size={20} />
    </button>
    
    <div class="date-display">
      {displayRangeText}
    </div>
    
    <button 
      type="button"
      class="nav-btn"
      on:click={nextMonths}
      aria-label="Next months"
    >
      <ChevronRight size={20} />
    </button>
  </div>

  <!-- Month grid -->
  <div class="months-grid">
    {#each months as { month, year }}
      {@const firstDay = getFirstDayOfMonth(month, year)}
      {@const daysInMonth = getDaysInMonth(month, year)}
      {@const emptyDays = Array.from({ length: firstDay }, (_, i) => i)}
      {@const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)}
      
      <div class="month">
        <h3 class="month-name">{getMonthName(month, year)}</h3>
        
        <div class="weekdays">
          <span>S</span>
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
        </div>
        
        <div class="days-grid">
          {#each emptyDays as _}
            <div class="empty"></div>
          {/each}
          
          {#each days as day (day)}
            <!-- KEY FIX: Pass reactive values directly to ensure Svelte tracks changes -->
            <button
              type="button"
              class={getDayClass(day, month, year, hoverRange, orderedRange, selectedStartDate, selectedEndDate)}
              class:today={isToday(day, month, year)}
              on:click={() => selectDate(day, month, year)}
              on:mouseenter={() => { hoveredDate = new Date(year, month, day); }}
              on:mouseleave={() => { hoveredDate = null; }}
              disabled={isDateInPast(new Date(year, month, day))}
            >
              {day}
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <!-- Footer -->
  <div class="calendar-footer">
    <div class="legend">
      <span class="legend-item"><span class="swatch available"></span> Available</span>
      <span class="legend-item"><span class="swatch past"></span> Past</span>
      <span class="legend-item"><span class="swatch selected"></span> Selected</span>
    </div>
    
    <div class="actions">
      <button type="button" class="clear-btn" on:click={resetSelection}>
        Clear
      </button>
    </div>
  </div>
</div>

<style>
  .search-calendar {
    width: 100%;
  }

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #d4c4b0;
  }

  .nav-btn {
    background: none;
    border: 2px solid #d4c4b0;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #8b7355;
    transition: all 0.2s;
  }

  .nav-btn:hover:not(:disabled) {
    border-color: #8b7355;
    background: rgba(217, 165, 116, 0.1);
    color: #5a4a3a;
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .date-display {
    font-size: 15px;
    font-weight: 600;
    color: #5a4a3a;
    text-align: center;
    padding: 10px 20px;
    background: #faf6f0;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    min-width: 280px;
  }

  /* Two/three month grid */
  .months-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }

  /* 3 columns on xl screens */
  @media (min-width: 1200px) {
    .months-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .month {
    min-width: 0;
  }

  .month-name {
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    color: #5a4a3a;
    margin: 0 0 12px 0;
  }

  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    margin-bottom: 6px;
  }

  .weekdays span {
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: #a0937f;
    padding: 4px 0;
  }

  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .empty {
    aspect-ratio: 1;
  }

  .day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 500;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.15s;
    background: transparent;
    color: #5a4a3a;
    font-family: 'Fredoka', sans-serif;
    padding: 0;
  }

  .day:hover:not(:disabled) {
    background: rgba(217, 165, 116, 0.2);
  }

  .day.today {
    font-weight: 700;
    box-shadow: inset 0 0 0 2px #d9a574;
  }

  .day.past {
    color: #ccc;
    cursor: not-allowed;
  }

  .day.past:hover {
    background: transparent;
  }

  /* Selection states */
  .day.in-range {
    background: rgba(217, 165, 116, 0.25);
    border-radius: 0;
  }

  .day.in-range.endpoint {
    background: #d9a574;
    color: white;
    border-radius: 50%;
    font-weight: 600;
  }

  .day.hover-range {
    background: rgba(217, 165, 116, 0.15);
    border-radius: 0;
  }

  .day.hover-range.endpoint {
    background: rgba(217, 165, 116, 0.4);
    border-radius: 50%;
  }

  .day.selected {
    background: #d9a574;
    color: white;
    font-weight: 600;
  }

  /* Footer */
  .calendar-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #d4c4b0;
  }

  .legend {
    display: flex;
    gap: 16px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #8b7355;
  }

  .swatch {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1px solid #d4c4b0;
  }

  .swatch.available {
    background: white;
  }

  .swatch.past {
    background: #e5e5e5;
  }

  .swatch.selected {
    background: #d9a574;
    border-color: #8b7355;
  }

  .actions {
    display: flex;
    gap: 12px;
  }

  .clear-btn {
    background: none;
    border: none;
    color: #8b7355;
    font-size: 14px;
    font-weight: 500;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    padding: 8px 16px;
    transition: color 0.2s;
  }

  .clear-btn:hover {
    color: #c85a54;
  }

  /* Responsive - single column on mobile */
  @media (max-width: 600px) {
    .months-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .date-display {
      min-width: auto;
      font-size: 13px;
      padding: 8px 12px;
    }

    .legend {
      flex-wrap: wrap;
      gap: 8px;
    }
  }
</style>
