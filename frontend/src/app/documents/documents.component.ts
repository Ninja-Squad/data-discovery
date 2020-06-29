import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Page } from '../models/page';
import { DocumentModel } from '../models/document.model';
import { BasketService } from '../rare/basket.service';

@Component({
  selector: 'dd-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentsComponent {

  @Input() documents: Page<DocumentModel>;
  isBasketEnabled: boolean;

  constructor(basketService: BasketService) {
    this.isBasketEnabled = basketService.isEnabled();
  }

  get firstResultIndex() {
    return (this.documents.number * this.documents.size) + 1;
  }

  get lastResultIndex() {
    return this.firstResultIndex + this.documents.content.length - 1;
  }

  get resultLimited() {
    return this.documents.totalElements > this.documents.maxResults;
  }
}
