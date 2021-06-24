// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --configuration=production` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { RareModule } from '../app/rare/rare.module';
import { DataDiscoveryEnvironment } from './environment.model';

export const environment: DataDiscoveryEnvironment = {
  production: false,
  name: 'rare',
  title: 'RARe - Ressources Agronomiques pour la Recherche',
  navbar: {
    title: 'RARe Search',
    logoUrl: '',
    links: [{ label: 'AgroBRC-RARe Home', url: 'https://www.agrobrc-rare.org/' }]
  },
  searchPlaceholder: 'Examples: yield, fhb',
  resourceModule: RareModule,
  helpMdFile: 'assets/help.md',
  aboutUsMdFile: 'assets/about.md',
  joinUsMdFile: 'assets/join.md',
  legalMentionsMdFile: 'assets/legal.md',
  eulaMdFile: 'assets/eula.md',
  newsMdFile: 'assets/news.md'
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
