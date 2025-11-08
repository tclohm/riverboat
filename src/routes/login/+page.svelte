<script lang="ts">
  import { enhance } from '$app/forms';
  
  let loading = false;
  let error = '';
</script>

<svelte:head>
  <title>Login - Willie's Keys</title>
</svelte:head>

<div class="container">
  <h1>Login</h1>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <form method="POST" use:enhance={() => {
    loading = true;
    error = '';
    return async ({ result, update }) => {
      loading = false;
      if (result.type === 'failure') {
        error = result.data?.error || 'Login failed';
      }
      await update();
    };
  }}>
    <div class="form-group">
      <label for="email">Email</label>
      <input 
        type="email" 
        id="email" 
        name="email" 
        required
      />
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input 
        type="password" 
        id="password" 
        name="password" 
        required
      />
    </div>

    <button type="submit" disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  </form>

  <p class="footer-text">
    Don't have an account? <a href="/signup">Create account.</a>
  </p>
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

  h1 {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 40px 0;
    color: #1a1a1a;
  }

  .error {
    background: #fef2f2;
    border: 1px solid #ef4444;
    color: #991b1b;
    padding: 12px;
    margin-bottom: 24px;
    border-radius: 8px;
    font-size: 14px;
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

  input {
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

  input:focus {
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

  .footer-text {
    text-align: center;
    margin-top: 24px;
    color: #999;
    font-size: 14px;
  }

  .footer-text a {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
  }

  .footer-text a:hover {
    text-decoration: underline;
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
