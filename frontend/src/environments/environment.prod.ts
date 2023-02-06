import { environment as devEnvironment } from './environment';
import { DataDiscoveryEnvironment } from './environment.model';

// ts-prune-ignore-next
export const environment: DataDiscoveryEnvironment = {
  ...devEnvironment,
  production: true,
  rareBasket: 'http://localhost:4201'
};
