import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Page } from '../../models/page';
import { FaidareDocumentModel } from '../faidare-document.model';
import { ExportService } from '../export.service';
import { DownloadService } from '../../download.service';
import { BehaviorSubject, combineLatest, finalize, map, Observable } from 'rxjs';
import { SearchCriteria, SearchStateService, SortCriterion } from '../../search-state.service';
import { AsyncPipe } from '@angular/common';
import { SortableHeaderComponent } from './sortable-header/sortable-header.component';
import { TranslateModule } from '@ngx-translate/core';

interface ViewModel {
  documents: Page<FaidareDocumentModel> | null;
  downloading: null | 'mcpd' | 'plant-material';
  sortCriterion: SortCriterion | null;
  searchCriteria: SearchCriteria;
}

export type Sort = 'name' | 'accession' | 'species' | 'institute' | 'biological-status' | 'country';

@Component({
    selector: 'dd-germplasm-results',
    templateUrl: './germplasm-results.component.html',
    styleUrl: './germplasm-results.component.scss',
    imports: [AsyncPipe, TranslateModule, SortableHeaderComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GermplasmResultsComponent {
  private exportService = inject(ExportService);
  private downloadService = inject(DownloadService);
  private searchStateService = inject(SearchStateService);

  vm$: Observable<ViewModel>;
  private downloadingSubject = new BehaviorSubject<null | 'mcpd' | 'plant-material'>(null);

  constructor() {
    this.vm$ = combineLatest([this.downloadingSubject, this.searchStateService.getModel()]).pipe(
      map(([downloading, model]) => ({
        downloading,
        sortCriterion: model.searchCriteria.sortCriterion,
        searchCriteria: model.searchCriteria,
        documents: model.documents as Page<FaidareDocumentModel> | null
      }))
    );
  }

  faidareUrl(document: FaidareDocumentModel) {
    return `${document.url}`;
  }

  export(searchCriteria: SearchCriteria, exportType: 'mcpd' | 'plant-material') {
    this.downloadingSubject.next(exportType);
    this.exportService
      .export(searchCriteria, exportType)
      .pipe(finalize(() => this.downloadingSubject.next(null)))
      .subscribe(blob => this.downloadService.download(blob, `${exportType}.csv`));
  }

  sort(sortCriterion: SortCriterion) {
    this.searchStateService.sort(sortCriterion);
  }
}
