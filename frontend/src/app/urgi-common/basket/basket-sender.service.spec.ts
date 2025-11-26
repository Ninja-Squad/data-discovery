import { TestBed } from '@angular/core/testing';

import { Basket } from './basket.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BasketCreated, BasketSenderService } from './basket-sender.service';

describe('BasketService', () => {
  let service: BasketSenderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()]
    });

    service = TestBed.inject(BasketSenderService);
  });

  it('should send the basket', () => {
    const basket: Basket = {
      items: [
        {
          accession: {
            identifier: 'rosa',
            name: 'Rosa@'
          },
          accessionHolder: 'ah1'
        }
      ]
    };

    let actualBasketCreated: BasketCreated;
    service.sendBasket(basket).subscribe(basketCreated => (actualBasketCreated = basketCreated));

    const http = TestBed.inject(HttpTestingController);
    const testRequest = http.expectOne({
      method: 'POST',
      url: 'http://localhost:4201/rare-basket/api/baskets'
    });
    expect(testRequest.request.body).toBe(basket);
    const reference = 'ABCDEFGH';
    testRequest.flush({
      reference
    } as BasketCreated);

    expect(actualBasketCreated!.reference).toBe(reference);
  });
});
