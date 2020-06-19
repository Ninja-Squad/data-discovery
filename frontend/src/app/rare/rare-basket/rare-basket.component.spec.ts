import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { RareBasketComponent } from './rare-basket.component';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';
import { Basket, BasketCreated, BasketItem, BasketService } from '../basket.service';
import { of, Subject } from 'rxjs';
import { NgbModalModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { LOCATION } from '../rare.module';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';

class RareBasketComponentTester extends ComponentTester<RareBasketComponent> {
  constructor() {
    super(RareBasketComponent);
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
    return document.querySelector('.close');
  }

  get sendBasket(): HTMLElement {
    return document.querySelector('#send-basket');
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

describe('RareBasketComponent', () => {
  let tester: RareBasketComponentTester;
  let service: jasmine.SpyObj<BasketService>;
  let location: jasmine.SpyObj<Location>;
  const basketEvents = new Subject<Basket>();

  beforeEach(() => {
    service = jasmine.createSpyObj<BasketService>('BasketService', ['getBasket', 'removeFromBasket', 'sendBasket', 'clearBasket']);
    service.getBasket.and.returnValue(basketEvents);
    location = jasmine.createSpyObj<Location>('Location', ['assign']);
    TestBed.configureTestingModule({
      imports: [NgbTooltipModule, NgbModalModule, I18nTestingModule],
      declarations: [RareBasketComponent],
      providers: [
        { provide: BasketService, useValue: service },
        { provide: LOCATION, useValue: location }
      ]
    });
    jasmine.addMatchers(speculoosMatchers);
    tester = new RareBasketComponentTester();
    tester.detectChanges();
  });

  afterEach(() => {
    if (tester.modalWindow) {
      tester.modalWindow.parentElement.removeChild(tester.modalWindow);
    }
    if (tester.modalBackdrop) {
      tester.modalBackdrop.parentElement.removeChild(tester.modalBackdrop);
    }
  });

  it('should display the number of items', () => {
    // no item
    expect(tester.basketCounterAsText).toContainText('0');

    // when hovering the navbar
    tester.basketCounterAsText.dispatchEventOfType('mouseenter');

    // then we should not have the tooltip displayed
    expect(tester.tooltip).toBeNull();

    // 1 item
    basketEvents.next({ items: [{ accession: { identifier: 'rosa' } } as BasketItem] });
    tester.detectChanges();
    expect(tester.basketCounter).toContainText('1');

    // when hovering the navbar
    tester.basketCounter.dispatchEventOfType('mouseenter');

    // then we should have the tooltip displayed
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip.textContent).toBe('Click to view the item');

    tester.basketCounter.dispatchEventOfType('mouseleave');

    // several items
    basketEvents.next({
      items: [{ accession: { identifier: 'rosa' } } as BasketItem, { accession: { identifier: 'rosa rosae' } } as BasketItem]
    });
    tester.detectChanges();
    expect(tester.basketCounter).toContainText('2');

    // when hovering the navbar
    tester.basketCounter.dispatchEventOfType('mouseenter');

    // then we should have the tooltip displayed
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip.textContent).toBe('Click to view the 2 items');
  });

  it('should open a summary modal on click', () => {
    basketEvents.next({ items: [{ accession: { identifier: 'rosa', name: 'Rosa' } } as BasketItem] });
    tester.detectChanges();
    tester.basketCounter.click();

    expect(tester.modalTitle.textContent).toBe('Order summary');
    expect(tester.modalBody.textContent).toContain('Rosa');

    // remove item from basket
    tester.removeItemFromBasket.click();
    expect(service.removeFromBasket).toHaveBeenCalledWith('rosa');
    basketEvents.next({ items: [] });
    tester.detectChanges();
    expect(tester.modalBody.textContent).not.toContain('Rosa');
    expect(tester.modalBody.textContent).toContain('No item');

    tester.modalClose.click();
    expect(tester.modalTitle).toBeNull();
  });

  it('should send the basket', fakeAsync(() => {
    const reference = 'ABCDEFGH';
    service.sendBasket.and.returnValue(
      of({
        reference
      } as BasketCreated)
    );
    basketEvents.next({ items: [{ accession: { identifier: 'rosa', name: 'Rosa' } } as BasketItem] });
    tester.detectChanges();
    tester.basketCounter.click();

    tester.sendBasket.click();
    tick();
    expect(service.sendBasket).toHaveBeenCalled();

    expect(tester.modalTitle).toBeNull();
    expect(location.assign).toHaveBeenCalledWith(`http://localhost:4201/rare-basket/baskets/${reference}`);
  }));

  it('should clear the basket', () => {
    basketEvents.next({ items: [{ accession: { identifier: 'rosa', name: 'Rosa' } } as BasketItem] });
    tester.detectChanges();
    tester.basketCounter.click();

    tester.clearBasket.click();
    expect(service.clearBasket).toHaveBeenCalled();
  });
});
