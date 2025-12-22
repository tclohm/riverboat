<script lang="ts">
  export let data;
  import { Check, Clock, X, Edit2, Trash2 } from '@lucide/svelte';
  import InteractiveCalendar from '$lib/components/InteractiveCalendar.svelte';
  import { invalidateAll } from '$app/navigation';

  interface Inquiry {
    id: number;
    createdAt: Date | string;
    status: 'pending' | 'approved' | 'rejected';
    [key: string]: any;
  }

  interface GroupedInquiries {
    [key: string]: Inquiry[];
  }

  function groupByDate(inquiries: Inquiry[]): GroupedInquiries {
    const groups: GroupedInquiries = {};
    
    inquiries.forEach(inquiry => {
      const date = new Date(inquiry.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateLabel: string;

      if (date.toDateString() === today.toDateString()) {
        dateLabel = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateLabel = 'Yesterday';
      } else {
        dateLabel = date.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
      }

      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(inquiry);
    });

    return groups;
  }

  // Compute filtered inquiries based on current data
  $: pendingInquiries = data.inquiries.filter(inq => inq.status === 'pending');
  $: approvedInquiries = data.inquiries.filter(inq => inq.status === 'approved');
  $: rejectedInquiries = data.inquiries.filter(inq => inq.status === 'rejected');

  $: pendingGrouped = groupByDate(pendingInquiries);
  $: approvedGrouped = groupByDate(approvedInquiries);
  $: rejectedGrouped = groupByDate(rejectedInquiries);

  type TabType = 'pending' | 'approved' | 'rejected';
  let activeTab: TabType = (data.defaultTab as TabType) || 'approved';

  // Edit modal state
  let editingInquiry: any = null;
  let editFormData = {
    message: '',
    requestedDates: ''
  };

  let editLoading = false;
  let cancelLoading: { [key: number]: boolean } = {};
  let editError = '';
  let editSuccess = false;

  function openEditModal(inquiry: any) {
    editingInquiry = inquiry;
    editFormData = {
      message: inquiry.message || '',
      requestedDates: inquiry.requestedDates || ''
    };
    editError = '';
    editSuccess = false;
  }

  function closeEditModal() {
    editingInquiry = null;
    editError = '';
    editSuccess = false;
  }

  function handleDateRangeSelect(startDate: string, endDate: string) {
    editFormData.requestedDates = `${startDate} - ${endDate}`;
  }

  async function handleEditSubmit() {
    if (!editingInquiry) return;

    if (!editFormData.message.trim()) {
      editError = 'Message is required';
      return;
    }

    if (!editFormData.requestedDates) {
      editError = 'Please select dates from the calendar';
      return;
    }

    editLoading = true;
    editError = '';

    try {
      const response = await fetch('/api/inquiries/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryId: editingInquiry.id,
          message: editFormData.message,
          requestedDates: editFormData.requestedDates
        })
      });

      if (response.ok) {
        editSuccess = true;
        setTimeout(() => {
          closeEditModal();
          invalidateAll();
        }, 1500);
      } else {
        const error = await response.json();
        editError = error.error || 'Failed to edit booking';
      }
    } catch (error) {
      editError = 'Failed to edit booking. Please try again.';
      console.error('Edit error:', error);
    } finally {
      editLoading = false;
    }
  }

  async function handleCancel(inquiryId: number) {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    cancelLoading[inquiryId] = true;

    try {
      const response = await fetch('/api/inquiries/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId })
      });

      if (response.ok) {
        await invalidateAll();
      } else {
        alert('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel booking');
    } finally {
      cancelLoading[inquiryId] = false;
    }
  }
</script>

<svelte:head>
  <title>My Bookings - Willie's Keys</title>
</svelte:head>

<div class="container">
  <header>
    <div class="header-content">
      <h1>My Bookings</h1>
      <p>View the status of your pass requests</p>
    </div>
  </header>
  
  <div class="tabs">
    <button 
      class="tab-button" 
      class:active={activeTab === 'approved'}
      on:click={() => activeTab = 'approved'}
    >
      <Check size={18} />
      <span>Approved</span>
      <span class="badge approved">{approvedInquiries.length}</span>
    </button>
    <button 
      class="tab-button" 
      class:active={activeTab === 'pending'}
      on:click={() => activeTab = 'pending'}
    >
      <Clock size={18} />
      <span>Pending</span>
      <span class="badge pending">{pendingInquiries.length}</span>
    </button>
    <button 
      class="tab-button" 
      class:active={activeTab === 'rejected'}
      on:click={() => activeTab = 'rejected'}
    >
      <X size={18} />
      <span>Rejected</span>
      <span class="badge rejected">{rejectedInquiries.length}</span>
    </button>
  </div>

  <!-- Approved Tab -->
  {#if activeTab === 'approved'}
    <div class="tab-content">
      {#if approvedInquiries.length === 0}
        <div class="empty-state">
          <Check size={48} />
          <p>No approved bookings yet</p>
          <a href="/" class="cta-button">Browse Passes</a>
        </div>
      {:else}
        {#each Object.entries(approvedGrouped) as [dateLabel, inquiries]}
          <div class="date-group">
            <h2 class="date-label">{dateLabel}</h2>
            <div class="cards-grid">
              {#each inquiries as inquiry (inquiry.id)}
                <div class="booking-card approved">
                  <div class="card-header">
                    <h3>{inquiry.pass?.title || 'A Pass'}</h3>
                    <span class="status-badge approved">✓ Approved</span>
                  </div>
                  
                  <div class="card-body">
                    <div class="info-item">
                      <span class="label">Host:</span>
                      <span class="value">{inquiry.ownerName || 'Unknown'}</span>
                    </div>
                    {#if inquiry.requestedDates}
                      <div class="info-item">
                        <span class="label">Your Dates:</span>
                        <span class="value">{inquiry.requestedDates}</span>
                      </div>
                    {/if}
                    <div class="info-item">
                      <span class="label">Your Message:</span>
                      <p class="value message-text">{inquiry.message}</p>
                    </div>
                  </div>

                  <div class="card-actions">
                    <button 
                      type="button"
                      class="action-btn edit-btn"
                      on:click={() => openEditModal(inquiry)}
                      title="Edit booking"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button 
                      type="button"
                      class="action-btn cancel-btn"
                      on:click={() => handleCancel(inquiry.id)}
                      disabled={cancelLoading[inquiry.id]}
                      title="Cancel booking"
                    >
                      <Trash2 size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {/if}

  <!-- Pending Tab -->
  {#if activeTab === 'pending'}
    <div class="tab-content">
      {#if pendingInquiries.length === 0}
        <div class="empty-state">
          <Clock size={48} />
          <p>No pending requests</p>
          <a href="/" class="cta-button">Browse More Passes</a>
        </div>
      {:else}
        {#each Object.entries(pendingGrouped) as [dateLabel, inquiries]}
          <div class="date-group">
            <h2 class="date-label">{dateLabel}</h2>
            <div class="cards-grid">
              {#each inquiries as inquiry (inquiry.id)}
                <div class="booking-card pending">
                  <div class="card-header">
                    <h3>{inquiry.pass?.title || 'A Pass'}</h3>
                    <span class="status-badge pending">⏳ Waiting</span>
                  </div>
                  
                  <div class="card-body">
                    <div class="info-item">
                      <span class="label">Host:</span>
                      <span class="value">{inquiry.ownerName || 'Unknown'}</span>
                    </div>
                    {#if inquiry.requestedDates}
                      <div class="info-item">
                        <span class="label">Your Dates:</span>
                        <span class="value">{inquiry.requestedDates}</span>
                      </div>
                    {/if}
                    <div class="help-text">
                      The pass owner will review and contact you soon.
                    </div>
                  </div>

                  <div class="card-actions">
                    <button 
                      type="button"
                      class="action-btn edit-btn"
                      on:click={() => openEditModal(inquiry)}
                      title="Edit request"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button 
                      type="button"
                      class="action-btn cancel-btn"
                      on:click={() => handleCancel(inquiry.id)}
                      disabled={cancelLoading[inquiry.id]}
                      title="Cancel request"
                    >
                      <Trash2 size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {/if}

  <!-- Rejected Tab -->
  {#if activeTab === 'rejected'}
    <div class="tab-content">
      {#if rejectedInquiries.length === 0}
        <div class="empty-state">
          <X size={48} />
          <p>No rejected requests</p>
          <a href="/" class="cta-button">Browse More Passes</a>
        </div>
      {:else}
        {#each Object.entries(rejectedGrouped) as [dateLabel, inquiries]}
          <div class="date-group">
            <h2 class="date-label">{dateLabel}</h2>
            <div class="cards-grid">
              {#each inquiries as inquiry (inquiry.id)}
                <div class="booking-card rejected">
                  <div class="card-header">
                    <h3>{inquiry.pass?.title || 'A Pass'}</h3>
                    <span class="status-badge rejected">✕ Declined</span>
                  </div>
                  
                  <div class="card-body">
                    <div class="info-item">
                      <span class="label">Host:</span>
                      <span class="value">{inquiry.ownerName || 'Unknown'}</span>
                    </div>
                    {#if inquiry.requestedDates}
                      <div class="info-item">
                        <span class="label">Requested Dates:</span>
                        <span class="value">{inquiry.requestedDates}</span>
                      </div>
                    {/if}
                  </div>

                  <div class="card-footer">
                    <a href="/" class="browse-link">Browse other passes</a>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<!-- Edit Modal -->
{#if editingInquiry}
  <div 
    class="modal-backdrop"
    on:click={closeEditModal}
    on:keydown={(e) => e.key === 'Escape' && closeEditModal()}
    role="button"
    tabindex="0"
    aria-label="Close modal"
  >
    <div class="modal-content" on:click|stopPropagation role="main" aria-label="modal content">
      <div class="modal-header">
        <h2>Edit Booking Request</h2>
        <button
          type="button"
          class="modal-close"
          on:click={closeEditModal}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {#if editSuccess}
        <div class="success-message">
          <p>✓ Booking updated successfully!</p>
        </div>
      {:else}
        <div class="modal-body">
          {#if editError}
            <div class="error-message">
              {editError}
            </div>
          {/if}

          <!-- Interactive Calendar for Date Selection -->
          <div class="form-section">
            <label>Select Your Dates</label>
            <InteractiveCalendar 
              passId={editingInquiry.passId} 
              onDateRangeSelect={handleDateRangeSelect}
            />
          </div>

          <!-- Selected Dates Display -->
          {#if editFormData.requestedDates}
            <div class="selected-dates-display">
              <span class="label">Selected:</span>
              <span class="dates">{editFormData.requestedDates}</span>
            </div>
          {/if}

          <!-- Message to Host -->
          <div class="form-group">
            <label for="message">Message to Host</label>
            <textarea 
              id="message"
              bind:value={editFormData.message}
              placeholder="Tell the host about your plans..."
              rows="5"
              required
            ></textarea>
            <p class="char-count">{editFormData.message.length}/500 characters</p>
          </div>
        </div>

        <div class="modal-footer">
          <button 
            type="button"
            class="cancel-btn"
            on:click={closeEditModal}
          >
            Cancel
          </button>
          <button 
            type="button"
            class="save-btn"
            on:click={handleEditSubmit}
            disabled={editLoading}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
  }

  header {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 2px solid #d4c4b0;
  }

  .header-content h1 {
    margin: 0 0 8px 0;
    font-size: 32px;
    font-weight: 700;
    color: #5a4a3a;
  }

  .header-content p {
    margin: 0;
    color: #8b7355;
    font-size: 14px;
  }
  
  .tabs {
    display: flex;
    margin-bottom: 32px;
    background: #e8dcc8;
    border-radius: 2px;
    padding: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    gap: 4px;
    border: 2px solid #d4c4b0;
    flex-wrap: wrap;
  }
  
  .tab-button {
    padding: 12px 24px;
    background: none;
    border: none;
    color: #8b7355;
    font-size: 15px;
    font-weight: 600;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    border-radius: 2px;
    transition: all 0.2s;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .tab-button:hover {
    background: rgba(217, 165, 116, 0.1);
    color: #5a4a3a;
  }
  
  .tab-button.active {
    background: white;
    color: #5a4a3a;
    border: 1px solid #d4c4b0;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 6px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 700;
    color: white;
  }

  .badge.pending {
    background: #d9a574;
  }

  .badge.approved {
    background: #8fa881;
  }

  .badge.rejected {
    background: #c85a54;
  }
  
  .tab-content {
    margin-bottom: 48px;
  }
  
  .empty-state {
    background: #e8dcc8;
    border: 2px dashed #d4c4b0;
    border-radius: 2px;
    padding: 80px 32px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    color: #8b7355;
  }
  
  .empty-state p {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #5a4a3a;
  }

  .cta-button {
    display: inline-block;
    background: #d9a574;
    color: white;
    padding: 12px 24px;
    border-radius: 2px;
    text-decoration: none;
    font-weight: 700;
    font-size: 14px;
    border: 2px solid #8b7355;
    transition: all 0.2s;
  }

  .cta-button:hover {
    background: #c85a54;
  }

  .date-group {
    margin-bottom: 48px;
  }

  .date-label {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 16px 0;
    color: #5a4a3a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }
  
  .booking-card {
    background: white;
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    border: 2px solid #d4c4b0;
    transition: all 0.2s;
  }

  .booking-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }
  
  .booking-card.pending {
    border-top: 4px solid #d9a574;
  }

  .booking-card.approved {
    border-top: 4px solid #8fa881;
  }

  .booking-card.rejected {
    border-top: 4px solid #c85a54;
  }
  
  .card-header {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .card-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #5a4a3a;
    flex: 1;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 2px;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .status-badge.pending {
    background: rgba(217, 165, 116, 0.15);
    color: #8b6f38;
  }
  
  .status-badge.approved {
    background: rgba(143, 168, 129, 0.15);
    color: #5a7a4a;
  }
  
  .status-badge.rejected {
    background: rgba(200, 90, 84, 0.15);
    color: #8b4545;
  }
  
  .card-body {
    padding: 16px;
    flex: 1;
    overflow-y: auto;
    font-size: 13px;
  }

  .info-item {
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
  }

  .label {
    font-weight: 600;
    color: #8b7355;
    font-size: 12px;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    color: #5a4a3a;
    word-break: break-word;
    line-height: 1.4;
  }

  .message-text {
    font-size: 13px;
    line-height: 1.5;
    max-height: 80px;
    overflow-y: auto;
  }

  .help-text {
    font-size: 13px;
    color: #8b7355;
    font-style: italic;
    margin-top: 8px;
    padding: 12px;
    background: #faf6f0;
    border-radius: 2px;
    border-left: 2px solid #d9a574;
  }

  .card-actions {
    padding: 12px 16px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 8px;
  }

  .action-btn {
    flex: 1;
    padding: 10px 12px;
    border-radius: 2px;
    font-weight: 700;
    font-size: 12px;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .edit-btn {
    background: #d9a574;
    color: white;
  }

  .edit-btn:hover:not(:disabled) {
    background: #c85a54;
    transform: translateY(-1px);
  }

  .cancel-btn {
    background: #e8dcc8;
    color: #8b7355;
    border: 1px solid #d4c4b0;
  }

  .cancel-btn:hover:not(:disabled) {
    background: #c85a54;
    color: white;
    border-color: #8b7355;
  }

  .cancel-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .card-footer {
    padding: 12px 16px;
    border-top: 1px solid #e5e7eb;
    text-align: center;
  }

  .browse-link {
    font-size: 13px;
    color: #d9a574;
    text-decoration: none;
    font-weight: 700;
    transition: color 0.2s;
  }

  .browse-link:hover {
    color: #c85a54;
    text-decoration: underline;
  }

  /* Modal Styles */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: #e8dcc8;
    border: 2px solid #8b7355;
    border-radius: 2px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 2px solid #d4c4b0;
    flex-shrink: 0;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 24px;
    color: #5a4a3a;
  }

  .modal-close {
    background: none;
    border: none;
    color: #8b7355;
    cursor: pointer;
    padding: 0;
    font-size: 28px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    border-radius: 2px;
  }

  .modal-close:hover {
    background: rgba(139, 115, 85, 0.1);
    color: #5a4a3a;
  }

  .modal-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
    overflow-y: auto;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .form-section > label {
    font-weight: 600;
    color: #5a4a3a;
    font-size: 14px;
  }

  .error-message {
    background: rgba(200, 90, 84, 0.1);
    border: 1px solid #c85a54;
    border-radius: 2px;
    padding: 12px;
    color: #8b4545;
    font-size: 14px;
  }

  .success-message {
    padding: 40px;
    background: rgba(143, 168, 129, 0.1);
    border-radius: 2px;
    margin: 24px;
    text-align: center;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .success-message p {
    color: #5a7a4a;
    font-size: 16px;
    line-height: 1.6;
    margin: 0;
    font-weight: 600;
  }

  .selected-dates-display {
    background: white;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .selected-dates-display .label {
    margin: 0;
    font-size: 12px;
  }

  .selected-dates-display .dates {
    font-weight: 600;
    color: #d9a574;
    font-size: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-weight: 600;
    color: #5a4a3a;
    font-size: 14px;
  }

  .form-group textarea {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    font-size: 15px;
    font-family: 'Fredoka', sans-serif;
    background: #faf6f0;
    color: #5a4a3a;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .form-group textarea::placeholder {
    color: #a0937f;
  }

  .form-group textarea:focus {
    outline: none;
    border-color: #c85a54;
    box-shadow: 0 0 0 3px rgba(200, 90, 84, 0.1);
    background: white;
  }

  .form-group textarea {
    resize: vertical;
    min-height: 120px;
  }

  .char-count {
    font-size: 12px;
    color: #a0937f;
    margin: 0;
  }

  .modal-footer {
    padding: 16px 24px;
    border-top: 2px solid #d4c4b0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex-shrink: 0;
  }

  .cancel-btn,
  .save-btn {
    padding: 10px 20px;
    border-radius: 2px;
    font-weight: 600;
    cursor: pointer;
    border: 2px solid #8b7355;
    font-family: 'Fredoka', sans-serif;
    transition: all 0.2s;
    font-size: 14px;
  }

  .cancel-btn {
    background: #d4c4b0;
    color: #5a4a3a;
  }

  .cancel-btn:hover {
    background: #c85a54;
    color: white;
  }

  .save-btn {
    background: #d9a574;
    color: white;
  }

  .save-btn:hover:not(:disabled) {
    background: #c85a54;
  }

  .save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .header-content h1 {
      font-size: 28px;
    }

    .tabs {
      gap: 4px;
    }

    .tab-button {
      padding: 10px 16px;
      font-size: 13px;
      gap: 6px;
    }

    .cards-grid {
      grid-template-columns: 1fr;
    }

    .empty-state {
      padding: 60px 24px;
    }

    .date-label {
      font-size: 14px;
    }

    .card-body {
      font-size: 12px;
    }

    .modal-content {
      width: 95%;
      max-width: 95%;
    }

    .modal-body {
      padding: 16px;
      gap: 16px;
    }

    .form-group textarea {
      font-size: 14px;
    }
  }
</style>
