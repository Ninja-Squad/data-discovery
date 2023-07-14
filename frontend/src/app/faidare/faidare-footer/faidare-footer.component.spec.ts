import { TestBed } from '@angular/core/testing';

import { FaidareFooterComponent } from './faidare-footer.component';
import { ComponentTester } from 'ngx-speculoos';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

class FaidareFooterComponentTester extends ComponentTester<FaidareFooterComponent> {
  constructor() {
    super(FaidareFooterComponent);
  }

  get links() {
    return this.elements('a');
  }

  get logo() {
    return this.element('img')!;
  }
}

describe('FaidareFooterComponent', () => {
  let tester: FaidareFooterComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });
    tester = new FaidareFooterComponentTester();
    tester.detectChanges();
  });

  it('should display data providers and elixir logo', () => {
    expect(tester.links.length).toBe(8);
    const urgiLink = tester.links[0];
    expect(urgiLink).toHaveText('URGI GnpIS');
    expect(urgiLink.attr('href')).toBe('https://urgi.versailles.inrae.fr/gnpis');

    expect(tester.logo.attr('alt')).toBe('Elixir');
  });
});
