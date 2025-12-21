import { test, expect } from '@playwright/test';

test.describe('Auth E2E', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await expect(page).toHaveTitle(/Login/);
  });

  test('should load signup page', async ({ page }) => {
    await page.goto('http://localhost:5173/signup');
    await expect(page).toHaveTitle(/Create Account/);
  })

  test('should load home page', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page).toHaveTitle(/Willie/);
  });
});
