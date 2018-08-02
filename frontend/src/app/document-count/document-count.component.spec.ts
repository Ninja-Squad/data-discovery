import { TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';

import { DocumentCountComponent } from './document-count.component';
import { LOCALE_ID } from '@angular/core';

describe('DocumentCountComponent', () => {

  class DocumentCountComponentTester extends ComponentTester<DocumentCountComponent> {
    constructor() {
      super(DocumentCountComponent);
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
  }

  beforeEach(() => {
    registerLocaleData(localeFr);
    TestBed.configureTestingModule({
      declarations: [DocumentCountComponent],
      providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }]
    });
    jasmine.addMatchers(speculoosMatchers);
  });

  it('should display a name and a count', () => {
    // given a component with a name and count
    const tester = new DocumentCountComponentTester();
    const component = tester.componentInstance;
    component.name = 'Biotope';
    component.count = 1298;

    // when displaying it
    tester.detectChanges();

    // then we should have the name and the count properly formatted
    expect(tester.name).toHaveText('Biotope');
    expect(tester.count).toHaveText('[1\u00a0298]');
  });

  it('should display a link if it is possible and a count', () => {
    // given a component with a name, a url and a count
    const tester = new DocumentCountComponentTester();
    const component = tester.componentInstance;
    component.name = 'Florilège';
    component.count = 1298;
    component.url = 'http://florilege.arcad-project.org/fr/collections';

    // when displaying it
    tester.detectChanges();

    // then we should have the name in a link and the count properly formatted
    expect(tester.link).toHaveText('Florilège');
    expect(tester.link.attr('href')).toBe('http://florilege.arcad-project.org/fr/collections');
    expect(tester.count).toHaveText('[1\u00a0298]');
  });
});
