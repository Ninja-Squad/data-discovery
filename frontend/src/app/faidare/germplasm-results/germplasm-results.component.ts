import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Page } from '../../models/page';
import { FaidareDocumentModel } from '../faidare-document.model';
import { environment } from '../../../environments/environment';
import { ExportService } from '../export.service';
import { DownloadService } from '../../download.service';
import { BehaviorSubject, combineLatest, finalize, map, Observable } from 'rxjs';
import { SearchCriteria, SearchStateService, SortCriterion } from '../../search-state.service';

interface ViewModel {
  documents: Page<FaidareDocumentModel> | null;
  downloading: boolean;
  sortCriterion: SortCriterion | null;
  searchCriteria: SearchCriteria;
}

export type Sort = 'name' | 'accession' | 'species' | 'institute' | 'biological-status' | 'country';
export type Direction = 'asc' | 'desc';

@Component({
  selector: 'dd-germplasm-results',
  templateUrl: './germplasm-results.component.html',
  styleUrls: ['./germplasm-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GermplasmResultsComponent {
  vm$: Observable<ViewModel>;
  private downloadingSubject = new BehaviorSubject(false);

  constructor(
    private exportService: ExportService,
    private downloadService: DownloadService,
    private searchStateService: SearchStateService
  ) {
    this.vm$ = combineLatest([this.downloadingSubject, searchStateService.getModel()]).pipe(
      map(([downloading, model]) => ({
        downloading,
        sortCriterion: model.searchCriteria.sortCriterion,
        searchCriteria: model.searchCriteria,
        documents: model.documents as Page<FaidareDocumentModel> | null
      }))
    );
  }

  faidareUrl(document: FaidareDocumentModel) {
    return `${environment.faidare!.germplasmBaseUrl}/${document.identifier}`;
  }

  export(searchCriteria: SearchCriteria) {
    this.downloadingSubject.next(true);
    this.exportService
      .export(searchCriteria.query, searchCriteria.aggregationCriteria, searchCriteria.descendants)
      .pipe(finalize(() => this.downloadingSubject.next(false)))
      .subscribe(blob => this.downloadService.download(blob, 'plant-material.csv'));
  }

  sort(sortCriterion: SortCriterion) {
    this.searchStateService.sort(sortCriterion);
  }
}
