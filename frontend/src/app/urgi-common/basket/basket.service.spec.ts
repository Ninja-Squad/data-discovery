import { TestBed } from '@angular/core/testing';

import { BasketService } from './basket.service';
import { RareDocumentModel } from '../../rare/rare-document.model';

describe('BasketService', () => {
  let service: BasketService;
  let mockGetItem: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    // Object.getPrototypeOf is needed to make the test succeed on Firefox
    mockGetItem = spyOn(Object.getPrototypeOf(window.localStorage), 'getItem');
    mockGetItem.and.returnValue(
      '{ "items": [{ "accession": { "name": "A1" , "identifier": "a1" }, "accessionHolder": "AH1" }] }'
    );
  });

  describe('with valid value in local storage', () => {
    beforeEach(() => {
      mockGetItem.and.returnValue(
        '{ "items": [{ "accession": { "name": "A1" , "identifier": "a1" }, "accessionHolder": "AH1" }] }'
      );
      service = TestBed.inject(BasketService);
    });

    it('should try to restore a basket when created', () => {
      expect(window.localStorage.getItem).toHaveBeenCalledWith('rare-basket');
      const basket = service.basket();
      expect(basket.items.length).toBe(1);
      expect(basket.items[0].accession.identifier).toBe('a1');
      expect(basket.items[0].accession.name).toBe('A1');
      expect(basket.items[0].accessionHolder).toBe('AH1');
    });

    it('should add an item to the basket', () => {
      service.clearBasket();
      service.addToBasket({
        identifier: 'rosa',
        name: 'Rosa',
        accessionHolder: 'AH1'
      } as RareDocumentModel);
      const basket = service.basket();
      expect(basket.items.length).toBe(1);
      expect(basket.items[0].accession.identifier).toBe('rosa');
      expect(basket.items[0].accession.name).toBe('Rosa');
      expect(basket.items[0].accessionHolder).toBe('AH1');
    });

    it('should not add an item to the basket twice', () => {
      service.clearBasket();
      const item = {
        identifier: 'rosa',
        name: 'Rosa',
        accessionHolder: 'AH1'
      } as RareDocumentModel;
      service.addToBasket(item);
      // second time with same item
      service.addToBasket(item);
      const basket = service.basket();
      expect(basket.items.length).toBe(1);
      expect(basket.items[0].accession.identifier).toBe('rosa');
      expect(basket.items[0].accession.name).toBe('Rosa');
      expect(basket.items[0].accessionHolder).toBe('AH1');
    });

    it('should remove an item from the basket', () => {
      service.clearBasket();
      const item1 = {
        identifier: 'rosa',
        name: 'Rosa'
      } as RareDocumentModel;
      const item2 = {
        identifier: 'rosa rosae',
        name: 'Rosa rosae'
      } as RareDocumentModel;
      service.addToBasket(item1);
      service.addToBasket(item2);

      service.removeFromBasket('rosa');
      const basket = service.basket();
      expect(basket.items.length).toBe(1);
      expect(basket.items[0].accession.identifier).toBe('rosa rosae');
    });

    it('should tell when accession is in basket', () => {
      const item1 = {
        identifier: 'rosa',
        name: 'Rosa'
      } as RareDocumentModel;
      const item2 = {
        identifier: 'rosa rosae',
        name: 'Rosa rosae'
      } as RareDocumentModel;
      service.addToBasket(item2);

      expect(service.isAccessionInBasket({ ...item1 })).toBeFalse();
      expect(service.isAccessionInBasket({ ...item2 })).toBeTrue();

      service.addToBasket(item1);
      expect(service.isAccessionInBasket({ ...item1 })).toBeTrue();

      service.removeFromBasket('rosa');
      expect(service.isAccessionInBasket({ ...item1 })).toBeFalse();
    });

    it('should clear the basket', () => {
      service.clearBasket();
      expect(service.basket().items.length).toBe(0);
    });
  });

  describe('with bad value in local storage', () => {
    beforeEach(() => {
      mockGetItem.and.returnValue('badly stored basket');
      service = TestBed.inject(BasketService);
    });

    it('should not fail on badly stored basket', () => {
      expect(window.localStorage.getItem).toHaveBeenCalledWith('rare-basket');
      expect(service.basket().items.length).toBe(0);
    });
  });
});
