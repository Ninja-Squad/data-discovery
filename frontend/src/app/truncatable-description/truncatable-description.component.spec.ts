import { TestBed } from '@angular/core/testing';
import { speculoosMatchers, ComponentTester } from 'ngx-speculoos';

import { TruncatableDescriptionComponent } from './truncatable-description.component';
import { I18nTestingModule } from '../i18n/i18n-testing.module.spec';

describe('TruncatableDescriptionComponent', () => {
  class TruncatableDescriptionComponentTester extends ComponentTester<TruncatableDescriptionComponent> {
    constructor() {
      super(TruncatableDescriptionComponent);
    }

    get description() {
      return this.element('.description');
    }

    get fullDescriptionButton() {
      return this.button('.description button');
    }

    get fullDescription() {
      return this.element('.full-description');
    }

    get shortDescriptionButton() {
      return this.button('.full-description button');
    }
  }

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      declarations: [TruncatableDescriptionComponent]
    })
  );

  beforeEach(() => jasmine.addMatchers(speculoosMatchers));

  it('should truncate the long description and allow to display it fully', () => {
    const tester = new TruncatableDescriptionComponentTester();
    const component = tester.componentInstance;

    // given a resource with a long description
    component.description = Array(200).fill('aaa').join(' ');
    tester.detectChanges();

    // then we should truncate it
    expect(tester.fullDescriptionButton).not.toBeNull();
    const linkContent = '... (expand)';
    expect(tester.fullDescriptionButton).toContainText(linkContent);
    expect(tester.description.textContent.length).toBeLessThanOrEqual(256 + linkContent.length);
    expect(tester.description.textContent.length).toBeGreaterThanOrEqual(252 + linkContent.length);

    // when we click on the link
    tester.fullDescriptionButton.click();

    // then we should display the full description
    expect(tester.fullDescription).not.toBeNull();
    expect(tester.fullDescription).toContainText(component.description);
    expect(tester.shortDescriptionButton).not.toBeNull();
    expect(tester.shortDescriptionButton).toContainText('Hide');
    expect(tester.description).toBeNull();
    expect(tester.fullDescriptionButton).toBeNull();
  });

  it('should display a highlighted description (truncated and full)', () => {
    const tester = new TruncatableDescriptionComponentTester();
    const component = tester.componentInstance;

    // given a resource with a long highlighted description
    const description = 'Hello <em>world</em>! The <em>world</em> is&nbsp;beautiful.';
    component.description = description + ' ' + Array(200).fill('aaa').join(' ');
    tester.detectChanges();

    // it should highlight the short description
    expect(tester.description).toContainText('Hello world! The world is\u00A0beautiful.');

    tester.fullDescriptionButton.click();

    // and also the long description
    expect(tester.fullDescription).toContainText('Hello world! The world is\u00A0beautiful.');
  });
});
