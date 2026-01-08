<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import InteractiveCalendar from '$lib/components/InteractiveCalendar.svelte';
  import { X } from '@lucide/svelte';
  
  export let data;
  const { pass, bookedDates } = data;
  
  let loading = false;
  let showDeleteConfirm = false;
  
  // For blackout date selection
  let selectedStartDate = '';
  let selectedEndDate = '';

  function handleDateRangeSelect(start: string, end: string) {
    // Parse "Jan 15, 2025" format to "2025-01-15" format
    selectedStartDate = parseDisplayDateToISO(start);
    selectedEndDate = parseDisplayDateToISO(end);
  }

  function parseDisplayDateToISO(displayDate: string): string {
    // Parse "Jan 15, 2025" or "Jan 5, 2025" format
    const match = displayDate.match(/(\w+)\s+(\d+),\s+(\d+)/);
    if (!match) return '';
    
    const monthMap: { [key: string]: string } = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const month = monthMap[match[1]] || '01';
    const day = match[2].padStart(2, '0');
    const year = match[3];
    
    return `${year}-${month}-${day}`;
  }

  function formatDateForDisplay(isoDate: string): string {
    const date = new Date(isoDate + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  function clearSelection() {
    selectedStartDate = '';
    selectedEndDate = '';
  }

  function toggleConfirm() {
    showDeleteConfirm = true;
  }

  function cancelDelete() {
    showDeleteConfirm = false;
  }
</script>

<svelte:head>
  <title>Edit {pass.title} - Willie's Keys</title>
</svelte:head>

<div class="container">
  <a href="/pass/{pass.id}" class="back">← Back to pass</a>
  
  <h1>Edit Pass</h1>

  <!-- Pass Details Form -->
  <section class="section">
    <h2>Pass Details</h2>
    <form method="POST" action="?/update" use:enhance={() => {
      loading = true;
      return async ({ result, update }) => {
        loading = false;
        await update();
      };
    }} class="edit-form">
      <div class="form-grid">
        <div class="form-group">
          <label for="title">Pass Title</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            value={pass.title}
            required
          />
        </div>

        <div class="form-group">
          <label for="passType">Pass Type</label>
          <select id="passType" name="passType" required>
            <option value="Dream Key" selected={pass.passType === 'Dream Key'}>Dream Key</option>
            <option value="Inspire Key" selected={pass.passType === 'Inspire Key'}>Inspire Key</option>
            <option value="Enchant Key" selected={pass.passType === 'Enchant Key'}>Enchant Key</option>
            <option value="Believe Key" selected={pass.passType === 'Believe Key'}>Believe Key</option>
          </select>
        </div>

        <div class="form-group">
          <label for="price">Price per day ($)</label>
          <input 
            type="number" 
            id="price" 
            name="price" 
            value={pass.price}
            min="1"
            required
          />
        </div>
      </div>

      <button type="submit" disabled={loading} class="save-button">
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  </section>

  <!-- Blackout Dates Section -->
  <section class="section">
    <h2>Manage Availability</h2>
    <p class="section-desc">Block dates when you want to use your pass or make it unavailable.</p>
    
    <!-- Current Blocked Dates -->
    {#if bookedDates.length > 0}
      <div class="blocked-dates-list">
        <h3>Currently Blocked Dates</h3>
        {#each bookedDates as range}
          <div class="blocked-date-item">
            <span class="date-range">
              {formatDateForDisplay(range.start)} - {formatDateForDisplay(range.end)}
            </span>
            <form 
              method="POST" 
              action="?/removeBlackout"
              use:enhance={() => {
                return async ({ result }) => {
                  if (result.type === 'success') {
                    await invalidateAll();
                  }
                };
              }}
            >
              <input type="hidden" name="startDate" value={range.start} />
              <input type="hidden" name="endDate" value={range.end} />
              <button type="submit" class="remove-btn" title="Remove">
                <X size={16} />
              </button>
            </form>
          </div>
        {/each}
      </div>
    {:else}
      <div class="no-blocked-dates">
        <p>No dates blocked. Your pass is available every day!</p>
      </div>
    {/if}

    <!-- Add Blackout Dates -->
    <div class="add-blackout-section">
      <h3>Block New Dates</h3>
      <p class="help-text">Select dates on the calendar to block them.</p>
      
      <InteractiveCalendar 
        {bookedDates}
        onDateRangeSelect={handleDateRangeSelect}
      />

      {#if selectedStartDate && selectedEndDate}
        <form 
          method="POST" 
          action="?/toggleBlackout"
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === 'success') {
                clearSelection();
                await invalidateAll();
              }
            };
          }}
          class="blackout-form"
        >
          <input type="hidden" name="startDate" value={selectedStartDate} />
          <input type="hidden" name="endDate" value={selectedEndDate} />
          
          <div class="selected-dates-preview">
            <span>Block: {formatDateForDisplay(selectedStartDate)} - {formatDateForDisplay(selectedEndDate)}</span>
          </div>
          
          <div class="blackout-actions">
            <button type="button" class="cancel-btn" on:click={clearSelection}>
              Cancel
            </button>
            <button type="submit" class="block-btn">
              Block These Dates
            </button>
          </div>
        </form>
      {/if}
    </div>
  </section>

  <!-- Danger Zone -->
  <section class="danger-zone">
    <h2>Delete Pass</h2>
    <p>This action cannot be undone.</p>
    
    {#if !showDeleteConfirm}
      <button type="button" class="delete-button" on:click={toggleConfirm}>
        Delete This Pass
      </button>
    {:else}
      <div class="confirm-section">
        <p class="confirm-text">Are you absolutely sure? This will permanently delete your pass.</p>
        
        <div class="confirm-buttons">
          <button type="button" class="cancel-delete" on:click={cancelDelete}>
            Cancel
          </button>
          <form method="POST" action="?/delete" use:enhance>
            <button type="submit" class="confirm-delete">
              Yes, Delete Permanently
            </button>
          </form>
        </div>
      </div>
    {/if}
  </section>
</div>

<style>
  :global(body) {
    background-color: #faf6f0;
  }

  .container {
    max-width: 700px;
    margin: 0 auto;
    padding: 0 16px;
  }

  .back {
    display: inline-block;
    color: #8b7355;
    text-decoration: none;
    font-size: 14px;
    margin-bottom: 32px;
    transition: color 0.2s;
  }

  .back:hover {
    color: #5a4a3a;
  }

  h1 {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 40px 0;
    color: #5a4a3a;
  }

  /* Sections */
  .section {
    background: white;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    padding: 24px;
    margin-bottom: 24px;
  }

  .section h2 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 700;
    color: #5a4a3a;
  }

  .section-desc {
    margin: 0 0 24px 0;
    font-size: 14px;
    color: #8b7355;
  }

  .section h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #5a4a3a;
  }

  /* Form Styles */
  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #5a4a3a;
  }

  input[type="text"],
  input[type="number"],
  select {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    font-size: 15px;
    font-family: 'Fredoka', sans-serif;
    background: #faf6f0;
    color: #5a4a3a;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  input[type="text"]:focus,
  input[type="number"]:focus,
  select:focus {
    outline: none;
    border-color: #c85a54;
    box-shadow: 0 0 0 3px rgba(200, 90, 84, 0.1);
    background: #fff;
  }

  .save-button {
    width: 100%;
    background: #d9a574;
    color: white;
    border: 2px solid #8b7355;
    padding: 14px 16px;
    border-radius: 2px;
    font-size: 16px;
    font-weight: 700;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 8px;
  }

  .save-button:hover:not(:disabled) {
    background: #c85a54;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Blocked Dates List */
  .blocked-dates-list {
    background: #faf6f0;
    border: 1px solid #d4c4b0;
    border-radius: 2px;
    padding: 16px;
    margin-bottom: 24px;
  }

  .blocked-date-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 2px;
    margin-bottom: 8px;
  }

  .blocked-date-item:last-child {
    margin-bottom: 0;
  }

  .date-range {
    font-size: 14px;
    font-weight: 600;
    color: #5a4a3a;
  }

  .remove-btn {
    background: none;
    border: none;
    color: #c85a54;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    transition: all 0.2s;
  }

  .remove-btn:hover {
    background: rgba(200, 90, 84, 0.1);
  }

  .no-blocked-dates {
    background: rgba(143, 168, 129, 0.1);
    border: 1px solid #8fa881;
    border-radius: 2px;
    padding: 16px;
    margin-bottom: 24px;
    text-align: center;
  }

  .no-blocked-dates p {
    margin: 0;
    font-size: 14px;
    color: #5a7a4a;
  }

  /* Add Blackout Section */
  .add-blackout-section {
    border-top: 2px solid #d4c4b0;
    padding-top: 24px;
  }

  .help-text {
    font-size: 13px;
    color: #8b7355;
    margin: 0 0 16px 0;
  }

  .blackout-form {
    margin-top: 16px;
  }

  .selected-dates-preview {
    background: #d9a574;
    color: white;
    padding: 12px 16px;
    border-radius: 2px;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 12px;
  }

  .blackout-actions {
    display: flex;
    gap: 12px;
  }

  .cancel-btn,
  .block-btn {
    flex: 1;
    padding: 12px 16px;
    border-radius: 2px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid #8b7355;
  }

  .cancel-btn {
    background: white;
    color: #8b7355;
  }

  .cancel-btn:hover {
    background: #e8dcc8;
  }

  .block-btn {
    background: #c85a54;
    color: white;
  }

  .block-btn:hover {
    background: #b84a45;
  }

  /* Danger Zone */
  .danger-zone {
    background: rgba(200, 90, 84, 0.08);
    border: 2px solid #c85a54;
    border-radius: 2px;
    padding: 24px;
  }

  .danger-zone h2 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 700;
    color: #c85a54;
  }

  .danger-zone p {
    margin: 0 0 16px 0;
    color: #8b7355;
    font-size: 14px;
  }

  .delete-button {
    background: white;
    color: #c85a54;
    border: 2px solid #c85a54;
    padding: 12px 24px;
    border-radius: 2px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }

  .delete-button:hover {
    background: #c85a54;
    color: white;
  }

  .confirm-section {
    margin-top: 16px;
  }

  .confirm-text {
    margin: 0 0 16px 0;
    color: #5a4a3a;
    font-weight: 600;
    font-size: 14px;
    line-height: 1.6;
  }

  .confirm-buttons {
    display: flex;
    gap: 12px;
  }

  .confirm-buttons form {
    flex: 1;
  }

  .cancel-delete,
  .confirm-delete {
    width: 100%;
    padding: 10px 20px;
    border-radius: 2px;
    font-weight: 600;
    font-size: 14px;
    font-family: 'Fredoka', sans-serif;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-delete {
    background: white;
    color: #8b7355;
    border: 2px solid #d4c4b0;
  }

  .cancel-delete:hover {
    background: #d4c4b0;
    color: #5a4a3a;
  }

  .confirm-delete {
    background: #c85a54;
    color: white;
    border: 2px solid #8b7355;
  }

  .confirm-delete:hover {
    background: #b84a45;
  }

  @media (max-width: 768px) {
    .container {
      margin: 40px 0 0 0;
      padding: 0 16px;
    }

    h1 {
      font-size: 28px;
    }

    .form-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .confirm-buttons {
      flex-direction: column;
    }

    .blackout-actions {
      flex-direction: column;
    }
  }
</style>
