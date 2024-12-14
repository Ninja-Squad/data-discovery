import { TestBed } from '@angular/core/testing';
import { ComponentTester } from 'ngx-speculoos';

import { DocumentCountComponent } from './document-count.component';
import { provideI18nTesting } from '../i18n/mock-18n.spec';
import { provideDisabledNgbAnimation } from '../disable-animations';
import { Component, signal } from '@angular/core';

@Component({
  template: `<dd-document-count [count]="count()" [muted]="muted()" [name]="name()" [url]="url()" />`,
  imports: [DocumentCountComponent]
})
class TestComponent {
  count = signal(0);
  muted = signal(false);
  name = signal('');
  url = signal('');
}

describe('DocumentCountComponent', () => {
  class DocumentCountComponentTester extends ComponentTester<TestComponent> {
    constructor() {
      super(TestComponent);
    }

    get name() {
      return this.element('span');
    }

    get link() {
      return this.element('a');
    }

    get count() {
      return this.element('small');
    }

    get tooltip() {
      return document.querySelector('ngb-tooltip-window');
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), provideDisabledNgbAnimation()]
    });
  });

  it('should display a name and a count', () => {
    // given a component with a name and count
    const tester = new DocumentCountComponentTester();
    const component = tester.componentInstance;
    component.name.set('Biotope');
    component.count.set(1298);

    // when displaying it
    tester.detectChanges();

    // then we should have the name and the count properly formatted
    expect(tester.name).toHaveText('Biotope');
    expect(tester.count).toHaveText('[1,298]');
  });

  it('should display a link that opens in a new tab if it is possible and a count', () => {
    // given a component with a name, a url and a count
    const tester = new DocumentCountComponentTester();
    const component = tester.componentInstance;
    component.name.set('Florilège');
    component.count.set(1298);
    component.url.set('http://florilege.arcad-project.org/fr/collections');

    // when displaying it
    tester.detectChanges();

    // then we should have the name in a link and the count properly formatted
    expect(tester.link).toHaveText('Florilège');
    expect(tester.link.attr('href')).toBe('http://florilege.arcad-project.org/fr/collections');
    expect(tester.link.attr('target')).toBe('_blank');
    expect(tester.count).toHaveText('[1,298]');
  });

  it('should display a tooltip to explain the count', () => {
    // given a component with a name, a url and a count
    const tester = new DocumentCountComponentTester();
    const component = tester.componentInstance;
    component.name.set('Florilège');
    component.count.set(1298);
    component.url.set('http://florilege.arcad-project.org/fr/collections');

    // when displaying it
    tester.detectChanges();
    // and hovering the element
    tester.count.dispatchEventOfType('mouseenter');

    // then we should have the tooltip displayed
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip.textContent).toBe('1,298 documents match Florilège');

    // and hide it when leaving
    tester.count.dispatchEventOfType('mouseleave');
    expect(tester.tooltip).toBeNull();

    // with only one document
    component.count.set(1);

    // when displaying it again
    tester.detectChanges();
    tester.count.dispatchEventOfType('mouseenter');

    // then we should have the tooltip displayed with special text for one document
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip.textContent).toBe('Only one document matches Florilège');
  });
});
