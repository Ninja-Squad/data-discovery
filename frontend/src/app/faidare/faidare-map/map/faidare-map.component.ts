import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  ViewEncapsulation
} from '@angular/core';
import L from 'leaflet';
import 'leaflet.markercluster';
import { FaidareDocumentModel } from '../../faidare-document.model';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'dd-faidare-map',
  templateUrl: './faidare-map.component.html',
  styleUrls: ['./faidare-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class FaidareMapComponent {
  private readonly document = inject(DOCUMENT);
  private readonly translateService = inject(TranslateService);

  readonly documents =
    input.required<Array<FaidareDocumentModel & { location: L.LatLngExpression }>>();

  constructor() {
    const elementRef = inject(ElementRef);
    let map: L.Map | undefined = undefined;

    afterRenderEffect(onCleanup => {
      if (!map) {
        map = this.createMap(elementRef.nativeElement);
      }

      const clusterGroup = L.markerClusterGroup();
      const markers = this.createMarkers();
      markers.forEach(marker => clusterGroup.addLayer(marker));
      map.fitBounds(L.featureGroup(markers).getBounds());
      map.addLayer(clusterGroup);
      onCleanup(() => {
        map!.removeLayer(clusterGroup);
      });
    });
  }

  private createMap(element: HTMLElement): L.Map {
    const map = L.map(element, {
      center: [46.32, 2.25],
      zoom: 5,
      dragging: !L.Browser.mobile,
      tapHold: !L.Browser.mobile
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(map);
    return map;
  }

  private createMarkers(): Array<L.Marker> {
    return this.documents().map(d => {
      const icon = L.icon({
        iconUrl: 'assets/marker-icon-blue.png',
        iconAnchor: [12, 41] // point of the icon which will correspond to marker's location
      });

      const popupElement = document.createElement('div');

      popupElement.appendChild(this.popupTitle(d));
      popupElement.appendChild(this.popupDatabaseName(d));
      popupElement.appendChild(this.popupEntryTypeAndSpecies(d));

      const marker = L.marker(d.location, { icon: icon });
      marker.bindPopup(() => this.popup(d), { offset: [1, -19] });

      return marker;
    });
  }

  private popup(d: FaidareDocumentModel): HTMLElement {
    const popupElement = document.createElement('div');
    popupElement.appendChild(this.popupTitle(d));
    popupElement.appendChild(this.popupDatabaseName(d));
    popupElement.appendChild(this.popupEntryTypeAndSpecies(d));
    return popupElement;
  }

  private popupTitle(d: FaidareDocumentModel): HTMLElement {
    const titleElement = document.createElement('div');
    titleElement.classList.add('mb-1');
    const strongElement = document.createElement('strong');
    strongElement.classList.add('fs-6');
    const linkElement = document.createElement('a');
    linkElement.innerText = d.name;
    linkElement.href = d.url;
    linkElement.target = '_blank';
    strongElement.appendChild(linkElement);
    titleElement.appendChild(strongElement);

    return titleElement;
  }

  private popupDatabaseName(d: FaidareDocumentModel): HTMLElement {
    const wrappingElement = document.createElement('div');
    wrappingElement.classList.add('mb-2');
    const databaseName = document.createElement('em');
    databaseName.innerText = d.databaseName;
    wrappingElement.appendChild(databaseName);
    return wrappingElement;
  }

  private popupEntryTypeAndSpecies(d: FaidareDocumentModel): HTMLElement {
    const wrappingElement = document.createElement('div');

    const entryType = document.createElement('span');
    entryType.classList.add('me-4');
    entryType.innerText = d.entryType;
    wrappingElement.appendChild(entryType);

    for (const species of d.species) {
      const badge = document.createElement('span');
      badge.classList.add('badge', 'bg-secondary', 'me-2');
      badge.innerText = species;
      wrappingElement.appendChild(badge);
    }
    return wrappingElement;
  }
}
