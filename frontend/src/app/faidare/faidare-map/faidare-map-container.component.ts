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
    this.documents().flatMap(document => this.toMarkers(document))
  );

  private toMarkers(
    document: FaidareDocumentModel
  ): Array<FaidareDocumentModel & { location: L.LatLngExpression }> {
    return document.geographicLocations.map(geographicLocation => {
      return {
        ...document,
        location: [geographicLocation.lat, geographicLocation.lon]
      };
    });
  }
}
