<script lang="ts">
  import { enhance } from '$app/forms';

  let loading = false;
</script>

<svelte:head>
  <title>List Your Pass - Willie's Keys</title>
</svelte:head>

<div class="container">
  <a href="/" class="back">← Back to listings</a>

  <h1>LIST YOUR PASS</h1>
  <p class="subtitle">Share your Magic Key with others</p>

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
      <label for="owner">Your name</label>
      <input 
        type="text"
        id="owner"
        name="owner"
        placeholder="Oswald the Lucky Rabbit"
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

  button {
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

  button:hover:not(:disabled) {
    background: #1d4ed8;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .container {
      padding: 40px 20px;
    }

    h1 {
      font-size: 36px;
    }

    form {
      padding: 24px;
    }
  }
</style>
