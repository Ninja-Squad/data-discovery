// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --configuration=production` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { FaidareModule } from '../app/faidare/faidare.module';
import { DataDiscoveryEnvironment } from './environment.model';

export const environment: DataDiscoveryEnvironment = {
  production: false,
  title: 'FAIR Data-finder for Agronomic REsearch',
  navbar: {
    title: 'FAIDARE',
    logoUrl: '',
    links: [
      {
        label: 'URGI',
        url: '#',
        subMenu: [
          { label: 'Home', url: 'https://urgi.versailles.inra.fr' },
          { label: 'News', url: 'https://urgi.versailles.inra.fr/About-us/News' },
          { label: 'About us', url: 'https://urgi.versailles.inra.fr/About-us' }
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
  searchPlaceholder: 'Examples: yield, fhb',
  resourceModule: FaidareModule,
  helpMdFile: 'assets/help.md',
  aboutUsMdFile: 'assets/about.md',
  joinUsMdFile: 'assets/join.md',
  legalMentionsMdFile: 'assets/legal.md',
  eulaMdFile: 'assets/eula.md', // TODO does not exist
  newsMdFile: 'assets/news.md', // TODO does not exist
  /**
   * Map containing the list of the aggregations and their displayed name.
   * Should be kept in sync with the `FaidareAggregation` enum of the backend.
   */
  aggregationNames: {
    node: 'Data provider',
    species: 'Species',
    annot: 'Ontology annotation',
    hi: 'Holding institute',
    bs: 'Biological status',
    gn: 'Genetic nature',
    coo: 'Country of origin',
    tg: 'Taxon group'
  }
  // taxa links are used in germplasm cards
  // taxaLinks: {
  //  NCBI: 'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=',
  //  ThePlantList: 'http://www.theplantlist.org/tpl1.1/record/',
  //  TAXREF: 'https://inpn.mnhn.fr/espece/cd_nom/',
  //  CatalogueOfLife: 'http://www.catalogueoflife.org/col/details/species/id/'
  // }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
