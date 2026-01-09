<script lang="ts">
  import SearchBar from '$lib/components/SearchBar.svelte';
  import { getPassImage } from '$lib/passImages';
  export let data; 

  $: hasActiveFilters = data.searchDates || data.passType;
</script>

<svelte:head>
  <title>Willie's Keys</title>
</svelte:head>

<div class="container">

  <!-- Search Bar -->
  <div class="w-full flex justify-center align-items">
    <SearchBar />
  </div>

  <!-- Active Filters / Results Info -->
  {#if hasActiveFilters}
    <div class="search-info">
      <div class="filter-tags">
        <span class="results-count">
          {data.filteredCount} of {data.totalCount} passes
        </span>
        
        {#if data.searchDates}
          <span class="filter-tag">
            📅 {data.searchDates}
          </span>
        {/if}
        
        {#if data.passType}
          <span class="filter-tag">
            🎟️ {data.passType}
          </span>
        {/if}
        
        {#if data.guests && data.guests > 1}
          <span class="filter-tag">
            👥 {data.guests} guests
          </span>
        {/if}
      </div>
      
      <a href="/" class="clear-search">Clear all</a>
    </div>
  {/if}

  <!-- Passes Grid -->
  {#if data.passes.length === 0}
    <div class="empty-state">
      <p>No passes available{hasActiveFilters ? ' matching your filters' : ''}</p>
      {#if hasActiveFilters}
        <p class="empty-hint">Try different dates or pass type</p>
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
              <img 
                src={getPassImage(pass.passType)} 
                alt={pass.passType}
                class="pass-image"
              />
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
                <p class="dates-label">Per Day</p>
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
    margin: 0 0 32px 0;
    padding: 16px;
    background: #e8dcc8;
    border-radius: 2px;
    border: 2px solid #d4c4b0;
    flex-wrap: wrap;
    gap: 12px;
  }

  .filter-tags {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .results-count {
    font-size: 14px;
    font-weight: 600;
    color: #5a4a3a;
  }

  .filter-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: white;
    color: #5a4a3a;
    padding: 6px 12px;
    border-radius: 2px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid #d4c4b0;
  }

  .search-info p {
    margin: 0;
    font-size: 16px;
    color: #5a4a3a;
  }

  .clear-search {
    color: #c85a54;
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
    background: #e8dcc8;
    border: 2px dashed #d4c4b0;
    border-radius: 2px;
    margin: 48px 0;
  }

  .empty-state p {
    font-size: 18px;
    color: #8b7355;
    margin: 0 0 12px 0;
  }

  .empty-hint {
    font-size: 14px;
    color: #a0937f;
    margin: 0 0 24px 0;
  }

  .browse-all {
    display: inline-block;
    background: #d9a574;
    color: white;
    padding: 12px 24px;
    border-radius: 2px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s;
    border: 2px solid #8b7355;
  }

  .browse-all:hover {
    background: #c85a54;
  }

  .passes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
    margin: 0 0 48px 0;
  }

  .pass-card-link {
    text-decoration: none;
    color: inherit;
  }

  /* Main Card Container */
  .pass-card {
    display: flex;
    background: #e8dcc8;
    border: 2px solid #8b7355;
    border-radius: 2px;
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
    background: #d4c4b0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .pass-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* RIGHT SECTION: Vertical Sidebar */
  .sidebar-section {
    width: 120px;
    background: #e8dcc8;
    border-left: 2px solid #8b7355;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Number at top */
  .sidebar-number {
    font-size: 28px;
    font-weight: 700;
    color: #c85a54;
    text-align: center;
    padding: 8px 0;
    border-bottom: 2px solid #d4c4b0;
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
    color: #5a4a3a;
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
    border-top: 2px solid #d4c4b0;
    text-align: center;
  }

  .dates-label {
    margin: 0;
    font-size: 10px;
    font-weight: 600;
    color: #8b7355;
    text-transform: uppercase;
    letter-spacing: 0.5px;
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

    .search-info {
      flex-direction: column;
      align-items: flex-start;
    }

    .filter-tags {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .passes-grid {
      grid-template-columns: 1fr;
    }

    .pass-card {
      height: 250px;
    }

    .filter-tag {
      font-size: 12px;
      padding: 4px 8px;
    }
  }
</style>
