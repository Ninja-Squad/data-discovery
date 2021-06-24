import { environment as devEnvironment } from './environment.brc4env';
import { DataDiscoveryEnvironment } from './environment.model';

export const environment: DataDiscoveryEnvironment = {
  ...devEnvironment,
  production: true
};
