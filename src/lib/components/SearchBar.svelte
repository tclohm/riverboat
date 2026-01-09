<script lang="ts">
  import { Search } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  
  let guests = 1;
  let startDate = '';
  let endDate = '';
  let passType = '';
  let displayText = '';
  let error = '';
  let isOpen = false;

  const passTypes = ['Dream Key', 'Inspire Key', 'Enchant Key', 'Believe Key'];

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
      error = 'End date must be today or in the future';
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
    // Build URL with search params
    const params = new URLSearchParams();
    
    if (displayText) {
      params.set('requestedDates', displayText);
    }
    if (guests > 1) {
      params.set('guests', guests.toString());
    }
    if (passType) {
      params.set('passType', passType);
    }

    const searchUrl = params.toString() ? `/?${params.toString()}` : '/';
    goto(searchUrl);
    closePopover();
  }

  function closePopover() {
    isOpen = false;
  }

  function clearFilters() {
    startDate = '';
    endDate = '';
    guests = 1;
    passType = '';
    displayText = '';
    error = '';
  }

  // Check if any filters are active
  $: hasActiveFilters = displayText || passType || guests > 1;
</script>

<div class="search-container">
  <button 
    type="button"
    class="search-trigger"
    on:click={() => isOpen = !isOpen}
  >
    <Search size={20} />
    <span>Search & Filter</span>
  </button>

  {#if isOpen}
    <!-- Backdrop -->
    <div 
      class="popover-backdrop"
      on:click={closePopover}
      on:keydown={(e) => e.key === 'Escape' && closePopover()}
      role="button"
      tabindex="0"
      aria-label="Close popover"
    ></div>

    <!-- Popover Content -->
    <div class="popover-content">
      <div class="popover-header">
        <h3>Search & Filter</h3>
        <button 
          type="button"
          class="close-btn"
          on:click={closePopover}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div class="popover-body">
        <!-- Pass Type Filter -->
        <div class="form-section">
          <label for="passType">Pass Type</label>
          <select id="passType" bind:value={passType}>
            <option value="">All Types</option>
            {#each passTypes as type}
              <option value={type}>{type}</option>
            {/each}
          </select>
        </div>

        <!-- Date Inputs -->
        <div class="form-section">
          <label for="startDate">Check In</label>
          <input 
            type="date" 
            id="startDate" 
            bind:value={startDate}
            min={minDate}
          />
        </div>

        <div class="form-section">
          <label for="endDate">Check Out</label>
          <input 
            type="date" 
            id="endDate" 
            bind:value={endDate}
            min={startDate || minDate}
          />
        </div>

        <!-- Guests -->
        <div class="form-section">
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
      </div>

      <div class="popover-footer">
        {#if hasActiveFilters}
          <button 
            type="button"
            class="clear-btn"
            on:click={clearFilters}
          >
            Clear All
          </button>
        {/if}
        <button 
          type="button"
          class="cancel-btn"
          on:click={closePopover}
        >
          Cancel
        </button>
        <button 
          type="button"
          class="search-btn"
          on:click={handleSearch}
        >
          <Search size={18} />
          Search
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .search-container {
    position: relative;
    margin: 0 0 48px 0;
  }

  /* Search Trigger Button */
  .search-trigger {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 24px;
    background: #d9a574;
    color: white;
    border: 2px solid #8b7355;
    border-radius: 2px;
    font-size: 16px;
    font-weight: 600;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .search-trigger:hover {
    background: #c85a54;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .search-trigger:active {
    transform: translateY(0);
  }

  /* Popover Backdrop */
  .popover-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 40;
  }

  /* Popover Content */
  .popover-content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #e8dcc8;
    border: 2px solid #8b7355;
    border-radius: 2px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    z-index: 50;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }

  /* Popover Header */
  .popover-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 2px solid #d4c4b0;
  }

  .popover-header h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #5a4a3a;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 28px;
    color: #8b7355;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    border-radius: 2px;
  }

  .close-btn:hover {
    background: rgba(139, 115, 85, 0.1);
    color: #5a4a3a;
  }

  /* Popover Body */
  .popover-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-section label {
    font-size: 14px;
    font-weight: 600;
    color: #5a4a3a;
  }

  input[type="date"],
  input[type="number"],
  select {
    padding: 10px 12px;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    font-size: 14px;
    font-family: 'Fredoka', sans-serif;
    background: #faf6f0;
    color: #5a4a3a;
    transition: all 0.2s ease;
  }

  input[type="date"]:focus,
  input[type="number"]:focus,
  select:focus {
    outline: none;
    border-color: #c85a54;
    box-shadow: 0 0 0 3px rgba(200, 90, 84, 0.1);
  }

  select {
    cursor: pointer;
    background: #faf6f0 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b7355' d='M6 9L1 4h10z'/%3E%3C/svg%3E") no-repeat right 12px center;
    padding-right: 36px;
    appearance: none;
  }

  .guest-input {
    display: flex;
    align-items: center;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    background: #faf6f0;
    overflow: hidden;
    width: fit-content;
  }

  .guest-btn {
    background: none;
    border: none;
    width: 40px;
    height: 40px;
    font-size: 18px;
    cursor: pointer;
    color: #8b7355;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    font-weight: 600;
  }

  .guest-btn:hover {
    background: rgba(217, 165, 116, 0.2);
    color: #5a4a3a;
  }

  .guest-input input[type="number"] {
    border: none;
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    color: #5a4a3a;
    padding: 0 8px;
    width: 50px;
    height: 40px;
    background: transparent;
  }

  .guest-input input[type="number"]::-webkit-outer-spin-button,
  .guest-input input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .guest-input input[type="number"] {
    -moz-appearance: textfield;
  }

  .error-message {
    background: rgba(200, 90, 84, 0.1);
    border: 1px solid #c85a54;
    border-radius: 2px;
    padding: 12px;
  }

  .error-message p {
    margin: 0;
    font-size: 14px;
    color: #8b4545;
    font-weight: 500;
  }

  .date-display {
    background: #d4c4b0;
    border: 1px solid #8b7355;
    border-radius: 2px;
    padding: 12px;
    text-align: center;
  }

  .selected-dates {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #5a4a3a;
  }

  /* Popover Footer */
  .popover-footer {
    padding: 16px 24px;
    border-top: 2px solid #d4c4b0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .clear-btn,
  .cancel-btn,
  .search-btn {
    padding: 10px 20px;
    border-radius: 2px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
  }

  .clear-btn {
    background: white;
    color: #c85a54;
    border: 2px solid #c85a54;
    margin-right: auto;
  }

  .clear-btn:hover {
    background: #c85a54;
    color: white;
  }

  .cancel-btn {
    background: #d4c4b0;
    color: #5a4a3a;
    border: 2px solid #8b7355;
  }

  .cancel-btn:hover {
    background: #c85a54;
    color: white;
  }

  .search-btn {
    background: #d9a574;
    color: white;
    border: 2px solid #8b7355;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .search-btn:hover {
    background: #c85a54;
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .popover-content {
      width: 95%;
      max-height: 85vh;
    }

    .popover-header {
      padding: 16px;
    }

    .popover-body {
      padding: 16px;
      gap: 12px;
    }

    .popover-footer {
      padding: 12px 16px;
      flex-wrap: wrap;
    }

    .clear-btn {
      width: 100%;
      margin-right: 0;
      margin-bottom: 8px;
    }
  }
</style>
