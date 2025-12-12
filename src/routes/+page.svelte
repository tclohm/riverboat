<script lang="ts">
  import SearchBar from '$lib/components/SearchBar.svelte';
  export let data; 
</script>

<svelte:head>
  <title>Willie's Keys</title>
</svelte:head>

<div class="container">

  <!-- Search Bar -->
  <SearchBar />

  <!-- Results Info -->
  {#if data.searchDates}
    <div class="search-info">
      <p>
        Showing passes available for <strong>{data.searchDates}</strong>
        {#if data.guests}
          for <strong>{data.guests} {data.guests === 1 ? 'guest' : 'guests'}</strong>
        {/if}
      </p>
      <a href="/" class="clear-search">Clear search</a>
    </div>
  {/if}

  <!-- Passes Grid -->
  {#if data.passes.length === 0}
    <div class="empty-state">
      <p>No passes available{data.searchDates ? ' for those dates' : ''}</p>
      {#if data.searchDates}
        <a href="/" class="browse-all">Browse all passes</a>
      {/if}
    </div>
  {:else}
<div class="passes-grid">
  {#each data.passes as pass}
    <a href="/pass/{pass.id}" class="pass-card-link">
      <!-- Card Container - Two column layout -->
      <div class="pass-card">
        
        <!-- LEFT: Large Illustration Area -->
        <div class="illustration-section">
          <div class="illustration-placeholder"></div>
        </div>

        <!-- RIGHT: Vertical Sidebar -->
        <div class="sidebar-section">
          <!-- Price/Number at top -->
          <div class="sidebar-number">
            ${pass.price}
          </div>

          <!-- Pass Type - vertical text -->
          <div class="sidebar-text">
            <h2>{pass.passType}</h2>
          </div>

          <!-- Dates info -->
          <div class="sidebar-info">
            <p class="dates-label">Available</p>
            <p class="dates-value">{pass.availableDates}</p>
          </div>
        </div>
      </div>
    </a>
  {/each}
</div>
  {/if}
</div>

<style>
  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 16px;
  }

  .search-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 32px 0;
    padding: 16px;
    background: #f0f7ff;
    border-radius: 8px;
    border-left: 4px solid #2563eb;
  }

  .search-info p {
    margin: 0;
    font-size: 16px;
    color: #1f2937;
  }

  .clear-search {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
  }

  .clear-search:hover {
    text-decoration: underline;
  }

  .empty-state {
    text-align: center;
    padding: 80px 32px;
    background: #f9fafb;
    border: 2px dashed #e5e7eb;
    border-radius: 12px;
    margin: 48px 0;
  }

  .empty-state p {
    font-size: 18px;
    color: #6b7280;
    margin: 0 0 24px 0;
  }

  .browse-all {
    display: inline-block;
    background: #2563eb;
    color: white;
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    transition: background 0.2s;
  }

  .browse-all:hover {
    background: #1d4ed8;
  }

  .passes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
    margin: 48px 0;
  }

  .pass-card-link {
    text-decoration: none;
    color: inherit;
  }

  /* Main Card Container */
  .pass-card {
    display: flex;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    height: 300px;
  }

  .pass-card:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px);
  }

  /* LEFT SECTION: Large Illustration */
  .illustration-section {
    flex: 1;
    background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #fce7f3 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .illustration-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #f0f9ff 0%, #f0fdf4 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    font-size: 14px;
  }

  /* RIGHT SECTION: Vertical Sidebar */
  .sidebar-section {
    width: 120px;
    background: white;
    border-left: 1px solid #e5e7eb;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Number at top */
  .sidebar-number {
    font-size: 28px;
    font-weight: 700;
    color: #2563eb;
    text-align: center;
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
  }

  /* Vertical text */
  .sidebar-text {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar-text h2 {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    color: #1f2937;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    line-height: 1.2;
    text-align: center;
    word-break: break-word;
  }

  /* Info at bottom */
  .sidebar-info {
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
    text-align: center;
  }

  .dates-label {
    margin: 0 0 4px 0;
    font-size: 10px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .dates-value {
    margin: 0;
    font-size: 11px;
    font-weight: 500;
    color: #374151;
    line-height: 1.3;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .passes-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .pass-card {
      height: 280px;
    }

    .sidebar-section {
      width: 100px;
      padding: 12px 10px;
      gap: 12px;
    }

    .sidebar-number {
      font-size: 24px;
    }

    .sidebar-text h2 {
      font-size: 12px;
    }
  }

  @media (max-width: 480px) {
    .passes-grid {
      grid-template-columns: 1fr;
    }

    .search-info {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }

    .pass-card {
      height: 250px;
    }
  }
</style>
