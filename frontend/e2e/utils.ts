import { expect, test as base } from '@playwright/test';

// throws if there are any errors in the console when running the application
export const test = base.extend({
  page: async ({ page }, use) => {
    const messages: Array<string> = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        messages.push(`${msg.text()}`);
      }
    });
    await use(page);
    expect(messages).toEqual([]);
  }
});
