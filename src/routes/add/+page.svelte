<script lang="ts">
  import { enhance } from '$app/forms';
  
  export let data;
  
  let loading = false;
</script>

<svelte:head>
  <title>List Your Pass - Willie's Keys</title>
</svelte:head>

<div class="container">
  <header>
    <div class="header-content">
      <h1>List Your Pass</h1>
      <p>Share your magic key and start earning</p>
    </div>
  </header>

  <form method="POST" action="?/create" use:enhance={() => {
    loading = true;
    return async ({ result, update }) => {
      loading = false;
      await update();
    };
  }} class="add-form">
    
    <div class="form-grid">
      <!-- Pass Title -->
      <div class="form-group full-width">
        <label for="title">Pass Title</label>
        <input 
          type="text" 
          id="title" 
          name="title" 
          placeholder="e.g., Magic Key - Dream Pass"
          required
        />
        <p class="field-hint">Give your pass a catchy, descriptive name</p>
      </div>

      <!-- Pass Type -->
      <div class="form-group">
        <label for="passType">Pass Type</label>
        <select 
          id="passType" 
          name="passType" 
          required
        >
          <option value="">Select pass type</option>
          <option value="Dream Key">Dream Key</option>
          <option value="Inspire Key">Inspire Key</option>
          <option value="Enchant Key">Enchant Key</option>
          <option value="Believe Key">Believe Key</option>
        </select>
      </div>

      <!-- Price -->
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
        <p class="field-hint">Set your daily rate</p>
      </div>

      <!-- Your Name (disabled) -->
      <div class="form-group">
        <label for="name">Your Name</label>
        <input 
          type="text" 
          id="name" 
          value={data.user.name}
          disabled
          class="readonly"
        />
        <p class="field-hint">Auto-filled from your profile</p>
      </div>
    </div>

    <!-- Info Box -->
    <div class="info-box">
      <h3>Tips for Success</h3>
      <ul>
        <li>Choose a descriptive title that highlights what makes your pass special</li>
        <li>Set a competitive price based on similar passes in your area</li>
      </ul>
    </div>

    <!-- Submit Button -->
    <button 
      type="submit" 
      disabled={loading}
      class="submit-button"
    >
      {loading ? 'Creating Pass...' : 'List Pass'}
    </button>
  </form>

  <!-- Already listed link -->
  <div class="footer-link">
    <p>Already have passes listed? <a href="/admin">View my passes</a></p>
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

  header {
    margin-bottom: 40px;
    padding-bottom: 24px;
    border-bottom: 2px solid #d4c4b0;
  }

  .header-content h1 {
    margin: 0 0 8px 0;
    font-size: 32px;
    font-weight: 700;
    color: #5a4a3a;
  }

  .header-content p {
    margin: 0;
    color: #8b7355;
    font-size: 14px;
  }

  .add-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 40px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group.full-width {
    grid-column: 1 / -1;
  }

  label {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: #5a4a3a;
  }

  input[type="text"],
  input[type="number"],
  select {
    padding: 12px 16px;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    font-size: 15px;
    font-family: 'Fredoka', sans-serif;
    background: white;
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

  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
  }

  input.readonly {
    background: #e8dcc8;
    cursor: not-allowed;
    color: #8b7355;
    border-color: #d4c4b0;
  }

  select {
    cursor: pointer;
    background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b7355' d='M6 9L1 4h10z'/%3E%3C/svg%3E") no-repeat right 12px center;
    padding-right: 36px;
    appearance: none;
  }

  .field-hint {
    margin: 0;
    font-size: 12px;
    color: #a0937f;
    font-style: italic;
  }

  /* Info Box */
  .info-box {
    background: #e8dcc8;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    padding: 20px;
  }

  .info-box h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 700;
    color: #5a4a3a;
  }

  .info-box ul {
    margin: 0;
    padding-left: 20px;
    list-style: none;
  }

  .info-box li {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #8b7355;
    line-height: 1.5;
    position: relative;
    padding-left: 12px;
  }

  .info-box li:before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #d9a574;
    font-weight: 700;
  }

  .info-box li:last-child {
    margin-bottom: 0;
  }

  /* Submit Button */
  .submit-button {
    background: #d9a574;
    color: white;
    border: 2px solid #8b7355;
    padding: 16px;
    border-radius: 2px;
    font-size: 18px;
    font-weight: 700;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 8px;
  }

  .submit-button:hover:not(:disabled) {
    background: #c85a54;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .submit-button:active {
    transform: translateY(0);
  }

  /* Footer Link */
  .footer-link {
    text-align: center;
    padding-top: 24px;
    border-top: 2px solid #d4c4b0;
  }

  .footer-link p {
    margin: 0;
    font-size: 14px;
    color: #8b7355;
  }

  .footer-link a {
    color: #d9a574;
    text-decoration: none;
    font-weight: 700;
    transition: color 0.2s;
  }

  .footer-link a:hover {
    color: #c85a54;
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .container {
      padding: 0 16px;
    }

    .header-content h1 {
      font-size: 28px;
    }

    .form-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
</style>
