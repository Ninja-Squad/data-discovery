import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { RareBasketComponent } from './rare-basket.component';
import { ComponentTester, speculoosMatchers, TestButton } from 'ngx-speculoos';
import { Basket, BasketCreated, BasketItem, BasketService } from '../basket.service';
import { of, Subject } from 'rxjs';
import { NgbModalModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { LOCATION } from '../rare.module';

class RareBasketComponentTester extends ComponentTester<RareBasketComponent> {
  constructor() {
    super(RareBasketComponent);
  }

  get basketCounterAsText() {
    return this.element('.basket-counter.navbar-text');
  }

  get basketCounter() {
    return this.element('.basket-counter.navbar-nav') as TestButton;
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
    service = jasmine.createSpyObj<BasketService>('BasketService', ['getBasket', 'removeFromBasket', 'sendBasket']);
    service.getBasket.and.returnValue(basketEvents);
    location = jasmine.createSpyObj<Location>('Location', ['assign']);
    TestBed.configureTestingModule({
      imports: [NgbTooltipModule, NgbModalModule],
      declarations: [RareBasketComponent],
      providers: [
        { provide: BasketService, useValue: service },
        { provide: LOCATION, useValue: location }
      ]
    });
    jasmine.addMatchers(speculoosMatchers);
    tester = new RareBasketComponentTester();
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
    tester.detectChanges();
    expect(tester.basketCounterAsText).toContainText('0');

    // when hovering the navbar
    tester.basketCounterAsText.dispatchEventOfType('mouseenter');

    // then we should not have the tooltip displayed
    expect(tester.tooltip).toBeNull();

    // 1 item
    basketEvents.next({ items: [{ identifier: 'rosa' } as BasketItem] });
    tester.detectChanges();
    expect(tester.basketCounter).toContainText('1');

    // when hovering the navbar
    tester.basketCounter.dispatchEventOfType('mouseenter');

    // then we should have the tooltip displayed
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip.textContent).toBe('Click to view the item');

    tester.basketCounter.dispatchEventOfType('mouseleave');

    // several items
    basketEvents.next({ items: [{ identifier: 'rosa' } as BasketItem, { identifier: 'rosa rosae' } as BasketItem] });
    tester.detectChanges();
    expect(tester.basketCounter).toContainText('2');

    // when hovering the navbar
    tester.basketCounter.dispatchEventOfType('mouseenter');

    // then we should have the tooltip displayed
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip.textContent).toBe('Click to view the 2 items');
  });

  it('should open a summary modal on click', () => {
    tester.detectChanges();
    basketEvents.next({ items: [{ identifier: 'rosa', accession: 'Rosa' } as BasketItem] });
    tester.detectChanges();
    tester.basketCounter.click();

    expect(tester.modalTitle.textContent).toBe('Basket summary');
    expect(tester.modalBody.textContent).toContain('Rosa');

    // remove item from basket
    tester.removeItemFromBasket.click();
    expect(service.removeFromBasket).toHaveBeenCalledWith('rosa');
    basketEvents.next({ items: [] });
    tester.detectChanges();
    expect(tester.modalBody.textContent).not.toContain('Rosa');
    expect(tester.modalBody.textContent).toContain('Aucune accession');

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
    tester.detectChanges();
    basketEvents.next({ items: [{ identifier: 'rosa', accession: 'Rosa' } as BasketItem] });
    tester.detectChanges();
    tester.basketCounter.click();

    tester.sendBasket.click();
    tick();
    expect(service.sendBasket).toHaveBeenCalled();

    expect(tester.modalTitle).toBeNull();
    expect(location.assign).toHaveBeenCalledWith(`http://localhost:4201/baskets/${reference}`);
  }));
});
