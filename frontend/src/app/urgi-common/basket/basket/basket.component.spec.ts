import { TestBed } from '@angular/core/testing';

import { BasketComponent } from './basket.component';
import { ComponentTester, createMock } from 'ngx-speculoos';
import { BasketService } from '../basket.service';
import { LOCATION } from '../../../location.service';
import { provideI18nTesting } from '../../../i18n/mock-18n.spec';
import { provideDisabledNgbAnimation } from '../../../disable-animations';
import { OrderableDocumentModel } from '../../../models/document.model';
import { BasketCreated, BasketSenderService } from '../basket-sender.service';
import { of } from 'rxjs';

class BasketComponentTester extends ComponentTester<BasketComponent> {
  constructor() {
    super(BasketComponent);
  }

  get basketCounterAsText() {
    return this.element('.basket-counter.navbar-text');
  }

  get basketCounter() {
    return this.button('.basket-counter.btn');
  }

  get tooltip() {
    return document.querySelector('ngb-tooltip-window');
  }

  get modalWindow(): HTMLElement {
    return document.querySelector('ngb-modal-window');
  }

  get modalBackdrop(): HTMLElement {
    return document.querySelector('ngb-modal-backdrop');
  }

  get modalBody(): HTMLElement {
    return document.querySelector('.modal-body');
  }

  get modalClose(): HTMLElement {
    return document.querySelector('.btn-close');
  }

  get sendBasket(): HTMLElement {
    return document.querySelector('#send-basket');
  }

  get eulaAgreement(): HTMLElement {
    return document.querySelector('#eula-agreement');
  }

  get eulaAgreementError(): HTMLElement {
    return document.querySelector('#eula-agreement-error');
  }

  get clearBasket(): HTMLElement {
    return document.querySelector('#clear-basket');
  }

  get removeItemFromBasket(): HTMLElement {
    return document.querySelector('.fa-trash');
  }

  get modalTitle(): HTMLElement {
    return document.querySelector('.modal-title');
  }
}

describe('BasketComponent', () => {
  let tester: BasketComponentTester;
  let service: BasketService;
  let basketSenderService: jasmine.SpyObj<BasketSenderService>;
  let location: jasmine.SpyObj<Location>;

  beforeEach(() => {
    basketSenderService = createMock(BasketSenderService);
    location = jasmine.createSpyObj<Location>('Location', ['assign']);
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
    spyOn(service, 'isEnabled').and.returnValue(true);
  });

  afterEach(() => {
    if (tester.modalWindow) {
      tester.modalWindow.parentElement.removeChild(tester.modalWindow);
    }
    if (tester.modalBackdrop) {
      tester.modalBackdrop.parentElement.removeChild(tester.modalBackdrop);
    }

    jasmine.clock().uninstall();
  });

  it('should display the number of items', async () => {
    tester = new BasketComponentTester();
    await tester.stable();
    // no item
    expect(tester.basketCounterAsText).toContainText('0');

    // when hovering the navbar
    await tester.basketCounterAsText.dispatchEventOfType('mouseenter');

    // then we should not have the tooltip displayed
    expect(tester.tooltip).toBeNull();

    // 1 item
    service.addToBasket({ identifier: 'rosa', name: 'rosa' } as OrderableDocumentModel);
    await tester.stable();
    expect(tester.basketCounter).toContainText('1');

    // when hovering the navbar
    await tester.basketCounter.dispatchEventOfType('mouseenter');

    // then we should have the tooltip displayed
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip.textContent).toBe('Click to view the item');

    await tester.basketCounter.dispatchEventOfType('mouseleave');

    // several items
    service.addToBasket({ identifier: 'rosa rosae', name: 'rosa rosae' } as OrderableDocumentModel);
    await tester.stable();
    expect(tester.basketCounter).toContainText('2');

    // when hovering the navbar
    await tester.basketCounter.dispatchEventOfType('mouseenter');

    // then we should have the tooltip displayed
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip.textContent).toBe('Click to view the 2 items');
  });

  it('should open a summary modal on click', async () => {
    tester = new BasketComponentTester();
    await tester.stable();

    service.addToBasket({ identifier: 'rosa', name: 'Rosa' } as OrderableDocumentModel);
    await tester.stable();
    await tester.basketCounter.click();

    expect(tester.modalTitle.textContent).toBe('Order summary');
    expect(tester.modalBody.textContent).toContain('Rosa');

    // remove item from basket
    await tester.removeItemFromBasket.click();
    await tester.stable();

    expect(tester.modalBody.textContent).not.toContain('Rosa');
    expect(tester.modalBody.textContent).toContain('No item');

    await tester.modalClose.click();
    expect(tester.modalTitle).toBeNull();
  });

  it('should send the basket', async () => {
    jasmine.clock().install();
    jasmine.clock().mockDate();
    basketSenderService.sendBasket.and.returnValue(of({ reference: 'ABCDEFGH' } as BasketCreated));

    tester = new BasketComponentTester();
    await tester.stable();
    const reference = 'ABCDEFGH';
    service.addToBasket({ identifier: 'rosa', name: 'rosa' } as OrderableDocumentModel);
    await tester.stable();
    expect(tester.eulaAgreementError).toBeNull();
    await tester.basketCounter.click();

    await tester.sendBasket.click();
    jasmine.clock().tick(400); // to resolve the animation
    await tester.stable();

    const basket = service.basket();

    // EULA agreement is required
    expect(tester.eulaAgreementError).not.toBeNull();
    // agree
    await tester.eulaAgreement.click();
    await tester.sendBasket.click();

    expect(basketSenderService.sendBasket).toHaveBeenCalledWith(basket);
    expect(service.basket().items.length).toBe(0);

    expect(tester.modalTitle).toBeNull();
    expect(location.assign).toHaveBeenCalledWith(
      `http://localhost:4201/rare-basket/baskets/${reference}`
    );
  });

  it('should clear the basket', async () => {
    tester = new BasketComponentTester();
    await tester.stable();
    service.addToBasket({ identifier: 'rosa', name: 'rosa' } as OrderableDocumentModel);

    await tester.stable();
    await tester.basketCounter.click();

    await tester.clearBasket.click();
    expect(service.basket().items.length).toBe(0);
  });

  it('should not display if the basket feature is disabled', async () => {
    (service.isEnabled as jasmine.Spy).and.returnValue(false);
    tester = new BasketComponentTester();
    await tester.stable();
    expect(tester.basketCounter).toBeNull();
    expect(tester.basketCounterAsText).toBeNull();
  });
});
