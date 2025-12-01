<script lang="ts">
  import { enhance } from '$app/forms';
  
  export let data;
  
  let loading = false;
</script>

<svelte:head>
  <title>List Your Pass - Willie's Keys</title>
</svelte:head>

<div class="container"> 
  <h1>List Your Pass</h1>

  <form method="POST" action="?/create" use:enhance={() => {
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
      <label for="name">Your Name</label>
      <input 
        type="text" 
        id="name" 
        value={data.user.name}
        disabled
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
  :global(.main-content) {
    max-width: 100%;
    padding: 0;
  }
</style>
