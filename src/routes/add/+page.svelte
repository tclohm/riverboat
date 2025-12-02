<script lang="ts">
  import { enhance } from '$app/forms';
  
  export let data;
  
  let loading = false;
</script>

<svelte:head>
  <title>List Your Pass - Willie's Keys</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
    <h1 class="text-3xl font-fredoka font-bold text-gray-900 mb-8">List Your Pass</h1>
    
    <form method="POST" action="?/create" use:enhance={() => {
      loading = true;
      return async ({ result, update }) => {
        loading = false;
        await update();
      };
    }} class="space-y-6">
      
      <!-- Pass Title -->
      <div>
        <label for="title" class="block text-sm font-semibold text-gray-700 mb-2">Pass Title</label>
        <input 
          type="text" 
          id="title" 
          name="title" 
          placeholder="Magic Key - Dream Pass"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      <!-- Your Name (disabled) -->
      <div>
        <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
        <input 
          type="text" 
          id="name" 
          value={data.user.name}
          disabled
          class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
        />
      </div>

      <!-- Pass Type -->
      <div>
        <label for="passType" class="block text-sm font-semibold text-gray-700 mb-2">Pass Type</label>
        <select 
          id="passType" 
          name="passType" 
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
        >
          <option value="">Select pass type</option>
          <option value="Dream Key">Dream Key</option>
          <option value="Inspire Key">Inspire Key</option>
          <option value="Enchant Key">Enchant Key</option>
          <option value="Believe Key">Believe Key</option>
        </select>
      </div>

      <!-- Price -->
      <div>
        <label for="price" class="block text-sm font-semibold text-gray-700 mb-2">Price per day ($)</label>
        <input 
          type="number" 
          id="price" 
          name="price" 
          placeholder="85"
          min="1"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      <!-- Available Dates -->
      <div>
        <label for="availableDates" class="block text-sm font-semibold text-gray-700 mb-2">Available Dates</label>
        <input 
          type="text" 
          id="availableDates" 
          name="availableDates" 
          placeholder="Nov 15-20, Dec 5-10"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        disabled={loading}
        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200"
      >
        {loading ? 'Adding...' : 'List Pass'}
      </button>
    </form>
  </div>
</div>
