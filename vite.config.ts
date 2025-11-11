import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		external: ['better-sqlite3']
	},
  build: {
    target: 'es2022',
  },
  optimizeDeps: {
    include: ['@libsql/client', 'bcryptjs', 'drizzle-orm'],
    exclude: ['better-sqlite3']
  }
});
