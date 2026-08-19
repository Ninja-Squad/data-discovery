import { expect } from '@playwright/test';
import { test } from './utils';

const aggregations = [
  {
    name: 'entry',
    type: 'SMALL',
    buckets: [
      { key: 'Genome annotation', documentCount: 8090 },
      { key: 'Germplasm', documentCount: 1432 }
    ]
  },
  {
    name: 'coo',
    type: 'LARGE',
    buckets: [
      { key: 'France', documentCount: 1200 },
      { key: 'Germany', documentCount: 1100 },
      { key: 'Italy', documentCount: 1000 },
      { key: 'Spain', documentCount: 900 },
      { key: 'Belgium', documentCount: 800 },
      { key: 'Netherlands', documentCount: 700 },
      { key: 'Portugal', documentCount: 600 },
      { key: 'Switzerland', documentCount: 500 },
      { key: 'Austria', documentCount: 400 },
      { key: 'Ireland', documentCount: 300 }
    ]
  }
];

test('Search page should filter with small and large aggregations', async ({ page }) => {
  await page.route('**/api/search?*', route =>
    route.fulfill({
      json: {
        content: [],
        number: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        maxResults: 10_000
      }
    })
  );
  await page.route('**/api/aggregate?*', route => route.fulfill({ json: aggregations }));

  await page.goto('/search');

  const smallAggregation = page.locator('dd-small-aggregation').filter({ hasText: 'Data type' });
  const genomeAnnotation = smallAggregation.getByRole('checkbox', {
    name: /Genome annotation/
  });
  await expect(genomeAnnotation).toBeVisible();

  const largeAggregation = page
    .locator('dd-large-aggregation')
    .filter({ hasText: 'Country of origin' });
  const countryInput = largeAggregation.getByRole('combobox', {
    name: 'Filter on Country of origin...'
  });
  await expect(countryInput).toBeVisible();

  await genomeAnnotation.check();
  await expect(page).toHaveURL(/[?&]entry=Genome(?:%20|\+)annotation(?:&|$)/);
  await expect(genomeAnnotation).toBeChecked();

  await countryInput.fill('fran');
  await page.getByRole('option', { name: /France/ }).click();
  await expect(page).toHaveURL(/[?&]coo=France(?:&|$)/);
  await expect(largeAggregation.locator('.badge')).toContainText('France');
  await expect(genomeAnnotation).toBeChecked();
});
