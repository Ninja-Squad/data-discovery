// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --configuration=production` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { environment as devEnvironment } from './environment.faidare';
import { DataDiscoveryEnvironment } from './environment.model';

export const environment: DataDiscoveryEnvironment = {
  ...devEnvironment,
  faidare: {
    germplasmBaseUrl: 'https://urgi.versailles.inrae.fr/faidare/germplasms'
  },
  production: true,
  basket: {
    enabled: true,
    url: '/rare-basket'
  },
  // TODO INRAE specify the analytics properties here
  analytics: undefined
};
