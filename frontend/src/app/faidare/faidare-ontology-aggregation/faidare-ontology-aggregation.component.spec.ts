import { TestBed } from '@angular/core/testing';
import { ComponentTester, createMock } from 'ngx-speculoos';

import { toAggregation } from '../../models/test-model-generators';
import { AggregationCriterion } from '../../models/aggregation-criterion';
import { FaidareOntologyAggregationComponent } from './faidare-ontology-aggregation.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { OntologyAggregationModalComponent } from '../ontology-aggregation-modal/ontology-aggregation-modal.component';
import { NULL_VALUE } from '../../models/document.model';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

@Component({
  template:
    '<dd-ontology-aggregation [aggregation]="aggregation()" [selectedKeys]="selectedKeys()" (aggregationChange)="criterion.set($event)" />',
  imports: [FaidareOntologyAggregationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  aggregation = signal(toAggregation('o', ['v1', 'v2', 'v3', NULL_VALUE]));
  criterion = signal<AggregationCriterion | undefined>(undefined);
  selectedKeys = signal<Array<string>>([]);
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

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });

    tester = new TestComponentTester();
    await tester.stable();
  });

  it('should display an aggregation with buckets, and ignore the null values', async () => {
    // given an aggregation and selected keys
    tester.componentInstance.selectedKeys.set(['v1', 'v2']);
    await tester.stable();

    // then it should display a title
    expect(tester.title).toContainText('Ontology (3)');
    // and a message depending on the selected key size
    expect(tester.message).toContainText('2 selected variables');

    tester.componentInstance.selectedKeys.set(['v1']);
    await tester.stable();
    expect(tester.message).toContainText('1 selected variable');

    tester.componentInstance.selectedKeys.set([]);
    await tester.stable();
    expect(tester.message).toContainText('No selected variable');
  });

  it('should not display an aggregation with empty buckets', async () => {
    // given an aggregation
    tester.componentInstance.aggregation.set(toAggregation('o', []));
    await tester.stable();

    // then it should not display a title
    expect(tester.title).toBeNull();
  });

  it('should not display an aggregation with NULL_VALUE being the only bucket', async () => {
    // given an aggregation
    tester.componentInstance.aggregation.set(toAggregation('o', [NULL_VALUE]));
    await tester.stable();

    // then it should not display a title
    expect(tester.title).toBeNull();
  });

  it('should open a modal and emit an event when the selection changes', async () => {
    // then it should emit an event
    // when the modal is closed with selected variables
    const modalService = TestBed.inject(NgbModal);
    const mockOntologyAggregationModal = createMock(OntologyAggregationModalComponent);
    const result = Promise.resolve(['v2', 'v3']);
    spyOn(modalService, 'open').and.returnValue({
      componentInstance: mockOntologyAggregationModal,
      result
    } as NgbModalRef);

    await tester.modifySelectionButton.click();
    await result;

    expect(modalService.open).toHaveBeenCalled();
    expect(mockOntologyAggregationModal.prepare).toHaveBeenCalledWith(
      tester.componentInstance.aggregation(),
      tester.componentInstance.selectedKeys()
    );

    expect(tester.componentInstance.criterion()).toEqual({
      name: tester.componentInstance.aggregation().name,
      values: ['v2', 'v3']
    });
  });

  it('should be disabled if only one bucket', async () => {
    // given an aggregation
    tester.componentInstance.aggregation.set(toAggregation('o', ['v1']));
    await tester.stable();

    expect(tester.modifySelectionButton.disabled).toBeTrue();
    expect(tester.title.nativeElement.classList).toContain('text-body-secondary');
  });
});
