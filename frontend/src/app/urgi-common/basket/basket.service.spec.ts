import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { BasketItem, BasketService } from './basket.service';

describe('BasketService', () => {
  let service: BasketService;
  let mockGetItem: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    // Object.getPrototypeOf is needed to make the test succeed on Firefox
    mockGetItem = vi.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem');
    mockGetItem.mockReturnValue(
      '{ "items": [{ "accession": { "name": "A1" , "url": "a1" }, "accessionHolder": "AH1" }] }'
    );
  });

  describe('with valid value in local storage', () => {
    beforeEach(() => {
      mockGetItem.mockReturnValue(
        '{ "items": [{ "accession": { "name": "A1" , "url": "a1" }, "accessionHolder": "AH1" }] }'
      );
      service = TestBed.inject(BasketService);
    });

    test('should try to restore a basket when created', () => {
      expect(window.localStorage.getItem).toHaveBeenCalledWith('rare-basket');
      const basket = service.basket();
      expect(basket.items.length).toBe(1);
      expect(basket.items[0].accession.url).toBe('a1');
      expect(basket.items[0].accession.name).toBe('A1');
      expect(basket.items[0].accessionHolder).toBe('AH1');
    });

    test('should add an item to the basket', () => {
      service.clearBasket();
      const item = {
        accession: {
          url: 'rosa',
          name: 'Rosa'
        },
        accessionHolder: 'AH1'
      } as BasketItem;
      service.addToBasket(item);
      const basket = service.basket();
      expect(basket.items).toEqual([item]);
    });

    test('should not add an item to the basket twice', () => {
      service.clearBasket();
      const item = {
        accession: {
          identifier: 'rosa',
          name: 'Rosa'
        },
        accessionHolder: 'AH1'
      } as BasketItem;
      service.addToBasket(item);
      // second time with same item
      service.addToBasket(item);
      const basket = service.basket();
      expect(basket.items).toEqual([item]);
    });

    test('should remove an item from the basket', () => {
      service.clearBasket();
      const item1 = {
        accession: {
          url: 'rosa',
          name: 'Rosa'
        }
      } as BasketItem;
      const item2 = {
        accession: {
          url: 'rosa rosae',
          name: 'Rosa rosae'
        }
      } as BasketItem;
      service.addToBasket(item1);
      service.addToBasket(item2);

      service.removeFromBasket({ ...item1, accession: { ...item1.accession } });
      const basket = service.basket();
      expect(basket.items).toEqual([item2]);
    });

    test('should tell when accession is in basket', () => {
      const item1 = {
        accession: {
          url: 'rosa',
          name: 'Rosa'
        }
      } as BasketItem;
      const item2 = {
        accession: {
          url: 'rosa rosae',
          name: 'Rosa rosae'
        }
      } as BasketItem;
      service.addToBasket(item2);

      expect(service.isItemInBasket({ ...item1, accession: { ...item1.accession } })).toBe(false);
      expect(service.isItemInBasket({ ...item2, accession: { ...item2.accession } })).toBe(true);

      service.addToBasket(item1);
      expect(service.isItemInBasket({ ...item1, accession: { ...item1.accession } })).toBe(true);

      service.removeFromBasket(item1);
      expect(service.isItemInBasket({ ...item1, accession: { ...item1.accession } })).toBe(false);
    });

    test('should clear the basket', () => {
      service.clearBasket();
      expect(service.basket().items).toEqual([]);
    });
  });

  describe('with bad value in local storage', () => {
    beforeEach(() => {
      mockGetItem.mockReturnValue('badly stored basket');
      service = TestBed.inject(BasketService);
    });

    test('should not fail on badly stored basket', () => {
      expect(window.localStorage.getItem).toHaveBeenCalledWith('rare-basket');
      expect(service.basket().items).toEqual([]);
    });
  });
});
