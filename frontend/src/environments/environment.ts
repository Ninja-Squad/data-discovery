// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --configuration=production` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { DataDiscoveryEnvironment } from './environment.model';
import { GenericOntologyAggregationComponent } from '../app/urgi-common/generic-ontology-aggregation/generic-ontology-aggregation.component';
import { GenericDocumentComponent } from '../app/urgi-common/generic-document/generic-document.component';
import { RareHeaderComponent } from '../app/rare/rare-header/rare-header.component';
import { GenericDocumentListComponent } from '../app/urgi-common/generic-document-list/generic-document-list.component';
import { GenericFooterComponent } from '../app/urgi-common/generic-footer/generic-footer.component';
import { GenericBasketComponent } from '../app/urgi-common/generic-basket/generic-basket.component';
import { GenericSelectAllResultsComponent } from '../app/urgi-common/generic-select-all-results/generic-select-all-results.component';
import { GenericMapComponent } from '../app/urgi-common/generic-map/generic-map.component';

export const environment: DataDiscoveryEnvironment = {
  production: false,
  name: 'rare',
  title: 'RARe - Ressources Agronomiques pour la Recherche',
  navbar: {
    logoUrl: '',
    secondLogoUrl: '',
    links: [{ label: 'agrobrc', url: 'https://www.agrobrc-rare.org/' }]
  },
  documentComponent: GenericDocumentComponent,
  documentListComponent: GenericDocumentListComponent,
  ontologyAggregationComponent: GenericOntologyAggregationComponent,
  headerComponent: RareHeaderComponent,
  footerComponent: GenericFooterComponent,
  basketComponent: GenericBasketComponent,
  selectAllResultsComponent: GenericSelectAllResultsComponent,
  mapComponent: GenericMapComponent,
  helpMdFile: 'assets/help.md',
  aboutUsMdFile: 'assets/about.md',
  joinUsMdFile: 'assets/join.md',
  legalMentionsMdFile: 'assets/legal.md',
  eulaMdFile: 'assets/eula.md',
  newsMdFile: 'assets/news.md',
  home: {
    showAggregations: false,
    exampleQueries: [] as Array<string>
  },
  faidare: {
    germplasmBaseUrl: 'http://localhost:8380/faidare-dev/germplasms'
  },
  basket: {
    enabled: true,
    url: 'http://localhost:4201/rare-basket'
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
