import { Injectable } from '@angular/core';
import { RareDocumentModel } from './rare-document.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { rareBasket } from '../../environments/rare-basket';

/**
 * A RARe accession, with its name and identifier
 */
export interface Accession {
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
   * The email of the GRC contact in charge of handling this ordered item
   */
  contactEmail: string;
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
  basket: Basket;
  private basket$ = new BehaviorSubject<Basket>(this.basket);

  constructor(private http: HttpClient) {
    this.restoreBasketFromLocalStorage();
  }

  restoreBasketFromLocalStorage() {
    const rareBasketStringified = window.localStorage.getItem('rare-basket');
    if (rareBasketStringified) {
      try {
        this.basket = JSON.parse(rareBasketStringified);
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
    this.basket$.next({ ...this.basket });
  }

  addToBasket(rareAccession: RareDocumentModel) {
    if (this.basket.items.some(item => item.accession.identifier === rareAccession.identifier)) {
      // already in basket
      return;
    }
    // TODO contact email (contact1@grc1.fr for demo purposes)
    const basketItem: BasketItem = {
      accession: {
        identifier: rareAccession.identifier,
        name: rareAccession.name
      },
      contactEmail: 'contact1@grc1.fr'
    };
    this.basket.items.push(basketItem);
    this.saveBasketToLocalStorage();
    this.emitNewBasket();
  }

  isAccessionInBasket(rareAccession: RareDocumentModel): Observable<boolean> {
    return this.basket$.pipe(
      map(basket => basket.items.map(item => item.accession.identifier).includes(rareAccession.identifier)),
      // do not re-emit when value is the same
      distinctUntilChanged()
    );
  }

  removeFromBasket(identifier: string) {
    this.basket.items = this.basket.items.filter(item => identifier !== item.accession.identifier);
    this.saveBasketToLocalStorage();
    this.emitNewBasket();
  }

  private saveBasketToLocalStorage() {
    window.localStorage.setItem('rare-basket', JSON.stringify(this.basket));
  }

  getBasket(): Observable<Basket> {
    return this.basket$.asObservable();
  }

  sendBasket(): Observable<BasketCreated> {
    return this.http.post<BasketCreated>(`${rareBasket.url}/api/baskets`, this.basket).pipe(tap(() => this.clearBasket()));
  }

  clearBasket() {
    this.basket.items = [];
    this.saveBasketToLocalStorage();
    this.emitNewBasket();
  }
}
