import { TestBed } from '@angular/core/testing';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';

import { RareDocumentComponent } from './rare-document.component';
import { toRareDocument } from '../../models/test-model-generators';
import { TruncatableDescriptionComponent } from '../../truncatable-description/truncatable-description.component';

describe('RareDocumentComponent', () => {

  class RareDocumentComponentTester extends ComponentTester<RareDocumentComponent> {
    constructor() {
      super(RareDocumentComponent);
    }

    get title() {
      return this.element('h3');
    }

    get link() {
      return this.element('.main-link');
    }

    get datasourceLink() {
      return this.element('.datasource-link');
    }

    get taxon() {
      return this.element('.taxon');
    }

    get type() {
      return this.element('.type');
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

  beforeEach(() => TestBed.configureTestingModule({
    declarations: [RareDocumentComponent, TruncatableDescriptionComponent]
  }));

  beforeEach(() => jasmine.addMatchers(speculoosMatchers));

  it('should display a resource', () => {
    const tester = new RareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource
    const resource = toRareDocument('Bacteria');
    component.document = resource;
    tester.detectChanges();

    // then we should display it
    expect(tester.title).toContainText(resource.name);
    expect(tester.title).toContainText(resource.pillarName);
    expect(tester.link).toContainText(resource.name);
    expect(tester.link.attr('href')).toBe(resource.dataURL);
    expect(tester.datasourceLink).toContainText(resource.databaseSource);
    expect(tester.datasourceLink.attr('href')).toBe(resource.portalURL);
    resource.taxon.forEach(text => expect(tester.taxon).toContainText(text));
    expect(tester.type).toContainText(resource.materialType[0]);
    expect(tester.description).toContainText(resource.description);
    expect(tester.fullDescriptionButton).toBeNull();
    expect(tester.fullDescription).toBeNull();
    expect(tester.shortDescriptionButton).toBeNull();
  });

  it('should have a link to portal if data url is null or empty', () => {
    const tester = new RareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource with no data url
    const resource = toRareDocument('Bacteria');
    resource.dataURL = null;
    component.document = resource;
    tester.detectChanges();

    // then we should link to portal url
    expect(tester.link.attr('href')).toBe(resource.portalURL);
  });

  it('should display several types properly', () => {
    const tester = new RareDocumentComponentTester();
    const component = tester.componentInstance;

    // given a resource with several types
    const resource = toRareDocument('Bacteria');
    resource.materialType = ['type1', 'type2'];
    component.document = resource;
    tester.detectChanges();

    // then we should them
    expect(tester.type).toContainText('type1, type2');
  });
});
