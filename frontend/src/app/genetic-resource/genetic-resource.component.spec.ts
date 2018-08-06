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

  it('should truncate the long description and allow to display it fully', () => {
    const tester = new GeneticResourceComponentTester();
    const component = tester.componentInstance;

    // given a resource with a long description
    const resource = toGeneticResource('Bacteria');
    resource.description = Array(200).fill('aaa').join(' ');
    component.geneticResource = resource;
    tester.detectChanges();

    // then we should truncate it
    expect(tester.fullDescriptionButton).not.toBeNull();
    const linkContent = '... (Voir tout)';
    expect(tester.fullDescriptionButton).toContainText(linkContent);
    expect(tester.description.textContent.length).toBeLessThanOrEqual(256 + linkContent.length);
    expect(tester.description.textContent.length).toBeGreaterThanOrEqual(252 + linkContent.length);

    // when we click on the link
    tester.fullDescriptionButton.click();

    // then we should display the full description
    expect(tester.fullDescription).not.toBeNull();
    expect(tester.fullDescription).toContainText(resource.description);
    expect(tester.shortDescriptionButton).not.toBeNull();
    expect(tester.shortDescriptionButton).toContainText('Réduire');
    expect(tester.description).toBeNull();
    expect(tester.fullDescriptionButton).toBeNull();
  });

  it('should display a highlighted description (truncated and full)', () => {
    const tester = new GeneticResourceComponentTester();
    const component = tester.componentInstance;

    // given a resource with a long highlighted description
    const resource = toGeneticResource('Bacteria');
    const description = 'Hello <em>world</em>! The <em>world</em> is&nbsp;beautiful.';
    resource.description = description + ' ' + Array(200).fill('aaa').join(' ');
    component.geneticResource = resource;
    tester.detectChanges();

    // it should highlight the short description
    expect(tester.description).toContainText('Hello world! The world is\u00A0beautiful.');

    tester.fullDescriptionButton.click();

    // and also the long description
    expect(tester.fullDescription).toContainText('Hello world! The world is\u00A0beautiful.');
  });
});
