<script lang="ts">
  import DateRangePicker from '$lib/components/DateRangePicker.svelte';
  import { X } from '@lucide/svelte';
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
        <div class="pass-actions">
          {#if data.user && isOwner}
            <a href="/pass/{data.pass.id}/edit" class="edit-button">Edit Pass</a>
          {:else if data.user && !isOwner}
            <button 
              class="contact-button" 
              on:click={() => showInquiryForm = true}
              on:keydown={(e) => e.key === 'Enter' && (showInquiryForm = true)}
            >
              Request This Pass
            </button>
        {:else}
          <a href="/login?returnTo=/pass/{data.pass.id}" class="login-button">Login to Request</a>
        {/if}
      </div>
    </div>
  </div>
</div>
</div>


{#if showInquiryForm && data.user && !isOwner}
  <div 
    class="modal-backdrop"
    on:click={() => showInquiryForm = false}
    on:keydown={(e) => e.key === 'Escape' && (showInquiryForm = false)}
    tabindex="0"
    role="button"
  >
    <div 
      class="modal-content" 
      on:click|stopPropagation
      role="presentation"
    >
      <h2>Request {data.pass.title}</h2>
      
      {#if formSuccess}
        <div class="success-message">
          <p>Your request has been sent to the owner. They will be notified and can contact you about using this pass.</p>
          <button 
            type="button" 
            class="close-button"
            on:click={() => {
              showInquiryForm = false;
              formSuccess = false;
            }}
          >
            Close
          </button>
        </div>
      {:else}
        <form 
          method="POST" 
          action="?/createInquiry"
          on:submit|preventDefault={async (e) => {
            formSubmitting = true;
            const formData = new FormData(e.target);
            try {
              const response = await fetch('?/createInquiry', {
                method: 'POST', 
                body: formData
              });
              if (response.ok) {
                formSuccess = true;
              }
            } catch (error) { 
              console.error('Failed to submut request:', error);
            } finally { 
              formSubmitting = false;
            }
          }}>
            <div class="form-group">
              <label for="requestedDates">When would you like to use this pass?</label>
              <DateRangePicker />
            </div>

          
            <div class="form-group">
              <label for="contactInfo">Preferred Contact Method</label>
              <input 
                type="text" 
                id="contactInfo" 
                name="contactInfo" 
                placeholder="e.g. Phone: 555-123-4567 or Email: name@example.com" 
                required
              />
            </div>
          
            <div class="form-group">
              <label for="message">Message to the Owner</label>
              <textarea 
                id="message" 
                name="message" 
                rows="4" 
                placeholder="Introduce yourself and provide any additional details about your request." 
                required
              ></textarea>
            </div>
          
            <input type="hidden" name="passId" value={data.pass.id} />
            <input type="hidden" name="receiverUserId" value={data.pass.userId} />
          
            <div class="form-actions">
              <button 
                type="button" 
                class="cancel-button"
                on:click={() => showInquiryForm = false}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="submit-button"
                disabled={formSubmitting}
              >
                {formSubmitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        {/if}

        <button 
        type="button" 
        class="close-modal-btn"
        on:click={() => {
          showInquiryForm = false;
          formSuccess = false;
        }}
        aria-label="Close modal"
      >
        <X />
      </button>
    </div>
  </div>
{/if}

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

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 40px 60px;
    width: 90%;
    max-width: 500px;
    position: relative;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-content h2 {
    margin-top: 0;
    margin-bottom: 24px;
    font-size: 24px;
    color: #1a1a1a;
  }
  
  .close-modal-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  }

  .close-modal-btn:hover {
    background: #fff;
    color: #333;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }
  
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    font-family: inherit;
  }
  
  .form-group textarea {
    resize: vertical;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }
  
  .cancel-button,
  .close-button {
    padding: 10px 16px;
    background: #f3f4f6;
    color: #4b5563;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .cancel-button:hover,
  .close-button:hover {
    background: #e5e7eb;
  }
  
  .submit-button {
    padding: 10px 20px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .submit-button:hover:not(:disabled) {
    background: #1d4ed8;
  }
  
  .submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .success-message {
    background: #d1fae5;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .success-message p {
    color: #047857;
    margin: 0 0 16px 0;
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
