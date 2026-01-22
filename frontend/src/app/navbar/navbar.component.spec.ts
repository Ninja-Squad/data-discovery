import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

import { NavbarComponent } from './navbar.component';
import { provideI18nTesting } from '../i18n/mock-18n';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideDisabledNgbAnimation } from '../disable-animations';
import { environment } from '../../environments/environment';

class NavbarComponentTester {
  constructor() {
    TestBed.createComponent(NavbarComponent);
  }
  readonly navBar = page.getByCss('#navbar');
  readonly toggler = page.getByCss('button.navbar-toggler');
  readonly links = page.getByCss('li');
  readonly firstLink = page.getByCss('li a').first();
  readonly title = page.getByCss('a').first();
  readonly logo = page.getByCss('a img');
}

describe('NavbarComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideI18nTesting(),
        provideRouter([]),
        provideDisabledNgbAnimation()
      ]
    })
  );

  test('should toggle the ngbCollapse on click', async () => {
    const tester = new NavbarComponentTester();

    await expect.element(tester.navBar).not.toHaveClass('show');
    await expect.element(tester.navBar).not.toBeVisible();

    await tester.toggler.click();

    await expect.element(tester.navBar).toHaveClass('show');
    await expect.element(tester.navBar).toBeVisible();

    await tester.toggler.click();

    await expect.element(tester.navBar).not.toHaveClass('show');
    await expect.element(tester.navBar).not.toBeVisible();
  });

  test('should display title and links that open in new tabs', async () => {
    environment.navbar = {
      logoUrl: 'https://www.agrobrc-rare.org/',
      secondLogoUrl: '',
      links: environment.navbar.links
    };
    const tester = new NavbarComponentTester();

    await expect.element(tester.title).toHaveAttribute('href', 'https://www.agrobrc-rare.org/');
    await expect.element(tester.logo).toHaveAttribute('title', 'RARe Search');

    expect(tester.links).toHaveLength(6);

    await expect.element(tester.firstLink).toHaveTextContent('AgroBRC-RARe Home');
    await expect.element(tester.firstLink).toHaveAttribute('href', 'https://www.agrobrc-rare.org/');
  });
});
