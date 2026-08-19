import { expect } from '@playwright/test';
import { test } from './utils';

const ontologyTree = [
  {
    payload: { type: 'ONTOLOGY', id: 'CO_357' },
    children: [
      {
        payload: { type: 'TRAIT_CLASS', id: 'biochemical' },
        children: [
          {
            payload: { type: 'TRAIT', id: 'CO_357:1000197' },
            children: [{ payload: { type: 'VARIABLE', id: 'CO_357:0000001' } }]
          }
        ]
      }
    ]
  }
];

const englishTreeI18n = {
  language: 'EN',
  names: {
    ONTOLOGY: { CO_357: 'Woody Plant Ontology' },
    TRAIT_CLASS: { biochemical: 'Biochemical' },
    TRAIT: { 'CO_357:1000197': 'Dissolved oxygen content' },
    VARIABLE: { 'CO_357:0000001': 'Dissolved oxygen concentration variable' }
  }
};

const frenchTreeI18n = {
  ...englishTreeI18n,
  language: 'FR',
  names: {
    ...englishTreeI18n.names,
    TRAIT: { 'CO_357:1000197': 'Teneur en oxygène dissous' }
  }
};

test('Ontology page should preserve the expanded tree while changing language', async ({
  page
}) => {
  await page.route('**/api/ontologies', route => route.fulfill({ json: ontologyTree }));
  await page.route('**/api/ontologies/i18n?language=EN', route =>
    route.fulfill({ json: englishTreeI18n })
  );

  let frenchRequestStarted!: () => void;
  const frenchRequest = new Promise<void>(resolve => (frenchRequestStarted = resolve));
  let releaseFrenchResponse!: () => void;
  const frenchResponse = new Promise<void>(resolve => (releaseFrenchResponse = resolve));
  await page.route('**/api/ontologies/i18n?language=FR', async route => {
    frenchRequestStarted();
    await frenchResponse;
    await route.fulfill({ json: frenchTreeI18n });
  });

  await page.goto('/ontology');

  const language = page.getByRole('combobox', { name: 'Language' });
  await language.selectOption({ label: 'English' });
  await page.getByRole('button', { name: 'Expand Woody Plant Ontology' }).click();
  await page.getByRole('button', { name: 'Expand Biochemical' }).click();

  const englishTrait = page.getByRole('button', { name: 'Dissolved oxygen content Trait' });
  await expect(englishTrait).toBeVisible();

  await language.selectOption({ label: 'Français' });
  await frenchRequest;

  await expect(englishTrait).toBeVisible();
  await expect(page.getByRole('button', { name: 'Collapse Woody Plant Ontology' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Collapse Biochemical' })).toBeVisible();

  releaseFrenchResponse();

  await expect(page.getByRole('button', { name: 'Teneur en oxygène dissous Trait' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Collapse Woody Plant Ontology' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Collapse Biochemical' })).toBeVisible();
});
