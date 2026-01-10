<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { SlidersHorizontal, ChevronDown, X } from '@lucide/svelte';
  import InteractiveCalendar from './InteractiveCalendar.svelte';

  const passTypes = [
    { value: '', label: 'All Passes' },
    { value: 'Dream Key', label: 'Dream Key' },
    { value: 'Inspire Key', label: 'Inspire Key' },
    { value: 'Enchant Key', label: 'Enchant Key' },
    { value: 'Believe Key', label: 'Believe Key' }
  ];

  const sortOptions = [
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' }
  ];

  // Get current filter values from URL
  $: currentPassType = $page.url.searchParams.get('passType') || '';
  $: currentSort = $page.url.searchParams.get('sort') || 'price-asc';
  $: currentDates = $page.url.searchParams.get('requestedDates') || '';

  let filtersExpanded = false;
  let selectedDateRange = '';

  function handlePassTypeClick(passType: string) {
    const params = new URLSearchParams($page.url.searchParams);
    
    if (passType) {
      params.set('passType', passType);
    } else {
      params.delete('passType');
    }
    
    goto(`/?${params.toString()}`, { keepFocus: true });
  }

  function handleSortChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const params = new URLSearchParams($page.url.searchParams);
    
    if (select.value && select.value !== 'price-asc') {
      params.set('sort', select.value);
    } else {
      params.delete('sort');
    }
    
    goto(`/?${params.toString()}`, { keepFocus: true });
  }

  function handleDateRangeSelect(startDate: string, endDate: string) {
    selectedDateRange = `${startDate} - ${endDate}`;
  }

  function applyDateFilter() {
    if (!selectedDateRange) return;
    
    // Parse "Jan 15, 2025 - Jan 18, 2025" to "Jan 15-18, 2025" format
    const formattedDates = formatDateRangeForUrl(selectedDateRange);
    
    const params = new URLSearchParams($page.url.searchParams);
    params.set('requestedDates', formattedDates);
    
    goto(`/?${params.toString()}`, { keepFocus: true });
    filtersExpanded = false;
  }

  function formatDateRangeForUrl(dateRange: string): string {
    // Input: "Jan 15, 2025 - Jan 18, 2025"
    // Output: "Jan 15-18, 2025" (same month) or "Jan 15 - Feb 2, 2025" (different months)
    
    const parts = dateRange.split(' - ');
    if (parts.length !== 2) return dateRange;
    
    const startMatch = parts[0].match(/(\w+)\s+(\d+),\s+(\d+)/);
    const endMatch = parts[1].match(/(\w+)\s+(\d+),\s+(\d+)/);
    
    if (!startMatch || !endMatch) return dateRange;
    
    const [, startMonth, startDay, startYear] = startMatch;
    const [, endMonth, endDay, endYear] = endMatch;
    
    // Same month and year
    if (startMonth === endMonth && startYear === endYear) {
      return `${startMonth} ${startDay}-${endDay}, ${startYear}`;
    }
    
    // Same year, different months
    if (startYear === endYear) {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`;
    }
    
    // Different years
    return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
  }

  function clearDateFilter() {
    selectedDateRange = '';
    const params = new URLSearchParams($page.url.searchParams);
    params.delete('requestedDates');
    goto(`/?${params.toString()}`, { keepFocus: true });
  }

  function clearAllFilters() {
    selectedDateRange = '';
    goto('/', { keepFocus: true });
  }

  $: hasActiveFilters = currentPassType || currentDates || currentSort !== 'price-asc';
</script>

<div class="filter-bar-container">
  <div class="filter-bar">
    <!-- Sort Dropdown -->
    <div class="sort-section">
      <select 
        value={currentSort} 
        on:change={handleSortChange}
        class="sort-select"
      >
        {#each sortOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
      <ChevronDown size={16} class="sort-icon" />
    </div>

    <!-- Pass Type Tabs -->
    <div class="pass-type-tabs">
      {#each passTypes as type}
        <button
          type="button"
          class="tab {currentPassType === type.value ? 'active' : ''}"
          on:click={() => handlePassTypeClick(type.value)}
        >
          {type.label}
        </button>
      {/each}
    </div>

    <!-- Filters Button -->
    <button
      type="button"
      class="filters-btn {filtersExpanded ? 'active' : ''} {currentDates ? 'has-filter' : ''}"
      on:click={() => filtersExpanded = !filtersExpanded}
    >
      <SlidersHorizontal size={18} />
      <span>Dates</span>
      {#if currentDates}
        <span class="filter-badge">1</span>
      {/if}
    </button>
  </div>

  <!-- Expanded Filters Panel -->
  {#if filtersExpanded}
    <div class="filters-panel">
      <div class="filters-content">
        <div class="filter-section">
          <div class="filter-header">
            <h3>Select Dates</h3>
            {#if currentDates}
              <button type="button" class="clear-dates-btn" on:click={clearDateFilter}>
                Clear dates
              </button>
            {/if}
          </div>
          
          <InteractiveCalendar 
            bookedDates={[]} 
            onDateRangeSelect={handleDateRangeSelect}
          />

          {#if selectedDateRange}
            <div class="date-actions">
              <button type="button" class="apply-btn" on:click={applyDateFilter}>
                Apply Dates
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Active Filters Display -->
  {#if hasActiveFilters}
    <div class="active-filters">
      {#if currentDates}
        <span class="filter-tag">
          📅 {currentDates}
          <button type="button" class="remove-filter" on:click={clearDateFilter}>
            <X size={14} />
          </button>
        </span>
      {/if}
      
      {#if currentPassType}
        <span class="filter-tag">
          🎟️ {currentPassType}
          <button type="button" class="remove-filter" on:click={() => handlePassTypeClick('')}>
            <X size={14} />
          </button>
        </span>
      {/if}

      <button type="button" class="clear-all-btn" on:click={clearAllFilters}>
        Clear all
      </button>
    </div>
  {/if}
</div>

<style>
  .filter-bar-container {
    margin-bottom: 32px;
  }

  .filter-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid #d4c4b0;
  }

  /* Sort Dropdown */
  .sort-section {
    position: relative;
    flex-shrink: 0;
  }

  .sort-select {
    appearance: none;
    background: white;
    border: 2px solid #d4c4b0;
    border-radius: 20px;
    padding: 8px 36px 8px 16px;
    font-size: 14px;
    font-weight: 500;
    font-family: 'Fredoka', sans-serif;
    color: #5a4a3a;
    cursor: pointer;
    transition: all 0.2s;
  }

  .sort-select:hover {
    border-color: #8b7355;
  }

  .sort-select:focus {
    outline: none;
    border-color: #d9a574;
  }

  .sort-section :global(.sort-icon) {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #8b7355;
    pointer-events: none;
  }

  /* Pass Type Tabs */
  .pass-type-tabs {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .pass-type-tabs::-webkit-scrollbar {
    display: none;
  }

  .tab {
    background: none;
    border: none;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    font-family: 'Fredoka', sans-serif;
    color: #8b7355;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
    border-radius: 20px;
  }

  .tab:hover {
    color: #5a4a3a;
    background: rgba(217, 165, 116, 0.1);
  }

  .tab.active {
    background: #5a4a3a;
    color: white;
  }

  /* Filters Button */
  .filters-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    border: 2px solid #d4c4b0;
    border-radius: 20px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    font-family: 'Fredoka', sans-serif;
    color: #5a4a3a;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .filters-btn:hover {
    border-color: #8b7355;
  }

  .filters-btn.active {
    border-color: #d9a574;
    background: rgba(217, 165, 116, 0.1);
  }

  .filters-btn.has-filter {
    border-color: #d9a574;
  }

  .filter-badge {
    background: #d9a574;
    color: white;
    font-size: 11px;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Expanded Filters Panel */
  .filters-panel {
    background: white;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    margin-top: 16px;
    overflow: hidden;
  }

  .filters-content {
    padding: 24px;
  }

  .filter-section {
    max-width: 700px;
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .filter-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #5a4a3a;
  }

  .clear-dates-btn {
    background: none;
    border: none;
    color: #c85a54;
    font-size: 14px;
    font-weight: 500;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: color 0.2s;
  }

  .clear-dates-btn:hover {
    text-decoration: underline;
  }

  .date-actions {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .apply-btn {
    background: #d9a574;
    color: white;
    border: 2px solid #8b7355;
    border-radius: 2px;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }

  .apply-btn:hover {
    background: #c85a54;
  }

  /* Active Filters Display */
  .active-filters {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
    flex-wrap: wrap;
  }

  .filter-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #e8dcc8;
    color: #5a4a3a;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
  }

  .remove-filter {
    background: none;
    border: none;
    color: #8b7355;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }

  .remove-filter:hover {
    color: #c85a54;
  }

  .clear-all-btn {
    background: none;
    border: none;
    color: #c85a54;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: color 0.2s;
  }

  .clear-all-btn:hover {
    text-decoration: underline;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .filter-bar {
      flex-wrap: wrap;
      gap: 12px;
    }

    .sort-section {
      order: 2;
    }

    .pass-type-tabs {
      order: 1;
      width: 100%;
      padding-bottom: 8px;
    }

    .filters-btn {
      order: 3;
      margin-left: auto;
    }

    .filters-content {
      padding: 16px;
    }

    .filter-section {
      max-width: 100%;
    }
  }

  @media (max-width: 480px) {
    .tab {
      padding: 6px 12px;
      font-size: 13px;
    }

    .sort-select {
      padding: 6px 32px 6px 12px;
      font-size: 13px;
    }

    .filters-btn {
      padding: 6px 12px;
      font-size: 13px;
    }
  }
</style>
