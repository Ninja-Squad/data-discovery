import { TestBed } from '@angular/core/testing';
import { ComponentTester } from 'ngx-speculoos';

import { GenericDocumentComponent } from './generic-document.component';
import { toWheatisDocument } from '../../models/test-model-generators';
import { Component, signal } from '@angular/core';
import { GenericDocumentModel } from '../generic-document.model';

@Component({
  template: `@if (document(); as document) {
    <dd-document [document]="document" />
  }`,
  imports: [GenericDocumentComponent]
})
class TestComponent {
  document = signal<GenericDocumentModel | undefined>(undefined)
}

describe('DataDiscoveryDocumentComponent', () => {
  class DataDiscoveryDocumentComponentTester extends ComponentTester<TestComponent> {
    constructor() {
      super(TestComponent);
    }

    get title() {
      return this.element('h3');
    }

    get link() {
      return this.element('.main-link');
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

  beforeEach(() => TestBed.configureTestingModule({}));

  it('should display a resource', () => {
    const tester = new DataDiscoveryDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource
    const resource = toWheatisDocument('Bacteria');
    component.document.set(resource);
    tester.detectChanges();

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
});
