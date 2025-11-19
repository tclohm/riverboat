<script>
  export let data;
</script>

<main class="admin-main">
  <slot />
</main>

<style>
  .admin-main {
    min-height: 100vh;
    background: #f5f5f5;
  }
</style>
