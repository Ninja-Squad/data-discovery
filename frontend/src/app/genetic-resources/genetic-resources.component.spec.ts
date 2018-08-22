import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID } from '@angular/core';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';

import { GeneticResourcesComponent } from './genetic-resources.component';
import { RareGeneticResourceComponent } from '../rare/rare-genetic-resource/rare-genetic-resource.component';
import { TruncatableDescriptionComponent } from '../truncatable-description/truncatable-description.component';
import { toRareGeneticResource, toSinglePage } from '../models/test-model-generators';
import { GeneticResourceModel } from '../models/genetic-resource.model';

describe('GeneticResourcesComponent', () => {

  class GeneticResourcesComponentTester extends ComponentTester<GeneticResourcesComponent> {
    constructor() {
      super(GeneticResourcesComponent);
    }

    get results() {
      return this.debugElement.queryAll(By.directive(RareGeneticResourceComponent));
    }

    get noResults() {
      return this.element('#no-results');
    }

    get resume() {
      return this.element('#resume');
    }
  }

  beforeEach(() => {
    registerLocaleData(localeFr);
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [GeneticResourcesComponent, RareGeneticResourceComponent, TruncatableDescriptionComponent],
      providers: [
        { provide: LOCALE_ID, useValue: 'fr-FR' }
      ]
    });

    jasmine.addMatchers(speculoosMatchers);
  });

  it('should display no results if empty', () => {
    const tester = new GeneticResourcesComponentTester();
    const component = tester.componentInstance;

    // given no results
    component.geneticResources = toSinglePage([]);
    tester.detectChanges();

    // then it should display a message
    expect(tester.results.length).toBe(0);
    expect(tester.resume).toBeNull();
    expect(tester.noResults).not.toBeNull();
  });

  it('should display results if there are some', () => {
    const tester = new GeneticResourcesComponentTester();
    const component = tester.componentInstance;

    // given two results
    const bacteria1 = toRareGeneticResource('Bacteria1');
    const bacteria2 = toRareGeneticResource('Bacteria2');
    component.geneticResources = toSinglePage([bacteria1, bacteria2]);
    tester.detectChanges();

    // then it should display each result
    expect(tester.noResults).toBeNull();
    expect(tester.results.length).toBe(2);

    const result1 = tester.results[0].componentInstance as RareGeneticResourceComponent;
    expect(result1.geneticResource).toBe(bacteria1);
    const result2 = tester.results[1].componentInstance as RareGeneticResourceComponent;
    expect(result2.geneticResource).toBe(bacteria2);

    expect(tester.resume).toContainText('Résultats 1 à 2 sur 2');
    expect(tester.resume).not.toContainText('limités');
  });

  it('should display limited results in resume, and format numbers in French', () => {
    const tester = new GeneticResourcesComponentTester();
    const component = tester.componentInstance;

    // given results
    const content: Array<GeneticResourceModel> = [];
    for (let i = 0; i < 20; i++) {
      content.push(toRareGeneticResource(`Bacteria ${i}`));
    }

    // in page 200 on a limited number of pages
    component.geneticResources = toSinglePage(content);
    component.geneticResources.totalElements = 12000;
    component.geneticResources.totalPages = 500;
    component.geneticResources.number = 200;

    tester.detectChanges();

    // then it should display each result
    expect(tester.noResults).toBeNull();
    expect(tester.results.length).toBe(20);
    expect(tester.resume).toContainText('Résultats 4\u00a0001 à 4\u00a0020 sur 12\u00a0000 (limités à 10\u00a0000)');
  });
});
