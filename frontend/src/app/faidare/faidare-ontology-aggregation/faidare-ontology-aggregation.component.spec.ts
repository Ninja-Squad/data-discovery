import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createMock } from '../../../test/mock';

import { toAggregation } from '../../models/test-model-generators';
import { AggregationCriterion } from '../../models/aggregation-criterion';
import { FaidareOntologyAggregationComponent } from './faidare-ontology-aggregation.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { OntologyAggregationModalComponent } from '../ontology-aggregation-modal/ontology-aggregation-modal.component';
import { NULL_VALUE } from '../../models/document.model';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideI18nTesting } from '../../i18n/mock-18n';

@Component({
  template:
    '<dd-ontology-aggregation [aggregation]="aggregation()" [selectedKeys]="selectedKeys()" (aggregationChange)="criterion.set($event)" />',
  imports: [FaidareOntologyAggregationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dd-faidare-ontology-aggregation-tester'
})
class TestComponent {
  readonly aggregation = signal(toAggregation('o', ['v1', 'v2', 'v3', NULL_VALUE]));
  readonly criterion = signal<AggregationCriterion | undefined>(undefined);
  readonly selectedKeys = signal<Array<string>>([]);
}

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly title = page.getByCss('.card-title');
  readonly message = page.getByCss('p');
  readonly modifySelectionButton = page.getByRole('button');
}

describe('FaidareOntologyAggregationComponent', () => {
  let tester: TestComponentTester;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideI18nTesting()] });

    tester = new TestComponentTester();
    await tester.fixture.whenStable();
  });

  test('should display an aggregation with buckets, and ignore the null values', async () => {
    // given an aggregation and selected keys
    tester.componentInstance.selectedKeys.set(['v1', 'v2']);
    await tester.fixture.whenStable();

    // then it should display a title
    await expect.element(tester.title).toHaveTextContent('Ontology (3)');
    // and a message depending on the selected key size
    await expect.element(tester.message).toHaveTextContent('2 selected variables');

    tester.componentInstance.selectedKeys.set(['v1']);
    await tester.fixture.whenStable();
    await expect.element(tester.message).toHaveTextContent('1 selected variable');

    tester.componentInstance.selectedKeys.set([]);
    await tester.fixture.whenStable();
    await expect.element(tester.message).toHaveTextContent('No selected variable');
  });

  test('should not display an aggregation with empty buckets', async () => {
    // given an aggregation
    tester.componentInstance.aggregation.set(toAggregation('o', []));
    await tester.fixture.whenStable();

    // then it should not display a title
    await expect.element(tester.title).not.toBeInTheDocument();
  });

  test('should not display an aggregation with NULL_VALUE being the only bucket', async () => {
    // given an aggregation
    tester.componentInstance.aggregation.set(toAggregation('o', [NULL_VALUE]));
    await tester.fixture.whenStable();

    // then it should not display a title
    await expect.element(tester.title).not.toBeInTheDocument();
  });

  test('should open a modal and emit an event when the selection changes', async () => {
    // then it should emit an event
    // when the modal is closed with selected variables
    const modalService = TestBed.inject(NgbModal);
    const mockOntologyAggregationModal = createMock(OntologyAggregationModalComponent);
    const result = Promise.resolve(['v2', 'v3']);
    vi.spyOn(modalService, 'open').mockReturnValue({
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

  test('should be disabled if only one bucket', async () => {
    // given an aggregation
    tester.componentInstance.aggregation.set(toAggregation('o', ['v1']));
    await tester.fixture.whenStable();

    await expect((tester.modifySelectionButton.element() as HTMLButtonElement).disabled).toBe(true);
    expect(tester.title.element().classList).toContain('text-body-secondary');
  });
});
