import { TestBed } from '@angular/core/testing';

import { BasketComponent } from './basket.component';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test, vi, afterEach } from 'vitest';
import { createMock, MockObject } from '../../../../test/mock';
import { BasketItem, BasketService } from '../basket.service';
import { LOCATION } from '../../../location.service';
import { provideI18nTesting } from '../../../i18n/mock-18n';
import { provideDisabledNgbAnimation } from '../../../disable-animations';
import { BasketCreated, BasketSenderService } from '../basket-sender.service';
import { of } from 'rxjs';

class BasketComponentTester {
  readonly fixture = TestBed.createComponent(BasketComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly basketCounterAsText = page.getByCss('.basket-counter.navbar-text');
  readonly basketCounter = page.getByRole('button');
  readonly tooltip = page.getByCss('ngb-tooltip-window');
  readonly modalWindow = page.getByCss('ngb-modal-window');
  readonly modalBackdrop = page.getByCss('ngb-modal-backdrop');
  readonly modalBody = page.getByCss('.modal-body');
  readonly modalTitle = page.getByCss('.modal-title');
  readonly modalClose = page.getByCss('.btn-close');
  readonly sendBasket = page.getByCss('#send-basket');
  readonly eulaAgreement = page.getByCss('#eula-agreement');
  readonly eulaAgreementError = page.getByCss('#eula-agreement-error');
  readonly clearBasket = page.getByCss('#clear-basket');
  readonly removeItemFromBasket = page.getByCss('.fa-trash');
}

describe('BasketComponent', () => {
  let tester: BasketComponentTester;
  let service: BasketService;
  let basketSenderService: MockObject<BasketSenderService>;
  let location: MockObject<Location>;

  beforeEach(() => {
    basketSenderService = createMock(BasketSenderService);
    location = createMock(Location);
    location.assign = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        provideDisabledNgbAnimation(),
        { provide: BasketSenderService, useValue: basketSenderService },
        { provide: LOCATION, useValue: location }
      ]
    });

    service = TestBed.inject(BasketService);
    service.clearBasket();
    vi.spyOn(service, 'isEnabled').mockReturnValue(true);
  });

  afterEach(() => {
    if (tester.modalWindow.length) {
      tester.modalWindow.element().parentElement.removeChild(tester.modalWindow.element());
    }
    if (tester.modalBackdrop.length) {
      tester.modalBackdrop.element().parentElement.removeChild(tester.modalBackdrop.element());
    }
    vi.useRealTimers();
  });

  test('should display the number of items', async () => {
    tester = new BasketComponentTester();
    // no item
    await expect.element(tester.basketCounterAsText).toHaveTextContent('0');

    // when hovering the navbar
    await tester.basketCounterAsText.hover();

    // then we should not have the tooltip displayed
    await expect.element(tester.tooltip).not.toBeInTheDocument();

    // 1 item
    service.addToBasket({ accession: { url: 'rosa', name: 'rosa' } } as BasketItem);
    await expect.element(tester.basketCounter).toHaveTextContent('1');

    // when hovering the navbar
    await tester.basketCounter.hover();

    // then we should have the tooltip displayed
    await expect.element(tester.tooltip).toBeInTheDocument();
    await expect.element(tester.tooltip).toHaveTextContent('Click to view the item');

    await tester.basketCounter.unhover();

    // several items
    service.addToBasket({ accession: { url: 'rosa rosae', name: 'rosa rosae' } } as BasketItem);
    await expect.element(tester.basketCounter).toHaveTextContent('2');

    // when hovering the navbar
    await tester.basketCounter.hover();

    // then we should have the tooltip displayed
    await expect.element(tester.tooltip).toBeInTheDocument();
    await expect.element(tester.tooltip).toHaveTextContent('Click to view the 2 items');
  });

  test('should open a summary modal on click', async () => {
    tester = new BasketComponentTester();

    service.addToBasket({
      accession: { url: 'rosa', name: 'Rosa', taxon: 'TheTaxon' }
    } as BasketItem);
    await tester.basketCounter.click();

    await expect.element(tester.modalTitle).toHaveTextContent('Order summary');
    await expect.element(tester.modalBody).toHaveTextContent('Rosa');
    await expect.element(tester.modalBody).toHaveTextContent('TheTaxon');

    // remove item from basket
    await tester.removeItemFromBasket.click();

    await expect.element(tester.modalBody).not.toHaveTextContent('Rosa');
    await expect.element(tester.modalBody).toHaveTextContent('No item');

    await tester.modalClose.click();
    await expect.element(tester.modalTitle).not.toBeInTheDocument();
  });

  test('should send the basket', async () => {
    basketSenderService.sendBasket.mockReturnValue(of({ reference: 'ABCDEFGH' } as BasketCreated));

    tester = new BasketComponentTester();
    const reference = 'ABCDEFGH';
    service.addToBasket({ accession: { url: 'rosa', name: 'rosa' } } as BasketItem);
    await expect.element(tester.eulaAgreementError).not.toBeInTheDocument();
    await expect.element(tester.basketCounter).toBeVisible();
    await tester.basketCounter.click();

    await tester.sendBasket.click();

    const basket = service.basket();

    // EULA agreement is required
    await expect.element(tester.eulaAgreementError).toBeVisible();
    // agree
    await tester.eulaAgreement.click();
    await tester.sendBasket.click();

    expect(basketSenderService.sendBasket).toHaveBeenCalledWith(basket);
    expect(service.basket().items.length).toBe(0);

    await expect.element(tester.modalTitle).not.toBeInTheDocument();
    expect(location.assign).toHaveBeenCalledWith(
      `http://localhost:4201/rare-basket/baskets/${reference}`
    );
  });

  test('should clear the basket', async () => {
    tester = new BasketComponentTester();
    service.addToBasket({ accession: { url: 'rosa', name: 'rosa' } } as BasketItem);

    await tester.basketCounter.click();

    await tester.clearBasket.click();
    expect(service.basket().items.length).toBe(0);
  });

  test('should not display if the basket feature is disabled', async () => {
    vi.mocked(service.isEnabled).mockReturnValue(false);
    tester = new BasketComponentTester();
    await expect.element(tester.basketCounter).not.toBeInTheDocument();
    await expect.element(tester.basketCounterAsText).not.toBeInTheDocument();
  });
});
