import { effect, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * A rare-basket accession, sent as part of a basket creation.
 * It contains additional mandatory fields compared to the actual rare-basket accession
 * because we want the accessions coming from here to contain those fields.
 * The url is what actually identifies an accession in this application.
 */
export interface Accession {
  readonly name: string;
  readonly identifier: string;
  readonly accessionNumber: string | null;
  readonly taxon: string;
  readonly url: string;
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
  readonly items: ReadonlyArray<BasketItem>;
}

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private readonly _basket = signal<Basket>({ items: [] });
  readonly basket = this._basket.asReadonly();

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

  addToBasket(item: BasketItem) {
    if (this.isItemInBasket(item)) {
      // already in basket
      return;
    }
    this._basket.update(basket => ({ ...basket, items: [...basket.items, item] }));
  }

  isItemInBasket(item: BasketItem): boolean {
    return this._basket().items.some(i => i.accession.url === item.accession.url);
  }

  removeFromBasket(item: BasketItem) {
    this._basket.update(basket => ({
      ...basket,
      items: basket.items.filter(i => i.accession.url !== item.accession.url)
    }));
  }

  private saveBasketToLocalStorage() {
    window.localStorage.setItem('rare-basket', JSON.stringify(this._basket()));
  }

  clearBasket() {
    this._basket.update(basket => ({ ...basket, items: [] }));
  }
}
