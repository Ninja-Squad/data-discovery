/**
 * Configuration variables for RARe Basket.
 * This contains the configuration for development
 * (expecting that RARe Basket is running locally on 4201)
 * This file is only used by the RARe version of the application.
 * You must always import this version of the file:
 * the build takes care of replacing it by the production one.
 */
export const rareBasket = {
  isBasketEnabled: true,
  url: 'http://localhost:4201/rare-basket' // TODO update to proper URL
};
