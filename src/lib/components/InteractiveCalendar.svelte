<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';

  // Props
  export let availableDates: number[] = [15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27];
  export let onDateRangeSelect: (startDate: string, endDate: string) => void = () => {};

  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  let selectedStart: Date | null = null;
  let selectedEnd: Date | null = null;
  let hoveredDate: Date | null = null;
  let selectionPhase: 'start' | 'end' = 'start';

  function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(month: number, year: number): number {
    return new Date(year, month, 1).getDay();
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

  function isDateAvailable(day: number): boolean {
    return availableDates.includes(day);
  }

  function isDateInRange(day: number): boolean {
    if (!selectedStart || !selectedEnd) return false;
    const date = new Date(currentYear, currentMonth, day);
    return date >= selectedStart && date <= selectedEnd;
  }

  function isDateInHoverRange(day: number): boolean {
    if (!selectedStart || !hoveredDate || selectedEnd) return false;
    const date = new Date(currentYear, currentMonth, day);
    const start = selectedStart;
    const end = hoveredDate;
    const minDate = start < end ? start : end;
    const maxDate = start < end ? end : start;
    return date >= minDate && date <= maxDate;
  }

  function isDateSelected(day: number): boolean {
    if (!selectedStart) return false;
    const date = new Date(currentYear, currentMonth, day);
    if (selectedStart.toDateString() === date.toDateString()) return true;
    if (selectedEnd && selectedEnd.toDateString() === date.toDateString()) return true;
    return false;
  }

  function selectDate(day: number) {
    const date = new Date(currentYear, currentMonth, day);

    if (selectionPhase === 'start') {
      selectedStart = date;
      selectionPhase = 'end';
    } else {
      if (date < selectedStart!) {
        selectedEnd = selectedStart;
        selectedStart = date;
      } else {
        selectedEnd = date;
      }
      // Format and emit the date range
      const startStr = formatDateForInput(selectedStart!);
      const endStr = formatDateForInput(selectedEnd);
      onDateRangeSelect(startStr, endStr);
    }
  }

  function formatDateForInput(date: Date): string {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  function formatDateRange(): string {
    if (!selectedStart || !selectedEnd) return '';

    const startMonth = selectedStart.toLocaleDateString('en-US', { month: 'short' });
    const startDay = selectedStart.getDate();
    const endMonth = selectedEnd.toLocaleDateString('en-US', { month: 'short' });
    const endDay = selectedEnd.getDate();
    const year = selectedEnd.getFullYear();

    if (selectedStart.getMonth() === selectedEnd.getMonth() && selectedStart.getFullYear() === selectedEnd.getFullYear()) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    }

    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }

  function resetSelection() {
    selectedStart = null;
    selectedEnd = null;
    selectionPhase = 'start';
  }

  $: daysInMonth = getDaysInMonth(currentMonth, currentYear);
  $: firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  $: monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  $: days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  $: emptyDays = Array.from({ length: firstDay }, (_, i) => i);
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
    {#if selectedStart && !selectedEnd}
      <p class="status-text">Tap end date</p>
    {:else if selectedStart && selectedEnd}
      <p class="status-text selected">{formatDateRange()}</p>
    {:else}
      <p class="status-text">Tap start date</p>
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

    {#each days as day}
      <button
        type="button"
        class="day {isDateAvailable(day) ? 'available' : 'unavailable'} {isDateInRange(day) ? 'in-range' : ''} {isDateInHoverRange(day) ? 'hover-range' : ''} {isDateSelected(day) ? 'selected' : ''}"
        on:click={() => isDateAvailable(day) && selectDate(day)}
        on:mouseenter={() => { if (isDateAvailable(day)) hoveredDate = new Date(currentYear, currentMonth, day); }}
        on:mouseleave={() => { hoveredDate = null; }}
        disabled={!isDateAvailable(day)}
        aria-label="Select {monthName} {day}"
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
      disabled={!selectedStart}
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
