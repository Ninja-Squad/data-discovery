// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --configuration=production` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { DataDiscoveryEnvironment } from './environment.model';
import { FaidareOntologyAggregationComponent } from '../app/faidare/faidare-ontology-aggregation/faidare-ontology-aggregation.component';
import { FaidareFooterComponent } from '../app/faidare/faidare-footer/faidare-footer.component';
import { FaidareDocumentComponent } from '../app/faidare/faidare-document/faidare-document.component';
import { FaidareDocumentListComponent } from '../app/faidare/faidare-document-list/faidare-document-list.component';
import { FaidareHeaderComponent } from '../app/faidare/faidare-header/faidare-header.component';
import { BasketComponent } from '../app/urgi-common/basket/basket/basket.component';
import { SelectAllResultsComponent } from '../app/urgi-common/basket/select-all-results/select-all-results.component';

export const environment: DataDiscoveryEnvironment = {
  production: false,
  name: 'faidare',
  title: 'FAIR Data-finder for Agronomic REsearch',
  navbar: {
    logoUrl: '',
    secondLogoUrl: '',
    links: [
      {
        label: 'urgi',
        subMenu: [
          { label: 'home', url: 'https://urgi.versailles.inra.fr' },
          { label: 'news', url: 'https://urgi.versailles.inra.fr/About-us/News' },
          { label: 'about', url: 'https://urgi.versailles.inra.fr/About-us' }
        ]
      }
    ]
    // TODO should the contributor be displayed in the navbar?
    // contributor: {
    //  name: 'Elixir',
    //  url: 'https://elixir-europe.org/',
    //  logo: 'assets/elixir_logo.png'
    // }
  },
  documentComponent: FaidareDocumentComponent,
  documentListComponent: FaidareDocumentListComponent,
  ontologyAggregationComponent: FaidareOntologyAggregationComponent,
  headerComponent: FaidareHeaderComponent,
  footerComponent: FaidareFooterComponent,
  basketComponent: BasketComponent,
  selectAllResultsComponent: SelectAllResultsComponent,
  helpMdFile: 'assets/help.md',
  aboutUsMdFile: 'assets/about.md',
  joinUsMdFile: 'assets/join.md',
  legalMentionsMdFile: 'assets/legal.md',
  eulaMdFile: 'assets/eula.md', // TODO does not exist
  newsMdFile: 'assets/news.md', // TODO does not exist
  home: {
    // show the main aggregations instead of pillars in Faidare
    showAggregations: true,
    exampleQueries: ['yield', 'fhb', 'University of Oulu', 'metribuzin tolerance']
  },
  // taxa links are used in germplasm cards
  // taxaLinks: {
  //  NCBI: 'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=',
  //  ThePlantList: 'http://www.theplantlist.org/tpl1.1/record/',
  //  TAXREF: 'https://inpn.mnhn.fr/espece/cd_nom/',
  //  CatalogueOfLife: 'http://www.catalogueoflife.org/col/details/species/id/'
  // }
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
