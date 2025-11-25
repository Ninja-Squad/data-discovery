import { Injectable } from '@angular/core';
import { BasketAdapter } from '../urgi-common/basket/basket-adapter.service';
import { DocumentModel } from '../models/document.model';
import { BasketItem } from '../urgi-common/basket/basket.service';
import { RareDocumentModel } from './rare-document.model';

@Injectable()
export class RareBasketAdapter extends BasketAdapter {
  override asBasketItem(document: DocumentModel): BasketItem | null {
    const doc = document as RareDocumentModel;
    const identifier = doc.identifier;
    const url = doc.dataURL;
    const name = doc.name;
    const taxon = doc.taxon?.[0];
    const accessionHolder = doc.accessionHolder;
    if (url && name && taxon && accessionHolder) {
      return {
        accession: {
          identifier,
          name,
          url,
          accessionNumber: null,
          taxon
        },
        accessionHolder
      };
    } else {
      return null;
    }
  }
}
