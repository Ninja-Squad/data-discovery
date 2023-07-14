import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';

import { GenericDocumentModel } from '../generic-document.model';
import { TruncatableDescriptionComponent } from '../../truncatable-description/truncatable-description.component';

@Component({
  selector: 'dd-document',
  templateUrl: './generic-document.component.html',
  styleUrls: ['./generic-document.component.scss'],
  standalone: true,
  imports: [NgFor, TruncatableDescriptionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericDocumentComponent {
  @Input() document!: GenericDocumentModel;
}
