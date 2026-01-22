import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { By } from '@angular/platform-browser';
import { BucketOrRefine, LargeAggregationComponent } from './large-aggregation.component';
import { toAggregation } from '../models/test-model-generators';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { Aggregation, Bucket } from '../models/page';
import { NULL_VALUE } from '../models/document.model';
import { DescendantsCheckboxComponent } from '../descendants-checkbox/descendants-checkbox.component';
import { environment } from '../../environments/environment';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { of } from 'rxjs';
import { provideI18nTesting } from '../i18n/mock-18n';

@Component({
  template: `@if (aggregation(); as aggregation) {
    <dd-large-aggregation
      [aggregation]="aggregation"
      (aggregationChange)="aggregationChanged.set($event)"
      [searchDescendants]="searchDescendants()"
      (searchDescendantsChange)="searchDescendantsChanged.set($event)"
      [selectedKeys]="selectedKeys()"
      [disabled]="disabled()"
    />
  }`,
  imports: [LargeAggregationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dd-large-aggregation-tester'
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
  readonly title = page.getByCss('.card-title');
  readonly inputField = page.getByCss('input');
  readonly pills = page.getByCss('.rounded-pill');

  get typeahead() {
    return this.fixture.debugElement.query(By.directive(NgbTypeahead))
      ?.componentInstance as NgbTypeahead;
  }

  get searchDescendants() {
    return this.fixture.debugElement.query(By.directive(DescendantsCheckboxComponent))
      ?.componentInstance as DescendantsCheckboxComponent;
  }

  get results(): NodeListOf<HTMLButtonElement> {
    // Based on the typeahead test itself
    // see https://github.com/ng-bootstrap/ng-bootstrap/blob/master/src/typeahead/typeahead.spec.ts
    // The dropdown is appended to the body, not to this element, so we can't unfortunately return an array of
    // TestButton, but only DOM elements
    return document.querySelectorAll('ngb-typeahead-window.dropdown-menu button.dropdown-item');
  }

  get largeAggregationComponent(): LargeAggregationComponent {
    return this.fixture.debugElement.query(By.directive(LargeAggregationComponent))
      ?.componentInstance as LargeAggregationComponent;
  }
}

describe('LargeAggregationComponent', () => {
  const aggregation = toAggregation('coo', ['France', 'Italy', 'New Zealand', NULL_VALUE]);

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideI18nTesting()] }));

  afterEach(() => {
    environment.name = 'rare';
    vi.useRealTimers();
  });

  test('should display an aggregation with buckets as a typeahead', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(aggregation);

    // then it should display a title and the number of possible keys
    await expect.element(tester.title).toHaveTextContent('Country of origin (4)');
    // and the buckets with their name and count in a typeahead
    await expect.element(tester.inputField).toBeInTheDocument();
    expect(tester.typeahead).not.toBeFalsy();
    // no search descendants checkbox as the aggregation is not 'annot'
    expect(tester.searchDescendants).toBeFalsy();
  });

  test('should not display an aggregation with empty buckets', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(toAggregation('coo', []));
    await tester.fixture.whenStable();

    // then it should not display a title
    await expect.element(tester.title).not.toBeInTheDocument();
    // and the buckets should not be displayed either
    await expect.element(tester.inputField).not.toBeInTheDocument();
  });

  test('should display the selected criteria as pills', async () => {
    // given an aggregation with a bucket and a selected value
    const selectedKeys = ['France', 'Italy', NULL_VALUE];

    const tester = new TestComponentTester();
    tester.componentInstance.aggregation.set(aggregation);
    tester.componentInstance.selectedKeys.set(selectedKeys);

    // when displaying the component
    await tester.fixture.whenStable();

    // then it should have several removable pills
    expect(tester.pills).toHaveLength(3);
    await expect.element(tester.pills.nth(0)).toHaveTextContent('France[10]');
    expect(tester.pills.nth(0).element().querySelector('button')).not.toBeNull();
    await expect.element(tester.pills.nth(1)).toHaveTextContent('Italy[20]');
    expect(tester.pills.nth(1).element().querySelector('button')).not.toBeNull();
    await expect.element(tester.pills.nth(2)).toHaveTextContent('None[40]');
    expect(tester.pills.nth(2).element().querySelector('button')).not.toBeNull();
  });

  test('should find one results containing the term entered', async () => {
    const tester = new TestComponentTester();
    // given an aggregation with a bucket
    tester.componentInstance.aggregation.set(aggregation);
    await tester.fixture.whenStable();

    // when searching for a result
    let actualResults: Array<BucketOrRefine> = [];
    tester.largeAggregationComponent
      .search(of('anc'))
      .subscribe(results => (actualResults = results));

    // then it should have no match
    expect(actualResults.length).toBe(1);
    expect((actualResults[0] as Bucket).key).toBe('France');
  });

  test('should find one results containing the term entered when it is the null value translation', async () => {
    const tester = new TestComponentTester();
    // given an aggregation with a bucket
    tester.componentInstance.aggregation.set(aggregation);
    await tester.fixture.whenStable();

    // when searching for a result
    let actualResults: Array<BucketOrRefine> = [];
    tester.largeAggregationComponent
      .search(of('non'))
      .subscribe(results => (actualResults = results));

    // then it should have no match
    expect(actualResults.length).toBe(1);
    expect((actualResults[0] as Bucket).key).toBe(NULL_VALUE);
  });

  test('should find the results containing the term entered and ignore the case', async () => {
    const tester = new TestComponentTester();
    // given an aggregation with a bucket
    tester.componentInstance.aggregation.set(aggregation);
    await tester.fixture.whenStable();

    // when searching for a result
    let actualResults: Array<BucketOrRefine> = [];
    tester.largeAggregationComponent
      .search(of('A'))
      .subscribe(results => (actualResults = results));

    // then it should have matches  (NULL_VALUE is None in English, so it does not contains 'A')
    expect(actualResults.length).toBe(3);
    expect((actualResults[0] as Bucket).key).toBe('France');
    expect((actualResults[1] as Bucket).key).toBe('Italy');
    expect((actualResults[2] as Bucket).key).toBe('New Zealand');

    // when searching for another result
    tester.largeAggregationComponent
      .search(of('n'))
      .subscribe(results => (actualResults = results));

    // then it should have matches (NULL_VALUE is None in English, so it contains 'n')
    expect(actualResults.length).toBe(3);
    expect((actualResults[0] as Bucket).key).toBe('France');
    expect((actualResults[1] as Bucket).key).toBe('New Zealand');
    expect((actualResults[2] as Bucket).key).toBe(NULL_VALUE);
  });

  test('should not find the results containing the term entered if it is already selected', async () => {
    const tester = new TestComponentTester();
    // given an aggregation with a bucket
    tester.componentInstance.aggregation.set(aggregation);
    tester.componentInstance.selectedKeys.set(['France']);
    await tester.fixture.whenStable();

    // when searching for a result
    let actualResults: Array<BucketOrRefine> = [];
    tester.largeAggregationComponent
      .search(of('anc'))
      .subscribe(results => (actualResults = results));

    // then it should have no match
    expect(actualResults.length).toBe(0);
  });

  test('should find 8 results max + a fake refine result', async () => {
    const tester = new TestComponentTester();
    // given an aggregation with a bucket
    tester.componentInstance.aggregation.set(toAggregation('coo', Array(30).fill('a')));
    await tester.fixture.whenStable();

    // when searching for a result
    let actualResults: Array<BucketOrRefine> = [];
    tester.largeAggregationComponent
      .search(of('a'))
      .subscribe(results => (actualResults = results));

    // then it should have no match
    expect(actualResults.length).toBe(9);
    for (let i = 0; i < actualResults.length - 1; i++) {
      expect((actualResults[0] as Bucket).key).toBe('a');
    }
    expect(actualResults[actualResults.length - 1]).toBe('REFINE');
  });

  test('should emit an event when a value is added or removed and update pills', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(aggregation);
    await tester.fixture.whenStable();

    await expect.element(tester.inputField).toHaveValue('');
    expect(tester.pills).toHaveLength(0);

    // when a value is entered
    await tester.inputField.fill('fr');

    // results should appear
    expect(tester.results.length).toBe(1);
    expect(tester.results[0].textContent).toBe('France[10]');

    // when the result is selected
    tester.results[0].click();
    await tester.fixture.whenStable();

    // an event is emitted
    expect(tester.componentInstance.aggregationChanged()).toEqual({
      name: 'coo',
      values: ['France']
    });

    // the input is emptied
    await expect.element(tester.inputField).toHaveValue('');

    // the focus is given back to the input
    expect(document.activeElement).toBe(tester.inputField.element());

    // and a pill should appear
    expect(tester.pills).toHaveLength(1);
    await expect.element(tester.pills.nth(0)).toHaveTextContent('France[10]');

    // when another value is entered
    await tester.inputField.fill('ly');

    // results should appear
    expect(tester.results.length).toBe(1);
    expect(tester.results[0].textContent).toBe('Italy[20]');

    // when the result is selected
    tester.results[0].click();
    await tester.fixture.whenStable();

    // another event is emitted
    await expect.element(tester.inputField).toHaveValue('');
    expect(tester.componentInstance.aggregationChanged()).toEqual({
      name: 'coo',
      values: ['France', 'Italy']
    });

    // the focus is given back to the input
    expect(document.activeElement).toBe(tester.inputField.element());

    // and another pill should appear
    expect(tester.pills).toHaveLength(2);
    await expect.element(tester.pills.nth(0)).toHaveTextContent('France[10]');
    await expect.element(tester.pills.nth(1)).toHaveTextContent('Italy[20]');

    // when a pill is removed
    const button = tester.pills.nth(0).element().querySelector('button')!;
    button.click();
    await tester.fixture.whenStable();

    // another event is emitted
    await expect.element(tester.inputField).toHaveValue('');
    expect(tester.componentInstance.aggregationChanged()).toEqual({
      name: 'coo',
      values: ['Italy']
    });

    // and the pill should disappear
    expect(tester.pills).toHaveLength(1);
    await expect.element(tester.pills.nth(0)).toHaveTextContent('Italy[20]');
  });

  test('should not do anything if REFINE is selected', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(toAggregation('coo', Array(30).fill('a')));
    await tester.fixture.whenStable();

    await expect.element(tester.inputField).toHaveValue('');
    expect(tester.pills).toHaveLength(0);

    // when a value is entered
    await tester.inputField.fill('a');

    // results should appear
    expect(tester.results.length).toBe(9);
    expect(tester.results[tester.results.length - 1].textContent).toContain(
      `Other results are available`
    );

    // when the result is selected
    tester.results[tester.results.length - 1].click();
    await tester.fixture.whenStable();

    // no event is emitted
    expect(tester.componentInstance.aggregationChanged()).toBeUndefined();

    // the input value stays the same
    await expect.element(tester.inputField).toHaveValue('a');

    // the focus is given back to the input
    expect(document.activeElement).toBe(tester.inputField.element());

    // and a pill should not appear
    expect(tester.pills).toHaveLength(0);
  });

  test('should be not be displayed if only NULL bucket', async () => {
    const tester = new TestComponentTester();

    // given an aggregation with only the NULL bucket
    tester.componentInstance.aggregation.set(toAggregation(NULL_VALUE, []));
    await tester.fixture.whenStable();

    await expect.element(tester.title).not.toBeInTheDocument();
    await expect.element(tester.inputField).not.toBeInTheDocument();
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

  test('should be disabled', async () => {
    // given an aggregation with a bucket and a selected value
    const selectedKeys = ['France', 'Italy', NULL_VALUE];

    const tester = new TestComponentTester();
    tester.componentInstance.aggregation.set(aggregation);
    tester.componentInstance.selectedKeys.set(selectedKeys);

    // when displaying the component
    await tester.fixture.whenStable();

    // then it should have several removable pills
    expect(tester.pills).toHaveLength(3);
    await expect((tester.inputField.element() as HTMLInputElement).disabled).toBe(false);
    tester.pills.elements().forEach(pill => {
      const button = pill.querySelector('button');
      expect(button?.disabled).toBe(false);
    });

    tester.componentInstance.disabled.set(true);
    await tester.fixture.whenStable();
    await expect((tester.inputField.element() as HTMLInputElement).disabled).toBe(true);
    tester.pills.elements().forEach(pill => {
      const button = pill.querySelector('button');
      expect(button?.disabled).toBe(true);
    });
  });
});
