import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Page } from '../../models/page';
import { FaidareDocumentModel } from '../faidare-document.model';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { ExportService } from '../export.service';
import { DownloadService } from '../../download.service';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ViewModel {
  downloading: boolean;
}

@Component({
  selector: 'dd-germplasm-results',
  templateUrl: './germplasm-results.component.html',
  styleUrls: ['./germplasm-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GermplasmResultsComponent {
  @Input() documents!: Page<FaidareDocumentModel>;

  vm$: Observable<ViewModel>;
  private downloadingSubject = new BehaviorSubject(false);

  constructor(
    private route: ActivatedRoute,
    private exportService: ExportService,
    private downloadService: DownloadService
  ) {
    this.vm$ = this.downloadingSubject.pipe(map(downloading => ({ downloading })));
  }

  faidareUrl(document: FaidareDocumentModel) {
    return `${environment.faidare!.germplasmBaseUrl}/${document.identifier}`;
  }

  export() {
    this.downloadingSubject.next(true);
    this.exportService
      .export(this.route.snapshot.queryParams)
      .pipe(finalize(() => this.downloadingSubject.next(false)))
      .subscribe(blob => this.downloadService.download(blob, 'plant-material.csv'));
  }
}
