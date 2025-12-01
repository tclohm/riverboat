<script lang="ts">
  import { Search } from '@lucide/svelte';
  
  let guests = 1;
  let startDate = '';
  let endDate = '';
  let displayText = '';
  let error = '';

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
    
    const [startYear, startMonth, startDay] = startDate.split('-');
    const [endYear, endMonth, endDay] = endDate.split('-');
    
    const start = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
    const end = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));
    
    const startMonthStr = start.toLocaleDateString('en-US', { month: 'short' });
    const startDayNum = start.getDate();
    const endDayNum = end.getDate();
    const yearNum = end.getFullYear();
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${startMonthStr} ${startDayNum}-${endDayNum}, ${yearNum}`;
    }
    
    const endMonthStr = end.toLocaleDateString('en-US', { month: 'short' });
    return `${startMonthStr} ${startDayNum} - ${endMonthStr} ${endDayNum}, ${yearNum}`;
  }

  function validateDates() {
    error = '';
    
    if (!startDate || !endDate) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [startYear, startMonth, startDay] = startDate.split('-');
    const [endYear, endMonth, endDay] = endDate.split('-');
    
    const start = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
    const end = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));
    
    if (start < today) {
      error = 'Start date must be today or in the future';
      startDate = '';
      endDate = '';
      return;
    }
    
    if (end < today) {
      error = 'End date must be today or or in the future';
      endDate = '';
      return;
    }
    
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
    displayText = formatDateRange();
  }

  const minDate = getTodayString();

  function handleSearch() {
    if (!displayText) {
      error = 'Please select dates';
      return;
    }
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      form.submit();
    }
  }
</script>

<div class="search-container">
  <form method="POST" action="?/search">
    <div class="search-box">
      <!-- Date Inputs -->
      <div class="date-inputs">
        <div class="date-group">
          <label for="startDate">Check In</label>
          <input 
            type="date" 
            id="startDate" 
            bind:value={startDate}
            min={minDate}
            required
          />
        </div>
        
        <div class="date-divider">to</div>
        
        <div class="date-group">
          <label for="endDate">Check Out</label>
          <input 
            type="date" 
            id="endDate" 
            bind:value={endDate}
            min={startDate || minDate}
            required
          />
        </div>
      </div>

      <!-- Guests -->
      <div class="guests-group">
        <label for="guests">Guests</label>
        <div class="guest-input">
          <button 
            type="button" 
            class="guest-btn"
            on:click={() => guests > 1 && guests--}
            aria-label="Decrease guests"
          >
            −
          </button>
          <input 
            type="number" 
            id="guests"
            name="guests"
            bind:value={guests}
            min="1"
            max="99"
            readonly
          />
          <button 
            type="button" 
            class="guest-btn"
            on:click={() => guests < 99 && guests++}
            aria-label="Increase guests"
          >
            +
          </button>
        </div>
      </div>

      <!-- Hidden input for form submission -->
      <input 
        type="hidden" 
        name="requestedDates" 
        value={displayText}
      />
      
      <!-- Search Button -->
      <button type="button" class="search-button" on:click={handleSearch}>
        <Search size={20} />
        <span>Search</span>
      </button>
    </div>

    {#if error}
      <div class="error-message">{error}</div>
    {/if}
  </form>
</div>

<style>
  .search-container {
    width: 100%;
    margin: 0 0 48px 0;
  }

  form {
    width: 100%;
  }

  .search-box {
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    gap: 16px;
    align-items: flex-end;
    flex-wrap: wrap;
    min-width: 0;
  }

  .date-inputs {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 12px;
    align-items: flex-end;
    flex: 1;
    min-width: 260px;
  }

  .date-group {
    display: flex;
    flex-direction: column;
  }

  label {
    font-size: 12px;
    font-weight: 600;
    color: #666;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  input[type="date"] {
    padding: 10px 12px;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    background: white;
    color: #1a1a1a;
    transition: border-color 0.2s;
    cursor: pointer;
    letter-spacing: 0.5px;
  }

  input[type="date"]:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  input[type="date"]::placeholder {
    color: #999;
  }

  input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    border-radius: 4px;
    margin-right: 4px;
    opacity: 0.6;
    filter: invert(0.8);
  }

  input[type="date"]::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
  }

  .date-divider {
    text-align: center;
    color: #999;
    font-size: 12px;
    font-weight: 500;
    padding-bottom: 2px;
  }

  .guests-group {
    display: flex;
    flex-direction: column;
    min-width: fit-content;
    width: fit-content;
    flex-shrink: 0;
  }

  .guest-input {
    display: flex;
    align-items: center;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    background: white;
    overflow: hidden;
    width: fit-content;
  }

  .guest-btn {
    background: none;
    border: none;
    width: 32px;
    height: 38px;
    font-size: 18px;
    cursor: pointer;
    color: #666;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .guest-btn:hover {
    background: #f3f4f6;
    color: #2563eb;
  }

  input[type="number"] {
    border: none;
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
    padding: 0 4px;
    width: 30px;
    height: 38px;
    background: white;
  }

  input[type="number"]:focus {
    outline: none;
  }

  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
  }

  .search-button {
    background: #2563eb;
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    white-space: nowrap;
    height: 38px;
    flex-shrink: 0;
  }

  .search-button:hover {
    background: #1d4ed8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  .search-button:active {
    transform: translateY(0);
  }

  .error-message {
    background: #fee2e2;
    border: 1px solid #fca5a5;
    border-radius: 6px;
    padding: 12px;
    margin-top: 12px;
    font-size: 14px;
    color: #b91c1c;
    font-weight: 500;
  }

  /* Mobile layout - stacked */
   @media (max-width: 640px) {
    .search-box {
      flex-direction: column;
      gap: 12px;
      padding: 16px;
    }

    .date-inputs {
      width: 100%;
      grid-template-columns: 1fr auto 1fr;
    }

    .guests-group {
      width: 100%;
    }

    .search-button {
      width: 100%;
      justify-content: center;
    }

    label {
      font-size: 11px;
    }

    input[type="date"] {
      font-size: 13px;
      padding: 8px 10px;
    }
  }

/* Tablet/Desktop with sidebar - stacked layout
   At 920px viewport (660px content), horizontal layout causes wrapping
   Switch to stacked/column layout here for better UX
*/
  @media (min-width: 641px) and (max-width: 1249px) {
    .search-box {
      flex-direction: column;
      gap: 14px;
      padding: 16px;
    }

    .date-inputs {
      width: 100%;
      grid-template-columns: 1fr auto 1fr;
      flex: none;
    }

    .guests-group {
      width: 100%;
      align-self: flex-start;
    }

    .search-button {
      width: 100%;
      justify-content: center;
    }

    label {
      font-size: 12px;
    }

    input[type="date"] {
      font-size: 13px;
      padding: 9px 11px;
    }
  }

  /* Large with sidebar - horizontal layout with plenty of space
     1250px+ viewport means 990px+ content area, safe for horizontal
  */
  @media (min-width: 1250px) and (max-width: 1549px) {
    .search-box {
      flex-direction: row;
      padding: 18px;
      gap: 14px;
      flex-wrap: nowrap;
    }

    .date-inputs {
      flex: 1;
      min-width: 300px;
      grid-template-columns: 1fr auto 1fr;
    }

    .guests-group {
      min-width: fit-content;
    }

    .search-button {
      white-space: nowrap;
      width: auto;
    }

    input[type="date"] {
      font-size: 13px;
      padding: 9px 11px;
    }

    .search-button {
      padding: 9px 20px;
      font-size: 14px;
    }
  }

  /* Extra large - full breathing room */
  @media (min-width: 1550px) {
    .search-box {
      flex-direction: row;
      padding: 20px;
      gap: 16px;
      flex-wrap: nowrap;
    }

    .date-inputs {
      flex: 1;
      min-width: 320px;
      grid-template-columns: 1fr auto 1fr;
    }

    input[type="date"] {
      font-size: 14px;
      padding: 10px 12px;
    }

    .search-button {
      padding: 10px 24px;
      font-size: 15px;
    }
  }
</style>
