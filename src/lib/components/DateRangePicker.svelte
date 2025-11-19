<script lang="ts">
  let startDate: string = '';
  let endDate: string = '';
  let displayText: string = '';
  let formattedValue: string = '';

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

  $: {
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
    }
  }
</script>

<div class="date-range-picker">
  <div class="date-inputs">
    <div class="date-group">
      <label for="startDate">Start Date</label>
      <input 
        type="date" 
        id="startDate" 
        bind:value={startDate}
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
        min={startDate}
        required
      />
    </div>
  </div>
  
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
