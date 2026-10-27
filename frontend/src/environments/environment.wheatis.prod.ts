import { DataDiscoveryEnvironment } from './environment.model';
import { environment as devEnvironment } from './environment.wheatis';

export const environment: DataDiscoveryEnvironment = {
  ...devEnvironment,
  // TODO INRAE specify the analytics properties here
  analytics: undefined,
  production: true
};
