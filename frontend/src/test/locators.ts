import { Locator, locators } from 'vitest/browser';

locators.extend({
  // Not recommended by vitest, but can be really useful at least to transition
  // from jasmine tests
  getByCss(selector: string) {
    return selector;
  }
});

declare module 'vitest/browser' {
  interface LocatorSelectors {
    // if the custom method returns a string, it will be converted into a locator
    // if it returns anything else, then it will be returned as usual
    getByCss(selector: string): Locator;
  }
}
