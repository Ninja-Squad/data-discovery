import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentTester } from 'ngx-speculoos';

import { GeneticResourcesComponent } from './genetic-resources.component';
import { GeneticResourceComponent } from '../genetic-resource/genetic-resource.component';
import { toGeneticResource, toSinglePage } from '../models/test-model-generators';

describe('GeneticResourcesComponent', () => {

  class GeneticResourcesComponentTester extends ComponentTester<GeneticResourcesComponent> {
    constructor() {
      super(GeneticResourcesComponent);
    }

    get results() {
      return this.debugElement.queryAll(By.directive(GeneticResourceComponent));
    }

    get noResults() {
      return this.nativeElement.querySelector('#no-results');
    }
  }

  beforeEach(() => TestBed.configureTestingModule({
    imports: [ReactiveFormsModule],
    declarations: [GeneticResourcesComponent, GeneticResourceComponent]
  }));

  it('should display no results if null', () => {
    const tester = new GeneticResourcesComponentTester();

    // given no results
    tester.detectChanges();

    // then it should display a message
    expect(tester.results.length).toBe(0);
    expect(tester.noResults).not.toBeNull();
  });

  it('should display no results if empty', () => {
    const tester = new GeneticResourcesComponentTester();
    const component = tester.componentInstance;

    // given no results
    component.geneticResources = toSinglePage([]);
    tester.detectChanges();

    // then it should display a message
    expect(tester.results.length).toBe(0);
    expect(tester.noResults).not.toBeNull();
  });

  it('should display results if there are some', () => {
    const tester = new GeneticResourcesComponentTester();
    const component = tester.componentInstance;

    // given no results
    const bacteria1 = toGeneticResource('Bacteria1');
    const bacteria2 = toGeneticResource('Bacteria2');
    component.geneticResources = toSinglePage([bacteria1, bacteria2]);
    tester.detectChanges();

    // then it should display each result
    expect(tester.noResults).toBeNull();
    expect(tester.results.length).toBe(2);
    const result1 = tester.results[0].componentInstance as GeneticResourceComponent;
    expect(result1.geneticResource).toBe(bacteria1);
    const result2 = tester.results[1].componentInstance as GeneticResourceComponent;
    expect(result2.geneticResource).toBe(bacteria2);
  });
});
