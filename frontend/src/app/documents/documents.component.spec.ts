import { TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createMock, MockObject } from '../../test/mock';

import { DocumentsComponent } from './documents.component';
import { toRareDocument, toSinglePage } from '../models/test-model-generators';
import { DocumentModel } from '../models/document.model';
import { BasketService } from '../urgi-common/basket/basket.service';
import { ReplaySubject } from 'rxjs';
import { SearchStateService } from '../search-state.service';
import { Page } from '../models/page';
import { provideI18nTesting } from '../i18n/mock-18n';
import { provideDisabledNgbAnimation } from '../disable-animations';

class DocumentsComponentTester {
  constructor() {
    TestBed.createComponent(DocumentsComponent);
  }
  readonly results = page.getByCss('dd-document');
  readonly noResults = page.getByCss('#no-results');
  readonly resume = page.getByCss('#resume');
}

describe('DocumentsComponent', () => {
  let basketService: BasketService;
  let searchStateService: MockObject<SearchStateService>;
  let documentsSubject: ReplaySubject<Page<DocumentModel>>;
  let tester: DocumentsComponentTester;

  beforeEach(() => {
    documentsSubject = new ReplaySubject<Page<DocumentModel>>(1);
    searchStateService = createMock(SearchStateService);
    searchStateService.getDocuments.mockReturnValue(documentsSubject);

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
    vi.spyOn(basketService, 'isEnabled').mockReturnValue(true);

    tester = new DocumentsComponentTester();
  });

  test('should display no results if empty', async () => {
    documentsSubject.next(toSinglePage([]));

    // then it should display a message
    await expect.element(tester.results).toHaveLength(0);
    await expect.element(tester.resume).not.toBeInTheDocument();
    await expect.element(tester.noResults).toBeInTheDocument();
  });

  test('should display results if there are some', async () => {
    // given two results
    const bacteria1 = toRareDocument('Bacteria1');
    const bacteria2 = toRareDocument('Bacteria2');
    documentsSubject.next(toSinglePage([bacteria1, bacteria2]));

    // then it should display each result
    await expect.element(tester.noResults).not.toBeInTheDocument();
    await expect.element(tester.results).toHaveLength(2);

    const result1 = tester.results.nth(0);
    await expect.element(result1).toHaveTextContent(bacteria1.name);
    const result2 = tester.results.nth(1);
    await expect.element(result2).toHaveTextContent(bacteria2.name);

    await expect.element(tester.resume).toHaveTextContent('Results 1 to 2 of 2');
    await expect.element(tester.resume).not.toHaveTextContent('limited');
  });

  test('should display limited results in resume, and format numbers', async () => {
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

    // then it should display each result
    await expect.element(tester.noResults).not.toBeInTheDocument();
    await expect.element(tester.results).toHaveLength(20);
    await expect
      .element(tester.resume)
      .toHaveTextContent('Results 4,001 to 4,020 of 12,000 (limited to 10,000)');
  });
});
