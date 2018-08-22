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

  it('should display links', () => {
    const tester = new NavbarComponentTester();
    const component = tester.componentInstance;

    component.links = [
      { label: 'INRA', url: 'http://www.inra.fr/' },
      { label: 'URGI', url: 'https://urgi.versailles.inra.fr/' }
    ];

    tester.detectChanges();

    expect(tester.links.length).toBe(2);

    expect(tester.firstLink.textContent).toBe('INRA');
    expect(tester.firstLink.attr('href')).toBe('http://www.inra.fr/');
  });
});
