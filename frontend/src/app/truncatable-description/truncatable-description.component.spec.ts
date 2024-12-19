import { TestBed } from '@angular/core/testing';
import { ComponentTester } from 'ngx-speculoos';

import { TruncatableDescriptionComponent } from './truncatable-description.component';
import { provideI18nTesting } from '../i18n/mock-18n.spec';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  template: `<dd-truncatable-description [description]="description()" />`,
  imports: [TruncatableDescriptionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  description = signal('');
}

describe('TruncatableDescriptionComponent', () => {
  class TruncatableDescriptionComponentTester extends ComponentTester<TestComponent> {
    constructor() {
      super(TestComponent);
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

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideI18nTesting()] }));

  it('should truncate the long description and allow to display it fully', async () => {
    const tester = new TruncatableDescriptionComponentTester();
    const component = tester.componentInstance;

    // given a resource with a long description
    component.description.set(Array(200).fill('aaa').join(' '));
    await tester.stable();

    // then we should truncate it
    expect(tester.fullDescriptionButton).not.toBeNull();
    const linkContent = '... (expand)';
    expect(tester.fullDescriptionButton).toContainText(linkContent);
    expect(tester.description.textContent.length).toBeLessThanOrEqual(256 + linkContent.length);
    expect(tester.description.textContent.length).toBeGreaterThanOrEqual(252 + linkContent.length);

    // when we click on the link
    await tester.fullDescriptionButton.click();

    // then we should display the full description
    expect(tester.fullDescription).not.toBeNull();
    expect(tester.fullDescription).toContainText(component.description());
    expect(tester.shortDescriptionButton).not.toBeNull();
    expect(tester.shortDescriptionButton).toContainText('Hide');
    expect(tester.description).toBeNull();
    expect(tester.fullDescriptionButton).toBeNull();
  });

  it('should display a highlighted description (truncated and full)', async () => {
    const tester = new TruncatableDescriptionComponentTester();
    const component = tester.componentInstance;

    // given a resource with a long highlighted description
    const description = 'Hello <em>world</em>! The <em>world</em> is&nbsp;beautiful.';
    component.description.set(description + ' ' + Array(200).fill('aaa').join(' '));
    await tester.stable();

    // it should highlight the short description
    expect(tester.description).toContainText('Hello world! The world is\u00A0beautiful.');

    await tester.fullDescriptionButton.click();

    // and also the long description
    expect(tester.fullDescription).toContainText('Hello world! The world is\u00A0beautiful.');
  });
});
