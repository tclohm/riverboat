<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';

  export let passId: number | null = null;
  export let onDateRangeSelect: (startDate: string, endDate: string) => void = () => {};

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  
  // Store selected dates as full date objects, not just day numbers
  let selectedStartDate: Date | null = null;
  let selectedEndDate: Date | null = null;
  let hoveredDate: Date | null = null;
  
  let bookedDates: {start: string, end: string}[] = [];
  let loading = true;

  // Fetch booked dates for this pass on mount
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

  // Check if a specific date falls within any booked range
  function isDateBooked(date: Date): boolean {
    const dateStr = formatDateForComparison(date);
    return bookedDates.some(range => dateStr >= range.start && dateStr <= range.end);
  }

  function formatDateForComparison(date: Date): string {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${m}-${d}`;
  }

  function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(month: number, year: number): number {
    return new Date(year, month, 1).getDay();
  }

  function formatDateRange(): string {
    if (!selectedStartDate || !selectedEndDate) return '';
    
    const startMonth = selectedStartDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = selectedEndDate.toLocaleDateString('en-US', { month: 'short' });
    const startDay = selectedStartDate.getDate();
    const endDay = selectedEndDate.getDate();
    const year = selectedEndDate.getFullYear();

    if (selectedStartDate.getMonth() === selectedEndDate.getMonth() && 
        selectedStartDate.getFullYear() === selectedEndDate.getFullYear()) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }

  function getDayClass(day: number): string {
    const date = new Date(currentYear, currentMonth, day);
    let classes = 'day';
    
    // Check if date is booked
    if (isDateBooked(date)) {
      classes += ' booked';
      return classes;
    }
    
    classes += ' available';

    // Confirmed range - check if date falls within selected range
    if (selectedStartDate !== null && selectedEndDate !== null) {
      // Ensure start is before end
      const start = selectedStartDate <= selectedEndDate ? selectedStartDate : selectedEndDate;
      const end = selectedStartDate <= selectedEndDate ? selectedEndDate : selectedStartDate;
      
      if (date >= start && date <= end) {
        classes += ' in-range';
        // Mark endpoints as selected
        if (date.getTime() === start.getTime() || date.getTime() === end.getTime()) {
          classes += ' selected';
        }
      }
    }

    // Hover preview (only show if start selected but end not selected)
    if (selectedStartDate !== null && selectedEndDate === null && hoveredDate !== null) {
      const start = selectedStartDate <= hoveredDate ? selectedStartDate : hoveredDate;
      const end = selectedStartDate <= hoveredDate ? hoveredDate : selectedStartDate;
      
      if (date >= start && date <= end) {
        classes += ' hover-range';
        // Mark endpoints as selected
        if (date.getTime() === start.getTime() || date.getTime() === end.getTime()) {
          classes += ' selected';
        }
      }
    }

    // Only mark as selected if no range is selected yet
    if (selectedStartDate && !selectedEndDate && date.getTime() === selectedStartDate.getTime()) {
      classes += ' selected';
    }

    return classes;
  }

  function selectDate(day: number) {
    const date = new Date(currentYear, currentMonth, day);
    
    if (isDateBooked(date)) return;

    if (selectedStartDate === null) {
      selectedStartDate = date;
    } else if (selectedEndDate === null) {
      // If clicked date is before start date, swap them
      if (date < selectedStartDate) {
        selectedEndDate = selectedStartDate;
        selectedStartDate = date;
      } else {
        selectedEndDate = date;
      }
      // Emit the range
      const startStr = formatDateForComparison(selectedStartDate);
      const endStr = formatDateForComparison(selectedEndDate);
      
      // Format for display
      const displayStart = formatDateForDisplay(selectedStartDate);
      const displayEnd = formatDateForDisplay(selectedEndDate);
      onDateRangeSelect(displayStart, displayEnd);
    }
  }

  function formatDateForDisplay(date: Date): string {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    
    // Check if we need to show year (different year) or just month/day
    if (selectedStartDate && selectedEndDate) {
      const sameYear = selectedStartDate.getFullYear() === selectedEndDate.getFullYear();
      const sameMonth = selectedStartDate.getMonth() === selectedEndDate.getMonth();
      
      if (sameYear && sameMonth) {
        // Same month: "Dec 15-17, 2025"
        return `${month} ${selectedStartDate.getDate()}-${selectedEndDate.getDate()}, ${year}`;
      } else if (sameYear) {
        // Different month, same year: "Dec 15 - Jan 5, 2025"
        return `${date === selectedStartDate ? month + ' ' + day : month + ' ' + day}, ${year}`;
      }
    }
    
    return `${month} ${day}, ${year}`;
  }

  function resetSelection() {
    selectedStartDate = null;
    selectedEndDate = null;
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

  $: daysInMonth = getDaysInMonth(currentMonth, currentYear);
  $: firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  $: monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  $: days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  $: emptyDays = Array.from({ length: firstDay }, (_, i) => i);
  $: displayRange = (selectedStartDate !== null && selectedEndDate !== null) ? formatDateRange() : '';
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
    {#if selectedStartDate === null}
      <p class="status-text">Tap start date</p>
    {:else if selectedEndDate === null}
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

    {#each days as day (day)}
      <button
        type="button"
        class={getDayClass(day)}
        on:click={() => selectDate(day)}
        on:mouseenter={() => { hoveredDate = new Date(currentYear, currentMonth, day); }}
        on:mouseleave={() => { hoveredDate = null; }}
        disabled={isDateBooked(new Date(currentYear, currentMonth, day))}
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
      disabled={selectedStartDate === null}
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
      <div class="legend-color booked"></div>
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

  .day.booked {
    background: #d4c4b0;
    color: #8b7355;
    border-color: #a0937f;
    cursor: not-allowed;
    opacity: 0.5;
  }

  .day.in-range {
    background: rgba(217, 165, 116, 0.25);
    border-color: #d9a574;
    color: #5a4a3a;
  }

  .day.in-range.selected {
    background: #d9a574;
    color: white;
    border-color: #8b7355;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-weight: 700;
  }

  .day.hover-range {
    background: rgba(217, 165, 116, 0.2);
    border-color: #d9a574;
    color: #5a4a3a;
  }

  .day.hover-range.selected {
    background: #d9a574;
    color: white;
    border-color: #8b7355;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-weight: 700;
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
