import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { NgbTooltipModule, NgbTypeahead, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';

import { BucketOrRefine, LargeAggregationComponent } from './large-aggregation.component';
import { toAggregation } from '../models/test-model-generators';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { AggregationNamePipe } from '../aggregation-name.pipe';
import { DocumentCountComponent } from '../document-count/document-count.component';
import { Bucket } from '../models/page';
import { NULL_VALUE } from '../models/document.model';

describe('LargeAggregationComponent', () => {

  const aggregation = toAggregation('coo', ['France', 'Italy', 'New Zealand', NULL_VALUE]);

  class LargeAggregationComponentTester extends ComponentTester<LargeAggregationComponent> {
    constructor() {
      super(LargeAggregationComponent);
    }

    get title() {
      return this.element('.card-title');
    }

    get inputField() {
      return this.input('input');
    }

    get typeahead() {
      return this.debugElement.query(By.directive(NgbTypeahead));
    }

    get results(): NodeListOf<HTMLButtonElement> {
      // Based on the typeahead test itself
      // see https://github.com/ng-bootstrap/ng-bootstrap/blob/master/src/typeahead/typeahead.spec.ts
      // The dropdown is appended to the body, not to this element, so we can't unfortunatly return an array of
      // TestButton, but only DOM elements
      return document.querySelectorAll('ngb-typeahead-window.dropdown-menu button.dropdown-item');
    }

    get pills() {
      return this.elements('.badge-pill');
    }
  }

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      ReactiveFormsModule,
      NgbTypeaheadModule,
      NgbTooltipModule
    ],
    declarations: [LargeAggregationComponent, AggregationNamePipe, DocumentCountComponent]
  }));

  beforeEach(() => jasmine.addMatchers(speculoosMatchers));

  it('should display an aggregation with buckets as a typeahead', () => {
    const tester = new LargeAggregationComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation = aggregation;
    tester.detectChanges();

    // then it should display a title and the number of possible keys
    expect(tester.title).toHaveText('Pays d\'origine (4)');
    // and the buckets with their name and count in a typeahead
    expect(tester.inputField).not.toBeNull();
    expect(tester.typeahead).not.toBeNull();
  });

  it('should not display an aggregation with empty buckets', () => {
    const tester = new LargeAggregationComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation = toAggregation('coo', []);
    tester.detectChanges();

    // then it should not display a title
    expect(tester.title).toBeNull();
    // and the buckets should not be displayed either
    expect(tester.inputField).toBeNull();
  });

  it('should display the selected criteria as pills', () => {
    // given an aggregation with a bucket and a selected value
    const selectedKeys = ['France', 'Italy', NULL_VALUE];

    const tester = new LargeAggregationComponentTester();
    const component = tester.componentInstance;
    component.aggregation = aggregation;
    component.selectedKeys = selectedKeys;

    // when displaying the component
    tester.detectChanges();

    // then it should have several removable pills
    expect(tester.pills.length).toBe(3);
    expect(tester.pills[0]).toContainText('France[10]');
    expect(tester.pills[0].button('button')).not.toBeNull();
    expect(tester.pills[1]).toContainText('Italy[20]');
    expect(tester.pills[1].button('button')).not.toBeNull();
    expect(tester.pills[2]).toContainText('Aucun[40]');
    expect(tester.pills[2].button('button')).not.toBeNull();
  });

  it('should find one results containing the term entered', () => {
    // given an aggregation with a bucket
    const component = new LargeAggregationComponent();
    component.aggregation = aggregation;

    // when searching for a result
    let actualResults: Array<BucketOrRefine> = [];
    component.search(of('anc'))
      .subscribe(results => actualResults = results);

    // then it should have no match
    expect(actualResults.length).toBe(1);
    expect((actualResults[0] as Bucket).key).toBe('France');
  });

  it('should find one results containing the term entered when it is the null value translation', () => {
    // given an aggregation with a bucket
    const component = new LargeAggregationComponent();
    component.aggregation = aggregation;

    // when searching for a result
    let actualResults: Array<BucketOrRefine> = [];
    component.search(of('auc'))
      .subscribe(results => actualResults = results);

    // then it should have no match
    expect(actualResults.length).toBe(1);
    expect((actualResults[0] as Bucket).key).toBe(NULL_VALUE);
  });

  it('should find the results containing the term entered and ignore the case', () => {
    // given an aggregation with a bucket
    const component = new LargeAggregationComponent();
    component.aggregation = aggregation;

    // when searching for a result
    let actualResults: Array<BucketOrRefine> = [];
    component.search(of('A'))
      .subscribe(results => actualResults = results);

    // then it should have one match
    expect(actualResults.length).toBe(4);
    expect((actualResults[0] as Bucket).key).toBe('France');
    expect((actualResults[1] as Bucket).key).toBe('Italy');
    expect((actualResults[2] as Bucket).key).toBe('New Zealand');
    expect((actualResults[3] as Bucket).key).toBe(NULL_VALUE);
  });

  it('should not find the results containing the term entered if it is already selected', () => {
    // given an aggregation with a bucket
    const component = new LargeAggregationComponent();
    component.aggregation = aggregation;
    component.selectedKeys = ['France'];

    // when searching for a result
    let actualResults: Array<BucketOrRefine> = [];
    component.search(of('anc'))
      .subscribe(results => actualResults = results);

    // then it should have no match
    expect(actualResults.length).toBe(0);
  });

  it('should find 8 results max + a fake refine result', () => {
    // given an aggregation with a bucket
    const component = new LargeAggregationComponent();
    component.aggregation = toAggregation('coo', Array(30).fill('a'));

    // when searching for a result
    let actualResults: Array<BucketOrRefine> = [];
    component.search(of('a'))
      .subscribe(results => actualResults = results);

    // then it should have no match
    expect(actualResults.length).toBe(9);
    for (let i = 0; i < actualResults.length - 1; i++) {
      expect((actualResults[0] as Bucket).key).toBe('a');
    }
    expect(actualResults[actualResults.length - 1]).toBe('REFINE');
  });

  it('should emit an event when a value is added or removed and update pills', fakeAsync(() => {
    const tester = new LargeAggregationComponentTester();

    // given an aggregation
    const component = tester.componentInstance;
    component.aggregation = aggregation;
    tester.detectChanges();
    expect(tester.inputField).toHaveValue('');
    expect(tester.pills.length).toBe(0);

    // then it should emit an event
    let emittedEvent: AggregationCriterion;
    component.aggregationChange.subscribe((event: AggregationCriterion) => emittedEvent = event);

    // when a value is entered
    tester.inputField.fillWith('fr');
    tick(200);

    // results should appear
    expect(tester.results.length).toBe(1);
    expect(tester.results[0].textContent).toBe('France[10]');

    // when the result is selected
    tester.results[0].click();
    tester.detectChanges();

    // an event is emitted
    expect(emittedEvent.name).toBe('coo');
    expect(emittedEvent.values).toEqual(['France']);

    // the input is emptied
    expect(tester.inputField).toHaveValue('');

    // the focus is given back to the input
    expect(tester.element(':focus')).toEqual(tester.inputField);

    // and a pill should appear
    expect(tester.pills.length).toBe(1);
    expect(tester.pills[0]).toContainText('France[10]');

    // when another value is entered
    tester.inputField.fillWith('ly');
    tick(200);

    // results should appear
    expect(tester.results.length).toBe(1);
    expect(tester.results[0].textContent).toBe('Italy[20]');

    // when the result is selected
    tester.results[0].click();
    tester.detectChanges();

    // another event is emitted
    expect(tester.inputField).toHaveValue('');
    expect(emittedEvent.name).toBe('coo');
    expect(emittedEvent.values).toEqual(['France', 'Italy']);

    // the focus is given back to the input
    expect(tester.element(':focus')).toEqual(tester.inputField);

    // and another pill should appear
    expect(tester.pills.length).toBe(2);
    expect(tester.pills[0]).toContainText('France[10]');
    expect(tester.pills[1]).toContainText('Italy[20]');

    // when a pill is removed
    tester.pills[0].button('button').click();
    tick();

    // another event is emitted
    expect(tester.inputField).toHaveValue('');
    expect(emittedEvent.name).toBe('coo');
    expect(emittedEvent.values).toEqual(['Italy']);

    // and the pill should disappear
    expect(tester.pills.length).toBe(1);
    expect(tester.pills[0]).toContainText('Italy[20]');

    // discard the remaining timer
    tick(200);
  }));

  it('should not do anything if REFINE is selected', fakeAsync(() => {
    const tester = new LargeAggregationComponentTester();

    // given an aggregation
    const component = tester.componentInstance;
    component.aggregation = toAggregation('coo', Array(30).fill('a'));
    tester.detectChanges();
    expect(tester.inputField).toHaveValue('');
    expect(tester.pills.length).toBe(0);

    // then it should not emit an event
    let emittedEvent: AggregationCriterion;
    component.aggregationChange.subscribe((event: AggregationCriterion) => emittedEvent = event);

    // when a value is entered
    tester.inputField.fillWith('a');
    tick(200);

    // results should appear
    expect(tester.results.length).toBe(9);
    expect(tester.results[tester.results.length - 1].textContent).toContain(`D'autres résultats existent`);

    // when the result is selected
    tester.results[tester.results.length - 1].click();
    tester.detectChanges();

    // no event is emitted
    expect(emittedEvent).toBeUndefined();

    // the input value stays the same
    expect(tester.inputField).toHaveValue('a');

    // the focus is given back to the input
    expect(tester.element(':focus')).toEqual(tester.inputField);

    // and a pill should not appear
    expect(tester.pills.length).toBe(0);

    // discard the remaining timer
    tick(200);
  }));
});
