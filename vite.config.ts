import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
  build: {
    rollupOptions: {
      external: ['better-sqlite3', 'src/lib/db/local']
    }
  },
  ssr: {
    external: ['better-sqlite3'],
    noExternal: []
  }
});
