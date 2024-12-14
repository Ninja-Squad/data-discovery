import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { BasketService } from '../urgi-common/basket/basket.service';
import { map } from 'rxjs';
import { DocumentModel } from '../models/document.model';
import { Page } from '../models/page';
import { SearchStateService } from '../search-state.service';
import { TranslateModule } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';

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
    TranslateModule,
    environment.selectAllResultsComponent,
    environment.documentListComponent
  ]
})
export class DocumentsComponent {
  vm: Signal<ViewModel | undefined>;
  isBasketEnabled: boolean;

  constructor() {
    const basketService = inject(BasketService);
    const searchStateService = inject(SearchStateService);

    this.isBasketEnabled = basketService.isEnabled();
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
