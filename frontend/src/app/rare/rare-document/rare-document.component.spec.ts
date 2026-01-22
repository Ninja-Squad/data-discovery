import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';

import { RareDocumentComponent } from './rare-document.component';
import { toRareDocument } from '../../models/test-model-generators';
import { BasketService } from '../../urgi-common/basket/basket.service';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RareDocumentModel } from '../rare-document.model';
import { BasketAdapter } from '../../urgi-common/basket/basket-adapter.service';
import { RareBasketAdapter } from '../rare-basket-adapter.service';

@Component({
  template: '<dd-document [document]="document()" />',
  imports: [RareDocumentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dd-rare-document-tester'
})
class TestComponent {
  readonly document = signal<RareDocumentModel>(toRareDocument('Bacteria'));
}

class RareDocumentComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly title = page.getByRole('heading', { level: 3 });
  readonly link = page.getByCss('.main-link');
  readonly datasourceLink = page.getByCss('.datasource-link');
  readonly taxon = page.getByCss('.taxon');
  readonly type = page.getByCss('.type');
  readonly description = page.getByCss('.description');
  readonly fullDescriptionButton = page.getByCss('.description button');
  readonly fullDescription = page.getByCss('.full-description');
  readonly shortDescriptionButton = page.getByCss('.full-description button');
  readonly addToBasketButton = page.getByCss('button.btn-outline-dark');
  readonly removeFromBasketButton = page.getByCss('button.btn-success');

  get tooltip() {
    return document.querySelector('ngb-tooltip-window');
  }
}

describe('RareDocumentComponent', () => {
  let basketService: BasketService;
  let basketAdapter: BasketAdapter;
  let spyIsEnabled: Mock<() => boolean>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: BasketAdapter, useClass: RareBasketAdapter }]
    });

    basketAdapter = TestBed.inject(BasketAdapter);
    basketService = TestBed.inject(BasketService);
    basketService.clearBasket();
    spyIsEnabled = vi.spyOn(basketService, 'isEnabled');
    spyIsEnabled.mockReturnValue(true);
  });

  test('should display a resource', async () => {
    const tester = new RareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource
    const resource = component.document();
    await tester.fixture.whenStable();

    // then we should display it
    await expect.element(tester.title).toHaveTextContent(resource.name);
    await expect.element(tester.title).toHaveTextContent(resource.pillarName);
    await expect.element(tester.link).toHaveTextContent(resource.name);
    await expect(tester.link.element().getAttribute('href')).toBe(resource.dataURL);
    await expect(tester.link.element().getAttribute('target')).toBe('_blank');
    await expect.element(tester.datasourceLink).toHaveTextContent(resource.databaseSource);
    await expect(tester.datasourceLink.element().getAttribute('href')).toBe(resource.portalURL);
    await expect(tester.datasourceLink.element().getAttribute('target')).toBe('_blank');
    for (const text of resource.taxon) {
      await expect.element(tester.taxon).toHaveTextContent(text);
    }
    await expect.element(tester.type).toHaveTextContent(resource.materialType[0]);
    await expect.element(tester.description).toHaveTextContent(resource.description);
    await expect.element(tester.fullDescriptionButton).not.toBeInTheDocument();
    await expect.element(tester.fullDescription).not.toBeInTheDocument();
    await expect.element(tester.shortDescriptionButton).not.toBeInTheDocument();
    await expect.element(tester.removeFromBasketButton).not.toBeInTheDocument();
    await expect.element(tester.addToBasketButton).toBeInTheDocument();
  });

  test('should have a link to portal if data url is null or empty', async () => {
    const tester = new RareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource with no data url
    const resource = toRareDocument('Bacteria');
    resource.dataURL = null;
    component.document.set(resource);
    await tester.fixture.whenStable();

    // then we should link to portal url
    await expect(tester.link.element().getAttribute('href')).toBe(resource.portalURL);
  });

  test('should display several types properly', async () => {
    const tester = new RareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource with several types
    const resource = toRareDocument('Bacteria');
    resource.materialType = ['type1', 'type2'];
    component.document.set(resource);
    await tester.fixture.whenStable();

    // then we should list them
    await expect.element(tester.type).toHaveTextContent('type1, type2');
  });

  test('should not have the basket button if the feature is disabled', async () => {
    spyIsEnabled.mockReturnValue(false);
    const tester = new RareDocumentComponentTester();

    // given a resource
    await tester.fixture.whenStable();
    // then the button should not be displayed
    await expect.element(tester.addToBasketButton).not.toBeInTheDocument();
  });

  test('should add/remove to/from basket', async () => {
    const tester = new RareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource
    await tester.fixture.whenStable();

    // when hovering the add to basket button
    await tester.addToBasketButton.hover();

    // then we should have the tooltip displayed
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip?.textContent).toBe('Add to basket');

    await tester.addToBasketButton.click();

    // then we should have added the item to the basket
    expect(basketService.isItemInBasket(basketAdapter.asBasketItem(component.document())!)).toBe(
      true
    );

    // we switched the button to display a green one
    await expect.element(tester.addToBasketButton).not.toBeInTheDocument();
    await expect.element(tester.removeFromBasketButton).toBeInTheDocument();

    // when hovering the remove from basket button
    await tester.removeFromBasketButton.hover();

    // then we should have the tooltip displayed
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip?.textContent).toBe('Remove from basket');

    await tester.removeFromBasketButton.click();
    expect(basketService.isItemInBasket(basketAdapter.asBasketItem(component.document())!)).toBe(
      false
    );

    // we switched back the button
    await expect.element(tester.removeFromBasketButton).not.toBeInTheDocument();
    await expect.element(tester.addToBasketButton).toBeInTheDocument();
  });
});
