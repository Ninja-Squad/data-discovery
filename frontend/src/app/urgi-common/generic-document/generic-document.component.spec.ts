import { TestBed } from '@angular/core/testing';
import { ComponentTester, createMock } from 'ngx-speculoos';

import { GenericDocumentComponent } from './generic-document.component';
import { toWheatisDocument } from '../../models/test-model-generators';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { GenericDocumentModel } from '../generic-document.model';
import { AnalyticsNavigation, AnalyticsService } from '../../analytics.service';

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

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get title() {
    return this.element('h3');
  }

  get link() {
    return this.element<HTMLAnchorElement>('.main-link');
  }

  get type() {
    return this.element('.type');
  }

  get species() {
    return this.element('.species');
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

describe('GenericDocumentComponent', () => {
  let analyticsService: jasmine.SpyObj<AnalyticsService>;

  beforeEach(() => {
    analyticsService = createMock(AnalyticsService);
    TestBed.configureTestingModule({
      providers: [{ provide: AnalyticsService, useValue: analyticsService }]
    });
  });

  it('should display a document', async () => {
    const tester = new TestComponentTester();
    const component = tester.componentInstance;

    // given a resource
    const resource = toWheatisDocument('Bacteria');
    component.document.set(resource);
    await tester.stable();

    // then we should display it
    expect(tester.title).toContainText(resource.name);
    expect(tester.title).toContainText(resource.databaseName);
    expect(tester.link).toContainText(resource.name);
    expect(tester.link.attr('href')).toBe(resource.url);
    expect(tester.link.attr('target')).toBe('_blank');
    expect(tester.type).toContainText(resource.entryType);
    resource.species.forEach(text => expect(tester.species).toContainText(text));
    expect(tester.description).toContainText(resource.description);
    expect(tester.fullDescriptionButton).toBeNull();
    expect(tester.fullDescription).toBeNull();
    expect(tester.shortDescriptionButton).toBeNull();
  });

  it('should trace navigations', async () => {
    const tester = new TestComponentTester();

    const resource = toWheatisDocument('Bacteria');
    tester.componentInstance.document.set(resource);
    await tester.stable();

    // do not click on the link, because it causes a real navigation
    // and apparently changing the href of the link causes issues with the tests
    tester.link.debugElement.triggerEventHandler('click');

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
