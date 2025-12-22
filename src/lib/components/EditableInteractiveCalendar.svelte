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
  
  // Current selected range (from props or empty)
  let selectedStartDate: Date | null = null;
  let selectedEndDate: Date | null = null;
  
  // Edit mode tracking
  let editingMode: 'start' | 'end' | null = null;
  let previewStartDate: Date | null = null;
  let previewEndDate: Date | null = null;
  let hoveredDate: Date | null = null;
  
  let bookedDates: {start: string, end: string}[] = [];
  let loading = true;
  let errorMessage = '';

  // ===== INITIALIZATION =====
  onMount(() => {
    // Parse initial dates if provided
    if (initialStartDate && initialEndDate) {
      const parts = initialStartDate.split(', ');
      const endParts = initialEndDate.split(', ');
      
      if (parts.length >= 2) {
        selectedStartDate = parseDisplayDate(initialStartDate);
      }
      if (endParts.length >= 2) {
        selectedEndDate = parseDisplayDate(initialEndDate);
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

  // ===== DATE SELECTION LOGIC =====
  function startEditMode(mode: 'start' | 'end') {
    if (editingMode === mode) {
      editingMode = null;
      previewStartDate = null;
      previewEndDate = null;
    } else {
      editingMode = mode;
      previewStartDate = selectedStartDate;
      previewEndDate = selectedEndDate;
    }
    errorMessage = '';
  }

  function selectDateInEditMode(day: number) {
    const date = new Date(currentYear, currentMonth, day);
    
    // Can't select past or booked dates
    if (isDateInPast(date) || isDateBooked(date)) return;

    if (editingMode === 'start') {
      // Validate: new start can't be after current end
      if (selectedEndDate && date > selectedEndDate) {
        errorMessage = 'Start date must be before end date';
        return;
      }
      selectedStartDate = date;
      errorMessage = '';
    } else if (editingMode === 'end') {
      // Validate: new end can't be before current start
      if (selectedStartDate && date < selectedStartDate) {
        errorMessage = 'End date must be after start date';
        return;
      }
      selectedEndDate = date;
      errorMessage = '';
    }

    editingMode = null;
    previewStartDate = null;
    previewEndDate = null;

    // Emit the update
    if (selectedStartDate && selectedEndDate) {
      const startDisplay = formatDateForDisplay(selectedStartDate);
      const endDisplay = formatDateForDisplay(selectedEndDate);
      onDateRangeSelect(startDisplay, endDisplay);
    }
  }

  function resetSelection() {
    selectedStartDate = null;
    selectedEndDate = null;
    editingMode = null;
    previewStartDate = null;
    previewEndDate = null;
    errorMessage = '';
  }

  // ===== REACTIVITY FOR PREVIEW RANGE =====
  $: if (editingMode && hoveredDate) {
    if (editingMode === 'start') {
      previewStartDate = hoveredDate;
      previewEndDate = selectedEndDate;
    } else if (editingMode === 'end') {
      previewStartDate = selectedStartDate;
      previewEndDate = hoveredDate;
    }
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

    // Check if in current selected range
    if (selectedStartDate && selectedEndDate) {
      const rangeStart = getNormalizedDate(selectedStartDate);
      const rangeEnd = getNormalizedDate(selectedEndDate);
      
      const inRange = date >= rangeStart && date <= rangeEnd;
      
      if (inRange) {
        classes.push('in-range');
        
        if (date.getTime() === rangeStart.getTime() || date.getTime() === rangeEnd.getTime()) {
          classes.push('endpoint');
        }
        
        return classes.join(' ');
      }
    }

    // Check if in preview range (when editing)
    if (editingMode && previewStartDate && previewEndDate) {
      const rangeStart = getNormalizedDate(previewStartDate);
      const rangeEnd = getNormalizedDate(previewEndDate);
      
      const inRange = date >= rangeStart && date <= rangeEnd;
      
      if (inRange) {
        classes.push('preview-range');
        
        if (date.getTime() === rangeStart.getTime() || date.getTime() === rangeEnd.getTime()) {
          classes.push('preview-endpoint');
        }
        
        return classes.join(' ');
      }
    }

    return classes.join(' ');
  }

  // ===== REACTIVE DAY CLASSES =====
  $: dayClassMap = (selectedStartDate, selectedEndDate, editingMode, previewStartDate, previewEndDate, hoveredDate, currentMonth, currentYear, days) && 
    days.map(day => ({
      day,
      class: getDayClass(day)
    }));
</script>

<div class="edit-calendar">
  {#if loading}
    <div class="loading">Loading availability...</div>
  {:else}
    <!-- Current Selection Display -->
    {#if selectedStartDate && selectedEndDate}
      <div class="current-selection">
        <div class="selection-info">
          <p class="selection-label">Current Selection</p>
          <p class="selection-dates">{formatDateForDisplay(selectedStartDate)} – {formatDateForDisplay(selectedEndDate)}</p>
        </div>
        
        <div class="edit-buttons">
          <button 
            type="button"
            class="edit-date-btn start"
            class:active={editingMode === 'start'}
            on:click={() => startEditMode('start')}
            title="Click to change start date"
          >
            Start Date
          </button>
          <button 
            type="button"
            class="edit-date-btn end"
            class:active={editingMode === 'end'}
            on:click={() => startEditMode('end')}
            title="Click to change end date"
          >
            End Date
          </button>
        </div>
      </div>
    {/if}

    <!-- Error Message -->
    {#if errorMessage}
      <div class="error-message">
        <p>{errorMessage}</p>
      </div>
    {/if}

    <!-- Edit Mode Instructions -->
    {#if editingMode}
      <div class="edit-instructions">
        <p>Click a date to {editingMode === 'start' ? 'move the start date' : 'move the end date'}</p>
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
        {@const isClickable = !isBooked && !isPast && (editingMode !== null)}
        
        <button
          type="button"
          class={dayClass}
          on:click={() => editingMode && selectDateInEditMode(day)}
          on:mouseenter={() => { 
            if (editingMode) hoveredDate = date;
          }}
          on:mouseleave={() => { 
            if (editingMode) hoveredDate = null;
          }}
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
        <div class="legend-color past"></div>
        <span>Past</span>
      </div>
      <div class="legend-item">
        <div class="legend-color booked"></div>
        <span>Booked</span>
      </div>
      <div class="legend-item">
        <div class="legend-color selected"></div>
        <span>Selected</span>
      </div>
      {#if editingMode}
        <div class="legend-item">
          <div class="legend-color preview"></div>
          <span>Preview</span>
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
    margin-top: 24px;
  }

  .loading {
    padding: 32px;
    text-align: center;
    color: #8b7355;
    font-size: 14px;
  }

  /* Current Selection Display */
  .current-selection {
    background: white;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    padding: 16px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .selection-info {
    flex: 1;
  }

  .selection-label {
    margin: 0 0 4px 0;
    font-size: 12px;
    font-weight: 600;
    color: #8b7355;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .selection-dates {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #d9a574;
  }

  .edit-buttons {
    display: flex;
    gap: 8px;
  }

  .edit-date-btn {
    padding: 8px 12px;
    background: #e8dcc8;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Fredoka', sans-serif;
    color: #8b7355;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .edit-date-btn:hover {
    background: #d4c4b0;
    border-color: #8b7355;
  }

  .edit-date-btn.active {
    background: #d9a574;
    color: white;
    border-color: #8b7355;
  }

  .edit-date-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Error Message */
  .error-message {
    background: rgba(200, 90, 84, 0.1);
    border: 1px solid #c85a54;
    border-radius: 2px;
    padding: 12px;
    margin-bottom: 16px;
    color: #8b4545;
    font-size: 13px;
  }

  .error-message p {
    margin: 0;
  }

  /* Instructions */
  .edit-instructions {
    background: rgba(217, 165, 116, 0.1);
    border-left: 4px solid #d9a574;
    border-radius: 2px;
    padding: 12px;
    margin-bottom: 16px;
    font-size: 13px;
    color: #8b7355;
  }

  .edit-instructions p {
    margin: 0;
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

  .nav-btn:disabled:hover {
    background: none;
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

  /* Current selected range */
  .day.in-range {
    background: rgba(217, 165, 116, 0.3);
    border-color: #d9a574;
    color: #5a4a3a;
  }

  .day.in-range:hover:not(:disabled) {
    background: rgba(217, 165, 116, 0.4);
    transform: scale(1.05);
  }

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

  /* Preview range (when editing) */
  .day.preview-range {
    background: rgba(143, 168, 129, 0.3);
    border-color: #8fa881;
    color: #5a4a3a;
  }

  .day.preview-range:hover:not(:disabled) {
    background: rgba(143, 168, 129, 0.4);
    transform: scale(1.05);
  }

  .day.preview-range.preview-endpoint {
    background: #8fa881;
    color: white;
    border-color: #5a7a4a;
    font-weight: 700;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .day.preview-range.preview-endpoint:hover:not(:disabled) {
    background: #7a9a6f;
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

  .legend-color.selected {
    background: #d9a574;
  }

  .legend-color.preview {
    background: #8fa881;
  }

  @media (max-width: 480px) {
    .edit-calendar {
      padding: 12px;
    }

    .current-selection {
      flex-direction: column;
      align-items: flex-start;
    }

    .edit-buttons {
      width: 100%;
    }

    .edit-date-btn {
      flex: 1;
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
  }
</style>
