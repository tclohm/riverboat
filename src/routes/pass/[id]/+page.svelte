<script lang="ts">
  import Calendar from '$lib/components/Calendar.svelte';
  import InteractiveCalendar from '$lib/components/InteractiveCalendar.svelte';
  import { X } from '@lucide/svelte';
  export let data;
  const { pass } = data;
  const isOwner = data.user && data.pass.userId == data.user.id;

  let showInquiryForm = false;
  let formSubmitting = false;
  let formSuccess = false;
  let selectedDateRange = '';

  function handleDateRangeSelect(startDate: string, endDate: string) {
    selectedDateRange = `${startDate} - ${endDate}`;
  }
</script>

<svelte:head>
  <title>{pass.title} - Willie's Keys</title>
</svelte:head>

<div class="container">
  <div class="top-nav">
    <a href="/" class="back">← Back</a>
  </div>

  <div class="detail">
    <div class="info">
      <h1>{pass.passType}</h1>
      <p class="owner">Hosted by {pass.ownerName}</p>
      
      <div class="section">
        <h2>Available Dates</h2>
        <p>{pass.availableDates}</p>
      </div>

      <div class="section">
        <h2>About This Pass</h2>
        <p>This is a wonderful opportunity to experience something special. Contact the host to learn more and discuss your specific needs.</p>
      </div>
    </div>
    
    <div class="booking">
      <div class="price-box">
        <div class="price">${pass.price}<span>/day</span></div>
        <div class="pass-actions">
          {#if data.user && isOwner}
            <a href="/pass/{data.pass.id}/edit" class="edit-button-full">Edit Pass</a>
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
        <Calendar />
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
      <div class="modal-header">
        <h2>Request {data.pass.title}</h2>
        <button
          type="button"
          class="modal-close"
          on:click={() => showInquiryForm = false}
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>
      
      {#if formSuccess}
        <div class="success-message">
          <p>✓ Your request has been sent! The owner will review and contact you soon.</p>
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
              console.error('Failed to submit request:', error);
            } finally { 
              formSubmitting = false;
            }
          }}>
          
          <div class="modal-body">
            <div class="form-group">
              <label for="requestedDates">When would you like to use this pass?</label>
              <InteractiveCalendar onDateRangeSelect={handleDateRangeSelect} />
            </div>

            <div class="form-group">
              <label for="contactInfo">Preferred Contact Method</label>
              <input 
                type="text" 
                id="contactInfo" 
                name="contactInfo" 
                placeholder="Phone or Email" 
                required
              />
            </div>
          
            <div class="form-group">
              <label for="message">Message to the Host</label>
              <textarea 
                id="message" 
                name="message" 
                rows="4" 
                placeholder="Tell them about yourself..." 
                required
              ></textarea>
            </div>
          </div>
        
          <input type="hidden" name="passId" value={data.pass.id} />
          <input type="hidden" name="receiverUserId" value={data.pass.userId} />
          <input type="hidden" name="requestedDates" value={selectedDateRange} />
        
          <div class="modal-footer">
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
    </div>
  </div>
{/if}

<style>
  .back {
    display: inline-block;
    color: #8b7355;
    text-decoration: none;
    font-size: 16px;
    margin-bottom: 40px;
    transition: color 0.2s;
  }

  .back:hover {
    color: #5a4a3a;
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
    color: #5a4a3a;
  }

  .owner {
    font-size: 20px;
    color: #8b7355;
    margin: 0 0 40px 0;
  }

  .section {
    margin-bottom: 40px;
  }

  .section h2 {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 12px 0;
    color: #5a4a3a;
  }

  .section p {
    font-size: 18px;
    color: #8b7355;
    margin: 0;
    line-height: 1.6;
  }

  .booking {
    position: sticky;
    top: 40px;
    height: fit-content;
  }

  .price-box {
    background: #e8dcc8;
    border: 2px solid #8b7355;
    padding: 32px;
    border-radius: 2px;
  }

  .price {
    font-size: 48px;
    font-weight: 900;
    color: #d9a574;
    margin: 0 0 24px 0;
  }

  .price span {
    font-size: 24px;
    font-weight: 400;
    color: #8b7355;
  }

  .pass-actions {
    display: flex;
    flex-direction: column;
  }

  .contact-button,
  .login-button,
  .edit-button,
  .edit-button-full {
    width: 100%;
    background: #d9a574;
    color: white;
    border: 2px solid #8b7355;
    padding: 16px;
    font-size: 16px;
    font-weight: 700;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 2px;
    text-decoration: none;
    text-align: center;
  }

  .contact-button:hover,
  .login-button:hover,
  .edit-button:hover,
  .edit-button-full:hover {
    background: #c85a54;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .contact-button:active,
  .login-button:active,
  .edit-button:active,
  .edit-button-full:active {
    transform: translateY(0);
  }

  .top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
  }

  .edit-button {
    background-color: #d9a574;
    color: white;
    padding: 10px 20px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    border: 2px solid #8b7355;
    border-radius: 2px;
    transition: all 0.2s;
  }

  .edit-button:hover {
    background-color: #c85a54;
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
    background: #e8dcc8;
    border: 2px solid #8b7355;
    border-radius: 2px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 2px solid #d4c4b0;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 24px;
    color: #5a4a3a;
  }

  .modal-close {
    background: none;
    border: none;
    color: #8b7355;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }

  .modal-close:hover {
    color: #5a4a3a;
  }
  
  .modal-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .form-group label {
    display: block;
    font-weight: 600;
    color: #5a4a3a;
    font-size: 14px;
  }
  
  .form-group input,
  .form-group textarea {
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

  .form-group input::placeholder,
  .form-group textarea::placeholder {
    color: #a0937f;
  }
  
  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #c85a54;
    box-shadow: 0 0 0 3px rgba(200, 90, 84, 0.1);
    background: #fff;
  }
  
  .form-group textarea {
    resize: vertical;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 2px solid #d4c4b0;
  }
  
  .submit-button,
  .cancel-button {
    padding: 10px 20px;
    border-radius: 2px;
    font-weight: 600;
    cursor: pointer;
    border: 2px solid #8b7355;
    font-family: 'Fredoka', sans-serif;
    transition: all 0.2s;
  }
  
  .submit-button {
    background: #d9a574;
    color: white;
  }
  
  .submit-button:hover:not(:disabled) {
    background: #c85a54;
  }
  
  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cancel-button {
    background: #d4c4b0;
    color: #5a4a3a;
  }

  .cancel-button:hover {
    background: #c85a54;
    color: white;
  }
  
  .success-message {
    padding: 40px;
    background: rgba(139, 168, 129, 0.1);
    border-radius: 2px;
    margin: 24px;
    text-align: center;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .success-message p {
    color: #5a7a4a;
    font-size: 16px;
    line-height: 1.6;
    margin: 0 0 24px 0;
  }

  .close-button {
    background: #8fa881;
    color: white;
    border: 2px solid #6b7d60;
    padding: 12px 32px;
    border-radius: 2px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    margin: 0 auto;
  }

  .close-button:hover {
    background: #7a8a6f;
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

  @media (max-width: 968px) {
    .detail {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .booking {
      position: static;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 0 16px;
    }

    .top-nav {
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .back {
      margin-bottom: 0;
    }

    .edit-button {
      width: 100%;
      text-align: center;
      padding: 12px;
    }

    .info h1 {
      font-size: 28px;
      margin-bottom: 12px;
    }

    .owner {
      font-size: 16px;
      margin-bottom: 24px;
    }

    .section {
      margin-bottom: 32px;
    }

    .section h2 {
      font-size: 20px;
    }

    .section p {
      font-size: 15px;
    }

    .booking {
      position: static;
    }

    .price-box {
      padding: 24px;
    }

    .price {
      font-size: 40px;
      margin-bottom: 20px;
    }

    .price span {
      font-size: 20px;
    }

    .contact-button,
    .login-button {
      width: 100%;
      padding: 14px;
      font-size: 16px;
    }

    .modal-backdrop {
      padding: 16px;
    }

    .modal-content {
      width: 100%;
      max-width: 100%;
      padding: 24px;
      border-radius: 2px;
      max-height: 90vh;
    }

    .modal-content h2 {
      font-size: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      font-size: 13px;
      margin-bottom: 6px;
    }

    .form-group input,
    .form-group textarea {
      font-size: 14px;
      padding: 10px 12px;
    }

    .form-actions {
      flex-direction: column;
      gap: 8px;
      margin-top: 20px;
    }

    .cancel-button,
    .submit-button {
      width: 100%;
      padding: 12px 16px;
      font-size: 15px;
    }
  }

  @media (max-width: 480px) {
    .info h1 {
      font-size: 24px;
    }

    .owner {
      font-size: 14px;
    }

    .section h2 {
      font-size: 18px;
    }

    .section p {
      font-size: 13px;
    }

    .price {
      font-size: 32px;
    }

    .price span {
      font-size: 16px;
    }

    .modal-content {
      padding: 20px;
    }

    .modal-content h2 {
      font-size: 18px;
    }

    .success-message {
      padding: 32px 20px;
    }

    .success-message p {
      font-size: 14px;
    }

    .close-button {
      width: 100%;
      padding: 12px 16px;
    }
  }
</style>
