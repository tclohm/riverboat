import { test, expect } from '@playwright/test';

test.describe('Bookings E2E', () => {
  test('should redirect to login when accessing bookings without auth', async ({ page }) => {
    await page.goto('http://localhost:5173/bookings');
    await expect(page).toHaveURL(/login/);
  });
 });
