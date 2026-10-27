import { DataDiscoveryEnvironment } from './environment.model';
import { environment as devEnvironment } from './environment.rare';

export const environment: DataDiscoveryEnvironment = {
  ...devEnvironment,
  production: true,
  basket: {
    enabled: true,
    url: '/rare-basket'
  }
};
