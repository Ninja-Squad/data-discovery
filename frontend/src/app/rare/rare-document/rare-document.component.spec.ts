import { TestBed } from '@angular/core/testing';
import { ComponentTester } from 'ngx-speculoos';

import { RareDocumentComponent } from './rare-document.component';
import { toRareDocument } from '../../models/test-model-generators';
import { BasketService } from '../../urgi-common/basket/basket.service';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RareDocumentModel } from '../rare-document.model';

@Component({
  template: '<dd-document [document]="document()" />',
  imports: [RareDocumentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  document = signal<RareDocumentModel>(toRareDocument('Bacteria'));
}

class RareDocumentComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
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

describe('RareDocumentComponent', () => {
  let basketService: BasketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting()]
    });

    basketService = TestBed.inject(BasketService);
    basketService.clearBasket();
    spyOn(basketService, 'isEnabled').and.returnValue(true);
  });

  it('should display a resource', async () => {
    const tester = new RareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource
    const resource = component.document();
    await tester.stable();

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

  it('should have a link to portal if data url is null or empty', async () => {
    const tester = new RareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource with no data url
    const resource = toRareDocument('Bacteria');
    resource.dataURL = null;
    component.document.set(resource);
    await tester.stable();

    // then we should link to portal url
    expect(tester.link.attr('href')).toBe(resource.portalURL);
  });

  it('should display several types properly', async () => {
    const tester = new RareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource with several types
    const resource = toRareDocument('Bacteria');
    resource.materialType = ['type1', 'type2'];
    component.document.set(resource);
    await tester.stable();

    // then we should list them
    expect(tester.type).toContainText('type1, type2');
  });

  it('should not have the basket button if the feature is disabled', async () => {
    (basketService.isEnabled as jasmine.Spy).and.returnValue(false);
    const tester = new RareDocumentComponentTester();

    // given a resource
    await tester.stable();
    // then the button should not be displayed
    expect(tester.addToBasketButton).toBeNull();
  });

  it('should add/remove to/from basket', async () => {
    const tester = new RareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource
    await tester.stable();

    // when hovering the add to basket button
    await tester.addToBasketButton.dispatchEventOfType('mouseenter');

    // then we should have the tooltip displayed
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip.textContent).toBe('Add to basket');

    await tester.addToBasketButton.click();

    // then we should have added the item to the basket
    expect(basketService.isAccessionInBasket(component.document())).toBeTrue();

    // we switched the button to display a green one
    expect(tester.addToBasketButton).toBeNull();
    expect(tester.removeFromBasketButton).not.toBeNull();

    // when hovering the remove from basket button
    await tester.removeFromBasketButton.dispatchEventOfType('mouseenter');

    // then we should have the tooltip displayed
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip.textContent).toBe('Remove from basket');

    await tester.removeFromBasketButton.click();
    expect(basketService.isAccessionInBasket(component.document())).toBeFalse();

    // we switched back the button
    expect(tester.removeFromBasketButton).toBeNull();
    expect(tester.addToBasketButton).not.toBeNull();
  });
});
