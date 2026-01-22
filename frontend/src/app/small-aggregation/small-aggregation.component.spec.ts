import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { By } from '@angular/platform-browser';
import { SmallAggregationComponent } from './small-aggregation.component';
import { toAggregation } from '../models/test-model-generators';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { NULL_VALUE } from '../models/document.model';
import { DescendantsCheckboxComponent } from '../descendants-checkbox/descendants-checkbox.component';
import { environment } from '../../environments/environment';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Aggregation } from '../models/page';
import { provideI18nTesting } from '../i18n/mock-18n';

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

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly root = page.elementLocator(this.fixture.nativeElement);

  readonly title = page.getByCss('.card-title');
  readonly labels = page.getByCss('label');
  readonly firstCheckbox = page.getByCss('input').first();
  readonly checkboxes = page.getByCss('input');

  get searchDescendants() {
    return this.fixture.debugElement.query(By.directive(DescendantsCheckboxComponent))
      ?.componentInstance as DescendantsCheckboxComponent;
  }

  get smallAggregationComponent(): SmallAggregationComponent {
    return this.fixture.debugElement.query(By.directive(SmallAggregationComponent))
      ?.componentInstance as SmallAggregationComponent;
  }
}

describe('SmallAggregationComponent', () => {
  const aggregation = toAggregation('coo', ['France', 'Italy', 'New Zealand', NULL_VALUE]);

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideI18nTesting()] }));

  afterEach(() => (environment.name = 'rare'));

  test('should display an aggregation with buckets', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(aggregation);
    await tester.fixture.whenStable();

    // then it should display a title
    await expect.element(tester.title).toHaveTextContent('Country of origin');
    // and the buckets with their name and count
    expect(tester.labels).toHaveLength(4);
    await expect.element(tester.labels.nth(0)).toHaveTextContent('France');
    await expect.element(tester.labels.nth(0)).toHaveTextContent('[10]');
    await expect.element(tester.labels.nth(1)).toHaveTextContent('Italy');
    await expect.element(tester.labels.nth(1)).toHaveTextContent('[20]');
    await expect.element(tester.labels.nth(2)).toHaveTextContent('New Zealand');
    await expect.element(tester.labels.nth(2)).toHaveTextContent('[30]');
    await expect.element(tester.labels.nth(3)).toHaveTextContent('None');
    await expect.element(tester.labels.nth(3)).toHaveTextContent('[40]');
  });

  test('should not display an aggregation with empty buckets', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(toAggregation('coo', []));
    await tester.fixture.whenStable();

    // then it should not display a title
    await expect.element(tester.title).not.toBeInTheDocument();
    // and the buckets should not be displayed either
    expect(tester.labels).toHaveLength(0);
  });

  test('should extract keys from selected values', () => {
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

  test('should build a form based on the bucket', async () => {
    const tester = new TestComponentTester();
    // given an aggregation with a bucket
    tester.componentInstance.aggregation.set(aggregation);

    // when initializing the component
    await tester.fixture.whenStable();

    // then it should have a form with several fields
    const controls = tester.smallAggregationComponent.aggregationForm.controls;
    expect(Object.keys(controls)).toEqual(['France', 'Italy', 'New Zealand', NULL_VALUE]);
  });

  test('should build a form and check selected criteria', async () => {
    // given an aggregation with a bucket and a selected value
    const selectedKeys = ['France'];

    const tester = new TestComponentTester();
    tester.componentInstance.aggregation.set(aggregation);
    tester.componentInstance.selectedKeys.set(selectedKeys);

    // when initializing the component
    await tester.fixture.whenStable();

    // then it should have a form with several fields
    const controls = tester.smallAggregationComponent.aggregationForm.controls;
    expect(Object.keys(controls)).toEqual(['France', 'Italy', 'New Zealand', NULL_VALUE]);
    // and France should be checked
    expect(tester.smallAggregationComponent.aggregationForm.get('France')!.value).toBeTruthy();
  });

  test('should emit an event when a checkbox is toggled', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(aggregation);
    await tester.fixture.whenStable();
    await expect.element(tester.firstCheckbox).not.toBeChecked();

    // then it should emit an event
    // when a value is checked
    await tester.firstCheckbox.click();
    await tester.fixture.whenStable();

    await expect.element(tester.firstCheckbox).toBeChecked();
    expect(tester.componentInstance.aggregationChanged()).toEqual({
      name: 'coo',
      values: ['France']
    });
  });

  test('should change the selected values in the form when the selectedValues input changes, without emitting events', async () => {
    const tester = new TestComponentTester();
    tester.componentInstance.aggregation.set(aggregation);
    tester.componentInstance.selectedKeys.set([]);

    // when initializing the component
    await tester.fixture.whenStable();

    // it should have a form with no selected checkbox
    expect(tester.smallAggregationComponent.aggregationForm.value).toEqual({
      France: false,
      Italy: false,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // when changing the selected values
    tester.componentInstance.selectedKeys.set(['France']);
    await tester.fixture.whenStable();

    // it should update the form selected checkbox
    expect(tester.smallAggregationComponent.aggregationForm.value).toEqual({
      France: true,
      Italy: false,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // when changing the selected values
    tester.componentInstance.selectedKeys.set(['France', 'Italy']);
    await tester.fixture.whenStable();

    // it should update the form selected checkboxes
    expect(tester.smallAggregationComponent.aggregationForm.value).toEqual({
      France: true,
      Italy: true,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // when changing the selected values but with no actual change
    tester.componentInstance.selectedKeys.set(['Italy', 'France']);
    await tester.fixture.whenStable();

    // it should leave the form selected checkboxes as they are
    expect(tester.smallAggregationComponent.aggregationForm.value).toEqual({
      France: true,
      Italy: true,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // when changing the selected values
    tester.componentInstance.selectedKeys.set(['France']);
    await tester.fixture.whenStable();

    // it should update the form selected checkboxes
    expect(tester.smallAggregationComponent.aggregationForm.value).toEqual({
      France: true,
      Italy: false,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // when changing the selected values
    tester.componentInstance.selectedKeys.set([]);
    await tester.fixture.whenStable();

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

  test('should be disabled if only one bucket', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(toAggregation('coo', ['Italy']));
    await tester.fixture.whenStable();

    expect(tester.smallAggregationComponent.aggregationForm.disabled).toBe(true);
    await expect((tester.firstCheckbox.element() as HTMLInputElement).disabled).toBe(true);

    expect(tester.title.element().classList).toContain('text-body-secondary');
  });

  test('should be disabled if when setting the disabled input', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(aggregation);
    await tester.fixture.whenStable();

    expect(tester.smallAggregationComponent.aggregationForm.disabled).toBe(false);
    await expect((tester.firstCheckbox.element() as HTMLInputElement).disabled).toBe(false);

    tester.componentInstance.disabled.set(true);
    await tester.fixture.whenStable();
    expect(tester.smallAggregationComponent.aggregationForm.disabled).toBe(true);
    await expect((tester.firstCheckbox.element() as HTMLInputElement).disabled).toBe(true);
    expect(tester.title.element().classList).toContain('text-body-secondary');
  });

  test('should be not be displayed if only NULL bucket', async () => {
    const tester = new TestComponentTester();

    // given an aggregation with only the NULL bucket
    tester.componentInstance.aggregation.set(toAggregation(NULL_VALUE, []));
    await tester.fixture.whenStable();

    await expect.element(tester.title).not.toBeInTheDocument();
    await expect.element(tester.firstCheckbox).not.toBeInTheDocument();
  });

  test('should display search descendants option if annot bucket', async () => {
    environment.name = 'wheatis'; // annot is not available in the rare version of the app
    const tester = new TestComponentTester();

    // given an aggregation with only the NULL bucket
    tester.componentInstance.aggregation.set(toAggregation('annot', ['annot1']));
    await tester.fixture.whenStable();

    expect(tester.searchDescendants).not.toBeNull();

    // when the checkbox emits an event, then we propagate it
    tester.searchDescendants!.searchDescendants.set(true);
    expect(tester.componentInstance.searchDescendantsChanged()).toBe(true);
  });

  test('should react to structural changes in the aggregation', async () => {
    // given an aggregation with a bucket and a selected value
    const selectedKeys = ['France', 'Italy'];

    const tester = new TestComponentTester();
    tester.componentInstance.aggregation.set(aggregation);
    tester.componentInstance.selectedKeys.set(selectedKeys);

    // when initializing the component
    await tester.fixture.whenStable();

    // then it should have a form with several fields
    await expect.element(tester.root).toHaveTextContent('France');
    await expect.element(tester.root).toHaveTextContent('Italy');
    await expect.element(tester.root).toHaveTextContent('New Zealand');
    await expect.element(tester.root).toHaveTextContent('None');
    expect(
      tester.checkboxes.elements().map(checkbox => (checkbox as HTMLInputElement).checked)
    ).toEqual([true, true, false, false]);

    tester.componentInstance.aggregation.set(
      toAggregation('coo', ['Italy', 'New Zealand', 'Portugal'])
    );
    tester.componentInstance.selectedKeys.set(['Italy', 'Portugal']);
    await tester.fixture.whenStable();

    await expect.element(tester.root).not.toHaveTextContent('France');
    await expect.element(tester.root).toHaveTextContent('Italy');
    await expect.element(tester.root).toHaveTextContent('New Zealand');
    await expect.element(tester.root).not.toHaveTextContent('None');
    await expect.element(tester.root).toHaveTextContent('Portugal');
    expect(
      tester.checkboxes.elements().map(checkbox => (checkbox as HTMLInputElement).checked)
    ).toEqual([true, false, true]);

    expect(tester.componentInstance.aggregationChanged()).toBeFalsy();
  });
});
