import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests/e2e',
  testMatch: '**/*.e2e.test.ts',

  // Test execution 
  fullyParallel: true,
  forbidOnly: process.env.CI ? true : false,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporting 
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/result.json' }],
    ['list'],
    ['junit', { outputFile: 'test-result/junit.xml'}],
  ],

  // Shared settings 
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    vide: 'retain-on-failure',
  },

  // Web server configuration 
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExisitingServer: !process.env.CI,
    env: {
      DATABASE_MOCK: 'true',
    },
    timeout: 120000,
  },

  // Browser configuration
  projects: [
  {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },  
  ],

  timeout: 30000,
  expect: {
    timeout: 5000,
  },
});
