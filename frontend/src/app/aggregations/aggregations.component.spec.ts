import { TestBed } from '@angular/core/testing';
import { ComponentTester } from 'ngx-speculoos';

import { AggregationsComponent } from './aggregations.component';
import { SmallAggregationComponent } from '../small-aggregation/small-aggregation.component';
import { LargeAggregationComponent } from '../large-aggregation/large-aggregation.component';
import { DescendantsCheckboxComponent } from '../descendants-checkbox/descendants-checkbox.component';
import { environment } from '../../environments/environment';
import { Component } from '@angular/core';
import { Aggregation } from '../models/page';
import { toAggregation } from '../models/test-model-generators';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { provideI18nTesting } from '../i18n/mock-18n.spec';

@Component({
  template: ` <dd-aggregations
    [aggregations]="aggregations"
    (aggregationsChange)="aggregationsChanged = $event"
    [selectedCriteria]="selectedCriteria"
    [searchDescendants]="searchDescendants"
    (searchDescendantsChange)="searchDescendantsChanged = $event"
  />`,
  imports: [AggregationsComponent]
})
class TestComponent {
  aggregations: Array<Aggregation>;
  aggregationsChanged: Array<AggregationCriterion>;
  selectedCriteria: Array<AggregationCriterion> = [];
  searchDescendants = false;
  searchDescendantsChanged: boolean;
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get aggregationComponent() {
    return this.component(AggregationsComponent);
  }

  get smallAggregations() {
    return this.components(SmallAggregationComponent);
  }

  get searchDescendants() {
    return this.component(DescendantsCheckboxComponent);
  }

  get largeAggregations() {
    return this.components(LargeAggregationComponent);
  }
}

describe('AggregationsComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideI18nTesting()]
    })
  );

  afterEach(() => (environment.name = 'rare'));

  it('should display no aggregations if null', () => {
    const tester = new TestComponentTester();

    // given no aggregations
    tester.detectChanges();

    // then it should display no aggregations
    expect(tester.smallAggregations.length).toBe(0);
  });

  it('should display no aggregations if empty', () => {
    const tester = new TestComponentTester();
    const component = tester.componentInstance;

    // given no aggregations
    component.aggregations = [];
    tester.detectChanges();

    // then it should display no aggregations
    expect(tester.smallAggregations.length).toBe(0);
  });

  it('should extract the selected criteria for the aggregation', () => {
    const tester = new TestComponentTester();
    const component = tester.componentInstance;
    component.selectedCriteria = [
      { name: 'coo', values: ['France', 'Italy'] },
      { name: 'domain', values: ['Plant'] }
    ];
    tester.detectChanges();
    const cooCriteria = tester.aggregationComponent.selectedKeysForAggregation('coo');
    expect(cooCriteria).toEqual(['France', 'Italy']);

    const domainCriteria = tester.aggregationComponent.selectedKeysForAggregation('domain');
    expect(domainCriteria).toEqual(['Plant']);

    const unknownCriteria = tester.aggregationComponent.selectedKeysForAggregation('unknown');
    expect(unknownCriteria).toEqual([]);
  });

  it('should display aggregations if there are some', () => {
    const tester = new TestComponentTester();

    // given a few aggregations
    const domain = toAggregation('domain', ['Plant']);
    const coo = toAggregation('coo', ['France', 'Italy']);
    tester.componentInstance.aggregations = [domain, coo];
    tester.componentInstance.selectedCriteria = [{ name: 'coo', values: ['France'] }];
    tester.detectChanges();

    // then it should display each aggregation
    expect(tester.smallAggregations.length).toBe(2);
    const aggregation1 = tester.smallAggregations[0];
    expect(aggregation1.aggregation()).toBe(domain);
    expect(aggregation1.selectedKeys()).toEqual([]);
    const aggregation2 = tester.smallAggregations[1];
    expect(aggregation2.aggregation()).toBe(coo);
    expect(aggregation2.selectedKeys()).toEqual(['France']);
  });

  it('should display aggregations of different types', () => {
    const tester = new TestComponentTester();

    // given a few aggregations
    const domain = toAggregation('domain', ['Plant']);
    // country of origin as a large aggregation with 10 options to keep being large
    const coo = toAggregation('coo', [
      'France',
      'Italy',
      'Japan',
      'Indonesia',
      'New Zealand',
      'Chile',
      'Bolivia',
      'Argentina',
      'Antarctica',
      'Canada'
    ]);
    coo.type = 'LARGE';
    tester.componentInstance.aggregations = [domain, coo];
    tester.componentInstance.selectedCriteria = [{ name: 'coo', values: ['France'] }];
    tester.detectChanges();

    // then it should display an aggregation of each type
    expect(tester.smallAggregations.length).toBe(1);
    const small = tester.smallAggregations[0];
    expect(small.aggregation()).toBe(domain);
    expect(small.selectedKeys()).toEqual([]);

    expect(tester.largeAggregations.length).toBe(1);
    const large = tester.largeAggregations[0];
    expect(large.aggregation()).toBe(coo);
    expect(large.selectedKeys()).toEqual(['France']);
  });

  it('should display a small aggregation for a large one with few results', () => {
    const tester = new TestComponentTester();

    // given a few aggregations
    const domain = toAggregation('domain', ['Plant']);
    // country of origin as a large aggregation with only 2 options to see if it is displayed as a small one
    const coo = toAggregation('coo', ['France', 'Italy']);
    coo.type = 'LARGE';
    tester.componentInstance.aggregations = [domain, coo];
    tester.componentInstance.selectedCriteria = [{ name: 'coo', values: ['France'] }];
    tester.detectChanges();

    // then it should display 2 small aggregations
    expect(tester.smallAggregations.length).toBe(2);
    const small = tester.smallAggregations[0];
    expect(small.aggregation()).toBe(domain);
    expect(small.selectedKeys()).toEqual([]);
    const largeAsSmall = tester.smallAggregations[1];
    expect(largeAsSmall.aggregation()).toBe(coo);
    expect(largeAsSmall.selectedKeys()).toEqual(['France']);
  });

  it('should emit change when a criterion changes', () => {
    const tester = new TestComponentTester();

    // given a few aggregations
    const domain = toAggregation('domain', ['Plant']);
    const coo = toAggregation('coo', ['France', 'Italy']);
    tester.componentInstance.aggregations = [domain, coo];
    tester.componentInstance.selectedCriteria = [{ name: 'coo', values: ['France'] }];
    tester.detectChanges();

    // when the aggregation emits an event
    const aggregationComponent = tester.smallAggregations[0];
    const criteria = { name: 'coo', values: ['France'] };
    aggregationComponent.aggregationChange.emit(criteria);

    // then it should add a emit an event
    expect(tester.componentInstance.aggregationsChanged.length).toBe(1);
    expect(tester.componentInstance.aggregationsChanged[0]).toBe(criteria);

    // when the aggregation emits an event with another value
    const updatedCriteria = { name: 'coo', values: ['France', 'Italy'] };
    aggregationComponent.aggregationChange.emit(updatedCriteria);

    // then it should update the existing criteria
    expect(tester.componentInstance.aggregationsChanged.length).toBe(1);
    expect(tester.componentInstance.aggregationsChanged[0]).toBe(updatedCriteria);

    // when the aggregation emits an event with no values
    const emptyCriteria = { name: 'coo', values: [] as Array<string> };
    aggregationComponent.aggregationChange.emit(emptyCriteria);

    // then it should delete the criteria
    expect(tester.componentInstance.aggregationsChanged[0]).toBe(emptyCriteria);
  });

  it('should emit all criteria when an aggregation emits a change', () => {
    const tester = new TestComponentTester();

    // given an aggregation
    const domain = toAggregation('domain', ['Plant']);
    const coo = toAggregation('coo', ['France', 'Italy']);
    tester.componentInstance.aggregations = [domain, coo];
    // and two selected criteria
    tester.componentInstance.selectedCriteria = [
      { name: 'domain', values: ['Plant'] },
      { name: 'coo', values: ['Italy'] }
    ];
    tester.detectChanges();

    // when an event is emitted by an aggregation
    const aggregationComponent = tester.smallAggregations[0];
    aggregationComponent.aggregationChange.emit({
      name: 'coo',
      values: ['France']
    });
    tester.detectChanges();

    expect(tester.componentInstance.aggregationsChanged.length).toBe(2);
    expect(tester.componentInstance.aggregationsChanged[0].name).toBe('domain');
    expect(tester.componentInstance.aggregationsChanged[0].values).toEqual(['Plant']);
    expect(tester.componentInstance.aggregationsChanged[1].name).toBe('coo');
    expect(tester.componentInstance.aggregationsChanged[1].values).toEqual(['France']);
  });

  it('should emit when the search descendant option emits a change for small aggregation', () => {
    environment.name = 'wheatis'; // annot is not available in the rare version of the app
    const tester = new TestComponentTester();

    // given an annot aggregation (small)
    const annot = toAggregation('annot', ['annot1']);
    tester.componentInstance.aggregations = [annot];
    tester.detectChanges();

    // one small aggregation
    expect(tester.smallAggregations.length).toBe(1);

    // when an event is emitted by an aggregation
    const searchDescendants = tester.searchDescendants;
    searchDescendants.searchDescendants.set(true);
    tester.detectChanges();

    expect(tester.componentInstance.searchDescendantsChanged).toBeTrue();
  });

  it('should emit when the search descendant option emits a change for large aggregation', () => {
    environment.name = 'wheatis'; // annot is not available in the rare version of the app
    const tester = new TestComponentTester();

    // given an annot aggregation (large)
    const component = tester.componentInstance;
    const annot = toAggregation('annot', [
      'a0',
      'a1',
      'a2',
      'a3',
      'a4',
      'a5',
      'a6',
      'a7',
      'a8',
      'a9'
    ]);
    annot.type = 'LARGE';
    component.aggregations = [annot];
    tester.detectChanges();

    // one large aggregation
    expect(tester.largeAggregations.length).toBe(1);

    // when an event is emitted by an aggregation
    tester.searchDescendants.searchDescendants.set(true);
    tester.detectChanges();

    expect(tester.componentInstance.searchDescendantsChanged).toBeTrue();
  });
});
