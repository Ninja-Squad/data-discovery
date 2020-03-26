import { TestBed } from '@angular/core/testing';

import { Basket, BasketCreated, BasketItem, BasketService } from './basket.service';
import { RareDocumentModel } from './rare-document.model';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('BasketService', () => {
  let service: BasketService;
  let mockGetItem: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
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
    service.basket.items = [];
    mockGetItem.and.returnValue('badly stored basket');
    service.restoreBasketFromLocalStorage();
    expect(window.localStorage.getItem).toHaveBeenCalledWith('rare-basket');
    expect(service.basket.items.length).toBe(0);
  });

  it('should add an item to the basket', () => {
    service.basket.items = [];
    let actualBasket: Basket;
    service.getBasket().subscribe(basket => (actualBasket = basket));
    service.addToBasket({ identifier: 'rosa', name: 'Rosa' } as RareDocumentModel);
    expect(actualBasket.items.length).toBe(1);
    expect(actualBasket.items[0].identifier).toBe('rosa');
    expect(actualBasket.items[0].accession).toBe('Rosa');
    expect(actualBasket.items[0].contactEmail).toBe('contact1@grc1.fr');
  });

  it('should remove an item from the basket', () => {
    service.basket.items = [{ identifier: 'rosa' } as BasketItem, { identifier: 'rosa rosae' } as BasketItem];
    let actualBasket: Basket;
    service.getBasket().subscribe(basket => (actualBasket = basket));
    service.removeFromBasket('rosa');
    expect(actualBasket.items.length).toBe(1);
    expect(actualBasket.items[0].identifier).toBe('rosa rosae');
  });

  it('should notify when accession is in basket', () => {
    service.basket.items = [{ accession: 'rosa rosae' } as BasketItem];
    let actualIsInBasket: boolean;
    let counter = 0;
    service.isAccessionInBasket({ identifier: 'rosa' } as RareDocumentModel).subscribe(isInBasket => {
      counter++;
      actualIsInBasket = isInBasket;
    });
    expect(actualIsInBasket).toBe(false);
    expect(counter).toBe(1);
    service.addToBasket({ identifier: 'rosa', name: 'Rosa' } as RareDocumentModel);
    expect(actualIsInBasket).toBe(true);
    expect(counter).toBe(2);
    service.removeFromBasket('rosa');
    expect(actualIsInBasket).toBe(false);
    expect(counter).toBe(3);
    // do not re-emit when value is the same
    service.removeFromBasket('rosa rosae');
    expect(actualIsInBasket).toBe(false);
    expect(counter).toBe(3);
  });

  it('should send the basket and clear the items', () => {
    service.basket = { items: [{ identifier: 'rosa', accession: 'Rosa', contactEmail: 'john@mail.com' }] };
    let actualBasket: BasketCreated;
    service.sendBasket().subscribe(basketCreated => (actualBasket = basketCreated));
    let emittedBasket: Basket;
    service.getBasket().subscribe(basket => (emittedBasket = basket));

    const http = TestBed.inject(HttpTestingController);
    const testRequest = http.expectOne({
      method: 'POST',
      url: 'http://localhost:4201/api/baskets'
    });
    expect(testRequest.request.body).toBe(service.basket);
    const reference = 'ABCDEFGH';
    testRequest.flush({
      reference
    } as BasketCreated);

    expect(actualBasket.reference).toBe(reference);
    expect(emittedBasket.items.length).toBe(0);
  });
});
