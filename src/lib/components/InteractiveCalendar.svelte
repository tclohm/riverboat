<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';

  export let availableDates: number[] = [15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27];
  export let onDateRangeSelect: (startDate: string, endDate: string) => void = () => {};

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let selectedStart: number | null = null;
  let selectedEnd: number | null = null;
  let hoveredDay: number | null = null;

  function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(month: number, year: number): number {
    return new Date(year, month, 1).getDay();
  }

  function formatDate(day: number, month: number, year: number): string {
    const date = new Date(year, month, day);
    const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
    return `${monthStr} ${day}, ${year}`;
  }

  function formatDateRange(): string {
    if (!selectedStart || !selectedEnd) return '';
    const start = new Date(currentYear, currentMonth, selectedStart);
    const end = new Date(currentYear, currentMonth, selectedEnd);
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = end.getFullYear();

    if (start.getMonth() === end.getMonth()) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }

  function getDayClass(day: number): string {
    let classes = 'day';
    
    if (!availableDates.includes(day)) {
      classes += ' unavailable';
      return classes;
    }
    
    classes += ' available';

    // Confirmed range
    if (selectedStart !== null && selectedEnd !== null) {
      if (day >= selectedStart && day <= selectedEnd) {
        classes += ' in-range';
      }
    }

    // Hover preview (only show if start selected but end not selected)
    if (selectedStart !== null && selectedEnd === null && hoveredDay !== null) {
      const min = Math.min(selectedStart, hoveredDay);
      const max = Math.max(selectedStart, hoveredDay);
      if (day >= min && day <= max && day !== selectedStart) {
        classes += ' hover-range';
      }
    }

    // Selected dates
    if (day === selectedStart || day === selectedEnd) {
      classes += ' selected';
    }

    return classes;
  }

  function selectDate(day: number) {
    if (!availableDates.includes(day)) return;

    if (selectedStart === null) {
      selectedStart = day;
    } else if (selectedEnd === null) {
      if (day < selectedStart) {
        selectedEnd = selectedStart;
        selectedStart = day;
      } else {
        selectedEnd = day;
      }
      // Emit the range
      const startStr = formatDate(selectedStart, currentMonth, currentYear);
      const endStr = formatDate(selectedEnd, currentMonth, currentYear);
      onDateRangeSelect(startStr, endStr);
    }
  }

  function resetSelection() {
    selectedStart = null;
    selectedEnd = null;
  }

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

  // REACTIVE DECLARATIONS - These update when dependencies change
  $: daysInMonth = getDaysInMonth(currentMonth, currentYear);
  $: firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  $: monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  $: days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  $: emptyDays = Array.from({ length: firstDay }, (_, i) => i);
  $: displayRange = (selectedStart !== null && selectedEnd !== null) ? formatDateRange() : '';
  
  // KEY REACTIVE STATEMENT - Recalculate classes when any of these change:
  // hoveredDay, selectedStart, selectedEnd, availableDates
  $: classMap = {
    hoveredDay,
    selectedStart,
    selectedEnd,
    days: days.map(day => ({ day, class: getDayClass(day) }))
  };
</script>

<div class="calendar">
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

  <div class="selection-status">
    {#if selectedStart === null}
      <p class="status-text">Tap start date</p>
    {:else if selectedEnd === null}
      <p class="status-text">Tap end date</p>
    {:else}
      <p class="status-text selected">{displayRange}</p>
    {/if}
  </div>

  <div class="weekdays">
    <div class="weekday">Sun</div>
    <div class="weekday">Mon</div>
    <div class="weekday">Tue</div>
    <div class="weekday">Wed</div>
    <div class="weekday">Thu</div>
    <div class="weekday">Fri</div>
    <div class="weekday">Sat</div>
  </div>

  <div class="days-grid">
    {#each emptyDays as _}
      <div class="empty-day"></div>
    {/each}

    {#each classMap.days as { day, class: dayClass } (day)}
      <button
        type="button"
        class={dayClass}
        on:click={() => selectDate(day)}
        on:mouseenter={() => { hoveredDay = day; }}
        on:mouseleave={() => { hoveredDay = null; }}
        disabled={!availableDates.includes(day)}
      >
        {day}
      </button>
    {/each}
  </div>

  <div class="calendar-actions">
    <button 
      type="button"
      class="reset-btn"
      on:click={resetSelection}
      disabled={selectedStart === null}
    >
      Reset
    </button>
  </div>

  <div class="calendar-legend">
    <div class="legend-item">
      <div class="legend-color available"></div>
      <span>Available</span>
    </div>
    <div class="legend-item">
      <div class="legend-color unavailable"></div>
      <span>Booked</span>
    </div>
    <div class="legend-item">
      <div class="legend-color selected"></div>
      <span>Selected</span>
    </div>
  </div>
</div>

<style>
  .calendar {
    background: #faf6f0;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    padding: 16px;
    margin-top: 24px;
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
    border: 1px solid transparent;
    background: white;
    color: #5a4a3a;
    font-family: 'Fredoka', sans-serif;
    padding: 0;
  }

  .day.available:not(:disabled) {
    border-color: #d4c4b0;
  }

  .day.available:not(:disabled):hover {
    background: #e8dcc8;
    border-color: #8b7355;
    transform: scale(1.08);
  }

  .day.unavailable {
    background: #d4c4b0;
    color: #8b7355;
    border-color: #a0937f;
    cursor: not-allowed;
    opacity: 0.5;
  }

  .day.in-range {
    background: rgba(217, 165, 116, 0.2);
    border-color: #d9a574;
  }

  .day.hover-range {
    background: rgba(217, 165, 116, 0.15);
    border-color: #d9a574;
  }

  .day.selected {
    background: #d9a574;
    color: white;
    border-color: #8b7355;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

  .legend-color.unavailable {
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
