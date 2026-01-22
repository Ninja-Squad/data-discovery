import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

import { WheatisHeaderComponent } from './wheatis-header.component';

describe('WheatisHeaderComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  test('should display title and image', async () => {
    const fixture = TestBed.createComponent(WheatisHeaderComponent);
    await fixture.whenStable();

    const title = page.getByCss('h1');
    await expect.element(title).toHaveTextContent('WheatIS');

    const image = page.getByCss('img');
    await expect.element(image).toBeInTheDocument();
  });
});
