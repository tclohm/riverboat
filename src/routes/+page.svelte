<script lang="ts">
  import SearchBar from '$lib/components/SearchBar.svelte';
  export let data; 
</script>

<svelte:head>
  <title>Willie's Keys</title>
</svelte:head>

<div class="container max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
  <!-- Header -->
  <header class="flex justify-between items-start mb-12 pb-6 border-b border-gray-300">
    <div class="flex-1">
      <h1 class="text-6xl md:text-7xl font-black -tracking-wide mb-4 text-gray-900 leading-tight">
        WILLIE'S KEYS
      </h1>
      <p class="text-xl md:text-2xl text-gray-600 font-light">
        Share the magic
      </p>
    </div>
  </header>

  <!-- Search Bar -->
  <SearchBar />

  <!-- Results Info -->
  {#if data.searchDates}
    <div class="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
      <p class="text-blue-900 font-medium m-0">
        Showing passes available for <strong class="font-bold text-blue-950">{data.searchDates}</strong>
        {#if data.guests}
          for <strong class="font-bold text-blue-950">{data.guests} {data.guests === 1 ? 'guest' : 'guests'}</strong>
        {/if}
      </p>
      <a href="/" class="text-blue-600 font-semibold text-sm hover:underline transition">
        Clear search
      </a>
    </div>
  {/if}

  <!-- Passes Grid -->
  {#if data.passes.length === 0}
    <div class="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
      <p class="text-lg text-gray-600 mb-6">
        No passes available{data.searchDates ? ' for those dates' : ''}
      </p>
      {#if data.searchDates}
        <a href="/" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          Browse all passes
        </a>
      {/if}
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {#each data.passes as pass}
        <a 
          href="/pass/{pass.id}" 
          class="group bg-white border-2 border-gray-300 rounded-2xl p-8 lg:p-6 xl:p-7 flex flex-col lg:flex-row lg:items-center lg:gap-6 xl:flex-col xl:gap-0 hover:border-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl min-h-40 lg:min-h-40 xl:min-h-auto cursor-pointer"
        >
          <!-- Content -->
          <div class="flex-1">
            <h2 class="text-lg lg:text-base xl:text-xl font-black uppercase -tracking-tight text-gray-900 leading-tight mb-4">
              {pass.passType}
            </h2>
            <p class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
              {pass.owner}
            </p>
            <p class="text-sm font-semibold text-gray-400">
              {pass.availableDates}
            </p>
          </div>

          <!-- Price -->
          <div class="flex items-center justify-center lg:justify-end xl:justify-center gap-1 flex-shrink-0 mt-6 lg:mt-0 xl:mt-4 text-right">
            <span class="text-xl lg:text-lg xl:text-2xl font-bold text-gray-400 leading-none">
              $
            </span>
            <strong class="text-5xl lg:text-4xl xl:text-5xl font-black text-gray-400 leading-tight">
              {pass.price}
            </strong>
            <span class="text-base lg:text-sm xl:text-base font-semibold text-gray-400 self-end mb-3 lg:mb-2 xl:mb-3">
              /day
            </span>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  :global(body) {
    @apply bg-gray-50;
  }
</style>
