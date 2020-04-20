import { TestBed } from '@angular/core/testing';

import { RareSelectAllResultsComponent } from './rare-select-all-results.component';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';
import { BasketService } from '../basket.service';
import { of } from 'rxjs';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { Component } from '@angular/core';
import { RareDocumentModel } from '../rare-document.model';
import { Page } from '../../models/page';
import { toSecondPage, toSinglePage } from '../../models/test-model-generators';

@Component({
  selector: 'dd-test',
  template: '<dd-select-all-results [documents]="documents"></dd-select-all-results>'
})
class TestComponent {
  documents: Page<RareDocumentModel>;
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get link() {
    return this.element('a');
  }
}

describe('RareSelectAllResultsComponent', () => {
  let tester: TestComponentTester;
  let service: jasmine.SpyObj<BasketService>;
  const rosa = { name: 'Rosa', identifier: 'rosa' } as RareDocumentModel;
  const rosa2 = { name: 'Rosa2', identifier: 'rosa2' } as RareDocumentModel;

  beforeEach(() => {
    service = jasmine.createSpyObj<BasketService>('BasketService', ['isAccessionInBasket', 'removeFromBasket', 'addToBasket']);
    TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      declarations: [TestComponent, RareSelectAllResultsComponent],
      providers: [{ provide: BasketService, useValue: service }]
    });
    jasmine.addMatchers(speculoosMatchers);
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
