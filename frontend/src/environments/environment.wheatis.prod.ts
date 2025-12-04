import { environment as devEnvironment } from './environment.wheatis';
import { DataDiscoveryEnvironment } from './environment.model';

export const environment: DataDiscoveryEnvironment = {
  ...devEnvironment,
  // TODO INRAE specify the analytics properties here
  analytics: undefined,
  production: true
};
