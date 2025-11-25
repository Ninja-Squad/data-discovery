import { TestBed } from '@angular/core/testing';

import { SelectAllResultsComponent } from './select-all-results.component';
import { ComponentTester } from 'ngx-speculoos';
import { BasketItem, BasketService } from '../basket.service';
import { ChangeDetectionStrategy, Component, Injectable, signal } from '@angular/core';
import { toSecondPage, toSinglePage } from '../../../models/test-model-generators';
import { provideI18nTesting } from '../../../i18n/mock-18n.spec';
import { DocumentModel } from '../../../models/document.model';
import { BasketAdapter } from '../basket-adapter.service';

@Component({
  selector: 'dd-test',
  template: '<dd-select-all-results [documents]="documents()" />',
  imports: [SelectAllResultsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  readonly documents = signal(toSinglePage<DocumentModel>([]));
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get link() {
    return this.element('a');
  }
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

  it('should display nothing if no results', async () => {
    // no item
    await tester.stable();
    expect(tester.link).toBeNull();
  });

  it('should remove items from the basket', async () => {
    // rosa in basket, rosa2 not in basket
    service.addToBasket(basketAdapter.asBasketItem(rosa)!);

    // one result
    tester.componentInstance.documents.set(toSinglePage([rosa]));
    await tester.stable();
    expect(tester.link).toContainText('Remove the item from the basket');
    await tester.link.click();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa)!)).toBeFalse();

    // several results
    service.addToBasket(basketAdapter.asBasketItem(rosa)!);
    service.addToBasket(basketAdapter.asBasketItem(rosa2)!);
    tester.componentInstance.documents.set(toSinglePage([rosa, rosa2]));
    await tester.stable();
    expect(tester.link).toContainText('Remove the 2 items from the basket');
    await tester.link.click();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa)!)).toBeFalse();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa2)!)).toBeFalse();

    // several pages of results
    service.addToBasket(basketAdapter.asBasketItem(rosa)!);
    service.addToBasket(basketAdapter.asBasketItem(rosa2)!);
    tester.componentInstance.documents.set(toSecondPage([rosa, rosa2]));
    await tester.stable();
    expect(tester.link).toContainText('Remove the 2 items from the basket');
    await tester.link.click();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa)!)).toBeFalse();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa2)!)).toBeFalse();
  });

  it('should add items to the basket', async () => {
    // one result
    tester.componentInstance.documents.set(toSinglePage([rosa]));
    await tester.stable();
    expect(tester.link).toContainText('Add the item to the basket');
    await tester.link.click();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa)!)).toBeTrue();

    // several results
    service.clearBasket();
    tester.componentInstance.documents.set(toSinglePage([rosa, rosa2]));
    await tester.stable();
    expect(tester.link).toContainText('Add the 2 items to the basket');
    await tester.link.click();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa)!)).toBeTrue();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa2)!)).toBeTrue();

    // several results, but one without an accession holder
    service.clearBasket();
    tester.componentInstance.documents.set(toSinglePage([rosa, rosa2, rosaWithoutAccessionHolder]));
    await tester.stable();
    // counter does not count the item without accession holders
    expect(tester.link).toContainText('Add the 2 items to the basket');
    await tester.link.click();
    expect(service.basket().items).toHaveSize(2);
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa)!)).toBeTrue();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa2)!)).toBeTrue();

    // only one result without accession holder
    service.clearBasket();
    tester.componentInstance.documents.set(toSinglePage([rosaWithoutAccessionHolder]));
    await tester.stable();
    // counter is O, so no link
    expect(tester.link).toBeNull();

    // several pages of results
    service.addToBasket(basketAdapter.asBasketItem(rosa)!);
    tester.componentInstance.documents.set(toSecondPage([rosa, rosa2]));
    await tester.stable();
    expect(tester.link).toContainText('Add the 2 items to the basket');

    service.addToBasket(basketAdapter.asBasketItem(rosa)!);

    // we default to add all
    tester.componentInstance.documents.set(toSinglePage([rosa, rosa2]));
    await tester.stable();
    expect(tester.link).toContainText('Add the 2 items to the basket');
    await tester.link.click();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa)!)).toBeTrue();
    expect(service.isItemInBasket(basketAdapter.asBasketItem(rosa2)!)).toBeTrue();
  });
});
