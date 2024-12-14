import { effect, Injectable, signal } from '@angular/core';
import { OrderableDocumentModel } from '../../models/document.model';
import { environment } from '../../../environments/environment';

/**
 * A RARe accession, with its name and identifier
 */
interface Accession {
  identifier: string;
  name: string;
}

/**
 * An item of basket command
 */
export interface BasketItem {
  /**
   * The RARe accession being ordered
   */
  accession: Accession;

  /**
   * The accession holder in charge of handling this ordered item
   */
  accessionHolder: string;
}

export interface Basket {
  items: Array<BasketItem>;
}

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private _basket = signal<Basket>({ items: [] });
  basket = this._basket.asReadonly();

  constructor() {
    this.restoreBasketFromLocalStorage();
    effect(() => this.saveBasketToLocalStorage());
  }

  isEnabled() {
    return environment.basket.enabled;
  }

  restoreBasketFromLocalStorage() {
    const rareBasketStringified = window.localStorage.getItem('rare-basket');
    if (rareBasketStringified) {
      try {
        this._basket.set(JSON.parse(rareBasketStringified));
        // eslint-disable-next-line no-empty,@typescript-eslint/no-unused-vars
      } catch (e) {}
    }
    if (!this._basket()) {
      this._basket.set({
        items: []
      });
    }
  }

  addToBasket(accession: OrderableDocumentModel) {
    if (this.isAccessionInBasket(accession)) {
      // already in basket
      return;
    }
    const basketItem: BasketItem = {
      accession: {
        identifier: accession.identifier,
        name: accession.name
      },
      accessionHolder: accession.accessionHolder!
    };
    this._basket.update(basket => ({ ...basket, items: [...basket.items, basketItem] }));
  }

  isAccessionInBasket(document: OrderableDocumentModel): boolean {
    return this._basket().items.some(item => item.accession.identifier === document.identifier);
  }

  removeFromBasket(identifier: string) {
    this._basket.update(basket => ({
      ...basket,
      items: basket.items.filter(item => item.accession.identifier !== identifier)
    }));
  }

  private saveBasketToLocalStorage() {
    window.localStorage.setItem('rare-basket', JSON.stringify(this._basket));
  }

  clearBasket() {
    this._basket.update(basket => ({ ...basket, items: [] }));
  }
}
