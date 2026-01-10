<script lang="ts">
  import FilterBar from '$lib/components/FilterBar.svelte';
  import { getPassImage } from '$lib/passImages';
  export let data; 
</script>

<svelte:head>
  <title>Willie's Keys</title>
</svelte:head>

<div class="container">

  <!-- Filter Bar -->
  <FilterBar />

  <!-- Passes Grid -->
  {#if data.passes.length === 0}
    <div class="empty-state">
      <p>No passes available{data.searchDates || data.passType ? ' matching your filters' : ''}</p>
      {#if data.searchDates || data.passType}
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
  }

  @media (max-width: 480px) {
    .passes-grid {
      grid-template-columns: 1fr;
    }

    .pass-card {
      height: 250px;
    }
  }
</style>
