<script lang="ts">
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
    <div class="header-actions">
      {#if data.user}
        <a href="/admin" class="admin-link">Manage Passes</a>
        <span class="user-name">Hi, {data.user.name}</span>
        <form method="POST" action="/logout">
          <button type="submit" class="logout-button">Logout</button>
        </form>
      {:else}
        <a href="/login" class="login-link">Login</a>
        <a href="/login?returnTo=/add" class="share-button">List your Pass</a>
      {/if}
    </div>
  </header>

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
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e0e0e0;
  }

  .header-actions {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .login-link {
    color: #666;
    text-decoration: none;
    font-size: 16px;
    font-weight: 600;
    transition: color 0.2s;
  }

  .login-link:hover {
    color: #2563eb;
  }

  .user-name {
    color: #666;
    font-size: 16px;
    font-weight: 600;
  }

  .logout-button {
    background: none;
    border: none;
    color: #666;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s;
    padding: 0;
  }

  .logout-button:hover {
    color: #ef4444;
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
  }

  .card:hover {
    border-color: #2563eb;
    transform: translateY(-4px);
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

  .share-button {
    background-color: #2563eb;
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.2s;
    text-decoration: none;
    display: inline-block; 
    position: relative;
    margin: 0.2rem 0 0 0;
  }

  .share-button:hover {
    background: #1d4ed8;
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
  }
</style>
