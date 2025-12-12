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
                    {#if inquiry.contactInfo}
                      <div class="info-item">
                        <span class="label">You Provided:</span>
                        <span class="value">{inquiry.contactInfo}</span>
                      </div>
                    {/if}
                    <div class="info-item">
                      <span class="label">Your Message:</span>
                      <p class="value message-text">{inquiry.message}</p>
                    </div>
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

    .tab-button span:nth-child(1) {
      display: none;
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
  }
</style>
