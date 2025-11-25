import { TestBed } from '@angular/core/testing';

import { BasketItem, BasketService } from './basket.service';

describe('BasketService', () => {
  let service: BasketService;
  let mockGetItem: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    // Object.getPrototypeOf is needed to make the test succeed on Firefox
    mockGetItem = spyOn(Object.getPrototypeOf(window.localStorage), 'getItem');
    mockGetItem.and.returnValue(
      '{ "items": [{ "accession": { "name": "A1" , "url": "a1" }, "accessionHolder": "AH1" }] }'
    );
  });

  describe('with valid value in local storage', () => {
    beforeEach(() => {
      mockGetItem.and.returnValue(
        '{ "items": [{ "accession": { "name": "A1" , "url": "a1" }, "accessionHolder": "AH1" }] }'
      );
      service = TestBed.inject(BasketService);
    });

    it('should try to restore a basket when created', () => {
      expect(window.localStorage.getItem).toHaveBeenCalledWith('rare-basket');
      const basket = service.basket();
      expect(basket.items.length).toBe(1);
      expect(basket.items[0].accession.url).toBe('a1');
      expect(basket.items[0].accession.name).toBe('A1');
      expect(basket.items[0].accessionHolder).toBe('AH1');
    });

    it('should add an item to the basket', () => {
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

    it('should not add an item to the basket twice', () => {
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

    it('should remove an item from the basket', () => {
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

    it('should tell when accession is in basket', () => {
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

      expect(service.isItemInBasket({ ...item1, accession: { ...item1.accession } })).toBeFalse();
      expect(service.isItemInBasket({ ...item2, accession: { ...item2.accession } })).toBeTrue();

      service.addToBasket(item1);
      expect(service.isItemInBasket({ ...item1, accession: { ...item1.accession } })).toBeTrue();

      service.removeFromBasket(item1);
      expect(service.isItemInBasket({ ...item1, accession: { ...item1.accession } })).toBeFalse();
    });

    it('should clear the basket', () => {
      service.clearBasket();
      expect(service.basket().items).toEqual([]);
    });
  });

  describe('with bad value in local storage', () => {
    beforeEach(() => {
      mockGetItem.and.returnValue('badly stored basket');
      service = TestBed.inject(BasketService);
    });

    it('should not fail on badly stored basket', () => {
      expect(window.localStorage.getItem).toHaveBeenCalledWith('rare-basket');
      expect(service.basket().items).toEqual([]);
    });
  });
});
