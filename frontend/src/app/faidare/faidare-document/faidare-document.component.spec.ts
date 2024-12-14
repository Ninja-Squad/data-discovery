import { TestBed } from '@angular/core/testing';
import { ComponentTester } from 'ngx-speculoos';

import { FaidareDocumentComponent } from './faidare-document.component';
import { toFaidareDocument } from '../../models/test-model-generators';
import { BasketService } from '../../urgi-common/basket/basket.service';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';
import { Component, signal } from '@angular/core';
import { FaidareDocumentModel } from '../faidare-document.model';

@Component({
  template: '<dd-document [document]="document()" />',
  imports: [FaidareDocumentComponent]
})
class TestComponent {
  document = signal<FaidareDocumentModel>(toFaidareDocument('Bacteria'));
}

class FaidareDocumentComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get title() {
    return this.element('h3');
  }

  get link() {
    return this.element('.main-link');
  }

  get type() {
    return this.element('.type');
  }

  get species() {
    return this.element('.species');
  }

  get description() {
    return this.element('.description');
  }

  get fullDescriptionButton() {
    return this.button('.description button');
  }

  get fullDescription() {
    return this.element('.full-description');
  }

  get shortDescriptionButton() {
    return this.button('.full-description button');
  }

  get addToBasketButton() {
    return this.button('button.btn-outline-dark');
  }

  get removeFromBasketButton() {
    return this.button('button.btn-success');
  }

  get tooltip() {
    return document.querySelector('ngb-tooltip-window');
  }
}

describe('FaidareDocumentComponent', () => {
  let basketService: BasketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting()]
    });

    basketService = TestBed.inject(BasketService);
    basketService.clearBasket();
    spyOn(basketService, 'isEnabled').and.returnValue(true);
  });

  it('should display a resource', () => {
    const tester = new FaidareDocumentComponentTester();

    // given a resource
    const resource = tester.componentInstance.document();
    tester.detectChanges();

    // then we should display it
    expect(tester.title).toContainText(resource.name);
    expect(tester.title).toContainText(resource.databaseName);
    expect(tester.link).toContainText(resource.name);
    expect(tester.link.attr('href')).toBe(resource.url);
    expect(tester.link.attr('target')).toBe('_blank');
    expect(tester.type).toContainText(resource.entryType);
    resource.species.forEach(text => expect(tester.species).toContainText(text));
    expect(tester.description).toContainText(resource.description);
    expect(tester.fullDescriptionButton).toBeNull();
    expect(tester.fullDescription).toBeNull();
    expect(tester.shortDescriptionButton).toBeNull();
    expect(tester.removeFromBasketButton).toBeNull();
    expect(tester.addToBasketButton).not.toBeNull();
  });

  it('should not have the basket button if the feature is disabled', () => {
    (basketService.isEnabled as jasmine.Spy).and.returnValue(false);
    const tester = new FaidareDocumentComponentTester();

    // given a resource
    tester.detectChanges();
    // then the button should not be displayed
    expect(tester.addToBasketButton).toBeNull();
  });

  it('should add/remove to/from basket', () => {
    const tester = new FaidareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource
    tester.detectChanges();

    // when hovering the add to basket button
    tester.addToBasketButton.dispatchEventOfType('mouseenter');

    // then we should have the tooltip displayed
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip.textContent).toBe('Add to basket');

    tester.addToBasketButton.click();

    // then we should have added the item to the basket
    expect(basketService.isAccessionInBasket(component.document())).toBeTrue();

    // we switched the button to display a green one
    expect(tester.addToBasketButton).toBeNull();
    expect(tester.removeFromBasketButton).not.toBeNull();

    // when hovering the remove from basket button
    tester.removeFromBasketButton.dispatchEventOfType('mouseenter');

    // then we should have the tooltip displayed
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip.textContent).toBe('Remove from basket');

    tester.removeFromBasketButton.click();
    expect(basketService.isAccessionInBasket(component.document())).toBeFalse();

    // we switched back the button
    expect(tester.removeFromBasketButton).toBeNull();
    expect(tester.addToBasketButton).not.toBeNull();
  });
});
