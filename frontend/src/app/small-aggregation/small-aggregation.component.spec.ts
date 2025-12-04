import { TestBed } from '@angular/core/testing';
import { ComponentTester, TestInput } from 'ngx-speculoos';

import { SmallAggregationComponent } from './small-aggregation.component';
import { toAggregation } from '../models/test-model-generators';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { NULL_VALUE } from '../models/document.model';
import { DescendantsCheckboxComponent } from '../descendants-checkbox/descendants-checkbox.component';
import { environment } from '../../environments/environment';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Aggregation } from '../models/page';
import { provideI18nTesting } from '../i18n/mock-18n.spec';

@Component({
  template: `@if (aggregation(); as aggregation) {
    <dd-small-aggregation
      [aggregation]="aggregation"
      (aggregationChange)="aggregationChanged.set($event)"
      [searchDescendants]="searchDescendants()"
      (searchDescendantsChange)="searchDescendantsChanged.set($event)"
      [selectedKeys]="selectedKeys()"
      [disabled]="disabled()"
    />
  }`,
  imports: [SmallAggregationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dd-small-aggregation-tester'
})
class TestComponent {
  readonly aggregation = signal<Aggregation | undefined>(undefined);
  readonly aggregationChanged = signal<AggregationCriterion | undefined>(undefined);
  readonly searchDescendants = signal(false);
  readonly searchDescendantsChanged = signal(false);
  readonly selectedKeys = signal<Array<string>>([]);
  readonly disabled = signal(false);
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get title() {
    return this.element('.card-title')!;
  }

  get labels() {
    return this.elements('label');
  }

  get firstCheckbox() {
    return this.input('input')!;
  }

  get checkboxes() {
    return this.elements('input') as Array<TestInput>;
  }

  get searchDescendants() {
    return this.component(DescendantsCheckboxComponent);
  }

  get smallAggregationComponent(): SmallAggregationComponent {
    return this.component(SmallAggregationComponent);
  }
}

describe('SmallAggregationComponent', () => {
  const aggregation = toAggregation('coo', ['France', 'Italy', 'New Zealand', NULL_VALUE]);

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideI18nTesting()] }));

  afterEach(() => (environment.name = 'rare'));

  it('should display an aggregation with buckets', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(aggregation);
    await tester.stable();

    // then it should display a title
    expect(tester.title).toContainText('Country of origin');
    // and the buckets with their name and count
    expect(tester.labels.length).toBe(4);
    expect(tester.labels[0]).toContainText('France');
    expect(tester.labels[0]).toContainText('[10]');
    expect(tester.labels[1]).toContainText('Italy');
    expect(tester.labels[1]).toContainText('[20]');
    expect(tester.labels[2]).toContainText('New Zealand');
    expect(tester.labels[2]).toContainText('[30]');
    expect(tester.labels[3]).toContainText('None');
    expect(tester.labels[3]).toContainText('[40]');
  });

  it('should not display an aggregation with empty buckets', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(toAggregation('coo', []));
    await tester.stable();

    // then it should not display a title
    expect(tester.title).toBeNull();
    // and the buckets should not be displayed either
    expect(tester.labels.length).toBe(0);
  });

  it('should extract keys from selected values', () => {
    // given a few selected values among a bucket
    const values: Record<string, boolean | null> = {
      France: true,
      England: false,
      Italy: true,
      'New Zealand': null,
      [NULL_VALUE]: true
    };

    // when extracting keys
    const keys = SmallAggregationComponent.extractKeys(values);

    // then it should return only the truthy ones
    expect(keys).toEqual(['France', 'Italy', NULL_VALUE]);
  });

  it('should build a form based on the bucket', async () => {
    const tester = new TestComponentTester();
    // given an aggregation with a bucket
    tester.componentInstance.aggregation.set(aggregation);

    // when initializing the component
    await tester.stable();

    // then it should have a form with several fields
    const controls = tester.smallAggregationComponent.aggregationForm.controls;
    expect(Object.keys(controls)).toEqual(['France', 'Italy', 'New Zealand', NULL_VALUE]);
  });

  it('should build a form and check selected criteria', async () => {
    // given an aggregation with a bucket and a selected value
    const selectedKeys = ['France'];

    const tester = new TestComponentTester();
    tester.componentInstance.aggregation.set(aggregation);
    tester.componentInstance.selectedKeys.set(selectedKeys);

    // when initializing the component
    await tester.stable();

    // then it should have a form with several fields
    const controls = tester.smallAggregationComponent.aggregationForm.controls;
    expect(Object.keys(controls)).toEqual(['France', 'Italy', 'New Zealand', NULL_VALUE]);
    // and France should be checked
    expect(tester.smallAggregationComponent.aggregationForm.get('France')!.value).toBeTruthy();
  });

  it('should emit an event when a checkbox is toggled', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(aggregation);
    await tester.stable();
    expect(tester.firstCheckbox).not.toBeChecked();

    // then it should emit an event
    // when a value is checked
    await tester.firstCheckbox.check();
    await tester.stable();

    expect(tester.firstCheckbox).toBeChecked();
    expect(tester.componentInstance.aggregationChanged()).toEqual({
      name: 'coo',
      values: ['France']
    });
  });

  it('should change the selected values in the form when the selectedValues input changes, without emitting events', async () => {
    const tester = new TestComponentTester();
    tester.componentInstance.aggregation.set(aggregation);
    tester.componentInstance.selectedKeys.set([]);

    // when initializing the component
    await tester.stable();

    // it should have a form with no selected checkbox
    expect(tester.smallAggregationComponent.aggregationForm.value).toEqual({
      France: false,
      Italy: false,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // when changing the selected values
    tester.componentInstance.selectedKeys.set(['France']);
    await tester.stable();

    // it should update the form selected checkbox
    expect(tester.smallAggregationComponent.aggregationForm.value).toEqual({
      France: true,
      Italy: false,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // when changing the selected values
    tester.componentInstance.selectedKeys.set(['France', 'Italy']);
    await tester.stable();

    // it should update the form selected checkboxes
    expect(tester.smallAggregationComponent.aggregationForm.value).toEqual({
      France: true,
      Italy: true,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // when changing the selected values but with no actual change
    tester.componentInstance.selectedKeys.set(['Italy', 'France']);
    await tester.stable();

    // it should leave the form selected checkboxes as they are
    expect(tester.smallAggregationComponent.aggregationForm.value).toEqual({
      France: true,
      Italy: true,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // when changing the selected values
    tester.componentInstance.selectedKeys.set(['France']);
    await tester.stable();

    // it should update the form selected checkboxes
    expect(tester.smallAggregationComponent.aggregationForm.value).toEqual({
      France: true,
      Italy: false,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // when changing the selected values
    tester.componentInstance.selectedKeys.set([]);
    await tester.stable();

    // it should update the form selected checkboxes
    expect(tester.smallAggregationComponent.aggregationForm.value).toEqual({
      France: false,
      Italy: false,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // and all this shouldn't emit any event
    expect(tester.componentInstance.aggregationChanged()).toBeFalsy();
  });

  it('should be disabled if only one bucket', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(toAggregation('coo', ['Italy']));
    await tester.stable();

    expect(tester.smallAggregationComponent.aggregationForm.disabled).toBe(true);
    expect(tester.firstCheckbox.nativeElement.disabled).toBe(true);

    expect(tester.title.nativeElement.classList).toContain('text-body-secondary');
  });

  it('should be disabled if when setting the disabled input', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(aggregation);
    await tester.stable();

    expect(tester.smallAggregationComponent.aggregationForm.disabled).toBeFalse();
    expect(tester.firstCheckbox.nativeElement.disabled).toBeFalse();

    tester.componentInstance.disabled.set(true);
    await tester.stable();
    expect(tester.smallAggregationComponent.aggregationForm.disabled).toBeTrue();
    expect(tester.firstCheckbox.nativeElement.disabled).toBeTrue();
    expect(tester.title.nativeElement.classList).toContain('text-body-secondary');
  });

  it('should be not be displayed if only NULL bucket', async () => {
    const tester = new TestComponentTester();

    // given an aggregation with only the NULL bucket
    tester.componentInstance.aggregation.set(toAggregation(NULL_VALUE, []));
    await tester.stable();

    expect(tester.title).toBeNull();
    expect(tester.firstCheckbox).toBeNull();
  });

  it('should display search descendants option if annot bucket', async () => {
    environment.name = 'wheatis'; // annot is not available in the rare version of the app
    const tester = new TestComponentTester();

    // given an aggregation with only the NULL bucket
    tester.componentInstance.aggregation.set(toAggregation('annot', ['annot1']));
    await tester.stable();

    expect(tester.searchDescendants).not.toBeNull();

    // when the checkbox emits an event, then we propagate it
    tester.searchDescendants.searchDescendants.set(true);
    expect(tester.componentInstance.searchDescendantsChanged()).toBeTrue();
  });

  it('should react to structural changes in the aggregation', async () => {
    // given an aggregation with a bucket and a selected value
    const selectedKeys = ['France', 'Italy'];

    const tester = new TestComponentTester();
    tester.componentInstance.aggregation.set(aggregation);
    tester.componentInstance.selectedKeys.set(selectedKeys);

    // when initializing the component
    await tester.stable();

    // then it should have a form with several fields
    expect(tester.testElement).toContainText('France');
    expect(tester.testElement).toContainText('Italy');
    expect(tester.testElement).toContainText('New Zealand');
    expect(tester.testElement).toContainText('None');
    expect(tester.checkboxes.map(checkbox => checkbox.checked)).toEqual([true, true, false, false]);

    tester.componentInstance.aggregation.set(
      toAggregation('coo', ['Italy', 'New Zealand', 'Portugal'])
    );
    tester.componentInstance.selectedKeys.set(['Italy', 'Portugal']);
    await tester.stable();

    expect(tester.testElement).not.toContainText('France');
    expect(tester.testElement).toContainText('Italy');
    expect(tester.testElement).toContainText('New Zealand');
    expect(tester.testElement).not.toContainText('None');
    expect(tester.testElement).toContainText('Portugal');
    expect(tester.checkboxes.map(checkbox => checkbox.checked)).toEqual([true, false, true]);

    expect(tester.componentInstance.aggregationChanged()).toBeFalsy();
  });
});
