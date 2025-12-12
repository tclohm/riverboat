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
  }} class="edit-form">
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
    <p>This action cannot be undone.</p>
    
    {#if !showDeleteConfirm}
      <button type="button" class="delete-button" on:click={toggleConfirm}>
        Delete This Pass
      </button>
    {:else}
      <div class="confirm-section">
        <p class="confirm-text">Are you absolutely sure? This will permanently delete your pass.</p>
        
        <div class="confirm-buttons">
          <button type="button" class="cancel-delete" on:click={cancelDelete}>
            Cancel
          </button>
          <form method="POST" action="?/delete" use:enhance>
            <button type="submit" class="confirm-delete">
              Yes, Delete Permanently
            </button>
          </form>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  :global(body) {
    background-color: #faf6f0;
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 16px;
  }

  .back {
    display: inline-block;
    color: #8b7355;
    text-decoration: none;
    font-size: 14px;
    margin-bottom: 32px;
    transition: color 0.2s;
  }

  .back:hover {
    color: #5a4a3a;
  }

  h1 {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 40px 0;
    color: #5a4a3a;
  }

  .edit-form {
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
    gap: 8px;
  }

  label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #5a4a3a;
  }

  input[type="text"],
  input[type="number"],
  select {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    font-size: 15px;
    font-family: 'Fredoka', sans-serif;
    background: #faf6f0;
    color: #5a4a3a;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  input[type="text"]::placeholder,
  input[type="number"]::placeholder {
    color: #a0937f;
  }

  input[type="text"]:focus,
  input[type="number"]:focus,
  select:focus {
    outline: none;
    border-color: #c85a54;
    box-shadow: 0 0 0 3px rgba(200, 90, 84, 0.1);
    background: #fff;
  }

  .save-button {
    width: 100%;
    background: #d9a574;
    color: white;
    border: 2px solid #8b7355;
    padding: 14px 16px;
    border-radius: 2px;
    font-size: 16px;
    font-weight: 700;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 8px;
  }

  .save-button:hover:not(:disabled) {
    background: #c85a54;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .save-button:active {
    transform: translateY(0);
  }

  /* Danger Zone */
  .danger-zone {
    background: rgba(200, 90, 84, 0.08);
    border: 2px solid #c85a54;
    border-radius: 2px;
    padding: 24px;
    margin-top: 48px;
  }

  .danger-zone h2 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 700;
    color: #c85a54;
  }

  .danger-zone p {
    margin: 0 0 16px 0;
    color: #8b7355;
    font-size: 14px;
  }

  .delete-button {
    background: white;
    color: #c85a54;
    border: 2px solid #c85a54;
    padding: 12px 24px;
    border-radius: 2px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }

  .delete-button:hover {
    background: #c85a54;
    color: white;
  }

  .confirm-section {
    margin-top: 16px;
  }

  .confirm-text {
    margin: 0 0 16px 0;
    color: #5a4a3a;
    font-weight: 600;
    font-size: 14px;
    line-height: 1.6;
  }

  .confirm-buttons {
    display: flex;
    gap: 12px;
  }

  .confirm-buttons form {
    margin: 0;
  }

  .cancel-delete,
  .confirm-delete {
    padding: 10px 20px;
    border-radius: 2px;
    font-weight: 600;
    font-size: 14px;
    font-family: 'Fredoka', sans-serif;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
  }

  .cancel-delete {
    background: white;
    color: #8b7355;
    border: 2px solid #d4c4b0;
  }

  .cancel-delete:hover {
    background: #d4c4b0;
    color: #5a4a3a;
  }

  .confirm-delete {
    background: #c85a54;
    color: white;
    border: 2px solid #8b7355;
  }

  .confirm-delete:hover {
    background: #b84a45;
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

    .confirm-buttons {
      flex-direction: column;
    }

    .cancel-delete,
    .confirm-delete {
      width: 100%;
    }
  }
</style>
