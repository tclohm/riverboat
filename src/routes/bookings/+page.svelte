<script lang="ts">
  export let data;
  import { Check, Clock, X } from '@lucide/svelte';

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
  let activeTab: TabType = 'approved';
</script>

<svelte:head>
  <title>My Bookings - Willie's Keys</title>
</svelte:head>

<div class="container">
  <h1>My Bookings</h1>
  <p class="subtitle">View the status of your pass requests</p>
  
  <div class="tabs">
    <button 
      class="tab-button" 
      class:active={activeTab === 'approved'}
      on:click={() => activeTab = 'approved'}
    >
      <Check size={18} />
      Approved
      {#if approvedInquiries.length > 0}
        <span class="tab-badge">{approvedInquiries.length}</span>
      {/if}
    </button>
    <button 
      class="tab-button" 
      class:active={activeTab === 'pending'}
      on:click={() => activeTab = 'pending'}
    >
      <Clock size={18} />
      Pending
      {#if pendingInquiries.length > 0}
        <span class="tab-badge">{pendingInquiries.length}</span>
      {/if}
    </button>
    <button 
      class="tab-button" 
      class:active={activeTab === 'rejected'}
      on:click={() => activeTab = 'rejected'}
    >
      <X size={18} />
      Rejected
      {#if rejectedInquiries.length > 0}
        <span class="tab-badge">{rejectedInquiries.length}</span>
      {/if}
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
            <div class="scroll-container">
              <div class="cards-row">
                {#each inquiries as inquiry (inquiry.id)}
                  <div class="inquiry-card approved">
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
                      <div class="info-item">
                        <span class="label">Your Message:</span>
                        <p class="value">{inquiry.message}</p>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
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
        </div>
      {:else}
        {#each Object.entries(pendingGrouped) as [dateLabel, inquiries]}
          <div class="date-group">
            <h2 class="date-label">{dateLabel}</h2>
            <div class="scroll-container">
              <div class="cards-row">
                {#each inquiries as inquiry (inquiry.id)}
                  <div class="inquiry-card pending">
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
                  </div>
                {/each}
              </div>
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
        </div>
      {:else}
        {#each Object.entries(rejectedGrouped) as [dateLabel, inquiries]}
          <div class="date-group">
            <h2 class="date-label">{dateLabel}</h2>
            <div class="scroll-container">
              <div class="cards-row">
                {#each inquiries as inquiry (inquiry.id)}
                  <div class="inquiry-card rejected">
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
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 100%;
    margin: 60px 0;
    padding: 0 24px;
  }
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #1a1a1a;
    padding: 0 0 0 24px;
  }

  .subtitle {
    color: #6b7280;
    margin: 0 0 32px 0;
    padding: 0 0 0 24px;
  }
  
  .tabs {
    display: flex;
    margin-bottom: 32px;
    background: white;
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    gap: 4px;
    overflow-x: auto;
    margin-left: 24px;
    margin-right: 24px;
    width: calc(100% - 48px);
  }
  
  .tab-button {
    padding: 12px 24px;
    background: none;
    border: none;
    color: #6b7280;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .tab-button:hover {
    color: #2563eb;
  }
  
  .tab-button.active {
    background: #e6f0fd;
    color: #2563eb;
  }

  .tab-badge {
    background: #ef4444;
    color: white;
    font-size: 11px;
    font-weight: 700;
    width: 24px;
    height: 24px;
    padding: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .tab-content {
    margin-bottom: 48px;
  }
  
  .empty-state {
    background: #f9fafb;
    border: 2px dashed #e5e7eb;
    border-radius: 8px;
    padding: 80px 32px;
    text-align: center;
    color: #6b7280;
    margin: 0 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  .empty-state p {
    margin: 0;
    font-size: 18px;
  }

  .cta-button {
    display: inline-block;
    background: #2563eb;
    color: white;
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    transition: background 0.2s;
  }

  .cta-button:hover {
    background: #1d4ed8;
  }

  .date-group {
    margin-bottom: 48px;
  }

  .date-label {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 16px 0;
    color: #1a1a1a;
    padding: 0 24px;
  }

  .scroll-container {
    overflow-x: auto;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }

  .scroll-container::-webkit-scrollbar {
    height: 8px;
  }

  .scroll-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .scroll-container::-webkit-scrollbar-thumb {
    background: #d0d0d0;
    border-radius: 4px;
  }

  .scroll-container::-webkit-scrollbar-thumb:hover {
    background: #999;
  }
  
  .cards-row {
    display: flex;
    gap: 16px;
    padding: 0 24px;
    padding-bottom: 8px;
  }
  
  .inquiry-card {
    background: white;
    border-radius: 8px;
    min-width: 280px;
    width: 280px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    transition: all 0.2s;
  }

  .inquiry-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
  }
  
  .inquiry-card.pending {
    border-top: 3px solid #f59e0b;
  }

  .inquiry-card.approved {
    border-top: 3px solid #10b981;
  }

  .inquiry-card.rejected {
    border-top: 3px solid #ef4444;
  }
  
  .card-header {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  .card-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    flex: 1;
  }
  
  .status-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
    white-space: nowrap;
  }
  
  .status-badge.pending {
    background: #fef3c7;
    color: #d97706;
  }
  
  .status-badge.approved {
    background: #d1fae5;
    color: #047857;
  }
  
  .status-badge.rejected {
    background: #fee2e2;
    color: #b91c1c;
  }
  
  .card-body {
    padding: 12px 16px;
    flex: 1;
    overflow-y: auto;
    font-size: 13px;
  }

  .info-item {
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
  }

  .label {
    font-weight: 600;
    color: #6b7280;
    font-size: 12px;
    margin-bottom: 2px;
  }

  .value {
    color: #1a1a1a;
    word-break: break-word;
    line-height: 1.3;
  }

  .info-item.message .value {
    font-size: 12px;
    line-height: 1.4;
    max-height: 60px;
    overflow-y: auto;
  }

  .help-text {
    font-size: 12px;
    color: #6b7280;
    font-style: italic;
    margin-top: 8px;
    padding: 8px;
    background: #f3f4f6;
    border-radius: 4px;
  }

  .card-footer {
    padding: 12px 16px;
    border-top: 1px solid #e5e7eb;
    text-align: center;
  }

  .browse-link {
    font-size: 12px;
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
  }

  .browse-link:hover {
    text-decoration: underline;
  }
  
  @media (max-width: 768px) {
    .container {
      padding: 0;
    }

    h1 {
      padding: 0 16px;
      font-size: 28px;
    }

    .subtitle {
      padding: 0 16px;
    }
    
    .tabs {
      margin: 0 16px 32px 16px;
      width: calc(100% - 32px);
    }

    .empty-state {
      margin: 0 16px;
    }

    .date-label {
      padding: 0 16px;
    }

    .cards-row {
      padding: 0 16px;
      padding-bottom: 8px;
    }

    .inquiry-card {
      min-width: 260px;
      width: 260px;
    }
  }
</style>
