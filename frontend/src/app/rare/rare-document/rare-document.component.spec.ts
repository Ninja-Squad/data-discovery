import { TestBed } from '@angular/core/testing';
import { ComponentTester, createMock } from 'ngx-speculoos';

import { RareDocumentComponent } from './rare-document.component';
import { toRareDocument } from '../../models/test-model-generators';
import { TruncatableDescriptionComponent } from '../../truncatable-description/truncatable-description.component';
import { BasketService } from '../basket.service';
import { Subject } from 'rxjs';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { DataDiscoveryNgbTestingModule } from '../../data-discovery-ngb-testing.module';

describe('RareDocumentComponent', () => {
  class RareDocumentComponentTester extends ComponentTester<RareDocumentComponent> {
    constructor() {
      super(RareDocumentComponent);
    }

    get title() {
      return this.element('h3');
    }

    get link() {
      return this.element('.main-link');
    }

    get datasourceLink() {
      return this.element('.datasource-link');
    }

    get taxon() {
      return this.element('.taxon');
    }

    get type() {
      return this.element('.type');
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

  let basketService: jasmine.SpyObj<BasketService>;
  const basketEvents = new Subject<boolean>();

  beforeEach(() => {
    basketService = createMock(BasketService);
    basketService.isEnabled.and.returnValue(true);
    basketService.isAccessionInBasket.and.returnValue(basketEvents);
    TestBed.configureTestingModule({
      imports: [DataDiscoveryNgbTestingModule, I18nTestingModule],
      declarations: [RareDocumentComponent, TruncatableDescriptionComponent],
      providers: [{ provide: BasketService, useValue: basketService }]
    });
  });

  it('should display a resource', () => {
    const tester = new RareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource
    const resource = toRareDocument('Bacteria');
    component.document = resource;
    tester.detectChanges();

    // then we should display it
    expect(tester.title).toContainText(resource.name);
    expect(tester.title).toContainText(resource.pillarName);
    expect(tester.link).toContainText(resource.name);
    expect(tester.link.attr('href')).toBe(resource.dataURL);
    expect(tester.link.attr('target')).toBe('_blank');
    expect(tester.datasourceLink).toContainText(resource.databaseSource);
    expect(tester.datasourceLink.attr('href')).toBe(resource.portalURL);
    expect(tester.datasourceLink.attr('target')).toBe('_blank');
    resource.taxon.forEach(text => expect(tester.taxon).toContainText(text));
    expect(tester.type).toContainText(resource.materialType[0]);
    expect(tester.description).toContainText(resource.description);
    expect(tester.fullDescriptionButton).toBeNull();
    expect(tester.fullDescription).toBeNull();
    expect(tester.shortDescriptionButton).toBeNull();
    expect(tester.removeFromBasketButton).toBeNull();
    expect(tester.addToBasketButton).not.toBeNull();
  });

  it('should have a link to portal if data url is null or empty', () => {
    const tester = new RareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource with no data url
    const resource = toRareDocument('Bacteria');
    resource.dataURL = null;
    component.document = resource;
    tester.detectChanges();

    // then we should link to portal url
    expect(tester.link.attr('href')).toBe(resource.portalURL);
  });

  it('should display several types properly', () => {
    const tester = new RareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource with several types
    const resource = toRareDocument('Bacteria');
    resource.materialType = ['type1', 'type2'];
    component.document = resource;
    tester.detectChanges();

    // then we should list them
    expect(tester.type).toContainText('type1, type2');
  });

  it('should not have the basket button if the feature is disabled', () => {
    basketService.isEnabled.and.returnValue(false);
    const tester = new RareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource with several types
    component.document = toRareDocument('Bacteria');
    tester.detectChanges();
    // then the button should not be displayed
    expect(tester.addToBasketButton).toBeNull();
  });

  it('should add/remove to/from basket', () => {
    const tester = new RareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource with several types
    const resource = toRareDocument('Bacteria');
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
