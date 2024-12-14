import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ComponentTester, createMock } from 'ngx-speculoos';

import { toAggregation } from '../../models/test-model-generators';
import { AggregationCriterion } from '../../models/aggregation-criterion';
import { FaidareOntologyAggregationComponent } from './faidare-ontology-aggregation.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { OntologyAggregationModalComponent } from '../ontology-aggregation-modal/ontology-aggregation-modal.component';
import { NULL_VALUE } from '../../models/document.model';
import { Component } from '@angular/core';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

@Component({
    template: '<dd-ontology-aggregation [aggregation]="aggregation" [selectedKeys]="selectedKeys" (aggregationChange)="criterion = $event" />',
    imports: [FaidareOntologyAggregationComponent]
})
class TestComponent {
  aggregation = toAggregation('o', ['v1', 'v2', 'v3', NULL_VALUE]);
  criterion: AggregationCriterion = null;
  selectedKeys: Array<string> = [];
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get title() {
    return this.element('.card-title');
  }

  get message() {
    return this.element('p');
  }

  get modifySelectionButton() {
    return this.button('button');
  }
}

describe('FaidareOntologyAggregationComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });

    tester = new TestComponentTester();
    tester.detectChanges();
  });

  it('should display an aggregation with buckets, and ignore the null values', () => {
    // given an aggregation and selected keys
    tester.componentInstance.selectedKeys = ['v1', 'v2'];
    tester.detectChanges();

    // then it should display a title
    expect(tester.title).toContainText('Ontology (3)');
    // and a message depending on the selected key size
    expect(tester.message).toContainText('2 selected variables');

    tester.componentInstance.selectedKeys = ['v1'];
    tester.detectChanges();
    expect(tester.message).toContainText('1 selected variable');

    tester.componentInstance.selectedKeys = [];
    tester.detectChanges();
    expect(tester.message).toContainText('No selected variable');
  });

  it('should not display an aggregation with empty buckets', () => {
    // given an aggregation
    tester.componentInstance.aggregation = toAggregation('o', []);
    tester.detectChanges();

    // then it should not display a title
    expect(tester.title).toBeNull();
  });

  it('should not display an aggregation with NULL_VALUE being the only bucket', () => {
    // given an aggregation
    tester.componentInstance.aggregation = toAggregation('o', [NULL_VALUE]);
    tester.detectChanges();

    // then it should not display a title
    expect(tester.title).toBeNull();
  });

  it('should open a modal and emit an event when the selection changes', fakeAsync(() => {
    // then it should emit an event
    // when the modal is closed with selected variables
    const modalService = TestBed.inject(NgbModal);
    const mockOntologyAggregationModal = createMock(OntologyAggregationModalComponent);
    spyOn(modalService, 'open').and.returnValue({
      componentInstance: mockOntologyAggregationModal,
      result: Promise.resolve(['v2', 'v3'])
    } as NgbModalRef);

    tester.modifySelectionButton.click();
    tick();

    expect(modalService.open).toHaveBeenCalled();
    expect(mockOntologyAggregationModal.prepare).toHaveBeenCalledWith(
      tester.componentInstance.aggregation,
      tester.componentInstance.selectedKeys
    );

    expect(tester.componentInstance.criterion).toEqual({
      name: tester.componentInstance.aggregation.name,
      values: ['v2', 'v3']
    });
  }));

  it('should be disabled if only one bucket', () => {
    // given an aggregation
    tester.componentInstance.aggregation = toAggregation('o', ['v1']);
    tester.detectChanges();

    expect(tester.modifySelectionButton.disabled).toBeTrue();
    expect(tester.title.nativeElement.classList).toContain('text-body-secondary');
  });
});
