import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { FaidareHeaderComponent } from './faidare-header.component';

describe('FaidareHeaderComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  test('should display title and image', async () => {
    const fixture = TestBed.createComponent(FaidareHeaderComponent);
    await fixture.whenStable();

    const title = page.getByCss('h1');
    await expect.element(title).toHaveTextContent('FAIR Data-finder for Agronomic REsearch');
  });
});
