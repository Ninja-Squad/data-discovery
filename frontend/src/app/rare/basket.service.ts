import { Injectable } from '@angular/core';
import { RareDocumentModel } from './rare-document.model';

/**
 * An item of basket command
 */
interface BasketItem {
  /**
   * The RARe accession identifier being ordered
   */
  accession: string;

  /**
   * The email of the GRC contact in charge of handling this ordered item
   */
  contactEmail: string;
}

interface Basket {
  items: Array<BasketItem>;
}

@Injectable({
  providedIn: 'root'
})
export class BasketService {

  basket: Basket;

  constructor() {
    this.restoreBasketFromLocalStorage();
  }

  restoreBasketFromLocalStorage() {
    const rareBasketStringified = window.localStorage.getItem('rare-basket');
    if (rareBasketStringified) {
      try {
        this.basket = JSON.parse(rareBasketStringified);
      } catch (e) {
        this.basket = {
          items: []
        };
      }
    }
  }

  addToBasket(rareAccession: RareDocumentModel) {
    const basketItem: BasketItem = { accession: rareAccession.identifier, contactEmail: 'TODO' };
    this.basket.items.push(basketItem);
    this.saveBasketToLocalStorage();
  }

  isAccessionInBasket(rareAccession: RareDocumentModel) {
    return this.basket.items.map(item => item.accession).includes(rareAccession.identifier);
  }

  removeFromBasket(rareAccession: RareDocumentModel) {
    this.basket.items = this.basket.items.filter(item => rareAccession.identifier !== item.accession);
    this.saveBasketToLocalStorage();
  }

  private saveBasketToLocalStorage() {
    window.localStorage.setItem('rare-basket', JSON.stringify(this.basket));
  }
}
