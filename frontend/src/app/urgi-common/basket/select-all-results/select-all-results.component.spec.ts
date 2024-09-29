import { TestBed } from '@angular/core/testing';

import { SelectAllResultsComponent } from './select-all-results.component';
import { ComponentTester, createMock } from 'ngx-speculoos';
import { BasketService } from '../basket.service';
import { of } from 'rxjs';
import { Component } from '@angular/core';
import { Page } from '../../../models/page';
import { toSecondPage, toSinglePage } from '../../../models/test-model-generators';
import { RareDocumentModel } from '../../../rare/rare-document.model';
import { OrderableDocumentModel } from '../../../models/document.model';
import { provideI18nTesting } from '../../../i18n/mock-18n.spec';

@Component({
  selector: 'dd-test',
  template: '<dd-select-all-results [documents]="documents" />',
  standalone: true,
  imports: [SelectAllResultsComponent]
})
class TestComponent {
  documents: Page<OrderableDocumentModel>;
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
  let service: jasmine.SpyObj<BasketService>;
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
    service = createMock(BasketService);
    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: BasketService, useValue: service }]
    });
    tester = new TestComponentTester();
  });

  it('should display nothing if no results', () => {
    // no item
    tester.detectChanges();
    expect(tester.link).toBeNull();
  });

  it('should remove items from the basket', () => {
    // rosa2 in basket, rosa not in basket
    service.isAccessionInBasket.calls.reset();
    service.isAccessionInBasket.and.returnValue(of(true));

    // one result
    tester.componentInstance.documents = toSinglePage([rosa]);
    tester.detectChanges();
    expect(service.isAccessionInBasket).toHaveBeenCalledWith(rosa);
    expect(tester.link).toContainText('Remove the item from the basket');
    tester.link.dispatchEventOfType('click');
    expect(service.removeFromBasket).toHaveBeenCalledWith(rosa.identifier);

    // several results
    tester.componentInstance.documents = toSinglePage([rosa, rosa2]);
    tester.detectChanges();
    expect(service.isAccessionInBasket).toHaveBeenCalledWith(rosa);
    expect(service.isAccessionInBasket).toHaveBeenCalledWith(rosa2);
    expect(tester.link).toContainText('Remove the 2 items from the basket');
    tester.link.dispatchEventOfType('click');
    expect(service.removeFromBasket).toHaveBeenCalledWith(rosa.identifier);
    expect(service.removeFromBasket).toHaveBeenCalledWith(rosa2.identifier);

    // several pages of results
    tester.componentInstance.documents = toSecondPage([rosa, rosa2]);
    tester.detectChanges();
    expect(service.isAccessionInBasket).toHaveBeenCalledWith(rosa);
    expect(service.isAccessionInBasket).toHaveBeenCalledWith(rosa2);
    expect(tester.link).toContainText('Remove the 2 items from the basket');
    tester.link.dispatchEventOfType('click');
    expect(service.removeFromBasket).toHaveBeenCalledWith(rosa.identifier);
    expect(service.removeFromBasket).toHaveBeenCalledWith(rosa2.identifier);
  });

  it('should add items to the basket', () => {
    service.isAccessionInBasket.and.returnValue(of(false));

    // one result
    tester.componentInstance.documents = toSinglePage([rosa]);
    tester.detectChanges();
    expect(service.isAccessionInBasket).toHaveBeenCalledWith(rosa);
    expect(tester.link).toContainText('Add the item to the basket');
    tester.link.dispatchEventOfType('click');
    expect(service.addToBasket).toHaveBeenCalledWith(rosa);

    // several results
    tester.componentInstance.documents = toSinglePage([rosa, rosa2]);
    tester.detectChanges();
    expect(service.isAccessionInBasket).toHaveBeenCalledWith(rosa);
    expect(service.isAccessionInBasket).toHaveBeenCalledWith(rosa2);
    expect(tester.link).toContainText('Add the 2 items to the basket');
    tester.link.dispatchEventOfType('click');
    expect(service.addToBasket).toHaveBeenCalledWith(rosa);
    expect(service.addToBasket).toHaveBeenCalledWith(rosa2);

    // several results, but one without an accession holder
    tester.componentInstance.documents = toSinglePage([rosa, rosa2, rosaWithoutAccessionHolder]);
    tester.detectChanges();
    expect(service.isAccessionInBasket).toHaveBeenCalledWith(rosa);
    expect(service.isAccessionInBasket).toHaveBeenCalledWith(rosa2);
    expect(service.isAccessionInBasket).not.toHaveBeenCalledWith(rosaWithoutAccessionHolder);
    // counter does not count the item without accession holders
    expect(tester.link).toContainText('Add the 2 items to the basket');
    tester.link.dispatchEventOfType('click');
    expect(service.addToBasket).toHaveBeenCalledWith(rosa);
    expect(service.addToBasket).toHaveBeenCalledWith(rosa2);
    expect(service.addToBasket).not.toHaveBeenCalledWith(rosaWithoutAccessionHolder);

    // only one result without accession holder
    service.isAccessionInBasket.calls.reset();
    tester.componentInstance.documents = toSinglePage([rosaWithoutAccessionHolder]);
    tester.detectChanges();
    expect(service.isAccessionInBasket).not.toHaveBeenCalled();
    // counter is O, so no link
    expect(tester.link).toBeNull();

    // several pages of results
    tester.componentInstance.documents = toSecondPage([rosa, rosa2]);
    tester.detectChanges();
    expect(service.isAccessionInBasket).toHaveBeenCalledWith(rosa);
    expect(service.isAccessionInBasket).toHaveBeenCalledWith(rosa2);
    expect(tester.link).toContainText('Add the 2 items to the basket');

    // rosa2 in basket, rosa not in basket
    service.isAccessionInBasket.and.callFake((accession: RareDocumentModel) => {
      return of(accession.identifier === 'rosa');
    });

    // we default to add all
    tester.componentInstance.documents = toSinglePage([rosa, rosa2]);
    tester.detectChanges();
    expect(service.isAccessionInBasket).toHaveBeenCalledWith(rosa);
    expect(service.isAccessionInBasket).toHaveBeenCalledWith(rosa2);
    expect(tester.link).toContainText('Add the 2 items to the basket');
    tester.link.dispatchEventOfType('click');
    expect(service.addToBasket).toHaveBeenCalledWith(rosa);
    expect(service.addToBasket).toHaveBeenCalledWith(rosa2);
  });
});
