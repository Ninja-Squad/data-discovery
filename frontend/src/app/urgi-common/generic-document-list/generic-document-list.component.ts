import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocumentModel } from '../../models/document.model';
import { Page } from '../../models/page';
import { SearchStateService } from '../../search-state.service';
import { Observable } from 'rxjs';

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
  documents$: Observable<Page<DocumentModel>>;

  constructor(serachStateService: SearchStateService) {
    this.documents$ = serachStateService.getDocuments();
  }
}
