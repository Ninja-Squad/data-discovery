import { environment as devEnvironment } from './environment.wheatis';
import { DataDiscoveryEnvironment } from './environment.model';

// ts-prune-ignore-next
export const environment: DataDiscoveryEnvironment = {
  ...devEnvironment,
  production: true
};
