import { test, expect } from '@playwright/test';

test.describe('Passes E2E', () => {
  test('should load home and see passes grid', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('.passes-grid')).toBeVisible();
  });

  test('should have search bar', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('button:has-text("Search & Filter")')).toBeVisible();
  })
})
