<script lang="ts">
  export let data;
  import { enhance } from '$app/forms';
  import { writable } from 'svelte/store';

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
    <a href="/add" class="add-button">+ Add New Pass</a>
  </header>
  <div class="admin-nav">
    <a href="/admin" class="nav-item active">Dashboard</a>
    <a href="/add" class="nav-item">Add New Pass</a>
  </div>

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
      {#each filteredPasses as pass}
        <div class="pass-card">
          <div class="pass-header">
            <span class="pass-type">{pass.passType}</span>
          </div>
          <div class="pass-content">
            <h2>{pass.title}</h2>
            <p class="pass-owner">Listed by: {pass.owner}</p>
            <p class="pass-dates">Available: {pass.availableDates}</p>
            <div class="pass-price">${pass.price}<span>/day</span></div>
          </div>
          <div class="pass-actions">
            <a href="/pass/{pass.id}" class="action-btn view-btn">
              <span class="icon">👁️</span> View
            </a>
            <a href="/pass/{pass.id}/edit" class="action-btn edit-btn">
              <span class="icon">✏️</span> Edit
            </a>
            <button 
              on:click={() => showDeleteConfirm = pass.id} 
              class="action-btn delete-btn">
              <span class="icon">🗑️</span> Delete
            </button>
          </div>
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
  .container {
    max-width: 1200px;
    margin: 60px auto;
    padding: 0 24px;
  }
  
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
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
  
  .add-button {
    background: #2563eb;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: background 0.2s;
  }
  
  .add-button:hover {
    background: #1d4ed8;
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
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
  }
  
  .pass-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
  
  .pass-header {
    background: #f8f9fa;
    padding: 16px 24px;
    border-bottom: 1px solid #eee;
  }
  
  .pass-type {
    display: inline-block;
    background: #e6f0fd;
    color: #2563eb;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  .pass-content {
    padding: 24px;
    flex-grow: 1;
  }
  
  .pass-content h2 {
    margin: 0 0 16px 0;
    font-size: 20px;
    font-weight: 700;
  }
  
  .pass-owner, .pass-dates {
    margin: 8px 0;
    font-size: 14px;
    color: #666;
  }
  
  .pass-price {
    margin-top: 16px;
    font-size: 24px;
    font-weight: 700;
    color: #2563eb;
  }
  
  .pass-price span {
    font-size: 14px;
    font-weight: 400;
    color: #666;
  }
  
  .pass-actions {
    display: flex;
    padding: 16px 24px;
    background: #f8f9fa;
    border-top: 1px solid #eee;
  }
  
  .view-btn, .edit-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    text-align: center;
  }
  
  .view-btn {
    background: #f8f9fa;
    color: #444;
    border: 1px solid #ddd;
    margin-right: 12px;
    flex: 1;
  }
  
  .edit-btn {
    background: #2563eb;
    color: white;
    border: 1px solid #2563eb;
    flex: 1;
  }
  
  .view-btn:hover {
    background: #eee;
  }
  
  .edit-btn:hover {
    background: #1d4ed8;
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
    justify-content: space-between;
    margin-bottom: 24px;
    background: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .filter-group {
    display: flex;
    align-items: center;
    margin: 8px 0;
  }
  
  .filter-group label {
    margin-right: 12px;
    font-size: 14px;
    color: #666;
  }
  
  .filter-group select {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #ddd;
    background: white;
    font-size: 14px;
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

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    flex: 1;
    margin: 0 4px;
    cursor: pointer;
    border: none;
  }
  
  .view-btn {
    background: #f3f4f6;
    color: #444;
  }
  
  .edit-btn {
    background: #e6f0fd;
    color: #2563eb;
  }
  
  .delete-btn {
    background: #fee2e2;
    color: #ef4444;
  }
  
  .icon {
    margin-right: 4px;
  }
  
  /* Modal styles */
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

  .admin-nav {
    display: flex;
    margin-bottom: 32px;
    background: white;
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  
  @media (max-width: 768px) {
    .container {
      padding: 0 16px;
      margin: 40px auto;
    }
    
    header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .add-button {
      margin-top: 16px;
    }
    
    .passes-grid {
      grid-template-columns: 1fr;
    }

    .stats-dashboard {
      grid-template-columns: 1fr;
      gap: 16px;
    }

  }
</style>
