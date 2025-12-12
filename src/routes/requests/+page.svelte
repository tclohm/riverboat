<script lang="ts">
  export let data;
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { Check, X } from "@lucide/svelte";

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
  $: declinedInquiries = data.inquiries.filter(inq => inq.status === 'rejected');

  $: pendingGrouped = groupByDate(pendingInquiries);
  $: approvedGrouped = groupByDate(approvedInquiries);
  $: declinedGrouped = groupByDate(declinedInquiries);

  type TabType = 'pending' | 'approved' | 'declined';
  let activeTab: TabType = 'pending';
</script>

<svelte:head>
  <title>Pass Requests - Willie's Keys</title>
</svelte:head>

<div class="container">
  <header>
    <div class="header-content">
      <h1>Pass Requests</h1>
      <p>Review and manage booking requests for your passes</p>
    </div>
  </header>
  
  <div class="tabs">
    <button 
      class="tab-button" 
      class:active={activeTab === 'pending'}
      on:click={() => activeTab = 'pending'}
    >
      <span class="badge pending">{pendingInquiries.length}</span>
      Pending
    </button>
    <button 
      class="tab-button" 
      class:active={activeTab === 'approved'}
      on:click={() => activeTab = 'approved'}
    >
      <span class="badge approved">{approvedInquiries.length}</span>
      Approved
    </button>
    <button 
      class="tab-button" 
      class:active={activeTab === 'declined'}
      on:click={() => activeTab = 'declined'}
    >
      <span class="badge declined">{declinedInquiries.length}</span>
      Declined
    </button>
  </div>

  <!-- Pending Tab -->
  {#if activeTab === 'pending'}
    <div class="tab-content">
      {#if pendingInquiries.length === 0}
        <div class="empty-state">
          <p>No pending requests</p>
          <span class="empty-hint">You'll see new booking requests here</span>
        </div>
      {:else}
        {#each Object.entries(pendingGrouped) as [dateLabel, inquiries]}
          <div class="date-group">
            <h2 class="date-label">{dateLabel}</h2>
            <div class="cards-row">
              {#each inquiries as inquiry (inquiry.id)}
                <div class="request-card pending">
                  <div class="card-header">
                    <h3>{inquiry.pass?.title || 'A Pass'}</h3>
                    <span class="status-badge pending">Pending</span>
                  </div>
                  
                  <div class="card-body">
                    <div class="info-item">
                      <span class="label">From:</span>
                      <span class="value">{inquiry.senderName || inquiry.senderUserId}</span>
                    </div>
                    {#if inquiry.requestedDates}
                      <div class="info-item">
                        <span class="label">Dates:</span>
                        <span class="value">{inquiry.requestedDates}</span>
                      </div>
                    {/if}
                    {#if inquiry.contactInfo}
                      <div class="info-item">
                        <span class="label">Contact:</span>
                        <span class="value">{inquiry.contactInfo}</span>
                      </div>
                    {/if}
                    <div class="info-item message">
                      <span class="label">Message:</span>
                      <p class="value">{inquiry.message}</p>
                    </div>
                  </div>
                  
                  <div class="card-actions">
                    <form 
                      method="POST" 
                      action="?/updateInquiryStatus"
                      use:enhance={() => {
                        return async ({ result, update }) => {
                          if (result.type === 'success') {
                            await invalidateAll();
                          }
                          await update();
                        };
                      }}
                    >
                      <input type="hidden" name="inquiryId" value={inquiry.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button type="submit" class="approve-btn">
                        <Check size={18} />
                        Approve
                      </button>
                    </form>
                    
                    <form 
                      method="POST" 
                      action="?/updateInquiryStatus"
                      use:enhance={() => {
                        return async ({ result, update }) => {
                          if (result.type === 'success') {
                            await invalidateAll();
                          }
                          await update();
                        };
                      }}
                    >
                      <input type="hidden" name="inquiryId" value={inquiry.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button type="submit" class="reject-btn">
                        <X size={18} />
                        Decline
                      </button>
                    </form>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {/if}

  <!-- Approved Tab -->
  {#if activeTab === 'approved'}
    <div class="tab-content">
      {#if approvedInquiries.length === 0}
        <div class="empty-state">
          <p>No approved requests</p>
          <span class="empty-hint">Approved requests will appear here</span>
        </div>
      {:else}
        {#each Object.entries(approvedGrouped) as [dateLabel, inquiries]}
          <div class="date-group">
            <h2 class="date-label">{dateLabel}</h2>
            <div class="cards-row">
              {#each inquiries as inquiry (inquiry.id)}
                <div class="request-card approved">
                  <div class="card-header">
                    <h3>{inquiry.pass?.title || 'A Pass'}</h3>
                    <span class="status-badge approved">Approved</span>
                  </div>
                  
                  <div class="card-body">
                    <div class="info-item">
                      <span class="label">From:</span>
                      <span class="value">{inquiry.senderName || inquiry.senderUserId}</span>
                    </div>
                    {#if inquiry.requestedDates}
                      <div class="info-item">
                        <span class="label">Dates:</span>
                        <span class="value">{inquiry.requestedDates}</span>
                      </div>
                    {/if}
                    {#if inquiry.contactInfo}
                      <div class="info-item">
                        <span class="label">Contact:</span>
                        <span class="value">{inquiry.contactInfo}</span>
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {/if}

  <!-- Declined Tab -->
  {#if activeTab === 'declined'}
    <div class="tab-content">
      {#if declinedInquiries.length === 0}
        <div class="empty-state">
          <p>No declined requests</p>
          <span class="empty-hint">Declined requests will appear here</span>
        </div>
      {:else}
        {#each Object.entries(declinedGrouped) as [dateLabel, inquiries]}
          <div class="date-group">
            <h2 class="date-label">{dateLabel}</h2>
            <div class="cards-row">
              {#each inquiries as inquiry (inquiry.id)}
                <div class="request-card declined">
                  <div class="card-header">
                    <h3>{inquiry.pass?.title || 'A Pass'}</h3>
                    <span class="status-badge declined">Declined</span>
                  </div>
                  
                  <div class="card-body">
                    <div class="info-item">
                      <span class="label">From:</span>
                      <span class="value">{inquiry.senderName || inquiry.senderUserId}</span>
                    </div>
                    {#if inquiry.requestedDates}
                      <div class="info-item">
                        <span class="label">Dates:</span>
                        <span class="value">{inquiry.requestedDates}</span>
                      </div>
                    {/if}
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
    gap: 8px;
    margin-bottom: 32px;
    background: #e8dcc8;
    border-radius: 2px;
    padding: 8px;
    border: 2px solid #d4c4b0;
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
    position: relative;
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
    width: 24px;
    height: 24px;
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

  .badge.declined {
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
    margin: 0;
  }
  
  .empty-state p {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #5a4a3a;
  }

  .empty-hint {
    display: block;
    font-size: 14px;
    color: #8b7355;
    margin: 0;
  }

  .date-group {
    margin-bottom: 48px;
  }

  .date-label {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 16px 0;
    color: #5a4a3a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 14px;
  }

  .cards-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }
  
  .request-card {
    background: white;
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    border: 2px solid #d4c4b0;
    transition: all 0.2s;
  }

  .request-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }
  
  .request-card.pending {
    border-top: 4px solid #d9a574;
  }

  .request-card.approved {
    border-top: 4px solid #8fa881;
  }

  .request-card.declined {
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
  
  .status-badge.declined {
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

  .info-item.message {
    margin-bottom: 0;
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

  .info-item.message .value {
    font-size: 13px;
    line-height: 1.5;
    max-height: 80px;
    overflow-y: auto;
  }
  
  .card-actions {
    padding: 12px 16px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 8px;
  }

  .card-actions form {
    flex: 1;
    display: contents;
  }
  
  .approve-btn,
  .reject-btn {
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
  
  .approve-btn {
    background: #8fa881;
    color: white;
  }
  
  .approve-btn:hover {
    background: #7a9a6f;
    transform: translateY(-1px);
  }
  
  .reject-btn {
    background: #e8dcc8;
    color: #8b7355;
    border: 1px solid #d4c4b0;
  }
  
  .reject-btn:hover {
    background: #c85a54;
    color: white;
    border-color: #8b7355;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .header-content h1 {
      font-size: 28px;
    }

    .tabs {
      flex-wrap: wrap;
    }

    .tab-button {
      padding: 10px 16px;
      font-size: 14px;
    }

    .cards-row {
      grid-template-columns: 1fr;
    }

    .empty-state {
      padding: 60px 24px;
    }

    .date-label {
      font-size: 13px;
    }

    .card-body {
      font-size: 12px;
    }

    .approve-btn,
    .reject-btn {
      font-size: 11px;
      padding: 8px 10px;
    }
  }
</style>
