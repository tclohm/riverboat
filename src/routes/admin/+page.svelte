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


