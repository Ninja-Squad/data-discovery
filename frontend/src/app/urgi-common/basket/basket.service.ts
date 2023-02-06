import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
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

export interface BasketCreated extends Basket {
  id: string;
  reference: string;
}

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  basket: Basket | null = null;
  private basket$ = new BehaviorSubject<Basket | null>(this.basket);

  constructor(private http: HttpClient) {
    this.restoreBasketFromLocalStorage();
  }

  isEnabled() {
    return environment.basket.enabled;
  }

  restoreBasketFromLocalStorage() {
    const rareBasketStringified = window.localStorage.getItem('rare-basket');
    if (rareBasketStringified) {
      try {
        this.basket = JSON.parse(rareBasketStringified);
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }
    if (!this.basket) {
      this.basket = {
        items: []
      };
    }
    this.emitNewBasket();
  }

  private emitNewBasket() {
    this.basket$.next({ ...this.basket! });
  }

  addToBasket(accession: OrderableDocumentModel) {
    if (this.basket!.items.some(item => item.accession.identifier === accession.identifier)) {
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
    this.basket!.items.push(basketItem);
    this.saveBasketToLocalStorage();
    this.emitNewBasket();
  }

  isAccessionInBasket(document: OrderableDocumentModel): Observable<boolean> {
    return this.basket$.pipe(
      map(basket =>
        basket!.items.map(item => item.accession.identifier).includes(document.identifier)
      ),
      // do not re-emit when value is the same
      distinctUntilChanged()
    );
  }

  removeFromBasket(identifier: string) {
    this.basket!.items = this.basket!.items.filter(
      item => identifier !== item.accession.identifier
    );
    this.saveBasketToLocalStorage();
    this.emitNewBasket();
  }

  private saveBasketToLocalStorage() {
    window.localStorage.setItem('rare-basket', JSON.stringify(this.basket));
  }

  getBasket(): Observable<Basket | null> {
    return this.basket$.asObservable();
  }

  sendBasket(): Observable<BasketCreated> {
    return this.http
      .post<BasketCreated>(`${environment.basket.url}/api/baskets`, this.basket)
      .pipe(tap(() => this.clearBasket()));
  }

  clearBasket() {
    this.basket!.items = [];
    this.saveBasketToLocalStorage();
    this.emitNewBasket();
  }
}
