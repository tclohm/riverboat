<script lang="ts">
  export let data;
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { Check, Ban } from '@lucide/svelte';

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
  <title>Requests - Willie's Keys</title>
</svelte:head>

<div class="container">
  <h1>Pass Requests</h1>
  
  <div class="tabs">
    <button 
      class="tab-button" 
      class:active={activeTab === 'pending'}
      on:click={() => activeTab = 'pending'}
    >
      Pending
      {#if pendingInquiries.length > 0}
        <span class="tab-badge">{pendingInquiries.length}</span>
      {/if}
    </button>
    <button 
      class="tab-button" 
      class:active={activeTab === 'approved'}
      on:click={() => activeTab = 'approved'}
    >
      Approved
      {#if approvedInquiries.length > 0}
        <span class="tab-badge">{approvedInquiries.length}</span>
      {/if}
    </button>
    <button 
      class="tab-button" 
      class:active={activeTab === 'declined'}
      on:click={() => activeTab = 'declined'}
    >
      Declined
      {#if declinedInquiries.length > 0}
        <span class="tab-badge">{declinedInquiries.length}</span>
      {/if}
    </button>
  </div>

  <!-- Pending Tab -->
  {#if activeTab === 'pending'}
    <div class="tab-content">
      {#if pendingInquiries.length === 0}
        <div class="empty-state">
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
                        <button type="submit" class="approve-btn">Approve</button>
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
                        <button type="submit" class="reject-btn">Decline</button>
                      </form>
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

  <!-- Approved Tab -->
  {#if activeTab === 'approved'}
    <div class="tab-content">
      {#if approvedInquiries.length === 0}
        <div class="empty-state">
          <p>No approved requests</p>
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
        </div>
      {:else}
        {#each Object.entries(declinedGrouped) as [dateLabel, inquiries]}
          <div class="date-group">
            <h2 class="date-label">{dateLabel}</h2>
            <div class="scroll-container">
              <div class="cards-row">
                {#each inquiries as inquiry (inquiry.id)}
                  <div class="inquiry-card declined">
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
    margin: 0 0 32px 0;
    color: #1a1a1a;
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
    padding: 48px 32px;
    text-align: center;
    color: #6b7280;
    margin: 0 24px;
  }
  
  .empty-state p {
    margin: 0;
    font-size: 16px;
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

  .inquiry-card.declined {
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
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
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
  
  .status-badge.declined {
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

  .info-item.message {
    margin-bottom: 0;
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
  
  .card-actions {
    padding: 12px 16px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 8px;
  }

  .card-actions form {
    flex: 1;
  }
  
  .approve-btn,
  .reject-btn {
    width: 100%;
    padding: 8px 12px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }
  
  .approve-btn {
    background: #10b981;
    color: white;
  }
  
  .approve-btn:hover {
    background: #059669;
  }
  
  .reject-btn {
    background: #f3f4f6;
    color: #6b7280;
  }
  
  .reject-btn:hover {
    background: #e5e7eb;
    color: #4b5563;
  }
  
  @media (max-width: 768px) {
    .container {
      padding: 0;
    }

    h1 {
      padding: 0 16px;
      font-size: 28px;
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
