import { TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { ComponentTester, createMock } from 'ngx-speculoos';

import { DocumentsComponent } from './documents.component';
import { toRareDocument, toSinglePage } from '../models/test-model-generators';
import { DocumentModel } from '../models/document.model';
import { BasketService } from '../urgi-common/basket/basket.service';
import { ReplaySubject } from 'rxjs';
import { SearchStateService } from '../search-state.service';
import { Page } from '../models/page';
import { provideI18nTesting } from '../i18n/mock-18n.spec';
import { provideDisabledNgbAnimation } from '../disable-animations';
import { GenericDocumentComponent } from '../urgi-common/generic-document/generic-document.component';

class DocumentsComponentTester extends ComponentTester<DocumentsComponent> {
  constructor() {
    super(DocumentsComponent);
  }

  get results() {
    return this.elements(GenericDocumentComponent);
  }

  get noResults() {
    return this.element('#no-results');
  }

  get resume() {
    return this.element('#resume');
  }
}

describe('DocumentsComponent', () => {
  let basketService: BasketService;
  let searchStateService: jasmine.SpyObj<SearchStateService>;
  let documentsSubject: ReplaySubject<Page<DocumentModel>>;
  let tester: DocumentsComponentTester;

  beforeEach(() => {
    documentsSubject = new ReplaySubject<Page<DocumentModel>>(1);
    searchStateService = createMock(SearchStateService);
    searchStateService.getDocuments.and.returnValue(documentsSubject);

    registerLocaleData(localeFr);
    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        provideDisabledNgbAnimation(),
        { provide: SearchStateService, useValue: searchStateService }
      ]
    });

    basketService = TestBed.inject(BasketService);
    basketService.clearBasket();
    spyOn(basketService, 'isEnabled').and.returnValue(true);

    tester = new DocumentsComponentTester();
  });

  it('should display no results if empty', async () => {
    documentsSubject.next(toSinglePage([]));
    await tester.stable();

    // then it should display a message
    expect(tester.results.length).toBe(0);
    expect(tester.resume).toBeNull();
    expect(tester.noResults).not.toBeNull();
  });

  it('should display results if there are some', async () => {
    // given two results
    const bacteria1 = toRareDocument('Bacteria1');
    const bacteria2 = toRareDocument('Bacteria2');
    documentsSubject.next(toSinglePage([bacteria1, bacteria2]));
    await tester.stable();

    // then it should display each result
    expect(tester.noResults).toBeNull();
    expect(tester.results.length).toBe(2);

    const result1 = tester.results[0];
    expect(result1).toContainText(bacteria1.name);
    const result2 = tester.results[1];
    expect(result2).toContainText(bacteria2.name);

    expect(tester.resume).toContainText('Results 1 to 2 of 2');
    expect(tester.resume).not.toContainText('limited');
  });

  it('should display limited results in resume, and format numbers', async () => {
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
    await tester.stable();

    // then it should display each result
    expect(tester.noResults).toBeNull();
    expect(tester.results.length).toBe(20);
    expect(tester.resume).toContainText('Results 4,001 to 4,020 of 12,000 (limited to 10,000)');
  });
});
