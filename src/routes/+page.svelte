<script lang="ts">
  import SearchBar from '$lib/components/SearchBar.svelte';
  export let data; 
</script>

<svelte:head>
  <title>Willie's Keys</title>
</svelte:head>

<div class="container">
  <header>
    <div class="header-content">
      <h1>WILLIE'S KEYS</h1>
      <p>Share the magic</p>
    </div>
  </header>

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
    <div class="grid">
      {#each data.passes as pass}
        <a href="/pass/{pass.id}" class="card">
          <div class="card-content">
            <h2>{pass.passType}</h2>
            <p class="owner">{pass.owner}</p>
            <p class="dates">{pass.availableDates}</p>
            <div class="price">${pass.price}<span>/day</span></div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f5f5f5;
    color: #1a1a1a;
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 60px 40px;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 48px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e0e0e0;
  }

  .header-content {
    flex: 1;
  }

  h1 {
    font-size: 72px;
    font-weight: 900;
    letter-spacing: -2px;
    margin: 0 0 16px 0;
    color: #1a1a1a;
    line-height: 0.9;
  }

  header p {
    font-size: 24px;
    color: #666;
    margin: 0;
    font-weight: 300;
  }

  .search-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 32px;
  }

  .search-info p {
    margin: 0;
    color: #1e40af;
    font-weight: 500;
  }

  .search-info strong {
    font-weight: 700;
    color: #1e3a8a;
  }

  .clear-search {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;
  }

  .clear-search:hover {
    text-decoration: underline;
  }

  .empty-state {
    text-align: center;
    padding: 80px 40px;
    background: white;
    border-radius: 8px;
    border: 2px dashed #e0e0e0;
  }

  .empty-state p {
    font-size: 18px;
    color: #666;
    margin: 0 0 24px 0;
  }

  .browse-all {
    display: inline-block;
    background: #2563eb;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s;
  }

  .browse-all:hover {
    background: #1d4ed8;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 32px;
  }

  .card {
    background: white;
    border: 2px solid #e0e0e0;
    padding: 32px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s;
    cursor: pointer;
    border-radius: 8px;
  }

  .card:hover {
    border-color: #2563eb;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .card h2 {
    font-size: 24px;
    font-weight: 800;
    margin: 0 0 12px 0;
    color: #1a1a1a;
  }

  .owner {
    font-size: 16px;
    color: #666;
    margin: 0 0 8px 0;
  }

  .dates {
    font-size: 14px;
    color: #999;
    margin: 0 0 20px 0;
  }

  .price {
    font-size: 36px;
    font-weight: 900;
    color: #2563eb;
    margin: 0;
  }

  .price span {
    font-size: 18px;
    font-weight: 400;
    color: #666;
  }

  @media (max-width: 768px) {
    .container {
      padding: 40px 20px;
    }

    h1 {
      font-size: 48px;
    }

    header p {
      font-size: 18px;
    }

    .grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .search-info {
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }

    header {
      margin-bottom: 32px;
    }
  }
</style>
