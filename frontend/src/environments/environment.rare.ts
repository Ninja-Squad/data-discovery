// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --configuration=production` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { DataDiscoveryEnvironment } from './environment.model';
import { BasketAdapter } from '../app/urgi-common/basket/basket-adapter.service';
import { RareBasketAdapter } from '../app/rare/rare-basket-adapter.service';

export const environment: DataDiscoveryEnvironment = {
  production: false,
  name: 'rare',
  title: 'AgroBRC - RARe - Ressources Agronomiques pour la Recherche',
  navbar: {
    logoUrl: '',
    secondLogoUrl: '',
    links: [{ label: 'agrobrc', url: 'https://www.agrobrc-rare.org/' }]
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
    enabled: true,
    url: 'http://localhost:4201/rare-basket'
  },
  providers: [{ provide: BasketAdapter, useClass: RareBasketAdapter }]
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
