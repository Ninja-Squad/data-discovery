import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NgbTypeahead, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';

import { LargeAggregationComponent } from './large-aggregation.component';
import { toAggregation } from '../models/test-model-generators';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { AggregationNamePipe } from '../aggregation-name.pipe';
import { DocumentCountComponent } from '../document-count/document-count.component';
import { of } from 'rxjs/internal/observable/of';
import { Bucket } from '../models/page';

describe('LargeAggregationComponent', () => {

  const aggregation = toAggregation('coo', ['France', 'Italy', 'New Zealand']);

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

    get results() {
      // based on the typeahead test itself
      // see https://github.com/ng-bootstrap/ng-bootstrap/blob/master/src/typeahead/typeahead.spec.ts
      return this.element('ngb-typeahead-window.dropdown-menu')
        .elements('button.dropdown-item');
    }

    get pills() {
      return this.elements('.badge-pill');
    }
  }

  beforeEach(() => TestBed.configureTestingModule({
    imports: [ReactiveFormsModule, NgbTypeaheadModule.forRoot()],
    declarations: [LargeAggregationComponent, AggregationNamePipe, DocumentCountComponent]
  }));

  beforeEach(() => jasmine.addMatchers(speculoosMatchers));

  it('should display an aggregation with buckets as a typeahead', () => {
    const tester = new LargeAggregationComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation = aggregation;
    tester.detectChanges();

    // then it should display a title and the number of possible keys
    expect(tester.title).toHaveText('Pays d\'origine (3)');
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

  it('should display the 10 first matching results as options', () => {
    // given an aggregation with a bucket and a selected value
    const selectedKeys = [
      'France',
      'Italy'
    ];

    const tester = new LargeAggregationComponentTester();
    const component = tester.componentInstance;
    component.aggregation = aggregation;
    component.selectedKeys = selectedKeys;

    // when displaying the component
    tester.detectChanges();

    // then it should have several removable pills
    expect(tester.pills.length).toBe(2);
    expect(tester.pills[0]).toContainText('France[10]');
    expect(tester.pills[0].button('button')).not.toBeNull();
    expect(tester.pills[1]).toContainText('Italy[20]');
    expect(tester.pills[1].button('button')).not.toBeNull();
  });

  it('should display the selected criteria as pills', () => {
    // given an aggregation with a bucket and a selected value
    const selectedKeys = ['France', 'Italy'];

    const tester = new LargeAggregationComponentTester();
    const component = tester.componentInstance;
    component.aggregation = aggregation;
    component.selectedKeys = selectedKeys;

    // when displaying the component
    tester.detectChanges();

    // then it should have several removable pills
    expect(tester.pills.length).toBe(2);
    expect(tester.pills[0]).toContainText('France[10]');
    expect(tester.pills[0].button('button')).not.toBeNull();
    expect(tester.pills[1]).toContainText('Italy[20]');
    expect(tester.pills[1].button('button')).not.toBeNull();
  });

  it('should find one results containing the term entered', () => {
    // given an aggregation with a bucket
    const component = new LargeAggregationComponent();
    component.aggregation = aggregation;

    // when searching for a result
    let actualResults: Array<Bucket> = [];
    component.search(of('anc'))
      .subscribe(results => actualResults = results);

    // then it should have no match
    expect(actualResults.length).toBe(1);
    expect(actualResults[0].key).toBe('France');
  });

  it('should find the results containing the term entered and ignore the case', () => {
    // given an aggregation with a bucket
    const component = new LargeAggregationComponent();
    component.aggregation = aggregation;

    // when searching for a result
    let actualResults: Array<Bucket> = [];
    component.search(of('A'))
      .subscribe(results => actualResults = results);

    // then it should have one match
    expect(actualResults.length).toBe(3);
    expect(actualResults[0].key).toBe('France');
    expect(actualResults[1].key).toBe('Italy');
    expect(actualResults[2].key).toBe('New Zealand');
  });

  it('should not find the results containing the term entered if it is already selected', () => {
    // given an aggregation with a bucket
    const component = new LargeAggregationComponent();
    component.aggregation = aggregation;
    component.selectedKeys = ['France'];

    // when searching for a result
    let actualResults: Array<Bucket> = [];
    component.search(of('anc'))
      .subscribe(results => actualResults = results);

    // then it should have no match
    expect(actualResults.length).toBe(0);
  });

  it('should find 10 results max', () => {
    // given an aggregation with a bucket
    const component = new LargeAggregationComponent();
    component.aggregation = toAggregation('coo', Array(30).fill('a'));

    // when searching for a result
    let actualResults: Array<Bucket> = [];
    component.search(of('a'))
      .subscribe(results => actualResults = results);

    // then it should have no match
    expect(actualResults.length).toBe(10);
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
    expect(tester.results[0]).toHaveText('France[10]');

    // when the result is selected
    tester.results[0].dispatchEventOfType('click');

    expect(emittedEvent.name).toBe('coo');
    expect(emittedEvent.values).toEqual(['France']);
    expect(tester.inputField).toHaveValue('');

    // and a pill should appear
    expect(tester.pills.length).toBe(1);
    expect(tester.pills[0]).toContainText('France[10]');

    // when another value is entered
    tester.inputField.fillWith('ly');
    tick(200);

    // results should appear
    expect(tester.results.length).toBe(1);
    expect(tester.results[0]).toHaveText('Italy[20]');

    // when the result is selected
    tester.results[0].dispatchEventOfType('click');

    // another event is emitted
    expect(tester.inputField).toHaveValue('');
    expect(emittedEvent.name).toBe('coo');
    expect(emittedEvent.values).toEqual(['France', 'Italy']);

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
});
