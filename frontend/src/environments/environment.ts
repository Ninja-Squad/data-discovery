// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { RareModule } from '../app/rare/rare.module';

export const environment = {
  production: false,
  title: 'RARe - Ressources Agronomiques pour la Recherche',
  navbar: {
    title: 'RARe',
    links: [
      { label: 'INRA', url: 'http://www.inra.fr/' },
      { label: 'URGI', url: 'https://urgi.versailles.inra.fr/' }
    ]
  },
  resourceModule: RareModule,
  /**
   * Map containing the list of the aggregations and their displayed name.
   * Should be kept in sync with the `RareAggregation` enum of the backend.
   */
  aggregationNames: {
    coo: 'Pays d\'origine',
    coc: 'Pays de collecte',
    domain: 'Domaine',
    material: 'Matériel',
    taxon: 'Taxon',
    biotope: 'Biotope'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
