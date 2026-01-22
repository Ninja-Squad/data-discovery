import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';

import { FaidareDocumentComponent } from './faidare-document.component';
import { toFaidareDocument } from '../../models/test-model-generators';
import { BasketService } from '../../urgi-common/basket/basket.service';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FaidareDocumentModel } from '../faidare-document.model';
import { BasketAdapter } from '../../urgi-common/basket/basket-adapter.service';
import { FaidareBasketAdapter } from '../faidare-basket-adapter.service';
import { AnalyticsNavigation, AnalyticsService } from '../../analytics.service';
import { createMock, MockObject } from '../../../test/mock';
import { By } from '@angular/platform-browser';

@Component({
  template: '<dd-document [document]="document()" />',
  imports: [FaidareDocumentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dd-faidare-document-tester'
})
class TestComponent {
  readonly document = signal<FaidareDocumentModel>(toFaidareDocument('Bacteria'));
}

class FaidareDocumentComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly root = page.elementLocator(this.fixture.nativeElement);

  readonly title = page.getByCss('h3');
  readonly link = page.getByCss('.main-link');
  readonly type = page.getByCss('.type');
  readonly species = page.getByCss('.species');
  readonly description = page.getByCss('.description');
  readonly fullDescriptionButton = page.getByCss('.description button');
  readonly fullDescription = page.getByCss('.full-description');
  readonly shortDescriptionButton = page.getByCss('.full-description button');
  readonly addToBasketButton = page.getByCss('button.btn-outline-dark');
  readonly removeFromBasketButton = page.getByCss('button.btn-success');

  get tooltip() {
    return document.querySelector('ngb-tooltip-window');
  }

  get linkDebugElement() {
    return this.fixture.debugElement.query(By.css('.main-link'));
  }
}

describe('FaidareDocumentComponent', () => {
  let basketService: BasketService;
  let basketAdapter: BasketAdapter;
  let analyticsService: MockObject<AnalyticsService>;
  let spyIsEnabled: Mock<() => boolean>;

  beforeEach(() => {
    analyticsService = createMock(AnalyticsService);

    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        { provide: BasketAdapter, useClass: FaidareBasketAdapter },
        { provide: AnalyticsService, useValue: analyticsService }
      ]
    });

    basketAdapter = TestBed.inject(BasketAdapter);
    basketService = TestBed.inject(BasketService);
    basketService.clearBasket();
    spyIsEnabled = vi.spyOn(basketService, 'isEnabled');
    spyIsEnabled.mockReturnValue(true);
  });

  test('should display a resource', async () => {
    const tester = new FaidareDocumentComponentTester();

    // given a resource
    const resource = tester.componentInstance.document();
    await tester.fixture.whenStable();

    // then we should display it
    await expect.element(tester.title).toHaveTextContent(resource.name);
    await expect.element(tester.title).toHaveTextContent(resource.databaseName);
    await expect.element(tester.link).toHaveTextContent(resource.name);
    await expect(tester.link.element().getAttribute('href')).toBe(resource.url);
    await expect(tester.link.element().getAttribute('target')).toBe('_blank');
    await expect.element(tester.type).toHaveTextContent(resource.entryType);
    for (const text of resource.species) {
      await expect.element(tester.species).toHaveTextContent(text);
    }
    await expect.element(tester.description).toHaveTextContent(resource.description);
    await expect.element(tester.fullDescriptionButton).not.toBeInTheDocument();
    await expect.element(tester.fullDescription).not.toBeInTheDocument();
    await expect.element(tester.shortDescriptionButton).not.toBeInTheDocument();
    await expect.element(tester.removeFromBasketButton).not.toBeInTheDocument();
    await expect.element(tester.addToBasketButton).toBeInTheDocument();
  });

  test('should not have the basket button if the feature is disabled', async () => {
    spyIsEnabled.mockReturnValue(false);
    const tester = new FaidareDocumentComponentTester();

    // given a resource
    await tester.fixture.whenStable();
    // then the button should not be displayed
    await expect.element(tester.addToBasketButton).not.toBeInTheDocument();
  });

  test('should add/remove to/from basket', async () => {
    const tester = new FaidareDocumentComponentTester();
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

  test('should trace navigations', async () => {
    const tester = new FaidareDocumentComponentTester();

    await expect.element(tester.link).toBeVisible();

    // do not click on the link, because it causes a real navigation
    // and apparently changing the href of the link causes issues with the tests
    tester.linkDebugElement.triggerEventHandler('click');

    const expectedNavigation: AnalyticsNavigation = {
      toUrl: 'http://brc4env.fr',
      databaseName: 'BRC4Env',
      node: 'Data provider',
      species: 'Bacteria species',
      entryType: 'Specimen'
    };
    expect(analyticsService.traceExternalNavigation).toHaveBeenCalledWith(expectedNavigation);
  });
});
