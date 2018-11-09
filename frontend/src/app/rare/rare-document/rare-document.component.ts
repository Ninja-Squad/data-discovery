import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RareDocumentModel } from '../rare-document.model';

@Component({
  selector: 'dd-document',
  templateUrl: './rare-document.component.html',
  styleUrls: ['./rare-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RareDocumentComponent {

  @Input() document: RareDocumentModel;

}
