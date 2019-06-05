import { TestBed } from '@angular/core/testing';
import { ComponentTester } from 'ngx-speculoos';

import { NavbarComponent } from './navbar.component';

class NavbarComponentTester extends ComponentTester<NavbarComponent> {
  constructor() {
    super(NavbarComponent);
  }

  get navBar() {
    return this.element('#navbar');
  }

  get toggler() {
    return this.button('button');
  }

  get links() {
    return this.elements('li');
  }

  get firstLink() {
    return this.element('li').element('a');
  }

  get title() {
    return this.element('a');
  }

  get logo() {
    return this.title.element('img');
  }
}

describe('NavbarComponent', () => {

  beforeEach(() => TestBed.configureTestingModule({
    declarations: [NavbarComponent]
  }));

  it('should toggle the class on click', () => {
    const tester = new NavbarComponentTester();

    tester.detectChanges();

    expect(tester.navBar.classes).toContain('collapse');

    tester.toggler.click();

    tester.detectChanges();

    expect(tester.navBar.classes).not.toContain('collapse');
  });

  it('should display title and links that open in new tabs', () => {
    const tester = new NavbarComponentTester();
    const component = tester.componentInstance;

    component.navbar = {
      title: 'RARe',
      logoUrl: 'https://www.agrobrc-rare.org/',
      links: [
        { label: 'INRA', url: 'http://www.inra.fr/' },
        { label: 'URGI', url: 'https://urgi.versailles.inra.fr/' }
      ]
    };

    tester.detectChanges();

    expect(tester.title.attr('href')).toBe('https://www.agrobrc-rare.org/');
    expect(tester.logo.attr('title')).toBe('RARe logo with link');

    expect(tester.links.length).toBe(2);

    expect(tester.firstLink.textContent).toBe('INRA');
    expect(tester.firstLink.attr('href')).toBe('http://www.inra.fr/');
    expect(tester.firstLink.attr('target')).toBe('_blank');
  });
});
