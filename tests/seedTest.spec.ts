import { test } from '@playwright/test';

test('seed', async ({ page }) => {
  await page.goto('https://your-app-url');
});