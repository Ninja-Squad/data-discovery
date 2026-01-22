import { TestBed } from '@angular/core/testing';

import { SelectAllResultsComponent } from './select-all-results.component';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';
import { BasketItem, BasketService } from '../basket.service';
import { ChangeDetectionStrategy, Component, Injectable, signal } from '@angular/core';
import { toSecondPage, toSinglePage } from '../../../models/test-model-generators';
import { DocumentModel } from '../../../models/document.model';
import { BasketAdapter } from '../basket-adapter.service';
import { provideI18nTesting } from '../../../i18n/mock-18n';

@Component({
  selector: 'dd-select-all-results-tester',
  template: '<dd-select-all-results [documents]="documents()" />',
  imports: [SelectAllResultsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  readonly documents = signal(toSinglePage<DocumentModel>([]));
}

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly link = page.getByCss('a');
}

interface TestDocumentModel extends DocumentModel {
  accessionHolder: string | null;
}

@Injectable()
class TestBasketAdapter extends BasketAdapter {
  override asBasketItem(document: DocumentModel): BasketItem | null {
    const testDocument = document as TestDocumentModel;
    if (testDocument.accessionHolder) {
      return {
        accession: {
          url: `https://foo.com/documents/${document.identifier}`,
          name: document.name,
          identifier: document.identifier,
          taxon: `Taxon ${document.identifier}`,
          accessionNumber: null
        },
        accessionHolder: testDocument.accessionHolder
      };
    } else {
      return null;
    }
  }
}

describe('SelectAllResultsComponent', () => {
  let tester: TestComponentTester;
  let service: BasketService;
  const rosa: TestDocumentModel = {
    name: 'Rosa',
    identifier: 'rosa',
    accessionHolder: 'AH1',
    description: 'Rosa'
  };
  const rosa2: TestDocumentModel = {
    name: 'Rosa2',
    identifier: 'rosa2',
    accessionHolder: 'AH1',
    description: 'Rosa2'
  };
  const rosaWithoutAccessionHolder: TestDocumentModel = {
    name: 'Rosa3',
    identifier: 'rosa3',
    accessionHolder: null,
    description: 'Rosa3'
  };

  let basketAdapter: BasketAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: BasketAdapter, useClass: TestBasketAdapter }]
    });

    service = TestBed.inject(BasketService);
    service.clearBasket();

    basketAdapter = TestBed.inject(BasketAdapter);

    tester = new TestComponentTester();
  });

  test('should display nothing if no results', async () => {
    // no item
    await tester.fixture.whenStable();
    await expect.element(tester.link).not.toBeInTheDocument();
  });

  test('should remove items from the basket', async () => {
    // rosa in basket, rosa2 not in basket
    service.addToBasket(basketAdapter.asBasketItem(rosa)!);

    // one result
    tester.componentInstance.documents.set(toSinglePage([rosa]));
    await tester.fixture.whenStable();
    await expect.element(tester.link).toHaveTextContent('Remove the item from the basket');
    await tester.link.click();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa)!)).toBe(false);

    // several results
    service.addToBasket(basketAdapter.asBasketItem(rosa)!);
    service.addToBasket(basketAdapter.asBasketItem(rosa2)!);
    tester.componentInstance.documents.set(toSinglePage([rosa, rosa2]));
    await tester.fixture.whenStable();
    await expect.element(tester.link).toHaveTextContent('Remove the 2 items from the basket');
    await tester.link.click();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa)!)).toBe(false);
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa2)!)).toBe(false);

    // several pages of results
    service.addToBasket(basketAdapter.asBasketItem(rosa)!);
    service.addToBasket(basketAdapter.asBasketItem(rosa2)!);
    tester.componentInstance.documents.set(toSecondPage([rosa, rosa2]));
    await tester.fixture.whenStable();
    await expect.element(tester.link).toHaveTextContent('Remove the 2 items from the basket');
    await tester.link.click();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa)!)).toBe(false);
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa2)!)).toBe(false);
  });

  test('should add items to the basket', async () => {
    // one result
    tester.componentInstance.documents.set(toSinglePage([rosa]));
    await tester.fixture.whenStable();
    await expect.element(tester.link).toHaveTextContent('Add the item to the basket');
    await tester.link.click();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa)!)).toBe(true);

    // several results
    service.clearBasket();
    tester.componentInstance.documents.set(toSinglePage([rosa, rosa2]));
    await tester.fixture.whenStable();
    await expect.element(tester.link).toHaveTextContent('Add the 2 items to the basket');
    await tester.link.click();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa)!)).toBe(true);
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa2)!)).toBe(true);

    // several results, but one without an accession holder
    service.clearBasket();
    tester.componentInstance.documents.set(toSinglePage([rosa, rosa2, rosaWithoutAccessionHolder]));
    await tester.fixture.whenStable();
    // counter does not count the item without accession holders
    await expect.element(tester.link).toHaveTextContent('Add the 2 items to the basket');
    await tester.link.click();
    expect(service.basket().items).toHaveLength(2);
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa)!)).toBe(true);
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa2)!)).toBe(true);

    // only one result without accession holder
    service.clearBasket();
    tester.componentInstance.documents.set(toSinglePage([rosaWithoutAccessionHolder]));
    await tester.fixture.whenStable();
    // counter is O, so no link
    await expect.element(tester.link).not.toBeInTheDocument();

    // several pages of results
    service.addToBasket(basketAdapter.asBasketItem(rosa)!);
    tester.componentInstance.documents.set(toSecondPage([rosa, rosa2]));
    await tester.fixture.whenStable();
    await expect.element(tester.link).toHaveTextContent('Add the 2 items to the basket');

    service.addToBasket(basketAdapter.asBasketItem(rosa)!);

    // we default to add all
    tester.componentInstance.documents.set(toSinglePage([rosa, rosa2]));
    await tester.fixture.whenStable();
    await expect.element(tester.link).toHaveTextContent('Add the 2 items to the basket');
    await tester.link.click();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa)!)).toBe(true);
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa2)!)).toBe(true);
  });
});
