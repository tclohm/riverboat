<script lang="ts">
  export let data;
  import { enhance } from '$app/forms';
</script>

<svelte:head>
  <title>Notifications - Willie's Keys</title>
</svelte:head>

<div class="container">
  <h1>Notifications & Requests</h1>
  
  <div class="tabs">
    <button class="tab-button active">All</button>
    <button class="tab-button">Unread</button>
    <button class="tab-button">Pass Requests</button>
  </div>
  
  <div class="notifications-section">
    <h2>Recent Notifications</h2>
    
    {#if data.notifications.length === 0}
      <div class="empty-state">
        <p>You don't have any notifications yet.</p>
      </div>
    {:else}
      <div class="notifications-list">
        {#each data.notifications as notification}
          <div class="notification-card">
            <div class="notification-icon">
              {#if notification.type === 'inquiry'}
                <span class="icon">💬</span>
              {:else if notification.type === 'booking'}
                <span class="icon">📅</span>
              {:else}
                <span class="icon">📣</span>
              {/if}
            </div>
            <div class="notification-content">
              <h3>{notification.title}</h3>
              <p>{notification.message}</p>
              <span class="notification-time">
                {new Date(notification.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  <div class="inquiries-section">
    <h2>Pass Requests</h2>
    
    {#if data.inquiries.length === 0}
      <div class="empty-state">
        <p>You don't have any pass requests yet.</p>
      </div>
    {:else}
      <div class="inquiries-list">
        {#each data.inquiries as item}
          <div class="inquiry-card">
            <div class="inquiry-header">
              <h3>Request for {item.pass.title}</h3>
              <span class="status-badge {item.inquiry.status}">
                {item.inquiry.status.charAt(0).toUpperCase() + item.inquiry.status.slice(1)}
              </span>
            </div>
            
            <div class="inquiry-details">
              <div class="detail-row">
                <strong>Requested Dates:</strong>
                <span>{item.inquiry.requestedDates}</span>
              </div>
              <div class="detail-row">
                <strong>Contact Info:</strong>
                <span>{item.inquiry.contactInfo}</span>
              </div>
              <div class="detail-row">
                <strong>Message:</strong>
                <p class="inquiry-message">{item.inquiry.message}</p>
              </div>
              <div class="detail-row">
                <strong>Received:</strong>
                <span>{new Date(item.inquiry.createdAt).toLocaleString()}</span>
              </div>
            </div>
            
            {#if item.inquiry.status === 'pending'}
              <div class="inquiry-actions">
                <form 
                  method="POST" 
                  action="?/updateInquiryStatus"
                  use:enhance
                >
                  <input type="hidden" name="inquiryId" value={item.inquiry.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button type="submit" class="approve-btn">Approve</button>
                </form>
                
                <form 
                  method="POST" 
                  action="?/updateInquiryStatus"
                  use:enhance
                >
                  <input type="hidden" name="inquiryId" value={item.inquiry.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <button type="submit" class="reject-btn">Decline</button>
                </form>
              </div>
            {:else}
              <div class="status-message">
                {#if item.inquiry.status === 'approved'}
                  <p class="approved-message">You approved this request on {new Date(item.inquiry.updatedAt).toLocaleString()}</p>
                {:else if item.inquiry.status === 'rejected'}
                  <p class="rejected-message">You declined this request on {new Date(item.inquiry.updatedAt).toLocaleString()}</p>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 60px auto;
    padding: 0 24px;
  }
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 32px 0;
    color: #1a1a1a;
  }
  
  .tabs {
    display: flex;
    margin-bottom: 32px;
    background: white;
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  }
  
  .tab-button:hover {
    color: #2563eb;
  }
  
  .tab-button.active {
    background: #e6f0fd;
    color: #2563eb;
  }
  
  .notifications-section,
  .inquiries-section {
    margin-bottom: 48px;
  }
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 24px 0;
    color: #1a1a1a;
  }
  
  .empty-state {
    background: #f9fafb;
    border: 2px dashed #e5e7eb;
    border-radius: 8px;
    padding: 32px;
    text-align: center;
    color: #6b7280;
  }
  
  .empty-state p {
    margin: 0;
    font-size: 16px;
  }
  
  .notifications-list,
  .inquiries-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .notification-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: flex-start;
  }
  
  .notification-icon {
    margin-right: 16px;
    font-size: 24px;
  }
  
  .notification-content {
    flex-grow: 1;
  }
  
  .notification-content h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
  }
  
  .notification-content p {
    margin: 0 0 8px 0;
    color: #4b5563;
  }
  
  .notification-time {
    font-size: 14px;
    color: #9ca3af;
  }
  
  .inquiry-card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .inquiry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .inquiry-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 600;
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
  
  .inquiry-details {
    margin-bottom: 20px;
  }
  
  .detail-row {
    display: flex;
    margin-bottom: 12px;
  }
  
  .detail-row strong {
    width: 140px;
    color: #4b5563;
  }
  
  .detail-row span,
  .detail-row p {
    flex-grow: 1;
    color: #1a1a1a;
  }
  
  .inquiry-message {
    margin: 0;
    white-space: pre-line;
  }
  
  .inquiry-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  
  .approve-btn,
  .reject-btn {
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    border: none;
  }
  
  .approve-btn {
    background: #10b981;
    color: white;
  }
  
  .reject-btn {
    background: #f3f4f6;
    color: #4b5563;
  }
  
  .approve-btn:hover {
    background: #059669;
  }
  
  .reject-btn:hover {
    background: #e5e7eb;
  }
  
  .status-message {
    padding: 12px;
    border-radius: 6px;
    font-size: 14px;
  }
  
  .approved-message {
    background: #f0fdf4;
    color: #047857;
    margin: 0;
  }
  
  .rejected-message {
    background: #fef2f2;
    color: #b91c1c;
    margin: 0;
  }
  
  @media (max-width: 768px) {
    .container {
      padding: 0 16px;
      margin: 40px auto;
    }
    
    .tabs {
      flex-wrap: wrap;
    }
    
    .tab-button {
      flex: 1;
      padding: 10px;
      text-align: center;
    }
    
    .detail-row {
      flex-direction: column;
    }
    
    .detail-row strong {
      width: 100%;
      margin-bottom: 4px;
    }
    
    .inquiry-actions {
      flex-direction: column;
    }
    
    .approve-btn,
    .reject-btn {
      width: 100%;
    }
  }
</style>
