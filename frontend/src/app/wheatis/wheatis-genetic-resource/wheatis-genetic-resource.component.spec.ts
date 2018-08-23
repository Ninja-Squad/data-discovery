import { TestBed } from '@angular/core/testing';
import { speculoosMatchers, ComponentTester } from 'ngx-speculoos';

import { WheatisGeneticResourceComponent } from './wheatis-genetic-resource.component';
import { toWheatisGeneticResource } from '../../models/test-model-generators';
import { TruncatableDescriptionComponent } from '../../truncatable-description/truncatable-description.component';

describe('WheatisGeneticResourceComponent', () => {

  class WheatisGeneticResourceComponentTester extends ComponentTester<WheatisGeneticResourceComponent> {
    constructor() {
      super(WheatisGeneticResourceComponent);
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

  beforeEach(() => TestBed.configureTestingModule({
    declarations: [WheatisGeneticResourceComponent, TruncatableDescriptionComponent]
  }));

  beforeEach(() => jasmine.addMatchers(speculoosMatchers));

  it('should display a resource', () => {
    const tester = new WheatisGeneticResourceComponentTester();
    const component = tester.componentInstance;

    // given a resource
    const resource = toWheatisGeneticResource('Bacteria');
    component.geneticResource = resource;
    tester.detectChanges();

    // then we should display it
    expect(tester.title).toContainText(resource.name);
    expect(tester.title).toContainText(resource.databaseName);
    expect(tester.link).toContainText(resource.name);
    expect(tester.link.attr('href')).toBe(resource.url);
    expect(tester.type).toContainText(resource.entryType);
    resource.species.forEach(text => expect(tester.species).toContainText(text));
    expect(tester.description).toContainText(resource.description);
    expect(tester.fullDescriptionButton).toBeNull();
    expect(tester.fullDescription).toBeNull();
    expect(tester.shortDescriptionButton).toBeNull();
  });
});
