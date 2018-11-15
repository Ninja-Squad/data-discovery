// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { GnpisModule } from '../app/gnpis/gnpis.module';

export const environment = {
  production: false,
  title: 'Gnpis - Genetic and Genomic Information System',
  navbar: {
    title: 'Gnpis',
    links: [
      { label: 'INRA', url: 'http://www.inra.fr/' },
      { label: 'URGI', url: 'https://urgi.versailles.inra.fr/' }
    ]
  },
  resourceModule: GnpisModule,
  /**
   * Map containing the list of the aggregations and their displayed name.
   * Should be kept in sync with the `GnpisAggregation` enum of the backend.
   */
  aggregationNames: {
    entry: 'Type d\'entrée',
    db: 'Base de données',
    node: 'Noeud',
    species: 'Espèce'
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
