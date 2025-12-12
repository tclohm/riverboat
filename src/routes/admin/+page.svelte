<script lang="ts">
  export let data;
  import { enhance } from '$app/forms';
  import { Eye, Pencil, Trash2 } from '@lucide/svelte';
  
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
  <title>Manage Your Passes - Willie's Keys</title>
</svelte:head>

<div class="container">
  <header>
    <div class="header-content">
      <h1>Manage Your Passes</h1>
      <p>View, edit, and manage all your listed passes</p>
    </div>
    <a href="/add" class="add-pass-btn">+ Add New Pass</a>
  </header>

  <!-- Stats Dashboard -->
  <div class="stats-dashboard">
    <div class="stat-card">
      <div class="stat-number">{data.passes.length}</div>
      <div class="stat-label">Total Passes</div>
    </div>
  
    <div class="stat-card">
      <div class="stat-number">${data.passes.reduce((sum, pass) => sum + pass.price, 0)}</div>
      <div class="stat-label">Total Daily Value</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-number">
        {Object.keys(data.passes.reduce((types, pass) => {
          types[pass.passType] = true;
          return types;
        }, {})).length}
      </div>
      <div class="stat-label">Pass Types</div>
    </div>
  </div>

  <!-- Filter & Sort Bar -->
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

  {#if filteredPasses.length === 0}
    <div class="empty-state">
      <div class="empty-content">
        <h2>No passes listed</h2>
        <p>Start sharing your magic keys today!</p>
        <a href="/add" class="cta-button">List Your First Pass</a>
        {#if filter.type}
          <button on:click={() => { filter.type = ''; }} class="reset-btn">Reset Filter</button>
        {/if}
      </div>
    </div>
  {:else}
    <!-- Passes Table -->
    <div class="passes-table">
      <div class="table-header">
        <div class="col col-title">Pass Title</div>
        <div class="col col-type">Type</div>
        <div class="col col-dates">Available Dates</div>
        <div class="col col-price">Price/Day</div>
        <div class="col col-actions">Actions</div>
      </div>

      {#each paginatedPasses as pass}
        <div class="table-row">
          <div class="col col-title">
            <a href="/pass/{pass.id}" class="pass-link">{pass.title}</a>
          </div>
          <div class="col col-type">
            <span class="pass-type-badge">{pass.passType}</span>
          </div>
          <div class="col col-dates">{pass.availableDates}</div>
          <div class="col col-price">${pass.price}</div>
          <div class="col col-actions">
            <a href="/pass/{pass.id}" class="action-btn view-btn" title="View">
              <Eye size={18} />
            </a>
            <a href="/pass/{pass.id}/edit" class="action-btn edit-btn" title="Edit">
              <Pencil size={18} />
            </a>
            <button 
              type="button"
              class="action-btn delete-btn"
              on:click={() => showDeleteConfirm = pass.id}
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      {/each}
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="pagination">
        <button 
          on:click={prevPage} 
          disabled={currentPage === 1} 
          class="page-btn prev-btn">
          ← Prev
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
          Next →
        </button>
      </div>
    {/if}
  {/if}

  <!-- Delete Confirmation Modal -->
  {#if showDeleteConfirm}
    <div 
      class="modal-backdrop" 
      on:click={() => showDeleteConfirm = null}
      on:keydown={(e) => e.key === 'Escape' && (showDeleteConfirm = null)}
      tabindex="0"
      role="button"
      aria-label="Close modal"
    >
      <div class="modal-content" on:click|stopPropagation role="main" aria-label="modal content">
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
    margin: 0 auto;
    padding: 0 16px;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 2px solid #d4c4b0;
  }

  .header-content h1 {
    margin: 0 0 8px 0;
    font-size: 32px;
    font-weight: 700;
    color: #5a4a3a;
  }

  .header-content p {
    margin: 0;
    color: #8b7355;
    font-size: 14px;
  }

  .add-pass-btn {
    background: #d9a574;
    color: white;
    border: 2px solid #8b7355;
    padding: 12px 24px;
    border-radius: 2px;
    text-decoration: none;
    font-weight: 700;
    font-size: 14px;
    font-family: 'Fredoka', sans-serif;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .add-pass-btn:hover {
    background: #c85a54;
    transform: translateY(-2px);
  }

  /* Stats Dashboard */
  .stats-dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }

  .stat-card {
    background: #e8dcc8;
    border: 2px solid #8b7355;
    border-radius: 2px;
    padding: 20px;
    text-align: center;
  }

  .stat-number {
    font-size: 28px;
    font-weight: 900;
    color: #d9a574;
    margin: 0 0 8px 0;
  }

  .stat-label {
    font-size: 12px;
    font-weight: 600;
    color: #8b7355;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
  }

  /* Filter & Sort Bar */
  .filter-bar {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .filter-group label {
    font-size: 14px;
    font-weight: 600;
    color: #5a4a3a;
  }

  .filter-group select {
    padding: 10px 12px;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    font-size: 14px;
    font-family: 'Fredoka', sans-serif;
    background: #faf6f0;
    color: #5a4a3a;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 200px;
  }

  .filter-group select:hover,
  .filter-group select:focus {
    border-color: #c85a54;
    outline: none;
  }

  /* Empty State */
  .empty-state {
    background: #e8dcc8;
    border: 2px dashed #d4c4b0;
    border-radius: 2px;
    padding: 80px 32px;
    text-align: center;
    margin: 32px 0;
  }

  .empty-content h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 700;
    color: #5a4a3a;
  }

  .empty-content p {
    margin: 0 0 24px 0;
    color: #8b7355;
    font-size: 14px;
  }

  .cta-button {
    display: inline-block;
    background: #d9a574;
    color: white;
    padding: 12px 24px;
    border-radius: 2px;
    text-decoration: none;
    font-weight: 700;
    font-size: 14px;
    border: 2px solid #8b7355;
    transition: all 0.2s;
    margin-right: 12px;
  }

  .cta-button:hover {
    background: #c85a54;
  }

  .reset-btn {
    background: white;
    color: #8b7355;
    border: 2px solid #d4c4b0;
    padding: 12px 24px;
    border-radius: 2px;
    font-weight: 700;
    font-size: 14px;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    background: #d4c4b0;
    color: #5a4a3a;
  }

  /* Passes Table */
  .passes-table {
    background: white;
    border: 2px solid #8b7355;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 24px;
  }

  .table-header {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1.5fr;
    gap: 12px;
    background: #e8dcc8;
    border-bottom: 2px solid #8b7355;
    padding: 16px;
    font-weight: 700;
    font-size: 13px;
    color: #5a4a3a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1.5fr;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid #d4c4b0;
    align-items: center;
    transition: background 0.2s;
  }

  .table-row:hover {
    background: #faf6f0;
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .col {
    font-size: 14px;
    color: #5a4a3a;
  }

  .pass-link {
    color: #d9a574;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
  }

  .pass-link:hover {
    color: #c85a54;
    text-decoration: underline;
  }

  .pass-type-badge {
    display: inline-block;
    background: #d4c4b0;
    color: #5a4a3a;
    padding: 4px 12px;
    border-radius: 2px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid #8b7355;
  }

  .col-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-start;
  }

  .action-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    border: 1px solid transparent;
    background: none;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
  }

  .view-btn {
    color: #d9a574;
  }

  .view-btn:hover {
    background: rgba(217, 165, 116, 0.1);
    border-color: #d9a574;
  }

  .edit-btn {
    color: #8b7355;
  }

  .edit-btn:hover {
    background: rgba(139, 115, 85, 0.1);
    border-color: #8b7355;
  }

  .delete-btn {
    color: #c85a54;
  }

  .delete-btn:hover {
    background: rgba(200, 90, 84, 0.1);
    border-color: #c85a54;
  }

  /* Pagination */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 24px;
  }

  .page-btn {
    background: white;
    color: #8b7355;
    border: 2px solid #d4c4b0;
    padding: 8px 16px;
    border-radius: 2px;
    font-weight: 600;
    font-size: 14px;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }

  .page-btn:hover:not(:disabled) {
    background: #d9a574;
    color: white;
    border-color: #8b7355;
  }

  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .page-numbers {
    display: flex;
    gap: 4px;
  }

  .page-num {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    color: #8b7355;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    font-weight: 600;
    font-size: 14px;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }

  .page-num:hover {
    background: #e8dcc8;
  }

  .page-num.active {
    background: #d9a574;
    color: white;
    border-color: #8b7355;
  }

  /* Delete Modal */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: #e8dcc8;
    border: 2px solid #8b7355;
    border-radius: 2px;
    padding: 32px;
    max-width: 420px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }

  .modal-content h2 {
    margin: 0 0 12px 0;
    font-size: 24px;
    font-weight: 700;
    color: #5a4a3a;
  }

  .modal-content p {
    margin: 0 0 24px 0;
    color: #8b7355;
    font-size: 14px;
    line-height: 1.6;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .modal-actions form {
    display: contents;
  }

  .cancel-btn,
  .confirm-delete-btn {
    padding: 10px 20px;
    border-radius: 2px;
    font-weight: 600;
    font-size: 14px;
    font-family: 'Fredoka', sans-serif;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-btn {
    background: #d4c4b0;
    color: #5a4a3a;
    border: 2px solid #8b7355;
  }

  .cancel-btn:hover {
    background: #c85a54;
    color: white;
  }

  .confirm-delete-btn {
    background: #c85a54;
    color: white;
    border: 2px solid #8b7355;
  }

  .confirm-delete-btn:hover {
    background: #b84a45;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .table-header,
    .table-row {
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
    }

    .col-type {
      display: none;
    }
  }

  @media (max-width: 768px) {
    header {
      flex-direction: column;
      gap: 16px;
    }

    .header-content h1 {
      font-size: 28px;
    }

    .filter-bar {
      gap: 12px;
    }

    .filter-group select {
      min-width: 100%;
    }

    .stats-dashboard {
      grid-template-columns: 1fr;
    }

    .table-header,
    .table-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .col-title::before,
    .col-type::before,
    .col-dates::before,
    .col-price::before,
    .col-actions::before {
      content: attr(data-label);
      font-weight: 600;
      color: #8b7355;
      display: block;
      font-size: 12px;
      margin-bottom: 4px;
    }

    .col-actions {
      justify-content: space-between;
    }

    .pagination {
      flex-wrap: wrap;
    }
  }
</style>
