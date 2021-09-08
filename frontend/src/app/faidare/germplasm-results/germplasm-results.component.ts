import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Page } from '../../models/page';
import { FaidareDocumentModel } from '../faidare-document.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'dd-germplasm-results',
  templateUrl: './germplasm-results.component.html',
  styleUrls: ['./germplasm-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GermplasmResultsComponent {
  @Input() documents!: Page<FaidareDocumentModel>;

  faidareUrl(document: FaidareDocumentModel) {
    return `${environment.faidare!.germplasmBaseUrl}/${document.identifier}`;
  }
}
