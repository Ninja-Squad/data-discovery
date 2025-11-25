import { Injectable } from '@angular/core';
import { BasketAdapter } from '../urgi-common/basket/basket-adapter.service';
import { DocumentModel } from '../models/document.model';
import { BasketItem } from '../urgi-common/basket/basket.service';
import { FaidareDocumentModel } from './faidare-document.model';

@Injectable()
export class FaidareBasketAdapter extends BasketAdapter {
  override asBasketItem(document: DocumentModel): BasketItem | null {
    const doc = document as FaidareDocumentModel;
    const identifier = doc.identifier;
    const url = doc.url;
    const name = doc.name;
    const taxon = doc.species?.[0];
    const accessionNumber = doc.accessionNumber;
    const accessionHolder = doc.accessionHolder;
    if (url && name && taxon && accessionHolder) {
      return {
        accession: {
          identifier,
          name,
          url,
          accessionNumber,
          taxon
        },
        accessionHolder
      };
    } else {
      return null;
    }
  }
}
