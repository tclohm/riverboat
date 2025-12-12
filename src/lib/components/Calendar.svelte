<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';

  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  // Example available dates - we'll highlight these (you can change the logic later)
  const availableDates = [15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27];

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
      <div 
        class="day {availableDates.includes(day) ? 'available' : 'unavailable'}"
      >
        {day}
      </div>
    {/each}
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
    margin-bottom: 16px;
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
  }

  .day.available {
    background: #d9a574;
    color: white;
    border-color: #8b7355;
  }

  .day.available:hover {
    background: #c85a54;
    transform: scale(1.05);
  }

  .day.unavailable {
    background: #d4c4b0;
    color: #8b7355;
    border-color: #a0937f;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .calendar-legend {
    display: flex;
    gap: 16px;
    justify-content: center;
    padding-top: 12px;
    border-top: 1px solid #d4c4b0;
    font-size: 12px;
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
    background: #d9a574;
  }

  .legend-color.unavailable {
    background: #d4c4b0;
  }
</style>
