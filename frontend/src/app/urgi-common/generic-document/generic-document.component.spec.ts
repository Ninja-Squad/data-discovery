import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

import { GenericDocumentComponent } from './generic-document.component';
import { toWheatisDocument } from '../../models/test-model-generators';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { GenericDocumentModel } from '../generic-document.model';
import { AnalyticsNavigation, AnalyticsService } from '../../analytics.service';
import { createMock, MockObject } from '../../../test/mock';
import { By } from '@angular/platform-browser';

@Component({
  template: `@if (document(); as document) {
    <dd-document [document]="document" />
  }`,
  imports: [GenericDocumentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dd-generic-document-tester'
})
class TestComponent {
  readonly document = signal<GenericDocumentModel | undefined>(undefined);
}

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly title = page.getByRole('heading', { level: 3 });
  readonly link = page.getByCss('.main-link');
  readonly type = page.getByCss('.type');
  readonly species = page.getByCss('.species');
  readonly description = page.getByCss('.description');
  readonly fullDescriptionButton = page
    .getByCss('.description')
    .getByRole('button', { name: 'Show more' });
  readonly fullDescription = page.getByCss('.full-description');
  readonly shortDescriptionButton = page
    .getByCss('.full-description')
    .getByRole('button', { name: 'Show less' });

  get linkDebugElement() {
    return this.fixture.debugElement.query(By.css('.main-link'));
  }
}

describe('GenericDocumentComponent', () => {
  let analyticsService: MockObject<AnalyticsService>;

  beforeEach(() => {
    analyticsService = createMock(AnalyticsService);
    TestBed.configureTestingModule({
      providers: [{ provide: AnalyticsService, useValue: analyticsService }]
    });
  });

  test('should display a document', async () => {
    const tester = new TestComponentTester();
    const component = tester.componentInstance;

    // given a resource
    const resource = toWheatisDocument('Bacteria');
    component.document.set(resource);
    await tester.fixture.whenStable();

    // then we should display it
    await expect.element(tester.title).toHaveTextContent(resource.name);
    await expect.element(tester.title).toHaveTextContent(resource.databaseName);
    await expect.element(tester.link).toHaveTextContent(resource.name);
    await expect(tester.link.element().getAttribute('href')).toBe(resource.url);
    await expect(tester.link.element().getAttribute('target')).toBe('_blank');
    await expect.element(tester.type).toHaveTextContent(resource.entryType);
    for (const text of resource.species) {
      await expect.element(tester.species).toHaveTextContent(text);
    }
    await expect.element(tester.description).toHaveTextContent(resource.description);
    await expect.element(tester.fullDescriptionButton).not.toBeInTheDocument();
    await expect.element(tester.fullDescription).not.toBeInTheDocument();
    await expect.element(tester.shortDescriptionButton).not.toBeInTheDocument();
  });

  test('should trace navigations', async () => {
    const tester = new TestComponentTester();

    const resource = toWheatisDocument('Bacteria');
    tester.componentInstance.document.set(resource);
    await expect.element(tester.link).toBeVisible();

    // do not click on the link, because it causes a real navigation
    // and apparently changing the href of the link causes issues with the tests
    tester.linkDebugElement.triggerEventHandler('click');

    const expectedNavigation: AnalyticsNavigation = {
      toUrl: 'http://brc4env.fr',
      databaseName: 'BRC4Env',
      node: 'Data provider',
      species: 'Bacteria species',
      entryType: 'Specimen'
    };
    expect(analyticsService.traceExternalNavigation).toHaveBeenCalledWith(expectedNavigation);
  });
});
