/**
 * Configuration variables for RARe Basket.
 * This contains the configuration for production.
 * This file is only used by the RARe version (without basket) of the application.
 * It replaces rare-with-basket.ts when the application is built with the brc4env + production configuration.
 * See angular.json for more details.
 */
export const rareBasket = {
  isBasketEnabled: true,
  url: '/rare-basket'
};
