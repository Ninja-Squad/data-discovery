import { TestBed } from '@angular/core/testing';

import { BasketService } from './basket.service';

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
});
