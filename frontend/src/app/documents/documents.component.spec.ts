import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID } from '@angular/core';
import { ComponentTester, createMock } from 'ngx-speculoos';

import { DocumentsComponent } from './documents.component';
import { RareDocumentComponent } from '../rare/rare-document/rare-document.component';
import { TruncatableDescriptionComponent } from '../truncatable-description/truncatable-description.component';
import { toRareDocument, toSinglePage } from '../models/test-model-generators';
import { DocumentModel } from '../models/document.model';
import { I18nTestingModule } from '../i18n/i18n-testing.module.spec';
import { BasketService } from '../rare/basket.service';
import { of, ReplaySubject } from 'rxjs';
import { GenericSelectAllResultsComponent } from '../urgi-common/generic-select-all-results/generic-select-all-results.component';
import { DataDiscoveryNgbTestingModule } from '../data-discovery-ngb-testing.module';
import { GenericDocumentListComponent } from '../generic-document-list/generic-document-list.component';
import { SearchStateService } from '../search-state.service';
import { Page } from '../models/page';

class DocumentsComponentTester extends ComponentTester<DocumentsComponent> {
  constructor() {
    super(DocumentsComponent);
  }

  get results() {
    return this.components(RareDocumentComponent);
  }

  get noResults() {
    return this.element('#no-results');
  }

  get resume() {
    return this.element('#resume');
  }
}

describe('DocumentsComponent', () => {
  let basketService: jasmine.SpyObj<BasketService>;
  let searchStateService: jasmine.SpyObj<SearchStateService>;
  let documentsSubject: ReplaySubject<Page<DocumentModel>>;
  let tester: DocumentsComponentTester;

  beforeEach(() => {
    basketService = createMock(BasketService);
    basketService.isEnabled.and.returnValue(true);
    basketService.isAccessionInBasket.and.returnValue(of(false));

    documentsSubject = new ReplaySubject<Page<DocumentModel>>(1);
    searchStateService = createMock(SearchStateService);
    searchStateService.getDocuments.and.returnValue(documentsSubject);

    registerLocaleData(localeFr);
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, DataDiscoveryNgbTestingModule, I18nTestingModule],
      declarations: [
        DocumentsComponent,
        GenericDocumentListComponent,
        RareDocumentComponent,
        GenericSelectAllResultsComponent,
        TruncatableDescriptionComponent
      ],
      providers: [
        { provide: LOCALE_ID, useValue: 'fr-FR' },
        { provide: BasketService, useValue: basketService },
        { provide: SearchStateService, useValue: searchStateService }
      ]
    });

    tester = new DocumentsComponentTester();
  });

  it('should display no results if empty', () => {
    documentsSubject.next(toSinglePage([]));
    tester.detectChanges();

    // then it should display a message
    expect(tester.results.length).toBe(0);
    expect(tester.resume).toBeNull();
    expect(tester.noResults).not.toBeNull();
  });

  it('should display results if there are some', () => {
    // given two results
    const bacteria1 = toRareDocument('Bacteria1');
    const bacteria2 = toRareDocument('Bacteria2');
    documentsSubject.next(toSinglePage([bacteria1, bacteria2]));
    tester.detectChanges();

    // then it should display each result
    expect(tester.noResults).toBeNull();
    expect(tester.results.length).toBe(2);

    const result1 = tester.results[0];
    expect(result1.document).toBe(bacteria1);
    const result2 = tester.results[1];
    expect(result2.document).toBe(bacteria2);

    expect(tester.resume).toContainText('Results 1 to 2 of 2');
    expect(tester.resume).not.toContainText('limited');
  });

  it('should display limited results in resume, and format numbers in French', () => {
    // given results
    const content: Array<DocumentModel> = [];
    for (let i = 0; i < 20; i++) {
      content.push(toRareDocument(`Bacteria ${i}`));
    }

    documentsSubject.next({
      content,
      totalElements: 12000,
      totalPages: 500,
      number: 200,
      size: 20,
      maxResults: 10000
    });
    tester.detectChanges();

    // then it should display each result
    expect(tester.noResults).toBeNull();
    expect(tester.results.length).toBe(20);
    expect(tester.resume).toContainText(
      'Results 4\u202f001 to 4\u202f020 of 12\u202f000 (limited to 10\u202f000)'
    );
  });
});
