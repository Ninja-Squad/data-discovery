import { Injectable } from '@angular/core';
import { DocumentModel } from '../../models/document.model';
import { BasketItem } from './basket.service';

/**
 * A service that must be provided by every application that needs to support baskets.
 * This default implementation is for applications that don't support baskets.
 */
@Injectable({
  providedIn: 'root'
})
export class BasketAdapter {
  /**
   * Transforms the given document into a basket item if it can be transformed, otherwise
   * returns null, indicating that this document can't be added to the basket.
   */
  asBasketItem(_document: DocumentModel): BasketItem | null {
    return null;
  }
}
