/**
 * Configuration variables for RARe Basket.
 * This contains the configuration for production.
 * This file is only used by the RARe version (without basket) of the application.
 * It replaces rare-with-basket.ts when the application is built with the rare-with-basket + production configuration.
 * See angular.json for more details.
 */
export const rareBasket = {
  isBasketEnabled: true,
  url: 'http://localhost:4201/rare-basket' // TODO update to proper URL
};
