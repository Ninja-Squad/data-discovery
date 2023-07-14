import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { DocumentModel } from '../../models/document.model';
import { Page } from '../../models/page';
import { SearchStateService } from '../../search-state.service';
import { Observable } from 'rxjs';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { environment } from '../../../environments/environment';

/**
 * Default implementation of the document list (the search results).
 * It can be overridden by specific configuration, as in Faidare for example, where the components
 * display a document list, and a table in a separate tab dedicated to Germplasm results.
 */
@Component({
  selector: 'dd-document-list',
  templateUrl: './generic-document-list.component.html',
  styleUrls: ['./generic-document-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    // we use a forwardRef to avoid a circular dependency with environment.ts
    forwardRef(() => environment.documentComponent)
  ]
})
export class GenericDocumentListComponent {
  documents$: Observable<Page<DocumentModel>>;

  constructor(searchStateService: SearchStateService) {
    this.documents$ = searchStateService.getDocuments();
  }
}
