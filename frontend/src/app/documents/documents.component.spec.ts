import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID } from '@angular/core';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';

import { DocumentsComponent } from './documents.component';
import { RareDocumentComponent } from '../rare/rare-document/rare-document.component';
import { TruncatableDescriptionComponent } from '../truncatable-description/truncatable-description.component';
import { toRareDocument, toSinglePage } from '../models/test-model-generators';
import { DocumentModel } from '../models/document.model';
import { I18nTestingModule } from '../i18n/i18n-testing.module.spec';

describe('DocumentsComponent', () => {

  class DocumentsComponentTester extends ComponentTester<DocumentsComponent> {
    constructor() {
      super(DocumentsComponent);
    }

    get results() {
      return this.debugElement.queryAll(By.directive(RareDocumentComponent));
    }

    get noResults() {
      return this.element('#no-results');
    }

    get resume() {
      return this.element('#resume');
    }
  }

  beforeEach(() => {
    registerLocaleData(localeFr);
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, I18nTestingModule],
      declarations: [DocumentsComponent, RareDocumentComponent, TruncatableDescriptionComponent],
      providers: [
        { provide: LOCALE_ID, useValue: 'fr-FR' }
      ]
    });

    jasmine.addMatchers(speculoosMatchers);
  });

  it('should display no results if empty', () => {
    const tester = new DocumentsComponentTester();
    const component = tester.componentInstance;

    // given no results
    component.documents = toSinglePage([]);
    tester.detectChanges();

    // then it should display a message
    expect(tester.results.length).toBe(0);
    expect(tester.resume).toBeNull();
    expect(tester.noResults).not.toBeNull();
  });

  it('should display results if there are some', () => {
    const tester = new DocumentsComponentTester();
    const component = tester.componentInstance;

    // given two results
    const bacteria1 = toRareDocument('Bacteria1');
    const bacteria2 = toRareDocument('Bacteria2');
    component.documents = toSinglePage([bacteria1, bacteria2]);
    tester.detectChanges();

    // then it should display each result
    expect(tester.noResults).toBeNull();
    expect(tester.results.length).toBe(2);

    const result1 = tester.results[0].componentInstance as RareDocumentComponent;
    expect(result1.document).toBe(bacteria1);
    const result2 = tester.results[1].componentInstance as RareDocumentComponent;
    expect(result2.document).toBe(bacteria2);

    expect(tester.resume).toContainText('Results 1 to 2 of 2');
    expect(tester.resume).not.toContainText('limited');
  });

  it('should display limited results in resume, and format numbers in French', () => {
    const tester = new DocumentsComponentTester();
    const component = tester.componentInstance;

    // given results
    const content: Array<DocumentModel> = [];
    for (let i = 0; i < 20; i++) {
      content.push(toRareDocument(`Bacteria ${i}`));
    }

    // in page 200 on a limited number of pages
    component.documents = toSinglePage(content);
    component.documents.totalElements = 12000;
    component.documents.totalPages = 500;
    component.documents.number = 200;

    tester.detectChanges();

    // then it should display each result
    expect(tester.noResults).toBeNull();
    expect(tester.results.length).toBe(20);
    expect(tester.resume).toContainText('Results 4\u202f001 to 4\u202f020 of 12\u202f000 (limited to 10\u202f000)');
  });
});
