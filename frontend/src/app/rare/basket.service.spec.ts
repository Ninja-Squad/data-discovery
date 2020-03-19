import { TestBed } from '@angular/core/testing';

import { Basket, BasketItem, BasketService } from './basket.service';
import { RareDocumentModel } from './rare-document.model';

describe('BasketService', () => {
  let service: BasketService;
  let mockGetItem: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    // Object.getPrototypeOf is needed to make the test succeed on Firefox
    mockGetItem = spyOn(Object.getPrototypeOf(window.localStorage), 'getItem');
    mockGetItem.and.returnValue('{ "items": [{ "accession": "a1", "contactEmail": "hello@lab.fr" }] }');
    service = TestBed.inject(BasketService);
  });

  it('should try to restore a basket when created', () => {
    expect(window.localStorage.getItem).toHaveBeenCalledWith('rare-basket');
    expect(service.basket.items.length).toBe(1);
    expect(service.basket.items[0].accession).toBe('a1');
    expect(service.basket.items[0].contactEmail).toBe('hello@lab.fr');
  });

  it('should not fail on badly stored basket', () => {
    mockGetItem.and.returnValue('badly stored basket');
    service.restoreBasketFromLocalStorage();
    expect(window.localStorage.getItem).toHaveBeenCalledWith('rare-basket');
    expect(service.basket.items.length).toBe(0);
  });

  it('should add an item to the basket', () => {
    service.basket.items = [];
    let actualBasket: Basket;
    service.getBasket().subscribe(basket => actualBasket = basket);
    service.addToBasket({ identifier: 'rosa', name: 'Rosa' } as RareDocumentModel);
    expect(actualBasket.items.length).toBe(1);
    expect(actualBasket.items[0].accession).toBe('rosa');
    expect(actualBasket.items[0].contactEmail).toBe('TODO');
    expect(actualBasket.items[0].name).toBe('Rosa');
  });

  it('should remove an item to the basket', () => {
    service.basket.items = [ { accession: 'rosa' } as BasketItem, { accession: 'rosa rosae' } as BasketItem];
    let actualBasket: Basket;
    service.getBasket().subscribe(basket => actualBasket = basket);
    service.removeFromBasket('rosa');
    expect(actualBasket.items.length).toBe(1);
    expect(actualBasket.items[0].accession).toBe('rosa rosae');
  });

  it('should notify when accession is in basket', () => {
    service.basket.items = [{ accession: 'rosa rosae' } as BasketItem];
    let actualIsInBasket: boolean;
    service.isAccessionInBasket({ identifier: 'rosa' } as RareDocumentModel)
      .subscribe(isInBasket => actualIsInBasket = isInBasket);
    expect(actualIsInBasket).toBe(false);
    service.addToBasket({ identifier: 'rosa', name: 'Rosa' } as RareDocumentModel);
    expect(actualIsInBasket).toBe(true);
    service.removeFromBasket('rosa');
    expect(actualIsInBasket).toBe(false);
  });

});
