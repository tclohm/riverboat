<script lang="ts">
  let startDate: string = '';
  let endDate: string = '';
  let displayText: string = '';

  $: {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      displayText = `${startStr} - ${endStr}`;
    }
  }

  function formatDateRange(): string {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = end.getFullYear();
    
    // If same month, use format "Dec 15-17, 2025"
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    }
    
    // If different months, use format "Dec 15 - Jan 5, 2025"
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
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
  
  <input 
    type="hidden" 
    name="requestedDates" 
    value={formatDateRange()}
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
