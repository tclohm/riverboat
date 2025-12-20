import { test, expect } from '@playwright/test';

test.describe('Bookings E2E', () => {

  test('should redirect to login when accessing bookings without auth', async ({ page }) => {
    await page.goto('http://localhost:5173/bookings');
    await expect(page).toHaveURL(/login/);
  });

  test('should login', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/admin/);
  });

  test('should load profile when logged in', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('http://localhost:5173/profile');
    await expect(page).toHaveTitle(/Profile/);
  });

  test('should load profile page when logged in', async ({ page }) => {
    await page.context().addCookies([{
      name: 'session',
      value: 'test-token',
      url: 'http://localhost:5173'
    }]);
    
    await page.goto('http://localhost:5173/profile');
    await expect(page).toHaveTitle(/Profile/);
  });

});
