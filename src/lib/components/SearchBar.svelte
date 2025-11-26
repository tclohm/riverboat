<script lang="ts">
  import DateRangePicker from './DateRangePicker.svelte';
  import { Search } from 'lucide-svelte';
  
  let guests = 1;
  let formattedDates = '';
  
  function handleSearch(e: Event) {
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const dates = formData.get('requestedDates') as string;
    
    if (!dates) {
      alert('Please select dates');
      return;
    }
    
    // Form will submit naturally to ?/search
    form.submit();
  }
</script>

<div class="search-container">
  <form method="POST" action="?/search" on:submit|preventDefault={handleSearch}>
    <div class="search-box">
      <div class="search-fields">
        <div class="field-group">
          <label for="dates">Check In - Check Out</label>
          <DateRangePicker />
        </div>
        
        <div class="field-group">
          <label for="guests">Guests</label>
          <div class="guest-input">
            <button 
              type="button" 
              class="guest-btn"
              on:click={() => guests > 1 && guests--}
              aria-label="Decrease guests"
            >
              −
            </button>
            <input 
              type="number" 
              id="guests"
              name="guests"
              bind:value={guests}
              min="1"
              max="99"
              readonly
            />
            <button 
              type="button" 
              class="guest-btn"
              on:click={() => guests < 99 && guests++}
              aria-label="Increase guests"
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      <button type="submit" class="search-button">
        <Search size={20} />
        <span>Search</span>
      </button>
    </div>
  </form>
</div>

<style>
  .search-container {
    width: 100%;
    margin: 0 0 48px 0;
  }

  form {
    width: 100%;
  }

  .search-box {
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    gap: 24px;
    align-items: flex-end;
    flex-wrap: wrap;
  }

  .search-fields {
    display: flex;
    gap: 24px;
    flex: 1;
    min-width: 400px;
    flex-wrap: wrap;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 200px;
  }

  label {
    font-size: 13px;
    font-weight: 600;
    color: #666;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .guest-input {
    display: flex;
    align-items: center;
    border: 1px solid #d0d0d0;
    border-radius: 6px;
    background: white;
    overflow: hidden;
  }

  .guest-btn {
    background: none;
    border: none;
    width: 40px;
    height: 44px;
    font-size: 20px;
    cursor: pointer;
    color: #666;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .guest-btn:hover {
    background: #f3f4f6;
    color: #2563eb;
  }

  #guests {
    flex: 1;
    border: none;
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    padding: 0 12px;
    min-width: 50px;
  }

  #guests:focus {
    outline: none;
  }

  .search-button {
    background: #2563eb;
    color: white;
    border: none;
    padding: 12px 32px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    white-space: nowrap;
    height: 44px;
  }

  .search-button:hover {
    background: #1d4ed8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  .search-button:active {
    transform: translateY(0);
  }

  @media (max-width: 1024px) {
    .search-box {
      flex-direction: column;
      align-items: stretch;
    }

    .search-fields {
      min-width: auto;
      width: 100%;
    }

    .field-group {
      width: 100%;
    }

    .search-button {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .search-box {
      padding: 16px;
      gap: 16px;
    }

    .search-fields {
      gap: 16px;
    }

    label {
      font-size: 12px;
    }

    .search-button {
      font-size: 14px;
      padding: 10px 20px;
    }
  }
</style>
