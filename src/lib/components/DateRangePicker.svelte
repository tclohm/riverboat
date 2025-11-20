<script lang="ts">
  let startDate: string = '';
  let endDate: string = '';
  let displayText: string = '';
  let formattedValue: string = '';
  let error: string = '';

  // Get today's date in YYYY-MM-DD format
  function getTodayString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDateRange(): string {
    if (!startDate || !endDate) return '';
    
    // Parse as local date to avoid timezone issues
    const [startYear, startMonth, startDay] = startDate.split('-');
    const [endYear, endMonth, endDay] = endDate.split('-');
    
    const start = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
    const end = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));
    
    const startMonthStr = start.toLocaleDateString('en-US', { month: 'short' });
    const startDayNum = start.getDate();
    const endDayNum = end.getDate();
    const yearNum = end.getFullYear();
    
    // If same month, use format "Dec 15-17, 2025"
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${startMonthStr} ${startDayNum}-${endDayNum}, ${yearNum}`;
    }
    
    // If different months, use format "Dec 15 - Jan 5, 2025"
    const endMonthStr = end.toLocaleDateString('en-US', { month: 'short' });
    return `${startMonthStr} ${startDayNum} - ${endMonthStr} ${endDayNum}, ${yearNum}`;
  }

  function validateDates() {
    error = '';
    
    if (!startDate || !endDate) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse as local date to avoid timezone issues
    const [startYear, startMonth, startDay] = startDate.split('-');
    const [endYear, endMonth, endDay] = endDate.split('-');
    
    const start = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
    const end = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));
    
    // Check if start date is before today
    if (start < today) {
      error = 'Start date must be today or in the future';
      startDate = '';
      endDate = '';
      return;
    }
    
    // Check if end date is before today
    if (end < today) {
      error = 'End date must be today or in the future';
      endDate = '';
      return;
    }
    
    // Check if end date is before start date
    if (end < start) {
      error = 'End date must be after start date';
      endDate = '';
      return;
    }
  }

  $: {
    if (startDate || endDate) {
      validateDates();
    }
    
    formattedValue = formatDateRange();
    
    if (startDate && endDate) {
      // Parse as local date to avoid timezone issues
      const [startYear, startMonth, startDay] = startDate.split('-');
      const [endYear, endMonth, endDay] = endDate.split('-');
      
      const start = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
      const end = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));
      
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      displayText = `${startStr} - ${endStr}`;
    } else {
      displayText = '';
    }
  }

  const minDate = getTodayString();
</script>

<div class="date-range-picker">
  <div class="date-inputs">
    <div class="date-group">
      <label for="startDate">Start Date</label>
      <input 
        type="date" 
        id="startDate" 
        bind:value={startDate}
        min={minDate}
        required
      />
    </div>
    
    <div class="divider">to</div>
    
    <div class="date-group">
      <label for="endDate">End Date</label>
      <input 
        type="date" 
        id="endDate" 
        bind:value={endDate}
        min={startDate || minDate}
        required
      />
    </div>
  </div>
  
  {#if error}
    <div class="error-message">
      <p>{error}</p>
    </div>
  {/if}
  
  {#if displayText}
    <div class="date-display">
      <p class="selected-dates">{displayText}</p>
    </div>
  {/if}
  
  <!-- Hidden input for form submission -->
  <input 
    type="hidden" 
    name="requestedDates" 
    value={formattedValue}
    required
  />
</div>

<style>
  .date-range-picker {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .date-inputs {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 12px;
    align-items: flex-end;
  }

  .date-group {
    display: flex;
    flex-direction: column;
  }

  label {
    font-size: 13px;
    font-weight: 500;
    color: #666;
    margin-bottom: 6px;
  }

  input[type="date"] {
    padding: 12px;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    background: white;
    color: #1a1a1a;
    transition: border-color 0.2s;
    cursor: pointer;
  }

  input[type="date"]:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .divider {
    text-align: center;
    color: #999;
    font-size: 12px;
    font-weight: 500;
  }

  .error-message {
    background: #fee2e2;
    border: 1px solid #fca5a5;
    border-radius: 6px;
    padding: 12px;
  }

  .error-message p {
    margin: 0;
    font-size: 14px;
    color: #b91c1c;
    font-weight: 500;
  }

  .date-display {
    background: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 12px;
    text-align: center;
  }

  .selected-dates {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #2563eb;
  }

  @media (max-width: 480px) {
    .date-inputs {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .divider {
      display: none;
    }

    label {
      font-size: 12px;
    }

    input[type="date"] {
      font-size: 13px;
    }
  }
</style>
