import { Injectable } from '@angular/core';
import { RareDocumentModel } from './rare-document.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * An item of basket command
 */
export interface BasketItem {

  /**
   * The RARe accession name being ordered
   */
  name: string;

  /**
   * The RARe accession identifier being ordered
   */
  accession: string;

  /**
   * The email of the GRC contact in charge of handling this ordered item
   */
  contactEmail: string;
}

export interface Basket {
  items: Array<BasketItem>;
}

@Injectable({
  providedIn: 'root'
})
export class BasketService {

  basket: Basket;
  private basket$ = new BehaviorSubject<Basket>(this.basket);

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
    this.emitNewBasket();
  }

  private emitNewBasket() {
    this.basket$.next({ ...this.basket });
  }

  addToBasket(rareAccession: RareDocumentModel) {
    const basketItem: BasketItem = { accession: rareAccession.identifier, name: rareAccession.name, contactEmail: 'TODO' };
    this.basket.items.push(basketItem);
    this.saveBasketToLocalStorage();
    this.emitNewBasket();
  }

  isAccessionInBasket(rareAccession: RareDocumentModel): Observable<boolean> {
    return this.basket$
      .pipe(map(basket => basket.items.map(item => item.accession).includes(rareAccession.identifier)));
  }

  removeFromBasket(accession: string) {
    this.basket.items = this.basket.items.filter(item => accession !== item.accession);
    this.saveBasketToLocalStorage();
    this.emitNewBasket();
  }

  private saveBasketToLocalStorage() {
    window.localStorage.setItem('rare-basket', JSON.stringify(this.basket));
  }

  getBasket(): Observable<Basket> {
    return this.basket$.asObservable();
  }
}
