import { TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { AggregationsComponent } from './aggregations.component';
import { SmallAggregationComponent } from '../small-aggregation/small-aggregation.component';
import { LargeAggregationComponent } from '../large-aggregation/large-aggregation.component';
import { DescendantsCheckboxComponent } from '../descendants-checkbox/descendants-checkbox.component';
import { environment } from '../../environments/environment';
import { Aggregation } from '../models/page';
import { toAggregation } from '../models/test-model-generators';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { provideI18nTesting } from '../i18n/mock-18n';
import { By } from '@angular/platform-browser';

@Component({
  template: ` <dd-aggregations
    [aggregations]="aggregations()"
    (aggregationsChange)="aggregationsChanged.set($event)"
    [selectedCriteria]="selectedCriteria()"
    [searchDescendants]="searchDescendants()"
    (searchDescendantsChange)="searchDescendantsChanged.set($event)"
  />`,
  imports: [AggregationsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dd-aggregations-tester'
})
class TestComponent {
  readonly aggregations = signal<Array<Aggregation>>([]);
  readonly aggregationsChanged = signal<Array<AggregationCriterion> | undefined>(undefined);
  readonly selectedCriteria = signal<Array<AggregationCriterion>>([]);
  readonly searchDescendants = signal(false);
  readonly searchDescendantsChanged = signal(false);
}

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly smallAggregations = page.getByCss('dd-small-aggregation');
  readonly searchDescendants = page.getByCss('dd-descendants-checkbox');
  readonly largeAggregations = page.getByCss('dd-large-aggregation');

  get aggregationComponent() {
    return this.fixture.debugElement.query(By.directive(AggregationsComponent))
      ?.componentInstance as AggregationsComponent;
  }

  get smallAggregationComponents() {
    return this.fixture.debugElement
      .queryAll(By.directive(SmallAggregationComponent))
      .map(el => el.componentInstance as SmallAggregationComponent);
  }

  get largeAggregationComponents() {
    return this.fixture.debugElement
      .queryAll(By.directive(LargeAggregationComponent))
      .map(el => el.componentInstance as LargeAggregationComponent);
  }

  get descendantsCheckboxComponent() {
    return this.fixture.debugElement.query(By.directive(DescendantsCheckboxComponent))
      ?.componentInstance as DescendantsCheckboxComponent;
  }
}

describe('AggregationsComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideI18nTesting()]
    })
  );

  afterEach(() => (environment.name = 'rare'));

  test('should display no aggregations if null', async () => {
    const tester = new TestComponentTester();

    // given no aggregations

    // then it should display no aggregations
    expect(tester.smallAggregations).toHaveLength(0);
  });

  test('should display no aggregations if empty', async () => {
    const tester = new TestComponentTester();

    // given no aggregations

    // then it should display no aggregations
    expect(tester.smallAggregations).toHaveLength(0);
  });

  test('should extract the selected criteria for the aggregation', async () => {
    const tester = new TestComponentTester();
    tester.componentInstance.selectedCriteria.set([
      { name: 'coo', values: ['France', 'Italy'] },
      { name: 'domain', values: ['Plant'] }
    ]);
    await tester.fixture.whenStable();
    const cooCriteria = tester.aggregationComponent.selectedKeysForAggregation('coo');
    expect(cooCriteria).toEqual(['France', 'Italy']);

    const domainCriteria = tester.aggregationComponent.selectedKeysForAggregation('domain');
    expect(domainCriteria).toEqual(['Plant']);

    const unknownCriteria = tester.aggregationComponent.selectedKeysForAggregation('unknown');
    expect(unknownCriteria).toEqual([]);
  });

  test('should display aggregations if there are some', async () => {
    const tester = new TestComponentTester();

    // given a few aggregations
    const domain = toAggregation('domain', ['Plant']);
    const coo = toAggregation('coo', ['France', 'Italy']);
    tester.componentInstance.aggregations.set([domain, coo]);
    tester.componentInstance.selectedCriteria.set([{ name: 'coo', values: ['France'] }]);
    await tester.fixture.whenStable();

    // then it should display each aggregation
    expect(tester.smallAggregations).toHaveLength(2);
    const aggregation1 = tester.smallAggregationComponents[0];
    expect(aggregation1.aggregation()).toBe(domain);
    expect(aggregation1.selectedKeys()).toEqual([]);
    const aggregation2 = tester.smallAggregationComponents[1];
    expect(aggregation2.aggregation()).toBe(coo);
    expect(aggregation2.selectedKeys()).toEqual(['France']);
  });

  test('should display aggregations of different types', async () => {
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
    tester.componentInstance.aggregations.set([domain, coo]);
    tester.componentInstance.selectedCriteria.set([{ name: 'coo', values: ['France'] }]);
    await tester.fixture.whenStable();

    // then it should display an aggregation of each type
    expect(tester.smallAggregations).toHaveLength(1);
    const small = tester.smallAggregationComponents[0];
    expect(small.aggregation()).toBe(domain);
    expect(small.selectedKeys()).toEqual([]);

    expect(tester.largeAggregations).toHaveLength(1);
    const large = tester.largeAggregationComponents[0];
    expect(large.aggregation()).toBe(coo);
    expect(large.selectedKeys()).toEqual(['France']);
  });

  test('should display a small aggregation for a large one with few results', async () => {
    const tester = new TestComponentTester();

    // given a few aggregations
    const domain = toAggregation('domain', ['Plant']);
    // country of origin as a large aggregation with only 2 options to see if it is displayed as a small one
    const coo = toAggregation('coo', ['France', 'Italy']);
    coo.type = 'LARGE';
    tester.componentInstance.aggregations.set([domain, coo]);
    tester.componentInstance.selectedCriteria.set([{ name: 'coo', values: ['France'] }]);
    await tester.fixture.whenStable();

    // then it should display 2 small aggregations
    expect(tester.smallAggregations).toHaveLength(2);
    const small = tester.smallAggregationComponents[0];
    expect(small.aggregation()).toBe(domain);
    expect(small.selectedKeys()).toEqual([]);
    const largeAsSmall = tester.smallAggregationComponents[1];
    expect(largeAsSmall.aggregation()).toBe(coo);
    expect(largeAsSmall.selectedKeys()).toEqual(['France']);
  });

  test('should emit change when a criterion changes', async () => {
    const tester = new TestComponentTester();

    // given a few aggregations
    const domain = toAggregation('domain', ['Plant']);
    const coo = toAggregation('coo', ['France', 'Italy']);
    tester.componentInstance.aggregations.set([domain, coo]);
    tester.componentInstance.selectedCriteria.set([{ name: 'coo', values: ['France'] }]);
    await tester.fixture.whenStable();

    // when the aggregation emits an event
    const aggregationComponent = tester.smallAggregationComponents[0];
    const criteria = { name: 'coo', values: ['France'] };
    aggregationComponent.aggregationChange.emit(criteria);

    // then it should add a emit an event
    expect(tester.componentInstance.aggregationsChanged()!.length).toBe(1);
    expect(tester.componentInstance.aggregationsChanged()![0]).toBe(criteria);

    // when the aggregation emits an event with another value
    const updatedCriteria = { name: 'coo', values: ['France', 'Italy'] };
    aggregationComponent.aggregationChange.emit(updatedCriteria);

    // then it should update the existing criteria
    expect(tester.componentInstance.aggregationsChanged()!.length).toBe(1);
    expect(tester.componentInstance.aggregationsChanged()![0]).toBe(updatedCriteria);

    // when the aggregation emits an event with no values
    const emptyCriteria = { name: 'coo', values: [] as Array<string> };
    aggregationComponent.aggregationChange.emit(emptyCriteria);

    // then it should delete the criteria
    expect(tester.componentInstance.aggregationsChanged()![0]).toBe(emptyCriteria);
  });

  test('should emit all criteria when an aggregation emits a change', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    const domain = toAggregation('domain', ['Plant']);
    const coo = toAggregation('coo', ['France', 'Italy']);
    tester.componentInstance.aggregations.set([domain, coo]);
    // and two selected criteria
    tester.componentInstance.selectedCriteria.set([
      { name: 'domain', values: ['Plant'] },
      { name: 'coo', values: ['Italy'] }
    ]);
    await tester.fixture.whenStable();

    // when an event is emitted by an aggregation
    const aggregationComponent = tester.smallAggregationComponents[0];
    aggregationComponent.aggregationChange.emit({
      name: 'coo',
      values: ['France']
    });
    await tester.fixture.whenStable();

    expect(tester.componentInstance.aggregationsChanged()!.length).toBe(2);
    expect(tester.componentInstance.aggregationsChanged()![0].name).toBe('domain');
    expect(tester.componentInstance.aggregationsChanged()![0].values).toEqual(['Plant']);
    expect(tester.componentInstance.aggregationsChanged()![1].name).toBe('coo');
    expect(tester.componentInstance.aggregationsChanged()![1].values).toEqual(['France']);
  });

  test('should emit when the search descendant option emits a change for small aggregation', async () => {
    environment.name = 'wheatis'; // annot is not available in the rare version of the app
    const tester = new TestComponentTester();

    // given an annot aggregation (small)
    const annot = toAggregation('annot', ['annot1']);
    tester.componentInstance.aggregations.set([annot]);
    await tester.fixture.whenStable();

    // one small aggregation
    expect(tester.smallAggregations).toHaveLength(1);

    // when an event is emitted by an aggregation
    const searchDescendants = tester.descendantsCheckboxComponent;
    searchDescendants.searchDescendants.set(true);
    await tester.fixture.whenStable();

    expect(tester.componentInstance.searchDescendantsChanged()).toBe(true);
  });

  test('should emit when the search descendant option emits a change for large aggregation', async () => {
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
    component.aggregations.set([annot]);
    await tester.fixture.whenStable();

    // one large aggregation
    expect(tester.largeAggregations).toHaveLength(1);

    // when an event is emitted by an aggregation
    tester.descendantsCheckboxComponent.searchDescendants.set(true);
    await tester.fixture.whenStable();

    expect(tester.componentInstance.searchDescendantsChanged()).toBe(true);
  });
});
