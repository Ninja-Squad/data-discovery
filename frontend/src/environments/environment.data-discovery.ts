// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { DataDiscoveryModule } from '../app/data-discovery/data-discovery.module';

export const environment = {
  production: false,
  title: 'DataDiscovery - Genetic and Genomic Information System',
  navbar: {
    title: 'URGI',
    logoUrl: 'https://urgi.versailles.inra.fr/',
    links: [
      { label: 'GnpIS', url: 'https://urgi.versailles.inra.fr/gnpis' },
      { label: 'About us', url: 'https://urgi.versailles.inra.fr/About-us' },
      { label: 'Help', url: '/help' }
    ]
  },
  searchPlaceholder: 'Examples: yield, fhb',
  resourceModule: DataDiscoveryModule,
  /**
   * Map containing the list of the aggregations and their displayed name.
   * Should be kept in sync with the `DataDiscoveryAggregation` enum of the backend.
   */
  aggregationNames: {
    entry: 'Data type',
    db: 'Database',
    node: 'Data provider',
    species: 'Species'
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
