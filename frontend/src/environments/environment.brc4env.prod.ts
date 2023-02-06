import { environment as devEnvironment } from './environment.brc4env';
import { DataDiscoveryEnvironment } from './environment.model';

// ts-prune-ignore-next
export const environment: DataDiscoveryEnvironment = {
  ...devEnvironment,
  production: true,
  basket: {
    enabled: true,
    url: '/rare-basket'
  }
};
