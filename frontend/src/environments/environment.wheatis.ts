// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --configuration=production` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { WheatisModule } from '../app/wheatis/wheatis.module';
import { DataDiscoveryEnvironment } from './environment.model';

export const environment: DataDiscoveryEnvironment = {
  production: false,
  name: 'rare',
  title: 'WheatIS - Wheat Information System',
  navbar: {
    title: 'Wheat Initiative',
    logoUrl: 'http://www.wheatinitiative.org/',
    links: [
      { label: 'Home', url: './' },
      { label: 'WheatIS website', url: 'http://wheatis.org/' },
      { label: 'Wheat@URGI', url: 'https://wheat-urgi.versailles.inrae.fr/' }
    ]
  },
  searchPlaceholder: 'Examples: yield, fhb',
  resourceModule: WheatisModule,
  helpMdFile: 'assets/help.md',
  aboutUsMdFile: 'assets/about.md',
  joinUsMdFile: 'assets/join.md',
  legalMentionsMdFile: 'assets/legal.md',
  eulaMdFile: 'assets/eula.md',
  newsMdFile: 'assets/news.md',
  dataProvider: 'Data providers'
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
