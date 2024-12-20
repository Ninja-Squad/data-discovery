import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  Signal
} from '@angular/core';
import { Page } from '../../models/page';
import { FaidareDocumentModel } from '../faidare-document.model';
import { ExportService } from '../export.service';
import { DownloadService } from '../../download.service';
import { finalize } from 'rxjs';
import { SearchCriteria, SearchStateService, SortCriterion } from '../../search-state.service';
import { SortableHeaderComponent } from './sortable-header/sortable-header.component';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

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
  imports: [TranslateModule, SortableHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GermplasmResultsComponent {
  private exportService = inject(ExportService);
  private downloadService = inject(DownloadService);
  private searchStateService = inject(SearchStateService);

  private readonly downloading = signal<null | 'mcpd' | 'plant-material'>(null);
  private readonly model = toSignal(this.searchStateService.getModel());

  readonly vm: Signal<ViewModel | undefined> = computed(() => {
    const downloading = this.downloading();
    const model = this.model();
    return model
      ? {
          downloading,
          sortCriterion: model.searchCriteria.sortCriterion,
          searchCriteria: model.searchCriteria,
          documents: model.documents as Page<FaidareDocumentModel> | null
        }
      : undefined;
  });

  export(searchCriteria: SearchCriteria, exportType: 'mcpd' | 'plant-material') {
    this.downloading.set(exportType);
    this.exportService
      .export(searchCriteria, exportType)
      .pipe(finalize(() => this.downloading.set(null)))
      .subscribe(blob => this.downloadService.download(blob, `${exportType}.csv`));
  }

  sort(sortCriterion: SortCriterion) {
    this.searchStateService.sort(sortCriterion);
  }
}
