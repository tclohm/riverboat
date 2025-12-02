<script>
  import './layout.css';
  import '../app.css';
  import { invalidateAll } from '$app/navigation';
  import { enhance } from '$app/forms';
  import { page } from '$app/state';
  
  import {
    Key,
    Binoculars,
    Tickets,
    CalendarDays,
    LogOut,
    Menu,
    Plus,
    UserRoundPen,
    LogIn,
    Bell,
    Inbox
  } from '@lucide/svelte';
  
  export let data;
  
  let showMobileMenu = false;
  let showNotificationsMenu = false;
  
  // Define navigation items with icons
  const mainNavItems = [
    { href: '/', label: 'Browse', icon: Binoculars }
  ];
  
  let userNavItems = [];
  let hasPassesCreated = false;
  
  $: {
    // Check if user has any passes created
    hasPassesCreated = data.userPassCount > 0;
  
    userNavItems = [
      ...hasPassesCreated
        ? [
          {
            href: '/admin',
            label: 'My Passes',
            icon: Tickets
          },
          {
            href: '/requests',
            label: 'Requests',
            icon: Inbox
          }
        ]
        : [],
      {
        href: '/bookings',
        label: 'Bookings',
        icon: CalendarDays
      }
    ];
  }
  
  const actionNavItems = [
    { href: '/add', label: 'Add Pass', icon: Plus }
  ];
  
  const settingsNavItems = [
    {
      href: '/profile',
      label: 'Profile',
      icon: UserRoundPen
    }
  ];
  
  $: isLoggedIn = !!data.user;
  
  function getNotificationLink(notification) {
    // Get tab from metadata if available
    let metadata = {};
  
    try {
      if (notification.metadata) {
        metadata = JSON.parse(notification.metadata);
      }
    } catch(e) {} // metadata is not valid JSON
  
    const tab = metadata.tab || 'approved';
  
    // Route based on notification type
    if (notification.type === 'inquiry') {
      return `/bookings?tab=${tab}`;
    }
  
    if (notification.type === 'booking') {
      return `/bookings?tab=${tab}`;
    }
  
    // Default to bookings with approved tab
    return `/bookings?tab=${tab}`;
  }
  
  async function dismissNotification(notificationId) {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/dismiss`, { method: 'POST' });
  
      if (response.ok) {
        await invalidateAll();
      }
    } catch(error) {
      console.error('Failed to dismiss notification:', error);
    }
  }
</script>

<div class="admin-layout">
  <!-- Sidebar -->
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-icon"><Key size={30} /></div>
      <div class="logo-text">
        <h1>Willie's Keys</h1>
      </div>
    </div>
    
    {#if isLoggedIn}
      <!-- LOGGED IN SIDEBAR -->
      
      <!-- Main Navigation -->
      <nav class="sidebar-nav main-nav">
        {#each mainNavItems as item}
          <a 
            href={item.href} 
            class="nav-item {page.url.pathname === item.href ? 'active' : ''}"
            title={item.label}
          >
            <svelte:component this={item.icon} size={20} />
            <span class="nav-label">{item.label}</span>
          </a>
        {/each}
      </nav>

      <!-- Divider -->
      <div class="nav-divider"></div>

      <!-- User Navigation -->
      <nav class="sidebar-nav user-nav">
        {#each userNavItems as item}
          <a 
            href={item.href} 
            class="nav-item {page.url.pathname === item.href ? 'active' : ''}"
            title={item.label}
          >
            <svelte:component this={item.icon} size={20} />
            <span class="nav-label">{item.label}</span>
            {#if item.href === '/requests' && data.pendingRequestCount > 0}
              <span class="notification-badge">{data.pendingRequestCount}</span>
            {/if}
          </a>
        {/each}
      </nav>

      <!-- Divider -->
      {#if userNavItems.length > 0}
        <div class="nav-divider"></div>
      {/if}

      <!-- Action Navigation -->
      <nav class="sidebar-nav action-nav">
        {#each actionNavItems as item}
          <a 
            href={item.href} 
            class="nav-item action-item {page.url.pathname === item.href ? 'active' : ''}"
            title={item.label}
          >
            <svelte:component this={item.icon} size={20} />
            <span class="nav-label">{item.label}</span>
          </a>
        {/each}
      </nav>

      <!-- Divider -->
      <div class="nav-divider"></div>

      <!-- Settings Navigation -->
      <nav class="sidebar-nav settings-nav">
        {#each settingsNavItems as item}
          <a 
            href={item.href} 
            class="nav-item {page.url.pathname === item.href ? 'active' : ''}"
            title={item.label}
          >
            <svelte:component this={item.icon} size={20} />
            <span class="nav-label">{item.label}</span>
          </a>
        {/each}
      </nav>

      <!-- Spacer -->
      <div class="nav-spacer"></div>

      <!-- User Section (NO BELL HERE) -->
      <div class="user-section">
        <div class="user-info">
          <div class="user-avatar">{data.user?.name?.charAt(0) || 'U'}</div>
          <div class="user-details">
            <p class="user-name">{data.user?.name || 'User'}</p>
            <p class="user-email">{data.user?.email || 'user@example.com'}</p>
          </div>
        </div>
        
        <form method="POST" 
          action="/logout" 
          class="logout-form"
          use:enhance={() => { 
            return async ({ result }) => {
              if (result.type === 'redirect') {
                await invalidateAll();
              }
            };
          }}
        >
          <button type="submit" class="logout-button" title="Logout">
            <svelte:component this={LogOut} size={20} />
            <span class="logout-label">Logout</span>
          </button>
        </form>
      </div>

    {:else}
      <!-- LOGGED OUT SIDEBAR -->
      
      <!-- Browse Section -->
      <nav class="sidebar-nav main-nav">
        {#each mainNavItems as item}
          <a 
            href={item.href} 
            class="nav-item {page.url.pathname === item.href ? 'active' : ''}"
            title={item.label}
          >
            <svelte:component this={item.icon} size={20} />
            <span class="nav-label">{item.label}</span>
          </a>
        {/each}
      </nav>

      <!-- Spacer -->
      <div class="nav-spacer"></div>

      <!-- Login Prompt Section -->
      <div class="login-prompt-section">
        <div class="login-prompt-content">
          <p class="login-prompt-text">Sign in to save passes and manage bookings</p>
        </div>
        
        <a href="/login" class="login-button">
          <svelte:component this={LogIn} size={20} />
          <span>Sign In</span>
        </a>
        
        <a href="/signup" class="signup-button">
          Create Account
        </a>
      </div>
    {/if}
  </aside>
  
  <!-- Main content area -->
  <main class="main-content">
    <div class="mobile-header">
      <button 
        type="button"
        class="mobile-menu-toggle" 
        on:click={() => showMobileMenu = !showMobileMenu}
        aria-label="Toggle navigation menu"
      >
        <Menu size={20} />
      </button>
      <h2>Willie's Keys</h2>
    </div>

    {#if isLoggedIn && !showMobileMenu}
      <!-- Notifications Bell (Desktop + Mobile) -->
      <div class="header-notifications">
        <button 
          type="button"
          class="notifications-bell"
          on:click={() => showNotificationsMenu = !showNotificationsMenu}
          aria-label="Notifications"
        >
          <Bell size={20} />
          {#if data.unreadNotificationCount > 0}
            <span class="bell-badge">{data.unreadNotificationCount}</span>
          {/if}
        </button>
        
        {#if showNotificationsMenu}
          <div 
            class="notifications-dropdown"
            on:click|stopPropagation
          >
            <div class="dropdown-header">
              <h3>Notifications</h3>
            </div>
            
            <div class="notifications-list-dropdown">
              {#if data.notifications.length === 0}
                <div class="empty-notifications">
                  <p>No new notifications</p>
                </div>
              {:else}
                {#each data.notifications as notification}
                  <a 
                    href={getNotificationLink(notification)}
                    class="notification-item"
                    on:click={() => {
                      showNotificationsMenu = false;
                    }}
                  >
                    <div class="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span class="notification-time">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <button 
                      type="button"
                      class="dismiss-btn"
                      on:click|preventDefault|stopPropagation={() => dismissNotification(notification.id)}
                      aria-label="Dismiss"
                    >
                      ×
                    </button>
                  </a>
                {/each}
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {/if}
    
    <!-- Page content -->
    <slot />
  </main>
  
  <!-- Mobile menu overlay -->
  {#if showMobileMenu}
    <button
      class="mobile-menu-overlay" 
      on:click={() => showMobileMenu = false}
      on:keydown={(e) => e.key === 'Escape' && (showMobileMenu = false)}
      aria-label="Close Menu"
    >
      <nav class="mobile-menu" on:click|stopPropagation>
        <div class="mobile-logo">
          <h2>Willie's Keys</h2>
        </div>

        {#if isLoggedIn}
          <nav class="mobile-nav">
            {#each [...mainNavItems, ...userNavItems, ...actionNavItems, ...settingsNavItems] as item}
              <a 
                href={item.href} 
                class="nav-item {page.url.pathname === item.href ? 'active' : ''}"
                on:click={() => showMobileMenu = false}
              >
                <svelte:component this={item.icon} size={20} />
                <span class="nav-label">{item.label}</span>
                {#if item.href === '/requests' && data.pendingRequestCount > 0}
                  <span class="notification-badge">{data.pendingRequestCount}</span>
                {/if}
              </a>
            {/each}
          </nav>

          <form method="POST" action="/logout" class="mobile-logout">
            <button type="submit" class="logout-button">
              <svelte:component this={LogOut} size={20} />
              <span class="logout-label">Logout</span>
            </button>
          </form>
        {:else}
          <nav class="mobile-nav">
            {#each mainNavItems as item}
              <a 
                href={item.href} 
                class="nav-item {page.url.pathname === item.href ? 'active' : ''}"
                on:click={() => showMobileMenu = false}
              >
                <svelte:component this={item.icon} size={20} />
                <span class="nav-label">{item.label}</span>
              </a>
            {/each}
          </nav>

          <div class="mobile-auth-buttons">
            <a href="/login" class="login-button">
              <LogIn size={20} />
              Sign In
            </a>
            <a href="/signup" class="signup-button">
              Create Account
            </a>
          </div>
        {/if}
      </nav>
    </button>
  {/if}
  
  <!-- Notifications Dropdown Overlay -->
  {#if showNotificationsMenu}
    <div 
      class="notifications-overlay"
      on:click={() => showNotificationsMenu = false}
      on:keydown={(e) => e.key === 'Escape' && (showNotificationsMenu = false)}
      role="button"
      tabindex="0"
      aria-label="Close notifications"
    ></div>
  {/if}
</div>

<style>
  .admin-layout {
    display: flex;
    min-height: 100vh;
    background: #f9fafb;
  }

  /* ===== SIDEBAR ===== */
  .sidebar {
    width: 260px;
    background: white;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: sticky;
    top: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  /* Logo Section */
  .sidebar-logo {
    padding: 20px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #f3f4f6;
  }

  .logo-icon {
    font-size: 28px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
  }

  .logo-text h1 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
  }

  /* Navigation */
  .sidebar-nav {
    padding: 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    color: #6b7280;
    text-decoration: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .nav-item:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  .nav-item.active {
    background: #eff6ff;
    color: #2563eb;
  }

  .notification-badge {
    background: #ef4444;
    color: white;
    font-size: 10px;
    font-weight: 700;
    width: 20px;
    height: 20px;
    padding: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    flex-shrink: 0;
  }

  .nav-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Divider */
  .nav-divider {
    height: 1px;
    background: #f3f4f6;
    margin: 4px 0;
  }

  /* Action Items */
  .action-item {
    background: #fef3c7;
    color: #92400e;
  }

  .action-item:hover {
    background: #fde68a;
    color: #78350f;
  }

  .action-item.active {
    background: #fcd34d;
    color: #451a03;
  }

  /* Spacer */
  .nav-spacer {
    flex: 1;
  }

  /* User Section */
  .user-section {
    padding: 16px 8px;
    border-top: 1px solid #f3f4f6;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 16px;
    flex-shrink: 0;
  }

  .user-details {
    min-width: 0;
  }

  .user-name {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-email {
    margin: 0;
    font-size: 12px;
    color: #9ca3af;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .logout-form {
    width: 100%;
  }

  .logout-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: #fee2e2;
    color: #991b1b;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .logout-button:hover {
    background: #fecaca;
    color: #7f1d1d;
  }

  .logout-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Login Prompt Section (Logged Out) */
  .login-prompt-section {
    padding: 16px 12px;
    border-top: 1px solid #f3f4f6;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .login-prompt-content {
    background: #fef3c7;
    border-radius: 8px;
    padding: 12px;
  }

  .login-prompt-text {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    color: #92400e;
    line-height: 1.4;
  }

  .login-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 12px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .login-button:hover {
    background: #1d4ed8;
  }

  .signup-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 12px;
    background: white;
    color: #2563eb;
    border: 1px solid #2563eb;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .signup-button:hover {
    background: #eff6ff;
  }

  /* Main Content */
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    position: relative;
    padding: 60px 32px;
  }

  /* Mobile Header */
  .mobile-header {
    display: none;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px;
    background: white;
    border-bottom: 1px solid #e5e7eb;
  }

  .mobile-header h2 {
    margin: 0;
    font-size: 16px;
    color: #1f2937;
    flex: 1;
  }

  .mobile-menu-toggle {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-menu-toggle:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  /* Header Notifications (Desktop + Mobile) */
  .header-notifications {
    position: fixed;
    top: 16px;
    right: 24px;
    z-index: 100;
    display: block;
  }

  .notifications-bell {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .notifications-bell:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  .bell-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    background: #ef4444;
    color: white;
    font-size: 10px;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .notifications-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 360px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    max-height: 500px;
    display: flex;
    flex-direction: column;
  }

  .dropdown-header {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  .dropdown-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .notifications-list-dropdown {
    overflow-y: auto;
    max-height: 450px;
  }

  .empty-notifications {
    padding: 48px 24px;
    text-align: center;
    color: #9ca3af;
    font-size: 14px;
  }

  .notification-item {
    padding: 16px;
    border-bottom: 1px solid #f3f4f6;
    display: flex;
    gap: 12px;
    align-items: start;
    transition: background 0.2s;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
  }

  .notification-item:hover {
    background: #f9fafb;
  }

  .notification-item:last-child {
    border-bottom: none;
  }

  .notification-content {
    flex: 1;
    min-width: 0;
  }

  .notification-content h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
  }

  .notification-content p {
    margin: 0 0 6px 0;
    font-size: 13px;
    color: #6b7280;
    line-height: 1.4;
  }

  .notification-time {
    font-size: 12px;
    color: #9ca3af;
  }

  .dismiss-btn {
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
    flex-shrink: 0;
    line-height: 1;
  }

  .dismiss-btn:hover {
    background: #fee2e2;
    color: #ef4444;
  }

  .notifications-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: transparent;
    z-index: 99;
  }

  .mobile-menu-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
  }

  .mobile-menu-overlay:hover {
    background: rgba(0, 0, 0, 0.5) !important;
  }

  .mobile-menu {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    max-width: 260px;
    height: 100vh;
    background: white;
    display: flex;
    flex-direction: column;
    z-index: 50;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .mobile-logo {
    padding: 25px;
    border-bottom: 1px solid #f3f4f6;
  }

  .mobile-logo h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
  }

  .mobile-nav {
    padding: 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .mobile-auth-buttons {
    padding: 16px 12px;
    border-top: 1px solid #f3f4f6;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .mobile-logout {
    padding: 16px 12px;
    border-top: 1px solid #f3f4f6;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar {
      display: none;
    }

    .main-content {
      padding: 0;
    }

    .mobile-header {
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
    }

    .mobile-menu-overlay {
      display: block;
    }

    .header-notifications {
      position: absolute;
      top: 17px;
      right: 16px;
      z-index: 100;
    }

    .notifications-dropdown {
      position: fixed;
      top: 60px;
      right: 8px;
      left: 8px;
      width: auto;
    }

  }
</style>
