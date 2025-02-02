import { TestBed } from '@angular/core/testing';

import { SelectAllResultsComponent } from './select-all-results.component';
import { ComponentTester } from 'ngx-speculoos';
import { BasketService } from '../basket.service';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toSecondPage, toSinglePage } from '../../../models/test-model-generators';
import { OrderableDocumentModel } from '../../../models/document.model';
import { provideI18nTesting } from '../../../i18n/mock-18n.spec';

@Component({
  selector: 'dd-test',
  template: '<dd-select-all-results [documents]="documents()" />',
  imports: [SelectAllResultsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  readonly documents = signal(toSinglePage<OrderableDocumentModel>([]));
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get link() {
    return this.element('a');
  }
}

describe('SelectAllResultsComponent', () => {
  let tester: TestComponentTester;
  let service: BasketService;
  const rosa = {
    name: 'Rosa',
    identifier: 'rosa',
    accessionHolder: 'AH1'
  } as OrderableDocumentModel;
  const rosa2 = {
    name: 'Rosa2',
    identifier: 'rosa2',
    accessionHolder: 'AH1'
  } as OrderableDocumentModel;
  const rosaWithoutAccessionHolder = {
    name: 'Rosa3',
    identifier: 'rosa3'
  } as OrderableDocumentModel;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting()]
    });

    service = TestBed.inject(BasketService);
    service.clearBasket();

    tester = new TestComponentTester();
  });

  it('should display nothing if no results', async () => {
    // no item
    await tester.stable();
    expect(tester.link).toBeNull();
  });

  it('should remove items from the basket', async () => {
    // rosa in basket, rosa2 not in basket
    service.addToBasket(rosa);

    // one result
    tester.componentInstance.documents.set(toSinglePage([rosa]));
    await tester.stable();
    expect(tester.link).toContainText('Remove the item from the basket');
    await tester.link.click();
    expect(service.isAccessionInBasket(rosa)).toBeFalse();

    // several results
    service.addToBasket(rosa);
    service.addToBasket(rosa2);
    tester.componentInstance.documents.set(toSinglePage([rosa, rosa2]));
    await tester.stable();
    expect(tester.link).toContainText('Remove the 2 items from the basket');
    await tester.link.click();
    expect(service.isAccessionInBasket(rosa)).toBeFalse();
    expect(service.isAccessionInBasket(rosa2)).toBeFalse();

    // several pages of results
    service.addToBasket(rosa);
    service.addToBasket(rosa2);
    tester.componentInstance.documents.set(toSecondPage([rosa, rosa2]));
    await tester.stable();
    expect(tester.link).toContainText('Remove the 2 items from the basket');
    await tester.link.click();
    expect(service.isAccessionInBasket(rosa)).toBeFalse();
    expect(service.isAccessionInBasket(rosa2)).toBeFalse();
  });

  it('should add items to the basket', async () => {
    // one result
    tester.componentInstance.documents.set(toSinglePage([rosa]));
    await tester.stable();
    expect(tester.link).toContainText('Add the item to the basket');
    await tester.link.click();
    expect(service.isAccessionInBasket(rosa)).toBeTrue();

    // several results
    service.clearBasket();
    tester.componentInstance.documents.set(toSinglePage([rosa, rosa2]));
    await tester.stable();
    expect(tester.link).toContainText('Add the 2 items to the basket');
    await tester.link.click();
    expect(service.isAccessionInBasket(rosa)).toBeTrue();
    expect(service.isAccessionInBasket(rosa2)).toBeTrue();

    // several results, but one without an accession holder
    service.clearBasket();
    tester.componentInstance.documents.set(toSinglePage([rosa, rosa2, rosaWithoutAccessionHolder]));
    await tester.stable();
    // counter does not count the item without accession holders
    expect(tester.link).toContainText('Add the 2 items to the basket');
    await tester.link.click();
    expect(service.isAccessionInBasket(rosa)).toBeTrue();
    expect(service.isAccessionInBasket(rosa2)).toBeTrue();
    expect(service.isAccessionInBasket(rosaWithoutAccessionHolder)).toBeFalse();

    // only one result without accession holder
    service.clearBasket();
    tester.componentInstance.documents.set(toSinglePage([rosaWithoutAccessionHolder]));
    await tester.stable();
    // counter is O, so no link
    expect(tester.link).toBeNull();

    // several pages of results
    service.addToBasket(rosa);
    tester.componentInstance.documents.set(toSecondPage([rosa, rosa2]));
    await tester.stable();
    expect(tester.link).toContainText('Add the 2 items to the basket');

    service.addToBasket(rosa);

    // we default to add all
    tester.componentInstance.documents.set(toSinglePage([rosa, rosa2]));
    await tester.stable();
    expect(tester.link).toContainText('Add the 2 items to the basket');
    await tester.link.click();
    expect(service.isAccessionInBasket(rosa)).toBeTrue();
    expect(service.isAccessionInBasket(rosa2)).toBeTrue();
  });
});
