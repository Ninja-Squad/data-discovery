import { expect } from '@playwright/test';
import { test } from './utils';

test('Home page should display aggregations', async ({ page }) => {
  await page.route('**/api/aggregate?main=true', route => {
    return route.fulfill({
      json: [
        {
          name: 'tg',
          type: 'LARGE',
          buckets: [
            {
              key: 'NULL',
              documentCount: 21416
            }
          ]
        },
        {
          name: 'entry',
          type: 'LARGE',
          buckets: [
            {
              key: 'NULL',
              documentCount: 10000
            },
            {
              key: 'Genome annotation',
              documentCount: 8090
            },
            {
              key: 'Germplasm',
              documentCount: 1432
            }
          ]
        },
        {
          name: 'db',
          type: 'LARGE',
          buckets: [
            {
              key: 'GnpIS',
              documentCount: 5963
            },
            {
              key: 'CR-EST',
              documentCount: 5387
            }
          ]
        },
        {
          name: 'node',
          type: 'SMALL',
          buckets: [
            {
              key: 'IPK',
              documentCount: 10000
            },
            {
              key: 'INRAE-URGI',
              documentCount: 9355
            }
          ]
        }
      ]
    });
  });

  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('FAIR Data-finder for Agronomic REsearch');
  await expect(page.locator('dd-aggregations')).not.toContainText('Taxon group');
  await expect(page.locator('dd-aggregations')).not.toContainText('[21,416]');
  await expect(page.locator('dd-aggregations')).toContainText('Data type');
  await expect(page.locator('dd-aggregations')).toContainText('None');
  await expect(page.locator('dd-aggregations')).toContainText('Genome annotation');
  await expect(page.locator('dd-aggregations')).toContainText('[8,090]');
  await expect(page.locator('dd-aggregations')).toContainText('Germplasm');
  await expect(page.locator('dd-aggregations')).toContainText('[1,432]');
  await expect(page.locator('dd-aggregations')).toContainText('Database');
  await expect(page.locator('dd-aggregations')).toContainText('Data provider');
});
