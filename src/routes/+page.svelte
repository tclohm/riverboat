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
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
  {#each data.passes as pass}
    <a href="/pass/{pass.id}" class="w-full">
      <!-- Card Container -->
      <div class="bg-white rounded-lg border border-gray-200 hover:border-gray-400 overflow-hidden shadow-sm hover:shadow-md transition-all mx-1 md:m-0">
        <!-- Content -->
        <div class="p-4">
          <h2 class="text-sm font-bold text-gray-900 mb-2 line-clamp-2">
            {pass.passType}
          </h2>
          <p class="text-xs text-gray-500 mb-3">
            {pass.availableDates}
          </p>
          <div class="text-lg font-bold text-gray-900">
            ${pass.price}<span class="text-sm font-normal text-gray-500">/day</span>
          </div>
        </div>
      </div>
    </a>
  {/each}
</div>  
  {/if}
</div>

