import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Page } from '../../models/page';
import { FaidareDocumentModel } from '../faidare-document.model';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { ExportService } from '../export.service';
import { DownloadService } from '../../download.service';

@Component({
  selector: 'dd-germplasm-results',
  templateUrl: './germplasm-results.component.html',
  styleUrls: ['./germplasm-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GermplasmResultsComponent {
  @Input() documents!: Page<FaidareDocumentModel>;

  constructor(
    private route: ActivatedRoute,
    private exportService: ExportService,
    private downloadService: DownloadService
  ) {}

  faidareUrl(document: FaidareDocumentModel) {
    return `${environment.faidare!.germplasmBaseUrl}/${document.identifier}`;
  }

  export() {
    this.exportService
      .export(this.route.snapshot.queryParams)
      .subscribe(blob => this.downloadService.download(blob, 'plant-material.csv'));
  }
}
