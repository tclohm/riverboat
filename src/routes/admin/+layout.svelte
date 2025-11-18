<script>
  import { page } from '$app/stores';
  export let data;
  
  // Define navigation items
  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/passes', label: 'My Passes', icon: '🎫' },
    { href: '/admin/bookings', label: 'Bookings', icon: '📅' },
    { href: '/add', label: 'Add Pass', icon: '➕' },
    { href: '/admin/profile', label: 'Profile', icon: '👤' },
  ];
</script>

<div class="admin-layout">
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>Willie's Keys</h2>
      <p>{data.user?.name || 'Admin'}</p>
    </div>
    
    <nav class="sidebar-nav">
      {#each navItems as item}
        <a 
          href={item.href} 
          class="nav-item {$page.url.pathname === item.href ? 'active' : ''}"
        >
          <span class="nav-icon">{item.icon}</span>
          <span class="nav-label">{item.label}</span>
        </a>
      {/each}
    </nav>
    
    <div class="sidebar-footer">
      <form method="POST" action="/logout">
        <button type="submit" class="logout-button">
          <span class="nav-icon">🚪</span>
          <span class="nav-label">Logout</span>
        </button>
      </form>
    </div>
  </aside>
  
  <!-- Main content area -->
  <main class="main-content">
    <div class="mobile-header">
      <button 
        class="mobile-menu-toggle" 
        on:click={() => showMobileMenu = !showMobileMenu}
        on:keydown={(e) => e.key === 'Enter' && (showMobileMenu = !showMobileMenu)}
      >
        ☰
      </button>
      <h2>Willie's Keys</h2>
    </div>
    
    <!-- Page content -->
    <slot />
  </main>
  
  <!-- Mobile menu overlay (only shown on small screens) -->
  {#if showMobileMenu}
    <div class="mobile-menu-overlay" on:click={() => showMobileMenu = false} on:keydown={(e) => e.key === 'Escape' && (showMobileMenu = false)} tabindex="0">
      <div class="mobile-menu" on:click|stopPropagation>
        <!-- Mobile nav items (same as sidebar) -->
        <nav class="mobile-nav">
          {#each navItems as item}
            <a 
              href={item.href} 
              class="nav-item {$page.url.pathname === item.href ? 'active' : ''}"
              on:click={() => showMobileMenu = false}
            >
              <span class="nav-icon">{item.icon}</span>
              <span class="nav-label">{item.label}</span>
            </a>
          {/each}
          
          <form method="POST" action="/logout">
            <button type="submit" class="logout-button">
              <span class="nav-icon">🚪</span>
              <span class="nav-label">Logout</span>
            </button>
          </form>
        </nav>
      </div>
    </div>
  {/if}
</div>

<style>
  .admin-layout {
    display: flex;
    min-height: 100vh;
  }
  
  .sidebar {
    width: 250px;
    background: white;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: sticky;
    top: 0;
  }
  
  .sidebar-header {
    padding: 24px 20px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .sidebar-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
  }
  
  .sidebar-header p {
    margin: 4px 0 0 0;
    color: #6b7280;
    font-size: 14px;
  }
  
  .sidebar-nav {
    padding: 20px 0;
    flex-grow: 1;
    overflow-y: auto;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    color: #6b7280;
    text-decoration: none;
    transition: all 0.2s;
  }
  
  .nav-item:hover {
    background: #f3f4f6;
    color: #2563eb;
  }
  
  .nav-item.active {
    background: #e6f0fd;
    color: #2563eb;
    font-weight: 600;
    border-left: 3px solid #2563eb;
  }
  
  .nav-icon {
    margin-right: 12px;
    font-size: 18px;
  }
  
  .sidebar-footer {
    padding: 20px;
    border-top: 1px solid #e5e7eb;
  }
  
  .logout-button {
    display: flex;
    align-items: center;
    width: 100%;
    background: none;
    border: none;
    padding: 12px;
    color: #6b7280;
    font-size: 16px;
    cursor: pointer;
    text-align: left;
    border-radius: 6px;
  }
  
  .logout-button:hover {
    background: #fee2e2;
    color: #ef4444;
  }
  
  .main-content {
    flex-grow: 1;
    padding: 0;
    max-width: calc(100% - 250px);
    overflow: hidden;
  }
  
  .mobile-header {
    display: none;
    padding: 16px;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    align-items: center;
  }
  
  .mobile-menu-toggle {
    background: none;
    border: none;
    font-size: 24px;
    margin-right: 16px;
    cursor: pointer;
  }
  
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
    width: 250px;
    height: 100%;
    background: white;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    z-index: 1001;
  }
  
  .mobile-nav {
    padding: 20px 0;
  }
  
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
