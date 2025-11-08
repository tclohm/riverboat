<script lang="ts">
  import { enhance } from '$app/forms';
  
  let loading = false;
</script>

<svelte:head>
  <title>List Your Pass - Willie's Keys</title>
</svelte:head>

<div class="container">
  <a href="/" class="back">← Back to listings</a>
  
  <h1>List Your Pass</h1>

  <form method="POST" use:enhance={() => {
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
        placeholder="Magic Key - Dream Pass"
        required
      />
    </div>

    <div class="form-group">
      <label for="owner">Your Name</label>
      <input 
        type="text" 
        id="owner" 
        name="owner" 
        placeholder="Sarah M."
        required
      />
    </div>

    <div class="form-group">
      <label for="passType">Pass Type</label>
      <select id="passType" name="passType" required>
        <option value="">Select pass type</option>
        <option value="Dream Key">Dream Key</option>
        <option value="Inspire Key">Inspire Key</option>
        <option value="Enchant Key">Enchant Key</option>
        <option value="Believe Key">Believe Key</option>
      </select>
    </div>

    <div class="form-group">
      <label for="price">Price per day ($)</label>
      <input 
        type="number" 
        id="price" 
        name="price" 
        placeholder="85"
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
        placeholder="Nov 15-20, Dec 5-10"
        required
      />
    </div>

    <button type="submit" disabled={loading}>
      {loading ? 'Adding...' : 'List Pass'}
    </button>
  </form>
</div>

<style>
  :global(body) {
    background-color: #f5f5f5;
  }

  .container {
    max-width: 500px;
    margin: 80px auto;
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

  button {
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

  button:hover:not(:disabled) {
    background: #1d4ed8;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .container {
      margin: 40px auto;
    }

    h1 {
      font-size: 28px;
    }
  }
</style>
