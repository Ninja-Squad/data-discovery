// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { WheatisModule } from '../app/wheatis/wheatis.module';

export const environment = {
  production: false,
  title: 'WheatIS - Wheat Information System',
  navbar: {
    title: 'Wheat Initiative',
    logoUrl: 'http://www.wheatinitiative.org/',
    links: [
      { label: 'Wheat@URGI', url: 'https://wheat-urgi.versailles.inra.fr/' },
      { label: 'WheatIS website', url: 'http://wheatis.org/' }
    ]
  },
  resourceModule: WheatisModule,
  /**
   * Map containing the list of the aggregations and their displayed name.
   * Should be kept in sync with the `WheatisAggregation` enum of the backend.
   */
  aggregationNames: {
    entry: 'Data type',
    db: 'Database',
    node: 'Node',
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
