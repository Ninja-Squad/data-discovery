import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { GenericDocumentModel } from '../generic-document.model';

@Component({
  selector: 'dd-document',
  templateUrl: './generic-document.component.html',
  styleUrls: ['./generic-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericDocumentComponent {
  @Input() document!: GenericDocumentModel;
}
