// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --configuration=production` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { DataDiscoveryEnvironment } from './environment.model';

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
  },
  analytics: {
    url: 'http://localhost:8082/api/navigations',
    application: 'WHEATIS'
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
