import { TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

import { DocumentCountComponent } from './document-count.component';
import { provideI18nTesting } from '../i18n/mock-18n';
import { provideDisabledNgbAnimation } from '../disable-animations';

@Component({
  template: `<dd-document-count
    [count]="count()"
    [muted]="muted()"
    [name]="name()"
    [url]="url()"
  />`,
  imports: [DocumentCountComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dd-document-count-tester'
})
class TestComponent {
  readonly count = signal(0);
  readonly muted = signal(false);
  readonly name = signal('');
  readonly url = signal('');
}

class DocumentCountComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly componentInstance = TestBed.createComponent(TestComponent).componentInstance;
  readonly name = page.getByCss('span');
  readonly link = page.getByCss('a');
  readonly count = page.getByCss('small');
  readonly tooltip = page.getByCss('ngb-tooltip-window');
}

describe('DocumentCountComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), provideDisabledNgbAnimation()]
    });
  });

  test('should display a name and a count', async () => {
    // given a component with a name and count
    const tester = new DocumentCountComponentTester();
    const component = tester.componentInstance;
    component.name.set('Biotope');
    component.count.set(1298);

    // when displaying it
    // then we should have the name and the count properly formatted
    await expect.element(tester.name).toHaveTextContent('Biotope');
    await expect.element(tester.count).toHaveTextContent('[1,298]');
  });

  test('should display a link that opens in a new tab if it is possible and a count', async () => {
    // given a component with a name, a url and a count
    const tester = new DocumentCountComponentTester();
    const component = tester.componentInstance;
    component.name.set('Florilège');
    component.count.set(1298);
    component.url.set('http://florilege.arcad-project.org/fr/collections');

    // when displaying it
    // then we should have the name in a link and the count properly formatted
    await expect.element(tester.link).toHaveTextContent('Florilège');
    await expect(tester.link.element().getAttribute('href')).toBe(
      'http://florilege.arcad-project.org/fr/collections'
    );
    await expect(tester.link.element().getAttribute('target')).toBe('_blank');
    await expect.element(tester.count).toHaveTextContent('[1,298]');
  });

  test('should display a tooltip to explain the count', async () => {
    // given a component with a name, a url and a count
    const tester = new DocumentCountComponentTester();
    const component = tester.componentInstance;
    component.name.set('Florilège');
    component.count.set(1298);
    component.url.set('http://florilege.arcad-project.org/fr/collections');

    // when displaying it
    await tester.fixture.whenStable();
    // and hovering the element
    await tester.count.hover();

    // then we should have the tooltip displayed
    await expect.element(tester.tooltip).toBeVisible();
    await expect.element(tester.tooltip).toHaveTextContent('1,298 documents match Florilège');

    // and hide it when leaving
    await tester.count.unhover();
    await expect.element(tester.tooltip).not.toBeInTheDocument();

    // with only one document
    component.count.set(1);

    // when displaying it again
    await tester.fixture.whenStable();
    await tester.count.hover();

    // then we should have the tooltip displayed with special text for one document
    await expect.element(tester.tooltip).toBeVisible();
    await expect.element(tester.tooltip).toHaveTextContent('Only one document matches Florilège');
  });
});
