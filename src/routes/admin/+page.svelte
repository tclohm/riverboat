<script lang="ts">
  export let data;
  import { enhance } from '$app/forms';
  import { writable } from 'svelte/store';
  import { Eye, Pencil, Trash } from '@lucide/svelte';
  
  let filter = { type: '' }; 
  let sortOption = 'price-asc'; 

  $: filteredPasses  = data.passes 
     .filter(pass => !filter.type || pass.passType === filter.type)
     .sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price; 
      if (sortOption === 'price-desc') return b.price - a.price;
      if (sortOption === 'title') return a.title.localeCompare(b.title);
      return 0;
  });

  let showDeleteConfirm: any = null;

  const ITEMS_PER_PAGE = 6;
  let currentPage = 1;

  $: totalPages = Math.ceil(filteredPasses.length / ITEMS_PER_PAGE);
  $: paginatedPasses = filteredPasses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function nextPage() {
    if (currentPage < totalPages) currentPage++;
  }

  function prevPage() {
    if (currentPage > 1) currentPage--;
  }

  function goToPage(page) {
    currentPage = page;
  }
  
  $: filter, sortOption, currentPage = 1
</script>

<svelte:head>
  <title>Manager Your Passes - Willie's Keys</title>
</svelte:head>

<div class="container">
  <header>
    <div class="header-content">
      <h1>Manage Your Passes</h1>
      <p>Here you can view, edit, and manage all your listed passes</p>
    </div>
  </header>
  <div class="filter-bar">
    <div class="filter-group">
      <label for="filterType">Filter by Type:</label>
      <select id="filterType" bind:value={filter.type}>
        <option value="">All Types</option>
        {#each [...new Set(data.passes.map(pass => pass.passType))] as type}
          <option value={type}>{type}</option>
        {/each}
      </select>
    </div>
    
    <div class="filter-group">
      <label for="sortBy">Sort by:</label>
      <select id="sortBy" bind:value={sortOption}>
        <option value="price-asc">Price (Low to High)</option>
        <option value="price-desc">Price (High to Low)</option>
        <option value="title">Title (A-Z)</option>
      </select>
    </div>
  </div>

  <div class="stats-dashboard">
    <div class="stat-card">
      <div class="stat-value">{data.passes.length}</div>
      <div class="stat-label">Total Passes</div>
    </div>
  
    <div class="stat-card">
      <div class="stat-value">${data.passes.reduce((sum, pass) => sum + pass.price, 0)}</div>
      <div class="stat-label">Total Daily Value</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-value">
        {Object.keys(data.passes.reduce((types, pass) => {
          types[pass.passType] = true;
          return types;
        }, {})).length}
      </div>
      <div class="stat-label">Pass Types</div>
    </div>
  </div>

  {#if filteredPasses.length === 0}
    <div class="empty-state">
      <div class="empty-content">
        <h2>No passes listed</h2>
        <p>Start sharing your Magic Keys today!</p>
        <a href="/add" class="cta-button">List Your First Pass</a>
        <button on:click={() => { filter.type = ''; }} class="reset-btn">Reset Filter</button>
      </div>
    </div>
  {:else}
    <div class="passes-grid">
      {#each paginatedPasses as pass}
        <div class="pass-card">
          <div class="pass-content">
            <h2>{pass.title}</h2>
            <p class="pass-owner">{pass.passType}</p>
            <p class="pass-dates">{pass.availableDates}</p>
          </div>
          <div class="pass-price">${pass.price}<span>/day</span></div>
        </div>
      {/each}
    </div>

    {#if totalPages > 1}
      <div class="pagination">
        <button 
          on:click={prevPage} 
          disabled={currentPage === 1} 
          class="page-btn prev-btn">
          &larr; Prev
        </button>
        
        <div class="page-numbers">
          {#each Array(totalPages) as _, i}
            <button 
              class="page-num {currentPage === i+1 ? 'active' : ''}" 
              on:click={() => goToPage(i+1)}>
              {i+1}
            </button>
          {/each}
        </div>
        
        <button 
          on:click={nextPage} 
          disabled={currentPage === totalPages} 
          class="page-btn next-btn">
          Next &rarr;
        </button>
      </div>
    {/if}
  {/if}
  {#if showDeleteConfirm}
  <div 
    class="modal-backdrop" 
    on:click={() => showDeleteConfirm = null}
    on:keydown={(e) => e.key === 'Escape' && (showDeleteConfirm = null)}
    tabindex="0"
    role="button"
    aria-label="Close modal"
  >
    <div class="modal-content" on:click|stopPropagation
    role="main"
    aria-label="modal content">
      <h2>Delete Pass?</h2>
      <p>Are you sure you want to delete this pass? This action cannot be undone.</p>
        
      <div class="modal-actions">
        <button on:click={() => showDeleteConfirm = null} class="cancel-btn">Cancel</button>
        <form method="POST" action="/pass/{showDeleteConfirm}/edit?/delete" use:enhance>
            <button type="submit" class="confirm-delete-btn">Yes, Delete</button>
        </form>
      </div>
    </div>
  </div>
  {/if}
</div>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 48px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e0e0e0;
  }

  .header-content h1 {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: #1a1a1a;
  }

  .header-content p {
    color: #666;
    margin: 0;
  }

  .empty-state {
    background: #f9fafb;
    border: 2px dashed #e5e7eb;
    border-radius: 12px;
    padding: 80px 40px;
    text-align: center;
  }

  .empty-content h2 {
    font-size: 24px;
    margin: 0 0 16px 0;
  }

  .empty-content p {
    color: #666;
    max-width: 400px;
    margin: 0 auto 24px auto;
  }

  .cta-button {
    display: inline-block;
    background: #2563eb;
    color: white;
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 18px;
    transition: background 0.2s;
    margin-right: 12px;
  }

  .cta-button:hover {
    background: #1d4ed8;
  }

  .passes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }

  .pass-card {
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 12px;
    padding: 24px;
    text-decoration: none;
    color: #1a1a1a;
    transition: all 0.2s;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .pass-card:hover {
    border-color: #9ca3af;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .pass-content {
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .pass-content h2 {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 12px 0;
    color: #1a1a1a;
  }

  .pass-owner {
    font-size: 13px;
    color: #999;
    margin: 0 0 8px 0;
    font-weight: 500;
  }

  .pass-dates {
    font-size: 13px;
    color: #bbb;
    margin: 0 0 16px 0;
    font-weight: 400;
  }

  .pass-price {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 2px;
    font-size: 28px;
    font-weight: 700;
    color: #9ca3af;
    margin: 0;
  }

  .pass-price span {
    font-size: 13px;
    font-weight: 400;
    color: #bbb;
  }

  .stats-dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
  }

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    text-align: center;
  }

  .stat-value {
    font-size: 36px;
    font-weight: 700;
    color: #2563eb;
    margin-bottom: 8px;
  }

  .stat-label {
    color: #666;
    font-size: 14px;
  }

  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    background: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .filter-group label {
    font-size: 12px;
    font-weight: 600;
    color: #666;
    margin-bottom: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .filter-group select {
    padding: 8px 12px;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    font-size: 14px;
    background: white;
  }

  .reset-btn {
    background: #f3f4f6;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .reset-btn:hover {
    background: #e5e7eb;
  }

  .admin-nav {
    display: flex;
    margin-bottom: 32px;
    background: white;
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #d1d5db;
  }

  .nav-item {
    padding: 12px 24px;
    color: #666;
    text-decoration: none;
    font-weight: 600;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .nav-item:hover {
    background: #f3f4f6;
    color: #2563eb;
  }

  .nav-item.active {
    background: #e6f0fd;
    color: #2563eb;
  }

  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 32px;
  }

  .page-btn {
    background: white;
    border: 1px solid #ddd;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    color: #666;
  }

  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .page-btn:hover:not(:disabled) {
    background: #f3f4f6;
    color: #2563eb;
  }

  .page-numbers {
    display: flex;
    gap: 8px;
  }

  .page-num {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 600;
    background: white;
    border: 1px solid #ddd;
    cursor: pointer;
    color: #666;
  }

  .page-num.active {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
  }

  .page-num:hover:not(.active) {
    background: #f3f4f6;
    color: #2563eb;
  }

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 24px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .modal-content h2 {
    margin: 0 0 16px 0;
  }

  .modal-content p {
    margin-bottom: 24px;
    color: #666;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
  }

  .cancel-btn, .confirm-delete-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    margin-left: 12px;
    border: none;
  }

  .cancel-btn {
    background: #f3f4f6;
    color: #444;
  }

  .confirm-delete-btn {
    background: #ef4444;
    color: white;
  }

  @media (max-width: 768px) {
    header {
      flex-direction: column;
      align-items: flex-start;
    }

    .pass-card {
      padding: 24px 16px;
      gap: 16px;
      min-height: 140px;
    }

    .pass-content h2 {
      font-size: 1rem;
    }

    .pass-price {
      font-size: 40px;
    }

    .pass-price span {
      font-size: 12px;
    }

    .stats-dashboard {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
</style>
