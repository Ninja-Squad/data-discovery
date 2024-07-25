import { environment as devEnvironment } from './environment.wheatis';
import { DataDiscoveryEnvironment } from './environment.model';

export const environment: DataDiscoveryEnvironment = {
  ...devEnvironment,
  production: true
};
