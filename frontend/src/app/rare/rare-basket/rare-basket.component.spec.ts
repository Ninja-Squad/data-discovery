import { TestBed } from '@angular/core/testing';

import { RareBasketComponent } from './rare-basket.component';
import { ComponentTester, speculoosMatchers, TestButton } from 'ngx-speculoos';
import { Basket, BasketItem, BasketService } from '../basket.service';
import { Subject } from 'rxjs';
import { NgbModalModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

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
  const basketEvents = new Subject<Basket>();

  beforeEach(() => {
    service = jasmine.createSpyObj<BasketService>('BasketService', ['getBasket', 'removeFromBasket']);
    service.getBasket.and.returnValue(basketEvents);
    TestBed.configureTestingModule({
      imports: [NgbTooltipModule, NgbModalModule],
      declarations: [RareBasketComponent],
      providers: [{ provide: BasketService, useValue: service }]
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
    basketEvents.next({ items: [{ name: 'rosa' } as BasketItem] });
    tester.detectChanges();
    expect(tester.basketCounter).toContainText('1');

    // when hovering the navbar
    tester.basketCounter.dispatchEventOfType('mouseenter');

    // then we should have the tooltip displayed
    expect(tester.tooltip).not.toBeNull();
    expect(tester.tooltip.textContent).toBe('Click to view the item');

    tester.basketCounter.dispatchEventOfType('mouseleave');

    // several items
    basketEvents.next({ items: [{ name: 'rosa' } as BasketItem, { name: 'rosa rosae' } as BasketItem] });
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
    basketEvents.next({ items: [{ accession: 'rosa', name: 'Rosa' } as BasketItem] });
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

    tester.modalClose.click();
    expect(tester.modalTitle).toBeNull();
  });
});
