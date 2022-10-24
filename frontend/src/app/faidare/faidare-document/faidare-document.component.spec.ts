import { TestBed } from '@angular/core/testing';
import { ComponentTester, createMock } from 'ngx-speculoos';

import { FaidareDocumentComponent } from './faidare-document.component';
import { toFaidareDocument } from '../../models/test-model-generators';
import { TruncatableDescriptionComponent } from '../../truncatable-description/truncatable-description.component';
import { BasketService } from '../../urgi-common/basket/basket.service';
import { BehaviorSubject } from 'rxjs';
import { DataDiscoveryNgbTestingModule } from '../../data-discovery-ngb-testing.module';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';

class FaidareDocumentComponentTester extends ComponentTester<FaidareDocumentComponent> {
  constructor() {
    super(FaidareDocumentComponent);
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
  let basketService: jasmine.SpyObj<BasketService>;
  let basketEvents: BehaviorSubject<boolean>;

  beforeEach(() => {
    basketEvents = new BehaviorSubject<boolean>(false);
    basketService = createMock(BasketService);
    basketService.isEnabled.and.returnValue(true);
    basketService.isAccessionInBasket.and.returnValue(basketEvents);
    TestBed.configureTestingModule({
      imports: [DataDiscoveryNgbTestingModule, I18nTestingModule],
      declarations: [FaidareDocumentComponent, TruncatableDescriptionComponent],
      providers: [{ provide: BasketService, useValue: basketService }]
    });
  });

  it('should display a resource', () => {
    const tester = new FaidareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource
    const resource = toFaidareDocument('Bacteria');
    component.document = resource;
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
    basketService.isEnabled.and.returnValue(false);
    const tester = new FaidareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource
    component.document = toFaidareDocument('Bacteria');
    tester.detectChanges();
    // then the button should not be displayed
    expect(tester.addToBasketButton).toBeNull();
  });

  it('should add/remove to/from basket', () => {
    const tester = new FaidareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource
    const resource = toFaidareDocument('Bacteria');
    component.document = resource;
    tester.detectChanges();

    // when hovering the add to basket button
    tester.addToBasketButton.dispatchEventOfType('mouseenter');

    // then we should have the tooltip displayed
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip.textContent).toBe('Add to basket');

    tester.addToBasketButton.click();

    // then we should have added the item to the basket
    expect(basketService.addToBasket).toHaveBeenCalledWith(resource);
    basketEvents.next(true);
    tester.detectChanges();

    // we switched the button to display a green one
    expect(tester.addToBasketButton).toBeNull();
    expect(tester.removeFromBasketButton).not.toBeNull();

    // when hovering the remove from basket button
    tester.removeFromBasketButton.dispatchEventOfType('mouseenter');

    // then we should have the tooltip displayed
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip.textContent).toBe('Remove from basket');

    tester.removeFromBasketButton.click();
    basketEvents.next(false);
    tester.detectChanges();

    // then we should have removed the item to the basket
    expect(basketService.removeFromBasket).toHaveBeenCalledWith(resource.identifier);

    // we switched back the button
    expect(tester.removeFromBasketButton).toBeNull();
    expect(tester.addToBasketButton).not.toBeNull();
  });
});
