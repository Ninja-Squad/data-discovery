import { environment as devEnvironment } from './environment.rare';
import { DataDiscoveryEnvironment } from './environment.model';

export const environment: DataDiscoveryEnvironment = {
  ...devEnvironment,
  production: true
};
