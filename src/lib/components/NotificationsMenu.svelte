<script lang="ts">
  export let notifications = [];
  export let unreadCoun = 0;

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let isOpen = false; 

  function toggleMenu() {
    isOpen = !isOpen;  
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && isOpen) {
      isOpen = false;
    }
  }

  function markAsRead(notificationId) {
    dispatch('markAsRead', { id: notificationId });
  }

  function viewAll() {
    dispatch('viewAll');
    isOpen = false;
  }
</script>

<div class="notifications-container">
  <button 
    type="button"
    class="notifications-button"
    on:click={toggleMenu}
    aria-label="Notifications"
  >
    <span class="icon">🔔</span>
    {#if unreadCount > 0}
      <span class="notification-badge">{unreadCount}</span>
    {/if}
  </button>
  
  {#if isOpen}
    <div 
      class="notifications-menu"
      on:click|stopPropagation
    >
      <div class="menu-header">
        <h3>Notifications</h3>
        {#if unreadCount > 0}
          <button 
            type="button"
            class="mark-all-read"
            on:click={() => dispatch('markAllRead')}
          >
            Mark all as read
          </button>
        {/if}
      </div>
      
      <div class="notifications-list">
        {#if notifications.length === 0}
          <div class="empty-notifications">
            <p>No notifications yet</p>
          </div>
        {:else}
          {#each notifications as notification}
            <div 
              class="notification-item {notification.read ? '' : 'unread'}"
              on:click={() => markAsRead(notification.id)}
              on:keydown={(e) => e.key === 'Enter' && markAsRead(notification.id)}
              tabindex="0"
              role="button"
            >
              <div class="notification-icon">
                {#if notification.type === 'inquiry'}
                  <span>💬</span>
                {:else if notification.type === 'booking'}
                  <span>📅</span>
                {:else}
                  <span>📣</span>
                {/if}
              </div>
              <div class="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span class="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              {#if !notification.read}
                <div class="unread-indicator"></div>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
      
      <div class="menu-footer">
        <button 
          type="button"
          class="view-all-button"
          on:click={viewAll}
        >
          View All Notifications
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .notifications-container {
    position: relative;
  }
  
  .notifications-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    position: relative;
    padding: 8px;
    color: #6b7280;
  }
  
  .notification-badge {
    position: absolute;
    top: 0;
    right: 0;
    background: #ef4444;
    color: white;
    font-size: 12px;
    font-weight: 600;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .notifications-menu {
    position: absolute;
    top: 100%;
    right: 0;
    width: 320px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    z-index: 100;
    overflow: hidden;
  }
  
  .menu-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .menu-header h3 {
    margin: 0;
    font-size: 18px;
    color: #1a1a1a;
  }
  
  .mark-all-read {
    background: none;
    border: none;
    color: #2563eb;
    font-size: 14px;
    cursor: pointer;
  }
  
  .notifications-list {
    max-height: 400px;
    overflow-y: auto;
  }
  
  .empty-notifications {
    padding: 24px 16px;
    text-align: center;
    color: #6b7280;
  }
  
  .notification-item {
    padding: 16px;
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    cursor: pointer;
    transition: background 0.2s;
    position: relative;
  }
  
  .notification-item:hover {
    background: #f3f4f6;
  }
  
  .notification-item.unread {
    background: #f0f7ff;
  }
  
  .notification-icon {
    margin-right: 12px;
    font-size: 24px;
  }
  
  .notification-content {
    flex-grow: 1;
  }
  
  .notification-content h4 {
    margin: 0 0 4px 0;
    font-size: 16px;
    color: #1a1a1a;
  }
  
  .notification-content p {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #4b5563;
  }
  
  .notification-time {
    font-size: 12px;
    color: #9ca3af;
  }
  
  .unread-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2563eb;
    position: absolute;
    top: 16px;
    right: 16px;
  }
  
  .menu-footer {
    padding: 12px 16px;
    border-top: 1px solid #e5e7eb;
    text-align: center;
  }
  
  .view-all-button {
    background: none;
    border: none;
    color: #2563eb;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 6px;
    transition: background 0.2s;
  }
  
  .view-all-button:hover {
    background: #e6f0fd;
  }
</style>
