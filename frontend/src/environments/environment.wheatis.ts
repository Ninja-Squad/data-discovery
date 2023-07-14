// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --configuration=production` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { DataDiscoveryEnvironment } from './environment.model';
import { GenericOntologyAggregationComponent } from '../app/urgi-common/generic-ontology-aggregation/generic-ontology-aggregation.component';
import { GenericDocumentListComponent } from '../app/urgi-common/generic-document-list/generic-document-list.component';
import { GenericFooterComponent } from '../app/urgi-common/generic-footer/generic-footer.component';
import { WheatisHeaderComponent } from '../app/wheatis/wheatis-header/wheatis-header.component';
import { GenericDocumentComponent } from '../app/urgi-common/generic-document/generic-document.component';
import { GenericBasketComponent } from '../app/urgi-common/generic-basket/generic-basket.component';
import { GenericSelectAllResultsComponent } from '../app/urgi-common/generic-select-all-results/generic-select-all-results.component';

export const environment: DataDiscoveryEnvironment = {
  production: false,
  name: 'wheatis',
  title: 'WheatIS - Wheat Information System',
  navbar: {
    logoUrl: 'http://www.wheatis.org/',
    secondLogoUrl: 'https://www.wheatinitiative.org/',
    links: [
      { label: 'home', url: './' },
      { label: 'wheat-urgi', url: 'https://wheat-urgi.versailles.inrae.fr/' }
    ]
  },
  ontologyAggregationComponent: GenericOntologyAggregationComponent,
  documentComponent: GenericDocumentComponent,
  documentListComponent: GenericDocumentListComponent,
  headerComponent: WheatisHeaderComponent,
  footerComponent: GenericFooterComponent,
  basketComponent: GenericBasketComponent,
  selectAllResultsComponent: GenericSelectAllResultsComponent,
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
  basket: {
    enabled: false,
    url: ''
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
