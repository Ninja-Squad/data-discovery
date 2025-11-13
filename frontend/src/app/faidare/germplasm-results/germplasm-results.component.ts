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
import { EXPORT_TYPES, ExportService, ExportType } from '../export.service';
import { DownloadService } from '../../download.service';
import { finalize } from 'rxjs';
import { SearchCriteria, SearchStateService, SortCriterion } from '../../search-state.service';
import { SortableHeaderComponent } from './sortable-header/sortable-header.component';
import { TranslateDirective } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

interface ViewModel {
  documents: Page<FaidareDocumentModel> | null;
  downloading: boolean;
  sortCriterion: SortCriterion | null;
  searchCriteria: SearchCriteria;
}

export type Sort = 'name' | 'accession' | 'species' | 'institute' | 'biological-status' | 'country';

export const FILE_NAMES: Record<ExportType, string> = {
  'plant-material': 'plant-material.csv',
  mcpd: 'mcpd.csv',
  'miappe-excel': 'miappe.xlsx',
  'miappe-csv': 'miappe.csv'
};

@Component({
  selector: 'dd-germplasm-results',
  templateUrl: './germplasm-results.component.html',
  styleUrl: './germplasm-results.component.scss',
  imports: [TranslateDirective, SortableHeaderComponent, NgbDropdownModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GermplasmResultsComponent {
  private readonly exportService = inject(ExportService);
  private readonly downloadService = inject(DownloadService);
  private readonly searchStateService = inject(SearchStateService);

  readonly exportTypes = EXPORT_TYPES.filter(type => type !== 'mcpd');
  private readonly downloading = signal(false);
  private readonly model = toSignal(this.searchStateService.getModel());

  readonly vm: Signal<ViewModel | undefined> = computed(() => {
    const model = this.model();
    return model
      ? {
          downloading: this.downloading(),
          sortCriterion: model.searchCriteria.sortCriterion,
          searchCriteria: model.searchCriteria,
          documents: model.documents as Page<FaidareDocumentModel> | null
        }
      : undefined;
  });

  export(searchCriteria: SearchCriteria, exportType: ExportType) {
    this.downloading.set(true);
    this.exportService
      .export(searchCriteria, exportType)
      .pipe(finalize(() => this.downloading.set(false)))
      .subscribe(blob => this.downloadService.download(blob, FILE_NAMES[exportType]));
  }

  sort(sortCriterion: SortCriterion) {
    this.searchStateService.sort(sortCriterion);
  }
}
