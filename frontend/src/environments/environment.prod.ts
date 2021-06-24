import { environment as devEnvironment } from './environment';
import { DataDiscoveryEnvironment } from './environment.model';

export const environment: DataDiscoveryEnvironment = {
  ...devEnvironment,
  production: true,
  rareBasket: 'http://localhost:4201'
};
