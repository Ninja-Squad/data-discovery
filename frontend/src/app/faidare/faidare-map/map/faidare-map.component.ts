import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  ViewEncapsulation
} from '@angular/core';
import * as L from 'leaflet';
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

      const mapMarkers = this.createMarkers();
      mapMarkers.forEach(marker => marker.addTo(map!));
      onCleanup(() => {
        mapMarkers.forEach(marker => map!.removeLayer(marker));
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

      const titleElement = document.createElement('strong');
      titleElement.innerText = d.name;
      popupElement.appendChild(titleElement);
      popupElement.appendChild(document.createElement('br'));

      const linkElement = document.createElement('a');
      linkElement.innerText = this.translateService.instant('faidare.map.details');
      linkElement.href = d.url;
      popupElement.appendChild(linkElement);

      const marker = L.marker(d.location, { icon: icon });
      marker.bindPopup(popupElement, { offset: [1, -19] });

      return marker;
    });
  }
}
