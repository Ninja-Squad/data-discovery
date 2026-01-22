import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

import { FaidareFooterComponent } from './faidare-footer.component';
import { provideI18nTesting } from '../../i18n/mock-18n';

class FaidareFooterComponentTester {
  readonly fixture = TestBed.createComponent(FaidareFooterComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly links = page.getByRole('link');
  readonly logo = page.getByRole('img');
}

describe('FaidareFooterComponent', () => {
  let tester: FaidareFooterComponentTester;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });
    tester = new FaidareFooterComponentTester();
    await tester.fixture.whenStable();
  });

  test('should display data providers and elixir logo', async () => {
    expect(tester.links).toHaveLength(8);
    const urgiLink = tester.links.nth(0);
    await expect.element(urgiLink).toHaveTextContent('URGI GnpIS');
    await expect(urgiLink.element().getAttribute('href')).toBe(
      'https://urgi.versailles.inrae.fr/gnpis'
    );

    await expect(tester.logo.element().getAttribute('alt')).toBe('Elixir');
  });
});
