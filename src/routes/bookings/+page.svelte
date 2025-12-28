<script lang="ts">
  export let data;
  import { Check, Clock, X, Trash2 } from '@lucide/svelte';
  import { invalidateAll } from '$app/navigation';

  interface Inquiry {
    id: number;
    createdAt: Date | string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    [key: string]: any;
  }

  interface GroupedInquiries {
    [key: string]: Inquiry[];
  }

  let cancellingId: number | null = null;
  let showConfirmCancel = false;
  let selectedInquiry: Inquiry | null = null;

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

  function openCancelConfirm(inquiry: Inquiry) {
    selectedInquiry = inquiry;
    showConfirmCancel = true;
  }

  function closeCancelConfirm() {
    selectedInquiry = null;
    showConfirmCancel = false;
  }

  async function handleCancel() {
    if (!selectedInquiry) return;

    cancellingId = selectedInquiry.id;

    try {
      const response = await fetch(`/api/inquiries/${selectedInquiry.id}/cancel`, {
        method: 'POST'
      });

      if (response.ok) {
        closeCancelConfirm();
        await invalidateAll();
      } else {
        const data = await response.json();
        console.error('Failed to cancel:', data.error);
        alert(data.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling:', error);
      alert('An error occurred. Please try again.');
    } finally {
      cancellingId = null;
    }
  }

  // Filter out cancelled from main views, show in separate tab
  $: pendingInquiries = data.inquiries.filter(inq => inq.status === 'pending');
  $: approvedInquiries = data.inquiries.filter(inq => inq.status === 'approved');
  $: rejectedInquiries = data.inquiries.filter(inq => inq.status === 'rejected');
  $: cancelledInquiries = data.inquiries.filter(inq => inq.status === 'cancelled');

  $: pendingGrouped = groupByDate(pendingInquiries);
  $: approvedGrouped = groupByDate(approvedInquiries);
  $: rejectedGrouped = groupByDate(rejectedInquiries);
  $: cancelledGrouped = groupByDate(cancelledInquiries);

  type TabType = 'pending' | 'approved' | 'rejected' | 'cancelled';
  let activeTab: TabType = (data.defaultTab as TabType) || 'approved';
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
      <span>Declined</span>
      <span class="badge rejected">{rejectedInquiries.length}</span>
    </button>
    {#if cancelledInquiries.length > 0}
      <button 
        class="tab-button" 
        class:active={activeTab === 'cancelled'}
        on:click={() => activeTab = 'cancelled'}
      >
        <Trash2 size={18} />
        <span>Cancelled</span>
        <span class="badge cancelled">{cancelledInquiries.length}</span>
      </button>
    {/if}
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
                    {#if inquiry.contactInfo}
                      <div class="info-item">
                        <span class="label">You Provided:</span>
                        <span class="value">{inquiry.contactInfo}</span>
                      </div>
                    {/if}
                  </div>

                  <div class="card-footer">
                    <button 
                      type="button"
                      class="cancel-btn"
                      on:click={() => openCancelConfirm(inquiry)}
                    >
                      Cancel Booking
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

                  <div class="card-footer">
                    <button 
                      type="button"
                      class="cancel-btn"
                      on:click={() => openCancelConfirm(inquiry)}
                    >
                      Cancel Request
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
          <p>No declined requests</p>
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

  <!-- Cancelled Tab -->
  {#if activeTab === 'cancelled'}
    <div class="tab-content">
      {#if cancelledInquiries.length === 0}
        <div class="empty-state">
          <Trash2 size={48} />
          <p>No cancelled bookings</p>
        </div>
      {:else}
        {#each Object.entries(cancelledGrouped) as [dateLabel, inquiries]}
          <div class="date-group">
            <h2 class="date-label">{dateLabel}</h2>
            <div class="cards-grid">
              {#each inquiries as inquiry (inquiry.id)}
                <div class="booking-card cancelled">
                  <div class="card-header">
                    <h3>{inquiry.pass?.title || 'A Pass'}</h3>
                    <span class="status-badge cancelled">Cancelled</span>
                  </div>
                  
                  <div class="card-body">
                    <div class="info-item">
                      <span class="label">Host:</span>
                      <span class="value">{inquiry.ownerName || 'Unknown'}</span>
                    </div>
                    {#if inquiry.requestedDates}
                      <div class="info-item">
                        <span class="label">Dates:</span>
                        <span class="value cancelled-dates">{inquiry.requestedDates}</span>
                      </div>
                    {/if}
                    {#if inquiry.cancelledAt}
                      <div class="info-item">
                        <span class="label">Cancelled:</span>
                        <span class="value">{new Date(inquiry.cancelledAt).toLocaleDateString()}</span>
                      </div>
                    {/if}
                  </div>

                  <div class="card-footer">
                    <a href="/pass/{inquiry.pass?.id}" class="browse-link">Request again</a>
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

<!-- Cancel Confirmation Modal -->
{#if showConfirmCancel && selectedInquiry}
  <div 
    class="modal-backdrop"
    on:click={closeCancelConfirm}
    on:keydown={(e) => e.key === 'Escape' && closeCancelConfirm()}
    tabindex="0"
    role="button"
    aria-label="Close modal"
  >
    <div 
      class="modal-content"
      on:click|stopPropagation
      role="dialog"
    >
      <div class="modal-header">
        <h2>Cancel {selectedInquiry.status === 'approved' ? 'Booking' : 'Request'}?</h2>
      </div>

      <div class="modal-body">
        <p class="confirm-text">
          {#if selectedInquiry.status === 'approved'}
            Are you sure you want to cancel your approved booking for <strong>{selectedInquiry.pass?.title}</strong>?
            The dates ({selectedInquiry.requestedDates}) will become available again.
          {:else}
            Are you sure you want to cancel your request for <strong>{selectedInquiry.pass?.title}</strong>?
          {/if}
        </p>
        <p class="subtext">The pass owner will be notified.</p>
      </div>

      <div class="modal-footer">
        <button type="button" class="keep-btn" on:click={closeCancelConfirm}>
          Keep {selectedInquiry.status === 'approved' ? 'Booking' : 'Request'}
        </button>
        <button 
          type="button" 
          class="confirm-cancel-btn"
          on:click={handleCancel}
          disabled={cancellingId === selectedInquiry.id}
        >
          {cancellingId === selectedInquiry.id ? 'Cancelling...' : 'Yes, Cancel'}
        </button>
      </div>
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

  .badge.pending { background: #d9a574; }
  .badge.approved { background: #8fa881; }
  .badge.rejected { background: #c85a54; }
  .badge.cancelled { background: #a0937f; }
  
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
  
  .booking-card.pending { border-top: 4px solid #d9a574; }
  .booking-card.approved { border-top: 4px solid #8fa881; }
  .booking-card.rejected { border-top: 4px solid #c85a54; }
  .booking-card.cancelled { border-top: 4px solid #a0937f; opacity: 0.8; }
  
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
  
  .status-badge.pending { background: rgba(217, 165, 116, 0.15); color: #8b6f38; }
  .status-badge.approved { background: rgba(143, 168, 129, 0.15); color: #5a7a4a; }
  .status-badge.rejected { background: rgba(200, 90, 84, 0.15); color: #8b4545; }
  .status-badge.cancelled { background: rgba(160, 147, 127, 0.15); color: #6b6259; }
  
  .card-body {
    padding: 16px;
    flex: 1;
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

  .value.cancelled-dates {
    text-decoration: line-through;
    color: #a0937f;
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

  .card-footer {
    padding: 12px 16px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .cancel-btn {
    background: #faf6f0;
    color: #c85a54;
    border: 2px solid #d4c4b0;
    padding: 8px 16px;
    border-radius: 2px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-btn:hover {
    background: #c85a54;
    color: white;
    border-color: #8b7355;
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
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 16px;
  }

  .modal-content {
    background: #e8dcc8;
    border: 2px solid #8b7355;
    border-radius: 2px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    padding: 20px 24px;
    border-bottom: 2px solid #d4c4b0;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #5a4a3a;
  }

  .modal-body {
    padding: 24px;
  }

  .confirm-text {
    margin: 0 0 12px 0;
    font-size: 15px;
    color: #5a4a3a;
    line-height: 1.5;
  }

  .subtext {
    margin: 0;
    font-size: 13px;
    color: #8b7355;
  }

  .modal-footer {
    display: flex;
    gap: 12px;
    padding: 16px 24px;
    border-top: 2px solid #d4c4b0;
  }

  .keep-btn,
  .confirm-cancel-btn {
    flex: 1;
    padding: 12px 20px;
    border-radius: 2px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid #8b7355;
  }

  .keep-btn {
    background: #8fa881;
    color: white;
  }

  .keep-btn:hover {
    background: #7a9a6f;
  }

  .confirm-cancel-btn {
    background: #c85a54;
    color: white;
  }

  .confirm-cancel-btn:hover:not(:disabled) {
    background: #b84a45;
  }

  .confirm-cancel-btn:disabled {
    opacity: 0.5;
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

    .tab-button span:first-child {
      display: none;
    }

    .cards-grid {
      grid-template-columns: 1fr;
    }

    .empty-state {
      padding: 60px 24px;
    }

    .modal-footer {
      flex-direction: column;
    }
  }
</style>
