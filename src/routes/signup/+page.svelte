<script lang="ts">
  export let data;
  export let form;
</script>

<svelte:head>
  <title>Create Account - Willie's Keys</title>
</svelte:head>

<div class="container">
  <div class="signup-box">
    <div class="signup-header">
      <h1>Create Account</h1>
      <p>Join Willie's Keys community</p>
    </div>

    {#if form?.error}
      <div class="error">{form.error}</div>
    {/if}

    <form method="POST">
      <input type="hidden" name="returnTo" value={form?.returnTo || data.returnTo || '/'} />

      <div class="name-row">
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input 
            type="text" 
            id="firstName" 
            name="firstName" 
            placeholder="John"
            required
          />
        </div>

        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input 
            type="text" 
            id="lastName" 
            name="lastName" 
            placeholder="Doe"
            required
          />
        </div>
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
        <span class="password-hint">Must be at least 8 characters</span>
      </div>

      <button type="submit" class="submit-btn">
        Create Account
      </button>
    </form>

    <div class="divider"></div>

    <p class="footer-text">
      Already have an account? <a href="/login?returnTo={data.returnTo}">Login here</a>
    </p>
  </div>
</div>

<style>
  :global(body) {
    background-color: #faf6f0;
  }

  .container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .signup-box {
    background: #e8dcc8;
    border: 2px solid #8b7355;
    border-radius: 2px;
    padding: 40px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .signup-header {
    margin-bottom: 32px;
    text-align: center;
  }

  .signup-header h1 {
    margin: 0 0 8px 0;
    font-size: 32px;
    font-weight: 700;
    color: #5a4a3a;
    font-family: 'Fredoka', sans-serif;
  }

  .signup-header p {
    margin: 0;
    font-size: 14px;
    color: #8b7355;
    font-family: 'Fredoka', sans-serif;
  }

  .error {
    background: rgba(200, 90, 84, 0.15);
    border: 2px solid #c85a54;
    color: #8b4545;
    padding: 12px 16px;
    margin-bottom: 24px;
    border-radius: 2px;
    font-size: 14px;
    font-weight: 500;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .name-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
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
    font-family: 'Fredoka', sans-serif;
  }

  input[type="text"],
  input[type="email"],
  input[type="password"] {
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
  input[type="email"]::placeholder,
  input[type="password"]::placeholder {
    color: #a0937f;
  }

  input[type="text"]:focus,
  input[type="email"]:focus,
  input[type="password"]:focus {
    outline: none;
    border-color: #c85a54;
    box-shadow: 0 0 0 3px rgba(200, 90, 84, 0.1);
    background: #fff;
  }

  .password-hint {
    font-size: 12px;
    color: #8b7355;
    font-family: 'Fredoka', sans-serif;
    margin-top: 4px;
  }

  .submit-btn {
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
    transition: all 0.2s ease;
    margin-top: 8px;
  }

  .submit-btn:hover {
    background: #c85a54;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .submit-btn:active {
    transform: translateY(0);
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #d4c4b0, transparent);
    margin: 24px 0;
    opacity: 0.6;
  }

  .footer-text {
    text-align: center;
    margin: 0;
    color: #8b7355;
    font-size: 14px;
    font-family: 'Fredoka', sans-serif;
  }

  .footer-text a {
    color: #c85a54;
    text-decoration: none;
    font-weight: 700;
    transition: color 0.2s;
  }

  .footer-text a:hover {
    color: #5a4a3a;
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    .signup-box {
      padding: 24px;
    }

    .signup-header h1 {
      font-size: 28px;
    }

    .signup-header p {
      font-size: 13px;
    }

    .name-row {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    form {
      gap: 16px;
    }
  }
</style>
