import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';

import { SmallAggregationComponent } from './small-aggregation.component';
import { toAggregation } from '../models/test-model-generators';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { AggregationNamePipe } from '../aggregation-name.pipe';
import { DocumentCountComponent } from '../document-count/document-count.component';

describe('SmallAggregationComponent', () => {

  const aggregation = toAggregation('coo', ['France', 'Italy', 'New Zealand']);

  class SmallAggregationComponentTester extends ComponentTester<SmallAggregationComponent> {
    constructor() {
      super(SmallAggregationComponent);
    }

    get title() {
      return this.element('.card-title');
    }

    get labels() {
      return this.elements('label');
    }

    get firstCheckbox() {
      return this.input('input');
    }
  }

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      ReactiveFormsModule,
      NgbTooltipModule.forRoot()
    ],
    declarations: [SmallAggregationComponent, AggregationNamePipe, DocumentCountComponent]
  }));

  beforeEach(() => jasmine.addMatchers(speculoosMatchers));

  it('should display an aggregation with buckets', () => {
    const tester = new SmallAggregationComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation = aggregation;
    tester.detectChanges();

    // then it should display a title
    expect(tester.title).toHaveText('Pays d\'origine');
    // and the buckets with their name and count
    expect(tester.labels.length).toBe(3);
    expect(tester.labels[0]).toContainText('France');
    expect(tester.labels[0]).toContainText('[10]');
    expect(tester.labels[1]).toContainText('Italy');
    expect(tester.labels[1]).toContainText('[20]');
    expect(tester.labels[2]).toContainText('New Zealand');
    expect(tester.labels[2]).toContainText('[30]');
  });

  it('should not display an aggregation with empty buckets', () => {
    const tester = new SmallAggregationComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation = toAggregation('coo', []);
    tester.detectChanges();

    // then it should not display a title
    expect(tester.title).toBeNull();
    // and the buckets should not be displayed either
    expect(tester.labels.length).toBe(0);
  });

  it('should extract keys from selected values', () => {
    // given a few selected values among a bucket
    const values: { [key: string]: boolean | null } = { 'France': true, 'England': false, 'Italy': true, 'New Zealand': null };

    // when extracting keys
    const keys = SmallAggregationComponent.extractKeys(values);

    // then it should return only the truthy ones
    expect(keys).toEqual(['France', 'Italy']);
  });

  it('should build a form based on the bucket', () => {
    // given an aggregation with a bucket
    const component = new SmallAggregationComponent();
    component.aggregation = aggregation;

    // when initializing the component
    component.ngOnInit();

    // then it should have a form with several fields
    const controls = component.aggregationForm.controls;
    expect(Object.keys(controls)).toEqual(['France', 'Italy', 'New Zealand']);
  });

  it('should build a form and check selected criteria', () => {
    // given an aggregation with a bucket and a selected value
    const selectedKeys = ['France'];

    const component = new SmallAggregationComponent();
    component.aggregation = aggregation;
    component.selectedKeys = selectedKeys;

    // when initializing the component
    component.ngOnInit();

    // then it should have a form with several fields
    const controls = component.aggregationForm.controls;
    expect(Object.keys(controls)).toEqual(['France', 'Italy', 'New Zealand']);
    // and France should be checked
    expect(component.aggregationForm.get('France').value).toBeTruthy();
  });

  it('should emit an event when a checkbox is toggled', fakeAsync(() => {
    const tester = new SmallAggregationComponentTester();

    // given an aggregation
    const component = tester.componentInstance;
    component.aggregation = aggregation;
    tester.detectChanges();
    expect(tester.firstCheckbox).not.toBeChecked();

    // then it should emit an event
    let emittedEvent: AggregationCriterion;
    component.aggregationChange.subscribe((event: AggregationCriterion) => emittedEvent = event);

    // when a value is checked
    tester.firstCheckbox.check();
    tester.detectChanges();
    tick();

    expect(tester.firstCheckbox).toBeChecked();
    expect(emittedEvent.name).toBe('coo');
    expect(emittedEvent.values).toEqual(['France']);
  }));
});
