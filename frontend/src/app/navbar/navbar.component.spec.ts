import { TestBed } from '@angular/core/testing';
import { ComponentTester } from 'ngx-speculoos';

import { NavbarComponent } from './navbar.component';
import { I18nTestingModule } from '../i18n/i18n-testing.module.spec';
import { DataDiscoveryNgbTestingModule } from '../data-discovery-ngb-testing.module';
import { GenericRareBasketComponent } from '../urgi-common/generic-rare-basket/generic-rare-basket.component';

class NavbarComponentTester extends ComponentTester<NavbarComponent> {
  constructor() {
    super(NavbarComponent);
  }

  get navBar() {
    return this.element('#navbar');
  }

  get toggler() {
    return this.button('button.navbar-toggler');
  }

  get links() {
    return this.elements('li');
  }

  get firstLink() {
    return this.element('li a');
  }

  get title() {
    return this.element('a');
  }

  get logo() {
    return this.title.element('img');
  }
}

describe('NavbarComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [NavbarComponent, GenericRareBasketComponent],
      imports: [I18nTestingModule, DataDiscoveryNgbTestingModule]
    })
  );

  it('should toggle the ngbCollapse on click', () => {
    const tester = new NavbarComponentTester();

    tester.detectChanges();

    expect(tester.navBar).not.toHaveClass('show');

    tester.toggler.click();

    expect(tester.navBar).toHaveClass('show');

    tester.toggler.click();

    expect(tester.navBar).not.toHaveClass('show');
  });

  it('should display title and links that open in new tabs', () => {
    const tester = new NavbarComponentTester();
    const component = tester.componentInstance;

    component.navbar = {
      logoUrl: 'https://www.agrobrc-rare.org/',
      secondLogoUrl: 'https://wheatinitiative.org',
      links: component.navbar.links
    };

    tester.detectChanges();

    expect(tester.title.attr('href')).toBe('https://www.agrobrc-rare.org/');
    expect(tester.logo.attr('title')).toBe('RARe Search');

    expect(tester.links.length - 1).toBe(1);
    // minus 1 because of More section (containing Help, About, Join and Legal links) added automatically

    expect(tester.firstLink.textContent).toBe('AgroBRC-RARe Home');
    expect(tester.firstLink.attr('href')).toBe('https://www.agrobrc-rare.org/');
  });
});
