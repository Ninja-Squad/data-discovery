import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { BasketService } from '../urgi-common/basket/basket.service';
import { map } from 'rxjs';
import { DocumentModel } from '../models/document.model';
import { Page } from '../models/page';
import { SearchStateService } from '../search-state.service';
import { TranslateDirective } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectAllResultsComponent } from '../../environments/select-all-results.default';
import { DocumentListComponent } from '../../environments/document-list.default';
import { MapContainerComponent } from '../../environments/map-container.default';

interface ViewModel {
  documents: Page<DocumentModel>;
  firstResultIndex: number;
  lastResultIndex: number;
  resultLimited: boolean;
}

@Component({
  selector: 'dd-documents',
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    TranslateDirective,
    SelectAllResultsComponent,
    DocumentListComponent,
    MapContainerComponent
  ]
})
export class DocumentsComponent {
  readonly vm: Signal<ViewModel | undefined>;
  readonly isBasketEnabled = inject(BasketService).isEnabled();

  constructor() {
    const searchStateService = inject(SearchStateService);

    this.vm = toSignal(
      searchStateService.getDocuments().pipe(
        map(documents => ({
          documents,
          firstResultIndex: this.firstResultIndex(documents),
          lastResultIndex: this.lastResultIndex(documents),
          resultLimited: this.resultLimited(documents)
        }))
      )
    );
  }

  private firstResultIndex(documents: Page<DocumentModel>): number {
    return documents.number * documents.size + 1;
  }

  private lastResultIndex(documents: Page<DocumentModel>): number {
    return this.firstResultIndex(documents) + documents.content.length - 1;
  }

  private resultLimited(documents: Page<DocumentModel>): boolean {
    return documents.totalElements > documents.maxResults;
  }
}
