import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

import { TruncatableDescriptionComponent } from './truncatable-description.component';
import { provideI18nTesting } from '../i18n/mock-18n';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  template: `<dd-truncatable-description [description]="description()" />`,
  imports: [TruncatableDescriptionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dd-truncatable-description-tester'
})
class TestComponent {
  readonly description = signal('');
}

describe('TruncatableDescriptionComponent', () => {
  class TruncatableDescriptionComponentTester {
    readonly fixture = TestBed.createComponent(TestComponent);
    readonly componentInstance = this.fixture.componentInstance;
    readonly description = page.getByCss('.description');
    readonly fullDescriptionButton = page.getByCss('.description').getByRole('button');
    readonly fullDescription = page.getByCss('.full-description');
    readonly shortDescriptionButton = page
      .getByCss('.full-description')
      .getByRole('button')
      .first();
  }

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideI18nTesting()] }));

  test('should truncate the long description and allow to display it fully', async () => {
    const tester = new TruncatableDescriptionComponentTester();
    const component = tester.componentInstance;

    // given a resource with a long description
    component.description.set(Array(200).fill('aaa').join(' '));
    await tester.fixture.whenStable();

    // then we should truncate it
    await expect.element(tester.fullDescriptionButton).toBeInTheDocument();
    const linkContent = '... (expand)';
    await expect.element(tester.fullDescriptionButton).toHaveTextContent(linkContent);
    const descriptionText = await tester.description.element().textContent;
    expect(descriptionText.length).toBeLessThanOrEqual(256 + linkContent.length);
    expect(descriptionText.length).toBeGreaterThanOrEqual(252 + linkContent.length);

    // when we click on the link
    await tester.fullDescriptionButton.click();

    // then we should display the full description
    await expect.element(tester.fullDescription).toBeInTheDocument();
    await expect.element(tester.fullDescription).toHaveTextContent(component.description());
    await expect.element(tester.shortDescriptionButton).toBeInTheDocument();
    await expect.element(tester.shortDescriptionButton).toHaveTextContent('Hide');
    await expect.element(tester.description).not.toBeInTheDocument();
    await expect.element(tester.fullDescriptionButton).not.toBeInTheDocument();
  });

  test('should display a highlighted description (truncated and full)', async () => {
    const tester = new TruncatableDescriptionComponentTester();
    const component = tester.componentInstance;

    // given a resource with a long highlighted description
    const description = 'Hello <em>world</em>! The <em>world</em> is&nbsp;beautiful.';
    component.description.set(description + ' ' + Array(200).fill('aaa').join(' '));
    await tester.fixture.whenStable();

    // it should highlight the short description
    await expect
      .element(tester.description)
      .toHaveTextContent('Hello world! The world is beautiful.');

    await tester.fullDescriptionButton.click();

    // and also the long description
    await expect
      .element(tester.fullDescription)
      .toHaveTextContent('Hello world! The world is beautiful.');
  });
});
