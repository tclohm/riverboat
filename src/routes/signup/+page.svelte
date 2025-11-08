<script lang="ts">
  import { enhance } from '$app/forms';
  
  let loading = false;
  let error = '';
</script>

<svelte:head>
  <title>Sign Up - Willie's Keys</title>
</svelte:head>

<div class="container">
  <a href="/" class="back">← Back to home</a>
  
  <h1>SIGN UP</h1>
  <p class="subtitle">Create an account to list your passes</p>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <form method="POST" use:enhance={() => {
    loading = true;
    error = '';
    return async ({ result, update }) => {
      loading = false;
      if (result.type === 'failure') {
        error = result.data?.error || 'Signup failed';
      }
      await update();
    };
  }}>
    <div class="form-group">
      <label for="name">Name</label>
      <input 
        type="text" 
        id="name" 
        name="name" 
        placeholder="Sarah M."
        required
      />
    </div>

    <div class="form-group">
      <label for="email">Email</label>
      <input 
        type="email" 
        id="email" 
        name="email" 
        placeholder="you@example.com"
        required
      />
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input 
        type="password" 
        id="password" 
        name="password" 
        placeholder="••••••••"
        minlength="8"
        required
      />
    </div>

    <button type="submit" disabled={loading}>
      {loading ? 'Creating account...' : 'Sign Up'}
    </button>
  </form>

  <p class="footer-text">
    Already have an account? <a href="/login">Log in</a>
  </p>
</div>

<style>
  .container {
    max-width: 450px;
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

  .error {
    background: #fef2f2;
    border: 2px solid #ef4444;
    color: #991b1b;
    padding: 12px;
    margin-bottom: 24px;
    font-weight: 600;
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

  input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0e0e0;
    font-size: 16px;
    font-family: inherit;
    transition: border-color 0.2s;
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

  .footer-text {
    text-align: center;
    margin-top: 24px;
    color: #666;
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
