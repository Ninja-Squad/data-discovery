import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';

import { SmallAggregationComponent } from './small-aggregation.component';
import { toAggregation } from '../models/test-model-generators';
import { AggregationCriterion } from '../models/aggregation-criterion';
import { AggregationNamePipe } from '../aggregation-name.pipe';
import { DocumentCountComponent } from '../document-count/document-count.component';
import { NULL_VALUE } from '../models/document.model';
import { DescendantsCheckboxComponent } from '../descendants-checkbox/descendants-checkbox.component';
import { DataDiscoveryNgbTestingModule } from '../data-discovery-ngb-testing.module';
import { I18nTestingModule } from '../i18n/i18n-testing.module.spec';

describe('SmallAggregationComponent', () => {
  const aggregation = toAggregation('coo', ['France', 'Italy', 'New Zealand', NULL_VALUE]);

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

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, DataDiscoveryNgbTestingModule, I18nTestingModule],
      declarations: [
        SmallAggregationComponent,
        AggregationNamePipe,
        DocumentCountComponent,
        DescendantsCheckboxComponent
      ]
    })
  );

  beforeEach(() => jasmine.addMatchers(speculoosMatchers));

  it('should display an aggregation with buckets', () => {
    const tester = new SmallAggregationComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation = aggregation;
    tester.detectChanges();

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
    const values: { [key: string]: boolean | null } = {
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

  it('should build a form based on the bucket', () => {
    const tester = new SmallAggregationComponentTester();
    // given an aggregation with a bucket
    const component = tester.componentInstance;
    component.aggregation = aggregation;

    // when initializing the component
    component.ngOnInit();

    // then it should have a form with several fields
    const controls = component.aggregationForm.controls;
    expect(Object.keys(controls)).toEqual(['France', 'Italy', 'New Zealand', NULL_VALUE]);
  });

  it('should build a form and check selected criteria', () => {
    // given an aggregation with a bucket and a selected value
    const selectedKeys = ['France'];

    const tester = new SmallAggregationComponentTester();
    const component = tester.componentInstance;
    component.aggregation = aggregation;
    component.selectedKeys = selectedKeys;

    // when initializing the component
    component.ngOnInit();

    // then it should have a form with several fields
    const controls = component.aggregationForm.controls;
    expect(Object.keys(controls)).toEqual(['France', 'Italy', 'New Zealand', NULL_VALUE]);
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
    component.aggregationChange.subscribe((event: AggregationCriterion) => (emittedEvent = event));

    // when a value is checked
    tester.firstCheckbox.check();
    tester.detectChanges();
    tick();

    expect(tester.firstCheckbox).toBeChecked();
    expect(emittedEvent.name).toBe('coo');
    expect(emittedEvent.values).toEqual(['France']);
  }));

  it('should change the selected values in the form when the selectedValues input changes, without emitting events', () => {
    const tester = new SmallAggregationComponentTester();
    // given an aggregation with a bucket and no selected value
    const component = tester.componentInstance;
    component.aggregation = aggregation;
    component.selectedKeys = [];

    let eventEmitted = false;
    component.aggregationChange.subscribe(() => (eventEmitted = true));

    // when initializing the component
    component.ngOnInit();

    // it should have a form with no selected checkbox
    expect(component.aggregationForm.value).toEqual({
      France: false,
      Italy: false,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // when changing the selected values
    component.selectedKeys = ['France'];

    // it should update the form selected checkbox
    expect(component.aggregationForm.value).toEqual({
      France: true,
      Italy: false,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // when changing the selected values
    component.selectedKeys = ['France', 'Italy'];

    // it should update the form selected checkboxes
    expect(component.aggregationForm.value).toEqual({
      France: true,
      Italy: true,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // when changing the selected values but with no actual change
    component.selectedKeys = ['Italy', 'France'];

    // it should leave the form selected checkboxes as they are
    expect(component.aggregationForm.value).toEqual({
      France: true,
      Italy: true,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // when changing the selected values
    component.selectedKeys = ['France'];

    // it should update the form selected checkboxes
    expect(component.aggregationForm.value).toEqual({
      France: true,
      Italy: false,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // when changing the selected values
    component.selectedKeys = [];

    // it should update the form selected checkboxes
    expect(component.aggregationForm.value).toEqual({
      France: false,
      Italy: false,
      'New Zealand': false,
      [NULL_VALUE]: false
    });

    // and all this shouldn't emit any event
    expect(eventEmitted).toBe(false);
  });

  it('should be disabled if only one bucket', () => {
    const tester = new SmallAggregationComponentTester();

    // given an aggregation
    tester.componentInstance.aggregation = toAggregation('coo', ['Italy']);
    tester.detectChanges();

    expect(tester.componentInstance.aggregationForm.disabled).toBe(true);
    expect(tester.firstCheckbox.nativeElement.disabled).toBe(true);

    expect(tester.title.nativeElement.classList).toContain('text-muted');
  });
});
