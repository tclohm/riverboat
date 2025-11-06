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
  
  <h1>EDIT PASS</h1>
  <p class="subtitle">Update your listing details</p>

  <form method="POST" action="?/update" use:enhance={() => {
    loading = true;
    return async ({ result, update }) => {
      loading = false;
      await update();
    };
  }}>
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
      <label for="owner">Your Name</label>
      <input 
        type="text" 
        id="owner" 
        name="owner" 
        value={pass.owner}
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

    <button type="submit" class="save-button" disabled={loading}>
      {loading ? 'Saving...' : 'Save Changes'}
    </button>
  </form>

  <div class="danger-zone">
    <h2>Danger Zone</h2>
    {#if !showDeleteConfirm}
      <button type="button" class="delete-button" on:click={toggleConfirm}>
        Delete Pass 
      </button>
    {:else}
      <p class="confirm-text">Are you sure? This cannot be undone.</p>
      <div class="confirm-buttons">
        <form method="POST" action="?/delete" use:enhance>
          <button type="submit" class="confirm-delete">Yes, Delete</button>
        </form>
        <button type="button" class="cancel-delete" on:click={cancelDelete}>
          Cancel 
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 60px 40px;
  }

  .back {
    display: inline-block;
    color: #666;
    text-decoration: none;
    font-size: 16px;
    margin-bottom: 40px;
    transition: color 0.2s;
  }

  .back:hover {
    color: #2563eb;
  }

  h1 {
    font-size: 48px;
    font-weight: 900;
    margin: 0 0 8px 0;
    color: #1a1a1a;
  }

  .subtitle {
    font-size: 18px;
    color: #666;
    margin: 0 0 40px 0;
  }

  form {
    background: white;
    border: 2px solid #e0e0e0;
    padding: 40px;
  }

  .form-group {
    margin-bottom: 24px;
  }

  label {
    display: block;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 8px;
    color: #1a1a1a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  input, select {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0e0e0;
    font-size: 16px;
    font-family: inherit;
    transition: border-color 0.2s;
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
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
  }

  .save-button:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .save-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .danger-zone {
    margin-top: 60px;
    padding: 32px;
    border: 2px solid #e0e0e0;
    background: white;
  }

  .danger-zone h2 {
    font-size: 14px;
    font-weight: 700;
    color: #666;
    margin: 0 0 16px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .delete-button {
    background: white;
    color: #ef4444;
    border: 2px solid #ef4444;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .delete-button:hover {
    background: #ef4444;
    color: white;
  }

  .confirm-text {
    color: #666;
    font-weight: 600;
    font-size: 14px;
    margin: 0 0 20px 0;
  }

  .confirm-buttons {
    display: flex;
    gap: 12px;
  }

  .confirm-buttons form {
    padding: 0;
    border: none;
    background: none;
  }

  .confirm-delete {
    background: #ef4444;
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
  }

  .confirm-delete:hover {
    background: #dc2626;
  }

  .cancel-delete {
    background: white;
    color: #1a1a1a;
    border: 2px solid #e0e0e0;
    padding: 10px 22px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-delete:hover {
    border-color: #1a1a1a;
  }
  @media (max-width: 768px) {
    .container {
      padding: 40px 20px;
    }

    h1 {
      font-size: 36px;
    }

    form, .danger-zone {
      padding: 24px;
    }
  }
</style>
