import { TestBed } from '@angular/core/testing';
import { ComponentTester } from 'ngx-speculoos';

import { NavbarComponent } from './navbar.component';
import { provideI18nTesting } from '../i18n/mock-18n.spec';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideDisabledNgbAnimation } from '../disable-animations';
import { environment } from '../../environments/environment';

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
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18nTesting(),
        provideRouter([]),
        provideDisabledNgbAnimation()
      ]
    })
  );

  it('should toggle the ngbCollapse on click', async () => {
    const tester = new NavbarComponentTester();

    await tester.stable();

    expect(tester.navBar).not.toHaveClass('show');

    await tester.toggler.click();

    expect(tester.navBar).toHaveClass('show');

    await tester.toggler.click();

    expect(tester.navBar).not.toHaveClass('show');
  });

  it('should display title and links that open in new tabs', async () => {
    environment.navbar = {
      logoUrl: 'https://www.agrobrc-rare.org/',
      secondLogoUrl: '',
      links: environment.navbar.links
    };
    const tester = new NavbarComponentTester();
    await tester.stable();

    expect(tester.title.attr('href')).toBe('https://www.agrobrc-rare.org/');
    expect(tester.logo.attr('title')).toBe('RARe Search');

    expect(tester.links.length).toBe(6);

    expect(tester.firstLink.textContent).toBe('AgroBRC-RARe Home');
    expect(tester.firstLink.attr('href')).toBe('https://www.agrobrc-rare.org/');
  });
});
