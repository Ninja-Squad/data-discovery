import { TestBed } from '@angular/core/testing';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { ComponentTester } from 'ngx-speculoos';

import { BucketOrRefine, LargeAggregationComponent } from './large-aggregation.component';
import { toAggregation } from '../models/test-model-generators';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { Aggregation, Bucket } from '../models/page';
import { NULL_VALUE } from '../models/document.model';
import { DescendantsCheckboxComponent } from '../descendants-checkbox/descendants-checkbox.component';
import { environment } from '../../environments/environment';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { of } from 'rxjs';
import { provideI18nTesting } from '../i18n/mock-18n.spec';

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

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get title() {
    return this.element('.card-title');
  }

  get inputField() {
    return this.input('input')!;
  }

  get typeahead() {
    return this.element(NgbTypeahead);
  }

  get searchDescendants() {
    return this.component(DescendantsCheckboxComponent);
  }

  get results(): NodeListOf<HTMLButtonElement> {
    // Based on the typeahead test itself
    // see https://github.com/ng-bootstrap/ng-bootstrap/blob/master/src/typeahead/typeahead.spec.ts
    // The dropdown is appended to the body, not to this element, so we can't unfortunately return an array of
    // TestButton, but only DOM elements
    return document.querySelectorAll('ngb-typeahead-window.dropdown-menu button.dropdown-item');
  }

  get pills() {
    return this.elements('.rounded-pill');
  }

  get largeAggregationComponent(): LargeAggregationComponent {
    return this.component(LargeAggregationComponent);
  }
}

describe('LargeAggregationComponent', () => {
  const aggregation = toAggregation('coo', ['France', 'Italy', 'New Zealand', NULL_VALUE]);

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideI18nTesting()] }));

  afterEach(() => {
    environment.name = 'rare';
    jasmine.clock().uninstall();
  });

  it('should display an aggregation with buckets as a typeahead', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(aggregation);
    await tester.stable();

    // then it should display a title and the number of possible keys
    expect(tester.title).toContainText('Country of origin (4)');
    // and the buckets with their name and count in a typeahead
    expect(tester.inputField).not.toBeNull();
    expect(tester.typeahead).not.toBeNull();
    // no search descendants checkbox as the aggregation is not 'annot'
    expect(tester.searchDescendants).toBeNull();
  });

  it('should not display an aggregation with empty buckets', async () => {
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(toAggregation('coo', []));
    await tester.stable();

    // then it should not display a title
    expect(tester.title).toBeNull();
    // and the buckets should not be displayed either
    expect(tester.inputField).toBeNull();
  });

  it('should display the selected criteria as pills', async () => {
    // given an aggregation with a bucket and a selected value
    const selectedKeys = ['France', 'Italy', NULL_VALUE];

    const tester = new TestComponentTester();
    tester.componentInstance.aggregation.set(aggregation);
    tester.componentInstance.selectedKeys.set(selectedKeys);

    // when displaying the component
    await tester.stable();

    // then it should have several removable pills
    expect(tester.pills.length).toBe(3);
    expect(tester.pills[0]).toContainText('France[10]');
    expect(tester.pills[0].button('button')).not.toBeNull();
    expect(tester.pills[1]).toContainText('Italy[20]');
    expect(tester.pills[1].button('button')).not.toBeNull();
    expect(tester.pills[2]).toContainText('None[40]');
    expect(tester.pills[2].button('button')).not.toBeNull();
  });

  it('should find one results containing the term entered', async () => {
    const tester = new TestComponentTester();
    // given an aggregation with a bucket
    tester.componentInstance.aggregation.set(aggregation);
    await tester.stable();

    // when searching for a result
    let actualResults: Array<BucketOrRefine> = [];
    tester.largeAggregationComponent
      .search(of('anc'))
      .subscribe(results => (actualResults = results));

    // then it should have no match
    expect(actualResults.length).toBe(1);
    expect((actualResults[0] as Bucket).key).toBe('France');
  });

  it('should find one results containing the term entered when it is the null value translation', async () => {
    const tester = new TestComponentTester();
    // given an aggregation with a bucket
    tester.componentInstance.aggregation.set(aggregation);
    await tester.stable();

    // when searching for a result
    let actualResults: Array<BucketOrRefine> = [];
    tester.largeAggregationComponent
      .search(of('non'))
      .subscribe(results => (actualResults = results));

    // then it should have no match
    expect(actualResults.length).toBe(1);
    expect((actualResults[0] as Bucket).key).toBe(NULL_VALUE);
  });

  it('should find the results containing the term entered and ignore the case', async () => {
    const tester = new TestComponentTester();
    // given an aggregation with a bucket
    tester.componentInstance.aggregation.set(aggregation);
    await tester.stable();

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

  it('should not find the results containing the term entered if it is already selected', async () => {
    const tester = new TestComponentTester();
    // given an aggregation with a bucket
    tester.componentInstance.aggregation.set(aggregation);
    tester.componentInstance.selectedKeys.set(['France']);
    await tester.stable();

    // when searching for a result
    let actualResults: Array<BucketOrRefine> = [];
    tester.largeAggregationComponent
      .search(of('anc'))
      .subscribe(results => (actualResults = results));

    // then it should have no match
    expect(actualResults.length).toBe(0);
  });

  it('should find 8 results max + a fake refine result', async () => {
    const tester = new TestComponentTester();
    // given an aggregation with a bucket
    tester.componentInstance.aggregation.set(toAggregation('coo', Array(30).fill('a')));
    await tester.stable();

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

  it('should emit an event when a value is added or removed and update pills', async () => {
    jasmine.clock().install();
    jasmine.clock().mockDate();
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(aggregation);
    await tester.stable();

    expect(tester.inputField).toHaveValue('');
    expect(tester.pills.length).toBe(0);

    // when a value is entered
    tester.inputField.fillWith('fr');
    jasmine.clock().tick(200);

    // results should appear
    expect(tester.results.length).toBe(1);
    expect(tester.results[0].textContent).toBe('France[10]');

    // when the result is selected
    tester.results[0].click();
    await tester.stable();

    // an event is emitted
    expect(tester.componentInstance.aggregationChanged()).toEqual({
      name: 'coo',
      values: ['France']
    });

    // the input is emptied
    expect(tester.inputField).toHaveValue('');

    // the focus is given back to the input
    expect(document.activeElement).toBe(tester.inputField.nativeElement);

    // and a pill should appear
    expect(tester.pills.length).toBe(1);
    expect(tester.pills[0]).toContainText('France[10]');

    // when another value is entered
    tester.inputField.fillWith('ly');
    jasmine.clock().tick(200);

    // results should appear
    expect(tester.results.length).toBe(1);
    expect(tester.results[0].textContent).toBe('Italy[20]');

    // when the result is selected
    await tester.results[0].click();
    await tester.stable();

    // another event is emitted
    expect(tester.inputField).toHaveValue('');
    expect(tester.componentInstance.aggregationChanged()).toEqual({
      name: 'coo',
      values: ['France', 'Italy']
    });

    // the focus is given back to the input
    expect(document.activeElement).toBe(tester.inputField.nativeElement);

    // and another pill should appear
    expect(tester.pills.length).toBe(2);
    expect(tester.pills[0]).toContainText('France[10]');
    expect(tester.pills[1]).toContainText('Italy[20]');

    // when a pill is removed
    await tester.pills[0].button('button')!.click();

    // another event is emitted
    expect(tester.inputField).toHaveValue('');
    expect(tester.componentInstance.aggregationChanged()).toEqual({
      name: 'coo',
      values: ['Italy']
    });

    // and the pill should disappear
    expect(tester.pills.length).toBe(1);
    expect(tester.pills[0]).toContainText('Italy[20]');
  });

  it('should not do anything if REFINE is selected', async () => {
    jasmine.clock().install();
    jasmine.clock().mockDate();
    const tester = new TestComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation.set(toAggregation('coo', Array(30).fill('a')));
    await tester.stable();

    expect(tester.inputField).toHaveValue('');
    expect(tester.pills.length).toBe(0);

    // when a value is entered
    await tester.inputField.fillWith('a');
    jasmine.clock().tick(200);

    // results should appear
    expect(tester.results.length).toBe(9);
    expect(tester.results[tester.results.length - 1].textContent).toContain(
      `Other results are available`
    );

    // when the result is selected
    await tester.results[tester.results.length - 1].click();

    // no event is emitted
    expect(tester.componentInstance.aggregationChanged()).toBeUndefined();

    // the input value stays the same
    expect(tester.inputField).toHaveValue('a');

    // the focus is given back to the input
    expect(document.activeElement).toBe(tester.inputField.nativeElement);

    // and a pill should not appear
    expect(tester.pills.length).toBe(0);
  });

  it('should be not be displayed if only NULL bucket', async () => {
    const tester = new TestComponentTester();

    // given an aggregation with only the NULL bucket
    tester.componentInstance.aggregation.set(toAggregation(NULL_VALUE, []));
    await tester.stable();

    expect(tester.title).toBeNull();
    expect(tester.inputField).toBeNull();
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

  it('should be disabled', async () => {
    // given an aggregation with a bucket and a selected value
    const selectedKeys = ['France', 'Italy', NULL_VALUE];

    const tester = new TestComponentTester();
    tester.componentInstance.aggregation.set(aggregation);
    tester.componentInstance.selectedKeys.set(selectedKeys);

    // when displaying the component
    await tester.stable();

    // then it should have several removable pills
    expect(tester.pills.length).toBe(3);
    expect(tester.inputField.disabled).toBeFalse();
    tester.pills.forEach(pill => expect(pill.button('button')?.disabled).toBeFalse());

    tester.componentInstance.disabled.set(true);
    await tester.stable();
    expect(tester.inputField.disabled).toBeTrue();
    tester.pills.forEach(pill => expect(pill.button('button')?.disabled).toBeTrue());
  });
});
