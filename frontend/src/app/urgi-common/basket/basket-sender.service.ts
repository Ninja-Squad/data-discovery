import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Basket } from './basket.service';

export interface BasketCreated extends Basket {
  id: string;
  reference: string;
}

@Injectable({
  providedIn: 'root'
})
export class BasketSenderService {
  private http = inject(HttpClient);

  sendBasket(basket: Basket): Observable<BasketCreated> {
    return this.http.post<BasketCreated>(`${environment.basket.url}/api/baskets`, basket);
  }
}
