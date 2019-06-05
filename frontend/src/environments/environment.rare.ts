// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { RareModule } from '../app/rare/rare.module';

export const environment = {
  production: false,
  title: 'RARe - Ressources Agronomiques pour la Recherche',
  navbar: {
    title: 'RARe Search',
    logoUrl: '',
    links: [
      { label: 'AgroBRC-RARe Home', url: 'https://www.agrobrc-rare.org/' }
    ]
  },
  searchPlaceholder: 'Exemples : pisum sativum, rosa',
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
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
