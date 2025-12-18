import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  ssr: { external: ['better-sqlite3'] },
  build: { target: 'es2022' },
  optimizeDeps: {
    include: ['@libsql/client', 'bcryptjs', 'drizzle-orm'],
    exclude: ['better-sqlite3']
  },
  test: {
    // unit config 
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/unit/setup.ts'],
    include: ['src/**/*.unit.test.ts'],
    exclude: ['node_modules', 'build', '.svelte-kit', 'src/**/*.e2e.test.ts'],

    // coverage setting - critical code 
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json', 'html'],
      all: false,
      lines: 80,
      functions: 80,
      branches: 75, 
      statements: 80,
      exclude: [
        'node_modules/',
        'src/tests/',
        'src/**/*.e2e.test.ts',
        '**/*.svelte',
        '**/*.d.ts',
        '**/*.config',
        'src/routes/**',
        'build/',
        '.svelte-kit/'
      ]
    },

    // Faster test execution 
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, './src/lib'),
      $app: path.resolve(__dirname, './.svelte-kit/runtime/app'),
    }
  }
});
