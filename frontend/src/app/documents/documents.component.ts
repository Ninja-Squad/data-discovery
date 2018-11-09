import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Page } from '../models/page';
import { DocumentModel } from '../models/document.model';

@Component({
  selector: 'dd-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentsComponent {

  @Input() documents: Page<DocumentModel>;

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
