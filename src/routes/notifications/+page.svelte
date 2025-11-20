<script lang="ts">
  export let data;
  import { enhance } from '$app/forms';

  type TabType = 'new' | 'coming' | 'requests' | 'archived'; 
  let activeTab: TabType = 'new';

  interface Notification {
    id: number;
    title: string;
    message: string;
    read: boolean; 
    archived: boolean;
    createdAt: Date; 
    metadata?: string;
  }

  interface Inquiry {
    id: number; 
    passId: number;
    senderUserId: string; 
    receiverUserId: string; 
    message: string; 
    contactInfo?: string;
    requestedDates?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
    pass?: {
      title: string;
    };
  }

  function parseRequestedDates(dateString: string): { startDate: Date; endDate: Date } | null {
    if (!dateString) return null;
    
    // Format: "Dec 15-17, 2025" (same month)
    let match = dateString.match(/(\w+)\s+(\d+)-(\d+),?\s+(\d+)/);
    if (match) {
      const monthStr = match[1];
      const startDay = parseInt(match[2]);
      const endDay = parseInt(match[3]);
      const year = parseInt(match[4]);
      const monthMap: { [key: string]: number } = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const month = monthMap[monthStr.toLowerCase().slice(0, 3)];
      if (month === undefined) return null;
      return {
        startDate: new Date(year, month, startDay),
        endDate: new Date(year, month, endDay)
      };
    }
    
    // Format: "Nov 20 - Dec 2, 2025" (different months, same year)
    match = dateString.match(/(\w+)\s+(\d+)\s*-\s*(\w+)\s+(\d+),?\s+(\d+)/);
    if (match) {
      const monthMap: { [key: string]: number } = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const startMonth = monthMap[match[1].toLowerCase().slice(0, 3)];
      const endMonth = monthMap[match[3].toLowerCase().slice(0, 3)];
      const startDay = parseInt(match[2]);
      const endDay = parseInt(match[4]);
      const year = parseInt(match[5]);
      
      if (startMonth === undefined || endMonth === undefined) return null;
      return {
        startDate: new Date(year, startMonth, startDay),
        endDate: new Date(year, endMonth, endDay)
      };
    }
    
    return null;
  }
  
  function isDateInFuture(dateString?: string): boolean {
    if (!dateString) return false;
    const parsed = parseRequestedDates(dateString);
    if (!parsed) return false;
    return parsed.endDate > new Date();
  }
  
  function getNotificationsByTab(tab: TabType): Notification[] {
    return data.notifications.filter(notif => {
      switch (tab) {
        case 'new':
          return !notif.archived && !notif.read;
        case 'coming':
          if (notif.archived) return false;
          try {
            const metadata = JSON.parse(notif.metadata || '{}');
            return metadata.status === 'approved' && isDateInFuture(metadata.requestedDates);
          } catch {
            return false;
          }
        case 'archived':
          return notif.archived;
        default:
          return false;
      }
    });
  }
  
  function getPendingInquiries(): Inquiry[] {
    return data.inquiries.filter(inq => inq.status === 'pending');
  }

  function getMetadata(metadataString?: string): any {
    if (!metadataString) return null;
    try {
      return JSON.parse(metadataString);
    } catch {
      return null;
    }
  }
  
</script>

<svelte:head>
  <title>Notifications - Willie's Keys</title>
</svelte:head>

<div class="container">
  <h1>Notifications & Requests</h1>
  
  <div class="tabs">
    <button 
      class="tab-button" 
      class:active={activeTab === 'new'}
      on:click={() => activeTab = 'new'}
    >
      What's New
    </button>
    <button 
      class="tab-button" 
      class:active={activeTab === 'coming'}
      on:click={() => activeTab = 'coming'}
    >
      What's Coming Up
    </button>
    <button 
      class="tab-button" 
      class:active={activeTab === 'requests'}
      on:click={() => activeTab = 'requests'}
    >
      Your Pass Requests
    </button>
    <button 
      class="tab-button" 
      class:active={activeTab === 'archived'}
      on:click={() => activeTab = 'archived'}
    >
      Archived
    </button>
  </div>
  
  <!-- What's New Tab -->
  {#if activeTab === 'new'}
    <div class="tab-content">
      <h2>What's New</h2>
      {#if getNotificationsByTab('new').length === 0}
        <div class="empty-state">
          <p>No new notifications</p>
        </div>
      {:else}
        <div class="notifications-list">
          {#each getNotificationsByTab('new') as notification}
            <div class="notification-card unread">
              <div class="notification-icon">
                {#if notification.title.includes('Approved')}
                  <span>✅</span>
                {:else if notification.title.includes('Declined')}
                  <span>❌</span>
                {:else}
                  <span>📬</span>
                {/if}
              </div>
              <div class="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <span class="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              <form 
                method="POST" 
                action="?/archiveNotification"
                use:enhance
                class="archive-form"
              >
                <input type="hidden" name="notificationId" value={notification.id} />
                <button type="submit" class="archive-button" aria-label="Archive">×</button>
              </form>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
  
  <!-- What's Coming Up Tab -->
  {#if activeTab === 'coming'}
    <div class="tab-content">
      <h2>What's Coming Up</h2>
      {#if getNotificationsByTab('coming').length === 0}
        <div class="empty-state">
          <p>No upcoming trips scheduled</p>
        </div>
      {:else}
        <div class="notifications-list">
          {#each getNotificationsByTab('coming') as notification}
            <div class="notification-card coming-up">
              <div class="notification-icon">
                <span>🎫</span>
              </div>
              <div class="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                {#if getMetadata(notification.metadata)?.requestedDates}
                  <div class="trip-dates">
                    <span class="dates-label">📅 {getMetadata(notification.metadata).requestedDates}</span>
                  </div>
                {/if}                <span class="notification-time">
                  Approved on {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              <form 
                method="POST" 
                action="?/archiveNotification"
                use:enhance
                class="archive-form"
              >
                <input type="hidden" name="notificationId" value={notification.id} />
                <button type="submit" class="archive-button" aria-label="Archive">×</button>
              </form>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
  
  <!-- Your Pass Requests Tab -->
  {#if activeTab === 'requests'}
    <div class="tab-content">
      <h2>Your Pass Requests</h2>
      {#if getPendingInquiries().length === 0}
        <div class="empty-state">
          <p>No pending requests for your passes</p>
        </div>
      {:else}
        <div class="inquiries-list">
          {#each getPendingInquiries() as inquiry}
            <div class="inquiry-card">
              <div class="inquiry-header">
                <h3>Request for {inquiry.pass?.title || 'a pass'}</h3>
                <span class="status-badge pending">Pending</span>
              </div>
              
              <div class="inquiry-details">
                <div class="detail-row">
                  <strong>From:</strong>
                  <span>{inquiry.senderUserId}</span>
                </div>
                {#if inquiry.requestedDates}
                  <div class="detail-row">
                    <strong>Requested Dates:</strong>
                    <span>{inquiry.requestedDates}</span>
                  </div>
                {/if}
                {#if inquiry.contactInfo}
                  <div class="detail-row">
                    <strong>Contact Info:</strong>
                    <span>{inquiry.contactInfo}</span>
                  </div>
                {/if}
                <div class="detail-row">
                  <strong>Message:</strong>
                  <p class="inquiry-message">{inquiry.message}</p>
                </div>
                <div class="detail-row">
                  <strong>Received:</strong>
                  <span>{new Date(inquiry.createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              <div class="inquiry-actions">
                <form 
                  method="POST" 
                  action="?/updateInquiryStatus"
                  use:enhance
                >
                  <input type="hidden" name="inquiryId" value={inquiry.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button type="submit" class="approve-btn">Approve</button>
                </form>
                
                <form 
                  method="POST" 
                  action="?/updateInquiryStatus"
                  use:enhance
                >
                  <input type="hidden" name="inquiryId" value={inquiry.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <button type="submit" class="reject-btn">Decline</button>
                </form>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
  
  <!-- Archived Tab -->
  {#if activeTab === 'archived'}
    <div class="tab-content">
      <h2>Archived</h2>
      {#if getNotificationsByTab('archived').length === 0}
        <div class="empty-state">
          <p>No archived items</p>
        </div>
      {:else}
        <div class="notifications-list">
          {#each getNotificationsByTab('archived') as notification}
            <div class="notification-card archived">
              <div class="notification-icon">
                {#if notification.title.includes('Declined')}
                  <span>❌</span>
                {:else}
                  <span>📬</span>
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
  {/if}
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
    gap: 4px;
    overflow-x: auto;
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
  }
  
  .tab-button:hover {
    color: #2563eb;
  }
  
  .tab-button.active {
    background: #e6f0fd;
    color: #2563eb;
  }
  
  .tab-content {
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
    gap: 16px;
    position: relative;
  }
  
  .notification-card.unread {
    border-left: 4px solid #2563eb;
    background: #f0f7ff;
  }
  
  .notification-card.coming-up {
    border-left: 4px solid #10b981;
    background: #f0fdf4;
  }
  
  .notification-card.archived {
    opacity: 0.7;
  }
  
  .notification-icon {
    font-size: 24px;
    flex-shrink: 0;
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
    font-size: 15px;
  }
  
  .notification-time {
    font-size: 14px;
    color: #9ca3af;
  }
  
  .trip-dates {
    margin-top: 12px;
  }
  
  .dates-label {
    display: inline-block;
    background: #e6f0fd;
    color: #2563eb;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
  }
  
  .archive-form {
    flex-shrink: 0;
  }
  
  .archive-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #9ca3af;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;
  }
  
  .archive-button:hover {
    background: #f3f4f6;
    color: #6b7280;
  }
  
  .inquiry-card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border-left: 4px solid #f59e0b;
  }
  
  .inquiry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .inquiry-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
  }
  
  .status-badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;
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
    flex-shrink: 0;
  }
  
  .detail-row span,
  .detail-row p {
    flex-grow: 1;
    color: #1a1a1a;
    word-break: break-word;
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
  
  .inquiry-actions form {
    display: contents;
  }
  
  .approve-btn,
  .reject-btn {
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
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
    color: #4b5563;
  }
  
  .reject-btn:hover {
    background: #e5e7eb;
  }
  
  @media (max-width: 768px) {
    .container {
      padding: 0 16px;
      margin: 40px auto;
    }
    
    h1 {
      font-size: 24px;
    }
    
    .tabs {
      flex-wrap: wrap;
    }
    
    .tab-button {
      flex: 1;
      padding: 10px 12px;
      font-size: 14px;
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
    
    .inquiry-actions form button {
      width: 100%;
    }
  }
</style>
