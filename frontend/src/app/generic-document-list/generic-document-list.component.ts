import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Page } from '../models/page';
import { DocumentModel } from '../models/document.model';

/**
 * Default implementation of the document list (the search results).
 * It can be overridden by specific configuration, as in Faidare for example, where the components
 * displays a document list, and a table in a separate tab dedicated to Germplasm results.
 */
@Component({
  selector: 'dd-document-list',
  templateUrl: './generic-document-list.component.html',
  styleUrls: ['./generic-document-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericDocumentListComponent {
  @Input() documents!: Page<DocumentModel>;
  @Input() aggregations!: Page<DocumentModel>;
}
