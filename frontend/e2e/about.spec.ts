import { expect } from '@playwright/test';
import { test } from './utils';

test('About page should display markdown file in assets', async ({ page }) => {
  await page.goto('/faidare-dev/about');
  await expect(page.locator('h1')).toHaveText('About this data portal');
});
