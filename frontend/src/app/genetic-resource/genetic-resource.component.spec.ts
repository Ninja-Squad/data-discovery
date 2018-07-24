import { TestBed } from '@angular/core/testing';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';

import { GeneticResourceComponent } from './genetic-resource.component';
import { toGeneticResource } from '../models/test-model-generators';

describe('GeneticResourceComponent', () => {

  class GeneticResourceComponentTester extends ComponentTester<GeneticResourceComponent> {
    constructor() {
      super(GeneticResourceComponent);
    }

    get title() {
      return this.element('.title');
    }

    get link() {
      return this.element('.main-link');
    }

    get datasourceLink() {
      return this.element('.datasource-link');
    }

    get type() {
      return this.element('.type');
    }

    get description() {
      return this.element('.description');
    }

    get fullDescriptionLink() {
      return this.element('.description button');
    }

    get fullDescription() {
      return this.element('.full-description');
    }

    get shortDescriptionLink() {
      return this.element('.full-description button');
    }
  }

  beforeEach(() => TestBed.configureTestingModule({
    declarations: [GeneticResourceComponent]
  }));

  beforeEach(() => jasmine.addMatchers(speculoosMatchers));

  it('should display a resource', () => {
    const tester = new GeneticResourceComponentTester();
    const component = tester.componentInstance;

    // given a resource
    const resource = toGeneticResource('Bacteria');
    component.geneticResource = resource;
    tester.detectChanges();

    // then we should display it
    expect(tester.title).toContainText(`${resource.name} - ${resource.pillarName}`);
    expect(tester.link).toContainText(resource.name);
    expect(tester.link.attr('href')).toBe(resource.dataURL);
    expect(tester.datasourceLink).toContainText(resource.databaseSource);
    expect(tester.datasourceLink.attr('href')).toBe(resource.portalURL);
    expect(tester.type).toContainText(resource.materialType[0]);
    expect(tester.description).toContainText(resource.description);
    expect(tester.fullDescriptionLink).toBeNull();
    expect(tester.fullDescription).toBeNull();
    expect(tester.shortDescriptionLink).toBeNull();
  });

  it('should have a link to portal if data url is null or empty', () => {
    const tester = new GeneticResourceComponentTester();
    const component = tester.componentInstance;

    // given a resource with no data url
    const resource = toGeneticResource('Bacteria');
    resource.dataURL = null;
    component.geneticResource = resource;
    tester.detectChanges();

    // then we should link to portal url
    expect(tester.link.attr('href')).toBe(resource.portalURL);
  });

  it('should display several types properly', () => {
    const tester = new GeneticResourceComponentTester();
    const component = tester.componentInstance;

    // given a resource with several types
    const resource = toGeneticResource('Bacteria');
    resource.materialType = ['type1', 'type2'];
    component.geneticResource = resource;
    tester.detectChanges();

    // then we should them
    expect(tester.type).toContainText('type1, type2');
  });

  it('should have truncate the long description and allow to display it fully', () => {
    const tester = new GeneticResourceComponentTester();
    const component = tester.componentInstance;

    // given a resource with a long description
    const resource = toGeneticResource('Bacteria');
    resource.description = Array(500).fill('a').join('');
    component.geneticResource = resource;
    tester.detectChanges();

    // then we should truncate it
    expect(tester.fullDescriptionLink).not.toBeNull();
    const linkContent = '... (Voir tout)';
    expect(tester.fullDescriptionLink).toContainText(linkContent);
    expect(tester.description.textContent.length).toBe(256 + linkContent.length);

    // when we click on the link
    tester.fullDescriptionLink.dispatchEventOfType('click');

    // then we should display the full description
    expect(tester.fullDescription).not.toBeNull();
    expect(tester.fullDescription).toContainText(resource.description);
    expect(tester.shortDescriptionLink).not.toBeNull();
    expect(tester.shortDescriptionLink).toContainText('Réduire');
    expect(tester.description).toBeNull();
    expect(tester.fullDescriptionLink).toBeNull();
  });
});
