import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

import { RareHeaderComponent } from './rare-header.component';

describe('RareHeaderComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  test('should display title and image for rare', async () => {
    const fixture = TestBed.createComponent(RareHeaderComponent);
    await fixture.whenStable();

    const title = page.getByCss('h1');
    await expect.element(title).toHaveTextContent('RARe');

    const image = page.getByCss('img');
    await expect.element(image).toBeInTheDocument();
  });

  test('should display title and image for application other than rare', async () => {
    const fixture = TestBed.createComponent(RareHeaderComponent);
    fixture.componentInstance.isRareApp = false;

    await fixture.whenStable();

    const title = page.getByCss('h1');
    await expect.element(title).toHaveTextContent('BRC4EnvBiological');

    const image = page.getByCss('img');
    await expect.element(image).toBeInTheDocument();
  });
});
