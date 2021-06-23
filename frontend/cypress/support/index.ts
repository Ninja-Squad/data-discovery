// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// When a command from ./commands is ready to use, import with `import './commands'` syntax
// import './commands';

// The following code checks if there was no console error during the test
// (either in application code, or because of network requests not handled)
let consoleSpy: Cypress.Agent<sinon.SinonSpy>;
Cypress.on('window:before:load', win => {
  // spy on the console
  consoleSpy = cy.spy(win.console, 'error');
  // also set the language to en
  Object.defineProperty(win.navigator, 'language', { value: 'en' });
});
afterEach(() => {
  // consoleSpy can be null if test failed already in beforeEach
  if (consoleSpy) {
    expect(consoleSpy).not.to.be.called;
  }
});
