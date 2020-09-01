import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { ComponentTester } from 'ngx-speculoos';

import { AggregationsComponent } from './aggregations.component';
import { SmallAggregationComponent } from '../small-aggregation/small-aggregation.component';
import { LargeAggregationComponent } from '../large-aggregation/large-aggregation.component';
import { toAggregation } from '../models/test-model-generators';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { AggregationNamePipe } from '../aggregation-name.pipe';
import { DocumentCountComponent } from '../document-count/document-count.component';
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';
import {DescendantsCheckboxComponent} from '../descendants-checkbox/descendants-checkbox.component';
import { I18nTestingModule } from '../i18n/i18n-testing.module.spec';

describe('AggregationsComponent', () => {

  class AggregationsComponentTester extends ComponentTester<AggregationsComponent> {
    constructor() {
      super(AggregationsComponent);
    }

    get aggregations() {
      return this.debugElement.queryAll(By.directive(SmallAggregationComponent));
    }

    get largeAggregations() {
      return this.debugElement.queryAll(By.directive(LargeAggregationComponent));
    }
  }

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      ReactiveFormsModule,
      NgbTypeaheadModule,
      NgbTooltipModule,
      I18nTestingModule
    ],
    declarations: [
      AggregationsComponent,
      SmallAggregationComponent,
      LargeAggregationComponent,
      AggregationNamePipe,
      DocumentCountComponent,
      LoadingSkeletonComponent,
      DescendantsCheckboxComponent
    ]
  }));

  it('should display no aggregations if null', () => {
    const tester = new AggregationsComponentTester();

    // given no aggregations
    tester.detectChanges();

    // then it should display no aggregations
    expect(tester.aggregations.length).toBe(0);
  });

  it('should display no aggregations if empty', () => {
    const tester = new AggregationsComponentTester();
    const component = tester.componentInstance;

    // given no aggregations
    component.aggregations = [];
    tester.detectChanges();

    // then it should display no aggregations
    expect(tester.aggregations.length).toBe(0);
  });

  it('should extract the selected criteria for the aggregation', () => {
    const component = new AggregationsComponent();
    component.selectedCriteria = [{ name: 'coo', values: ['France', 'Italy'] }, { name: 'domain', values: ['Plant'] }];
    const cooCriteria = component.selectedKeysForAggregation('coo');
    expect(cooCriteria).toEqual(['France', 'Italy']);

    const domainCriteria = component.selectedKeysForAggregation('domain');
    expect(domainCriteria).toEqual(['Plant']);

    const unknownCriteria = component.selectedKeysForAggregation('unknown');
    expect(unknownCriteria).toEqual([]);
  });

  it('should display aggregations if there are some', () => {
    const tester = new AggregationsComponentTester();
    const component = tester.componentInstance;

    // given a few aggregations
    const domain = toAggregation('domain', ['Plant']);
    const coo = toAggregation('coo', ['France', 'Italy']);
    component.aggregations = [domain, coo];
    component.selectedCriteria = [{ name: 'coo', values: ['France'] }];
    tester.detectChanges();

    // then it should display each aggregation
    expect(tester.aggregations.length).toBe(2);
    const aggregation1 = tester.aggregations[0].componentInstance as SmallAggregationComponent;
    expect(aggregation1.aggregation).toBe(domain);
    expect(aggregation1.selectedKeys).toEqual([]);
    const aggregation2 = tester.aggregations[1].componentInstance as SmallAggregationComponent;
    expect(aggregation2.aggregation).toBe(coo);
    expect(aggregation2.selectedKeys).toEqual(['France']);
  });

  it('should display aggregations of different types', () => {
    const tester = new AggregationsComponentTester();
    const component = tester.componentInstance;

    // given a few aggregations
    const domain = toAggregation('domain', ['Plant']);
    // country of origin as a large aggregation with 10 options to keep being large
    const coo = toAggregation('coo', ['France', 'Italy', 'Japan', 'Indonesia', 'New Zealand',
      'Chile', 'Bolivia', 'Argentina', 'Antarctica', 'Canada']);
    coo.type = 'LARGE';
    component.aggregations = [domain, coo];
    component.selectedCriteria = [{ name: 'coo', values: ['France'] }];
    tester.detectChanges();

    // then it should display an aggregation of each type
    expect(tester.aggregations.length).toBe(1);
    const small = tester.aggregations[0].componentInstance as SmallAggregationComponent;
    expect(small.aggregation).toBe(domain);
    expect(small.selectedKeys).toEqual([]);

    expect(tester.largeAggregations.length).toBe(1);
    const large = tester.largeAggregations[0].componentInstance as LargeAggregationComponent;
    expect(large.aggregation).toBe(coo);
    expect(large.selectedKeys).toEqual(['France']);
  });

  it('should display a small aggregation for a large one with few results', () => {
    const tester = new AggregationsComponentTester();
    const component = tester.componentInstance;

    // given a few aggregations
    const domain = toAggregation('domain', ['Plant']);
    // country of origin as a large aggregation with only 2 options to see if it is displayed as a small one
    const coo = toAggregation('coo', ['France', 'Italy']);
    coo.type = 'LARGE';
    component.aggregations = [domain, coo];
    component.selectedCriteria = [{ name: 'coo', values: ['France'] }];
    tester.detectChanges();

    // then it should display 2 small aggregations
    expect(tester.aggregations.length).toBe(2);
    const small = tester.aggregations[0].componentInstance as SmallAggregationComponent;
    expect(small.aggregation).toBe(domain);
    expect(small.selectedKeys).toEqual([]);
    const largeAsSmall = tester.aggregations[1].componentInstance as LargeAggregationComponent;
    expect(largeAsSmall.aggregation).toBe(coo);
    expect(largeAsSmall.selectedKeys).toEqual(['France']);
  });

  it('should update criteria when a criterion changes', () => {
    const tester = new AggregationsComponentTester();
    const component = tester.componentInstance;

    // given a few aggregations
    const domain = toAggregation('domain', ['Plant']);
    const coo = toAggregation('coo', ['France', 'Italy']);
    component.aggregations = [domain, coo];
    component.selectedCriteria = [{ name: 'coo', values: ['France'] }];
    tester.detectChanges();

    // when the aggregation emits an event
    const aggregationComponent = tester.aggregations[0].componentInstance as SmallAggregationComponent;
    const criteria = { name: 'coo', values: ['France'] };
    aggregationComponent.aggregationChange.emit(criteria);

    // then it should add a criteria
    expect(component.selectedCriteria.length).toBe(1);
    expect(component.selectedCriteria[0]).toBe(criteria);

    // when the aggregation emits an event with another value
    const updatedCriteria = { name: 'coo', values: ['France', 'Italy'] };
    aggregationComponent.aggregationChange.emit(updatedCriteria);

    // then it should update the existing criteria
    expect(component.selectedCriteria.length).toBe(1);
    expect(component.selectedCriteria[0]).toBe(updatedCriteria);

    // when the aggregation emits an event with no values
    const emptyCriteria = { name: 'coo', values: [] as Array<string> };
    aggregationComponent.aggregationChange.emit(emptyCriteria);

    // then it should delete the criteria
    expect(component.selectedCriteria.length).toBe(0);
  });

  it('should emit all criteria when an aggregation emits a change', fakeAsync(() => {
    const tester = new AggregationsComponentTester();

    // given an aggregation
    const component = tester.componentInstance;
    const domain = toAggregation('domain', ['Plant']);
    const coo = toAggregation('coo', ['France', 'Italy']);
    component.aggregations = [domain, coo];
    // and two selected criteria
    component.selectedCriteria = [
      { name: 'domain', values: ['Plant'] },
      { name: 'coo', values: ['Italy'] }
    ];
    tester.detectChanges();

    // then it should emit an event
    let emittedEvent: Array<AggregationCriterion> = [];
    component.aggregationsChange.subscribe((event: Array<AggregationCriterion>) => emittedEvent = event);

    // when an event is emitted by an aggregation
    const aggregationComponent = tester.aggregations[0].componentInstance as SmallAggregationComponent;
    aggregationComponent.aggregationChange.emit({
      name: 'coo',
      values: ['France']
    });
    tester.detectChanges();
    tick();

    expect(emittedEvent.length).toBe(2);
    expect(emittedEvent[0].name).toBe('domain');
    expect(emittedEvent[0].values).toEqual(['Plant']);
    expect(emittedEvent[1].name).toBe('coo');
    expect(emittedEvent[1].values).toEqual(['France']);
  }));
});
