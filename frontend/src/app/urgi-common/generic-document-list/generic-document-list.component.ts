import { ChangeDetectionStrategy, Component, forwardRef, inject, Signal } from '@angular/core';
import { DocumentModel } from '../../models/document.model';
import { Page } from '../../models/page';
import { SearchStateService } from '../../search-state.service';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';

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
  imports: [
    // we use a forwardRef to avoid a circular dependency with environment.ts
    forwardRef(() => environment.documentComponent)
  ]
})
export class GenericDocumentListComponent {
  readonly documents: Signal<Page<DocumentModel> | undefined> = toSignal(
    inject(SearchStateService).getDocuments()
  );
}
