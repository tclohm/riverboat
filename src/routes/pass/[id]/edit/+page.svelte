<script lang="ts">
  import { enhance } from '$app/forms';
  
  export let data;
  const { pass } = data;
  
  let loading = false;
  let showDeleteConfirm = false;

  function toggleConfirm() {
    showDeleteConfirm = true;
  }

  function cancelDelete() {
    showDeleteConfirm = false;
  }
</script>

<svelte:head>
  <title>Edit {pass.title} - Willie's Keys</title>
</svelte:head>

<div class="container">
  <a href="/pass/{pass.id}" class="back">← Back to pass</a>
  
  <h1>Edit Pass</h1>

  <form method="POST" action="?/update" use:enhance={() => {
    loading = true;
    return async ({ result, update }) => {
      loading = false;
      await update();
    };
  }}>
    <div class="form-grid">
      <div class="form-group">
        <label for="title">Pass Title</label>
        <input 
          type="text" 
          id="title" 
          name="title" 
          value={pass.title}
          required
        />
      </div>

      <div class="form-group">
        <label for="passType">Pass Type</label>
        <select id="passType" name="passType" required>
          <option value="Dream Key" selected={pass.passType === 'Dream Key'}>Dream Key</option>
          <option value="Inspire Key" selected={pass.passType === 'Inspire Key'}>Inspire Key</option>
          <option value="Enchant Key" selected={pass.passType === 'Enchant Key'}>Enchant Key</option>
          <option value="Believe Key" selected={pass.passType === 'Believe Key'}>Believe Key</option>
        </select>
      </div>

      <div class="form-group">
        <label for="price">Price per day ($)</label>
        <input 
          type="number" 
          id="price" 
          name="price" 
          value={pass.price}
          min="1"
          required
        />
      </div>

      <div class="form-group">
        <label for="availableDates">Available Dates</label>
        <input 
          type="text" 
          id="availableDates" 
          name="availableDates" 
          value={pass.availableDates}
          required
        />
      </div>
    </div>

    <button type="submit" disabled={loading} class="save-button">
      {loading ? 'Saving...' : 'Save Changes'}
    </button>
  </form>

  <div class="danger-zone">
    <h2>Delete Pass</h2>
    {#if !showDeleteConfirm}
      <button type="button" class="delete-button" on:click={toggleConfirm}>
        Delete Pass
      </button>
    {:else}
      <p class="confirm-text">Are you sure? This action cannot be undone.</p>
      
      <div class="confirm-buttons">
        <button type="button" class="cancel-delete" on:click={cancelDelete}>
          Cancel
        </button>
        <form method="POST" action="?/delete" use:enhance>
          <button type="submit" class="confirm-delete">
            Yes, Delete
          </button>
        </form>
      </div>
    {/if}
  </div>
</div>

<style>
  :global(body) {
    background-color: #f5f5f5;
  }

  .container {
    max-width: 800px;
    margin: 80px 0 0 0;
    padding: 0 24px;
  }

  .back {
    display: inline-block;
    color: #666;
    text-decoration: none;
    font-size: 14px;
    margin-bottom: 32px;
    transition: color 0.2s;
  }

  .back:hover {
    color: #2563eb;
  }

  h1 {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 40px 0;
    color: #1a1a1a;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 48px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #999;
    margin-bottom: 8px;
  }

  input, select {
    width: 100%;
    padding: 16px;
    border: 1px solid #d0d0d0;
    border-radius: 8px;
    font-size: 16px;
    font-family: inherit;
    background: white;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  input:focus, select:focus {
    outline: none;
    border-color: #2563eb;
  }

  .save-button {
    width: 100%;
    background: #2563eb;
    color: white;
    border: none;
    padding: 16px;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 8px;
  }

  .save-button:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .danger-zone {
    background: white;
    border: 2px solid #fecaca;
    border-radius: 8px;
    padding: 24px;
    margin-top: 48px;
  }

  .danger-zone h2 {
    font-size: 18px;
    font-weight: 700;
    color: #dc2626;
    margin: 0 0 16px 0;
  }

  .delete-button {
    background: white;
    color: #dc2626;
    border: 1px solid #dc2626;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .delete-button:hover {
    background: #ef4444;
    color: white;
  }

  .confirm-text {
    color: #666;
    font-weight: 500;
    font-size: 14px;
    margin: 0 0 16px 0;
  }

  .confirm-buttons {
    display: flex;
    gap: 12px;
  }

  .confirm-buttons form {
    padding: 0;
    border: none;
    background: none;
    margin: 0;
  }

  .confirm-delete {
    background: #ef4444;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .confirm-delete:hover {
    background: #dc2626;
  }

  .cancel-delete {
    background: white;
    color: #666;
    border: 1px solid #d0d0d0;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-delete:hover {
    border-color: #1a1a1a;
    color: #1a1a1a;
  }

  @media (max-width: 768px) {
    .container {
      margin: 40px 0 0 0;
      padding: 0 16px;
    }

    h1 {
      font-size: 28px;
    }

    .form-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }
</style>
