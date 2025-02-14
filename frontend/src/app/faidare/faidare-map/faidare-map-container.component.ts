import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FaidareDocumentModel } from '../faidare-document.model';
import { FaidareMapComponent } from './map/faidare-map.component';

@Component({
  selector: 'dd-map',
  templateUrl: './faidare-map-container.component.html',
  styleUrls: ['./faidare-map-container.component.scss'],
  imports: [FaidareMapComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaidareMapContainerComponent {
  readonly documents = input.required<Array<FaidareDocumentModel>>();

  readonly markers = computed<Array<FaidareDocumentModel & { location: L.LatLngExpression }>>(() =>
    this.documents()
      .filter(document => this.hasLocation(document))
      .map(document => this.toMarker(document))
  );

  private hasLocation(document: FaidareDocumentModel) {
    return document.description.length >= 2;
  }

  private toMarker(
    document: FaidareDocumentModel
  ): FaidareDocumentModel & { location: L.LatLngExpression } {
    return {
      ...document,
      location: [
        40 + 400 / (document.description.codePointAt(0) ?? 0),
        300 / (document.description.codePointAt(1) ?? 0)
      ]
    };
  }
}
