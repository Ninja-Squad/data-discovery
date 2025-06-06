import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { DocumentModel } from '../../models/document.model';
import { Page } from '../../models/page';
import { SearchStateService } from '../../search-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DocumentComponent } from '../../../environments/document.default';

/**
 * Default implementation of the document list (the search results).
 * It can be overridden by specific configuration, as in Faidare for example, where the components
 * display a document list, and a table in a separate tab dedicated to Germplasm results.
 */
@Component({
  selector: 'dd-document-list',
  templateUrl: './generic-document-list.component.html',
  styleUrl: './generic-document-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocumentComponent]
})
export class GenericDocumentListComponent {
  readonly documents: Signal<Page<DocumentModel> | undefined> = toSignal(
    inject(SearchStateService).getDocuments()
  );
}
