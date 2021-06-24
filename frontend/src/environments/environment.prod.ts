import { environment as devEnvironment } from './environment';

export const environment = {
  ...devEnvironment,
  production: true,
  rareBasket: 'http://localhost:4201'
};
