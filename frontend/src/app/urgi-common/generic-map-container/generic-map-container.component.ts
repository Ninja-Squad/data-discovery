import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { GenericDocumentModel } from '../generic-document.model';

/**
 * Generic map that doesn't display anything.
 * It's replaced in Faidare (at least) by a specific map
 */
@Component({
  selector: 'dd-map',
  templateUrl: './generic-map-container.component.html',
  styleUrl: './generic-map-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericMapContainerComponent {
  readonly documents = input.required<Array<GenericDocumentModel>>();
}
