<script>
  import { page } from '$app/state';
  import { Key, Binoculars, Tickets, CalendarDays, LogOut, Menu, Plus, UserRoundPen } from '@lucide/svelte';
  export let data;

  let showMobileMenu = false;
  
  // Define navigation items with icons
  const mainNavItems = [
    { href: '/', label: 'Browse', icon: Binoculars },
    { href: '/admin', label: 'My Passes', icon: Tickets },
    { href: '/bookings', label: 'Bookings', icon: CalendarDays },
  ];

  const actionNavItems = [
    { href: '/add', label: 'Add Pass', icon: Plus },
  ];

  const settingsNavItems = [
    { href: '/profile', label: 'Profile', icon: UserRoundPen },
  ];
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

    <!-- User Section -->
    <div class="user-section">
      <div class="user-info">
        <div class="user-avatar">{data.user?.name?.charAt(0) || 'U'}</div>
        <div class="user-details">
          <p class="user-name">{data.user?.name || 'User'}</p>
          <p class="user-email">{data.user?.email || 'user@example.com'}</p>
        </div>
      </div>
      
      <form method="POST" action="/logout" class="logout-form">
        <button type="submit" class="logout-button" title="Logout">
          <svelte:component this={LogOut} size={20} />
          <span class="logout-label">Logout</span>
        </button>
      </form>
    </div>
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
    
    <!-- Page content -->
    <slot />
  </main>
  
  <!-- Mobile menu overlay -->
  {#if showMobileMenu}
    <div 
      class="mobile-menu-overlay" 
      on:click={() => showMobileMenu = false}
      on:keydown={(e) => e.key === 'Escape' && (showMobileMenu = false)}
      role="presentation"
    >
      <div class="mobile-menu" on:click|stopPropagation role="navigation">
        <div class="mobile-logo">
          <h2>Willie's Keys</h2>
        </div>

        <nav class="mobile-nav">
          {#each [...mainNavItems, ...actionNavItems, ...settingsNavItems] as item}
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

        <form method="POST" action="/logout" class="mobile-logout">
          <button type="submit" class="logout-button">
            <svelte:component this={LogOut} size={20} />
            <span class="logout-label">Logout</span>
          </button>
        </form>
      </div>
    </div>
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
    flex-grow: 0;
  }
  
  .main-nav {
    padding-top: 20px;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    color: #6b7280;
    text-decoration: none;
    transition: all 0.2s ease;
    border-radius: 8px;
    margin: 4px 0;
    font-size: 14px;
    font-weight: 500;
  }
  
  .nav-item:hover {
    background: #f3f4f6;
    color: #2563eb;
  }
  
  .nav-item.active {
    background: #eff6ff;
    color: #2563eb;
    font-weight: 600;
  }
  
  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #2563eb;
    border-radius: 0 8px 8px 0;
  }
  
  .nav-item {
    position: relative;
    padding-left: 16px;
  }
  
  .nav-icon {
    font-size: 20px;
    width: 24px;
    text-align: center;
    flex-shrink: 0;
  }
  
  .nav-label {
    white-space: nowrap;
  }
  
  /* Action item styling */
  .action-item {
    background: #fef3c7;
    color: #b45309;
  }
  
  .action-item:hover {
    background: #fcd34d;
    color: #92400e;
  }
  
  .action-item.active {
    background: #fbbf24;
    color: #78350f;
  }
  
  /* Dividers */
  .nav-divider {
    height: 1px;
    background: #f3f4f6;
    margin: 12px 0;
  }
  
  /* Spacer */
  .nav-spacer {
    flex-grow: 1;
  }
  
  /* User Section */
  .user-section {
    padding: 16px;
    border-top: 1px solid #f3f4f6;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
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
    flex-grow: 1;
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
    margin: 2px 0 0 0;
    font-size: 12px;
    color: #9ca3af;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* Logout Button */
  .logout-form {
    margin: 0;
  }
  
  .logout-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fee2e2;
    color: #991b1b;
    border: none;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .logout-button:hover {
    background: #fecaca;
    color: #7f1d1d;
  }
  
  .logout-icon {
    font-size: 18px;
  }
  
  .logout-label {
    white-space: nowrap;
  }
  
  /* Main Content */
  .main-content {
    flex-grow: 1;
    padding: 0;
    max-width: calc(100% - 260px);
    overflow-y: auto;
    background: #f9fafb;
  }
  
  /* Mobile Header */
  .mobile-header {
    display: none;
    padding: 16px 20px;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    align-items: center;
    gap: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  
  .mobile-header h2 {
    margin: 0;
    font-size: 18px;
    flex-grow: 1;
  }
  
  .mobile-menu-toggle {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    padding: 4px;
  }
  
  /* Mobile Menu */
  .mobile-menu-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
  
  .mobile-menu {
    position: absolute;
    top: 0;
    left: 0;
    width: 260px;
    height: 100%;
    background: white;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    z-index: 1001;
    display: flex;
    flex-direction: column;
  }
  
  .mobile-logo {
    padding: 20px 16px;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .mobile-logo h2 {
    margin: 0;
    font-size: 18px;
    color: #1f2937;
  }
  
  .mobile-nav {
    padding: 12px 8px;
    flex-grow: 1;
  }
  
  .mobile-logout {
    padding: 16px;
    border-top: 1px solid #f3f4f6;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .sidebar {
      display: none;
    }
    
    .mobile-header {
      display: flex;
    }
    
    .main-content {
      max-width: 100%;
    }
    
    .mobile-menu-overlay {
      display: block;
    }
  }
</style>
