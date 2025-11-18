<script lang="ts">
  export let data;
  const { pass } = data;
  const isOwner = data.user && data.pass.userId == data.user.id;

  let showInquiryForm = false;
  let formSubmitting = false;
  let formSuccess = false;
</script>

<svelte:head>
  <title>{pass.title} - Willie's Keys</title>
</svelte:head>

<div class="container">
  <div class="top-nav">
    <a href="/" class="back">← Back</a>
    {#if isOwner}
    <a href="/pass/{pass.id}/edit" class="edit-button">Edit Pass</a> 
    {/if}
  </div>
  <div class="detail">
    <div class="info">
      <h1>{pass.passType}</h1>
      <p class="owner">Hosted by {pass.owner}</p>
      
      <div class="section">
        <h2>Available Dates</h2>
        <p>{pass.availableDates}</p>
      </div>
    </div>
    
    <div class="booking">
      <div class="price-box">
        <div class="price">${pass.price}<span>/day</span></div>
        {#if data.user && !isOwner}
          <button>Request Booking</button>
        {:else}
          <a href="/login?returnTo=/pass/{data.pass.id}" class="login-button">Login to Book</a>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
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

  .detail {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 80px;
  }

  .info h1 {
    font-size: 48px;
    font-weight: 900;
    margin: 0 0 16px 0;
    color: #1a1a1a;
  }

  .owner {
    font-size: 20px;
    color: #666;
    margin: 0 0 40px 0;
  }

  .section {
    margin-bottom: 40px;
  }

  .section h2 {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 12px 0;
    color: #1a1a1a;
  }

  .section p {
    font-size: 18px;
    color: #666;
    margin: 0;
  }

  .booking {
    position: sticky;
    top: 40px;
    height: fit-content;
  }

  .price-box {
    background: white;
    border: 2px solid #e0e0e0;
    padding: 32px;
  }

  .price {
    font-size: 48px;
    font-weight: 900;
    color: #2563eb;
    margin: 0 0 24px 0;
  }

  .price span {
    font-size: 24px;
    font-weight: 400;
    color: #666;
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

  button:hover {
    background: #1d4ed8;
  }

  .top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
  }

  .edit-button {
    background-color: #2563eb; 
    color: white;
    padding: 10px 20px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: background-color 0.2s;
  }

  .edit-button:hover {
    background-color: #1d4ed8;
  }

  @media (max-width: 968px) {
    .detail {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .booking {
      position: static;
    }
  }
</style>
