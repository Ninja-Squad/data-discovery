import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { GenericDocumentModel } from '../generic-document.model';
import { TruncatableDescriptionComponent } from '../../truncatable-description/truncatable-description.component';

@Component({
    selector: 'dd-document',
    templateUrl: './generic-document.component.html',
    styleUrl: './generic-document.component.scss',
    imports: [TruncatableDescriptionComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericDocumentComponent {
  @Input() document!: GenericDocumentModel;
}
