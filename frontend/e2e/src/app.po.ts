import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/rare-dev');
  }

  getParagraphText() {
    return element(by.css('dd-root h1')).getText();
  }
}
