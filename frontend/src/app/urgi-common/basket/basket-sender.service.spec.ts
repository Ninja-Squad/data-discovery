import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';

import { Basket, BasketItem } from './basket.service';
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

  test('should send the basket', () => {
    const basket: Basket = {
      items: [
        {
          accession: {
            url: 'rosa',
            name: 'Rosa@'
          },
          accessionHolder: 'ah1'
        } as BasketItem
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
